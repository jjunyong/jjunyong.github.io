---
emoji: 🧢
title: '[Error] insert시 select key 후 inesrt로 인한 에러 발생 조치 (JDBC-5074: Given String does not represent a number in proper format)'
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

이 문제를 구글링 해보니 tibero에서 자동 형변환을 지원하지 않아서 NUMBER인 컬럼에 string을 insert 시도하는 것이 문제라고 하는데, 
뭔가 내 경우랑 맞지 않는 것 처럼 보였다. 

그리고 로컬에서, 개발서버에서도 해당 에러가 재현되지 않고 디버깅을 찍어보아도 insert되는 데이터는 정상이었다. 

문제는 바로 INSERT를 수행하기 전 key 값을 sql로 채번하는 것이었다.
mail_queue 테이블의 PK인 메일 id( mail_id )값을 기존의 테이블의 mid값 중 max값을 불러와 여기에 1을 더한 뒤에 insert하는 데, 
DB의 mid값에 특수기호가 들어있던 것이 문제였다. 

```SQL
<selectKey resultType="String" keyProperty="mail_id" order="BEFORE">
<![CDATA[
SELECT DECODE(
MAX(mail_id),
null,
TO_CHAR(SYSDATE, 'YYYYMMDD') || '00001',
TO_CHAR(TO_CHAR(SYSDATE, 'YYYYMMDD') || LPAD(TO_NUMBER(SUBSTR(MAX(mail_id), 9))+1, 5, '0'))
) AS  mail_id
FROM mail_queue
WHERE TO_CHAR(sdate, 'YYYYMMDD') = TO_CHAR(SYSDATE, 'YYYYMMDD')
]]>
</selectKey>
```

수동으로 DB에 메일 데이터를 생성해 넣었던 것이 문제였던 것이다. 

단순한 에러이지만 로컬/개발서버에서 재현되지 않았던 것이 당황스러웠는데,,

- INSERT 하기 전에 채번을 수행할 수 있다는 점,
- 로직이 아닌 data가 문제를 발생시킬 수 있다는 점

을 기억해야 겠다. 끝. 