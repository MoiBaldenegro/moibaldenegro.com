// Reviewer 96, revisión 2: REQ-96-49/50 y CLS de carga limpia a 1280.
import { open, sleep, CARDS } from './lib.mjs';
const b = await open(process.argv[2], 9416); const out = {};
const geo = `(() => { const s = document.querySelector('.latest-articles').getBoundingClientRect(); const h = document.querySelector('.latest-articles__heading').getBoundingClientRect();
  const c = [...document.querySelectorAll('.latest-articles__card')].map((e) => { const r = e.getBoundingClientRect(); return { l: +(r.left - s.left).toFixed(2), rm: +(s.right - r.right).toFixed(2), op: +getComputedStyle(e).opacity }; });
  return { y: Math.round(scrollY), title: +(h.left - s.left).toFixed(2), c }; })()`;
const wheelTo = async (target, log) => { for (let i = 0; i < 400; i++) { const y = await b.ev('scrollY'); if (Math.abs(y - target) < 20) break;
  await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 640, y: 400, deltaX: 0, deltaY: Math.sign(target - y) * Math.min(40, Math.abs(target - y)) }); await sleep(50); if (log) log.push(await b.ev(geo)); } await sleep(1300); return b.ev(geo); };
const CLS = `window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); true`;
const fresh = async () => { await b.vp(1280, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', 1280); };
try {
  // REQ-96-49: carga limpia, rueda real hasta el final del tramo (1815)
  await fresh(); await b.ev(CLS);
  out.clean = { start: await b.ev(geo), end: await wheelTo(1815) };
  const max = await b.ev('document.documentElement.scrollHeight - innerHeight');
  await wheelTo(max); out.clean.cls = await b.ev('window.__cls');
  // REQ-96-50 a: recarga con scroll restaurado al fondo
  await b.send('Page.reload'); await sleep(2500); out.reload = { y0: await b.ev('scrollY'), endTramo: await wheelTo(1815), rest: await wheelTo(1205) };
  await sleep(1000); out.reload.rest2 = await b.ev(geo);
  // REQ-96-50 b: fondo -> artículo -> history.back
  await fresh(); await wheelTo(max);
  await b.ev(`(document.querySelector('.site-footer__post a') ?? document.querySelector('.site-footer__post')).click()`); await sleep(2500);
  out.back = { path: await b.ev('location.pathname') };
  await b.ev('history.back()'); await sleep(2500); out.back.y0 = await b.ev('scrollY'); out.back.path2 = await b.ev('location.pathname');
  out.back.endTramo = await wheelTo(1815); out.back.rest = await wheelTo(1205); await sleep(1000); out.back.rest2 = await b.ev(geo);
  out.logs = b.logs;
  console.log(JSON.stringify(out, null, 1));
} finally { b.close(); }
