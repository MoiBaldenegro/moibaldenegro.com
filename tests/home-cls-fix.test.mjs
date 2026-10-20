// Feature 104 (home-cls-fix): la hoja latest-horizontal-reserve.css reserva el layout horizontal de
// «Últimos artículos» y su recorrido desde el primer pintado (sin JS nuevo) para que restaurar el
// scroll no desplace el footer. Spec: specs/104_home-cls-fix/ (requirements.md + design.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => { assert.ok(existsSync(url(rel)), `falta ${rel}`); return readFileSync(url(rel), 'utf8'); };
const lines = (t) => t.split(/\r?\n/).filter((l, i, all) => i < all.length - 1 || l !== '').length;
const code = (rel) => read(rel).replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
const squash = (s) => s.replace(/\s+/g, '');
const [RESERVE, ASTRO, HZ_CSS] = ['src/styles/latest-horizontal-reserve.css', 'src/components/latest-horizontal/latest-horizontal.astro', 'src/styles/latest-horizontal.css'];
const MQ = '@media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)';
const BASE = '.latest-articles:not(.latest-articles--horizontal)';
const SECTION = `${BASE}:has(> .latest-articles__list > .latest-articles__card:nth-child(3))`;
const media = () => { const css = code(RESERVE), at = css.indexOf('@media'); assert.notEqual(at, -1, 'sin @media'); return { css, at, open: css.indexOf('{', at) }; };
const inner = () => { const { css, open } = media(); return css.slice(open + 1, css.lastIndexOf('}')); };
const rules = () => [...inner().matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body: squash(body) }));
const rule = (sel) => { const r = rules().find((x) => squash(x.sel) === squash(sel)); assert.ok(r, `falta la regla ${sel}`); return r.body; };
const decl = (body, list, what) => { for (const d of list) assert.ok(body.includes(squash(d)), `${what} sin ${d}`); };
const prop = (css, name) => { const m = css.match(new RegExp(`${name}:([^;]+);`)); assert.ok(m, `sin ${name}`); return squash(m[1]); };
const limit = () => Number(read('src/domain/latest-posts.ts').match(/export const LATEST_POSTS_LIMIT = (\d+);/)[1]);

test('REQ-104-01: latest-horizontal.astro importa la hoja de reserva y conserva un único script', () => {
  const astro = read(ASTRO);
  for (const s of ['latest-horizontal.css', 'latest-cards-motion.css', 'latest-horizontal-reserve.css']) assert.ok(astro.includes(`import '../../styles/${s}';`), s);
  assert.equal((astro.match(/<script/g) ?? []).length, 1);
  assert.doesNotMatch(astro, /<style/);
});

test('REQ-104-02: todas las reglas dentro de una única @media de escritorio con scripting', () => {
  const { css, at, open } = media();
  assert.equal(squash(css.slice(at, open)), squash(MQ));
  assert.equal(css.slice(0, at).trim(), '', 'reglas fuera de la @media');
  assert.equal((css.match(/@media/g) ?? []).length, 1); assert.equal(css.slice(css.lastIndexOf('}') + 1).trim(), '');
  assert.ok(rules().length >= 6);
});

test('REQ-104-03: cada selector exige .latest-articles sin --horizontal y 3 o más cards con :has()', () => {
  for (const { sel } of rules()) for (const part of sel.split(',')) {
    assert.ok(part.includes(BASE), part);
    const k = part.match(/:has\(>\s*\.latest-articles__list\s*>\s*\.latest-articles__card:nth-child\((\d+)\)/);
    assert.ok(k && Number(k[1]) >= 3, `${part} sin :has() de 3+ cards`);
  }
});

test('REQ-104-04: --latest-card-width y --latest-pair-inset idénticos a latest-horizontal.css', () => {
  const hz = code(HZ_CSS), base = hz.slice(hz.indexOf('.latest-articles--horizontal {'));
  const section = rule(SECTION);
  for (const p of ['--latest-card-width', '--latest-pair-inset']) assert.equal(prop(section, p), prop(base, p), p);
});

test('REQ-104-05: replica el layout horizontal sin sticky', () => {
  decl(rule(SECTION), ['width: 100%;', 'min-height: 100vh;', 'overflow: clip;'], 'sección');
  decl(rule(`${SECTION} .latest-articles__heading`), ['width: calc(2 * var(--latest-card-width) + var(--gap-card));', 'margin-inline: auto;'], 'encabezado');
  decl(rule(`${SECTION} .latest-articles__list`), ['display: flex;', 'gap: var(--gap-card);'], 'track');
  decl(rule(`${SECTION} .latest-articles__card`), ['flex: 0 0 var(--latest-card-width);', 'width: var(--latest-card-width);'], 'card');
  decl(rule(`${SECTION} .latest-articles__card:first-child`), ['margin-inline-start: var(--latest-pair-inset);'], 'primera card');
  for (const { sel, body } of rules()) assert.doesNotMatch(body, /position:|will-change:|top:/, sel);
});

test('REQ-104-06: margin-bottom (n - 2) * (W + G) por cada n entre 3 y LATEST_POSTS_LIMIT', () => {
  const n0 = limit(); assert.ok(n0 >= 3);
  for (let n = 3; n <= n0; n++) {
    const body = rule(`${BASE}:has(> .latest-articles__list > .latest-articles__card:nth-child(${n}):last-child)`);
    assert.ok(body.includes(squash(`margin-bottom: calc((${n} - 2) * (var(--latest-card-width) + var(--gap-card)));`)), `n = ${n}`);
  }
  assert.equal(rules().filter((r) => r.body.includes('margin-bottom:')).length, n0 - 2, 'una regla de margin-bottom por cada n');
});

test('REQ-104-07: sin opacity, transform ni colores; longitudes desde tokens o la fórmula copiada', () => {
  const css = inner();
  assert.doesNotMatch(css, /opacity|transform|color|#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  const rest = css.replace(/--latest-(card-width|pair-inset):[^;]+;/g, '');
  assert.doesNotMatch(rest, /\d(px|rem|em)\b/, 'longitud hardcodeada');
  const audit = spawnSync(process.execPath, ['scripts/audit-design-tokens.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(audit.status, 0, audit.stdout + audit.stderr);
});

test('REQ-104-15: congelados sin cambios frente a HEAD', () => {
  const frozen = ['src/styles/latest-articles.css', 'src/styles/latest-horizontal.css', 'src/styles/latest-cards-motion.css',
    'src/components/latest-articles.astro', 'src/domain/latest-horizontal.ts', 'src/components/latest-horizontal/*.ts'];
  assert.equal(spawnSync('git', ['diff', '--quiet', 'HEAD', '--', ...frozen], { cwd: ROOT }).status, 0, 'congelados modificados');
});

test('REQ-104-16: REQ-96-51 decide con trigger.progress y la cabecera anota el ajuste de la 104', () => {
  const spec = read('specs/96_latest-cards-gsap-motion/requirements.md');
  const line = spec.split(/\r?\n/).find((l) => l.startsWith('REQ-96-51 '));
  assert.ok(line?.includes('trigger.progress') && !line.includes('trigger.isActive'), 'REQ-96-51');
  assert.ok(spec.split(/\r?\n/).some((l) => l.startsWith('#') && l.includes('Ajuste de texto feature 104')));
});

test('REQ-104-19: archivos nuevos o tocados en 100 líneas o menos', () => {
  for (const rel of [RESERVE, ASTRO, 'tests/home-cls-fix.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
