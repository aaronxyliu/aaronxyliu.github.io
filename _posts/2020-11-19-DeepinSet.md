---
title: Deepin 开发环境配置
date: 2020-11-19 10:30:00 -500
categories: [Environment]
tags: [linux, lang-zh]
---

Deepin 内置的深度商店非常好用，一些常用的软件都可以直接在商店里下载。包括 TIM，Visual Studio Code，网易云音乐，搜狗拼音，Chrome，WPS，百度网盘等。工欲善其事，必先利其器。在配置环境之前，我们先得给电脑装上一个功能强大的编辑器，才方便之后的操作。VS code（Visual Studio Code）是当今最流行的免费代码编辑器。以下是在 Deepin 上配置 VS code 的详细步骤。

1. 从深度商店下载 VS code。安装完成后，在 bash 中并不能直接使用`code`命令。我们需要将 VS code 加入到系统的环境变量中。添加环境变量的一种方法是在/etc/profile 文件中添加变量，这样会对这台电脑的所有用户永久生效。

```bash
$> sudo vim /etc/profile
```

- 对于不会使用 vim 的小伙伴，推荐使用 Linux 自带的小巧编辑器 `nano`。nano 的使用方法简单明了，非常易于新人上手。

```bash
$> sudo nano /etc/profile
```

2. 打开 profile 文件后，将下面的内容添加到文件的末尾。

```bash
#VS code
export VSCODE_HOME=/opt/apps/com.visualstudio.code/files/share/code
export PATH=${VSCODE_HOME}/bin:$PATH
```

3. 保存文件，退出。执行`source`命令或`.`命令读入环境配置文件的命令，使环境变量立即生效。

```bash
#下面这两个命令效果是一样的
$> source /etc/profile
$> . /etc/profile
```

4. 这样我们就能在 bash 中使用`code`命令啦。如果还是无法使用的话，可以用`echo`指令查看环境变量是否添加成功。

```bash
$> echo $PATH
```

- **补充说明：**

  - 如果两个目录含有相同的可执行程序，通过 echo 指令查看 PATH，可以比较优先级。处于前面位置的路径，优先级更高，会优先执行。

  - 如果想要更改 Visual Studio Code 的一些设置（例如 Title Bar Style），可以通过 **`CTRL + SHIFT + P`** 快捷键或 **`F1`** 呼出命令面板，输入 "Settings" 进入设置界面。  
    <br/>

## 配置环境

配置环境的第一件事情就是换源。在 Deepin 中，默认使用的是官方源，但是官方源无法通过 apt-get 安装 mysql-server，只能安装 mysql 的分支——海狮 db。所以我们采用清华源来替换官方源，这样就能安装 mysql-server 了。以下是换源的步骤。

1. 首先打开 source.list 文件。

```bash
$> sudo code /etc/apt/source.list
```

2. 用以下内容替换文件中的内容。

```bash
deb [by-hash=force] https://mirrors.tuna.tsinghua.edu.cn/deepin panda main contrib non-free
```

3. 保存文件，退出。执行以下命令更新并升级系统软件。

```bash
$> sudo apt-get update
$> sudo apt-get upgrade
```

在平常的开发中，经常会使用到 Python。在大部分 Linux 发行版中，都自带了 Python2 和 Python3。

```bash
$> python -V
Python 2.7.16
$> python3 -V
Python 3.6.5
```

但是系统自带的 Python 并不包含 Python 的包安装和管理工具 pip，需要我们另外下载。

```bash
# Python 2:
$> sudo apt install python-pip
# Python 3:
$> sudo apt install python3-venv python3-pip
```

其中的 `python3-venv` 为 Python3 的虚拟环境搭建工具。Linux 各个发行版安装 pip 的方法可以查阅官方的 [pip 安装文档](https://packaging.python.org/guides/installing-using-linux-tools)。有了pip，我们就能为 Python 安装我们需要的库了，例如常用的数学函数库NumPy。

```bash
# Python 2:
$> pip install numpy
# Python 3:
$> pip3 install numpy
```

- pip 安装好后，最好为 pip 更换为国内的安装源。打开 `~/.pip/pip.conf` 文件（没有就创建一个），添加如下内容：

```bash
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
```

<br/>

## 配置 MySQL

MySQL 是一款轻量级的关系型数据库管理系统，其体积小、速度快，经常作为中小型网站开发的首选数据库。以下是安装和配置 MySQL 的详细步骤。

1.  [更换完下载源后](#配置环境)，我们可以直接通过 apt-get 下载 MySQL，比自己从官网上下载 MySQL 简单多了。

```bash
$> sudo apt-get install mysql-server
```

2. 下载完成后，MySQL 会自动启动。可以使用`systemctl`命令查看和更改 MySQL 服务的状态。

```bash
$> systemctl start mysql    #启动mysql服务
$> systemctl stop mysql    #停止mysql服务
$> systemctl status mysql    #查看mysql服务状态
$> systemctl enable mysql    #设置自启动
$> systemctl disable mysql    #关闭自启动
```

3. 在使用 MySQL 之前，我们还需要进行 MySQL 的安全模式安装。在 bash 执行如下命令。

```bash
$> sudo mysql_secure_installation
```

4. 然后根据安装引导，设置密码，设置一些首选项。安装流程结束后，我们就可以使用 MySQL 了！使用如下指令即可以 root 用户的身份进入到 MySQL 的 shell 中。

```bash
$> sudo mysql
```

- 上述指令执行后可能会出现下面这种情况，无法进入到 shell 里面。

```bash
ERROR 1045 (28000): Access denied for user'root'@'localhost' （using password: NO）
```

- 这个 Error 信息提示我们需要输入密码进行登录。添加`--password`选项来输入密码。

```bash
$> sudo mysql --password
```

- 执行上述命令后，MySQL 会要求我们输入密码。我们只需要输入在安全模式安装过程中设置的密码即可登入。

5. 如果不使用 root 身份登录，可以用以下指令。其中的`<user_name>`，`<db_name>`和`<your_password>`需要自己填写。

```bash
$> mysql --user=<user_name> --password <db_name>
Enter password: <your_password>
```

- 更多的详细内容可以查阅[MySQL 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)。  
  <br/>

## 配置 Node.js 和它的伙伴们

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，使我们能够在非浏览器环境下运行 javascript 程序。下面是在 Deepin 上下载和配置 Node.js 环境的具体步骤。

1. 首先，从[Node.js 官网](https://nodejs.org)上下载 Node.js 的安装包，网站会自动检测你的操作系统，并提供对应的安装包下载。切记<font color=orange>不要</font>使用 apt-get 下载 node 或者 npm，其下载的版本过低，后续使用中会出现诸多问题，一定要从官网上下载！笔者下载的版本为`12.19.0 LTS`，安装包为[node-v12.19.0-linux-x64.tar.xz](https://nodejs.org/dist/v12.19.0/node-v12.19.0-linux-x64.tar.xz)。下载完成后，将安装包解压到你想安装 Node.js 的任意目录下。一般会解压到`/usr/local/nodejs`目录下。

```bash
$> cd /usr/local
$> sudo mkdir nodejs
$> sudo tar -xJvf node-v12.19.0-linux-x64.tar.xz -C /usr/local/nodejs
```

- **补充说明**：
  - `/usr` 路径下为系统预装的一些可执行程序，会随系统升级而改变；
  - `/usr/local` 路径下为用户安装的可执行程序，不受系统升级影响。用户编译安装软件时，一般都会放到这个目录下；
  - `/opt` 为用户级的程序目录，相当于 Windows 中的 D:/Software。opt 有可选的意思，这里可以用于放置第三方大型软件（或游戏），当你不再需要时，直接使用 rm -rf 删掉即可。在硬盘容量不够时，也可将/opt 单独挂载到其他磁盘上使用。

2. 然后，将`node-v12.19.0-linux-x64`文件夹中的`bin`目录添加到环境变量中。打开/`etc/profile`文件

```bash
$> sudo code /etc/profile
```

然后将下面的内容添加到`profile`文件的末尾。

```bash
# Nodejs
export NODE_HOME=/usr/local/nodejs/node-v12.19.0-linux-x64
export PATH=${NODE_HOME}/bin:$PATH
```

再使用 source 命令使其立即生效。

```bash
$> source /etc/profile
```

3. 检查 npm 和 node 是否被系统识别。（npm 是 Nodejs 的包管理工具，包含安装包中）

```bash
$> npm -v
6.14.8
$> node -v
v12.19.0
```

4. Typescipt 是 Javascript 的一个超集，向这个语言添加了可选的静态类型和基于类的面向对象编程，如今受到越来越多网络开发者的青睐。我们可以直接使用 Node.js 的包管理工具 npm 来下载安装 Typescript。`-g`参数使得下载的包全局可以访问。

```bash
$> npm install -g typescript
```

- 如果安装过程中出现类似如下错误：

```bash
[npm WARN tarball] tarball data for loader-utils@1.2.3 (sha512-fkpz8ejdnEMG3s37wGL07iSBDg99O9D5yflE9RGNH3hRdx9SOwYfnGYdZOUIZitN8E+E2vkq3MUMYMvPYl5ZZA==) seems to be corrupted. Trying one more time.
```

造成的原因是拉取速度过慢而中断。可以通过换成淘宝的镜像源来解决。

```bash
$> npm install -g typescript --registry=https://registry.npm.taobao.org
```

5. 最后检查 Typescript 是否下载成功。

   ```(bash)
   $> tsc -v
   Version 4.0.3
   ```

   