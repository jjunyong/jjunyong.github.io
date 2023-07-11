---
emoji: 🧢
title: '[AWS architect] 9. 컨테이너'
date: '2022-07-07 00:00:00'
author: jjunyong
tags: AWS
categories: AWS
---

## AWS애서의 컨테이너 실행 
컨테이너 오케스트레이션
- EKS : AWS에서 지원하는 k8s 사용 툴 
- ECS : AWS에서 개발한 오케스트레이션 툴 
- ECR : AWS에서 개발한 고가용성 Container registry
- Fargate, EC2 : 컨테이너 호스팅 
  - EC2의 유휴 리소스를 컨테이너가 다 활용하지 못하면 리소스 낭비이기 때문에 Fargate가 등장하게 되어 컨테이너를 서비리스하게 사용하게 되었음. 

### K8S 아키텍처
[이미지]

### Amazon EKS
- controlplane은 AWS가 관리해준다. 
- 워크로드는 Fargate를 활용하거나 EC2를 활용하여 워커노드를 구성한다.
- [EKS workshop](https://www.eksworkshop.com/)을 통해서 EKS 실습해볼 수 있다. 





