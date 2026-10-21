// Test de la feature 97 hero-cards-unique-tech (REQ-97-01..10). Spec: specs/97_hero-cards-unique-tech/. Ajustes 98/99
// (precedente REQ-43-06): la tabla pasa a la de specs/99_hero-os-panel-mosaic/design.md (REQ-98-01..05, 24..27, REQ-99-01).
//   datos y sprite único · tokens · reglas CSS · contraste · htb (personalizada, primera) · featured.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const cards = () => JSON.parse(read('src/data/hero-cards.json'));
const SPRITE = '/assets/svg/sprite.svg#';

// Ajuste feature 99 (precedente REQ-43-06): tabla y orden de specs/99_hero-os-panel-mosaic/design.md (REQ-99-01);
// valores «inicial» de cloudflare y de las cards que cambian de tamaño ajustados con la medida CDP (impl de la 99). Ajuste feature 111 (precedente REQ-43-06): cloudflare congelada con los datos actuales del humano (#cloudflare-cloud, 270px, scale 8; REQ-111-08).
const TABLE = [
  ['rust', 'RUST', 'tech', '115px', -8], ['aws', 'AWS', 'tech', '120px', -6],
  ['cloudflare', 'CLOUDFLARE', 'tech', '270px', 0, 'cloudflare-cloud', 8], ['node', 'NODE JS', 'tech', '165px', -10],
  ['nestjs', 'NESTJS', 'tech', '160px', -5], ['css', 'CSS', 'tech', '105px', -8],
  ['react', 'REACT', 'tech', '115px', -8], ['html', 'HTML', 'tech', '115px', -7],
  ['claude-code', 'CLAUDE CODE', 'tech', '115px', 0], ['bun', 'BUN', 'tech', '115px', -8],
  ['claude', 'CLAUDE', 'tech', '110px', -8], ['typescript', 'TYPESCRIPT', 'tech', '150px', -10],
  ['youtube', 'YOUTUBE', 'social', '115px', -8], ['github', 'GITHUB', 'social', '115px', -8],
];
const FEATURED = ['node', 'nestjs', 'typescript'];
// Ajuste feature 101 (precedente REQ-43-06): NestJS a #3A0D18 y su ancho base de escritorio a 230px (REQ-101-01/04).
const TOKENS = { rust: '#A33A16', aws: '#232F3E', 'claude-code': '#5C2A1C', nestjs: '#3A0D18', cloudflare: '#A8470C', claude: '#B4532F', bun: '#3D2B1F' };
const OLD_TOKENS = ['twitch', 'twitch-bottom', 'node-bottom', 'github-bottom', 'youtube-bottom', 'overlay-strong', 'overlay-soft'];
const HTB = { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb', showOnMobile: true, href: null, icon: '/assets/svg/sprite.svg#htb', backgroundIcon: '/assets/svg/sprite.svg#htb-wordmark', backgroundIconSize: 'sm' }; // Ajuste feature 106 (precedente REQ-43-06); Ajuste feature 107 (precedente REQ-43-06): href null; Ajuste feature 112 (precedente REQ-43-06): logos (REQ-112-06)
const ruleOf = (css, token) => css.match(new RegExp(`\\[data-color-token="${token}"\\]\\s*\\{([^}]*)\\}`))?.[1];
const base = () => read('src/styles/hero-card.css').replace(/\/\*[\s\S]*?\*\//g, '').split('@media')[0];

test('REQ-98-01..04: 12 tecnologías y 2 redes, sin redes fuera de YouTube/GitHub y sin fragmentos repetidos', () => {
  const icons = cards().filter((card) => card.kind === undefined);
  assert.equal(icons.filter((card) => card.category === 'tech').length, 12, 'se esperaban 12 tecnologías');
  assert.deepEqual(icons.filter((card) => card.category === 'social').map((card) => card.title), ['YOUTUBE', 'GITHUB']);
  const fragments = cards().filter((card) => card.icon).map((card) => card.icon.split('#')[1]);
  assert.equal(new Set(fragments).size, fragments.length, `fragmentos repetidos: ${fragments.join(', ')}`);
  for (const banned of ['twitch', 'instagram', 'x', 'linkedin', 'strava', 'verified', 'htb-wordmark']) {
    assert.ok(!fragments.includes(banned), `queda una tarjeta con #${banned} (REQ-98-03)`);
  }
});

test('REQ-98-01/02/05: cada entrada coincide con la tabla de design.md y no declara celda', () => {
  const data = cards();
  assert.equal(data.length, TABLE.length + 1, 'se esperaban 14 de icono + htb');
  TABLE.forEach(([id, title, category, iconWidth, rotate, fragment = id, scale = 5], index) => {
    const card = data[index + 1];
    assert.equal(card.id, id, `posición ${index + 2}: se esperaba ${id}, hay ${card.id}`);
    assert.deepEqual({ title: card.title, colorToken: card.colorToken, icon: card.icon, category: card.category, iconWidth: card.iconWidth, rotate: card.rotate, scale: card.scale },
      { title, colorToken: id, icon: `${SPRITE}${fragment}`, category, iconWidth, rotate, scale }, id);
  });
  for (const card of data) assert.ok(!('gridColumn' in card) && !('gridRow' in card), `${card.id} declara celda`);
});

test('REQ-99-01: solo node, nestjs y typescript declaran featured true (las demás lo omiten o lo dejan en false)', () => {
  for (const card of cards().slice(1)) assert.equal(card.featured ?? false, FEATURED.includes(card.id), `${card.id}: featured`);
  assert.equal(cards().filter((card) => card.featured === true).length, FEATURED.length);
});

test('REQ-97-05/06 y REQ-98-24/26: tokens de marca nuevos, sin los retirados y tokens.css <= 100 líneas', () => {
  const tokens = read('src/styles/tokens.css');
  for (const [id, hex] of Object.entries(TOKENS)) {
    assert.match(tokens, new RegExp(`--color-marca-${id}:\\s*${hex};`, 'i'), `falta --color-marca-${id}: ${hex}`);
  }
  for (const id of OLD_TOKENS) assert.doesNotMatch(tokens, new RegExp(`--color-(marca-)?${id}\\s*:`), `sigue --color-${id}`);
  assert.ok(tokens.split('\n').length <= 100, 'tokens.css supera 100 líneas');
  for (const file of readdirSync(new URL('../src/styles/', import.meta.url))) {
    assert.doesNotMatch(read(`src/styles/${file}`), /--color-overlay-(strong|soft)/, `${file} referencia un overlay retirado`);
  }
});

test('REQ-97-07/08 y REQ-98-27: hero-card.css tiene una regla por token con su fondo e icono base', () => {
  const css = base();
  for (const [id, , , tableWidth, rotate] of TABLE.filter(([id]) => id in TOKENS)) {
    const rule = ruleOf(css, id); const iconWidth = id === 'nestjs' ? '230px' : tableWidth; // Ajuste feature 101 (precedente REQ-43-06)
    assert.ok(rule, `falta [data-color-token="${id}"]`);
    assert.match(rule, new RegExp(`--card-bg:\\s*var\\(--color-marca-${id}\\);`), `${id}: --card-bg`);
    assert.match(rule, new RegExp(`--icon-width:\\s*${iconWidth};`), `${id}: --icon-width ${iconWidth}`);
    assert.match(rule, new RegExp(`--icon-rotation:\\s*${rotate}deg;`), `${id}: --icon-rotation ${rotate}deg`);
  }
  for (const id of OLD_TOKENS) assert.equal(ruleOf(css, id), undefined, `sigue la regla de ${id}`);
});

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test('REQ-97-09 y REQ-98-25: cada token nuevo alcanza contraste >= 4,5:1 frente a #ffffff', () => {
  for (const [id, hex] of Object.entries(TOKENS)) {
    const ratio = (luminance('#FFFFFF') + 0.05) / (luminance(hex) + 0.05);
    assert.ok(ratio >= 4.5, `${id} ${hex}: contraste ${ratio.toFixed(2)} < 4,5`);
  }
});

test('REQ-97-10 (Ajuste feature 98, precedente REQ-43-06): htb es la primera entrada y su regla solo da fondo', () => {
  assert.deepEqual(cards()[0], HTB);
  assert.equal(ruleOf(base(), 'htb')?.trim(), '--card-bg: var(--color-marca-htb);');
});
