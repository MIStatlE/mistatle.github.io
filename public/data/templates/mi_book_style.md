---
title: MI Book / Lecture Note Template
date: 2026-03-13
categories: LaTeX Template
description: 一本适合中文数学书、讲义和长笔记的 XeLaTeX 模板。保留书籍排版的层次感，同时把色带、定理盒子和页眉系统统一成更现代的 MIStatlE 风格。
tags: [LaTeX, Book, XeLaTeX, CTeX, Monograph]
---

### Preview Gallery

<div class="template-gallery">
  <img src="assets/images/latex-template/mi-book-preview-1.png" alt="MI book template preview page 1">
  <img src="assets/images/latex-template/mi-book-preview-2.png" alt="MI book template preview page 2">
  <img src="assets/images/latex-template/mi-book-preview-3.png" alt="MI book template preview page 3">
  <img src="assets/images/latex-template/mi-book-preview-4.png" alt="MI book template preview page 4">
</div>

### 🎨 Design Philosophy (设计理念)

这套模板服务的不是“一页知识卡片”，而是 **book / lecture notes / monograph** 这类更长的材料。目标不是把书做得花，而是让结构更稳、视觉识别更统一：

* **书籍层级保留**：继续使用 `book` 类的 `part / chapter / section`，适合讲义、系列笔记、预印本。
* **风格统一**：把封面、彩带、页眉页脚、定理环境和提示盒子收进同一套配色系统。
* **更稳的依赖**：字体改成“优先系统字体，找不到就回退 TeX Gyre / Fandol”，避免模板一换机器就直接炸。
* **定理更可读**：`definition / theorem / lemma / corollary / remark` 不再裸奔，而是统一套上与短模板接近的边栏盒子。
* **更适合中文技术写作**：默认 `XeLaTeX / LuaLaTeX + ctex`，同时保留英文标题和数学环境的整洁度。

---

### ✨ What Was Improved (这次具体优化了什么)

相对你原始的 `main.tex + miextras.sty`，这版主要做了这些实质性调整：

* 把 `.sty` 内部的包加载整理成更标准的结构，核心依赖改成 `\RequirePackage`。
* 增加字体 fallback，不再强依赖单一系统字体。
* 页脚不再硬编码固定书名，拆成 `\BookShortTitle` 和 `\BookFooterLabel` 两个可覆写宏。
* 去掉 `mdframed`，统一由 `tcolorbox` 处理 `KeyBox / SideBar / Example / Takeaway`。
* `amsthm` 的定理环境外层套了 `tcolorbox` 皮肤，视觉和短模板更接近。
* 增加 `hyperref`、常用数学宏、列表间距设置，让长文档更像成品模板而不是草稿脚手架。

---

### 📦 Prerequisites (环境要求)

* **Compiler**: `XeLaTeX` 或 `LuaLaTeX`
* **Packages**: `ctex`, `fontspec`, `tcolorbox`, `titlesec`, `fancyhdr`, `tikz`, `mathtools`, `amsthm`
* **Recommended fonts**:
  * English serif: `Times New Roman` or fallback `TeX Gyre Termes`
  * Chinese serif: `Noto Serif CJK SC` or fallback `Fandol`
  * Monospace: `JetBrains Mono` or fallback `Menlo / Courier New`

---

### 📥 Source Files

* [main.tex](public/data/templates/mi_book_source/main.tex)
* [miextras.sty](public/data/templates/mi_book_source/miextras.sty)

---

### 🛠️ Step 1: Style File (`miextras.sty`)

下面是优化后的完整样式文件。核心思路是：字体与页脚改成可覆写，视觉语言继续保留 MIStatlE 的侧边彩带和柔色块，但把定理与说明环境统一成一套盒子系统。

```latex
\NeedsTeXFormat{LaTeX2e}
\ProvidesPackage{miextras}[2026/03/13 MIStatlE book and lecture note style]

\RequirePackage{iftex}
\ifPDFTeX
  \PackageError{miextras}{Please compile with XeLaTeX or LuaLaTeX}{This package relies on fontspec and CJK font support.}
\fi

\RequirePackage[fontset=fandol]{ctex}
\RequirePackage{fontspec}
\RequirePackage{geometry}
\RequirePackage{xcolor}
\RequirePackage{hyperref}
\RequirePackage{titlesec}
\RequirePackage{fancyhdr}
\RequirePackage{tikz}
\RequirePackage{eso-pic}
\usetikzlibrary{calc,positioning}
\RequirePackage[most]{tcolorbox}
\RequirePackage{enumitem}
\RequirePackage{mathtools}
\RequirePackage{amsmath,amssymb,bm,amsthm}

\geometry{
  paperwidth=6in,
  paperheight=9in,
  inner=0.92in,
  outer=0.78in,
  top=0.92in,
  bottom=0.95in,
  headsep=0.24in,
  footskip=0.42in,
  bindingoffset=0.08in
}

\IfFontExistsTF{Times New Roman}{\setmainfont{Times New Roman}}{\setmainfont{TeX Gyre Termes}}
\IfFontExistsTF{Helvetica Neue}{\setsansfont{Helvetica Neue}}{\setsansfont{TeX Gyre Heros}}
\IfFontExistsTF{JetBrains Mono}{\setmonofont{JetBrains Mono}}{\IfFontExistsTF{Menlo}{\setmonofont{Menlo}}{\setmonofont{Courier New}}}
\IfFontExistsTF{Noto Serif CJK SC}{\setCJKmainfont{Noto Serif CJK SC}}{}
\IfFontExistsTF{Noto Sans CJK SC}{\setCJKsansfont{Noto Sans CJK SC}}{}

\linespread{1.24}
\setlength{\parindent}{1.6em}
\pagecolor{white}
\color{black}

\definecolor{brand}{HTML}{1A9D8F}
\definecolor{brandD}{HTML}{2A7F6F}
\definecolor{keybg}{HTML}{E8F4F1}
\definecolor{keydark}{HTML}{2F5E58}
\definecolor{secblue}{HTML}{2B44C6}
\definecolor{accent}{HTML}{F97352}
\definecolor{accentD}{HTML}{C44536}
\definecolor{plum}{HTML}{6C5CE7}
\definecolor{plumBg}{HTML}{F2EEFF}
\definecolor{soft}{HTML}{F6FBFA}
\definecolor{ink}{HTML}{1A1A1A}

\hypersetup{
  colorlinks=true,
  linkcolor=brandD,
  citecolor=brandD,
  urlcolor=secblue
}

\newcommand{\seriesnum}{I}
\newcommand{\BookShortTitle}{Lecture Notes}
\newcommand{\BookFooterLabel}{@MIStatlE}
\newcommand{\E}{\mathbb{E}}
\DeclareMathOperator{\Var}{Var}
\DeclarePairedDelimiter{\abs}{\lvert}{\rvert}
\DeclarePairedDelimiter{\norm}{\lVert}{\rVert}

\tcbset{
  mi-elegant/.style={
    enhanced, breakable,
    colback=white, colframe=#1,
    boxrule=0.6pt, arc=3pt,
    left=10pt,right=10pt,top=12pt,bottom=10pt,
    before skip=10pt,after skip=10pt,
    borderline west={3pt}{0pt}{#1}
  },
  mi-notion/.style={
    enhanced, breakable, frame hidden,
    colback=#1!7, borderline west={3pt}{0pt}{#1},
    left=9pt,right=9pt,top=8pt,bottom=8pt,
    before skip=8pt,after skip=8pt, arc=2pt
  }
}

\newtcolorbox{KeyBox}{
  mi-elegant=brandD,
  title=\textbf{\color{white}Key Idea},
  colbacktitle=brandD,
  coltitle=white
}

\newtcolorbox{Takeaway}{
  mi-notion=accentD,
  title=\textbf{Takeaway},
  coltitle=accentD
}

\newtcolorbox{SideBar}{
  mi-notion=brand,
  title=\textbf{Sidebar},
  coltitle=brandD
}

\theoremstyle{plain}
\newtheorem{theorem}{定理}[chapter]
\newtheorem{lemma}[theorem]{引理}
\newtheorem{corollary}[theorem]{推论}

\theoremstyle{definition}
\newtheorem{definition}[theorem]{定义}

\theoremstyle{remark}
\newtheorem{remark}[theorem]{注}

\tcolorboxenvironment{theorem}{mi-elegant=secblue}
\tcolorboxenvironment{lemma}{mi-elegant=secblue}
\tcolorboxenvironment{corollary}{mi-elegant=secblue}
\tcolorboxenvironment{definition}{mi-notion=brandD}
\tcolorboxenvironment{remark}{mi-notion=accentD}
```

---

### ✍️ Step 2: Main File (`main.tex`)

`main.tex` 负责组织一本书的结构，而不是堆样式细节。也就是说，真正长期稳定的方式是：样式都留在 `.sty`，正文专注于 part / chapter / theorem / example / references。

```latex
\documentclass[10pt,openany]{book}
\usepackage{miextras}

\renewcommand{\seriesnum}{I}
\renewcommand{\BookShortTitle}{集中不等式}
\renewcommand{\BookFooterLabel}{@MIStatlE}

\begin{document}

\MakeBookCoverUltraSimple
  {集中不等式}
  {高维概率与机器学习理论中的浓缩现象}
  {上册 · 预印本}

\frontmatter
\setcounter{tocdepth}{2}
\TOCwithoutHeadFoot

\mainmatter
\part{预备知识与工具}
\chapter{次高斯变量与 Orlicz 范数}

\begin{SideBar}
\textbf{阅读建议}：这一章建立后文不断复用的语言系统。
\end{SideBar}

\section{核心定义}
\begin{definition}[Orlicz 范数]
随机变量 $Z$ 的 $\psi_2$ 范数定义为
\[
\norm{Z}_{\psi_2} := \inf\left\{ s>0 : \E \exp\left(\frac{Z^2}{s^2}\right) \le 2 \right\}.
\]
\end{definition}

\begin{lemma}[次高斯平方的次指数性]
若 $X$ 是中心化次高斯随机变量，则 $X^2-\E X^2$ 是次指数随机变量。
\end{lemma}

\begin{KeyBox}
\textbf{要点}：$\psi_2$ 控制尾部衰减，平方中心化后自然转向 $\psi_1$。
\end{KeyBox}

\part{主结果}
\chapter{Hanson--Wright 不等式}
\begin{theorem}[Hanson--Wright]
设 $X$ 的坐标独立、中心化且次高斯，则二次型 $X^\top A X$ 满足双尺度指数尾界。
\end{theorem}

\begin{Takeaway}
把二次型看成“线性浓缩 + 交叉项控制”的升级版，比死记公式更有价值。
\end{Takeaway}

\appendix
\part{附录}
\chapter{记号表}
\begin{itemize}
  \item $\E$：数学期望。
  \item $\Var$：方差算子。
\end{itemize}

\end{document}
```

---

### 🧭 When To Use This Template

适合这些场景：

* 一本中文数学讲义
* 系列 lecture notes / monograph
* 长于 10 页、需要目录和章节层级的预印本
* 自媒体长文底稿，如果你希望后续还能继续扩写成课程讲义

不太适合这些场景：

* 单页卡片
* 手机上滑几屏就结束的短知识点
* 需要强视觉实验风格的海报型排版

---

### ✅ Practical Notes

如果你要继续扩展这套书籍模板，我建议优先改这三个点，而不是乱加新环境：

1. `\BookShortTitle` 和 `\BookFooterLabel`
2. 颜色系统 `brand / brandD / secblue / accentD`
3. `mi-elegant` 和 `mi-notion` 两个盒子基类

这样模板会一直保持统一，而不会越改越散。
