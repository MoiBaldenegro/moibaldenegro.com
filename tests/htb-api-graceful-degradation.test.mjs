// Test de la degradación elegante de la sección HTB (REQ-27-01..10, feature 27).
//
// Verifica contra specs/27_htb-api-graceful-degradation/requirements.md y design.md:
//   REQ-27-01 — getProfileOrNull devuelve el perfil cuando hay datos y null cuando no.
//   REQ-27-02 — token o id ausentes → null.
//   REQ-27-03 — fetch que no puede contactar la API → null.
//   REQ-27-04 — estado HTTP no válido → null.
//   REQ-27-05 — JSON no válido → null.
//   REQ-27-06 — respuesta sin perfil válido → null.
//   REQ-27-07 — el componente obtiene el perfil con getProfileOrNull sin lógica.
//   REQ-27-09 — getProfile conserva el contrato de lanzar HtbProfileDataError.
//   REQ-27-10 — ninguna vía de fallo de la API llega al endpoint de la isla: el
//               componente ya no invoca la única vía que lanza (getProfile).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  HtbProfileRepository,
  HtbProfileDataError,
} from '../src/domain/repositories/htb-profile-repository.ts';

const COMPONENT_PATH = new URL('../src/components/htb-stadistics.astro', import.meta.url);

// Respuesta canónica del perfil v4 con todos los campos de la Decisión 6.
function profileResponse() {
  return {
    profile: {
      full_name: 'Moisés Baldenegro',
      name: 'moibaldenegro',
      rank: 'Hacker',
      points: 2049,
      user_owns: 12,
      system_owns: 30,
      country_name: 'México',
      joined_date: '2021-01-15T00:00:00.000Z',
    },
  };
}

const originalFetch = globalThis.fetch;

// Crea un fetch de prueba que responde según el behavior (mismo patrón que el
// test del repositorio de la feature 22, REQ-22-02..04).
function fakeFetch(behavior) {
  return async (url, init) => {
    assert.equal(typeof url, 'string', 'el fetch recibe una URL');
    assert.equal(
      init.headers.Authorization,
      'Bearer TOK',
      'el token no va en la cabecera Authorization',
    );
    if (behavior.reject) {
      throw new Error('network down');
    }
    const status = behavior.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (behavior.invalidJson) {
          throw new SyntaxError('respuesta no es JSON');
        }
        return behavior.body;
      },
    };
  };
}

function repositoryWith(behavior) {
  globalThis.fetch = fakeFetch(behavior);
  return new HtbProfileRepository('TOK', '42');
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test('REQ-27-01: getProfileOrNull devuelve el perfil mapeado cuando la API responde', async () => {
  try {
    const profile = await repositoryWith({ body: profileResponse() }).getProfileOrNull();
    assert.ok(profile, 'getProfileOrNull devolvió null con una respuesta válida (REQ-27-01)');
    assert.equal(profile.name, 'Moisés Baldenegro');
    assert.equal(profile.rank, 'Hacker');
    assert.equal(profile.points, 2049);
    assert.equal(profile.userOwns, 12);
    assert.equal(profile.systemOwns, 30);
    assert.equal(profile.countryName, 'México');
    assert.equal(profile.joinedDate, '2021-01-15T00:00:00.000Z');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-02: sin token o sin id getProfileOrNull devuelve null', async () => {
  const calls = [];
  try {
    globalThis.fetch = (url, init) => {
      calls.push({ url, init });
      return Promise.resolve({ ok: true, status: 200, json: async () => profileResponse() });
    };
    const noToken = new HtbProfileRepository(undefined, '42');
    assert.equal(await noToken.getProfileOrNull(), null, 'sin token no devuelve null (REQ-27-02)');
    const noId = new HtbProfileRepository('TOK', undefined);
    assert.equal(await noId.getProfileOrNull(), null, 'sin id no devuelve null (REQ-27-02)');
    assert.equal(calls.length, 0, 'sin credenciales no debe contactar la API (REQ-27-02)');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-03: fetch que no puede contactar la API devuelve null', async () => {
  try {
    const profile = await repositoryWith({ reject: true }).getProfileOrNull();
    assert.equal(profile, null, 'red caída no devuelve null (REQ-27-03)');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-04: estado HTTP no válido devuelve null', async () => {
  try {
    const profile = await repositoryWith({ status: 401, body: {} }).getProfileOrNull();
    assert.equal(profile, null, 'HTTP no-ok no devuelve null (REQ-27-04)');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-05: respuesta que no es JSON válido devuelve null', async () => {
  try {
    const profile = await repositoryWith({ invalidJson: true, body: null }).getProfileOrNull();
    assert.equal(profile, null, 'JSON inválido no devuelve null (REQ-27-05)');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-06: respuesta sin perfil válido devuelve null', async () => {
  try {
    const sinProfile = await repositoryWith({ body: {} }).getProfileOrNull();
    assert.equal(sinProfile, null, 'respuesta sin profile no devuelve null (REQ-27-06)');
    const profileNoObjeto = await repositoryWith({ body: { profile: 'nope' } }).getProfileOrNull();
    assert.equal(profileNoObjeto, null, 'profile no objeto no devuelve null (REQ-27-06)');
    const responseNula = await repositoryWith({ body: null }).getProfileOrNull();
    assert.equal(responseNula, null, 'respuesta nula no devuelve null (REQ-27-06)');
  } finally {
    restoreFetch();
  }
});

test('REQ-27-09: getProfile conserva el contrato de lanzar HtbProfileDataError', async () => {
  try {
    await assert.rejects(
      () => repositoryWith({ reject: true }).getProfile(),
      HtbProfileDataError,
      'getProfile ya no lanza con red caída (REQ-27-09)',
    );
    globalThis.fetch = fakeFetch({ body: profileResponse() });
    await assert.rejects(
      () => new HtbProfileRepository(undefined, '42').getProfile(),
      HtbProfileDataError,
      'getProfile ya no lanza sin token (REQ-27-09)',
    );
    await assert.rejects(
      () => repositoryWith({ status: 401, body: {} }).getProfile(),
      HtbProfileDataError,
      'getProfile ya no lanza con HTTP no-ok (REQ-27-09)',
    );
  } finally {
    restoreFetch();
  }
});

test('REQ-27-07/10: el componente usa getProfileOrNull y no invoca la vía que lanza', () => {
  assert.ok(existsSync(COMPONENT_PATH), 'htb-stadistics.astro no existe (REQ-27-07)');
  const astro = readFileSync(COMPONENT_PATH, 'utf8');
  assert.match(
    astro,
    /getProfileOrNull\(\)/,
    'htb-stadistics.astro no obtiene el perfil con getProfileOrNull() (REQ-27-07)',
  );
  assert.doesNotMatch(
    astro,
    /getProfile\(\)/,
    'htb-stadistics.astro invoca getProfile(), la vía que lanza → posible 500 (REQ-27-10)',
  );
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/,
    'el componente contiene lógica de negocio (REQ-27-07/Decisión 2)',
  );
  assert.match(
    astro,
    /\{profile\s*&&/,
    'el template no condiciona la sección al perfil con {profile && ...} (REQ-27-08)',
  );
});