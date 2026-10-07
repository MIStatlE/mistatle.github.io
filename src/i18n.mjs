// Interface text for both languages. Content text lives in content/*.json and the Markdown files.
export const LANGS = ['zh', 'en'];
export const BASE = { zh: '', en: '/en' };
export const HTML_LANG = { zh: 'zh-CN', en: 'en' };

// Values written as { zh, en } pick the current language; anything else passes through.
export const pick = (v, lang) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || 'en' in v) ? (v[lang] ?? v.zh ?? v.en) : v;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const formatDate = (iso, lang) => {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : `${MONTHS[m - 1]} ${d}, ${y}`;
};

export const UI = {
  zh: {
    skip: '跳到正文', mainNav: '主导航', searchSite: '搜索', searchPlaceholder: '搜索笔记、概念、论文、资源', searchNone: '没有找到，换个词试试。', searchKeys: ['选择', '打开', '关闭'],
    kindNote: '笔记', kindConcept: '概念', kindPlanned: '待写', kindPaper: '论文', kindResource: '资源', home: '首页', switchTo: 'EN', switchLabel: 'Read this page in English', theme: '切换深浅色', top: '回到顶部',
    nav: { notes: '笔记', resources: '资源', about: '关于' },
    explore: 'EXPLORE WRITING', resources: 'RESOURCES', elsewhere: 'ELSEWHERE:', notYet: '暂未开通',
    latest: '最新笔记', allNotes: (n) => `全部 ${n} 篇`, mapTitle: '知识地图', mapMore: '进入笔记与地图',
    read: '阅读', minutes: (n) => `约 ${n} 分钟`, updated: (d) => `更新于 ${d}`, pdf: 'PDF 版本',
    notesLede: '笔记、论文和它们之间的关系放在同一个地方：先看地图找到位置，再往下按学科浏览。',
    allSubjects: '全部', subjects: '学科',
    byPapers: '论文', foldRelations: '关系一览', foldRoadmap: '写作计划', resourcesLede: '写作和学习中积累下来的可复用材料：模板、工具和延伸阅读。', backResources: '← 全部资源', download: '下载', open: '打开',
    search: '搜索标题或摘要', byTopic: '按学科', byTime: '按时间', 
    clear: '清除筛选',
    count: (n) => `${n} 条`, empty: '这里还没有内容，换一个学科或关键词试试。', emptyPlanned: '这个学科还没有笔记。地图上计划写：', lastUpdated: (d) => `最近更新 ${d}`, overview: '站点概览',
    stats: { notes: '篇笔记', nodes: '个地图节点已写', papers: '篇论文', resources: '份资源' }, outlineHint: '点一个概念查看它的说明和关系',
    backNotes: '← 全部笔记', backTemplates: '← 全部模板', toc: '目录', inTopic: '所属专题', inMap: '在知识地图中',
    before: '← 前置与来源', after: '后续与相关 →', planned: '待写', viewMap: '在知识地图中查看',
    feedback: '内容会随理解继续修改。发现错误或有不同看法，欢迎来信', older: '← 更早', newer: '更新 →',
    onlyOther: '这篇内容目前只有英文版，下面显示的是英文原文。', comments: '讨论',
    mapLede: '已发布的笔记和接下来要写的内容放在同一张图里。三层分别是三条主线；连线标明两件事之间是什么关系。点任意节点看它的说明和全部关系。',
    mapHint: '点一个节点，这里会显示它的说明，以及它和其他节点之间的关系。', mapScroll: '← 左右滑动查看全图 →',
    written: '已写', lit: (a, b) => `${a} / ${b} 已点亮`, relLegend: '关系', typeLegend: '节点', readNote: '阅读这篇笔记',
    relations: '关系一览', relationsLede: '地图里的每一条连线，用一句话说明。', roadmap: '写作计划', after2: (s) => `接在「${s}」之后`,
    papersTitle: '论文', papersLede: '读过、在读和打算读的论文。写了笔记的会链接到对应笔记。',
    status: { noted: '已写笔记', read: '已读', reading: '在读', queued: '待读' }, toNote: '读笔记', toPaper: '原文',
    templatesLede: '本站笔记与讲义使用的 XeLaTeX 模板，可直接下载源文件。', preview: '页面预览',
    aboutHello: '你好，我是', interests: '当前关注', contact: 'Email',
    about: [
      '这里整理我在学习、研究与技术写作中真正读过、推过或做过的内容。',
      '主题从数学与学习理论出发，也延伸到强化学习、算法与实现。我不会把它写成知识大全；一篇内容通常只回答一个具体问题，并尽量交代必要背景、关键推导和结论边界。',
      '内容会随着理解继续修改。如果某篇笔记对你有帮助，或你发现了错误，欢迎告诉我。',
    ],
    notFound: '这个页面<em>发散</em>了', notFoundLede: '链接可能已经变更。可以从 <a href="/notes/">全部笔记</a> 重新找起。',
    footnotes: '脚注',
  },
  en: {
    skip: 'Skip to content', mainNav: 'Main', searchSite: 'Search', searchPlaceholder: 'Search notes, concepts, papers, resources', searchNone: 'Nothing found. Try another word.', searchKeys: ['select', 'open', 'close'],
    kindNote: 'Note', kindConcept: 'Concept', kindPlanned: 'Planned', kindPaper: 'Paper', kindResource: 'Resource', home: 'Home', switchTo: '中文', switchLabel: '阅读本页的中文版', theme: 'Toggle light and dark', top: 'Back to top',
    nav: { notes: 'Notes', resources: 'Resources', about: 'About' },
    explore: 'EXPLORE WRITING', resources: 'RESOURCES', elsewhere: 'ELSEWHERE:', notYet: 'not available yet',
    latest: 'Latest notes', allNotes: (n) => `All ${n} notes`, mapTitle: 'Knowledge map', mapMore: 'Open notes and map',
    read: 'Read', minutes: (n) => `${n} min read`, updated: (d) => `Updated ${d}`, pdf: 'PDF version',
    notesLede: 'Notes, papers and how they relate, in one place: find your bearings on the map, then browse by subject below.',
    allSubjects: 'All', subjects: 'Subjects',
    byPapers: 'Papers', foldRelations: 'Relations in words', foldRoadmap: 'Roadmap', resourcesLede: 'Reusable material collected while writing and studying: templates, tools and further reading.', backResources: '← All resources', download: 'Download', open: 'Open',
    search: 'Search titles or summaries', byTopic: 'By subject', byTime: 'By date', 
    clear: 'Clear filters',
    count: (n) => `${n} ${n === 1 ? 'item' : 'items'}`, empty: 'Nothing here yet. Try another subject or keyword.', emptyPlanned: 'No notes in this subject yet. Planned on the map: ', lastUpdated: (d) => `Last updated ${d}`, overview: 'This site at a glance',
    stats: { notes: 'notes', nodes: 'map nodes written', papers: 'papers', resources: 'resources' }, outlineHint: 'Select a concept to see its summary and relations',
    backNotes: '← All notes', backTemplates: '← All templates', toc: 'Contents', inTopic: 'Part of', inMap: 'On the knowledge map',
    before: '← Builds on', after: 'Leads to →', planned: 'planned', viewMap: 'See it on the knowledge map',
    feedback: 'Notes are revised as my understanding improves. Found a mistake or see it differently? Write to', older: '← Older', newer: 'Newer →',
    onlyOther: 'This page is only available in Chinese for now. The Chinese original is shown below.', comments: 'Discussion',
    mapLede: 'Published notes and what comes next, on one map. The three layers are the three tracks; every link says what kind of relation it is. Select any node to see its summary and all of its relations.',
    mapHint: 'Select a node to see its summary and how it relates to the others.', mapScroll: '← scroll sideways to see the whole map →',
    written: 'written', lit: (a, b) => `${a} / ${b} written`, relLegend: 'Relations', typeLegend: 'Nodes', readNote: 'Read this note',
    relations: 'Relations in words', relationsLede: 'Every link on the map, explained in one sentence.', roadmap: 'Roadmap', after2: (s) => `after “${s}”`,
    papersTitle: 'Papers', papersLede: 'Papers I have read, am reading, or plan to read. Those with notes link to them.',
    status: { noted: 'Note written', read: 'Read', reading: 'Reading', queued: 'To read' }, toNote: 'Read the note', toPaper: 'Paper',
    templatesLede: 'The XeLaTeX templates used for the notes and lecture notes on this site, with source files to download.', preview: 'Page previews',
    aboutHello: 'Hi, I am', interests: 'Current interests', contact: 'Email',
    about: [
      'This site collects what I have actually read, derived or built while studying, doing research and writing about technical topics.',
      'The topics start from mathematics and learning theory and extend to reinforcement learning, algorithms and implementation. It is not meant to be an encyclopedia: a note usually answers one specific question and tries to give the necessary background, the key derivation and the limits of the conclusion.',
      'Notes are revised as my understanding improves. If one of them helped you, or you spotted a mistake, I would like to hear about it.',
    ],
    notFound: 'This page <em>diverged</em>', notFoundLede: 'The link may have changed. Start again from <a href="/en/notes/">all notes</a>.',
    footnotes: 'Footnotes',
  },
};
