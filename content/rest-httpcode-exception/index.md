---
emoji: 😌
title: '[REST API] HTTP Status Code 제어와 예외 해들링(Exception handling)'
date: '2022-02-04 00:00:00'
author: jjunyong
tags: REST
categories: Web
---

## Http Status Code 제어

REST API를 통해 User를 생성하는 API를 만드는 상황을 가정해보자.
좀 더 나은 API 설계를 고려한다면 단순히 User를 생성만 하는 것에서 그칠 것이 아니라 요청자에게 response로 결과 데이터를 반환해주어야 할 것이다.
가령 사용자에게 요청 값을 반환해 주기 위해 ServletUriComponentsBuilder 라는 클래스를 사용할 수 있다.

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody User user){
    User savedUser = UserService.save(user);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(savedUser.getId())
        .toUri();

    return ResponseEntity.created(location).build();
}
```

<br>

이렇게 하면 클라이언트는 Header로부터 200을 받는 것이 아니라 201 created 값을 반환받을 수 있게 되며
header의 Key값 중 location값에서 POST의 URI value를 알 수 있다.

- 여기선 http://localhost:8080/users/10 이 될 것이다.

이렇듯 200 OK로만 보내는 것이 아니라 CRUD에 따라, 그리고 여러가지 상황에 따라 서로 다른 HTTP status code값으로 응답해주는 것이 좋고, location값을 반환 해 줌에 따라 클라이언트는 자기가 방금 생성한 user의 id값도 알 수 있게 되므로 자신이 생성한 user의 id를 서버에 물어보는 불필요한 traffic낭비를 방지할 수 있다.

- 참고로 HTTP status 코드는 대역대로 어떤 상태인지를 대략적으로 알 수 있다.

  - 2xx : 정상 동작( OK )

  - 4xx : 클라이언트의 잘못된 요청에 대한 것

  - 5xx : 서버의 문제

---

## 예외 핸들링

: @ResponseStatus, @ControllerAdvice, @RestControllerAdvice

​

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

---

참고자료 : https://yaboong.github.io/spring/2019/08/29/why-field-injection-is-bad/
