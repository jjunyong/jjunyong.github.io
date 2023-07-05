---
emoji: 🧢
title: 'On-premise 서버 구축하기 4. Istio 환경 구축하기' 
date: '2023-07-02 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---

## Istio 환경구성

### Istio 설치 
생각보다 istio 설치하는 것 자체는 간단하다. 아래와 같은 과정을 따라 하면 끝이다.

- Istioctl 다운로드 : controlplane에서 다운로드 한다. 

  `curl -L https://istio.io/downloadIstio | sh -`

- istioctl 명령어 사용하기 위한 PATH 등록
    
    `cd istio-1.17.2`
    
    `export PATH=$PWD/bin:$PATH`
    
- istio 설치 ( https://istio.io/latest/docs/setup/install/istioctl/ )
    
    `istioctl install` 
    
    - default Profile으로 설치됨
    - 설치 후 deployment에 istiod, istio-ingressgateway설치되었음을 확인 가능

### Istio proxy 배포하기 
istio는 application pod에 sidecar로 istio-proxy 컨테이너를 배포함으써 istio-proxy 컨테이너가 pod에 대한 모든 트래픽을 중개하게 된다.
이미 구성된 k8s 클러스터에서 istio-proxy 컨테이너를 inject하는 방법은 아래와 같다.

### kube-inject

`istioctl kube-inject -f deployment-nginx.yaml | kubectl apply -f -` 
→ 이렇게 하면 nginx deployment에 해당하는 pod에 istio-proxy가 삽입된다. 

### Auto Injection

- **namespace label을 통한 자동 주입 방법**
    
    일반적으로 더 간편한 방법은 해당하는 namespace의 전체 pod에 istio-proxy를 주입하는 방법이다.

    `kubectl label namespace default istio-injection=enabled --`
    : default namespace의 모든 Pod에 사이드카 주입
    
    - 사이드카 제거 명령 : `kubectl label namespace default istio-injection-`

- k logs -c 옵션 통해 istio-proxy의 로그만 따로 볼 수도 있다.
    
    `k logs nginx-deployment-xxxyyzz -c istio-proxy`
    
- enable된 namespace 라도 injection을 원치않는 pod는 pod의 label을 아래와 같이 설정하면 istio-proxy 주입이 되지 않도록 disable설정 가능하다.
    
    `sidecar.istio.io/inject: “false”`


### MetalLB 설치 
아래 공식 설치 url에서 'installation by manifest' 부분을 수행한다. 
https://metallb.universe.tf/installation/#installation-by-manifest
  - kubemode를 ipvs로, strictARP를 true로 설정한다
  - `kubectl edit configmap -n kube-system kube-proxy`
    ```

    apiVersion: [kubeproxy.config.k8s.io/v1alpha1](http://kubeproxy.config.k8s.io/v1alpha1)
    kind: KubeProxyConfiguration
    mode: "ipvs"
    ipvs:
      strictARP: true
    ```
          
  - 설치
    - `kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml`

위와 같이 하면 설치는 다 되게 되는데, 이 상태에서는 LoadBalancer type의 서비스인 istio-ingressgateway service의 EXTERNAL-IP가 아직 Pending상태일 것이다. 
MetablLB를 통해 해당 서비스에 ip를 할당해주려면 아래 설정 page를 참고하여 Layer2 Configuration으로 ipaddresspool과 l2advertisement를 설정해주면 된다. 
ipaddresspool에서는 호스트 서버와 통신 가능한 대역을 겹치지 않도록 설정해주도록 하자. 
- https://metallb.universe.tf/configuration/#layer-2-configuration