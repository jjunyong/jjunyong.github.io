---
emoji: 🧢
title: '[Spring] Spring boot는 무엇을 해주는가? 스프링 부트를 쓰는 이유'
date: '2022-02-02 00:00:00'
author: jjunyong
tags: Spring
categories: Spring
---

Spring을 이용해서 개발을 시작한다고 할 때 대부분의 개발자들은 Spring boot를 이용할 것이다.
Spring boot를 활용하게 되면 Spring 사용 시 필요한 여러가지 ~~귀찮은~~ configuration들을 자동으로 설정해줄 뿐만 아니라 개발자비즈니스 로직 개발에 집중할 수 있도록 여러가지 기능을 제공한다.

## Spring boot란 무엇인가?

- 간략하게 정의하면 Spring boot는 Spring framework 을 더 쉽게 사용할 수 있게 해주는 framework로 보면 된다.
  Spring은 사용하기 위해 필요한 설정 들이 생각보다 복잡한데, Spring boot는 기본적으로 이러한 설정들을 모두 제공하기 때문에,
  개발자 입장에서는 초기 개발 환경을 셋팅하는 것이 매우 용이해진다.

- Spring boot 공식 문서는 다음과 같이 말한다.
  <br>
  > Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".

## Spring boot는 무엇을 해주는가?

### 1. Dependency 관리

- 스프링부트를 사용하면, dependency를 pom.xml 또는 build.gradle에 직접 추가 해주어햐 하는 Spring과 달리 spring-boot-starter-web를 추가하면
  기본적인 웹 개발에 필요한 dependency를 알아서 추가 해준다.

  ```xml
    <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    </dependencies>
  ```

- 그리고 dependency의 버전을 따로 작성해주지 않아도 사용 중인 스프링 부트 버전에 호환되는 dependancy로 자동관리 해준다.

### 2. Configuration

- **Auto Configuration**

  Spring boot에서는 @SpringBootApplication이라는 하나의 어노테이션을 통해 스프링 어플리케이션이 필요한 아래와 같은 설정을 알아서 해준다.

  - @ComponentScan

    : @Component, @Service, @Repository, @Controller 등의 어노테이션을 스캔하여 Bean으로 등록해 준다.

  - @EnableAutoConfiguration

    : External Libraries -> spring-boot-autoconfigure -> META_INF -> spring.factories에 존재하는
    사전에 정의한 라이브러리들 중 아래 조건을 만족시키는 것을 Bean으로 등록해 주는 어노테이션이다.

    ```java
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnWebApplication(type = Type.SERVLET)
    @ConditionalOnClass({ Servlet.class, DispatcherServlet.class, WebMvcConfigurer.class })
    @ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
    ```

- **편리한 Configuration**

  - Spring은 configuration 설정이 길 뿐만 아니라 어노테이션 및 빈 등록을 해주어야 한다.
    하지만 Spring boot에서는 application.yml 또는 build.gradle(또는 pom.xml)에 의존성을 한 줄 추가함으로써 해결 가능하다.
  - 가령 Thymeleaf를 Spring에서 사용한다고 하면 아래와 같은 설정이 필요하다.

    ```java
    @Configuration
    @EnableWebMvc
    public class MvcWebConfig implements WebMvcConfigurer {
      @Autowired
      private ApplicationContext applicationContext;

      @Bean
      public SpringResourceTemplateResolver templateResolver() {
        SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
        templateResolver.setApplicationContext(applicationContext);
        templateResolver.setPrefix("/WEB-INF/views/");
        templateResolver.setSuffix(".html");
        return templateResolver;
      }

      @Bean
      public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver());
        templateEngine.setEnableSpringELCompiler(true);
        return templateEngine;
      }

      @Override
      public void configureViewResolvers(ViewResolverRegistry registry) {
        ThymeleafViewResolver resolver = new ThymeleafViewResolver();
        resolver.setTemplateEngine(templateEngine());
        registry.viewResolver(resolver);
      }
    }
    ```

  - 그런데 Spring boot에서는 아래와 같이 build.gradle 파일에 의존성 하나만 추가 해주면 Thymeleaf를 사용 가능하다.
    ```gradle
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf
    ```

### 3. 편리한 배포 : 내장 Tomcat

Spring boot는 Spring과 달리 Tomcat을 내장하고 있기 때문에 war가 아닌 Jar파일 을 통해 간편하게 배포가 가능하다.

### 4. Devtools 제공

Spring Boot에서 제공하는 Devtools는 아래와 같은 기능 들을 통해 개발 생산성을 높여준다.

- Automatic Restart
  클래스 패스에 있는 파일이 변경될 때마다 어플리케이션을 자동으로 재시작 해주어 소스가 수정 후 개발자가 재실행하는 불필요한 과정을 줄여준다.
- Live Reload
  html, css, js와 같은 정적 자원이 수정되면 새로고침 없이 바로 적용되게 된다.
- Property Defaults
  Thymeleaf 등에서 사용하는 cache의 기본값을 false로 설정할 수 있다. 소스 수정 시 캐시로 인해 반영이 안 되는 것을 방지하기 위한 설정임

---

### 결론

Spring boot를 통해 개발하면 Spring으로 개발하는 것과 비교해 위와 같이 많은 장점이 있기 때문에, Spring의 원리를 파악했다면 Spring boot로 개발하는 것을 추천한다.
