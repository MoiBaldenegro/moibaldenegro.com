// Feature 84 about-projects-credentials: proyectos, contenido, formación y filosofía en /about
// (REQ-84-01..22, specs/84_*). Layout con CDP (REQ-84-16/17): progress/impl_84.md y capturas.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os'; import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const lines = (src) => src.trimEnd().split(/\r?\n/).length;
const ents = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' };
const toText = (h) => h.replace(/<[^>]*>/g, ' ').replace(/&(amp|quot|#39|lt|gt);/g, (_, e) => ents[e]).replace(/\s+/g, ' ').trim();
const COMP = 'src/components/about/', NAMES = ['projects', 'content', 'credentials', 'philosophy'];
const SHEETS = ['src/styles/about-projects.css', 'src/styles/about-credentials.css'];
const about = JSON.parse(read('src/data/about.json'));
const SITE_DESCRIPTION = read('src/domain/seo/head.ts').match(/SITE_DESCRIPTION =\s*'([^']*)'/)[1];
const section = (cls) => html.match(new RegExp(`<section class="${cls}"[^>]*>[\\s\\S]*?</section>`))?.[0] ?? '';
const h3s = (sec) => [...sec.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => m[1]);
const block = (css, head, d = 0) => { // contenido de un bloque { … } con llaves anidadas
  const j = css.indexOf('{', css.indexOf(head));
  for (let k = j; css.includes(head) && k < css.length; k++) { d += css[k] === '{' ? 1 : css[k] === '}' ? -1 : 0; if (!d) return css.slice(j + 1, k); }
  return ''; };
const scripts = (h) => (h.match(/<script\b[^>]*>/g) ?? []).sort();
let out, html = '', notFound = '';
before(() => { out = mkdtempSync(join(tmpdir(), 'about84-build-'));
  const build = astroBuild(['--outDir', out]);
  assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  html = readFileSync(join(out, 'client', 'about', 'index.html'), 'utf8'); notFound =readFileSync(join(out, 'client', '404.html'), 'utf8');
});
after(() => rmSync(out, { recursive: true, force: true }));

test('REQ-84-01/02/03: about.astro compone las 8 secciones y pasa la intro por el slot de Contenido', () => {
  const page = read('src/pages/about.astro'), at = (s) => page.indexOf(s);
  const order = ['Hero', 'Stats', 'Timeline', 'Skills', 'Projects', 'Content', 'Credentials', 'Philosophy'].map((n) => at(`<About${n}`));
  order.forEach((p, i) => assert.ok(p > 0 && (i === 0 || p > order[i - 1]), `orden ${i}`));
  const slot = page.slice(at('<AboutContent'), at('</AboutContent>')); assert.ok(at('</AboutContent>') > 0 && slot.includes('<p class="about__intro">{SITE_DESCRIPTION}</p>'), 'intro en el slot');
  assert.ok(!page.includes('about__section'), 'se elimina la sección final');
  assert.doesNotMatch(page.split('---')[1] ?? '', /\.map\(|\.filter\(|\bif\b/); assert.ok(lines(page) <= 100);
});
test('REQ-84-04/05/06: h2 Proyectos destacados y 5 tarjetas con enlace en el h3 y descripción', () => {
  const sec = section('about-projects'); assert.match(sec, /<h2\b[^>]*>Proyectos destacados<\/h2>/);
  const urls = ['https://github.com/MoiBaldenegro/raul-framework', 'https://www.npmjs.com/package/mouter-router',
    'https://github.com/MoiBaldenegro/mfinance', 'https://github.com/MoiBaldenegro/cubepath-cms-hackaton', 'https://github.com/MoiBaldenegro/harness-engineering'];
  const heads = h3s(sec); assert.equal(heads.length, 5, 'cinco proyectos');
  ['Raúl', 'mouter-router', 'MFinance', 'Testimo', 'Harness Kit'].forEach((name, i) => {
    assert.match(heads[i], new RegExp(`<a\\b[^>]*href="${urls[i]}"[^>]*>${name}<span class="visually-hidden">[^<]*sitio externo[^<]*</span></a>`), name);
    const after = sec.slice(sec.indexOf(heads[i]) + heads[i].length);
    assert.ok(toText(after.split(/<h3\b/)[0]).includes(about.projects[i].description), `descripción ${name}`);
  });
});
test('REQ-84-07/08/09: h2 Contenido con la intro por slot y tarjetas al blog y al curso de Rust', () => {
  const sec = section('about-content'); assert.match(sec, /<h2\b[^>]*>Contenido<\/h2>\s*<p class="about__intro">/);
  assert.ok(toText(sec).includes(SITE_DESCRIPTION), 'SITE_DESCRIPTION');
  assert.match(sec, /<a\b[^>]*href="\/"[^>]*>/); assert.match(sec, /<a\b[^>]*href="https:\/\/www\.youtube\.com\/@moibaldenegro"[^>]*>Curso de Rust desde Cero/);
  for (const bad of ['moisesbaldenegro1546', 'cinnamon.ai']) assert.ok(!html.toLowerCase().includes(bad), bad);
});
test('REQ-84-10/11/12: Formación y certificaciones con Educación, Certificaciones e Idiomas', () => {
  const sec = section('about-credentials'); assert.match(sec, /<h2\b[^>]*>Formación y certificaciones<\/h2>/);
  assert.deepEqual(h3s(sec).map(toText), ['Educación', 'Certificaciones', 'Idiomas']);
  const [edu, certs, langs] = sec.split(/<h3\b/).slice(1).map(toText);
  for (const t of ['Ingeniería en Ciberseguridad y Telecomunicaciones', 'Universidad LAMAR, Campus Chapultepec', 'Guadalajara, Jalisco']) assert.ok(edu.includes(t), t);
  assert.doesNotMatch(edu, /\b(19|20)\d{2}\b/);
  about.certifications.forEach((c) => assert.ok(certs.includes(c.name) && certs.includes(c.issuer), c.name));
  assert.equal(certs.match(/Alura Latam/g)?.length, 2); assert.equal(certs.match(/AOVS Sistemas/g)?.length, 1);
  for (const t of ['Español', 'Nativo', 'Inglés', 'Intermedio (B1–B2, técnico)']) assert.ok(langs.includes(t), t);
});
test('REQ-84-13/14/15: Filosofía en blockquote con lema en inglés y hojas solo con tokens', () => {
  const sec = section('about-philosophy'); assert.match(sec, /<h2\b[^>]*>Filosofía<\/h2>/);
  const quote = sec.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/)?.[1] ?? ''; assert.match(quote, /<(\w+)\b[^>]*lang="en"[^>]*>\s*Deterministic Engineering in an Agentic World\s*<\/\1>/);
  assert.ok(toText(quote).includes(about.philosophy.text), 'texto');
  NAMES.forEach((n, i) => assert.ok(read(`${COMP}about-${n}.astro`).includes(`import '../../styles/about-${i < 2 ? 'projects' : 'credentials'}.css'`), n));
  const spacing = /^(0|auto|var\(--gap-card\)|calc\(.*var\(--gap-card\).*\))$/;
  for (const file of SHEETS) {
    const css = noComments(read(file)); assert.ok(css.length > 0, `${file} no existe`);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|prefers-color-scheme/i, file);
    for (const [, prop, raw] of css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
      const v = raw.trim(); if (/^(color|background|border|outline|box-shadow|transition|font-family)/.test(prop) && !/-(width|offset)$/.test(prop)) {
        assert.ok(/var\(--/.test(v) || (prop === 'transition' && v === 'none') || (prop === 'border' && /^(0|none)$/.test(v)), `${file}: ${prop}: ${v}`);
      }
      if (/^(margin|padding)|gap$/.test(prop)) assert.ok(v.split(/\s+(?![^(]*\))/).every((p) => spacing.test(p)), `${file}: ${prop}: ${v}`);
    }
    if (/transition\s*:\s*[^;]*var/.test(css)) assert.match(block(css, '@media (prefers-reduced-motion: reduce)'), /transition:\s*none/, file);
  }
  assert.equal(lines(read('src/styles/tokens.css')), 99); // Ajuste feature 92 (precedente REQ-43-06): 97 + --color-marca-htb/-accent (REQ-92-02).
});
test('REQ-84-16/18/19/21: rejillas, encabezados sin saltos, sin scripts propios ni datos privados, <= 100 líneas', () => {
  for (const f of SHEETS) assert.match(block(noComments(read(f)), '@media (min-width: 900px)'), /grid-template-columns:\s*repeat\((2|3|auto-fit|auto-fill)/, f);
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1])); assert.equal(levels.filter((l) => l === 1).length, 1);
  levels.forEach((l, i) => assert.ok(i === 0 || l <= levels[i - 1] + 1, `salto h${levels[i - 1]} → h${l}`));
  assert.deepEqual(scripts(html), scripts(notFound), 'solo los <script> del Layout');
  const text = toText(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' '));
  for (const re of [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, /\+?\d[\d\s().-]{8,}\d/]) assert.doesNotMatch(text, re);
  for (const bad of ['Salud Digna', 'Cinnamon', 'neww relic', 'moisesbaldenegro1546', 'Lamar University']) assert.ok(!html.includes(bad), bad);
  const files = ['src/pages/about.astro', ...SHEETS, ...NAMES.map((n) => `${COMP}about-${n}.astro`), 'tests/about-projects-credentials.test.mjs'];
  for (const f of files) assert.ok(read(f) && lines(read(f)) <= 100, f);
  for (const f of files.slice(0, 7)) assert.ok(!read(f).includes('<script'), f);
});
