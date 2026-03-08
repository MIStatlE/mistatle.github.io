---
title: ""
date: "Mar 08, 2026"
description: ""
categories: ["PHILOSOPHY"]
tags: ["probability", "stats"]
---
# Example

先从一个常见的问题开始：样本均值与总体期望之间的偏差，该怎么衡量？

考虑一组独立同分布的随机变量 $X_1, X_2, \dots, X_n$，记样本均值为 $\bar{X}_n$。  
直接看差值 $\bar{X}_n - \mathbb{E}[X_1]$ 不太方便，因为它的期望是零，正负会抵消。  
一个更有效的做法是看平方后的偏差 $(\bar{X}_n - \mathbb{E}[X_1])^2$，再取它的期望。这个量就是均方误差。

> **定义**（样本均值的均方误差）
>
> 设 $X_1, X_2, \dots, X_n$ 独立同分布，记 $\bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i$。  
> 样本均值的均方误差定义为
>
> $$
\operatorname{MSE}(\bar{X}_n) = \mathbb{E}\!\left[(\bar{X}_n - \mathbb{E}[X_1])^2\right].
$$

> **定理**（独立同分布情形下的均方误差公式）
>
> 若 $X_1, X_2, \dots, X_n$ 独立同分布，且方差 $\operatorname{Var}(X_1) = \sigma^2 < \infty$，则
>
> $$
\operatorname{MSE}(\bar{X}_n) = \frac{\sigma^2}{n}.
$$

> **证明**
>
> 利用方差的性质与独立性：
>
> $$
\operatorname{MSE}(\bar{X}_n) 
= \operatorname{Var}(\bar{X}_n) 
= \operatorname{Var}\!\left(\frac{1}{n}\sum_{i=1}^n X_i\right) 
= \frac{1}{n^2}\sum_{i=1}^n \operatorname{Var}(X_i) 
= \frac{n\sigma^2}{n^2} 
= \frac{\sigma^2}{n}.
$$

> **注**
>
> 这个结果说明，样本均值的均方误差按 $O(1/n)$ 的速度衰减。  
> 也就是说，样本量 $n$ 越大，用 $\bar{X}_n$ 估计总体期望的精度就越高。
