---
emoji: 🧢
title: '[Error] JPA MYSQL "You have an error in you SQL syntax"'
date: '2022-01-26 00:00:00'
author: jjunyong
tags: JPA MySQL
categories: Error
---

- User와 Feed의 다대다 관계 매핑을 위해 'Like'라는 이름의 Entity를 만들었는데, like가 MySQL에서 사용하는 예약 키워드이다 보니
  Syntax 에러가 발생했던 것.

- 해결책 : Like 대신 다른 이름을 사용하자. 그리고 엔티티명으로 예약어를 사용하는 것을 조심하자.

- MySQL 의 예약어들은 아래와 같다.

​
