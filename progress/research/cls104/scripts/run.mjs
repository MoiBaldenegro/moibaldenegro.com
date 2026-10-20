// Casos: clean, reload-bottom, reload-mid, back-bottom, back-mid a W×H. Uso: node run.mjs <outdir> <port> <W> <H>
import { open, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const [out, port, W, H] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5]];
mkdirSync(out, { recursive: true });
const b = await open(process.env.PROF || '.', port);
const sum = (ls) => +ls.filter((e) => !e.input).reduce((a, e) => a + e.v, 0).toFixed(4);
const geo = () => b.ev(`(() => { const wr = document.querySelector('.latest-articles--horizontal-pin'); if (!wr) return null; const s = wr.querySelector('.latest-articles');
  return { start: Math.round(wr.getBoundingClientRect().top + scrollY), len: wr.offsetHeight - s.offsetHeight, max: document.documentElement.scrollHeight - innerHeight }; })()`);
const state = () => b.ev(`({ y: Math.round(scrollY), docH: document.documentElement.scrollHeight, pin: !!document.querySelector('.latest-articles--horizontal-pin'), cards: document.querySelectorAll('.latest-articles__card').length,
  sr: history.scrollRestoration, ops: [...document.querySelectorAll('.latest-articles__card')].map((c) => +(+getComputedStyle(c).opacity).toFixed(2)) })`);
const res = { W, H, cases: {} };
try {
  await b.load('/', W, H); await sleep(1500);
  res.clean = { cls: sum(await b.ev('window.__ls')), entries: await b.ev('window.__ls'), state: await state() };
  const g = await geo(); res.geo = g;
  const targets = { bottom: g.max, mid: g.start + Math.round(g.len / 2) };
  for (const [name, y] of Object.entries(targets)) {
    await b.load('/', W, H); await b.ev(`window.scrollTo({ top: ${y}, behavior: 'instant' })`); await sleep(1500);
    const before = await state();
    await b.send('Page.reload'); await b.ready(); await sleep(3000);
    const ls = await b.ev('window.__ls');
    res.cases[`reload-${name}`] = { target: y, before, after: await state(), cls: sum(ls), entries: ls };
    await b.shot(`${out}/reload-${name}-${W}.png`);
  }
  for (const [name, y] of Object.entries(targets)) {
    await b.load('/', W, H); await b.ev(`window.scrollTo({ top: ${y}, behavior: 'instant' })`); await sleep(1500);
    const before = await state();
    const href = await b.ev(`(() => { const a = [...document.querySelectorAll('a[href^="/posts/"]')][0]; a.click(); return a.getAttribute('href'); })()`);
    await sleep(2500);
    const post = await b.ev('location.pathname');
    await b.ev('window.__ls = [], true');
    await b.ev('history.back(), true'); await sleep(3500);
    const ls = await b.ev('window.__ls');
    res.cases[`back-${name}`] = { target: y, before, href, post, path: await b.ev('location.pathname'), after: await state(), cls: sum(ls), entries: ls };
    await b.shot(`${out}/back-${name}-${W}.png`);
  }
  res.logs = b.logs;
} finally { b.close(); }
writeFileSync(`${out}/cls-${W}x${H}.json`, JSON.stringify(res, null, 1));
console.log(W, H, 'clean', res.clean.cls, Object.entries(res.cases).map(([k, v]) => `${k}=${v.cls} (y ${v.before.y}->${v.after.y})`).join(' | '), 'logs', res.logs.length);
