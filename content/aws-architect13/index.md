---
emoji: 🧢
title: '[AWS architect] 13. 백업 및 복구, 재해대책'
date: '2022-07-08 00:00:00'
author: jjunyong
tags: AWS
categories: AWS
---

## 개요
- 재해 발생 시 인프라를 보호하는데 사용할 수 있는 전략은 무엇인가
- 백
- 가동 중단 시간을 최소화하면서도 비용 효율적인 방안은 무엇인가

## 가용성
- 고가용성
- 내결함성
- 백업
- 재해 복구 

### RPO, RTO 
- RPO : 데이터 백업해야 하는 빈도 
- RTO : 복구하는데 걸리는 시간 


### 스토리지 복제
- Amazon S3 : cross-region replica
- Amazon EBS : 스냅샷을 떠서 S3에 저장할 수 있다.

### 복구용 AMI 구성

### 데이터베이스 백업 및 복제
- RDS
- DynamoDB

---
## AWS backup 



---
# 지속적인 학습 

- AWS architecture 그리기
  - https://aws.amazon.com/architecture/icons
  - cacoo 
- 