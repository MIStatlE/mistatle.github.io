---
title: "What does it cost to change a distribution?"
description: "Reweighting and a two-interval example explain entropy, gradient energy, and the implication claimed in #093."
date: "2026-10-07"
publish: true
format: "note"
track: "foundations"
area: "probability"
kind: "derivation"
level: "core"
collection: "probability-concentration"
tags: ["Log-Sobolev", "Entropy", "Concentration"]
pdf: "/downloads/log-sobolev-entropy-en.pdf"
legacy: "public/data/library/probability/log-sobolev-entropy.en.md"
subtitle: "Understanding the log-Sobolev inequality through entropy and gradient energy"
lang: "en"
---

When reading #093 in OpenAI's collection of mathematical manuscripts, it is easy to get stuck before reaching the proof: why is the conclusion so strong? If the tails in every direction look Gaussian, how can that control something as different as “entropy”?

To understand the connection, first clarify the two quantities being compared. The log-Sobolev inequality relates **the overall departure caused by reallocating probability mass** to **the local variation needed to make that change**.

## 1. Entropy: how far does reweighting move a distribution?

Fix a probability distribution $\mu$, and let $\mathbb E_\mu$ denote expectation under it. For a nonnegative, integrable function $h$, define

$$
\operatorname{Ent}_\mu(h)
:=\mathbb E_\mu[h\log h]
-\mathbb E_\mu[h]\log\mathbb E_\mu[h],
$$

with the convention $0\log0=0$; entropy may equal $+\infty$. All logarithms in this note are natural. This entropy is a functional of $h$; it is not differential entropy, which is usually written with a minus sign.

Suppose $h=f^2$ and $\mathbb E_\mu f^2=1$. We can then define a new probability distribution by

$$
\nu(A):=\int_A f^2\,d\mu,
\qquad \frac{d\nu}{d\mu}=f^2.
$$

The function $f^2$ acts as a probability weight: regions where it exceeds 1 gain mass, while regions where it is below 1 lose mass. Hence

$$
\operatorname{Ent}_\mu(f^2)
=\int f^2\log f^2\,d\mu
=\int\log\frac{d\nu}{d\mu}\,d\nu
=D_{\rm KL}(\nu\|\mu).
$$

**This gives entropy a concrete meaning: it is the KL divergence from the distribution obtained by reweighting with $f^2$ to the original distribution.** KL divergence is not a geometric distance; it compares relative probability weights.

Normalization imposes no additional restriction. If $Z:=\mathbb E_\mu f^2\in(0,\infty)$, set $d\nu=f^2d\mu/Z$. Direct substitution gives

$$
\operatorname{Ent}_\mu(f^2)=Z\,D_{\rm KL}(\nu\|\mu).
$$

If $f^2$ is a positive constant almost everywhere, reweighting leaves the probability distribution unchanged, and the entropy is zero. For $f=0$, the entropy is also zero, but a normalized reweighted distribution cannot be defined.

## 2. Gradient energy: where does the variation occur?

For a smooth function $f:\mathbb R^n\to\mathbb R$, define its Dirichlet energy by

$$
\mathcal E_\mu(f):=\int\|\nabla f(x)\|^2\,d\mu(x).
$$

The gradient measures the local rate of change, and squaring it penalizes sharp variation. The integral reveals a crucial feature: **the original distribution $\mu$ determines the weight assigned to the places where variation occurs.** Changing $f$ in a region with almost no probability mass can be cheap. Here “cost” means a mathematical measure of local variation, not computing time or physical energy.

### An explicit counterexample

Let $\mu$ place half its probability mass uniformly on each of the intervals $[-2,-1]$ and $[1,2]$. Choose a smooth, compactly supported function $f$ that equals $\sqrt2$ throughout the left interval and zero throughout the right interval, with every transition confined to regions where $\mu$ has no mass.

![A gap separates the two components of probability mass. The function is constant on the support and varies only in the gap and outside the support.](/images/notes/log-sobolev-entropy/log-sobolev-two-components-en.png)

Then

$$
\mathbb E_\mu f^2=\tfrac12\cdot2=1,
\qquad
\operatorname{Ent}_\mu(f^2)=\tfrac12\cdot2\log2=\log2.
$$

The new distribution puts all its mass on the left interval, substantially changing the overall allocation of probability. Yet $f$ is constant wherever the original distribution has mass, so

$$
\mathcal E_\mu(f)=0.
$$

This counterexample does not rely on a nonsmooth indicator function. Our choice of $f$ can be smooth everywhere; it varies only where the integral cannot see it.

## 3. Log-Sobolev: an overall departure cannot come for free

We say that $\mu$ satisfies a log-Sobolev inequality with constant $K$ if, for every smooth, compactly supported function $f$,

$$
\boxed{\operatorname{Ent}_\mu(f^2)\le K\mathcal E_\mu(f).}
$$

When $\mathbb E_\mu f^2=1$, this becomes

$$
D_{\rm KL}(f^2\mu\|\mu)
\le K\int\|\nabla f\|^2\,d\mu.
$$

If reweighting causes a substantial overall departure, the function must incur a sufficiently large cost in local variation. A smaller $K$ imposes a stronger constraint. The distribution on two intervals above fails this inequality for every finite $K$, because the right-hand side is zero while the left-hand side is positive.

### The connection to variance: a small perturbation

Take a smooth, bounded function $g$ with $\mathbb E_\mu g=0$, and set $f_\varepsilon=1+\varepsilon g$. Assume also that $\nabla g$ is bounded. Smooth cutoffs and a limiting argument extend the inequality from compactly supported test functions to this class. Expanding gives

$$
\operatorname{Ent}_\mu(f_\varepsilon^2)
=2\varepsilon^2\operatorname{Var}_\mu(g)+o(\varepsilon^2),
\qquad
\mathcal E_\mu(f_\varepsilon)
=\varepsilon^2\mathcal E_\mu(g).
$$

Substituting and letting $\varepsilon\to0$ yields the Poincaré inequality

$$
\operatorname{Var}_\mu(g)\le\frac K2\mathcal E_\mu(g).
$$

Thus variance control appears in the second-order expansion of entropy control around a constant function. Log-Sobolev also constrains reweightings far from constant.

## 4. #093: how can linear tails control all this?

Now return to the manuscript's assumptions. Let $X\sim\mu$, with $\mathbb E X=0$, and suppose there exists $a>0$ such that

$$
\sup_{\|\theta\|=1}
\mathbb E\exp\!\left(\frac{\langle\theta,X\rangle^2}{a^2}\right)\le2.
$$

Here $\theta$ is a fixed unit direction, and $\langle\theta,X\rangle$ is the projection in that direction. The condition requires the same scale $a$ to work in every direction. By Markov's inequality, for each fixed direction,

$$
\mathbb P(|\langle\theta,X\rangle|\ge t)
\le2e^{-t^2/a^2}.
$$

Notice that $\sup$ sits outside the expectation: the condition does not allow us to observe $X$ and then choose a direction, nor does it directly control $\mathbb E e^{\|X\|^2/a^2}$.

Tail control alone is insufficient. The counterexample on two intervals is even bounded: taking $a=2/\sqrt{\log2}$ makes it satisfy this exponential-moment condition, yet it has no finite log-Sobolev constant.

#093 additionally assumes that the density $p$ is **log-concave**: its positive set is convex, and $\log p$ is concave on that set. Equivalently, we can write $p=e^{-V}$, where $V$ is a convex function allowed to take the value $+\infty$. This condition rules out the empty gap between the two components above, but does not by itself supply a quantitative constant independent of dimension.

**The claim in #093 (Theorem 1.1, manuscript dated 2026-09-23).** In any dimension $n$, if a centered probability distribution $\mu$ has a Lebesgue density, is log-concave, and satisfies the linear subgaussian condition above, then there is a universal constant $C$, independent of $n,\mu,a$, such that

$$
\operatorname{Ent}_\mu(f^2)
\le Ca^2\int\|\nabla f\|^2\,d\mu,
\qquad f\in C_c^\infty(\mathbb R^n).
$$

The manuscript presents this as an affirmative resolution of Bizeul's log-Sobolev conjecture for linearly subgaussian measures. This note explains what the conclusion means; it does not independently verify the full proof in #093. [Sources 1, 2]

The reach of this implication is what matters: **the assumption checks only the tails of linear observations, while the conclusion simultaneously constrains probability reweightings by all smooth functions, without an additional dimension factor.** Log-concavity provides geometric structure. The difficult step is to turn that structure into quantitative control valid for every nonlinear test function.

## 5. What does this give us?

Here is a standard consequence. Suppose the log-Sobolev constant is $K>0$, and fix $L>0$. Every $L$-Lipschitz function $g$, meaning

$$
|g(x)-g(y)|\le L\|x-y\|,
$$

satisfies, for every $t\ge0$, the Gaussian concentration bound

$$
\mathbb P(|g(X)-\mathbb Eg(X)|\ge t)
\le2\exp\!\left(-\frac{t^2}{KL^2}\right).
$$

Substituting $K=Ca^2$ reveals the strengthening claimed in #093: Gaussian tails for all linear projections lead to Gaussian control of fluctuations for all Lipschitz observations.

How does this consequence follow from entropy? For a smooth, bounded $L$-Lipschitz function $g$, let $\psi(\lambda)=\log\mathbb E e^{\lambda g}$ and substitute $f=e^{\lambda g/2}$ into the LSI, again extending it by cutoffs. Dividing by $\mathbb E e^{\lambda g}$ gives

$$
\lambda\psi'(\lambda)-\psi(\lambda)
\le\frac{KL^2\lambda^2}{4}.
$$

For $\lambda>0$, integrate $(\psi(\lambda)/\lambda)'$ and use $\lim_{\lambda\to0}\psi(\lambda)/\lambda=\mathbb Eg$ to obtain

$$
\log\mathbb E e^{\lambda(g-\mathbb Eg)}
\le\frac{KL^2\lambda^2}{4}.
$$

Markov's inequality gives the upper-tail bound with the choice $\lambda=2t/(KL^2)$. Applying the same argument to $-g$ gives the two-sided bound. General Lipschitz functions are handled by truncation, smooth approximation, and passage to the limit. This is the standard Herbst argument. [Source 2, equations (2)–(3)]

For example, $g(x)=\|x\|$ is 1-Lipschitz. The conclusion controls fluctuations of the radius around its mean; it does not say that the radius itself is independent of dimension. A standard Gaussian vector still has a typical radius of order $\sqrt n$.

The counterexample on two intervals is a useful way to keep the meaning of the inequality in view: when probability mass is separated by a gap that lets a function change without paying local energy, the overall distribution can change at almost no local cost. Log-Sobolev places a uniform constraint on such “cheap reweighting.” The claim in #093 is that, within the log-concave class, the scale of the linear tails supplies this constraint.

## Sources and scope

1. OpenAI. *A dimension-free logarithmic Sobolev inequality for subgaussian log-concave measures*. 2026-09-23, Theorem 1.1. [Original manuscript](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/A-dimension-free-logarithmic-Sobolev-inequality-for-subgaussian-log-concave-measures-September-23-2026/paper.pdf).
2. Pierre Bizeul. *On the Log-Sobolev Constant of Log-Concave Vectors*. arXiv:2306.12997v3, 2026-02-16, Introduction and Conjecture 2. [Original paper](https://arxiv.org/html/2306.12997v3). Its convention is $\operatorname{Ent}(f^2)\le2\rho_{LS}^2\mathcal E(f)$, corresponding to $K=2\rho_{LS}^2$ in this note.

The entropy–KL identity, the calculation on two intervals, and the small-perturbation expansion are elementary derivations developed in this note. LSI, the Poincaré inequality, and the Herbst argument are standard material. This note claims no originality for these ingredients and does not replace a review of the new manuscript's proof.
