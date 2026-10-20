// Reviewer 96, revisión 3: REQ-96-52 (rueda vs recarga vs history.back) a 1280 y 375, y clic en card 3.
import { open, sleep } from './lib.mjs';
const b = await open(process.argv[2], 9421); const out = {};
const geo = `(() => { const s = document.querySelector('.latest-articles').getBoundingClientRect();
  return [...document.querySelectorAll('.latest-articles__card')].map((e) => { const r = e.getBoundingClientRect(); const t = getComputedStyle(e).transform;
    let tx = 0, sc = 1; if (t && t !== 'none') { const m = new DOMMatrix(t); tx = m.m41; sc = Math.hypot(m.m11, m.m12); }
    const vis = r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
    return { l: +(r.left - s.left).toFixed(2), rm: +(s.right - r.right).toFixed(2), top: Math.round(r.top), op: +(+getComputedStyle(e).opacity).toFixed(3), tx: +tx.toFixed(2), sc: +sc.toFixed(3), vis }; }); })()`;
const wheelTo = async (target) => { for (let i = 0; i < 600; i++) { const y = await b.ev('scrollY'); if (Math.abs(y - target) < 1) break;
  await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 400, deltaX: 0, deltaY: Math.sign(target - y) * Math.min(40, Math.abs(target - y)) }); await sleep(50); } await sleep(1600); return { y: await b.ev('Math.round(scrollY)'), c: await b.ev(geo) }; };
const fresh = async (w) => { await b.vp(w, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', w); };
const settle = async () => { await sleep(2500); return { y: await b.ev('Math.round(scrollY)'), c: await b.ev(geo) }; };
const cmp = (a, r) => a.c.map((c, i) => { const q = r.c[i]; return Math.abs(c.l - q.l) <= 2 && Math.abs(c.op - q.op) <= 0.05 && Math.abs(c.tx - q.tx) <= 2 && Math.abs(c.sc - q.sc) <= 0.01; }).every(Boolean);
const run = async (w, ys) => {
  for (const y of ys) {
    const r = {}; await fresh(w); r.wheel = await wheelTo(y);
    await b.send('Page.reload'); r.reload = await settle();
    await fresh(w); await b.ev(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(1500);
    await b.ev(`(document.querySelector('.site-footer__post a') ?? document.querySelector('.site-footer__post')).click()`); await sleep(2500); r.path = await b.ev('location.pathname');
    await b.ev('history.back()'); r.back = await settle();
    r.okReload = r.reload.y === r.wheel.y && cmp(r.reload, r.wheel); r.okBack = r.back.y === r.wheel.y && cmp(r.back, r.wheel);
    r.activeOk = [r.wheel, r.reload, r.back].every((s) => s.c.every((c) => !c.vis || c.op < 0.05 || (c.op === 1 && Math.abs(c.tx) < 0.5 && c.sc === 1)));
    out[`${w}_${y}`] = r;
  }
};
try {
  await run(1280, [1510, 1815, 2000, 2280, 2295]);
  await fresh(375); const tops = await b.ev(`[...document.querySelectorAll('.latest-articles__card')].map((c) => Math.round(c.getBoundingClientRect().top + scrollY))`);
  out.tops375 = tops; await run(375, tops.map((t) => t - 400));
  // Clic en card 3 al final del tramo y volver
  await fresh(1280); const c3 = {}; c3.before = await wheelTo(1815);
  await b.ev(`(document.querySelectorAll('.latest-articles__card')[2].querySelector('a') ?? document.querySelectorAll('.latest-articles__card')[2]).click()`); await sleep(2500); c3.path = await b.ev('location.pathname');
  await b.ev('history.back()'); c3.after = await settle(); c3.ok = c3.after.y === c3.before.y && cmp(c3.after, c3.before);
  c3.up1205 = await wheelTo(1205); c3.down1815 = await wheelTo(1815); out.card3 = c3;
  await b.shot(`${process.argv[2]}/shots3-back-card3-1815.png`);
  out.logs = b.logs; console.log(JSON.stringify(out, null, 1));
} finally { b.close(); }
