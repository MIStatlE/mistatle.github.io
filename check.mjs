// Checks the built site: every internal link and asset reference must resolve to a file in dist/.
//   node check.mjs   (run after `npm run build`; exits with code 1 when something is broken)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(DIST);

const broken = [];
let links = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    links++;
    const [pathname, hash] = url.split('#');
    let target = path.join(DIST, decodeURIComponent(pathname));
    if (pathname.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { broken.push(`${path.relative(DIST, file)} → ${url}`); continue; }
    // Anchors: only checked for links within the same page, the others are view names handled by script.
    if (hash && target === file && !ids.has(decodeURIComponent(hash))) broken.push(`${path.relative(DIST, file)} → ${url} (no such anchor)`);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1 && !html.includes('http-equiv="refresh"')) broken.push(`${path.relative(DIST, file)}: expected exactly one <h1>`);
}

if (broken.length) {
  console.error(`${broken.length} problem(s):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log(`checked ${pages.length} pages, ${links} internal links: all good`);
