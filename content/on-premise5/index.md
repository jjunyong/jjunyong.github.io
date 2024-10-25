---
emoji: 🧢
title: 'On-premise 5. 네트워크 설정' 
date: '2024-08-30 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---



## SSL 설정


---

## K8S 네트워크 관련 에러 

### CNI 재설치 
### Calico 
#### Calico 제거
```
kubectl delete -f https://docs.projectcalico.org/manifests/calico.yaml
```
```
rm -rf /var/run/calico/
rm -rf /var/lib/calico/
rm -rf /etc/cni/net.d/
rm -rf /var/lib/cni/
```
#### Calico 설치
On-premise2 k8s 구성 참조

### Flannel 

#### Flannel 설치
```
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

pod-cidr 설정을 k8s cluster와 맞춰주도록 하자. 

#### Flannel 제거
```
## flannel 삭제
kubectl delete -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
kubeadm reset

systemctl stop kubelet
systemctl stop docker

rm -rf /var/lib/cni/
rm -rf /etc/cni/
rm -rf /run/flannel

## kube 설정 파일 삭제 ##
rm -rf $HOME/.kube

## 네트워크 설정 삭제 ##
ifconfig cni0 down
ip link delete cni0
ip link delete flannel.1

systemctl start docker

# 서버 reboot
```
---
## 참고자료
- https://lcc3108.github.io/articles/2020-12/certmanager
- https://www.youtube.com/watch?v=BlzRx6ROiX0