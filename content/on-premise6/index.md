---
emoji: 🧢
title: 'On-premise 서버 구축하기 6. DB 서버 구축하기' 
date: '2023-07-02 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---

## MySQL 8.0 설치 

1. 설치가능한 MySQL repository 확인
www.mysql.com/products/community/

2. MySQL Repository 설치 

1에서 확인한 yum, CentOS 7버전에 해당하는 repository 설치
```bash
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
```

3. MySQL 설치
```bash
yum install -y mysql-server

# mysql version 확인
mysqld -V
```

4. MySQL 서버 시작 
```bash
systemctl enable mysqld && systemctl start mysqld && systemctl status mysqld
```

- 아래 명령을 통해 설치된 mysql서버의 root 계정 비밀번호를 알아 낼 수 있음
  - `grep 'temporary password' /var/log/mysqld.log`

- 아래 명령을 통해 mysql에 root로 접속 
  - `mysql -u root -p`

5. DB구성 및 데이터 마이그레이션
내 로컬 환경인 Mac에서 mysqldump 명령을 사용하기 위해 아래 명령어로 mysql-client를 다운 받는다. 
```bash
brew install mysql-client
```

