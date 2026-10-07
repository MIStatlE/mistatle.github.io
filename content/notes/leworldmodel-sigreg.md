---
title: "LeWorldModel / SIGReg：为什么不会塌缩？"
description: "连接 latent prediction、表示塌缩与 SIGReg，辨认机制真正依赖的条件。"
date: "2026-03-25"
area: "deep-learning"
kind: "paper"
track: "systems"
collection: "generative-world-models"
tags: ["World Model", "JEPA", "SIGReg", "Latent Planning"]
pdf: "/downloads/leworldmodel-sigreg.pdf"
legacy: "public/data/papers/leworldmodel_sigreg.md"
---

## 资料

1. 论文原文（arXiv）：[LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels](https://arxiv.org/abs/2603.19312)
2. 论文 PDF：[arXiv PDF](https://arxiv.org/pdf/2603.19312v1)
3. 本站整理版 PDF：[leworldmodel_sigreg.pdf](/downloads/leworldmodel-sigreg.pdf)

## 0. 先讲结论

> LeWorldModel 的关键不在“把像素预测准”，而在于学出一个既能滚动预测、又能拿来规划、同时不会塌成一个点的 latent dynamics。  
> 它一边用 prediction loss 学动力学，一边用 SIGReg 约束 latent 的整体几何。

## 1. 世界模型在这里做什么

世界模型的核心想法很简单：给定当前状态与动作，学习环境如何演化。围绕这个目标，已经衍生出了很多路线；有些工作会把“预测视频下一帧”也算作世界模型的一部分。

JEPA 路线则更进一步：先把高维观测压缩到 latent 空间，再在 latent 空间中学习 dynamics。这样做的好处是，预测和规划都发生在更紧凑的表示空间里，计算负担更轻，也更贴近控制任务真正关心的结构。相应的代价是：与直接预测视频相比，latent 表征本身的好坏不再那么直观可见。

LeWorldModel 的目标，就是从原始像素端到端学出一个既可预测、又可规划、同时不会塌缩的 latent world model。

## 2. LeWorldModel 的训练目标

**训练目标**

$$
z_t = \mathrm{enc}_{\theta}(o_t), \quad \hat{z}_{t+1} = \mathrm{pred}_{\phi}(z_t, a_t).
$$

$$
\mathcal{L}_{\mathrm{pred}} = \frac{1}{T-1}\sum_{t=1}^{T-1} \|\hat{z}_{t+1} - z_{t+1}\|_2^2, \quad \mathcal{L}_{\mathrm{LeWM}} = \mathcal{L}_{\mathrm{pred}} + \lambda\, \mathrm{SIGReg}(Z).
$$

这里：

- $o_t$ 是时刻 $t$ 的视觉观测。
- $a_t$ 是采取的动作。
- $z_t$ 可以理解为时刻 $t$ 的 latent 状态。
- $\hat z_{t+1}$ 是 world model 对下一时刻 latent 的预测。

## 3. 为什么 next-latent prediction 会塌缩

假设 encoder 把所有观测都映射到同一个常向量 $c$，即

$$
z_t \equiv c, \quad \hat{z}_{t+1} \equiv c.
$$

那么欧氏预测损失立刻变成

$$
\|\hat{z}_{t+1} - z_{t+1}\|_2^2 = 0.
$$

这说明：**在 next-latent prediction 目标下，点塌缩不是训练失败，而是一个合法的最优解。**

一旦发生点塌缩，所有状态在 latent 空间中都不可区分。当前状态、目标状态、预测终点都会落在同一个点上，于是任何动作序列看起来都同样合理，规划也就失去了意义。

## 4. SIGReg 怎么把塌缩挡住

记 latent 样本矩阵为

$$
Z \in \mathbb{R}^{n \times d}.
$$

SIGReg 想做的不是简单“拉开样本”，而是更强的一件事：**把 latent 的经验分布推向各向同性高斯 $\mathcal{N}(0, I_d)$。**

**SIGReg 的定义**

先采样随机单位方向

$$
u^{(m)} \sim \mathrm{Unif}(\mathbb{S}^{d-1}), \quad m = 1, \ldots, M.
$$

做一维投影

$$
h^{(m)} = Z u^{(m)} \in \mathbb{R}^n.
$$

然后对一维正态性统计量取平均：

$$
\mathrm{SIGReg}(Z) = \frac{1}{M}\sum_{m=1}^M T(h^{(m)}).
$$

其中 $T$ 是 Epps--Pulley 统计量，用来衡量投影样本与标准正态 $\mathcal{N}(0, 1)$ 的距离。

理论直觉是：**高维分布可以由它在所有一维方向上的投影分布刻画。**  
因此，高维 anti-collapse 问题可以转化成许多个一维问题：随机检查若干方向，看这些投影是否近似标准高斯。这样一来：

- 常值解会被排除；
- 低秩表示会被排除；
- 强相关表示也会被排除。

## 5. Latent planning 实际在优化什么

训练结束后，固定 encoder 与 predictor。

给定当前观测 $o_1$ 和目标观测 $o_g$，先编码为

$$
\hat{z}_1 = \mathrm{enc}_{\theta}(o_1), \quad z_g = \mathrm{enc}_{\theta}(o_g).
$$

然后在 latent 空间里滚动预测：

$$
\hat{z}_{t+1} = \mathrm{pred}_{\phi}(\hat{z}_t, a_t), \quad t = 1, \ldots, H - 1.
$$

规划目标是

$$
a_{1:H}^* = \arg\min_{a_{1:H}} \|\hat{z}_H - z_g\|_2^2.
$$

这里 planner 不会去修改 latent 表征本身。它优化的是一串动作，使得 world model 预测出来的终点 latent 尽量接近目标观测的 latent 编码。

实现上，LeWorldModel 采用的是 **CEM + MPC**：

- 用 CEM 在动作序列空间里反复采样、筛选、更新；
- 用 MPC 持续重规划，减轻长时滚动预测造成的模型误差累积。

## 6. Takeaway

> 可以把它理解成三步：  
> 先在 latent 空间里学“动作会把状态推到哪里”；  
> 再用 SIGReg 保证这个 latent 空间不是一个塌缩伪解；  
> 最后在冻结的 dynamics 上直接搜索动作序列。

## 参考文献

1. Lucas Maes, Quentin Le Lidec, Damien Scieur, Yann LeCun, Randall Balestriero. [*LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels*](https://arxiv.org/abs/2603.19312). arXiv preprint, 2026.
2. David Ha, Jürgen Schmidhuber. [*World Models*](https://arxiv.org/abs/1803.10122). arXiv preprint, 2018.
3. Yann LeCun. [*A Path Towards Autonomous Machine Intelligence*](https://openreview.net/forum?id=BZ5a1r-kVsf). OpenReview, 2022.
4. Randall Balestriero, Yann LeCun. *LeJEPA: Provable and Scalable Self-Supervised Learning without the Heuristics*. arXiv preprint, 2025.
5. Thomas W. Epps, Lawrence B. Pulley. *A Test for Normality Based on the Empirical Characteristic Function*. Biometrika, 1983.
6. Harald Cramér, Herman Wold. *Some Theorems on Distribution Functions*. Journal of the London Mathematical Society, 1936.
7. Reuven Y. Rubinstein, Dirk P. Kroese. *The Cross-Entropy Method: A Unified Approach to Combinatorial Optimization, Monte-Carlo Simulation and Machine Learning*. Springer, 2004.
