// Implementer 104: REQ-96-49/50 con rueda real hasta la y exacta (r2.mjs para a 20 px del objetivo).
// 49: carga limpia -> rueda a 1815 (final del tramo), margen derecho de la card 3 = left del título.
// 50: recarga al fondo y history.back al fondo -> rueda a 1205 (par de llegada), left de la card 1 = left del título.
import { open, sleep } from './lib.mjs';
const b = await open(process.argv[2], 9431); const out = {};
const geo = `(() => { const s = document.querySelector('.latest-articles').getBoundingClientRect(), h = document.querySelector('.latest-articles__heading').getBoundingClientRect();
  const c = [...document.querySelectorAll('.latest-articles__card')].map((e) => { const r = e.getBoundingClientRect(); return { l: +(r.left - s.left).toFixed(2), rm: +(s.right - r.right).toFixed(2), op: +(+getComputedStyle(e).opacity).toFixed(3) }; });
  return { y: Math.round(scrollY), title: +(h.left - s.left).toFixed(2), c }; })()`;
const wheelTo = async (target) => { for (let i = 0; i < 600; i++) { const y = await b.ev('scrollY'); if (Math.abs(y - target) < 1) break;
  await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 400, deltaX: 0, deltaY: Math.sign(target - y) * Math.min(40, Math.abs(target - y)) }); await sleep(50); } await sleep(1600); return b.ev(geo); };
const fresh = async () => { await b.vp(1280, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', 1280); };
try {
  await fresh(); out.r49 = await wheelTo(1815); out.r49.ok = Math.abs(out.r49.c[2].rm - out.r49.title) <= 1 && out.r49.c[2].op === 1;
  const max = await b.ev('document.documentElement.scrollHeight - innerHeight');
  await wheelTo(max); await b.send('Page.reload'); await sleep(2500); out.reload = { y0: await b.ev('Math.round(scrollY)'), rest: await wheelTo(1205) };
  await fresh(); await wheelTo(max);
  await b.ev(`(document.querySelector('.site-footer__post a') ?? document.querySelector('.site-footer__post')).click()`); await sleep(2500);
  await b.ev('history.back()'); await sleep(2500); out.back = { y0: await b.ev('Math.round(scrollY)'), rest: await wheelTo(1205) };
  for (const k of ['reload', 'back']) out[k].ok = Math.abs(out[k].rest.c[0].l - out[k].rest.title) <= 1 && out[k].rest.c[0].op === 1;
  out.logs = b.logs; console.log(JSON.stringify(out, null, 1));
} finally { b.close(); }
