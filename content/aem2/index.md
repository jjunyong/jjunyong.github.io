---
emoji: 🧢
title: '[AEM] Adobe Experience Manager 2. Template, Component'
date: '2022-02-08 11:11:44'
author: jjunyong
tags: AEM
categories: AEM
---

지난 글에서는 AEM의 아키텍처, 설치와 어떤 종류의 콘솔이 있는 지 알아보았다.
AEM을 사용하는 가장 큰 이유는 Component와 Template을 생성하고 이를 재사용할 수 있다는 점이다.

## CRXDE Template

CRXDE 는 Contents Repository Extreme Development Environment 의 약자로서 
https://{ip}:{port}/crx/de/index.jsp 경로로 접근할 수 있으며 이 곳에서 프로젝트 폴더를 생성하고 관리한다.

- apps/ 에서 template과 component를 생성/관리 한다.
  - template은 component로 구성되어 있다.