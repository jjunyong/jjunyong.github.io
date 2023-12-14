---
emoji: 🧢
title: '[Error] Prometheus CrashLoopbackOff'
date: '2022-12-14 00:00:00'
author: jjunyong
tags: prometheus
categories: Error DevOps
---

개발, 검증계와 동일한 prometheus의 yaml파일로 운영에서 pod 생성시 CrashLoopbackOff 상태에 빠지게 된다. 
<br>
configmap-reload 컨테이너를 제외시키고 prometheus pod의 로그만 확인 시, '/mnt/pv/.... file not found' 와 같은 에러가 발생했다. 
실제 pod에서는 컨테이너 기동 시에 해당 tsdb를 찾으려고 하는 모양인데 실제 volume에는 해당 파일이 없는 것으로 pv debugger를 활용하여 확인하였다. 

> #### PV debugger 활용
> PV에 직접 접근할 방법이 별도로 없기 떄문에, busybox 이미지를 활용하여 문제가 되는 prometheus의 pvc를 volume으로 설정, mount하여 접근한다. 

- 결국 tsdb의 path로 마운트된 볼륨에서 해당 경로를 백업한 뒤 모두 비워주고 Pod를 기동하니, 새로운 데이터를 쌓으면서 정상적으로 pod가 기동됨을 확인하였다. 
