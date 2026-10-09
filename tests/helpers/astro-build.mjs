// Build real de Astro serializado entre procesos (helper de tests, no es un
// test: el glob del arnés solo ejecuta *.test.mjs). node --test corre cada
// archivo en su propio proceso y en paralelo; el prerender del adapter de
// Cloudflare arranca workerd (miniflare) y dos builds simultáneos fallan
// («Directory named "assets:storage" not found»). Un lock por mkdir atómico
// en node_modules/ (ignorado por git) garantiza un build a la vez.
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const LOCK = fileURLToPath(new URL('../../node_modules/.astro-build.lock', import.meta.url));
const STALE_MS = 5 * 60 * 1000; // lock huérfano de un proceso muerto
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function acquire() {
  for (;;) {
    try {
      mkdirSync(LOCK);
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - statSync(LOCK).mtimeMs > STALE_MS) rmSync(LOCK, { recursive: true, force: true });
      } catch {
        // el dueño lo liberó entre mkdir y stat: se reintenta
      }
      pause(100);
    }
  }
}

// Ejecuta `astro build ...args` en la raíz del repo con el lock tomado y
// devuelve el resultado de spawnSync (status, stdout, stderr).
export function astroBuild(args = []) {
  acquire();
  try {
    return spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    });
  } finally {
    rmSync(LOCK, { recursive: true, force: true });
  }
}
