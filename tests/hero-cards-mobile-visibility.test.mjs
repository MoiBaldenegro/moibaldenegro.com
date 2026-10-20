// Feature 106 hero-cards-mobile-visibility (REQ-106-01..17; specs/106_hero-cards-mobile-visibility/). En móvil
// (<= 768 px) solo se ven las cards con showOnMobile true; la medida en navegador (REQ-106-10..12/14) va con CDP (impl).
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const REPOS = 'src/domain/repositories/'; const SIBLING = `${REPOS}hero-cards-fields-parse.ts`;
const NOTE = /Ajuste feature 106 \(precedente REQ-43-06\)/;
const ICON = { id: 'x', title: 'X', colorToken: 'x', icon: '/assets/svg/sprite.svg#x', rotate: 0, scale: 5, iconWidth: '115px' };
const RICH = { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb' };
const cards = (...list) => new HeroCardsRepository(() => JSON.stringify(list)).getCards();
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const iface = (name) => read('src/domain/entities/hero-card.ts').match(new RegExp(`interface ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';

test('REQ-106-01: HeroCard y HeroRichCard declaran readonly showOnMobile: boolean y conservan sus campos', () => {
  for (const [name, fields] of [['HeroCard', ['id', 'kind', 'title', 'colorToken', 'icon', 'category', 'featured', 'rotate', 'scale', 'iconWidth']],
    ['HeroRichCard', ['id', 'kind', 'title', 'colorToken']]]) {
    const body = iface(name); assert.match(body, /readonly showOnMobile: boolean;/, name);
    for (const f of fields) assert.match(body, new RegExp(`readonly ${f}\\??:`), `${name}.${f}`);
  }
});
test('REQ-106-02/03/04: el valor declarado llega tal cual; ausente = false en icono y true en ricas', () => {
  const [onIcon, plainIcon, offRich, plainRich] = cards({ ...ICON, showOnMobile: true }, ICON, { ...RICH, showOnMobile: false }, RICH);
  assert.deepEqual([onIcon.showOnMobile, plainIcon.showOnMobile, offRich.showOnMobile, plainRich.showOnMobile], [true, false, false, true]);
});
test('REQ-106-05: un showOnMobile no booleano lanza HeroCardsDataError con archivo, índice y campo', () => {
  for (const base of [ICON, RICH]) for (const bad of ['true', 1, null]) {
    assert.throws(() => cards(ICON, { ...base, showOnMobile: bad }), (e) => e instanceof HeroCardsDataError
      && /hero-cards\.json/.test(e.message) && /\b1\b/.test(e.message) && e.message.includes('showOnMobile'), `${base.id}=${bad}`);
  }
});
test('REQ-106-06: las 15 tarjetas del JSON declaran showOnMobile, true solo en htb', () => {
  const data = JSON.parse(read('src/data/hero-cards.json')); assert.equal(data.length, 15);
  for (const c of data) assert.equal(c.showOnMobile, c.id === 'htb', `${c.id} showOnMobile=${c.showOnMobile}`);
  assert.equal(data.filter((c) => c.kind === undefined).length, 14);
});
test('REQ-106-07: el parse queda partido en hero-cards-parse.ts y un hermano, ambos <= 100 líneas; el JSON real da 15', () => {
  assert.ok(existsSync(new URL(SIBLING, ROOT)), `falta ${SIBLING}`);
  for (const rel of [`${REPOS}hero-cards-parse.ts`, SIBLING]) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  assert.match(read(`${REPOS}hero-cards-parse.ts`), /from '\.\/hero-cards-fields-parse\.ts'/);
  const real = new HeroCardsRepository().getCards(); assert.equal(real.length, 15);
  assert.deepEqual(real.filter((c) => c.showOnMobile).map((c) => c.id), ['htb']);
});
test('REQ-106-08 (build): data-show-on-mobile en cada article del hero y plantillas sin style ni script', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html'); const arts = [...html.matchAll(/<article class="hero-card[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.equal(arts.length, 15);
  for (const a of arts) assert.match(a, / data-show-on-mobile="(true|false)"/, a);
  assert.deepEqual(arts.filter((a) => a.includes('data-show-on-mobile="true"')).map((a) => a.match(/data-color-token="([^"]+)"/)[1]), ['htb']);
  for (const rel of ['src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro']) {
    const src = read(rel); assert.match(src, /data-show-on-mobile=\{String\(card\.showOnMobile\)\}/, rel); assert.doesNotMatch(src, /\bstyle\s*=|<script\b/, rel);
  }
});
test('REQ-106-09: display none para las cards false solo dentro de @media (max-width: 768px)', () => {
  const css = read('src/styles/hero-section.css').replace(/\/\*[\s\S]*?\*\//g, ''); const all = blocks(css);
  const sel = '.hero-grid > .hero-card[data-show-on-mobile="false"]';
  const inner = all.filter((b) => b.head === '@media (max-width: 768px)').flatMap((b) => blocks(b.body));
  assert.equal(Object.assign({}, ...inner.filter((b) => b.head === sel).map((b) => decls(b.body))).display, 'none');
  assert.ok(all.filter((b) => b.head !== '@media (max-width: 768px)').every((b) => !b.head.includes('data-show-on-mobile') && !b.body.includes('data-show-on-mobile')));
  assert.ok(lines('src/styles/hero-section.css') <= 100);
});
// hero-card.css, tokens.css y los demás ajenos ya traen cambios sin commitear de otras features: su intacto se
// fija con sha256 antes/después en el informe; aquí solo el mosaico, limpio respecto a HEAD.
test('REQ-106-13/17: la feature no toca el dominio del mosaico y los archivos tocados miden <= 100 líneas', () => {
  const touched = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-template.ts'], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(touched, '', `mosaico tocado: ${touched}`);
  for (const rel of ['src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro', 'src/domain/entities/hero-card.ts', 'src/data/hero-cards.json',
    'tests/hero-cards-mobile-visibility.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
});
test('REQ-106-14/16: capturas por ancho y tests heredados ajustados con la nota', () => {
  for (const w of [375, 800, 1024, 1280, 1600]) assert.ok(existsSync(new URL(`progress/research/hero106/hero-${w}.png`, ROOT)), `falta hero-${w}.png`);
  for (const rel of ['tests/hero-cards-extra-logos.test.mjs', 'tests/htb-hero-card.test.mjs']) assert.match(read(rel), NOTE, rel);
});
