// Feature 72 (latest-articles-horizontal-scroll): en escritorio (>=1201 px, sin reduced motion)
// la sección de últimos artículos se fija y las cards se desplazan en X con GSAP ScrollTrigger.
// Sin JS, en <=1200 px o con reduced motion queda el layout apilado. Spec: specs/72_*/.
// Verificación en navegador (REQ-72-06..21, 25, 28, 29) en progress/impl_72.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { astroBuild } from './helpers/astro-build.mjs';
const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const COMP = 'src/components/latest-horizontal/latest-horizontal.astro';
const MOD = 'src/components/latest-horizontal/latest-horizontal.ts';
const CSS = 'src/styles/latest-horizontal.css';
const lines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);

test('REQ-72-01/02: componente con CSS y un solo script, montado solo en la portada', () => {
  const comp = read(COMP);
  assert.match(comp, /import ['"][.][.][/][.][.][/]styles[/]latest-horizontal[.]css['"]/);
  assert.equal((comp.match(/<script/g) ?? []).length, 1);
  assert.match(comp, /from ['"][.][/]latest-horizontal[.]ts['"]/);
  for (const ev of ['astro:page-load', 'astro:before-swap']) assert.ok(comp.includes(ev), ev);
  assert.doesNotMatch(comp, /<style/);
  const index = read('src/pages/index.astro');
  assert.match(index, /import LatestHorizontal from ['"][.][.][/]components[/]latest-horizontal[/]latest-horizontal[.]astro['"]/);
  assert.match(index, /<LatestHorizontal ?[/]>/);
  const pages = readdirSync(new URL('src/pages/', root), { recursive: true }).filter((f) => f.endsWith('.astro') && !f.endsWith('index.astro'));
  for (const page of pages) assert.ok(!read(`src/pages/${page}`).includes('latest-horizontal'), page);
  const latest = read('src/components/latest-articles.astro'), latestCss = read('src/styles/latest-articles.css');
  for (const src of [latest, latestCss]) assert.doesNotMatch(src, /latest-horizontal|gsap/);
  assert.equal(lines(latest), 40); // sin cambios: 39 con wc -l (el archivo no termina en salto de línea)
  assert.equal(lines(latestCss), 98);
});

// Ajuste feature 73 (REQ-43-06): sin pin ni anticipatePin (sticky en un envoltorio), mínimo 3 cards.
test('REQ-72-03/04/05/09/19: módulo con matchMedia de escritorio y scrub (pin sustituido por sticky en la 73)', () => {
  const mod = read(MOD);
  assert.match(mod, /^gsap[.]registerPlugin[(]ScrollTrigger[)]/m);
  assert.ok(mod.includes("'(min-width: 1201px) and (prefers-reduced-motion: no-preference)'"));
  for (const fn of ['trackOffset', 'pinScrollLength', 'focusScrollTarget']) assert.ok(mod.includes(fn), fn);
  for (const s of ['scrub: true', "ease: 'none'", 'invalidateOnRefresh: true', 'length < 3']) assert.ok(mod.includes(s), s);
  assert.match(mod, /x: [(][)] =>/);
  for (const s of ['ScrollSmoother', 'normalizeScroll', 'clearScrollMemory', 'markers', 'pin:', 'anticipatePin']) assert.ok(!mod.includes(s), s);
});

test('REQ-72-17/18: init revierte antes de crear y destroy llama a revert', () => {
  const mod = read(MOD);
  const init = mod.slice(mod.indexOf('export function init'));
  assert.ok(init.indexOf('destroy()') >= 0 && init.indexOf('destroy()') < init.indexOf('matchMedia'), 'init debe llamar a destroy antes de matchMedia');
  const destroy = mod.slice(mod.indexOf('export function destroy'), mod.indexOf('export function destroy') + 200);
  assert.match(destroy, /revert[(][)]/);
});

test('REQ-72-15/27: CSS solo bajo .latest-articles--horizontal, overflow clip y tokens', () => {
  const css = read(CSS).replace(/[/][*][^]*?[*][/]/g, '');
  const rules = [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)];
  assert.ok(rules.length > 0);
  for (const [, sel] of rules) for (const s of sel.split(',')) assert.ok(s.includes('.latest-articles--horizontal'), s.trim());
  assert.ok(rules.some(([, , body]) => /overflow:[ ]*clip/.test(body)));
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}|rgba?[(]/);
  assert.doesNotMatch(css, /(padding|margin|gap|radius|shadow)[^:;]*:[^;]*[0-9]px/);
});

test('REQ-72-22/23/24 (build): GSAP solo en la portada, con copyright y <= 51200 B gzip', () => {
  const out = mkdtempSync(join(tmpdir(), 'gsap-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const client = join(out, 'client');
    const chunk = (name) => readFileSync(join(client, '_astro', name), 'utf8');
    const deps = (name, seen = new Set()) => { if (seen.has(name)) return seen; seen.add(name);
      for (const [, dep] of chunk(name).matchAll(/from ?["'][.][/]([^"']+[.]js)["']|import ?["'][.][/]([^"']+[.]js)["']/g)) if (dep) deps(dep, seen);
      return seen; };
    const pageChunks = (page) => { const all = new Set();
      for (const [, src] of readFileSync(join(client, page), 'utf8').matchAll(/(?:src|href)="[/]_astro[/]([^"]+[.]js)"/g)) for (const d of deps(src)) all.add(d);
      return all; };
    const isGsap = (name) => /gsap[.]com/.test(chunk(name)); // código de GSAP (REQ-72-22)
    const home = pageChunks('index.html');
    assert.ok([...home].some((c) => isGsap(c) && /@license Copyright [0-9-]+, GreenSock/.test(chunk(c))), 'la portada no carga GSAP con su aviso @license (REQ-72-24)');
    const post = readdirSync(join(client, 'posts'))[0];
    for (const page of [join('posts', post, 'index.html'), join('search', 'index.html'), join('about', 'index.html'), '404.html']) {
      if (!existsSync(join(client, page))) continue;
      const shared = pageChunks(page);
      assert.ok(![...shared].some(isGsap), `${page} carga GSAP`);
      for (const c of shared) home.delete(c);
    }
    const added = [...home].reduce((sum, c) => sum + gzipSync(chunk(c)).length, 0);
    assert.ok(added <= 51200, `JS añadido a la portada: ${added} B gzip`);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-72-32: archivos de la feature <= 100 líneas', () => {
  for (const rel of [COMP, MOD, CSS, 'src/pages/index.astro', 'tests/latest-articles-horizontal-scroll.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
