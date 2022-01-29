---
emoji: 🧢
title: '[Spring] Autowired가 아닌 생성자 주입을 사용해야 하는 이유'
date: '2022-01-28 00:00:00'
author: jjunyong
tags: Spring
categories: Spring
---

Spring에서 의존관계 주입(Dependency Injection)을 할 때 @Autowired를 사용하여 주입하는 경우가 많은데,
스프링에서는 아래와 같이 그렇게 하지 말 것을 권고한다.

> **_Field injection is not recommended … Always use constructor based dependency injection in your beans_**

- DI를 하는 이유는 객체 내부에서 객체를 직접 생성하는 방식 보다 런타임 시 외부에서 생성한 객체를 인터페이스를 통해 넘겨받는 것이 더 느슨한 결합 방식이기 때문이다.

## DI 방법 3가지

### 1. Setter based injection (수정자 주입)

```Java
@Service
public class Controller {

  private Service service;

  public void setService(Service service){
    this.service = service;
  }

  public void run() {
    service.run();
  }
}
```

- 위와 같이 Setter를 통해 주입하는 방식의 경우 Controller 객체가 생성될 때 반드시 service가 초기화 되지 않아도 되기 때문에, NPE 발생 가능성이 존재한다.
- **그리고 생성자 주입과 필드 주입 방식은 '객체가 생성되는 시점'에서 순환 참조가 되는 지 여부를 확인할 수 있는 안전장치가 없다는 치명적인 단점도 존재한다.**

### 2. @Autowired를 통한 Field 주입

```Java
@Service
public class Controller {

  @Autowired
  private Service service;

  public void run() {
    service.run();
  }
}
```

- 의존하는 레퍼런스 변수에 @Autowired만 붙여주면 되기 때문에 매우 편리하긴 하지만, 수정자 주입이 가지고 있는 문제와 동일한 문제를 가진다.

### 3. Constructor based injection(생성자 주입)

```Java
@Service
public class Controller {

  private final Service service;

  @Autowired
  public Controller(Service service){
    this.service = service;
  }

  public void run() {
    service.run();
  }

}
```

<br>

> 결국 약간 귀찮더라도 Spring에서 생성자릍 통한 의존성 주입을 강력히 권장하는 이유는 에러 관점에서 훨씬 안전한 방식이기 때문이다.
> 생성자 주입 방식은 아래와 같은 장점을 지닌다.

### 생성자 주입 방식의 장점

- 의존성 주입을 받지 못해 NullPointerException이 뜰 일이 없다.
- 의존하는 객체의 변수를 final로 선언할 수 있다.
- 순환참조의 오류를 방지할 수 있다.
