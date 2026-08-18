# AI-era Theory Note

A polished one-page XeLaTeX template for auditable theory work with AI.

Unlike a conventional lecture note, it treats a change in judgment as the atomic unit:

```text
prior judgment -> counter-evidence -> AI pressure test -> human decision
               -> rebuilt proof spine -> capability delta
```

The included worked example derives the optimal contraction factor of gradient descent. It preserves a valid but lossy first argument as evidence against the initial judgment, then records the representation switch, human decision, verification, and next independent reconstruction.

Compile with:

```bash
xelatex growth-note.tex
```

The source uses macOS Chinese fonts when available and falls back through Source Han, Noto CJK, and Fandol. Released under the MIT License.
