// Knowledge map: content/map.json → 2.5D inline SVG, at two scales.
//   · the big map   — one floor; every subject is a region painted on it, and regions overlap
//                     wherever concepts belong to several subjects at once. Concepts stand on the
//                     floor where their subjects meet, so how fused two subjects are is visible
//                     from how much their regions share, not from a few lines between boxes;
//   · a course map  — one subject on its own plane: position carries the reading order, a region
//                     on the floor encloses a chapter, a tag on a card is a door to a concept
//                     outside the subject, and only the relations that need explaining are drawn.
// Positions are computed here, so the JSON only lists nodes, chapters and typed relations.
import { esc } from './markdown.mjs';
import { pick } from './i18n.mjs';

const NODE_W = 144, NODE_H = 46;                                      // a concept card
const PAD_U = 30, PAD_TOP = 48;                                       // plane padding
const SHEAR = 0.36, SQUASH = 0.66;                                    // projection
const GAP = 64, SLAB = 7, LIFT = 15, MARGIN = 14;
const PORT_H = 18, PORT_MAX = 2;                                      // door tags above a card
const REACH = 92;                                                     // how far a subject's region reaches around a concept

export function prepareMap(raw, site, notes, href = (p) => p) {
  const noteBySlug = new Map(notes.map((n) => [n.slug, n]));
  const relById = new Map(raw.relations.map((r) => [r.id, r]));
  const areaIndex = new Map(site.areas.map((a, i) => [a.id, i]));
  const areaById = new Map(site.areas.map((a) => [a.id, a]));
  const groups = (raw.groups || []).map((g) => {
    if (!areaById.has(g.area)) throw new Error(`map.json: chapter "${g.id}" needs a subject from "areas" in content/site.json (got "${g.area}")`);
    return { ...g };
  });
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const byId = new Map();
  for (const n of raw.nodes) {
    if (byId.has(n.id)) throw new Error(`map.json: duplicate node "${n.id}"`);
    const area = areaById.get(n.area);
    if (!area) throw new Error(`map.json: node "${n.id}" needs a subject from "areas" in content/site.json (got "${n.area}")`);
    for (const a of n.also || []) if (!areaById.has(a) || a === n.area) throw new Error(`map.json: node "${n.id}" lists "${a}" in "also"; it must be another subject from "areas"`);
    if (n.note && !noteBySlug.has(n.note)) throw new Error(`map.json: node "${n.id}" points at missing note "${n.note}"`);
    // A concept has one home subject (its colour, its notes) and may also belong to others.
    const areas = [n.area, ...(n.also || [])];
    if (n.group && !areas.includes(groupById.get(n.group)?.area)) throw new Error(`map.json: node "${n.id}" is in chapter "${n.group}", which belongs to a subject the node is not in`);
    byId.set(n.id, { type: 'concept', ...n, areas, track: area.track, color: `a-${areaIndex.get(n.area) % 8}`, url: n.note ? noteBySlug.get(n.note).url : null, mapUrl: `${href(`/map/${n.area}/`)}#${n.id}`, before: [], after: [], links: [] });
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
  const nodes = [...byId.values()];
  const onStack = new Set(), cleared = new Set();
  const check = (n) => {
    if (cleared.has(n)) return;
    if (onStack.has(n)) throw new Error(`map.json: cycle through "${n.id}"`);
    onStack.add(n); n.before.forEach(check); onStack.delete(n); cleared.add(n);
  };
  nodes.forEach(check);
  layering(nodes, 'layer', (n) => n.before);
  // What has to be read before a node: everything upstream along directed relations, earliest first.
  const order = new Map(nodes.map((n, i) => [n, i]));
  for (const n of nodes) {
    const seen = new Set();
    const walk = (m) => { for (const p of m.before) if (!seen.has(p)) { seen.add(p); walk(p); } };
    walk(n);
    n.path = [...seen].sort((a, b) => a.layer - b.layer || order.get(a) - order.get(b));
  }
  // A subject holds every concept that belongs to it, at home or not.
  const areas = site.areas.map((area, i) => {
    const mine = nodes.filter((n) => n.areas.includes(area.id));
    return { ...area, color: `a-${i % 8}`, nodes: mine, done: mine.filter((n) => n.url).length, url: mine.length ? href(`/map/${area.id}/`) : null };
  });
  return { nodes, edges, relations: raw.relations, types: raw.types, groups, areas, byNote: new Map(nodes.filter((n) => n.note).map((n) => [n.note, n])) };
}

// Longest chain of incoming relations, stored as n[key]. A cycle cannot hang it: the closing link is ignored.
function layering(list, key, before) {
  const visiting = new Set();
  const depth = (n) => {
    if (n[key] !== undefined) return n[key];
    if (visiting.has(n)) return -1;
    visiting.add(n);
    n[key] = Math.max(-1, ...before(n).map(depth)) + 1;
    visiting.delete(n);
    return n[key];
  };
  list.forEach(depth);
}

const textWidth = (s, size) => [...s].reduce((w, ch) => w + (/[\u2e80-\uffff]/.test(ch) ? 1 : /[A-Z&]/.test(ch) ? 0.7 : ch === ' ' ? 0.3 : 0.56), 0) * size;
const clip = (s, size, max) => {
  if (textWidth(s, size) <= max) return s;
  let cut = [...s];
  while (cut.length > 1 && textWidth(`${cut.join('')}…`, size) > max) cut = cut.slice(0, -1);
  return `${cut.join('').trimEnd()}…`;
};

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

// ---------- shared geometry and drawing ----------

// Planes stacked top to bottom, all the same size. A plane is split into zones; a zone is as wide
// as the number of columns it needs. `lanes`: [{ track, zones: [{ title?, cols: [[node]], … }] }].
function place(lanes, { col, row, nodeW, nodeH, padBottom, top = 34 }) {
  for (const lane of lanes) {
    for (const zone of lane.zones) zone.units = Math.max(zone.cols.length, zone.minUnits || 0, zone.title ? (textWidth(zone.title, 14) + 64) / col : 0);
    lane.units = lane.zones.reduce((sum, z) => sum + z.units, 0);
    lane.rows = Math.max(1, ...lane.zones.flatMap((z) => z.cols.map((c) => c.length)));
  }
  const planeW = PAD_U * 2 + Math.max(...lanes.map((l) => l.units)) * col;
  const rows = Math.max(...lanes.map((l) => l.rows));
  let y = MARGIN + top, maxH = 0;
  for (const lane of lanes) {
    lane.rows = rows;                              // equal planes line up; shorter columns are centred
    lane.h = PAD_TOP + lane.rows * row + padBottom;
    lane.oy = y;
    y += lane.h * SQUASH + SLAB + GAP;
    maxH = Math.max(maxH, lane.h);
  }
  const ox = MARGIN;
  const project = (lane, u, v) => [ox + u + (lane.h - v) * SHEAR, lane.oy + v * SQUASH];
  for (const lane of lanes) {
    // Spare width goes to the zones that hold something; an empty one stays a strip.
    const idle = lane.zones.filter((z) => !z.cols.length).reduce((sum, z) => sum + z.units, 0);
    const stretch = lane.units > idle ? (planeW - PAD_U * 2 - idle * col) / (lane.units - idle) : col;
    let u0 = PAD_U;
    for (const zone of lane.zones) {
      zone.u0 = u0;
      zone.u1 = u0 + zone.units * (zone.cols.length ? stretch : col);
      zone.cols.forEach((column, ci) => {
        column.forEach((n, i) => {
          n.lane = lane;
          n.u = zone.u0 + ((ci + 0.5) * (zone.u1 - zone.u0)) / zone.cols.length;
          n.v = PAD_TOP + ((lane.rows - column.length) / 2 + i + 0.5) * row;
          [n.px, n.py] = project(lane, n.u, n.v);    // footprint on the plane
          n.cx = n.px; n.cy = n.py - LIFT - nodeH / 2; // centre of the card floating above it
        });
      });
      u0 = zone.u1;
    }
  }
  return { planeW, ox, project, width: Math.ceil(ox + planeW + maxH * SHEAR + MARGIN), height: Math.ceil(y - GAP + MARGIN + 22), nodeW, nodeH };
}

// One plane: shadow, slab, surface, dotted floor; `floor` is painted on it in plane coordinates
// (the plane's name along the front edge, regions, a rail).
function drawLane(geo, lane, uid, name, floor = '', cls = '') {
  const { planeW, ox, project } = geo;
  const { h } = lane;
  const c = [project(lane, 0, 0), project(lane, planeW, 0), project(lane, planeW, h), project(lane, 0, h)];
  const id = `${uid}-p${lane.index ?? 0}`;
  const m = `matrix(1 0 ${-SHEAR} ${SQUASH} ${r1(ox + h * SHEAR)} ${r1(lane.oy)})`;
  const dividers = (lane.zones || []).slice(1).map((zone) => `<path class="zone-line" d="M${pts([project(lane, zone.u0, 0)])}L${pts([project(lane, zone.u0, h)])}"/>`).join('');
  return `<g class="map-lane ${cls}">
  <linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient>
  <pattern id="${id}-dots" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="${m}"><circle class="dot" cx="15" cy="15" r="1.1"/></pattern>
  <polygon class="ground" points="${pts(c.map(([px, py]) => [px - 6, py + 26]))}" filter="url(#${uid}-blur)"/>
  <polygon class="slab" points="${pts([c[3], c[2], [c[2][0], c[2][1] + SLAB], [c[3][0], c[3][1] + SLAB]])}"/>
  <polygon class="slab side" points="${pts([c[1], c[2], [c[2][0], c[2][1] + SLAB], [c[1][0], c[1][1] + SLAB]])}"/>
  <polygon class="plane" points="${pts(c)}" fill="url(#${id})"/>
  <polygon points="${pts(c)}" fill="url(#${id}-dots)"/>
  <path class="rim" d="M${pts([c[3]])}L${pts([c[0]])}L${pts([c[1]])}"/>
  ${dividers}
  <g class="floor" transform="${m}">${floor}${name ? `<text class="lane-floor" x="${PAD_U - 8}" y="${h - 11}">${lane.glyph ? `<tspan class="glyph">${esc(lane.glyph)}</tspan><tspan dx="9">${esc(name)}</tspan>` : esc(name)}</text>` : ''}</g>
</g>`;
}

// A typed link between two placed cards. A link between two colours fades from one into the other.
function drawEdge(geo, e, ei, uid, all, placed, { label, sentence, why, cls = '' }) {
  const { a, b, symmetric } = e;
  const { nodeW, nodeH } = geo;
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const end = symmetric ? 3 : 8.5;             // room for the arrowhead
  const same = a.lane === b.lane;
  let p0, p1, p2, p3;
  if (same && Math.abs(dx) >= nodeW * 0.75) {
    const s = Math.sign(dx);
    p0 = [a.cx + (s * nodeW) / 2, a.cy]; p3 = [b.cx - s * (nodeW / 2 + end), b.cy];
    const k = Math.max(26, Math.abs(p3[0] - p0[0]) * 0.45);
    // If another card sits on the straight path, bow the link around it.
    const blocker = all.find((n) => {
      if (n === a || n === b || n.lane !== a.lane || (n.cx - p0[0]) * (n.cx - p3[0]) >= 0) return false;
      const lineY = p0[1] + ((n.cx - p0[0]) / (p3[0] - p0[0])) * (p3[1] - p0[1]);
      return Math.abs(lineY - n.cy) < nodeH * 0.8;
    });
    let bend = 0;
    if (blocker) {
      const lineY = p0[1] + ((blocker.cx - p0[0]) / (p3[0] - p0[0])) * (p3[1] - p0[1]);
      bend = (lineY >= blocker.cy ? 1 : -1) * (nodeH + 16);
    }
    p1 = [p0[0] + s * k, p0[1] + bend]; p2 = [p3[0] - s * k, p3[1] + bend];
  } else {
    const s = Math.sign(dy) || 1;
    p0 = [a.cx, a.cy + (s * nodeH) / 2]; p3 = [b.cx, b.cy - s * (nodeH / 2 + end)];
    const k = Math.max(22, Math.abs(p3[1] - p0[1]) * 0.45);
    // A card standing on the way is passed on its nearer side.
    const blocker = all.find((n) => {
      if (n === a || n === b || (n.cy - p0[1]) * (n.cy - p3[1]) >= 0) return false;
      const lineX = p0[0] + ((n.cy - p0[1]) / (p3[1] - p0[1])) * (p3[0] - p0[0]);
      return Math.abs(lineX - n.cx) < nodeW / 2 + 12;
    });
    let side = 0;
    if (blocker) {
      const lineX = p0[0] + ((blocker.cy - p0[1]) / (p3[1] - p0[1])) * (p3[0] - p0[0]);
      side = (lineX >= blocker.cx ? 1 : -1) * (nodeW * 0.72 + 30);
    }
    p1 = [p0[0] + side, p0[1] + s * k]; p2 = [p3[0] + side, p3[1] - s * k];
  }
  const at = (tt) => [0, 1].map((j) => (1 - tt) ** 3 * p0[j] + 3 * (1 - tt) ** 2 * tt * p1[j] + 3 * (1 - tt) * tt ** 2 * p2[j] + tt ** 3 * p3[j]);
  const lw = textWidth(label, 10.5) + 16;
  // Put the label at the middle of the curve, sliding along it when another label is already there.
  const clash = ([x, y]) => placed.some(([px, py, pw]) => Math.abs(px - x) < (pw + lw) / 2 + 4 && Math.abs(py - y) < 22);
  const [mx, my] = [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8].map(at).find((pt) => !clash(pt)) || at(0.5);
  placed.push([mx, my, lw]);
  const ang = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
  const tip = [p3[0] + end * Math.cos(ang), p3[1] + end * Math.sin(ang)];
  const wing = (sgn) => [p3[0] - 1.5 * Math.cos(ang) + sgn * 4.1 * Math.sin(ang), p3[1] - 1.5 * Math.sin(ang) - sgn * 4.1 * Math.cos(ang)];
  const head = symmetric
    ? `<circle class="head ${a.color}" cx="${r1(p0[0])}" cy="${r1(p0[1])}" r="2.6"/><circle class="head ${b.color}" cx="${r1(tip[0])}" cy="${r1(tip[1])}" r="2.6"/>`
    : `<polygon class="head ${b.color}" points="${pts([tip, wing(1), wing(-1)])}"/>`;
  const fade = a.color !== b.color;
  const gid = `${uid}-e${ei}`;
  const grad = fade ? `<linearGradient class="edge-grad" id="${gid}" gradientUnits="userSpaceOnUse" x1="${r1(p0[0])}" y1="${r1(p0[1])}" x2="${r1(tip[0])}" y2="${r1(tip[1])}"><stop offset="0.08" class="${a.color}"/><stop offset="0.92" class="${b.color}"/></linearGradient>` : '';
  const d = `M${pts([p0])}C${pts([p1])} ${pts([p2])} ${pts([symmetric ? tip : p3])}`;
  const svg = `<g class="map-edge ${cls} ${fade ? 'is-cross' : a.color}"${fade ? ` style="--edge:url(#${gid})"` : ''} data-from="${a.id}" data-to="${b.id}" data-rel="${e.relId || ''}" data-head="${esc(sentence)}" data-tag="${esc(label)}" data-why="${esc(why)}" aria-label="${esc(`${sentence}: ${label}`)}">
  <path class="hit" d="${d}"/>
  <path class="case" d="${d}"/>
  <path class="line" d="${d}"/>
  ${head}
  <g class="edge-label"><rect x="${r1(mx - lw / 2)}" y="${r1(my - 9.5)}" width="${r1(lw)}" height="19" rx="9.5"/><text x="${r1(mx)}" y="${r1(my + 3.7)}" text-anchor="middle">${esc(label)}</text></g>
</g>`;
  return { svg, grad };
}

// A concept: a footprint on the plane, a thin stem, and the card floating above. The beads on the
// card's lower edge are the subjects it belongs to, its home subject first.
function drawNode(n, ctx) {
  const { t, L, map } = ctx;
  const label = L(n.label);
  const { lines, size } = wrapLabel(label, 12, NODE_W - 50);
  const x = n.cx - NODE_W / 2, top = n.cy - NODE_H / 2;
  const tx = x + 38 + (NODE_W - 38 - 10) / 2, lh = size * 1.2;
  const fs = size < 12 ? ` style="font-size:${r1(size)}px"` : '';
  const text = lines.map((line, i) => `<text x="${r1(tx)}" y="${r1(n.cy + (i - (lines.length - 1) / 2) * lh + size * 0.36)}" text-anchor="middle"${fs}>${esc(line)}</text>`).join('');
  const beads = n.areas.length > 1 ? n.areas.map((id, i) => `<circle class="bead ${map.areas.find((a) => a.id === id).color}" cx="${r1(x + NODE_W - 16 - (n.areas.length - 1 - i) * 10)}" cy="${r1(top + NODE_H)}" r="3.6"/>`).join('') : '';
  const inner = `<ellipse class="foot" cx="${r1(n.px)}" cy="${r1(n.py)}" rx="30" ry="6.5"/>
  <path class="stem" d="M${r1(n.px)} ${r1(n.py)}V${r1(n.py - LIFT)}"/>
  <g class="card3d"><rect class="face" x="${r1(x)}" y="${r1(top)}" width="${NODE_W}" height="${NODE_H}" rx="11"/><circle class="badge" cx="${r1(x + 22)}" cy="${r1(n.cy)}" r="11.5"/><g transform="translate(${r1(x + 22)} ${r1(n.cy)}) scale(.82)">${typeGlyph(n.type, 0, 0)}</g>${text}${beads}</g>`;
  const cls = `map-node ${n.color} ${n.url ? 'is-written' : 'is-planned'}`;
  const aria = `${label}${n.url ? '' : ` (${t.planned})`}`;
  return n.url
    ? `<a class="${cls}" href="${n.url}" data-id="${n.id}" data-area="${n.areas.join(' ')}" aria-label="${esc(aria)}">${inner}</a>`
    : `<g class="${cls}" data-id="${n.id}" data-area="${n.areas.join(' ')}" tabindex="0" role="button" aria-label="${esc(aria)}">${inner}</g>`;
}

// What the detail panel shows for a node. `here` says whether another node is on this same map;
// one that is not becomes a link to the map of its home subject.
function nodeData(ctx, n, here) {
  const { map, L } = ctx;
  const areaOf = (id) => map.areas.find((a) => a.id === id);
  return {
    label: L(n.label), color: n.color, type: L(map.types.find((x) => x.id === n.type)?.title) || '', area: L(map.groups.find((g) => g.id === n.group)?.title) || L(areaOf(n.area).title),
    summary: L(n.summary) || '', url: n.url || '', written: !!n.url,
    areas: n.areas.map((id) => ({ title: L(areaOf(id).title), href: `${areaOf(id).url}#${n.id}`, color: areaOf(id).color })),
    path: n.path.map((p) => ({ id: p.id, label: L(p.label), written: !!p.url, href: here(p) ? '' : p.mapUrl, area: here(p) ? '' : L(areaOf(p.area).title) })),
    links: n.links.map(({ edge, other, out }) => ({ id: other.id, label: L(other.label), rel: edge.rel.id, relTitle: L(edge.rel.title), out, sym: !!edge.rel.symmetric, why: L(edge.why) || '', written: !!other.url, href: here(other) ? '' : other.mapUrl, area: here(other) ? '' : L(areaOf(other.area).title) })),
  };
}

const defs = (uid, extra) => `<defs><filter id="${uid}-blur" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="11"/></filter>${extra.join('')}</defs>`;
let figures = 0;   // several maps can share a page: every figure gets its own ids

// ---------- the big map: one floor, subjects as overlapping regions ----------

// Where concepts stand. Each subject has a home spot (its track sets how far back, its order how far
// left); a concept is drawn towards the spots of every subject it belongs to — so a concept shared
// by two subjects ends up between them — while cards keep apart, stay out of regions they do not
// belong to, and an arrow tends to point rightwards. Deterministic: the same JSON gives the same map.
function arrange(map, site, W, D) {
  const tracks = site.tracks;
  const spot = new Map();
  for (const [ti, track] of tracks.entries()) {
    const list = map.areas.filter((a) => a.track === track.id);
    list.forEach((a, k) => spot.set(a.id, [W * (k + 0.5) / list.length, D * (ti + 0.5) / tracks.length]));
  }
  const nodes = map.nodes;
  const target = (n) => {
    let su = 0, sv = 0, sw = 0;
    n.areas.forEach((id, i) => { const w = i ? 1 : 2; su += spot.get(id)[0] * w; sv += spot.get(id)[1] * w; sw += w; });
    return [su / sw, sv / sw];
  };
  const pos = new Map(nodes.map((n, i) => {
    const [u, v] = target(n), angle = i * 2.39996, r = 22 + 9 * Math.sqrt(i);
    return [n, [u + Math.cos(angle) * r, v + Math.sin(angle) * r * 0.6]];
  }));
  const SU = NODE_W + 56, SV = 126;                          // the room one card needs
  for (let step = 0; step < 900; step++) {
    const cool = step < 700 ? 1 - step / 800 : 0;                // the last steps only settle overlaps
    for (const n of nodes) {
      const p = pos.get(n), [tu, tv] = target(n);
      p[0] += (tu - p[0]) * 0.035 * cool; p[1] += (tv - p[1]) * 0.035 * cool;
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const p = pos.get(nodes[i]), q = pos.get(nodes[j]);
      const du = (q[0] - p[0]) / SU, dv = (q[1] - p[1]) / SV, d = Math.hypot(du, dv) || 1e-3;
      if (d >= 1) continue;
      const push = (1 - d) * 0.8;
      p[0] -= (du / d) * push * SU * 0.5; p[1] -= (dv / d) * push * SV * 0.5;
      q[0] += (du / d) * push * SU * 0.5; q[1] += (dv / d) * push * SV * 0.5;
    }
    for (const n of nodes) {
      const p = pos.get(n);
      for (const m of nodes) {
        if (m === n || m.areas.every((id) => n.areas.includes(id))) continue;
        // A card keeps out of a region it does not belong to.
        const foreign = m.areas.some((id) => !n.areas.includes(id));
        if (!foreign) continue;
        const q = pos.get(m), du = (p[0] - q[0]) / (REACH + 70), dv = (p[1] - q[1]) / (REACH + 30), d = Math.hypot(du, dv) || 1e-3;
        if (d < 1 && cool) { p[0] += (du / d) * (1 - d) * 0.12 * (REACH + 70); p[1] += (dv / d) * (1 - d) * 0.12 * (REACH + 30); }
      }
    }
    for (const e of map.edges) {
      if (e.rel.symmetric) continue;
      const p = pos.get(e.a), q = pos.get(e.b), gap = q[0] - p[0];
      if (gap < 120 && cool) { const shift = (120 - gap) * 0.015; p[0] -= shift; q[0] += shift; }
    }
    for (const p of pos.values()) { p[0] = Math.min(W - 100, Math.max(100, p[0])); p[1] = Math.min(D - 54, Math.max(104, p[1])); }
  }
  return { pos, spot };
}

export function renderMap(ctx) {
  const { site, map, t, L } = ctx;
  const uid = `km${++figures}`;
  const N = map.nodes.length;
  const W = Math.max(1000, Math.ceil(Math.sqrt(N * 2.4)) * 200 + 140), D = Math.max(600, site.tracks.length * 210);
  const { pos, spot } = arrange(map, site, W, D);
  const lane = { index: 0, h: D, oy: MARGIN + 26 };
  const ox = MARGIN;
  const project = (_, u, v) => [ox + u + (D - v) * SHEAR, lane.oy + v * SQUASH];
  const geo = { planeW: W, ox, project, nodeW: NODE_W, nodeH: NODE_H };
  for (const n of map.nodes) {
    const [u, v] = pos.get(n);
    Object.assign(n, { u, v, lane });
    [n.px, n.py] = project(lane, u, v);
    n.cx = n.px; n.cy = n.py - LIFT - NODE_H / 2;
  }
  const width = Math.ceil(ox + W + D * SHEAR + MARGIN), height = Math.ceil(lane.oy + D * SQUASH + SLAB + MARGIN + 22);

  // Regions, in floor coordinates: a disc around every member and a band along the shortest tree
  // joining them, melted into one shape by the goo filter. Where two subjects share concepts, their
  // regions overlap and their colours mix.
  const shapes = (members) => {
    const disc = members.map((n) => `<circle cx="${r1(n.u)}" cy="${r1(n.v)}" r="${REACH}"/>`);
    const inTree = [members[0]], links = [];
    while (inTree.length < members.length) {
      let best = null;
      for (const a of inTree) for (const b of members) if (!inTree.includes(b)) {
        const d = Math.hypot(a.u - b.u, (a.v - b.v) * 1.3);
        if (!best || d < best.d) best = { a, b, d };
      }
      inTree.push(best.b); links.push(`<path d="M${r1(best.a.u)} ${r1(best.a.v)}L${r1(best.b.u)} ${r1(best.b.v)}" stroke-width="${REACH * 1.5}"/>`);
    }
    return disc.join('') + links.join('');
  };
  const lived = map.areas.filter((a) => a.nodes.length).sort((x, y) => y.nodes.length - x.nodes.length);
  const regionFill = lived.map((a) => `<g class="region-fill ${a.color}" data-area="${a.id}" filter="url(#${uid}-goo)">${shapes(a.nodes)}</g>`).join('');
  const regionRing = lived.map((a) => `<g class="region-ring ${a.color}" data-area="${a.id}" filter="url(#${uid}-ring)">${shapes(a.nodes)}</g>`).join('');

  // Subject names, written on the floor next to the region, where no card stands.
  const taken = [];
  // Checked on screen: a tag must not cover a card, a footprint or another tag.
  const cards = map.nodes.flatMap((n) => [[n.cx - NODE_W / 2 - 6, n.cy - NODE_H / 2 - 6, n.cx + NODE_W / 2 + 6, n.cy + NODE_H / 2 + 8], [n.px - 32, n.py - 8, n.px + 32, n.py + 8]]);
  const overlaps = (r, q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3];
  const box = (u, v, w) => { const [x, y] = project(lane, u, v); return [x - 6, y - 25, x + w + 6, y + 13]; };
  const free = (u, v, w) => u > 6 && u + w < W - 6 && v > 40 && v < D - 14
    && !cards.some((c) => overlaps(box(u, v, w), c)) && !taken.some((r) => overlaps(box(u, v, w), r));
  // A name goes where its own region is and as few others are; never on a card or another name.
  const within = (area, u, v) => area.nodes.some((n) => Math.hypot(u - n.u, (v - n.v) * 1.2) < REACH + 10);
  const labels = map.areas.map((a) => {
    const name = L(a.title), count = a.nodes.length ? `${a.done}/${a.nodes.length}` : t.tileEmpty;
    const w = 34 + textWidth(name, 14) + (a.nodes.length ? count.length * 7 : textWidth(count, 11)) + 10;
    const tries = [];
    const [su, sv] = spot.get(a.id);
    for (const n of a.nodes) {
      for (const [du, dv] of [[-w / 2 - 10, 44], [-112 - w, 8], [76, 8], [-w / 2 - 10, 70], [76, -40], [-112 - w, -40], [-w / 2 - 10, -108]]) tries.push([n.u + du, n.v + dv]);
    }
    tries.push([su - w / 2, sv + 8], [su - w / 2, sv + 50], [su - w / 2, sv - 40]);
    const score = ([u, v]) => {
      const mid = [u + w / 2, v - 8];
      return (a.nodes.length && within(a, ...mid) ? 3 : 0) - map.areas.filter((o) => o !== a && within(o, ...mid)).length * 1.5
        - Math.min(...(a.nodes.length ? a.nodes : [{ u: su, v: sv }]).map((n) => Math.hypot(mid[0] - n.u, mid[1] - n.v))) / 300;
    };
    const ok = tries.filter(([u, v]) => free(u, v, w));
    const at = ok.length ? ok.reduce((best, x) => (score(x) > score(best) ? x : best)) : tries[0];
    taken.push(box(at[0], at[1], w));
    // Written upright, as a small tag standing where the name was placed on the floor.
    const [x, y] = project(lane, at[0], at[1]);
    const pill = `<rect x="${r1(x)}" y="${r1(y - 19)}" width="${r1(w)}" height="26" rx="13"/><circle cx="${r1(x + 15)}" cy="${r1(y - 6)}" r="4.5"/><text class="region-title" x="${r1(x + 27)}" y="${r1(y - 1)}">${esc(name)}</text><text class="region-count" x="${r1(x + w - 12)}" y="${r1(y - 1.5)}" text-anchor="end">${esc(count)}</text>`;
    return a.url
      ? `<a class="region-name ${a.color}" href="${a.url}" data-area="${a.id}" aria-label="${esc(`${name} ${count}`)}">${pill}</a>`
      : `<g class="region-name ${a.color} is-empty" data-area="${a.id}">${pill}</g>`;
  }).join('');
  // The depth of the floor still reads from foundations at the back to systems at the front.
  const ticks = site.tracks.map((track, ti) => `<text class="floor-track" x="12" y="${r1(D * (ti + 0.5) / site.tracks.length + 5)}">${esc(track.glyph)} ${esc(L(track.title))}</text>`).join('');

  const placed = [], grads = [];
  const edgeSvg = map.edges.map((e, i) => {
    const { svg, grad } = drawEdge(geo, { a: e.a, b: e.b, symmetric: !!e.rel.symmetric, relId: e.rel.id }, i, uid, map.nodes, placed, {
      label: L(e.rel.title), sentence: `${L(e.a.label)} ${e.rel.symmetric ? '↔' : '→'} ${L(e.b.label)}`, why: L(e.why) || '', cls: `r-${e.rel.id}`,
    });
    if (grad) grads.push(grad);
    return svg;
  }).join('\n');
  const goo = `<filter id="${uid}-goo" filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${D + 400}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18"/><feComponentTransfer><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer></filter>`
    + `<filter id="${uid}-ring" filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${D + 400}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18"/><feComponentTransfer result="solid"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer><feMorphology operator="erode" radius="1.8" result="inner"/><feComposite in="solid" in2="inner" operator="out"/></filter>`;

  const data = Object.fromEntries(map.nodes.map((n) => [n.id, nodeData(ctx, n, () => true)]));
  const written = map.nodes.filter((n) => n.url).length;
  // On small screens: subject by subject; a shared concept shows up under each of its subjects.
  const outline = map.areas.filter((a) => a.nodes.length).map((a) => `<section class="${a.color}">
      <h3><i></i><a href="${a.url}">${esc(L(a.title))}</a><small>${a.done}/${a.nodes.length}</small></h3>
      <p>${a.nodes.map((n) => `<button type="button" class="ochip ${n.url ? 'is-written' : 'is-planned'}" data-id="${n.id}">${esc(L(n.label))}${n.areas.length > 1 ? `<small>${n.areas.length}</small>` : ''}</button>`).join('')}</p>
    </section>`).join('\n    ');
  const shared = map.nodes.filter((n) => n.areas.length > 1).length;

  return `<figure class="kmap kmap-big card" data-read="${esc(t.readNote)}" data-planned="${esc(t.planned)}" data-path="${esc(t.mapPath)}">
  <div class="kmap-scroll" tabindex="0" aria-label="${esc(t.mapTitle)}">
    <svg class="kmap-svg labels-hover" viewBox="0 0 ${width} ${height}" style="min-width:${Math.round(Math.min(width * 0.8, 1080))}px" role="group" aria-label="${esc(t.mapTitle)}: ${esc(t.lit(written, N))}">
${defs(uid, [goo, ...grads])}
${drawLane(geo, lane, uid, '', `<g class="regions">${regionFill}${regionRing}</g>${ticks}`, 't-floor')}
<g class="edges">
${edgeSvg}
</g>
${map.nodes.map((n) => drawNode(n, ctx)).join('\n')}
<g class="region-names">${labels}</g>
    </svg>
  </div>
  <div class="kmap-legend">
    <div class="legend-row"><span class="legend-name">${esc(t.bigLegend)}</span><span class="type-key"><i class="k-regions"></i>${esc(t.bigRegions)}</span><span class="type-key"><svg viewBox="0 0 26 10" width="26" height="10" aria-hidden="true"><circle class="bead a-0" cx="6" cy="5" r="3.6"/><circle class="bead a-7" cx="17" cy="5" r="3.6"/></svg>${esc(t.bigBeads)}</span><span class="type-key"><i class="k-flow"></i>${esc(t.bigLines)}</span><span class="flow-key">${esc(t.bigShared(shared, N))}</span></div>
    <div class="legend-row"><span class="legend-name">${esc(t.typeLegend)}</span>${map.types.filter((ty) => map.nodes.some((n) => n.type === ty.id)).map((ty) => `<span class="type-key"><svg viewBox="-8 -8 16 16" width="14" height="14" aria-hidden="true">${typeGlyph(ty.id, 0, 0)}</svg>${esc(L(ty.title))}</span>`).join('')}<span class="type-key"><i class="k-written"></i>${esc(t.written)}</span><span class="type-key"><i class="k-planned"></i>${esc(t.planned)}</span><span class="flow-key">${esc(t.bigHint)}</span><span class="count">${esc(t.lit(written, N))}</span></div>
  </div>
  <div class="kmap-outline">
    <p class="outline-hint">${esc(t.bigHint)}<span>${esc(t.lit(written, N))}</span></p>
    ${outline}
  </div>
  <div class="kmap-panel" aria-live="polite"><p class="hint">${esc(t.mapHint)}</p></div>
  <script type="application/json" class="kmap-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</figure>`;
}

// ---------- a course map: one subject on its own plane ----------

export function renderCourse(ctx, area) {
  const { site, map, t, L } = ctx;
  const uid = `km${++figures}`;
  const track = site.tracks.find((x) => x.id === area.track);
  const mine = area.nodes;                            // at home here, or belonging here as well
  const member = new Set(mine);
  // Columns follow the longest chain of relations inside this subject.
  const local = new Map();
  for (const n of mine) delete n.local;
  layering(mine, 'local', (n) => n.before.filter((p) => member.has(p)));
  for (const n of mine) local.set(n, n.local);
  for (const e of map.edges) if (e.rel.symmetric && member.has(e.a) && member.has(e.b) && local.get(e.a) === local.get(e.b)) local.set(e.b, local.get(e.b) + 1);
  const chapters = map.groups.filter((g) => g.area === area.id && mine.some((n) => n.group === g.id));
  const chapterIndex = (n) => { const i = chapters.findIndex((g) => g.id === n.group); return i < 0 ? chapters.length : i; };
  const layers = [...new Set(mine.map((n) => local.get(n)))].sort((a, b) => a - b);
  // Members of one chapter stay together inside a column, so its region can enclose them.
  const cols = layers.map((layer) => mine.filter((n) => local.get(n) === layer).sort((a, b) => chapterIndex(a) - chapterIndex(b)));
  const lane = { track, glyph: track?.glyph, index: 0, zones: [{ cols, minUnits: 2.4 }] };

  // Position carries the reading order: a relation marked "order" between neighbouring columns is not drawn.
  const inside = map.edges.filter((e) => member.has(e.a) && member.has(e.b));
  const implied = (e) => e.rel.order && Math.abs(local.get(e.b) - local.get(e.a)) === 1;
  const drawn = inside.filter((e) => !implied(e));
  const col = Math.max(214, NODE_W + 24 + Math.max(0, ...drawn.map((e) => textWidth(L(e.rel.title), 10.5) + 16)));
  const ROW = 132;
  const geo = place([lane], { col, row: ROW, nodeW: NODE_W, nodeH: NODE_H, padBottom: 56, top: 40 });
  const h = lane.h;

  // Floor, in plane coordinates: chapter regions, then the rail that numbers the steps.
  const regions = chapters.map((g) => {
    const members = mine.filter((n) => n.group === g.id);
    const u0 = Math.min(...members.map((n) => n.u)) - NODE_W / 2 - 46, u1 = Math.max(...members.map((n) => n.u)) + NODE_W / 2 + 22;
    const v0 = Math.min(...members.map((n) => n.v)) - 96, v1 = Math.max(...members.map((n) => n.v)) + 44;
    return `<g class="map-region"><rect x="${r1(u0)}" y="${r1(v0)}" width="${r1(u1 - u0)}" height="${r1(v1 - v0)}" rx="22"/><text x="${r1(u0 + 18)}" y="${r1(v1 - 9)}">${esc(L(g.title))}</text></g>`;
  }).join('');
  const railV = h - 50;
  const stations = cols.map((column, i) => ({ u: column[0].u, step: i + 1, top: Math.min(...column.map((n) => n.v)) }));
  const rail = stations.length > 1 ? `<g class="map-rail">
    <path class="rail-line" d="M${r1(stations[0].u)} ${railV}H${r1(stations.at(-1).u + 46)}"/>
    <path class="rail-head" d="M${r1(stations.at(-1).u + 54)} ${railV}l-10 -5v10z"/>
    ${stations.map((s) => `<path class="rail-tie" d="M${r1(s.u)} ${r1(s.top + 12)}V${railV}"/><circle class="rail-stop" cx="${r1(s.u)}" cy="${railV}" r="11"/><text class="rail-step" x="${r1(s.u)}" y="${railV + 5.2}" text-anchor="middle">${s.step}</text>`).join('')}
    <text class="rail-name" x="${r1(stations[0].u - 20)}" y="${railV + 5}" text-anchor="end">${esc(t.railFrom)}</text><text class="rail-name" x="${r1(stations.at(-1).u + 62)}" y="${railV + 5}">${esc(t.railTo)}</text>
  </g>` : '';

  const placed = [], grads = [];
  const edgeSvg = drawn.map((e, i) => {
    const { svg, grad } = drawEdge(geo, { a: e.a, b: e.b, symmetric: !!e.rel.symmetric, relId: e.rel.id }, i, uid, mine, placed, {
      label: L(e.rel.title), sentence: `${L(e.a.label)} ${e.rel.symmetric ? '↔' : '→'} ${L(e.b.label)}`, why: L(e.why) || '', cls: `r-${e.rel.id}`,
    });
    if (grad) grads.push(grad);
    return svg;
  }).join('\n');

  // Doors: a relation that leaves the subject becomes a tag on the card, linking to the other subject's map.
  const areaTitle = (id) => L(map.areas.find((a) => a.id === id)?.title) || '';
  const portSvg = mine.flatMap((n) => {
    const doors = n.links.filter((l) => !member.has(l.other));
    const shown = doors.slice(0, doors.length > PORT_MAX ? PORT_MAX - 1 : PORT_MAX);
    const x = n.cx - NODE_W / 2, top = n.cy - NODE_H / 2;
    const tags = shown.map((l, i) => {
      const into = l.out || l.edge.rel.symmetric;
      const body = clip(`${areaTitle(l.other.area)} · ${L(l.other.label)}`, 10.5, 178);
      const text = into ? `→ ${body}` : `${body} →`;
      const w = textWidth(text, 10.5) + 18, y = top - 9 - PORT_H - i * (PORT_H + 4);
      const title = `${L(l.out ? n.label : l.other.label)} ${l.edge.rel.symmetric ? '↔' : '→'} ${L(l.out ? l.other.label : n.label)} · ${L(l.edge.rel.title)}${L(l.edge.why) ? ` — ${L(l.edge.why)}` : ''}`;
      return `<a class="map-port ${l.other.color} ${into ? 'is-out' : 'is-in'}" href="${l.other.mapUrl}" data-for="${n.id}"><title>${esc(title)}</title><rect x="${r1(x + 6)}" y="${r1(y)}" width="${r1(w)}" height="${PORT_H}" rx="5"/><text x="${r1(x + 6 + w / 2)}" y="${r1(y + 12.6)}" text-anchor="middle">${esc(text)}</text></a>`;
    });
    if (doors.length > shown.length) {
      const y = top - 9 - PORT_H - shown.length * (PORT_H + 4);
      tags.push(`<g class="map-port is-more" data-for="${n.id}"><rect x="${r1(x + 6)}" y="${r1(y)}" width="34" height="${PORT_H}" rx="5"/><text x="${r1(x + 23)}" y="${r1(y + 12.6)}" text-anchor="middle">+${doors.length - shown.length}</text></g>`);
    }
    return doors.length ? [`<path class="port-stem ${n.color}" data-for="${n.id}" d="M${r1(x + 16)} ${r1(top)}v-9"/>`, ...tags] : [];
  }).join('\n');

  // Data for the detail panel. A node outside this subject is a link to its own map.
  const data = Object.fromEntries(mine.map((n) => [n.id, nodeData(ctx, n, (m) => member.has(m))]));
  const loose = mine.filter((n) => !chapters.some((g) => g.id === n.group));
  const outline = [...chapters.map((g) => [L(g.title), mine.filter((n) => n.group === g.id)]), ...(loose.length ? [[chapters.length ? t.chapterOther : L(area.title), loose]] : [])]
    .map(([title, list]) => `<section class="${area.color}">
      <h3><i></i>${esc(title)}<small>${list.filter((n) => n.url).length}/${list.length}</small></h3>
      <p>${list.map((n) => `<button type="button" class="ochip ${n.url ? 'is-written' : 'is-planned'}" data-id="${n.id}">${esc(L(n.label))}</button>`).join('')}</p>
    </section>`).join('\n    ');
  const usedTypes = map.types.filter((ty) => mine.some((n) => n.type === ty.id));
  const usedRels = map.relations.filter((r) => drawn.some((e) => e.rel === r));
  const count = t.lit(area.done, mine.length);

  return `<figure class="kmap kmap-course card" data-read="${esc(t.readNote)}" data-planned="${esc(t.planned)}" data-path="${esc(t.mapPath)}">
  <div class="kmap-scroll" tabindex="0" aria-label="${esc(L(area.title))}">
    <svg class="kmap-svg" viewBox="0 0 ${geo.width} ${geo.height}" style="min-width:${Math.round(Math.min(geo.width * 0.8, 1080))}px;max-width:${Math.round(geo.width * 1.12)}px" role="group" aria-label="${esc(L(area.title))}: ${esc(count)}">
${defs(uid, grads)}
${drawLane(geo, lane, uid, L(area.title), rail + regions, area.color)}
<g class="edges">
${edgeSvg}
</g>
${mine.map((n) => drawNode(n, ctx)).join('\n')}
<g class="ports">
${portSvg}
</g>
    </svg>
  </div>
  <div class="kmap-legend">
    <div class="legend-row"><span class="legend-name">${esc(t.relLegend)}</span>${stations.length > 1 ? `<span class="type-key"><i class="k-rail"></i>${esc(t.keyRail)}</span>` : ''}${chapters.length ? `<span class="type-key"><i class="k-region"></i>${esc(t.keyRegion)}</span>` : ''}${portSvg ? `<span class="type-key"><i class="k-port"></i>${esc(t.keyPort)}</span>` : ''}${usedRels.map((r) => `<button type="button" class="rel-toggle r-${r.id}" data-rel="${r.id}" aria-pressed="true"><i></i>${esc(L(r.title))}</button>`).join('')}</div>
    <div class="legend-row"><span class="legend-name">${esc(t.typeLegend)}</span>${usedTypes.map((ty) => `<span class="type-key"><svg viewBox="-8 -8 16 16" width="14" height="14" aria-hidden="true">${typeGlyph(ty.id, 0, 0)}</svg>${esc(L(ty.title))}</span>`).join('')}<span class="type-key"><i class="k-written"></i>${esc(t.written)}</span><span class="type-key"><i class="k-planned"></i>${esc(t.planned)}</span><span class="count">${esc(count)}</span></div>
  </div>
  <div class="kmap-outline">
    <p class="outline-hint">${esc(t.outlineHint)}<span>${esc(count)}</span></p>
    ${outline}
  </div>
  <div class="kmap-panel" aria-live="polite"><p class="hint">${esc(t.mapHint)}</p></div>
  <script type="application/json" class="kmap-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</figure>`;
}

// The same relations, as sentences. Works without JavaScript and is what search engines read.
// With `area`, only the relations that touch that subject.
export function relationList(ctx, area) {
  const { map, L } = ctx;
  const inside = (n) => area && n.areas.includes(area.id);
  const edges = area ? map.edges.filter((e) => inside(e.a) || inside(e.b)) : map.edges;
  const name = (n) => {
    const href = area && !inside(n) ? n.mapUrl : n.url;
    return href ? `<a href="${href}">${esc(L(n.label))}</a>` : `<span>${esc(L(n.label))}</span>`;
  };
  return `<ul class="rel-list">
${edges
  .map((e) => `<li class="r-${e.rel.id}"><p class="rel-line">${name(e.a)}<b class="rel-tag">${esc(L(e.rel.title))}</b>${name(e.b)}</p><p class="why">${esc(L(e.why) || '')}</p></li>`)
  .join('\n')}
</ul>`;
}
