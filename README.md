# mistatle.github.io

个人网站源码。内容是 Markdown，`build.mjs` 把它生成为 `dist/` 里的静态页面。

## 日常使用

```bash
npm install        # 只需一次
npm run dev        # 本地预览 http://localhost:4321 ，改动后自动重建
npm run build      # 生成 dist/
npm run check      # 检查 dist/ 里的内部链接，有断链时报错（部署前会自动运行）
```

推送到 `main` 后由 GitHub Actions 自动构建并发布（仓库 Settings → Pages → Source 需设为 **GitHub Actions**）。

## 写一篇新笔记

在 `content/notes/` 新建 `my-slug.md`，文件名即网址 `/notes/my-slug/`：

```markdown
---
title: "标题"
description: "一句话摘要，显示在列表和分享卡片里。"
date: "2026-10-07"
updated: "2026-11-01"   # 可省略
area: "information"     # 学科：probability / statistics / information / optimization / rl / theory / deep-learning / generative
track: "foundations"    # 地图上的层：foundations / algorithms / systems
kind: "derivation"      # 类型，只作标签显示：derivation / mechanism / foundation / paper
collection: "probability-concentration"   # 所属专题，可省略；显示在文章底部
tags: ["信息论"]
pdf: "/downloads/xxx.pdf"                 # 可省略；文件放 static/downloads/
draft: true                               # 可省略；为 true 时不发布
---

正文。行内公式 $a^2$，独立公式用 $$ ... $$ 。
以 **定义** / **定理** / **证明** / **注** 开头的引用块会自动套用对应样式。
脚注写作 [^1]，并在文末另起一行写 `[^1]: 说明文字`。单独成段的图片可以点击放大。
```

分类只有一层：学科。学科列表在 `content/site.json` 的 `areas` 里，可以增删；写了不存在的值，构建会直接报错并指出是哪个文件。

## 中英双语

- 中文在根路径（`/notes/x/`），英文在 `/en/` 下（`/en/notes/x/`），页眉右侧可以互相切换。
- `my-slug.md` 是中文版，并携带日期、分类等共用信息；英文版是同目录下的 `my-slug.en.md`，只需写 `title`、`description`、`tags` 和正文。
- 没有 `.en.md` 的页面，英文站会显示中文原文，并在顶部提示。
- 界面文字在 `src/i18n.mjs`；站点简介、主线、领域、专题等在 `content/site.json`，写成 `{ "zh": "…", "en": "…" }`。

## 知识地图

地图由 `content/map.json` 自动排版，不需要手动摆位置：

- `nodes`：`id`、`label`、`area`（主学科，和笔记用的是同一份列表，决定颜色和笔记归类）、可选的 `also`（它同样属于的其他学科，如 `["probability", "rl"]`）、`type`（concept / theorem / method / model / paper）和一句 `summary`。写完对应笔记后加上 `"note": "笔记文件名"`，节点就会点亮。
- `edges`：`from`、`to`、`type` 和一句 `why`。`type` 是关系类型：`requires` 前置、`derives` 推出、`applies` 应用、`extends` 延伸、`contrasts` 对比。
- `groups`（可选）：一门课里的章节，`{ "id": "…", "area": "学科", "title": { "zh": "…", "en": "…" } }`；节点写上 `"group": "章节 id"` 就归入这一章。

地图分两级，都由这一份文件生成：

- **大地图**（首页和笔记页）：一整块地面，每门学科是涂在地上的一片颜色。一个概念会被摆在它所属的几门学科之间，所以学科共享的概念越多，区域重叠越多；卡片下沿的色点就是它属于的学科。悬停学科名只看这一门，点学科名进入它的小地图，点概念在下方看说明。地面从后到前大致是数学基础、算法、系统（由 `track` 决定），但不再分层隔开。
- **小地图**（`/map/学科 id/`，有节点的学科才会生成）：画这门课的全部概念，包括主学科在别处、但 `also` 里列了它的概念（保留原来的颜色）。
  - 位置即顺序：节点在哪一列由课内指向它的关系链有多长决定，地面上的轨道给每一列编号。关系类型里写了 `"order": true`（现在只有 `requires`）且两端在相邻两列时，这条关系不再画线，只在下方面板里说明。
  - 同一章的节点在地面上圈在一起。
  - 通往这门课之外的概念的关系不画长线，变成卡片上的标签，点击跳到那个概念主学科的小地图并选中它（地址形如 `/map/generative/#vae-elbo`）。
  - 其余关系照常画线；连线会自动绕开挡在路上的节点。

文章底部的"前置与来源 / 后续与相关"也来自这份文件。

## 资源

资源页（`/resources/`）按 `content/site.json` 里的 `resourceTypes` 分组，内容有两个来源：

- `content/resources/*.md`：需要单独介绍页的资源，例如模板。frontmatter 里的 `type` 指定分组，`previews` 是预览图。
- `content/resources.json`：一行一个的简单条目，例如 `{ "type": "link", "title": { "zh": "…", "en": "…" }, "description": { … }, "url": "https://…" }`；`type` 可以是 `tool`、`link` 等，本站文件加 `"file": true`。

没有内容的分组不会显示。

## 评论、统计、论文清单

- **评论（giscus）**：在仓库 Settings 里开启 Discussions，到 giscus.app 填入仓库名后，把页面给出的 `data-repo-id` 和 `data-category-id` 填进 `content/site.json` 的 `comments.repoId`、`comments.categoryId`。两项留空时不显示评论区。
- **访问统计**：在 `content/site.json` 的 `analytics` 里填 GoatCounter 的站点代码，或 Umami 的脚本地址与网站 ID。留空时不加载任何统计脚本。
- **论文清单**：编辑 `content/papers.json`，它显示在笔记页的"论文"视图里，和笔记共用同一套筛选。`status` 可取 `noted`（已写笔记，配合 `note` 字段）、`reading`、`read`、`queued`。

## 全站搜索

页眉的搜索按钮（或 ⌘K / Ctrl+K）可以搜索笔记、地图上的概念、论文和资源。索引在构建时自动生成为 `search.json`，不需要维护。

## 目录

| 路径 | 内容 |
| --- | --- |
| `content/site.json` | 站点文字、社交链接、主线与专题 |
| `content/map.json` | 知识地图的节点与关系 |
| `content/papers.json` | 论文清单 |
| `content/notes/` | 笔记 |
| `content/resources/` | 资源页面（目前是 LaTeX 模板介绍），`type` 决定它出现在资源页的哪一组 |
| `content/resources.json` | 不需要单独页面的资源：外部链接、工具、文件 |
| `static/` | 原样复制到站点根目录的文件（图片、下载、favicon） |
| `src/site.css` | 全部样式，颜色变量在文件开头 |
| `src/layout.mjs` | 页面结构 |
| `src/markdown.mjs` | Markdown、公式、代码高亮 |
| `src/map.mjs` | 知识地图的排版与绘制 |
| `src/i18n.mjs` | 两种语言的界面文字 |
| `src/logo.mjs` | Logo（同时生成 favicon） |
| `check.mjs` | 构建后的链接检查 |
