// Tests del fondo de bloques de código (fix 2026-09-19).
//
// Causa raíz (verificada en dist/client/posts/): Astro/Shiki resalta los
// bloques ```text (02-principios) y ```c# (03-principios_solid) con el tema
// github-dark e inyecta style="background-color:#24292e" inline en cada
// <pre class="astro-code">. Ese negro pisa --color-surface (#101018) de
// post.css y el bloque se ve de otro negro distinto al de la página.
//   REQ-CB-01 — article.css iguala el fondo del pre resaltado a la
//               superficie del sitio con !important (precedente
//               hero-card.css: el inline de terceros solo cede ante
//               !important) y fija borde y texto con tokens.
//   REQ-CB-02 — el <code> interno del bloque queda transparente y sin el
//               padding del código inline (regla .post__content code).
//   REQ-CB-03 — el override usa solo tokens (sin hex ni rgb()) y article.css
//               conserva ≤100 líneas y sin clases muertas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const CSS_PATH = new URL('../src/styles/article.css', import.meta.url);

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/article.css no existe (REQ-CB-01)');
  return readFileSync(CSS_PATH, 'utf8');
}

function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

test('REQ-CB-01: el pre resaltado iguala la superficie del sitio', () => {
  const css = readCss();
  const rule = css.match(/\.post__content\s+pre\.astro-code\s*\{([\s\S]*?)\}/);
  assert.ok(rule, 'article.css no declara la regla .post__content pre.astro-code (REQ-CB-01)');
  assert.match(rule[1], /background:\s*var\(--color-surface\)\s*!important/, 'el fondo no iguala --color-surface con !important (REQ-CB-01)');
  assert.match(rule[1], /border-color:\s*var\(--color-border\)/, 'el borde no usa --color-border (REQ-CB-01)');
  assert.match(rule[1], /color:\s*var\(--color-text\)/, 'el texto no usa --color-text (REQ-CB-01)');
});

test('REQ-CB-02: el code interno queda transparente y sin padding', () => {
  const css = readCss();
  const rule = css.match(/\.post__content\s+pre\.astro-code\s+code\s*\{([\s\S]*?)\}/);
  assert.ok(rule, 'article.css no declara la regla .post__content pre.astro-code code (REQ-CB-02)');
  assert.match(rule[1], /background:\s*transparent/, 'el code interno no queda transparente (REQ-CB-02)');
  assert.match(rule[1], /padding:\s*0/, 'el code interno conserva el padding del inline (REQ-CB-02)');
});

test('REQ-CB-03: solo tokens y límite de líneas', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'article.css contiene hex hardcodeado (REQ-CB-03)');
  assert.doesNotMatch(css, /rgba?\(/, 'article.css contiene rgb()/rgba() hardcodeado (REQ-CB-03)');
  const lineCount = countLines(readFileSync(CSS_PATH, 'utf8'));
  assert.ok(lineCount <= 100, `article.css tiene ${lineCount} líneas (máximo 100, REQ-CB-03)`);
});
