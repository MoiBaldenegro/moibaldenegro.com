// Issue #3: IN_MAINTENANCE debe tener default en el env schema de Astro para que
// `pnpm build` y `./init.sh` funcionen sin definir la variable a mano.
// Es un flag público, no un secreto. node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../astro.config.mjs';

const field = config?.env?.schema?.IN_MAINTENANCE;

test('IN_MAINTENANCE está declarada en el env schema', () => {
  assert.ok(field, 'falta IN_MAINTENANCE en env.schema');
});

test('IN_MAINTENANCE es un boolean público de cliente', () => {
  assert.equal(field.type, 'boolean');
  assert.equal(field.access, 'public');
  assert.equal(field.context, 'client');
});

test('IN_MAINTENANCE tiene default false (no obliga a definirla a mano)', () => {
  assert.equal(field.default, false, 'sin default, `pnpm build` exige la variable y falla');
});
