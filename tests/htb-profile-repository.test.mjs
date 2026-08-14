// Test del dominio del perfil de Hack The Box (REQ-22-02..04, feature 22 htb-stadistics-section).
//
// Verifica contra specs/22_htb-stadistics-section/requirements.md y design.md:
//   REQ-22-02 — HtbProfileRepository entrega los datos del perfil con fetch
//               directo; el token y el id se usan SOLO en la cabecera
//               Authorization (Decisión 2: nunca se registran ni se muestran).
//   REQ-22-03 — respuesta no válida (HTTP no-ok, JSON inválido, sin objeto
//               profile) → lanza HtbProfileDataError.
//   REQ-22-04 — fetch que falla → lanza HtbProfileDataError.
//   REQ-22-07 — sin token o sin id (env ausente) el repositorio lanza
//               HtbProfileDataError: la sección muestra el fallback sin romper.
//   Decisión 6 — los campos reales de la API v4; los ausentes quedan a null
//               para que la UI muestre "N/D" (no lanza por campo individual).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  HtbProfileRepository,
  HtbProfileDataError,
} from '../src/domain/repositories/htb-profile-repository.ts';

const ENTITY_URL = new URL('../src/domain/entities/htb-profile.ts', import.meta.url);
const REPOSITORY_URL = new URL(
  '../src/domain/repositories/htb-profile-repository.ts',
  import.meta.url,
);

const API_URL = 'https://labs.hackthebox.com/api/v4/user/profile/basic';

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

// Crea un fetch de prueba que registra su llamada y responde según el behavior.
function fakeFetch(behavior, calls) {
  return async (url, init) => {
    calls.push({ url, init });
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

function withFakeFetch(behavior, calls = []) {
  globalThis.fetch = fakeFetch(behavior, calls);
  return calls;
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test('REQ-22-02: entrega el perfil esperado mapeando los campos de la API v4', async () => {
  try {
    withFakeFetch({ body: profileResponse() });
    const repository = new HtbProfileRepository('TOK', '42');
    const profile = await repository.getProfile();
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

test('REQ-22-02/Decisión 2: el token y el id se usan solo en la cabecera de autorización', async () => {
  const calls = [];
  try {
    withFakeFetch({ body: profileResponse() }, calls);
    const repository = new HtbProfileRepository('TOK', '42');
    await repository.getProfile();
    assert.equal(calls[0].url, `${API_URL}/42`, 'la URL no apunta al endpoint con el id');
    assert.equal(
      calls[0].init.headers.Authorization,
      'Bearer TOK',
      'el token no va en la cabecera Authorization',
    );
  } finally {
    restoreFetch();
  }
});

test('Decisión 6: si falta full_name usa el campo name', async () => {
  try {
    const body = { profile: { name: 'moibaldenegro' } };
    withFakeFetch({ body });
    const repository = new HtbProfileRepository('TOK', '42');
    const profile = await repository.getProfile();
    assert.equal(profile.name, 'moibaldenegro');
  } finally {
    restoreFetch();
  }
});

test('Decisión 6: los campos ausentes llegan a null para mostrar "N/D" sin lanzar', async () => {
  try {
    const body = { profile: { name: 'moibaldenegro' } };
    withFakeFetch({ body });
    const repository = new HtbProfileRepository('TOK', '42');
    const profile = await repository.getProfile();
    assert.equal(profile.rank, null);
    assert.equal(profile.points, null);
    assert.equal(profile.userOwns, null);
    assert.equal(profile.systemOwns, null);
    assert.equal(profile.countryName, null);
    assert.equal(profile.joinedDate, null);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-03: respuesta HTTP no-ok lanza HtbProfileDataError', async () => {
  try {
    withFakeFetch({ status: 401, body: {} });
    const repository = new HtbProfileRepository('TOK', '42');
    await assert.rejects(() => repository.getProfile(), HtbProfileDataError);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-03: JSON inválido lanza HtbProfileDataError', async () => {
  try {
    withFakeFetch({ invalidJson: true, body: null });
    const repository = new HtbProfileRepository('TOK', '42');
    await assert.rejects(() => repository.getProfile(), HtbProfileDataError);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-03: respuesta sin objeto profile lanza HtbProfileDataError', async () => {
  try {
    withFakeFetch({ body: {} });
    const repository = new HtbProfileRepository('TOK', '42');
    await assert.rejects(() => repository.getProfile(), HtbProfileDataError);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-04: fetch que falla lanza HtbProfileDataError', async () => {
  try {
    withFakeFetch({ reject: true });
    const repository = new HtbProfileRepository('TOK', '42');
    await assert.rejects(() => repository.getProfile(), HtbProfileDataError);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-07: sin token o sin id la repositorio lanza HtbProfileDataError (fallback)', async () => {
  try {
    withFakeFetch({ body: profileResponse() });
    const noToken = new HtbProfileRepository(undefined, '42');
    await assert.rejects(() => noToken.getProfile(), HtbProfileDataError);
    const noId = new HtbProfileRepository('TOK', undefined);
    await assert.rejects(() => noId.getProfile(), HtbProfileDataError);
  } finally {
    restoreFetch();
  }
});

test('REQ-22-02/Decisión 2: el repositorio no registra secretos en consola', () => {
  const content = readFileSync(REPOSITORY_URL, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(content, /console\./, 'htb-profile-repository.ts usa console.* (REQ-22-06/Decisión 2)');
});

test('REQ-22-02: entidad y repositorio no superan las 100 líneas', () => {
  assert.ok(existsSync(ENTITY_URL), 'src/domain/entities/htb-profile.ts no existe (REQ-22-02)');
  for (const [url, label] of [
    [ENTITY_URL, 'htb-profile.ts'],
    [REPOSITORY_URL, 'htb-profile-repository.ts'],
  ]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100)`);
  }
});
