// Test de las pistas de carga de imágenes (feature 48 image-loading-hints,
// REQ-48-01..07): width/height en cada <img (CLS), fetchpriority en la imagen
// LCP, lazy + decoding async en miniaturas y CSS que no deforma la imagen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const FILES = {
  layout: 'src/layouts/Layout.astro',
  hero: 'src/components/new-hero/new-hero.astro',
  latest: 'src/components/latest-articles.astro',
  post: 'src/pages/posts/[id].astro',
  item: 'src/components/search-results/item-html.ts',
};
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

test('REQ-48-01: cada <img de los cinco archivos declara width y height', () => {
  for (const rel of Object.values(FILES)) {
    const tags = imgs(rel);
    assert.ok(tags.length > 0, `${rel} sin img`);
    for (const tag of tags) {
      assert.match(tag, /\swidth=/, `${rel}: img sin width → ${tag}`);
      assert.match(tag, /\sheight=/, `${rel}: img sin height → ${tag}`);
    }
  }
});

test('REQ-48-02: el logo declara width="72" y height="25"', () => {
  const logo = one(FILES.layout, /mxvi_logo/);
  assert.match(logo, /width="72"/);
  assert.match(logo, /height="25"/);
});

test('REQ-48-03: la imagen LCP (hero y portada del post) con fetchpriority="high" y sin lazy', () => {
  for (const tag of [one(FILES.hero, /profile\.image/), one(FILES.post, /post__image/)]) {
    assert.match(tag, /fetchpriority="high"/, tag);
    assert.doesNotMatch(tag, /loading="lazy"/, tag);
  }
});

test('REQ-48-04: miniaturas con loading="lazy" y decoding="async"', () => {
  const thumbs = [one(FILES.latest, /latest-articles__image/), one(FILES.post, /post__related-thumb/), one(FILES.item, /search-results__thumb/)];
  for (const tag of thumbs) {
    assert.match(tag, /loading="lazy"/, tag);
    assert.match(tag, /decoding="async"/, tag);
    assert.doesNotMatch(tag, /fetchpriority/, tag);
  }
});

// Ajuste feature 65 (precedente REQ-43-06): aspect-ratio u object-fit no bastan, porque el atributo
// height="768" fija el alto si el CSS no lo anula. Se exige height: auto o un height explícito.
test('REQ-48-05: el CSS de las imágenes declara height: auto o un height explícito', () => {
  const rules = [
    ['src/styles/post.css', '.post__image'],
    ['src/styles/latest-articles.css', '.latest-articles__image'],
    ['src/styles/post-next.css', '.post__related-thumb'],
    ['src/styles/search-results.css', '.search-results__thumb'],
    ['src/styles/profile-card.css', '.profile-image img'],
  ];
  for (const [rel, selector] of rules) {
    const body = cssRule(rel, selector);
    assert.ok(body, `${rel}: falta ${selector}`);
    assert.match(body, /(^|[;\s])height:\s*[^;]+/, `${rel} ${selector} podría deformar la imagen`);
  }
});

test('REQ-48-07: los archivos tocados no superan 100 líneas', () => {
  for (const rel of Object.values(FILES)) assert.ok(read(rel).split('\n').length <= 100, rel);
});
