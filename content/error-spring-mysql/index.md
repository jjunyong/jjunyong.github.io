---
emoji: 🧢
title: '[Error] K8S : Spring boot pod - MySQL 연결기'
date: '2023-07-13 00:00:00'
author: jjunyong
tags: 
categories: Error
---

### 'Communications link failure'

spring boot pod 로그 살펴보면 계속 이와 같은 에러가 났는데, 구글링 했을 때 여러가지 해결방안은 있었지만 결국 나에게는 pod가 DB와 3-handshake자체가 안됐었던 것이 문제였다.
host서버에서 wireshark로 분석해보니 mysql로 SYN으로 보내는 패킷만 있고 ACK를 받지 못하고 있었다.
<br>
그런데 막상 호스트 서버에서 직접 mysql로 dbeaver통해 붙을 땐 잘 붙었다는 것. 
호스트 서버로 잘 들어오는데 Vm으로 포워딩은 못해주고 있는 게 문제니깐 포트 포워딩이 결국 문제였던 것이다. 
포트 포워딩을 수정해주고 나서 해결되었음. 

```
Communications link failure
Last packet sent to the server was 0 ms ago.
```

### 'Public Key retrieval is not allowed'
아래와 같이 datasource url에 'allowPublicKeyRetrieval=true'로 변경해주면 됨

```
jdbc:mysql://{host}:3306/{db}?useSSL=false&allowPublicKeyRetrieval=true&useUnicode=true&serverTimezone=Asia/Seoul&zeroDateTimeBehavior=convertToNull
```
### MySQL에서 좀 더 자세한 로그 보는 방법

/etc/my.cnf에서 아래 내용 추가 후 mysql 재기동 
```
general_log = 1
general_log_file = /var/log/mysql/mysql.log
```

### access denied for user '${db_username}'@'{DB_IP}'
Opaque type 시크릿을 이용해서 username, password를 application에 주입하도록 했는데, 계속 이와 같은 에러가 나서 시간을 많이 썼다..
결국 secret도 base64로 인코딩한 것일 뿐이기에 그냥 configmap써서 해결하였다. 
