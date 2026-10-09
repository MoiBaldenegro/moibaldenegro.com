// Feature 63 (theme-color-dark): el manifest declaraba theme_color/background_color
// #ffffff con un sitio de tema oscuro. THEME_COLOR (src/domain/seo/theme.ts) replica
// --color-background y alimenta el manifest y la meta theme-color del layout único.
// Spec: specs/63_theme-color-dark/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const THEME_URL = new URL('../src/domain/seo/theme.ts', import.meta.url);
const tokenBackground = () => read('src/styles/tokens.css').match(/--color-background:[ ]*(#[0-9a-fA-F]{3,8});/)[1];
const countLines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
const themeColor = async () => {
  assert.ok(existsSync(THEME_URL), 'falta src/domain/seo/theme.ts (REQ-63-01)');
  return (await import(THEME_URL.href)).THEME_COLOR;
};

test('REQ-63-01/02: THEME_COLOR, theme_color y background_color valen --color-background', async () => {
  const token = tokenBackground();
  assert.equal(await themeColor(), token, 'THEME_COLOR debe igualar --color-background (REQ-63-01)');
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.theme_color, token, 'theme_color (REQ-63-02)');
  assert.equal(manifest.background_color, token, 'background_color (REQ-63-02)');
});

test('REQ-63-03: Layout.astro emite una única meta theme-color con {THEME_COLOR}', () => {
  const layout = read('src/layouts/Layout.astro');
  const metas = layout.match(/<meta[^>]*name="theme-color"[^>]*>/g) ?? [];
  assert.equal(metas.length, 1, 'debe haber exactamente una meta theme-color');
  assert.match(metas[0], /content=[{]THEME_COLOR[}]/);
});

test('REQ-63-04: Layout.astro importa THEME_COLOR y no tiene literales hexadecimales', () => {
  const layout = read('src/layouts/Layout.astro');
  assert.match(layout, /import[ ]*[{][^}]*THEME_COLOR[^}]*[}][ ]*from[ ]*'..[/]domain[/]seo[/]theme.ts'/);
  assert.doesNotMatch(layout, /#[0-9a-fA-F]{3,8}[^0-9a-zA-Z_-]/, 'literal hexadecimal en Layout.astro');
});

test('REQ-63-05 (build): portada, about y un post llevan la meta theme-color', async () => {
  const expected = `<meta name="theme-color" content="${tokenBackground()}">`;
  const out = mkdtempSync(join(tmpdir(), 'theme-color-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const post = readdirSync(join(out, 'client', 'posts'))[0];
    for (const page of ['index.html', join('about', 'index.html'), join('posts', post, 'index.html')]) {
      const html = readFileSync(join(out, 'client', page), 'utf8');
      assert.ok(html.includes(expected), `${page} no contiene ${expected}`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-63-07: Layout.astro y theme.ts no superan 100 líneas', () => {
  assert.ok(countLines(read('src/layouts/Layout.astro')) <= 100, 'Layout.astro supera 100 líneas');
  assert.ok(existsSync(THEME_URL), 'falta src/domain/seo/theme.ts');
  assert.ok(countLines(read('src/domain/seo/theme.ts')) <= 100, 'theme.ts supera 100 líneas');
});
