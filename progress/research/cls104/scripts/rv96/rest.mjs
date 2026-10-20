import { open, sleep, CARDS } from './lib.mjs';
import { writeFileSync } from 'node:fs';
const DIR = process.argv[2]; const b = await open(DIR, 9415); const out = {};
const st = async () => {
  const { objects } = await b.send('Runtime.queryObjects', { prototypeObjectId: (await b.send('Runtime.evaluate', { expression: 'Object.prototype' })).result.objectId });
  const r = await b.send('Runtime.callFunctionOn', { objectId: objects.objectId, returnByValue: true, functionDeclaration: `function(){ const o = this.find((x) => { try { return x && typeof x.constructor?.getAll === 'function' && typeof x.constructor?.batch === 'function'; } catch { return false; } }); return o ? o.constructor.getAll().length : 0; }` });
  return r.result.value; };
const styles = () => b.ev(`[...document.querySelectorAll('.latest-articles__card')].map((c) => c.getAttribute('style'))`);
const wheelTo = async (target) => { for (let i = 0; i < 300; i++) { const y = await b.ev('scrollY'); if (Math.abs(y - target) < 40) break; await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 640, y: 400, deltaX: 0, deltaY: y < target ? 40 : -40 }); await sleep(50); } await b.ev(`window.scrollTo({top:${target},behavior:'instant'})`); await sleep(1200); };
try {
  // A. overwrite: x de la 76 congelada (carga limpia, rueda)
  await b.vp(1280, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', 1280);
  const A = {};
  for (const y of [1000, 1300, 1500, 1700, 1815, 1700, 1500]) { await wheelTo(y); A[`y${y}_${Object.keys(A).length}`] = { s: await styles(), c: (await b.ev(CARDS)).map((c) => [c.tx, c.op, c.l, c.r]) }; }
  out.A = A;
  // B. Tab a 375 (y focus programático sin scroll)
  await b.vp(375, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', 375);
  let tabs = 0, inCard = false;
  for (; tabs < 60 && !inCard; tabs++) { await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await sleep(80);
    inCard = await b.ev(`!!document.activeElement?.closest('.latest-articles__card')`); }
  const idx = await b.ev(`[...document.querySelectorAll('.latest-articles__card')].indexOf(document.activeElement.closest('.latest-articles__card'))`);
  await sleep(1100); out.tab = { tabs, idx, card: (await b.ev(CARDS))[idx] };
  await b.ev(`window.scrollTo({top:0,behavior:'instant'})`); await sleep(1200);
  out.focusBefore = (await b.ev(CARDS))[2].op;
  await b.ev(`document.querySelectorAll('.latest-articles__card a')[document.querySelectorAll('.latest-articles__card a').length-1].focus({ preventScroll: true })`); await sleep(1100);
  out.focusAfter = (await b.ev(CARDS))[2];
  // C. Reduced motion
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const w of [375, 1280]) { await b.load('/', w); const max = await b.ev('document.documentElement.scrollHeight - innerHeight'); let bad = 0, n = 0;
    for (let i = 0; i <= 10; i++) { await b.ev(`window.scrollTo({top:${Math.round(max * i / 10)},behavior:'instant'})`); await sleep(300);
      for (const c of await b.ev(CARDS)) { n++; if (c.style !== null || c.t !== 'none' || c.op !== 1) bad++; } }
    out[`reduce${w}`] = { n, bad, st: await st(), pin: await b.ev(`!!document.querySelector('.latest-articles--horizontal-pin')`) }; }
  await b.send('Emulation.setEmulatedMedia', { features: [] });
  // D. Sin JS
  await b.send('Emulation.setScriptExecutionDisabled', { value: true });
  for (const w of [375, 1280]) { await b.load('/', w); out[`nojs${w}`] = await b.ev(CARDS); }
  await b.send('Emulation.setScriptExecutionDisabled', { value: false });
  // E. ClientRouter ida y vuelta (clic con tween en curso) a 1280 y 375
  b.logs.length = 0;
  for (const w of [1280, 375]) { await b.vp(w, 800); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', w); const seq = [await st()];
    for (let r = 0; r < 2; r++) {
      const y = await b.ev(`(() => { const c = document.querySelector('.latest-articles__card'); let t = 0, e = c; while (e) { t += e.offsetTop; e = e.offsetParent; } return Math.max(0, t - innerHeight * 0.8); })()`);
      await b.ev(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(120);
      await b.ev(`document.querySelector('.latest-articles__card a').click()`); await sleep(2500);
      seq.push(await b.ev('location.pathname'), await st());
      await b.ev('history.back()'); await sleep(2500); seq.push(await b.ev('location.pathname'), await st());
    }
    out[`router${w}`] = seq; }
  out.routerLogs = [...b.logs];
  // F. Viewports altos: salida del par final con clamp al fondo
  for (const [w, h] of [[1280, 800], [1440, 1000], [1920, 1080]]) { await b.vp(w, h); await b.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await b.load('/', w, h);
    const max = await b.ev('document.documentElement.scrollHeight - innerHeight');
    const g = await b.ev(`(() => { const w = document.querySelector('.latest-articles--horizontal-pin'); if (!w) return null; let t = 0, e = w; while (e) { t += e.offsetTop; e = e.offsetParent; } return { top: t, h: w.offsetHeight, endTramo: t + w.offsetHeight - w.querySelector('.latest-articles').offsetHeight, bottom40: t + w.offsetHeight - 0.4 * innerHeight }; })()`);
    if (!g) { out[`tall${w}`] = 'sin pin'; continue; }
    await wheelTo(g.endTramo); const atEnd = (await b.ev(CARDS)).map((c) => [c.op, c.top, c.b]);
    await wheelTo(max); const atMax = (await b.ev(CARDS)).map((c) => [c.op, c.top, c.b]);
    await b.shot(`${DIR}/shots/tall-${w}x${h}-max.png`);
    out[`tall${w}x${h}`] = { max, g, atEnd, atMax }; }
  out.logs = b.logs;
  writeFileSync(`${DIR}/rest.json`, JSON.stringify(out, null, 1));
} finally { b.close(); }
