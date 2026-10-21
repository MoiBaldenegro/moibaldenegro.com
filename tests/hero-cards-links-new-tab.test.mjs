// Feature 110 hero-cards-links-new-tab (REQ-110-01..14; specs/110_hero-cards-links-new-tab/). Toda card del hero con
// href abre en pestaña nueva (target="_blank" + rel="noopener noreferrer") con aviso accesible decidido en el dominio.
// La medida CDP (REQ-110-07/08) va en progress/impl_hero-cards-links-new-tab.md.
// Ajuste feature 116 (precedente REQ-43-06): la portada pasa de / a /home (dist/client/home/index.html y src/pages/home.astro).
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { cardLinkLabel } from '../src/domain/hero-card-link.ts';
import { astroBuild } from './helpers/astro-build.mjs';
const ROOT = new URL('../', import.meta.url); const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const COMPONENTS = ['src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro'];
const NEW_TAB = ' (se abre en una pestaña nueva)'; const EXTERNAL = ' (sitio externo)';
const LINK_OPEN = '<a class="card-link" href={card.href} target="_blank" rel="noopener noreferrer">';
const LINK_TAIL = '<span class="card-link__arrow" aria-hidden="true">↗</span></a>';

test('REQ-110-03: una liga https:// lleva « (sitio externo)» seguido de « (se abre en una pestaña nueva)»', () => {
  assert.equal(cardLinkLabel('GITHUB', 'https://github.com/MoiBaldenegro'), `GITHUB${EXTERNAL}${NEW_TAB}`);
  assert.equal(cardLinkLabel('YOUTUBE', 'https://www.youtube.com/@moibaldenegro'), `YOUTUBE${EXTERNAL}${NEW_TAB}`);
});
test('REQ-110-04: una ruta interna (/about) lleva solo « (se abre en una pestaña nueva)»', () => {
  assert.equal(cardLinkLabel('ABOUT', '/about'), `ABOUT${NEW_TAB}`);
  assert.doesNotMatch(cardLinkLabel('ABOUT', '/about'), /sitio externo/);
});
test('REQ-110-01/02/06: hero-card.astro y htb-card.astro pintan el a.card-link con target y rel como último hijo', () => {
  for (const rel of COMPONENTS) {
    const src = read(rel);
    assert.match(src, /import \{ cardLinkLabel \} from "(\.\.\/)+domain\/hero-card-link\.ts";/, rel);
    assert.match(src, /const label = cardLinkLabel\(card\.title, card\.href\);/, rel);
    const link = `{card.href && (\n    ${LINK_OPEN}<span class="visually-hidden">{label}</span>${LINK_TAIL}\n  )}\n</article>`;
    assert.ok(src.trimEnd().endsWith(link), `${rel}: el a.card-link no es el último hijo esperado`);
    assert.equal((src.match(/<a\b/g) ?? []).length, 1, `${rel}: más de un <a>`);
    assert.equal((src.match(/target=/g) ?? []).length, 1, `${rel}: target fuera del a.card-link`);
    assert.doesNotMatch(src, /startsWith|\bstyle\s*=|<script\b|se abre en una pestaña/, rel);
  }
});
test('REQ-110-01/03/05/06/13 (build): GITHUB y YOUTUBE con pestaña nueva y aviso; 13 article sin liga ni target', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/home/index.html'); const data = JSON.parse(read('src/data/hero-cards.json'));
  const arts = [...html.matchAll(/<article class="hero-card[^"]*"[^>]*data-color-token="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(arts.length, 15); let linked = 0;
  for (const [, token, inner] of arts) {
    const card = data.find((c) => c.colorToken === token); assert.ok(card, `${token} sin card en el JSON`);
    assert.ok((inner.match(/<a\b/g) ?? []).length <= 1, `${token}: más de un enlace`);
    if (!card.href) { assert.doesNotMatch(inner, /card-link|target=/, token); continue; }
    linked++; const label = `${card.title}${card.href.startsWith('https://') ? EXTERNAL : ''}${NEW_TAB}`;
    const link = `<a class="card-link" href="${card.href}" target="_blank" rel="noopener noreferrer">`
      + `<span class="visually-hidden">${label}</span>${LINK_TAIL}`;
    assert.ok(inner.endsWith(link), `${token}: el último hijo no es el a.card-link esperado`);
  }
  assert.equal(linked, 2, 'se esperaban GITHUB y YOUTUBE con liga');
  assert.match(html, /<span class="visually-hidden">GITHUB \(sitio externo\) \(se abre en una pestaña nueva\)<\/span>/);
  assert.doesNotMatch(html, /<a\b(?:(?!<\/a>)[\s\S])*<a\b/, 'hay un <a> dentro de otro <a>');
  const limit = Number(read('tests/search-index-lazy-load.test.mjs').match(/assert\.ok\(size < (\d+),/)?.[1]);
  const bytes = Buffer.byteLength(html); assert.ok(bytes < limit, `index.html pesa ${bytes} bytes (umbral ${limit})`);
});
test('REQ-110-13/14: el umbral de REQ-47-06 sigue en 40 000 B o, si subió, a 42 000 B con la nota y la justificación', () => {
  const src = read('tests/search-index-lazy-load.test.mjs'); const limit = Number(src.match(/assert\.ok\(size < (\d+),/)?.[1]);
  assert.ok(limit === 40000 || limit === 42000, `umbral ${limit}`);
  if (limit !== 40000) assert.match(src, /Ajuste feature 11[02] \(precedente REQ-43-06\)[^\n]*2026-10-20/); // Ajuste feature 112 (precedente REQ-43-06): la subida la hizo la 112
});
test('REQ-110-09: capturas de GITHUB y YOUTUBE a 375/800/1024/1280/1600 px', () => {
  for (const card of ['github', 'youtube']) for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero110/${card}-${w}.png`, ROOT)), `falta ${card}-${w}.png`);
  }
});
test('REQ-110-10/12: test solo con node:, archivos <= 100 líneas y about/footer sin tocar', () => {
  const imports = [...read('tests/hero-cards-links-new-tab.test.mjs').matchAll(/(?:^|; )import [^;]*? from '([^']+)'/gm)].map((m) => m[1]);
  assert.ok(imports.every((m) => m.startsWith('node:') || m.startsWith('../src/') || m.startsWith('./helpers/')), imports.join());
  for (const rel of [...COMPONENTS, 'src/domain/hero-card-link.ts', 'tests/hero-cards-links-new-tab.test.mjs',
    'tests/hero-cards-links.test.mjs', 'tests/hero-card-link-domain.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  const touched = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/components/about/about-hero.astro',
    'src/components/about/about-projects.astro' /* Ajuste feature 116 (precedente REQ-43-06): sale site-footer.astro, su logo apunta a /home (REQ-116-10) */], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(touched, '', `tocados: ${touched}`);
});
