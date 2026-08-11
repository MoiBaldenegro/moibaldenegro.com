import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test del README del proyecto (REQ-13-01..05, feature 13 project-readme).
//
// Verifica contra specs/13_project-readme/requirements.md:
//   REQ-13-01 — README.md describe moibaldenegro.com con su propósito real
//               (sitio personal con portada de tecnologías, artículos de
//               arquitectura de software y página /about; sin inventar contenido).
//   REQ-13-02 — documenta la estructura de carpetas REAL del proyecto:
//               src/pages, src/components, src/domain, src/data, src/styles
//               y public (mínimo del acceptance) + el resto verificado en disco
//               (src/layouts, src/content, src/content.config.ts, scripts/,
//               tests/, specs/, progress/, templates/).
//   REQ-13-03 — lista los comandos reales del package.json (pnpm dev, build,
//               preview, test) y ./init.sh.
//   REQ-13-04 — enlaza docs/architecture.md, docs/conventions.md y
//               docs/verification.md (como enlaces markdown reales).
//   REQ-13-05 — ninguna frase del starter kit de Astro (README anterior) ni de
//               los ejemplos del lider: 'starter kit', 'pnpm create astro',
//               'seasoned astronaut', 'welcome.astro', 'astro basics',
//               'want to learn more', 'discord server', 'our documentation',
//               'our guide', 'run cli commands', 'project structure',
//               'open the src/pages directory', 'read our docs',
//               'astro homepage', "what's new in astro", 'to get started'.
//               Se detectan en minúsculas sobre el contenido completo.
//               Mencionar "Astro" como tecnología del stack NO está prohibido.

const README_URL = new URL('../README.md', import.meta.url);

function readReadme() {
  assert.ok(existsSync(README_URL), 'README.md no existe (REQ-13-01)');
  return readFileSync(README_URL, 'utf8');
}

test('REQ-13-01: README menciona moibaldenegro.com y su propósito', () => {
  const readme = readReadme();
  assert.ok(readme.includes('moibaldenegro.com'), 'debe mencionar moibaldenegro.com');
  assert.ok(readme.includes('Moisés Baldenegro'), 'debe nombrar al autor del sitio');
  assert.ok(readme.includes('artículos'), 'debe mencionar los artículos del sitio');
  assert.ok(
    readme.includes('arquitectura de software'),
    'debe mencionar la temática de los artículos'
  );
});

test('REQ-13-02: README documenta las carpetas reales del acceptance', () => {
  const readme = readReadme();
  for (const folder of [
    'src/pages',
    'src/components',
    'src/domain',
    'src/data',
    'src/styles',
    'public',
  ]) {
    assert.ok(readme.includes(folder), `README debe documentar ${folder} (REQ-13-02)`);
  }
});

test('REQ-13-02: README documenta el resto de carpetas reales verificadas', () => {
  const readme = readReadme();
  for (const folder of [
    'src/layouts',
    'src/content',
    'src/content.config.ts',
    'scripts/',
    'tests/',
    'specs/',
    'progress/',
    'templates/',
  ]) {
    assert.ok(readme.includes(folder), `README debe documentar ${folder} (REQ-13-02)`);
  }
});

test('REQ-13-03: README lista los comandos reales del proyecto', () => {
  const readme = readReadme();
  for (const command of [
    'pnpm dev',
    'pnpm build',
    'pnpm preview',
    'pnpm test',
    './init.sh',
  ]) {
    assert.ok(readme.includes(command), `README debe listar ${command} (REQ-13-03)`);
  }
});

test('REQ-13-04: README enlaza la documentación del arnés', () => {
  const readme = readReadme();
  for (const doc of [
    'docs/architecture.md',
    'docs/conventions.md',
    'docs/verification.md',
  ]) {
    assert.ok(
      readme.includes(`](${doc})`),
      `README debe enlazar ${doc} (REQ-13-04)`
    );
  }
});

test('REQ-13-05: README no menciona el starter kit de Astro', () => {
  const lower = readReadme().toLowerCase();
  const forbidden = [
    'starter kit',
    'pnpm create astro',
    'seasoned astronaut',
    'welcome.astro',
    'astro basics',
    'want to learn more',
    'discord server',
    'our documentation',
    'our guide',
    'run cli commands',
    'project structure',
    'open the src/pages directory',
    'read our docs',
    'astro homepage',
    "what's new in astro",
    'to get started',
  ];
  for (const phrase of forbidden) {
    assert.ok(
      !lower.includes(phrase),
      `README no debe contener la frase del starter "${phrase}" (REQ-13-05)`
    );
  }
});
