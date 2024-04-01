---
emoji: 😌
title: 'RHCSA'
date: '2024-03-25 00:00:00'
author: jjunyong
tags: Redhat
categories: Linux DevOps
---

### 1. root 비번 재설정

- VM 재기동 ( ctrl-alt-delete )
- rescue console ‘e’(edit) 로 진입하여 linux ... 행에 `rd.break` 추가
- Ctrl-x로 저장하면 자동으로 레스큐 콘솔로 재부팅 된다.

  ```bash
  # 레스큐 모드에서는 파일 시스템이 읽기 전용으로 마운트되기 때문에, rw모드로 리마운트 필요
  mount -o rw,remount /sysroot
  # 루트 디렉터리를 /sysroot로 변경하여 비밀번호 변경 전 격리된 환경 제공
  chroot /sysroot
  echo ‘anypass’ | passwd —stdin root
  #  재부팅 시 파일 시스템의 SELinux 컨텍스트를 자동으로 재라벨링하도록 한다.
  touch /.autorelabel

  ```

### 2. 서버 네트웍 설정

- nmtui 명령을 통해 진입하는 콘솔에서 hostname, ip, gateway, dns server 등에 대한 설정 가능

### 3. 서버 리포지토리 관리

- dnf repository 추가

  ```bash
  dnf config-manager —add-repo=“repo1”
  dnf config-manager —add-repo=“repo2”

  # /etc/yum.repos.d 하위에 vi repo1, repo2 gpgcheck=0 해줘야 함

  # 오래되거나 깨진 캐시로 인한 문제를 방지하거나 dnf repo설정 변경 때 사용
  dnf clean all
  dnf list
  ```

### 4. SELinux

- SELinux의 http에 추가된 포트 확인 및 포트 추가
  ```bash
  semanage port -l | grep http
  semanage port -a -t http_port_t -p tcp 82
  ```
- 방화벽에 위에서 추가된 82번 port를 오픈하기 위해 추가
  ```bash
  firewall-cmd —add-port=82/tcp —permanent
  firewall-cmd —reload
  ```
- httpd 재시작 및 적용

  ```bash
  systemctl restart httpd
  systemctl enable —now httpd
  ```

### 5.논리 볼륨 크기 조정

```bash
lsblk
vgdisplay myvol
# 특정 파일시스템으로 마운트 된 논리 볼륨 /dev/myvol/vo의 사이즈를 75m 증가
lvextend -r -L +75m /dev/myvol/vo
df -h
```

-r: 논리 볼륨을 확장한 후에 파일 시스템의 크기를 자동으로 조정하는 옵션. -r 옵션이 없다면, 논리 볼륨의 크기를 확장한 뒤에 별도로 파일 시스템을 확장해야 함.

- `lsblk` 명령을 통해 논리 볼륨의 파티션을 확인할 수 있고, 논리 볼륨이 속한 파티션은 LVM이다.

### 6.스왑 파티션 추가

- 파티션 생성

  ```bash
  # /dev/vdb 디스크에 2번 파티션을 이전 파티션이 끝나지는 지점의 바로 다음 섹터(enter)에서 512M 사이즈로 생성한다.
  fdisk /dev/vdb # n -> 2 -> enter -> +512M -> w

  # 해당 파티션의 타입을 swap 메모리로 설정한다.
  fdisk /devvdb # t -> 2 -> swap -> w
  ```

  - /dev/vdb의 두 번째 파티션(/dev/vdb2)을 시스템에 스왑 영역으로 사용하기 위한 타입으로 변경했으나 이 단계에서는 실제로 스왑 공간이 활성화 되지는 않는다.

- 파티션을 swap공간으로 초기화

  ```bash
  mkswap /dev/vdb2
  ```

- fstab 설정

  - 시스템 부팅 시 자동으로 마운트할 파일 시스템의 목록을 포함하는 설정 파일
  - vi /etc/fstab 마지막 줄에 `/dev/vdb2 swap swap defaults,pri=10 0 0` 추가

    - 파일 시스템 경로: /dev/vdb2
    - mount point: swap (swap의 경우 실제 마운트 포인트가 아닌 swap 키워드 사용)
    - type: swap
    - option: `defaults,pri=10` 은 기본 마운트 옵션을 사용하되, swap 우선 순위를 10으로 높여 설정함을 말함

  - `swapon -a`
    - /etc/fstab 파일에 정의된 모든 스왑 공간을 활성화

- `swapon -s`

  - `swapon -s` 명령은 현재 활성화된 스왑 공간의 목록을 표시

### 7.논리 볼륨 만들기

- 개념 정리
  - PV는 LVM을 사용하여 관리할 수 있는 물리적 스토리지의 최소 단위로, LVM을 사용하려면 물리적 스토리지를 PV로 초기화 해야 한다.
  - VG는 여러 PV를 하나의 큰 스토리지 풀로 묶어 관리하며, 이 풀 내에서 LV를 생성하고 관리한다.
  - 즉, VG는 PV와 LV의 가교역할로서, PV로 만든 하나의 큰 스토리지 풀을 가상의 볼륨(LV)으로 나누어 관리하는 것이다.

#### 1) 파티션 생성

```bash
# /dev/vdb 디스크에 3번 파티션을 이전 파티션이 끝나지는 지점의 바로 다음 섹터(enter)에서 900M 사이즈로 생성한다.
fdisk /dev/vdb # n -> 3 -> enter -> +900M -> w

# 해당 파티션의 타입을 lvm 메모리로 설정한다.
fdisk /devvdb # t -> 3 -> lvm -> w
```

#### 2) 볼륨그룹 및 PV 생성

```bash
# RHEL9에서는 pvcreate /dev/vdb3 명령이 아래 명령에 포함되어 실행된다.
vgcreate wgroup -s 8m /dev/vdb3
```

- 원래는 vgcreate 이후 pvcreate를 하여 해당 물리 스토리지(파티션) 를 LVM이 PV로서 인식하고 사용할 수 있게 해주는 별도 과정이 필요하다. (`pvcreate /dev/vdb3`)
- `-s 8m` 옵션은 해당 volume group에 속한 lv의 물리적 익스텐트(PE)의 크기를 8MB로 설정한다.

#### 3) 논리 볼륨 생성

```bash
# Physical Extent의 수를 100개로 지정한다.
lvcreate -n wshare -l 100 wgroup
```

- -l 100 옵션을 줘서 PE를 100개로 설정하게 되면 wshare 논리 볼륨은 wgroup 볼륨 그룹 내에서 100(PE 갯수)\*8M(PE size) = 약 800M의 공간을 사용하게 된다.

#### 4) 논리 볼륨을 특정 파일시스템으로 포맷

```bash
mkfs.vfat /dev/vdb3
```

#### 5) 마운트 포인트 생성

```bash
mkdir /mnt/share
```

#### 6) 시스템 부팅 시 자동 마운트 설정 ( fstab )

```bash
# vi /etc/fstab
#-> /dev/myvolgroup/myvol /mnt/myvol ext4 defaults 0 0 를 마지막 행에 추가

# /etc/fstab 파일에 정의된 모든 파일 시스템을 자동으로 마운트 함
mount -a
```

### 8.시스템 조정 구성

```bash
tuned-add recommend
tuned-adm profile xyz
tuned-adm active
```

### 9. 계정관리

```bash
useradd natasha
useradd harry
useradd sarah
groupadd -g 60001 manager
usermod -aG manager natasha
usermod -aG manager harry
usermod -s /sbin/nologin sarah # sarah를 login하지 못하는 사용자로 설정
```

### 10.ntp

```bash
dnf -y install chrony
vi /etc/chrony.conf
-> server 주석 후 주어진 서버 정보를 xyz라 하면
server xyz burst 행 작성
systemctl restart chronyd
systemctl enable chroynd —now
timedatectl # 확인
```

### 11. Autofs

```bash
# autofs 관련 패키지 설치
dnf -y install autofs nfs-utils

vi /etc/auto.master.d/direct.autofs
-> `/- /etc/auto.direct`
vi /etc/auto.direct
-> `/a/b/c -rw,sync xyz.com:/a/b/c`
systemctl restart autofs
systemctl enable autofs —now
su - user10
df .
```

### 12.협력 작업 디렉토리

```bash
chown :manager /root/test  chmod 2070 /root/test
```

### 13. 파일찾기1

```bash
mkdir /root/test1
find / -user simone -type f -exec cp -fv {} /root/test1 \;
```

### 14. 파일찾기2

```bash
cd /usr
vi mysearch
-> #!/usr/bin/bash
-> find /usr -size -10M -perm -2000 > /root/myfiles
mv mysearch /usr/local/bin
chmod 755 my search
```

### 15. 문자열찾기

```bash
grep start /usr/share/dict/words > /root/lines.txt
```

### 16. 아카이브

```bash
tar cvjf /root/data.tar.bz2 /usr/local
file /root/data.tar.bz2 # 확인용
```

### 17. 기본권한 ( umask )

```bash
su - daffy
vi .bash_profile
# 마지막 행에 추가 : umask 027
```

### 18. ACL

```bash
cp /etc/fstab /var/tmp/fstab
setfacl -m u:natasha:rw- /var/tmp/fstab
setfacl -m u:harry:— /var/tmp/fstab
getfacl /var/tmp/fstab
```

### 19. 컨테이너1

```bash
podman login [registry address]
wget [container file download address]
podman build -t monitor .
```

### 20.컨테이너2

```bash
mkdir /opt/files
mkdir /opt/processed
chown walhalla:walhalla /opt/files
chown walhalla:walhalla /opt/processed
ssh walhalla@localhost
podman run -d —name ascii2pdf —rm -v /opt/files:/opt/incoming:Z -v /opt/processed:/opt/outgoing:Z monitor
mkdir -p .config/systemd/user
cd .config/systemd/user
podman generate systemd -n ascii2pdf —new —files
podman stop -a
systemctl —user enable container-ascii2pdf.service
systemctl —user status container-ascii2pdf.service
podman ps
loginctl enable-linger
```
