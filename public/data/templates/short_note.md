---
title: XHS/Notion Style Short Note
date: 2026-01-15
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
* **完全解耦 (Decoupled)**：样式文件 (`.tex`) 与内容文件分离，保持目录整洁。

---

### 📦 Prerequisites (环境要求)

* **Compiler**: `XeLaTeX` (必需，用于支持 `ctex` 中文和 `fontspec` 字体)。
* **Packages**: 确保安装了 `tcolorbox` (v4.50+), `tikz`, `geometry`。

---

### 🛠️ Step 1: Create Style File (创建样式文件)

在你的项目根目录下新建一个文件，命名为 `short-template.tex`。
这是核心样式表，你**不需要**修改这里面的内容。

```latex
% ===========================================
%  File: short-template.tex
%  Description: Style definitions for Short Note
% ===========================================

% --- 1. Packages ---
\usepackage{ifxetex}
\usepackage{geometry}
\usepackage{xcolor}
\usepackage{titlesec}
\usepackage[fontset=fandol]{ctex}
\usepackage{tikz,eso-pic}
\usetikzlibrary{positioning,calc,shadows,shapes.misc}
\usepackage{fancyhdr}
\usepackage[most]{tcolorbox} 
\usepackage{amsmath,amssymb,bm,amsthm}
\usepackage{enumitem}
\usepackage{fontspec}

% --- 2. Layout (7.5x10 inch Compact) ---
\geometry{
  paperwidth=7.5in, paperheight=10in,
  left=0.5in, right=0.5in,
  top=0.55in, bottom=0.65in,
  footskip=0.45in
}

% --- 3. Fonts & Colors ---
\setmainfont{Times New Roman}
\linespread{1.3}
\pagecolor{white}

\definecolor{brand}{HTML}{1A9D8F}       % Teal
\definecolor{brandD}{HTML}{2A7F6F}      % Dark Teal
\definecolor{keybg}{HTML}{E8F4F1}       % Light BG
\definecolor{keydark}{HTML}{2F5E58}     % Dark Text
\definecolor{secblue}{HTML}{2B44C6}     % Academic Blue
\definecolor{accentD}{HTML}{D94F4F}     % Alert Red
\definecolor{termblue}{HTML}{1A4C9A}    % Term Blue
\definecolor{ink}{HTML}{1A1A1A}         % Black

% --- 4. Title Styles ---
\titleformat{\section}[block]{\centering\Large\bfseries\color{keydark}}{}{0em}{}[\vspace{0.2em}\titlerule]
\titlespacing*{\section}{0pt}{1.0em}{0.6em} 
\titleformat{\subsection}{\large\bfseries\color{brand}}{}{0em}{$\bullet$\ \ }
\titlespacing*{\subsection}{0pt}{0.8em}{0.3em}

% --- 5. Box Styles ---
% [Elegant Style]
\tcbset{
    elegant_style/.style={
        enhanced, breakable, colback=white, colframe=#1,
        fonttitle=\bfseries, coltitle=white,
        attach boxed title to top left={xshift=12pt, yshift*=-10pt},
        boxed title style={colback=#1, frame hidden, arc=3pt, boxrule=0pt, drop shadow={opacity=0.3, shadow xshift=1pt, shadow yshift=-1pt}},
        boxrule=0.5pt, arc=3pt,
        left=10pt, right=10pt, top=14pt, bottom=10pt,
        drop shadow={opacity=0.06, shadow xshift=2pt, shadow yshift=-2pt},
        before skip=10pt, after skip=10pt
    }
}
% [Notion Style]
\tcbset{
    notion_style/.style={
        enhanced, breakable, frame hidden, 
        borderline west={3pt}{0pt}{#1}, 
        colback=#1!7, coltitle=#1, fonttitle=\bfseries\small,
        attach title to upper={\ \ }, after title={\par\vspace{0.2em}},
        left=8pt, right=8pt, top=6pt, bottom=6pt, arc=2pt,
        before skip=6pt, after skip=6pt
    }
}

% --- 6. Environments ---
\newtcolorbox{KeyBox}{elegant_style=brand, title=Key Idea}
\newtcolorbox{Theorem}[1][]{elegant_style=secblue, title=\if\relax\detokenize{#1}\relax Theorem \else Theorem: #1 \fi}
\newtcolorbox{Definition}[1][]{notion_style=brandD, title=\if\relax\detokenize{#1}\relax Def. \else Def (#1). \fi}
\newtcolorbox{Takeaway}{notion_style=accentD, title=Takeaway}

% --- 7. Header Component ---
\newcommand{\padzero}[1]{\ifnum#1<10 0\fi\number#1}
\tcbset{tag_style/.style={on line, boxsep=1pt, left=3pt, right=3pt, top=1pt, bottom=1pt, colback=brand, colframe=brand, fontupper=\bfseries\scriptsize\color{white}, arc=2pt, boxrule=0pt, valign=center, before upper=\strut}}

\newcommand{\MakeShortHeader}[3]{
    \noindent
    \begin{tikzpicture}
        \node[fill=keybg!60, rounded corners=6pt, inner sep=12pt, minimum width=\linewidth, text width=\dimexpr\linewidth-30pt\relax, align=left] (box) {
            {\footnotesize \color{keydark!60} \the\year·\padzero{\the\month}·\padzero{\the\day} \hfill @MIStatlE} \\
            \vspace{0.2em}
            {\fontsize{20pt}{24pt}\selectfont\bfseries\color{keydark} #1} \\[0.2em]
            {\normalsize\color{ink!80} #2}
            \vspace{0.5em} 
            \foreach \T in {#3} { \tcbox[tag_style]{\T}\hspace{0.2em} }
        };
        \draw[brandD, line width=3pt] (box.north west) -- (box.south west);
    \end{tikzpicture}
    \vspace{1.0em}
}

% --- 8. Macros ---
\newcommand{\Term}[1]{\textcolor{termblue}{\textbf{#1}}}
\fancyhf{} \renewcommand{\headrulewidth}{0pt} \fancyfoot[C]{\footnotesize\color{brand!50} · \thepage \ ·} \pagestyle{fancy}
```
### ✍️ Step 2: Write Your Content (编写内容)

新建 main.tex，使用 \input 导入样式，然后专注于写作。
```latex
\documentclass[12pt]{article}

% 1. Import the style template
\input{short-template.tex}

\begin{document}

% 2. Generate Header (Title, Subtitle, Tags)
\MakeShortHeader
  {Fisher Information}
  {Regularity, Asymptotic Normality \& Geometry}
  {Statistics, Geometry, MLE}

% 3. Use Pre-defined Environments
\begin{KeyBox}
    Fisher Information is not just the variance bound; it is the intrinsic \Term{Riemannian Metric} of the parameter space.
\end{KeyBox}

\section{Core Concepts}

\begin{Definition}[Score Function]
    The gradient of the log-likelihood: $\mathbf{s}(\theta) = \nabla_\theta \log p(x;\theta)$.
    It has the property $\mathbb{E}[\mathbf{s}(\theta)] = 0$.
\end{Definition}

\begin{Theorem}[Cramér-Rao Lower Bound]
    For any unbiased estimator $\hat{\theta}$:
    \[ \text{Var}(\hat{\theta}) \ge \mathcal{I}(\theta)^{-1} \]
\end{Theorem}

\begin{Takeaway}
    In high-dimensional spaces, the curvature of the log-likelihood (Fisher Info) determines the convergence speed of SGD.
\end{Takeaway}

\end{document}
```

