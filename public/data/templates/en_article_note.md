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

---

### 🧾 Full Source (`EN.tex`)

下面附上完整可复制源码，和站内前两份模板保持一致。

```latex
\documentclass[11pt]{article}

\usepackage{iftex}
\ifPDFTeX
  \errmessage{Please compile with XeLaTeX or LuaLaTeX}
\fi

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
\usepackage[nameinlink,noabbrev]{cleveref}

\geometry{
  paperwidth=7.25in,
  paperheight=10in,
  left=0.82in,
  right=0.82in,
  top=0.8in,
  bottom=0.82in,
  headsep=0.25in,
  footskip=0.42in
}

\IfFontExistsTF{Times New Roman}{\setmainfont{Times New Roman}}{\setmainfont{TeX Gyre Termes}}
\IfFontExistsTF{Helvetica Neue}{\setsansfont{Helvetica Neue}}{\setsansfont{TeX Gyre Heros}}
\IfFontExistsTF{JetBrains Mono}{\setmonofont{JetBrains Mono}}{\IfFontExistsTF{Menlo}{\setmonofont{Menlo}}{\setmonofont{Courier New}}}

\linespread{1.22}
\setlength{\parindent}{1.4em}
\setlength{\parskip}{0.2em}

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
  pdftitle={EN Article Template}
}

\titleformat{\section}
  {\Large\bfseries\color{keydark}}
  {\thesection}{0.6em}{}
\titlespacing*{\section}{0pt}{1.0em}{0.45em}

\titleformat{\subsection}
  {\large\bfseries\color{brand}}
  {\thesubsection}{0.55em}{}
\titlespacing*{\subsection}{0pt}{0.85em}{0.3em}

\setlist[itemize]{leftmargin=1.5em,itemsep=0.25em,topsep=0.4em}
\setlist[enumerate]{leftmargin=1.7em,itemsep=0.25em,topsep=0.4em}

\newcommand{\ArticleShortTitle}{Uniform Stability Notes}
\newcommand{\ArticleAuthor}{MIStatlE}

\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\fancyhead[L]{\small\sffamily\color{brandD}\ArticleShortTitle}
\fancyhead[R]{\small\sffamily\color{ink!72}\nouppercase{\rightmark}}
\fancyfoot[L]{\small\sffamily\color{brand}\ArticleAuthor}
\fancyfoot[R]{\small\sffamily\color{brand}\thepage}
\pagestyle{fancy}
\fancypagestyle{plain}{\pagestyle{fancy}}
\renewcommand{\sectionmark}[1]{\markright{#1}}

\tcbset{
  en-card/.style={
    enhanced,
    breakable,
    boxrule=0.7pt,
    arc=4pt,
    left=10pt,right=10pt,top=10pt,bottom=10pt
  },
  en-soft/.style={
    enhanced,
    breakable,
    frame hidden,
    borderline west={3pt}{0pt}{#1},
    colback=#1!7,
    left=9pt,right=9pt,top=8pt,bottom=8pt,
    arc=2pt
  },
  meta-tag/.style={
    on line,
    boxsep=1pt,
    left=5pt,right=5pt,top=2pt,bottom=2pt,
    colback=brandD,
    colframe=brandD,
    boxrule=0pt,
    arc=3pt,
    fontupper=\scriptsize\bfseries\color{white}
  }
}

\newcommand{\MakeArticleHeader}[5]{%
  \begin{tcolorbox}[
    en-card,
    colback=white,
    colframe=brandD!25!white,
    borderline west={4pt}{0pt}{accent}
  ]
    {\small\sffamily\color{ink!60} #4 \hfill #3}\par
    \vspace{0.4em}
    {\bfseries\fontsize{24}{28}\selectfont\color{keydark} #1\par}
    \vspace{0.2em}
    {\large\color{brand} #2\par}
    \vspace{0.65em}
    \foreach \Tag in {#5}{\tcbox[meta-tag]{\Tag}\hspace{0.35em}}
  \end{tcolorbox}
  \vspace{0.7em}
}

\newtcolorbox{RoadmapBox}{
  en-card,
  colback=keybg,
  colframe=brandD,
  title=\textbf{Roadmap},
  fonttitle=\bfseries,
  coltitle=white,
  colbacktitle=brandD
}

\newtcolorbox{InsightBox}{
  en-soft=brandD,
  title=\textbf{Insight},
  fonttitle=\bfseries,
  coltitle=brandD
}

\newtcolorbox{ExampleBox}{
  en-card,
  colback=xhsCream,
  colframe=accent,
  title=\textbf{Example},
  fonttitle=\bfseries,
  coltitle=white,
  colbacktitle=accentD
}

\theoremstyle{plain}
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\theoremstyle{remark}
\newtheorem{remark}[theorem]{Remark}

\tcolorboxenvironment{theorem}{en-card,colback=thmBg,colframe=secblue,borderline west={3pt}{0pt}{secblue}}
\tcolorboxenvironment{lemma}{en-card,colback=lemBg,colframe=accentD,borderline west={3pt}{0pt}{accentD}}
\tcolorboxenvironment{proposition}{en-card,colback=thmBg,colframe=brandD,borderline west={3pt}{0pt}{brandD}}
\tcolorboxenvironment{corollary}{en-card,colback=defBg,colframe=brand,borderline west={3pt}{0pt}{brand}}
\tcolorboxenvironment{definition}{en-soft=brandD,title=\textbf{Definition},fonttitle=\bfseries,coltitle=brandD}
\tcolorboxenvironment{remark}{en-soft=accentD,title=\textbf{Remark},fonttitle=\bfseries,coltitle=accentD}

\DeclareMathOperator{\Var}{Var}
\newcommand{\E}{\mathbb{E}}
\newcommand{\norm}[1]{\left\lVert #1 \right\rVert}

\begin{document}

\MakeArticleHeader
  {Uniform Stability and the Shape of Generalization}
  {A clean article template for expository notes}
  {MIStatlE}
  {Learning Theory Handout · Spring 2026}
  {Generalization,Stability,SGD}

\begin{RoadmapBox}
This template is designed for a note that sits somewhere between a handout and an article: long enough to develop one argument carefully, but light enough to remain readable on screen. The visual hierarchy is intentionally simple: theorem-level claims are boxed, side insights are soft, and examples are meant to break abstraction with one concrete calculation.
\end{RoadmapBox}

\section{The stability viewpoint}

Suppose a learning algorithm $\mathcal{A}$ maps a sample $S=(z_1,\dots,z_n)$ to a predictor $\mathcal{A}(S)$. Stability asks a local question: how much does the output move when we replace a single observation? The power of this question is that a local perturbation can often control a global quantity, namely the generalization gap.

\begin{definition}[Uniform stability]
An algorithm $\mathcal{A}$ is $\beta$-uniformly stable with respect to a loss $\ell$ if for any two samples $S,S'$ differing in one coordinate,
\[
\sup_{z} \left| \ell(\mathcal{A}(S),z) - \ell(\mathcal{A}(S'),z) \right| \le \beta.
\]
\end{definition}

\begin{InsightBox}
Uniform stability is not merely a proof device. It tells you which algorithms forget individual data points quickly, and that is exactly what a robust training dynamic should do.
\end{InsightBox}

\section{From local perturbation to global gap}

The classical Bousquet--Elisseeff argument turns the one-point replacement bound into an expectation bound for generalization. The result is conceptually important because it avoids direct uniform convergence machinery.

\begin{theorem}[Expected generalization via stability]
Let $\mathcal{A}$ be a $\beta$-uniformly stable learning algorithm and assume $0 \le \ell \le 1$. Then
\[
\left| \E\bigl[R(\mathcal{A}(S)) - \widehat{R}_S(\mathcal{A}(S))\bigr] \right| \le \beta,
\]
where $R$ denotes population risk and $\widehat{R}_S$ empirical risk.
\end{theorem}

\begin{proof}
For each index $i$, let $S^{(i)}$ be the sample where $z_i$ is replaced by an independent copy. Expanding the expectation of the empirical risk and swapping one coordinate at a time yields a telescoping decomposition. Each term is controlled by the stability assumption, and averaging over $i$ produces the claimed $\beta$ bound.
\end{proof}

\begin{remark}
This proof pattern is worth remembering: construct a coupled sample that differs in one point, write the target quantity as an average of one-point replacement errors, then use the local bound everywhere.
\end{remark}

\section{A smooth convex example}

For regularized empirical risk minimization with a strongly convex objective, one often obtains stability by comparing two minimizers of neighboring objectives. The argument is short but structurally rich.

\begin{proposition}[A prototype bound]
Assume the objective is $\lambda$-strongly convex and each individual loss is $L$-Lipschitz. Then the ERM solution is typically $O(L^2/(\lambda n))$-stable.
\end{proposition}

\begin{InsightBox}
The rate already tells you the tradeoff: increasing regularization improves stability, while increasing sample size dilutes the effect of any single example.
\end{InsightBox}

\begin{ExampleBox}
If the objective is
\[
F_S(w)=\frac{1}{n}\sum_{i=1}^n \ell(w;z_i)+\frac{\lambda}{2}\norm{w}_2^2,
\]
then strong convexity of $F_S$ and the Lipschitz property of $\ell$ combine to show that the minimizers for $S$ and $S'$ must remain close. Once parameter distance is controlled, loss difference follows immediately.
\end{ExampleBox}

\section{What to keep in mind when writing with this template}

\begin{itemize}
  \item Use the header block for title, subtitle, affiliation, and topic tags.
  \item Reserve theorem boxes for claims that deserve to stand apart from the flow.
  \item Use `RoadmapBox` for orientation and `InsightBox` for one-sentence conceptual compression.
  \item Treat `ExampleBox` as the place where abstraction turns into a calculation or a sanity check.
\end{itemize}

\end{document}
```
