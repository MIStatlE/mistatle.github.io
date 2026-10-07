---
title: "Typical Sets: Where Probability Mass Lives in High Dimensions"
description: "Why does probability mass sit on a thin shell rather than at the point of highest density?"
tags: ["Information Theory", "High-Dimensional Geometry", "AEP"]
---

## 1. Setup

Let $X_1, \dots, X_n$ be independent and identically distributed (i.i.d.) random variables with joint distribution $p(X^n) = p(x_1, \dots, x_n)$.

We want to identify a "core subset" $A \in \mathcal{X}^n$ that captures the overwhelming majority of samples:

$$
\mathbb P[X^n \in A] \geq 1-\epsilon
$$

By the law of large numbers, for a function $g(x)$:

$$
\mathbb{E} \left[ \mathbb{I}\left( \left| \frac{1}{n}\sum_{i=1}^n g(X_i) - \mathbb{E}[g(X)] \right| \le \epsilon \right) \right] \ge 1-\epsilon
$$

This defines a set $A_{\epsilon}$. The next question is which $g(x)$ captures the geometry of the distribution.

We choose $g(x)=-\log p(x)$.

> **Note:**
Because the variables are i.i.d., taking the logarithm turns the joint density into a sum, that is, a sample mean, so the law of large numbers (LLN) applies:

$$
-\frac{1}{n} \log p(x^n) = -\frac{1}{n} \log \left( \prod_{i=1}^n p(x_i) \right) = \frac{1}{n} \sum_{i=1}^n \left[ -\log p(x_i) \right]
$$

As $n \to \infty$, the law of large numbers says this sample mean converges to its expectation, which is the entropy of the distribution:

$$
\frac{1}{n} \sum_{i=1}^n \left[ -\log p(x_i) \right] \xrightarrow{P} \mathbb{E}[-\log p(X)] = H(X)
$$

---

## 2. The Asymptotic Equipartition Property (AEP)

The asymptotic equipartition property (AEP) is the law of large numbers applied to the log-probability of a random sequence.

### Theorem (AEP)
As $n \to \infty$, by the law of large numbers:

$$
-\frac{1}{n} \log p(X_1, \dots, X_n) \to H(X) \quad \text{in probability}
$$

where $H(X) = \mathbb{E}[-\log p(X)]$ is the entropy (the differential entropy for continuous variables).

So for the vast majority of "typical" sequences, the joint probability $p(x^n)$ is close to $2^{-nH(X)}$. This motivates the definition of the typical set:

### Definition (typical set $A_\epsilon^{(n)}$)
The typical set $A_\epsilon^{(n)}$ is the set of sequences satisfying

$$
A_\epsilon^{(n)} = \{ x^n \in \mathcal{X}^n : \left| -\frac{1}{n} \log p(x^n) - H(X) \right| \le \epsilon\}
$$

In short, the typical set contains the samples whose "surprise" (negative log-likelihood) is close to the average entropy.

---

## 3. Two Key Properties

The typical set has two properties that look contradictory at first and together explain what sampling really does.

### Property 1: probability concentrates
For $n$ large enough, the typical set contains almost all of the probability mass:

$$
\mathbb{P}(A_\epsilon^{(n)}) > 1 - \epsilon
$$

If you sample from the distribution, the sample lands in the typical set with high probability.

### Property 2: the volume is tiny
Although it holds almost all of the probability, in high dimensions it occupies a vanishing fraction of the whole space:

$$
\text{Vol}(A_\epsilon^{(n)}) \approx 2^{nH(X)}
$$

If the entropy satisfies $H(X) < \log |\mathcal{X}|$ (equality holds only for the uniform distribution), the typical set is a very small subset of the whole space.

#### Proof
The proof rests on the fact that probabilities sum to one.
By the definition of the typical set, every sequence $x^n \in A_\epsilon^{(n)}$ has probability bounded below:

$$
p(x^n) \ge 2^{-n(H(X) + \epsilon)}
$$

Since the total probability over the whole space is 1, the total probability of the typical set is at most 1:

$$
\begin{aligned}
1 &\ge \sum_{x^n \in A_\epsilon^{(n)}} p(x^n) \\
  &\ge \sum_{x^n \in A_\epsilon^{(n)}} 2^{-n(H(X) + \epsilon)} \quad (\text{plug in the lower bound}) \\
  &= |A_\epsilon^{(n)}| \cdot 2^{-n(H(X) + \epsilon)} \quad (\text{the sum becomes a count times a constant})
\end{aligned}
$$

Rearranging gives the upper bound on the volume:

$$
|A_\epsilon^{(n)}| \le 2^{n(H(X) + \epsilon)} \approx 2^{nH(X)}
$$

So as long as the distribution is not exactly uniform (that is, $H(X) < \log |\mathcal{X}|$), the volume of the typical set shrinks exponentially in $n$ relative to the volume of the whole space, $|\mathcal{X}|^n = 2^{n \log |\mathcal{X}|}$.

---

## 4. Example: the High-Dimensional Gaussian

Consider the $d$-dimensional standard Gaussian $X \sim \mathcal{N}(0, I_d)$. Its density is largest at the origin $x=0$, yet the geometry of high dimensions keeps the probability mass away from that point.

For any sample $x \in \mathbb{R}^d$, the negative log-likelihood is

$$
-\log p(x) = \frac{d}{2}\log(2\pi) + \frac{1}{2} \sum_{i=1}^d x_i^2
$$

To locate the typical set we look at the normalized log-probability. The coordinates $x_i$ are independent $\mathcal{N}(0, 1)$ variables, so each $x_i^2$ follows a chi-squared distribution with one degree of freedom and $\mathbb{E}[x_i^2]=1$. By the weak law of large numbers (WLLN), as $d \to \infty$ the second moment of the sample converges in probability to its expectation:

$$
\frac{1}{d} \|x\|^2 = \frac{1}{d} \sum_{i=1}^d x_i^2 \xrightarrow{P} \mathbb{E}[x_1^2] = 1
$$

Almost every sample from a high-dimensional Gaussian therefore lies near a thin spherical shell of radius $\sqrt{d}$ centered at the origin:

$$
\|x\| \approx \sqrt{d}
$$
