---
title: "从 Bandit 到 RL：Deep Exploration 为何必要"
date: 2026-08-21
categories: ["Reinforcement Learning"]
tags: ["Deep Exploration", "Bandit", "Posterior Sampling"]
description: "固定单步动作边缘分布后，路径事件概率为何仍能从 p^N 变为 p？"
---

[下载排版版 PDF](public/data/library/rl/source/deep-exploration-note.pdf)

如果一个算法在每一步都保留尝试未知动作的机会，它是否就能有效探索？在经典 bandit 中，这个直觉有直接的依据：选择一个 arm，就得到它的一次奖励样本。探索可以牺牲当前奖励，但通常不必先完成一串没有信息的动作，才能获得所需反馈。

RL 的区别不只是 horizon 更长。动作还会改变未来状态的分布，因而改变后续能访问哪些状态、收集哪些观测。这会产生一个短视探索无法解释的现象：一个动作的即时奖励为负，即时信息增益为零，却仍可能是 Bayes 最优策略的一部分。

## 1. 一个最小路径例子

取 Osband et al. (2019, Example 1) 的 DeepSea 例子的一个简化版本：动作标签与左右方向的对应关系已知，只保留终点奖励的不确定性。每轮长度为 $N$。智能体从起点出发，只有连续选择 $R$，才能到达终点；选择 $L$ 后立即终止，之后收益为零，已经支付的成本不返还。终点类型

$$
\Theta\in\{-1,+1\},
\qquad
\mathbb P(\Theta=+1)=\mathbb P(\Theta=-1)=\frac12
$$

在整个学习过程中固定不变：$+1$ 表示宝藏，$-1$ 表示炸弹。终点奖励的先验均值因此为零。沿路径每向右一步支付 $c/N$，故第一次完整到达终点的 Bayes 期望回报为

$$
\mathbb E[\Theta-c]=-c.
$$

原论文取 $c=0.01$，所以这次尝试的期望回报为 $-0.01$。更关键的是，在到达终点以前，中间状态与观测都不依赖于 $\Theta$。向右既产生确定成本，也不揭示任何关于终点类型的信息。

![简化的 DeepSea MDP：中间转移与终点类型无关，只有到达终止状态才能观察终点奖励。](public/data/library/rl/images/deepsea-path.png)

原例子还包含未知的动作映射，中间转移可以帮助学习这些映射；这里的“没有即时信息”只针对终点类型 $\Theta$。问题是：没有即时信息的动作，如何仍有长期的探索价值？

## 2. 即时信息与到达概率

令 $H_t$ 表示时刻 $t$ 之前的历史。动作 $a$ 的即时信息增益定义为

$$
\operatorname{IG}_t(a)
:=
I\!\left(\Theta;(S_{t+1},r_{t+1})\mid H_t,A_t=a\right).
$$

再令 $\tau_N$ 为首次到达可提供信息的终止状态的时刻。给定后续策略 $\pi$，定义到达概率

$$
h_t^\pi(a)
:=
\mathbb P_\pi(\tau_N\le N\mid H_t,A_t=a).
$$

给定仍在目标路径上的历史 $H_t$，当 $0\le t\le N-2$ 时，选择 $R$ 后的下一状态和成本都与 $\Theta$ 无关，因此

$$
\operatorname{IG}_t(R)=0.
$$

但若后续策略 $\pi_p$ 在每一步独立地以概率 $p$ 选择 $R$，则

$$
h_t^{\pi_p}(R)=p^{N-t-1}>0,
\qquad
h_t^{\pi_p}(L)=0.
$$

即时信息增益只评价下一步反馈；到达概率评价一个动作如何改变后续访问到可提供信息状态的机会。二者并不等价。

这种后续学习机会具有真实的决策价值。考虑 explore-then-commit 策略：第一轮完整向右，此后仅当 $\Theta=+1$ 时重复该轨迹。它在前 $T$ 轮内的 Bayes 期望回报为

$$
-c+\frac{T-1}{2}(1-c).
$$

当

$$
T>\frac{1+c}{1-c}
$$

时，该值为正，严格优于始终选择 $L$ 的零收益。第一轮的成本不是为即时信息买单，而是在保留一次后续学习机会。

## 3. 单步边缘分布不能决定路径事件

令 $X_t=1$ 表示一轮内第 $t$ 步选择 $R$；提前终止时，补齐未执行的动作以定义完整序列，这不改变到达事件。记成功到达终点的路径事件为

$$
G_N:=\{X_1=\cdots=X_N=1\}.
$$

对固定 $p\in(0,1)$，考虑具有相同 Bernoulli 边缘分布的所有耦合

$$
\mathcal C_p
:=
\left\{
\mu\in\Delta(\{0,1\}^N):
\mathbb P_\mu(X_t=1)=p,\ \forall t
\right\}.
$$

下面将 Osband et al. 的探索机制抽象成已知路径上的概率比较。一般 $p$ 与所有耦合上的上界是本文的初等推导，不是原论文的算法定理。

### 定理（边缘分布与路径概率；基于 [1, Example 1, Section 4] 的路径抽象）

若 $X_1,\ldots,X_N$ 独立，则

$$
\mathbb P_{\mu_{\mathrm{prod}}}(G_N)=p^N.
$$

但在所有具有相同边缘分布的耦合中，

$$
\sup_{\mu\in\mathcal C_p}\mathbb P_\mu(G_N)=p.
$$

共享样本耦合 $X_1=\cdots=X_N=Z$、$Z\sim\operatorname{Bern}(p)$ 达到该上界。若各轮独立重采样，首次成功的期望轮数分别为 $p^{-N}$ 与 $p^{-1}$。

### 证明

对乘积耦合，独立性直接给出

$$
\mathbb P(G_N)
=
\prod_{t=1}^N\mathbb P(X_t=1)
=p^N.
$$

证明中真正关键的一步，是不再固定某个生成机制，而是在所有保持边缘分布不变的耦合中优化路径事件。对任意 $\mu\in\mathcal C_p$ 和任意 $t$，都有

$$
G_N\subseteq\{X_t=1\}.
$$

所以

$$
\mathbb P_\mu(G_N)
\le
\mathbb P_\mu(X_t=1)
=p.
$$

这个上界可以达到：在每轮开始时只采样一次 $Z\sim\operatorname{Bern}(p)$，并令

$$
X_1=\cdots=X_N=Z.
$$

它保留了每一步的 Bernoulli$(p)$ 边缘分布，而 $G_N=\{Z=1\}$，故 $\mathbb P(G_N)=p$。各轮独立时，首次成功时间服从成功概率为 $\mathbb P(G_N)$ 的几何分布，期望轮数结论随即得到。$\square$

差距来自哪里？把路径概率按条件展开：

$$
\mathbb P(G_N)=\mathbb P(X_1=1)
\prod_{t=2}^{N}\mathbb P(X_t=1\mid X_1=\cdots=X_{t-1}=1).
$$

独立机制中，沿途每一项仍为 $p$；共享机制中，一旦第一个动作向右，后续条件概率就都为 $1$。因此比较的是 $p\cdot p\cdots p$ 与 $p\cdot1\cdots1$。相同的时间边缘分布，不等于给定同一历史的动作分布相同。若后者也相同，在同一环境中就会诱导相同的轨迹分布。

随机化的时间尺度本身不保证探索效率；还要看被赋予概率的轨迹是否通向信息。这里的 $p^{-N}$ 与 $p^{-1}$ 只刻画首次到达已知路径终点的轮数，并非原 DeepSea 中学习未知动作映射的复杂度。

![相同动作边缘分布下，逐步独立扰动给出路径概率 p^N，整轮共享样本达到上界 p。](public/data/library/rl/images/temporal-coupling.png)

## 4. Bandit 与 RL 的本质差别

Bandit 与 RL 的分界不是是否考虑长期收益。UCB 和 Thompson sampling 同样会为了降低未来 regret 而探索。更本质的区别是，经典随机 bandit 中的动作没有延迟后果：

$$
a_t\in\mathcal A,
\qquad
r_{t+1}\sim P_\theta^{a_t}.
$$

选择 arm $a_t$ 只决定当轮观察到哪个奖励样本。“观察 arm $a$ 的一次反馈”是单步事件，其概率由当前动作的边缘概率决定。

在 MDP 中，动作还会改变转移分布：

$$
a_t\in\mathcal A(s_t),
\qquad
s_{t+1}\sim P_\theta(\,\cdot\mid s_t,a_t).
$$

因此当前动作会改变未来的状态—动作访问分布，进而改变之后能观察到的奖励与转移。在 DeepSea 中，“观察终点奖励”不是单步事件，而是路径事件 $G_N$；它的概率取决于整条动作序列的联合分布。

这就是 deep exploration 要处理的对象：不是单独给每个动作增加多少随机性，而是把概率质量分配给哪些能够到达可提供信息状态的策略或轨迹。随机化的时间尺度只是实现方式；真正决定探索效率的，是随机策略经由受控转移所诱导的轨迹分布。

## 参考文献

[1] I. Osband, B. Van Roy, D. J. Russo, and Z. Wen. *Deep Exploration via Randomized Value Functions*. JMLR, 20(124):1–62, 2019. [PDF](https://jmlr.org/papers/volume20/18-339/18-339.pdf)

## 继续思考

如果目标路径要求交替选择动作，整轮重复同一个动作还有效吗？如果终点类型每轮重抽，更容易获得观测就意味着探索值得吗？

[配套免费样章：三个问题、分层提示与完整解答](#/resources/read/public%2Fdata%2Ftemplates%2Fdeep-exploration-study.md)
