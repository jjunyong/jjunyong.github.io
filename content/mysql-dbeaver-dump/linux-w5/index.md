---
emoji: 🧢
title: '[리눅스 스터디] 5. 인터넷, 네트워크, 도메인'
date: '2023-07-24 00:00:00'
author: jjunyong
tags: Linux
categories: Linux
---

### 1. 인터넷
- DNS A레코드에 대하여
- Client - Server 구조
- public ip, private ip, NAT 개념

### 2. Apache 웹 서버
- 웹 브라우저와 웹 서버 
- apache 설치, elinks 활용 
- apache conf 파일에서 log, document root 설정 

### 3. 원격제어 SSH 
- SSH client가 설치된 컴퓨터에서 SSH server가 설치된 컴퓨터를 원격제어 할 수 있다. 
  - 이것은 웹브라우저와 웹서버의 관계와 매우 유사하다.
- SSH 서버 설치하기 
  - openssh-server 설치
    - sshd가 실행되면 정상이다.

### 4. 포트(Port)
- port는 서버의 '문' 과 같은 역할이다. 
- well-known port(0~1024): 22, 80, 443 등
- ssh, http도 다른 port로 접속되게 할 수 있다.
- 포트포워딩 : 라우터의 설정에서 private network의  포트 포워딩 할 수 있다. 

## 5. 도메인
- hosts 파일
- 도메인 구입
- 서브 도메인 

### DNS 동작 원리 
  - `dig +trace {domain}` 을하면 DNS의 동작원리를 파악할 수 있다. 
  - 도메인의 맨 뒤에는 .이 생략되어 있다. '.'은 root도메인을 의미한다. 
  - 전세계적으로 도메인은 '계층구조'에 의해서 저장, 관리된다.
  - 모든 컴퓨터는 지정된 로컬 DNS를 지닌다. 
  - root DNS 서버는 '.'을 담당하며, 로컬 DNS는 도메인을 resolve하기 위해 최초로 root DNS에 질의한다. 
  - root DNS 서버는 'egoing.ga.' 중 .ga도메인을 담당하는 최상위 DNS에 대한 정보를 알고 있기 때문에 .ga DNS에 질의한다.
  - .ga 최상위 DNS에 egoing.ga.를 질의하여 도메인 소유자 DNS 정보를 얻는다. 
  - 로컬 DNS는 마지막으로 도메인 소유자의 DNS는 해당 도메인의 IP 주소를 로컬 DNS 서버에 반환한다.
  - 이 ip는 로컬 DNS에 캐싱되며, 요청 컴퓨터에게 반환된다. 

## 6. 서버간 동기화 (rsync)
- `touch test{1..10}`
- rsync는 '증분 백업'을 한다. 즉 변경 사항이 있을 때에만 전송을 하기 때문에 효율적이다. 
- `rsync -av src/ dest`
- 다른 서버로 rsync 하기 
  - `rsync -azP ~/rsync/src/ J6419@192.168.0.3:~/rsync/dest`
    - -a : archive mode. 백업 시 사용
    - -z : 전송 시에 압축(compress)하여 전송
    - -P : 전송의 ㅡprogress를 보기
    - 192.168.0.3 서버에 J6419 계정으로 접속하여 ~/rsync/dest 경로에 원천으로 부터 백업한다. 
- 백업 시에는 로컬에서도 rsync를 쓰는 것이 좋다. 왜냐하면 cp 명령어는 기본적으로 권한, 소유, timestamp와 같은 메타데이터를 원천과 동일하게 복사해주지 않기 때문이다. 
  - cp 명령을 사용해서 백업을 할 경우에는 파일 백업의 경우 '-p(preserve)' 옵션을, 디렉토리 백업일 경우 '-a(archive)' 옵션을 반드시 주어야 한다. 

## 7. SSH Key : 로그인 없이 인증하기

### SSH 공개-비공개 key 방식
- Client 컴퓨터에서 `ssh-keygen` 하여 public/private 키 페어를 생성한다.
  - id_rsa, id_rsa.pub, authorized_keys, known_hosts 파일이 생성됨
- id_rsa.pub 공개키 파일의 내용을 접속 대상의 서버 ~/.ssh 디렉토리의 authorized_keys파일 뒤에 붙여준다. 
  - 이를 안전하게 하기 위해 ssh-copy-id 명령을 활용한다.
  - `ssh-copy-id J6419@192.168.0.3`
- 위에서 언급한 rsync 명령은 기본적으로 ssh로 통신하기 때문에 `rsync -azP ~/rsync/src/ J6419@192.168.0.3:~/rsync/dest` 와 같이 명령을 활용하기 위해서는 로그인 없이 인증하기를 적용해두어야 한다. 

### RSA
RSA는 암호화 방식 중의 하나이며 암호화 방식은 크게 대칭키/비대칭키 암호화 방식으로 나눠 볼 수 있다.
- 대칭키 암호화 방식
  - 암호화, 복호화 시 모두 같은 key를 쓰는 방식
  - AES256 등(iv, secret)
- 비대칭키 암호화 방식
  - 암호화 할 때는 private key(비밀키), 복호화 할 때는 public key(공개키)를 쓰는 방식
  - RSA는 여기에 해당한다. 

SSH Client가 SSH Server에 접속할 때 RSA방식을 이용해서 인증된 유저임을 증명하게 된다.
client가 server에 접속 요청을 하게 되면 server에서 random key값을 client에게 보내게 되고 client는 그 key값을 private key로 암호화하여 server에 전송한다.
server에서는 전달받은 암호화된 key값을 공개키를 이용하여 복호화하게 되며 그것이 server가 처음에 전송한 random key값과 일치한다면 해당 client를 인증된 사용자로 로그인시켜주는 방식이다.  

----
# 스터디 문제

- **DNS의 동작원리에 대해서 설명해보세요.**
내 컴퓨터가 jy.com 이라는 도메인에 질의를 했다고 가정하고 설명하겠다. 
도메인의 맨 뒤에는 .라는 루트 도메인이 생략되어 있다. 즉 = jy.com = jy.com. 이다.
1. 내 컴퓨터는 내 컴퓨터의 로컬 DNS 에 jy.com. 에 대해서 질의를 한다. 
2. 로컬 DNS는 최초로 root DNS에 마지막 '.' 바로 앞의 절(여기서는 .com) 대해서 질의한다. 
3. root DNS는 .com 을 담당하는 최상위 DNS 정보를 가지고 있기 때문에 그것에 대한 정보를 반환해준다.
4. 로컬 DNS는 .com 최상위 DNS에 'jy.com.' 에 대해서 질의하여 도메인 소유자 DNS 정보를 얻는다. 
5. 로컬 DNS는 마지막으로 도메인 소유자의 DNS에 'jy.com.' 에 대해서 질의하여 해당 도메인의 A 레코드를 참조하여 IP 주소를 얻는다. 
6. 로컬 DNS는 이 결과를 캐싱하며, 내 컴퓨터에 결과를 반환해준다. 

- **백업 시, cp가 아닌 rsync를 쓰는 이유는 무엇인가?**
  - 증분 백업(동기화)
  - 압축
  - 메타 데이터까지 복사 
  - 데이터 손실 최소화 
  - 기타 백업에 유용한 다양한 옵션 

- **대칭키/비대칭키 암호화 방식에 대해서 설명하고 각각의 예를 말해보세요.**
암복호화 시 동일한 키를 쓰느냐 다른 키를 쓰느냐의 차이
  - 대칭키 : AES256
  - 비대칭키 : RSA

- **SSH를 loginless하게 사용하는 방법 중 RSA를 활용한 접속방식에 대해서 설명해보세요.**
SSH Client가 SSH Server에 loginless하게 접속할 때 RSA방식을 이용해서 인증된 유저임을 증명하게 된다.
client가 server에 접속 요청을 하게 되면 server에서 random key값을 client에게 보내게 되고 client는 그 key값을 private key로 암호화하여 server에 전송한다.
server에서는 전달받은 암호화된 key값을 공개키를 이용하여 복호화하게 되며 그것이 server가 처음에 전송한 random key값과 일치한다면 해당 client를 인증된 사용자로 로그인시켜주는 방식이다.  
