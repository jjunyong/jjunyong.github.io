---
emoji: 🧢
title: '[AWS architect] 10. Networking2'
date: '2022-07-08 00:00:00'
author: jjunyong
tags: AWS
categories: AWS
---

## 개요
- AWS 서비스에 대한 연결을 프라이빗 상태로 유지할 수 있는가
- VPC 간에 private 방식으로 트래픽을 라우팅하려면?
- 온프레이미스 <-> AWS 를 연결하려면


## VPC Endpoint 
internet gateway 타지 않고 privateg하게 private subnet내에 있는 EC2 instance와 AWS 완전 관리형 서비스인 DynamoDB를 통신하게 할 수 있다. 
VPC Endpoint가 없다면 NAT를 타고 IGW를 타고 통신해야 한다.
VPC 만들 때 Gateway endpoint와 Interface endpoint 하나 씩만 최초에 만들어주면 된다.
- Gateway endpoint
  - 라우팅 테이블에 지정된 대상
  - S3, Dynamo DB 서비스 지원
  - 추가 비용 없음 
- Interface endpoint
  - private IP의 ENI를 통해 서비스와 통신한다고 이해하면 됨 
  - 추가 비용 존재 

  VPC endpoint도 리소스이므로 리소스 기반 정책을 적용할 수 있다.
  [심층 방어 이미지]




### VPC 피어링
  - 리전이 달라도 지원되며 다른 계정과도 지원됨 
  - 그러나 VPC 간에 IP대역이 중복되면 안됨 
  - 다중 피어링 
    - Full mesh로 해야 연결이 된다. 즉, trasitive peering이 안된다.
      - 공유 서비스 VPC를 만들어 불편함을 극복했었음
  - Transit gateway 실습해보기 
  
### On-premise 데이터 센터와 AWS 간의 네트웍 연결
  - AWS site-to-site VPN
  - AWS Direct connect 
    - 우리 회사는 이걸 쓰고 있음 
  - Transit Gateway 
