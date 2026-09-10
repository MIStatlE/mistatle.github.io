/* Shared by the existing React site and standalone article editions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SiteLanguage = api;
})(typeof window !== 'undefined' ? window : null, function () {
  const key = 'mistatle-language';
  const valid = value => value === 'zh' || value === 'en';
  const messages = {
    writing: ['写作', 'Writing'], resources: ['资源', 'Resources'], about: ['关于', 'About'],
    home: ['回到首页', 'Go to home'], openMenu: ['展开菜单', 'Open menu'], closeMenu: ['关闭菜单', 'Close menu'],
    language: ['网站语言', 'Site language'], explore: ['阅读笔记', 'Explore writing'],
    elsewhere: ['其他平台', 'Elsewhere'], recent: ['近期写作', 'Recent writing'],
    recentDesc: ['关于高维概率、策略优化与表示学习。', 'On high-dimensional probability, policy optimization, and representation learning.'],
    topics: ['专题', 'Topics'], topicsDesc: ['围绕概率与信息、策略优化、生成模型与世界模型展开的系列内容。', 'Notes on probability and information, policy optimization, generative models, and world models.'],
    topicCount: ['个专题', 'topics'], noteCount: ['篇笔记', 'notes'], entryCount: ['篇内容', 'entries'],
    read: ['阅读', 'Read'], article: ['正文', 'Article'], pdf: ['PDF', 'PDF'], video: ['视频', 'Video'],
    backWriting: ['返回写作', 'Back to writing'], backList: ['返回列表', 'Back to list'],
    loading: ['加载中…', 'Loading…'], error: ['加载失败', 'Could not load article'],
    also: ['其他格式', 'Also available'], articleIndex: ['本文目录', 'Article index'],
    collection: ['专题', 'Collection'], courseIndex: ['课程目录', 'Course index'],
    previous: ['上一篇', 'Previous'], next: ['下一篇', 'Next'],
    chineseOnly: ['仅中文版', 'Chinese only'], englishOnly: ['仅英文版', 'English only'],
    missingEnglish: ['英文版尚未完成，当前显示中文原文。', 'An English edition is not available yet. The Chinese original is shown below.'],
    missingChinese: ['中文版尚未完成，当前显示英文原文。', 'A Chinese edition is not available yet. The English original is shown below.'],
    resourcesTitle: ['模板、代码与工具', 'Templates, code & tools'],
    resourcesDesc: ['可以直接阅读、下载或复用的 LaTeX 模板、代码、PDF 与小型工具。', 'LaTeX templates, code, PDFs, and small tools to read, download, or reuse.'],
    resourceCount: ['份资源', 'resources'], latex: ['LaTeX 模板', 'LaTeX templates'], utilities: ['代码与工具', 'Code & utilities'],
    openResource: ['查看资源', 'Open resource'], openTool: ['打开工具', 'Open tool'],
    preparing: ['资源正在整理中。', 'Resources are being prepared.'], previews: ['张预览', 'previews'],
    aboutDesc: ['关于数学、学习理论、强化学习与算法的个人网站。', 'A personal site about mathematics, learning theory, reinforcement learning, and algorithms.'],
    aboutIntro: ['你好，我是 MIStatlE。这里整理我在学习、研究与技术写作中真正读过、推过或做过的内容。', 'Hi, I’m MIStatlE. This site brings together material I have read, worked through, or built in my learning, research, and technical writing.'],
    aboutBody: ['主题从数学与学习理论出发，也延伸到强化学习、算法与实现。我不会把它写成知识大全；一篇内容通常只回答一个具体问题，并尽量交代必要背景、关键推导和结论边界。', 'The topics begin with mathematics and learning theory and extend to reinforcement learning, algorithms, and implementation. This is not an encyclopedia: each piece usually answers one concrete question, with the background, key derivation, and limits needed to understand it.'],
    aboutEnd: ['内容会随着理解继续修改。如果某篇笔记对你有帮助，或你发现了错误，欢迎告诉我。', 'These notes change as my understanding develops. If a note helps you, or you find an error, I would be glad to hear from you.'],
    interests: ['目前关注', 'Current interests'], foundations: ['数学基础', 'Mathematical foundations'],
    learning: ['学习理论', 'Learning theory'], rl: ['强化学习', 'Reinforcement learning'], algorithms: ['算法', 'Algorithms'],
    email: ['邮箱', 'Email'], shanghai: ['上海', 'Shanghai'],
    principles: ['结构 · 机制 · 边界', 'Structure · Mechanism · Boundary'],
    defaultStatement: ['这里记录数学、算法与 AI 中值得反复理解的问题：结论依赖怎样的结构，方法为何有效，又在什么条件下失效。', 'Questions in mathematics, algorithms, and AI worth revisiting: what structure a result depends on, why a method works, and when it fails.']
  };
  function t(lang, name) { return (messages[name] || [name, name])[lang === 'en' ? 1 : 0]; }
  function detect(location, storage) {
    const explicit = new URLSearchParams(location.search || '').get('lang');
    if (valid(explicit)) return explicit;
    try { const saved = storage?.getItem(key); if (valid(saved)) return saved; } catch (_) {}
    return 'zh';
  }
  function remember(lang, storage) { if (valid(lang)) try { storage?.setItem(key, lang); } catch (_) {} }
  function url(href, lang, origin = 'https://mistatle.github.io') {
    const result = new URL(href, origin);
    result.searchParams.set('lang', valid(lang) ? lang : 'zh');
    return result.pathname + result.search + result.hash;
  }
  function storage() { try { return window.localStorage; } catch (_) { return null; } }
  function original(item) { return item?._original || item || {}; }
  function editions(item) {
    const base = original(item), source = base.language || 'zh';
    const {english, ...formats} = base.formats || {};
    if (base.filePath && !formats.article) formats.article = {path: base.filePath};
    return {[source]: formats, ...(base.editions || {})};
  }
  function localizeItem(item, lang) {
    const base = original(item), available = editions(base), source = base.language || 'zh';
    const selectedLang = available[lang]?.article?.path ? lang : source;
    const formats = Object.fromEntries(Object.entries(available[selectedLang] || {}).map(([kind, f]) =>
      [kind, {...f, label: ['article','pdf','video'].includes(kind) ? t(lang, kind) : f.label}]));
    return {...base, ...(base.i18n?.[lang] || {}), _original: base, formats,
      filePath: formats.article?.path || base.filePath, contentLanguage: selectedLang,
      translationMissing: selectedLang !== lang};
  }
  function localizeDB(db, lang) {
    const e = db.editorial || {}, p = e.positioning || {};
    const localized = {...e,
      positioning: {...p, statement: t(lang, 'defaultStatement'), ...(p.i18n?.[lang] || {}),
        principles: (p.principles || []).map(v => ({...v, ...(v.i18n?.[lang] || {})}))},
      tracks: (e.tracks || []).map(v => ({...v, titleZh: lang === 'en' ? v.title : v.titleZh})),
      collections: (e.collections || []).map(v => ({...v, ...(v.i18n?.[lang] || {})})),
      entries: (e.entries || []).map(v => localizeItem(v, lang))};
    return {...db, editorial: localized, tools: Object.fromEntries(Object.entries(db.tools || {}).map(([k, rows]) =>
      [k, (rows || []).map(v => localizeItem(v, lang))]))};
  }
  function pathFor(entries, filePath, lang) {
    const clean = p => (p || '').replace(/^\/?/, '');
    const entry = (entries || []).find(v => Object.values(editions(v)).some(e => clean(e.article?.path) === clean(filePath)));
    return entry ? localizeItem(entry, lang).filePath : filePath;
  }
  function initStatic() {
    const doc = window.document, articleLang = doc.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
    const explicit = new URLSearchParams(window.location.search).get('lang');
    const counterpart = valid(explicit) ? doc.querySelector(`a[data-language="${explicit}"]`) : null;
    if (valid(explicit) && explicit !== articleLang && counterpart) {
      window.location.replace(counterpart.href); return;
    }
    remember(articleLang, storage());
    for (const link of doc.querySelectorAll('a[data-language]')) {
      link.addEventListener('click', () => remember(link.dataset.language, storage()));
    }
  }
  return {key, valid, messages, t, detect, remember, storage, url, editions, localizeItem, localizeDB, pathFor, initStatic};
});
