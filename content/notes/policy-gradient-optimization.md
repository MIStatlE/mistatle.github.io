---
title: "Policy Gradient 的优化视角"
description: "从目标函数、梯度估计、方差与步长选择建立一条连续的优化主线。"
date: "2026-05-06"
area: "rl"
kind: "mechanism"
level: "deep"
track: "algorithms"
collection: "policy-optimization"
tags: ["强化学习", "Policy Gradient", "PPO", "随机优化"]
pdf: "/downloads/policy-gradient-note.pdf"
legacy: "public/data/library/rl/policy-gradient-optimization.md"
---

## 1. 从强化学习到优化

策略梯度把策略搜索写成一个参数化的优化问题：

$$
\max_{\theta} J(\theta),
\qquad
J(\theta):=V^{\pi_\theta}(\rho).
$$

主要困难并不只是定义目标函数。梯度必须通过当前策略诱导出的轨迹分布来估计，得到的估计量往往方差很大。因此，策略梯度方法同时受两方面支配：强化学习本身的结构，以及随机非凸优化的稳定性。

考虑一个折扣 MDP

$$
(\mathcal S,\mathcal A,P,r,\gamma,\rho),
$$

其中 $P(s'\mid s,a)$ 是转移核，$r(s,a)$ 是奖励，$\gamma\in(0,1)$ 是折扣因子，$\rho$ 是初始状态分布。对策略 $\pi$，目标函数为

$$
J(\pi)
:=
\mathbb E_{\tau\sim\pi}
\left[
\sum_{t\ge 0}\gamma^t r(s_t,a_t)
\right].
$$

对参数化策略族 $\{\pi_\theta\}$，我们优化

$$
J(\theta)
=
V^{\pi_\theta}(\rho)
:=
\mathbb E_{s_0\sim\rho}
\left[
V^{\pi_\theta}(s_0)
\right].
$$

随机策略提供了可微性。在离散动作空间中，像

$$
a=\arg\max_{a'} f_\theta(s,a')
$$

这样的确定性策略通常会随 $\theta$ 不连续地变化。随机策略 $\pi_\theta(a\mid s)$ 则用一个可微的概率分布取代了硬性的动作选择。

## 2. 策略梯度定理

定义折扣状态访问分布

$$
d_\rho^\pi(s)
:=
(1-\gamma)
\sum_{t\ge0}
\gamma^t
\mathbb P_\pi(s_t=s\mid s_0\sim\rho).
$$

策略梯度定理给出

$$
\nabla_\theta J(\theta)
=
\frac{1}{1-\gamma}
\mathbb E_{\substack{s\sim d_\rho^{\pi_\theta}\\
a\sim\pi_\theta(\cdot\mid s)}}
\left[
\nabla_\theta\log\pi_\theta(a\mid s)
Q^{\pi_\theta}(s,a)
\right].
$$

它把“对轨迹分布求导”转化成一个 score function 估计量：

$$
\nabla_\theta\log\pi_\theta(a\mid s).
$$

这是 REINFORCE、Actor-Critic、TRPO 和 PPO 的共同基础。

对任意只依赖状态的基线 $b(s)$，

$$
\mathbb E_{a\sim\pi_\theta(\cdot\mid s)}
\left[
\nabla_\theta\log\pi_\theta(a\mid s)b(s)
\right]=0.
$$

因此可以把 $Q^\pi(s,a)$ 换成优势函数

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s),
$$

而不改变梯度的期望，同时往往能降低方差。

## 3. REINFORCE 与随机梯度

REINFORCE 用采样得到的回报

$$
G_t=\sum_{k=t}^{T-1}\gamma^{k-t}r_k
$$

作为 $Q^\pi$ 的蒙特卡洛估计，由此得到更新

$$
\theta
\leftarrow
\theta
+
\eta
\sum_{t=0}^{T-1}
\nabla_\theta\log\pi_\theta(a_t\mid s_t)G_t.
$$

这个估计量无偏，但方差很大。Actor-Critic 方法用 critic 对 $V^\pi$ 或 $A^\pi$ 的估计取代纯蒙特卡洛回报，以一定的偏差换取更低的方差。

在优化层面，策略梯度的更新可以抽象为

$$
\theta_{t+1}
=
\theta_t+\eta g_t,
\qquad
\mathbb E[g_t\mid\theta_t]
=
\nabla J(\theta_t).
$$

在非凸情形下，自然的保证不是全局最优，而是一个驻点度量：

$$
\min_{0\le t<T}\mathbb E\!\left[\lVert\nabla J(\theta_t)\rVert^2\right].
$$

如果 $J$ 是 $\beta$-光滑的，且梯度估计量满足

$$
\mathbb E\!\left[\lVert g_t-\nabla J(\theta_t)\rVert^2\mid\theta_t\right]\le\sigma^2,
$$

那么对光滑性不等式逐项相消求和，可得

$$
\min_{0\le t<T}\mathbb E\lVert\nabla J_t\rVert^2
\le
\frac{\Delta+\frac{\beta\eta^2\sigma^2T}{2}}{T(\eta-\beta\eta^2/2)}.
$$

其中 $\Delta=J^*-J(\theta_0)$。

## 4. 步长与 PPO

令

$$
x:=\beta\eta,
\qquad
A:=\beta\Delta,
\qquad
B:=\frac{\sigma^2T}{2}.
$$

上界具有如下形式

$$
F(x)
=
\frac{A+Bx^2}{T(x-x^2/2)}.
$$

在 $0<x\le 1$ 上，$F$ 在常数因子意义下等价于

$$
G(x)=\frac{A}{Tx}+\frac{B}{T}x.
$$

平衡两项可得

$$
\widehat x
=
\min
\left\{
1,\sqrt{\frac{A}{B}}
\right\},
\qquad
\eta
=
\min
\left\{
\frac1\beta,
\sqrt{\frac{2\Delta}{\beta\sigma^2T}}
\right\}.
$$

这个取最小值的形式反映了两个约束：步长必须保持在光滑性允许的尺度之内，同时要在初始差距与随机方差之间取得平衡。

PPO 仍然是一种策略梯度方法，但它限制了单次更新可以偏离旧策略多远。定义重要性比率

$$
r_t(\theta)
=
\frac{\pi_\theta(a_t\mid s_t)}
{\pi_{\theta_{\mathrm{old}}}(a_t\mid s_t)}.
$$

PPO 使用截断的替代目标

$$
L^{\mathrm{clip}}(\theta)
=
\mathbb E
\left[
\min
\left\{
r_t(\theta)\widehat A_t,\,
\mathrm{clip}(r_t(\theta),1-\epsilon,1+\epsilon)\widehat A_t
\right\}
\right].
$$

从理论角度看，PPO 并不是一个新的策略梯度定理。更好的理解是把它看作一种保守的更新几何：在旧策略下收集的数据，不应该用来支持一个离它太远的新策略。

## 小结

基本链条是

$$
\mathrm{MDP}
\rightarrow
J(\theta)=V^{\pi_\theta}(\rho)
\rightarrow
\nabla_\theta J(\theta)
\rightarrow
\theta_{t+1}=\theta_t+\eta g_t.
$$

随机策略提供可微性，轨迹提供梯度估计量，优化理论解释噪声、方差与步长选择。PPO 没有引入新的梯度定理；它是在带噪声的策略梯度之上，加了一层保守的更新几何。

## 参考文献

1. Sutton and Barto, *Reinforcement Learning: An Introduction*, 2nd ed., Ch. 13.
2. Williams, "Simple statistical gradient-following algorithms for connectionist reinforcement learning", *Machine Learning*, 1992.
3. Sutton, McAllester, Singh, Mansour, "Policy Gradient Methods for Reinforcement Learning with Function Approximation", NeurIPS, 1999.
4. Schulman et al., "Trust Region Policy Optimization", ICML, 2015.
5. Schulman et al., "Proximal Policy Optimization Algorithms", arXiv:1707.06347, 2017.
