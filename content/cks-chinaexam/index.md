---
emoji: 🧢
title: '[CKS] 실제 기출' 
date: '2023-11-24 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## 1. Kube-bench 문제 
문제에서 kube-bench를 실행 후 도출되는 아래 취약점에 대해서 조치하라는 문제
- kube api server 취약점
  - Ensure --authorization-mode argument is not set to AlwaysAllow
  - Ensure --authorization-mode includes Node, RBAC
  - Ensure --insecure-bind-address argument is not set
- kubelet 취약점
  - Ensure anonymous-auth argument is set to false
  - Ensure --authorization-mode argument is not set to AlwaysAllow
- etcd 취약점
  - Ensure --client-cert-auth argument is set to true

### 정답
- kube api server 조치 
  - `--authorization-mode=Node,RBAC` 로 설정
  - `--insecure-bind-address=0.0.0.0` 로 되어 있는 행 삭제
- kubelet 조치 
  - /var/lib/kubelet/config.yaml 파일에서 아래와 같이 설정
    - anonymous-auth false로 설정
      ```
      authentication:
        anonymous:
          enabled: false
      ```
    - authorization-mode Webhook으로 설정
      ```
        authorization:
          mode: Webhook
      ```
  - `systemctl daemon-reload`, `systemctl restart` 해주기
- etcd 조치
  - /etc/kubernetes/manifests/etcd.yaml에서 아래와 같이 설정
    - `--client-cert-auth=true`

## 2. ServiceAccount 문제
Your organization's security policies include:
- serviceaccount does not automatically mount API credentials
- serviceaccount name must end with "-sa"

Listing file `/cs/sa/pod1.yaml`. The pod specified in yaml cannot be scheduled due to an error specified in serviceaccount.

Please complete the project:
- 1. Create new serviceaccount named `backend-sa` in the existing namespace `qa` to ensure that this serviceaccount does not automatically mount API credentials.
- 2. Use `/cs/sa/pod1.yaml` to create a pod
- 3. Finally, clean up any unused serviceaccounts in namespace `qa`

### 정답
- 1. `k create sa backend-sa -n qa --dry-run=client -o yaml > 2.yaml`
- 2. 2.yaml에 아래와 같이 automountServiceAccountToken만 추가해주고 apply 
  ```
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: backend-sa
    namespace: qa
  automountServiceAccountToken: false 
  ```
- 3. /cs/sa/pod1.yaml을 vi로 열고 serviceAccountName만 backend-sa로 수정 후 apply
- 4. k get pod -o yaml -n qa | grep "serviceAccount:" 를 해서 조회되지 않는 serviceaccount 인 test01을 삭제한다.

## 3. Network Policy
A default-deny network policy avoids accidentally exposing a pod in a namespace that does not define any other Networkpolicy.
<br>
Create a new default DenyPolicy named `denypolicy` in namespace `testing` for all traffic of type ingress+Egress.

- This new NP must deny all Ingress+Egress traffic in namespace `testing`.
- The newly created default Deny network policy application is matched to all pods running in namespace testing. 

### 정답
- 기본 NP 만들기
  - 공식 doc에서 default deny에 대한 템플릿 가져와서 name과 namespace 만 지정해주면됨 
    ```
      apiVersion: networking.k8s.io/v1
      kind: NetworkPolicy
      metadata:
        name: denypolicy
        namespace: testing
      spec:
        podSelector: {}
        policyTypes:
        - Ingress
        - Egress
    ```

## 4. RBAC
The role bound to the pod's serviceaccount grants over-loose permission. Complete the following item to reduce the permission set.

An existing Pod named `web-pod` is already running in namespace `db`.
Edit the existing Role bound to the serviceaccount `service-account-web` to allow only get operations on resource type of services.
Create a role `role-2` in namespace `db` and only allow new role to perform delete operations on resource type of namespaces.
Create a new RoleBinding named `role-2-binding`. Bind the newly created Role to the Pod's serviceaccount

Note: Do not delete existing rolebinding

### 정답
- `service-account-web`과 bound되어 있는 `role-1`을 services 만 get할 수 있도록 수정한다. ( k edit role )
- `db` namespace에 `role-2`를 생성하고 namepsaces만 delete할 수 있도록 생성한다.
- `role-2-binding`이라는 새로운 rolebinding을 생성하여 `role-2`와 `service-account-web`을 연결시킨다.
  - `k create rolebinding role-2-binding --role=role-2 --serviceaccount=service-account-web -n d`

## 5. K8S audit
Enable audit logging in cluster. To do this, enable the log backend and ensure that:
- The logs are stored in /var/log/kubernetes/audit-logs.txt
- Logs file can be retained for 10days
- Retain up to 2 old audit log files

/etc/kubernetes/logpolicy/sampolepolicy.yaml provides the basic strategy. It specifies only what is not recorded.
Note: The base policy is located on the master node of the cluster.

Edit and expand basic strategies to record: 
- RequestResponse level, persistentvolumes change
- configmaps change to request body in namespace `front-apps`
- Changes to configmap and secret in all namespaces at the metadata level

In addition, add a comprehensive rule to record all other requests at the Metadata level.
Note: Dont' forget to apply the modified policy.  
### 정답
- kube-apiserver의 yaml파일을 백업해두고 audit enable 및 설정을 문제대로 진행한다. 
  ```yaml
    - --audit-policy-file=/etc/kubernetes/logpolicy/samplepolicy.yaml
    - --audit-log-path=/var/log/kubernetes/audit-logs.txt
    - --audit-log-maxage=10
    - --audit-log-maxbackup=2
  ```
- kube-apiserver yaml파일에서 volumes과 volumeMount를 설정한다. 
  ```yaml
  volumeMounts:
    - mountPath: /etc/kubernetes/logpolicy/samplepolicy.yaml
      name: audit
      readOnly: true
    - mountPath: /var/log/kubernetes/
      name: audit-log
      readOnly: false
  ```

  ```yaml
  volumes:
  - name: audit
    hostPath:
      path: /etc/kubernetes/logpolicy/samplepolicy.yaml
      type: File

  - name: audit-log
    hostPath:
      path: /var/log/kubernetes/
      type: DirectoryOrCreate
  ```
- 이와 같이 설정 후 kube-apiserver가 안 뜰 수 있음 `systemctl daemon-reload`, `sytemctl restart kubelet`를 해주어야 함
- 마지막으로 `tail /var/log/kubernetes/audit-logs.txt` 명령으로 정상적 auditing되는 지 검증한다. 

- basic strategy로 주어진 yaml 파일에 3가지 record 요구조건에 해당 하는 정책들을 doc을 참고하여 추가한다. 
  ```yaml
      - level: RequestResponse
        resources:
        - group: ""
          resources: ["persistentvolumes"]
      - level: Metadata
        resources:
        - group: "" # core API group
          resources: ["secrets", "configmaps"]
      - level: Request
        resources:
        - group: "" # core API group
          resources: ["configmaps"]
        namespaces: ["kube-system"]

  ```
  - 단, 마지막에 catch-all rule까지 추가해주어야 정답이다. 
    ```yaml
    # A catch-all rule to log all other requests at the Metadata level.
    - level: Metadata
      # Long-running requests like watches that fall under this rule will not
      # generate an audit event in RequestReceived.
      omitStages:
        - "RequestReceived"
    ```

## 6. Create a Secret
Get the contents of an existing secret named `db1-test` in namespace `istio-system`
Store the username field in the name `/cs/sec/user.txt` file and store the password in `/cs/sec/pass.txt` file.

Note : Do not use or modify created files in the following steps, you can create new temporary files if needed.

Create a new secret named `db2-test` in `istio-system` namespace as follows:
```
username: production-instance
password: KvLftKgs4aVH
```

Finally, create a new pod, it can access secret `db2-test` via volume
- name : `secret-pod`
- namespace: `istio-system`
- container name: `dev-container`
- image : `nginx`
- volume name: `secret-volume`
- mounting path: `/etc/secret`

### 정답
- `db1-test1` secret에서 username, password를 추출 후 base64로 디코딩된 결과를 각각의 파일에 저장한다.
  - `k get secret db1-test -n istio-system -o=jsonpath='{.data.username}' | base64 -d > /cs/sec/user.txt`
  - `k get secret db1-test -n istio-system -o=jsonpath='{.data.password}' | base64 -d > /cs/sec/pass.txt`
- `db2-test` secret 생성하기 
  - `kubectl create secret generic db2-test -n istio-system --from-literal=username=production-instance --from-literal=password=KvLftKgs4aVH`
- pod에 `db2-test` 을 secret 문제의 조건대로 volume mount하여 생성하기
  - 아래와 같이 작성 후 apply
  ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: secret-pod
      namespace: istio-system
    spec:
      containers:
      - name: dev-container
        image: nginx
        volumeMounts:
        - name: secret-volume
          mountPath: "/etc/secret"
          readOnly: true
      volumes:
      - name: secret-volume
        secret:
          secretName: db2-test
  ```

## 7. Dockerfile
- Analyze and edit the given Dockerfile `/cks/docker/dockerfile` ( based on ubuntu: 16.04 image ), and fix two instructions that have prominent security/best practices issues in the file
- Analyze and edit the given manifest file `/cs/docker/deployment.yaml`
  and fix two fields that have prominent security/best practices issues in the file

  > Note: Do not add or remove configuration settings. simply modify the existing configuration settings so that there is no more secruity/best real money problem with both of the above existing settings.

  > Note: If you need a non-privileged user to exeute any project, please use the user `nobody` with user ID `65535`, just modify it, no need to create it.


### 정답
- 1. /cks/docker/dockerfile 부터 살펴보기
    - `FROM ubuntu:latest` -> `FROM ubuntu:16.04`로 수정
    - 2번째 USER 를 root -> nobody로 변경
    - `sudo docker build .`
- 2. /cs/docker/deployment.yaml 살펴보기
  - pod쪽의 label을 deployment의 selector.matchLabels에 맞게 수정 
    - run: couchdb -> app: couchdb로 수정
  - securityContext의 capability 내역 중 'CAP_SYS_ADMIN'을 삭제

## 8. gVisor
The cluster uses containerd as the CRI runtime. containerd's default runtime handler is runc.
container is ready to support additional runtime handler runsc `gVisor`

- Create a RuntimeClass named `untrusted` using an existing runtime handler named `runsc`.
Update all pods in namespace `server` to run on gVisor. 
<br>
You can do this at /cks/gVisor/rc. Find a list of templates in yaml

### 정답
- runtimeclass 생성
  ```yaml
  apiVersion: node.k8s.io/v1
  kind: RuntimeClass
  metadata:
    name: untrusted
  handler: runsc
  ```
- `server` namespace 내에 모든 deployment을 edit하여 runtimeclass 설정
  - spec.template.spec.runtimeClassName을 설정
  - k edit deploy busybox-run -n server 
    ```yaml
      spec:
        runtimeClassName: untrusted ## 이행 추가
    ```
## 9. Container security
### 9-1. 
Best practice is to design containers as stateless and immutable.

- Check the pods running in namespace `production` and remove any non-stateless or immutable pods.
- Use the following strict interpretations of statelessness and immutability.
  - A container of pods capable of storing data within a container must be considered stateless.
  - Privileged pods configured to be of any kind must be considered stateless and immutable.

### 정답
- privileged : true로 설정된 pod와 hostPath로 volume이 잡힌 pod를 모두 삭제한다. 

### 9-2.
Modify the deployment `secdep` in the `sec-ns` namespace as follows:
- First, start the container with a user id of 30000 
- Second, do not allow a process to get privileges beyond its parent process ( allowPrivilegeEscalation is prohibited )
- Third, load the container's root file system in a read-only manner( read-only permission to the root file )

### 정답
- k edit deploy secdep -n sec-ns 를 해서 
  - pod레벨에서 설정 :  `spec.securityContext.runAsUser: 30000`으로 설정
  - 존재하는 모든 컨테이너에 대해 아래 내용 설정
    - 컨테이너 레벨에서 설정 :  `spec.containers.securityContext.allowPrivilegeEscalation: false` 로 설정
    - 컨테이너 레벨에서 설정 :  `spec.containers.securityContext.readOnlyRootFilesystem: true`로 설정 

## 10. Network policy
Create a NetworkPolicy called `pod-restriction` to restrict access to pod `product-service` running in namepsace `dev-team`.
Allow only the following pods to connect to `product-service` pod
- All pod from namespace `qaqa`
- pod with label `environment:testing` located in any namespace

### 정답
아래와 같이 구성하면 된다. from 절이 2개 있으면 2개 조건이 or 되고, from절 하나에 2개의 조건이 들어가면 조건이 서로 and처리되는 것으로 이해하면 됨. 
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pod-restriction
  namespace: dev-team
spec:
  podSelector:
    matchLabels:
      environment: testing
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: qaqa
    - from:
       - namespaceSelector: {}
         podSelector:
           matchLabels:
             environment: testing
```
## 11. Trivy 
Detect severely vulnerable images used by pods in namespace `kamino` using the Trivy open source container scanner
Find images with High and Critical serverity vulnerabilities and remove pods that use these images
- Note: Trivy is installed only on the master node of the cluster and is not available on the working node.
You have to switch to the master node of the cluster to use Trivy. 

### 정답
- kamino namespace에 존재하는 모든 pod의 Image 리스트 추출
- `trivy image --severity HIGH,CRITICAL {이미지명}` 으로 vulnerable한 이미지 찾아서 해당 pod 삭제 

## 12. Apparmor
Apparmor is enabled on `node02` of the cluster's working node. The platform apparmor configuration file already exists, but has not been implemented. 
<br>
On `node02` of the cluster, implementation is located in /etc/apparmor.d/nginx_apparmor is existing Apparmor configuration file. 
- Edit in `/cs/KSSH00401/nginx-deploy.yaml` file to apply the apparmor configuration file.
- Finally, apply the mmanifest file and create the pod specified it. 
<br>

  > Please note that during the test, apparmor is indicated on the working node, so you need to ssh to the working node written at the beginning. 
  > In an analog environment, you need ssh to node02 to work. 

### 정답
- 1. ssh to node02
- 2. `apparmor_parser -q /etc/apparmor.d/nginx_apparmor`
  - profile명 알아내고 aa-status로 해당 profile 잘 로드되었는지 확인
- 3. `/cs/KSSH00401/nginx-deploy.yaml`의 deployment definition 파일에서 pod의 annotation에 `container.apparmor.security.beta.kubernetes.io/<container_name>: <profile_ref>` 내용 추가
- 4. k apply -f /cs/KSSH00401/nginx-deploy.yaml


## 13. Falco & sysdig
Use the runtime detction tool to detect frequency generation and execution exception selections in a single pod `tomcat123` container.
<br>
Use the tool to analyze for at least 30 seconds. Use the filter to check the generated and executed process, write the event to the `/opt/KSR00101/incidents/summary` file, which contains the detected events, in the following format: `timestamp.uid,username,processName`.

### 정답
- Sysdig 사용 권장
  - sysdig -l | grep {time, user, proc, name} 등의 명령으로 output 시 사용할 변수명을 파악할 수 있음
  - crictl info | grep sock 
- Falco 
  - kubectl describe tomcat123으로 container id 알아내기 
  - /etc/faloco/falco.yaml에서 `file_output.enabled: true`, `file_output.filename`의 경로를 확인하기
    - 여기서 수정이 발생하면 `daemon-reload`, `systemctl restart falco`를 수행해준다. 
  - `%evt.time,%user.uid,%proc.name`
  - 결과를 output으로 임의의 node02 의 특정 경로에 출력한 후 해당 로그를 local의 `/opt/KSR00101/incidents/summary`에 붙여넣어야 할 듯하다. 

## 14. TLS
strengthen kube-apiserver security configuration through TLS, requirements: 
- kube-apiserver is not allowed except version TLS13 and above. 
- Cipher suite is `TLS_AES_128_GC_SHA256`

Enhance ETCD security configuration with TLS, requirements: 
- cipher suite `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`

### 정답
- kube-apiserver 강화
  - kube-apiserver.yaml파일의 command에 아래 내용 2개 추가
    - `- --tls-min-version=VersionTLS13`
    - `- --tls-cipher-suites=TLS_AES_128_GC_SHA256`
- etcd 강화
  - etcd.yaml파일의 command에 `- --ciper-suites=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`행 추가
    - kube-apiserver와 달리 'tls-'가 없음에 주의
- `systemctl daemon-reload`, `systemctl restart kubelet`

## 15. Enabling API SERVER authentication
Kubernetes API server for cluster created by kubeadm. For testing purposes, temporary configuration allows unauthenticated and unauthorized access, granting anonymnous user `cluster-admin` access.
<br>
Reconfigure the kubernetes API server for cluster. Ensure that only authenticated  and authorized REST requests are allowed. 
- Use authorization mode 'Node, RBAC' and Access Controller 'NodeRestriction'. 
- Delete the `system:anonymous` Clusterrolebinding to clean up. 
<br>

  > Note : all kubectl configuration environments/files are also configured to use unauthenticated and unauthorized access. You don't have to change it. Note,  however, that once the cluster is secured, the configuration of kubectl will not work. You can use the cluster's original kubectl configuration file `/etc/ kubernetes/admin.conf` on the master node of the cluster. Ensure that authenticated authorization reqeusts are still allowed. 

In the simulation environment, the script to initialize this problem is b.sh 

### 정답
- kube-apiserver.yaml 파일 수정하기
  - `- --authorization-mode=Node,RBAC` 로 수정
  - `- --enable-admission-plugins=NodeRestriction`으로 수정 
- `system:anonymous` clusterrolbinding 삭제하기 
- 위 작업이 끝난 뒤, 그냥 k get pod시엔 제한되고, master노드에서 `k get pod -A --kubeconfig /etc/kubernetes/admin.conf`를 실행했을 때 정상적으로 pod가 조회되면 성공

## 16. ImagePolicyWebhook : container image scanning
The container mirroring scanner is set up on the cluster, but it is not fully integrated into the cluster's configuration.
After completion, the container mirror scanner should scan and reject the use of vulnerable mirrors. 
<br>
> Note: You must complete the entire test on the matser node of the cluster, and all services and files are ready and places on that node. 
<br>
Given an incomplete configuration in directory `/etc/kubernetes/epconfig`, as well as `https://image-bouncer-webhook.default.svc:1323/image_policy` functional container image scanner.
<br>

- 1. Enable the necessary plugins to create mirror policies.
- 2. Verify the control configuration and change it to implicit deny.
- 3. Edit the configuration to correctly point to the provided HTTPS endpoint last, by trying to deploy vulnerable resources `/cks/img/web1/yaml` to test if the configuration is valid. 

### 정답
처음에 `k apply /cks/img/web1/yaml`를 실행해보면 pod가 정상적으로 생성되는 걸 확인할 수 있다. 이걸 막고 싶은게 우리의 목적이다. 테스트 한 뒤엔 다시 삭제해주자.
- `epconfig` 디렉토리 하위에 보면 여러 파일들이 있는데 그 중에 `admission_configuration.json`파일에서 `imagePolicy.defaultAllow: true` 에서 `imagePolicy.defaultAllow: false`로 수정하기 ( 2번 요구사항 )
- `epconfig` 디렉토리 하위의 kubeconfig.yaml파일에서 `clusters.cluster.server`의 값이 문제에 따르면 `https://image-bouncer-webhook.default.svc:1323/image_policy`여야 하는데 설정이 안되어 있으므로 추가 설정해주기. (3번 요구사항)
- kube-apiserver 설정하기
  - `- --enable-admission-plugins=ImagePolciyWebhook`을 추가해주기
  - `- --admission-control-config-file=/etc/kubernetes/epconfig/admission_configuration.json`을 설정해준다.
    - 그런데 kube-apiserver pod에서 이 json파일을 런타임시 사용하기 위해서는 volumem으로 마운트해줘야 하기에 volumes, volumeMount 설정을 추가해준다.
      ```yaml
      volumeMounts:
      - mountPath: /etc/kubernetes/epconfig
        name: epconfig
        readOnly: true
      .
      .
      .
      volumes:
      - hostPath:
          path: /etc/kubernetes/epconfig
          type: DirectoryOrCreate
        name: epconfig
      ```
  - `systemctl daemon-reload`, `systemctl restart kubelet`
- 마지막으로 `k apply /cks/img/web1/yaml` 명령이 실행 안되는 것으로 테스트 완료
