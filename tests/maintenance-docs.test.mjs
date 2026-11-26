// Issue #5: la guía del toggle de mantenimiento en producción existe y es coherente
// con src/domain/http/maintenance.ts y src/middleware.ts. node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { MAINTENANCE_STATUS } from '../src/domain/http/maintenance.ts';

const DOC = 'docs/maintenance.md';
const read = () => readFileSync(DOC, 'utf8');

test('la guía de mantenimiento existe y no es un stub', () => {
  assert.ok(existsSync(DOC), `${DOC} no existe`);
  assert.ok(read().trim().length > 400, 'la guía es demasiado corta');
});

test('la guía explica activar y desactivar el flag sin rebuild', () => {
  const doc = read();
  for (const needle of ['IN_MAINTENANCE', 'env.IN_MAINTENANCE', 'import.meta.env.IN_MAINTENANCE', 'Variables', 'sin recompilar', 'wrangler']) {
    assert.ok(doc.includes(needle), `la guía no menciona "${needle}"`);
  }
});

test('la guía es coherente con maintenance.ts y middleware.ts', () => {
  const doc = read();
  const source = readFileSync('src/domain/http/maintenance.ts', 'utf8');
  assert.ok(doc.includes('src/domain/http/maintenance.ts'));
  assert.ok(doc.includes('src/middleware.ts'));
  assert.ok(doc.includes(String(MAINTENANCE_STATUS)), 'el estado debe coincidir con MAINTENANCE_STATUS');
  assert.ok(doc.includes('Cache-Control') && doc.includes('Retry-After'));
  const prefixes = [...source.matchAll(/'(\/[^']+\/)'/g)].map((match) => match[1]);
  assert.ok(prefixes.length > 0, 'no se pudieron leer los prefijos de assets de maintenance.ts');
  for (const prefix of prefixes) assert.ok(doc.includes(prefix), `la guía no menciona el prefijo ${prefix}`);
  assert.ok(doc.includes('/maintenance.css'));
  assert.ok(doc.includes('/favicon.ico'));
});

test('la guía aclara qué rutas responden 503 y cómo comprobarlo', () => {
  const doc = read();
  for (const needle of ['/home', '/whoami', '/search', '/posts/', 'prerender', '503', 'curl']) {
    assert.ok(doc.includes(needle), `la guía no menciona "${needle}"`);
  }
});
