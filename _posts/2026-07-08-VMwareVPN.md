---
title: VMware Fusion Ubuntu 虚拟机通过 Mac VPN 访问外网教程
date: 2026-07-08 08:31:00 +500
math: true
categories: [Technique]
tags: [note, linux]
---


本文记录如何在 **VMware Fusion** 中，让 Ubuntu 虚拟机通过 Mac 上的 VPN/代理软件访问 Google、GitHub、apt 源等外网资源。

实验环境示例：

* 宿主机：macOS
* 虚拟机软件：VMware Fusion
* 虚拟机系统：Ubuntu Server
* VMware 网络模式：`Share with my Mac`
* Mac 代理软件：FlyingBird
* 可用代理端口：`7892`


## 1. 问题背景

在 VMware Fusion 中，即使网络模式选择了：

```text
Share with my Mac
```

并且 Mac 外部已经开启 VPN，Ubuntu 虚拟机内部仍然可能无法访问：

```bash
google.com
github.com
```

原因是：**虚拟机不会自动继承 Mac 上的应用层代理**。

`Share with my Mac` 本质上是 NAT 网络，虚拟机可以通过 Mac 共享网络上网，但 Mac 上的 VPN/代理客户端不一定会自动接管 VMware NAT 流量。

因此，解决思路是：**让 Ubuntu 虚拟机显式连接 Mac 上开放的代理端口**。

## 2. 确认 Ubuntu 虚拟机的网络信息

在 Ubuntu 虚拟机中执行：

```bash
ip route | grep default
```

示例输出：

```text
default via 192.168.115.2 dev enp2s0 proto dhcp src 192.168.115.131 metric 100
```

这里可以看到：

```text
虚拟机 IP：192.168.115.131
默认网关：192.168.115.2
网卡名称：enp2s0
```

注意：这里的 `192.168.115.2` 是 VMware NAT 网关地址，不一定是 Mac 主机在 VMware 网络中的地址。

## 3. 查看 Mac 在 VMware 网络中的地址

在 Mac 终端中执行：

```bash
ifconfig | grep -B 3 -A 3 192.168.115
```

示例输出：

```text
bridge101: flags=8a63<UP,BROADCAST,SMART,RUNNING,ALLMULTI,SIMPLEX,MULTICAST> mtu 1500
    options=3<RXCSUM,TXCSUM>
    ether 1e:1d:d3:fe:ba:65
    inet 192.168.115.1 netmask 0xffffff00 broadcast 192.168.115.255
```

这里的：

```text
192.168.115.1
```

就是 Mac 在 VMware 共享网络中的地址。

因此，Ubuntu 虚拟机应该通过下面的地址访问 Mac 上的代理：

```text
192.168.115.1:<代理端口>
```

在本例中，最终可用地址是：

```text
http://192.168.115.1:7892
```

## 4. 确认 Mac 代理端口是否开放

在 Mac 终端中执行：

```bash
lsof -iTCP -sTCP:LISTEN -n -P | grep 789
```

示例输出：

```text
FlyingBir 82697 aaronxyliu   14u  IPv6 0x5ca21548c778b40e      0t0  TCP *:7892 (LISTEN)
```

这说明 FlyingBird 已经在监听 `7892` 端口。

如果看到的是：

```text
127.0.0.1:7897
```

说明代理只监听 Mac 本机，不允许虚拟机访问。需要在代理软件中开启类似选项：

```text
Allow LAN
允许局域网连接
允许来自局域网的连接
局域网共享
Bind Address: 0.0.0.0
```

开启后，再次检查监听端口。

## 5. 在 Ubuntu 中测试代理端口

在 Ubuntu 虚拟机中执行：

```bash
nc -vz 192.168.115.1 7892
```

如果端口开放，通常会看到连接成功信息。

如果连接失败，可以先确认：

1. Mac 端代理软件是否开启；
2. 代理是否允许局域网连接；
3. 是否使用了正确的 Mac VMware 地址，例如 `192.168.115.1`；
4. 是否误用了 VMware NAT 网关地址，例如 `192.168.115.2`。

本例中，访问 `192.168.115.2:7892` 会失败，因为它是 NAT 网关，不是 Mac 主机的代理监听地址。

## 6. 测试 Google 是否可以访问

在 Ubuntu 中执行：

```bash
curl -x http://192.168.115.1:7892 -I https://www.google.com
```

如果成功，会看到类似输出：

```text
HTTP/1.1 200 Connection established

HTTP/2 200
content-type: text/html; charset=ISO-8859-1
server: gws
```

这说明 Ubuntu 虚拟机已经可以通过 Mac 上的 FlyingBird 代理访问 Google。

## 7. 临时设置代理环境变量

如果希望当前终端中的 `curl`、`wget`、`pip`、`git` 等命令使用代理，可以执行：

```bash
export http_proxy=http://192.168.115.1:7892
export https_proxy=http://192.168.115.1:7892
export HTTP_PROXY=http://192.168.115.1:7892
export HTTPS_PROXY=http://192.168.115.1:7892
```

然后测试：

```bash
curl -I https://www.google.com
curl -I https://github.com
```

如果返回正常 HTTP 响应，说明代理配置成功。

## 8. 长期设置代理环境变量

如果希望每次登录 Ubuntu 后自动使用代理，可以写入 `~/.bashrc`：

```bash
echo 'export http_proxy=http://192.168.115.1:7892' >> ~/.bashrc
echo 'export https_proxy=http://192.168.115.1:7892' >> ~/.bashrc
echo 'export HTTP_PROXY=http://192.168.115.1:7892' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://192.168.115.1:7892' >> ~/.bashrc
source ~/.bashrc
```

之后新开的终端会自动加载这些代理环境变量。

## 9. 配置 apt 使用代理

`sudo apt update` 和 `sudo apt install` 不一定会自动继承普通用户的代理环境变量，因此建议单独配置 apt 代理。

创建配置文件：

```bash
sudo nano /etc/apt/apt.conf.d/95proxies
```

写入：

```text
Acquire::http::Proxy "http://192.168.115.1:7892/";
Acquire::https::Proxy "http://192.168.115.1:7892/";
```

保存后测试：

```bash
sudo apt update
```

之后安装软件包也会通过代理：

```bash
sudo apt install <package-name>
```

## 10. 配置 Git 使用代理

如果需要访问 GitHub，可以配置 Git 全局代理：

```bash
git config --global http.proxy http://192.168.115.1:7892
git config --global https.proxy http://192.168.115.1:7892
```

测试 GitHub 访问：

```bash
git ls-remote https://github.com/git/git.git
```

如果能看到大量 commit hash 和 refs，说明 Git 已经可以正常访问 GitHub。

取消 Git 代理：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 11. 配置 pip 使用代理

临时使用代理安装 Python 包：

```bash
pip install requests --proxy http://192.168.115.1:7892
```

如果已经设置了环境变量，也可以直接：

```bash
pip install requests
```

## 12. 配置 npm 使用代理

配置 npm 代理：

```bash
npm config set proxy http://192.168.115.1:7892
npm config set https-proxy http://192.168.115.1:7892
```

测试：

```bash
npm view react version
```

取消 npm 代理：

```bash
npm config delete proxy
npm config delete https-proxy
```

## 13. 为什么 curl 可以，但 ping google.com 失败？

这是正常现象。

例如：

```bash
curl -x http://192.168.115.1:7892 -I https://www.google.com
```

可以成功，是因为 `curl` 使用的是 HTTP/HTTPS 代理。

但：

```bash
ping google.com
```

使用的是 ICMP 协议。HTTP 代理不会代理 ICMP 流量，因此即使代理可用，`ping google.com` 仍然可能失败。

所以不要用 `ping google.com` 判断代理是否配置成功。

建议使用：

```bash
curl -I https://www.google.com
curl -I https://github.com
```

或者：

```bash
git ls-remote https://github.com/git/git.git
```

来判断外网访问是否正常。

## 14. 常见问题

### 14.1 `nc` 连接 `192.168.115.2:7892` 失败

这是因为 `192.168.115.2` 是 VMware NAT 网关，不是 Mac 主机地址。

应该使用 Mac 在 VMware 网络中的地址，例如：

```text
192.168.115.1
```

正确测试方式：

```bash
nc -vz 192.168.115.1 7892
```

### 14.2 Mac 上代理只监听 `127.0.0.1`

如果 `lsof` 显示：

```text
127.0.0.1:7897
```

说明代理只允许 Mac 本机访问。

需要在代理软件中开启：

```text
Allow LAN
允许局域网连接
局域网共享
Bind Address: 0.0.0.0
```

然后重新测试。

### 14.3 `curl -x` 成功，但 `apt update` 失败

`apt` 不一定继承当前用户的环境变量。

请配置：

```bash
sudo nano /etc/apt/apt.conf.d/95proxies
```

写入：

```text
Acquire::http::Proxy "http://192.168.115.1:7892/";
Acquire::https::Proxy "http://192.168.115.1:7892/";
```

### 14.4 是否可以不显式配置代理端口？

可以，但需要使用更复杂的方式，例如：

1. 在 Mac 代理软件中开启 TUN / 全局模式；
2. 在 Ubuntu 虚拟机内部单独安装 VPN/代理客户端；
3. 在 Mac 上配置透明代理网关。

对于普通开发和实验环境，显式配置：

```text
http://192.168.115.1:7892
```

是最简单、最稳定的方式。

## 15. 最终可用配置总结

本次成功配置如下：

```text
VMware 网络模式：Share with my Mac
Ubuntu 虚拟机 IP：192.168.115.131
Ubuntu 默认网关：192.168.115.2
Mac VMware 网络地址：192.168.115.1
Mac 代理软件：FlyingBird
Mac 代理端口：7892
Ubuntu 使用的代理地址：http://192.168.115.1:7892
```

Ubuntu 中临时代理配置：

```bash
export http_proxy=http://192.168.115.1:7892
export https_proxy=http://192.168.115.1:7892
export HTTP_PROXY=http://192.168.115.1:7892
export HTTPS_PROXY=http://192.168.115.1:7892
```

测试命令：

```bash
curl -I https://www.google.com
curl -I https://github.com
```

apt 代理配置：

```text
Acquire::http::Proxy "http://192.168.115.1:7892/";
Acquire::https::Proxy "http://192.168.115.1:7892/";
```

Git 代理配置：

```bash
git config --global http.proxy http://192.168.115.1:7892
git config --global https.proxy http://192.168.115.1:7892
```

通过以上配置，Ubuntu 虚拟机即可通过 Mac 上的 VPN/代理访问 Google、GitHub、apt 源和其他外网资源。
