// Test de un solo h1 por página (feature 39 single-h1-headings,
// REQ-39-01..08): markdown de los posts sin encabezados de nivel 1 fuera de
// bloques de código, /about con p.about__intro y build real (outDir temporal,
// serializado con el helper de builds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const POSTS = 'src/content/posts/';
const HEADINGS = {
  'architecture/00-agilismo.md': '00. Agilismo, diseño y fragilidad',
  'architecture/01-diseño_detallado.md': '01. Niveles de Abstracción y Enfoques de Diseño en Arquitectura de Software',
  'architecture/02-principios.md': '01. Principios del diseño de software',
  'architecture/04-ciclo-de-vida-y-arquitectura.md': '02. El Rol de la Arquitectura en el Ciclo de Vida del Desarrollo de Software',
  'architecture/05-diseno-arquitectonico-vs-diseno-detallado.md': '03. Diseño Arquitectónico vs. Diseño Detallado',
  'os/00-prueba-os.md': '00. Prueba OS - Qué es un sistema operativo',
  'os/01-procesos-memoria.md': '01. Procesos y memoria',
};
const posts = (dir = POSTS) => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? posts(`${dir}${e.name}/`) : e.name.endsWith('.md') ? [`${dir}${e.name}`] : []);

// Líneas del cuerpo fuera de bloques de código cercados (``` o ~~~).
function proseLines(md) {
  let fenced = false;
  return md.split(/\r?\n/).filter((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return false; }
    return !fenced;
  });
}

test('REQ-39-01: ningún post tiene encabezados de nivel 1 fuera de código', () => {
  for (const file of posts()) {
    const h1 = proseLines(read(file)).filter((line) => line.startsWith('# '));
    assert.deepEqual(h1, [], file);
  }
});

test('REQ-39-02: los 7 encabezados iniciales pasan a nivel 2 con el mismo texto', () => {
  for (const [file, text] of Object.entries(HEADINGS)) {
    assert.ok(proseLines(read(`${POSTS}${file}`)).includes(`## ${text}`), `${file}: falta «## ${text}»`);
  }
});

test('REQ-39-05/06: /about pinta la presentación en p.about__intro con tokens', () => {
  const about = read('src/pages/about.astro');
  assert.match(about, /<p class="about__intro">\{SITE_DESCRIPTION\}<\/p>/);
  assert.equal(about.match(/<h1\b/g)?.length, 1, 'about.astro debe declarar un solo h1');
  const rule = read('src/styles/about.css').match(/\.about__intro\s*\{([^}]*)\}/)?.[1];
  assert.ok(rule, 'falta .about__intro en about.css');
  assert.doesNotMatch(rule, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  assert.match(rule, /color:\s*var\(--color-text-secondary\)/);
});

test('REQ-39-03/04 (build): un único h1 en cada post y en /about', () => {
  const out = mkdtempSync(join(tmpdir(), 'h1-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const client = join(out, 'client');
    const pages = readdirSync(join(client, 'posts')).map((slug) => join('posts', slug, 'index.html'));
    assert.ok(pages.length >= 8, `solo ${pages.length} posts en el build`);
    for (const rel of [...pages, join('about', 'index.html')]) {
      const count = readFileSync(join(client, rel), 'utf8').match(/<h1\b/g)?.length ?? 0;
      assert.equal(count, 1, `${rel}: ${count} h1`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-39-08: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of ['src/pages/about.astro', 'src/styles/about.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
