---
title: Reading and Inquiry
date: 2026-08-18
categories: LaTeX Template
description: 一份来源可核验的五页阅读模板：先建立初步判断，再由 AI 扩展假设空间，最后只写回经核验的修订。
tags: [LaTeX, Reading Notes, XeLaTeX, AI-Assisted]
---

### Preview

<div class="template-gallery">
  <img src="assets/images/latex-template/reading-inquiry-preview-1.png" alt="Reading and Inquiry page 1">
  <img src="assets/images/latex-template/reading-inquiry-preview-2.png" alt="Reading and Inquiry page 2">
  <img src="assets/images/latex-template/reading-inquiry-preview-3.png" alt="Reading and Inquiry page 3">
  <img src="assets/images/latex-template/reading-inquiry-preview-4.png" alt="Reading and Inquiry page 4">
  <img src="assets/images/latex-template/reading-inquiry-preview-5.png" alt="Reading and Inquiry page 5">
</div>

### 阅读推演

这份模板用于论文、报告、书章、长文与项目文档。它不要求第一次阅读就形成完整总结，而是保留三个连续阶段：

1. 建立初步判断：区分原文主张、证据与个人解释。
2. 展开候选解释：由 AI 提出概念区分、替代机制、反例与迁移。
3. 核验后的修订：重新回到来源，只写回经核验的变化。

核心原则是：

> 先形成判断，再扩展候选，最后核验写回。

AI 位于可选边栏。它用于扩展假设空间，而不直接修改主笔记。读者仍然负责选择分支、核验证据，并决定哪些内容值得保留。

### Worked Example

示例阅读 Rich Sutton 的 *The Bitter Lesson*。初读先记录来源、历史例证与个人解释；随后让 AI 展开澄清、反例与迁移分支；最后只保留经原文核验的修订。

### Files

* [PDF](public/data/templates/reading_inquiry_source/reading-inquiry.pdf)
* [paper-reading-brief.tex](public/data/templates/reading_inquiry_source/paper-reading-brief.tex)
* [README.md](public/data/templates/reading_inquiry_source/README.md)
* [LICENSE](public/data/templates/reading_inquiry_source/LICENSE)

### Compile

    xelatex paper-reading-brief.tex

成品为五页 7.5 x 10 英寸 PDF，可直接渲染为 1500 x 2000 的移动端图片。

### License

The source pack is released under the MIT License.
