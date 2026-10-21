// Feature 107 hero-cards-links, ronda 2 (REQ-107-29..36; specs/107_hero-cards-links/ Decisión 7): los <use> del hero
// solo llevan href (sin xlink:href obsoleto) para que la portada siga < 40 000 B con el enlace. La CDP de REQ-107-32/33 va en el impl.
// Ajuste feature 116 (precedente REQ-43-06): la portada pasa de / a /home (dist/client/home/index.html y src/pages/home.astro).
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url); const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const NOTE = 'Ajuste feature 107 (precedente REQ-43-06)';

test('REQ-107-29: hero-card.astro pinta cada <use> solo con href (icono, fondo y esquina) y sin xlink', () => {
  const src = read('src/components/hero-card.astro') + read('src/components/hero-card-art.astro'); assert.doesNotMatch(src, /xlink/); // Ajuste feature 112 (precedente REQ-43-06): icono y fondo en hero-card-art.astro
  for (const field of ['icon', 'backgroundIcon', 'cornerIcon']) assert.match(src, new RegExp(`<use href=\\{card\\.${field}\\}/>`), field);
  assert.equal((src.match(/<use\b/g) ?? []).length, 3);
});
// Ajuste feature 111 (precedente REQ-43-06): el número esperado de <use href> es la suma de refs del JSON (19 hoy; REQ-111-07).
test('REQ-107-30/31/35 (build): 0 xlink:href, tantos <use href> como icon + cornerIcon + backgroundIcon del JSON y portada < 40 000 B', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/home/index.html'); assert.equal((html.match(/xlink:href/g) ?? []).length, 0, 'quedan xlink:href');
  const arts = [...html.matchAll(/<article class="hero-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map((m) => m[1]).join('');
  const uses = [...arts.matchAll(/<use\b([^>]*)>/g)].map((m) => m[1]);
  for (const attrs of uses) assert.match(attrs, /^ href="\/assets\/svg\/sprite\.svg#[\w-]+"$/, `use con otros atributos: ${attrs}`);
  const expected = JSON.parse(read('src/data/hero-cards.json')).flatMap((c) => [c.backgroundIcon, c.icon, c.cornerIcon]) /* Ajuste feature 112 (precedente REQ-43-06): también los logos de la rica (REQ-112-06) */.filter(Boolean);
  assert.equal(uses.length, expected.length); assert.deepEqual(uses.map((a) => a.slice(7, -1)).sort(), expected.sort());
  const bytes = Buffer.byteLength(html); assert.ok(bytes < Number(read('tests/search-index-lazy-load.test.mjs').match(/assert\.ok\(size < (\d+),/)[1]), `index.html pesa ${bytes} bytes (REQ-47-06)`); // Ajuste feature 112 (precedente REQ-43-06): umbral vigente de REQ-47-06
});
test('REQ-107-34: el test de la 103 espera <use href> sin xlink con la nota de ajuste y <= 100 líneas', () => {
  const rel = 'tests/hero-cards-extra-logos.test.mjs'; const src = read(rel);
  assert.doesNotMatch(src, /xlink/); assert.match(src, /<use href="\$\{href\}"><\/use>/); assert.ok(src.includes(NOTE), 'sin nota');
  assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
});
// Ajuste feature 111 (precedente REQ-43-06): hero-card.css sale de la lista (base de cloudflare a los datos del JSON, REQ-111-09).
test('REQ-107-26/27/36: git diff no toca about-hero, site-footer, tokens.css ni el umbral de REQ-47-06', () => {
  const paths = ['src/components/about/about-hero.astro', /* Ajuste feature 116 (precedente REQ-43-06): sale site-footer.astro, su logo apunta a /home (REQ-116-10) */
    /* Ajuste feature 113 (precedente REQ-43-06): sale tokens.css, la 113 cambia sus morados (REQ-113-01..05) */]; // Ajuste feature 112 (precedente REQ-43-06): el umbral de REQ-47-06 sube a 42 000 B en la 112 (REQ-112-25; lo vigila tests/hero-rich-card-logos.test.mjs)
  const touched = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', ...paths], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(touched, '', `tocados: ${touched}`);
});
test('REQ-107-32/33/35: el informe anota la ronda 2 con el peso, el margen y la CDP de los <use>', () => {
  const report = read('progress/impl_hero-cards-links.md'); const r2 = report.slice(report.indexOf('## Ronda 2'));
  assert.ok(report.includes('## Ronda 2'), 'falta la sección Ronda 2');
  for (const word of ['Antes', 'Después', 'Margen', 'getBoundingClientRect', '375', '1280']) assert.ok(r2.includes(word), `Ronda 2 sin ${word}`);
});
