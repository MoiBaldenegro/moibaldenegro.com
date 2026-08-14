// Test de la alineación de la documentación del arnés (REQ-38-01..04,
// feature 38 docs-harness-alignment). Verifica contra
// specs/38_docs-harness-alignment/requirements.md:
//   REQ-38-01 — docs/architecture.md SHALL referenciar src/styles/tokens.css
//               como fuente de las custom properties, WHERE hoy referencia
//               global.css (regla 6).
//   REQ-38-02 — CHECKPOINTS.md SHALL no mencionar features del historial como
//               en progreso ni conteos de suite del ciclo previo (158/158).
//   REQ-38-03 — los documentos del arnés SHALL conservar la ausencia de los
//               tokens prohibidos del kit (tomatesoft, cards-data, og-image,
//               hero; REQ-01-05 + REQ-25-06 para architecture.md).
//   REQ-38-04 — la suite completa y el formato pasan tras la alineación:
//               se verifica con la suite y ./init.sh, no en este archivo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ARCH_URL = new URL('../docs/architecture.md', import.meta.url);
const CHECKPOINTS_URL = new URL('../CHECKPOINTS.md', import.meta.url);

const FORBIDDEN_KIT_TOKENS = ['tomatesoft', 'cards-data', 'og-image', 'hero'];

function read(url, name) {
  assert.ok(existsSync(url), `${name} no existe`);
  return readFileSync(url, 'utf8');
}

test('REQ-38-01: architecture.md regla 6 nombra tokens.css y no menciona global.css ni DESIGN.md', () => {
  const doc = read(ARCH_URL, 'docs/architecture.md');
  assert.ok(
    doc.includes('src/styles/tokens.css'),
    'docs/architecture.md no nombra src/styles/tokens.css como fuente de custom properties (REQ-38-01)'
  );
  assert.ok(
    !doc.includes('global.css'),
    'docs/architecture.md todavía menciona global.css (REQ-38-01)'
  );
  assert.ok(
    !doc.includes('DESIGN.md'),
    'docs/architecture.md todavía menciona DESIGN.md (REQ-38-01)'
  );
});

test('REQ-38-02: CHECKPOINTS.md no menciona conteos de suite del ciclo previo ni features en progreso', () => {
  const doc = read(CHECKPOINTS_URL, 'CHECKPOINTS.md');
  assert.ok(
    !doc.includes('158/158'),
    'CHECKPOINTS.md conserva el conteo de suite del ciclo previo "158/158" (REQ-38-02)'
  );
  assert.ok(
    !doc.includes('in_progress'),
    'CHECKPOINTS.md menciona features del historial como en progreso (REQ-38-02)'
  );
});

test('REQ-38-03: los docs del arnés alineados conservan la ausencia de tokens prohibidos del kit', () => {
  for (const [name, url] of [
    ['docs/architecture.md', ARCH_URL],
    ['CHECKPOINTS.md', CHECKPOINTS_URL],
  ]) {
    const content = read(url, name).toLowerCase();
    for (const token of FORBIDDEN_KIT_TOKENS) {
      assert.ok(
        !content.includes(token),
        `${name} contiene el token prohibido "${token}" (REQ-38-03, REQ-01-05)`
      );
    }
  }
});
