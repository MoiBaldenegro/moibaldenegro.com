// Implementer 104: REQ-104-11 (CLS de carga limpia recorriendo la portada), REQ-104-12 (sin JS),
// REQ-104-13 (375, 1024 y reduced motion a 1280) y REQ-104-14 (margin-bottom 0 y alto del envoltorio).
// Uso: node checks.mjs <outdir> <port> <label>   (label: before | after; se guarda checks-<label>.json)
import { open, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const [out, port, label] = [process.argv[2], +process.argv[3], process.argv[4] || 'after'];
mkdirSync(out, { recursive: true });
const b = await open(process.env.PROF || '.', port);
const sum = (ls) => +ls.filter((e) => !e.input).reduce((a, e) => a + e.v, 0).toFixed(4);
const fresh = async (w, h) => { await b.vp(w, h); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', w, h); };
const BOX = `(() => { const s = document.querySelector('.latest-articles'), r = s.getBoundingClientRect(), l = s.querySelector('.latest-articles__list');
  return { docH: document.documentElement.scrollHeight, box: [r.x, r.y + scrollY, r.width, r.height].map(Math.round), mb: getComputedStyle(s).marginBottom,
    list: getComputedStyle(l).display, horizontal: s.classList.contains('latest-articles--horizontal'), pin: !!document.querySelector('.latest-articles--horizontal-pin') }; })()`;
const res = { label, clean: {}, nojs: {}, stacked: {} };
try {
  for (const [w, h] of [[375, 800], [768, 800], [1024, 800], [1280, 800], [1600, 900]]) {
    await fresh(w, h); const max = await b.ev('document.documentElement.scrollHeight - innerHeight');
    for (let i = 0; i <= 20; i++) { await b.ev(`window.scrollTo({ top: ${Math.round(max * i / 20)}, behavior: 'instant' })`); await sleep(150); }
    await sleep(1000); const ls = await b.ev('window.__ls'); res.clean[w] = { cls: sum(ls), entries: ls.length, max };
  }
  await fresh(1280, 800);
  res.req14 = await b.ev(`(() => { const w = document.querySelector('.latest-articles--horizontal-pin'), s = w.querySelector('.latest-articles');
    const c = s.querySelector('.latest-articles__card'), n = s.querySelectorAll('.latest-articles__card').length, g = parseFloat(getComputedStyle(s.querySelector('.latest-articles__list')).columnGap);
    const len = (n - 2) * (c.offsetWidth + g); return { mb: getComputedStyle(s).marginBottom, wrapH: w.offsetHeight, secH: s.offsetHeight, len, ok: Math.abs(w.offsetHeight - (s.offsetHeight + len)) <= 1 }; })()`);
  for (const [w, h] of [[375, 800], [1024, 800]]) { await fresh(w, h); res.stacked[w] = await b.ev(BOX); }
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await fresh(1280, 800); res.stacked['1280-reduce'] = await b.ev(BOX);
  await b.send('Emulation.setEmulatedMedia', { features: [] });
  await b.send('Emulation.setScriptExecutionDisabled', { value: true });
  for (const [w, h] of [[1280, 800], [1600, 900]]) { await fresh(w, h); res.nojs[w] = await b.ev(BOX); }
  await b.send('Emulation.setScriptExecutionDisabled', { value: false });
  res.logs = b.logs;
} finally { b.close(); }
writeFileSync(`${out}/checks-${label}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ clean: res.clean, req14: res.req14, stacked: res.stacked, nojs: res.nojs, logs: res.logs.length }));
