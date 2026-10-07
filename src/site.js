// Theme toggle, reading progress, contents highlight, note search and facets, knowledge map,
// image zoom, footnote previews, comments, copy buttons. No dependencies.
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

  // Search and a small set of filters operate on published notes only.
  const search = document.getElementById('note-search');
  if (search) {
    const state = { q: '', track: '', area: '', format: '' };
    const facets = [...document.querySelectorAll('.facet')];
    const cards = [...document.querySelectorAll('#note-results .note-card')];
    const counter = document.getElementById('result-count');
    const active = document.getElementById('active-filters');
    const clear = document.getElementById('clear-filters');
    const apply = () => {
      const words = state.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      for (const card of cards) {
        const ok = ['track', 'area', 'format'].every((key) => !state[key] || card.dataset[key] === state[key]) && words.every((w) => card.dataset.text.includes(w));
        card.hidden = !ok;
        if (ok) shown++;
      }
      counter.textContent = (shown === 1 ? counter.dataset.one : counter.dataset.many).replace(/\d+/, shown);
      document.getElementById('notes-empty').hidden = shown > 0;
      const on = facets.filter((f) => state[f.dataset.facet] === f.dataset.value);
      for (const f of facets) f.setAttribute('aria-pressed', String(on.includes(f)));
      active.replaceChildren(...on.map((f) => Object.assign(document.createElement('span'), { className: 'active-chip', textContent: f.textContent })));
      clear.hidden = !state.q && !on.length;
    };
    for (const f of facets) f.addEventListener('click', () => {
      const { facet, value } = f.dataset;
      state[facet] = state[facet] === value ? '' : value;
      if (facet === 'track') state.area = '';
      if (facet === 'area') state.track = '';
      apply();
    });
    clear.addEventListener('click', () => {
      Object.assign(state, { q: '', track: '', area: '', format: '' });
      search.value = ''; apply();
    });
    search.addEventListener('input', () => { state.q = search.value; apply(); });
    addEventListener('keydown', (e) => {
      const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === '/' && !editing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); search.focus(); }
      if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; state.q = ''; apply(); search.blur(); }
    });
  }

  const el = (tag, props = {}, ...kids) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...kids.filter(Boolean));
    return node;
  };

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
