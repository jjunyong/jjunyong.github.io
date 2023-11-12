---
emoji: 🧢
title: '[CKS] Mockexam 2' 
date: '2023-11-11 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## EXAM 2

### Q1
```
A pod called redis-backend has been created in the prod-x12cs namespace. 
It has been exposed as a service of type ClusterIP. 
Using a network policy called allow-redis-access, lock down access to this pod only to the following:

1. Any pod in the same namespace with the label backend=prod-x12cs.
2. All pods in the prod-yx13cs namespace.

All other incoming connections should be blocked.
Use the existing labels when creating the network policy.
```

### Q1 Answer 
- namespaceSelector 에서는 metadata.namspace의 동일한 namespace에 대한 것은 설정할 필요 없고, 다른 namespace에서 접근하고자 하는 경우에만 namespaceSelector를 적용한다.
- namespace에 대한 selector는 label 한 쌍으로 충분하지만, podSelector에서는 pod의 모든 label에 대해서 일치하도록 규칙을 설정하여야 한다.
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-redis-access
  namespace: prod-x12cs
spec:
  podSelector:
    matchLabels:
      run: redis-backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          access: redis
    - podSelector:
        matchLabels:
          backend: prod-x12cs
    ports:
    - protocol: TCP
      port: 6379
```

### Q2
```
A few pods have been deployed in the apps-xyz namespace. There is a pod called redis-backend which serves as the backend for the apps app1 and app2. The pod called app3 on the other hand, does not need access to this redis-backend pod. Create a network policy called allow-app1-app2 that will only allow incoming traffic from app1 and app2 to the redis-pod.

Make sure that all the available labels are used correctly to target the correct pods. Do not make any other changes to these objects.
```

### Q2 Answer
```yaml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-app1-app2
  namespace: apps-xyz
spec:
  podSelector:
    matchLabels:
      tier: backend
      role: db
  ingress:
  - from:
    - podSelector:
        matchLabels:
          name: app1
          tier: frontend
    - podSelector:
        matchLabels:
          name: app2
          tier: frontend
```
나의 답안은 아래와 같았으나 틀린 이유는 network policy에서 규칙을 정의할 때, 모든 label이 일치하도록 설정해야 하므로 위와 같이 하는 것이 옳다. 
```yaml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-app1-app2
  namespace: apps-xyz
spec:
  podSelector:
    matchLabels:
      tier: backend
      role: db
  ingress:
  - from:
    - podSelector:
        matchExpressions:
        - key: name
          operator: In
          values: ["app1", "app2"]
```
### Q3
```
A pod has been created in the gamma namespace using a service account called cluster-view. This service account has been granted additional permissions as compared to the default service account and can view resources cluster-wide on this Kubernetes cluster. While these permissions are important for the application in this pod to work, the secret token is still mounted on this pod.

Secure the pod in such a way that the secret token is no longer mounted on this pod. You may delete and recreate the pod.
```

### Q3 Answer
- automountServiceAccountToken: false 필드를 pod에 추가 
  - 이 옵션을 추가해주면 serviceaccount token secret이 pod의 `/var/run/secrets/kubernetes.io/serviceaccount` 경로에 마운트 되지 않게 해준다. 
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: apps-cluster-dash
  name: apps-cluster-dash
  namespace: gamma
spec:
  containers:
  - image: nginx
    name: apps-cluster-dash
  serviceAccountName: cluster-view
  automountServiceAccountToken: false
```

### Q4
```
A pod in the sahara namespace has generated alerts that a shell was opened inside the container.
To recognize such alerts, set the priority to ALERT and change the format of the output so that it looks like the below:

ALERT timestamp of the event without nanoseconds,User ID,the container id,the container image repository
Make sure to update the rule in such a way that the changes will persists across Falco updates.

You can refer the falco documentation
```
### Q4 Answer
- /etc/falco/falco_rules.local.yaml 에서 아래와 같이 작성한다. 
```yaml
- rule: Terminal shell in container
  desc: A shell was used as the entrypoint/exec point into a container with an attached terminal.
  condition: >
    spawned_process and container
    and shell_procs and proc.tty != 0
    and container_entrypoint
    and not user_expected_terminal_shell_in_container_conditions
  output: >
    %evt.time.s,%user.uid,%container.id,%container.image.repository
  priority: ALERT
  tags: [container, shell, mitre_execution]
``` 
- Use the falco documentation to use the correct sysdig filters in the output.
For example, the evt.time.s filter prints the timestamp for the event without nano seconds. This is clearly described in the falco documentation here - https://falco.org/docs/rules/supported-fields/#evt-field-class

### Q5
martin is a developer who needs access to work on the dev-a, dev-b and dev-z namespace. He should have the ability to carry out any operation on any pod in dev-a and dev-b namespaces. However, on the dev-z namespace, he should only have the permission to get and list the pods.

The current set-up is too permissive and violates the above condition. Use the above requirement and secure martin's access in the cluster. You may re-create objects, however, make sure to use the same name as the ones in effect currently.

### Q5 Answer
- role 삭제 후 아래 yaml파일로 role생성
  - k delete role dev-user-access -n dev-z
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
    name: dev-user-access
    namespace: dev-z
rules:
  - apiGroups:
    - ""
    resources:
    - pods
    verbs:
    - get
    - list
```

### Q6
On the controlplane node, an unknown process is bound to the port 8088. Identify the process and prevent it from running again by stopping and disabling any associated services. Finally, remove the package that was responsible for starting this process.

### Q6 Answer
- netstat으로 8088 포트에 해당하는 process 찾기 
- systemctl stop lshttpd
- systemctl disable lshttpd
- 동일한 이름의 패키지가 존재하는 지 확인
  - apt list --installed | grep openlitespeed
- apt remove openlitespeed -y


### Q7
A pod has been created in the omega namespace using the pod definition file located at /root/CKS/omega-app.yaml. However, there is something wrong with it and the pod is not in a running state.

We have used a custom seccomp profile located at /var/lib/kubelet/seccomp/custom-profile.json to ensure that this pod can only make use of limited syscalls to the Linux Kernel of the host operating system. However, it appears the profile does not allow the read and write syscalls. Fix this by adding it to the profile and use it to start the pod.

### Q7 Answer
- seccomp profile 파일의 경로를 변경
  - /var/lib/kubelet/seccomp 하위에 profiles 디렉토리 만들고 거기로 Profile 파일 이동 
- custom-profile.json에 'read', 'write' syscall추가 
- pod replace하기
  - kubectl replace -f /root/CKS/omega-app.yaml --force

### Q8
A pod definition file has been created at /root/CKS/simple-pod.yaml . Using the kubesec tool, generate a report for this pod definition file and fix the major issues so that the subsequent scan report no longer fails.

Once done, generate the report again and save it to the file /root/CKS/kubesec-report.txt

### Q8 Answer
- SYS_ADMIN capability를 빼고 아래 결과 저장
  - kubesec scan /root/CKS/simple-pod.yaml > /root/CKS/kubesec-report.txt

### Q9
Create a new pod called secure-nginx-pod in the seth namespace. Use one of the images from the below which has a least number of CRITICAL vulnerabilities.

nginx
nginx:1.19
nginx:1.17
nginx:1.20
gcr.io/google-containers/nginx
bitnami/jenkins:latest
### Q9 Answer
- trivy image --severity CRITICAL {image명} 으로 검사해서 가장 취약점이 적은 gcr.io/google-containers/nginx 이미지로 pod 생성하기 
  - kubectl -n seth run secure-nginx-pod --image gcr.io/google-containers/nginx 