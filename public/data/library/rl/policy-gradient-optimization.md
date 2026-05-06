---
title: "Policy Gradient 的优化视角"
date: 2026-05-06
categories: ["Reinforcement Learning"]
tags: ["Policy Gradient", "PPO", "Stochastic Optimization"]
description: "A short note on policy gradient from the optimization viewpoint: stochastic policies provide differentiability, trajectories provide gradient estimators, and stochastic nonconvex optimization explains noise, variance, and stepsize choices."
---

[Download PDF](public/data/library/rl/source/policy-gradient-note.pdf)

## 1. From RL to Optimization

Policy gradient writes policy search as a parametric optimization problem:

$$
\max_{\theta} J(\theta),
\qquad
J(\theta):=V^{\pi_\theta}(\rho).
$$

The main difficulty is not merely defining the objective. The gradient must be estimated through the trajectory distribution induced by the current policy, and the resulting estimator often has high variance. Thus policy gradient methods are controlled by both the structure of reinforcement learning and the stability properties of stochastic nonconvex optimization.

Consider a discounted MDP

$$
(\mathcal S,\mathcal A,P,r,\gamma,\rho),
$$

where $P(s'\mid s,a)$ is the transition kernel, $r(s,a)$ is the reward, $\gamma\in(0,1)$ is the discount factor, and $\rho$ is the initial state distribution. For a policy $\pi$, the objective is

$$
J(\pi)
:=
\mathbb E_{\tau\sim\pi}
\left[
\sum_{t\ge 0}\gamma^t r(s_t,a_t)
\right].
$$

For a parameterized policy class $\{\pi_\theta\}$, we optimize

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

Stochastic policies provide differentiability. In discrete action spaces, a deterministic policy such as

$$
a=\arg\max_{a'} f_\theta(s,a')
$$

typically changes discontinuously with $\theta$. A stochastic policy $\pi_\theta(a\mid s)$ replaces hard action selection by a differentiable probability distribution.

## 2. Policy Gradient Theorem

Define the discounted state visitation distribution

$$
d_\rho^\pi(s)
:=
(1-\gamma)
\sum_{t\ge0}
\gamma^t
\mathbb P_\pi(s_t=s\mid s_0\sim\rho).
$$

The policy gradient theorem gives

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

This converts differentiation through the trajectory distribution into a score-function estimator,

$$
\nabla_\theta\log\pi_\theta(a\mid s).
$$

It is the common foundation of REINFORCE, Actor-Critic, TRPO, and PPO.

For any state-dependent baseline $b(s)$,

$$
\mathbb E_{a\sim\pi_\theta(\cdot\mid s)}
\left[
\nabla_\theta\log\pi_\theta(a\mid s)b(s)
\right]=0.
$$

Thus $Q^\pi(s,a)$ may be replaced by the advantage

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s),
$$

without changing the expected gradient, while often reducing variance.

## 3. REINFORCE and Stochastic Gradient

REINFORCE uses the sampled return

$$
G_t=\sum_{k=t}^{T-1}\gamma^{k-t}r_k
$$

as a Monte Carlo estimator of $Q^\pi$, leading to the update

$$
\theta
\leftarrow
\theta
+
\eta
\sum_{t=0}^{T-1}
\nabla_\theta\log\pi_\theta(a_t\mid s_t)G_t.
$$

The estimator is unbiased but high variance. Actor-Critic methods replace the pure Monte Carlo return by a critic estimate of $V^\pi$ or $A^\pi$, trading some bias for lower variance.

At the optimization level, policy gradient updates can be abstracted as

$$
\theta_{t+1}
=
\theta_t+\eta g_t,
\qquad
\mathbb E[g_t\mid\theta_t]
=
\nabla J(\theta_t).
$$

In the nonconvex case, the natural guarantee is not global optimality but a stationarity measure:

$$
\min_{0\le t<T}\mathbb E\!\left[\lVert\nabla J(\theta_t)\rVert^2\right].
$$

If $J$ is $\beta$-smooth and the gradient estimator satisfies

$$
\mathbb E\!\left[\lVert g_t-\nabla J(\theta_t)\rVert^2\mid\theta_t\right]\le\sigma^2,
$$

then telescoping the smoothness inequality gives

$$
\min_{0\le t<T}\mathbb E\lVert\nabla J_t\rVert^2
\le
\frac{\Delta+\frac{\beta\eta^2\sigma^2T}{2}}{T(\eta-\beta\eta^2/2)}.
$$

where $\Delta=J^*-J(\theta_0)$.

## 4. Stepsize and PPO

Let

$$
x:=\beta\eta,
\qquad
A:=\beta\Delta,
\qquad
B:=\frac{\sigma^2T}{2}.
$$

The upper bound has the form

$$
F(x)
=
\frac{A+Bx^2}{T(x-x^2/2)}.
$$

On $0<x\le 1$, $F$ is constant-factor equivalent to

$$
G(x)=\frac{A}{Tx}+\frac{B}{T}x.
$$

Balancing the two terms yields

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

The minimum reflects two constraints: the stepsize must remain within the smoothness scale, and it must balance the initial gap against stochastic variance.

PPO remains a policy gradient method, but it constrains how far a single update may move away from the old policy. Define the importance ratio

$$
r_t(\theta)
=
\frac{\pi_\theta(a_t\mid s_t)}
{\pi_{\theta_{\mathrm{old}}}(a_t\mid s_t)}.
$$

PPO uses the clipped surrogate

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

From a theoretical viewpoint, PPO is not a new policy gradient theorem. Its value is better understood as a conservative update geometry: data collected under the old policy should not support a new policy that moves too far away from it.

## Summary

The basic chain is

$$
\mathrm{MDP}
\rightarrow
J(\theta)=V^{\pi_\theta}(\rho)
\rightarrow
\nabla_\theta J(\theta)
\rightarrow
\theta_{t+1}=\theta_t+\eta g_t.
$$

Stochastic policies provide differentiability, trajectories provide gradient estimators, and optimization theory explains noise, variance, and stepsize selection. PPO does not introduce a new gradient theorem; it adds a conservative update geometry on top of noisy policy gradient.

## References

1. Sutton and Barto, *Reinforcement Learning: An Introduction*, 2nd ed., Ch. 13.
2. Williams, "Simple statistical gradient-following algorithms for connectionist reinforcement learning", *Machine Learning*, 1992.
3. Sutton, McAllester, Singh, Mansour, "Policy Gradient Methods for Reinforcement Learning with Function Approximation", NeurIPS, 1999.
4. Schulman et al., "Trust Region Policy Optimization", ICML, 2015.
5. Schulman et al., "Proximal Policy Optimization Algorithms", arXiv:1707.06347, 2017.
