import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test de tokens de diseño (REQ-02-01..05, feature 2 design-tokens).
//
// Verifica contra specs/02_design-tokens/design.md:
//   REQ-02-01 — src/styles/tokens.css existe.
//   REQ-02-02 — al menos un token por grupo (12 grupos: color de fondo,
//               superficie, texto, borde, acento, marca, radio, espaciado,
//               sombra, tipografía, transición y contenedor).
//   REQ-02-03 — tokens de marca derivados de la paleta real de
//               src/data/hero.data.ts (los 8 principales + variantes bottom).
//   REQ-02-04 — toda custom property cumple --grupo-nombre en kebab-case.
//   REQ-02-05 — el test falla si falta cualquier token requerido.

const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Grupos de REQ-02-02 -> token representativo que debe existir.
const REQUIRED_GROUPS = {
  'color de fondo': '--color-background',
  'color de superficie': '--color-surface',
  'color de texto': '--color-text',
  'color de borde': '--color-border',
  'color de acento': '--color-accent',
  'color de marca': '--color-marca-react',
  radio: '--radius-card',
  espaciado: '--gap-card',
  sombra: '--shadow-card',
  tipografía: '--font-sans',
  transición: '--transition-default',
  contenedor: '--container-max',
};

// Paleta de marca actual de src/data/hero.data.ts (REQ-02-03).
const MARCA_TOKENS = {
  '--color-marca-react': '#0E6C82',
  '--color-marca-html': '#B74D05',
  '--color-marca-node': '#08783A',
  '--color-marca-github': '#091223',
  '--color-marca-youtube': '#B61111',
  '--color-marca-twitch': '#6C20B6',
  '--color-marca-typescript': '#215BC7',
  '--color-marca-css': '#6E29C8',
  // Variantes bottom de la paleta real de hero.data.ts: se incluyen como
  // tokens propios para que las tarjetas bottom (feature 6) puedan
  // referenciar colorToken sin perder su color actual.
  '--color-marca-node-bottom': '#0A7C39',
  '--color-marca-github-bottom': '#202A3A',
  '--color-marca-youtube-bottom': '#BF1616',
  '--color-marca-twitch-bottom': '#7B29D6',
};

function readTokensCss() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-02-01)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

test('REQ-02-01: src/styles/tokens.css existe y no supera 100 líneas', () => {
  const content = readTokensCss();
  const lineCount = content.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `src/styles/tokens.css tiene ${lineCount} líneas (máximo 100, convención del proyecto)`
  );
});

test('REQ-02-02: hay al menos un token por cada uno de los 12 grupos', () => {
  const content = readTokensCss();
  for (const [grupo, token] of Object.entries(REQUIRED_GROUPS)) {
    assert.ok(
      content.includes(token),
      `grupo "${grupo}": falta el token requerido ${token} (REQ-02-05)`
    );
  }
});

test('REQ-02-03: los tokens de marca usan los colores de la paleta de hero.data.ts', () => {
  const content = readTokensCss();
  for (const [token, color] of Object.entries(MARCA_TOKENS)) {
    const pattern = new RegExp(
      `${token.replaceAll('-', '\\-')}\\s*:\\s*${color}`,
      'i'
    );
    assert.ok(
      pattern.test(content),
      `falta ${token} con el color de la paleta actual (${color})`
    );
  }
});

test('REQ-02-04: todas las custom properties cumplen --grupo-nombre en kebab-case', () => {
  const content = readTokensCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const customProps = [...content.matchAll(/--[a-z0-9-]+/g)].map((m) => m[0]);
  assert.ok(customProps.length > 0, 'no se encontró ninguna custom property');
  const kebabPattern = /^--[a-z]+(-[a-z0-9]+)+$/;
  for (const prop of customProps) {
    assert.match(
      prop,
      kebabPattern,
      `"${prop}" no cumple el patrón --grupo-nombre en kebab-case`
    );
  }
});
