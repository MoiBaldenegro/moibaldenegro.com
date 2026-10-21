// Test de la feature 113 purple-to-logo-tone (REQ-113-01..12): los morados del
// sitio pasan al tono del logotipo (#6C387A, hue 287,3, sat 37,1 %). REQ-113-13
// (portada < 42 000 B tras el build) lo cubre tests/search-index-lazy-load.test.mjs.
// Excepción documentada: public/assets/svg/sprite.svg (#639 de CSS, ajeno) y
// src/content/ quedan fuera del detector.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const TOKENS = read('src/styles/tokens.css');
const token = (name) => {
  const m = TOKENS.match(new RegExp(`${name}:\\s*([^;]+);`));
  assert.ok(m, `falta ${name} en tokens.css`);
  return m[1].trim();
};
const SCAN_DIRS = ['src/styles', 'src/components', 'src/layouts', 'src/pages', 'src/domain', 'src/data'];
const COLOR_RE = /#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{3,4}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;
const NAMED_RE = /\b(purple|violet|indigo|rebeccapurple|blueviolet|darkviolet|mediumpurple|darkorchid|mediumorchid|orchid|plum|magenta|fuchsia|lavender|thistle)\b/gi;

const walk = (rel) => readdirSync(join(ROOT, rel)).flatMap((name) =>
  (statSync(join(ROOT, rel, name)).isDirectory() ? walk(`${rel}/${name}`) : [`${rel}/${name}`]));

// Devuelve [r, g, b] en 0..255 (rgb() con valores <= 1 se trata como 0..1, p. ej. cv-pdf.ts), o null.
function parseRgb(raw) {
  const s = raw.toLowerCase();
  const hex = s.startsWith('#') && (s.length <= 5 ? [...s.slice(1)].map((c) => c + c).join('') : s.slice(1));
  if (hex) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const nums = (s.match(/-?[\d.]+%?/g) ?? []).map((n) => parseFloat(n));
  if (s.startsWith('hsl')) return { hsl: nums.slice(0, 3) };
  const rgb = nums.slice(0, 3);
  return rgb.length < 3 ? null : rgb.every((n) => n <= 1) ? rgb.map((n) => n * 255) : rgb;
}

function toHsl(raw) {
  const p = parseRgb(raw);
  if (!p) return null;
  if (p.hsl) return { h: p.hsl[0], s: p.hsl[1] };
  const [r, g, b] = p.map((n) => n / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0 };
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: (d / (1 - Math.abs(2 * l - 1))) * 100 };
}
// Morado (hue 250-330, sat >= 15 %) fuera del tono del logotipo (287 ± 2).
const offPurple = (raw) => { const c = toHsl(raw); return !!c && c.h >= 250 && c.h <= 330 && c.s >= 15 && Math.abs(c.h - 287) > 2; };

function luminance(raw) {
  const [r, g, b] = parseRgb(raw).map((n) => n / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test('REQ-113-01..05: los 7 tokens morados valen la familia del logotipo', () => {
  assert.equal(token('--color-accent'), '#B37AC2');
  assert.equal(token('--color-accent-hover'), '#C396CF');
  assert.equal(token('--color-hero-top'), '#3C1F44');
  assert.equal(token('--color-hero-mid'), '#150A18');
  assert.equal(token('--color-glow'), 'rgba(108, 56, 122, 0.35)');
  assert.equal(token('--color-scrollbar-thumb'), '#6C387A');
  assert.equal(token('--color-marca-css'), '#6C387A');
});

test('REQ-113-06: ningún morado del código de la app fuera del hue 287 ± 2', () => {
  assert.ok(offPurple('#6E29C8') && offPurple('#639') && !offPurple('#6C387A') && !offPurple('#070716'), 'detector');
  const off = [];
  for (const file of SCAN_DIRS.flatMap(walk)) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    for (const raw of src.match(COLOR_RE) ?? []) {
      if (offPurple(raw)) off.push(`${file}: ${raw} (hue ${toHsl(raw).h.toFixed(1)})`);
    }
    for (const word of src.match(NAMED_RE) ?? []) off.push(`${file}: color con nombre ${word}`);
  }
  assert.deepEqual(off, [], `morados fuera del tono del logotipo:\n${off.join('\n')}`);
});

test('REQ-113-07: .skip-link usa texto --color-background sobre --color-accent', () => {
  const rule = read('src/styles/layout.css').match(/\.skip-link\s*\{([^}]*)\}/)[1];
  assert.match(rule, /(^|[\s;])color:\s*var\(--color-background\)/);
  assert.match(rule, /background:\s*var\(--color-accent\)/);
});

test('REQ-113-08..10: contrastes WCAG del acento, el foco y la marca CSS', () => {
  const [accent, hover, bg, surface, heroTop] = ['--color-accent', '--color-accent-hover', '--color-background', '--color-surface', '--color-hero-top'].map(token);
  for (const fg of [accent, hover]) for (const back of [bg, surface]) assert.ok(contrast(fg, back) >= 4.5, `${fg} sobre ${back}: ${contrast(fg, back).toFixed(2)}`);
  for (const back of [bg, surface, heroTop]) assert.ok(contrast(accent, back) >= 3, `foco ${accent} sobre ${back}: ${contrast(accent, back).toFixed(2)}`);
  assert.ok(contrast('#ffffff', token('--color-marca-css')) >= 4.5, 'blanco sobre --color-marca-css');
  assert.ok(contrast(bg, accent) >= 4.5, 'texto del skip-link sobre el acento');
});

test('REQ-113-11..12: tokens.css en 99 líneas y azul marino intacto', () => {
  assert.equal(TOKENS.split('\n').length - (TOKENS.endsWith('\n') ? 1 : 0), 99);
  const navy = { '--color-background': '#070716', '--color-surface': '#101018', '--color-hero-bottom': '#05050b',
    '--color-navbar': 'rgba(8, 8, 18, 0.75)', '--color-scrollbar-track': '#090912', '--color-text-secondary': '#b8b8c5' };
  for (const [name, value] of Object.entries(navy)) assert.equal(token(name), value, name);
});
