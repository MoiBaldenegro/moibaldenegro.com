// Tests de la feature 29 horizontal-scroll-gsap-cards (REQ-29-01..10,
// specs/29_horizontal-scroll-gsap-cards/requirements.md y design.md).
//
// Corrección de rumbo del humano (verbatim en
// progress/research/gsap-horizontal-cards.md): NO es un carrusel navegable,
// NO usa scroll-snap y NO es animación de entrada; es scroll-driven: el
// scroll vertical conduce la traslación horizontal de la pista de las 3
// cards recientes (feature 28) con gsap + ScrollTrigger (pin + scrub).
// ScrollTrigger vive dentro del paquete gsap de la feature 28: sin
// dependencia nueva. Patrón mixto del arnés: unitarios por import directo
// del módulo cliente .ts (puro y headless-safe) + inspección por regex
// sobre el módulo, el componente, su <script> y la hoja.
//
//   REQ-29-01 — la sección traslada su pista horizontalmente gobernada por
//               el scroll con fijado y progreso vinculado.
//   REQ-29-02 — el módulo importa gsap y ScrollTrigger desde el paquete gsap.
//   REQ-29-03 — el módulo registra la animación como listener de
//               astro:page-load (ClientRouter, feature 10).
//   REQ-29-04 — al entrar en vista fija la sección y vincula el progreso
//               horizontal al desplazamiento vertical.
//   REQ-29-05 — con movimiento reducido omite la animación (estático visible).
//   REQ-29-06 — sin JS las 3 cards quedan visibles sin animación.
//   REQ-29-07 — las cards conservan los pares title-<id>/img-<id>.
//   REQ-29-08 — con consulta activa no rompe el modo resultados; al vaciar
//               se restaura (convivencia live-search, features 5/10).
//   REQ-29-09 — la hoja usa solo tokens de tokens.css.
//   REQ-29-10 — cada archivo modificado respeta las 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  SCROLL_READY_CLASS,
  trackShift,
  shouldBuildTrigger,
  landingHidden,
  initLatestScroll,
} from '../src/components/latest-articles-scroll.ts';

const MODULE_URL = new URL('../src/components/latest-articles-scroll.ts', import.meta.url);
const COMPONENT_URL = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_URL = new URL('../src/styles/latest-articles.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-29-02)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-29-07)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-29-09)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-29-02: el módulo importa gsap y ScrollTrigger desde el paquete gsap', () => {
  const source = readModule();
  assert.match(
    source,
    /from\s*['"]gsap['"]/,
    "el módulo no importa el core desde el paquete 'gsap' (REQ-29-02)",
  );
  assert.match(
    source,
    /from\s*['"]gsap\/ScrollTrigger['"]/,
    "el módulo no importa ScrollTrigger desde 'gsap/ScrollTrigger' (REQ-29-02)",
  );
  assert.match(
    source,
    /registerPlugin\s*\(\s*ScrollTrigger\s*\)/,
    'el módulo no registra ScrollTrigger con registerPlugin (REQ-29-02)',
  );
  assert.doesNotMatch(
    source,
    /from\s*['"](gsap-all|@gsap\/|scroll-trigger|scrolltrigger)['"]/i,
    'el módulo importa la animación desde un paquete distinto de gsap (REQ-29-02)',
  );
});

test('REQ-29-01/04: la pista se configura con fijado y progreso vinculado al desplazamiento', () => {
  const source = readModule();
  assert.match(
    source,
    /pin\s*:\s*true/,
    'la configuración de ScrollTrigger no fija la sección (pin: true, REQ-29-01/04)',
  );
  assert.match(
    source,
    /scrub\s*:\s*true/,
    'la configuración de ScrollTrigger no vincula el progreso (scrub, REQ-29-01/04)',
  );
  assert.match(
    source,
    /\bx\s*:/,
    'el tween no traslada la pista en el eje horizontal (x, REQ-29-01)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /scroll-snap|scrollSnap/,
    'la pista usa scroll-snap: es carrusel, no scroll-driven (corrección del humano)',
  );
});

test('REQ-29-03: el script registra la animación como listener de astro:page-load', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /addEventListener\s*\(\s*['"]astro:page-load['"]/,
    "el <script> no registra la animación como listener de astro:page-load (REQ-29-03)",
  );
  assert.match(
    astro,
    /initLatestScroll/,
    'el <script> no arranca initLatestScroll (REQ-29-03)',
  );
  assert.doesNotMatch(
    astro,
    /\n\s*initLatestScroll\s*\(/,
    'el <script> invoca initLatestScroll de forma directa en vez de vía listener (REQ-29-03)',
  );
});

test('REQ-29-03: el módulo limpia los triggers previos antes de recrear (ClientRouter)', () => {
  const source = readModule();
  assert.match(
    source,
    /ScrollTrigger\.getAll\(\)/,
    'el módulo no enumera los triggers previos con ScrollTrigger.getAll() (REQ-29-03)',
  );
  assert.match(
    source,
    /\.kill\(\)/,
    'el módulo no elimina los triggers previos con kill() (REQ-29-03)',
  );
});

test('REQ-29-04: el desplazamiento vertical conduce la traslación horizontal de la pista', () => {
  assert.equal(trackShift(0, 400), 0, 'con progreso 0 la pista no se desplaza (REQ-29-04)');
  assert.equal(trackShift(0.5, 400), -200, 'con progreso 0.5 la pista recorre la mitad (REQ-29-04)');
  assert.equal(trackShift(1, 400), -400, 'con progreso 1 la pista completa el recorrido (REQ-29-04)');
  assert.equal(trackShift(-0.5, 400), 0, 'el progreso negativo se sujeta a 0 (REQ-29-04)');
  assert.equal(trackShift(1.5, 400), -400, 'el progreso mayor que 1 se sujeta al máximo (REQ-29-04)');
  assert.ok(
    Math.abs(trackShift(0.75, 400)) > Math.abs(trackShift(0.25, 400)),
    'a mayor desplazamiento vertical, mayor traslación horizontal (REQ-29-04)',
  );
});

test('REQ-29-05: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(
    shouldBuildTrigger(false, true),
    false,
    'con prefers-reduced-motion no se construye el trigger (REQ-29-05)',
  );
  assert.equal(
    shouldBuildTrigger(false, false),
    true,
    'sin movimiento reducido sí se construye el trigger (REQ-29-05)',
  );
  assert.match(
    readModule(),
    /prefers-reduced-motion/,
    'el módulo no consulta prefers-reduced-motion (REQ-29-05)',
  );
  assert.match(
    readModule(),
    /matchMedia/,
    'el módulo no usa matchMedia para el movimiento reducido (REQ-29-05)',
  );
});

test('REQ-29-06: sin JavaScript la portada muestra las 3 cards visibles sin animación', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /\.slice\(\s*0\s*,\s*3\s*\)/,
    'la portada no limita a las 3 recientes sin JS (REQ-29-06, feature 28)',
  );
  assert.match(
    astro,
    /<section[^>]*class="latest-articles"/,
    'la sección no se renderiza en el HTML estático (REQ-29-06)',
  );
  assert.doesNotMatch(
    astro,
    /<section[^>]*\bhidden\b/,
    'la sección nace oculta y exige JS para verse (REQ-29-06)',
  );
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-29-06)');
  assert.match(
    baseList[1],
    /display\s*:\s*grid/,
    'la disposición base sin JS no muestra la lista en estático (REQ-29-06)',
  );
});

test('REQ-29-07: las cards conservan los pares de transición por identificador', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /transition:name=\{`img-\$\{post\.id\}`\}/,
    'la imagen no lleva transition:name={`img-${post.id}`} (REQ-29-07)',
  );
  assert.match(
    astro,
    /transition:name=\{`title-\$\{post\.id\}`\}/,
    'el título no lleva transition:name={`title-${post.id}`} (REQ-29-07)',
  );
});

test('REQ-29-08: con búsqueda activa no rompe el modo resultados y al vaciar se restaura', () => {
  assert.equal(
    shouldBuildTrigger(true, false),
    false,
    'con la landing oculta (modo resultados) no se construye el trigger (REQ-29-08)',
  );
  assert.equal(
    shouldBuildTrigger(false, false),
    true,
    'al vaciar la consulta la sección se restaura con trigger (REQ-29-08)',
  );
  assert.equal(
    landingHidden({ closest: () => null }),
    false,
    'sin ancestro de landing no hay modo resultados (REQ-29-08)',
  );
  assert.equal(
    landingHidden({ closest: () => ({ hasAttribute: () => true }) }),
    true,
    'con la landing oculta se detecta el modo resultados (REQ-29-08)',
  );
  assert.equal(
    landingHidden({ closest: () => ({ hasAttribute: () => false }) }),
    false,
    'con la landing visible no hay modo resultados (REQ-29-08)',
  );
  assert.match(
    readModule(),
    /ScrollTrigger\.refresh\(\)/,
    'el módulo no refresca el trigger al restaurar (REQ-29-08)',
  );
  assert.doesNotThrow(
    () => initLatestScroll(null, null),
    'la re-inicialización sin DOM no es un no-op seguro (REQ-29-08)',
  );
});

test('REQ-29-09: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    css,
    /#[0-9a-fA-F]{3,8}\b/,
    'latest-articles.css contiene un color hex hardcodeado (REQ-29-09)',
  );
  assert.doesNotMatch(
    css,
    /rgba?\(/,
    'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-29-09)',
  );
  assert.ok(
    css.includes(`.${SCROLL_READY_CLASS}`),
    `latest-articles.css no declara el modificador .${SCROLL_READY_CLASS} (REQ-29-09)`,
  );
});

test('REQ-29-10: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100, REQ-29-10)`,
    );
  }
});
