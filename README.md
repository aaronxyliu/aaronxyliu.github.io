# Chirpy Personal Blog

基于 [Jekyll](https://jekyllrb.com/) 和 [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 构建的个人博客。

## 环境配置

项目使用 `.ruby-version` 固定 Ruby 3.3.12。建议使用 `rbenv` 管理 Ruby，避免系统 Ruby 或 Homebrew Ruby 4 与旧版 `html-proofer` 冲突。

### macOS

安装并初始化 `rbenv`：

```shell
brew install rbenv ruby-build
rbenv init
exec zsh -l
```

进入项目目录后安装项目指定的 Ruby 和依赖：

```shell
rbenv install -s "$(cat .ruby-version)"
ruby -v
bundle install
```

`ruby -v` 应显示 Ruby 3.3.12。首次执行 `bundle install` 会按照 `Gemfile.lock` 安装已经验证过的依赖版本；锁文件也已包含 GitHub Actions 所需的 Linux 平台依赖，无需手动运行 `bundle lock --add-platform`。

如果仍然显示 Ruby 4，请检查并重新加载 shell：

```shell
which ruby
rbenv version
exec zsh -l
```

## 本地启动

```shell
bundle exec jekyll serve --livereload
```

浏览器访问 <http://127.0.0.1:4000>。修改文章或页面后，Jekyll 会自动重新生成网站并刷新浏览器。

## 构建与检查

执行与 GitHub Actions 一致的生产构建：

```shell
JEKYLL_ENV=production bundle exec jekyll build -d _site
```

检查生成页面中的 HTML、内部链接和图片：

```shell
bundle exec htmlproofer _site --disable-external --no-ignore-empty-alt
```

推送到 `main` 或 `master` 分支后，GitHub Actions 会自动构建并部署 GitHub Pages。

## 写作与收录

- 文章写作方式参见 [Chirpy Writing a New Post](https://chirpy.cotes.page/posts/write-a-new-post/)。
- 可使用 [Google Search Console](https://search.google.com/search-console/about) 提交网站并查看搜索收录情况。

### 中英文界面

网站会根据文章语言分别显示中文或英文界面，包括目录、日期、阅读时间、文章导航和评论区域。新文章推荐在 Front Matter 中直接声明语言：

```yaml
lang: zh-CN # 中文文章
```

或：

```yaml
lang: en # English post
```

为了兼容现有文章，`lang-zh` 和 `lang-en` 标签也会分别自动映射为 `zh-CN` 和 `en`。如果同时存在 `lang` 与语言标签，以明确填写的 `lang` 为准。

### 同一篇文章的中英文版本

中英文分别保存为 Markdown 文章。在两篇文章的 Front Matter 中填写相同的 `translation_key`，并明确声明各自的 `lang`，标题下方就会自动显示 `中文 / English` 切换按钮。例如：

```yaml
# 中文版：_posts/2026-08-15-Formalization1.md
lang: zh-CN
translation_key: formalization-1
```

```yaml
# 英文版：_posts/2026-08-15-Formalization1-en.md
lang: en
translation_key: formalization-1
permalink: /posts/Formalization1-en/
```

每个 `translation_key` 下每种语言只保留一篇文章。只有一个版本时不会显示切换按钮；增加第二个版本后，两边会自动互链，并生成 `hreflang` 元数据。文章正文中的导读、章节导航和图片说明仍需按对应语言维护。尚未翻译的后续章节应标明“目前仅有中文”，不要链接到尚不存在的英文地址。

系列文章可以用 `series_navigation` 指定页底的阅读顺序，避免按发布日期跳到同一篇的另一个语言版本。省略 `previous` 或 `next` 表示该方向没有文章；未设置 `series_navigation` 的普通文章继续使用主题原来的时间顺序。

```yaml
series_navigation:
  previous: /posts/Formalization-guide-en/
  next: /posts/Formalization2-en/
```

切换按钮由 `_includes/post-language-switcher.html` 提供，配对元数据由 `_includes/metadata-hook.html` 提供。`_layouts/post.html` 基于 Chirpy 7.6.0 的原模板，在文章标题和描述之后插入切换组件，并给配对文章添加 `bilingual-post` 样式类，让长公式在窄屏内横向滚动；升级主题时应同步检查这份模板。
