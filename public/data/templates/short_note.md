---
title: Short Note
date: 2026-01-14
categories: LaTeX Template
description: 一款极致紧凑、高颜值的 LaTeX 速查表/短文模板。融合了小红书的卡片美学与 Notion 的 Block 风格，专为屏幕阅读和知识卡片设计。
tags: [LaTeX, TColorBox, Cheatsheet, Minimalist]
---

### 🎨 Design Philosophy (设计理念)

这款模板专为 **"Micro-Learning" (微学习)** 场景设计。
传统的 LaTeX `article` 边距太大，不适合在手机或平板上阅读短小的知识点。本模板做了以下优化：

* **极致紧凑 (Compact Layout)**：7.5x10 英寸版面，极窄边距，单页信息密度最大化。
* **混合风格 (Hybrid Style)**：
    * **Elegant Card**: 用于 `Key Idea` 和 `Theorem`，带有柔和阴影的悬浮卡片。
    * **Notion Style**: 用于 `Definition` 和 `Takeaway`，极简的左侧色条风格。
* **模块化 (Modular)**：样式与内容完全分离，通过 `\input` 导入。

### 📦 Prerequisites (依赖包)

请确保你的 TeX 发行版安装了以下宏包，并使用 **XeLaTeX** 编译（因为引入了 `ctex` 和 `fontspec`）：

```latex
\usepackage{tcolorbox} % 核心组件 (v4.50+)
\usepackage{tikz}      % 绘图引擎
\usepackage{ctex}      % 中文支持
\usepackage{geometry}  % 版面控制
\usepackage{fancyhdr}  % 页眉页脚
