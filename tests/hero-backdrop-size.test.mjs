// Feature 108 hero-backdrop-size (REQ-108-01..18; specs/108_*). Tamaño del logo de fondo desde hero-cards.json:
// enum sm | md | lg, data-backdrop-size en div.card-backdrop (solo si el JSON lo declara) y una regla CSS por valor.
// La medida en navegador (REQ-108-12/13) va con Chrome headless + CDP y queda en progress/impl_hero-backdrop-size.md.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SHEET = 'src/styles/hero-card-accents.css'; const SELF = 'tests/hero-backdrop-size.test.mjs'; const SPRITE = '/assets/svg/sprite.svg#';
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
const ICON = { id: 'x', title: 'X', colorToken: 'x', icon: `${SPRITE}x`, rotate: 0, scale: 5, iconWidth: '115px' };
const BACK = { backgroundIcon: `${SPRITE}github-wordmark` };
const cards = (...extra) => new HeroCardsRepository(() => JSON.stringify(extra.map((e) => ({ ...ICON, ...e })))).getCards();
const size = (s) => `.card-backdrop[data-backdrop-size="${s}"]`;
test('REQ-108-01: la entidad exporta HERO_BACKDROP_SIZES [sm, md, lg] y HeroCard declara backgroundIconSize opcional', () => {
  const entity = read('src/domain/entities/hero-card.ts');
  assert.match(entity, /export const HERO_BACKDROP_SIZES = \['sm', 'md', 'lg'\] as const;/);
  assert.match(entity, /export type HeroBackdropSize = \(typeof HERO_BACKDROP_SIZES\)\[number\];/);
  assert.match(entity.match(/interface HeroCard \{([\s\S]*?)\}/)?.[1] ?? '', /readonly backgroundIconSize\?: HeroBackdropSize;/);
});
test('REQ-108-02/03: un tamaño válido llega tal cual y sin el campo la tarjeta no tiene la clave', () => {
  const [plain, back, ...sized] = cards({}, BACK, ...['sm', 'md', 'lg'].map((s) => ({ ...BACK, backgroundIconSize: s })));
  assert.deepEqual(['backgroundIconSize' in plain, 'backgroundIconSize' in back], [false, false]);
  assert.deepEqual(sized.map((c) => c.backgroundIconSize), ['sm', 'md', 'lg']);
});
test('REQ-108-04: fuera del enum o sin backgroundIcon lanza HeroCardsDataError con archivo, índice y campo', () => {
  for (const bad of [{ ...BACK, backgroundIconSize: 'xl' }, { ...BACK, backgroundIconSize: 2 }, { backgroundIconSize: 'md' }, { ...BACK, backgroundIconSize: null }]) {
    assert.throws(() => cards({}, bad), (e) => e instanceof HeroCardsDataError && /hero-cards\.json/.test(e.message)
      && /\b1\b/.test(e.message) && e.message.includes('backgroundIconSize'), JSON.stringify(bad));
  }
});
// Ajuste feature 111 (precedente REQ-43-06): los pares id/backgroundIconSize se derivan del JSON del humano (REQ-111-03).
test('REQ-108-05: cada backgroundIconSize del JSON es sm|md|lg y solo lo declaran tarjetas con backgroundIcon', () => {
  const sized = JSON.parse(read('src/data/hero-cards.json')).filter((c) => 'backgroundIconSize' in c); assert.ok(sized.length > 0, 'ningún tamaño');
  for (const c of sized) assert.ok(['sm', 'md', 'lg'].includes(c.backgroundIconSize) && typeof c.backgroundIcon === 'string', `${c.id}: ${c.backgroundIconSize}`);
});
test('REQ-108-06/07: hero-card.astro pinta data-backdrop-size desde card.backgroundIconSize y sin style', () => {
  const astro = read('src/components/hero-card-art.astro'); // Ajuste feature 112 (precedente REQ-43-06): el fondo se pinta en hero-card-art.astro (REQ-112-08)
  assert.match(astro, /<div class="card-backdrop" data-backdrop-size=\{card\.backgroundIconSize\}>/);
  assert.doesNotMatch(astro, /\bstyle\s*=/);
});
// Ajuste feature 111 (precedente REQ-43-06): con backgroundIcon y sin backgroundIconSize la card no lleva el atributo (REQ-111-04).
test('REQ-108-06/07/17 (build): data-backdrop-size con el valor del JSON, sin atributo si no lo declara y portada < 40 000 B', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html'); const data = JSON.parse(read('src/data/hero-cards.json'));
  for (const c of data.filter((x) => x.backgroundIcon)) {
    const art = html.match(new RegExp(`<article class="hero-card[^"]*" data-color-token="${c.colorToken}"[^>]*>([\\s\\S]*?)</article>`))?.[1] ?? '';
    assert.match(art, new RegExp(`<div class="card-backdrop"${c.backgroundIconSize ? ` data-backdrop-size="${c.backgroundIconSize}"` : ''}><svg`), c.id);
  }
  assert.equal((html.match(/data-backdrop-size=/g) ?? []).length, data.filter((x) => x.backgroundIconSize).length);
  assert.doesNotMatch(html, /data-backdrop-size(=""|[\s>])/);
  const bytes = Buffer.byteLength(html); assert.ok(bytes < Number(read('tests/search-index-lazy-load.test.mjs').match(/assert\.ok\(size < (\d+),/)[1]), `index.html pesa ${bytes} bytes`); // Ajuste feature 112 (precedente REQ-43-06): rica incluida y umbral vigente de REQ-47-06
});
// Ajuste feature 109 (precedente REQ-43-06): left fijo + width con right auto (REQ-109-01..04): md y lg dan el mismo rectángulo; sm queda abajo-izquierda.
test('REQ-108-08/09/10: md en la regla base (-16px/-10px), sm 16px/10px y lg -56px/-36px', () => {
  const lr = (list, sel) => { const r = rule(list, sel); return [r.left, r.width]; };
  assert.deepEqual([lr(top(), '.card-backdrop'), lr(at1200(), '.card-backdrop')], [['-16px', 'calc(100% + 32px)'], ['-10px', 'calc(100% + 20px)']]);
  assert.deepEqual([lr(top(), size('sm')), lr(at1200(), size('sm'))], [['16px', '60%'], ['10px', '60%']]);
  assert.deepEqual([lr(top(), size('lg')), lr(at1200(), size('lg'))], [['-56px', 'calc(100% + 112px)'], ['-36px', 'calc(100% + 72px)']]);
  assert.deepEqual([rule(top(), size('md')), rule(at1200(), size('md'))], [{}, {}], 'md no lleva regla propia');
});
// Ajuste feature 109 (precedente REQ-43-06): las reglas de tamaño declaran left y width (antes left y right);
// la del svg interior de sm (margin-left de anthropic-wordmark, REQ-109-08) no es regla de tamaño de la caja.
test('REQ-108-11: las reglas de tamaño solo declaran left y width; base de la 105 intacta', () => {
  for (const b of [...top(), ...at1200()].filter((x) => x.head.includes('data-backdrop-size') && !x.head.endsWith(' svg'))) {
    assert.deepEqual(Object.keys(decls(b.body)).sort(), ['left', 'width'], b.head);
  }
  const bd = rule(top(), '.card-backdrop');
  assert.deepEqual([bd.bottom, bd['z-index'], bd.opacity, bd['--card-backdrop-opacity'], bd.height], ['0', '0', 'var(--card-backdrop-opacity)', '0.06', undefined]);
  assert.equal(rule(top(), '.card-backdrop:has(use[href$="#anthropic-wordmark"]) svg')['aspect-ratio'], '182 / 24');
  assert.equal(rule(top(), '.card-backdrop:has(use[href$="#github-wordmark"]) svg')['aspect-ratio'], '249.1 / 67.5');
});
test('REQ-108-14: capturas <card>-<tamaño>-<w>.png en progress/research/hero108/', () => {
  for (const id of ['claude-code', 'github']) for (const s of ['sm', 'md', 'lg']) for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero108/${id}-${s}-${w}.png`, ROOT)), `falta ${id}-${s}-${w}.png`);
  }
});
test('REQ-108-15/16/17: test solo con node:, archivos tocados <= 100 líneas y umbral de REQ-47-06 intacto', () => {
  const specs = read(SELF).split('\n').filter((l) => l.startsWith('import ')).flatMap((l) => l.split(';')).map((s) => s.match(/from '([^']+)'/)?.[1]).filter(Boolean);
  for (const s of specs) assert.match(s, /^node:|^\.\.\/src\/domain\/|^\.\/helpers\//, s);
  for (const rel of [SELF, SHEET, 'src/components/hero-card.astro', 'src/domain/entities/hero-card.ts', 'src/domain/repositories/hero-cards-parse.ts',
    'src/domain/repositories/hero-cards-fields-parse.ts', 'tests/hero-cards-extra-logos.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  assert.match(read('tests/search-index-lazy-load.test.mjs'), /assert\.ok\(size < (40000|42000),/); // Ajuste feature 112 (precedente REQ-43-06): 42 000 B (REQ-112-25)
  assert.doesNotMatch(read('src/styles/hero-card.css') + read('src/styles/tokens.css'), /backdrop-size/);
});
