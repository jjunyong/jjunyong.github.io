---
emoji: 🧢
title: '[Error] Getter가 없어서 발생하는 JSON Serialize 에러'
date: '2022-03-27 13:50:04'
author: jjunyong
tags: api
categories: Error
---

Type definition error: [simple type, class stg.onyou.service.CursorResult]; nested exception is com.fasterxml.jackson.databind.exc.InvalidDefinitionException: No serializer found for class stg.onyou.service.CursorResult and no properties discovered to create BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS) (through reference chain: stg.onyou.model.network.Header[\"data\"])",

RestController에서 return 시 객체를 json으로 serialize하는데, 이 때 객체의 멤버 중에 Getter가 없는 멤버 변수가 있어서 발생한 에러이다. 

간단하게 Getter를 직접 설정해주거나,

아니면 @Getter 어노테이션만 추가해주면 해결된다. 
