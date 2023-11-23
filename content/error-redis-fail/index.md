---
emoji: 🧢
title: '[Error] Redis 기동 실패 : SELinux'
date: '2023-11-22 23:00:00'
author: jjunyong
tags: 
categories: Error
---

VM이 갑자기 재기동 되어 k8s 클러스터를 복구하였으나, redis가 재기동되지 않아서 `journalctl -xe` 명령으로 로그를 확인해보니
```
type=1400 audit(1700663555.037:17): avc:  denied ....
```

와 같은 오류가 출력되었다. 이는 SELinux의 audit 정책과 관련된 이슈이고, SELinux 정책을 off했다가 redis 재기동 후 on을 하는 방식으로 해결하였다.

- 정책 off
```
sudo setenforce 0
```
- 정책 on
```
sudo setenforce 1
```