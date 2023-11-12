---
emoji: 🧢
title: '[CKS] Mockexam 3' 
date: '2023-11-01 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## EXAM 2

### Q1
```
A kube-bench report is available at the Kube-bench assessment report tab. Fix the tests with FAIL status for 4 Worker Node Security Configuration .
Make changes to the /var/lib/kubelet/config.yaml

After you have fixed the issues, you can update the published report in the Kube-bench assessment report tab by running /root/publish_kubebench.sh to validate results.
```

### Q1 Answer 
`/var/lib/kubelet/config.yaml`에서 아래 2가지 사항 조치 
- 수정
```yaml
authorization:
  mode: Webhook
```
- 추가
```yaml
protectKernelDefaults: true
```

### Q2
```
Enable auditing in this kubernetes cluster. Create a new policy file that will only log events based on the below specifications:

Namespace: prod
Level: metadata
Operations: delete
Resources: secrets
Log Path: /var/log/prod-secrets.log
Audit file location: /etc/kubernetes/prod-audit.yaml

Maximum days to keep the logs: 30
Once the policy is created it, enable and make sure that it works.
```
### Q2 Answer
- /etc/kubernetes/prod-audit.yaml 작성
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata
  namespaces: ["prod"]
  verbs: ["delete"]
  resources:
  - group: ""
    resources: ["secrets"]
```
- kube-apiserver 설정
```
 - --audit-policy-file=/etc/kubernetes/prod-audit.yaml
 - --audit-log-path=/var/log/prod-secrets.log
 - --audit-log-maxage=30
```
- kube-apiserver volume / volumeMounts 설정
#### volumes
```
- name: audit
  hostPath:
    path: /etc/kubernetes/prod-audit.yaml
    type: File
- name: audit-log
  hostPath:
    path: /var/log/prod-secrets.log
    type: FileOrCreate
```
#### volumeMounts
```
- mountPath: /etc/kubernetes/prod-audit.yaml
  name: audit
  readOnly: true
- mountPath: /var/log/prod-secrets.log
  name: audit-log
  readOnly: false
``` 

### Q3 : kubesec문제로 Pass~
### Q4 
```
In the dev namespace create below resources:
- A role dev-write with access to get, watch, list and create pods in the same namespace.
- A Service account called developer and then bind dev-write role to it with a rolebinding called dev-write-binding.
- Finally, create a pod using the template /root/dev-pod.yaml. The pod should run with the service account developer. Update /root/dev-pod.yaml as necessary
```
### Q4 Answer
- dev-write role 추가 
- developer sa 추가 
  - kubectl create sa developer -n dev
- dev-write-binding rolebinding 추가 
- `/root/dev-pod.yaml`에서 serviceAccount developer로 수정 

### Q5 (OPA) / 중요! 
```
Try to create a pod using the template defined in /root/beta-pod.yaml in the namespace beta. This should result in a failure.
Troubleshoot and fix the OPA validation issue while creating the pod. You can update /root/beta-pod.yaml as necessary.

The Rego configuration map for OPA is in untrusted-registry under opa namespace.

NOTE: In the end pod need not to be successfully running but make sure that it passed the OPA validation and gets created.
```

### Q5 Answer
- `untrusted-registry` configmap에 정의된 rego file을 살펴보면 `kodekloud.io/` 로 시작하지 않는 repository를 거부하는 설정을 가지고 있다.
- 따라서 이미지 url을 아래와 같이 고친 후에 pod를 기동해주면 된다.
  ```
    - image: kodekloud.io/google-samples/node-hello:1.0
  ```

### Q6
```
We want to deploy an ImagePolicyWebhook admission controller to secure the deployments in our cluster.

- Fix the error in /etc/kubernetes/pki/admission_configuration.yaml which will be used by ImagePolicyWebhook
- Make sure that the policy is set to implicit deny. If the webhook service is not reachable, the configuration file should automatically reject all the images.
- Enable the plugin on API server.

The kubeconfig file for already created imagepolicywebhook resources is under /etc/kubernetes/pki/admission_kube_config.yaml
```

### Q6 Answer
- admission configuration yaml파일에서 kubeConfigFile의 경로를 아래와 같이 명시하여 준다.
```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: AdmissionConfiguration
plugins:
- name: ImagePolicyWebhook
  configuration:
    imagePolicy:
      kubeConfigFile: /etc/kubernetes/pki/admission_kube_config.yaml
      allowTTL: 50
      denyTTL: 50
      retryBackoff: 500
      defaultAllow: false
```
- /etc/kubernetes/manifests/kube-apiserver.yaml 에서 ImagePolicyWebhook을 추가로 enable해주고, admission-control-config 파일의 경로를 명시해준다. 
  - admission-control-config 파일의 경로는 pod 내부 경로임에 유의해야 한다. 이 문제에서는 host와 pod에서 동일한 경로를 사용하고 있어서 상관없지만 그렇지 않을 경우에는 헷갈릴 수 있다. 
  ```
    - --enable-admission-plugins=NodeRestriction,ImagePolicyWebhook
    - --admission-control-config-file=/etc/kubernetes/pki/admission_configuration.yaml
  ```

### Q7
```
Delete pods from alpha namespace which are not immutable.
Note: Any pod which uses elevated privileges and can store state inside the container is considered to be non-immutable.
```

### Q7 Answer
- solaris pod는 `readOnlyRootFilesystem: true` 로 설정되어 있기 때문에 immutable 하다.
- sonata pod는 `privileged: true`로 설정되어 있기에 immutable하지 않고, 
- triton pod는 `readOnlyRootFilesystem: true` 를 명시하지 않고 있기 때문에 immutable 하지 않다.

즉, `readOnlyRootFilesystem: true` 이 설정은 immutable pod에 필수적이다. 