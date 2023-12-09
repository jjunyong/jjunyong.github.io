---
emoji: 🧢
title: '[AWS architect] 8. AWS 자동화'
date: '2022-07-06 00:00:00'
author: jjunyong
tags: AWS
categories: AWS DevOps
---

## IaC
IaC의 장점 : 재사용성과 업데이트

### AWS CloudFormation
CloudFormation > Stack > create Stack에서 IaC yaml파일을 등록하여 한 꺼번에 프로비저닝 할 수 있다.
- AWS 대부분의 리소스를 CloudFormation 템플릿으로 제어할 수 있다. 

### AWS Elastic Beanstalk 
웹 콘솔에서 클릭으로 할 수 있기 때문에 편의성 면에서 프로비저닝하기 더 좋다.


### AWS CDK(Cloud Development Kit)
python, typescript 등의 언어로 컴파일하여 CloudFormation template을 만들어준다. 

[보충 이미지]

### AWS 솔루션 라이브러리
- 사전 구축된 참조 아키텍처이며 도메인 별로 활용될 수 있는 다양한 아키텍처를 확인할 수 있다.
- CloudFormation 파일을 제공하는 아키텍처들도 있다.


### AWS Systems Manager 


----

## 실습 3: AWS VPC 인프라에 데이터베이스 계층 생성
[실습 아키 이미지]

1. RDS 생성
2. Target group 생성


---
eksworkshop.com 