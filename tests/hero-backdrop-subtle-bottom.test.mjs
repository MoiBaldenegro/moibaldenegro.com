// Feature 105 hero-backdrop-subtle-bottom (REQ-105-01..17; specs/105_*). Logo de fondo por debajo del icono
// principal, más sutil (0.06), más ancho que la card y anclado abajo. La medida en navegador
// (REQ-105-07..12) va con Chrome headless + CDP y queda en progress/impl_hero-backdrop-subtle-bottom.md.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SHEET = 'src/styles/hero-card-accents.css'; const SELF = 'tests/hero-backdrop-subtle-bottom.test.mjs';
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const all = () => blocks(strip(read(SHEET)));
const top = () => all().filter((b) => !b.head.startsWith('@'));
const media = () => all().filter((b) => b.head.startsWith('@')).flatMap((b) => blocks(b.body));
const at1200 = () => all().filter((b) => b.head === '@media (max-width: 1200px)').flatMap((b) => blocks(b.body));
const rule = (list, sel) => Object.assign({}, ...list.filter((b) => b.head.split(',').map((s) => s.trim()).includes(sel)).map((b) => decls(b.body)));
const ratio = (v) => { const [a, b] = String(v).split('/').map((n) => Number(n.trim())); return b === undefined ? a : a / b; };

test('REQ-105-01: .card-backdrop en z-index 0 fuera de @media, sin redefinirlo dentro, y antes de .card-icon en el DOM', () => {
  assert.equal(rule(top(), '.card-backdrop')['z-index'], '0');
  for (const b of media().filter((x) => /\.card-backdrop/.test(x.head))) assert.ok(!('z-index' in decls(b.body)), `z-index en @media: ${b.head}`);
  const astro = read('src/components/hero-card.astro'); const back = astro.indexOf('card-backdrop'); const icon = astro.indexOf('card-icon');
  assert.ok(back > -1 && icon > -1 && back < icon, '.card-backdrop debe ir antes que .card-icon');
  const card = strip(read('src/styles/hero-card.css'));
  assert.match(card, /\.hero-card\s*\{[^}]*isolation:\s*isolate/, '.hero-card sin isolation: isolate');
  const iconZ = blocks(card).flatMap((b) => (b.head.startsWith('@') ? blocks(b.body) : [b])).filter((b) => /\.card-icon\b/.test(b.head)).some((b) => 'z-index' in decls(b.body));
  assert.equal(iconZ, false, '.card-icon no debe declarar z-index');
});

test('REQ-105-02: --card-backdrop-opacity 0.06 y opacity var(--card-backdrop-opacity)', () => {
  const bd = rule(top(), '.card-backdrop');
  assert.deepEqual([bd['--card-backdrop-opacity'], bd.opacity], ['0.06', 'var(--card-backdrop-opacity)']);
});

test('REQ-105-03: la hoja no declara transform, transition ni :hover para el fondo', () => {
  assert.doesNotMatch(strip(read(SHEET)), /\btransform\s*:|\btransition\s*:|:hover/);
  assert.doesNotMatch(read('src/styles/hero-card.css'), /card-backdrop/);
});

test('REQ-105-04: left/right -16px y bottom 0 fuera de @media, -10px en <= 1200 px, sin height en ningún rango', () => {
  const bd = rule(top(), '.card-backdrop'); const m = rule(at1200(), '.card-backdrop');
  assert.deepEqual([bd.position, bd.left, bd.right, bd.bottom, bd.height], ['absolute', '-16px', '-16px', '0', undefined]);
  assert.deepEqual([m.left, m.right, m.height], ['-10px', '-10px', undefined]);
  assert.ok(m.bottom === undefined || m.bottom === '0', `bottom en <= 1200 px: ${m.bottom}`);
});

test('REQ-105-05: .card-backdrop svg con display block, width 100%, height auto y aspect-ratio 4 / 1', () => {
  const svg = rule(top(), '.card-backdrop svg');
  assert.deepEqual([svg.display, svg.width, svg.height, svg['aspect-ratio']], ['block', '100%', 'auto', '4 / 1']);
  assert.equal(rule(at1200(), '.card-backdrop svg').height, undefined);
});

test('REQ-105-06: cada backgroundIcon tiene su regla :has(use[href$="#id"]) svg con el ratio del viewBox del symbol', () => {
  const sprite = read('public/assets/svg/sprite.svg');
  const ids = JSON.parse(read('src/data/hero-cards.json')).map((c) => c.backgroundIcon).filter(Boolean).map((r) => r.split('#')[1]);
  assert.ok(ids.length >= 2, 'se esperaban al menos dos backgroundIcon');
  for (const id of ids) {
    const vb = sprite.match(new RegExp(`<symbol[^>]*\\sid="${id}"[^>]*\\sviewBox="([^"]+)"`))?.[1]
      ?? sprite.match(new RegExp(`<symbol[^>]*\\sviewBox="([^"]+)"[^>]*\\sid="${id}"`))?.[1];
    assert.ok(vb, `${id} sin viewBox en el sprite`); const [, , w, h] = vb.trim().split(/[\s,]+/).map(Number);
    const ar = rule(top(), `.card-backdrop:has(use[href$="#${id}"]) svg`)['aspect-ratio'];
    assert.ok(ar, `falta .card-backdrop:has(use[href$="#${id}"]) svg { aspect-ratio }`);
    assert.ok(Math.abs(ratio(ar) - w / h) <= 0.01, `${id}: aspect-ratio ${ar} != ${w} / ${h}`);
  }
});

test('REQ-105-14: la esquina y el header reservado conservan 22px/16px/46px y 18px/14px/40px', () => {
  const pick = (list) => { const r = { ...rule(list, '.card-corner'), ...rule(list, '.card-corner svg') }; return [r.width, r.height, r.top, r.right, r['z-index']]; };
  assert.deepEqual(pick(top()), ['22px', '22px', '16px', '16px', '3']); assert.deepEqual(pick(at1200()).slice(0, 4), ['18px', '18px', '14px', '14px']);
  const hdr = '.hero-card:has(> .card-corner) .card-header'; assert.deepEqual([rule(top(), hdr).right, rule(at1200(), hdr).right], ['46px', '40px']);
});

test('REQ-105-15: tests/hero-cards-extra-logos.test.mjs lleva la nota del ajuste y ya no exige la franja de la 103', () => {
  const t = read('tests/hero-cards-extra-logos.test.mjs');
  assert.match(t, /Ajuste feature 105 \(precedente REQ-43-06\)/);
  assert.doesNotMatch(t, /'22px', '22px', 'var\(--gap-card\)', '40px'|\['0\.1', 'var|\['2', '3', false/);
});

test('REQ-105-12/16/17: capturas por ancho, test solo con node:, archivos tocados <= 100 líneas', () => {
  for (const w of [375, 800, 1024, 1280, 1600]) for (const id of ['claude-code', 'github']) {
    assert.ok(existsSync(new URL(`progress/research/hero105/${id}-${w}.png`, ROOT)), `falta hero105/${id}-${w}.png`);
  }
  const specs = read(SELF).split('\n').filter((l) => l.startsWith('import ')).flatMap((l) => l.split(';')).map((s) => s.match(/from '([^']+)'/)?.[1]).filter(Boolean);
  assert.ok(specs.length >= 3); for (const s of specs) assert.match(s, /^node:/, s);
  for (const rel of [SELF, SHEET, 'tests/hero-cards-extra-logos.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
});
