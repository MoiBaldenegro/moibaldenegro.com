// Feature 103 hero-cards-extra-logos (REQ-103-01..33; specs/103_*). La medida en navegador (REQ-103-23..26/32/33) va con CDP (impl).
// Ajuste feature 116 (precedente REQ-43-06): la portada pasa de / a /home (dist/client/home/index.html y src/pages/home.astro).
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SPRITE = '/assets/svg/sprite.svg#'; const SHEET = 'src/styles/hero-card-accents.css';
const sheet = () => (existsSync(new URL(SHEET, ROOT)) ? read(SHEET).replace(/\/\*[\s\S]*?\*\//g, '') : '');
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const top = () => blocks(sheet()).filter((b) => !b.head.startsWith('@'));
const at1200 = () => blocks(sheet()).filter((b) => b.head === '@media (max-width: 1200px)').flatMap((b) => blocks(b.body));
// Declaraciones que aplican a un selector (una regla con lista de selectores cuenta para cada uno).
const rule = (list, sel) => Object.assign({}, ...list.filter((b) => b.head.split(',').map((s) => s.trim()).includes(sel)).map((b) => decls(b.body)));
const ICON = { id: 'x', title: 'X', colorToken: 'x', icon: `${SPRITE}x`, rotate: 0, scale: 5, iconWidth: '115px' };
const cards = (...extra) => new HeroCardsRepository(() => JSON.stringify(extra.map((e) => ({ ...ICON, ...e })))).getCards();
test('REQ-103-01: HeroCard declara cornerIcon y backgroundIcon opcionales readonly y HeroRichCard no cambia', () => {
  const entity = read('src/domain/entities/hero-card.ts'); const icon = entity.match(/interface HeroCard \{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(icon, /readonly cornerIcon\?: string;/); assert.match(icon, /readonly backgroundIcon\?: string;/);
  assert.doesNotMatch(entity.match(/interface HeroRichCard \{([\s\S]*?)\}/)?.[1] ?? '', /cornerIcon/); // Ajuste feature 112 (precedente REQ-43-06): la rica gana backgroundIcon (REQ-112-01)
});
test('REQ-103-02/04: sin campos no hay claves; con campos válidos llegan con el texto del JSON', () => {
  const [plain, full] = cards({}, { cornerIcon: `${SPRITE}claude`, backgroundIcon: `${SPRITE}anthropic-wordmark` });
  assert.deepEqual(['cornerIcon' in plain, 'backgroundIcon' in plain], [false, false]);
  assert.deepEqual([full.cornerIcon, full.backgroundIcon], [`${SPRITE}claude`, `${SPRITE}anthropic-wordmark`]);
});
test('REQ-103-03: un cornerIcon o backgroundIcon inválido lanza HeroCardsDataError con archivo, índice y campo', () => {
  for (const field of ['cornerIcon', 'backgroundIcon']) for (const bad of [7, '', '/assets/svg/otro.svg#claude', SPRITE, 'claude']) {
    assert.throws(() => cards({}, { [field]: bad }), (e) => e instanceof HeroCardsDataError
      && /hero-cards\.json/.test(e.message) && /\b1\b/.test(e.message) && e.message.includes(field), `${field}=${bad}`);
  }
});
test('REQ-103-05/06/07/08 (Ajuste feature 111 (precedente REQ-43-06): tarjetas con extras derivadas del JSON): cada símbolo extra existe en el sprite', () => {
  const data = JSON.parse(read('src/data/hero-cards.json')); const sprite = read('public/assets/svg/sprite.svg');
  const extras = data.filter((c) => c.cornerIcon || c.backgroundIcon); assert.ok(extras.length > 0, 'ninguna tarjeta con extras');
  for (const c of extras) assert.ok(c.kind === undefined ? typeof c.icon === 'string' : !c.cornerIcon, `${c.id}: extras solo en tarjetas de icono`); // Ajuste feature 112 (precedente REQ-43-06): las ricas solo backgroundIcon (REQ-112-06)
  for (const c of extras) assert.ok([c.cornerIcon, c.backgroundIcon].filter(Boolean).every((r) => r.startsWith(SPRITE)), c.id);
  for (const ref of extras.flatMap((c) => [c.cornerIcon, c.backgroundIcon]).filter(Boolean)) {
    assert.match(sprite, new RegExp(`<symbol[^>]*\\sid="${ref.slice(SPRITE.length)}"`), `${ref} no está en el sprite`);
  }
});
test('REQ-103-09/10/11 (build; Ajuste feature 111 (precedente REQ-43-06): svg de .card-icon a 28px de hero-card.astro): capas extra en orden y cards sin campos con el marcado de antes', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/home/index.html'); const svg = (a, href) => `<svg${a} aria-hidden="true" focusable="false"><use href="${href}"></use></svg>`; // Ajuste feature 107 (precedente REQ-43-06): <use> solo con href (REQ-107-29/34)
  const layer = (cls, href, size) => (href ? `<div class="${cls}"${size ? ` data-backdrop-size="${size}"` : ''}>${svg('', href)}</div>` : ''); // Ajuste feature 108 (precedente REQ-43-06): data-backdrop-size si el JSON declara backgroundIconSize (REQ-108-06/07)
  for (const c of JSON.parse(read('src/data/hero-cards.json')).filter((x) => x.kind === undefined)) {
    const art = html.match(new RegExp(`<article class="hero-card" data-color-token="${c.colorToken}" data-col-span="\\d+" data-row-span="\\d+">([\\s\\S]*?)</article>`))?.[1]; // Ajuste feature 106 (precedente REQ-43-06): las de icono siguen sin data-show-on-mobile (REQ-106-18)
    assert.equal(art, `<header class="card-header"><p class="card-title">${c.title}</p></header>${layer('card-backdrop', c.backgroundIcon, c.backgroundIconSize)}`
      + `<div class="card-icon">${svg(' width="28px" height="28px"', c.icon)}</div>${layer('card-corner', c.cornerIcon)}${c.href ? `<a class="card-link" href="${c.href}" target="_blank" rel="noopener noreferrer"><span class="visually-hidden">${c.title} (sitio externo) (se abre en una pestaña nueva)</span><span class="card-link__arrow" aria-hidden="true">↗</span></a>` : ''}`, `${c.id} con otro marcado`); // Ajuste feature 107 (precedente REQ-43-06): + a.card-link si hay href; Ajuste feature 110 (precedente REQ-43-06): target, noreferrer y aviso de pestaña nueva
  }
});
test('REQ-103-12/13: hero-card.astro toma los campos de card, importa la hoja nueva y sin style, script ni JSON', () => {
  const astro = read('src/components/hero-card.astro') + read('src/components/hero-card-art.astro'); // Ajuste feature 112 (precedente REQ-43-06): el fondo se pinta en hero-card-art.astro (REQ-112-08)
  assert.match(astro, /import "\.\.\/styles\/hero-card-accents\.css";/); assert.match(astro, /card\.backgroundIcon/); assert.match(astro, /card\.cornerIcon/);
  assert.doesNotMatch(astro, /\bstyle\s*=|<script\b|hero-cards\.json/);
  assert.doesNotMatch(read('src/styles/hero-card.css'), /card-corner|card-backdrop/);
});
test('REQ-103-14/15: cada selector de la hoja nombra .card-corner o .card-backdrop; <= 100 líneas y sin colores sueltos', () => {
  assert.ok(sheet(), `${SHEET} no existe`); assert.ok(lines(SHEET) <= 100, `${SHEET} > 100 líneas`);
  for (const b of [...top(), ...at1200()]) for (const s of b.head.split(',')) assert.match(s, /\.card-(corner|backdrop)/, `selector ${s}`);
  assert.equal(blocks(sheet()).filter((b) => b.head.startsWith('@') && b.head !== '@media (max-width: 1200px)').length, 0, 'otro @media');
  assert.doesNotMatch(sheet(), /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
});
test('REQ-103-16/17/18: esquina 22px a 16px (18px a 14px en <= 1200) y header reservado a 46px (40px)', () => {
  const pick = (list) => { const r = { ...rule(list, '.card-corner'), ...rule(list, '.card-corner svg') }; return [r.width, r.height, r.top, r.right]; };
  assert.deepEqual(pick(top()), ['22px', '22px', '16px', '16px']); assert.deepEqual(pick(at1200()), ['18px', '18px', '14px', '14px']);
  const hdr = '.hero-card:has(> .card-corner) .card-header'; assert.deepEqual([rule(top(), hdr).right, rule(at1200(), hdr).right], ['46px', '40px']);
});
test('REQ-103-21/22 + REQ-105-02/04/05 (Ajuste feature 105 (precedente REQ-43-06); Ajuste feature 109 (precedente REQ-43-06): left + width, right auto): fondo desbordado y anclado abajo, opacidad 0.06, inerte', () => {
  const bd = rule(top(), '.card-backdrop'); const svg = rule(top(), '.card-backdrop svg'); const m = rule(at1200(), '.card-backdrop');
  assert.deepEqual([bd.position, bd.left, bd.right, bd.width, bd.bottom, bd.height], ['absolute', '-16px', 'auto', 'calc(100% + 32px)', '0', undefined]);
  assert.deepEqual([m.left, m.width, m.height], ['-10px', 'calc(100% + 20px)', undefined]); assert.deepEqual([svg.width, svg.height], ['100%', 'auto']);
  assert.deepEqual([bd['--card-backdrop-opacity'], bd.opacity], ['0.06', 'var(--card-backdrop-opacity)']);
  for (const sel of ['.card-corner', '.card-backdrop']) {
    const r = rule(top(), sel); assert.deepEqual([r['pointer-events'], r['user-select']], ['none', 'none'], sel); assert.ok(Number(r['z-index']) < 4, `${sel} z-index ${r['z-index']}`);
  }
  assert.doesNotMatch(sheet(), /\btransform\s*:|\btransition\s*:|:hover/);
});
test('REQ-105-01 (antes REQ-103-31): .card-backdrop en z-index 0, bajo .card-icon (sin z-index, después en el DOM) y .card-corner (3)', () => {
  const css = blocks(read('src/styles/hero-card.css').replace(/\/\*[\s\S]*?\*\//g, '')).flatMap((b) => (b.head.startsWith('@') ? blocks(b.body) : [b]));
  const iconZ = css.filter((b) => /\.card-icon\b/.test(b.head)).some((b) => 'z-index' in decls(b.body)); const z = (sel) => rule(top(), sel)['z-index'];
  assert.deepEqual([z('.card-backdrop'), z('.card-corner'), iconZ, rule(at1200(), '.card-backdrop')['z-index']], ['0', '3', false, undefined]);
});
test('REQ-103-26/27/30: capturas, ajuste de REQ-101-17 y archivos tocados <= 100 líneas', () => {
  for (const w of [375, 800, 1024, 1280, 1600]) for (const id of ['claude-code', 'github']) {
    assert.ok(existsSync(new URL(`progress/research/hero103/${id}-${w}.png`, ROOT)), `falta ${id}-${w}.png`);
  }
  assert.match(read('tests/hero-cards-polish.test.mjs'), /Ajuste feature 103 \(precedente REQ-43-06\)/);
  for (const rel of ['tests/hero-cards-polish.test.mjs', 'tests/hero-cards-extra-logos.test.mjs', 'src/components/hero-card.astro',
    'src/domain/entities/hero-card.ts', 'src/domain/repositories/hero-cards-parse.ts', SHEET]) assert.ok(existsSync(new URL(rel, ROOT)) && lines(rel) <= 100, rel);
});
