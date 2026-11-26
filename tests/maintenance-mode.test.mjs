// Issue #4: modo mantenimiento real. Con IN_MAINTENANCE=false el sitio se comporta
// como siempre; con true, toda navegación responde 503 con la página de mantenimiento
// y sus assets. node:test, sin dependencias. TDD: rojo antes de implementar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MAINTENANCE_HTML,
  MAINTENANCE_STATUS,
  isStaticAssetPath,
  maintenanceResponse,
  parseMaintenanceFlag,
  shouldServeMaintenance,
} from '../src/domain/http/maintenance.ts';
import { SECURITY_HEADERS, withSecurityHeaders } from '../src/domain/http/security-headers.ts';

const PAGES = ['/', '/home', '/home/', '/whoami', '/whoami/', '/posts/03-principios-solid', '/search'];
const ASSETS = ['/_astro/Layout.abc.css', '/assets/mxvi_logo.webp', '/favicon.ico', '/maintenance.css', '/site.webmanifest'];

test('el flag acepta booleanos y strings habituales', () => {
  for (const value of [true, 'true', 'TRUE', '1', 'on', 'yes']) assert.equal(parseMaintenanceFlag(value), true, String(value));
  for (const value of [false, 'false', '0', 'off', '', null, undefined, {}]) assert.equal(parseMaintenanceFlag(value), false, String(value));
});

test('con IN_MAINTENANCE=false ninguna ruta se bloquea', () => {
  for (const pathname of [...PAGES, ...ASSETS]) {
    assert.equal(shouldServeMaintenance(false, pathname), false, pathname);
    assert.equal(shouldServeMaintenance('false', pathname), false, pathname);
  }
});

test('con IN_MAINTENANCE=true las páginas de navegación devuelven mantenimiento', () => {
  for (const pathname of PAGES) assert.equal(shouldServeMaintenance(true, pathname), true, pathname);
  assert.equal(shouldServeMaintenance('true', '/posts/01-diseno-detallado'), true);
});

test('con IN_MAINTENANCE=true los assets necesarios siguen disponibles', () => {
  for (const pathname of ASSETS) {
    assert.equal(isStaticAssetPath(pathname), true, pathname);
    assert.equal(shouldServeMaintenance(true, pathname), false, pathname);
  }
});

test('la respuesta de mantenimiento es 503 HTML y no se cachea', async () => {
  const response = maintenanceResponse();
  assert.equal(response.status, MAINTENANCE_STATUS);
  assert.equal(response.status, 503);
  assert.match(response.headers.get('Content-Type') ?? '', /^text\/html/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(await response.text(), MAINTENANCE_HTML);
  assert.match(MAINTENANCE_HTML, /Sitio en mantenimiento/);
  assert.match(MAINTENANCE_HTML, /href="\/maintenance\.css"/);
});

test('la respuesta de mantenimiento lleva las cabeceras de seguridad', () => {
  const response = withSecurityHeaders(maintenanceResponse());
  for (const name of Object.keys(SECURITY_HEADERS)) assert.ok(response.headers.has(name), name);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('el middleware conecta el modo mantenimiento con las cabeceras de seguridad', () => {
  const middleware = readFileSync('src/middleware.ts', 'utf8');
  assert.match(middleware, /shouldServeMaintenance\(/);
  assert.match(middleware, /withSecurityHeaders\(maintenanceResponse\(\)\)/);
});
