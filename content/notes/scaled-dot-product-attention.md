---
title: "缩放点积注意力：为什么除以 √dₖ？"
description: "从点积方差、Softmax 饱和与梯度稳定性出发，推导 Transformer 中缩放因子的来历，并给出 PyTorch 实现。"
date: "2025-11-23"
area: "deep-learning"
kind: "foundation"
track: "systems"
tags: ["Transformer", "Attention", "PyTorch"]
legacy: "public/data/posts/vae_elbo.md"
---

## 引言 (Introduction)

在现代自然语言处理（NLP）中，**Transformer** 架构占据了统治地位。而其核心组件——缩放点积注意力机制（Scaled Dot-Product Attention），巧妙地结合了线性代数与概率论，实现了对序列内部长距离依赖的捕捉。

本文将通过数学推导与代码复现，通过“白盒”视角剖析这一机制。

---

## 1. 数学原理 (Mathematical Formulation)

注意力机制的本质是一个**查询（Query）**到一系列**键值对（Key-Value）**的映射。

### 1.1 核心公式

假设我们将输入矩阵分别投影为三个矩阵：查询矩阵 $Q$、键矩阵 $K$ 和值矩阵 $V$。输出矩阵是通过计算 $Q$ 和 $K$ 的相似度，对 $V$ 进行加权求和得到的：

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

其中：
* $Q, K \in \mathbb{R}^{n \times d_k}$ （$n$ 为序列长度，$d_k$ 为键的维度）
* $V \in \mathbb{R}^{n \times d_v}$

### 1.2 为什么要除以 $\sqrt{d_k}$？

> **关键点：** 这里的缩放因子 $\frac{1}{\sqrt{d_k}}$ 至关重要。

当 $d_k$ 很大时，点积 $Q \cdot K^T$ 的结果往往会非常大。这会导致 Softmax 函数进入“饱和区”（Saturated Region），即梯度接近于 $0$。

假设 $q$ 和 $k$ 是均值为 0、方差为 1 的独立随机变量，那么它们的点积 $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ 的均值为 0，但方差会变为 $d_k$。为了让方差回到 1，我们需要进行缩放：

$$
\text{Var}\left(\frac{q \cdot k}{\sqrt{d_k}}\right) = \frac{1}{d_k}\text{Var}(q \cdot k) = \frac{d_k}{d_k} = 1
$$

这样可以确保梯度在反向传播时能够稳定流动。

---

## 2. 代码实现 (Implementation)

下面是一个基于 `PyTorch` 的简洁实现，包含为了并行计算而设计的 `Batch` 维度支持。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

def scaled_dot_product_attention(query, key, value, mask=None):
    """
    计算缩放点积注意力
    Args:
        query: [batch_size, num_heads, seq_len, d_k]
        key:   [batch_size, num_heads, seq_len, d_k]
        value: [batch_size, num_heads, seq_len, d_v]
        mask:  掩码张量 (可选)
    
    Returns:
        output: 上下文向量
        attention_weights: 注意力权重矩阵
    """
    d_k = query.size(-1)
    
    # 1. 计算 QK^T (矩阵乘法)
    # 这里的 transpose(-2, -1) 是将 key 的最后两个维度交换，即转置
    scores = torch.matmul(query, key.transpose(-2, -1)) 
    
    # 2. 缩放 (Scaling)
    scores = scores / math.sqrt(d_k)
    
    # 3. 应用掩码 (Masking) - 可选，常用于 Decoder
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    # 4. Softmax 归一化
    attention_weights = F.softmax(scores, dim=-1)
    
    # 5. 加权求和 (Weighted Sum)
    output = torch.matmul(attention_weights, value)
    
    return output, attention_weights

# --- 测试代码 ---
if __name__ == "__main__":
    # 模拟数据: Batch=1, Head=1, Seq_len=5, d_k=64
    d_k = 64
    q = torch.randn(1, 1, 5, d_k)
    k = torch.randn(1, 1, 5, d_k)
    v = torch.randn(1, 1, 5, d_k)
    
    out, weights = scaled_dot_product_attention(q, k, v)
    
    print(f"Output shape: {out.shape}") # 预期: [1, 1, 5, 64]
    print(f"Weights sum check: {weights[0][0][0].sum().item():.4f}") # 预期: 1.0000
```
