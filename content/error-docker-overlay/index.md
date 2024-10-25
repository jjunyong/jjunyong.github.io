---
emoji: 🧢
title: '[Error] docker: failed to register layer: open /var/lib/docker/overlay2/... : no such file or directory.'
date: '2024-07-22 00:00:00'
author: jjunyong
tags: 
categories: Error
---

디스크 공간 부족으로 docker 컨테이너 관련 파일을 정리하던 도중 실수로 건드려서는 안되는 /var/lib/docker/overlay2 디렉토리 하위의 몇몇 파일들을 삭제했다. 
덕분에 새로운 이미지로 pull하여 컨테이너 기동시 아래와 같은 오류가 났다.

```
docker: failed to register layer: open /var/lib/docker/overlay2/edcdf45eb06780a19684899495b55a743160482f6973b3a4cd6901df483f1a1b/committed: no such file or directory.
```

1. Docker 데몬 중지 
sudo systemctl stop docker

2. /var/lib/docker/overlay2 디렉토리 백업 해두기. 
혹시 모르니 기존 디렉토리는 백업해두자. 

3. Docker 데몬 초기화
```bash
sudo rm -rf /var/lib/docker/*
sudo systemctl start docker
```

이렇게 하니 해결되었는데 구글링해보니 도커를 완전히 삭제 후 재설치해야 해결되는 경우도 있다고 한다. 끝. 