---
emoji: 🧢
title: '[CKS] 모니터링/로깅, 런타임 보안' 
date: '2023-11-01 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

### Falco
- 아무리 보안이 강한 클러스터를 구축하여도 막상 공격 받았을 때는 어떻게 대처애햐 하는가? strace, Tracee 와 같은 툴로 application에서 사용된 syscall을 분석할 수 있지만 MSA 환경에서 수백개의 pod가 수만 개의 syscall을 생상하고 있는 환경에서 이를 일일히 분석하는 것은 쉬운 일이 아니다. 
- 대신 Faclo를 활용하면 /etc/shadow 에 접근한다거나 log파일을 편집/삭제 하는 등의 의심스러운 행동을 Falco가 모니터링 해준다.
- Falco Architecture
![image1](./image1.png)
- Falco Kernel module을 허용하지 않는 Provider도 있어서 Aquasec tracee처럼 eBPF를 활용하기도 한다. 
- Syscall은 Falco module에 의해 감지되고 나서 library에서 분석되고 predefined된 Falco rule을 활용하여 policy engine에 의해 의심스러운 syscall인지 필터링된다. 
- output/alert 는 log파일이나 slack 등으로 나타난다. 

#### Falco install
- 모든 node에 설치해야 하지만, 그게 안될경우 k8s daemonset으로 설치할 수도 있다. helm chart로 설치하는게 가장 간편하다. 

#### Falco 활용
- journalctl 을 이용해서 host OS에 설치된 falco를 모니터링하고 있는 상태에서 새로운 터미널을 열어 pod에 --exec -it로 접속하거나 /etc/shadow파일을 접근하거나 하면 falco에서 의심스러운 syscall로 보고 감지하는 것을 확인할 수 있다.
![image2](./image2.png)
- Falco rules
![image3](./image3.png)

![image4](./image4.png)
