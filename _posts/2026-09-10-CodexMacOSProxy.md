---
title: macOS 上为 Codex 桌面端设置代理
date: "2026-09-10 10:00:00 +0800"
description: "Codex 经常因网络问题连续重试？用一个启动脚本同时配置代理环境变量和桌面端代理参数。"
categories: [Technique, Environment Setting]
tags: [note, macOS, codex, lang-zh]
---

在 macOS 上使用 Codex 桌面端时，网络不稳定可能让一次请求连续重试 5 次。等待重试不仅浪费时间，长任务也容易因此中断。

如果电脑上已经运行 Clash Verge、Mihomo、Surge 等代理软件，可以为 Codex 准备一个专用启动脚本。以后通过一条命令启动 Codex，桌面端及其内嵌命令行工具就会自动使用本地代理。

## 最简单的方法

先在代理软件中确认 HTTP 或 Mixed 端口。本文以 `127.0.0.1:7897` 为例，然后把下面这段话直接粘贴给 Codex：

```text
请帮我在这台 macOS 电脑上配置 Codex 桌面端代理。

本地 HTTP/Mixed 代理地址是 http://127.0.0.1:7897。请创建一个
~/.local/bin/codex-proxy 启动脚本，同时设置 HTTP_PROXY、HTTPS_PROXY、
ALL_PROXY、NO_PROXY 及对应的小写环境变量，并使用 Chromium 参数
--proxy-server=http://127.0.0.1:7897 和 --disable-quic 启动 Codex。

脚本需要自动查找 /Applications/Codex.app 或 /Applications/ChatGPT.app，
启动前检查代理端口是否可用，并在 ~/.zshrc 中添加 codex-proxy 快捷命令。
不要修改系统代理、代理软件配置或 App 内部文件。完成后检查脚本语法，
并告诉我以后应该怎样启动 Codex。
```

Codex 配置完成后，先按 `Command + Q` 完全退出当前正在运行的 Codex，再打开终端执行：

```zsh
source "$HOME/.zshrc"
codex-proxy
```

以后使用时，只要先打开代理软件，再在终端运行：

```zsh
codex-proxy
```

下面是这套配置的手动设置过程。如果已经让 Codex 自动完成，可以直接跳过。

## 手动配置

### 创建启动脚本

首先确认代理软件提供的 HTTP 或 Mixed 端口。本文以 `127.0.0.1:7897` 为例；如果使用其他端口，请修改脚本开头的 `PROXY_PORT`。

新建文件 `~/.local/bin/codex-proxy`：

```zsh
#!/bin/zsh

PROXY_HOST="127.0.0.1"
PROXY_PORT="7897"
PROXY_URL="http://${PROXY_HOST}:${PROXY_PORT}"
NO_PROXY_LIST="localhost,127.0.0.1,::1"

if [[ -x "/Applications/Codex.app/Contents/MacOS/Codex" ]]; then
  APP_EXEC="/Applications/Codex.app/Contents/MacOS/Codex"
elif [[ -x "/Applications/ChatGPT.app/Contents/MacOS/ChatGPT" ]]; then
  APP_EXEC="/Applications/ChatGPT.app/Contents/MacOS/ChatGPT"
else
  echo "未找到 Codex 或 ChatGPT 桌面应用"
  exit 1
fi

if ! nc -z -w 1 "$PROXY_HOST" "$PROXY_PORT"; then
  echo "代理端口 ${PROXY_HOST}:${PROXY_PORT} 未启动"
  exit 1
fi

export HTTP_PROXY="$PROXY_URL"
export HTTPS_PROXY="$PROXY_URL"
export ALL_PROXY="$PROXY_URL"
export NO_PROXY="$NO_PROXY_LIST"
export http_proxy="$HTTP_PROXY"
export https_proxy="$HTTPS_PROXY"
export all_proxy="$ALL_PROXY"
export no_proxy="$NO_PROXY"

exec "$APP_EXEC" \
  "--proxy-server=$PROXY_URL" \
  "--disable-quic"
```

创建目录并添加执行权限：

```zsh
mkdir -p "$HOME/.local/bin"
chmod 700 "$HOME/.local/bin/codex-proxy"
```

这里同时设置了代理环境变量和 Chromium 的 `--proxy-server` 参数，可以覆盖 Codex 桌面界面、内嵌 CLI 以及大部分子进程的网络请求。`NO_PROXY` 保留本机地址，避免本地服务也被转发到代理。

### 添加快捷命令

在 `~/.zshrc` 中加入别名：

```zsh
alias codex-proxy="$HOME/.local/bin/codex-proxy"
```

重新加载配置：

```zsh
source "$HOME/.zshrc"
```

以后先用 `Command + Q` 完全退出已经运行的 Codex，再在终端执行：

```zsh
codex-proxy
```

Codex 就会通过本地代理启动。需要注意，不要再点击 Dock 中的普通图标启动，否则这次启动不会带上代理配置。

### 检查是否生效

启动后执行：

```zsh
pgrep -alf '/Applications/(Codex|ChatGPT).app/Contents/MacOS/'
```

如果输出中包含下面的参数，就说明代理配置已经传给桌面端：

```text
--proxy-server=http://127.0.0.1:7897
```

之后只需保持代理软件运行，并始终通过 `codex-proxy` 启动 Codex 即可。
