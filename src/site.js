// Theme toggle, reading progress, contents highlight, note search and facets, knowledge map,
// site-wide search, image zoom, footnote previews, comments, copy buttons. No dependencies.
(() => {
  const root = document.documentElement;
  const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  const say = root.lang.startsWith('zh') ? { copy: '复制', copied: '已复制 ✓', failed: '复制失败' } : { copy: 'Copy', copied: 'Copied ✓', failed: 'Copy failed' };

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const current = root.dataset.theme || (systemDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      // Once the choice matches the system again, go back to following it.
      if ((next === 'dark') === systemDark()) localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {}
  });

  const prose = document.querySelector('.article .prose');
  const bar = document.querySelector('.progress');
  if (prose && bar) {
    const update = () => {
      const start = prose.offsetTop - 80;
      const span = prose.offsetHeight - innerHeight * 0.6;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, span)))})`;
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  const toc = document.querySelector('.toc');
  if (toc) {
    const details = toc.querySelector('details');
    const wide = matchMedia('(min-width: 68rem)');
    const sync = () => (details.open = wide.matches);
    sync();
    wide.addEventListener('change', sync);

    const links = new Map([...toc.querySelectorAll('a')].map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const heads = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    let active;
    const mark = () => {
      const y = scrollY + 120;
      let cur = heads[0];
      for (const h of heads) if (h.getBoundingClientRect().top + scrollY <= y) cur = h;
      const a = cur && links.get(cur.id);
      if (a !== active) {
        active?.removeAttribute('aria-current');
        a?.setAttribute('aria-current', 'true');
        active = a;
      }
    };
    addEventListener('scroll', mark, { passive: true });
    mark();
  }

  // Notes hub: the search box and the subject filter drive the note lists, the paper list and the map above them.
  const search = document.getElementById('note-search');
  if (search) {
    const state = { q: '', view: 'topic', area: '' };
    const facets = [...document.querySelectorAll('.facet')];
    const views = [...document.querySelectorAll('.view')];
    const panes = { topic: document.getElementById('view-topic'), time: document.getElementById('view-time'), papers: document.getElementById('view-papers') };
    const mapNodes = [...document.querySelectorAll('.hub-map .map-node')];
    const mapSvg = document.querySelector('.hub-map .kmap-svg');
    const zoneLabels = [...document.querySelectorAll('.hub-map .zone-label')];
    const empty = document.getElementById('notes-empty');
    const counter = document.getElementById('result-count');
    const clear = document.getElementById('clear-filters');
    const matches = (card) => {
      const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      return (!state.area || card.dataset.area === state.area) && words.every((w) => card.dataset.text.includes(w));
    };
    const apply = () => {
      for (const [name, pane] of Object.entries(panes)) pane.hidden = name !== state.view;
      let shown = 0;
      for (const card of panes[state.view].querySelectorAll('.note-card, .paper')) {
        const ok = matches(card);
        card.hidden = !ok;
        if (ok) shown++;
      }
      for (const group of panes.topic.querySelectorAll('.group')) group.hidden = !group.querySelector('.note-card:not([hidden]), .paper:not([hidden])');
      empty.hidden = shown > 0;
      const planned = state.area && !state.q ? facets.find((f) => f.dataset.value === state.area)?.dataset.planned : '';
      empty.textContent = planned ? empty.dataset.planned + planned : empty.dataset.empty;
      mapSvg?.classList.toggle('is-filter', !!state.area);
      for (const n of mapNodes) n.classList.toggle('is-match', !!state.area && n.dataset.area === state.area);
      for (const z of zoneLabels) z.classList.toggle('is-current', z.dataset.area === state.area);
      counter.textContent = (shown === 1 ? counter.dataset.one : counter.dataset.many).replace(/\d+/, shown);
      for (const f of facets) f.setAttribute('aria-pressed', String(f.dataset.value === state.area));
      clear.hidden = !state.area && !state.q;
    };
    for (const f of facets) f.addEventListener('click', () => {
      state.area = state.area === f.dataset.value ? '' : f.dataset.value;
      apply();
    });
    const setView = (name) => {
      state.view = panes[name] ? name : 'topic';
      for (const b of views) b.setAttribute('aria-pressed', String(b.dataset.view === state.view));
      apply();
    };
    for (const btn of views) btn.addEventListener('click', () => setView(btn.dataset.view));
    // "#papers" opens the paper list; "#s-<subject>" selects a subject (used by the subject names on the map).
    const fromHash = () => {
      const subject = location.hash.match(/^#s-(.+)$/)?.[1];
      if (location.hash === '#papers') setView('papers');
      else if (subject && facets.some((f) => f.dataset.value === subject)) { state.area = subject; setView('topic'); }
      else return;
      document.getElementById('list')?.scrollIntoView();
    };
    for (const z of zoneLabels) z.addEventListener('click', (e) => {
      e.preventDefault();
      state.area = state.area === z.dataset.area ? '' : z.dataset.area;
      setView('topic');
    });
    addEventListener('hashchange', fromHash);
    fromHash();
    clear.addEventListener('click', () => {
      Object.assign(state, { q: '', area: '' });
      search.value = '';
      apply();
    });
    search.addEventListener('input', () => { state.q = search.value; apply(); });
    addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== search && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.focus(); }
      if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; state.q = ''; apply(); search.blur(); }
    });
  }

  // Knowledge map: hover lights up a node's neighbours, selecting it fills the detail panel,
  // and the relation chips in the legend show or hide one kind of link.
  const el = (tag, props = {}, ...kids) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...kids.filter(Boolean));
    return node;
  };
  for (const fig of document.querySelectorAll('.kmap')) {
    const svg = fig.querySelector('.kmap-svg');
    const panel = fig.querySelector('.kmap-panel');
    const data = JSON.parse(fig.querySelector('.kmap-data').textContent);
    const nodes = [...svg.querySelectorAll('.map-node')];
    const chips = [...fig.querySelectorAll('.ochip')];
    const edges = [...svg.querySelectorAll('.map-edge')];
    let selected = null;
    const paint = (id) => {
      const near = new Set([id]);
      for (const e of edges) {
        const hit = id && (e.dataset.from === id || e.dataset.to === id) && !e.classList.contains('is-off');
        e.classList.toggle('is-on', !!hit);
        if (hit) { near.add(e.dataset.from); near.add(e.dataset.to); }
      }
      for (const n of nodes) n.classList.toggle('is-on', !!id && near.has(n.dataset.id));
      svg.classList.toggle('is-focus', !!id);
    };
    const show = (id) => {
      selected = id;
      for (const n of [...nodes, ...chips]) n.classList.toggle('is-selected', n.dataset.id === id);
      paint(id);
      if (!panel) return;
      const d = data[id];
      const rel = (l) => el('li', { className: `r-${l.rel}` },
        el('p', { className: 'rel-line' },
          l.out || l.sym ? el('span', { className: 'self', textContent: d.label }) : el('button', { type: 'button', className: l.written ? 'jump' : 'jump is-planned', textContent: l.label, onclick: () => show(l.id) }),
          el('b', { className: 'rel-tag', textContent: l.relTitle }),
          l.out || l.sym ? el('button', { type: 'button', className: l.written ? 'jump' : 'jump is-planned', textContent: l.label, onclick: () => show(l.id) }) : el('span', { className: 'self', textContent: d.label })),
        l.why && el('p', { className: 'why', textContent: l.why }));
      panel.replaceChildren(
        el('div', { className: `panel-main t-${d.track}` },
          el('p', { className: 'panel-meta' }, el('span', { className: 'chip', textContent: d.type }), d.area && el('span', { className: 'kind', textContent: d.area }), !d.url && el('span', { className: 'planned-tag', textContent: fig.dataset.planned })),
          el('h3', { textContent: d.label }),
          el('p', { className: 'summary', textContent: d.summary }),
          d.url && el('a', { className: 'pdf', href: d.url, textContent: `${fig.dataset.read} →` })),
        el('ul', { className: 'rel-list' }, ...d.links.map(rel)));
    };
    for (const n of nodes) {
      const id = n.dataset.id;
      n.addEventListener('pointerenter', () => paint(id));
      n.addEventListener('pointerleave', () => paint(selected));
      n.addEventListener('focus', () => paint(id));
      n.addEventListener('blur', () => paint(selected));
      n.addEventListener('click', (e) => { if (panel) { e.preventDefault(); show(id); } });
      n.addEventListener('keydown', (e) => { if (panel && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(id); } });
    }
    for (const chip of chips) chip.addEventListener('click', () => {
      show(chip.dataset.id);
      panel?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    // Hovering a link explains it in one sentence.
    const tip = el('div', { className: 'kmap-tip', hidden: true });
    fig.append(tip);
    for (const e of edges) {
      e.addEventListener('pointerenter', () => {
        for (const x of edges) x.classList.toggle('is-on', x === e);
        for (const n of nodes) n.classList.toggle('is-on', n.dataset.id === e.dataset.from || n.dataset.id === e.dataset.to);
        svg.classList.add('is-focus');
        tip.replaceChildren(el('b', {}, e.dataset.head, el('i', { textContent: e.dataset.tag })), e.dataset.why);
        tip.hidden = false;
      });
      e.addEventListener('pointermove', (ev) => {
        const box = fig.getBoundingClientRect();
        tip.style.left = `${Math.min(box.width - tip.offsetWidth - 8, Math.max(8, ev.clientX - box.left + 14))}px`;
        tip.style.top = `${ev.clientY - box.top + 16}px`;
      });
      e.addEventListener('pointerleave', () => { tip.hidden = true; paint(selected); });
    }
    for (const btn of fig.querySelectorAll('.rel-toggle')) {
      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        for (const e of edges) if (e.dataset.rel === btn.dataset.rel) e.classList.toggle('is-off', !on);
        paint(selected);
      });
    }
  }

  // Images: click to enlarge.
  const zoomables = document.querySelectorAll('.zoomable img, .prose figure img');
  if (zoomables.length) {
    const box = el('div', { className: 'lightbox', hidden: true, tabIndex: -1 }, el('img', { alt: '' }));
    document.body.append(box);
    const close = () => { box.hidden = true; document.documentElement.classList.remove('no-scroll'); };
    box.addEventListener('click', close);
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
    for (const img of zoomables) {
      img.closest('a')?.addEventListener('click', (e) => e.preventDefault());
      img.addEventListener('click', () => {
        const big = box.querySelector('img');
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        box.hidden = false;
        document.documentElement.classList.add('no-scroll');
        box.focus();
      });
    }
  }

  // Footnotes: show the note next to its reference on hover or focus.
  const refs = document.querySelectorAll('.fn-ref a');
  if (refs.length) {
    const tip = el('div', { className: 'fn-tip', hidden: true, role: 'tooltip' });
    document.body.append(tip);
    let timer;
    const open = (a) => {
      clearTimeout(timer);
      const note = document.getElementById(a.hash.slice(1));
      if (!note) return;
      tip.innerHTML = note.innerHTML;
      tip.querySelector('.fn-back')?.remove();
      tip.hidden = false;
      const r = a.getBoundingClientRect();
      const w = Math.min(340, innerWidth - 24);
      tip.style.width = `${w}px`;
      tip.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + scrollX}px`;
      tip.style.top = `${r.bottom + scrollY + 8}px`;
    };
    const hide = () => (timer = setTimeout(() => (tip.hidden = true), 180));
    for (const a of refs) {
      a.addEventListener('pointerenter', () => open(a));
      a.addEventListener('pointerleave', hide);
      a.addEventListener('focus', () => open(a));
      a.addEventListener('blur', hide);
    }
    tip.addEventListener('pointerenter', () => clearTimeout(timer));
    tip.addEventListener('pointerleave', hide);
  }

  // Comments (giscus): loaded only when the section scrolls into view, and kept in step with the theme.
  const giscus = document.querySelector('.giscus');
  if (giscus) {
    const cfg = JSON.parse(giscus.dataset.config);
    const theme = () => ((root.dataset.theme || (systemDark() ? 'dark' : 'light')) === 'dark' ? 'dark_dimmed' : 'light');
    const load = () => {
      const s = el('script', { src: 'https://giscus.app/client.js', async: true, crossOrigin: 'anonymous' });
      const attrs = { repo: cfg.repo, 'repo-id': cfg.repoId, category: cfg.category, 'category-id': cfg.categoryId, mapping: 'pathname', strict: '1', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: theme(), lang: cfg.lang, loading: 'lazy' };
      for (const [k, v] of Object.entries(attrs)) s.setAttribute(`data-${k}`, v);
      giscus.append(s);
    };
    new IntersectionObserver((entries, io) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px' }).observe(giscus);
    new MutationObserver(() => {
      document.querySelector('iframe.giscus-frame')?.contentWindow?.postMessage({ giscus: { setConfig: { theme: theme() } } }, 'https://giscus.app');
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // Site-wide search: ⌘K / Ctrl+K anywhere, or "/" on pages without their own search box.
  const opener = document.querySelector('.search-open');
  if (opener && typeof HTMLDialogElement !== 'undefined') {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    if (!mac) opener.querySelector('kbd').textContent = 'Ctrl K';
    const keys = JSON.parse(opener.dataset.keys);
    let dialog, input, list, index, shown = [], cursor = 0;
    const render = () => {
      const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      const score = (it) => {
        const title = it.t.toLowerCase(), all = `${title} ${it.d} ${it.x} ${it.k}`.toLowerCase();
        if (!words.every((w) => all.includes(w))) return -1;
        return words.reduce((sum, w) => sum + (title.startsWith(w) ? 3 : title.includes(w) ? 2 : 1), 0);
      };
      shown = (index || []).map((it, i) => ({ it, s: words.length ? score(it) : 1, i })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 8).map((r) => r.it);
      cursor = Math.min(cursor, Math.max(0, shown.length - 1));
      list.replaceChildren(...(shown.length
        ? shown.map((it, i) => el('li', { role: 'option', ariaSelected: String(i === cursor) },
            el('a', { href: it.u, ...(/^https?:/.test(it.u) ? { target: '_blank', rel: 'noopener' } : {}) },
              el('span', { className: 'k', textContent: it.k }), el('span', { className: 't', textContent: it.t }), el('span', { className: 'd', textContent: it.d }))))
        : [el('li', { className: 'none', textContent: index ? opener.dataset.none : '…' })]));
    };
    const open = async () => {
      if (!dialog) {
        input = el('input', { type: 'search', placeholder: opener.dataset.placeholder, autocomplete: 'off', ariaLabel: opener.dataset.placeholder });
        list = el('ul', { role: 'listbox' });
        const head = el('div', { className: 'palette-head' });
        head.innerHTML = opener.querySelector('svg').outerHTML;
        head.append(input, el('kbd', { textContent: 'Esc' }));
        const foot = el('div', { className: 'palette-foot' },
          el('span', {}, el('kbd', { textContent: '↑↓' }), ` ${keys[0]}`), el('span', {}, el('kbd', { textContent: '↵' }), ` ${keys[1]}`), el('span', {}, el('kbd', { textContent: 'Esc' }), ` ${keys[2]}`));
        dialog = el('dialog', { className: 'palette' }, head, list, foot);
        document.body.append(dialog);
        input.addEventListener('input', () => { cursor = 0; render(); });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % Math.max(1, shown.length);
            render();
            list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'Enter') {
            e.preventDefault();
            list.querySelector('[aria-selected="true"] a')?.click();
          }
        });
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
        list.addEventListener('click', (e) => { if (e.target.closest('a')) dialog.close(); });
      }
      input.value = '';
      cursor = 0;
      render();
      dialog.showModal();
      if (!index) {
        try { index = await (await fetch(opener.dataset.index)).json(); } catch { index = []; }
        render();
      }
    };
    opener.addEventListener('click', open);
    addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog?.open ? dialog.close() : open(); }
      else if (e.key === '/' && !typing && !search && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(); }
    });
  }

  // If the reader's browser prefers the other language, say once that this page exists in it.
  const other = document.querySelector('.lang-switch');
  try {
    const wantsZh = (navigator.language || '').toLowerCase().startsWith('zh');
    if (other && wantsZh !== root.lang.startsWith('zh') && localStorage.getItem('lang-hint') !== 'off') {
      const bar = el('div', { className: 'lang-hint', lang: other.lang },
        el('a', { href: other.href, textContent: `${other.title} →` }),
        el('button', { type: 'button', ariaLabel: '×', textContent: '×', onclick: () => { bar.remove(); try { localStorage.setItem('lang-hint', 'off'); } catch {} } }));
      document.querySelector('.site-header').after(bar);
    }
  } catch {}

  // Wide equations scroll sideways; a fade on the right edge says so.
  const eqs = [...document.querySelectorAll('.katex-display')];
  if (eqs.length) {
    const flag = () => { for (const q of eqs) q.classList.toggle('is-scroll', q.scrollWidth > q.clientWidth + 2 && q.scrollLeft + q.clientWidth < q.scrollWidth - 2); };
    for (const q of eqs) q.addEventListener('scroll', flag, { passive: true });
    addEventListener('resize', flag);
    flag();
  }

  const top = document.querySelector('.to-top');
  if (top) {
    const toggle = () => (top.hidden = scrollY < innerHeight * 1.2);
    addEventListener('scroll', toggle, { passive: true });
    top.addEventListener('click', () => scrollTo({ top: 0 }));
    toggle();
  }

  for (const pre of document.querySelectorAll('pre.code')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy';
    btn.textContent = say.copy;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code').innerText);
        btn.textContent = say.copied;
      } catch {
        btn.textContent = say.failed;
      }
      setTimeout(() => (btn.textContent = say.copy), 1600);
    });
    pre.append(btn);
  }
})();
