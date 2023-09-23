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

