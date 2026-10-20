// Traza por frame (rAF) de scrollY, alto del documento, envoltorio y top del footer en la recarga al fondo.
// Uso: node trace.mjs <out> <port> <W> <H>
import { open, sleep } from './lib.mjs';
import { writeFileSync } from 'node:fs';
const [out, port, W, H] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5]];
const b = await open(process.env.PROF || '.', port);
const TRACE = `(() => { window.__tr = []; const t0 = performance.now(); const tick = () => { const f = document.querySelector('.site-footer');
  window.__tr.push({ t: Math.round(performance.now() - t0), rs: document.readyState, y: Math.round(scrollY), docH: document.documentElement ? document.documentElement.scrollHeight : 0,
    wrap: !!document.querySelector('.latest-articles--horizontal-pin'), footTop: f ? Math.round(f.getBoundingClientRect().top) : null, sr: history.scrollRestoration, hs: history.state && history.state.scrollY });
  if (window.__tr.length < 120) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const orig = window.scrollTo.bind(window); window.scrollTo = (...a) => { window.__tr.push({ t: Math.round(performance.now() - t0), scrollTo: JSON.stringify(a), stack: new Error().stack.split('\\n').slice(2, 4).join(' | ') }); return orig(...a); }; })();`;
await b.send('Page.addScriptToEvaluateOnNewDocument', { source: TRACE });
const res = {};
try {
  // Alto del documento sin JS (layout apilado) a W×H.
  await b.send('Emulation.setScriptExecutionDisabled', { value: true });
  await b.load('/', W, H);
  res.noJs = await b.ev(`({ docH: document.documentElement.scrollHeight, footerDocTop: Math.round(document.querySelector('.site-footer').getBoundingClientRect().top + scrollY) })`);
  await b.send('Emulation.setScriptExecutionDisabled', { value: false });
  await b.load('/', W, H);
  res.js = await b.ev(`({ docH: document.documentElement.scrollHeight, footerDocTop: Math.round(document.querySelector('.site-footer').getBoundingClientRect().top + scrollY), max: document.documentElement.scrollHeight - innerHeight })`);
  await b.ev(`window.scrollTo({ top: ${res.js.max}, behavior: 'instant' })`); await sleep(1500);
  res.histBefore = await b.ev('JSON.stringify(history.state)');
  await b.send('Page.reload'); await b.ready(); await sleep(2500);
  res.trace = await b.ev('window.__tr');
  res.ls = await b.ev('window.__ls');
} finally { b.close(); }
writeFileSync(`${out}/trace-${W}x${H}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ noJs: res.noJs, js: res.js, hist: res.histBefore }));
for (const r of res.trace.slice(0, 40)) console.log(JSON.stringify(r));
console.log(JSON.stringify(res.ls));
