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
