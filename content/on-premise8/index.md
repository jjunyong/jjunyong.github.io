---
emoji: 🧢
title: 'On-premise 8. 호스트 서버 모니터링 및 꺼짐 방지' 
date: '2023-07-17 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---

## 이벤트 뷰어 : OS 다운 관련 이벤트 확인하기 
: https://m.blog.naver.com/toruin84/222376936262

## 윈도우 OS 자동 재부팅 방지

### 이벤트 1074 : OS 업데이트로 인한 자동 재시작 

- https://igotit.tistory.com/entry/%EC%9C%88%EB%8F%84%EC%9A%B0-10-%EC%9E%90%EB%8F%99%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%EC%9E%90%EB%8F%99%EC%9E%AC%EB%B6%80%ED%8C%85-%EB%B0%A9%EC%A7%80-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0
- https://sunnyk.tistory.com/6

### 이벤트 41 : Kernel-power 
이거는 파워 공급 불안정이 이유일 수도 있고, 다른 하드웨어적인 이유일 수도 있어서 원인 파악이 매우 어렵다. 
콘센트를 바꿔 꽂아보라는 얘기가 있는데 시도해봐야 할듯. 


---
## 참고자료
- https://igotit.tistory.com/entry/%EC%9C%88%EB%8F%84%EC%9A%B0-10-%EC%9E%90%EB%8F%99%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%EC%9E%90%EB%8F%99%EC%9E%AC%EB%B6%80%ED%8C%85-%EB%B0%A9%EC%A7%80-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0
- https://m.blog.naver.com/toruin84/222376936262
- https://coolenjoy.net/bbs/tip/409629
- https://www.youtube.com/watch?v=OlGY64Usez0
  - 마지막 단계의 '전원 문제 마법사' 는 실행하고 나서 불필요하게 오히려 절전 모드로 변경된다던가 하는 설정 변경이 자동 적용되어버렸는지 검수하고 복구 필요할 수도 있음. 
