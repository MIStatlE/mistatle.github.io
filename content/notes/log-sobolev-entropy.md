---
title: "改变一个分布，需要多少局部变化？"
description: "从概率重加权和两区间反例，理解熵、梯度能量，以及 #093 所声称的线性到非线性桥梁。"
date: "2026-10-07"
publish: true
format: "note"
track: "foundations"
area: "probability"
kind: "derivation"
level: "core"
collection: "probability-concentration"
tags: ["Log-Sobolev", "Entropy", "Concentration"]
pdf: "/downloads/log-sobolev-entropy.pdf"
legacy: "public/data/library/probability/log-sobolev-entropy.md"
subtitle: "从熵与梯度能量理解 log-Sobolev 不等式"
---

读 OpenAI 数学稿集中的 #093，一个容易卡住的地方，是还没看证明，就已经不理解结论为什么强：所有方向上的尾部都像高斯，为什么就能控制一个看起来完全不同的“熵”？

先把这道桥的两端讲清楚。log-Sobolev 不等式比较的，是**改变概率分配造成的整体偏离**，与**实现这种改变所需的局部变化**。

## 1. 熵：重新加权后，分布偏离了多少？

固定概率分布 $\mu$，$\mathbb E_\mu$ 表示对它取期望。对非负、可积函数 $h$，定义

$$
\operatorname{Ent}_\mu(h)
:=\mathbb E_\mu[h\log h]
-\mathbb E_\mu[h]\log\mathbb E_\mu[h],
$$

约定 $0\log0=0$，熵允许取 $+\infty$，全文使用自然对数。这里的熵是一个关于函数 $h$ 的泛函；它不是通常写成负号形式的微分熵。

假设 $h=f^2$ 且 $\mathbb E_\mu f^2=1$。此时可以定义一个新概率分布

$$
\nu(A):=\int_A f^2\,d\mu,
\qquad \frac{d\nu}{d\mu}=f^2.
$$

$f^2$ 是概率权重：大于 1 的地方得到更多质量，小于 1 的地方失去质量。于是

$$
\operatorname{Ent}_\mu(f^2)
=\int f^2\log f^2\,d\mu
=\int\log\frac{d\nu}{d\mu}\,d\nu
=D_{\rm KL}(\nu\|\mu).
$$

**这就是熵的具体含义：用 $f^2$ 重新加权后，新分布与原分布之间的 KL 散度。** KL 散度不是几何距离，它比较的是相对概率权重。

归一化不是额外限制。若 $Z:=\mathbb E_\mu f^2\in(0,\infty)$，令 $d\nu=f^2d\mu/Z$，直接代入可得

$$
\operatorname{Ent}_\mu(f^2)=Z\,D_{\rm KL}(\nu\|\mu).
$$

若 $f^2$ 几乎处处为正常数，重新加权没有改变概率分布，熵就是零；$f=0$ 时熵也为零，但不能定义归一化后的新分布。

## 2. 梯度能量：变化发生在哪里？

对光滑函数 $f:\mathbb R^n\to\mathbb R$，定义 Dirichlet 能量

$$
\mathcal E_\mu(f):=\int\|\nabla f(x)\|^2\,d\mu(x).
$$

梯度表示局部变化率；平方惩罚剧烈变化。积分还告诉我们一个关键点：**变化发生的地方，由原分布 $\mu$ 决定权重。** 在几乎没有概率质量的区域里改变 $f$，可以很便宜。这里的“代价”是数学上的局部变动量，不是计算时间，也不是物理能量。

### 一个能算清楚的反例

令 $\mu$ 在区间 $[-2,-1]$ 和 $[1,2]$ 上各均匀放置一半概率质量。取一个光滑、紧支撑的函数 $f$，使它在左区间上恒等于 $\sqrt2$，在右区间上恒等于零；所有过渡都安排在 $\mu$ 没有质量的区域。

![两团概率之间存在空隙；函数在概率支撑上保持常数，只在空隙及支撑外变化。](/images/notes/log-sobolev-entropy/log-sobolev-two-components-zh.png)

于是

$$
\mathbb E_\mu f^2=\tfrac12\cdot2=1,
\qquad
\operatorname{Ent}_\mu(f^2)=\tfrac12\cdot2\log2=\log2.
$$

新分布把全部质量放在了左区间，整体概率分配明显改变。但在原分布有质量的地方，$f$ 始终是常数，所以

$$
\mathcal E_\mu(f)=0.
$$

这个反例不依赖于不光滑的指示函数。我们选的 $f$ 可以处处光滑；变化只发生在积分看不见的地方。

## 3. log-Sobolev：整体偏离不能免费获得

称 $\mu$ 满足常数为 $K$ 的 log-Sobolev 不等式，如果对所有光滑紧支撑函数 $f$，都有

$$
\boxed{\operatorname{Ent}_\mu(f^2)\le K\mathcal E_\mu(f).}
$$

在 $\mathbb E_\mu f^2=1$ 时，它就成为

$$
D_{\rm KL}(f^2\mu\|\mu)
\le K\int\|\nabla f\|^2\,d\mu.
$$

若重新加权造成了显著的整体偏离，函数就必须付出足够大的局部变化代价。$K$ 越小，这种约束越强。上面的两区间分布对任何有限的 $K$ 都不满足它，因为右边为零而左边为正。

### 与方差的关系：看一个小扰动

取光滑有界函数 $g$，满足 $\mathbb E_\mu g=0$，并令 $f_\varepsilon=1+\varepsilon g$。假设 $\nabla g$ 有界；从紧支撑测试函数到这类函数，可以用光滑截断和极限延拓。展开得

$$
\operatorname{Ent}_\mu(f_\varepsilon^2)
=2\varepsilon^2\operatorname{Var}_\mu(g)+o(\varepsilon^2),
\qquad
\mathcal E_\mu(f_\varepsilon)
=\varepsilon^2\mathcal E_\mu(g).
$$

代入并令 $\varepsilon\to0$，得到 Poincaré 不等式

$$
\operatorname{Var}_\mu(g)\le\frac K2\mathcal E_\mu(g).
$$

因此，方差控制可以从熵控制的二阶小扰动中读出来。log-Sobolev 还约束了远离常数的重新加权。

## 4. #093：为什么线性尾部能管到这里？

现在回到稿件的条件。设 $X\sim\mu$，$\mathbb E X=0$，且存在 $a>0$ 满足

$$
\sup_{\|\theta\|=1}
\mathbb E\exp\!\left(\frac{\langle\theta,X\rangle^2}{a^2}\right)\le2.
$$

这里 $\theta$ 是一个固定单位方向，$\langle\theta,X\rangle$ 是该方向上的投影。条件要求所有方向都能使用同一个尺度 $a$。由 Markov 不等式，对每个固定方向，

$$
\mathbb P(|\langle\theta,X\rangle|\ge t)
\le2e^{-t^2/a^2}.
$$

注意，$\sup$ 在期望外面：它没有说可以看完 $X$ 再挑方向，也没有直接控制 $\mathbb E e^{\|X\|^2/a^2}$。

只有尾部还不够。上面的两区间反例甚至有界，取 $a=2/\sqrt{\log2}$ 就满足这个指数矩条件，却没有有限的 log-Sobolev 常数。

#093 还假设密度 $p$ **对数凹**：其正值区域是凸集，且 $\log p$ 在该区域上是凹函数。等价地，可以写成 $p=e^{-V}$，其中 $V$ 为允许取 $+\infty$ 的凸函数。这个条件排除了前面两团概率之间的空洞，却不自动给出维数无关的定量常数。

**#093 的主张（Theorem 1.1，2026-09-23 稿件）。** 对任意维数 $n$，若中心化概率分布 $\mu$ 具有 Lebesgue 密度、对数凹，且满足上面的线性次高斯条件，则存在与 $n,\mu,a$ 无关的通用常数 $C$，使

$$
\operatorname{Ent}_\mu(f^2)
\le Ca^2\int\|\nabla f\|^2\,d\mu,
\qquad f\in C_c^\infty(\mathbb R^n).
$$

原稿把它表述为对 Bizeul 线性次高斯 log-Sobolev 猜想的肯定解决。本文解释该结论的含义，不对 #093 的完整证明作独立核验。[来源 1、2]

桥的跨度在于：**假设只检查线性观测的尾部，结论却同时约束所有光滑函数造成的概率重加权，而且不额外损失维数因子。** 对数凹性提供了几何结构；真正困难的是把这种结构变成对所有非线性测试函数都有效的定量控制。

## 5. 它最终给了我们什么？

一个标准后果是：如果 log-Sobolev 常数为 $K>0$，取 $L>0$，那么任意 $L$-Lipschitz 函数 $g$，即

$$
|g(x)-g(y)|\le L\|x-y\|,
$$

对所有 $t\ge0$ 都满足高斯型集中不等式

$$
\mathbb P(|g(X)-\mathbb Eg(X)|\ge t)
\le2\exp\!\left(-\frac{t^2}{KL^2}\right).
$$

把 $K=Ca^2$ 代入，便看出 #093 所声称的升级：从所有线性投影的高斯型尾部，走到所有 Lipschitz 观测的高斯型波动控制。

这个后果如何从熵走出来？对光滑有界的 $L$-Lipschitz 函数 $g$，令 $\psi(\lambda)=\log\mathbb E e^{\lambda g}$，将 $f=e^{\lambda g/2}$ 代入 LSI（同样通过截断延拓）。除以 $\mathbb E e^{\lambda g}$ 后，得到

$$
\lambda\psi'(\lambda)-\psi(\lambda)
\le\frac{KL^2\lambda^2}{4}.
$$

对 $\lambda>0$ 积分 $(\psi(\lambda)/\lambda)'$，并用 $\lim_{\lambda\to0}\psi(\lambda)/\lambda=\mathbb Eg$，可得

$$
\log\mathbb E e^{\lambda(g-\mathbb Eg)}
\le\frac{KL^2\lambda^2}{4}.
$$

Markov 不等式给出上尾界，取 $\lambda=2t/(KL^2)$；再对 $-g$ 使用同一论证，就得到双侧尾界。一般 Lipschitz 函数可由截断、光滑逼近和极限处理。这是标准的 Herbst 论证。[来源 2，式 (2)–(3)]

例如 $g(x)=\|x\|$ 是 1-Lipschitz。结论控制的是半径相对其均值的波动，而不是说半径本身与维数无关：标准高斯向量的典型半径仍是 $\sqrt n$ 量级。

理解这条不等式，可以一直记住两区间反例：概率质量之间若存在可绕开的空隙，整体改变便可能几乎不需要局部代价。log-Sobolev 要求这种“便宜的重新加权”受到统一约束；#093 的主张，则是在对数凹类中，用线性尾部的尺度来给出这条约束。

## 来源与范围

1. OpenAI. *A dimension-free logarithmic Sobolev inequality for subgaussian log-concave measures*. 2026-09-23，Theorem 1.1。 [原始稿件](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/A-dimension-free-logarithmic-Sobolev-inequality-for-subgaussian-log-concave-measures-September-23-2026/paper.pdf)。
2. Pierre Bizeul. *On the Log-Sobolev Constant of Log-Concave Vectors*. arXiv:2306.12997v3，2026-02-16，Introduction、Conjecture 2。 [原文](https://arxiv.org/html/2306.12997v3)。其常数约定为 $\operatorname{Ent}(f^2)\le2\rho_{LS}^2\mathcal E(f)$，对应本文的 $K=2\rho_{LS}^2$。

熵与 KL 的恒等式、两区间计算和小扰动展开是本文展开的基础推导；LSI、Poincaré 与 Herbst 论证均为标准内容。本文不声称这些内容具有原创性，也不以这篇说明代替新稿件的证明审查。
