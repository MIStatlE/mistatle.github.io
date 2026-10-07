---
title: "Scaled Dot-Product Attention: Why Divide by √dₖ?"
description: "Deriving the Transformer's scaling factor from dot-product variance, softmax saturation and gradient stability, with a PyTorch implementation."
tags: ["Transformer", "Attention", "PyTorch"]
---

## Introduction

The **Transformer** architecture dominates modern natural language processing (NLP). Its core component, scaled dot-product attention, combines linear algebra and probability to capture long-range dependencies within a sequence.

This note takes a white-box look at the mechanism through a short derivation and a from-scratch implementation.

---

## 1. Mathematical Formulation

At its core, attention maps a **query** onto a set of **key-value** pairs.

### 1.1 The formula

Suppose the input is projected into three matrices: queries $Q$, keys $K$ and values $V$. The output is a weighted sum of $V$, with weights given by the similarity between $Q$ and $K$:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

where:
* $Q, K \in \mathbb{R}^{n \times d_k}$ ($n$ is the sequence length, $d_k$ the key dimension)
* $V \in \mathbb{R}^{n \times d_v}$

### 1.2 Why divide by $\sqrt{d_k}$?

> **Key point:** the scaling factor $\frac{1}{\sqrt{d_k}}$ is essential.

When $d_k$ is large, the dot products $Q \cdot K^T$ tend to be large in magnitude. This pushes the softmax into its saturated region, where gradients are close to $0$.

Assume the entries of $q$ and $k$ are independent with mean 0 and variance 1. Their dot product $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ then has mean 0 but variance $d_k$. Scaling brings the variance back to 1:

$$
\text{Var}\left(\frac{q \cdot k}{\sqrt{d_k}}\right) = \frac{1}{d_k}\text{Var}(q \cdot k) = \frac{d_k}{d_k} = 1
$$

This keeps gradients flowing stably during backpropagation.

---

## 2. Implementation

Below is a compact `PyTorch` implementation, with support for a `Batch` dimension so that it runs in parallel.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

def scaled_dot_product_attention(query, key, value, mask=None):
    """
    Scaled dot-product attention.
    Args:
        query: [batch_size, num_heads, seq_len, d_k]
        key:   [batch_size, num_heads, seq_len, d_k]
        value: [batch_size, num_heads, seq_len, d_v]
        mask:  mask tensor (optional)
    
    Returns:
        output: context vectors
        attention_weights: attention weight matrix
    """
    d_k = query.size(-1)
    
    # 1. Compute QK^T (matrix product)
    # transpose(-2, -1) swaps the last two dimensions of key, i.e. a transpose
    scores = torch.matmul(query, key.transpose(-2, -1)) 
    
    # 2. Scale
    scores = scores / math.sqrt(d_k)
    
    # 3. Apply the mask (optional, typically used in the decoder)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # 4. Normalize with softmax
    attention_weights = F.softmax(scores, dim=-1)
    
    # 5. Weighted sum
    output = torch.matmul(attention_weights, value)
    
    return output, attention_weights

# --- Quick test ---
if __name__ == "__main__":
    # Dummy data: Batch=1, Head=1, Seq_len=5, d_k=64
    d_k = 64
    q = torch.randn(1, 1, 5, d_k)
    k = torch.randn(1, 1, 5, d_k)
    v = torch.randn(1, 1, 5, d_k)
    
    out, weights = scaled_dot_product_attention(q, k, v)
    
    print(f"Output shape: {out.shape}") # expected: [1, 1, 5, 64]
    print(f"Weights sum check: {weights[0][0][0].sum().item():.4f}") # expected: 1.0000
```
