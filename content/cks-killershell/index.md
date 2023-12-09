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

### Q8 : Secure K8S dashboard

The Kubernetes Dashboard is installed in Namespace kubernetes-dashboard and is configured to:

Allow users to "skip login"
Allow insecure access (HTTP without authentication)
Allow basic authentication
Allow access from outside the cluster
You are asked to make it more secure by:

Deny users to "skip login"
Deny insecure access, enforce HTTPS (self signed certificates are ok for now)
Add the --auto-generate-certificates argument
Enforce authentication using a token (with possibility to use RBAC)
Allow only cluster internal access

### Q8 정답
- k -n kubernetes-dashboard get pod,svc 로 살펴보기 
- service가 NodePort로 expose되어 있는 걸 위에서 확인하고 노드ip확인 후 
  - curl http://192.168.100.11:32520 로 접근됨을 확인 ( 즉, unsecure )
- k -n kubernetes-dashboard edit deploy kubernetes-dashboard 하여 secure하게 설정하기 
  ```yaml
      template:
        spec:
          containers:
          - args:
            - --namespace=kubernetes-dashboard  
            - --authentication-mode=token        # change or delete, "token" is default
            - --auto-generate-certificates       # add
            #- --enable-skip-login=true          # delete or set to false
            #- --enable-insecure-login           # delete
            image: kubernetesui/dashboard:v2.0.3
            imagePullPolicy: Always
            name: kubernetes-dashboard
  ```
  - k -n kubernetes-dashboard edit svc kubernetes-dashboard 를 통해 nodePort로 접근되지 않도록 ㅇservice 수정하기
    ```yaml
     spec:
      clusterIP: 10.107.176.19
      externalTrafficPolicy: Cluster   # delete
      internalTrafficPolicy: Cluster
      ports:
      - name: http
        nodePort: 32513                # delete
        port: 9090
        protocol: TCP
        targetPort: 9090
      - name: https
        nodePort: 32441                # delete
        port: 443
        protocol: TCP
        targetPort: 8443
      selector:
        k8s-app: kubernetes-dashboard
      sessionAffinity: None
      type: ClusterIP                  # change or delete
    status:
      loadBalancer: {}
    ```
### Q9 : AppArmor
Some containers need to run more secure and restricted. There is an existing AppArmor profile located at /opt/course/9/profile for this.

Install the AppArmor profile on Node cluster1-node1. Connect using ssh cluster1-node1.

Add label security=apparmor to the Node

Create a Deployment named apparmor in Namespace default with:
- One replica of image nginx:1.19.2
- NodeSelector for security=apparmor
- Single container named c1 with the AppArmor profile enabled

The Pod might not run properly with the profile enabled. Write the logs of the Pod into /opt/course/9/logs so another team can work on getting the application running.

### Q9 정답
- 이 문제는 mockexam의 AppArmor문제와 크게 다르지 않은데 단지 로컬 환경에서 node1로 profile파일을 옮겨줘야 하기에 scp 명령을 활용하거나 copy&paste해야 한다.
  - ```scp /opt/course/9/profile cluster1-node1:~/```
- 모든 작업이 끝난 후 로그를 로컬 파일에 저장 
  - k logs apparmor-85c65645dc-jbch8 > /opt/course/9/logs

### Q10 : Container Runtime Sandbox gVisor
Team purple wants to run some of their workloads more secure. Worker node cluster1-node2 has container engine containerd already installed and it's configured to support the runsc/gvisor runtime.

Create a RuntimeClass named gvisor with handler runsc.

Create a Pod that uses the RuntimeClass. The Pod should be in Namespace team-purple, named gvisor-test and of image nginx:1.19.2. Make sure the Pod runs on cluster1-node2.

Write the dmesg output of the successfully started Pod into /opt/course/10/gvisor-test-dmesg.

### Q10 Answer
- 아래 Runtimeclass 생성 후 apply
  ```yaml
  apiVersion: node.k8s.io/v1
    kind: RuntimeClass
    metadata:
      name: gvisor
    handler: runsc
  ```
- k -n team-purple run gvisor-test --image=nginx:1.19.2 --dry-run=client -o yaml > 10_pod.yaml 를 하여 만들어진 파일 기반으로 2개 행을 아래처럼 추가하여 apply
  ```yaml
  apiVersion: v1
  kind: Pod
  metadata:
    creationTimestamp: null
    labels:
      run: gvisor-test
    name: gvisor-test
    namespace: team-purple
  spec:
    nodeName: cluster1-node2 # add
    runtimeClassName: gvisor   # add
    containers:
    - image: nginx:1.19.2
      name: gvisor-test
      resources: {}
    dnsPolicy: ClusterFirst
    restartPolicy: Always
  status: {}
  ```
- dmesg 로 pod가 gvisor sandbox가 적용되었는 지 확인 후 output으로 로그 저장한다.
  - k -n team-purple exec gvisor-test -- dmesg > /opt/course/10/gvisor-test-dmesg₩`

### Q11 : Secrets in ETCD

There is an existing Secret called database-access in Namespace team-green.
Read the complete Secret content directly from ETCD (using etcdctl) and store it into /opt/course/11/etcd-secret-content. Write the plain and decoded Secret's value of key "pass" into /opt/course/11/database-password.

### Q11 정답
- kube-apiserver.yaml 파일에서 etcd 관련된 cert 설정을 찾는다.
- 이를 활용하여 etcdctl 명령어를 써서 값을 얻어와야 한다. (kubernetes.io 참고)
  - ETCD 는 `/registry/{type}/{namespace}/{name}` 경로에 데이터를 저장한다. 
```
- ETCDCTL_API=3 etcdctl \
--cert /etc/kubernetes/pki/apiserver-etcd-client.crt \
--key /etc/kubernetes/pki/apiserver-etcd-client.key \
--cacert /etc/kubernetes/pki/etcd/ca.crt get /registry/secrets/team-green/database-access
```
  - 이 결과를 /opt/course/11/etcd-secret-content에 저장한다.
- 위에서 얻은 secret의 결과로부터 password를 base64 decode하여 /opt/course/11/database-password에 저장한다. 

### Q12

You're asked to investigate a possible permission escape in Namespace restricted. The context authenticates as user restricted which has only limited permissions and shouldn't be able to read Secret values.
<br>
Try to find the password-key values of the Secrets secret1, secret2 and secret3 in Namespace restricted. Write the decoded plaintext values into files /opt/course/12/secret1, /opt/course/12/secret2 and /opt/course/12/secret3.