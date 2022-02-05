---
emoji: 😌
title: '[REST API] HTTP Status Code 제어와 예외 해들링(Exception handling)'
date: '2022-02-04 00:00:00'
author: jjunyong
tags: REST
categories: WEB
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
        .buildAndExpand(savedUser.ge
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

> 이와 같이 REST API 설계 시 다양한 Http status code 를 활용하여 상황에 맞는 response로 요청자에게 응답해주는 것이 보다 나은 API를 만들기 위해
> 매우 중요한 부분이다.

---

## 예외 핸들링

: **@ResponseStatus, @ControllerAdvice(+@RestControllerAdvice)**

REST API에서 request에 대한 예외가 발생 시 핸들링 하는 방법에 대해서 알아보자.

아래와 같이 로직 처리 시 user가 존재하지 않을 때 UserNotFoundException을 throw하도록 하고,

```java
if(user == null){
    throw new UserNotFoundException(String.format("ID[%s] not found",id));
}
```

UserNotFoundException 클래스를 따로 만들어 준다.

```java
public class UserNotFoundException extends RunTimeException{
    public UserNotFoundException(String message){
        super(message);
    }
}
```

<br>

이렇게 구현 후 클라이언트에서 http://localhost:8080/users/1000 를 다시 호출하면,

500 Internal server error와 함께 message, trace값들을 response받을 수 있는데 이 때 2가지 문제가 있다.

- **trace값에 문제가 되는 코드들이 그대로 노출되는 보안 상의 이슈가 있을 수 있다.**
- **정확히 어떤 에러인지에 대한 HTTP 코드를 명확하게 해줄 필요가 있다.**

이 2가지 문제를 해결하기 위해 먼저 상황에 맞게 HTTP code를 반환하도록 설정해보자.
위의 경우는 서버 측의 문제라기 보다는 클라이언트가 없는 사용자를 잘못 요청한 경우에 해당 함으로 Exception클래스를 아래와 같이 바꿔서 404 Not Found로 response 해주도록 변경하자. 이렇게 하면 클라이언트가 없는 user를 요청했을 때

> 404, ID[1000] Not Found

로 응답받게 되는 것을 확인할 수 있다.

### @ResponseStatus 사용

```java
@ResponseStatus(HttpStatus.NOT_FOUND) // 404 NOT FOUND
public class UserNotFoundException extends RunTimeException {

  public UserNotFoundException(String message) {
    super(message);
  }
}
```

<br>
 
이렇듯 @ResponseStatus 를 사용하면 원하는 예외 상황에 대해서 HTTP 상태코드와 error message를 설정하는 것이 가능하다. 그러나 각 예외 상황에 대해서 예외클래스를 설정해주어야 한다는 점, 그리고 response의 payload를 변경할 수 없다는 한계가 있다.

### @ControllerAdvice(@RestControllerAdvice) 사용

@RestController + @ControllerAdvice인 @RestControllerAdvice 어노테이션을 사용하여 예외처리하는 방법에 대해서 알아보자. 이 방법은 Spring5에서 가장 많이 사용되고 있는 방법이다.

exception 패키지 아래에 GloabalExceptionHandler와 ErrorResponse 클래스를 아래와 같이 설정하자.

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<Object> handleAllExceptions(Exceptions ex, Webrequest request){
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            LocalDateTime.now(), ex.getMessage(), request.getDescription(false));
        return new ResponseEntity(exceptionResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public final ResponseEntity<Object> handleUserNotFoundExceptions(Exceptions ex, Webrequest request){
        ExceptionResponse exceptionResponse = new ExceptionResponse(
            LocalDateTime.now(), ex.getMessage(), request.getDescription(false));
        return new ResponseEntity(exceptionResponse, HttpStatus.NOT_FOUND);

}
```

<br>

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
  private final LocalDateTime timestamp;
  private final String message;
  private final String details;
}
```

<br>

이렇게 하게 되면 GlobalExceptionHandler가 어플리케이션 전역에서 발생하는 예외상황에 대해서 예외처리를 하게 되고, 개발자 입장에서는 예외처리하고자 하는 케이스가 늘어날 때마다 해당 클래스에 메소드만 UserNotFoundExceptions 메소드와 같이 추가해주면 된다.

> 만약에 설정되지 않은 예외가 발생 시 handleAllExceptions메소드가 500으로 response해주게 될 것이다.

그리고 ErrorReponse 클래스를 설정함으로써 @ResponseStatus만 사용했던 때와 달리 reponseBody를 커스터마이징 할 수 있게 되었을 뿐만 아니라 trace가 response에 노출되던 보안상의 이슈까지 극복할 수 있게 되었다.

> 만약에 trace를 response해주고 싶은 예외상황이 있다면 해당 메소드에서만 응답하도록 설정해주면 될 것이다.

---

참고자료

- https://mangkyu.tistory.com/204, https://mangkyu.tistory.com/205

- https://github.com/MangKyu/InterviewSubscription/tree/master/src/main/java/com/mangkyu/employment/interview/erros

- https://bcp0109.tistory.com/303

- https://github.com/edowon/restful-web-service/blob/master/src/main/java/com/example/restfulwebservice/user/UserNotFoundException.java
