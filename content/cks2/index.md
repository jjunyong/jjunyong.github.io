---
emoji: 🧢
title: '[CKS] Cluster setup & hardening 2'
date: '2022-09-16 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

### KubeConfig 
~/.kube/config 에 config 파일로서 certification 에 대한 경로 등을 저장하는 것을 통해 kubectl 시 별도의 인증서 명시 또는 apiserver에 대한 주소 명시 등을 할 필요가 없게 된다. KubeConfig 파일은 세 부분으로 구성된다.
- Cluster
- Contexts : Context는 어떤 유저가 어떤 Cluster를 사용할 것인지에 대해 정의한다. 
- Users

### API Groups
![image1](./image1.png)
<br>
아래 명령을 통해 어떤 리소스가 어떤 API Group에 속했는지 확인 가능하다. RBAC에서 리소스에 대한 apiGroup을 명시해야 하는데, 이 때 아래 명령을 활용하여 참고하면 좋다. 또한 어떤 리소스가 namespace에 국한되지 않는 cluster 리소스인지도 확이할 수 있다. 
```bash
kubectl api-resources 
```
### Authorization
- Node Authorizor
  - kubelet과 같이 **system:node**:node01 'system:node'라는 이름이 client certificate에 명시되어 있으면 Node Authorizor가 승인한다. 
- ABAC
  - 일일히 유저 별로 권한 나열
- RBAC
  ![image2](./image2.png)
  - 권한 체크 명렁어
    - kubectl auth can-i 
      - ex) kubectl auth can-i create deployments
    - kubectl auth can-i --as '{username}'

- Webhook 
  - 써드파티 인증을 위해 사용 

#### Authorization Mode
- kube-apiserver의 Authorization mode 설정에 명시한 순서대로 인증한다. 아래의 경우 Node Authorizor -> RBAC -> Webhook 순서로 인증한다. 
![image3](./image3.png)

### Roles & Rolebinding / ClusterRole & ClusterRoleBinding

### Kubelet 보안
K8S 아키텍처와 kubelet 
![image4](./image4.png)

- kubelet 설치 시에 kubeadm이 kubelet을 설치해주지 않으며 직접 kubelet을 설치해야 한다.
- 그러나 kubeadm join 명령을 통해 node들에 kubelet-config 파일을 자동 설정해주는 역할은 한다. 과거에는 kubelet.service에 직접 config를 설정해야 했지만 1.10버전 이후로 kubelet-config파일로서 대체되고 config파일 경로만 명시해주게 되었다.
  ![image5](./image5.png)

- `ps -aux | grep kubelet` 명령을 통해 각 노드에서 kubelet의 config.yaml파일이 어디 존재하는지 알 수 있다. 

#### Kubelet Authentication
kubelet이 어떻게 Kube-apiserver로부터만 통신하도록 설정할 수 있는가?
- 기본적으로 kubelet은 해당 노드의 10250, 10255 포트에서 누구나 접속 가능하도록 api 서버를 열고 있다. 
- 따라서 kubelet-config.yaml에서 authentication.anonymous.enabled = false로 설정해주어야 한다. 
- 그리고 앞서 공부한 것처럼 kube-apiserver는 kubelet client certificate,key를 가지고 있어서 그것으로 인증하게 된다. 

#### Kubelet Authorization
- `authorization.mode : Webhook`으로 설정하여 kube-apiserver의 RBAC와 통합할 수 있다
- `readOnlyPort: 0` 으로 설정하여 10255(read-only port)로의 접근을 막을 수 있다. 


### Kubectl Proxy
![image6](./image6.png)
- `kubectl proxy &` 명령 실행하면 해당 localhost:8001에서 kubectl proxy가 실행된다. 
### Kubectl Port Forward
![image7](./image7.png)

### Kubernetes Dashboard
- k8s dasahboard service는 ClusterIP 타입이다. 
  - 따라서 외부에서 접근이 불가능하며 kubectl proxy를 통해 신뢰할 수 있는 사용자들만 접근하도록 설정한다. 
- kuberenetes dashboard authentication
  - Token
    - RBAC
  - kubeconfig

