---
emoji: 🧢
title: '[리눅스 스터디] 4. 사용자 & 권한 & 그룹'
date: '2024-09-25 00:00:00'
author: jjunyong
tags: Linux
categories: Linux
---

## 다중 사용자
- id : `id`를 쉘에서 입력하면 uid, gid 등에 대한 정보를 알 수 있다.
- who : `who` 명령은 현재 서버에 누가 접속 했는 지를 확인 할 수 있다.

### 관리자와 일반 사용자
관리자는 super user의 권한을 갖고, 일반 사용자가 임시로 super권한을 쓰기 위해서는 'sudo' 명령을 쓰게 된다
- sudo passwd -u root
  - root 사용자 unlock하기
- sudo passwd -l root
  - root 사용자 lock하기 

### 사용자의 추가 
`useradd -m tester`: 홈 디렉토리의 생성과 함께 ( -m 옵션 ) tester라는 계정을 생성함 
`passwd tester` : 비밀번호 설정

## 권한 
권한을 지정한다는 것은 리눅스에서는 '파일과 디렉토리'에 대한 읽기/쓰기/실행 하는 권한을 말한다. 

### 파일의 권한 
- chmod : 권한 변경하기 
파일/디렉토리의 access mode를 변경하기 위해서는 'chmod'라는 명령어를 사용한다.
- chmod {u/g/o/a}{+/-}{r/w/x} 로 해당 명령을 쓸 수 있고 숫자로도 chmod 설정 가능하다.
  - chmod u+x perm.txt : 해당 파일의 유저가 실행가능하도록 설정
  - chmod g-r perm.txt : 해당 파일의 그룹에 속한 사용자가 읽을 수 없도록 설정 
  - chmod o+w perm.txt : 유저/그룹 외에 속한 other 사용자가 수정할 수 있도록 설정
  - a는 모든(u/g/o) 클래스에 권한을 설정하는 것 

### 디렉토리의 권한
- r : ls, find 등의 조회를 할 수 있는 지 없는 지에 대한 권한
- w : 파일을 디렉토리 내에서 생성/삭제/변경 할 수 있는 지에 대한 권한 
- x : 디렉토리에 cd 명령을 통해 들어갈 수 있는 지에 대한 권한
- 재귀적 권한 변경
  - `chmod -R o+w perm` : perm 하위에 있는 모든 디렉토리에서 other 유저에게 w권한 부여

### chmod 사용법 정리
- Octal mode 
  - r: 4, w: 2, x: 1 의 값을 가지며 user, group, other는 각각 0~7까지의 권한을 지닌다.
    - 예컨대 777이면 user, group, other 모두에 rwx권한을 준 것이고, 111이면 user, group, other 모두에 실행권한 만 준 것. 
- 명시적 mode 
하기와 같이 '='를 활용하여 직관적으로 권한 설정으르 할 수도 있다. 
  - chmod a=rwx perm.txt
  - chmod a=r perm.txt 
  - chmod ug=rw perm.txt 

## 그룹
권한을 주고 싶은 사용자들의 묶음에 그룹을 부여한다. 

### 그룹 생성 및 사용자 추가 
- 그룹 생성 : groupadd {그룹이름}
  - sudo 권한이 필요하다. 
  - /etc/group에 생성한 그룹이 추가된다. 
- `usermod -aG developer tester`
- chown 명령어로는 디렉토리의 사용자/그룹 권한을 수정할 수 있다. 

----
# 스터디 문제 
각자의 /home/{사번}/week4에서 문제를 풀고 answer.txt 파일에 답안(1~6번 문제)을  작성해주세요 
처음 디렉토리는 /home/{사번}/인 것으로 가정합니다.

0. mkdir week4; cd week4;를 하고 시작해주세요. 
1. 자기 영어이름으로 계정 만들고 비밀번호를 설정해주세요. 
2. 영어이름 계정의 user id와 group의 id를 작성하세요
3. 영어이름 계정의 홈 디렉토리 밑에 test.txt 파일을 만드세요.
4. 영어이름 계정을 usrgrp 그룹에 추가하세요
5. 영어이름 계정의 홈 디렉토리에 usrgrp에 속한 유저가 접근할 수 있도록 권한을 수정하세요. 
6. 사번 계정으로 접속하여 test.txt 파일의 내용에 "hello" 를 추가하고 저장하세요. 
