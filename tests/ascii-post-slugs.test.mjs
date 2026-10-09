// Test de slugs ASCII y redirecciones 301 (feature 45 ascii-post-slugs,
// REQ-45-01..07). Lee el frontmatter real de src/content/posts, la config de
// Astro y los demás tests (ninguno cita ya los slugs antiguos).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const POSTS = 'src/content/posts/';
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RENAMES = {
  'architecture/03-principios_solid.md': ['03-principios solid', '03-principios-solid'],
  'architecture/01-diseño_detallado.md': ['01-diseño-detallado', '01-diseno-detallado'],
  'architecture/04-ciclo-de-vida-y-arquitectura.md': ['02-ciclo-de-vida-y-arquitectura', '04-ciclo-de-vida-y-arquitectura'],
};
const OLD_SLUGS = Object.values(RENAMES).map(([old]) => old);

const files = (dir = POSTS) => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? files(`${dir}${e.name}/`) : e.name.endsWith('.md') ? [`${dir}${e.name}`] : []);
const field = (md, name) => md.split(/\r?\n/).find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1).trim();
const list = (value) => (value ?? '').replace(/^\[|\]$/g, '').split(',').map((v) => v.trim()).filter(Boolean);

test('REQ-45-01: todos los slugs son ASCII en minúscula con guiones', () => {
  for (const file of files()) assert.match(field(read(file), 'slug') ?? '', SLUG, file);
});

test('REQ-45-02: los tres posts declaran sus slugs nuevos', () => {
  for (const [file, [, slug]] of Object.entries(RENAMES)) assert.equal(field(read(`${POSTS}${file}`), 'slug'), slug, file);
});

test('REQ-45-03: next y related apuntan a slugs existentes', () => {
  const docs = files().map((file) => read(file));
  const slugs = new Set(docs.map((md) => field(md, 'slug')));
  for (const md of docs) {
    const refs = [field(md, 'next'), ...list(field(md, 'related'))].filter((r) => r && r !== 'null');
    for (const ref of refs) assert.ok(slugs.has(ref.replace(/^\/posts\//, '')), `${field(md, 'slug')} → ${ref} no existe`);
  }
});

test('REQ-45-04: astro.config.mjs redirige 301 las tres URLs antiguas', () => {
  const config = read('astro.config.mjs');
  for (const [, [old, slug]] of Object.entries(RENAMES)) {
    assert.ok(config.includes(`'/posts/${old}': { status: 301, destination: '/posts/${slug}' }`), `falta la redirección de ${old}`);
  }
});

test('REQ-45-05: ningún test cita los slugs antiguos (salvo este, de redirecciones)', () => {
  const tests = readdirSync(new URL('tests/', root), { recursive: true }).filter((f) => f.endsWith('.mjs') && !f.endsWith('ascii-post-slugs.test.mjs'));
  for (const file of tests) {
    const src = read(`tests/${file}`);
    for (const old of OLD_SLUGS) assert.ok(!src.includes(old), `${file} cita «${old}»`);
  }
});

test('REQ-45-07: astro.config.mjs no supera 100 líneas', () => {
  assert.ok(read('astro.config.mjs').split('\n').length <= 100);
});
