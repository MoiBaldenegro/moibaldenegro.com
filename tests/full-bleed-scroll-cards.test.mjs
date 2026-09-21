// Tests de la feature 30 full-bleed-scroll-cards (REQ-30-01..10,
// specs/30_full-bleed-scroll-cards/requirements.md y design.md).
//
// Reporte UX del humano (verbatim en progress/research/gsap-horizontal-cards.md,
// D11-D15): la animación scroll-driven de la feature 29 (pin + scrub) funciona
// pero quedó encerrada en la columna de contenido (width min(...)): se pide
// FULL-BLEED — la sección fijada sale del container solo con CSS (ancho de
// viewport con margin-inline calc(50% - 50vw), sin mover marcado ni tocar
// index.astro) y las 3 cards atraviesan la web de lado a lado conducidas por
// el scroll vertical. El mecanismo scroll-driven se conserva; el único ajuste
// de JS permitido es recalcular distance() contra el ancho del viewport.
// NO es carrusel: sin scroll-snap, sin botones/puntos de navegación.
// Patrón del arnés: inspección por regex + unitarios por import directo.
//
//   REQ-30-01 — la sección ocupa todo el ancho del viewport fuera de la columna.
//   REQ-30-02 — con el scroll vertical la pista va de un lado al otro.
//   REQ-30-03 — el hero conserva su desplazamiento normal (sin pin ni caja interna).
//   REQ-30-04 — con movimiento reducido se omite la animación (estático visible).
//   REQ-30-05 — sin JS las 3 cards quedan visibles sin animación.
//   REQ-30-06 — la pista conserva las 3 cards con sus pares title-<id>/img-<id>.
//   REQ-30-07 — con consulta activa se oculta y muestra el panel de resultados.
//   REQ-30-08 — el recorrido se calcula contra el ancho del viewport.
//   REQ-30-09 — la hoja usa solo tokens de tokens.css.
//   REQ-30-10 — cada archivo modificado respeta las 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  SCROLL_READY_CLASS,
  trackShift,
  shouldBuildTrigger,
  landingHidden,
  viewportDistance,
} from '../src/components/latest-articles-scroll.ts';

const MODULE_URL = new URL('../src/components/latest-articles-scroll.ts', import.meta.url);
const COMPONENT_URL = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_URL = new URL('../src/styles/latest-articles.css', import.meta.url);
const INDEX_URL = new URL('../src/pages/index.astro', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-30-02)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-30-06)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-30-01)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-30-01: la sección declara el ancho del viewport fuera de la columna', () => {
  const css = readCss();
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?width\s*:\s*100v[wd]/,
    'la sección no declara el ancho del viewport (100vw, REQ-30-01)',
  );
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?margin-inline\s*:\s*calc\(\s*50%\s*-\s*50v[wd]\s*\)/,
    'la sección no rompe la columna con margin-inline calc(50% - 50vw) (REQ-30-01)',
  );
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?max-width\s*:\s*none/,
    'la sección no libera el tope de la columna (max-width: none, REQ-30-01)',
  );
  assert.doesNotMatch(
    css,
    /\.latest-articles\s*\{[\s\S]*?width\s*:\s*min\(\s*var\(--container-max\)/,
    'la sección sigue encerrada en la columna (width min(--container-max), REQ-30-01)',
  );
});

test('REQ-30-02/08: la pista recorre de lado a lado con el recorrido contra el viewport', () => {
  assert.equal(viewportDistance(2400, 1200), 1200, 'el recorrido no es pista menos viewport (REQ-30-08)');
  assert.equal(viewportDistance(1200, 1200), 0, 'sin desborde el recorrido es 0 (REQ-30-08)');
  assert.equal(trackShift(0.5, viewportDistance(2400, 1200)), -600, 'el progreso no conduce la mitad del recorrido (REQ-30-02)');
  const source = readModule();
  assert.match(
    source,
    /window\.innerWidth|document\.documentElement\.clientWidth/,
    'el módulo no mide el recorrido contra el ancho del viewport (REQ-30-08)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /section\.clientWidth/,
    'el recorrido sigue midiéndose contra la sección y no contra el viewport (REQ-30-08)',
  );
  assert.match(source, /pin\s*:\s*true/, 'la configuración no fija la sección (pin: true, REQ-30-02)');
  assert.match(source, /scrub\s*:\s*true/, 'la configuración no vincula el progreso (scrub, REQ-30-02)');
  assert.match(source, /\bx\s*:/, 'el tween no traslada la pista en horizontal (x, REQ-30-02)');
});

test('REQ-30-02: no es carrusel (sin scroll-snap ni navegación por botones/puntos)', () => {
  const source = readModule().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(source, /scroll-snap|scrollSnap/, 'la pista usa scroll-snap: es carrusel (REQ-30-02)');
  const astro = readComponent();
  assert.doesNotMatch(astro, /<button/, 'la sección añade botones de navegación: es carrusel (REQ-30-02)');
  assert.doesNotMatch(
    readCss().replace(/\/\*[\s\S]*?\*\//g, ''),
    /scroll-snap/,
    'la hoja usa scroll-snap como mecanismo (REQ-30-02)',
  );
});

test('REQ-30-03: el hero conserva su desplazamiento normal sin caja de scroll interno', () => {
  const index = readFileSync(INDEX_URL, 'utf8');
  assert.match(index, /<NewHero\s*\/?>/, 'index.astro no renderiza el hero (REQ-30-03)');
  const source = readModule();
  assert.doesNotMatch(source, /NewHero/, 'el módulo fija el hero en el pin (REQ-30-03)');
  assert.match(source, /trigger\s*:\s*section/, 'el pin no se ancla solo a la sección (REQ-30-03)');
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    css,
    /\.latest-articles\s*\{[^}]*overflow-(y|x)\s*:\s*(auto|scroll)/,
    'la sección declara scroll interno en una caja (REQ-30-03)',
  );
});

test('REQ-30-06: la pista conserva las 3 cards con sus pares de transición', () => {
  const astro = readComponent();
  assert.match(astro, /\.slice\(\s*0\s*,\s*3\s*\)/, 'la portada no limita a las 3 recientes (REQ-30-06)');
  assert.match(
    astro,
    /transition:name=\{`img-\$\{post\.id\}`\}/,
    'la imagen no lleva transition:name={`img-${post.id}`} (REQ-30-06)',
  );
  assert.match(
    astro,
    /transition:name=\{`title-\$\{post\.id\}`\}/,
    'el título no lleva transition:name={`title-${post.id}`} (REQ-30-06)',
  );
});

test('REQ-30-07: con búsqueda activa se oculta y muestra el panel de resultados', () => {
  assert.equal(shouldBuildTrigger(true, false), false, 'con la landing oculta no se construye el trigger (REQ-30-07)');
  assert.equal(shouldBuildTrigger(false, false), true, 'al vaciar la consulta se restaura con trigger (REQ-30-07)');
  assert.equal(landingHidden({ closest: () => null }), false, 'sin ancestro de landing no hay modo resultados (REQ-30-07)');
  assert.match(readComponent(), /data-latest-scroll/, 'la sección no vive en el flujo de landing (REQ-30-07)');
  assert.match(readFileSync(INDEX_URL, 'utf8'), /data-landing-sections/, 'la sección salió de data-landing-sections (REQ-30-07)');
});

test('REQ-30-04: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(shouldBuildTrigger(false, true), false, 'con prefers-reduced-motion no se construye el trigger (REQ-30-04)');
  assert.match(readModule(), /prefers-reduced-motion/, 'el módulo no consulta prefers-reduced-motion (REQ-30-04)');
});

test('REQ-30-05: sin JavaScript las 3 cards quedan visibles sin animación', () => {
  const astro = readComponent();
  assert.match(astro, /<section[^>]*class="latest-articles"/, 'la sección no se renderiza en el HTML estático (REQ-30-05)');
  assert.doesNotMatch(astro, /<section[^>]*\bhidden\b/, 'la sección nace oculta y exige JS para verse (REQ-30-05)');
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-30-05)');
  assert.match(baseList[1], /display\s*:\s*grid/, 'la disposición base sin JS no muestra la lista en estático (REQ-30-05)');
});

test('REQ-30-03: el script registra en astro:page-load con limpieza de triggers', () => {
  const astro = readComponent();
  assert.match(astro, /addEventListener\s*\(\s*['"]astro:page-load['"]/, 'el <script> no usa astro:page-load (REQ-30-03)');
  assert.match(readModule(), /ScrollTrigger\.getAll\(\)/, 'el módulo no enumera los triggers previos (REQ-30-03)');
  assert.match(readModule(), /ScrollTrigger\.refresh\(\)/, 'el módulo no refresca al restaurar (REQ-30-03)');
});

test('REQ-30-09: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'latest-articles.css contiene un color hex hardcodeado (REQ-30-09)');
  assert.doesNotMatch(css, /rgba?\(/, 'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-30-09)');
  assert.ok(css.includes(`.${SCROLL_READY_CLASS}`), `latest-articles.css no declara .${SCROLL_READY_CLASS} (REQ-30-09)`);
});

test('REQ-30-10: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-30-10)`);
  }
});
