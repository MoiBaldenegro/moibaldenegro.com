// Check de humo del toggle de mantenimiento (issue #7).
// Comprueba, contra una URL base configurable, que el sitio responde como debe
// según el estado de IN_MAINTENANCE. Solo Node stdlib; no forma parte del build.
//
// Uso:
//   node scripts/check-maintenance-smoke.mjs --base-url http://127.0.0.1:8787 --mode on
//   node scripts/check-maintenance-smoke.mjs --base-url https://moisesbaldenegro.com --mode off
//
// --mode on   (por defecto) exige 503 + Cache-Control: no-store en / y /whoami,
//             y 200 en /maintenance.css y /favicon.ico.
// --mode off  exige que / responda 301.
// Sale con código 0 si todo cuadra y != 0 si algo falla.

import { pathToFileURL } from 'node:url';

export const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';
const MODES = ['on', 'off'];

export function parseArgs(argv) {
  const args = { baseUrl: DEFAULT_BASE_URL, mode: 'on' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base-url') args.baseUrl = argv[(i += 1)];
    else if (argv[i] === '--mode') args.mode = argv[(i += 1)];
    else throw new Error(`argumento desconocido: ${argv[i]} (usa --base-url y --mode)`);
  }
  if (!args.baseUrl) throw new Error('falta el valor de --base-url');
  if (!MODES.includes(args.mode)) throw new Error(`modo inválido: ${args.mode} (usa on|off)`);
  return args;
}

async function request(url, fetchImpl) {
  try {
    return await fetchImpl(url, { redirect: 'manual' });
  } catch (error) {
    return { error: `error de red: ${error.message}` };
  }
}

export async function checkMaintenance(baseUrl, fetchImpl = fetch) {
  const expected = [
    { path: '/', status: 503, noStore: true },
    { path: '/whoami', status: 503, noStore: true },
    { path: '/maintenance.css', status: 200 },
    { path: '/favicon.ico', status: 200 },
  ];
  const failures = [];
  for (const item of expected) {
    const url = `${baseUrl}${item.path}`;
    const response = await request(url, fetchImpl);
    if (response.error) {
      failures.push(`${url}: ${response.error}`);
      continue;
    }
    if (response.status !== item.status) {
      failures.push(`${url}: esperaba ${item.status}, recibió ${response.status}`);
    }
    if (item.noStore && response.status === item.status) {
      const cacheControl = response.headers.get('cache-control') ?? '';
      if (!/\bno-store\b/i.test(cacheControl)) {
        failures.push(`${url}: esperaba Cache-Control: no-store, recibió "${cacheControl}"`);
      }
    }
  }
  return failures;
}

export async function checkLive(baseUrl, fetchImpl = fetch) {
  const url = `${baseUrl}/`;
  const response = await request(url, fetchImpl);
  if (response.error) return [`${url}: ${response.error}`];
  return response.status === 301 ? [] : [`${url}: esperaba 301, recibió ${response.status}`];
}

export async function runSmoke({ baseUrl, mode, fetchImpl = fetch }) {
  const base = baseUrl.replace(/\/+$/, '');
  if (mode === 'on') return checkMaintenance(base, fetchImpl);
  if (mode === 'off') return checkLive(base, fetchImpl);
  throw new Error(`modo inválido: ${mode} (usa on|off)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = await runSmoke(args);
  if (failures.length > 0) {
    for (const failure of failures) console.error(`SMOKE ✘ ${failure}`);
    process.exit(1);
  }
  console.log(`SMOKE ✔ mantenimiento ${args.mode} correcto en ${args.baseUrl}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`SMOKE ✘ ${error.message}`);
    process.exit(1);
  });
}
