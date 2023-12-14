---
emoji: 🧢
title: '[CKS] Cheatsheet: CKS 시험 필수 명령어' 
date: '2023-11-01 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

#### Container 활용
#### kubectl
- Resoruce API Version 확인 : kubectl api-resources
- Resource Spec/Status 확인 : kubectl explain –recursive {resource}

#### AppArmor
- Profile 적용 : apparmor_parser {profile_path}
- Profile 확인 : aa-status | grep {profile_name}

#### kubesec
- Resource 검사 : kubesec scan {resource}

#### Trivy
- Image 검사 : trivy image –severity {UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL} {image_name}
- Tar Image 검사 : trivy image –severity {UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL} –input {image_tar}

### Falco & Sysdig
#### Falco
- Falco 시작 : systemctl start falco
- Falco Config 설정 변경 : vim /etc/falco/falco.yaml
- Falco Config 설정 변경 적용 : systemctl restart falco 또는 kill -1 {pid}
- Falco console output 확인 : jouarnalctl -fu falco
- Falco Rule 추가/변경 : vim /etc/falco/falco_rules.local.yaml
- crictl pods -id {container_id} 명령으로 falco output에서 조회되는 container id 기반으로 pod/deployment 찾기. 

#### Sysdig
- sysdig -l | grep {time, user, proc, name} 등의 명령으로 output 시 사용할 변수명을 파악할 수 있음
- crictl info | grep sock 명령으로 containerEndpoint가 `/run/containerd/containerd.sock` 임을 확인할 수 있음 
- sysdig -M 30 -p '%evt.time, %user.name, %proc.name' --cri /run/containerd/containerd.sock container.name=tomcat123 >> 주어진 파일 경로 

#### Seccomp
- default 프로필 디렉토리 : /var/lib/kubelet/seccomp/profiles/

