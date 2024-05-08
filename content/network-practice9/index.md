---
title: 'Docker 네트워크 구조'
date: '2024-02-27 11:00:00'
author: jjunyong
tags: network
categories: Linux 클라우드
---

- super user 권한 없이 docker 사용하기

```bash
sudo usermod -aG docker {계정명}
```

- docker에서 컨테이너 생성하고 내부로 들어가기

```bash
docker run --rm -it ubuntu:16.04 /bin/bash

# 컨테이너 내부에서 리눅스 버전 확인
cat /etc/issue
```

### 컨테이너란?

- 컨테이너는 독립된 리눅스 환경이다.
- 컨테이너는 단일 프로세스이다.
  ![image1](./image1.png)

### Docker 구조

![image2](./image2.png)

- 부모 프로세스가 1번인 daemon 프로세스의 형태로 dockerd는 구동된다.
- docker CLI 명령은 dockerd에 전달된다. 전달하는 방식은 /var/run/docker.sock
- containerd가 container runtime이며 /run/containerd/containerd.sock 을 통해서 dockerd와 통신한다.
- docker 컨테이너 내부에서 CLI명령을 사용하고자 하면 전체 컨테이너에 대한 정보를 dockerd를 통해서 알아내야 하기 때문에 호스트의 /var/run/docker.sock를 도커 컨테이너 내에서 참조할 수 있도록 마운트되어야 한다.
- dockerd, docker CLI 프로세스는 아래와 같이 tmpfs 파일 시스템 즉, 메모리에 올라간 docker.sock과 통신함으로써 빠른 I/O 속도를 가져간다.
  ![image3](./image3.png)

### Docker in Docker

- docker CLI, dockerd, containerd, containerd-shim 기동 중인지에 대한 확인
- 컨테이너 내부에서 docker사용 실습 ( docker in docker )
  ![image4](./image4.png)

---

## 도커 네트워크 구조

- docker0라는 브릿지/스위치 장비를 sw적으로 구현하고 있다고 보면 됨.
- 컨테이너는 네트웍에서 개별 컴퓨터로 보면 되는데, network interface가 host에 1개기 때문에 가상의 veth를 통해서 컨테이너들에 각각의 network interface를 부여하게 됨
  ![image5](./image5.png)
- 도커 네트워크 확인하기

```bash
docker network ls
```

- 다양한 컨테이너와 docker0 브릿지 연결확인하기
  ![image6](./image6.png)

- 컨테이너의 gateway인 docker0 ip주소 확인하기
  ![image7](./image7.png)

- 컨테이너 내의 네트워크 인터페이스 eth0 확인하기
  ![image8](./image8.png)

- 여러 컨테이너의 네트워크 ip주소 확인하기
  ![image9](./image9.png)

- 컨테이너 간의 네트웍 통신 테스트
  ![image10](./image10.png)

- 독립된 네트워크 생성 후 2개의 컨테이너 통신
  ![image11](./image11.png)
  ![image12](./image12.png)

- 독립된 네트워크 생성 후 2개의 컨테이너 통신 문제해결
  ![image13](./image13.png)
  ![image14](./image14.png)

- 새로운 독립된 네트워크 vs 기본 네트워크 비교
  ![image15](./image15.png)
  ![image16](./image16.png)
