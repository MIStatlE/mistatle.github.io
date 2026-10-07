---
title: "Why random actions are not enough"
description: "Why can an uninformative action be necessary for learning? A path example and a complete proof explain what changes from bandits to reinforcement learning."
date: "2026-09-10"
publish: true
format: "note"
track: "algorithms"
area: "rl"
kind: "mechanism"
level: "core"
collection: "sequential-exploration"
tags: ["Deep Exploration", "Bandits"]
pdf: "/downloads/deep-exploration-note-en.pdf"
legacy: "public/data/library/rl/deep-exploration.en.md"
lang: "en"
---

> An action can be uninformative and still be necessary for learning. In RL, the relevant observation may lie at the end of a trajectory. Giving each action a chance does not, by itself, give that trajectory a reasonable chance.

## The question

Suppose an agent keeps trying unfamiliar actions. Why might it still fail to learn? In a classical stochastic bandit, choosing an arm produces a reward sample from that arm. This makes it natural to think of exploration as deciding which observation to purchase next.

In an MDP, an observation need not be immediately available. The agent may first have to reach the state where it can collect it. Reading Osband et al. [1, Example 1 and Section 4](https://jmlr.org/papers/volume20/18-339/18-339.pdf) shifts the question from *which action should we try?* to *which sequence of decisions will make useful feedback observable?*

Consider a chain with a chest at its end. Each right move costs a little; quitting ends the episode. The chest contains either treasure or a bomb, fixed throughout learning. Intermediate moves reveal neither. The first complete trip therefore loses money in expectation, yet it can be worth making: once the chest is observed, every later decision can use that information.

![A chain of N right moves reaches a fixed unknown chest. Each move costs c/N; quitting gives no further reward.](/images/notes/deep-exploration/deepsea-path-en.png)

*A known-path simplification of DeepSea. Only the final transition reveals the chest type. A zero at a quit state means zero future reward; costs already paid are not refunded.*

The issue is not merely delayed reward. It is *delayed access to information*. A strategy that values only immediate information can reject the very actions needed to obtain it.

## Access to information

> **Definition. Known-path MDP**
>
> Fix $N\ge2$ and a total path cost $c\in(0,1)$. Draw
> $$
> \Theta\in\{-1,+1\},\qquad
>   \mathbb{P}(\Theta=+1)=\mathbb{P}(\Theta=-1)=\tfrac12
> $$
> once, and keep it fixed across episodes. Each episode starts at $s_0$. At $s_t$, $0\le t<N$, action $R$ moves to $s_{t+1}$ and costs $c/N$; action $L$ terminates with no further reward. Completing all $N$ right moves reveals $\Theta$ and gives total return $\Theta-c$.

The action-to-direction mapping is known here. In the original DeepSea example it must also be learned, so intermediate transitions can inform that mapping. Our claim of zero immediate information concerns only $\Theta$, not every unknown in the original environment [1, Example 1 and Section 4](https://jmlr.org/papers/volume20/18-339/18-339.pdf).

At a fixed on-path history $h_t$, let $\tau_N$ be the first visit to $s_N$ in the current episode. Write
$$
\begin{aligned}
 \operatorname{IG}_t(a)
   &:= I\bigl(\Theta;(S_{t+1},r_{t+1})\mid H_t=h_t,A_t=a\bigr),\\
 h_t^\pi(a)
   &:= \mathbb{P}_\pi(\tau_N\le N\mid H_t=h_t,A_t=a).
\end{aligned}
$$
These expressions mean that action $a$ is taken at the fixed history; the agent's randomization supplies no extra information about $\Theta$. Before the final transition, $0\le t\le N-2$, the next state and cost are independent of $\Theta$. Hence $\operatorname{IG}_t(R)=0$ and $r_{t+1}=-c/N$. But if subsequent moves independently choose $R$ with probability $p\in(0,1)$,
$$
h_t^{\pi_p}(R)=p^{N-t-1}>0,
 \qquad h_t^{\pi_p}(L)=0.
$$
Immediate information gain and access to a later observation are different quantities.

**Why pay the cost?**

Consider an explore-then-commit policy: make one complete trip, then repeat it only if $\Theta=+1$; otherwise quit immediately. Its Bayes expected return over $T$ episodes is
$$
-c+\frac{T-1}{2}(1-c).
$$
This is positive when $T>(1+c)/(1-c)$, beating the zero-return policy that always quits. The chest reward has prior mean zero; the first trip has expected return $-c$, or $-0.01$ for the original cost scale.

This comparison establishes that costly exploration can be worthwhile. It does not claim that the displayed policy solves the full Bayes-optimal control problem.

## A path probability

How much does a one-step exploration probability tell us about reaching the chest? The following elementary result isolates the mechanism in Example 1 and Section 4 of [1, Example 1 and Section 4](https://jmlr.org/papers/volume20/18-339/18-339.pdf). The optimization over all couplings is derived here; it is not a theorem about the paper's learning algorithm.

Pre-sample a binary action sequence $X_1,\ldots,X_N$, with $X_t=1$ denoting $R$. If the episode terminates early, retain the unused samples as latent variables. This makes every time marginal well-defined without changing the arrival event
$$
G_N:=\{X_1=\cdots=X_N=1\}.
$$

> **Theorem. Fixed marginals do not determine paths**
>
> For $p\in(0,1)$, let $\mathcal C_p$ be the set of all joint distributions on $\{0,1\}^N$ such that $\mathbb{P}(X_t=1)=p$ for every $t$. Then
> $$
> \mathbb{P}_{\mu_{\mathrm{prod}}}(G_N)=p^N,
>  \qquad
>  \sup_{\mu\in\mathcal C_p}\mathbb{P}_\mu(G_N)=p.
> $$
> The second bound is attained by $X_1=\cdots=X_N=Z$, with $Z\sim\operatorname{Bern}(p)$. If action sequences are resampled independently across episodes, the expected numbers of episodes to the first arrival are $p^{-N}$ and $p^{-1}$, respectively.

> **Proof.**
>
> Independence gives the first identity by multiplication.
>
> **Proof crux: bound the event, then attain the bound**
>
> For any coupling and any $t$, the event $G_N$ is contained in $\{X_t=1\}$. Consequently,
> $$
> \mathbb{P}_\mu(G_N)\le\mathbb{P}_\mu(X_t=1)=p.
> $$
> Now draw a single $Z\sim\operatorname{Bern}(p)$ and set every $X_t=Z$. Each marginal is unchanged, but $G_N=\{Z=1\}$, so equality holds. The improvement comes from the joint distribution, not from raising any one-step marginal.
>
> With independent episodes, the first-arrival count is geometric with success probability $\mathbb{P}(G_N)$. Taking its mean gives the last assertion.
>
> ∎

Thus even a complete list of the time marginals leaves an exponentially large ambiguity in the arrival probability. What is missing is how the actions depend on one another.

## Conditional actions

The exponent becomes transparent when we factor the same event by conditional probabilities:
$$
\mathbb{P}(G_N)=\mathbb{P}(X_1=1)
 \prod_{t=2}^{N}\mathbb{P}(X_t=1\mid X_1=\cdots=X_{t-1}=1).
$$
Under independent sampling, every factor is $p$. Under the shared draw, the first factor is $p$, and every remaining factor is $1$: after observing $X_1=1$, the entire sequence is determined. The comparison is
$$
\underbrace{p\cdot p\cdots p}_{\text{independent decisions}}
 \qquad\text{versus}\qquad
 \underbrace{p\cdot1\cdots1}_{\text{one shared decision}}.
$$
Along the successful prefix, independent sampling keeps assigning probability to abandonment. A shared draw places probability $p$ on completing the entire path from the outset.

![Independent Bernoulli draws give path probability p to the N; a single shared Bernoulli draw gives probability p.](/images/notes/deep-exploration/temporal-coupling-en.png)

*Both constructions have $X_t\sim\operatorname{Bern}(p)$ at every time. Their conditional action probabilities after a right-moving prefix are different.*

**Equal time marginals do not mean equal policies at the same history.** If two agents had identical history-conditional action distributions at every reachable history, the same initial distribution and transition kernel would induce the same trajectory law. There is no contradiction with that fact.

Nor does slow randomization alone guarantee useful exploration. Correlation helps here because it assigns probability to the path that reveals $\Theta$. Persisting along an uninformative path would not solve the problem. The geometric waiting times above describe a *known* path, not the cost of learning unknown action mappings in the original DeepSea MDP.

## Bandits and RL

It is tempting to describe the distinction as “bandits are short-sighted; RL looks ahead.” That misses the point. Bandit algorithms also accept present costs to improve future decisions. Even in a bandit, observations change the learner's beliefs and therefore its future policy.

What a classical stochastic bandit lacks is a controlled physical state whose evolution changes which future observations are accessible. With a fixed arm set, choosing $a_t$ selects a reward distribution:
$$
a_t\in\mathcal A,\qquad r_{t+1}\sim P_\theta^{a_t}.
$$
In an MDP, the action also controls the next-state distribution:
$$
a_t\in\mathcal A(s_t),\qquad
 s_{t+1}\sim P_\theta(\,\cdot\mid s_t,a_t).
$$
This changes future state–action visitation and hence the observations the agent can collect. The distinction is about environmental dynamics, not the absence of a long-term learning objective in bandits.

To sample an arm, the agent needs the one-step event $\{A_t=a\}$. To observe the chest in our chain, it needs the path event $G_N$. The first is determined by a current action probability; the second depends on the joint distribution of a sequence of decisions. Controlled transitions turn access to feedback into a sequential decision problem.

This also clarifies the role of randomized value functions in [1, Example 1 and Section 4](https://jmlr.org/papers/volume20/18-339/18-339.pdf). A value function sampled at the start of an episode can guide a greedy policy throughout that episode. Its actions then pursue the return predicted by one plausible value function, including actions that only enable later learning. This does not mean repeating the same action everywhere. It is one mechanism for deep exploration, not its definition or a universal guarantee.

### Takeaway

The useful question is not only how often an agent tries each action. It is whether the trajectory distribution induced by those choices gives useful observations a reasonable chance of being reached. An uninformative step can matter because learning depends on where that step allows the agent to go next.

## Reference

[1] I. Osband, B. Van Roy, D. J. Russo, and Z. Wen. *Deep Exploration via Randomized Value Functions*. JMLR, 20(124):1–62, 2019. Example 1 and Section 4. [PDF](https://jmlr.org/papers/volume20/18-339/18-339.pdf)
