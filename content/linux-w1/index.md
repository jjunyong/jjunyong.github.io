---
emoji: 🧢
title: '[리눅스 스터디] 1. 리눅스 기초 & IO redirecdtion'
date: '2023-06-28 00:00:00'
author: jjunyong
tags: Linux
categories: Linux
---

# 1. 리눅스 기초 

## 디렉토리와 파일 

- 기본 명령어
  - ls, pwd, mkdir, touch, cd, rm 등
  - 명령어에 옵션을 붙일 수 있음
    - ls -al, rm -r, mkdir -p, ls -S( file size sort desc )
  - . , .., ~ 의 의미 
- --help와 man 
  - man 명령어는 전용 페이지로 넘어가서 보다 상세한 설명을 알려줌. 

## sudo
관리자의 권한으로 명령을 실행 시 필요함.

## 패키지 매니저
다양한 소프트웨어들을 패키지라고 한다. 가령 ls, mkdir, man등도 모두 패키지이다.
하지만 기본적으로 제공하는 프로그램이 아닌 다른 것들은 패키지 매니저를 통해 설치해야 한다. 
일종의 앱스토어라고 생각하면 된다. 우분투 계열의 패키지 매니저인 apt-get 사용법을 알아보자. ( redhat 계열 : yum )

htop 을 활용하면 CLI기반에서도 꽤나 GUI와 같은 형태로 리소스의 상태를 확인할 수 있다. 

- 패키지 설치
  - sudo apt-get install htop
- 패키지 검색
  - sudo apt-cache search htop
- 특정 패키지 업데이트
  - sudo apt-get upgrade htop
- 패키지 일괄 업그레이드
  - sudo apt-get upgrade 
- 패키지 목록 업데이트 
  - - sudo apt-get update 
- 패키지 삭제 
  - sudo apt-get remove htop

## 다운로드 방법
웹 url을 통해서 다운로드 받는 방법에 대해서 알아보자.
- wget
  - wget을 통해서 이미지 다운받기 
- git
  - git을 통해서 repo 다운받기 

----

# 2. IO Redirection
리눅스에서 돌아가는 process의 결과를 IO redirection을 사용하면 다른 파일로 redirection 할 수 있다. 
redirection 하는 대상은 stdin, stdout, stderr 이다. 

### Output
- stdout
- stderr
  - 예를 들어 존재하지 않는 파일을 삭제하면 stderr가 출력된다. 
    - rm non-existing.txt > output.txt 를 하면 안되고 rm non-existing.txt 2> output.txt 이렇게 해줘야 함. rm의 결과로 나오는 에러메시지가 stdout이 아니라 stderr이기 때문이다. 

### Input
- stdin
  - stdin은 기본적으로 키보드로 입력받는 input으로 생각하면 된다. stdin이 아닌 다른 input을 process의 입력값으로 주고 싶다면 아래와 같이 파일이나 다른 명령어의 결과를 redirection 시킬 수 있다.  
    - cat < input.txt
- command-line arguments
  - 명령어에 필요한 옵션, 인자 같은 것들. 
- Env variable
  - PATH, LANG, HOME, USER, 그 외 사용자 정의 환경변수들.. 
  - env 명령을 통해 환경변수 확인 가능. 

---
# 스터디 문제
각자의 /home/{사번}/week1에서 문제를 풀고 마지막에 answer.txt 파일에 답안을 작성해주셔야 합니다. ( 답안 작성 방법은 13번 문제참조 )
처음 디렉토리는 /home/{사번}/week1인 것으로 가정합니다. 

1. "Question"라는 이름의 디렉토리를 생성하고, 해당 디렉토리로 이동해보세요.
2. 이동한 디렉토리에서 q2이라는 empty파일을 만들어보세요. 
3. 해당 디렉토리에서 q3라는 파일을 만들고 vi 편집기 또는 nano편집기를 사용하여 본인의 이메일과 이름을 적어주세요. 
4. 해당 디렉토리에서 파일 목록을 상세하게 리스팅하고, 파일 크기에 따라 내림차순으로 정렬하여 출력하세요. 
5. 현재 디렉토리의 모든 파일/디렉토리를 숨김 파일 포함하여 출력해보세요.
6. wget 명령을 사용해서 http://www.example.com/empty.txt url로 파일을 다운받으세요.(가정, 안되더라도 명령어 실행하기)
7. git 명령을 사용해서 https://github.com/jjunyong/mdparser 저장소를 다운받으세요.(가정, 안되더라도 명령어 실행하기)
8. 5번 문제의 결과를 IO redirection을 사용하여 q8이라는 파일로 저장해보세요.
9. 2번에서 만든 q2 파일을 삭제하세요. 
10. 9번에서 삭제 시 사용한 명령을 그대로 실행하고, 출력되는 stderr 결과를 IO redirection을 사용하여 q10.txt에 저장하세요
11. man mkdir 명령을 입력하면 mkdir명령의 매뉴얼이 조회됩니다. 이 내용을 q11 파일에 저장하세요. 
12. IO redirection을 활용하여 q11 파일의 내용을 q12 파일로 복사하세요.
13. 문제풀이의 과정을 답안으로 제출하기 위해 최근 사용된 명령어를 확인할 수 있는 'history' 명령을 활용하여 최근 사용된 100개 명령어를 ~/week1/answer/txt에 저장해주세요
  - history | tail -n 100 > ~/week1/answer.txt 
---
# 추가 논의  

---
### Reference
- https://www.inflearn.com/course/%EC%83%9D%ED%99%9C%EC%BD%94%EB%94%A9-%EB%A6%AC%EB%88%85%EC%8A%A4-%EA%B0%95%EC%A2%8C/