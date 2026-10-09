// Test de nombres accesibles de enlaces e imágenes (feature 53
// link-image-accessible-names, REQ-53-01..07): imágenes decorativas junto a
// títulos con alt="", logo que describe el destino, aviso de sitio externo,
// fila de recomendado clicable y cards sin el título duplicado en el build.
// Ajuste feature 66 (precedente REQ-43-06): el dominio del sitio pasa a moisesbaldenegro.com.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const imgs = (rel) => [...read(rel).matchAll(/<img\b[\s\S]*?\/?>/g)].map((m) => m[0]);
const one = (rel, pattern) => {
  const found = imgs(rel).filter((tag) => pattern.test(tag));
  assert.equal(found.length, 1, `${rel}: se esperaba una img que cumpla ${pattern}`);
  return found[0];
};
const cssRule = (rel, selector) => {
  const css = read(rel).replace(/\/\*[\s\S]*?\*\//g, '');
  const at = css.indexOf(`${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('REQ-53-01: las imágenes junto a un título enlazado o un h1 llevan alt=""', () => {
  const tags = [
    one('src/components/latest-articles.astro', /latest-articles__image/),
    one('src/components/search-results/item-html.ts', /search-results__thumb/),
    one('src/pages/posts/[id].astro', /post__image/),
    one('src/pages/posts/[id].astro', /post__related-thumb/),
  ];
  for (const tag of tags) assert.match(tag, /\salt=""/, tag);
});

test('REQ-53-02: el logo describe el destino del enlace', () => {
  assert.match(one('src/layouts/Layout.astro', /mxvi_logo/), /alt="Inicio — moisesbaldenegro\.com"/);
});

test('REQ-53-03: el enlace a X avisa de sitio externo', () => {
  assert.match(read('src/layouts/Layout.astro'),
    /<a href="https:\/\/x\.com\/moibaldenegro">@moibaldenegro<span class="visually-hidden"> \(X, sitio externo\)<\/span><\/a>/);
});

test('REQ-53-04: la fila del recomendado es clicable con ::after', () => {
  assert.match(cssRule('src/styles/post-next.css', '.post__related-item'), /position:\s*relative/);
  const after = cssRule('src/styles/post-next.css', '.post__related-link::after');
  assert.match(after, /content:\s*""/);
  assert.match(after, /position:\s*absolute/);
  assert.match(after, /inset:\s*0/);
});

test('REQ-53-05 (build): ninguna card de la portada repite el título en el alt', () => {
  const out = mkdtempSync(join(tmpdir(), 'names-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = readFileSync(join(out, 'client', 'index.html'), 'utf8');
    const cards = [...html.matchAll(/<a class="latest-articles__link"[\s\S]*?<\/a>/g)].map((m) => m[0]);
    assert.ok(cards.length > 0, 'no hay cards en la portada');
    for (const card of cards) {
      // El título de la card es h3 desde la feature 55.
      const title = card.match(/<h3[^>]*>([^<]+)<\/h3>/)?.[1];
      const alt = card.match(/<img[^>]*alt="([^"]*)"/)?.[1];
      assert.ok(title, 'card sin título');
      assert.notEqual(alt, title, `la card «${title}» repite el título en el alt`);
      assert.equal(alt, '', `la imagen de la card «${title}» no es decorativa`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-53-07: los archivos tocados no superan 100 líneas', () => {
  for (const rel of ['src/layouts/Layout.astro', 'src/components/latest-articles.astro', 'src/pages/posts/[id].astro',
    'src/components/search-results/item-html.ts', 'src/styles/post-next.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
