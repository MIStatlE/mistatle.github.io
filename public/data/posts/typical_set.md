---
title: "Typical Set: 高维空间的典型集与概率集中"
date: 2026-1-21
categories: [Information Theory]
tags: ["High-Dim Geometry"]
description: "在高维空间中，概率质量（Probability Mass）并不集中在概率密度最大的区域（Mode），而是集中在“典型集” (Typical Set) 上。对于高斯分布，这表现为一个薄薄的球壳。本文基于渐进均分性 (AEP) 定义典型集。"
---

## 1. 问题设定

假设我们有一组独立同分布 (i.i.d.) 的随机变量 $X_1, \dots, X_n$，其联合分布为 $p(X^n) = p(x_1, \dots, x_n)$。

我们的目标是识别出一个“核心子集” $A \in \mathcal{X}^n$，使得绝大多数的采样点都落在这个集合里：

$$
\mathbb P[X^n \in A] \geq 1-\epsilon
$$

显然，可以根据大数定律，对于函数 $g(x)$：

$$
\mathbb{E} \left[ \mathbb{I}\left( \left| \frac{1}{n}\sum_{i=1}^n g(X_i) - \mathbb{E}[g(X)] \right| \le \epsilon \right) \right] \ge 1-\epsilon
$$

这定义了一个集合 $A_{\epsilon}$。下一步：我们需要选择什么样的 $g(x)$ 才能刻画分布的几何形状？

我们选择 $g(x)=-\log p(x)$。

> **📝 注：**
> 我们的研究对象是联合分布的概率密度函数在空间中的分布。独立同分布 (i.i.d.) 意味着联合概率是连乘 ($\prod$)，而大数定律处理的是求和 ($\sum$)。对数函数将“概率乘积”转化为“样本求和”：
>
> $$
> \underbrace{-\frac{1}{n} \log p(x^n)}_{\text{对数联合概率}} 
> = -\frac{1}{n} \log \left( \prod_{i=1}^n p(x_i) \right) 
> = \underbrace{\frac{1}{n} \sum_{i=1}^n \left[ -\log p(x_i) \right]}_{\text{样本均值} \xrightarrow{\text{LLN}} \mathbb{E}}
> $$

---

## 2. 渐进均分性 (AEP) 与定义

渐进均分性 (Asymptotic Equipartition Property, AEP) 是大数定律在随机变量对数概率上的体现。

### 定理 (AEP)
当 $n \to \infty$ 时，依据大数定律：

$$
-\frac{1}{n} \log p(X_1, \dots, X_n) \to H(X) \quad \text{in probability}
$$

其中 $H(X) = \mathbb{E}[-\log p(X)]$ 为熵（对于连续变量则为微分熵）。

这意味着，对于绝大多数“典型”的序列，其联合概率 $p(x^n)$ 都在 $2^{-nH(X)}$ 附近。基于此，我们定义典型集：

### 定义 (典型集 $A_\epsilon^{(n)}$)
典型集 $A_\epsilon^{(n)}$ 是满足以下条件的序列集合：

$$
A_\epsilon^{(n)} = \left\{ x^n \in \mathcal{X}^n : \left| -\frac{1}{n} \log p(x^n) - H(X) \right| \le \epsilon \right\}
$$

简单来说，典型集包含了那些“惊奇度”（负对数似然）接近平均熵的样本。

---

## 3. 典型集的关键性质

典型集具有两个看似矛盾但至关重要的性质，这解释了采样的本质。

### 性质 1：概率集中
当 $n$ 足够大时，典型集几乎包含了所有的概率质量：

$$
\mathbb{P}(A_\epsilon^{(n)}) > 1 - \epsilon
$$

这意味着如果你从分布中随机采样，有很高的概率会落在典型集里。

### 性质 2：体积微小
尽管它包含了几乎所有概率，但在高维空间中，它相对于整个状态空间的体积却微乎其微：

$$
\text{Vol}(A_\epsilon^{(n)}) \approx 2^{nH(X)}
$$

如果熵 $H(X) < \log |\mathcal{X}|$（对于均匀分布才相等），则典型集只是整个空间中极小的一个子集。

#### 证明
证明的核心在于利用概率的归一化性质。
根据典型集的定义，对于集合内任意序列 $x^n \in A_\epsilon^{(n)}$，其概率都有下界：

$$
p(x^n) \ge 2^{-n(H(X) + \epsilon)}
$$

由于全空间的概率之和为 1，典型集的总概率必然小于等于 1：

$$
\begin{aligned}
1 &\ge \sum_{x^n \in A_\epsilon^{(n)}} p(x^n) \\
  &\ge \sum_{x^n \in A_\epsilon^{(n)}} 2^{-n(H(X) + \epsilon)} \quad (\text{代入下界}) \\
  &= |A_\epsilon^{(n)}| \cdot 2^{-n(H(X) + \epsilon)} \quad (\text{求和转化为体积乘积})
\end{aligned}
$$

移项整理，即可得到体积的上界：

$$
|A_\epsilon^{(n)}| \le 2^{n(H(X) + \epsilon)} \approx 2^{nH(X)}
$$

这表明，只要分布不是完全均匀的（即 $H(X) < \log |\mathcal{X}|$），典型集的体积就会随着 $n$ 的增加，相对于全空间体积 $|\mathcal{X}|^n = 2^{n \log |\mathcal{X}|}$ 指数级地缩小。

---

## 4. 实例：高维高斯分布

考虑 $d$ 维标准高斯分布 $X \sim \mathcal{N}(0, I_d)$。尽管其概率密度函数在原点 $x=0$ 处取得最大值，但高维几何的特性使得概率质量并未集中在此处。

对于任意样本 $x \in \mathbb{R}^d$，其对数似然函数为：

$$
-\log p(x) = \frac{d}{2}\log(2\pi) + \frac{1}{2} \sum_{i=1}^d x_i^2
$$

为了考察典型集的位置，我们分析归一化的对数概率。由于 $X$ 的分量 $x_i$ 独立且服从 $\mathcal{N}(0, 1)$，则 $x_i^2$ 服从自由度为 1 的卡方分布，且 $\mathbb{E}[x_i^2]=1$。根据弱大数定律 (WLLN)，当维度 $d \to \infty$ 时，样本的二阶矩依概率收敛于其期望：

$$
\frac{1}{d} \|x\|^2 = \frac{1}{d} \sum_{i=1}^d x_i^2 \xrightarrow{P} \mathbb{E}[x_1^2] = 1
$$

这意味着，绝大多数从高维高斯分布中采样的点，都位于以原点为球心、半径为 $\sqrt{d}$ 的狭窄球壳附近：

$$
\|x\| \approx \sqrt{d}
$$
