---
emoji: 🧢
title: 'Bringit 파악 및 인수인계' 
date: '2023-12-16 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## AWS 설정과 사용한 서비스
- EC2
- RDS
- S3
- Elastic Beanstalk
- Route 53
- ACM  ( AWS certificate manager )
- Elastic loadbalancer
- ? 

## 백엔드 소스
### Config
- API 
  - Swagger API doc 접근 방법
  - Firebase 토큰 없이 어떻게 개발/운영자가 swagger-ui에 접근할 수 있는가
  - Postman?

- 채팅 암호화? 

### application.yaml
- sentry
- slack
  - slack은 monitoring alert용도?
- androidpublisher
  - 인앱결제 목적 
- 개발계와 운영계 배포 현황 
- security.jwt 설정?
- api.google 설정?

### DB 설계 
- ERD 
- v20220922.sql이 최신?
- meets.who_brings_ball?
- meet_news.source_id
- meet_season_profile_symbols

### 애플리케이션 디자인 특이사항

## 디자인 리뷰
- Popup 
- PPP06에 나오는 Player의 의미, 그리고 Home court, Gerneral availablity의 의미(사용자 기준인지 클럽 기준인지)
- PPP03의 'Team NY'는 상대팀을 의미하는가
- SMC05 채팅 창 디자인
- Season registration을 SMN01(meetup news)에서 OK를 해야만 되는 것인가? 안되면 그 클럽에서 탈퇴되는건가? 
- SMD17의 instruction이 복잡함

