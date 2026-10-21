// Feature 112 hero-rich-card-logos (REQ-112-01..26; specs/112_*). Las cards ricas (hoy HTB) declaran icon,
// backgroundIcon y backgroundIconSize en hero-cards.json y pintan cubo + wordmark tenues bajo su contenido con el
// componente compartido hero-card-art.astro. La CDP (REQ-112-16..22) queda en progress/impl_hero-rich-card-logos.md.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SPRITE = '/assets/svg/sprite.svg#'; const ART = 'src/components/hero-card-art.astro'; const SELF = 'tests/hero-rich-card-logos.test.mjs';
const HTB = 'src/components/hero-cards/htb-card.astro'; const H = 'src/styles/htb-card.css'; const A = 'src/styles/hero-card-accents.css';
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const sheet = (rel) => blocks(read(rel).replace(/\/\*[\s\S]*?\*\//g, ''));
const top = (rel) => sheet(rel).filter((b) => !b.head.startsWith('@'));
const at1200 = (rel) => sheet(rel).filter((b) => b.head === '@media (max-width: 1200px)').flatMap((b) => blocks(b.body));
const rule = (list, sel) => Object.assign({}, ...list.filter((b) => b.head.split(',').map((s) => s.trim()).includes(sel)).map((b) => decls(b.body)));
const RICH = { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb' };
const LOGOS = { icon: `${SPRITE}htb`, backgroundIcon: `${SPRITE}htb-wordmark`, backgroundIconSize: 'sm' };
const cards = (...list) => new HeroCardsRepository(() => JSON.stringify(list)).getCards();

test('REQ-112-01: HeroRichCard declara icon, backgroundIcon y backgroundIconSize opcionales y readonly', () => {
  const body = read('src/domain/entities/hero-card.ts').match(/interface HeroRichCard \{([\s\S]*?)\}/)?.[1] ?? '';
  for (const f of ['icon', 'backgroundIcon']) assert.match(body, new RegExp(`readonly ${f}\\?: string;`), f);
  assert.match(body, /readonly backgroundIconSize\?: HeroBackdropSize;/);
});
test('REQ-112-02/03/04: la rica devuelve los tres campos si los declara y no tiene las claves si los omite', () => {
  const [full, plain] = cards({ ...RICH, ...LOGOS }, RICH);
  assert.deepEqual([full.icon, full.backgroundIcon, full.backgroundIconSize], [LOGOS.icon, LOGOS.backgroundIcon, 'sm']);
  assert.deepEqual(['icon' in plain, 'backgroundIcon' in plain, 'backgroundIconSize' in plain], [false, false, false]);
});
test('REQ-112-05: icon, backgroundIcon o backgroundIconSize inválidos lanzan HeroCardsDataError con archivo, índice y campo', () => {
  for (const [field, bad] of [['icon', { icon: 'htb' }], ['backgroundIcon', { backgroundIcon: '/x.svg#a' }], ['backgroundIconSize', { ...LOGOS, backgroundIconSize: 'xl' }]]) {
    assert.throws(() => cards(RICH, { ...RICH, ...bad }), (e) => e instanceof HeroCardsDataError && /hero-cards\.json/.test(e.message)
      && /\b1\b/.test(e.message) && e.message.includes(`"${field}"`), field);
  }
});
test('REQ-112-06/07: la card htb del JSON declara #htb, #htb-wordmark y sm; los symbol de las ricas existen en el sprite', () => {
  const data = JSON.parse(read('src/data/hero-cards.json'));
  assert.deepEqual(data.find((c) => c.id === 'htb'), { ...RICH, showOnMobile: true, href: null, ...LOGOS });
  const sprite = read('public/assets/svg/sprite.svg');
  for (const c of data.filter((x) => x.kind && x.kind !== 'icon')) for (const ref of [c.icon, c.backgroundIcon].filter(Boolean)) {
    assert.match(sprite, new RegExp(`<symbol id="${ref.split('#')[1]}"`), `${c.id}: ${ref}`);
  }
});
test('REQ-112-08/09/11/12: hero-card-art.astro pinta las capas; hero-card y htb-card lo usan sin marcado propio', () => {
  assert.ok(existsSync(new URL(ART, ROOT)), `falta ${ART}`); const art = read(ART); assert.match(art, /\{card\.backgroundIcon && \(\s*<div class="card-backdrop" data-backdrop-size=\{card\.backgroundIconSize\}>/);
  assert.match(art, /\{card\.icon && \(\s*<div class="card-icon">/); assert.doesNotMatch(art, /\bstyle\s*=|<style|<script/);
  for (const rel of ['src/components/hero-card.astro', HTB]) {
    const src = read(rel); assert.match(src, /import HeroCardArt from ["'][./]*\/?(\.\.\/)?hero-card-art\.astro["']/, rel);
    assert.match(src, /<HeroCardArt card=\{card\} \/>/, rel); assert.doesNotMatch(src, /class="card-(icon|backdrop)"/, rel);
  }
  const htb = read(HTB); const use = htb.indexOf('<HeroCardArt');
  assert.ok(use > -1 && use < htb.indexOf('class="hero-card__body"') && use < htb.indexOf('class="card-link"'), 'HeroCardArt debe ir antes del cuerpo y la liga');
  assert.match(htb, /\{\(card\.icon \|\| card\.backgroundIcon\) && <HeroCardArt card=\{card\} \/>\}/);
});
test('REQ-112-13/14/15: opacidad e inercia del cubo, geometría htb y ratio del wordmark, sin :hover nuevo', () => {
  const icon = rule(top(H), '.hero-card--rich .card-icon'); assert.deepEqual([icon.opacity, icon['pointer-events']], ['0.16', 'none']);
  const sel = '.hero-card--rich[data-color-token="htb"]'; const g = rule(top(H), sel);
  assert.deepEqual([g['--icon-width'], g['--icon-rotation'], g['--icon-scale']], ['150px', '-8deg', '6']);
  assert.equal(rule(at1200(H), sel)['--icon-scale'], '3');
  assert.equal(rule(top(A), '.card-backdrop:has(use[href$="#htb-wordmark"]) svg')['aspect-ratio'], '300 / 58.8');
  for (const rel of [H, A]) assert.doesNotMatch(read(rel).replace(/\/\*[\s\S]*?\*\//g, ''), /:hover[^{]*card-icon/, rel);
});
test('REQ-112-10/11/25 (build): cards de icono byte a byte iguales, capas HTB antes del cuerpo y peso bajo el umbral', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html'); const icons = html.match(/<article class="hero-card"[\s\S]*?<\/article>/g) ?? [];
  assert.equal(`${icons.join('\n')}\n`, read('progress/research/hero112/icon-cards-baseline.html'), 'el HTML de las cards de icono cambió');
  const rich = html.match(/<article class="hero-card hero-card--rich"[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
  const layers = '<div class="card-backdrop" data-backdrop-size="sm"><svg aria-hidden="true" focusable="false"><use href="/assets/svg/sprite.svg#htb-wordmark"></use></svg></div>'
    + '<div class="card-icon"><svg width="28px" height="28px" aria-hidden="true" focusable="false"><use href="/assets/svg/sprite.svg#htb"></use></svg></div><div class="hero-card__body">';
  assert.ok(rich.includes(layers), 'la card HTB no lleva wordmark + cubo justo antes de .hero-card__body');
  const src = read('tests/search-index-lazy-load.test.mjs'); const limit = Number(src.match(/assert\.ok\(size < (\d+),/)?.[1]);
  const bytes = Buffer.byteLength(html); assert.ok(bytes < 42000, `index.html pesa ${bytes} bytes: la feature queda blocked (REQ-112-25)`);
  if (bytes >= 40000) {
    assert.equal(limit, 42000, `umbral ${limit}`);
    assert.match(src, /Ajuste feature 112 \(precedente REQ-43-06\)[^\n]*2026-10-20/);
  }
});
test('REQ-112-22: capturas de la card HTB en reposo y hover a 375/800/1024/1280/1600 px', () => {
  for (const s of ['rest', 'hover']) for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero112/htb-${s}-${w}.png`, ROOT)), `falta htb-${s}-${w}.png`);
  }
});
test('REQ-112-23/26: test solo con node: y helpers, archivos tocados <= 100 líneas y hero-card.css sin cambios de tamaño', () => {
  const imports = [...read(SELF).matchAll(/(?:^|; )import [^;]*? from '([^']+)'/gm)].map((m) => m[1]);
  for (const m of imports) assert.ok(m.startsWith('node:') || m.startsWith('../src/') || m.startsWith('./helpers/'), m);
  for (const rel of [SELF, ART, HTB, 'src/components/hero-card.astro', H, A,
    'src/domain/entities/hero-card.ts', 'src/domain/repositories/hero-cards-parse.ts', 'src/domain/repositories/hero-cards-fields-parse.ts']) {
    assert.ok(lines(rel) <= 100, `${rel} tiene ${lines(rel)} líneas`);
  }
  assert.equal(lines('src/styles/hero-card.css'), 99); assert.doesNotMatch(read('src/styles/hero-card.css'), /hero-card--rich|htb-wordmark/);
});
