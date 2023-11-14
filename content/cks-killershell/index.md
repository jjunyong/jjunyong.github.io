---
emoji: 🧢
title: '[CKS] Killer shell' 
date: '2023-11-14 21:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## Q1. 
You have access to multiple clusters from your main terminal through kubectl contexts. Write all context names into /opt/course/1/contexts, one per line.

From the kubeconfig extract the certificate of user restricted@infra-prod and write it decoded to /opt/course/1/cert.

## Q1 정답
- File /opt/course/1/contexts 가 모든 context를 포함하고 있는가
  ```bash
  k config get-contexts -o name > /opt/course/1/contexts
  ```
- File /opt/course/1/cert 가 cert를 포함하고 있는가
  - kubeconfig 파일의 cluster가 아닌 restricted@infra-prod의 user 의 cert내용을 base64 -d로 디코드하여 /opt/course/1/cert에 저장 

### Q2
Falco is installed with default configuration on node cluster1-node1. Connect using ssh cluster1-node1. Use it to:
- Find a Pod running image nginx which creates unwanted package management processes inside its container.
- Find a Pod running image httpd which modifies /etc/passwd.

Save the Falco logs for case 1 under /opt/course/2/falco.log in format: 
```time-with-nanosconds,container-id,container-name,user-name```
No other information should be in any line. Collect the logs for at least 30 seconds.
Afterwards remove the threads (both 1 and 2) by scaling the replicas of the Deployments that control the offending Pods down to 0.

### Q2 정답
- /opt/course/2/falco.log 존재하고 정확한 로그 포맷을 가지고 있어야 함
  - 먼저 /etc/falco/falco.yaml을 살펴보면 syslog에 falco의 로그가 저장되고 있음을 확인할 수 있다. 
  ```
  syslog_output:
    enabled: true
  ```
    - 따라서 /var/log/syslog 또는 journalctl -fu falco를 통해서 stdout으로 로그를 확인할 수 있다. 로그에서 확인된 문제가 되는 컨테이너 id를 찾는다.
    - `crictl pods -id 7a864406b9794` 명령으로 1,2번 컨테이너가 기동 중인 pod에 대한 정보를 얻는다. 
  - falco rule을 수정하여 문제의 포맷으로 로그가 나타나게 만들고, 나타나는 로그를 복사&붙여넣기로 로컬의 /opt/cousre/2/falco.log에 저장한다.
- 1번 deployment scaled down
  - `k -n team-blue scale deploy webapi --replicas 0`
- 2번 deployment scaled down
  - `k -n team-purple scale deploy rating-service --replicas 0`

### Q3
You received a list from the DevSecOps team which performed a security investigation of the k8s cluster1 (workload-prod). The list states the following about the apiserver setup:

Accessible through a NodePort Service
Change the apiserver setup so that:

Only accessible through a ClusterIP Service

### Q3 정답
- kube-apiserver의 yaml파일에서 아래 행을 주석 또는 삭제 처리 ( 수정 전 백업 필수 )
  - --kubernetes-service-node-port=31000
- 위 설정 후에도 `k delete svc kubernetes`를 해주어야 ClusterIP 타입으로 서비스가 재성성되게 된다. 

### Q4
There is Deployment container-host-hacker in Namespace team-red which mounts /run/containerd as a hostPath volume on the Node where it's running. This means that the Pod can access various data about other containers running on the same Node.

To prevent this configure Namespace team-red to enforce the baseline Pod Security Standard. Once completed, delete the Pod of the Deployment mentioned above.

Check the ReplicaSet events and write the event/log lines containing the reason why the Pod isn't recreated into /opt/course/4/logs.

### Q4 정답
- namespace label 설정
  - k edit ns team-red 해서 `pod-security.kubernetes.io/enforce: baseline # add` 추가
- pod delete 
  - k -n team-red delete pod container-host-hacker-dbf989777-wm8fc 
- /opt/course/4/log에 event log 저장
  - pod가 delete되면 rs가 다시 pod를 생성해주는데, 이게 왜 fail하는 지는 rs를 살펴봄으로써 알 수 있다.
    - k -n team-red describe rs container-host-hacker-dbf989777
  - 위 describe의 결과 중 `Events:`절의 내용을 /opt/course/4/logs에 저장한다.
    ```
    Warning  FailedCreate      2m2s (x9 over 2m40s)  replicaset-controller  (combined from similar events): Error creating: pods "container-host-hacker-dbf989777-kjfpn" is forbidden: violates PodSecurity "baseline:latest": hostPath volumes (volume "containerdata")
    ```

### Q5 : Kube-bench 문제로 하라는 대로 하면 됨
### Q6
- 아래 명령들을 이용해서 어떤 binary가 문제가 되는 지 찾으면 된다. 한 letter만 다른 경우가 있을 수 있으니 반드시 uniq 사용하기 
  - `sha512sum {binary file}`
  - `cat {file} | uniq`

### Q7 
The Open Policy Agent and Gatekeeper have been installed to, among other things, enforce blacklisting of certain image registries. Alter the existing constraint and/or template to also blacklist images from very-bad-registry.com.

Test it by creating a single Pod using image very-bad-registry.com/image in Namespace default, it shouldn't work.

You can also verify your changes by looking at the existing Deployment untrusted in Namespace default, it uses an image from the new untrusted source. The OPA contraint should throw violation messages for this one.

### Q7 정답
- gatekeeper의 crd를 살펴보기 
  - k get crd
- 이 중에 constraint만 따로 조회하기 
  - k get constraint
  - 그리고 그중에 blacklisting image와 관련이 있을 것 같은 constraint에 대해 살펴본다. 
    - k edit blacklistimages pod-trusted-images
      ```yaml
        apiVersion: constraints.gatekeeper.sh/v1beta1
        kind: BlacklistImages
        metadata:
        ...
        spec:
          match:
            kinds:
            - apiGroups:
              - ""
              kinds:
              - Pod
      ```
  - 살펴보면 모든 pod에 적용되게 되어 있으므로 constraintTemplate을 열고 수정한다. 
    - `not startswith(image, "very-bad-registry.com/")` 이 행을 rego에 추가
    - k edit constrainttemplates blacklistimages
      ```yaml
        apiVersion: templates.gatekeeper.sh/v1beta1
        kind: ConstraintTemplate
        metadata:
        ...
        spec:
          crd:
            spec:
              names:
                kind: BlacklistImages
          targets:
          - rego: |
              package k8strustedimages

              images {
                image := input.review.object.spec.containers[_].image
                not startswith(image, "docker-fake.io/")
                not startswith(image, "google-gcr-fake.com/")
                not startswith(image, "very-bad-registry.com/") # ADD THIS LINE
              }

              violation[{"msg": msg}] {
                not images
                msg := "not trusted image!"
              }
            target: admission.k8s.gatekeeper.sh
      ```
- 이제 `k run opa-test --image=very-bad-registry.com/image` 로 테스트해보면 OPA에서 막히는 걸 확인할 수 있다.

