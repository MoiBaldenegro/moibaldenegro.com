// Feature 107 hero-cards-links (REQ-107-01..28; specs/107_hero-cards-links/). Cards del hero con href nullable desde el
// JSON: a.card-link hermano como último hijo del article y flecha ↗ con hover o foco; la medida CDP (REQ-107-13/15/22) va en el impl.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs'; import { execFileSync } from 'node:child_process';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url); const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const SHEET = 'src/styles/hero-card-link.css'; const COMPONENTS = ['src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro'];
const LINKS = { github: 'https://github.com/MoiBaldenegro', youtube: 'https://www.youtube.com/@moibaldenegro' };
const ICON = { id: 'x', title: 'X', colorToken: 'x', icon: '/assets/svg/sprite.svg#x', rotate: 0, scale: 5, iconWidth: '115px' };
const RICH = { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb' };
const cards = (...list) => new HeroCardsRepository(() => JSON.stringify(list)).getCards();
const iface = (name) => read('src/domain/entities/hero-card.ts').match(new RegExp(`interface ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  } return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
// Declaraciones de un selector (en reglas con lista de selectores) dentro de un nivel de bloques.
const rule = (list, sel) => Object.assign({}, ...list.filter((b) => b.head.split(',').map((s) => s.trim()).includes(sel)).map((b) => decls(b.body)));

test('REQ-107-01: HeroCard y HeroRichCard declaran readonly href: string | null y conservan sus campos', () => {
  for (const [name, fields] of [['HeroCard', ['id', 'kind', 'title', 'colorToken', 'icon', 'category', 'featured', 'rotate', 'scale', 'iconWidth', 'showOnMobile']],
    ['HeroRichCard', ['id', 'kind', 'title', 'colorToken', 'showOnMobile']]]) {
    const body = iface(name); assert.match(body, /readonly href: string \| null;/, name);
    for (const f of fields) assert.match(body, new RegExp(`readonly ${f}\\??:`), `${name}.${f}`);
  }
});
test('REQ-107-02/03: href https:// o /ruta llega tal cual; ausente o null = null (icono y rica)', () => {
  const got = cards({ ...ICON, href: 'https://example.com/x' }, { ...ICON, href: '/about' }, ICON, { ...ICON, href: null },
    { ...RICH, href: '/about' }, RICH, { ...RICH, href: null }).map((c) => c.href);
  assert.deepEqual(got, ['https://example.com/x', '/about', null, null, '/about', null, null]);
});
test('REQ-107-04: un href inválido lanza HeroCardsDataError con archivo, índice y campo', () => {
  for (const base of [ICON, RICH]) for (const bad of [1, '', 'http://example.com', 'javascript:alert(1)', '//example.com', 'example.com']) {
    assert.throws(() => cards(ICON, { ...base, href: bad }), (e) => e instanceof HeroCardsDataError
      && /hero-cards\.json/.test(e.message) && /\b1\b/.test(e.message) && e.message.includes('href'), `${base.id}=${bad}`);
  }
});
test('REQ-107-05: el JSON declara href en las 15 tarjetas: github y youtube con su URL, el resto null', () => {
  const data = JSON.parse(read('src/data/hero-cards.json')); assert.equal(data.length, 15);
  for (const c of data) { assert.ok('href' in c, `${c.id} sin href`); assert.equal(c.href, LINKS[c.id] ?? null, c.id); }
  assert.deepEqual(new HeroCardsRepository().getCards().filter((c) => c.href).map((c) => [c.id, c.href]), [['youtube', LINKS.youtube], ['github', LINKS.github]]);
});
test('REQ-107-08 (Ajuste feature 110 (precedente REQ-43-06): el aviso lo arma cardLinkLabel del dominio y todo href abre en pestaña nueva): los componentes clasifican desde el dominio', () => {
  for (const rel of COMPONENTS) {
    const src = read(rel);
    assert.match(src, /import \{ cardLinkLabel \} from "(\.\.\/)+domain\/hero-card-link\.ts";/, rel); assert.doesNotMatch(src, /startsWith/, rel);
    assert.match(src, /card\.href && \(/, rel); assert.match(src, /const label = cardLinkLabel\(card\.title, card\.href\);/, rel); assert.match(src, /<span class="visually-hidden">\{label\}<\/span>/, rel);
    assert.match(src, /import "\.\.\/(\.\.\/)?styles\/hero-card-link\.css";/, rel); assert.doesNotMatch(src, /\bstyle\s*=|<script\b/, rel); assert.match(src, / target="_blank" rel="noopener noreferrer">/, rel);
  }
});
test('REQ-107-06/07/09/10/11/27 (build): a.card-link como último hijo solo en GITHUB y YOUTUBE, sin anidar, y portada < 40 000 B', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html');
  const arts = [...html.matchAll(/<article class="hero-card[^"]*"[^>]*data-color-token="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(arts.length, 15); for (const [, token, inner] of arts) {
    const count = (inner.match(/<a\b/g) ?? []).length; assert.ok(count <= 1, `${token}: ${count} enlaces`);
    if (!LINKS[token]) { assert.doesNotMatch(inner, /card-link/, token); continue; }
    const link = `<a class="card-link" href="${LINKS[token]}" target="_blank" rel="noopener noreferrer"><span class="visually-hidden">${token.toUpperCase()} (sitio externo) (se abre en una pestaña nueva)</span>` // Ajuste feature 110 (precedente REQ-43-06): target, noreferrer y aviso (REQ-110-01/03)
      + '<span class="card-link__arrow" aria-hidden="true">↗</span></a>';
    assert.ok(inner.endsWith(link), `${token}: el último hijo no es el a.card-link esperado`);
  }
  assert.doesNotMatch(html, /<a\b(?:(?!<\/a>)[\s\S])*<a\b/, 'hay un <a> dentro de otro <a>');
  const bytes = Buffer.byteLength(html); assert.ok(bytes < Number(read('tests/search-index-lazy-load.test.mjs').match(/assert\.ok\(size < (\d+),/)[1]), `index.html pesa ${bytes} bytes (REQ-107-27)`); // Ajuste feature 112 (precedente REQ-43-06): umbral vigente de REQ-47-06
});
test('REQ-107-12/14..21: hero-card-link.css cubre la card, muestra la flecha con hover o foco y respeta reduced motion', () => {
  assert.ok(existsSync(new URL(SHEET, ROOT)), `falta ${SHEET}`); assert.ok(lines(SHEET) <= 100, `${SHEET} > 100 líneas`);
  const css = read(SHEET).replace(/\/\*[\s\S]*?\*\//g, ''); assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  const all = blocks(css); const media = (q) => all.filter((b) => b.head === q).flatMap((b) => blocks(b.body));
  const top = all.filter((b) => !b.head.startsWith('@')); const tablet = media('@media (max-width: 1200px)');
  assert.deepEqual([rule(top, '.card-link').position, rule(top, '.card-link').inset, rule(top, '.card-link')['z-index']], ['absolute', '0', '6']);
  const arrow = rule(top, '.card-link__arrow'); assert.deepEqual([arrow.opacity, arrow.top, arrow.right], ['0', '16px', '16px']);
  assert.deepEqual([rule(tablet, '.card-link__arrow').top, rule(tablet, '.card-link__arrow').right], ['14px', '14px']);
  for (const sel of ['.hero-card:hover .card-link__arrow', '.card-link:focus-visible .card-link__arrow']) {
    assert.deepEqual([rule(top, sel).opacity, rule(top, sel).transform], ['1', 'translate(2px, -2px)'], sel);
  }
  const corner = '.hero-card:has(> .card-corner) .card-link__arrow';
  assert.deepEqual([rule(top, corner).right, rule(tablet, corner).right], ['46px', '40px']);
  const header = '.hero-card:has(> .card-link) .card-header'; const both = '.hero-card:has(> .card-link):has(> .card-corner) .card-header';
  assert.deepEqual([rule(top, header).right, rule(tablet, header).right, rule(top, both).right, rule(tablet, both).right], ['46px', '40px', '76px', '66px']);
  const focus = rule(top, '.card-link:focus-visible');
  assert.equal(focus.outline, '2px solid var(--color-accent)'); assert.match(focus['outline-offset'], /^-\d+px$/);
  const calm = rule(media('@media (prefers-reduced-motion: reduce)'), '.card-link__arrow');
  assert.deepEqual([calm.transition, calm.transform], ['none', 'none']);
});
test('REQ-107-22/23/25/26: capturas, informe, tests heredados con la nota y mosaico intacto', () => {
  for (const w of [800, 1024, 1280, 1600]) for (const s of ['rest', 'hover', 'focus']) {
    assert.ok(existsSync(new URL(`progress/research/hero107/github-${w}-${s}.png`, ROOT)), `falta github-${w}-${s}.png`);
  }
  assert.ok(existsSync(new URL('progress/impl_hero-cards-links.md', ROOT)), 'falta el informe');
  const touched = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-template.ts'], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(touched, '', `mosaico tocado: ${touched}`);
  for (const rel of [...COMPONENTS, 'src/domain/entities/hero-card.ts', 'src/domain/repositories/hero-cards-fields-parse.ts',
    'src/domain/repositories/hero-cards-parse.ts', 'tests/hero-cards-links.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
});
