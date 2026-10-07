// Markdown → HTML with build-time KaTeX and syntax highlighting.
import { Marked } from 'marked';
import katex from 'katex';
import hljs from 'highlight.js';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OPEN = '', CLOSE = '';
const PLACEHOLDER = new RegExp(`${OPEN}([DI])(\\d+)${CLOSE}`, 'g');

// Pull math out before Markdown sees it, so `_`, `*` and `\\` inside formulas survive.
function protectMath(src, store) {
  const CODE = /(^ {0,3}(?:```|~~~)[\s\S]*?^ {0,3}(?:```|~~~)[ \t]*$|`[^`\n]+`)/m;
  const keep = (tex, display) => {
    store.push({ tex: tex.replace(/^[ \t]*>[ \t]?/gm, '').trim(), display });
    return `${OPEN}${display ? 'D' : 'I'}${store.length - 1}${CLOSE}`;
  };
  return src
    .split(CODE)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/(?<!\\)\$\$([\s\S]+?)\$\$/g, (_, tex) => keep(tex, true))
            .replace(/(?<![\\$\w])\$(?!\s)((?:\\.|[^$\\\n])+?)(?<!\s)\$(?!\d)/g, (_, tex) => keep(tex, false))
            // CommonMark refuses `**粗体（括号）**后文` because of its flanking rules; CJK prose needs it.
            .replace(/(?<![\\*])\*\*(?![\s*])([^*\n]+?)(?<![\s*])\*\*(?!\*)/g, '<strong>$1</strong>'),
    )
    .join('');
}

function renderMath(html, store, warn) {
  const render = (_, kind, n) => {
    const { tex, display } = store[+n];
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore' });
    } catch (err) {
      warn(`KaTeX: ${err.message.split('\n')[0]}`);
      return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' });
    }
  };
  return html
    .replace(new RegExp(`<p>\\s*(${OPEN}D\\d+${CLOSE})\\s*</p>`, 'g'), '<div class="eq">$1</div>')
    .replace(PLACEHOLDER, render);
}

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(PLACEHOLDER, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const CALLOUT_KINDS = [
  [/^(定义|定理|引理|命题|推论|假设|Definition|Theorem|Lemma|Proposition|Corollary|Assumption)/i, 'theorem'],
  [/^(证明|Proof)/i, 'proof'],
];

function markCallouts(html) {
  return html.replace(/<blockquote>\s*<p><strong>([^<]+)<\/strong>/g, (_, label) => {
    const kind = (CALLOUT_KINDS.find(([re]) => re.test(label.trim())) || [, 'note'])[1];
    const clean = label.trim().replace(/[：:]$/, '');
    return `<blockquote class="callout callout-${kind}"><p><strong class="callout-label">${clean}</strong>`;
  });
}

// Footnotes: `[^id]` in the text, `[^id]: explanation` on its own line.
function extractFootnotes(src) {
  const CODE = /(^ {0,3}(?:```|~~~)[\s\S]*?^ {0,3}(?:```|~~~)[ \t]*$)/m;
  const defs = new Map();
  const parts = src.split(CODE).map((part, i) =>
    i % 2 ? part : part.replace(/^\[\^([^\]\s]+)\]:[ \t]+(.+(?:\n(?!\[\^|\s*\n).+)*)\n?/gm, (_, id, text) => (defs.set(id, text.trim()), '')),
  );
  if (!defs.size) return { src, notes: [] };
  const order = [];
  const body = parts
    .map((part, i) =>
      i % 2
        ? part
        : part.replace(/\[\^([^\]\s]+)\]/g, (m, id) => {
            if (!defs.has(id)) return m;
            const first = !order.includes(id);
            if (first) order.push(id);
            const n = order.indexOf(id) + 1;
            return `<sup class="fn-ref"><a href="#fn-${n}"${first ? ` id="fnref-${n}"` : ''} aria-describedby="fn-${n}">${n}</a></sup>`;
          }),
    )
    .join('');
  return { src: body, notes: order.map((id) => defs.get(id)) };
}

export function renderMarkdown(source, { warn = () => {}, footnotesLabel = 'Footnotes' } = {}) {
  const { src, notes } = extractFootnotes(source);
  const store = [];
  const levels = (src.replace(/^ {0,3}(```|~~~)[\s\S]*?^ {0,3}\1[ \t]*$/gm, '').match(/^#{1,6}(?=\s)/gm) || []).map((h) => h.length);
  const shift = levels.length ? 2 - Math.min(...levels) : 0;
  const toc = [];
  const used = new Map();

  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth: raw }) {
        const depth = Math.min(6, Math.max(2, raw + shift));
        const inner = this.parser.parseInline(tokens);
        let id = slugify(inner) || `section-${toc.length + 1}`;
        const n = used.get(id) || 0;
        used.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        toc.push({ depth, id, html: inner.replace(/<a [^>]*>|<\/a>/g, '') });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`;
      },
      code({ text, lang }) {
        const language = (lang || '').trim().split(/\s+/)[0];
        const known = language && hljs.getLanguage(language);
        const body = known ? hljs.highlight(text, { language }).value : esc(text);
        const label = language ? ` data-lang="${esc(language)}"` : '';
        return `<pre class="code"${label}><code>${body}</code></pre>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        const attrs = external ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${attrs}>${inner}</a>`;
      },
      image({ href, title, text }) {
        return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`;
      },
    },
  });

  let html = marked.parse(protectMath(src, store));
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = markCallouts(html);
  if (notes.length) {
    const items = notes.map((text, i) => `<li id="fn-${i + 1}">${marked.parseInline(protectMath(text, store))} <a class="fn-back" href="#fnref-${i + 1}" aria-label="↩">↩</a></li>`);
    html += `<section class="footnotes"><h2>${esc(footnotesLabel)}</h2><ol>${items.join('')}</ol></section>\n`;
  }
  html = html.replace(/<p>(<img [^>]+>)<\/p>/g, '<figure class="zoomable">$1</figure>');
  html = renderMath(html, store, warn);

  for (const item of toc) item.html = renderMath(item.html, store, () => {});
  const plain = source.replace(/```[\s\S]*?```/g, '').replace(/\$\$[\s\S]*?\$\$/g, '');
  const cjk = (plain.match(/[一-鿿]/g) || []).length;
  const words = (plain.replace(/[一-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;

  return { html, toc, hasMath: store.length > 0, minutes: Math.max(1, Math.round(cjk / 400 + words / 220)) };
}
