---
emoji: 🧢
title: 'On-premise 서버 구축하기 2. K8S 클러스터 설치' 
date: '2023-07-01 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---


## 1. 사전 설정

: 사전 설정은 모든 노드에서 실행해주어야 한다. 

```bash
curl -fsSL [https://get.docker.com](https://get.docker.com/) -o [get-docker.sh](http://get-docker.sh/)
sudo sh [get-docker.sh](http://get-docker.sh/)
sudo systemctl enable --now docker && sudo systemctl status docker --no-pager
sudo usermod -aG docker onyouadmin
sudo docker container ls
```

### cri-docker Install
```bash
VER=$(curl -s [https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest|grep](https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest%7Cgrep) tag_name | cut -d '"' -f 4|sed 's/v//g')
echo $VER
wget [https://github.com/Mirantis/cri-dockerd/releases/download/v${VER}/cri-dockerd-${VER}.amd64.tgz](https://github.com/Mirantis/cri-dockerd/releases/download/v$%7BVER%7D/cri-dockerd-$%7BVER%7D.amd64.tgz)
tar xvf cri-dockerd-${VER}.amd64.tgz
sudo mv cri-dockerd/cri-dockerd /usr/local/bin/
```

### cri-docker Version Check

```bash
cri-dockerd --version

wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket
sudo mv cri-docker.socket cri-docker.service /etc/systemd/system/
sudo sed -i -e 's,/usr/bin/cri-dockerd,/usr/local/bin/cri-dockerd,' /etc/systemd/system/cri-docker.service

sudo systemctl daemon-reload
sudo systemctl enable cri-docker.service
sudo systemctl enable --now cri-docker.socket
```

### cri-docker Active Check

```bash
sudo systemctl restart docker && sudo systemctl restart cri-docker
sudo systemctl status cri-docker.socket --no-pager
```

### Docker cgroup Change Require to Systemd

```bash
sudo mkdir /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
"exec-opts": ["native.cgroupdriver=systemd"],
"log-driver": "json-file",
"log-opts": {
"max-size": "100m"
},
"storage-driver": "overlay2"
}
EOF
```bash

```bash
sudo systemctl restart docker && sudo systemctl restart cri-docker
sudo docker info | grep Cgroup
```

## 2.  패키지 설치 : kubeadm, kubectl, kubelet
패키지 설치도 모든 노드에서 실행 해준다. 

1. Swap disable 처리 

    `swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab`

1. iptable이 bridged traffic 을 바라볼 수 있도록 설정. 
    
    `cat <<EOF > /etc/sysctl.d/k8s.conf`
    
    `net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    EOF`
    
    - 컨테이너는 가상화된 네트워크 인터페이스를 사용하므로, 컨테이너 간의 통신 및 네트워크 기능을 지원하기 위해 호스트 단에서 커널 parameter를 위와 같이 변경하는 것이다.
        1. net.bridge.bridge-nf-call-ip6tables = 1: 이 설정은 IPv6 네트워크 트래픽이 브리지로 전달되어 IP 테이블에서 필터링될 수 있도록 한다.
        2. net.bridge.bridge-nf-call-iptables = 1: 이 설정은 IPv4 네트워크 트래픽이 브리지로 전달되어 IP 테이블에서 필터링될 수 있도록 한다.
2. 방화벽 해제

    `systemctl stop firewalld`

    `systemctl disable firewalld`

1. SELinux를 permissive mode로 설정

    `setenforce 0`

    `sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config`

1. kubeadm, kubelet, kubectl 설치

    ```bash
    cat <<EOF > /etc/yum.repos.d/kubernetes.repo

    [kubernetes]
    name=Kubernetes
    baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
    enabled=1
    gpgcheck=1
    repo_gpgcheck=1
    gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
    exclude=kubelet kubeadm kubectl
    EOF

    yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

    systemctl start kubelet && systemctl enable kubelet
    ```

## 3. 마스터 노드 설정

### Controller Node

```bash
sudo kubeadm config images pull --cri-socket unix:///run/cri-dockerd.sock

sudo kubeadm init --ignore-preflight-errors=all --pod-network-cidr=192.168.0.0/16 --apiserver-advertise-address={마스터노드 IP} --cri-socket /var/run/cri-dockerd.sock
```

### 설치 시 출력되는 join Command 를 복사해둔다.

```bash
kubeadm join {마스터노드IP}:6443 --token r8gfco.6s7f60dns4vgwcc0 \
--discovery-token-ca-cert-hash sha256:7b0f82be076748e67f8615eab0b86a61317bac397f94b2921810231ab14afdcc
```

### kubeadm 을 root 처럼 사용하기 위한 추가 설정

```basn
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### 서비스 확인 ( Ready , Running )

```bash
kubectl get nodes -o wide
kubectl get pod -A
```

## 4. 워커 노드 설정

### 클러스터 join

```bash
kubeadm join 172.17.255.172:6443 --token te423w.tkhwpeau43rwafdg \
--discovery-token-ca-cert-hash sha256:6ec04d16b4695af8407ca7d0ac8dc0b88655b431156e2189da118d8a74e07778 --cri-socket /var/run/cri-dockerd.sock
```

### Check

```bash
systemctl status kubelet
```

### worker 계정에 kubectl 사용 환경변수 추가

```bash
cd ~
mkdir -p $HOME/.kube
sudo cp -i  /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

여기까지 하면 기본적으로 master 노드와 worker 노드 셋팅이 완료된 것이지만, 서로 다른 노드들이 pod간 통신하기 위해 CNI를 설치 해주어야한다.
CNI 설치를 완료하면 coredns가 pending -> running상태로 변경되게 될 것이다. 

## 5. CNI 설치

- Calico 설치 
    : https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises
    - manifest 방법으로 설치해주면 되며, 192.168 대역이 아닌 다른 대역을 pod의 대역으로 사용했다면 가이드에 따라서 수정 필요한 부분 적용해주면 된다. 
        