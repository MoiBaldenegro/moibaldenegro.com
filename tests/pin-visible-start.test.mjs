// Tests de la feature 33 pin-visible-start (REQ-33-01..14,
// specs/33_pin-visible-start/requirements.md y design.md).
//
// Bugfix de la persistencia de la regresión tras la feature 32 (done):
// reporte verbatim del humano "NO, se vio absolutamente ningún cambio,
// sigue completamente roto todo" + evidencia "el div .pin-spacer tiene un
// padding de más de 1700 píxeles, una locura". Causa raíz confirmada con
// evidencia en progress/research/gsap-horizontal-cards.md (sección de
// persistencia tras la 32): latest-articles-scroll.ts conserva
// start: 'top bottom' con pin: true, de modo que la sección queda FIJADA
// FUERA DE VISTA (bajo el pliegue) durante TODO el recorrido y el scrub
// mueve la pista en invisible; el usuario atraviesa el pin en blanco. La
// 32 acotó el spacer y vigiló el refresh sin mover el enganche: por eso
// nada visible cambió. El fix aplica la receta estándar: inicio que
// garantiza la sección visible llenando el viewport al fijar ('top top'
// con el min-height: 100vh existente); el hero se va con scroll normal y
// la sección entra en vista con scroll normal. Se conservan el espaciado
// acotado y el refresco vigilado de la 32, el full-bleed lado a lado de
// la 30, el centrado vertical de la 31, las 3 cards, los pares
// title-<id>/img-<id>, el live-search, el reduced-motion y el degradado
// sin JS. Patrón del arnés: inspección por regex + unitarios por import
// directo.
//
//   REQ-33-01 — el pin engancha con la sección visible llenando el viewport.
//   REQ-33-02 — al alcanzar el inicio fija con el borde superior alineado
//     al borde superior del viewport.
//   REQ-33-03 — durante el pin la pista se traslada de lado a lado visible.
//   REQ-33-04 — al agotar el recorrido libera el pin y cede el scroll.
//   REQ-33-05 — la transición hero → pin muestra contenido sin blancos.
//   REQ-33-06 — durante el pin la pista se ve sin blancos en el recorrido.
//   REQ-33-07 — al liberar continúa el scroll vertical normal sin blancos.
//   REQ-33-08 — la pista conserva las 3 cards con sus pares por id.
//   REQ-33-09 — con consulta activa se oculta y muestra el panel.
//   REQ-33-10 — con movimiento reducido omite la animación (estático).
//   REQ-33-11 — sin JS las 3 cards quedan visibles sin animación.
//   REQ-33-12 — los tests de la 31 y la 32 actualizan el inicio fuera de
//     vista al inicio visible con justificación (precedente REQ-43-06).
//   REQ-33-13 — la hoja usa solo tokens de tokens.css.
//   REQ-33-14 — cada archivo modificado respeta las 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  SCROLL_READY_CLASS,
  trackShift,
  viewportDistance,
  clampPinDistance,
  shouldBuildTrigger,
  landingHidden,
} from '../src/components/latest-articles-scroll.ts';

const MODULE_URL = new URL('../src/components/latest-articles-scroll.ts', import.meta.url);
const COMPONENT_URL = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_URL = new URL('../src/styles/latest-articles.css', import.meta.url);
const INDEX_URL = new URL('../src/pages/index.astro', import.meta.url);
const TEST_31_URL = new URL('./pin-timing-center.test.mjs', import.meta.url);
const TEST_32_URL = new URL('./pin-spacer-scroll-fix.test.mjs', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-33-01)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-33-08)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-33-01)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-33-01/02: el pin engancha con la sección visible llenando el viewport', () => {
  const source = readModule();
  assert.match(
    source,
    /start\s*:\s*['"]top top['"]/,
    "el trigger no declara el enganche visible start: 'top top' (REQ-33-01, REQ-33-02)",
  );
  assert.match(source, /pin\s*:\s*true/, 'la configuración no fija la sección (pin: true, REQ-33-01)');
  assert.match(source, /scrub\s*:\s*true/, 'la configuración no vincula el progreso (scrub, REQ-33-01)');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /start\s*:\s*['"]top bottom['"]/,
    "el trigger sigue enganchando fuera de vista con start: 'top bottom' (REQ-33-01)",
  );
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const ready = css.match(/\.latest-articles--scroll\s*\{([\s\S]*?)\}/);
  assert.ok(ready, `latest-articles.css no declara la regla .${SCROLL_READY_CLASS} (REQ-33-01)`);
  assert.match(ready[1], /min-height\s*:\s*100s?vh/, 'la sección fijada no llena el viewport (REQ-33-01, REQ-33-02)');
});

test('REQ-33-03/04: la pista atraviesa el viewport visible y libera al agotar', () => {
  const source = readModule();
  assert.match(source, /\bx\s*:/, 'el tween no traslada la pista en horizontal (x, REQ-33-03)');
  assert.match(
    source,
    /end\s*:\s*\(\s*\)(\s*:\s*\w+)?\s*=>\s*`\+=\$\{distance\(\)\}`/,
    'el fin del pin no deriva del recorrido real (REQ-33-04)',
  );
  assert.match(
    source,
    /clampPinDistance\s*\(\s*track\.scrollWidth\s*,\s*window\.innerWidth\s*\)/,
    'la distancia no se calcula acotada contra el viewport (REQ-33-03)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /scroll-snap|scrollSnap/, 'la pista usa scroll-snap: es carrusel (REQ-33-03)');
  assert.doesNotMatch(readComponent(), /<button/, 'la sección añade botones: es carrusel (REQ-33-03)');
});

test('REQ-33-05/06/07: sin huecos en blanco antes, durante ni después del pin', () => {
  const index = readFileSync(INDEX_URL, 'utf8');
  assert.match(index, /<NewHero\s*\/?>/, 'index.astro no renderiza el hero (REQ-33-05)');
  const source = readModule();
  assert.doesNotMatch(source, /NewHero/, 'el módulo fija el hero en el pin (REQ-33-05)');
  assert.match(source, /trigger\s*:\s*section/, 'el pin no se ancla solo a la sección (REQ-33-05)');
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    css,
    /\.latest-articles\s*\{[^}]*overflow-(y|x)\s*:\s*(auto|scroll)/,
    'la sección declara scroll interno en una caja (REQ-33-07)',
  );
  const ready = css.match(/\.latest-articles--scroll\s*\{([\s\S]*?)\}/);
  assert.ok(ready, `latest-articles.css no declara la regla .${SCROLL_READY_CLASS} (REQ-33-06)`);
  assert.match(ready[1], /justify-content\s*:\s*center/, 'la pista no queda centrada durante el pin (REQ-33-06)');
});

test('REQ-33-06/08: el espaciado total queda acotado a sección + recorrido real', () => {
  assert.equal(clampPinDistance(2400, 1200), 1200, 'el recorrido real no se recorta (REQ-33-06)');
  assert.equal(clampPinDistance(1200, 1200), 0, 'sin desborde el espaciado es 0 (REQ-33-06)');
  assert.equal(clampPinDistance(800, 1200), 0, 'sin desborde no hay hueco (REQ-33-06)');
  assert.equal(clampPinDistance(20000, 1280), 3840, 'el spacer gigante previo al layout queda acotado (REQ-33-06)');
  assert.ok(
    clampPinDistance(20000, 1280) < viewportDistance(20000, 1280),
    'el acotado queda por debajo de la distancia sin acotar (REQ-33-06)',
  );
  assert.equal(trackShift(0.5, clampPinDistance(2400, 1200)), -600, 'el progreso conduce la mitad (REQ-33-03)');
  const code = readModule().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /invalidateOnRefresh\s*:\s*true/,
    'el trigger recalcula en cada refresh y encadena el spacer (REQ-33-06)',
  );
  assert.doesNotMatch(
    code,
    /^\s*ScrollTrigger\.refresh\(\);\s*$/m,
    'el módulo encadena un refresh() incondicional que bloquea el scroll (REQ-33-07)',
  );
});

test('REQ-33-08/09: full-bleed, 3 cards con pares y convivencia live-search', () => {
  const css = readCss();
  assert.match(css, /\.latest-articles\s*\{[\s\S]*?width\s*:\s*100v[wd]/, 'la sección pierde el full-bleed (REQ-33-08)');
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?margin-inline\s*:\s*calc\(\s*50%\s*-\s*50v[wd]\s*\)/,
    'la sección no rompe la columna (REQ-33-08)',
  );
  const astro = readComponent();
  assert.match(astro, /\.slice\(\s*0\s*,\s*3\s*\)/, 'la portada no limita a las 3 recientes (REQ-33-08)');
  assert.match(astro, /transition:name=\{`img-\$\{post\.id\}`\}/, 'la imagen pierde su par de transición (REQ-33-08)');
  assert.match(astro, /transition:name=\{`title-\$\{post\.id\}`\}/, 'el título pierde su par de transición (REQ-33-08)');
  assert.equal(shouldBuildTrigger(true, false), false, 'con la landing oculta no se construye el trigger (REQ-33-09)');
  assert.equal(shouldBuildTrigger(false, false), true, 'al vaciar la consulta se restaura con trigger (REQ-33-09)');
  assert.equal(landingHidden({ closest: () => null }), false, 'sin ancestro de landing no hay modo resultados (REQ-33-09)');
  assert.match(astro, /data-latest-scroll/, 'la sección no vive en el flujo de landing (REQ-33-09)');
  assert.match(readFileSync(INDEX_URL, 'utf8'), /data-landing-sections/, 'la sección salió de data-landing-sections (REQ-33-09)');
  assert.match(astro, /addEventListener\s*\(\s*['"]astro:page-load['"]/, 'el <script> no usa astro:page-load (REQ-33-09)');
  assert.match(readModule(), /ScrollTrigger\.getAll\(\)/, 'el módulo no limpia los triggers previos (REQ-33-09)');
});

test('REQ-33-10: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(shouldBuildTrigger(false, true), false, 'con prefers-reduced-motion no se construye el trigger (REQ-33-10)');
  assert.match(readModule(), /prefers-reduced-motion/, 'el módulo no consulta prefers-reduced-motion (REQ-33-10)');
});

test('REQ-33-11: sin JavaScript las 3 cards quedan visibles sin animación', () => {
  const astro = readComponent();
  assert.match(astro, /<section[^>]*class="latest-articles"/, 'la sección no se renderiza en el HTML estático (REQ-33-11)');
  assert.doesNotMatch(astro, /<section[^>]*\bhidden\b/, 'la sección nace oculta y exige JS para verse (REQ-33-11)');
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-33-11)');
  assert.match(baseList[1], /display\s*:\s*grid/, 'la disposición base sin JS no muestra la lista en estático (REQ-33-11)');
});

test('REQ-33-12: los tests de la 31 y la 32 siguen a la presentación real visible', () => {
  const test31 = readFileSync(TEST_31_URL, 'utf8');
  assert.match(test31, /assert\.match\(\s*\n?\s*source,\s*\n?\s*\/start[^/]*top top/, 'el test de la 31 no declara el inicio visible (REQ-33-12)');
  assert.ok(
    /precedente REQ-43-06|REQ-43-06/.test(test31),
    'el test de la 31 no documenta la justificación del ajuste (REQ-33-12)',
  );
  assert.doesNotMatch(
    test31,
    /assert\.match\(\s*\n?\s*source,\s*\n?\s*\/start[^/]*top bottom/,
    'el test de la 31 sigue fijando el inicio fuera de vista (REQ-33-12)',
  );
  const test32 = readFileSync(TEST_32_URL, 'utf8');
  assert.match(test32, /assert\.match\(source,\s*\/start[^/]*top top/, 'el test de la 32 no declara el inicio visible (REQ-33-12)');
  assert.ok(
    /precedente REQ-43-06|REQ-43-06/.test(test32),
    'el test de la 32 no documenta la justificación del ajuste (REQ-33-12)',
  );
  assert.doesNotMatch(
    test32,
    /assert\.match\(source,\s*\/start[^/]*top bottom/,
    'el test de la 32 sigue fijando el inicio fuera de vista (REQ-33-12)',
  );
});

test('REQ-33-13: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'latest-articles.css contiene un color hex hardcodeado (REQ-33-13)');
  assert.doesNotMatch(css, /rgba?\(/, 'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-33-13)');
  assert.ok(css.includes(`.${SCROLL_READY_CLASS}`), `latest-articles.css no declara .${SCROLL_READY_CLASS} (REQ-33-13)`);
});

test('REQ-33-14: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-33-14)`);
  }
});
