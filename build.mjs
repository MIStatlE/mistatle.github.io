// Static site generator for mistatle.github.io
//   node build.mjs            build into dist/
//   node build.mjs --serve    build, serve on http://localhost:4321 and rebuild on change
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { renderMarkdown, esc } from './src/markdown.mjs';
import * as layout from './src/layout.mjs';
import { prepareMap } from './src/map.mjs';
import { faviconSvg } from './src/logo.mjs';
import { LANGS, BASE, HTML_LANG, UI, pick, formatDate } from './src/i18n.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function parseFile(file) {
  const raw = read(file);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const data = yaml.load(m[1]) || {};
  for (const key of ['date', 'updated']) if (data[key] instanceof Date) data[key] = data[key].toISOString().slice(0, 10);
  return { data, body: raw.slice(m[0].length) };
}

// `slug.md` is the Chinese original and carries the shared metadata;
// `slug.en.md` is the optional English version (title, description, tags and body).
function loadCollection(dir, warnings) {
  const files = fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.md'));
  const slugs = files.filter((f) => !/\.en\.md$/.test(f)).map((f) => f.replace(/\.md$/, ''));
  for (const f of files.filter((f) => /\.en\.md$/.test(f))) {
    if (!slugs.includes(f.replace(/\.en\.md$/, ''))) throw new Error(`${dir}/${f}: no matching ${f.replace('.en.md', '.md')}`);
  }
  const out = Object.fromEntries(LANGS.map((l) => [l, []]));
  for (const slug of slugs) {
    const zh = parseFile(`${dir}/${slug}.md`);
    if (zh.data.draft) continue;
    for (const key of ['title', 'description']) if (!zh.data[key]) throw new Error(`${dir}/${slug}.md: "${key}" is required`);
    const en = files.includes(`${slug}.en.md`) ? parseFile(`${dir}/${slug}.en.md`) : null;
    const render = (src, lang) => renderMarkdown(src.body, { warn: (msg) => warnings.push(`${dir}/${slug}: ${msg}`), footnotesLabel: UI[lang].footnotes });
    const zhOut = render(zh, 'zh');
    const enOut = en ? render(en, 'en') : null;
    const { en: enMeta = {}, ...shared } = zh.data;
    out.zh.push({ slug, tags: [], ...shared, ...zhOut, bodyLang: zh.data.lang || 'zh', translated: true });
    out.en.push({ slug, tags: [], ...shared, ...enMeta, ...(en ? en.data : {}), ...(enOut || zhOut), bodyLang: en ? 'en' : zh.data.lang || 'zh', translated: !!en || zh.data.lang === 'en' });
  }
  return out;
}

function hashed(name, content) {
  const hash = crypto.createHash('sha1').update(content).digest('hex').slice(0, 8);
  const file = `assets/${name.replace(/(\.\w+)$/, `.${hash}$1`)}`;
  write(file, content);
  return '/' + file;
}

function build() {
  const started = Date.now();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, 'static'), DIST, { recursive: true });
  write('favicon.svg', faviconSvg());

  const warnings = [];
  const site = JSON.parse(read('content/site.json'));
  const rawMap = JSON.parse(read('content/map.json'));
  const papers = JSON.parse(read('content/papers.json'));
  const notes = loadCollection('content/notes', warnings);
  const resources = loadCollection('content/resources', warnings);
  const resourceLinks = JSON.parse(read('content/resources.json'));

  const has = (list, id) => list.some((x) => x.id === id);
  for (const n of notes.zh) {
    const where = `notes/${n.slug}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.date || '')) throw new Error(`${where}: "date" must look like 2026-01-31`);
    if (!has(site.tracks, n.track)) throw new Error(`${where}: unknown track "${n.track}"`);
    if (n.area && !has(site.areas, n.area)) throw new Error(`${where}: unknown subject "${n.area}" (see "areas" in content/site.json)`);
    if (n.kind && !has(site.kinds, n.kind)) throw new Error(`${where}: unknown kind "${n.kind}"`);
    if (n.collection && !has(site.collections, n.collection)) throw new Error(`${where}: unknown collection "${n.collection}"`);
  }

  // KaTeX: ship only the woff2 fonts, every modern browser picks those first.
  const katexDir = path.dirname(require.resolve('katex/dist/katex.min.css'));
  const katexCss = fs.readFileSync(path.join(katexDir, 'katex.min.css'), 'utf8').replace(/,url\([^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, '');
  for (const f of fs.readdirSync(path.join(katexDir, 'fonts')).filter((f) => f.endsWith('.woff2'))) {
    write(`assets/fonts/${f}`, fs.readFileSync(path.join(katexDir, 'fonts', f)));
  }

  // Optional display face for the cover. Skipped quietly when the package is not installed.
  let fontCss = '';
  try {
    const dir = path.join(path.dirname(require.resolve('@fontsource/playfair-display/package.json')), 'files');
    for (const [weight, style] of [[700, 'normal'], [700, 'italic'], [400, 'normal']]) {
      const file = `playfair-display-latin-${weight}-${style}.woff2`;
      write(`assets/fonts/${file}`, fs.readFileSync(path.join(dir, file)));
      fontCss += `@font-face{font-family:"Playfair Display";font-style:${style};font-weight:${weight};font-display:swap;src:url(fonts/${file}) format("woff2")}\n`;
    }
  } catch {
    console.warn('note: @fontsource/playfair-display not installed, the cover falls back to system serif fonts');
    fontCss = '';
  }

  const assets = { css: hashed('site.css', fontCss + read('src/site.css')), js: hashed('site.js', read('src/site.js')), katex: hashed('katex.css', katexCss) };
  const urls = [];
  const lastmod = Object.fromEntries(notes.zh.map((n) => [`/notes/${n.slug}/`, n.updated || n.date]));

  for (const lang of LANGS) {
    const base = BASE[lang];
    const href = (p) => base + p;
    const list = notes[lang].map((n) => ({ ...n, url: href(`/notes/${n.slug}/`) })).sort((a, b) => b.date.localeCompare(a.date));
    const res = resources[lang].map((r) => ({ ...r, url: href(`/resources/${r.slug}/`) })).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    const ctx = {
      lang, base, href, site, assets, papers,
      t: UI[lang], L: (v) => pick(v, lang), date: (iso) => formatDate(iso, lang), htmlLang: HTML_LANG[lang],
      notes: list, resources: res, resourceLinks,
      updated: list.map((n) => n.updated || n.date).sort().at(-1),
      map: prepareMap(rawMap, site, list, href),
    };
    const pages = [
      ['/', layout.homePage(ctx)],
      ['/notes/', layout.notesPage(ctx)],
      ['/resources/', layout.resourcesPage(ctx)],
      ['/about/', layout.aboutPage(ctx)],
      ...list.map((n) => [`/notes/${n.slug}/`, layout.notePage(ctx, n)]),
      ...res.map((r) => [`/resources/${r.slug}/`, layout.resourcePage(ctx, r)]),
      ...ctx.map.areas.filter((a) => a.url).map((a) => [`/map/${a.id}/`, layout.coursePage(ctx, a)]),
    ];
    for (const [p, html] of pages) {
      write(`${base}${p}index.html`.replace(/^\//, ''), html);
      urls.push(p);
    }
    // Addresses used by earlier versions of the site keep working.
    const moved = { '/topics/': '/notes/', '/map/': '/notes/#map', '/papers/': '/notes/#papers', '/templates/': '/resources/' };
    for (const r of res) moved[`/templates/${r.slug}/`] = `/resources/${r.slug}/`;
    for (const [from, to] of Object.entries(moved)) write(`${base}${from}index.html`.replace(/^\//, ''), layout.redirectPage(ctx, href(to)));
    write(`${base}/search.json`.replace(/^\//, ''), JSON.stringify(layout.searchIndex(ctx)));
    write(`${base}/rss.xml`.replace(/^\//, ''), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(site.name)}</title>
<link>${site.url}${href('/')}</link>
<description>${esc(pick(site.description, lang))}</description>
<language>${HTML_LANG[lang]}</language>
<atom:link href="${site.url}${href('/rss.xml')}" rel="self" type="application/rss+xml"/>
${list.map((n) => `<item>
  <title>${esc(n.title)}</title>
  <link>${site.url}${n.url}</link>
  <guid>${site.url}${n.url}</guid>
  <pubDate>${new Date(n.date + 'T00:00:00+08:00').toUTCString()}</pubDate>
  <description>${esc(n.description)}</description>
</item>`).join('\n')}
</channel>
</rss>
`);
    if (lang === 'zh') write('404.html', layout.notFoundPage(ctx));
  }

  const unique = [...new Set(urls)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${unique.flatMap((p) => LANGS.map((lang) => `  <url><loc>${site.url}${BASE[lang]}${p}</loc>${lastmod[p] ? `<lastmod>${lastmod[p]}</lastmod>` : ''}${LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${HTML_LANG[l]}" href="${site.url}${BASE[l]}${p}"/>`).join('')}</url>`)).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  for (const w of warnings) console.warn('warning:', w);
  console.log(`built ${urls.length} pages in ${Date.now() - started} ms${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };

function serve(port = 4321) {
  http
    .createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      let file = path.join(DIST, path.normalize(p));
      if (!file.startsWith(DIST)) file = path.join(DIST, '404.html');
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(302, { location: p + '/' }); return res.end(); }
      const ok = fs.existsSync(file);
      if (!ok) file = path.join(DIST, '404.html');
      res.writeHead(ok ? 200 : 404, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port, () => console.log(`serving http://localhost:${port}`));
}

if (process.argv.includes('--serve')) {
  // Each rebuild runs in a fresh process, so edits to src/*.mjs take effect as well as content and styles.
  const rebuild = () => {
    try { execFileSync(process.execPath, [fileURLToPath(import.meta.url)], { stdio: 'inherit' }); } catch { /* the child already printed the error */ }
  };
  rebuild();
  serve();
  let timer;
  for (const dir of ['content', 'src', 'static']) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 150);
    });
  }
} else {
  build();
}
