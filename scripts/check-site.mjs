// Validate the generated public artifact, including legacy downloads and translated editions.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import yaml from 'js-yaml';
const root = path.resolve('dist');
const base = 'https://mistatle.github.io';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const pages = walk(root).filter((p) => p.endsWith('.html'));
const failures = [];
let links = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = '/' + path.relative(root, file).replace(/index\.html$/, '');
  if (/class="katex-error"/.test(html)) failures.push(`${relative}: invalid math`);
  if (/[\uE000\uE001]/.test(html)) failures.push(`${relative}: unrendered math placeholder`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = raw.replace(/&amp;/g, '&');
    if (/^(mailto:|data:|tel:|javascript:)/.test(value)) continue;
    const url = new URL(value, base + relative);
    if (url.origin !== base) continue;
    links++;
    let target = path.join(root, decodeURIComponent(url.pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { failures.push(`${relative}: missing ${value}`); continue; }
    if (url.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      const content = fs.readFileSync(target, 'utf8');
      if (!content.includes(`id="${id}"`) && !content.includes(`name="${id}"`)) failures.push(`${relative}: missing anchor ${value}`);
    }
  }
}
for (const dir of ['notes', 'resources']) {
  for (const file of fs.readdirSync(`content/${dir}`).filter((x) => x.endsWith('.md') && !x.endsWith('.en.md'))) {
    const raw = fs.readFileSync(`content/${dir}/${file}`, 'utf8');
    const meta = yaml.load(raw.match(/^---\n([\s\S]*?)\n---/)[1]);
    const published = meta.publish === true && !meta.draft;
    for (const prefix of ['', 'en/']) assert.equal(fs.existsSync(`dist/${prefix}${dir}/${file.replace('.md', '')}/index.html`), published, `${prefix}${dir}/${file}: publish gate`);
  }
}
for (const slug of ['deep-exploration', 'log-sobolev-entropy']) {
  for (const lang of ['', 'en/']) {
    const html = fs.readFileSync(`dist/${lang}notes/${slug}/index.html`, 'utf8');
    const pdf = slug === 'deep-exploration' ? 'deep-exploration-note' : slug;
    assert.ok(html.includes(`/downloads/${pdf}${lang ? '-en' : ''}.pdf`), `${slug}: language-specific PDF`);
  }
}
assert.equal(failures.length, 0, failures.join('\n'));
console.log(`Checked ${pages.length} HTML pages, ${links} local links, math output, publication gates and bilingual PDFs.`);
