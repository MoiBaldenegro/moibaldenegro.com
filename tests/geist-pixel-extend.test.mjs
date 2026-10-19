// Feature 87 geist-pixel-extend: Geist Pixel (--font-display) en header, títulos de cards y tags
// (REQ-87-01..07, 19). Spec: specs/87_geist-pixel-extend/. Lo de navegador (REQ-87-08..15) se
// verifica con Chrome headless + CDP y se documenta en progress/impl_87.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const cwd = fileURLToPath(root);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const TYPO = 'src/styles/typography.css';
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (css) => [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, sel, body]) => ({ sels: sel.split(',').map((s) => s.trim().replace(/\s+/g, ' ')), body }));

const SELECTORS = [
  '.site-navbar nav a', '.site-navbar .search-bar__input', // REQ-87-01 header
  '.hero-card .card-title', '.latest-articles__title', '.post__related .post__related-link', // REQ-87-02
  '.latest-articles__tag', '.search-results__tag', '.post__hero .post__kicker', // REQ-87-03 tags
];

const UNCHANGED = [
  // hero-card.css sale de la lista: gana la regla [data-color-token="htb"] (REQ-92-03, precedente REQ-43-06)
  // layout.css sale de la lista: Ajuste feature 94 (REQ-94-01..05, precedente REQ-43-06): sticky footer en body
  // site-menu.css y search-bar.css salen de la lista: Ajuste feature 93 (precedente REQ-43-06): corte 969 px y apertura suave (REQ-93-09/27)
  'src/styles/latest-articles.css', 'src/styles/latest-horizontal.css', 'src/styles/post-next.css',
  'src/styles/post-header.css', 'src/styles/search-results.css', // Layout.astro sale de la lista: monta SiteFooter (REQ-89-04, precedente REQ-43-06)
  // hero-card.astro sale de la lista: Ajuste feature 98 (precedente REQ-43-06): data-col-span/data-row-span (REQ-98-17)
  'src/components/latest-articles.astro', 'src/pages/posts/[id].astro',
  'src/components/search-results/item-html.ts', 'tests/geist-pixel-display.test.mjs',
];

const changedVsHead = (files) => {
  try {
    execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...files], { cwd, stdio: 'ignore' });
    return [];
  } catch {
    return files.filter((f) => {
      try { execFileSync('git', ['diff', '--quiet', 'HEAD', '--', f], { cwd, stdio: 'ignore' }); return false; } catch { return true; }
    });
  }
};

for (const sel of SELECTORS) {
  test(`REQ-87-01/02/03/04: ${sel} en var(--font-display) con font-synthesis: none`, () => {
    const rule = rules(read(TYPO)).find((r) => r.sels.includes(sel));
    assert.ok(rule, `typography.css no tiene regla para ${sel}`);
    assert.match(rule.body, /font-family:\s*var\(--font-display\)\s*;?/);
    assert.match(rule.body, /font-synthesis:\s*none\s*;?/);
  });
}

test('REQ-87-05: la regla h1, h2 sigue intacta y solo hay tokens de fuente, sin almohadilla ni colores', () => {
  const css = read(TYPO);
  const h = rules(css).find((r) => [...r.sels].sort().join() === 'h1,h2');
  assert.ok(h, 'falta la regla h1, h2 de la feature 86');
  assert.match(h.body, /font-family:\s*var\(--font-display\)/);
  assert.ok(!css.includes('#'), 'typography.css contiene el carácter almohadilla');
  assert.doesNotMatch(css, /rgba?\(|hsla?\(/i);
  const families = [...stripComments(css).matchAll(/font-family:\s*([^;}]+)/g)].map(([, v]) => v.trim());
  assert.deepEqual(families.filter((v) => !['var(--font-display)', 'var(--font-mono)'].includes(v)), []);
});

test('REQ-87-06/07/19: hojas de componente, marcado y el test de la 86 sin cambios frente a HEAD', { skip: !existsSync(new URL('.git', root)) }, () => {
  assert.deepEqual(changedVsHead(UNCHANGED), []);
});

test('REQ-87-07: los tags siguen siendo span/p sin enlace', () => {
  assert.match(read('src/components/latest-articles.astro'), /<span class="latest-articles__tag">/);
  assert.match(read('src/components/search-results/item-html.ts'), /<span class="search-results__tag">/);
  assert.match(read('src/pages/posts/[id].astro'), /<p class="post__kicker">/);
});

test('REQ-87-19: typography.css mide 100 líneas o menos', () => {
  assert.ok(read(TYPO).trimEnd().split(/\r?\n/).length <= 100);
});
