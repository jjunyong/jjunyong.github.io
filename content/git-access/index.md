---
emoji: 🧢
title: '[Git] Personal access token 이용하여 github remote 인증하기  in Mac'
date: '2024-09-15 00:00:00'
author: jjunyong
tags: Git
categories: DevOps
---

로컬에서 Github repo 로 push 할 때 이제는 깃헙계정 패스워드가 아닌 Personal access token을 입력하도록 한다.

근데 매번 이걸 입력하기는 너무 귀찮으니, personal access token을 발급 받아 로컬 키체인에 저장해두면 된다.

personall access token 발급은 계정 setting - developer setting - personal access token 에서 generate하면 된다.

해당 토큰은 디바이스 별로 하나씩 생성하는 것이 좋을 듯하다.

나 같은 경우는 아래와 같이 'mac' 이란 이름으로 토큰을 만들었고 repo에 대한 권한만 주었다.

![image1](./image1.png)

그 후 command + space 하여 'keychain Access' 를 열어서 아래와 같이 깃헙의 주소와 나의 깃헙 계정명을 적은 후 암호 란에 토큰 값을 복붙해주면 된다.

![image2](./image2.png)

마지막으로 맥 터미널을 열어서 아래 명령어를 통해 키체인을 로컬 git에 등록해주면 끝이다.

```
$ git config --global credential.helper osxkeychain
```
