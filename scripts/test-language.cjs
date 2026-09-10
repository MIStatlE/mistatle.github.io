// No browser or DOM is used. Optional component tests use React's test renderer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const L = require('../public/site-language.js');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'public/data/editorial.json')));
const resources = JSON.parse(fs.readFileSync(path.join(root, 'public/data/latex_templates.json')));
const db = {editorial: catalog, tools: {general: [], latex: resources}};
const before = JSON.stringify(db);
const zh = L.localizeDB(db, 'zh'), en = L.localizeDB(db, 'en');
const entry = code => (code === 'en' ? en : zh).editorial.entries.find(v => v.id === 'deep-exploration');
assert.match(entry('en').filePath, /deep-exploration\.en\.md$/);
assert.match(entry('zh').filePath, /deep-exploration\.md$/);
assert.match(entry('en').formats.pdf.path, /note-en\.pdf$/);
assert.equal(entry('en').translationMissing, false);
assert.equal(L.pathFor(catalog.entries, entry('zh').filePath, 'en'), entry('en').filePath);
assert.equal(L.pathFor(catalog.entries, entry('en').filePath, 'zh'), entry('zh').filePath);
const old = en.editorial.entries.find(v => v.id === 'typical-set');
assert.equal(old.contentLanguage, 'zh');
assert.equal(old.translationMissing, true);
assert.equal(L.pathFor(catalog.entries, old.filePath, 'en'), old.filePath);
assert.equal(L.pathFor(catalog.entries, 'unlisted.md', 'en'), 'unlisted.md');
assert.equal(JSON.stringify(db), before, 'Localizing must not mutate the source catalog');
let stored = 'en';
const storage = {getItem: () => stored, setItem: (_, v) => stored = v};
assert.equal(L.detect({search: '?lang=zh'}, storage), 'zh', 'Explicit URL beats preference');
assert.equal(L.detect({search: ''}, storage), 'en');
L.remember('zh', storage); assert.equal(stored, 'zh');
assert.doesNotThrow(() => L.remember('en', {setItem() {throw Error('disabled')}}));
assert.equal(L.detect({search: ''}, {getItem() {throw Error('disabled')}}), 'zh');
assert.equal(L.detect({search: '?lang=other'}, {getItem: () => 'other'}), 'zh');
assert.equal(L.url('/?ref=note#/writing/read/a.md', 'en'), '/?ref=note&lang=en#/writing/read/a.md');
assert.equal(L.url('/writing/deep-exploration/?lang=en#reference', 'zh'), '/writing/deep-exploration/?lang=zh#reference');
for (const edition of [zh, en]) for (const v of edition.editorial.entries) {
  for (const f of Object.values(v.formats)) if (f.path) assert.ok(fs.statSync(path.join(root, f.path)).isFile());
}
console.log('PASS: locale precedence, disabled storage, URL preservation, paired article/PDF routing, explicit legacy fallback, immutable metadata, local targets');

async function componentTests() {
  if (!process.env.MISTATLE_TEST_REACT || !process.env.MISTATLE_TEST_TYPESCRIPT) {
    console.log('Component tests not run (provide MISTATLE_TEST_REACT and MISTATLE_TEST_TYPESCRIPT).');
    return;
  }
  const React = require(path.join(process.env.MISTATLE_TEST_REACT, 'react'));
  const renderer = require(path.join(process.env.MISTATLE_TEST_REACT, 'react-test-renderer'));
  const ts = require(process.env.MISTATLE_TEST_TYPESCRIPT);
  const {act} = renderer;
  let current = new URL('http://localhost/?lang=zh');
  const listeners = new Map(), history = [current.href]; let position = 0;
  const dispatch = event => { for (const fn of listeners.get(event) || []) fn(); };
  const win = {
    SiteLanguage: L, localStorage: storage, scrollTo() {}, matchMedia: () => ({matches:true}),
    addEventListener(event, fn) { if (!listeners.has(event)) listeners.set(event,new Set()); listeners.get(event).add(fn); },
    removeEventListener(event, fn) { listeners.get(event)?.delete(fn); },
    history: {
      pushState(_, __, href) { current = new URL(href, current); history.splice(++position); history.push(current.href); },
      replaceState(_, __, href) { current = new URL(href, current); history[position] = current.href; },
      back() { if (position) { current = new URL(history[--position]); dispatch('popstate'); } }
    }
  };
  win.location = {};
  for (const field of ['href','pathname','search','hash']) Object.defineProperty(win.location, field, {
    get: () => current[field], set(value) {
      if (current[field] === value) return;
      current[field] = value;
      history.splice(++position); history.push(current.href);
      dispatch('hashchange');
    }
  });
  const document = {documentElement: {lang: ''}, title: '', getElementById: () => ({})};
  const fetches = [];
  const fetch = async url => {
    fetches.push(url);
    if (url.endsWith('.json')) return {ok:true, json:async () => JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))};
    // Keep article loads pending: tests cover navigation, not the DOM math renderer.
    return new Promise(() => {});
  };
  const context = vm.createContext({React, ReactDOM: {createRoot: () => ({render(){}})}, window: win,
    document, SiteLanguage: L, fetch, URL, URLSearchParams, console, setTimeout, clearTimeout, setInterval, clearInterval});
  // The helper must capture the same window as App, including its localStorage.
  vm.runInContext(fs.readFileSync(path.join(root, 'public/site-language.js'), 'utf8'), context);
  context.SiteLanguage = win.SiteLanguage;
  const source = fs.readFileSync(path.join(root, 'index.html'),'utf8').match(/<script type="text\/babel">([\s\S]*?)<\/script>/)[1];
  const js = ts.transpileModule(source + '\nglobalThis.testComponents = {App, Collections, ArticleReader, HomeV2, Tools, About};',
    {fileName:'site.tsx', compilerOptions:{jsx:ts.JsxEmit.React, target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext(js, context);
  let tree;
  await act(async () => { tree = renderer.create(React.createElement(context.testComponents.App)); });
  const text = () => JSON.stringify(tree.toJSON());
  const button = label => tree.root.findAllByType('button').find(b => b.children.includes(label));
  assert.ok(button('English'));
  await act(async () => { button('English').props.onClick(); });
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(current.search, '?lang=en');
  assert.equal(stored, 'en');
  assert.match(text(), /Recent writing/);
  assert.doesNotMatch(text(), /近期写作/);
  assert.match(text(), /Chinese only/);
  await act(async () => { tree.root.findByType(context.testComponents.HomeV2).props.setActiveTab('writing'); });
  assert.match(text(), /Probability, information, and concentration/);
  assert.match(text(), /Sequential decision-making and exploration/);
  // Select a collection, then switch without losing that collection.
  let collections = tree.root.findByType(context.testComponents.Collections);
  const panel = collections.findAllByProps({role:'button'}).find(p =>
    p.findAllByType('h2').some(h => h.children.join('') === 'Sequential decision-making and exploration'));
  await act(async () => { panel.props.onClick(); });
  await act(async () => { button('中文').props.onClick(); });
  assert.match(text(), /从 Bandit 到 RL/);
  await act(async () => { button('English').props.onClick(); });
  assert.match(text(), /Why random actions are not enough/);
  collections = tree.root.findByType(context.testComponents.Collections);
  await act(async () => { collections.props.onRead(entry('en')); });
  assert.match(tree.root.findByType(context.testComponents.ArticleReader).props.item.filePath, /\.en\.md$/);
  await act(async () => { button('中文').props.onClick(); });
  assert.equal(document.documentElement.lang, 'zh-CN');
  assert.match(tree.root.findByType(context.testComponents.ArticleReader).props.item.filePath, /deep-exploration\.md$/);
  assert.equal(current.search, '?lang=zh');
  assert.ok(!current.hash.includes('.en.md'));
  await act(async () => { win.history.back(); });
  assert.equal(document.documentElement.lang, 'en');
  assert.match(tree.root.findByType(context.testComponents.ArticleReader).props.item.filePath, /\.en\.md$/);
  await act(async () => { tree.unmount(); });
  await act(async () => { tree = renderer.create(React.createElement(context.testComponents.App)); });
  assert.match(tree.root.findByType(context.testComponents.ArticleReader).props.item.filePath, /\.en\.md$/, 'Reload retains language/article');
  assert.ok(fetches.some(p => p.endsWith('deep-exploration.en.md')));
  assert.ok(fetches.some(p => p.endsWith('deep-exploration.md')));
  await act(async () => { tree.root.findByType(context.testComponents.ArticleReader).props.onBack(); });
  await act(async () => { button('Resources').props.onClick(); });
  assert.match(text(), /Templates, code/);
  assert.doesNotMatch(text(), /资源正在整理/);
  await act(async () => { button('About').props.onClick(); });
  assert.match(text(), /These notes change as my understanding develops/);
  assert.doesNotMatch(text(), /你好，我是/);
  await act(async () => { tree.unmount(); });
  current = new URL('http://localhost/#/writing');
  history[position] = current.href;
  await act(async () => { tree = renderer.create(React.createElement(context.testComponents.App)); });
  assert.equal(document.documentElement.lang, 'en', 'Fresh visit without a language URL restores the saved preference');
  assert.equal(current.search, '?lang=en');
  await act(async () => { tree.unmount(); });
  console.log('PASS: React 18 component callbacks, homepage/catalog/resources/about copy, paired article switch, back history, remount/reload, matching fetch paths. Browser layout and article math rendering not exercised.');
}
componentTests().catch(error => { console.error(error); process.exitCode = 1; });
