---
emoji: 🧢
title: '[AWS architect] 4. Computing'
date: '2022-07-05 20:00:00'
author: jjunyong
tags: AWS
categories: AWS
---
## 개요
- EC2에 서버를 배포할 때 고려해야 할 사항이 무엇인가?
- EC2에 연결할 볼륨 유형을 어떻게 알 수 있는가?(EBS)
- 비용을 최적화 하는 방법은 무엇인가?
- 서버리스 컴퓨팅 옵션은 어디서부터 시작할 있는가?

## EC2
### 인스턴스 생성 시 고려사항
1. 이름/태그
  - 태그 룰 지정 : enterprise레벨에서는 중요햐다. 
    [ 태그 룰 이미지 ] 
2. AMI(Amazon Machine Image) : OS image + 필요한 설정
  - enterprise 레벨에서는 기본 AMI에 보안 등의 설정을 추가하여 '사용자 지정 AMI'로 만들어서 사용한다.
3. 인스턴스 유형 이해
  [ 인스턴스 유형 이름 이미지 ]
  - 인스턴스 패밀리 
  - 범용 : T3, M5
  - 메모리 최적화 : R5 
  - 스토리지 최적화 : I3 
  - 컴퓨팅 최적화 : C5
  - 가속 컴퓨팅 : G4, F1
  - 인스턴스 세대 : 최신 세대를 쓰는 것이 오히려 비용이 더 줄어듬. 
  - 추가 속성 : g(graviton), a(amd) 등
  - 인스턴스 크기 : xlarge, 2xlarge, 16xlarge -> 한단계 올라갈 때 성능/가격이 2배 

4. EC2 키페어
  - private key를 로컬에 두고 public key를 서버에 두어 인증하는 방식이다.
  - SSM(Session Manager)이 더 안전한 방법이다.   

5. Tenancy
  - 공유 테넌시
  - 전용 인스턴스
  - 전용 호스트
6. 배치 그룹 : 인스턴스 간의 거리를 선택가능하다. 
7. 사용자 데이터 : AMI를 사용자 데이터에 의해 동적으로 활용할 수 있다. 

### AWS Compute optimizer
비용과 성능 관련해서 aws에서 추천하는 컴퓨팅 리소스를 확인할 수 있다. 


### 인스턴스 메타데이터

`curl https://169.254.169.254/laetst` 치면 dynamic과 meta-data가 나오고
다시 curl `https://169.254.169.254/laetst/meta-data`를 치면 어떤 메타데이터를 받을 수 있는 지 확인 가능하다.
이것을 통해서 기타 필요한 업무 자동화와 같은 것에 활용할 수 있다. 

### Amazon EBS
- EC2와 같은 AZ 안에 존재한다. 
- Type
  - EBS SSD : 부팅 volume으로는 이것만 사용 가능
    - gp2 -> gp3 : 용량이 늘어나면 성능도 늘어나는 특징을 가진다. 
    - io1,io2 : 고성능 디스크가 필요한 경우 용량과 성능(IOPS)을 따로 지불 할 수 있다. 
  - EBS HDD 
    - 빠른 access가 필요하지 않을 때 사용
    - st1, sc1 : sc1 타입이 더 저렴하다. 

### 인스턴스 스토어 볼륨
아주 빠른 디스크가 필요한 경우 인스턴스와 동일한 랙에 있는 볼륨을 활용하게 해주는 리소스로, 네트워크 latency가 없다.  
그러나 EBS와 달리 비영구적인 휘발성 스토리지이며 백업 스냅샷을 미지원한다. 

---

## EC2 요금제

### 구매옵션
- 온디맨드
- Savings plans
- 스팟 인스턴스
  - 유휴 EC2를 90%가까이 저렴하게 이용 가능하나, 해당 EC2가 정가로 할당이 되어야 하면 2분 뒤에 AWS에서 회수해간다.
  - 당일 생성해서 테스트로 사용하기에는 매우 좋다. 
---

## AWS lambda
: 서버리스 컴퓨팅 
[226 이미지]
- api gateway를 붙이면 바로 호스팅도 가능하다. 도메인이 바로 제공되며 마음에 안 들면 DNS에서 CNAME등록하면 된다. 
- 매 request마다 최대 15분 동안 실행, 10G의 메모리 사용 가능
- 웹서비스 및 API 서버에도 활용가능하지만, 배치(집계 등), 자동화, 챗봇(message 받을 때 lambdax트리거링), 테스트,  ML 등에서 매우 효율적이다. 
- 음원 집계 활용 예시 
  - 동시에 300개 스레드로 300개 머신을 15분동안 사용하는 효과를 볼 수 있음 
  - 개인의 컴퓨팅 파워를 매우 효율적으로 활용가능하다. 

---
## 실습
1. VPC 생성 
2. VPC 설정에서 DNS - Enable DNS hostnames 
3. subnet 생성
4. subnet 설정에서 Enable auto-assign public IPv4 addresss
5. public route table 생성 
6. 생성된 라우팅 테이블에 Rule 추가 
7. 라우팅 테이블을 subnet에 연결(associate)
8. 보안그룹(sg) 생성 
  - 생성시 VPC를 Lab VPC로 선택
  - http 허용 규칙 추가 
9. EC2 인스턴스 생성 
  - VPC, subnet, ip 자동 할당, 보안그룹 설정
  - Adavanced Details - IAM instance profile - EC2InstProfile role 선택
-> 이걸 하는 이유는 Session Manager 사용 위함 

  -  User Data 에 스크립트 추가 
10. public ip로 웹브라우저에서 테스트하기
11. SSM(Session Manager) 로 연결 테스트하기
12. public subnet에 NAT 게이트웨이 생성
13. private route table 생성 
  - 0.0.0.0/0 에 NAT Gateway 로 라우팅되도록 설정
14. private route table을 subnet에 연결(associate)

15. private 리소스용 보안그룹 생성
  - 위에서 생성했던 sg를 Chaining
