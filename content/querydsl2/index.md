---
emoji: 🧢
title: '[QueryDSL] 2. QueryDSL 기본문법 (1)'
date: '2022-06-09 15:00:00'
author: jjunyong
tags: QueryDSL
categories: Spring
---

QueryDSL이 무엇인지와 환경설정하는 방법에 대해 배웠으니 이제 본격적으로 문법을 배워보자.

## 1. 기본 Q-Type 활용

querydsl 라이브러리가 생성한 Q 클래스를 살펴보면 아래와 같이 static 변수로 클래스에 대한 
Q객체를 생성해 둔 것을 확인할 수 있다.

```java
public static final QMember member = new QMember("member1");
```

<br>

따라서 우리가 querydsl을 사용할 때는 static import로 해당 객체를 불러와서 객체의 멤버 변수인 'member'를 사용하면
아래와 같이 간결하게 코드를 짤 수 있다.

그리고 Spring에서 주입해주는 em 은 멀티쓰레드 환경에서 안전하도록 구성되어 있기 때문에 JPAQueryFactory는 동시성 문제를 고려하지 않고 따로 클래스의 필드로 빼서 사용하면 된다. 
멀티쓰레드 환경에서 현재 나의 transaction이 어디에 걸려있느냐에 따라 transaction에 바인딩 되도록 em을 분배해주기 때문이다.
<br>

```java
import static ...entity.QMember.*;  // static import 
...

JPAQueryFactory queryFactory = new JPAQueryFactory(em); // JPAQueryFactory의 생성자에 EntityManager를 넣어주고, queryFactory는 멤버로 뺀다. 

public void startQuerydsl(){
  Member findMember = queryFactory
          .select(member) // static import 
          .from(member)
          .where(member.username.eq("member1"))
          .fetchOne();

}
```

## 2. 검색 조건 쿼리

querydsl은 JPQL이 제공하는 모든 검색조건에 대한 메소드를 제공한다.

```java
member.username.eq("member1"); // =
member.username.ne("member1"); // !=
member.username.isNotNull();

member.age.in(10,20);
member.age.notin(10,20);
member.age.between(10,30);

member.age.goe(30) // greator or equal to  ( >= )
member.age.gt(30)  // greater than
member.age.loe(30) //lessor or equal to 
member.age.lt(30)  // less than 

member.username.like("member%"); //like 검색
member.username.contains("member"); // like %member%
member.username.startsWith("member"); // like member%

```

where 문에 and 조건을 여러개를 주는 경우는 .and로 체이닝 해줘도 되지만 where 메소드 안에서 쉼표로 구분해주면 된다.
그리고 이 방법을 사용하면 경우에 따라 null값이 들어갈 수 있는 동적쿼리를 짤 때 코드를 깔끔하게 만들어 준다. 

```java
public void search(){
  Member findMember = queryFactory
      .selectFrom(member)
      .where(
        member.username.eq("member1"),
        member.age.eq(10)
      )
      .fetchOne()
}
```

## 3. 결과 조회 / 정렬

querydsl에서 쿼리에 대한 결과를 가져올 때 fetchOne 뿐만이 아니라 아래와 같은 다양한 메소드를 통해서 가져올 수 있다.

- fetch()
  - 쿼리결과 전체 반환
- fetchOne()
  - fetch결과가 2개 이상이거나 없으면 에러 
- fetchFirst()
  - limit(1).fetchOne() 과 같은 의미 
- fetchResults()
  - totalCount를 가져오기 때문에 count용 쿼리와 contents용 쿼리 2번을 실행한다.
  - 페이지네이션을 위해 사용되며 QueryResults<T> 타입을 반환한다.
    ```java
    QueryResult<Member> results = queryFactory
                    .selectFrom(member)
                    .fetchResults();
    ```
- fetchCount()

<br>

데이터를 정렬하는 것은 아래와 같이 하면 된다.

```java
List<Member> list = queryFactory
        .selectFrom(member)
        .where(member.age.eq(100))
        .orderBy(member.age.desc(), member.username.asc().nullsLast()) // username이 없는 row는 마지막으로 정렬( nullsFirst도 가능 )
        .fetch();
```

## 4. 페이징과 집합 

페이징은 아래와 같이 offset, limit을 사용하여 처리한다.

```java
List<Member> result = queryFactory
          .selectFrom(member)
          .orderBy(member.username.desc())
          .offset(1)
          .limit(2)
          .fetch();

```

<br>

group by, having, 집계함수 같은 집합 관련된 쿼리에 대해서도 아래 코드를 통해 알아보자.

- 집계 함수 

```java
List<Tuple> result = 
    queryFactory
          .selectFrom(
            member.count()
            member.age.sum(),
            member.age.avg(), 
            member.age.max(),
            mebmer.age.min()
          )
          .from(member)
          .fetch();

    Tuple tuple = result.get(0);
    System.out.print(tuple.get(member.count())) // member수 반환
```

원하는 집계함수를 통해 select하게 되면 querydsl에서 제공하는 'Tuple'이라는 형태로 결과를 리턴받는다.
이를 DTO로 뽑아서 사용하는 방식으로 많이 쓴다. 

- group by 

```java
  List<Tuple> result = queryFactory
          .selectFrom(team.name, member.age.avg())
          .from(member)
          .join(member.team, team) //inner join member.team as team
          .groupBy(team.name)  // team의 name으로 grouping
          .fetch();

    Team teamA = result.get(0);
    Team teamB = result.get(1);
```

- having

아래와 같은 형식으로 having도 group by 와 함께 쓸 수 있다. 
<br>

  ```java
  ...생략
  .groupBy(item.price)
  .having(item.price.gt(1000))
  .fetch();
  ```

여기까지 끊고 다음 글에서 querydsl의 기본 문법들(조인, 서브쿼리, case 문 등)에 대해서 더 알아보도록 하겠다.

