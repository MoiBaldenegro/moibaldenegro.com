import { open, sleep, CARDS } from './lib.mjs';
import { writeFileSync } from 'node:fs';
const DIR = process.argv[2]; const SHOTS = process.argv[3];
const b = await open(DIR, 9412);
const out = {};
const st = async () => {
  const { objects } = await b.send('Runtime.queryObjects', { prototypeObjectId: (await b.send('Runtime.evaluate', { expression: 'Object.prototype' })).result.objectId });
  const r = await b.send('Runtime.callFunctionOn', { objectId: objects.objectId, returnByValue: true, functionDeclaration: `function(){ const o = this.find((x) => { try { return x && typeof x.constructor?.getAll === 'function' && typeof x.constructor?.batch === 'function'; } catch { return false; } }); return o ? o.constructor.getAll().length : 0; }` });
  return r.result.value;
};
const to = (y) => b.ev(`window.scrollTo({ top: ${y}, behavior: 'instant' }), window.scrollY`);
const cards = () => b.ev(CARDS);
const abs = `[...document.querySelectorAll('.latest-articles__card')].map((c) => { let t = 0, e = c; while (e) { t += e.offsetTop; e = e.offsetParent; } return { top: t, bottom: t + c.offsetHeight }; })`;
const noHScroll = 'document.documentElement.scrollWidth <= document.documentElement.clientWidth';
const CLS = `window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); true`;
try {
  // 1. Conteo, scroll horizontal y CLS
  for (const w of [375, 768, 1024, 1280]) {
    await b.load('/', w); await b.ev(CLS);
    const r = { cards: await b.ev(`document.querySelectorAll('.latest-articles__card').length`), footer: await b.ev(`document.querySelectorAll('.site-footer__post').length`), pin: await b.ev(`!!document.querySelector('.latest-articles--horizontal-pin')`) };
    const max = await b.ev('document.documentElement.scrollHeight - innerHeight'); let bad = 0;
    for (let i = 0; i <= 14; i++) { await to(Math.round(max * i / 14)); await sleep(250); if (!(await b.ev(noHScroll))) bad++; }
    await sleep(800); r.hscrollBad = bad; r.cls = await b.ev('window.__cls'); r.st = await st(); r.max = max; out[`base${w}`] = r;
  }
  // 2. Secuencia apilada sobre la card 2 (índice 1)
  for (const w of [375, 768]) {
    await b.load('/', w); const vh = 800; const a = (await b.ev(abs))[1];
    const s = Math.round(a.top - 0.85 * vh), e = Math.round(a.bottom - 0.2 * vh); const seq = { s, e };
    await to(s - 40); await sleep(1200); seq.a_below = (await cards())[1];
    await to(s + 40); await sleep(200); seq.b_150 = (await cards())[1]; await b.shot(`${SHOTS}/st${w}-1-entra.png`); await sleep(1000); seq.b_1s = (await cards())[1];
    await to(e + 40); await sleep(200); seq.c_150 = (await cards())[1]; await sleep(1000); seq.c_1s = (await cards())[1];
    await to(e - 40); await sleep(200); seq.d_150 = (await cards())[1]; await b.shot(`${SHOTS}/st${w}-3-vuelve.png`); await sleep(1000); seq.d_1s = (await cards())[1];
    await to(s - 40); await sleep(200); seq.e_150 = (await cards())[1]; await sleep(1000); seq.e_1s = (await cards())[1];
    seq.hscroll = await b.ev(noHScroll); out[`seq${w}`] = seq;
  }
  // 3. Horizontal 1280x800
  {
    await b.load('/', 1280);
    const g = await b.ev(`(() => { const w = document.querySelector('.latest-articles--horizontal-pin'); let t = 0, e = w; while (e) { t += e.offsetTop; e = e.offsetParent; } const s = w.querySelector('.latest-articles'); return { top: t, h: w.offsetHeight, sh: s.offsetHeight, max: document.documentElement.scrollHeight - innerHeight }; })()`);
    const len = g.h - g.sh; const H = { g, len }; const sec = `(() => { const r = document.querySelector('.latest-articles').getBoundingClientRect(); return { l: r.left, r: r.right, top: r.top }; })()`;
    const arrive = g.top - 600;
    await to(arrive - 40); await sleep(1200); H.a_before = await cards();
    await to(arrive + 40); await sleep(200); H.a_150 = await cards(); await sleep(1000); H.a_1s = await cards();
    const steps = []; for (let y = g.top; y <= g.top + len; y += Math.round(len / 8)) { await to(y); await sleep(200); steps.push({ y, c: (await cards()).map((c) => [c.tx, c.op]), sec: await b.ev(sec) }); }
    H.steps = steps;
    await to(g.top + len); await sleep(1200); H.end = { c: await cards(), sec: await b.ev(sec), hs: await b.ev(noHScroll) };
    await to(g.max); await sleep(200); H.leave_150 = await cards(); await sleep(1000); H.leave_1s = await cards(); await b.shot(`${SHOTS}/h1280-leave.png`);
    await to(g.max - 40); await sleep(200); H.back_150 = await cards(); await sleep(1000); H.back_1s = await cards();
    await to(g.top + 2); await sleep(1200); H.tramoStart_up = await cards();
    await to(arrive - 40); await sleep(1200); H.above = await cards();
    out.h1280 = H;
  }
  writeFileSync(`${DIR}/main.json`, JSON.stringify(out, null, 1));
  out.logs = b.logs; console.log(JSON.stringify(b.logs));
} finally { b.close(); }
