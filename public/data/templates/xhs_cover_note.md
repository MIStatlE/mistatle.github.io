---
title: XHS Cover Note Template
subtitle: A compact LaTeX source pack for public-facing academic notes.
tags: [LaTeX, XeLaTeX, XHS, Academic Notes]
---

This source pack contains the cover and note preamble used for a small academic-note workflow.

It is meant for:

- short mathematical notes,
- Xiaohongshu-style card exports,
- public-facing lecture note snippets,
- reusable theorem / key idea boxes.

## Files

- `xhs_cover_source/cover-template.tex`
- `xhs_cover_source/notes-preamble-2.tex`

## Use

Use the files as two related but separate style pieces.

For a Xiaohongshu-style card / cover export:

```tex
\documentclass{book}
\input{cover-template.tex}

\begin{document}
\MakeCoverBrandChapterPB
  {Title}
  {Subtitle}
  {Tag}
  {Label}
  {Step 1}
  {Step 2}
  {1}
  {3}
\end{document}
```

For an A4 note / handout:

```tex
\documentclass{book}
\input{notes-preamble-2.tex}

\begin{document}
\section{Title}
Your note here.
\end{document}
```

Compile with XeLaTeX when Chinese fonts or CTeX are used. Do not input both style files in the same minimal document unless you intentionally reconcile their page geometry.

## Customization

The source pack is public and uses generic defaults. Override these before calling the cover macros:

```tex
\renewcommand{\PublicTemplateBrand}{@YourName}
\renewcommand{\PublicTemplateTopic}{Learning Theory}
\renewcommand{\PublicTemplateSeries}{Concentration Notes}
\renewcommand{\CoverCoreTitle}{Core Idea}
\renewcommand{\CoverCoreBody}{Your main formula or idea.}
\renewcommand{\CoverCoreIntuition}{Why the idea is natural.}
\renewcommand{\CoverCoreApplications}{Where it is useful.}
```

If `WechatIMG522.jpg` is absent, the cover simply omits the avatar instead of failing to compile.

## License

The source pack is released under the MIT License. See `xhs_cover_source/LICENSE`.

## Notes

This is a curated public source pack. Private notes, unfinished drafts, and project-specific material are intentionally excluded.
