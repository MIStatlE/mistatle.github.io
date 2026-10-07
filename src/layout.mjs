// Page templates. Plain functions returning HTML strings. `ctx` carries the language:
// ctx.t = interface text, ctx.L(v) = pick the language of a { zh, en } value, ctx.href(path) = URL in this language.
import { esc } from './markdown.mjs';
import { icons } from './icons.mjs';
import { markSvg } from './logo.mjs';
import { LANGS, BASE, HTML_LANG } from './i18n.mjs';

const NAV = ['notes', 'resources', 'about'];
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`;
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

function socials(ctx, { email = false, rss = false } = {}) {
  const { site, t, href } = ctx;
  const items = [...site.links];
  if (email) items.push({ label: 'Email', icon: 'email', color: 'var(--brand)', href: `mailto:${site.email}` });
  if (rss) items.push({ label: 'RSS', icon: 'rss', color: '#f26522', href: href('/rss.xml') });
  return `<ul class="socials">
${items
  .map((l) => {
    const inner = `<span class="badge">${icons[l.icon] || ''}</span><span class="tip">${esc(l.label)}</span>`;
    const style = ` style="--c:${l.color}"`;
    if (!l.href) return `<li><span class="social is-off" role="img" aria-label="${esc(l.label)} (${esc(t.notYet)})"${style}>${inner}</span></li>`;
    const ext = /^https?:/.test(l.href) ? ' target="_blank" rel="noopener me"' : '';
    return `<li><a class="social" href="${esc(l.href)}" aria-label="${esc(l.label)}"${ext}${style}>${inner}</a></li>`;
  })
  .join('\n')}
</ul>`;
}

function analytics(site) {
  const a = site.analytics || {};
  let out = '';
  if (a.goatcounter) out += `<script data-goatcounter="https://${esc(a.goatcounter)}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>\n`;
  if (a.umami?.src && a.umami?.websiteId) out += `<script defer src="${esc(a.umami.src)}" data-website-id="${esc(a.umami.websiteId)}"></script>\n`;
  return out;
}

// `path` is the language-neutral path ("/notes/x/"); the header links to the same page in the other language.
export function page(ctx, { title, description, path, active, body, hasMath = false, type = 'website', head = '', bodyClass = '', switchPath = path }) {
  const { site, assets, t, L, href, lang } = ctx;
  const full = title ? `${title} · ${site.name}` : `${site.name} | ${site.title}`;
  const desc = description || L(site.description);
  const url = site.url + href(path);
  const other = LANGS.find((l) => l !== lang);
  return `<!doctype html>
<html lang="${ctx.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${site.url}${BASE[l]}${path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${site.url}${path}">
<meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title || site.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${site.url}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${href('/rss.xml')}">
<script>${THEME_BOOT}</script>
<link rel="stylesheet" href="${assets.css}">
${hasMath ? `<link rel="stylesheet" href="${assets.katex}">` : ''}
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${href('/')}" aria-label="${esc(site.name)} · ${esc(t.home)}">${markSvg()}<span>${esc(site.name)}</span></a>
    <nav class="nav" aria-label="${esc(t.home)}">
      ${NAV.map((key) => `<a href="${href(`/${key}/`)}"${key === active ? ' aria-current="page"' : ''}>${esc(t.nav[key])}</a>`).join('\n      ')}
    </nav>
    <div class="tools">
      <a class="lang-switch" href="${BASE[other]}${switchPath}" lang="${HTML_LANG[other]}" hreflang="${HTML_LANG[other]}" aria-label="${esc(t.switchLabel)}" title="${esc(t.switchLabel)}">${icons.globe}<span>${esc(t.switchTo)}</span></a>
      <button class="theme-toggle" type="button" aria-label="${esc(t.theme)}" title="${esc(t.theme)}"><span class="i-sun">${icons.sun}</span><span class="i-moon">${icons.moon}</span></button>
    </div>
  </div>
  <div class="progress" aria-hidden="true"></div>
</header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">${esc(site.name)}</p>
      <p>Est. ${site.since} · ${esc(L(site.location))} · Mathematics, Algorithms &amp; AI</p>
    </div>
    ${socials(ctx, { email: true, rss: true })}
  </div>
</footer>
<button class="to-top" type="button" aria-label="${esc(t.top)}" hidden>↑</button>
<script src="${assets.js}" defer></script>
${analytics(site)}</body>
</html>
`;
}

// ---------- shared pieces ----------

const find = (list, id) => list.find((x) => x.id === id);
const trackOf = (ctx, id) => find(ctx.site.tracks, id);

// "∑ 数学基础 · 信息论": the track colours it, the area names it.
function areaChip(ctx, n) {
  const area = find(ctx.site.areas, n.area), track = trackOf(ctx, n.track);
  const text = area ? ctx.L(area.title) : track ? ctx.L(track.title) : '';
  return text ? `<span class="chip t-${n.track}"><i></i>${esc(text)}</span>` : '';
}
const formatLabel = (ctx, n) => esc(ctx.L(find(ctx.site.formats, n.format)?.title) || '');

function noteCard(ctx, n) {
  const { t, L, site } = ctx;
  const track = trackOf(ctx, n.track), area = find(site.areas, n.area);
  const text = [n.title, n.description, formatLabel(ctx, n), L(track?.title), L(area?.title), ...n.tags].join(' ').toLowerCase();
  return `<a class="card note-card t-${n.track}" href="${n.url}" data-track="${n.track}" data-area="${n.area || ''}" data-kind="${n.kind || ''}" data-format="${n.format || ''}" data-tags="${esc(json(n.tags))}" data-text="${esc(text)}">
  <span class="card-top">${areaChip(ctx, n)}<span class="kind">${formatLabel(ctx, n)}</span></span>
  <strong>${esc(n.title)}</strong>
  <span class="desc">${esc(n.description)}</span>
  <span class="card-foot"><time datetime="${n.date}">${n.date}</time><span class="go">${esc(t.read)} <b>→</b></span></span>
</a>`;
}

const noteGrid = (ctx, notes) => `<div class="note-grid">\n${notes.map((n) => noteCard(ctx, n)).join('\n')}\n</div>`;

const sectionHead = (eyebrow, title, more = '') => `<header class="sec-head">
  <div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>
  ${more}
</header>`;

// ---------- home ----------

export function homePage(ctx) {
  const { site, notes, t, L, href, lang } = ctx;
  const legacy = Object.fromEntries(notes.filter((n) => n.legacy).flatMap((n) => [
    [n.legacy, `/notes/${n.slug}/`],
    [n.legacy.replace(/\.md$/, '.en.md'), `/en/notes/${n.slug}/`],
  ]));
  const resourceLegacy = Object.fromEntries(ctx.resources.filter((r) => r.legacy).map((r) => [r.legacy, r.url]));
  const redirect = lang === 'zh'
    ? `<script>(function(){var raw=location.hash.replace(/^#\\/?/,'');var h;try{h=decodeURIComponent(raw)}catch(e){return}var en=new URLSearchParams(location.search).get('lang')==='en';var m=${json(legacy)},r=${json(resourceLegacy)},t={home:'/',about:'/about/',resources:'/resources/',templates:'/resources/',writing:'/notes/',collections:'/notes/',papers:'/resources/#reading',library:'/notes/'};var p=h.split('/read/'),u=p[1]&&(m[p[1]]||r[p[1]]);if(!u)u=t[p[0]];if(u){if(en&&!u.startsWith('/en/'))u='/en'+u;location.replace(u)}else if(en&&!h)location.replace('/en/')})()</script>`
    : '';
  const selected = (site.featured || []).map((slug) => notes.find((n) => n.slug === slug)).filter(Boolean);
  const body = `<section class="hero hero-compact">
  <p class="eyebrow">Mathematics · Algorithms · AI</p>
  <h1>${esc(t.homeTitle)}</h1>
  <p class="hero-statement">${esc(L(site.statement))}</p>
  <p class="hero-links"><a href="${href('/about/')}">${esc(t.aboutAuthor)} →</a><a href="${href('/rss.xml')}">RSS ↗</a></p>
</section>
<section class="sec selected-section">
${sectionHead('Start here', esc(t.selected), `<a class="more" href="${href('/notes/')}">${esc(t.allNotes(notes.length))} →</a>`)}
<div class="selected-grid">${selected.map((n, i) => `<a class="card selected-card t-${n.track}" href="${n.url}"><span class="selection-index">0${i + 1} <span>${formatLabel(ctx, n)}</span></span><h3>${esc(n.title)}</h3><p class="desc">${esc(n.description)}</p><span class="go">${esc(t.read)} →</span></a>`).join('')}</div>
</section>
<section class="sec">
${sectionHead('Recent writing', esc(t.latest))}
<ul class="recent-list">${notes.slice(0, 3).map((n) => `<li><time datetime="${n.date}">${n.date}</time><a href="${n.url}">${esc(n.title)}</a><span>${formatLabel(ctx, n)}</span></li>`).join('')}</ul>
</section>
<section class="sec resource-entry"><div><p class="eyebrow">Resources</p><h2>${esc(t.resourceEntry)}</h2><p class="desc">${esc(t.resourceEntryDesc)}</p></div><a class="btn" href="${href('/resources/')}">${esc(t.resources)} →</a></section>`;
  return page(ctx, { path: '/', body, head: redirect });
}

// ---------- notes: the published writing comes first ----------

export function notesPage(ctx) {
  const { site, notes, t, L, href } = ctx;
  const facet = (key, id, label) => `<button type="button" class="facet is-pill" data-facet="${key}" data-value="${esc(id)}" aria-pressed="false"><span>${esc(label)}</span></button>`;
  const groups = site.collections.map((c) => ({ ...c, notes: notes.filter((n) => n.collection === c.id) })).filter((c) => c.notes.length);
  const body = `<header class="page-head"><p class="eyebrow">Notes</p><h1>${esc(t.nav.notes)}</h1><p class="lede">${esc(t.notesLede)}</p></header>
<section class="notes-index" id="list">
  <div class="toolbar"><label class="search">${icons.search}<input type="search" id="note-search" placeholder="${esc(t.search)}" autocomplete="off" aria-label="${esc(t.search)}"><kbd>/</kbd></label></div>
  <div class="quick-filters" aria-label="${esc(t.filters)}"><div class="facet-row">${site.tracks.filter((tr) => notes.some((n) => n.track === tr.id)).map((tr) => facet('track', tr.id, L(tr.title))).join('')}</div>
    <details class="more-filters"><summary>${esc(t.moreFilters)}</summary><p class="filter-label">${esc(t.facetFormat)}</p><div class="facet-row">${site.formats.map((f) => facet('format', f.id, L(f.title))).join('')}</div><p class="filter-label">${esc(t.facetTree)}</p><div class="facet-row">${site.areas.filter((a) => notes.some((n) => n.area === a.id)).map((a) => facet('area', a.id, L(a.title))).join('')}</div></details>
  </div>
  <p class="result-bar"><span id="result-count" role="status" aria-live="polite" data-one="${esc(t.count(1))}" data-many="${esc(t.count(2))}">${esc(t.count(notes.length))}</span><span id="active-filters"></span><button type="button" id="clear-filters" hidden>${esc(t.clear)} ×</button></p>
  <div id="note-results">${noteGrid(ctx, notes)}</div><p class="empty" id="notes-empty" hidden>${esc(t.empty)}</p>
</section>
<section class="sec" id="topics"><span id="map"></span><details class="fold"><summary>${esc(t.byTopic)}<small>${groups.length}</small></summary><div class="topic-grid">${groups.map((c) => `<a id="${c.id}" class="card topic-card t-${c.track}" href="${href(`/topics/${c.id}/`)}"><p class="topic-name">${esc(L(c.title))}</p><h3>${esc(L(c.question))}</h3><p class="desc">${esc(L(c.description))}</p><span class="go">${esc(t.allNotes(c.notes.length))} →</span></a>`).join('')}</div></details></section>`;
  return page(ctx, { title: t.nav.notes, description: t.notesLede, path: '/notes/', active: 'notes', body });
}

export function topicPage(ctx, collection) {
  const { t, L, href } = ctx;
  const notes = ctx.notes.filter((n) => n.collection === collection.id);
  const body = `<header class="page-head"><a class="more" href="${href('/notes/')}">${esc(t.backNotes)}</a><p class="eyebrow">${esc(L(collection.title))}</p><h1>${esc(L(collection.question))}</h1><p class="lede">${esc(L(collection.description))}</p></header>${noteGrid(ctx, notes)}`;
  return page(ctx, { title: L(collection.title), description: L(collection.description), path: `/topics/${collection.id}/`, active: 'notes', body });
}

export const redirectPage = (ctx, to) => `<!doctype html><html lang="${ctx.htmlLang}"><head><meta charset="utf-8"><title>${esc(ctx.site.name)}</title><link rel="canonical" href="${ctx.site.url}${esc(to)}"><meta http-equiv="refresh" content="0; url=${esc(to)}"><meta name="robots" content="noindex"></head><body><a href="${esc(to)}">${esc(ctx.site.name)}</a></body></html>`;

// ---------- note ----------

function tocBlock(ctx, toc) {
  if (toc.length < 3) return '';
  const min = Math.min(...toc.map((x) => x.depth));
  const items = toc.filter((x) => x.depth <= min + 1);
  return `<nav class="toc" aria-label="${esc(ctx.t.toc)}">
  <details open>
    <summary>${esc(ctx.t.toc)}</summary>
    <ol>
      ${items.map((x) => `<li class="d${x.depth - min}"><a href="#${x.id}">${x.html}</a></li>`).join('\n      ')}
    </ol>
  </details>
</nav>`;
}

function comments(ctx) {
  const c = ctx.site.comments || {};
  if (c.provider !== 'giscus' || !c.repoId || !c.categoryId) return '';
  const cfg = { repo: c.repo, repoId: c.repoId, category: c.category, categoryId: c.categoryId, lang: ctx.lang === 'zh' ? 'zh-CN' : 'en' };
  return `<section class="comments" lang="${ctx.htmlLang}"><h2>${esc(ctx.t.comments)}</h2><div class="giscus" data-config="${esc(json(cfg))}"></div></section>`;
}

export function notePage(ctx, n) {
  const { site, notes, t, L, href, htmlLang } = ctx;
  const track = trackOf(ctx, n.track);
  const coll = find(site.collections, n.collection);
  const i = notes.indexOf(n);
  const newer = notes[i - 1], older = notes[i + 1];
  const related = coll ? notes.filter((x) => x.slug !== n.slug && x.collection === coll.id) : [];
  const around = related.length ? `<div class="steps"><p class="steps-label">${esc(t.related)}</p><ul>${related.map((x) => `<li><a href="${x.url}">${esc(x.title)}</a></li>`).join('')}</ul></div>` : '';
  const toc = tocBlock(ctx, n.toc);
  const foreign = n.bodyLang !== ctx.lang;
  const body = `<article class="article t-${n.track}${toc ? ' has-toc' : ''}">
  <header class="article-head">
    <p class="crumbs"><a href="${href('/notes/')}">${esc(t.backNotes)}</a>${areaChip(ctx, n)}<span class="kind">${formatLabel(ctx, n)}</span></p>
    <h1>${esc(n.title)}</h1>
    <p class="lede">${esc(n.description)}</p>
    <p class="meta">
      <time datetime="${n.date}">${ctx.date(n.date)}</time>
      ${n.updated ? `<span>${esc(t.updated(ctx.date(n.updated)))}</span>` : ''}
      <span>${esc(t.minutes(n.minutes))}</span>
      ${n.pdf ? `<a class="pdf" href="${esc(n.pdf)}">${icons.download}${esc(t.pdf)}</a>` : ''}
    </p>
    ${foreign ? `<p class="notice">${esc(t.onlyOther)}</p>` : ''}
  </header>
  ${toc}
  <div class="prose"${foreign ? ` lang="${HTML_LANG[n.bodyLang]}"` : ''}>
${n.html}
  </div>
  <footer class="article-foot">
    ${n.tags.length ? `<p class="tags">${n.tags.map((x) => `<span># ${esc(x)}</span>`).join('')}</p>` : ''}
    ${coll || around ? `<aside class="in-topic">
      <span class="glyph-badge" aria-hidden="true">${esc(track?.glyph || '∗')}</span>
      <div>
        ${coll ? `<p class="topic-name">${esc(t.inTopic)} · ${esc(L(coll.title))}</p>\n        <p class="q"><a href="${href(`/topics/${coll.id}/`)}">${esc(L(coll.question))}</a></p>` : `<p class="topic-name">${esc(t.inMap)}</p>`}
        ${around ? `<div class="around">${around}</div>` : ''}
      </div>
    </aside>` : ''}
    <p class="feedback">${esc(t.feedback)} <a href="mailto:${site.email}">${site.email}</a></p>
    ${comments(ctx)}
    <nav class="pager">
      ${older ? `<a class="card prev" href="${older.url}"><span>${esc(t.older)}</span>${esc(older.title)}</a>` : '<span></span>'}
      ${newer ? `<a class="card next" href="${newer.url}"><span>${esc(t.newer)}</span>${esc(newer.title)}</a>` : '<span></span>'}
    </nav>
  </footer>
</article>`;
  const ld = `<script type="application/ld+json">${json({
    '@context': 'https://schema.org', '@type': 'Article', headline: n.title, description: n.description,
    datePublished: n.date, ...(n.updated ? { dateModified: n.updated } : {}), inLanguage: HTML_LANG[n.bodyLang] || htmlLang,
    author: { '@type': 'Person', name: site.name }, url: site.url + n.url,
  })}</script>`;
  return page(ctx, { title: n.title, description: n.description, path: `/notes/${n.slug}/`, active: 'notes', body, hasMath: n.hasMath, type: 'article', head: ld });
}

// ---------- resources (templates, PDFs, tools, links) ----------

const tagRow = (tags) => `<span class="tags">${tags.map((x) => `<span>${esc(x)}</span>`).join('')}</span>`;

// Two sources: pages in content/resources/ and plain entries in content/resources.json.
function resourceItems(ctx) {
  const { L } = ctx;
  const pages = ctx.resources.map((x) => ({ type: x.type || 'template', title: x.title, description: x.description, tags: x.tags, url: x.url, image: x.previews?.[0] }));
  const extra = ctx.resourceLinks.map((x) => ({ type: x.type || 'link', title: L(x.title), description: L(x.description) || '', tags: x.tags || [], url: x.url, external: /^https?:/.test(x.url), file: !!x.file }));
  return [...pages, ...extra];
}

export function resourcesPage(ctx) {
  const { site, t, L } = ctx;
  const items = resourceItems(ctx);
  const sections = site.resourceTypes.map((ty) => ({ ty, list: items.filter((x) => x.type === ty.id) })).filter((s) => s.list.length);
  const body = `<header class="page-head">
  <p class="eyebrow">Resources</p>
  <h1>${esc(t.nav.resources)}</h1>
  <p class="lede">${esc(t.resourcesLede)}</p>
  ${sections.length > 1 ? `<p class="jump-row">${sections.map(({ ty, list }) => `<a href="#${ty.id}">${esc(L(ty.title))}<small>${list.length}</small></a>`).join('')}</p>` : ''}
</header>
${sections.map(({ ty, list }) => `<section class="sec res-sec" id="${ty.id}">
<header class="sec-head"><div><p class="eyebrow">${esc(ty.id)}</p><h2>${esc(L(ty.title))}</h2></div><p class="sec-note">${esc(L(ty.desc) || '')}</p></header>
${list.some((x) => x.image) ? `<div class="template-grid">
${list.map((x) => `<a class="card template-card" href="${x.url}">
  <span class="sheet"><img src="${x.image}" alt="${esc(x.title)}" loading="lazy" decoding="async"></span>
  <strong>${esc(x.title)}</strong>
  <span class="desc">${esc(x.description)}</span>
  ${tagRow(x.tags)}
</a>`).join('\n')}
</div>` : `<ul class="res-list">
${list.map((x) => `<li class="card res-row">
  <span class="res-icon" aria-hidden="true">${x.file ? icons.download : icons.link}</span>
  <div>
    <h3><a href="${esc(x.url)}"${x.external ? ' target="_blank" rel="noopener"' : ''}>${esc(x.title)}</a></h3>
    <p class="desc">${esc(x.description)}</p>
  </div>
  <a class="pdf" href="${esc(x.url)}"${x.external ? ' target="_blank" rel="noopener"' : ''}>${esc(x.file ? t.download : t.open)}${x.file ? ' ↓' : ' ↗'}</a>
</li>`).join('\n')}
</ul>`}
</section>`).join('\n')}
<section class="sec" id="reading">${sectionHead('Reading', esc(t.readingSources))}<p class="sec-lede">${esc(t.readingSourcesDesc)}</p><ul class="res-list">${ctx.papers.filter((p) => ctx.notes.some((n) => n.slug === p.note)).map((p) => `<li class="card res-row"><div><h3><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3><p class="desc">${esc(p.authors)} · ${esc(p.venue)} ${p.year}</p></div><a class="pdf" href="${ctx.notes.find((n) => n.slug === p.note).url}">${esc(t.toNote)} →</a></li>`).join('')}</ul></section>`;
  return page(ctx, { title: t.nav.resources, path: '/resources/', active: 'resources', body, description: t.resourcesLede });
}

export function resourcePage(ctx, x) {
  const { t, href, L, site } = ctx;
  const foreign = x.bodyLang !== ctx.lang;
  const ty = find(site.resourceTypes, x.type || 'template');
  const body = `<article class="article article-solo">
  <header class="article-head">
    <p class="crumbs"><a href="${href('/resources/')}">${esc(t.backResources)}</a><span class="kind">${esc(L(ty?.title) || '')}</span></p>
    <h1>${esc(x.title)}</h1>
    <p class="lede">${esc(x.description)}</p>
    <p class="tags">${x.tags.map((y) => `<span>${esc(y)}</span>`).join('')}</p>
    ${foreign ? `<p class="notice">${esc(t.onlyOther)}</p>` : ''}
  </header>
  ${x.previews?.length ? `<div class="gallery" tabindex="0" aria-label="${esc(t.preview)}">
    ${x.previews.map((src, i) => `<a class="sheet zoomable" href="${src}"><img src="${src}" alt="${esc(x.title)} · ${i + 1}" loading="lazy" decoding="async"></a>`).join('\n    ')}
  </div>` : ''}
  <div class="prose"${foreign ? ` lang="${HTML_LANG[x.bodyLang]}"` : ''}>
${x.html}
  </div>
</article>`;
  return page(ctx, { title: x.title, description: x.description, path: `/resources/${x.slug}/`, active: 'resources', body, hasMath: x.hasMath });
}

// ---------- about, 404 ----------

export function aboutPage(ctx) {
  const { site, t, L } = ctx;
  const focus = ['probability', 'theory', 'rl', 'optimization'].map((id) => find(site.areas, id)).filter(Boolean);
  const body = `<header class="page-head">
  <p class="eyebrow">About</p>
  <h1>${esc(t.aboutHello)} <em>${esc(site.name)}</em></h1>
</header>
<div class="about">
  <div class="prose">
    <p class="first">${esc(t.about[0])}</p>
    ${t.about.slice(1).map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <aside class="card">
    <p class="eyebrow">${esc(t.interests)}</p>
    <p class="interests">${focus.map((a) => `<span class="chip t-${a.track}"><i></i>${esc(L(a.title))}</span>`).join('')}</p>
    <p class="eyebrow">${esc(t.contact)}</p>
    <p><a class="mail" href="mailto:${site.email}">${site.email}</a></p>
    <p class="eyebrow">Elsewhere</p>
    ${socials(ctx)}
  </aside>
</div>`;
  return page(ctx, { title: t.nav.about, path: '/about/', active: 'about', body });
}

export function notFoundPage(ctx) {
  const zh = ctx.t, en = { notFound: 'This page <em>diverged</em>', lede: 'The link may have changed. Start again from <a href="/en/notes/">all notes</a>.' };
  const body = `<header class="page-head">
  <p class="eyebrow">404</p>
  <h1>${zh.notFound}</h1>
  <p class="lede">${zh.notFoundLede}</p>
  <p class="lede" lang="en">${en.notFound.replace(/<\/?em>/g, '')}. ${en.lede}</p>
</header>`;
  return page(ctx, { title: '404', path: '/404.html', body, switchPath: '/' });
}
