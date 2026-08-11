// Test del dominio del perfil del hero (REQ-05-01..05, feature 5 hero-profile-domain).
//
// Verifica contra specs/05_hero-profile-domain/requirements.md:
//   REQ-05-01 — src/data/hero.json almacena los datos del perfil del hero.
//   REQ-05-02 — la entidad HeroProfile tipa el perfil en src/domain/entities/hero-profile.ts.
//   REQ-05-03 — HeroProfileRepository entrega la entidad HeroProfile leyendo hero.json.
//   REQ-05-04 — con hero.json ausente o malformado el repositorio lanza HeroProfileDataError.
//   REQ-05-05 — entidad y repositorio respetan el límite de 100 líneas cada uno.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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

// Perfil real actual (valores de src/data/hero.data.ts, feature 5 migra solo el perfil).
const EXPECTED_PROFILE = {
  name: 'Moisés Baldenegro Melendez',
  username: '@moibaldenegro',
  verified: true,
  image: 'assets/moises-hero.jpg',
  description:
    'AI Engineering • Rust • WebAssembly • Full Stack • DevOps • AWS • Azure • Security First • OWASP • Rustacean 🦀',
};

// Crea un directorio temporal con un hero.json y devuelve el repositorio apuntando a él.
function repositoryFor(contents) {
  const dir = mkdtempSync(join(tmpdir(), 'hero-profile-'));
  const fileUrl = pathToFileURL(join(dir, 'hero.json'));
  if (contents !== null) {
    writeFileSync(fileUrl, contents, 'utf8');
  }
  return { repository: new HeroProfileRepository(fileUrl), dir };
}

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

test('REQ-05-03: HeroProfileRepository entrega la entidad leyendo hero.json', () => {
  const repository = new HeroProfileRepository();
  assert.deepEqual(repository.getProfile(), EXPECTED_PROFILE, 'el perfil entregado no coincide');
});

test('REQ-05-04: con hero.json ausente el repositorio lanza HeroProfileDataError', () => {
  const { repository, dir } = repositoryFor(null);
  try {
    assert.throws(() => repository.getProfile(), HeroProfileDataError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-05-04: con hero.json malformado (JSON inválido) lanza HeroProfileDataError', () => {
  const { repository, dir } = repositoryFor('{ esto no es JSON');
  try {
    assert.throws(() => repository.getProfile(), HeroProfileDataError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-05-04: con hero.json de forma inválida lanza HeroProfileDataError', () => {
  const { repository, dir } = repositoryFor(JSON.stringify({ name: 42, username: null }));
  try {
    assert.throws(() => repository.getProfile(), HeroProfileDataError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-05-05: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [
    [ENTITY_URL, 'hero-profile.ts'],
    [REPOSITORY_URL, 'hero-profile-repository.ts'],
  ]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-05-05)`);
  }
});
