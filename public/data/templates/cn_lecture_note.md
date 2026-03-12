---
title: CN Lecture Note Template
date: 2026-03-13
categories: LaTeX Template
description: 一套偏课程讲义风格的中文 XeLaTeX 模板，适合数学、优化和学习理论类笔记。保留 lecture note 的编号系统，同时把页眉、定理盒子和首页信息条统一成更稳的视觉语言。
tags: [LaTeX, Lecture Note, CTeX, XeLaTeX]
---

### Preview Gallery

<div class="template-gallery">
  <img src="assets/images/latex-template/cn-lecture-preview-1.png" alt="CN lecture template preview page 1">
  <img src="assets/images/latex-template/cn-lecture-preview-2.png" alt="CN lecture template preview page 2">
  <img src="assets/images/latex-template/cn-lecture-preview-3.png" alt="CN lecture template preview page 3">
</div>

### 🎨 Design Philosophy (设计理念)

这套模板来自你原来的 `CN.tex`，但我没有把它做成“又一个短卡片模板”，而是保留了它更适合 **课程讲义 / 系列笔记 / 自媒体长笔记** 的定位：

* **Lecture 编号系统保留**：页码、公式、章节编号都可以按 lecture 编号组织，适合连续更新。
* **首页信息更清楚**：用一块讲义头部面板来放课程、学期、讲次、副标题和作者信息。
* **定理与说明环境更稳**：`definition / theorem / proposition / remark` 统一套进 `tcolorbox`，不再出现风格割裂。
* **适合中文技术写作**：默认 `XeLaTeX / LuaLaTeX + ctex`，并带有字体 fallback。

---

### ✨ Why It Was Kept (为什么它值得单独保留)

相对网站里已经有的 `Short Note` 和 `MI Book`，这套模板的新增价值在于：

* 它不是卡片，也不是书，而是更接近 **course handout** 的讲义结构。
* 它保留了 lecture note 常见的编号逻辑，这一点和现有两个模板都不一样。
* 它更适合一篇一篇地输出“课程笔记 / 章节讲义 / 长图文推导”。

相比之下，你给的 `latex模板 article.tex` 和 `latex模板 book.tex` 与站内现有模板的视觉语言和结构复用太高，所以我没有重复上架。

---

### 📦 Prerequisites (环境要求)

* **Compiler**: `XeLaTeX` 或 `LuaLaTeX`
* **Packages**: `ctex`, `fontspec`, `tcolorbox`, `titlesec`, `fancyhdr`, `tikz`, `mathtools`, `amsthm`, `cleveref`
* **Recommended fonts**:
  * English serif: `Times New Roman` or fallback `TeX Gyre Termes`
  * Chinese serif: `Noto Serif CJK SC` or fallback `Fandol`

---

### 📥 Source Files

* [CN.tex](public/data/templates/cn_lecture_source/CN.tex)

---

### 🛠️ What Was Improved (具体优化)

这版相对原始 `CN.tex` 主要做了这些事情：

* 去掉了原文件里重复或冲突的宏包加载。
* 增加字体 fallback，避免换机器后直接编译失败。
* 把首页课程信息改成统一的讲义头部组件。
* `Analysis / Remark / Summary / Example` 统一成一套盒子系统。
* 定理环境和页眉页脚重新整理，整份笔记更像“可直接发布的成品模板”。

---

### ✍️ Usage

这份源码本身就是一份可编译的示例模板。你可以直接：

1. 替换 `\LectureBanner` 里的课程名、讲次和作者信息。
2. 按需要保留或删除示例章节。
3. 继续在 `definition / theorem / AnalysisBox / SummaryBox` 这些环境里写内容。

