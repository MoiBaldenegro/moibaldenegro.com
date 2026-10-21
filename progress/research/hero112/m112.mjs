// Feature 112: medidor CDP de la card HTB (reposo y hover). node m112.mjs <baseUrl> <out.json> <shotsDir> <cdpPort>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
const [base, out, shots, portS] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
const port = Number(portS);
const prof = mkdtempSync(join(dirname(fileURLToPath(import.meta.url)), 'prof-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws; for (let i = 0; i < 150 && !ws; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find((x) => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(200); }
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const errors = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console ' + JSON.stringify(m.params.args.map((a) => a.value)));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('log ' + m.params.entry.text + ' ' + m.params.entry.url);
  if (m.method === 'Network.loadingFailed') errors.push('net failed ' + m.params.errorText);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push('net ' + m.params.response.status + ' ' + m.params.response.url); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable'); await send('Network.enable'); await send('DOM.enable'); await send('CSS.enable');
// PNG mínimo (8 bits, RGB/RGBA, sin entrelazado) para muestrear el fondo compuesto.
function png(buf) { let p = 8; let w; let h; let ct; const idat = [];
  while (p < buf.length) { const len = buf.readUInt32BE(p); const type = buf.toString('ascii', p + 4, p + 8); const d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } if (type === 'IDAT') idat.push(d); p += 12 + len; }
  const bpp = ct === 6 ? 4 : 3; const raw = inflateSync(Buffer.concat(idat)); const stride = w * bpp; const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)]; const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? px[y * stride + x - bpp] : 0; const b = y ? px[(y - 1) * stride + x] : 0; const c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const pa = Math.abs(b - c); const pb = Math.abs(a - c); const pc = Math.abs(a + b - 2 * c); const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      px[y * stride + x] = (row[x] + [0, a, b, (a + b) >> 1, pr][f]) & 255; } }
  return { w, h, at: (x, y) => [px[y * stride + x * bpp], px[y * stride + x * bpp + 1], px[y * stride + x * bpp + 2]] }; }
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const SEL = 'article.hero-card--rich[data-color-token="htb"]';
const load = async (w) => { await send('Emulation.setDeviceMetricsOverride', { width: w, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '/' }); await sleep(3500); await ev('document.fonts.ready.then(() => 1)');
  await ev(`document.querySelector('${SEL}').scrollIntoView({ block: 'center' }); 1`); await sleep(800); };
const GEO = `(() => { const f = (v) => +v.toFixed(1); const a = document.querySelector('${SEL}'); const r = (e) => { const b = e.getBoundingClientRect(); return { l: f(b.left), t: f(b.top), r: f(b.right), b: f(b.bottom), w: f(b.width), h: f(b.height) }; };
  const icon = a.querySelector(':scope > .card-icon'); const svg = icon.querySelector('svg'); const bd = a.querySelector(':scope > .card-backdrop'); const use = bd.querySelector('use'); const title = a.querySelector('.card-title'); const body = a.querySelector('.hero-card__body');
  const ov = (p, q) => Math.max(0, Math.min(p.right, q.right) - Math.max(p.left, q.left)) * Math.max(0, Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top));
  const ci = getComputedStyle(icon); const cs = getComputedStyle(svg); const cb = getComputedStyle(bd); const ca = getComputedStyle(a);
  const order = [...a.children].map((c) => c.className || c.tagName); const z = (e) => getComputedStyle(e).zIndex;
  const pts = []; const bb = body.getBoundingClientRect(); for (const [fx, fy] of [[0.5, 0.5], [0.15, 0.3], [0.85, 0.8], [0.5, 0.95]]) { const x = bb.left + bb.width * fx; const y = bb.top + bb.height * fy; const h = document.elementFromPoint(x, y); pts.push({ fx, fy, hit: h ? (h.closest('.hero-card__body') ? 'body' : h.closest('a.card-link') ? 'link' : h.closest('.card-icon,.card-backdrop') ? 'LOGO' : h.className || h.tagName) : null }); }
  const ar = a.getBoundingClientRect(); const cube = svg.getBoundingClientRect(); const ch = document.elementFromPoint(Math.min(ar.right - 4, (cube.left + cube.right) / 2), Math.min(ar.bottom - 4, (cube.top + cube.bottom) / 2));
  pts.push({ cubeCenter: true, hit: ch ? (ch.closest('.card-icon,.card-backdrop') ? 'LOGO' : ch.closest('.hero-card__body') ? 'body' : ch === a ? 'article' : ch.className || ch.tagName) : null });
  return { card: r(a), title: r(title), body: r(body), iconBox: r(icon), svg: r(svg), use: r(use), backdrop: r(bd), useBottomGap: f(ar.bottom - use.getBoundingClientRect().bottom),
    useTitleOverlap: f(ov(use.getBoundingClientRect(), title.getBoundingClientRect())), cubeTitleOverlap: f(ov(cube, title.getBoundingClientRect())),
    iconOpacity: ci.opacity, iconPE: ci.pointerEvents, svgPE: cs.pointerEvents, svgTransform: cs.transform, svgWidth: cs.width, vars: ['--icon-width', '--icon-rotation', '--icon-scale'].map((v) => ca.getPropertyValue(v).trim()),
    bdOpacity: cb.opacity, bdPE: cb.pointerEvents, bdSize: bd.dataset.backdropSize, svgAspect: getComputedStyle(bd.querySelector('svg')).aspectRatio, overflow: ca.overflow, filter: ca.filter,
    order, z: { backdrop: z(bd), icon: z(icon), header: z(a.querySelector('.card-header')), body: z(body) }, hits: pts, display: ca.display,
    scrollW: document.scrollingElement.scrollWidth, innerW: innerWidth }; })()`;
// Fondo compuesto bajo cada texto: se ocultan los textos, se captura su caja y se toma el píxel de menor contraste.
const TEXTS = `[...document.querySelectorAll('${SEL} .card-header *, ${SEL} .hero-card__body *')].filter((e) => !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(e.tagName) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e, i) => { e.dataset.m112 = i; const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return { i, text: e.textContent.trim().slice(0, 40), color: s.color, opacity: s.opacity, x: b.left, y: b.top + scrollY, w: b.width, h: b.height }; })`;
const rgb = (c) => c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const contrastFilter = (c) => c.map((v) => Math.max(0, Math.min(255, Math.round((v / 255 - 0.5) * 1.4 * 255 + 127.5))));
async function contrast(hover) {
  const texts = await ev(TEXTS); await ev(`document.querySelectorAll('[data-m112]').forEach((e) => { e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); }); 1`); await sleep(500);
  const res = [];
  for (const t of texts) { const s = await send('Page.captureScreenshot', { format: 'png', clip: { x: t.x, y: t.y, width: Math.max(1, t.w), height: Math.max(1, t.h), scale: 1 }, captureBeyondViewport: true });
    const img = png(Buffer.from(s.result.data, 'base64')); let fg = rgb(t.color); if (hover) fg = contrastFilter(fg); let worst = Infinity; let px;
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const c = img.at(x, y); const k = ratio(fg, c); if (k < worst) { worst = k; px = c; } }
    res.push({ text: t.text, color: t.color, fgUsed: fg, worstBg: px, min: +worst.toFixed(2) }); }
  await ev(`document.querySelectorAll('[data-m112]').forEach((e) => { e.style.removeProperty('color'); e.style.removeProperty('text-shadow'); delete e.dataset.m112; }); 1`); await sleep(300);
  return res;
}
const node = async (sel) => { const d = await send('DOM.getDocument', { depth: -1 }); return (await send('DOM.querySelector', { nodeId: d.result.root.nodeId, selector: sel })).result.nodeId; };
const shot = async (name) => { const c = await ev(`(() => { const r = document.querySelector('${SEL}').getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: r.top + scrollY - 8, width: r.width + 16, height: r.height + 16, scale: 1 }; })()`);
  const s = await send('Page.captureScreenshot', { format: 'png', clip: c, captureBeyondViewport: true }); writeFileSync(join(shots, name), Buffer.from(s.result.data, 'base64')); };
const hoverRule = async () => { const nid = await node(`${SEL} > .card-icon svg`); const m = await send('CSS.getMatchedStylesForNode', { nodeId: nid });
  return m.result.matchedCSSRules.map((x) => x.rule.selectorList.text).filter((t) => /hover/.test(t)); };
// Mosaico: rects de todas las cards con y sin las capas de la rica (son absolutas: no deben mover nada).
const MOSAIC = `JSON.stringify([...document.querySelectorAll('.hero-grid > article')].map((a) => { const b = a.getBoundingClientRect(); return [a.dataset.colorToken, Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }))`;
const ICONS = `JSON.stringify([...document.querySelectorAll('.hero-grid > article.hero-card:not(.hero-card--rich) .card-icon svg')].map((s) => { const b = s.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), getComputedStyle(s).transform]; }))`;
const res = { errors };
const ids = async (...sels) => { const d = await send('DOM.getDocument', { depth: -1 }); const r = []; for (const sel of sels) r.push((await send('DOM.querySelector', { nodeId: d.result.root.nodeId, selector: sel })).result.nodeId); return r; };
const rulesOf = async (nid) => (await send('CSS.getMatchedStylesForNode', { nodeId: nid })).result.matchedCSSRules.map((x) => x.rule.selectorList.text).filter((t) => /hover/.test(t));
const EXPECT = (sel) => `(() => { const s = parseFloat(getComputedStyle(document.querySelector('${sel}')).getPropertyValue('--icon-scale')); const m = new DOMMatrix('rotate(2deg) scale(' + (s * 1.12) + ')'); return 'matrix(' + [m.a, m.b, m.c, m.d, m.e, m.f].map((v) => +v.toFixed(6)).join(', ') + ')'; })()`;
const GH = 'article.hero-card[data-color-token="github"]';
for (const w of [375, 800, 1024, 1280, 1600]) {
  // Mosaico con y sin las capas de la rica (son absolutas: no deben mover nada); luego se recarga.
  await load(w); const mos = await ev(MOSAIC); const icons = await ev(ICONS);
  await ev(`document.querySelectorAll('${SEL} > .card-icon, ${SEL} > .card-backdrop').forEach((e) => e.remove()); 1`); await sleep(300);
  const d = { mosaicSame: mos === await ev(MOSAIC), iconsSame: icons === await ev(ICONS), mosaic: JSON.parse(mos) };
  await load(w); d.rest = await ev(GEO); d.rest.contrast = await contrast(false); await shot(`htb-rest-${w}.png`);
  d.variant = await ev(`(() => { const b = document.querySelector('${SEL} .htb-stadistics'); return b ? (b.querySelector('.htb-stadistics__list') ? 'list' : 'empty') : 'fallback'; })()`);
  let [nid, svgId] = await ids(SEL, `${SEL} > .card-icon svg`); await send('CSS.forcePseudoState', { nodeId: nid, forcedPseudoClasses: ['hover'] }); await sleep(700);
  d.hover = await ev(GEO); d.hover.hoverRules = await rulesOf(svgId); d.expectedHover = await ev(EXPECT(SEL)); d.hover.contrast = await contrast(true); await shot(`htb-hover-${w}.png`);
  await send('CSS.forcePseudoState', { nodeId: nid, forcedPseudoClasses: [] }); await sleep(600);
  // Card de icono de referencia (GITHUB) en hover: misma regla y misma fórmula.
  if (await ev(`getComputedStyle(document.querySelector('${GH}')).display !== 'none'`)) {
    const [g, gs] = await ids(GH, `${GH} > .card-icon svg`); await send('CSS.forcePseudoState', { nodeId: g, forcedPseudoClasses: ['hover'] }); await sleep(700);
    d.github = { transform: await ev(`getComputedStyle(document.querySelector('${GH} > .card-icon svg')).transform`), expected: await ev(EXPECT(GH)), rules: await rulesOf(gs) };
    await send('CSS.forcePseudoState', { nodeId: g, forcedPseudoClasses: [] }); await sleep(600);
  }
  // Otra variante del cuerpo (lista o aviso) inyectada solo en la sesión CDP para medir su contraste también.
  const LIST = '<div class="htb-stadistics"><ul class="htb-stadistics__list"><li class="htb-stadistics__item"><span class="htb-stadistics__label">Nivel</span><span class="htb-stadistics__value">Hacker</span></li><li class="htb-stadistics__item"><span class="htb-stadistics__label">Puntos</span><span class="htb-stadistics__value">120</span></li><li class="htb-stadistics__item"><span class="htb-stadistics__label">Owns</span><span class="htb-stadistics__value">20 user / 18 root</span></li></ul></div>';
  const EMPTY = '<div class="htb-stadistics"><p class="htb-stadistics__empty">Estadísticas no disponibles</p></div>';
  d.altVariant = d.variant === 'list' ? 'empty' : 'list';
  await ev(`document.querySelector('${SEL} .hero-card__body').innerHTML = ${JSON.stringify(d.altVariant === 'list' ? LIST : EMPTY)}; 1`); await sleep(500);
  d.alt = { geo: await ev(GEO) }; d.alt.rest = await contrast(false);
  [nid] = await ids(SEL); await send('CSS.forcePseudoState', { nodeId: nid, forcedPseudoClasses: ['hover'] }); await sleep(700);
  d.alt.hoverGeo = await ev(GEO); d.alt.hover = await contrast(true); await shot(`alt-${d.altVariant}-hover-${w}.png`);
  await send('CSS.forcePseudoState', { nodeId: nid, forcedPseudoClasses: [] }); await sleep(300);
  res[w] = d;
}
writeFileSync(out, JSON.stringify(res, null, 1)); ws.close(); chrome.kill(); console.log('ok', out, 'errors', errors.length); process.exit(0);
