import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { renderMarkdown } from '../src/markdown.mjs';

test('math survives CJK, adjacent English words, quotes, and headings; code stays literal', () => {
  const warnings = [];
  const { html, toc } = renderMarkdown('### 定义 $A$\n\nBernoulli$(p)$，中文$x^2$。\n\n> **定理**\n>\n> $$\n> \\mathbb E[X]=p\n> $$\n\n`$literal$`\n\n```tex\n$also_literal$\n```', { warn: (m) => warnings.push(m) });
  assert.equal((html.match(/class="katex"/g) || []).length, 4);
  assert.ok(html.includes('<code>$literal$</code>'));
  assert.ok(html.replace(/<[^>]+>/g, '').includes('$also_literal$'));
  assert.ok(toc[0].html.includes('class="katex"'));
  assert.deepEqual(warnings, []);
});

test('definition, result, and proof have separate styles and preserve section boundaries', () => {
  const { html } = renderMarkdown('### 定义 (object)\n\nDefinition text.\n\n### 定理 (result)\n\nResult text.\n\n#### 证明\n\nProof text.\n\n## Next\n\nOutside.');
  assert.ok(html.includes('statement callout-definition'));
  assert.ok(html.includes('statement callout-theorem'));
  assert.ok(html.includes('statement callout-proof'));
  assert.equal((html.match(/<section/g) || []).length, 3);
  assert.equal((html.match(/<\/section>/g) || []).length, 3);
  assert.match(html, /<\/section><\/section><h2/);
});

test('old Chinese/English hash URLs and resource links reach their new pages', () => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('location.hash'));
  const cases = [
    ['#/writing/read/public%2Fdata%2Flibrary%2Frl%2Fdeep-exploration.md', '', '/notes/deep-exploration/'],
    ['#/writing/read/public%2Fdata%2Flibrary%2Frl%2Fdeep-exploration.md', '?lang=en', '/en/notes/deep-exploration/'],
    ['#/writing/read/public%2Fdata%2Flibrary%2Fprobability%2Flog-sobolev-entropy.en.md', '', '/en/notes/log-sobolev-entropy/'],
    ['#/resources/read/public%2Fdata%2Ftemplates%2Fshort_note.md', '', '/resources/short-note/'],
    ['', '?lang=en', '/en/'],
    ['#main', '', undefined],
    ['#/%ZZ', '', undefined],
  ];
  for (const [hash, search, expected] of cases) {
    let result;
    vm.runInNewContext(script, { URLSearchParams, location: { hash, search, replace: (to) => { result = to; } } });
    assert.equal(result, expected, `${search}${hash}`);
  }
});
