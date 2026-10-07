# mistatle.github.io

个人网站。Markdown 是内容源，`build.mjs` 生成静态页面，GitHub Actions 发布 `dist/`。

```bash
npm ci
npm run dev       # http://127.0.0.1:4321，修改后自动重建
npm run build
npm test          # 构建后检查内部链接、公式、双语附件与旧地址
```

推送到 `main` 自动构建、检查并部署。GitHub Pages 的 Source 使用 **GitHub Actions**。

## 内容与首页

- 首页精选由 `content/site.json` 的 `featured` 指定，顺序由作者决定；最近更新按文章日期排列。
- 笔记页优先显示已发布文章，提供搜索、主题与阅读形式筛选。
- `short` 表示聚焦一个问题的短篇，`note` 表示完整笔记；它们不是难度等级。
- 专题由 `collections` 定义，只在有文章时生成 `/topics/<id>/`，文章底部连接同一专题的内容。
- 待读论文和待写选题不进入公开阅读入口。

## 添加笔记

在 `content/notes/` 新建 `my-slug.md`：

```yaml
---
title: "一个具体问题"
description: "这篇文章解释什么，以及读者能得到什么。"
date: "2026-10-07"
publish: false
format: "short"  # short / note
track: "foundations"  # foundations / algorithms / systems
area: "probability"
kind: "derivation"
collection: "probability-concentration"  # 可省略
tags: ["概率"]
pdf: "/downloads/my-note.pdf"  # 可省略，文件放 static/downloads/
---
```

只有显式设置 `publish: true` 且没有 `draft: true` 的文章或资源页面才会生成。正文完成不意味着自动发布。新文件默认不公开；不要把私密草稿提交到公开仓库。

主线、领域、阅读形式和专题定义在 `content/site.json`，无效值会使构建失败。资源页也需要 `publish: true`。

## 数学排版

行内公式 `$a^2$`，独立公式 `$$ ... $$`。Markdown 代码块不会被当作公式。

```markdown
> **Definition 1（对象）**
>
> 定义正文。

> **Theorem 1（结论）**
>
> 精确假设与结论。

> **Proof**
>
> 证明正文。
```

Definition / Assumption 使用左侧色条，Theorem / Proposition / Lemma / Corollary 使用标题框，Proof 使用正文排版；对应中文标签同样有效。以这些标签开头的旧标题也保留锚点并使用对应环境。

脚注：`[^1]`，另起一行 `[^1]: 内容`。单独成段的图片可放大。

## 中英双语

- 中文在 `/notes/x/`，英文在 `/en/notes/x/`。
- `my-slug.md` 携带共同元数据；`my-slug.en.md` 提供英文标题、摘要、正文和可选的独立 `pdf`。
- 没有英文正文时，英文页面显示中文原文并提示；无需为每一篇强制制作译文。
- 界面文字在 `src/i18n.mjs`。

## 资源与旧链接

`content/resources/*.md` 是资源介绍，`static/downloads/` 是可下载附件。`content/resources.json` 可添加简单工具或外部链接。`content/papers.json` 仅保留有对应公开笔记的原始文献。

原有 `/public/data/` 下载地址保留；旧首页的 `#/writing/read/...` 和资源链接跳转到新页面，中英文选择一并保留。`/writing/deep-exploration/` 继续指向其英文版。

`public/data/` 是兼容旧地址的历史快照。后续文章只编辑 `content/`，不要维护两份正文。旧单页网站可从迁移前的 Git 历史恢复。

评论和统计仍由 `content/site.json` 配置，留空时不加载。
