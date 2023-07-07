---
emoji: 🧢
title: '[AWS architect] 7. AWS Monitoring'
date: '2022-07-06 00:00:00'
author: jjunyong
tags: AWS
categories: AWS
---

## AWS Cloudwatch
AWS의 모든 자원은 cloudwatch에 의해서 모니터링 된다. 
- CloudWatch Logs
- AWS CloudTrail 
  - AWS 인프라에서 계정활동을 로깅/모니터링 한다. 
  - CloudTrail 로그 예시 
- VPC 흐름 로그
  - [image]
  - 송/수신 되는 ip 트래픽에 대한 정보를 모두 수집하여 볼 수 있다. 
  - 네트웍 트러블슈팅 시 사용됨 
  - Kinesis Firehose 활용 -> Datadog, splunk Elasticsearch 와 같은 SaaS 연동하기에 용이함 
- 사용자 정의 로그
  - logback에서 수집한 로그를 CloudWatch agent를 설치하여 연동함으로써 Amazon CloudWatch Logs로 전송할 수 있다.

### CloudWatch 경보
[417 image]

### Eventbridge


## ELB (elastic load balancing)
- L4/L7 역할, round-robin이 디폴트. 상태확인 수행하여 문제 있을 시 그 쪽으로 안 보냄
- 무조건 2개 이상의 AZ를 선택하게 되어 있음 

### ELB 유형
- Application Load balancer ( ALB )
  - L7에서 작동. 트래픽의 고급 로드 밸런싱 가능 
  - 자동 scaling 
- Network load balancer ( NLB )
  - L4에서 작동. 고정 IP 지원하여 ALB를 사용할 때도 고정ip가 필요하다면 ALB 앞단에 NLB를 attach한다.
- Gateway load balancer ( GLB )
  - L3에서 작동 
  - 보안 떄문에 사용한다. IDS/IPS에 의해 client ip가 변경되는 문제를 방지 하기 위해 사용된다. 
    - 서버 입장에서는 IDS/IPS가 없는 것처럼 보이게 하기 위함이다.

### ELB 구성 요소 
[이미지]


## AWS autoscaling

### Auto scaling 그룹
scaling기준은 CPU average 30% 등 admin이 설정할 수 잇음 