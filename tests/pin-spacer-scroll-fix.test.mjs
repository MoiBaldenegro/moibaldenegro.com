// Tests de la feature 32 pin-spacer-scroll-fix (REQ-32-01..10,
// specs/32_pin-spacer-scroll-fix/requirements.md y design.md).
//
// Bugfix de la regresión de la feature 31 (done): tras el enganche temprano
// (start 'top bottom') + sección con min-height 100vh + pinSpacing por
// defecto, la portada muestra un hueco gigante vacío y el scroll vertical se
// congela. AJUSTE feature 33 (precedente REQ-43-06: los tests siguen a la
// presentación real): 'top bottom' con pin fijaba la sección FUERA DE VISTA
// y el recorrido se atravesaba en blanco (spacer de 1700px+ vacío
// reportado por el humano); el enganche visible es 'top top' con la
// sección llenando el viewport. La aserción de inicio (REQ-32-03) se
// actualiza a ese contrato; el espaciado acotado y el refresco vigilado
// se conservan. AJUSTE feature 34 (precedente REQ-43-06: los tests siguen
// a la presentación real): el fin del pin deja de re-medirse en cada
// creación (congelaba el 0 medido antes del layout y dejaba el pin sin
// longitud y la pista parada); x y end comparten la distancia medida con
// valor mayor que cero, verificada por el guardián antes de construir. Causa raíz (progress/research/gsap-horizontal-cards.md, sección
// de regresión de la 31): (a) spacer de ~100vh + recorrido completo fijado
// antes de contenido visible; (b) x/end funcionales + invalidateOnRefresh +
// lazy + refresh() incondicional desestabilizan distance(); (d) medición de
// scrollWidth previa al layout sin cota. La suite seguía en verde porque los
// tests 29/30/31 solo inspeccionan literales y funciones puras sin acotar.
// Estos tests atrapan la regresión a nivel testeable: función pura que acota
// el espaciado al recorrido real (clampPinDistance) + config del pin acotada
// sin refrescos incondicionales. Se conserva lo pedido en 29/30/31:
// scroll-driven (pin + scrub, NO carrusel), full-bleed lado a lado, enganche
// temprano visible, centrado vertical. Patrón del arnés: inspección por
// regex + unitarios por import directo.
//
//   REQ-32-01 — el pin acota su espaciado al recorrido horizontal real.
//   REQ-32-02 — el scroll vertical se conserva sin bloqueos ni bucles.
//   REQ-32-03 — la pista va de lado a lado con enganche temprano y centrado.
//   REQ-32-04 — la pista conserva las 3 cards con sus pares title-<id>/img-<id>.
//   REQ-32-05 — con consulta activa se oculta y muestra el panel de resultados.
//   REQ-32-06 — con movimiento reducido omite la animación (estático visible).
//   REQ-32-07 — sin JS las 3 cards quedan visibles sin animación.
//   REQ-32-08 — funciones puras calculan distancia y espaciado sin leer layout.
//   REQ-32-09 — la hoja usa solo tokens de tokens.css.
//   REQ-32-10 — cada archivo modificado respeta las 100 líneas.

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

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-32-01)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-32-04)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-32-03)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-32-01/08: la función pura acota el espaciado del pin al recorrido real', () => {
  assert.equal(clampPinDistance(2400, 1200), 1200, 'el recorrido real no se recorta (REQ-32-01)');
  assert.equal(clampPinDistance(1200, 1200), 0, 'sin desborde el espaciado es 0 (REQ-32-01)');
  assert.equal(clampPinDistance(800, 1200), 0, 'sin desborde no hay hueco (REQ-32-01)');
  assert.equal(clampPinDistance(20000, 1280), 3840, 'una medición previa al layout no genera hueco gigante (REQ-32-01, REQ-32-08)');
  assert.ok(
    clampPinDistance(20000, 1280) < viewportDistance(20000, 1280),
    'el acotado queda por debajo de la distancia sin acotar (REQ-32-01)',
  );
});

test('REQ-32-01/02: el pin declara el espaciado acotado sin refrescos incondicionales', () => {
  const source = readModule();
  assert.match(source, /pin\s*:\s*true/, 'la configuración no fija la sección (pin: true, REQ-32-03)');
  assert.match(source, /scrub\s*:\s*true/, 'la configuración no vincula el progreso (scrub, REQ-32-03)');
  assert.match(source, /\bx\s*:/, 'el tween no traslada la pista en horizontal (x, REQ-32-03)');
  assert.match(
    source,
    /clampPinDistance\s*\(\s*track\.scrollWidth\s*,\s*window\.innerWidth\s*\)/,
    'la distancia no se calcula acotada contra el viewport (REQ-32-01, REQ-32-08)',
  );
  assert.match(
    source,
    /end\s*:\s*`\+=\$\{distance\}`/,
    'el fin del pin no deriva de la distancia medida sincronizada con x (REQ-32-01)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /invalidateOnRefresh\s*:\s*true/,
    'el trigger recalcula en cada refresh y encadena el spacer (REQ-32-02)',
  );
  assert.match(
    source,
    /addEventListener\s*\(\s*['"]load['"]/,
    'el refresco no queda vigilado al asentar el layout (REQ-32-02)',
  );
  assert.doesNotMatch(
    code,
    /^\s*ScrollTrigger\.refresh\(\);\s*$/m,
    'el módulo encadena un refresh() incondicional que bloquea el scroll (REQ-32-02)',
  );
});

test('REQ-32-02/08: distancia y fin del pin estables ante mediciones previas al layout', () => {
  assert.equal(viewportDistance(2400, 1200), 1200, 'la distancia es pista menos viewport (REQ-32-08)');
  assert.equal(clampPinDistance(100000, 1000, 2), 2000, 'el tope por defecto no deja crecer el spacer (REQ-32-02)');
  assert.equal(clampPinDistance(2400, 0), 0, 'con viewport cero no hay recorrido (REQ-32-02)');
  assert.equal(
    `+=${clampPinDistance(20000, 1280)}`,
    '+=3840',
    'el fin del pin compone el recorrido acotado (REQ-32-02, REQ-32-08)',
  );
  assert.equal(trackShift(0.5, clampPinDistance(2400, 1200)), -600, 'el progreso conduce la mitad del recorrido (REQ-32-03)');
});

test('REQ-32-03: lado a lado full-bleed con enganche visible y centrado vertical', () => {
  const source = readModule();
  assert.match(source, /start\s*:\s*['"]top top['"]/, 'el trigger pierde el enganche visible (REQ-32-03)');
  const css = readCss();
  assert.match(css, /\.latest-articles\s*\{[\s\S]*?width\s*:\s*100v[wd]/, 'la sección pierde el full-bleed (REQ-32-03)');
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?margin-inline\s*:\s*calc\(\s*50%\s*-\s*50v[wd]\s*\)/,
    'la sección no rompe la columna (REQ-32-03)',
  );
  const ready = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/\.latest-articles--scroll\s*\{([\s\S]*?)\}/);
  assert.ok(ready, `latest-articles.css no declara la regla .${SCROLL_READY_CLASS} (REQ-32-03)`);
  assert.match(ready[1], /min-height\s*:\s*100s?vh/, 'la sección fijada no ocupa el viewport (REQ-32-03)');
  assert.match(ready[1], /justify-content\s*:\s*center/, 'la pista no queda centrada durante el pin (REQ-32-03)');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /scroll-snap|scrollSnap/, 'la pista usa scroll-snap: es carrusel (REQ-32-03)');
  assert.doesNotMatch(readComponent(), /<button/, 'la sección añade botones: es carrusel (REQ-32-03)');
});

test('REQ-32-04/05: conserva las 3 cards, los pares y el live-search', () => {
  const astro = readComponent();
  assert.match(astro, /\.slice\(\s*0\s*,\s*3\s*\)/, 'la portada no limita a las 3 recientes (REQ-32-04)');
  assert.match(astro, /transition:name=\{`img-\$\{post\.id\}`\}/, 'la imagen pierde su par de transición (REQ-32-04)');
  assert.match(astro, /transition:name=\{`title-\$\{post\.id\}`\}/, 'el título pierde su par de transición (REQ-32-04)');
  assert.equal(shouldBuildTrigger(true, false), false, 'con la landing oculta no se construye el trigger (REQ-32-05)');
  assert.equal(shouldBuildTrigger(false, false), true, 'al vaciar la consulta se restaura con trigger (REQ-32-05)');
  assert.equal(landingHidden({ closest: () => null }), false, 'sin ancestro de landing no hay modo resultados (REQ-32-05)');
  assert.match(astro, /data-latest-scroll/, 'la sección no vive en el flujo de landing (REQ-32-05)');
  assert.match(readFileSync(INDEX_URL, 'utf8'), /data-landing-sections/, 'la sección salió de data-landing-sections (REQ-32-05)');
  assert.match(astro, /addEventListener\s*\(\s*['"]astro:page-load['"]/, 'el <script> no usa astro:page-load (REQ-32-05)');
  assert.match(readModule(), /ScrollTrigger\.getAll\(\)/, 'el módulo no limpia los triggers previos (REQ-32-05)');
});

test('REQ-32-06: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(shouldBuildTrigger(false, true), false, 'con prefers-reduced-motion no se construye el trigger (REQ-32-06)');
  assert.match(readModule(), /prefers-reduced-motion/, 'el módulo no consulta prefers-reduced-motion (REQ-32-06)');
});

test('REQ-32-07: sin JavaScript las 3 cards quedan visibles sin animación', () => {
  const astro = readComponent();
  assert.match(astro, /<section[^>]*class="latest-articles"/, 'la sección no se renderiza en el HTML estático (REQ-32-07)');
  assert.doesNotMatch(astro, /<section[^>]*\bhidden\b/, 'la sección nace oculta y exige JS para verse (REQ-32-07)');
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-32-07)');
  assert.match(baseList[1], /display\s*:\s*grid/, 'la disposición base sin JS no muestra la lista en estático (REQ-32-07)');
});

test('REQ-32-09: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'latest-articles.css contiene un color hex hardcodeado (REQ-32-09)');
  assert.doesNotMatch(css, /rgba?\(/, 'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-32-09)');
  assert.ok(css.includes(`.${SCROLL_READY_CLASS}`), `latest-articles.css no declara .${SCROLL_READY_CLASS} (REQ-32-09)`);
});

test('REQ-32-10: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-32-10)`);
  }
});
