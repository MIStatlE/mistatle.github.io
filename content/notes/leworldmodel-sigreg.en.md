---
title: "LeWorldModel / SIGReg: Why Doesn't It Collapse?"
description: "Connecting latent prediction, representation collapse and SIGReg, and identifying the conditions the mechanism actually depends on."
tags: ["World Model", "JEPA", "SIGReg", "Latent Planning"]
---

## Sources

1. Paper (arXiv): [LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels](https://arxiv.org/abs/2603.19312)
2. Paper PDF: [arXiv PDF](https://arxiv.org/pdf/2603.19312v1)
3. This note as a PDF (in Chinese): [leworldmodel_sigreg.pdf](/downloads/leworldmodel-sigreg.pdf)

## 0. The Conclusion First

> The point of LeWorldModel is not to predict pixels accurately. It is to learn latent dynamics that can be rolled forward, can be used for planning, and do not collapse to a single point.  
> It learns the dynamics with a prediction loss while SIGReg constrains the overall geometry of the latent space.

## 1. What the World Model Does Here

The core idea of a world model is simple: given the current state and an action, learn how the environment evolves. Many lines of work have grown out of this goal, and some count "predict the next video frame" as part of world modeling.

The JEPA line goes one step further: first compress the high-dimensional observation into a latent space, then learn the dynamics in that latent space. Prediction and planning then happen in a more compact representation, which is cheaper to compute and closer to the structure a control task actually cares about. The price is that, compared with predicting video directly, the quality of the latent representation is no longer directly visible.

LeWorldModel aims to learn, end to end from raw pixels, a latent world model that is predictable, usable for planning, and does not collapse.

## 2. The Training Objective

**Training objective**

$$
z_t = \mathrm{enc}_{\theta}(o_t), \quad \hat{z}_{t+1} = \mathrm{pred}_{\phi}(z_t, a_t).
$$

$$
\mathcal{L}_{\mathrm{pred}} = \frac{1}{T-1}\sum_{t=1}^{T-1} \|\hat{z}_{t+1} - z_{t+1}\|_2^2, \quad \mathcal{L}_{\mathrm{LeWM}} = \mathcal{L}_{\mathrm{pred}} + \lambda\, \mathrm{SIGReg}(Z).
$$

Here:

- $o_t$ is the visual observation at time $t$.
- $a_t$ is the action taken.
- $z_t$ can be read as the latent state at time $t$.
- $\hat z_{t+1}$ is the world model's prediction of the next latent.

## 3. Why Next-Latent Prediction Collapses

Suppose the encoder maps every observation to the same constant vector $c$, that is,

$$
z_t \equiv c, \quad \hat{z}_{t+1} \equiv c.
$$

Then the Euclidean prediction loss immediately becomes

$$
\|\hat{z}_{t+1} - z_{t+1}\|_2^2 = 0.
$$

In other words: **under a next-latent prediction objective, point collapse is not a training failure. It is a legitimate optimum.**

Once point collapse happens, all states are indistinguishable in latent space. The current state, the goal state and the predicted endpoint all land on the same point, so every action sequence looks equally good and planning loses its meaning.

## 4. How SIGReg Blocks Collapse

Write the matrix of latent samples as

$$
Z \in \mathbb{R}^{n \times d}.
$$

SIGReg does more than "push samples apart". It does something stronger: **it pushes the empirical distribution of the latents towards an isotropic Gaussian $\mathcal{N}(0, I_d)$.**

**Definition of SIGReg**

First sample random unit directions

$$
u^{(m)} \sim \mathrm{Unif}(\mathbb{S}^{d-1}), \quad m = 1, \ldots, M.
$$

project onto one dimension

$$
h^{(m)} = Z u^{(m)} \in \mathbb{R}^n.
$$

and then average a one-dimensional normality statistic:

$$
\mathrm{SIGReg}(Z) = \frac{1}{M}\sum_{m=1}^M T(h^{(m)}).
$$

where $T$ is the Epps--Pulley statistic, which measures the distance between the projected samples and the standard normal $\mathcal{N}(0, 1)$.

The theoretical intuition is: **a high-dimensional distribution is characterized by its projections onto all one-dimensional directions.**  
The high-dimensional anti-collapse problem therefore turns into many one-dimensional problems: check a number of random directions and see whether the projections look standard Gaussian. As a result:

- constant solutions are ruled out;
- low-rank representations are ruled out;
- strongly correlated representations are ruled out as well.

## 5. What Latent Planning Actually Optimizes

After training, the encoder and the predictor are frozen.

Given the current observation $o_1$ and a goal observation $o_g$, first encode them as

$$
\hat{z}_1 = \mathrm{enc}_{\theta}(o_1), \quad z_g = \mathrm{enc}_{\theta}(o_g).
$$

then roll the prediction forward in latent space:

$$
\hat{z}_{t+1} = \mathrm{pred}_{\phi}(\hat{z}_t, a_t), \quad t = 1, \ldots, H - 1.
$$

The planning objective is

$$
a_{1:H}^* = \arg\min_{a_{1:H}} \|\hat{z}_H - z_g\|_2^2.
$$

The planner does not modify the latent representation itself. It optimizes a sequence of actions so that the endpoint predicted by the world model is as close as possible to the latent encoding of the goal observation.

In practice LeWorldModel uses **CEM + MPC**:

- CEM repeatedly samples, selects and updates in the space of action sequences;
- MPC keeps replanning, which limits the model error accumulated over long rollouts.

## 6. Takeaway

> It can be read as three steps:  
> first learn, in latent space, where an action pushes the state;  
> then use SIGReg to make sure this latent space is not a collapsed pseudo-solution;  
> finally search for action sequences directly on the frozen dynamics.

## References

1. Lucas Maes, Quentin Le Lidec, Damien Scieur, Yann LeCun, Randall Balestriero. [*LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels*](https://arxiv.org/abs/2603.19312). arXiv preprint, 2026.
2. David Ha, Jürgen Schmidhuber. [*World Models*](https://arxiv.org/abs/1803.10122). arXiv preprint, 2018.
3. Yann LeCun. [*A Path Towards Autonomous Machine Intelligence*](https://openreview.net/forum?id=BZ5a1r-kVsf). OpenReview, 2022.
4. Randall Balestriero, Yann LeCun. *LeJEPA: Provable and Scalable Self-Supervised Learning without the Heuristics*. arXiv preprint, 2025.
5. Thomas W. Epps, Lawrence B. Pulley. *A Test for Normality Based on the Empirical Characteristic Function*. Biometrika, 1983.
6. Harald Cramér, Herman Wold. *Some Theorems on Distribution Functions*. Journal of the London Mathematical Society, 1936.
7. Reuven Y. Rubinstein, Dirk P. Kroese. *The Cross-Entropy Method: A Unified Approach to Combinatorial Optimization, Monte-Carlo Simulation and Machine Learning*. Springer, 2004.
