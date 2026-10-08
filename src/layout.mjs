// Page templates. Plain functions returning HTML strings. `ctx` carries the language:
// ctx.t = interface text, ctx.L(v) = pick the language of a { zh, en } value, ctx.href(path) = URL in this language.
import { esc } from './markdown.mjs';
import { icons } from './icons.mjs';
import { markSvg } from './logo.mjs';
import { renderMap, renderCourse, relationList } from './map.mjs';
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
<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/downloads/*"}}]},"eagerness":"moderate"}]}</script>
<link rel="stylesheet" href="${assets.css}">
${hasMath ? `<link rel="stylesheet" href="${assets.katex}">` : ''}
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${href('/')}" aria-label="${esc(site.name)} · ${esc(t.home)}">${markSvg()}<span>${esc(site.name)}</span></a>
    <nav class="nav" aria-label="${esc(t.mainNav)}">
      ${NAV.map((key) => `<a href="${href(`/${key}/`)}"${key === active ? ' aria-current="page"' : ''}>${esc(t.nav[key])}</a>`).join('\n      ')}
    </nav>
    <div class="tools">
      <button class="search-open" type="button" data-index="${href('/search.json')}" data-placeholder="${esc(t.searchPlaceholder)}" data-none="${esc(t.searchNone)}" data-keys="${esc(json(t.searchKeys))}" aria-label="${esc(t.searchSite)}">${icons.search}<span>${esc(t.searchSite)}</span><kbd>⌘K</kbd></button>
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
      <p>Est. ${site.since} · ${esc(L(site.location))} · ${esc(t.lastUpdated(ctx.date(ctx.updated)))}</p>
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
const kindLabel = (ctx, n) => esc(ctx.L(find(ctx.site.kinds, n.kind)?.title) || '');
function noteCard(ctx, n) {
  const { t, L, site } = ctx;
  const track = trackOf(ctx, n.track), area = find(site.areas, n.area);
  const text = [n.title, n.description, kindLabel(ctx, n), L(track?.title), L(area?.title), ...n.tags].join(' ').toLowerCase();
  return `<a class="card note-card t-${n.track}" href="${n.url}" data-track="${n.track}" data-area="${n.area || ''}" data-text="${esc(text)}">
  <span class="card-top">${areaChip(ctx, n)}<span class="kind">${kindLabel(ctx, n)}</span></span>
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
  const legacy = Object.fromEntries(notes.filter((n) => n.legacy).map((n) => [n.legacy, n.url]));
  const redirect = lang === 'zh'
    ? `<script>(function(){var h=decodeURIComponent(location.hash.replace(/^#\\/?/,''));if(!h)return;var m=${json(legacy)},t={about:'/about/',resources:'/resources/',writing:'/notes/',collections:'/notes/'};var p=h.split('/read/');if(p[1]&&m[p[1]])return location.replace(m[p[1]]);if(t[p[0]])location.replace(t[p[0]])})()</script>`
    : '';
  const body = `<section class="hero">
  <span class="hero-glyph g1" aria-hidden="true">∂</span>
  <span class="hero-glyph g2" aria-hidden="true">λ</span>
  <p class="pill"><i></i>${esc(site.eyebrow)}</p>
  <h1>Mathematics,<br><span class="dim">Algorithms</span> &amp; <em>AI</em>.</h1>
  <p class="hero-statement">${esc(L(site.statement))}</p>
  <p class="triad"><span>Structure</span><i>/</i><span>Mechanism</span><i>/</i><span>Boundary</span></p>
  <div class="cta">
    <a class="btn btn-solid" href="${href('/notes/')}">${esc(t.explore)} <b>→</b></a>
    <a class="btn" href="${href('/resources/')}">${esc(t.resources)}</a>
  </div>
  <div class="elsewhere">
    <span class="label">${esc(t.elsewhere)}</span>
    ${socials(ctx)}
  </div>
  <div class="hero-foot"><span>Est. ${site.since}</span><span>Mathematics · Algorithms · AI</span><span>${esc(L(site.location))}</span></div>
</section>

<section class="principles">
${site.principles.map((p) => `  <div>
    <p class="label">${esc(p.label)}</p>
    <h2>${esc(L(p.title))}</h2>
    <p>${esc(L(p.desc))}</p>
  </div>`).join('\n')}
</section>

<section class="sec">
${sectionHead('Latest', esc(t.latest), `<a class="more" href="${href('/notes/')}">${esc(t.allNotes(notes.length))} <b>→</b></a>`)}
${noteGrid(ctx, notes.slice(0, 4))}
</section>

<section class="sec">
${sectionHead('Knowledge map', esc(t.mapTitle), `<a class="more" href="${href('/notes/')}#map">${esc(t.mapMore)} <b>→</b></a>`)}
<div class="sec-wide">
${renderMap(ctx)}
</div>
</section>`;
  return page(ctx, { path: '/', body, head: redirect });
}

// ---------- notes hub: map + notes + papers, one set of filters ----------

// One block per subject, in the order subjects are listed in content/site.json.
function subjectGroup(ctx, area, notes, papers) {
  const track = trackOf(ctx, area.track);
  return `<section class="group t-${area.track}" id="${area.id}" data-area="${area.id}">
  <header class="group-head">
    <span class="glyph-badge" aria-hidden="true">${esc(track?.glyph || '∗')}</span>
    <h2>${esc(ctx.L(area.title))}</h2>
    <small>${notes.length + papers.length}</small>
  </header>
  ${notes.length ? noteGrid(ctx, notes) : ''}
  ${papers.length ? paperList(ctx, papers) : ''}
</section>`;
}

function paperList(ctx, papers = ctx.papers) {
  const { notes, site, t, L } = ctx;
  const order = ['noted', 'reading', 'read', 'queued'];
  const sorted = [...papers].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || b.year - a.year);
  return `<ol class="paper-list">
${sorted.map((p) => {
    const note = notes.find((n) => n.slug === p.note);
    const area = find(site.areas, p.area);
    const text = [p.title, p.authors, p.venue, p.year, L(area?.title), ...(p.tags || [])].join(' ').toLowerCase();
    return `<li class="card paper item s-${p.status} t-${area?.track || 'none'}" data-track="${area?.track || ''}" data-area="${p.area || ''}" data-text="${esc(text)}">
  <span class="status">${esc(t.status[p.status] || p.status)}</span>
  <div class="paper-main">
    <h3><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
    <p class="by">${esc(p.authors)} · ${esc(p.venue)} ${p.year}</p>
    <p class="tags">${area ? `<span class="chip t-${area.track}"><i></i>${esc(L(area.title))}</span>` : ''}${(p.tags || []).map((x) => `<span>${esc(x)}</span>`).join('')}</p>
  </div>
  <div class="paper-links">
    ${note ? `<a class="pdf" href="${note.url}">${esc(t.toNote)} →</a>` : ''}
    <a class="ext" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t.toPaper)} ↗</a>
  </div>
</li>`;
  }).join('\n')}
</ol>`;
}

export function notesPage(ctx) {
  const { site, notes, papers, map, t, L } = ctx;
  const groups = site.areas.map((a) => ({ a, list: notes.filter((n) => n.area === a.id), refs: papers.filter((p) => p.area === a.id) })).filter((g) => g.list.length + g.refs.length);
  const total = (id) => notes.filter((n) => n.area === id).length + papers.filter((p) => p.area === id).length;
  const planned = site.areas.map((a) => ({ a, tr: trackOf(ctx, a.track), items: map.nodes.filter((n) => n.area === a.id && !n.url) })).filter((g) => g.items.length);
  const sep = ctx.lang === 'zh' ? '、' : ', ';

  const body = `<header class="page-head">
  <p class="eyebrow">Notes · Papers · Map</p>
  <h1>${esc(t.nav.notes)}</h1>
  <p class="lede">${esc(t.notesLede)}</p>
</header>
<section id="map" class="hub-map">
${renderMap(ctx)}
<details class="fold">
  <summary>${esc(t.foldRelations)}<small>${map.edges.length}</small></summary>
  <p class="sec-lede">${esc(t.relationsLede)}</p>
  ${relationList(ctx)}
</details>
${planned.length ? `<details class="fold">
  <summary>${esc(t.foldRoadmap)}<small>${map.nodes.filter((n) => !n.url).length}</small></summary>
  <div class="topic-grid">
${planned.map(({ a, tr, items }) => `<article class="card topic-card t-${tr.id}">
  <p class="topic-name">${esc(L(a.title))}<small>${items.length}</small></p>
  <ul class="todo">
    ${items.map((n) => `<li>${esc(L(n.label))}${n.before.length ? `<small>${esc(t.after2(n.before.map((b) => L(b.label)).join(sep)))}</small>` : ''}</li>`).join('\n    ')}
  </ul>
</article>`).join('\n')}
  </div>
</details>` : ''}
</section>
<div class="notes-list" id="list">
  <div class="toolbar">
    <label class="search">${icons.search}<input type="search" id="note-search" placeholder="${esc(t.search)}" autocomplete="off" aria-label="${esc(t.search)}"><kbd>/</kbd></label>
    <div class="views" role="group">
      <button type="button" class="view" data-view="topic" aria-pressed="true">${esc(t.byTopic)}</button>
      <button type="button" class="view" data-view="time" aria-pressed="false">${esc(t.byTime)}</button>
      <button type="button" class="view" data-view="papers" aria-pressed="false">${esc(t.byPapers)} <small>${papers.length}</small></button>
    </div>
  </div>
  <div class="subjects" role="group" aria-label="${esc(t.subjects)}">
    <button type="button" class="facet is-all" data-facet="area" data-value="" aria-pressed="true"><span>${esc(t.allSubjects)}</span></button>
    ${site.areas.map((a) => `<button type="button" id="s-${a.id}" class="facet t-${a.track}${total(a.id) ? '' : ' is-empty'}" data-planned="${esc(map.nodes.filter((n) => n.area === a.id && !n.url).map((n) => L(n.label)).join(sep))}" data-facet="area" data-value="${a.id}" aria-pressed="false"><i></i><span>${esc(L(a.title))}</span><small>${total(a.id)}</small></button>`).join('\n    ')}
  </div>
  <p class="result-bar"><span id="result-count" data-one="${esc(t.count(1))}" data-many="${esc(t.count(2))}">${esc(t.count(notes.length + papers.length))}</span><button type="button" id="clear-filters" hidden>${esc(t.clear)} ×</button></p>
  <div id="view-topic" class="groups">
${groups.map((g) => subjectGroup(ctx, g.a, g.list, g.refs)).join('\n')}
  </div>
  <div id="view-time" hidden>
${noteGrid(ctx, notes)}
  </div>
  <div id="view-papers" hidden>
${paperList(ctx)}
  </div>
  <p class="empty" id="notes-empty" data-empty="${esc(t.empty)}" data-planned="${esc(t.emptyPlanned)}" hidden>${esc(t.empty)}</p>
</div>`;
  return page(ctx, { title: t.nav.notes, description: t.notesLede, path: '/notes/', active: 'notes', body, bodyClass: 'is-wide' });
}

// ---------- one subject's own map ----------

export function coursePage(ctx, area) {
  const { map, notes, t, L, href } = ctx;
  const track = trackOf(ctx, area.track);
  const mine = notes.filter((n) => n.area === area.id);
  // Other subjects this one shares concepts with, or reaches through a relation.
  const inside = (n) => n.areas.includes(area.id);
  const linked = new Set([
    ...area.nodes.flatMap((n) => n.areas),
    ...map.edges.filter((e) => inside(e.a) !== inside(e.b)).flatMap((e) => [e.a.area, e.b.area]),
  ].filter((id) => id !== area.id));
  const relations = map.edges.filter((e) => inside(e.a) || inside(e.b));
  const others = map.areas.filter((a) => a.url && a.id !== area.id);
  const lede = t.courseLede(area.done, area.nodes.length, linked.size);
  const body = `<header class="page-head course-head t-${area.track}">
  <p class="crumbs"><a href="${href('/notes/')}#map">← ${esc(t.backMap)}</a><span class="chip t-${area.track}"><i></i>${esc(track?.glyph || '')} ${esc(L(track?.title))}</span></p>
  <h1>${esc(L(area.title))}</h1>
  <p class="lede">${esc(lede)}</p>
</header>
<section class="hub-map">
${renderCourse(ctx, area)}
${relations.length ? `<details class="fold">
  <summary>${esc(t.courseRelations)}<small>${relations.length}</small></summary>
  ${relationList(ctx, area)}
</details>` : ''}
</section>
${mine.length ? `<section class="sec">
${sectionHead('Notes', esc(t.courseNotes), `<a class="more" href="${href('/notes/')}#s-${area.id}">${esc(t.courseAll)} <b>→</b></a>`)}
${noteGrid(ctx, mine)}
</section>` : ''}
${others.length ? `<nav class="course-nav" aria-label="${esc(t.courseOthers)}">
  <p class="label">${esc(t.courseOthers)}</p>
  <p>${others.map((a) => `<a class="chip-link t-${a.track}" href="${a.url}"><i></i>${esc(L(a.title))}<small>${a.done}/${a.nodes.length}</small></a>`).join('')}</p>
</nav>` : ''}`;
  return page(ctx, { title: `${L(area.title)} · ${t.mapTitle}`, description: lede, path: `/map/${area.id}/`, active: 'notes', body, bodyClass: 'is-wide' });
}

export const redirectPage = (ctx, to) => `<!doctype html><html lang="${ctx.htmlLang}"><head><meta charset="utf-8"><title>${esc(ctx.site.name)}</title><link rel="canonical" href="${ctx.site.url}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${esc(ctx.site.name)}</a></body></html>`;

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
  const node = ctx.map.byNote.get(n.slug);
  const steps = (label, links) =>
    links.length
      ? `<div class="steps"><p class="steps-label">${esc(label)}</p><ul>${links
          .map(({ edge, other }) => `<li class="r-${edge.rel.id}"><b class="rel-tag">${esc(L(edge.rel.title))}</b>${other.url ? `<a href="${other.url}">${esc(L(other.label))}</a>` : `<span class="is-planned">${esc(L(other.label))}<small>${esc(t.planned)}</small></span>`}</li>`)
          .join('')}</ul></div>`
      : '';
  const around = node ? steps(t.before, node.links.filter((l) => !l.out)) + steps(t.after, node.links.filter((l) => l.out)) : '';
  const toc = tocBlock(ctx, n.toc);
  const foreign = n.bodyLang !== ctx.lang;
  const body = `<article class="article t-${n.track}${toc ? ' has-toc' : ''}">
  <header class="article-head">
    <p class="crumbs"><a href="${href('/notes/')}">${esc(t.backNotes)}</a>${areaChip(ctx, n)}<span class="kind">${kindLabel(ctx, n)}</span></p>
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
        ${coll ? `<p class="topic-name">${esc(t.inTopic)} · ${esc(L(coll.title))}</p>\n        <p class="q"><a href="${href('/notes/')}#${coll.id}">${esc(L(coll.question))}</a></p>` : `<p class="topic-name">${esc(t.inMap)}</p>`}
        ${around ? `<div class="around">${around}</div><p class="to-map"><a href="${node.mapUrl}">${esc(t.viewMap)} <b>→</b></a></p>` : ''}
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
</section>`).join('\n')}`;
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
  const { site, t, L, href } = ctx;
  const focus = ['probability', 'theory', 'rl', 'optimization'].map((id) => find(site.areas, id)).filter(Boolean);
  const body = `<header class="page-head">
  <p class="eyebrow">About</p>
  <h1>${esc(t.aboutHello)} <em>${esc(site.name)}</em></h1>
</header>
<div class="about">
  <div class="prose">
    <p class="first">${esc(t.about[0])}</p>
    ${t.about.slice(1).map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
    <p class="eyebrow overview">${esc(t.overview)}</p>
    <ul class="stats">
      <li><a href="${href('/notes/')}#list"><b>${ctx.notes.length}</b>${esc(t.stats.notes)}</a></li>
      <li><a href="${href('/notes/')}#map"><b>${ctx.map.nodes.filter((n) => n.url).length}<small>/${ctx.map.nodes.length}</small></b>${esc(t.stats.nodes)}</a></li>
      <li><a href="${href('/notes/')}#papers"><b>${ctx.papers.length}</b>${esc(t.stats.papers)}</a></li>
      <li><a href="${href('/resources/')}"><b>${ctx.resources.length + ctx.resourceLinks.length}</b>${esc(t.stats.resources)}</a></li>
    </ul>
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

// ---------- search index ----------

export function searchIndex(ctx) {
  const { notes, papers, map, t, L, site, href } = ctx;
  const area = (id) => L(site.areas.find((a) => a.id === id)?.title) || '';
  return [
    ...notes.map((n) => ({ k: t.kindNote, t: n.title, d: n.description, u: n.url, x: [area(n.area), ...n.tags].join(' ') })),
    ...map.nodes.filter((n) => !n.url).map((n) => ({ k: t.kindPlanned, t: L(n.label), d: L(n.summary) || '', u: n.mapUrl, x: area(n.area) })),
    ...papers.map((p) => ({ k: t.kindPaper, t: p.title, d: `${p.authors} · ${p.venue} ${p.year}`, u: notes.find((n) => n.slug === p.note)?.url || p.url, x: (p.tags || []).join(' ') })),
    ...ctx.resources.map((r) => ({ k: t.kindResource, t: r.title, d: r.description, u: r.url, x: r.tags.join(' ') })),
  ];
}
