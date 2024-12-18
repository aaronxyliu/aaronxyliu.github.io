---
title: Linux 设置双屏幕
date: 2020-11-18 17:55:03 -500
categories: [Technique, Environment Setting]
tags: [linux, lang-zh]
---

前段时间因工作需要，买了一个显示器，准备外接到我的笔记本电脑上作双屏幕。KuaKuaKua 线装完之后，显示器提示没信号，笔记本也检测不到显示器连接的信息。这可坏了！在网上尝试了各种方法都无果，我都一度以为是新买的显示器有问题，不过最后还是在朋友鸡哥的帮助下厘清了困难，解决了难题。

使用 Deepin 系统设置双屏幕确实颇费周折，不像 Windows 线一插上就万事大吉了。而且遇到问题也需要一些 Linux 相关的背景知识，才能自己着手解决。因此，这篇文章将会先从 Linux 显示设置的相关背景知识入手——[X Window System](#x-window-system) 和 [XRandR](#xrandr)，然后再开始手把手讲解 [设置多屏幕的方法](#开始多屏幕设置吧)。相比于直接告诉你怎么设置，本文还是倾向于先告诉你原理，然后再一步一步带你完成自己想要的设置。如果小伙伴对这些背景知识不感兴趣，可以直接跳过。

那事不宜迟，我们就开始吧！



## X Window System

要接触 Linux 系统桌面显示相关的设置，那就不得不先请出鼎鼎有名的 X Window System。

### 什么是 X Window System？ 

X Window System 是最早由 MIT 在1984年发展出来的一个基于网络架构的图形用户接口（Graphical User Interface, GUI）软件，可以说是历史十分悠久了。X Window System 简称为 X 或 X11。现在主流的 Linux 桌面系统，都基于 X 架构。因此，我们还是要了解一下 X Window System 比较好，这样系统的桌面环境出现了问题，我们才能找到办法去解决。

- 这个图形用户接口为何称为 X 呢？因为 X 字母排在 W(indow) 后面，意味下一代的新窗口。称之为 X11 是因为在1987年的时候，X Window System 已经迭代到了第11个版本，后续所有的 X ，都是基于 X11 版本发展而来的（后续变动都比较小) 。

我们可以使用如下命令来检查当前系统的 X 版本。

``` bash
$> X -version

X.Org X Server 1.20.4
X Protocol Version 11, Revision 0
Build Operating System: Linux 4.19.0-6-server-amd64 x86_64 Uos
Current Operating System: Linux aaron-PC 5.4.70-amd64-desktop #1 SMP Wed Oct 14 15:24:23 CST 2020 x86_64
Kernel command line: BOOT_IMAGE=/vmlinuz-5.4.70-amd64-desktop root=UUID=a8a31905-1d52-441d-ae51-72ccd185ca09 ro splash quiet DEEPIN_GFXMODE=
Build Date: 11 November 2020  07:02:46AM
xorg-server 2:1.20.4.9-1+dde (https://www.debian.org/support) 
Current version of pixman: 0.36.0
        Before reporting problems, check http://wiki.x.org
        to make sure that you have the latest version.
```

可以知道，我们的 Deepin 桌面基于的是 Xorg1.20.4 版本。如果遇到问题，可以到 [wiki.x.org](https://wiki.x.org) 网站上去查询。

X 架构主要由两个组件构成—— X Server 负责管理硬件，X Client 负责管理应用程序。在运行时，X Client 应用程序会将想要绘制的图形告知 X Server，最终由 X Server 来将结果通过它所管理的硬件绘制出来。X Server 主要管理的是显卡、屏幕分辨率、鼠标按键对应等。其中对于显卡的识别，尤其重要！我们想要部署好电脑上的显卡，就绕不开与 X Server 打交道。



### 配置 X Server

基本上，X Server 的配置文件都是默认放置在 `/etc/X11` 目录下，管理硬件的总管模块放在 `/usr/lib64/xorg/modules` 下面，显卡驱动模块就放在该目录下的 `drivers` 文件夹中。X 使用了一个统一的配置文件来规范这些内容，这个配置文件就是 `/etc/X11/xorg.conf`。

现在 X Server 在每次启动时都会自行检查系统上的显卡、屏幕等信息，然后自行搭配优化的驱动程序进行加载。因此 `xorg.conf` 这个配置文件在默认情况下是不需要的。不过如果你打算自行配置 X Server 的各项参数，可以在 `/etc/X11` 目录下自行创建 `xorg.conf` 。如果你只想加入或修改部分设置，那么可以在 `/etc/X11/xorg.conf.d` 目录下建立后缀为 `.conf` 的文件，将你需要的额外选项加进去就行了。这样一来，X Server 就不会每个设置都以 `xorg.conf` 为主了。

- 自行创建 `xorg.conf`？听起来好复杂，我怎么知道 `xorg.conf` 里该写些什么东西？不用着急，实际上 X 会为我们准备好 `xorg.conf` 的模板。我们首先要关闭 X Server，然后执行 `X --configure` 命令，X 就会生成模板 `xorg.conf.new`，并告诉我们它存放的位置。我们只需要在模板上进行少量修改，然后放到 `/etc/X11` 目录下改名为 `xorg.conf` 就会生效啦！更多关于 `xorg.conf` 的信息可以参见 [Using .conf files](https://wiki.archlinux.org/index.php/xorg#Using_.conf_files)。

X Server 的日志信息在 `/var/log/Xorg.0.log` 中。该文件前几行会说明使用的配置文件是来自哪里的，这样我们就知道该修改哪里的配置文件啦！

- 修改配置文件时，一定要提前做好备份！免得改错了什么东西，导致连 X Server 都无法启动了，那就糟糕了。



### 让我来康康 xorg.conf 写的啥

xorg.conf 文件的内容是分成数个段落的，每个段落以 `Section` 开始，以 `EndSection` 结束，里面含有该段落相关的设定值，例如：

``` python
Section "Section name"
...		<== 与这个 Section name 有关的选项设置
...
EndSection
```

常见的 Section 主要有：

1. Module：被加载到 X Server 当中的模块（某些功能的驱动程序）；
2. Monitor：显示器的格式，主要是设置刷新率，与硬件有关；
3. Device：这个重要，就是显卡的相关设置；
4. Screen：这个是在屏幕上显示的相关分辨率与色彩深度的设置选项，与显示设置相关；
5. Server Layout：上述的每个选项都可以重复设置，这里则是 X Server 要使用哪个选项值的设置。

设置完成后，需要重启 X Server 才会生效。

xorg.conf 各个 Section 的作用以及详细可用参数，可以查阅 [xorg.conf 手册](https://www.x.org/releases/current/doc/man/man5/xorg.conf.5.xhtml)。



## XRandR

XRandR 是 X11 提供的 RandR（Resize and Rotate）拓展配置工具。它可以被用来设置屏幕的大小、旋转，以及多屏幕显示。下面我们来看看 XRandR 的一些简单操作方法。

### 这玩意儿怎么用？

使用 `xrandr` 命令可以查看当前的显示参数。

``` bash
$> xrandr
Screen 0: minimum 8 x 8, current 3840 x 1080, maximum 32767 x 32767
DP-0 disconnected (normal left inverted right x axis y axis)
HDMI-0 connected primary 1920x1080+1920+0 (normal left inverted right x axis y axis) 527mm x 293mm
   1920x1080     60.00*+  74.99    59.94    50.00    60.00    50.04  
   1680x1050     59.95  
   1600x900      60.00 
…
```

我们可以使用如下命令设置 `HDMI-0` 的分辨率。

``` bash
$> xrandr --output HDMI-0 --mode 1920x1080
```

`--auto` 参数可以打开指定的视频输出，并为其自动设置分辨率。关闭视频输出可以用 `--off` 参数。

``` bash
$> xrandr --output HDMI-0 --auto	#打开 HDMI-0
$> xrandr --output HDMI-0 --off		#关闭 HDMI-0
```

`--listproviders` 参数可以查看当前的提供视频输出的设备（显卡）。

``` bash
$> xrandr --listproviders
Providers: number : 2
Provider 0: id: 0x24e cap: 0x1, Source Output crtcs: 4 outputs: 3 associated providers: 1 name:NVIDIA-0
Provider 1: id: 0x47 cap: 0xb, Source Output, Sink Output, Sink Offload crtcs: 4 outputs: 4 associated providers: 1 name:Intel
```

更完整的 XRandR 使用方法，可以参见 [XRandR 的 Archlinux百科](https://wiki.archlinux.org/index.php/xrandr)。



### 哥追求的是个性化

-  `1920x1080` 是 XRandR 预设的一个显示器参数设置。如果要设置自己的想要的分辨率和刷新率，可以通过 `gtf` 命令来得到相应的 mode 模板。`gtf` 后面接三个参数——水平像素、垂直参数、刷新率。

``` bash
# 使用 1680x1050 的分辨率，使用 120Hz 的刷新率
$> gtf 1680 1050 120

  # 1680x1050 @ 120.00 Hz (GTF) hsync: 135.00 kHz; pclk: 313.20 MHz
  Modeline "1680x1050_120.00"  313.20  1680 1816 2000 2320  1050 1051 1054 1125  -HSync +Vsync
```

- 然后将 Modeline 后面的内容复制下来，粘贴到 `xrandr` 命令的 `--mode` 后面，如下所示。运行即可。

``` bash
$> xrandr --output HDMI-0 --mode 313.20  1680 1816 2000 2320  1050 1051 1054 1125  -HSync +Vsync
```



### 多显示器怎么设置呢？

如果你是多显示器用户，XRandR 可以帮助你设置多个屏幕之间的相对位置（使用 `--right-of`、`--left-of`、`--above`、`--below` 参数），或者设置屏幕绝对坐标（使用 `--pos` 参数）。

``` bash
# 放置屏幕 HDMI-0 在屏幕 DP-0 的右边
$ xrandr --output DP-0 --auto --output HDMI-0 --auto --right-of DP-0
```

更多多显示器的设置方法，可以参见 [Configuration using xrandr](https://wiki.archlinux.org/index.php/Multihead#Configuration_using_xrandr)。

- 调整多屏幕间位置，推荐使用 XRandR 的可视化终端 ARandR，可以直观便捷地通过鼠标拖动设置屏幕直接的位置关系。使用 `sudo apt install arandr` 指令进行下载。不推荐在 Deepin `设置-显示` 中直接进行多屏幕调整，目前其功能不完善，漏洞百出。



## 开始多屏幕设置吧

前面一口气讲了好多的背景知识，这一节我们就来看看，如何上手一步一步配置好我们的多屏幕吧～

### 最简单的情况

假设我们的主机连有两个显示器，分别接在 HDMI 口和 DP 口上。设置步骤如下：

1. 连接好主机与显示器。使用 `xrandr` 命令检查 HDMI-0 和 DP-0 是否连接成功，连接成功的输出口会显示 `connected` 字样，反之就为 `disconnected`。
2. 设置屏幕之间的相对位置。（可以用下面的指令，也可以直接用 ARandR）

``` bash
# 放置屏幕 HDMI-0 在屏幕 DP-0 的右边（屏幕拓展）
$ xrandr --output DP-0 --auto --output HDMI-0 --auto --right-of DP-0
# 屏幕 HDMI-0 和屏幕 DP-0 显示相同的内容（屏幕复制）
$ xrandr --output DP-0 --auto --output HDMI-0 --auto --same-as DP-0
```

这样简单的两个步骤之后，多屏幕就设置好啦。但是，这样配置之后，每次重新启动电脑都需要重新配置一次，因为电脑并不会保存我们在控制台中的更改。那有没有办法使我们的配置永久生效呢？



### 如何保存配置？

实际上，我们有多种方法来预设好我们的屏幕扩展参数，在开机时让 X Server 自动调用，这样我们就不用每次开机都要输一遍指令啦！

#### 方法一：修改 Xorg 配置

通过修改 Xorg 配置来让 X Server 每次启动时读取我们的设定配置，这是最正统的方法。由于只需要修改与显示相关的设置，因此我们选择在 `/etc/X11/xorg.conf.d/` 目录下新建一个后缀为 `.conf` 的配置文件，在文件中加入我们需要的选项即可。

以下是配置文件的范例。

``` python
Section "ServerLayout"
    Identifier "layout"
	Screen 0 "Screen0"	# 使用 Screen0 作为主屏幕
EndSection

Section "Monitor"	# 显示器
    Identifier "DP-0" 	# Identifier 与 xrandr 输出中的名字保持一致
EndSection

Section "Monitor"
    Identifier  "HDMI-0"
EndSection

Section "Device"	# 显卡的驱动程序，很重要的设置
    Identifier  "Card0"
    Driver      "intel"		# 实际使用的显卡驱动程序（Intel）
    BusID       "PCI:0:2:0"	# 显卡总线ID（通过 lspci 命令查看）
EndSection

Section "Device"
    Identifier  "Card1"
    Driver      "nvidia"	# 实际使用的显卡驱动程序（NVIDIA）
    BusID       "PCI:1:0:0" # 显卡总线ID
EndSection

Section "Screen"	#与显示的界面有关
    Identifier "Screen0"
    Device "Card0"		# 使用哪一个显卡
    Monitor "DP-0"      # 使用哪一个显示器
    SubSection "Display"	# 此阶段的附属设置选项
    	Modes "1920x1080"	# 分辨率设置
    	Viewport 0 0		# 屏幕的左上角坐标
    EndSubSection
EndSection

Section "Screen"
    Identifier "Screen1"
    Device "Card1"
    Monitor "HDMI-0"
    SubSection "Display"
    	Modes "1920x1080"
    	Viewport 1920 0 	# HDMI-0 屏幕设置在 DP-0 的屏幕右边
    EndSubSection
EndSection
```

如上内容中，我们将显示器 `DP-0` 和 NVIDIA 显卡绑定在一起，显示器 `HDMI-0` 和 Intel 显卡绑定在一起，设置 `DP-0` 为主屏幕，并通过设置两者的显示坐标，来使得 `HDMI-0` 屏幕显示在 `DP-0` 屏幕右侧。文件保存后，重启系统便会生效。

两个屏幕的位置效果如下图所示。

```
(0,0)-----------------+(1920,0)--------------+
|                     ||                     |
|     1920 x 1080     ||     1920 x 1080     |
|         DP-0        ||       HDMI-0        |
|                     ||                     |
+---------------------++---------------------+
```

自己编写 `xorg.conf` 配置文件时，需要结合自己电脑的具体情况，正确配置显卡（Device）、显示器（Monitor）和屏幕（Screen）之间的关系。如果任何一项配置错误，都可能导致无法启动 X Server，从而无法进入到桌面。如果真的进入不到桌面了，只能进入命令行模式，修正 `xorg.conf` 文件，使 X Server 能够正确启动。

#### 方法二：修改 LightDM 配置

对于上一种方法的小伙伴，很有可能会担心自己文件编写错了怎么办，要是一通捯饬之后进不了桌面就不好弄了。所以，在这里提供一个更简单更安全的方法——修改 LightDM 的配置文件 `lightdm.conf`。

LightDM（Light Display Manager）是一个轻量级的 Linux 桌面的桌面显示管理器。 Deepin 使用的便是 LightDM 而非传统 Ubuntu 使用的 GDM。X Server 启动后，LightDM 便会启动。我们可以考虑将我们设置多屏幕的命令写在一个脚本中，让 LightDM 启动时执行该脚本，这样一来进入到桌面时，多屏幕就已经为我们设置好了。下面我们来看看具体应该怎么操作。

首先，新建一个文件作为我们的脚本文件，放到任何你喜欢的目录下。（例如放到 `/etc` 目录下，取名为 `MonitorInit`）

``` bash
$> touch /etc/MonitorInit	# 新建文件
```

打开文件，将需要执行的命令输入其中，一行放一个命令。保存。（范例如下）

```bash
xrandr --output HDMI-0 --auto --mode 1920x1080
xrandr --output DP-0 --auto --mode 1920x1080
xrandr --output HDMI-0 --right-of DP-0
```

为该文件赋予可执行权限。

``` bash
$> chmod +x /etc/MonitorInit
```

然后打开 LightDM 的配置文件 `lightdm.conf`。

``` bash
$> code /etc/lightdm/lightdm.conf	#使用 VScode 打开文件
```

找到其中的 `#display-setup-script=` 一行，去掉 `#` 注释，等号后面写入我们的创建的脚本的路径。

``` bash
display-setup-script="/etc/MonitorInit"
```

保存。之后每次重启系统时，LightDM 都会自动执行我们脚本中的命令啦。

参考 [Configuration_using_xorg.conf](https://wiki.archlinux.org/index.php/Multihead#Configuration_using_xorg.conf)。

#### 方法三：修改 ~/.profile 文件

想要让 Linux 系统在开机时执行一些预定的命令，传统的方法是将命令写在 `~/.profile` 文件中。

打开 `~/.profile` 文件，将需要执行的命令写在文件的最后面。保存。需要注意的是，如果 `~/.bash_profile` 和 `~/.bash_login` 文件存在，需要删除这两个文件，否则 `~/.profile` 文件中的内容不会被系统执行。

这种方法最简单，但是 `~/.profile` 文件只有在用户登录后，才会被读取并执行。并且也只对一个用户生效。因此，如果想要命令在登录前被执行，还是推荐使用方法二。



### 复杂一点的情况

想象以下情况：学生小明是一个笔记本用户，他的笔记本电脑只能通过集成的 Intel GPU 访问 LVDS1（笔记本电脑内部屏幕）和 VGA 输出； HDMI 和 DP 输出口则连接到 NVIDIA 独立显卡。他将外接显示器连在了笔记本的 HDMI 输出口上，想要作为笔记本屏幕的扩展屏幕。但由于两个视频输出由两张显卡分别提供，因此 `xrandr` 无法同时检测到两个输出口。

要解决这种情况，就需要用到下面这种称为 Reverse PRIME（翻转主要输出设备） 的方法。

#### Reverse PRIME

对于有两个 GPU 的情况，如果第二个 GPU 具有主 GPU 无法访问的视频输出，则可以使用 Reverse PRIME 方法来使用它们——即使用主 GPU 渲染图像，然后将渲染好的图像传递给第二个 GPU。如下命令将会把 `provider` 设置为 `output` 的输出口。

``` bash
$> xrandr --setprovideroutputsource provider source
```

针对小明的情况，我们可以使用下面的命令，将集成显卡作为主 CPU 进行渲染图像的工作，独立显卡设置为集成显卡的输出口。

``` bash
$> xrandr --setprovideroutputsource nvidia Intel
```

执行完如上命令，独立显卡和集成显卡的输出就会同时出现在 `xrandr` 中了。

小明非常开心，这下终于可以用上双屏幕了！

但是，使用性能较弱的集成显卡来进行图像渲染，性能较强的独立显卡反而只作为一个图像输出中介，好像不太对？

#### 独立显卡作为主显卡

让性能较弱的集成显卡来负责图像渲染，明显浪费了独立显卡的高性能。要让独立显卡来作为主要显卡，我们需要对 Xorg 配置进行修改。在 `/etc/X11/xorg.conf.d/` 路径下创建一个后缀名为 `.conf` 的文件，添加如下内容。

```python
Section "ServerLayout"
    Identifier "layout"
    Screen 0 "nvidia"	# nvidia 设置为主屏幕
    Inactive "intel"	# 禁用 intel 屏幕
EndSection

Section "Device"
    Identifier  "nvidia"
    Driver      "nvidia"
    BusID       "PCI:1:0:0" # 根据自己电脑情况进行修改
EndSection

Section "Screen"
    Identifier "nvidia"
    Device "nvidia"
EndSection

Section "Device"
    Identifier  "intel"
    Driver      "intel"
    BusID       "PCI:0:2:0"  # 根据自己电脑情况进行修改
EndSection

Section "Screen"
    Identifier "intel"
    Device "intel"
EndSection
```

保存并重启后，HDMI 和 DP 输出口成为了主输出，LVDS1 和 VGA 输出口被关闭。用如下命令重新启用它们。

``` bash
$> xrandr --setprovideroutputsource Intel nvidia 
```

现在四个输出口就都被启用了。

内容参考自 [Reverse PRIME](https://wiki.archlinux.org/index.php/PRIME#Reverse_PRIME)。



### 错误诊断

先写到这儿吧，写着好累啊～～剩下的内容以后再继续补充。