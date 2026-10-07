// Knowledge map: content/map.json → a layered, 2.5D inline SVG.
// Each track is a tilted plane; a node's column is its longest chain of incoming relations.
// Positions are computed here, so the JSON only lists nodes and typed relations.
import { esc } from './markdown.mjs';
import { pick } from './i18n.mjs';

const NODE_W = 144, NODE_H = 46, COL = 204, ROW = 96;                 // plane units
const PAD_U = 30, PAD_TOP = 48, PAD_BOTTOM = 16;                      // plane padding
const SHEAR = 0.36, SQUASH = 0.66;                                    // projection
const GAP = 64, SLAB = 7, LIFT = 15, MARGIN = 14;

export function prepareMap(raw, site, notes) {
  const noteBySlug = new Map(notes.map((n) => [n.slug, n]));
  const relById = new Map(raw.relations.map((r) => [r.id, r]));
  const byId = new Map();
  for (const n of raw.nodes) {
    if (byId.has(n.id)) throw new Error(`map.json: duplicate node "${n.id}"`);
    if (!site.tracks.some((t) => t.id === n.track)) throw new Error(`map.json: node "${n.id}" has unknown track "${n.track}"`);
    if (n.area && !site.areas.some((a) => a.id === n.area)) throw new Error(`map.json: node "${n.id}" has unknown area "${n.area}"`);
    if (n.note && !noteBySlug.has(n.note)) throw new Error(`map.json: node "${n.id}" points at missing note "${n.note}"`);
    byId.set(n.id, { type: 'concept', ...n, url: n.note ? noteBySlug.get(n.note).url : null, before: [], after: [], links: [] });
  }
  const edges = raw.edges.map((e) => {
    const a = byId.get(e.from), b = byId.get(e.to), rel = relById.get(e.type);
    if (!a || !b) throw new Error(`map.json: relation ${e.from} → ${e.to} uses an unknown node`);
    if (!rel) throw new Error(`map.json: relation ${e.from} → ${e.to} has unknown type "${e.type}"`);
    const edge = { a, b, rel, why: e.why };
    a.links.push({ edge, other: b, out: true });
    b.links.push({ edge, other: a, out: false });
    if (!rel.symmetric) { a.after.push(b); b.before.push(a); }
    return edge;
  });
  const visiting = new Set();
  const depth = (n) => {
    if (n.layer !== undefined) return n.layer;
    if (visiting.has(n)) throw new Error(`map.json: cycle through "${n.id}"`);
    visiting.add(n);
    n.layer = Math.max(-1, ...n.before.map(depth)) + 1;
    visiting.delete(n);
    return n.layer;
  };
  const nodes = [...byId.values()];
  nodes.forEach(depth);
  // A symmetric relation should not leave its two ends in the same column on the same plane.
  for (const e of edges) if (e.rel.symmetric && e.a.track === e.b.track && e.a.layer === e.b.layer) e.b.layer += 1;
  return { nodes, edges, relations: raw.relations, types: raw.types, byNote: new Map(nodes.filter((n) => n.note).map((n) => [n.note, n])) };
}

const textWidth = (s, size) => [...s].reduce((w, ch) => w + (/[\u2e80-\uffff]/.test(ch) ? 1 : /[A-Z&]/.test(ch) ? 0.7 : ch === ' ' ? 0.3 : 0.56), 0) * size;

// Break a label into the fewest lines that fit (at most three), keeping the lines balanced.
// CJK text may break between any two characters, Latin text only at spaces.
function wrapLabel(label, size, max) {
  const raw = label.match(/[\u2e80-\uffff]|[^\s\u2e80-\uffff]+\s*|\s+/g) || [label];
  const tokens = [];
  for (const tok of raw) /^[\/&·—-]\s*$/.test(tok) && tokens.length ? (tokens[tokens.length - 1] += tok) : tokens.push(tok);
  const join = (from, to) => tokens.slice(from, to).join('').trim();
  let best = null;
  for (let k = 1; k <= Math.min(3, tokens.length); k++) {
    const cuts = [];
    const search = (start, left, acc) => {
      if (left === 1) return cuts.push([...acc, join(start, tokens.length)]);
      for (let i = start + 1; i <= tokens.length - (left - 1); i++) search(i, left - 1, [...acc, join(start, i)]);
    };
    search(0, k, []);
    for (const lines of cuts) {
      if (lines.some((l) => !l)) continue;
      const w = Math.max(...lines.map((l) => textWidth(l, size)));
      if (!best || best.k < k || w < best.w) best = { k, w, lines };
    }
    if (best && best.k === k && best.w <= max * (k < 3 ? 1.2 : 1)) break;
  }
  return { lines: best.lines, size: Math.max(9.5, Math.min(size, (size * max) / best.w)) };
}

const r1 = (n) => Math.round(n * 10) / 10;
const pts = (list) => list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');

function typeGlyph(type, x, y) {
  switch (type) {
    case 'theorem': return `<path class="ty" d="M${x} ${y - 6}L${x + 6} ${y}L${x} ${y + 6}L${x - 6} ${y}Z"/>`;
    case 'method': return `<path class="ty" d="M${x} ${y - 6}L${x + 6.2} ${y + 5}H${x - 6.2}Z"/>`;
    case 'model': return `<rect class="ty" x="${x - 5.2}" y="${y - 5.2}" width="10.4" height="10.4" rx="2.4"/>`;
    case 'paper': return `<path class="ty" d="M${x - 4.6} ${y - 6.2}h6l3.2 3.2v9.2h-9.2z"/>`;
    default: return `<circle class="ty" cx="${x}" cy="${y}" r="5.2"/>`;
  }
}

export function renderMap(ctx, { panel = true } = {}) {
  const { site, map, t, L } = ctx;

  // 1. Planes, stacked top to bottom. Every plane has the same size; a track spreads its own
  //    columns evenly across it, so short tracks do not leave half a plane empty.
  const lanes = site.tracks
    .map((track) => {
      const mine = map.nodes.filter((n) => n.track === track.id);
      if (!mine.length) return null;
      const layers = [...new Set(mine.map((n) => n.layer))].sort((a, b) => a - b);
      const cols = layers.map((layer) => mine.filter((n) => n.layer === layer));
      return { track, cols, rows: Math.max(...cols.map((c) => c.length)) };
    })
    .filter(Boolean);
  const maxCols = Math.max(...lanes.map((l) => l.cols.length));
  const planeW = PAD_U * 2 + maxCols * COL;
  let y = MARGIN + 34, maxH = 0;
  for (const lane of lanes) {
    lane.h = PAD_TOP + lane.rows * ROW + PAD_BOTTOM;
    lane.oy = y;
    y += lane.h * SQUASH + SLAB + GAP;
    maxH = Math.max(maxH, lane.h);
  }
  const ox = MARGIN;
  const width = Math.ceil(ox + planeW + maxH * SHEAR + MARGIN);
  const height = Math.ceil(y - GAP + MARGIN + 22);
  const project = (lane, u, v) => [ox + u + (lane.h - v) * SHEAR, lane.oy + v * SQUASH];

  for (const lane of lanes) {
    const usable = planeW - PAD_U * 2;
    lane.cols.forEach((col, ci) => {
      col.forEach((n, i) => {
        const u = PAD_U + ((ci + 0.5) * usable) / lane.cols.length;
        const v = PAD_TOP + ((lane.rows - col.length) / 2 + i + 0.5) * ROW;
        [n.px, n.py] = project(lane, u, v);       // footprint on the plane
        n.cx = n.px; n.cy = n.py - LIFT - NODE_H / 2; // centre of the card floating above it
      });
    });
  }

  const laneSvg = lanes
    .map((lane) => {
      const { track, h } = lane;
      const c = [project(lane, 0, 0), project(lane, planeW, 0), project(lane, planeW, h), project(lane, 0, h)];
      const dots = [];
      for (let v = 20; v < h - 6; v += 30) for (let u = 22; u < planeW - 6; u += 30) {
        const [dx, dy] = project(lane, u, v);
        dots.push(`<circle cx="${r1(dx)}" cy="${r1(dy)}" r=".9"/>`);
      }
      const [lx, ly] = c[0];
      const id = `plane-${track.id}`;
      return `<g class="map-lane t-${track.id}">
  <linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient>
  <polygon class="ground" points="${pts(c.map(([px, py]) => [px - 6, py + 26]))}" filter="url(#kmap-blur)"/>
  <polygon class="slab" points="${pts([c[3], c[2], [c[2][0], c[2][1] + SLAB], [c[3][0], c[3][1] + SLAB]])}"/>
  <polygon class="slab side" points="${pts([c[1], c[2], [c[2][0], c[2][1] + SLAB], [c[1][0], c[1][1] + SLAB]])}"/>
  <polygon class="plane" points="${pts(c)}" fill="url(#${id})"/>
  <g class="dots">${dots.join('')}</g>
  <path class="rim" d="M${pts([c[3]])}L${pts([c[0]])}L${pts([c[1]])}"/>
  <text class="lane-glyph" x="${r1(lx + 6)}" y="${r1(ly - 13)}">${esc(track.glyph)}</text>
  <text class="lane-title" x="${r1(lx + 24)}" y="${r1(ly - 14)}">${esc(L(track.title))}</text>
  <text class="lane-sub" x="${r1(c[1][0])}" y="${r1(ly - 14)}" text-anchor="end">${esc(track.code)} · ${esc(pick(track.title, 'en').toUpperCase())}</text>
</g>`;
    })
    .join('\n');

  // 2. Relations.
  const placed = [];
  const edgeSvg = map.edges
    .map((e) => {
      const { a, b, rel } = e;
      const dx = b.cx - a.cx, dy = b.cy - a.cy;
      const end = rel.symmetric ? 3 : 7;       // room for the arrowhead
      let p0, p1, p2, p3;
      if (a.track === b.track && Math.abs(dx) >= NODE_W * 0.75) {
        const s = Math.sign(dx);
        p0 = [a.cx + (s * NODE_W) / 2, a.cy]; p3 = [b.cx - s * (NODE_W / 2 + end), b.cy];
        const k = Math.max(26, Math.abs(p3[0] - p0[0]) * 0.45);
        p1 = [p0[0] + s * k, p0[1]]; p2 = [p3[0] - s * k, p3[1]];
      } else {
        const s = Math.sign(dy) || 1;
        p0 = [a.cx, a.cy + (s * NODE_H) / 2]; p3 = [b.cx, b.cy - s * (NODE_H / 2 + end)];
        const k = Math.max(22, Math.abs(p3[1] - p0[1]) * 0.45);
        p1 = [p0[0], p0[1] + s * k]; p2 = [p3[0], p3[1] - s * k];
      }
      const at = (tt) => [0, 1].map((j) => (1 - tt) ** 3 * p0[j] + 3 * (1 - tt) ** 2 * tt * p1[j] + 3 * (1 - tt) * tt ** 2 * p2[j] + tt ** 3 * p3[j]);
      const label = L(rel.title);
      const lw = textWidth(label, 9.5) + 14;
      // Put the label at the middle of the curve, sliding along it when another label is already there.
      const clash = ([x, y]) => placed.some(([px, py, pw]) => Math.abs(px - x) < (pw + lw) / 2 + 4 && Math.abs(py - y) < 20);
      const [mx, my] = [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8].map(at).find((pt) => !clash(pt)) || at(0.5);
      placed.push([mx, my, lw]);
      const ang = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
      const tip = [p3[0] + end * Math.cos(ang), p3[1] + end * Math.sin(ang)];
      const wing = (sgn) => [p3[0] - 1.5 * Math.cos(ang) + sgn * 3.4 * Math.sin(ang), p3[1] - 1.5 * Math.sin(ang) - sgn * 3.4 * Math.cos(ang)];
      const head = rel.symmetric
        ? `<circle class="head" cx="${r1(p0[0])}" cy="${r1(p0[1])}" r="2.4"/><circle class="head" cx="${r1(tip[0])}" cy="${r1(tip[1])}" r="2.4"/>`
        : `<polygon class="head" points="${pts([tip, wing(1), wing(-1)])}"/>`;
      return `<g class="map-edge r-${rel.id}${a.track === b.track ? '' : ' is-cross'}" data-from="${a.id}" data-to="${b.id}" data-rel="${rel.id}">
  <path d="M${pts([p0])}C${pts([p1])} ${pts([p2])} ${pts([rel.symmetric ? tip : p3])}"/>
  ${head}
  <g class="edge-label"><rect x="${r1(mx - lw / 2)}" y="${r1(my - 8.5)}" width="${r1(lw)}" height="17" rx="8.5"/><text x="${r1(mx)}" y="${r1(my + 3.3)}" text-anchor="middle">${esc(label)}</text></g>
  <title>${esc(L(a.label))} ${rel.symmetric ? '↔' : '→'} ${esc(L(b.label))}：${esc(L(e.why) || '')}</title>
</g>`;
    })
    .join('\n');

  // 3. Nodes: a footprint on the plane, a thin stem, and the card floating above.
  const nodeSvg = map.nodes
    .map((n) => {
      const label = L(n.label);
      const { lines, size } = wrapLabel(label, 12, NODE_W - 50);
      const x = n.cx - NODE_W / 2, top = n.cy - NODE_H / 2;
      const tx = x + 38 + (NODE_W - 38 - 10) / 2, lh = size * 1.2;
      const fs = size < 12 ? ` style="font-size:${r1(size)}px"` : '';
      const text = lines.map((line, i) => `<text x="${r1(tx)}" y="${r1(n.cy + (i - (lines.length - 1) / 2) * lh + size * 0.36)}" text-anchor="middle"${fs}>${esc(line)}</text>`).join('');
      const inner = `<ellipse class="foot" cx="${r1(n.px)}" cy="${r1(n.py)}" rx="30" ry="6.500"/>
  <path class="stem" d="M${r1(n.px)} ${r1(n.py)}V${r1(n.py - LIFT)}"/>
  <g class="card3d"><rect class="face" x="${r1(x)}" y="${r1(top)}" width="${NODE_W}" height="${NODE_H}" rx="11"/><circle class="badge" cx="${r1(x + 22)}" cy="${r1(n.cy)}" r="11.500"/><g transform="translate(${r1(x + 22)} ${r1(n.cy)}) scale(.82)">${typeGlyph(n.type, 0, 0)}</g>${text}</g>`.replace(/\.500/g, '.5');
      const cls = `map-node t-${n.track} ${n.url ? 'is-written' : 'is-planned'}`;
      const aria = `${label}${n.url ? '' : ` (${t.planned})`}`;
      return n.url
        ? `<a class="${cls}" href="${n.url}" data-id="${n.id}" data-track="${n.track}" data-area="${n.area || ''}" aria-label="${esc(aria)}">${inner}</a>`
        : `<g class="${cls}" data-id="${n.id}" data-track="${n.track}" data-area="${n.area || ''}" tabindex="0" role="button" aria-label="${esc(aria)}">${inner}</g>`;
    })
    .join('\n');

  // 4. Data for the detail panel.
  const area = (id) => L(site.areas.find((a) => a.id === id)?.title) || '';
  const data = Object.fromEntries(
    map.nodes.map((n) => [
      n.id,
      {
        label: L(n.label), track: n.track, type: L(map.types.find((x) => x.id === n.type)?.title) || '', area: area(n.area),
        summary: L(n.summary) || '', url: n.url || '',
        links: n.links.map(({ edge, other, out }) => ({ id: other.id, label: L(other.label), rel: edge.rel.id, relTitle: L(edge.rel.title), out, sym: !!edge.rel.symmetric, why: L(edge.why) || '', written: !!other.url })),
      },
    ]),
  );
  const written = map.nodes.filter((n) => n.url).length;
  const usedTypes = map.types.filter((ty) => map.nodes.some((n) => n.type === ty.id));
  const usedRels = map.relations.filter((r) => map.edges.some((e) => e.rel === r));

  return `<figure class="kmap card" data-read="${esc(t.readNote)}" data-planned="${esc(t.planned)}">
  <div class="kmap-scroll" tabindex="0" aria-label="${esc(t.mapTitle)}">
    <svg class="kmap-svg" viewBox="0 0 ${width} ${height}" style="min-width:${Math.round(width * 0.8)}px" role="group" aria-label="${esc(t.mapTitle)}: ${esc(t.lit(written, map.nodes.length))}">
<defs><filter id="kmap-blur" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="11"/></filter></defs>
${laneSvg}
<g class="edges">
${edgeSvg}
</g>
${nodeSvg}
    </svg>
  </div>
  <div class="kmap-legend">
    <div class="legend-row"><span class="legend-name">${esc(t.relLegend)}</span>${usedRels.map((r) => `<button type="button" class="rel-toggle r-${r.id}" data-rel="${r.id}" aria-pressed="true"><i></i>${esc(L(r.title))}</button>`).join('')}</div>
    <div class="legend-row"><span class="legend-name">${esc(t.typeLegend)}</span>${usedTypes.map((ty) => `<span class="type-key"><svg viewBox="-8 -8 16 16" width="14" height="14" aria-hidden="true">${typeGlyph(ty.id, 0, 0)}</svg>${esc(L(ty.title))}</span>`).join('')}<span class="type-key"><i class="k-written"></i>${esc(t.written)}</span><span class="type-key"><i class="k-planned"></i>${esc(t.planned)}</span><span class="swipe">${esc(t.mapScroll)}</span><span class="count">${esc(t.lit(written, map.nodes.length))}</span></div>
  </div>
  ${panel ? `<div class="kmap-panel" aria-live="polite"><p class="hint">${esc(t.mapHint)}</p></div>` : ''}
  <script type="application/json" class="kmap-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</figure>`;
}

// The same relations, as sentences. Works without JavaScript and is what search engines read.
export function relationList(ctx) {
  const { map, L } = ctx;
  const name = (n) => (n.url ? `<a href="${n.url}">${esc(L(n.label))}</a>` : `<span>${esc(L(n.label))}</span>`);
  return `<ul class="rel-list">
${map.edges
  .map((e) => `<li class="r-${e.rel.id}"><p class="rel-line">${name(e.a)}<b class="rel-tag">${esc(L(e.rel.title))}</b>${name(e.b)}</p><p class="why">${esc(L(e.why) || '')}</p></li>`)
  .join('\n')}
</ul>`;
}
