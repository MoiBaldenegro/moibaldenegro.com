// Feature 82 about-hero-stats: carcasa de /about, hero profesional y cifras (REQ-82-01..24).
// Spec: specs/82_about-hero-stats/. Layout y contraste (REQ-82-18..21) con CDP: progress/impl_82.md.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const lines = (src) => src.trimEnd().split(/\r?\n/).length;
const COMP = 'src/components/about/';
const SHEETS = ['src/styles/about-hero.css', 'src/styles/about-stats.css'];
const hero = JSON.parse(read('src/data/hero.json'));
const about = JSON.parse(read('src/data/about.json'));
let out, html = '', text = '';

before(() => {
  out = mkdtempSync(join(tmpdir(), 'about82-build-'));
  const build = astroBuild(['--outDir', out]);
  assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  html = readFileSync(join(out, 'client', 'about', 'index.html'), 'utf8');
  const ents = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' };
  text = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&(amp|quot|#39|lt|gt);/g, (_, e) => ents[e]);
});
after(() => rmSync(out, { recursive: true, force: true }));

test('REQ-82-01/02/03: about.astro compone hero y cifras sin lógica en el frontmatter', () => {
  const page = read('src/pages/about.astro');
  for (const s of ['AboutHero', 'AboutStats', 'HeroProfileRepository', 'AboutRepository']) assert.match(page, new RegExp(`import\\s+(\\{\\s*)?${s}\\b`), s);
  for (const c of ['HeroProfileRepository', 'AboutRepository']) assert.ok(page.includes(`new ${c}().getProfile()`), c);
  const heroTag = page.match(/<AboutHero\b[\s\S]*?(\/>|<\/AboutHero>)/)?.[0] ?? '';
  for (const f of ['name', 'username', 'description', 'image']) assert.ok(heroTag.includes(`profile.${f}`), f);
  for (const s of ['About — moisesbaldenegro.com', '<p class="about__intro">{SITE_DESCRIPTION}</p>']) assert.ok(page.includes(s), s);
  assert.doesNotMatch(page.split('---')[1] ?? '', /\.map\(|\.filter\(|\bif\b|\bfunction\b|=>/);
});
test('REQ-82-04/05/06/07: h1 único, textos del perfil y foto enmarcada 1:1', () => {
  const h1 = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) ?? [];
  assert.ok(h1.length === 1 && h1[0].includes(hero.name), 'un solo h1 con el nombre');
  assert.match(html, /<section class="about-hero"[^>]*>[\s\S]*<h1\b[\s\S]*<\/section>/);
  for (const t of [hero.username, about.headline, about.location, about.summary, hero.description]) assert.ok(text.includes(t), t);
  const img = html.match(/<img\b[^>]*class="about-hero__photo"[^>]*>/)?.[0] ?? '';
  for (const a of ['src="/assets/moises-hero.jpg"', `alt="${about.photoAlt}"`, 'width="952"', 'height="960"']) assert.ok(img.includes(a), a);
  const rule = noComments(read(SHEETS[0])).match(/\.about-hero__photo\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const re of [/aspect-ratio:\s*1\s*;/, /object-fit:\s*cover/, /border-radius:\s*var\(--radius-card\)/, /outline:[^;]*var\(--color-accent\)/]) assert.match(rule, re);
});
test('REQ-82-08/09/10: enlaces con icono del sprite, CTA de descarga y sin scripts', () => {
  const links = { github: 'https://github.com/MoiBaldenegro', linkedin: 'https://www.linkedin.com/in/moibaldenegro/', youtube: 'https://www.youtube.com/@moibaldenegro' };
  for (const [id, href] of Object.entries(links)) {
    const a = html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>([\\s\\S]*?)</a>`))?.[1] ?? '';
    assert.match(a, new RegExp(`<svg[^>]*aria-hidden="true"[^>]*>\\s*<use href="/assets/svg/sprite\\.svg#${id}"`), id);
    assert.match(a, /<span class="visually-hidden">[^<]*sitio externo/, id);
  }
  // Acotado al hero: el footer del layout también enlaza /cv.pdf (REQ-89-05, precedente REQ-43-06).
  const cta = (html.match(/<section class="about-hero"[\s\S]*?<\/section>/)?.[0] ?? '').match(/<a[^>]*href="\/cv\.pdf"[^>]*download="moises-baldenegro-cv\.pdf"[^>]*>([\s\S]*?)<\/a>/g) ?? [];
  assert.ok(cta.length === 1 && cta[0].includes('Descargar CV'), 'un solo CTA Descargar CV');
  const comps = existsSync(new URL(COMP, root)) ? readdirSync(new URL(COMP, root)) : [];
  assert.ok(comps.includes('about-hero.astro') && comps.includes('about-stats.astro'));
  for (const f of ['src/pages/about.astro', ...comps.map((c) => COMP + c)]) assert.ok(!/\/assets\/cv\/|<script/.test(read(f)), f);
});
test('REQ-82-11/12/13: cifras bajo h2 oculto, about.css carcasa e imports de hojas', () => {
  assert.match(html, /<h2[^>]*class="visually-hidden"[^>]*>Cifras destacadas<\/h2>/);
  const list = html.match(/<ul class="about-stats__list">([\s\S]*?)<\/ul>/)?.[1] ?? '';
  const items = [...list.matchAll(/<li>[\s\S]*?<\/li>/g)].map((m) => m[0]);
  assert.equal(items.length, 4);
  assert.deepEqual(about.stats.map((s) => s.value), ['+6', '4', 'Sep 2025', '3']);
  about.stats.forEach((s, i) => assert.ok(items[i].includes(`>${s.value}<`) && items[i].includes(s.label), s.value));
  const css = read('src/styles/about.css');
  for (const t of ['background', 'text', 'text-secondary', 'border', 'surface']) assert.ok(css.includes(`var(--color-${t})`), t);
  for (const t of ['--radius-card', '--gap-card', '--container-max']) assert.ok(css.includes(`var(${t})`), t);
  for (const n of ['hero', 'stats']) assert.ok(read(`${COMP}about-${n}.astro`).includes(`import '../../styles/about-${n}.css'`), n);
});
test('REQ-82-14/15/16/17: hojas nuevas solo con tokens, --gap-card y reduced-motion', () => {
  const spacing = /^(0|auto|var\(--gap-card\)|calc\(.*var\(--gap-card\).*\))$/;
  for (const file of SHEETS) {
    const css = noComments(read(file));
    assert.ok(css.length > 0, `${file} no existe`);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|prefers-color-scheme/i, file);
    const motion = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?\})\s*\}/)?.[1] ?? '';
    for (const [, prop, raw] of css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
      const v = raw.trim();
      if (/^(color|background|border|outline|box-shadow|transition|font-family)/.test(prop) && prop !== 'outline-offset') {
        assert.ok(/var\(--/.test(v) || (prop === 'transition' && v === 'none'), `${file}: ${prop}: ${v}`);
      }
      if (/^(margin|padding)|gap$/.test(prop)) assert.ok(v.split(/\s+(?![^(]*\))/).every((p) => spacing.test(p)), `${file}: ${prop}: ${v}`);
    }
    if (/transition\s*:\s*[^;]*var/.test(css)) assert.match(motion, /transition:\s*none/, `${file} sin reduced-motion`);
  }
  assert.ok(!read('src/styles/about.css').includes('prefers-color-scheme'));
  assert.equal(lines(read('src/styles/tokens.css')), 99); // Ajuste feature 92 (precedente REQ-43-06): 97 + --color-marca-htb/-accent (REQ-92-02).
});
test('REQ-82-22/24: privacidad del HTML construido y archivos de <= 100 líneas', () => {
  assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  assert.doesNotMatch(text, /\+?\d[\d\s().-]{8,}\d/);
  for (const t of ['salud digna', 'cinnamon', 'neww relic', 'moisesbaldenegro1546', 'lamar university']) assert.ok(!html.toLowerCase().includes(t), t);
  const files = ['src/pages/about.astro', 'src/styles/about.css', ...SHEETS, `${COMP}about-hero.astro`, `${COMP}about-stats.astro`, 'tests/about-hero-stats.test.mjs'];
  for (const f of files) assert.ok(read(f) && lines(read(f)) <= 100, f);
});
