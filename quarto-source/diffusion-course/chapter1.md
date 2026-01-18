# The Forward Process

In this chapter, we define the forward diffusion process as a Markov Chain that gradually adds Gaussian noise to the data.

## Mathematical Definition

Given a data point $x_0 \sim q(x)$, we define a forward transition kernel:

$$
q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t} x_{t-1}, \beta_t \mathbf{I})
$$

Where $\beta_t$ is a fixed variance schedule.

## Code Implementation

Let's visualize the noise schedule using Python. This chart is generated **live** during compilation.

```{python}
#| label: fig-beta-schedule
#| fig-cap: "Linear vs Cosine Beta Schedules"

import numpy as np
import matplotlib.pyplot as plt

def get_linear_schedule(T, start=1e-4, end=0.02):
    return np.linspace(start, end, T)

def get_cosine_schedule(T, s=0.008):
    steps = T + 1
    x = np.linspace(0, T, steps)
    alphas_cumprod = np.cos(((x / T) + s) / (1 + s) * np.pi / 2) ** 2
    return alphas_cumprod / alphas_cumprod[0]

T = 1000
betas_linear = get_linear_schedule(T)
alphas_cos = get_cosine_schedule(T)

plt.figure(figsize=(10, 5))
plt.plot(betas_linear, label='Linear Beta', color='#1e3a8a', linewidth=2)
plt.title('Variance Schedule $\\beta_t$')
plt.xlabel('Timestep $t$')
plt.ylabel('$\\beta_t$')
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()
