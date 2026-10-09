// Feature 67 (normalize-text-empty-guard-test): regulariza con test el cambio manual del humano
// en src/domain/search/normalize.ts (`if (!text) return '';`). Sin la guarda, una entrada
// vacía o ausente (p. ej. un campo opcional del índice) lanzaría TypeError en .normalize().
// Spec: specs/67_*/requirements.md. Mutación registrada en progress/impl_67.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText } from '../src/domain/search/normalize.ts';

test('REQ-67-01: normalizeText("") devuelve ""', () => {
  assert.equal(normalizeText(''), '');
});

test('REQ-67-02/03: undefined y null coaccionados devuelven "" sin lanzar', () => {
  for (const value of [undefined, null]) {
    assert.doesNotThrow(() => normalizeText(value));
    assert.equal(normalizeText(value), '', String(value));
  }
});

test('REQ-67-05: conserva la normalización (minúsculas, sin diacríticos, sin espacios extremos)', () => {
  assert.equal(normalizeText(' Diseño ÁGIL '), 'diseno agil');
});
