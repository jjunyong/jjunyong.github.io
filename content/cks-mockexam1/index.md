---
emoji: 🧢
title: '[CKS] Mockexam 1' 
date: '2023-11-01 00:00:00'
author: jjunyong
tags: k8s
categories: DevOps
---

## EXAM 1

### Q1
```

A pod has been created in the omni namespace. However, there are a couple of issues with it.

The pod has been created with more permissions than it needs.
It allows read access in the directory /usr/share/nginx/html/internal causing an Internal Site to be accessed publicly.

To check this, click on the button called Site (above the terminal) and add /internal/ to the end of the URL.
Use the below recommendations to fix this.

Use the AppArmor profile created at /etc/apparmor.d/frontend to restrict the internal site.
There are several service accounts created in the omni namespace. Apply the principle of least privilege and use the service account with the minimum privileges (excluding the default service account).
Once the pod is recreated with the correct service account, delete the other unused service accounts in omni namespace (excluding the default service account).


You can recreate the pod but do not create a new service accounts and do not use the default service account.
correct service account used?

- obsolete service accounts deleted?
- internal-site restricted?
- pod running?
```

### Q1 Answer 
1. AppAromor profile 로드하기
```bash
apparmor_parser -q /etc/apparmor.d/frontend
```
2. profile 이름으로 정상 로드 확인하기 
```bash
aa-status | grep restricted-frontend                      
```
3. default sa를 제외하고 가장 권한이 적은 `frontend-default` sa를 frontend-site pod에서 적용하도록 설정  


### Q2
```
A pod has been created in the orion namespace. It uses secrets as environment variables. Extract the decoded secret for the CONNECTOR_PASSWORD and place it under /root/CKS/secrets/CONNECTOR_PASSWORD.

You are not done, instead of using secrets as an environment variable, mount the secret as a read-only volume at path /mnt/connector/password that can be then used by the application inside.
```

### Q2 Answer
```yaml
apiVersion: v1
kind: Pod
metadata:
    labels:
        name: app-xyz
    name: app-xyz
    namespace: orion
spec:
    containers:
        -
            image: nginx
            name: app-xyz
            ports:
            - containerPort: 3306
            volumeMounts: 
            - name: secret-volume
              mountPath: /mnt/connector/password
              readOnly: true
    volumes:
    - name: secret-volume
      secret:
        secretName: a-safe-secret
```

### Q3
```
A number of pods have been created in the delta namespace. Using the trivy tool, which has been installed on the controlplane, identify and delete pods except the one with least number of CRITICAL level vulnerabilities.

Note: Do not modify the objects in anyway other than deleting the ones that have critical vulnerabilities.
```

### Q3 Answer
- trivy image 명령어를 이용해 실행 중인 pod 중에 가장 vulnerability가 적은 image를 실행하고 있는 pod만 남기고 모두 삭제하기

### Q4
```
Create a new pod called audit-nginx in the default namespace using the nginx image. Secure the syscalls that this pod can use by using the audit.json seccomp profile in the pod's security context.

The audit.json is provided at /root/CKS directory. Make sure to move it under the profiles directory inside the default seccomp directory before creating the pod
```
### Q4 Answer
- mv /root/CKS/audit.json /var/lib/kubelet/seccomp/profiles
- Seccomp 적용하여 pod replace하기 
  ```
    apiVersion: v1
    kind: Pod
    metadata:
      labels:
        run: nginx
      name: audit-nginx
    spec:
      securityContext:
        seccompProfile:
          type: Localhost
          localhostProfile: profiles/audit.json
      containers:
      - image: nginx
        name: nginx
  ```

### Q5
The CIS Benchmark report for the Controller Manager and Scheduler is available at the tab called CIS Report 1.

Report 내용: 
- [FAIL] 1.1.12 Ensure that the etcd data directory ownership is set to etcd:etcd (Automated)
- [FAIL] 1.3.2 Ensure that the --profiling argument is set to false (Automated)
- [FAIL] 1.4.1 Ensure that the --profiling argument is set to false (Automated)

### Q5 Answer
```
The fixes are mentioned in the same report. Update the Controller Manager and Scheduler static pod definition file as per the recommendations.
1. Make sure that the --profiling=false parameter is set.
```

### Q6
```
There is something suspicious happening with one of the pods running an httpd image in this cluster.
The Falco service shows frequent alerts that start with: File below a known binary directory opened for writing.

Identify the rule causing this alert and update it as per the below requirements:

Output should be displayed as: CRITICAL File below a known binary directory opened for writing (user_id=user_id file_updated=file_name command=command_that_was_run)
Alerts are logged to /opt/security_incidents/alerts.log

Do not update the default rules file directly. Rather use the falco_rules.local.yaml file to override.
Note: Once the alert has been updated, you may have to wait for up to a minute for the alerts to be written to the new log location.
```
### Q6 Answer
- `/etc/falco/falco.yaml`에서 file_output을 enable 하기 
  ```
    file_output:
      enabled: true
      keep_alive: false
      filename: /opt/security_incidents/alerts.log
  ```
- `/etc/falco/falco_rules.local.yaml`에서 rule 작성하기 
  ```
    - rule: Write below binary dir
      desc: an attempt to write to any file below a set of binary directories
      condition: >
        bin_dir and evt.dir = < and open_write
        and not package_mgmt_procs
        and not exe_running_docker_save
        and not python_running_get_pip
        and not python_running_ms_oms
        and not user_known_write_below_binary_dir_activities
      output: >
        File below a known binary directory opened for writing (user_id=%user.uid file_updated=%fd.name command=%proc.cmdline)
      priority: CRITICAL
      tags: [filesystem, mitre_persistence]
  ```
- `kill -1 $(cat /var/run/falco.pid)`

### Q7
```
A pod called busy-rx100 has been created in the production namespace. Secure the pod by recreating it using the runtimeClass called gvisor. You may delete and recreate the pod.``
```
### Q7 Answer
- 아래 yaml파일로 gvisor runtimeClass로 pod 생성하기 
```
apiVersion: v1
kind: Pod
metadata:
    labels:
        run: busy-rx100
    name: busy-rx100
    namespace: production
spec:
    runtimeClassName: gvisor
    containers:
        -
            image: nginx
            name: busy-rx100
```
### Q8
```
We need to make sure that when pods are created in this cluster, they cannot use the latest image tag, irrespective of the repository being used.

To achieve this, a simple Admission Webhook Server has been developed and deployed. A service called image-bouncer-webhook is exposed in the cluster internally. 
This Webhook server ensures that the developers of the team cannot use the latest image tag.
Make use of the following specs to integrate it with the cluster using an ImagePolicyWebhook:

Create a new admission configuration file at /etc/admission-controllers/admission-configuration.yaml
The kubeconfig file with the credentials to connect to the webhook server is located at /root/CKS/ImagePolicy/admission-kubeconfig.yaml. 

Note: The directory /root/CKS/ImagePolicy/ has already been mounted on the kube-apiserver at path /etc/admission-controllers so use this path to store the admission configuration.
Make sure that if the latest tag is used, the request must be rejected at all times.
Enable the Admission Controller.

Finally, delete the existing pod in the magnum namespace that is in violation of the policy and recreate it, ensuring the same image but using the tag 1.27.

NOTE: If the kube-apiserver becomes unresponsive, this can affect the validation of this exam. In such a case, please restore the kube-apiserver using the backup file created at: /root/backup/kube-apiserver.yaml, wait for the API to be available again and proceed.

```
### Q8 Answer
- 1. 아래와 같은 `admission-configuration.yaml` 파일을 k8s doc의 ImagePolicyWebhook plugin 예시를 참조하여 `/root/CKS/ImagePolicy` 경로에 생성한다.
  - `/root/CKS/ImagePolicy` 경로는 문제에서 kube-apiserver pod의 `/etc/admission-contollers` 경로에 마운트 된다. 따라서 kubeConfigFile의 경로 또한 `/root/CKS/ImagePolicy/admission-kubeconfig.yaml` 가 아닌 `/etc/admission-controllers/admission-kubeconfig.yaml`로 아래와 같이 설정하는 것이다. 
  ```
  apiVersion: apiserver.config.k8s.io/v1
  kind: AdmissionConfiguration
  plugins:
  - name: ImagePolicyWebhook
    configuration:
      imagePolicy:
        kubeConfigFile: /etc/admission-controllers/admission-kubeconfig.yaml
        allowTTL: 50
        denyTTL: 50
        retryBackoff: 500
        defaultAllow: false
  ```
  - 실제 kube-apiserver에서 volume mount에 대한 설정을 확인해 볼 수도 있다.

- 2. kube-apiserverd에서 ImagePolicyWebhook을 enable시키고, 위에서 작성한 admission-configuration.yaml파일을 config로 사용하도록 설정한다. 여기서 유의해야 할점은 kubeConfigFile 의 경로와 마찬가지로 pod 내의 경로를 기준으로 하여 작성해야 한다는 점이다. 
  ```
  - --admission-control-config-file=/etc/admission-controllers/admission-configuration.yaml
  - --enable-admission-plugins=NodeRestriction,ImagePolicyWebhook
  ```