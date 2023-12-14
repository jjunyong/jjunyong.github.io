---
emoji: 🧢
title: '[기술 세미나] 리눅스 패키지 문제해결 사례 핵심분석'
date: '2023-12-15 00:00:00'
author: jjunyong
tags: Linux
categories: DevOps Linux
---

## 문제란 무엇인가? 
- 문제란 목표와 현 상황의 차이(Gap)이다.
- 따라서 단순히 에러 메시지가 어떻다에서 그치지 않고 목표를 정확하게 잘 정의하는 것이 중요하다. 

### 문제 해결의 다양한 접근 방법 1 : "문제의 현상과 원인은 다르다"
예를 들어 보자.
- 문제의 현상 : 파일 생성 오류 
- 파일 생성 오류가 나는 것은 root cause가 아니라 현상이다. 따라서 이에 대한 원인을 하나씩 찾아나가는 것이 중요하다.

### 문제 해결의 다양한 접근 방법 2 : "잘게 쪼개고 구체화하라"
- 절차, 단계, 열거, 관찰, 점검을 통해 문제를 해결한다. 
  - 리눅스 / 네트웍이 어떻게 원래 돌아가는 지 알아야 절차와 단계, 열거를 할 수 있다.
  - 이게 가능하기 위해서는 2~3 depth까지는 현상 뿐만이 아니라 원리(왜 되는지?) 에 대해서 알아야 한다. 

### 문제 해결의 다양한 접근 방법 3 : "연역적 접근 vs 귀납적 접근"
![image1](./image1.png)
- 연역적 접근 방식 만으로는 변수와 예외가 너무 많기에 해결이 안될 수도 있다. 따라서 경험을 기반으로 한 귀납적 접근 방식을 통한 해결 도출이 필요할 수 있다.
- 그러나 문제의 scope을 결정 짓기 위해서는 연역적 접근 방식이 매우 도움이 된다. 

### 문제 해결의 다양한 접근 방법 4 : "근본원인 ( root cause ) 를 찾자"
문제의 현상이 아니라 현상 기저의 원인이 무엇인지 찾아내야 한다.
![image1](./image2.png)

<br>

---

## 리눅스 패키지
### 패키지란 ? 
- 다양한 프로그램들을 어떻게 관리할 것인가? 
- ex) vim 패키지 : vim 프로그램을 위한 여러가지 파일들의 '묶음' 이다. 

#### 배포판 버전과 코드명을 확인하는 방법
- 배포판에 따라 코드명이 달라지고 이에 따른 문제가 발생할 수 있다. 따라서 배포판을 확인하는 것은 중요하다. 
```bash
lsbrelease -a
cat /etc/issue
cat /etc/os-release
```

#### apt와 apt-get의 차이점
- apt는 apt-get, apt-cache 를 한 번에 다룰 수 있게 사용자 편리 목적으로 만들어진 것이다. 
- apt는 내부적으로 apt-get을 사용하게 되고 apt-get을 사용 시 세부적인 옵션까지 더 활용가능 하다. 

#### yum,rpm vs apt,dpkg 비교
![image4](./image4.png)

#### 패키지 관리 구조
패키지 관리의 구조를 파악하고 있어야 문제 상황에 대해서 어떤 scope에서 문제가 발생했는 지 알 수 있다. 
![image3](./image3.png)
- /etc/apt/source.list에 보면 여러 url이 존재하고 이 url을 근거로 공식 패키지 저장소에서 패키지를 가져오게 된다. 
  - Redhat기준으로는 /etc/yum.repos.d/*.repo 이다. 
  - /etc/apt/source.list.d/ 디렉토리에는 외부 패키지 저장소에 대한 정보를 가지고 있고 여기서 404와 같은 오류가 발생할 가능성이 있다.
- /var/lib/apt/lists, /var/cache/dnf/*/repodata 에 패키지 정보를 캐시로 담고 있다.
  - `apt-get-update` 명령을 하게 되면 이 경로를 채워주게 된다.
  - `apt-cache search nodejs` 와 같은 명령을 하게 되면 이 경로에서 가져오게 된다. 
  
- /var/cache/apt/archives, /var/cache/dnf/*/packages
  - apt-install하면 이 경로에 패키지 파일이 설치되게 되고, redhat계열에서는 /var/cache/dnf/*/packages 경로에 패키지가 임시로 설치되었다가 사라진다. 


### 패키지 관련 문제 사례 

#### 패키지 락 
```bash
E: Could not get lock /var/lib/dpkg/lock-frontend 
- open (11: Resource temporarily unavailable)
E: Unable to acquire the dpkg frontend lock
( /var/lib/dpkg/lock-frontend ), is another process using it?
```
- 자동 upgrade 가 crontab등으로 인해 진행 중이었을 때 명시적으로 apt-get upgrade 명령을 하게 되면 패키지 관리자가 동기화 문제로 인해 락을 건다. 
- 이 때 무조건 락 파일을 지우는 것은 문제가 될 수도 있다. 

#### apt install 도중에 생기는 사례
```bash
Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?”
```
```bash
# apt-update시 패키지 정보를 담고 있는 폴더 List를 모두 삭제 후 다시 install
rm -rf /var/lib/apt/lists/*
sudo apt update
```

#### apt install 통해 받을 수 없거나 동작에 문제가 있는 경우
```bash
wget http://abc..libelf-dev.amd64.deb
ls libelf-dev.amd64.deb
sudo dpkg libelf-dev.amd64.deb # dpkg 명령으로 패키지 설치
```
- 이 때 문제점은, 의존성 패키지까지 확인하여 모두 수동으로 받아야 한다. 

#### 패키지가 어떤 구조로 설치되는지 모를 경우 : tree 명령어 활용
```bash
tree libelf-dev-install/
```

#### 패키지 설치하기전에 어떤 버전이 설치가 되는것인지 모른다면?
```bash
apt-cache policy libelf-dev
```

#### 패키지가 완전히 삭제가 안된다면?
```bash
# 패키지 설치 후 확인
apt-get install -y postgresql
dpkg -l | postgresql

# 패키지 삭제 후 확인
apt-get install -y postgresql
dpkg -l | postgresql

# 패키지 삭제 후 확인
apt-get purge -y postgresql
dpkg -l | postgresql

# 패키지 삭제 후 확인
apt purge -y postgresql*
dpkg -l | postgresql

# 패키지 삭제 후 확인
apt-get purge -y postgresql*
dpkg -l | postgresql
```

#### 디스크 공간 부족으로 인해 패키지 설치가 실패할 경우
- 디스크가 여러 개인 경우 마운트 된 폴더 정확히 확인하기
- `df -h`를 확인했을 때 디스크 공간은 있는 경우 `df -i` 를 확인하여 파일의 개수가 많아서 inode full이 되었는 지 확인 필요

#### 디스크 용량 확보 tip 
- depth 조절을 하면서 공간을 많이 차지하는 디렉토리를 찾는 방법
```bash
du -d 1 /usr -h | sort -n
```
- 미사용중인 패키지 삭제하기 (apt-get -y autoremove)
- 패키지 캐시 데이터 확인 후 삭제하기 (apt-get clean)
- 필요없는 패키지 확인 후 삭제하기 (dpkg -l, apt-get purge)
- journalctl 로그 삭제하기
```bash
# 3일 이상된 로그 삭제
journalctl --vacuum-time=3d
```