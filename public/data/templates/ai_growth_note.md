---
title: AI-era Theory Note
date: 2026-08-18
categories: LaTeX Template
description: 一份记录判断如何被证据改变的 3:4 XeLaTeX 理论 Note：人的第一路线、反证信号、AI 压力测试、最终决定与能力增量。
tags: [LaTeX, Theory Notes, XeLaTeX, AI Research]
---

### Preview

<div class="template-gallery">
  <img src="assets/images/latex-template/ai-growth-note-preview.png" alt="AI-era Theory Note template preview">
</div>

### 笔记的最小单位，是一次判断变化

AI 时代最容易保存的是最终答案，最容易消失的却是人的判断如何形成。这份模板保存一条可审计的变化轨迹：

```text
prior judgment
→ counter-evidence
→ AI pressure test
→ human decision
→ rebuilt proof spine
→ capability delta
```

AI 的角色是暴露盲点、寻找反例和提出替代表达，而不是替人拥有判断。接受哪条路线、证据是否足够、以及能否独立重建，仍由人负责。

### Worked Example

示例研究强凸光滑函数上梯度下降的最优收缩率。第一条路线正确却损失了条件数依赖；这个损失被明确记录为反对原判断的证据。AI 压力测试引出一个保留耦合的插值不等式，修正后的 proof spine 利用关键项抵消恢复最优收缩因子。

模板最后记录判断变化、已核验证据、仍欠自己的证明，以及下一次面对相似结构时应该做出的不同第一步。

> 一条笔记只有在改变未来行为时才完成。最终答案只是结果；可复现的判断，才是积累。

### Source Files

* [growth-note.tex](public/data/templates/ai_growth_note_source/growth-note.tex)
* [README.md](public/data/templates/ai_growth_note_source/README.md)
* [LICENSE](public/data/templates/ai_growth_note_source/LICENSE)

### Compile

```bash
xelatex growth-note.tex
```

源文件内置中文字体回退，关键中文标签采用稳定的主字体输出。成品为一页 7.5 × 10 英寸（3:4）PDF，可直接渲染成 1500 × 2000 图片。

### License

The source pack is released under the MIT License.
