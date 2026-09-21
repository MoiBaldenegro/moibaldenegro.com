// Tests de la feature 31 pin-timing-center (REQ-31-01..10,
// specs/31_pin-timing-center/requirements.md y design.md).
//
// AJUSTE feature 33 (precedente REQ-43-06: los tests siguen a la
// presentación real): la premisa 'top bottom' = enganche temprano estaba
// INVERTIDA — con pin fijaba la sección FUERA DE VISTA (bajo el pliegue)
// y el recorrido se atravesaba en blanco (spacer de 1700px+ vacío
// reportado por el humano). El enganche visible es 'top top' con la
// sección llenando el viewport (min-height 100vh); las aserciones de
// inicio se actualizan a ese contrato sin cambiar el resto del mecanismo.
// AJUSTE feature 34 (precedente REQ-43-06: los tests siguen a la
// presentación real): el fin del pin deja de re-medirse en cada creación
// (congelaba el 0 medido antes del layout y dejaba el pin sin longitud y
// la pista parada); x y end comparten la distancia medida con valor mayor
// que cero, verificada por el guardián antes de construir.
// Reporte UX original del humano (verbatim en
// progress/research/gsap-horizontal-cards.md, D16-D19): el pin full-bleed
// D16-D19): el pin full-bleed de la feature 30 (done) engancha DEMASIADO ABAJO
// (start 'top center': las cards quedan abajo, casi fuera de vista, al empezar
// el recorrido horizontal) y deja un HUECO EN BLANCO al irse el hero. Lo pedido:
// enganche TEMPRANO del pin con la pista VISIBLE y CENTRADA verticalmente en el
// viewport durante todo el recorrido horizontal, sin hueco en blanco entre el
// hero y la sección. Se conserva todo lo demás: ScrollTrigger pin + scrub,
// full-bleed de lado a lado, 3 cards, pares title-<id>/img-<id>, live-search,
// reduced-motion, degradado sin JS. NO es carrusel.
// Patrón del arnés: inspección por regex + unitarios por import directo.
//
//   REQ-31-01 — la sección engancha el pin con la pista visible y centrada.
//   REQ-31-02 — al alcanzar el inicio del trigger fija antes del hueco en blanco.
//   REQ-31-03 — durante el pin la pista permanece centrada en el viewport.
//   REQ-31-04 — al agotar el recorrido libera el pin y cede el scroll.
//   REQ-31-05 — con movimiento reducido omite la animación (estático visible).
//   REQ-31-06 — sin JS las 3 cards quedan visibles sin animación.
//   REQ-31-07 — la pista conserva las 3 cards con sus pares title-<id>/img-<id>.
//   REQ-31-08 — con consulta activa se oculta y muestra el panel de resultados.
//   REQ-31-09 — la hoja usa solo tokens de tokens.css.
//   REQ-31-10 — cada archivo modificado respeta las 100 líneas.

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
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-31-01)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-31-07)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-31-01)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-31-01/02: el trigger engancha visible, con la sección en el viewport', () => {
  const source = readModule();
  assert.match(
    source,
    /start\s*:\s*['"]top top['"]/,
    "el trigger no declara el enganche visible start: 'top top' (REQ-31-01, REQ-31-02)",
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /start\s*:\s*['"]top bottom['"]/,
    "el trigger sigue enganchando fuera de vista con start: 'top bottom' (REQ-31-01)",
  );
  assert.match(source, /pin\s*:\s*true/, 'la configuración no fija la sección (pin: true, REQ-31-02)');
  assert.match(source, /scrub\s*:\s*true/, 'la configuración no vincula el progreso (scrub, REQ-31-02)');
  assert.match(source, /\bx\s*:/, 'el tween no traslada la pista en horizontal (x, REQ-31-01)');
});

test('REQ-31-01/03: la pista queda centrada verticalmente en el viewport durante el pin', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const ready = css.match(/\.latest-articles--scroll\s*\{([\s\S]*?)\}/);
  assert.ok(ready, `latest-articles.css no declara la regla .${SCROLL_READY_CLASS} (REQ-31-01)`);
  assert.match(ready[1], /min-height\s*:\s*100s?vh/, 'la sección fijada no ocupa la altura del viewport (REQ-31-03)');
  assert.match(ready[1], /display\s*:\s*flex/, 'la sección fijada no usa flex para centrar (REQ-31-03)');
  assert.match(
    ready[1],
    /justify-content\s*:\s*center/,
    'la pista no queda centrada verticalmente durante el pin (REQ-31-01, REQ-31-03)',
  );
});

test('REQ-31-02/04: sin hueco en blanco, el hero sigue normal y la sección libera al agotar', () => {
  const index = readFileSync(INDEX_URL, 'utf8');
  assert.match(index, /<NewHero\s*\/?>/, 'index.astro no renderiza el hero (REQ-31-02)');
  const source = readModule();
  assert.doesNotMatch(source, /NewHero/, 'el módulo fija el hero en el pin (REQ-31-02)');
  assert.match(source, /trigger\s*:\s*section/, 'el pin no se ancla solo a la sección (REQ-31-02)');
  assert.match(
    source,
    /end\s*:\s*`\+=\$\{distance\}`/,
    'el fin del pin no deriva de la distancia medida sincronizada con x (REQ-31-04)',
  );
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    css,
    /\.latest-articles\s*\{[^}]*overflow-(y|x)\s*:\s*(auto|scroll)/,
    'la sección declara scroll interno en una caja (REQ-31-04)',
  );
});

test('REQ-31-07/08: conserva el full-bleed lado a lado, las 3 cards y el live-search', () => {
  const css = readCss();
  assert.match(css, /\.latest-articles\s*\{[\s\S]*?width\s*:\s*100v[wd]/, 'la sección pierde el full-bleed (REQ-31-07)');
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?margin-inline\s*:\s*calc\(\s*50%\s*-\s*50v[wd]\s*\)/,
    'la sección no rompe la columna (REQ-31-07)',
  );
  assert.equal(viewportDistance(2400, 1200), 1200, 'el recorrido no es pista menos viewport (REQ-31-07)');
  assert.equal(trackShift(0.5, viewportDistance(2400, 1200)), -600, 'el progreso no conduce la mitad (REQ-31-07)');
  const astro = readComponent();
  assert.match(astro, /\.slice\(\s*0\s*,\s*3\s*\)/, 'la portada no limita a las 3 recientes (REQ-31-07)');
  assert.match(astro, /transition:name=\{`img-\$\{post\.id\}`\}/, 'la imagen pierde su par de transición (REQ-31-07)');
  assert.match(astro, /transition:name=\{`title-\$\{post\.id\}`\}/, 'el título pierde su par de transición (REQ-31-07)');
  assert.equal(shouldBuildTrigger(true, false), false, 'con la landing oculta no se construye el trigger (REQ-31-08)');
  assert.equal(shouldBuildTrigger(false, false), true, 'al vaciar la consulta se restaura con trigger (REQ-31-08)');
  assert.match(readComponent(), /data-latest-scroll/, 'la sección no vive en el flujo de landing (REQ-31-08)');
  assert.match(readFileSync(INDEX_URL, 'utf8'), /data-landing-sections/, 'la sección salió de data-landing-sections (REQ-31-08)');
});

test('REQ-31-07: no es carrusel (sin scroll-snap ni navegación por botones/puntos)', () => {
  const source = readModule().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(source, /scroll-snap|scrollSnap/, 'la pista usa scroll-snap: es carrusel (REQ-31-07)');
  assert.doesNotMatch(readComponent(), /<button/, 'la sección añade botones de navegación: es carrusel (REQ-31-07)');
  assert.doesNotMatch(
    readCss().replace(/\/\*[\s\S]*?\*\//g, ''),
    /scroll-snap/,
    'la hoja usa scroll-snap como mecanismo (REQ-31-07)',
  );
});

test('REQ-31-05: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(shouldBuildTrigger(false, true), false, 'con prefers-reduced-motion no se construye el trigger (REQ-31-05)');
  assert.match(readModule(), /prefers-reduced-motion/, 'el módulo no consulta prefers-reduced-motion (REQ-31-05)');
});

test('REQ-31-06: sin JavaScript las 3 cards quedan visibles sin animación', () => {
  const astro = readComponent();
  assert.match(astro, /<section[^>]*class="latest-articles"/, 'la sección no se renderiza en el HTML estático (REQ-31-06)');
  assert.doesNotMatch(astro, /<section[^>]*\bhidden\b/, 'la sección nace oculta y exige JS para verse (REQ-31-06)');
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-31-06)');
  assert.match(baseList[1], /display\s*:\s*grid/, 'la disposición base sin JS no muestra la lista en estático (REQ-31-06)');
});

test('REQ-31-02: el script registra en astro:page-load con limpieza de triggers', () => {
  assert.match(
    readComponent(),
    /addEventListener\s*\(\s*['"]astro:page-load['"]/,
    'el <script> no usa astro:page-load (REQ-31-02)',
  );
  assert.match(readModule(), /ScrollTrigger\.getAll\(\)/, 'el módulo no enumera los triggers previos (REQ-31-02)');
  assert.match(readModule(), /ScrollTrigger\.refresh\(\)/, 'el módulo no refresca al restaurar (REQ-31-02)');
});

test('REQ-31-09: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'latest-articles.css contiene un color hex hardcodeado (REQ-31-09)');
  assert.doesNotMatch(css, /rgba?\(/, 'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-31-09)');
  assert.ok(css.includes(`.${SCROLL_READY_CLASS}`), `latest-articles.css no declara .${SCROLL_READY_CLASS} (REQ-31-09)`);
});

test('REQ-31-10: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-31-10)`);
  }
});
