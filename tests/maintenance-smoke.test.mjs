// Issue #7: check de humo del toggle de mantenimiento. node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BASE_URL,
  checkLive,
  checkMaintenance,
  parseArgs,
  runSmoke,
} from '../scripts/check-maintenance-smoke.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
function fakeFetch(routes) {
  return async (url) => {
    const route = routes[new URL(url).pathname] ?? { status: 404 };
    return new Response('', { status: route.status, headers: route.headers });
  };
}
const MAINTENANCE_ROUTES = {
  '/': { status: 503, headers: { 'Cache-Control': 'no-store' } },
  '/whoami': { status: 503, headers: { 'Cache-Control': 'no-store' } },
  '/maintenance.css': { status: 200 },
  '/favicon.ico': { status: 200 },
};
test('parseArgs usa valores por defecto y valida el modo', () => {
  assert.deepEqual(parseArgs([]), { baseUrl: DEFAULT_BASE_URL, mode: 'on' });
  assert.deepEqual(parseArgs(['--base-url', 'http://x:1', '--mode', 'off']), { baseUrl: 'http://x:1', mode: 'off' });
  assert.throws(() => parseArgs(['--mode', 'quizas']), /modo/);
});

test('checkMaintenance aprueba el estado con mantenimiento activo', async () => {
  assert.deepEqual(await checkMaintenance('http://x', fakeFetch(MAINTENANCE_ROUTES)), []);
});

test('checkMaintenance falla por estado o por falta de no-store', async () => {
  const failures = await checkMaintenance('http://x', fakeFetch({
    '/': { status: 200 },
    '/whoami': { status: 503, headers: { 'Cache-Control': 'max-age=60' } },
    '/maintenance.css': { status: 200 },
    '/favicon.ico': { status: 404 },
  }));
  assert.equal(failures.length, 3);
  assert.ok(failures.some((f) => f.includes('/whoami') && f.includes('Cache-Control')));
  assert.ok(failures.some((f) => f.includes('/favicon.ico')));
});

test('checkLive aprueba el 301 de / y falla si no redirige', async () => {
  assert.deepEqual(await checkLive('http://x', fakeFetch({ '/': { status: 301 } })), []);
  const failures = await checkLive('http://x', fakeFetch({ '/': { status: 200 } }));
  assert.equal(failures.length, 1);
});

test('runSmoke enruta según el modo y quita la barra final', async () => {
  const urls = [];
  const spy = async (url) => {
    urls.push(url);
    return new Response('', { status: 301 });
  };
  await runSmoke({ baseUrl: 'http://x/', mode: 'off', fetchImpl: spy });
  assert.deepEqual(urls, ['http://x/']);
});
function runCli(baseUrl, mode) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/check-maintenance-smoke.mjs', '--base-url', baseUrl, '--mode', mode], { cwd: ROOT });
    let output = '';
    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { output += data; });
    child.on('close', (code) => resolve({ code, output }));
  });
}

test('el CLI sale 0 si todo cuadra y != 0 si algo falla', async () => {
  let maintenance = true;
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (maintenance) {
      if (pathname === '/' || pathname === '/whoami') return res.writeHead(503, { 'Cache-Control': 'no-store' }).end();
      if (pathname === '/maintenance.css' || pathname === '/favicon.ico') return res.writeHead(200).end();
      return res.writeHead(404).end();
    }
    if (pathname === '/') return res.writeHead(301, { Location: '/whoami' }).end();
    return res.writeHead(200).end();
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await runCli(base, 'on')).code, 0);
    maintenance = false;
    assert.equal((await runCli(base, 'off')).code, 0);
    assert.notEqual((await runCli(base, 'on')).code, 0);
  } finally {
    server.close();
  }
});
