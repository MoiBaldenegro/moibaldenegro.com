// Feature 114: verificación CDP de la lupa animada (estados, reduced-motion, header, buscador, router).
import { open, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const dir = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const b = await open(dir, 9414);
await b.send('Emulation.setFocusEmulationEnabled', { enabled: true });
const res = {};
const state = `(() => { const i = document.querySelector('.search-bar__icon'), inp = document.querySelector('.search-bar__input');
  const cs = getComputedStyle(i), ci = getComputedStyle(inp), r = i.getBoundingClientRect(), ri = inp.getBoundingClientRect();
  return { color: cs.color, transform: cs.transform, anims: i.getAnimations().map((a) => a.animationName + ':' + a.playState + ':' + a.effect.getTiming().duration),
    border: ci.borderColor, shadow: ci.boxShadow, outline: ci.outlineStyle + ' ' + ci.outlineWidth + ' ' + ci.outlineColor, padL: ci.paddingLeft,
    icon: [Math.round(r.left - ri.left), Math.round(r.top - ri.top), Math.round(r.width), Math.round(r.height)], inputH: Math.round(ri.height), inputW: Math.round(ri.width),
    visible: r.width > 0 && cs.visibility !== 'hidden', focused: document.activeElement === inp, value: inp.value,
    filled: document.querySelector('[data-search-bar]').classList.contains('is-filled'),
    live: (() => { const l = document.querySelector('[data-search-live]'); return l ? { hidden: l.hidden, items: l.querySelectorAll('[data-search-list] li').length } : null; })(),
    header: Math.round(document.querySelector('.site-navbar').getBoundingClientRect().height),
    hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    inPanel: getComputedStyle(document.querySelector('.site-menu__toggle')).display !== 'none' }; })()`;
const ev = (e) => b.ev(e);
const key = async (k, code, vk) => { for (const type of ['keyDown', 'keyUp']) await b.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk }); };
const openPanel = async () => { if (await ev(`getComputedStyle(document.querySelector('.site-menu__toggle')).display !== 'none'`)) {
  if (await ev(`document.querySelector('.site-menu__toggle').getAttribute('aria-expanded')`) !== 'true') await ev(`document.querySelector('.site-menu__toggle').click()`); await sleep(500); } };
async function states(w, tag, shots) {
  const s = {};
  s.empty = await ev(state); if (shots) await b.shot(`${OUT}/${tag}-${w}-0-vacio.png`);
  await openPanel();
  await ev(`document.querySelector('.search-bar__input').focus()`); await sleep(450);
  s.focus = await ev(state); if (shots) await b.shot(`${OUT}/${tag}-${w}-1-foco.png`);
  await b.send('Input.insertText', { text: 'spring' }); await sleep(700);
  s.typing = await ev(state);
  if (shots) for (const f of [0, 1, 2]) { await b.shot(`${OUT}/${tag}-${w}-2-escribiendo-f${f}.png`); await sleep(400); }
  await ev(`document.querySelector('.search-bar__input').blur()`); await sleep(450);
  s.blurText = await ev(state); if (shots) await b.shot(`${OUT}/${tag}-${w}-3-texto-sin-foco.png`);
  await ev(`document.querySelector('[data-search-clear]').click()`); await sleep(400);
  s.afterClear = await ev(state);
  await ev(`document.querySelector('.search-bar__input').focus()`);
  await b.send('Input.insertText', { text: 'api' }); await sleep(500);
  s.typed2 = await ev(state);
  await key('Escape', 'Escape', 27); await sleep(500);
  s.afterEscape = await ev(state);
  await ev(`document.activeElement && document.activeElement.blur()`);
  return s;
}
for (const w of [375, 768, 969, 970, 1024, 1280]) {
  await b.load('/', w, 800);
  res[w] = await states(w, 'home', true);
}
// reduced-motion
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
for (const w of [375, 1280]) { await b.load('/', w, 800); res[`rm-${w}`] = await states(w, 'reduced', w === 1280); }
await b.send('Emulation.setEmulatedMedia', { features: [] });
// Ida y vuelta con el ClientRouter
for (const w of [375, 1280]) {
  await b.load('/', w, 800);
  await ev(`document.querySelector('.site-menu a[href="/about"]').click()`); await sleep(1500);
  const at = await ev('location.pathname');
  await ev('history.back()'); await sleep(1500);
  res[`router-${w}`] = { at, back: await ev('location.pathname'), ...(await states(w, 'router', false)) };
}
await b.load('/search', 1280, 800); res['search-1280'] = await states(1280, 'search', false);
res.logs = b.logs;
writeFileSync(`${OUT}/cdp114.json`, JSON.stringify(res, null, 1));
b.close();
console.log('ok', b.logs.length);
