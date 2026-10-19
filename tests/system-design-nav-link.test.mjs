// Feature 93 (system-design-nav-link): atajo «Diseño de sistemas» en el navbar con la etiqueta
// siempre completa, corte del header 969/970 px y apertura suave del menú hamburguesa.
// Spec: specs/93_system-design-nav-link/ (REQ-93-01..40). Mediciones de navegador (REQ-93-14..20,
// 28/29/32..35/38/39) en progress/impl_system-design-nav-link.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { statusForTermPath } from '../src/components/search-results/term-route.ts';

const ROOT = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const lines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');
const media = (css) => [...strip(css).matchAll(/@media[^{]+/g)].map((m) => m[0].trim());
const layout = () => read('src/layouts/Layout.astro');
const menu = () => layout().match(/<div class="site-menu"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
const anchors = () => menu().match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
const link = () => anchors().find((a) => /href="\/diseno-de-sistemas"/.test(a)) ?? '';
const POST = 'src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md';
const HEADER = ['src/styles/layout.css', 'src/styles/site-menu.css', 'src/styles/search-bar.css'];
const tags = (md) => md.match(/^tags:.*$/m)?.[0] ?? '';
const srcFiles = (dir) => readdirSync(new URL(dir, ROOT), { recursive: true }).map((f) => `${dir}${String(f).replace(/\\/g, '/')}`);

test('REQ-93-01/05: Diseño de sistemas justo tras Arquitectura y se conserva el resto del nav', () => {
  const list = anchors(); const arch = list.findIndex((a) => /href="\/arquitectura"/.test(a));
  assert.ok(arch >= 0); assert.match(list[arch + 1] ?? '', /href="\/diseno-de-sistemas"[^>]*>Diseño de sistemas<\/a>$/);
  const nav = layout().match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  for (const re of [/href="\/"[^>]*>\s*<img\b[^>]*mxvi_logo/, /href="\/about"[^>]*>About<\/a>/, /href="\/arquitectura"[^>]*>Arquitectura<\/a>/, /href="https:\/\/x\.com\/moibaldenegro"[^>]*>@moibaldenegro/, /<SearchBar\s*\/>/]) assert.match(nav, re);
});

test('REQ-93-02/03: aria-current page/undefined para /diseno-de-sistemas(/)', () => {
  assert.match(link(), /aria-current=\{Astro\.url\.pathname === '\/diseno-de-sistemas' \|\| Astro\.url\.pathname === '\/diseno-de-sistemas\/' \? 'page' : undefined\}/);
});

test('REQ-93-06/07/08: sin hijos ni aria-label; nav-label.css y site-menu__label-rest fuera de src', () => {
  const inner = link().replace(/^<a\b[^>]*>/, '').replace(/<\/a>$/, '');
  assert.equal(inner, 'Diseño de sistemas'); assert.doesNotMatch(link(), /aria-label=/);
  assert.ok(!existsSync(new URL('src/styles/nav-label.css', ROOT)), 'nav-label.css sigue existiendo');
  const hits = srcFiles('src/').filter((f) => /\.(astro|ts|css|mjs|js|json|md)$/.test(f)).filter((f) => /nav-label\.css|site-menu__label-rest/.test(read(f)));
  assert.deepEqual(hits, []);
});

test('REQ-93-09/10: media queries del header en 969/970 px y sin 768/769', () => {
  for (const rel of HEADER) {
    const mq = media(read(rel)).filter((m) => /width/.test(m));
    assert.ok(mq.some((m) => m.includes('(max-width: 969px)')), `${rel} sin max-width: 969px`);
    assert.ok(!mq.some((m) => /max-width: 768px|min-width: 769px/.test(m)), `${rel} conserva 768/769`);
  }
  assert.ok(media(read(HEADER[0])).includes('@media (min-width: 970px)'), 'layout.css sin min-width: 970px');
  assert.equal(media(read('src/styles/site-menu.css')).filter((m) => m.includes('(max-width: 969px)')).length, 2);
});

test('REQ-93-11: initSiteMenu usa matchMedia (max-width: 969px) por defecto', () => {
  const ts = read('src/components/site-menu/site-menu.ts');
  assert.match(ts, /media: Media = window\.matchMedia\('\(max-width: 969px\)'\)/); assert.doesNotMatch(ts, /768px/);
});

test('REQ-93-12/24: .site-navbar a con white-space: nowrap y layout.css en 99 líneas', () => {
  const css = strip(read(HEADER[0]));
  assert.match(css.match(/\n[.]site-navbar a[ ]*[{]([^}]*)[}]/)?.[1] ?? '', /white-space:[ ]*nowrap/);
  assert.equal(lines(read(HEADER[0])), 99);
});

test('REQ-93-13: las media queries del resto de src/styles no cambian frente a HEAD', { skip: !existsSync(new URL('.git', ROOT)) }, () => {
  const others = srcFiles('src/styles/').filter((f) => f.endsWith('.css') && !HEADER.includes(f));
  for (const rel of others) {
    let head = ''; try { head = git(['show', `HEAD:${rel}`]); } catch { continue; }
    assert.deepEqual(media(read(rel)), media(head), `${rel} cambió sus media queries`);
  }
});

test('REQ-93-04/21/22: el artículo 05 lleva el tag, la ruta responde 200 y solo cambia el tag', { skip: !existsSync(new URL('.git', ROOT)) }, () => {
  assert.match(tags(read(POST)), /#diseno-de-sistemas\b/);
  assert.equal(statusForTermPath('/diseno-de-sistemas'), 200); assert.equal(statusForTermPath('/diseno-de-sistemas/'), 200);
  const names = git(['diff', 'HEAD', '--name-only', '--', 'src/content/posts']).trim();
  assert.ok(names === '' || names === POST, `la feature toca otros artículos: ${names}`);
});

test('REQ-93-23: Layout.astro sin <style>/<script> ni import de nav-label y <= 100 líneas', () => {
  assert.doesNotMatch(layout(), /<style|<script|nav-label/); assert.ok(lines(layout()) <= 100);
});

// --- Apertura suave (REQ-93-27..37) ---
const block = (css, head) => { const s = css.indexOf(head); if (s < 0) return ''; let d = 0;
  for (let i = css.indexOf('{', s); i < css.length; i++) { if (css[i] === '{') d++; if (css[i] === '}' && --d === 0) return css.slice(s, i + 1); } return ''; };
const rule = (css, sel) => css.match(new RegExp(`(?:^|[}\\s])${sel.replace(/[.[\]()'=]/g, (c) => `\\${c}`)}[ ]*[{]([^}]*)[}]`))?.[1] ?? '';
const hamburger = () => block(strip(read('src/styles/site-menu.css')), '@media (max-width: 969px) and (scripting: enabled)');

test('REQ-93-27/31: panel cerrado oculto con visibility/opacity/translateY negativo y absoluto, sin display: none', () => {
  const css = hamburger(); const closed = rule(css, 'header.site-navbar .site-menu');
  assert.ok(css, 'falta el bloque hamburguesa'); assert.doesNotMatch(css, /display:[ ]*none/);
  for (const re of [/visibility:[ ]*hidden/, /opacity:[ ]*0;/, /transform:[ ]*translateY[(]-[0-9.]+rem[)]/, /position:[ ]*absolute/, /display:[ ]*flex/]) assert.match(closed, re);
  const open = rule(css, "header.site-navbar[data-menu='open'] .site-menu");
  for (const re of [/visibility:[ ]*visible/, /opacity:[ ]*1/, /transform:[ ]*none/]) assert.match(open, re);
  assert.doesNotMatch(open, /position:|display:/, 'el panel abierto no debe cambiar position/display');
});

test('REQ-93-28/29/30: transición de opacity, transform y visibility con var(--transition-default)', () => {
  const t = rule(hamburger(), 'header.site-navbar .site-menu').match(/transition:([^;]*);/)?.[1] ?? '';
  for (const p of ['opacity', 'transform', 'visibility']) assert.match(t, new RegExp(`${p} var[(]--transition-default[)]`), p);
  assert.doesNotMatch(strip(read('src/styles/site-menu.css')), /transition-delay|animation|[0-9.]+m?s\b/);
});

test('REQ-93-34: al abrir, visibility cambia sin transición para que el foco llegue al primer enlace', () => {
  const t = rule(hamburger(), "header.site-navbar[data-menu='open'] .site-menu").match(/transition:([^;]*);/)?.[1] ?? '';
  for (const p of ['opacity', 'transform']) assert.match(t, new RegExp(`${p} var[(]--transition-default[)]`), p);
  assert.doesNotMatch(t, /visibility/, 'con visibility en transición el panel sigue hidden en t=0 y focus() falla');
  // layout.css da a .site-navbar a «transition: all»: el enlace animaría su visibility heredada y seguiría hidden en t=0.
  assert.match(rule(hamburger(), 'header.site-navbar .site-menu a'), /transition:[ ]*color var[(]--transition-default[)];/);
});

test('REQ-93-36: con prefers-reduced-motion: reduce el panel declara transition: none', () => {
  const rm = block(strip(read('src/styles/site-menu.css')), '@media (prefers-reduced-motion: reduce)');
  const sel = rm.match(/([^{}]+)[{][^{}]*transition:[ ]*none/)?.[1].split(',').map((x) => x.trim()) ?? [];
  for (const x of ['header.site-navbar .site-menu', "header.site-navbar[data-menu='open'] .site-menu"]) assert.ok(sel.includes(x), x);
});

test('REQ-93-37: sin dependencias nuevas ni cambios en tokens.css; site-menu.css <= 100 líneas', { skip: !existsSync(new URL('.git', ROOT)) }, () => {
  assert.equal(git(['diff', 'HEAD', '--name-only', '--', 'src/styles/tokens.css', 'package.json', 'pnpm-lock.yaml']).trim(), '');
  assert.ok(lines(read('src/styles/site-menu.css')) <= 100); assert.equal(lines(read('src/styles/tokens.css')), 99);
});

test('REQ-93-40: docs/conventions.md documenta la excepción 969/970 px del header', () => {
  const doc = read('docs/conventions.md');
  assert.match(doc, /768px/); assert.match(doc, /969/); assert.match(doc, /970/); assert.match(doc, /feature 93/i);
});
