---
emoji: 🔮
title: Spring Swagger 사용하여 API 문서 자동화하기
date: '2022-02-19 00:00:00'
author: jjunyong
tags: 블로그 github-pages gatsby
categories: Spring
---

Spring boot를 사용해서 사이드 프로젝트를 하던 중에 다른 개발자들과의 협업을 위해 API를 문서화시키는 것에 대한 필요성이 있었는데 Swagger를 사용하여 별도의 문서 작성없이 소스상의 간단한 설정을 통해 API 문서 자동화를 구현했다.

API 문서 자동화 방법은 아주 간단한데, Gradle의 경우 아래를 build.gradle의 dependenceis에 추가해주면 된다.

```
implementation group: 'io.springfox', name: 'springfox-boot-starter', version: '3.0.0'
```

Maven의 경우 아래를 pom.xml에 dependency에 추가해주면 된다.

```
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-boot-starter</artifactId>
  <version>3.0.0</version>
</dependency>
```

이렇게만 하면 되는데,  
Spring boot 2.6 버전을 쓰는경우에는 NPE가 발생할 수 있다.  
Spring에서 디폴트로 PathPattern-based matching을 사용하는데,
Springfox에서는 Ant-based path matcher가 사용되는 것으로 가정하고 있기 때문에 문제가 발생한다고 한다(https://stackoverflow.com/questions/70036953/springboot-2-6-0-spring-fox-3-failed-to-start-bean-documentationpluginsboot)

그래서 application.properties에 아래와 같은 설정을 추가해주니 에러가 해결되었다.

```
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

여기까지만 설정하면 해당 프로젝트의 모든 RestController가 API로 외부에 오픈된다.

http://{serviceRoot}/swagger-ui/ 경로를 통해 공개된 API를 테스트해 볼 수 있다.

---

참고자료
https://github.com/steve-developer/fastcampus-springboot-introduction/tree/master/09.%20swagger/sourceCode
https://techblog.woowahan.com/2597/
