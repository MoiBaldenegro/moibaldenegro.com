// Feature 10 (REQ-10-10..15): recorrido con el ClientRouter (clic en enlaces, sin recarga).
// Uso: node run.mjs <outdir> <cdpPort> <label>   (BASE=http://localhost:4370 por defecto)
import { open, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const [out, port, label] = [process.argv[2], +process.argv[3], process.argv[4] || 'run'];
mkdirSync(out, { recursive: true });
// Contador inyectado: envuelve los manejadores de search:change del documento (solo los registra search-live.ts).
process.env.EXTRA_INIT = `(() => { if (window.__f10) return; const f = window.__f10 = { runs: 0, active: 0, adds: 0, removes: 0, docs: 0 };
  const map = new WeakMap(); const add = EventTarget.prototype.addEventListener; const rm = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (t, fn, o) { if (this === document && t === 'search:change') { const w = function (e) { f.runs++; return fn.call(this, e); }; map.set(fn, w); f.adds++; f.active++; return add.call(this, t, w, o); } return add.call(this, t, fn, o); };
  EventTarget.prototype.removeEventListener = function (t, fn, o) { if (this === document && t === 'search:change' && map.has(fn)) { f.removes++; f.active--; return rm.call(this, t, map.get(fn), o); } return rm.call(this, t, fn, o); };
  document.addEventListener('astro:page-load', () => { f.docs++; }); })();`;
const b = await open(process.env.PROF || '.', port);
const res = { label, steps: [], checks: {} };
const loads = () => b.ev('window.__f10.docs');
const click = async (sel) => { const before = await loads(); await b.ev(`document.querySelector(${JSON.stringify(sel)}).click(), true`);
  for (let i = 0; i < 60 && (await loads()) === before; i++) await sleep(100); await sleep(900); };
const state = () => b.ev(`({ path: location.pathname + location.search, title: document.title, nav: performance.getEntriesByType('navigation').length,
  hardLoads: window.__hard, items: document.querySelectorAll('.search-results [data-search-list] li').length,
  listHidden: document.querySelector('.search-results [data-search-list]')?.hidden ?? null, f10: { ...window.__f10 } })`);
const step = async (name, shot) => { const s = { name, ...(await state()) }; res.steps.push(s); if (shot) await b.shot(`${out}/${label}-${shot}.png`); return s; };
const submit = async (term) => { const before = await loads(); await b.ev(`(() => { const i = document.querySelector('[data-search-bar] input'); i.value = ${JSON.stringify(term)};
  i.form.requestSubmit(); return true; })()`); for (let i = 0; i < 60 && (await loads()) === before; i++) await sleep(100); await sleep(900); };
const NAV = (href) => `header a[href="${href}"]`;
try {
  await b.load('/', 1440, 900); await b.ev('window.__hard = 1, true');
  await step('home-1');
  const visits = { '/arquitectura': [], '/diseno-de-sistemas': [], '/search?q=': [] };
  for (let round = 1; round <= 3; round++) {
    await click(NAV('/arquitectura')); visits['/arquitectura'].push(await step(`arquitectura-${round}`, round === 2 ? 'arquitectura-visita2' : null));
    await click(NAV('/about')); await step(`about-${round}`, round === 2 ? 'about' : null);
    await click(NAV('/diseno-de-sistemas')); visits['/diseno-de-sistemas'].push(await step(`diseno-${round}`, round === 2 ? 'diseno-visita2' : null));
    await click(NAV('/')); await step(`home-${round + 1}`);
    await submit('arquitectura'); visits['/search?q='].push(await step(`search-${round}`, round === 2 ? 'search-visita2' : null));
    await click(NAV('/')); await step(`home-${round + 1}b`);
  }
  res.checks.visits = Object.fromEntries(Object.entries(visits).map(([k, v]) => [k, v.map((s) => ({ items: s.items, listHidden: s.listHidden, title: s.title }))]));
  res.checks.allVisitsPaint = Object.values(visits).flat().every((s) => s.items > 0 && s.listHidden === false);
  res.checks.aboutTitles = res.steps.filter((s) => s.name.startsWith('about')).map((s) => s.title);
  // REQ-10-11 en /about: un evento de cambio no debe ejecutar el manejador de la portada anterior.
  await click(NAV('/about'));
  const r0 = await b.ev('window.__f10.runs');
  await b.ev(`(() => { const i = document.querySelector('[data-search-bar] input'); i.value = 'arquitectura'; i.dispatchEvent(new Event('input')); i.value = ''; i.dispatchEvent(new Event('input')); return true; })()`);
  res.checks.aboutStaleRuns = (await b.ev('window.__f10.runs')) - r0;
  res.checks.aboutActiveListeners = await b.ev('window.__f10.active');
  // Post: título correcto tras navegar desde la portada.
  await click(NAV('/')); await click('a[href^="/posts/"]'); const post = await step('post', 'post');
  res.checks.postTitle = post.title;
  // REQ-10-13/14: de vuelta en la portada (N >= 3 vueltas), búsqueda en vivo, limpiar y Escape.
  await click(NAV('/')); res.checks.homeReturns = res.steps.filter((s) => s.name.startsWith('home')).length + 1;
  const r1 = await b.ev('window.__f10.runs');
  await b.ev(`document.dispatchEvent(new CustomEvent('search:change', { detail: { term: '' } })), true`);
  res.checks.oneEventRuns = (await b.ev('window.__f10.runs')) - r1;
  res.checks.homeActiveListeners = await b.ev('window.__f10.active');
  await b.ev(`(() => { const i = document.querySelector('[data-search-bar] input'); i.focus(); i.value = 'arquitectura'; i.dispatchEvent(new Event('input')); return true; })()`);
  await sleep(1200);
  const live = () => b.ev(`({ value: document.querySelector('[data-search-bar] input').value, panelHidden: document.querySelector('[data-search-live]').hidden,
    landingHidden: document.querySelector('[data-landing-sections]')?.hidden ?? null, items: document.querySelectorAll('[data-search-live] [data-search-list] li').length })`);
  res.checks.liveTyped = await live(); await b.shot(`${out}/${label}-home-live.png`);
  await b.ev(`document.querySelector('[data-search-clear]').click(), true`); await sleep(500);
  res.checks.liveCleared = await live();
  await b.ev(`(() => { const i = document.querySelector('[data-search-bar] input'); i.focus(); i.value = 'diseño'; i.dispatchEvent(new Event('input')); return true; })()`);
  await sleep(800); res.checks.liveBeforeEscape = await live();
  await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await sleep(500);
  res.checks.liveEscaped = await live(); await b.shot(`${out}/${label}-home-escape.png`);
  res.checks.hardLoadsKept = await b.ev('window.__hard === 1 && performance.getEntriesByType("navigation").length === 1');
  res.logs = b.logs;
} catch (e) { res.error = String(e?.stack ?? e); res.logs = b.logs; } finally { b.close(); }
writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ label, checks: res.checks, logs: res.logs, error: res.error }, null, 1));
