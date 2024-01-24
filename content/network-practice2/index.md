---
emoji: 🧢
title: '라우팅 추적(ICMP)과 ARP'
date: '2024-01-19 00:00:00'
author: jjunyong
tags: network
categories: Linux
---

## 네트워크 통신과정 : 라우팅 추적

### traceroute
```bash
traceroute -n www.google.com
```
- 중간에 보이는 * 은 보안, 설정, 부하 등으로 인해 응답이 없었던 라우터이다. 
- 처음에 LAN의 gateway를 타고 나가서 router들을 거쳐 목적 서버로 도착하게 된다.
- 동일 hop에 여러개의 ip가 나타나는 것은 여러 개의 경로가 있을 수 있음을 의미한다.

### ICMP란?
- Internet Control Message Protocol
- L3 통신이다. (TCP통신이 아님에 유의)
- 라우터를 포함한 네트웍 장치가 통신 체크 용도로 사용된다.

### ping
- tshark 설치하기
  ```bash
  sudo tshark -i {network if명} -f icmp -Y "ip.dst == 8.8.8.8"
  ```
- -f, -Y옵션은 패킷 filtering을 위해 사용되며 -f는 protocol을 필터링하고, -Y 뒤에는 표현식을 적어주어 필터링한다. 

### ARP란?
- Address Resolution Protocol
- L2(데이터링크 계층) 통신
- IP주소를 MAC주소에 매핑하기 위하여 사용된다. 
- 최종 목적지의 MAC주소를 이더넷 프레임에 포함하지는 않는다. (목적지가 LAN내라면 그럴 수 있다.) 외부로의 통신이라면 gateway의 MAC주소를 목적지지로 이더넷 프레임에 포함시켜야 한다. 어쨌든, 두 경우 모두 MAC주소를 패킷에 포함시켜야 함은 맞기 때문에 MAC주소를 얻어 와야하며 이를 위해 ARP 프로토콜이 사용된다
<br>

  > 다른 네트웍 망으로 통신의 경우 라우터는 목적지 Gateway의 MAC 주소를 사용하여 이더넷 프레임을 만들어 해당 네트워크로 패킷을 전송한다. 이런 과정을 통해 패킷은 목적지 네트워크로 계속해서 전달되고, 각 네트워크마다 라우터가 목적지 Gateway의 MAC 주소 데이터를 담은 이더넷 프레임을 만들어 전송된다. 


### ARP 추적과정
- 각 네트워크 장치(컴퓨터)는 ARP 테이블을 지니고 있다. 
- Linux에서는 `ip neigh`명령으로 확인 가능하며 동적으로 ip를 할당하고 디바이스들이 자주 변경되는 LAN환경에서는 ARP테이블이 stale할 가능성도 있다. ip neigh명령을 해보면 `REACHABLE`과 `STALE`로 상태를 확인할 수 있다. 
  ```bash
  ip neigh
  172.18.2.3 dev eth0 lladdr 00:1f:5e:43:24:82 REACHABLE
  172.18.24.39 dev eth0 lladdr 04:13:56:41:27:8E STALE
  ```
- 그렇다면 ARP 테이블은 어떤 방식으로 구성되는가? 

### ARP 패킷 보내는 과정 추적하기
- tshark 대신 tcpdump를 사용할 수도 있다. tcpdump는 tcp 패킷만 볼 수 있는 것이 아니다. 
```bash
# ARP 패킷 추적
sudo tcmdump -xxi {network interface} arp  #1
sudo tcmdump -xxi {network interface} arp and src {내 컴퓨터 ip} #2 내 PC가 보낸 ARP 패킷들에 대해서만 필터링해서 볼 수 있다. 
sudo tcmdump -xxi {network interface} arp and dst {LAN 대역의 목적지 ip} #3

# LAN의 대역의 ip에 대해 ping을 하게 되면 ICMP 패킷을 보내기에 앞서, ARP 패킷을 보내서 MAC주소를 먼저 알아내게 된다. 
ping {LAN 대역의 목적지 ip}
```


![image1](./image1.png)

- 위의 3번 명령을 실행시킨 상태에서 다른 터미널에서 ping명령을 하게 되면 위와 같은 결과가 나오는 것을 볼 수 있는데, 이 때 ARP 패킷은 브로드캐스팅되며, 송신지 MAC의 주소가 내 PC MAC주소로 되어있음을 확인할 수 있다.
- ARP 요청을 받은 호스트는 자신의 MAC 주소를 ARP 응답 패킷에 담아 송신 호스트에게 직접 응답한다. 해당 응답 패킷에는 목표 IP 주소와 해당 IP 주소에 대한 MAC 주소가 포함됨. 

### ARP 테이블 지우기
- 전체 테이블 비우기
  ```bash
  sudo ip neigh flush all
  ```
- 1개 지우기
  ```bash
  sudo arp -d {ip} # ARP 테이블에서 1개 ip에 대한 정보 지우기

  sudo arp # ARP 테이블 조회( ip neigh 와 유사 ) 
  ```