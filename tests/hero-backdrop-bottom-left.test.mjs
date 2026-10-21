// Feature 109 hero-backdrop-bottom-left (REQ-109-01..16; specs/109_*). El logo de fondo (.card-backdrop) se ancla
// abajo a la izquierda: left fijo + width por tamaño con right auto (md/lg con los mismos rectángulos que la 105/108,
// sm dentro de la card y pegado a la izquierda) y el ratio exacto del symbol cloudflare (512 / 76).
// La medida en navegador (REQ-109-07..11) va con Chrome headless + CDP y queda en progress/impl_hero-backdrop-bottom-left.md.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SHEET = 'src/styles/hero-card-accents.css'; const SELF = 'tests/hero-backdrop-bottom-left.test.mjs';
const NOTE = 'Ajuste feature 109 (precedente REQ-43-06)';
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const all = () => blocks(read(SHEET).replace(/\/\*[\s\S]*?\*\//g, ''));
const top = () => all().filter((b) => !b.head.startsWith('@'));
const at1200 = () => all().filter((b) => b.head === '@media (max-width: 1200px)').flatMap((b) => blocks(b.body));
const rule = (list, sel) => Object.assign({}, ...list.filter((b) => b.head.split(',').map((s) => s.trim()).includes(sel)).map((b) => decls(b.body)));
const backdropRules = () => [...top(), ...at1200()].filter((b) => b.head.includes('.card-backdrop'));
const size = (s) => `.card-backdrop[data-backdrop-size="${s}"]`;
const geo = (list, sel) => { const r = rule(list, sel); return [r.left, r.right, r.width]; };

test('REQ-109-01: md en la regla base con left fijo, right auto y width (-16px / calc(100% + 32px); -10px / calc(100% + 20px))', () => {
  assert.deepEqual(geo(top(), '.card-backdrop'), ['-16px', 'auto', 'calc(100% + 32px)']);
  assert.deepEqual(geo(at1200(), '.card-backdrop'), ['-10px', undefined, 'calc(100% + 20px)']);
});

test('REQ-109-02: lg con left -56px / width calc(100% + 112px) y -36px / calc(100% + 72px) en <= 1200 px', () => {
  assert.deepEqual(geo(top(), size('lg')), ['-56px', undefined, 'calc(100% + 112px)']);
  assert.deepEqual(geo(at1200(), size('lg')), ['-36px', undefined, 'calc(100% + 72px)']);
});

test('REQ-109-03: sm con left 16px / width 60% y 10px / 60% en <= 1200 px (pegado a la izquierda)', () => {
  assert.deepEqual(geo(top(), size('sm')), ['16px', undefined, '60%']);
  assert.deepEqual(geo(at1200(), size('sm')), ['10px', undefined, '60%']);
});

test('REQ-109-08: sm compensa la holgura izquierda de anthropic-wordmark (2 de 182) solo en sm, fuera de @media', () => {
  const sel = `${size('sm')}:has(use[href$="#anthropic-wordmark"]) svg`;
  assert.equal(rule(top(), sel)['margin-left'], 'calc(-100% * 2 / 182)');
  assert.equal(rule(top(), '.card-backdrop:has(use[href$="#anthropic-wordmark"]) svg')['margin-left'], undefined);
});

test('REQ-109-04: ninguna regla de .card-backdrop declara right distinto de auto', () => {
  for (const b of backdropRules()) {
    const r = decls(b.body).right; assert.ok(r === undefined || r === 'auto', `${b.head} { right: ${r} }`);
  }
});

test('REQ-109-05: cloudflare con el aspect-ratio 512 / 76 de su viewBox', () => {
  assert.equal(rule(top(), '.card-backdrop:has(use[href$="#cloudflare"]) svg')['aspect-ratio'], '512 / 76');
  assert.match(read('public/assets/svg/sprite.svg'), /<symbol id="cloudflare" viewBox="0 0 512 76">/);
});

test('REQ-109-06: bottom 0, z-index 0, opacidad 0.06, ratios y margen de 105/108 intactos; sin height ni transform', () => {
  const bd = rule(top(), '.card-backdrop');
  assert.deepEqual([bd.bottom, bd['z-index'], bd.opacity, bd['--card-backdrop-opacity']], ['0', '0', 'var(--card-backdrop-opacity)', '0.06']);
  const an = rule(top(), '.card-backdrop:has(use[href$="#anthropic-wordmark"]) svg');
  assert.deepEqual([an['aspect-ratio'], an['margin-bottom']], ['182 / 24', 'calc(-100% * 2 / 182)']);
  assert.equal(rule(top(), '.card-backdrop:has(use[href$="#github-wordmark"]) svg')['aspect-ratio'], '249.1 / 67.5');
  // Sin alto fijo: solo el height auto del svg de la 105 (el alto lo da el aspect-ratio); nunca transform.
  for (const b of backdropRules()) {
    const d = decls(b.body); assert.equal(d.transform, undefined, `${b.head} { transform }`);
    assert.ok(d.height === undefined || (d.height === 'auto' && b.head.endsWith(' svg')), `${b.head} { height: ${d.height} }`);
  }
  for (const b of at1200().filter((x) => x.head.includes('.card-backdrop'))) assert.equal(decls(b.body).bottom, undefined, b.head);
});

test('REQ-109-12: capturas <card>-<tamaño>-<w>.png en progress/research/hero109/', () => {
  for (const id of ['cloudflare', 'claude-code', 'github']) for (const s of ['sm', 'md', 'lg']) for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero109/${id}-${s}-${w}.png`, ROOT)), `falta ${id}-${s}-${w}.png`);
  }
});

test('REQ-109-13/14: test solo con node:, <= 100 líneas y tests heredados ajustados con la nota de la 109', () => {
  const specs = read(SELF).split('\n').filter((l) => l.startsWith('import ')).flatMap((l) => l.split(';')).map((s) => s.match(/from '([^']+)'/)?.[1]).filter(Boolean);
  for (const s of specs) assert.match(s, /^node:/, s);
  assert.ok(lines(SELF) <= 100, `${SELF} > 100 líneas`);
  for (const rel of ['tests/hero-backdrop-subtle-bottom.test.mjs', 'tests/hero-cards-extra-logos.test.mjs', 'tests/hero-backdrop-size.test.mjs']) {
    assert.ok(read(rel).includes(NOTE), `${rel} sin «${NOTE}»`);
  }
});

test('REQ-109-15/16: archivos tocados <= 100 líneas, hojas ajenas sin fondo y umbral de REQ-47-06 intacto', () => {
  for (const rel of [SELF, SHEET, 'tests/hero-backdrop-subtle-bottom.test.mjs', 'tests/hero-cards-extra-logos.test.mjs',
    'tests/hero-backdrop-size.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  assert.doesNotMatch(read('src/styles/hero-card.css') + read('src/styles/tokens.css'), /card-backdrop|backdrop-size/);
  assert.match(read('tests/search-index-lazy-load.test.mjs'), /assert\.ok\(size < (40000|42000),/); // Ajuste feature 112 (precedente REQ-43-06): 42 000 B (REQ-112-25)
});
