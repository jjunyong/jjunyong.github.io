---
emoji: 🧢
title: 'Istio 클러스터에 가비아 Sectico SSL/TLS 인증서 설치하기'
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

...
라고 했지만 위와 같이 secret 생성했을 때 RN Android 환경에서 SSL 접근 시 network failed 이슈가 있었다.

### 인증서 오류 발생

- SSL Checker와 같은 웹 검증 툴을 사용해서 확인해보니 인증서 자체는 적용되었지만 경고 메시지가 떴다.
  `The certificate is not trusted in all web browsers. You may need to install an Intermediate/chain certificate to link it to a trusted root certificate.`
- 원래는 하기와 같이 도메인 인증서와 체인 인증서를 합쳐서 combined 인증서를 만든 뒤에 해당 파일을 활용해서 k8s tls secret을 생성하여야 한다.

  ```bash
  cat abc_company_cert.crt abc_company_chain_cert.crt > abc_company_combined.crt
  ```

  ```bash
  kubectl create secret tls abc-company-tls --key=abc_company.key --cert=abc_company_combined.crt -n istio-system
  ```

그런데 이렇게 했을 때, 아래 에러가 발생하여서 domain 인증서로만 작업을 하고 넘어갔었다.

```
error: tls: private key does not match public key
```

<br>

아무리 찾아봐도 방법 자체에는 문제가 없는 것 같아서 합쳐진 combined.crt 인증서를 확인해보니 아래와 같이
END CERTIFICATE 부분과 BEGIN CERTIFICATE 부분이 '----'로 연결되어 있었다.

#### 수정 전

```bash
## BEFORE
-----BEGIN CERTIFICATE-----
MOdUgph2fOKBZVrROOUwDQYJKoZIhGlnb1JT
QURvbWFpblZhbGlkYXNLYanoVX8ET4pp
deJV9b9rWYUYUJja0i3+1LZrsAurhUZZtmlHy9ATgtStyITX5cDekv/21tK+0JcV
vO4F6r2gFH/+oT1
(생략)..
-----END CERTIFICATE----------BEGIN CERTIFICATE-----
fVtRJrR2uhHbdBYLvFMNpzANBgkqhkiG9w0BAQwFADCB
iDELMAVyIENBMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEA1nMz1tc8INAA0hdFuNY+B6I/x0H
```

#### 수정 후

```bash

## AFTER
-----BEGIN CERTIFICATE-----
MOdUgph2fOKBZVrROOUwDQYJKoZIhGlnb1JT
QURvbWFpblZhbGlkYXNLYanoVX8ET4pp
deJV9b9rWYUYUJja0i3+1LZrsAurhUZZtmlHy9ATgtStyITX5cDekv/21tK+0JcV
vO4F6r2gFH/+oT1
(생략)..
-----END CERTIFICATE-----
----BEGIN CERTIFICATE-----
fVtRJrR2uhHbdBYLvFMNpzANBgkqhkiG9w0BAQwFADCB
iDELMAVyIENBMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEA1nMz1tc8INAA0hdFuNY+B6I/x0H
```

위와 같이 개행을 제대로 해주고 나니 k8s tls secret 생성 시 정상적으로 tls secret이 생성에 성공했고,
SSL checker에서도 경고 메세지가 사라졌으며, 모든 환경에서 tls 접속이 잘 되게 되었다.

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
- tls secret 생성 시 반드시 도메인 인증서와 체인 인증서를 결합한 ( 결합 시 개행에 유의 ) cominbed 인증서로 생성할 것!
