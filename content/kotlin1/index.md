---
emoji: 🧢
title: '[Kotlin] 변수, 타입, 연산자'
date: '2023-11-17 00:00:00'
author: jjunyong
tags:
categories: Java/Kotlin
---

## 변수

- var과 val
  - 자바에서는 불변해야 하는 변수에 final과 같은 키워드를 사용하지만, 코틀린에서는 변수에는 var, 상수에는 val을 사용한다.
- 자동 타입 지정
  - 그러나 초기화를 하지 않고 선언만 하는 경우에는 명시적으로 type을 줘야 한다.
- 초기화
- val 컬렉션에 element를 추가할 수 있다.
- <u>**모든 변수를 우선 val로 만들고 꼭 필요한 경우만 var로 선언한다.**</u>
- 자바의 long / Long 과 같은 구분이 없고 그냥 하나로 통일된다. 즉 primitive type, reference type의 구분이 따로 없고 boxing과 unboxing을 고려하지 않아도 되도록 kotlin이 내부적으로 알아서 처리한다.
- nullable
  - 자바는 Reference type은 null이 할당될 수 있지만 kotlin에서는 null이 들어갈 수 있는 변수라면 '타입?'를 사용함으로써 구분한다.

### 참고자료

- https://www.inflearn.com/course/lecture?courseSlug=java-to-kotlin
- https://github.com/lannstark/java-to-kotlin-starter-guide
