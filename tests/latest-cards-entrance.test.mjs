// Feature 75 (latest-cards-entrance): en el modo horizontal de escritorio, las cards entran desde
// arriba ligadas al scroll y se «clavan» justo al inicio del tramo fijado de la feature 73.
// Spec: specs/75_latest-cards-entrance/. Mediciones en navegador en progress/impl_75.md.
// Ajuste feature 96 (precedente REQ-43-06): rama H-integrado. La entrada del track desde arriba y
// src/domain/latest-entrance.ts se retiran (las cards entran por los laterales con cards-motion.ts),
// así que REQ-75-01..11 se retiran; REQ-75-14/15 (CSS) se conservan y REQ-75-27 ya no mide latest-entrance.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
// Ajuste feature 96 (precedente REQ-43-06): sin DOMAIN, load() ni near() (solo los usaban REQ-75-01..11).
// Ajuste feature 96 (precedente REQ-43-06): REQ-75-01..07, REQ-75-08 y REQ-75-09/10/11 retirados (entrada del track y latest-entrance.ts borrados).

test('REQ-75-14/15: recorte y encabezado durante la entrada', () => {
  const css = read('src/styles/latest-horizontal.css').replace(/[/][*][^]*?[*][/]/g, '');
  const rule = (sel) => [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)].filter(([, s]) => s.trim() === sel).map(([, , b]) => b).join(';');
  const entering = rule('.latest-articles--horizontal.latest-articles--entering');
  assert.match(entering, /overflow-y:[ ]*visible/);
  assert.doesNotMatch(entering, /clip-path/); // Ajuste REQ-76-03 (precedente REQ-43-06): sin recorte lateral
  const heading = rule('.latest-articles--horizontal.latest-articles--entering .latest-articles__heading');
  assert.match(heading, /position:[ ]*relative/); assert.match(heading, /z-index:[ ]*1/);
  for (const [, sel] of css.matchAll(/([^{}]+)[{][^{}]*[}]/g)) for (const s of sel.split(',')) assert.ok(s.includes('.latest-articles--horizontal'), s.trim());
});

// Ajuste feature 96 (precedente REQ-43-06): sin src/domain/latest-entrance.ts (borrado).
test('REQ-75-27: archivos tocados <= 100 líneas', () => {
  for (const rel of ['src/components/latest-horizontal/latest-horizontal.ts', 'src/components/latest-horizontal/track-dom.ts', 'src/styles/latest-horizontal.css', 'tests/latest-cards-entrance.test.mjs']) {
    const s = read(rel); assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
