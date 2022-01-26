---
emoji: 🧢
title: '[Error] React native SDK location not found'
date: '2022-01-26 00:00:00'
author: jjunyong
tags: RN Android
categories: Error
---

- React native 프로젝트에서 npm run android 했을 때 .zshrc에 Android root 설정했음에도 SDK location not found가 나오는 경우,
  project root/android/에 local.properties 를 생성해서 아래 행을 추가 해주면 된다 .

- Mac : sdk.dir=/Users/{user_name}/Library/Android/sdk

- Windows : sdk.dir=c:\Users\{user_name}\AppData\Local\android\adk

​
