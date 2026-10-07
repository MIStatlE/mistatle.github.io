---
title: "Problem-Led Reading"
description: "Form your own question and judgment first, let AI widen the possibilities, then return to the source to verify and revise."
tags: ["Reading Notes", "XeLaTeX", "AI-Assisted"]
---

## Problem-led reading

This template is for reading papers, reports, book chapters, long essays and project documentation. The first page is a reusable entry sheet; the other three follow one example through three stages:

1. Form an initial judgment: separate the source's claims, its evidence and your own interpretation.
2. Expand the candidates: let AI propose conceptual distinctions, alternative mechanisms, counterexamples and transfers.
3. Revise after checking: go back to the source and write back only what has been verified.

The principle is:

> Judge first, expand the candidates next, verify before writing back.

AI sits in an optional sidebar. It widens the space of hypotheses and never edits the main note directly. The reader still chooses which branches to follow, checks the evidence and decides what is worth keeping.

## Worked example

The example reads Hoeffding's 1963 concentration inequality for bounded variables. The first pass records the theorem, the MGF lemma and the chain of the proof. AI is then asked to separate the roles of boundedness and independence, to construct a fully dependent Rademacher counterexample and to flag the martingale extension. Only revisions verified against the proof are written back.

## Files

* [PDF](/downloads/templates/reading-inquiry/reading-inquiry.pdf)
* [paper-reading-brief.tex](/downloads/templates/reading-inquiry/paper-reading-brief.tex)
* [README.md](/downloads/templates/reading-inquiry/README.md)
* [LICENSE](/downloads/templates/reading-inquiry/LICENSE)

## Compile

    xelatex paper-reading-brief.tex

The result is a four-page 7.5 × 10 inch PDF that renders directly to 1500 × 2000 images for mobile.

## License

The source pack is released under the MIT License.
