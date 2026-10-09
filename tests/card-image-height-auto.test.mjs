// Feature 65 (card-image-height-auto): regresión de la feature 48. Los <img> llevan
// width="1376" height="768" (CLS) pero su CSS no declaraba height: auto, así que el atributo
// height fijaba 768 px y las cards salían estrechas y altísimas. Spec: specs/65_*/.
// Verificación en navegador (REQ-65-07) en progress/impl_65.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');
const STYLES = readdirSync(new URL('../src/styles/', import.meta.url)).filter((f) => f.endsWith('.css'));
// Cuerpos de todas las reglas cuyo selector (último de la lista) termina en `selector`.
const rulesFor = (css, selector) => [...strip(css).matchAll(/([^{}]+)[{]([^{}]*)[}]/g)]
  .filter(([, sel]) => sel.split(',').some((s) => s.trim().endsWith(selector))).map(([, , body]) => body);
const HEIGHT_AUTO = /(^|[;\s])height:[ ]*auto/;
const HEIGHT_SET = /(^|[;\s])height:[ ]*[^;]+/;

test('REQ-65-01..04: las cuatro reglas de imágenes de card declaran height: auto', () => {
  const cases = [
    [['src/styles/post.css', 'src/styles/post-header.css'], '.post__image'],
    [['src/styles/latest-articles.css'], '.latest-articles__image'],
    [['src/styles/post-next.css'], '.post__related-thumb'],
    [['src/styles/search-results.css'], '.search-results__thumb'],
  ];
  for (const [files, selector] of cases) {
    const bodies = files.flatMap((f) => rulesFor(read(f), selector));
    assert.ok(bodies.some((b) => HEIGHT_AUTO.test(b)), `${selector} sin height: auto en ${files.join(' / ')}`);
  }
});

const FILES = ['src/layouts/Layout.astro', 'src/components/new-hero/new-hero.astro', 'src/components/latest-articles.astro',
  'src/pages/posts/[id].astro', 'src/components/search-results/item-html.ts'];

test('REQ-65-05: las portadas y miniaturas conservan width="1376" height="768"', () => {
  for (const rel of FILES.slice(2)) {
    const tags = [...read(rel).matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    assert.ok(tags.length > 0, `${rel} sin <img`);
    for (const tag of tags) assert.ok(/width="1376"/.test(tag) && /height="768"/.test(tag), `${rel}: ${tag}`);
  }
});

test('REQ-65-06: todo <img con atributo height y clase (propia o del contenedor) tiene height en su CSS', () => {
  const css = STYLES.map((f) => read(`src/styles/${f}`)).join('\n');
  let checked = 0;
  for (const rel of FILES) {
    const src = read(rel);
    for (const m of src.matchAll(/<img\b[^>]*>/g)) {
      if (!/[ \n]height="/.test(m[0])) continue;
      const own = m[0].match(/class="([^"]+)"/)?.[1].split(/ +/)[0];
      const parent = src.slice(0, m.index).match(/<[a-z]+[^<>]*class="([^"]+)"[^<>]*>[\s]*$/)?.[1].split(/ +/)[0];
      const selector = own ? `.${own}` : parent ? `.${parent} img` : null;
      if (!selector) continue; // sin clase propia ni contenedor con clase (p. ej. el logo)
      checked++;
      const bodies = rulesFor(css, selector);
      assert.ok(bodies.some((b) => HEIGHT_AUTO.test(b) || HEIGHT_SET.test(b)), `${rel}: ${selector} sin height en src/styles`);
    }
  }
  assert.ok(checked >= 5, `solo se comprobaron ${checked} imágenes`);
});

test('REQ-65-09: hojas y tests tocados ≤100 líneas', () => {
  for (const rel of ['src/styles/post.css', 'src/styles/post-header.css', 'src/styles/latest-articles.css', 'src/styles/post-next.css',
    'src/styles/search-results.css', 'tests/card-image-height-auto.test.mjs', 'tests/image-loading-hints.test.mjs']) {
    const src = read(rel);
    assert.ok(src.split('\n').length - (src.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
