# Problem-Led Reading

The source file paper-reading-brief.tex is a four-page XeLaTeX template for source-aware reading notes: one reusable entry page and one three-page worked example.

The workflow has three stages:

1. establish an initial judgment from the source;
2. use AI to expand, not settle, the hypothesis space;
3. write back only source-checked revisions.

The entry page is reusable across papers, reports, book chapters, essays, and technical documentation. The worked example studies Hoeffding's inequality through its MGF argument, a dependence counterexample, and a source-checked revision.

## Compile

    xelatex paper-reading-brief.tex

The document uses a 7.5 x 10 inch page and includes Chinese font fallbacks.
