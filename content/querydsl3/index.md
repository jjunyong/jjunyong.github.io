---
emoji: 🧢
title: '[QueryDSL] 3. QueryDSL 기본문법 (2)'
date: '2022-06-10 15:00:00'
author: jjunyong
tags: QueryDSL
categories: Spring
---

querydsl의 기본문법 중 조인, 서브쿼리, case문 등에 대해서 알아보자.

## 1. 조인

기본적으로 jpql의 조인과 같다.


```java

/* 팀 A에 소속된 모든 회원 */
public void join(){

    List<Member> result = queryFactory
            .selectFrom(member)
            .join(member.Team, team)
            .where(team.name.eq("teamA"))
            .fetch();

    //left, right join 도 가능
    List<Member> result = queryFactory
            .selectFrom(member)
            .leftJoin(member.Team, team)
            .where(team.name.eq("teamA"))
            .fetch();
}
```

<br>

연관관계가 없어도 querydsl에서 join을 할 수 있다.

```java
/* 회원의 이름이 팀 이름과 같은 회원 조회*/
public void theta_join(){
  
  queryFactory
        .select(member)
        .from(member,team)
        .where(member.username.eq(team.name))
        .fetch();
}

```

### Join on 절

on절을 사용하면 조인할 대상을 줄여준다. 

1. 조인 대상 필터링

```java
/* 회원과 팀을 조인하면서, 팀 이름이 teamA인 팀만 조인, 회원은 모두 조회 */
public void join_on_filtering(){
  
  List<Tuple> result = queryFactory
        .select(member, team)
        .from(member)
        .leftJoin(member.team, team).on(team.name.eq("teamA")) // SQL 문법 상에서는 on 절 뒤에 and(t1.name='teamA') 가 추가되는 형태 
        .fetch();
}
```

inner join일 경우는 on을 쓰는 것과 where에 조건을 더하는 것과 동일한 결과를 반환한다.
left join일 경우에는 없는 것도 left 부분은 가져오기 때문에 위와 같은 방법을 써주어야 한다. 
따라서 outer join이 필요한 경우에만 on필터링을 사용하자.

2. 연관관계가 없는 엔티티 outer join 
```java
public void join_on_no_relation(){
  
  List<Tuple> result = queryFactory
        .select(member, team)
        .from(member)
        .leftJoin(team).on(member.username.eq(team.name)) // id 대신 member.username = team.name 으로 on
        .fetch();
}
```
- 일반 조인 : leftJoin(member.Team, team)
- on 조인 : from(member).leftJoin(team).on(...)

## 2. Fetch 조인

페치조인은 SQL에서 제공하는 기능이 아니고 SQL 조인을 활용해서 연관된 엔티티를 SQL 한번에 조회하는 기능이다.
성능 최적화를 위해 사용된다.

- 페치 조인을 미적용한 경우
```java

@PersistenceUnit
EntityManagerFactory emf;

public void fetchJoinNo(){
    Member findMember = queryFactory
            .selectFrom(member)
            .join(member.Team, team).fetchJoin()
            .where(team.name.eq("teamA"))
            .fetch();

    emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam()); // true

}
```

## 3. 서브 쿼리 

```java
/* 나이가 가장 많은 회원 조회 */
public void selectSubquery(){


    QMember memberSub = new QMember("memberSub");
    List<Tuple> result = queryFactory
            .select(member.username, 
              JPAExpressions.select(memberSub.age.avg()) // static import 해서 JPAExpressions. 표현 생략 가능 
            )
            .from(member)
            .fetch();

    emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam()); // true

}
```

- From 절에서 서브쿼리 사용 불가
JPQL에서는 from 절의 서브쿼리, 즉 인라인 뷰는 지원하지 않는다.
select, where절에서만 사용 가능하다.

- 대체방안
  - 서브쿼리를 join으로 변경
  - app에서 쿼리를 2번 분리해서 실행
  - native SQL을 써야 한다. 

그러나 From절에 서브쿼리를 쓰는 이유가 많은데 그 중에 안 좋은 이유는 화면에 쿼리를 그대로 맞추기 위한 용도로 쓴다는 것이다.
쿼리는 DB에서 데이터를 가져오는 것에 집중하고 애플리케이션과 프레젠테이션 단에서 가져온 데이터를 조작하여 쓰는 것이 더 나은 방식이다. 


## 4. Case 문

사실 case문을 쓰는 것은 대부분의 경우 좋지 않고, 위와 같은 이유로 앱 단에서 해결하는 것이 더 좋은 방법이긴 하다.
하지만 어쨋든 아래와 같은 방법으로 querydsl에서는 case문도 지원한다.

```java

public void basicCase(){

    List<String> result = queryFactory
            .select(member.age
                  .when(10).then("열살")
                  .when(20).then("스무살")
                  .otherwise("기타")
            .from(member)
            .fetch();
}


public void complexCase(){

    queryFactory
            .select(new CaseBuilder()
                  .when(member.age.between(0,20)).then("0~20")
                  .when(member.age.between(21,30)).then("20~30")
                  .otherwise("기타")
            .from(member)
            .fetch();
}
```
## 5. 상수, 문자 더하기

- 상수 
```java
public void constant(){

  List<Tuple> result =
    queryFactory
            .select(member.username, Expressions.constant("A")
            .from(member)
            .fetch();
}
```
<br>

- 문자 더하기
```java
public void concat(){

  List<String> result =
    queryFactory
            .select(member.username.concat("_").concat(member.age.stringValue()) 
            .from(member)
            .fetch();
}
```

