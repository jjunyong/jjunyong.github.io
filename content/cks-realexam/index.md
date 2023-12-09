---
emoji: 🧢
title: '[CKS] Realexam'
date: '2023-11-15 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

- TLS 관련 문제 바로 스킵
- Falco 문제는 배점이 11점이었는데 falco에서 아무 로그가 안 잡혀서 못품;;
- 무슨 image scanner 관련된 문제가 있었는데 (kubesec아니고,,) 못품. 아마 admission controller, webhook 관련 문제였던 것 같다.
- kubelet에서 authorization mode를 alwaysAllow로 되어 있던 걸 Webhook으로 수정했어야 하는데 kubernetes.io에 레퍼런스를 못찾아서 'Deny'라고 잘못 품
  - 도큐먼트에서 'kubelet'으로 검색하니깐 찾을 수 있음.
