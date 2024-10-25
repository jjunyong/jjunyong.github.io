---
emoji: 🧢
title: 'On-premise 서버 구축하기 3. 호스트 서버 보안' 
date: '2024-08-03 00:00:00'
author: jjunyong
tags: DevOps
categories: DevOps
---

## 무작위 접속 시도 차단을 위한 ipban 적용

github에서 https://github.com/DigitalRuby/IPBan/releases url로 ipban을 다운로드 한다. 

- 로그인/로그오프 기록을 로깅하여 ‘이벤트뷰어’-’보안’ 에서 확인하도록 하기
    
    `auditpol.exe /set /category:"{69979850-797A-11D9-BED3-505054503030}" /success:enable /failure:enable`
    
- 서비스등록
    
    `sc.exe create IPBAN type= own start= delayed-auto binPath= C:\IPBan\DigitalRuby.IPBan.exe DisplayName= IPBAN`
    
    `sc.exe description IPBAN "Automatically builds firewall rules for abusive login attempts:https://github.com/DigitalRuby/IPBan"`
    
    `sc.exe failure IPBAN reset= 9999 actions= "restart/60000/restart/60000/restart/60000"`
    
    `sc.exe start IPBAN`
    
- ipban.config 수정 후 서비스 재기동하기
    - 로그인 5회 실패시 등록
    <add key="FailedLoginAttemptsBeforeBan" value="5"/>
    - ipban 시간 15일로 수정
    <add key="BanTime" value="15:00:00:00"/>
    - 차단후 제거 기준일 15일로 수정
    <add key="ExpireTime" value="15:00:00:00"/>

## 이벤트 뷰어 보는 법
[실행창] - "eventvwr" 입력하면 된다.
생각보다 호스트 서버에 무작위로 접속 시도하는 경우가 많아서 윈도우 서버의 경우 이벤트 뷰어에 들어가서 누가 언제 호스트 서버에 접속했는지 확인할 수 있다.
  접속 시도와 관련된 이벤트 id 및 로그온 유형은 다음과 같다. 

- Event ID
  - 4624
    - 성공적인 로그인을 뜻한다. 따라서 관리자가 접속한 시간이 아닌 경우에 4624가 발생했다면 외부 공격을 의심해야 한다. 
  - 4625
    - 계정 로그온 실패로 분류되며, 나의 경우에는 이벤트 뷰어에서 4624 이벤트가 초 단위로 쌓였었다. 

- 로그온 유형
  - 로컬 로그온 (Logon Type 2): 사용자가 직접 컴퓨터의 키보드 또는 마우스를 사용하여 로그인하는 경우이다. 
  - 원격 데스크톱 로그온 (Logon Type 10): 원격 데스크톱 연결(RDP)를 통해 원격으로 로그인하는 경우이다. 
  - 네트워크 로그온 (Logon Type 3): 파일 공유 등의 네트워크 리소스에 접근하기 위해 로그인하는 경우이다. 예를 들어, 파일 공유에 접근하거나 인터넷 공유 서비스를 사용하는 경우가 이에 해당한다. 
  - 서비스 로그온 (Logon Type 5): 시스템 서비스가 실행되기 위해 로그인하는 경우이다. 일부 백그라운드 서비스나 시스템 프로세스가 로그인하여 작동하는 경우가 이에 해당한다.
  - 일정 작업 로그온 (Logon Type 7): 예약된 작업이 실행되기 위해 로그인하는 경우이다. 일정에 따라 백그라운드 작업이 실행되도록 예약한 경우가 이에 해당한다.

  type3과 type10이 외부에서의 공격이 있을 때 빈번하게 나타난다고 한다. 