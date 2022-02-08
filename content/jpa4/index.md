---
emoji: 🧢
title: '[JPA] 4. 엔티티(Entity) 매핑 기초'
date: '2022-03-08 00:00:00'
author: jjunyong
tags: JPA
categories: Spring
---

JPA의 내부동작, 즉 영속성 컨텍스트의 정의, 장점, 라이프사이클 등에 대해서 이전 글을 통해 알아 봤다면, 
이제 Entity 매핑을 실제로 어떻게 하는 지를 알아보자. 


## 1. 객체와 테이블 맵핑 ( @Entity, @Table )

@Entity가 붙은 클래스는 JPA가 관리하게 된다.

- Entity 작성 시 주의사항
    - 기본 생성자는 필수이다.
    - final, enum, interface, inner 클래스 사용 X
    - 저장할 필드에 final 사용 X 

- @Table은 엔티티와 맵핑할 테이블 지정 가능 

## 2. DB 스키마 자동 생성 

- JPA에서는 DDL을 앱 실행 시점에 자동 생성해준다. ( 운영 환경에서는 사용하면 안됨 )

  : JPA가 테이블 중심이 아닌 객체 중심임을 보여준다. 

- persistence.xml에서 아래와 같이 옵션이 설정되어 있어야 한다.

  ```xml
  <property name="hibernate.hbm2ddl.auto" value="create" />
  ```

여기서 value값에 옵션을 지정해주는데 옵션의 종류는 아래와 같다. 
- create : 기존테이블 삭제 후 다시 생성(DROP + CREATE)
- create-drop : create과 같으나 종료시전에 테이블 DROP
- update : 변경분만 반영 
- validate : 엔티티와 테이블이 정상 매핑되었는지만 확인
- none : 사용하지 않음을 의미


옵션에 따라 어플리케이션 실행 시 위와 같이 DDL이 생성되기 때문에 환경에 따라 철저히 옵션을 구분해서 아래와 같이 사용해야 한다. 

​
- 운영장비:  create, create-drop, update사용하면 안되고 validate  / none 사용
- 개발 초기:  create / update
- 어느정도 개발이 진행되었다면 : update / validate 

## 3. 필드와 컬럼 맵핑 (@ Column)

```java
Entity
public class Member {

    @Id
    private Long id;
    @Column(name="name")
    private String memberName;
    private Integer age;

    @Enumerated(EnumType.STRING)
    private RoleType roleType;  //varchar로 생성됨. 정해진 status값 같은 데 쓰면 됨
    @Lob
    private String description; //문자면 CLOB으로, 나머지는 BLOB으로 맵핑 됨.  
    @Transient
    private int temp;  // DDL 생성하지 않고 애플리케이션 내에서만 사용하게 됨 
```

### 1) @Column
- nullable : false,true ( DDL에서 not null constraint 걸어 주고 validation도 지원 ) 
- length : String에서 길이 제한 
- precision : BigDecimal처럼 엄청 큰 숫자를 사용하는 컬럼의 소수점을 지정해줄 때 사용

### 2) EnumType  쓸 때 주의 사항 

​기본이 ORDINAL이고 STRING으로 지정 가능한데 반드시 STRING으로 써야 한다.

ORDINAL은 enum의 순서 정보를, STRING은 enum의 이름을 DB에 저장하게 되는데,

ORDINAL을 쓰면 안되는 이유는 enum에서 값이 추가 됐을 경우에 DB에 기존에 있던 데이터와 앱 상에서 업데이트 된 enum의 순서에 대한 정보가 꼬이게 되어 버그 발생할 수 있기 때문이다. 

### 3) 기본 키 맵핑 전략
@Id

@GeneratedValue(strategy = GenerationType.{IDENTITY, TABLE, SEQUENCE, AUTO}

-> id에 대한 생성 전략은 크게 identity, table, sequence 3가지 이며 auto로 설정할 경우 properties파일에서 설정한 jpa의 dialect에 따라서 알아서 설정을 해준다. mysql은 IDENTITY, oracle은 SEQUENCE 이런 식으로.

- 1) IDENTITY 전략을 쓰면 커밋 시점이 아닌 em.persist() 시점에 즉시 INSERT 문을 실행하고 DB로부터 식별자를 리턴 받아온다. 그래서 IDENTITY 전략 쓰면 영속성 컨텍스트의 장점 중 하나인 '지연 쓰기' 기능 사용할 수 없으나 성능에 큰 영향은 없다.

- 2) SEQUENCE 전략을 쓰면 em.persist() 시점에 DB의 시퀀스로부터 next val을 받아와서 영속성 컨텍스트의 1차 캐시에 id값을 저장하게 되지만 INSERT문은 커밋 시점에 한 꺼번에 실행가능하다. 하지만 이 경우 persist마다 call next val을 해야 하는 성능 상의 문제가 있는데, allocationSize 설정을 통해 해결할 수 있다. 

---
참고자료 
- https://www.inflearn.com/course/ORM-JPA-Basic