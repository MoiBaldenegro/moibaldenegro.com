// CV en PDF generado en build desde el repositorio del About (feature 81
// cv-pdf-endpoint, REQ-81-01..24, specs/81_cv-pdf-endpoint/requirements.md).
// Los módulos de src/domain/cv/, el endpoint y pdf-lib se importan de forma
// dinámica dentro de cada test: así cada criterio falla por separado en rojo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { HeroProfileRepository } from '../src/domain/repositories/hero-profile-repository.ts';
import { AboutRepository } from '../src/domain/repositories/about-repository.ts';
import { cvContact } from '../src/domain/about-links.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const hero = new HeroProfileRepository().getProfile();
const about = new AboutRepository().getProfile();
const CV = '../src/domain/cv/';
const load = (name) => import(`${CV}${name}`);
const measure = (t, size) => t.length * size * 0.5;
const W = 595.28;
const H = 841.89;
const MARGIN = 48;
const EMAIL = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE = /\+?\d[\d\s().-]{8,}\d/;
const plain = (text) => text.replace(/<[^>]*>/g, ' ');

// Caracteres de 0x80-0x9F de WinAnsi (CP1252); el resto es ASCII imprimible o Latin-1.
const CP1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008DŽ\u008F\u0090‘’“”•–—˜™š›œ\u009DžŸ';
const isWinAnsi = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || (CP1252.includes(ch) && !/[\u0080-\u009f]/.test(ch));
};
const decodeWinAnsi = (bytes) => bytes.map((b) => (b >= 0x80 && b <= 0x9f ? CP1252[b - 0x80] : String.fromCharCode(b))).join('');

const allOps = (pages) => pages.flatMap((p) => p.ops);
const joined = (pages) => allOps(pages).map((o) => o.text).join(' ');

test('REQ-81-01/02/03: pdf-lib 1.17.1 exacta registrada y validador de dependencias verde', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.dependencies?.['pdf-lib'], '1.17.1');
  const registry = read('docs/dependencies.md').replace(/\r\n/g, '\n');
  const entry = registry.split('### pdf-lib\n')[1];
  assert.ok(entry, 'falta la entrada ### pdf-lib');
  const block = entry.split('\n### ')[0];
  for (const line of ['- version: 1.17.1', '- scope: dependencies', '- approved: 2026-10-12']) {
    assert.ok(block.includes(line), `falta "${line}"`);
  }
  assert.match(block, /- motivo: .*CV.*PDF/i);
  const check = spawnSync(process.execPath, ['scripts/check-format.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(check.status, 0, `check-format falló:\n${check.stdout}\n${check.stderr}`);
});

test('REQ-81-04/05/06: toWinAnsi elimina lo que no es WinAnsi y conserva los textos del CV', async () => {
  const { toWinAnsi } = await load('win-ansi.ts');
  assert.equal(toWinAnsi('Rustacean 🦀'), 'Rustacean');
  assert.equal(toWinAnsi('a  🦀  b'), 'a b');
  assert.equal(toWinAnsi('Moisés ñ – • |'), 'Moisés ñ – • |');
  const texts = [about.headline, about.location, about.summary,
    ...about.experience.flatMap((e) => [e.role, e.organization, e.place, e.period, ...e.highlights, e.result ?? '']),
    ...about.skills.flatMap((s) => [s.area, ...s.items]),
    ...about.education.flatMap((e) => [e.degree, e.institution, e.place]),
    ...about.certifications.flatMap((c) => [c.name, c.issuer]),
    ...about.languages.flatMap((l) => [l.name, l.level]),
    ...cvContact(about).map((l) => l.href)].filter(Boolean);
  for (const t of texts) assert.equal(toWinAnsi(t), t);
});

test('REQ-81-07/08: wrapText respeta maxWidth, conserva el texto y aísla palabras largas', async () => {
  const { wrapText } = await load('text-wrap.ts');
  const m = (t) => measure(t, 10);
  const text = about.summary;
  const lines = wrapText(text, 200, m);
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(m(line) <= 200, line);
  assert.equal(lines.join(' '), text);
  const long = 'x'.repeat(60);
  const out = wrapText(`a ${long} b`, 100, m);
  assert.deepEqual(out, ['a', long, 'b']);
});

test('REQ-81-09/10: layoutCv devuelve páginas A4 con el orden del CV', async () => {
  const { layoutCv } = await load('cv-layout.ts');
  const pages = layoutCv(hero, about, measure);
  assert.ok(pages.length >= 1);
  for (const p of pages) {
    assert.equal(p.width, W);
    assert.equal(p.height, H);
    for (const op of p.ops) {
      for (const k of ['text', 'x', 'y', 'size', 'bold']) assert.ok(k in op, k);
      assert.ok(op.y >= MARGIN, `y ${op.y} < margen`);
      assert.ok(op.x >= MARGIN && measure(op.text, op.size) <= W - op.x, op.text);
    }
  }
  const ops = allOps(pages);
  assert.equal(ops[0].text, hero.name);
  assert.equal(ops[0].bold, true);
  const at = (needle) => ops.findIndex((o) => o.text.includes(needle));
  const heading = (name) => ops.findIndex((o) => o.text === name);
  const order = [at(about.headline.split(' | ')[0]), at(about.location), at('https://moisesbaldenegro.com'),
    ...['Perfil', 'Experiencia', 'Habilidades', 'Educación', 'Certificaciones', 'Idiomas'].map(heading)];
  for (const i of order) assert.ok(i > 0, `falta un elemento: ${order}`);
  for (let i = 1; i < order.length; i++) assert.ok(order[i] > order[i - 1], `orden: ${order}`);
  for (const link of cvContact(about)) assert.ok(at(link.href) > 0, link.href);
  assert.doesNotMatch(read('src/domain/cv/cv-layout.ts'), /from\s+['"]pdf-lib['"]|import\(\s*['"]pdf-lib/);
});

test('REQ-81-11: salto de página al margen inferior', async () => {
  const { layoutCv } = await load('cv-layout.ts');
  const summary = Array.from({ length: 40 }, () => about.summary).join(' ');
  const pages = layoutCv(hero, { ...about, summary }, measure);
  assert.ok(pages.length > 1);
  const first = pages[1].ops[0];
  assert.ok(Math.abs(first.y - (H - MARGIN)) <= first.size, `y ${first.y}`);
  for (const op of allOps(pages)) assert.ok(op.y >= MARGIN);
});

test('REQ-81-12: puestos, periodos, logros con viñeta y resultado', async () => {
  const { layoutCv } = await load('cv-layout.ts');
  const pages = layoutCv(hero, about, measure);
  const text = joined(pages);
  for (const job of about.experience) {
    assert.ok(text.includes(job.role), job.role);
    for (const h of job.highlights) assert.ok(text.includes(`• ${h}`), h);
  }
  for (const period of ['sep 2023 – presente', '1 año 2 meses', '3 años 5 meses', '1 año 4 meses']) {
    assert.ok(allOps(pages).some((o) => o.text.includes(period)), period);
  }
  assert.ok(text.includes(about.experience[0].result));
});

test('REQ-81-13/14/15: WinAnsi en cada operación, exclusiones y privacidad', async () => {
  const { layoutCv } = await load('cv-layout.ts');
  const dirty = layoutCv({ ...hero, name: `${hero.name} 🦀` }, about, measure);
  for (const op of allOps(dirty)) for (const ch of op.text) assert.ok(isWinAnsi(ch), `${op.text}: ${ch}`);
  const ops = allOps(layoutCv(hero, about, measure));
  for (const term of ['/assets/moises-hero.jpg', 'Rustacean', 'Raúl', 'mouter-router', 'Deterministic Engineering']) {
    assert.ok(!ops.some((o) => o.text.includes(term)), term);
  }
  for (const op of ops) {
    assert.doesNotMatch(plain(op.text), EMAIL, op.text);
    assert.doesNotMatch(plain(op.text), PHONE, op.text);
  }
});

const srcFiles = (dir) => readdirSync(new URL(dir, root), { recursive: true })
  .map((f) => `${dir}${String(f).replace(/\\/g, '/')}`)
  .filter((f) => /\.(ts|astro|mjs|js)$/.test(f));

test('REQ-81-16/17/18: adaptador pdf-lib único, StandardFonts, metadatos y bytes deterministas', async () => {
  const importers = srcFiles('src/').filter((f) => /from\s+['"]pdf-lib['"]|import\(\s*['"]pdf-lib['"]/.test(read(f)));
  assert.deepEqual(importers, ['src/domain/cv/cv-pdf.ts']);
  const adapter = read('src/domain/cv/cv-pdf.ts');
  assert.match(adapter, /StandardFonts\.Helvetica\b(?!Bold)/);
  assert.match(adapter, /StandardFonts\.HelveticaBold/);
  for (const call of adapter.matchAll(/embedFont\(([^)]*)\)/g)) assert.match(call[1], /^\s*StandardFonts\./);
  const { renderCvPdf } = await load('cv-pdf.ts');
  const { PDFDocument, PDFName } = await import('pdf-lib');
  const bytes = await renderCvPdf(hero, about);
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getTitle(), 'CV — Moisés Baldenegro Melendez');
  assert.equal(doc.getAuthor(), hero.name);
  assert.ok([1, 2].includes(doc.getPageCount()), `páginas: ${doc.getPageCount()}`);
  for (const page of doc.getPages()) {
    assert.ok(Math.abs(page.getWidth() - W) < 0.01 && Math.abs(page.getHeight() - H) < 0.01);
  }
  assert.equal(doc.catalog.lookup(PDFName.of('Lang'))?.decodeText(), 'es-MX');
  const again = await renderCvPdf(hero, about);
  assert.equal(Buffer.compare(Buffer.from(bytes), Buffer.from(again)), 0);
});

// Texto visible de un PDF: descomprime los streams FlateDecode y decodifica
// las cadenas hex WinAnsi que pdf-lib escribe con Tj.
function pdfText(buffer) {
  const raw = buffer.toString('latin1');
  const parts = [];
  for (const m of raw.matchAll(/stream\r?\n/g)) {
    const start = m.index + m[0].length;
    const end = raw.indexOf('endstream', start);
    try {
      const content = inflateSync(buffer.subarray(start, end)).toString('latin1');
      for (const s of content.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
        const bytes = s[1].match(/../g).map((h) => parseInt(h, 16));
        parts.push(decodeWinAnsi(bytes));
      }
    } catch {
      // stream no comprimido o no de contenido: se ignora
    }
  }
  return parts.join('\n');
}

test('REQ-81-19/20: endpoint prerenderizado que responde application/pdf', async () => {
  const rel = 'src/pages/cv.pdf.ts';
  assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`);
  const src = read(rel);
  assert.match(src, /export const prerender = true/);
  assert.match(src, /import \{ HeroProfileRepository \}/);
  assert.match(src, /import \{ AboutRepository \}/);
  assert.doesNotMatch(src, /data\//);
  const { GET } = await import('../src/pages/cv.pdf.ts');
  const res = await GET({ site: new URL('https://moisesbaldenegro.com'), url: new URL('https://moisesbaldenegro.com/cv.pdf') });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'application/pdf');
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(body.subarray(0, 5).toString('latin1'), '%PDF-');
});

test('REQ-81-21 (build): dist/client/cv.pdf con 1-2 páginas A4, nombre y sin correo ni teléfono', async () => {
  const out = mkdtempSync(join(tmpdir(), 'cv-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const file = join(out, 'client', 'cv.pdf');
    assert.ok(existsSync(file), 'el build no emitió client/cv.pdf');
    const buffer = readFileSync(file);
    assert.equal(buffer.subarray(0, 5).toString('latin1'), '%PDF-');
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(buffer);
    assert.ok([1, 2].includes(doc.getPageCount()), `páginas: ${doc.getPageCount()}`);
    const text = plain(pdfText(buffer));
    assert.ok(text.includes('Moisés Baldenegro Melendez'), 'el PDF no contiene el nombre');
    assert.doesNotMatch(text, EMAIL);
    assert.doesNotMatch(text, PHONE);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-81-23: los archivos de src/ creados miden <= 100 líneas', () => {
  for (const rel of ['src/domain/cv/win-ansi.ts', 'src/domain/cv/text-wrap.ts', 'src/domain/cv/cv-layout.ts',
    'src/domain/cv/cv-pdf.ts', 'src/pages/cv.pdf.ts', ...(existsSync(new URL('src/domain/cv/cv-sections.ts', root))
      ? ['src/domain/cv/cv-sections.ts'] : [])]) {
    assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`);
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
