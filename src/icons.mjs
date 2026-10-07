// Inline SVG icons. Platform marks are the site's own drawings, carried over from the previous version.
const svg = (body, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const line = (body, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  youtube: svg(`<path d="M21.3 8.2c-.2-1-.98-1.8-1.98-2-1.75-.45-7.32-.45-7.32-.45s-5.57 0-7.32.46c-1 .2-1.78 1-1.98 2C2.25 9.98 2.25 12 2.25 12s0 2.02.45 3.8c.2 1 .98 1.8 1.98 2 1.75.45 7.32.45 7.32.45s5.57 0 7.32-.46c1-.2 1.78-1 1.98-2 .45-1.78.45-3.8.45-3.8s0-2.02-.45-3.79Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m10.2 14.95 4.65-2.95-4.65-2.95v5.9Z" fill="currentColor"/>`),
  github: svg(`<path d="M12 3.35a8.65 8.65 0 0 0-2.74 16.86c.43.08.58-.18.58-.42 0-.2-.01-.9-.01-1.64-2.14.39-2.7-.52-2.88-1-.1-.26-.51-1.05-.87-1.26-.3-.16-.72-.56-.01-.57.67-.01 1.15.62 1.31.88.77 1.3 2.01.93 2.5.71.08-.56.3-.93.55-1.15-1.9-.22-3.88-.95-3.88-4.2 0-.93.33-1.7.88-2.3-.09-.21-.39-1.1.08-2.28 0 0 .72-.23 2.36.88a8.14 8.14 0 0 1 4.3 0c1.64-1.12 2.36-.88 2.36-.88.47 1.18.17 2.07.08 2.28.55.6.88 1.36.88 2.3 0 3.26-1.99 3.98-3.89 4.19.31.27.58.78.58 1.58 0 1.14-.01 2.05-.01 2.34 0 .23.15.5.58.42A8.65 8.65 0 0 0 12 3.35Z" fill="currentColor"/>`),
  xiaohongshu: svg(`<rect x="3.6" y="4.2" width="16.8" height="15.6" rx="4.8" fill="currentColor" opacity="0.1"/><rect x="3.6" y="4.2" width="16.8" height="15.6" rx="4.8" fill="none" stroke="currentColor" stroke-width="1.35"/><text x="12" y="14.2" text-anchor="middle" font-size="6.25" font-weight="700" fill="currentColor" font-family="ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif">RED</text>`),
  zhihu: svg(`<text x="12" y="12.6" text-anchor="middle" font-size="7.2" font-weight="700" fill="currentColor" font-family="'PingFang SC','Noto Sans CJK SC','Hiragino Sans GB','Microsoft YaHei',sans-serif">知乎</text><path d="M5.15 16.95h13.7" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/>`),
  douyin: line(`<circle cx="8" cy="18" r="3"/><path d="M11 18V4c1 3 3 5 6 5.2"/>`),
  email: line(`<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/>`),
  rss: line(`<path d="M5 11a8 8 0 0 1 8 8"/><path d="M5 5a14 14 0 0 1 14 14"/><circle cx="5.6" cy="18.4" r="1.2" fill="currentColor" stroke="none"/>`),
  sun: line(`<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>`, 18),
  moon: line(`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/>`, 18),
  globe: line(`<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5S9.4 5.900 12 3.5Z"/>`, 16),
  link: line(`<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>`, 16),
  search: line(`<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>`, 18),
  download: line(`<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14"/>`, 16),
};
