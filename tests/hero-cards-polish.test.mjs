// Test de la feature 101 hero-cards-polish (REQ-101-01..21). Spec: specs/101_hero-cards-polish/ (tablas de design.md).
// La medida en navegador (REQ-101-05/06/08..12/18/19) va con Chrome headless + CDP (progress/impl_hero-cards-polish.md).

import { test } from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs'; import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const APPROVED_99 = '0c786e4'; // commit que cerró la feature 99 (mosaico tipo panel de SO)
const ICONS_CSS = 'src/styles/hero-card-icons.css';
const heroSheets = () => ['src/styles/hero-card.css', ...(existsSync(new URL(ICONS_CSS, ROOT)) ? [ICONS_CSS] : [])];
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  }
  return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const tokenRule = (body, token) => decls(blocks(body).filter((b) => b.head === `[data-color-token="${token}"]`).map((b) => b.body).join(';'));
const allBlocks = () => heroSheets().flatMap((rel) => blocks(strip(read(rel))));
const base = () => allBlocks().filter((b) => !b.head.startsWith('@')).map((b) => `${b.head}{${b.body}}`).join('\n');
const media1200 = () => allBlocks().filter((b) => b.head === '@media (max-width: 1200px)').map((b) => b.body).join('\n');
const luminance = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const scripts = (src) => (src.match(/<script\b/g) ?? []).length;
const token = (name) => read('src/styles/tokens.css').match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6});`))?.[1];

test('REQ-101-01/02/03: --color-marca-nestjs #3A0D18 con >= 4,5:1 frente al título y >= 3:1 frente al logo', () => {
  const bg = token('--color-marca-nestjs');
  assert.equal(bg?.toUpperCase(), '#3A0D18', `--color-marca-nestjs es ${bg}`);
  const symbol = read('public/assets/svg/sprite.svg').match(/<symbol[^>]*id="nestjs"[\s\S]*?<\/symbol>/)?.[0] ?? '';
  assert.match(symbol, /fill="#E0234E"/i, 'el símbolo nestjs ya no pinta #E0234E');
  assert.ok(contrast(bg, token('--color-text')) >= 4.5, `título ${contrast(bg, token('--color-text')).toFixed(2)}:1`);
  assert.ok(contrast(bg, '#E0234E') >= 3, `logo ${contrast(bg, '#E0234E').toFixed(2)}:1`);
});

test('REQ-101-04: las reglas base de node, nestjs y typescript declaran el --icon-width de escritorio', () => {
  // Escala 7 calibrada por CDP (design.md): el ancho no agranda el logo (svg de 32px de alto, viewBox por altura).
  for (const [id, width] of [['node', '240px'], ['nestjs', '230px'], ['typescript', '220px']]) {
    assert.deepEqual([tokenRule(base(), id)['--icon-width'], tokenRule(base(), id)['--icon-scale']], [width, '7'], `${id} base`);
  }
});

test('REQ-101-07: el @media (max-width: 1200px) fija ancho y escala de tablet de node, nestjs, typescript, css y html', () => {
  const TABLET = { node: ['165px', '3'], nestjs: ['160px', '3'], typescript: ['150px', '2'], css: ['105px', '3'], html: ['115px', '3'] };
  for (const [id, [width, scale]] of Object.entries(TABLET)) {
    const rule = tokenRule(media1200(), id);
    assert.deepEqual([rule['--icon-width'], rule['--icon-scale']], [width, scale], `${id} en <= 1200 px`);
  }
});

test('REQ-101-11/12/13: HTB reduce paddings y aviso en <= 1200 px solo en sus dos hojas y con tokens', () => {
  const at1200 = (rel) => blocks(strip(read(rel))).filter((b) => b.head === '@media (max-width: 1200px)').map((b) => b.body).join('\n');
  const body = decls(blocks(at1200('src/styles/htb-card.css')).find((b) => b.head === '.hero-card--rich .hero-card__body')?.body ?? '');
  assert.match(body.padding ?? '', /var\(--gap-card\)/, 'el cuerpo HTB no reduce su padding con --gap-card');
  const empty = decls(blocks(at1200('src/styles/htb-stadistics.css')).find((b) => b.head === '.htb-stadistics__empty')?.body ?? '');
  assert.match(empty.padding ?? '', /var\(--gap-card\)/, 'el aviso no reduce su padding con --gap-card');
  assert.ok(empty['font-size'], 'el aviso no reduce su tamaño de letra');
  for (const rel of ['src/components/hero-cards/htb-card.astro', 'src/components/htb-stadistics.astro']) {
    assert.equal(git('diff', APPROVED_99, '--', rel), '', `${rel} cambió (los cambios HTB van solo en CSS)`);
  }
});

test('REQ-101-14: hero-card.css sin --card-column/--card-row y la celda sigue saliendo de hero-section.css', () => {
  assert.doesNotMatch(read('src/styles/hero-card.css'), /--card-(column|row)/);
  const rule = decls(blocks(strip(read('src/styles/hero-section.css'))).find((b) => b.head === '.hero-grid > .hero-card')?.body ?? '');
  assert.deepEqual([rule['grid-column'], rule['grid-row']], ['var(--card-column)', 'var(--card-row)']);
});

test('REQ-101-15/16: hojas tocadas <= 100 líneas, sin colores sueltos e iconos importados si se parten', () => {
  for (const rel of [...heroSheets(), 'src/styles/htb-card.css', 'src/styles/htb-stadistics.css', 'src/styles/hero-section.css', 'src/styles/tokens.css']) {
    assert.ok(read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length <= 100, `${rel} > 100 líneas`);
    if (rel !== 'src/styles/tokens.css') assert.doesNotMatch(strip(read(rel)), /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/, `${rel} con color suelto`);
  }
  if (heroSheets().includes(ICONS_CSS)) assert.match(read('src/components/hero-card.astro'), /import "\.\.\/styles\/hero-card-icons\.css";/);
});

test('REQ-101-17: dominio del mosaico y hero-cards.json sin cambios frente a la feature 99', () => { // Ajuste feature 103 (precedente REQ-43-06): JSON sin cornerIcon/backgroundIcon
  for (const rel of ['src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-template.ts']) assert.equal(git('diff', APPROVED_99, '--', rel), '', `${rel} cambió`);
  assert.deepEqual(JSON.parse(read('src/data/hero-cards.json')).map(({ cornerIcon, backgroundIcon, ...c }) => c), JSON.parse(git('show', `${APPROVED_99}:src/data/hero-cards.json`)), 'hero-cards.json cambió');
});

test('REQ-101-19: componentes del hero sin atributo style ni etiquetas script nuevas', () => {
  for (const rel of ['src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro', 'src/components/new-hero/new-hero.astro']) {
    assert.doesNotMatch(read(rel), /\bstyle\s*=/, `${rel} con style`);
    assert.equal(scripts(read(rel)), scripts(git('show', `${APPROVED_99}:${rel}`)), `${rel} con script nuevo`);
  }
});

test('REQ-101-21: capturas del grid del hero de la verificación', () => {
  for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero101/hero-grid-${w}.png`, ROOT)), `falta hero-grid-${w}.png`);
  }
});
