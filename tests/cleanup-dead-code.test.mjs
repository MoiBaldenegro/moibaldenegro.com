import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Test de la limpieza de código muerto (REQ-12-01..06, feature 12 cleanup-dead-code).
//
// Verifica contra specs/12_cleanup-dead-code/requirements.md:
//   REQ-12-01 — src/config.ts eliminado (definición de colecciones que Astro no
//               reconoce y nada importa).
//   REQ-12-02 — src/application eliminada (read-post.ts y read-hero-cards.ts vacíos).
//   REQ-12-03 — ningún context.md en src/entities, src/repositories ni src/services
//               (y las carpetas residuales desaparecen; el dominio vive en src/domain/).
//   REQ-12-04 — src/components/Welcome.astro eliminado (starter kit, no importado).
//   REQ-12-05 — src/ui eliminada (carpeta vacía).
//   REQ-12-06 — scripts/audit-design-tokens.mjs existe, termina en verde (exit 0)
//               sobre hojas limpias y FALLA (exit ≠ 0) ante una hoja con un color
//               suelto fuera de tokens.css (verificado con hoja temporal que se
//               limpia siempre en finally).

const ROOT = new URL('../', import.meta.url);
const AUDIT_SCRIPT = new URL('../scripts/audit-design-tokens.mjs', import.meta.url);

function mustNotExist(url, label) {
  assert.ok(!existsSync(url), `${label} no debería existir (REQ-12)`);
}

function runAudit() {
  return spawnSync(process.execPath, [fileURLToPath(AUDIT_SCRIPT)], { encoding: 'utf8' });
}

test('REQ-12-01: src/config.ts ya no existe', () => {
  mustNotExist(new URL('src/config.ts', ROOT), 'src/config.ts');
});

test('REQ-12-02: src/application ya no existe', () => {
  mustNotExist(new URL('src/application/', ROOT), 'src/application');
});

test('REQ-12-03: ningún context.md en src/entities|repositories|services', () => {
  mustNotExist(new URL('src/entities/context.md', ROOT), 'src/entities/context.md');
  mustNotExist(
    new URL('src/repositories/context.md', ROOT),
    'src/repositories/context.md'
  );
  mustNotExist(new URL('src/services/context.md', ROOT), 'src/services/context.md');
  mustNotExist(new URL('src/entities/', ROOT), 'carpeta src/entities');
  mustNotExist(new URL('src/repositories/', ROOT), 'carpeta src/repositories');
  mustNotExist(new URL('src/services/', ROOT), 'carpeta src/services');
});

test('REQ-12-04: src/components/Welcome.astro ya no existe', () => {
  mustNotExist(
    new URL('src/components/Welcome.astro', ROOT),
    'src/components/Welcome.astro'
  );
});

test('REQ-12-05: src/ui ya no existe', () => {
  mustNotExist(new URL('src/ui/', ROOT), 'src/ui');
});

test('REQ-12-06: el script audit-design-tokens.mjs existe y audita en verde', () => {
  assert.ok(existsSync(AUDIT_SCRIPT), 'scripts/audit-design-tokens.mjs no existe (REQ-12-06)');
  const run = runAudit();
  assert.equal(
    run.status,
    0,
    `el audit debería terminar en verde (exit 0) con el sitio limpio:\n${run.stdout}${run.stderr}`
  );
  assert.match(run.stdout, /AUDIT/, 'el audit debe anunciar su veredicto en stdout');
});

test('REQ-12-06: el guardián falla ante un color fuera de tokens.css', () => {
  assert.ok(
    existsSync(AUDIT_SCRIPT),
    'scripts/audit-design-tokens.mjs no existe (REQ-12-06)'
  );
  const hojaTemporal = new URL('src/styles/tmp-audit.css', ROOT);
  const rutaTemporal = fileURLToPath(hojaTemporal);
  writeFileSync(rutaTemporal, ':root { --color-suelto: #ab12cd; }\n');
  try {
    const run = runAudit();
    assert.notEqual(
      run.status,
      0,
      'el audit debería FALLAR (exit ≠ 0) ante un hex fuera de tokens.css'
    );
  } finally {
    unlinkSync(rutaTemporal);
  }
});