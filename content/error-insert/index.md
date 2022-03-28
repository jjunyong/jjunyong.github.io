---
emoji: 🧢
title: '[Error] insert시 select key 후 inesrt로 인한 에러 발생 조치'
date: '2022-03-28 00:00:00'
author: jjunyong
tags: h2
categories: Error
---

운영하는 사이트에서 메일엔진 솔루션을 사용 중인데 메일엔진이 mail_queue라는 테이블에서 데이터를 긁어가서 
메일을 일괄 발송하는 방식이다. 

그런데 갑자기 사이트에 장애가 발생해서 mail_queue 테이블에 데이터가 insert되지 않는 에러가 발생했다.
에러의 내용은 아래와 같았다.
<br>

```
JDBC-5074: Given String does not represent a number in proper format. 
```
<br>

로컬에서, 개발서버에서도 해당 에러가 재현되지 않고 디버깅을 찍어보아도 insert되는 데이터는 정상이었다. 

문제는 INSERT를 수행하기 전 ㅡ

```SQL
<selectKey resultType="String" keyProperty="mid" order="BEFORE">
<![CDATA[
SELECT DECODE(
MAX(mid),
null,
TO_CHAR(SYSDATE, 'YYYYMMDD') || '00001',
TO_CHAR(TO_CHAR(SYSDATE, 'YYYYMMDD') || LPAD(TO_NUMBER(SUBSTR(MAX(mid), 9))+1, 5, '0'))
) AS  mid
FROM rtms_mailqueue
WHERE TO_CHAR(sdate, 'YYYYMMDD') = TO_CHAR(SYSDATE, 'YYYYMMDD')
]]>
</selectKey>
```

-> chmod 755 h2.sh 또는 chmod +x h2.sh를 통해 해당 파일에 실행권한 부여.

2. ./h2.sh 하니깐 웹 브라우저 상에서 실행되었으나 아래와 같이 연결할 수 없다고 나옴.

![image1](./image1.png)

url중 ip부분을 localhost:8082로 변경하고 테스트하면 아래와 같이 잘 나오는 걸 확인할 수 있었다.

![image2](./image2.png)


<selectKey resultType="String" keyProperty="mid" order="BEFORE">
<![CDATA[
SELECT DECODE(
MAX(mid),
null,
TO_CHAR(SYSDATE, 'YYYYMMDD') || '00001',
TO_CHAR(TO_CHAR(SYSDATE, 'YYYYMMDD') || LPAD(TO_NUMBER(SUBSTR(MAX(mid), 9))+1, 5, '0'))
) AS  mid
FROM rtms_mailqueue
WHERE TO_CHAR(sdate, 'YYYYMMDD') = TO_CHAR(SYSDATE, 'YYYYMMDD')
]]>
</selectKey>