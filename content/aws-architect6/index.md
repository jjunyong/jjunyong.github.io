---
emoji: 🧢
title: '[AWS architect] 6. AWS Database 서비스'
date: '2022-07-06 00:00:00'
author: jjunyong
tags: AWS
categories: AWS DevOps
---

## 개요
- AWS 데이터베이스 솔루션은 무엇인가
- 클라우드에서 RDB를 더욱 효율적으로 관리할 수 있는 방법은 무엇인가
- 확장 가능한 key-value NoSQL을 구축하려면 어떻게 해야하는가?
- AWS 클라우드에서 데이터베이스를 캐시하는 방법은 무엇인가
- 기존 DB에서 AWS 클라우드로 마이그레이션 할 때 사용하는 도구는 무엇인가

## RDB 및 NoSQL
[image]

## 여러가지 AWS 데이터베이스 서비스 
RDS, Aurora, DynamoDB외에도 Neptune등 많은 서비스가 있음 
크기 조정, 고가용성, DB백업, DB s/w 패치, 설치 OS 패치 등의 작업을 사용자가 직접할 필요 없음
- 크기 조정 시 blue-green deploy도 지원하여 서비스 다운타임도 없앴을 수 있음

### RDS 
[이미지]

### RDS Multi AZ 배포
- stanby instance를 primary instance와 다른 AZ에 두고, 동기화 복제를 사용한다.
- primary instance가 fail 되면 stanby가 바로 fail-over되고, 기존의 AZ에 새로운 stanby instance를 생성한다. 

### Read only 복제본 
- 읽기 전용 복제본을 사용해도 되는 데이터는 이걸 활용하면 성능을 크게 향상 가능하다. 

### 저장 데이터 암호화
RDS 데이터는 EBS에 AWS KMS 키로 암호화해서 저장한다.

### Amazon aurora
- MySQL, PostgreSQL 둘 중 선택하여 호환된다. 
- 6벌을 복제해서 3개의 가용영역에 저장한다. 

## DynomoDB 
- aurora와 달리 관계형 서비스
### dynamoDB 일관성 옵션 
### dynamoDB 글로벌 테이블
- PITR : 최대 35일까지 rewind 가능 

## 데이터베이스 캐싱
- 디스크는 빨라고 10ms정도임. 
- 캐싱 전략 : lazy loading write through 

### Amazon ElasticCache
완전관리형이며 memcached와 redis를 지원한다.  
[표 이미지]

### DAX(DynamoDB Accelerator)
- 서울 리전 제공 안됨


## DB 마이그레이션 
- SCT ( Schema converion tool ) : 스키마 옮길 때 사용
- DMS ( Database migration service ) : 데이터 옮길 때 사용
  - 원천에서 한 번 붓고 나서 추가 변경된 부분만 다시 반영하는 기능이 있음 



