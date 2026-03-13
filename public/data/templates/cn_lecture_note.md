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

---

### 🧾 Full Source (`CN.tex`)

下面附上完整可复制源码，和前两套模板一样，打开页面即可直接复制使用。

```latex
\documentclass[11pt]{article}

\usepackage{iftex}
\ifPDFTeX
  \errmessage{Please compile with XeLaTeX or LuaLaTeX}
\fi

\usepackage[fontset=fandol]{ctex}
\usepackage{fontspec}
\usepackage{geometry}
\usepackage{xcolor}
\usepackage{microtype}
\usepackage{hyperref}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{tikz}
\usetikzlibrary{positioning}
\usepackage[most]{tcolorbox}
\usepackage{amsmath,amssymb,amsthm,mathtools,bm}
\usepackage{enumitem}
\usepackage{booktabs}
\usepackage[capitalize,nameinlink]{cleveref}

\geometry{
  paperwidth=7.15in,
  paperheight=10in,
  left=0.78in,
  right=0.78in,
  top=0.78in,
  bottom=0.8in,
  headsep=0.24in,
  footskip=0.4in
}

\IfFontExistsTF{Times New Roman}{\setmainfont{Times New Roman}}{\setmainfont{TeX Gyre Termes}}
\IfFontExistsTF{Helvetica Neue}{\setsansfont{Helvetica Neue}}{\setsansfont{TeX Gyre Heros}}
\IfFontExistsTF{JetBrains Mono}{\setmonofont{JetBrains Mono}}{\IfFontExistsTF{Menlo}{\setmonofont{Menlo}}{\setmonofont{Courier New}}}
\IfFontExistsTF{Noto Serif CJK SC}{\setCJKmainfont{Noto Serif CJK SC}}{}
\IfFontExistsTF{Noto Sans CJK SC}{\setCJKsansfont{Noto Sans CJK SC}}{}

\linespread{1.24}
\setlength{\parindent}{1.6em}
\setlength{\parskip}{0.15em}

\definecolor{brand}{HTML}{4C6A92}
\definecolor{brandD}{HTML}{213A5A}
\definecolor{ink}{HTML}{1A1A1A}
\definecolor{keybg}{HTML}{EEF3F8}
\definecolor{keydark}{HTML}{24364E}
\definecolor{accent}{HTML}{C89A4B}
\definecolor{accentD}{HTML}{9B6A2F}
\definecolor{soft}{HTML}{F7F5F0}
\definecolor{xhsRed}{HTML}{B95E4A}
\definecolor{xhsDark}{HTML}{1F1F1F}
\definecolor{xhsCream}{HTML}{FBF8F1}
\definecolor{xhsBlue}{HTML}{2F5B8A}
\definecolor{xhsYellow}{HTML}{D8A64B}
\definecolor{secblue}{HTML}{2B44C6}
\definecolor{thmBg}{RGB}{236,242,251}
\definecolor{lemBg}{RGB}{249,239,237}
\definecolor{defBg}{RGB}{242,245,249}

\hypersetup{
  colorlinks=true,
  linkcolor=brandD,
  citecolor=brandD,
  urlcolor=secblue,
  pdfauthor={MIStatlE},
  pdftitle={CN Lecture Note Template}
}

\newcounter{lecnum}
\renewcommand{\thepage}{\thelecnum-\arabic{page}}
\renewcommand{\thesection}{\thelecnum.\arabic{section}}
\renewcommand{\thesubsection}{\thelecnum.\arabic{section}.\arabic{subsection}}
\renewcommand{\theequation}{\thelecnum.\arabic{equation}}
\numberwithin{equation}{section}

\titleformat{\section}
  {\Large\bfseries\color{keydark}}
  {\thesection}{0.6em}{}
\titlespacing*{\section}{0pt}{1.1em}{0.45em}

\titleformat{\subsection}
  {\large\bfseries\color{brand}}
  {\thesubsection}{0.55em}{}
\titlespacing*{\subsection}{0pt}{0.9em}{0.3em}

\setlist[itemize]{leftmargin=1.5em,itemsep=0.25em,topsep=0.4em}
\setlist[enumerate]{leftmargin=1.7em,itemsep=0.25em,topsep=0.4em}

\newcommand{\LectureSeries}{Learning Theory / Optimization Notes}
\newcommand{\LectureSpeaker}{MIStatlE}
\newcommand{\LectureAffiliation}{Fudan University}

\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\fancyhead[L]{\small\sffamily\color{brandD}\LectureSeries}
\fancyhead[R]{\small\sffamily\color{ink}\nouppercase{\rightmark}}
\fancyfoot[L]{\small\sffamily\color{brand}\LectureSpeaker}
\fancyfoot[R]{\small\sffamily\color{brand}\thepage}
\pagestyle{fancy}
\fancypagestyle{plain}{\pagestyle{fancy}}
\renewcommand{\sectionmark}[1]{\markright{#1}}

\tcbset{
  cn-panel/.style={
    enhanced,
    breakable,
    boxrule=0.7pt,
    arc=4pt,
    left=10pt,right=10pt,top=10pt,bottom=10pt
  },
  cn-soft/.style={
    enhanced,
    breakable,
    frame hidden,
    borderline west={3pt}{0pt}{#1},
    colback=#1!8,
    left=9pt,right=9pt,top=8pt,bottom=8pt,
    arc=2pt
  }
}

\newcommand{\LectureBanner}[6]{%
  \setcounter{lecnum}{#1}%
  \setcounter{page}{1}%
  \setcounter{section}{0}%
  \setcounter{equation}{0}%
  \markright{#2}%
  \begin{tcolorbox}[
    cn-panel,
    colback=white,
    colframe=brandD,
    borderline west={4pt}{0pt}{accent}
  ]
    {\sffamily\small\color{ink!60} #4 \hfill #5}\par
    \vspace{0.35em}
    {\bfseries\fontsize{22}{26}\selectfont\color{keydark} 第 #1 讲：#2\par}
    \vspace{0.2em}
    {\large\color{brand} #3\par}
    \vspace{0.7em}
    {\small\sffamily\color{ink!72} 主讲：#6 \hfill {\color{brandD}\LectureAffiliation}}
  \end{tcolorbox}
  \vspace{0.7em}
}

\newtcolorbox{SummaryBox}{
  cn-panel,
  colback=soft,
  colframe=accent,
  title=\textbf{本讲摘要},
  fonttitle=\bfseries,
  coltitle=white,
  colbacktitle=accentD
}

\newtcolorbox{AnalysisBox}{
  cn-soft=secblue,
  title=\textbf{分析},
  fonttitle=\bfseries,
  coltitle=secblue
}

\newtcolorbox{RemarkBox}{
  cn-soft=accentD,
  title=\textbf{备注},
  fonttitle=\bfseries,
  coltitle=accentD
}

\newtcolorbox{ExampleBox}{
  cn-panel,
  colback=white,
  colframe=xhsBlue,
  title=\textbf{Example},
  fonttitle=\bfseries,
  coltitle=white,
  colbacktitle=xhsBlue
}

\theoremstyle{plain}
\newtheorem{theorem}{定理}[section]
\newtheorem{lemma}[theorem]{引理}
\newtheorem{proposition}[theorem]{命题}
\newtheorem{corollary}[theorem]{推论}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{定义}
\theoremstyle{remark}
\newtheorem{remark}[theorem]{注}

\tcolorboxenvironment{theorem}{cn-panel,colback=thmBg,colframe=secblue,borderline west={3pt}{0pt}{secblue}}
\tcolorboxenvironment{lemma}{cn-panel,colback=lemBg,colframe=accentD,borderline west={3pt}{0pt}{accentD}}
\tcolorboxenvironment{proposition}{cn-panel,colback=thmBg,colframe=brandD,borderline west={3pt}{0pt}{brandD}}
\tcolorboxenvironment{corollary}{cn-panel,colback=defBg,colframe=brand,borderline west={3pt}{0pt}{brand}}
\tcolorboxenvironment{definition}{cn-soft=brandD,title=\textbf{定义},fonttitle=\bfseries,coltitle=brandD}
\tcolorboxenvironment{remark}{cn-soft=accentD,title=\textbf{注},fonttitle=\bfseries,coltitle=accentD}

\DeclareMathOperator{\diam}{diam}
\newcommand{\E}{\mathbb{E}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\ip}[2]{\left\langle #1, #2 \right\rangle}

\begin{document}

\LectureBanner
  {3}
  {凸函数与次梯度}
  {从几何直觉到优化分析}
  {Optimization Notes}
  {2026 Spring}
  {MIStatlE}

\begin{SummaryBox}
这一讲的目标很直接：先把凸集、凸函数与次梯度放到同一张图景里，再解释为什么这些定义并不是“为了证明而发明的符号”，而是优化算法可解释性的基础。
\end{SummaryBox}

\section{凸性首先是一种几何约束}

设 $C \subset \R^d$。若对任意 $x,y \in C$ 与任意 $\lambda \in [0,1]$ 都有
\[
\lambda x + (1-\lambda)y \in C,
\]
则称 $C$ 为凸集。它表达的是一条很朴素的要求：点与点之间的连线不应离开可行区域。

\begin{definition}[仿射组合]
给定向量族 $x_1,\dots,x_m$，若系数满足 $\sum_{i=1}^m \alpha_i = 1$，则
\[
\sum_{i=1}^m \alpha_i x_i
\]
称为这些向量的仿射组合。
\end{definition}

\begin{AnalysisBox}
把“仿射”与“凸”分开看很重要。仿射只要求系数和为 $1$，允许负系数；凸组合则进一步要求系数非负。很多几何直觉的真正分界点就在这里。
\end{AnalysisBox}

\subsection{从集合到函数}

函数 $f:C\to \R$ 的凸性要求
\[
f(\lambda x+(1-\lambda)y) \le \lambda f(x)+(1-\lambda)f(y), \qquad \lambda\in[0,1].
\]
换句话说，函数图像永远不高于两点连线所定义的“弦”。这一性质把最优化问题从“可能有很多局部陷阱”变成“局部信息可以指导全局”的结构问题。

\begin{proposition}[一阶判别]
若 $f$ 可微，则 $f$ 在凸集 $C$ 上凸，当且仅当对任意 $x,y\in C$ 有
\[
f(y)\ge f(x) + \ip{\nabla f(x)}{y-x}.
\]
\end{proposition}

\begin{proof}
一方面，令 $g(t)=f(x+t(y-x))$，由一维凸函数的切线下界即可得到上式。另一方面，将该不等式作用于线段上的点，可以反推出弦不等式，因此与凸性等价。
\end{proof}

\section{次梯度把不可微点重新接回理论}

很多真正有用的目标函数在关键处并不可微，例如 $\ell_1$ 正则项、支持函数与某些 max 结构。因此仅靠梯度无法覆盖完整的凸分析。

\begin{definition}[次梯度]
设 $f:C\to \R$ 为凸函数。若向量 $g\in \R^d$ 满足
\[
f(y)\ge f(x)+\ip{g}{y-x}, \qquad \forall y\in C,
\]
则称 $g$ 是 $f$ 在 $x$ 处的一个次梯度，所有次梯度组成的集合记为 $\partial f(x)$。
\end{definition}

\begin{ExampleBox}
对 $f(x)=|x|$，当 $x\neq 0$ 时只有一个次梯度，即 $\mathrm{sign}(x)$；而在 $x=0$ 时，
\[
\partial f(0)=[-1,1].
\]
这正是“不可微点不是断裂，而是一整簇合法切线”的最直观例子。
\end{ExampleBox}

\begin{theorem}[最优性条件]
设 $f$ 为凸函数，则点 $x^\star$ 是全局极小点，当且仅当
\[
0\in \partial f(x^\star).
\]
\end{theorem}

\begin{AnalysisBox}
这条结论的意义不只是“方便判别最优解”。它告诉我们：在凸问题里，最优性其实就是“存在一条水平支撑超平面”。几何语言和优化语言在这里完全重合。
\end{AnalysisBox}

\section{算法视角：为什么这套结构会影响更新规则}

如果目标函数光滑，我们可以沿着负梯度方向更新；如果目标函数只有凸性而没有可微性，我们就转向次梯度法。此时收敛速度变慢，但问题的几何结构仍然允许我们得到全局控制。

\begin{lemma}[次梯度一步估计]
令 $x_{t+1}=x_t-\eta_t g_t$，其中 $g_t\in \partial f(x_t)$。则对任意比较点 $x^\star$ 都有
\[
\|x_{t+1}-x^\star\|_2^2
\le
\|x_t-x^\star\|_2^2
-2\eta_t\bigl(f(x_t)-f(x^\star)\bigr)
+\eta_t^2\|g_t\|_2^2.
\]
\end{lemma}

\begin{proof}
展开平方并使用次梯度不等式即可：
\[
\|x_t-\eta_t g_t-x^\star\|_2^2
= \|x_t-x^\star\|_2^2 - 2\eta_t\ip{g_t}{x_t-x^\star} + \eta_t^2\|g_t\|_2^2.
\]
再由 $f(x_t)-f(x^\star)\le \ip{g_t}{x_t-x^\star}$ 得证。
\end{proof}

\begin{RemarkBox}
很多初学者会把“不可微”理解成“无法分析”。实际上，在凸问题里，真正重要的不是导数是否唯一，而是能否找到一个稳定的局部线性下界。
\end{RemarkBox}

\section{一页总结}

\begin{itemize}
  \item 凸集保证可行域几何足够稳定。
  \item 凸函数保证局部一阶信息可以指向全局结构。
  \item 次梯度把不可微点重新纳入统一框架。
  \item 许多优化算法的收敛分析，本质上都在重复使用“切线下界 + 平方展开”这两个动作。
\end{itemize}

\end{document}
```
