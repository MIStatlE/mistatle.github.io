---
title: "MI Book / Lecture Note"
description: "For Chinese mathematics books and long lecture notes, with one reading system across headers, chapters, theorems and cover."
tags: ["Book", "XeLaTeX", "CTeX"]
---

## Design

This template is for longer material in Chinese: **books, lecture notes and monographs**. The aim is a stable structure and one consistent look:

* **Book hierarchy kept**: it uses the `book` class with `part / chapter / section`, which suits lecture notes, note series and preprints.
* **One visual system**: cover, ribbons, headers and footers, theorem environments and callout boxes share one palette.
* **Stable dependencies**: system fonts first, falling back to TeX Gyre / Fandol, so it compiles on another machine.
* **Readable theorems**: `definition / theorem / lemma / corollary / remark` are all set in sidebar boxes.
* **Overridable footer**: the short title and footer label are controlled by `\BookShortTitle` and `\BookFooterLabel`.

## Requirements

* **Compiler**: `XeLaTeX` or `LuaLaTeX`
* **Packages**: `ctex`, `fontspec`, `tcolorbox`, `titlesec`, `fancyhdr`, `tikz`, `mathtools`, `amsthm`
* **Recommended fonts**:
  * English serif: `Times New Roman`, falling back to `TeX Gyre Termes`
  * Chinese serif: `Noto Serif CJK SC`, falling back to `Fandol`
  * Monospace: `JetBrains Mono`, falling back to `Menlo / Courier New`

## Source files

* [main.tex](/downloads/templates/mi-book-style/main.tex)
* [miextras.sty](/downloads/templates/mi-book-style/miextras.sty)

## Step 1: the style file (`miextras.sty`)

The style file handles fonts, headers and footers, colors and every box environment. `KeyBox / SideBar / Example / Takeaway` and the theorem environments are all built on `tcolorbox`.

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

## Step 2: the main file (`main.tex`)

`main.tex` only organizes the structure of the book. Styling stays in the `.sty`; the body focuses on parts, chapters, theorems, examples and references. The sample content is in Chinese.

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

## When to use it

A good fit for:

* a set of mathematics lecture notes in Chinese
* a lecture note series or a monograph
* a preprint longer than 10 pages that needs a table of contents and chapters
* a long draft that may later grow into course notes

Less suitable for:

* one-page cards
* short items read in a few screens
* poster-like layouts with a strong visual style

## Extending it

To extend the template, change these three things first instead of adding new environments, so that the overall style stays coherent:

1. `\BookShortTitle` and `\BookFooterLabel`
2. the color system `brand / brandD / secblue / accentD`
3. the two box base styles `mi-elegant` and `mi-notion`
