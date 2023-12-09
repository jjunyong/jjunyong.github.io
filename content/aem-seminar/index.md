---
emoji: 🧢
title: 'AEM Seminar'
date: '2023-12-09 22:13:33'
author: jjunyong
tags: AEM
categories: WEB
---

### 1. AEM Core Technology의 구성
- Apache Sling
- OSGI Felix application runtime 
- JCR content repository
<br>
Sling + OSGI Felix 가 Spring과 같은 역할을 하고 있는 것이고, JCR은 DB역할을 하는 것이다. 

### 2. OSGI Felix application runtime 
OSGI 주요 콘솔은 아래와 같다.
- `/system/console/configMgr` 콘솔
- `/system/console/bundles` 콘솔 
- `/system/console/servicegraph` 콘솔
  - 모든 bundle은 서로 간의 dependency를 가지며, apache felix가 가장 root인 (id=0) bundle이다. 해당 콘솔에서는 bundle간의 의존 관계를 파악할 수 있다. 
  - 하위의 bundle이 죽게 되면 거기에 의존하고 있는 상위의 bundle도 malfunction하게 된다. 이는 트러블슈팅 시에 중요한 개념이다.

### 3. 데이터 저장 방식
- 데이터 저장 시 현대기아는 tarMK 방식 사용 (서버의 repository 폴더), Cluster 방식에서는 mmongoDB, AWS s3, Azure blob storage등을 활용할 수도 있다.

### 4. Reusability
AEM에는 Reusability를 위한 여러가지 컴포넌트가 있는데, Live copy 기능을 활용한 K dealer site가 가장 강력한 예시이다. 
- AEM core components
- Multi stie manager : Live copy
  - Dealer website
- Content Fragment, Experience Fragment

### 5. Caching
- caching layer
  - CDN, dispatcher, application 레벨에서 캐싱이 일어난다. 
  - CDN, dispatcher에서 캐싱 룰을 적용하지만 `resonse.setHeader("Dispatcher", "no-cache")` 와 같이 cache policy를 application level에서 설정하는 경우도 있다. 
- 특히 이벤트/캠페인 시 일관되지 못한 parameter들이 url에 붙게 되는데 이를 AEM에서는 cache의 key로 인식하여 매번 html을 생성하게 되는데 이는 publisher에 대한 부하를 야기하기 때문에 Ignoring URL parameter 사용하면 cache의 key가 아님을 명시해줄 수 있다.
  - 이는 dispatcher.any에서 설정 가능
- 그리고 jennifer, scouter 등에서 html에 대해서는 디폴트로 측정을 안하게 되어 있는데 이를 측정하게 enable해야 실제 html생성에 대한 부하까지 확인할 수 있다. 

### 6. Monitoring & Request performance
- stack trace 뜨면 어디에 transaction이 위치하는 지 알 수 있다. 
- `kill -3 {pid}` 명령을 하면 stack trace를 남길 수 있다. 
  - crx-quickstart/logs/stdout.log 
  - crx-quickstart/threaddump
  - queued thread pool
  - qtpXXXXXXX 가 실제 작업 thread id
  - I/O bind, CPU bind등에 대한 판단 근거를 알 수 있다. 
  - S차량 case의 경우 transaction id가 전부 하나로 묶여 있었을 것임. 
- qtpXXXXX thread 개수는 AEM publishe(jetty)에서 디폴트 200개로 잡혀 있다. 
  - 이를 고려할 때 AEM proxyfilter에서의 connPool size는 200정도로 잡는 것이 무방하다. 
- 로그 볼 때 hx editor + vs code 활용하기 

#### 부하테스터 (oha)
- oha -c 200 -n 2000 {url} 로 간단하게 CLI 기반 부하 테스트가 가능하다.
- qtp* thread는 디폴트 200개이므로 단일 request에 sleep 10초를 걸어둔 url을 위와 같이 200개 동시 부하로 테스트해도 모두 10.X초 이내에 들어온다. 그러나 -c 200을 넘기게 되면 일부 request들이 queueing되면서 response time이 길어지게 된다. 

#### Request sequence
- request.log에서 request sequence번호에 대해 확인 가능하여 동일한 sequence 번호에 대해 시작과 끝을 확인할 수 있다. 
  - `java -jar /opt/.../rlog.jar request.log` 명령과 같이 rlog.jar 활용하면 reuqest.log의 내용을 시간으로 정리된 상태로 볼 수 있음. 
  - `perl graph-request-log.pl --title "Request graph log" --output output.png reqeust.log | grep gnuplot` 명령을 활용하면 request.log의 내용을 시각화하여 볼 수 있고, 이를 통해 평소와 문제 상황에서의 request 처리 시간에 대한 모니터링이 가능하다. 

#### Query performance
- JCR에 대한 slow query, populoar query를 확인할 수 있음
- AEM 순수 기능을 이용 많이 할 때 활용하기 좋음. API로 외부에서 데이터 가져오는 시스템의 경우 활용도가 낮음

### 7. 배포
- Jenkins 배포 시 purge 자동화 ( GCP ) 가능 
- Dispatcher flush도 자동화 할 수도 있음 
  - Dispatcher flush도 trigger로 작업
  - AEM dispatcher custom invalidation script 활용
    - invalidateHandler
- frontend영역은 배포 시 웹팩 사용하도록 개선 됨

### 8. Security
- Authentication 방법으로는 현재 SAML 방식의 하나인 keycloak 사용 중
  -  퍼블도 AEM 로그인을 해야 되도록 설정할 수 있음 
- Authorization 
  - crx/de에서 /content/rep:policy 노드의 'Access control'에 권한이 정의됨.
- kia.com 호출 시 kwpapi.kia.com 호출하는게 CORS가 문제가 된다면 dispatcher 레벨에서 reverseProxy rule 설정해서 넘겨주도록 해야 함
  - H 해외 동영상 이슈 ?
- graphql instrospection code 비활성화 방법 ?

### Q&A
- car-managmenet.html 검색 노출 
  - 구글 webmaster에서 비활성화 설정 가능 