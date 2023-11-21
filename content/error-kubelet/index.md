---
emoji: 🧢
title: '[Error] VM 자동 재부팅시 kubelet 재기동 실패 - swap 메모리'
date: '2023-07-16 00:00:00'
author: jjunyong
tags: 
categories: Error
---

Host 서버가 native OOM 이슈로 자동 재기동되면서 VM도 모두 재기동되었다. 
그런데 kube-apiserver가 올라오지 않아 살펴봤더니 모든 노드의 kubelet이 죽어 있었고, 
```bash
journalctl -fu kubelet
```

위 로그로 kubelet의 실패 원인을 살펴보았더니 아래와 같은 에러 메시지가 출력되었다.
```
 "command failed" err="failed to run Kubelet: running with swap on is not supported, please disable swap! or set --fail-swap-on flag to false.
```

결론은 node마다 swap 메모리가 off가 안되어 있어서 그랬던 것이다. 자세한 내용은 아래 링크를 참고하자. 
<br>
https://my-grope-log.tistory.com/30