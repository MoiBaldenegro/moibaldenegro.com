// Test del dominio del perfil del hero (REQ-31-01..08, feature 31 json-repositories-loader).
//
// Verifica contra specs/31_json-repositories-loader/requirements.md:
//   REQ-31-01 — HeroProfileRepository acepta un loader inyectable () => string y el
//               default materializa src/data/hero.json con un import con atributo.
//   REQ-31-03 — el repositorio no importa módulos node ni usa el sufijo ?raw.
//   REQ-31-04 — el default entrega el perfil real de src/data/hero.json.
//   REQ-31-06 — loader que lanza, JSON inválido o forma inválida → HeroProfileDataError.
//   REQ-31-08 — el repositorio no supera las 100 líneas.
// Conserva los asserts de datos reales de la feature 5 (REQ-05-01/02) con node:fs:
// la restricción del humano es sobre src/, no sobre tests/ (informe
// progress/research/lectura-json-sin-nodefs.md, sección 2.4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  HeroProfileRepository,
  HeroProfileDataError,
} from '../src/domain/repositories/hero-profile-repository.ts';

const DATA_URL = new URL('../src/data/hero.json', import.meta.url);
const ENTITY_URL = new URL('../src/domain/entities/hero-profile.ts', import.meta.url);
const REPOSITORY_URL = new URL(
  '../src/domain/repositories/hero-profile-repository.ts',
  import.meta.url,
);

// Perfil real actual (valores de src/data/hero.json, feature 5).
const EXPECTED_PROFILE = {
  name: 'Moisés Baldenegro Melendez',
  username: '@moibaldenegro',
  verified: true,
  image: '/assets/moises-hero.jpg',
  description:
    'AI Engineering • Rust • WebAssembly • Full Stack • DevOps • AWS • Azure • Security First • OWASP • Rustacean 🦀',
};

test('REQ-05-01: src/data/hero.json almacena el perfil con los 5 campos', () => {
  assert.ok(existsSync(DATA_URL), 'src/data/hero.json no existe (REQ-05-01)');
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  for (const field of ['name', 'username', 'verified', 'image', 'description']) {
    assert.ok(field in data, `src/data/hero.json no tiene el campo "${field}" (REQ-05-01)`);
  }
});

test('REQ-05-02: la entidad HeroProfile tipa el perfil con campos readonly', () => {
  assert.ok(existsSync(ENTITY_URL), 'src/domain/entities/hero-profile.ts no existe (REQ-05-02)');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /interface\s+HeroProfile\s*\{/, 'falta interface HeroProfile (REQ-05-02)');
  for (const field of ['name', 'username', 'verified', 'image', 'description']) {
    assert.match(
      content,
      new RegExp(`readonly\\s+${field}\\s*:`),
      `falta "readonly ${field}" en HeroProfile (REQ-05-02)`,
    );
  }
});

test('REQ-31-01/REQ-31-04: el loader por defecto entrega el perfil real de src/data/hero.json', () => {
  const repository = new HeroProfileRepository();
  assert.deepEqual(repository.getProfile(), EXPECTED_PROFILE, 'el perfil entregado no coincide');
});

test('REQ-31-01: el repositorio lee a través del loader inyectable, no del filesystem', () => {
  const injected = {
    name: 'Perfil Inyectado',
    username: '@inyectado',
    verified: false,
    image: 'assets/injected.jpg',
    description: 'Contenido entregado por el loader, no leído de disco.',
  };
  const repository = new HeroProfileRepository(() => JSON.stringify(injected));
  assert.deepEqual(repository.getProfile(), injected, 'el loader inyectado no se usa (REQ-31-01)');
});

test('REQ-31-06: loader que lanza (archivo ausente) → HeroProfileDataError', () => {
  const repository = new HeroProfileRepository(() => {
    throw new Error('ENOENT: no such file or directory');
  });
  assert.throws(() => repository.getProfile(), HeroProfileDataError);
});

test('REQ-31-06: contenido malformado (JSON inválido) → HeroProfileDataError', () => {
  const repository = new HeroProfileRepository(() => '{ esto no es JSON');
  assert.throws(() => repository.getProfile(), HeroProfileDataError);
});

test('REQ-31-06: forma inválida (objeto con campos erróneos) → HeroProfileDataError', () => {
  const repository = new HeroProfileRepository(() => JSON.stringify({ name: 42, username: null }));
  assert.throws(() => repository.getProfile(), HeroProfileDataError);
});

test('REQ-31-03: el repositorio no importa módulos node ni usa el sufijo ?raw', () => {
  const content = readFileSync(REPOSITORY_URL, 'utf8');
  assert.doesNotMatch(
    content,
    /from\s*['"]node:/,
    'el repositorio importa un módulo node (REQ-31-03)',
  );
  assert.doesNotMatch(content, /\?raw/, 'el repositorio usa el sufijo ?raw (REQ-31-03)');
});

test('REQ-31-08: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [
    [ENTITY_URL, 'hero-profile.ts'],
    [REPOSITORY_URL, 'hero-profile-repository.ts'],
  ]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-31-08)`);
  }
});
