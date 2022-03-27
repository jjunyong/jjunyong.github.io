---
emoji: 🧢
title: '[AWS] AWS key값을 Jasypt를 이용해서 보호하자'
date: '2022-04-15 10:00:00'
author: jjunyong
tags: AWS Jasypt
categories: AWS
---

Spring boot 환경에서 AWS S3를 연동해서 사용하려고 하면, application.yml 또는 application.properties에 아
래와 같이 accessKey, secretKey값을 설정해줄 것이다.

```java
cloud.aws.credentials.accessKey=accessKey값
cloud.aws.credentials.secretKey=secretKey값
```

<br>

그런데 이렇게 설정을 하게 되면 AWS의 accessKey, secretKey값이 깃헙에 노출되는 문제가 발생한다. 

이미 나는 그걸 모르고 별일 없겠지라는 안일한 생각으로 깃헙에 코드를 푸시했다가 **이틀 만에 해킹(ㅠㅠ)** 당하는 일을 겪어야 했다.

~~이틀 만에 80 달러 치를 썼더라 해커놈 ㅡㅡ~~

그러니 반드시 Jasypt를 활용해서 AWS key값을 암호화해서 올리시길 바란다.

## Jasypt

: Java Simplified Encryption으로 암호화를 위한 Library이다. 보통 프로퍼티에 노출되는 중요 정보들을 암호화 해주는 용도로 사용한다.

### 1. 의존성 설정 ( build.gradle )

나는 gradle을 사용하기 때문에 아래와 같이 간단한게 jasypt를 사용하기 위한 의존성을 설정했다. 

```
dependencies {
	implementation 'com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.3'
}
```

### 2. Custom vm Option에 password 설정

jasypt를 이용해서 encrypt, decrypt를 실행 시 반드시 password를 설정해야 되는데, 이 password는 다른 사람이 알게되면 
결국 jasypt를 이용해서 복호화가 가능하므로 절대 외부로 노출되서는 안된다.

  **따라서 jvm option에 추가 해준다.** Intellij에서는 [Help]-[Edit custom VM Options] 에 아래행을 추가해주면 된다.
  ```java
  -Djasypt_password=password값
  ```
<br>

### 3. Config 클래스 설정 

의존성과 vm option 설정이 끝났다면 이제 코드를 작성해보자. 

- JasyptConfig 클래스를 @Configuration 로 만들어주고, Bean을 등록해준다. 

- bean name을 설정해서 jasypt가 application.properties 파일에서 bean을 참조할 수 있도록  설정한다.
- jvm option에서 설정한 jasypt_password값을 System.getProperty("jasypt_password") 명령을 통해 가져와서 password로 설정한다.

<br>


JasyptConfig.java
```java
@Configuration
public class JasyptConfig {

    private String encryptKey;

    @Bean(name = "stgOnyouEncryptor") //원하는 이름 아무거나
    public StringEncryptor stringEncryptor(){

        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        String jasyptPassword = System.getProperty("jasypt_password");

        config.setPassword(jasyptPassword);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setPoolSize("1");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");

        encryptor.setConfig(config);

        return encryptor;

    }
}
```
<br>

application.properties

```java
jasypt.encryptor.bean = stgOnyouEncryptor // JasyptConfig의 bean name과 일치해야함
```

이렇게 하면 jasypt를 위한 암호화 설정은 끝났다. 

### 4. 테스트 코드를 통해 암호화된 key값 얻기

아래와 같이 테스트 코드를 작성 후 실행하면 accessKey, secretKey에 대해서 'jasypt_password' 값으로 암호화 한 key값을 각각 얻을 수 있다.
```java
@SpringBootTest
public class JasyptConfigTest {

    @Test
    public void jasyptTest(){
        //given
        String accessKey = "accessKey값";
        String secretKey = "secretKey값";

        StandardPBEStringEncryptor jasypt = new StandardPBEStringEncryptor();
        String jasyptPassword = System.getProperty("jasypt_password");
        jasypt.setPassword(jasyptPassword);
        jasypt.setAlgorithm("PBEWithMD5AndDES");

        String encryptedAccessKey = jasypt.encrypt(accessKey);
        System.out.println("accessKey 암호화 내용: " + encryptedAccessKey);
        String decryptedAccessKey =  jasypt.decrypt(encryptedAccessKey);
        System.out.println("accessKey 복호화 내용: " + decryptedAccessKey);

        String encryptedSecretKey = jasypt.encrypt(secretKey);
        System.out.println("secretKey 암호화 내용: " + encryptedSecretKey);
        String decryptSecretKey =  jasypt.decrypt(encryptedSecretKey);
        System.out.println("accessKey 복호화 내용: " + decryptSecretKey);

        assertThat(accessKey, is(equalTo(decryptedAccessKey)));
        assertThat(secretKey, is(equalTo(decryptSecretKey)));

    }

}
```
<br>

System.out.println 해서 암호화된 key값을 얻은 뒤에 application.properties에 암호화된 값으로 설정하면 된다. 
이 값을 ENC로 감싸주면 알아서 jasypt가 알아서 복호화를 시켜준다고 하는데,(예를 들어 ENC(암호화값) 이런식으로..)
나는 그게 잘 안되서 그냥 암호화된 값을 application.properties에 입력하고, awsConfig 클래스에서 직접 복호화했다. 

```java
cloud.aws.credentials.accessKey=암호화된accessKey값
cloud.aws.credentials.secretKey=암호화된secretKey값
```
<br>

### 5. AWS config 클래스에서 적용 

나는 아래와 같이 AWS access, secret Key를 사용하는 쪽 코드에서 직접 복호화 해주었다.
만약에 ENC()로 감싸는 방법이 잘 적용된다면 '여기서부터' ~ '여기까지' 코드는 필요없이 jasypt에서 
accessKey, secretKey 값을 불러올 때 알아서 복호화된 값으로 불러와서 변수에 저장해줄 것이다.

```java
@Configuration
public class AwsS3Config {
    @Value("${cloud.aws.credentials.accesskey}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secretkey}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public AmazonS3Client amazonS3Client() {

        //여기서부터 
        StandardPBEStringEncryptor jasypt = new StandardPBEStringEncryptor();
        String jasyptPassword = System.getProperty("jasypt_password");

        jasypt.setPassword(jasyptPassword));
        jasypt.setAlgorithm("PBEWithMD5AndDES");

        String decryptAccessKey = jasypt.decrypt(accessKey);
        String decryptSecretKey = jasypt.decrypt(secretKey);

        //여기까지 
        BasicAWSCredentials awsCreds = new BasicAWSCredentials(decryptAccessKey, decryptSecretKey);
        return (AmazonS3Client) AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                .build();
    }
}

```
<br>

### 6. 빌드 시 옵션 추가

5번까지 진행하면 로컬에서 jasypt를 사용하기 위한 환경설정은 끝난다. 
그러나 빌드 하여 배포를 하려면 Intellij run시 jvm option 추가 해줬던 것처럼 jasypt_password 환경변수를 추가해주어야 한다.

나는 github에 푸시하면 Github action이 Dockerfile 읽어서 자동으로 빌드하게 설정해두었기 때문에 아래와 같이 dockerfile에 추가해주었다.

```bash
FROM openjdk:11-jdk
ARG JAR_FILE=build/libs/onyou-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
["sh", "-c", "java ${JAVA_OPTS} -jar /app.jar"]
```

그리고 docker 이미지 실행 시에 아래와 같이 입력해주면 환경변수로 jasypt password를 설정해 줄 수 있다. 

```
docker run -d -p 8080:8080 -e JAVA_OPTS=-Djasypt_password={패스워드} {도커이미지}:{태그}
```

---
지금까지 jasypt를 이용해서 소중한 aws key값을 보호하는 방법을 알아보았다. 
비단 aws key값 뿐만 아니라 DB 정보를 암호화하는데도 사용할 수 있을 것이다. 

---
### 참고자료 
- https://velog.io/@znftm97/Jasypt-%EC%82%AC%EC%9A%A9%EB%B2%95-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%ED%8C%8C%EC%9D%BC-%EC%95%94%ED%98%B8%ED%99%94
- https://junyharang.tistory.com/m/191
- https://blusky10.tistory.com/404
- https://kim-jong-hyun.tistory.com/50