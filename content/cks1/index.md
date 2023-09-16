---
emoji: 🧢
title: '[CKS] Cluster setup & hardening 1'
date: '2022-09-16 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

### Cloud Native 보안의 4C
- Cloud : Datacenter, network, servers
- Cluster : Auth, Admission, NP
- Container : Restrict image, supply chain, sandboxing, privileged
- Code : Code security

### CIS Benchmark
- CIS는 커뮤니티 기반의 오픈소스 단체로서 세상의 사이버 보안을 향상하는 데 기여한다. 
- CIS는 k8s 뿐만 아니라 다양한 IT 표준 기술들( web, was, db, OS, network )에 대해서 보안에 대한 best practice를 제공한다.
- CIS-CAT을 사용하면 현재 k8s 클러스터의 취약점을 html로 생성해준다. 

### Lab : CIS benchmark on Ubuntu OS 
- CIS-CAT 실행 
  - `sh ./Assessor-CLI.sh -i -rd /var/www/html/ -nts -rp index`
  - OS 선택 Ubuntu 20.04 LTS 
  - Profile 선택 : Level1 - server
이렇게 하면 /var/www/html 경로에 index.html 파일로 현재 설치된 OS인 ubuntu 20.04 에 대한 취약점 보고서가 생성되며 보고서의 remediation을 참고하여 보안에 필요한 설정을 조치하면 된다. 




