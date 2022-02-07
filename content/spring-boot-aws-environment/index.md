---
emoji: 🧢
title: Spring boot 개발환경 설정 (gradle,JPA,MySQL,EC2,RDS)
date: '2022-02-04 00:00:00'
author: jjunyong
tags: Spring AWS JPA EC2 gradle MySQL
categories: Spring
---

## 1. AWS에서 프리티어로 EC2와 RDS 발급하기

### 1) EC2 인스턴스 발급

AWS 에 들어가서 EC2 인스턴스 생성하기로 가서 생성하면 된다. 프리티어로 발급 가능한 인스턴스를 발급 받았다.

발급 시 신경 써 주어야 할 부분은 프리티어에서 사용 가능한 최대 스토리지 설정(30GB)과 보안그룹에서 규칙을 설정하는 것이다.

보안그룹을 설정하지 않으면 생성한 EC2 서버로 모든 통신이 불가능하기 때문에 필요한 port와 사용자에 대해 꼭 설정해주어야 함!

나는 Front/Back-end를 위해 각각 3000,8080포트를 모든 사용자에게 허용하고 http,https를 통한 접근 허용을 위해 80,443 포트도 열어두었다.

### 2) EC2 ssh 접속 테스트

Windows에선 putty 설치해서, Mac에선 ssh 커맨드라인 툴을 이용해서 ssh priavte key를 사용해서 접속하면 된다.
계정명은 ubuntu로 초기 로그인이 되며 su 명령어를 통해 root로 유저를 변경하여 root 및 ubuntu 계정의 비밀번호를 내가 원하는 대로 변경해두는 것이 좋다.

### 3) RDS 발급

rds 발급도 '데이터베이스 생성'을 클릭하여 간단하게 생성 가능하다. MySQL을 선택하여 생성하면 되고, 보안규칙에 MySQL port인 3306을 허용시켜주면 된다.

### 4) DBeaver에서 RDS로 접속 테스트

Server Host에는 엔드포인트 값을, Port에는 3306, Username/Password에는 RDS 생성 시 입력한 값을 넣으면 된다. 여기서 헷갈렸던 부분이 RDS db 인스턴스의 db식별자 명을 예를 들어 'abc'라고 했는데 Database이름에 계속 'abc'를 입력하고 test connection을 하니 연결이 되지 않았다. 알고 보니 **Database이름은 비워둔 상태에서 접속한 후에 DB를 'abc'라는 이름으로 생성**해주어야 했던 것임.

이로써, aws의 도움을 받아 간단하게 백엔드를 위한 인프라 설정은 끝났다.

---

## 2. Spring boot 프로젝트 생성 및 DB 연동

### 1) 프로젝트 생성​

IntelliJ에서 'New project' - Spring intializr에서 원하는 jdk, spring boot 버전, 빌드 도구(maven,gradle) 등 선택해서 프로젝트 생성하면 된다.(너무 불친절한가...)

### 2) JPA 사용을 위해 gradle에 JPA 의존성 추가

Mybatis와 같은 sqlmapper를 사용해서 DB와 연동할 수도 있지만 Java진영의 ORM 표준인 JPA를 사용하여 DB와 연동할 것임.

```
dependencies {
implementation 'mysql:mysql-connector-java'
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
}
```

### 3) application.properties

Mysql을 사용하기 위한 드라이버 설정, datasource 설정, DB계정 설정을 해주면 됨.

```
# MySQL 설정
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# Datasource 설정(aws)
spring.datasource.url=jdbc:mysql://{aws RDS endpoint값}:3306/{DB 스키마명}?useSSL=false&useUnicode=true&serverTimezone=Asia/Seoul
# DB username
spring.datasource.username=<username>
# DB password
spring.datasource.password=<password>
```

---

## 3.Spring boot 어플리케이션 EC2 배포하기

### 1) ssh로 접속하여 git clone하기

1에서 ssh 접속 테스트를 성공했다면 무리없이 EC2에 접속해서 2에서 생성한 Spring boot 프로젝트의 git repo를 clone하자. 2에서 생성한 프로젝트를 git에 push하는 것은 설명하지 않았지만, 구글링하면 바로 나온다.

아니면 winscp나 Filezilla와 같은 sftp툴을 사용해서 로컬에서 빌드한 jar파일을 EC2에 업로드 해도 된다.

**EC2에 git과 jdk가 설치되어있지 않다면 git clone하기 전에 해주어야 함**

### 2) 소스코드 빌드 및 빌드된 jar 실행하기

- gradlew 실행 권한 부여
  ```
  $ sudo chmod 777 ./gradlew
  ```
- 빌드하기

  ```
  $ ./gradlew build
  ```

- 실행하기

  빌드하기에서BUILD SUCCESSFUL이 되었다면 build/libs/ 아래의 SNAPSHOT.jar 파일을 실행시켜주자. Spring boot는 톰캣 서버가 내장 되어 있어서 jar만 실행 시켜주면 마침내 Spring boot 서버가 가동된다.

  ```
  $ java -jar Helloworld-0.0.1-SNAPSHOT.jar
  ```

---

추가로 웹 브라우저 상에서 확인을 원한다면 EC2에서 public IP주소를 찾아 아래와 같이 실행하면 Helloworld!라고 나오는 것을 확인 가능하다.
물론, Spring boot 소스코드에서 /test로 접근시 Restconroller에서 'Helloworld!'라는 String을 return하도록 구현이 되어있다면 ㅎㅎ

```toc

```
