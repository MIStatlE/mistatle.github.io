---
title: EN Article / Expository Template
date: 2026-03-13
categories: LaTeX Template
description: 一套偏英文 expository article / handout 风格的 XeLaTeX 模板。适合 lecture note、blog-to-paper 型技术文章和英文讲义，不走书籍模板，也不做知识卡片。
tags: [LaTeX, Article, Expository, XeLaTeX]
---

### Preview Gallery

<div class="template-gallery">
  <img src="assets/images/latex-template/en-article-preview-1.png" alt="EN article template preview page 1">
  <img src="assets/images/latex-template/en-article-preview-2.png" alt="EN article template preview page 2">
  <img src="assets/images/latex-template/en-article-preview-3.png" alt="EN article template preview page 3">
</div>

### 🎨 Design Philosophy

这套模板来自你原来的 `EN.tex`，但我没有沿着旧式“课堂讲义框线”继续堆，而是把它整理成更适合 **English expository notes** 的形式：

* **Top metadata bar**: 文章标题、subtitle、author、affiliation、topic tags 都在首页一次讲清。
* **Reader-friendly hierarchy**: section 标题、theorem、remark、roadmap、insight 的视觉层级很明确。
* **Between paper and blog**: 它不像正式论文那么硬，也不像短卡片那样极简，适合英文长笔记和说明性文章。

---

### ✨ Why It Was Kept

这套模板和站内已有模板的差异足够大：

* 它是 **English article / handout** 定位，不是中文短文，也不是书籍。
* 首页信息结构更接近博客转讲义、讲义转文章的中间态。
* 特别适合写一篇独立的理论笔记、课程 handout 或技术说明文。

---

### 📦 Prerequisites

* **Compiler**: `XeLaTeX` 或 `LuaLaTeX`
* **Packages**: `fontspec`, `microtype`, `tcolorbox`, `titlesec`, `fancyhdr`, `tikz`, `mathtools`, `amsthm`, `enumitem`
* **Recommended fonts**:
  * Serif: `Times New Roman` or fallback `TeX Gyre Termes`
  * Sans: `Helvetica Neue` or fallback `TeX Gyre Heros`
  * Mono: `JetBrains Mono` or fallback `Menlo / Courier New`

---

### 📥 Source Files

* [EN.tex](public/data/templates/en_article_source/EN.tex)

---

### 🛠️ What Was Improved

相对原始 `EN.tex`，这版主要改了这些：

* 重新整理版面尺寸和行距，让屏幕阅读更舒服。
* 用顶部 meta panel 取代旧式课程框线。
* `Roadmap / Insight / Example / theorem` 统一到同一套色板和盒子语言。
* 增加字体 fallback 与更稳定的 header/footer 配置。

---

### ✍️ Usage

直接改 `\MakeArticleHeader` 里的标题、副标题、作者和 tags 即可开始写。正文建议主要用：

* `RoadmapBox`
* `InsightBox`
* `ExampleBox`
* `theorem / proposition / remark`

来组织一篇完整的英文说明型笔记。

