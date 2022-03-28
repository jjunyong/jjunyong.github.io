---
emoji: 🧢
title: '[Java] 어노테이션이란(Annotation)? 커스텀 어노테이션을 만들어 보자'
date: '2022-02-17 22:13:33'
author: jjunyong
tags: Java
categories: Java
---

## 어노테이션이란 무엇인가?

어노테이션은 자바에서 compile, run타임 시 코드를 어떻게 처리할 것인 지에 대한 **메타데이터**라고 볼 수 있다.

- 어노테이션의 목적
   - 컴파일러에게 문법 에러를 체크하기 위한 정보 제공 (ex. @Override )
   - 개발 툴에서 코드를 자동으로 생성할 수 있는지 정보 제공
   - 런타임 시 특정 기능을 실행하기 위한 정보 제공 ( ex. @Controller)




---

## 커스텀 어노테이션 만들기

- 선언

아래와 같이 MyAnnotation을 간단하게 생성할 수 있다. 

```java
public @interface MyAnnotation { 
}
```

- Element 멤버
  - 외부의 값을 입력받을 수 있게 하는 역할
  - element 선언
  
  아래와 같은 형태로 element 타입, 이름, default값을 설정하여 선언할 수 있다.
  물론 default 값은 생략 가능하다. 

  ```java
  public @interface MyAnnotation { 
    타입 elemantName() default 값 
  }

  즉, 아래와 같이 만들 수 있다는 것이다.

  ```java
  public @interface MyAnnotation { 
    String name() default "hello"
  }
  ```

  그리고 이 어노테이션을 외부에서 쓸 때, 아래와 같이 element값을 지정할 수 있다.
  ```java
  @MyAnnotation(name="Goodbye")
  ```

- 기본 element : value

어노테이션에는 value라는 기본 element가 존재하며 아래와 같이 설정할 수 있다.

```java
public @interface MyAnnotation { 
  String value();
  String name() default "hello"
}
```
 이 element를 선언하게 되면 어노테이션이 값을 하나만 전달 받았을 때는 value에 값이 저장되게 된다.
```java
@Myannotation("main")
```
위에서 main은 value에 저장된다. 단 2개 이상의 속성을 기술 할 때는 value 값도 지정해줘야 한다. 

- 어노테이션 적용 대상 설정하기

어노테이션을 적용할 수 있는 대상은 TYPE(클래스, 인터페이스, enum), ANNOTATION_TYPE, FIELD, CONSTRUCTOR, METHOD, LOCAL_VARIABLE, PACKAGE 와 같이 다양하다. 
이 중 @Target이라는 어노테이션을 통해 @MyAnnotation이 어떤 경우에 한해서 적용될 수 있는 지를 설정할 수 있다.

가령, 아래와 같이 설정하면 클래스, 인터페이스, enum, 멤버변수, 메소드에만 적용 가능한 어노테이션이 된다.

```java
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
public @interface MyAnnotation { 
  String value();
  String name() default "hello"
}
```