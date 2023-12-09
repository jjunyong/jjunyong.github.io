---
emoji: 🧢
title: '[AWS architect] 1. Architecting 기초'
date: '2022-07-05 20:00:00'
author: jjunyong
tags: AWS
categories: AWS DevOps
---

## AWS 인프라
AWS는 2023년 7월 현재 전 세계 31개의 리전(region)을 지원하며, 각 리전은 최소 3개 이상의 가용영역(Availability zone)으로 이루어져 있다.
각 가용영역은 1개 이상의 데이터 센터로 구성되어 있다. 
- Region
- Availability zone
- Local zone
- Edge location

<br>

어떤 리전을 선택해야 하는가? 
- 법규(governence)
- 지연시간(latency)
- 서비스(AWS service) : 리전 별로 지원하는 서비스 수가 다름
- 비용 : 예컨대 상파울로 리전은 브라질 현지 전기 사정이 안 좋아서 직접 발전기까지 돌리기 때문에 cost가 비쌈


### 로컬 존(Local zone)
region을 만들기까지는 애매한 지리적 위치에 있는 사용자에게 낮은 latency로 서비스를 제공하고자 할 떄 사용된다.
예컨대 Oregon region 안에는 LA의 로컬 존이 있다.(oregon<->LA거리 약 1000km)
AWS에서는 LA가 별도 region으로 뗄 만한 규모는 아니라서 광속 케이블로 Oregon과 LA를 연결하여 LA에 로컬 존을 구성하였따. 

- ex) LA로컬존 :  ux-west-2-lax-1a, ux-west-2-lax-2b

### 엣지 로케이션(Edge Location)
Region과는 별도 개념의 데이터센터이다. 
- 세계 400개 주요도시에는 다 있다고 보면 된다. 
- CDN을 위해 사용된다.
- 데이터 캐싱, 빠른 콘텐츠 전송
- 동적 콘텐츠 가속화 기능도 있음
- CloudFront(CDN), Route53(DNS) 서비스에 활용된다. 

### AWS Well-Architected framework  
아키텍처 모범 사례를 사용하여 클라우드 아키텍트의 측정, 학습 , 구축을 돕는 목적이다. 
: 보안, 성능, 비용, 운영 우수성, 신뢰성, 지속가능성

---

## AWS는 API다.
CLI, 웹 콘솔으로 모두 aws의 서비스를 활용할 수 있다. 

### 실습
: 웹 콘솔과 CLI를 통해 S3 버킷을 생성하기
- 버킷명은 전세계적으로 UNIQUE해야 한다. 
- EC2 instance - Session manager접속하여 ec2인스턴스에 connect한다. 

- `aws s3 ls` : S3 버킷 리스트 조회 
- `aws s3 mb` : make bucket S3 버킷 생성
```bash
aws s3 mb s3://labclibucket-2023070512393
```
- `aws s3 cp` 
```bash
aws s3 cp /home/ssm-user/HappyFace.jpg s3://labclibucket-2023070512393
aws s3 ls s3://labclibucket-NUMBER
```
- ec2에서 session manager 접속이 가능하고 s3조회 및 생성이 가능한 이유는 랩 환경에서 ec2의 IAM role에서 권한 정책에서 해당 동작이 가능하도록 설정해두었기 때문이다. 
