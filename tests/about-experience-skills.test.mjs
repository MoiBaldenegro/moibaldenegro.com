// Feature 83 about-experience-skills: timeline y stack en /about (REQ-83-01..18, specs/83_*).
// Layout con CDP (REQ-83-12/15): progress/impl_83.md y capturas en progress/research/about83/.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const lines = (src) => src.trimEnd().split(/\r?\n/).length;
const ents = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' };
const toText = (h) => h.replace(/<[^>]*>/g, ' ').replace(/&(amp|quot|#39|lt|gt);/g, (_, e) => ents[e]).replace(/\s+/g, ' ');
const COMP = 'src/components/about/';
const SHEETS = ['src/styles/about-timeline.css', 'src/styles/about-skills.css'];
const about = JSON.parse(read('src/data/about.json'));
const section = (cls) => html.match(new RegExp(`<section class="${cls}"[^>]*>[\\s\\S]*?</section>`))?.[0] ?? '';
const block = (css, head, d = 0) => { // contenido de un bloque { … } con llaves anidadas
  const j = css.indexOf('{', css.indexOf(head));
  for (let k = j; css.includes(head) && k < css.length; k++) { d += css[k] === '{' ? 1 : css[k] === '}' ? -1 : 0; if (!d) return css.slice(j + 1, k); }
  return ''; };
let out, html = '';
before(() => {
  out = mkdtempSync(join(tmpdir(), 'about83-build-'));
  const build = astroBuild(['--outDir', out]);
  assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  html = readFileSync(join(out, 'client', 'about', 'index.html'), 'utf8');
});
after(() => rmSync(out, { recursive: true, force: true }));

test('REQ-83-01/02: about.astro compone timeline y stack entre las cifras y la intro', () => {
  const page = read('src/pages/about.astro'), at = (s) => page.indexOf(s);
  for (const re of [/<AboutTimeline\b[^>]*experience=\{about\.experience\}/, /<AboutSkills\b[^>]*skills=\{about\.skills\}/]) assert.match(page, re);
  assert.ok(at('<AboutStats') > 0 && at('<AboutStats') < at('<AboutTimeline'), 'timeline tras cifras');
  assert.ok(at('<AboutTimeline') < at('<AboutSkills') && at('<AboutSkills') < at('class="about__intro"'), 'stack antes de la intro');
  assert.doesNotMatch(page.split('---')[1] ?? '', /\.map\(|\.filter\(/);
});
test('REQ-83-03/04/05/06: h2 Experiencia y un <li> por puesto con role, lugar, periodo y logros', () => {
  const sec = section('about-timeline'); assert.match(sec,/<h2\b[^>]*>Experiencia<\/h2>[\s\S]*<ol class="about-timeline__list"/);
  const items = [...(sec.match(/<ol class="about-timeline__list">([\s\S]*)<\/ol>/)?.[1] ?? '')
    .matchAll(/<li class="about-timeline__item">([\s\S]*?)<\/article>\s*<\/li>/g)].map((m) => m[1]);
  assert.ok(items.length === about.experience.length && items.length === 4, `${items.length} puestos`);
  about.experience.forEach((job, i) => {
    const it = items[i], ul = it.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? '';
    assert.equal(toText(it.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] ?? '').trim(), job.role, `h3 ${i}`);
    for (const t of [job.organization, job.place]) assert.ok(toText(it).includes(t), t);
    assert.ok(it.includes(`<span class="about-timeline__period">${job.period}</span>`), job.period);
    assert.equal((ul.match(/<li\b/g) ?? []).length, job.highlights.length, `logros ${i}`);
    job.highlights.forEach((h) => assert.ok(toText(ul).includes(h), h));
    assert.ok(job.result ? toText(it).includes(`Resultado: ${job.result}`) : !it.includes('Resultado'), `resultado ${i}`);
  });
  assert.ok(about.experience[0].result && about.experience.slice(1).every((j) => !j.result));
});
test('REQ-83-07/08/09: periodos como texto, solo años 2023 y 2025 y línea con marcadores', () => {
  const t = toText(section('about-timeline'));
  for (const p of ['sep 2023 – presente', '1 año 2 meses', '3 años 5 meses', '1 año 4 meses']) assert.ok(t.includes(p), p);
  assert.deepEqual([...new Set(t.match(/\b(19|20)\d{2}\b/g))].sort(), ['2023', '2025']);
  const media = block(noComments(read(SHEETS[0])), '@media (min-width: 769px)');
  for (const re of [/border-left:[^;]*var\(--color-border-strong\)/, /::before\s*\{[^}]*background:\s*var\(--color-accent\)/]) assert.match(media, re);
});
test('REQ-83-10/11/12: h2 Stack y habilidades, un h3 por área y píldoras con borde y radio', () => {
  const sec = section('about-skills'); assert.match(sec, /<h2\b[^>]*>Stack y habilidades<\/h2>/);
  const h3 = [...sec.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => toText(m[1]).trim());
  assert.ok(h3.length === 6, 'seis áreas'); assert.deepEqual(h3, about.skills.map((s) => s.area));
  const cards = [...sec.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map((m) => m[1]);
  about.skills.forEach((s, i) => assert.deepEqual([...(cards[i] ?? '').matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((m) => toText(m[1]).trim()), s.items, s.area));
  for (const p of ['Node.js', 'NestJS', 'MongoDB', 'Docker', 'OWASP Top 10', 'Astro']) assert.ok(toText(sec).includes(p), p);
  const css = noComments(read(SHEETS[1]));
  const pill = [...css.matchAll(/([^{}]*about-skills__items[^{}]*)\{([^}]*)\}/g)].map((m) => m[2]).join(';');
  for (const re of [/border:[^;]*var\(--color-border-strong\)/, /border-radius:\s*var\(--radius-pill\)/]) assert.match(pill, re);
  assert.match(block(css, '@media (min-width: 900px)'), /grid-template-columns:\s*repeat\((2|3|auto-fit|auto-fill)/);
});
test('REQ-83-13/14: imports de hojas y hojas solo con tokens y --gap-card', () => {
  for (const n of ['timeline', 'skills']) assert.ok(read(`${COMP}about-${n}.astro`).includes(`import '../../styles/about-${n}.css'`), n);
  const spacing = /^(0|auto|var\(--gap-card\)|calc\(.*var\(--gap-card\).*\))$/;
  for (const file of SHEETS) {
    const css = noComments(read(file)); assert.ok(css.length > 0, `${file} no existe`);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|prefers-color-scheme/i, file);
    for (const [, prop, raw] of css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
      const v = raw.trim();
      if (/^(color|background|border|outline|box-shadow|transition|font-family)/.test(prop) && !/-(width|offset)$/.test(prop)) {
        assert.ok(/var\(--/.test(v) || (prop === 'transition' && v === 'none') || (prop === 'border' && /^(0|none)$/.test(v)), `${file}: ${prop}: ${v}`);
      }
      if (/^(margin|padding)|gap$/.test(prop)) assert.ok(v.split(/\s+(?![^(]*\))/).every((p) => spacing.test(p)), `${file}: ${prop}: ${v}`);
    }
    if (/transition\s*:\s*[^;]*var/.test(css)) assert.match(block(css, '@media (prefers-reduced-motion: reduce)'), /transition:\s*none/, file);
  }
  assert.equal(lines(read('src/styles/tokens.css')), 99); // Ajuste feature 92 (precedente REQ-43-06): 97 + --color-marca-htb/-accent (REQ-92-02).
});
test('REQ-83-16/18: un solo h1, encabezados sin saltos, sin scripts ni datos privados, <= 100 líneas', () => {
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1])); assert.equal(levels.filter((l) => l === 1).length, 1);
  levels.forEach((l, i) => assert.ok(i === 0 || l <= levels[i - 1] + 1, `salto h${levels[i - 1]} → h${l}`));
  const text = toText(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' '));
  for (const re of [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, /\+?\d[\d\s().-]{8,}\d/]) assert.doesNotMatch(text, re);
  const files = ['src/pages/about.astro', ...SHEETS, `${COMP}about-timeline.astro`, `${COMP}about-skills.astro`, 'tests/about-experience-skills.test.mjs'];
  for (const f of files) assert.ok(read(f) && lines(read(f)) <= 100, f);
  for (const f of files.slice(3, 5)) assert.ok(!read(f).includes('<script'), f);
});
