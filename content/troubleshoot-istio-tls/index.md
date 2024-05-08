---
emoji: 🧢
title: 'Istio 클러스터에 가비아 Sectico 인증서 설치하기'
date: '2024-05-08 08:00:00'
author: jjunyong
tags: istio tls
categories: Troubleshoot
---

Let's ecrypt를 활용해서 3개월 마다 istio의 tls인증서를 자동 갱신하도록 설정하는 방법도 있으나,
설정 과정이 다소 복잡하고 트러블 슈팅이 어려운 문제가 있었다.
그래서 결국 가비아를 통해 Sectico 인증서를 3년에 6만원 정도로 구입하여 적용하는 방법을 택했고, 이 방법이 대부분의 enterprise 환경에서도 사용되는 방법일 것이다.

## 1. TLS 인증서 준비 및 tls Secret 생성

- 가비아에서 Sectio 인증서를 나의 도메인으로 발급 받았고, 아래와 같이 4개 인증서를 제공 받았다.
- abc_company_root_cert.crt : 루트 인증서 파일
- abc_company_chain_cert.crt : 체인 인증서 파일
- abc_company.key: 도메인 인증서 파일
- abc_company_cert.crt : 개인 키 파일

- 해당 파일 중 개인 키 파일 과 도메인 인증서 파일 2개를 사용하여 istio-system namespace에 tls secret을 생성한다.

```bash
kubectl create secret tls abc-company-tls --key=abc_company.key --cert=abc_company_cert.crt -n istio-system
```

## 2. Istio Gateway, VirtualService 설정

### Gateway 설정

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: my-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: my-tls-secret
      hosts:
        - 'abc.company'
```

### VirtualService 설정

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-virtualservice
  namespace: istio-system
spec:
  hosts:
    - 'abc.company'
  gateways:
    - my-gateway.istio-system.svc.cluster.local
  http:
    - match:
        - uri:
            prefix: '/'
      route:
        - destination:
            host: my-service
            port:
              number: 80
```

## 3. Istio에서 TLS 작업 시 유의 사항

- 나는 dev라는 별도의 namespace에 gateway, vs, secret을 두고 https 연동이 안되어 많은 시간을 버렸다.
- **반드시, ingress-gateway가 존재하는 istio-system namespace에 gateway와 secret을 설정하여야 하고**, VirtualService같은 경우는 FQDN으로 gateway를 위의 yaml과 같이 지정하면 어떤 namespace에 있어도 상관없지만, 이 또한 같은 namespace에 두고 FQDN을 안 적는 것이 속편할 수 있다.
