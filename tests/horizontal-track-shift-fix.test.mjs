// Tests de la feature 34 horizontal-track-shift-fix (REQ-34-01..14,
// specs/34_horizontal-track-shift-fix/requirements.md y design.md).
//
// Bugfix del reporte verbatim del humano tras la 33 (done, start 'top top'
// + spacer acotado): "ya se fue el espacio pero el scroll horizontal no
// funciona". Causa raíz verificada en progress/research/gsap-horizontal-
// cards.md (sección "Por qué el horizontal no se mueve..."): distance()
// vale 0 al construir el tween (medición única previa al layout asentado)
// y con end '+=0' el pin queda de longitud cero — sin spacer (coincide con
// "se fue el espacio") y sin movimiento (coincide con "no funciona"); sin
// invalidateOnRefresh (quitado en la 32 por los bucles) el 0 queda
// congelado aunque el layout asiente después. Retorno temprano
// (landingHidden/prefersReduced) y nodo equivocado descartados con
// evidencia en disco. Estos tests habrían atrapado la pista parada: el
// guardián contra el 0 (REQ-34-01), la re-medición vigilada (REQ-34-02),
// el traslado proporcional al recorrido medido (REQ-34-03) y el fin del
// pin ligado a una distancia mayor que cero (REQ-34-04). Patrón del arnés:
// inspección por regex + unitarios por import directo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  SCROLL_READY_CLASS,
  PIN_DISTANCE_ATTR,
  trackShift,
  viewportDistance,
  clampPinDistance,
  isPinReady,
  shouldBuildTrigger,
  landingHidden,
} from '../src/components/latest-articles-scroll.ts';

const MODULE_URL = new URL('../src/components/latest-articles-scroll.ts', import.meta.url);
const COMPONENT_URL = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_URL = new URL('../src/styles/latest-articles.css', import.meta.url);
const INDEX_URL = new URL('../src/pages/index.astro', import.meta.url);
const TEST_31_URL = new URL('./pin-timing-center.test.mjs', import.meta.url);
const TEST_32_URL = new URL('./pin-spacer-scroll-fix.test.mjs', import.meta.url);
const TEST_33_URL = new URL('./pin-visible-start.test.mjs', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_URL), 'src/components/latest-articles-scroll.ts no existe (REQ-34-01)');
  return readFileSync(MODULE_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-34-07)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_URL), 'src/styles/latest-articles.css no existe (REQ-34-05)');
  return readFileSync(CSS_URL, 'utf8');
}

test('REQ-34-01: con distancia cero no se construye el pin (se difiere)', () => {
  assert.equal(isPinReady(0), false, 'con distancia 0 el pin queda de longitud cero: no debe construirse (REQ-34-01)');
  assert.equal(isPinReady(-5), false, 'con distancia negativa no debe construirse el pin (REQ-34-01)');
  assert.equal(isPinReady(1), true, 'con recorrido real el pin debe construirse (REQ-34-01)');
  assert.equal(isPinReady(1200), true, 'con recorrido real el pin debe construirse (REQ-34-01)');
  const source = readModule();
  assert.match(source, /isPinReady/, 'el módulo no guarda la construcción con el guardián de distancia (REQ-34-01)');
  assert.match(
    source,
    /if\s*\(\s*isPinReady\(/,
    'el módulo construye el pin sin comprobar la distancia medida (REQ-34-01)',
  );
});

test('REQ-34-02: al asentarse el layout se re-mide y se sincroniza el pin', () => {
  const source = readModule();
  assert.match(
    source,
    /addEventListener\s*\(\s*['"]load['"]/,
    'el módulo no re-mide al asentarse el layout tras la carga (REQ-34-02)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(
    code,
    /invalidateOnRefresh\s*:\s*true/,
    'el trigger recalcula en cada refresh y encadena el spacer (REQ-34-02)',
  );
  assert.doesNotMatch(
    code,
    /^\s*ScrollTrigger\.refresh\(\);\s*$/m,
    'el módulo encadena un refresh() incondicional que bloquea el scroll (REQ-34-02)',
  );
});

test('REQ-34-03: la pista se traslada el recorrido medido con el progreso', () => {
  assert.equal(trackShift(0, 1200), 0, 'sin progreso no hay traslación (REQ-34-03)');
  assert.equal(trackShift(0.5, 1200), -600, 'a mitad de progreso la mitad del recorrido (REQ-34-03)');
  assert.equal(trackShift(1, 1200), -1200, 'al agotar el progreso todo el recorrido (REQ-34-03)');
  assert.equal(trackShift(2, 1200), -1200, 'el progreso se acota por arriba (REQ-34-03)');
  assert.equal(trackShift(-1, 1200), 0, 'el progreso se acota por abajo (REQ-34-03)');
  assert.equal(trackShift(0.5, 0), 0, 'sin recorrido medido la pista queda parada: el 0 no es un pin válido (REQ-34-03)');
  const source = readModule();
  assert.match(source, /\bx\s*:/, 'el tween no traslada la pista en horizontal (x, REQ-34-03)');
  assert.match(source, /scrub\s*:\s*true/, 'el progreso vertical no conduce la pista (scrub, REQ-34-03)');
});

test('REQ-34-04: el fin del pin deriva de la distancia con valor mayor que cero', () => {
  const source = readModule();
  assert.match(
    source,
    /end\s*:\s*`\+=\$\{distance\}`/,
    'el fin del pin no deriva de la distancia medida sincronizada con x (REQ-34-04)',
  );
  assert.match(source, /pin\s*:\s*true/, 'la configuración no fija la sección (pin: true, REQ-34-04)');
  assert.match(
    source,
    /clampPinDistance\s*\(\s*track\.scrollWidth\s*,\s*window\.innerWidth\s*\)/,
    'la distancia no se mide acotada contra el viewport (REQ-34-04)',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /scroll-snap|scrollSnap/, 'la pista usa scroll-snap: es carrusel (REQ-34-04)');
  assert.doesNotMatch(readComponent(), /<button/, 'la sección añade botones: es carrusel (REQ-34-04)');
});

test('REQ-34-05/06: espaciado acotado al recorrido real y enganche visible', () => {
  assert.equal(clampPinDistance(2400, 1200), 1200, 'el recorrido real no se recorta (REQ-34-05)');
  assert.equal(clampPinDistance(1200, 1200), 0, 'sin desborde el espaciado es 0 (REQ-34-05)');
  assert.equal(clampPinDistance(800, 1200), 0, 'sin desborde no hay hueco (REQ-34-05)');
  assert.equal(clampPinDistance(20000, 1280), 3840, 'el spacer gigante previo al layout queda acotado (REQ-34-05)');
  assert.equal(viewportDistance(2400, 1200), 1200, 'la distancia es pista menos viewport (REQ-34-05)');
  const source = readModule();
  assert.match(source, /start\s*:\s*['"]top top['"]/, 'el trigger pierde el enganche visible (REQ-34-06)');
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const ready = css.match(/\.latest-articles--scroll\s*\{([\s\S]*?)\}/);
  assert.ok(ready, `latest-articles.css no declara la regla .${SCROLL_READY_CLASS} (REQ-34-06)`);
  assert.match(ready[1], /min-height\s*:\s*100s?vh/, 'la sección fijada no llena el viewport (REQ-34-06)');
  assert.match(ready[1], /justify-content\s*:\s*center/, 'la pista no queda centrada durante el pin (REQ-34-06)');
});

test('REQ-34-07/08: full-bleed lado a lado, 3 cards con pares y live-search', () => {
  const css = readCss();
  assert.match(css, /\.latest-articles\s*\{[\s\S]*?width\s*:\s*100v[wd]/, 'la sección pierde el full-bleed (REQ-34-07)');
  assert.match(
    css,
    /\.latest-articles\s*\{[\s\S]*?margin-inline\s*:\s*calc\(\s*50%\s*-\s*50v[wd]\s*\)/,
    'la sección no rompe la columna (REQ-34-07)',
  );
  const astro = readComponent();
  assert.match(astro, /\.slice\(\s*0\s*,\s*3\s*\)/, 'la portada no limita a las 3 recientes (REQ-34-07)');
  assert.match(astro, /transition:name=\{`img-\$\{post\.id\}`\}/, 'la imagen pierde su par de transición (REQ-34-07)');
  assert.match(astro, /transition:name=\{`title-\$\{post\.id\}`\}/, 'el título pierde su par de transición (REQ-34-07)');
  assert.equal(shouldBuildTrigger(true, false), false, 'con la landing oculta no se construye el trigger (REQ-34-08)');
  assert.equal(shouldBuildTrigger(false, false), true, 'al vaciar la consulta se restaura con trigger (REQ-34-08)');
  assert.equal(landingHidden({ closest: () => null }), false, 'sin ancestro de landing no hay modo resultados (REQ-34-08)');
  assert.match(astro, /data-latest-scroll/, 'la sección no vive en el flujo de landing (REQ-34-08)');
  assert.match(readFileSync(INDEX_URL, 'utf8'), /data-landing-sections/, 'la sección salió de data-landing-sections (REQ-34-08)');
  assert.match(astro, /addEventListener\s*\(\s*['"]astro:page-load['"]/, 'el <script> no usa astro:page-load (REQ-34-08)');
  assert.match(readModule(), /ScrollTrigger\.getAll\(\)/, 'el módulo no limpia los triggers previos (REQ-34-08)');
});

test('REQ-34-09: con movimiento reducido se omite la animación (contenido estático)', () => {
  assert.equal(shouldBuildTrigger(false, true), false, 'con prefers-reduced-motion no se construye el trigger (REQ-34-09)');
  assert.match(readModule(), /prefers-reduced-motion/, 'el módulo no consulta prefers-reduced-motion (REQ-34-09)');
});

test('REQ-34-10: sin JavaScript las 3 cards quedan visibles sin animación', () => {
  const astro = readComponent();
  assert.match(astro, /<section[^>]*class="latest-articles"/, 'la sección no se renderiza en el HTML estático (REQ-34-10)');
  assert.doesNotMatch(astro, /<section[^>]*\bhidden\b/, 'la sección nace oculta y exige JS para verse (REQ-34-10)');
  const css = readCss();
  const baseList = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/);
  assert.ok(baseList, 'latest-articles.css no declara la regla base .latest-articles__list (REQ-34-10)');
  assert.match(baseList[1], /display\s*:\s*grid/, 'la disposición base sin JS no muestra la lista en estático (REQ-34-10)');
});

test('REQ-34-11: la distancia medida queda expuesta como observable', () => {
  assert.equal(PIN_DISTANCE_ATTR, 'data-pin-distance', 'el atributo observable no es data-pin-distance (REQ-34-11)');
  const source = readModule();
  assert.match(source, /data-pin-distance/, 'la sección no expone la distancia medida (REQ-34-11)');
  assert.match(source, /setAttribute/, 'el módulo no publica la distancia en la sección (REQ-34-11)');
  assert.match(source, /\[latest-scroll\]/, 'el módulo no emite la marca de consola para DevTools (REQ-34-11)');
  assert.match(source, /console\.(log|info|debug)/, 'el módulo no emite la marca por consola (REQ-34-11)');
});

test('REQ-34-12: los tests del cableado anterior siguen a la presentación real', () => {
  for (const [label, url] of [['31', TEST_31_URL], ['32', TEST_32_URL], ['33', TEST_33_URL]]) {
    const content = readFileSync(url, 'utf8');
    assert.match(
      content,
      /end\\s\*:\\s\*`\\\+=\\\$\\\{distance\\\}`/,
      `el test de la ${label} no declara el fin sincronizado con la distancia medida (REQ-34-12)`,
    );
    assert.ok(
      /precedente REQ-43-06|REQ-43-06/.test(content),
      `el test de la ${label} no documenta la justificación del ajuste (REQ-34-12)`,
    );
    assert.doesNotMatch(
      content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''),
      /end\\s\*:\\s\*\\\(\\s\*\\\)/,
      `el test de la ${label} sigue fijando el fin funcional que congelaba el 0 (REQ-34-12)`,
    );
  }
});

test('REQ-34-13: la hoja usa solo tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'latest-articles.css contiene un color hex hardcodeado (REQ-34-13)');
  assert.doesNotMatch(css, /rgba?\(/, 'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-34-13)');
  assert.ok(css.includes(`.${SCROLL_READY_CLASS}`), `latest-articles.css no declara .${SCROLL_READY_CLASS} (REQ-34-13)`);
});

test('REQ-34-14: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['src/components/latest-articles-scroll.ts', MODULE_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
    ['src/styles/latest-articles.css', CSS_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-34-14)`);
  }
});
