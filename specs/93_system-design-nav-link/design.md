# Diseño — Atajo de diseño de sistemas en el navbar (feature 93)

> Reescritura 2026-10-16 (desbloqueo 3). Sustituye el diseño de etiqueta corta («Diseño» + span oculto).

## Contexto visual

- Header `header.site-navbar` de `src/layouts/Layout.astro`, menú `#site-menu` (`.site-menu`).
- Estado deseado: logo, About, Arquitectura, Diseño de sistemas, @moibaldenegro, SearchBar.
- La etiqueta visible es SIEMPRE «Diseño de sistemas», en la barra y en el panel del menú hamburguesa.
- Decisión humana 2026-10-16 (literal): «Has todo lo que tengas pendiente de una ves, y si vas atocar el
  menu hamburguesa mete diseño de sitemas igual si cabe ese croe no es le problema, ya ves que ahorita
  estabamos rerecortando s solo "diseño" ponlo completo tambien».

## Umbral: hamburguesa a <= 969 px, barra desde 970 px

Medido en Chrome headless (DPR 1, fuentes cargadas, scrollbar-gutter de 10 px) con la etiqueta completa,
simulando el cambio por CSSOM sobre el dev server (progress/research/nav93/ y el análisis):

| Ancho | Header scrollW / clientW | Enlace (alto) | Lectura |
|------:|------:|------:|------|
| 769 | 851 / 759 (+92) | 57 px (3 líneas) | desborda |
| 850 | 853 / 840 (+13) | 57 px (3 líneas) | desborda: ~850 px NO basta |
| 865 | 855 / 855 | 57 px (3 líneas) | sin desborde, etiqueta partida |
| 895-966 | sin desborde | 38 px (2 líneas) | etiqueta partida |
| 967 | 957 / 957 | 19 px (1 línea) | primer ancho que cabe |
| 970 | 960 / 960 | 19 px (1 línea) | umbral elegido |
| 1024 / 1280 | sin desborde | 19 px (1 línea) | OK |

- Causa: el contenido natural del nav con la etiqueta completa mide 908 px; el nav mide el 95 % de
  (viewport − 10 px). 0,95 × (W − 10) >= 908 da W >= 966 px; por redondeo subpíxel cabe desde 967.
- 970 px es el primer múltiplo de 10 >= 967 (3-4 px de holgura) y coincide con el 970 ya confirmado en la
  ronda 2. Con `white-space: nowrap` el header deja de desbordar ya desde 943 px, pero entre 943 y 966 el
  contenido invade el margen del 2,5 % (buscador pegado al borde): por eso el umbral no baja de 970.

## Marcado (Layout.astro, una sola línea)

```astro
<a aria-current={Astro.url.pathname === '/diseno-de-sistemas' || Astro.url.pathname === '/diseno-de-sistemas/' ? 'page' : undefined} href="/diseno-de-sistemas">Diseño de sistemas</a>
```

- Sin span ni `aria-label`: el texto visible ya es el nombre accesible (primera regla de ARIA; el
  aria-label era redundante y duplicaba el texto). Se quita `import "../styles/nav-label.css";`.
- Hallazgo de la medición: con el span, dentro del panel abierto (`.site-menu a { display: flex }`) el
  texto y el span son dos flex items y el espacio inicial se colapsa: se veía «Diseñode sistemas»
  (primera pasada de la simulación, que solo retiraba nav-label.css; su captura se sustituyó por la
  pasada final con texto plano). Quitar el span lo resuelve.

## CSS

- `src/styles/nav-label.css`: se borra (queda sin uso).
- `layout.css`: `@media (max-width: 768px)` → `@media (max-width: 969px)`; `@media (min-width: 769px)`
  (logo, feature 77) → `@media (min-width: 970px)`; `white-space: nowrap;` en la regla `.site-navbar a`,
  añadido en una línea existente de esa regla para que layout.css siga en 99 líneas (REQ-93-24; lo
  congelan tests/sticky-footer.test.mjs y tests/mobile-hamburger-menu.test.mjs). El nowrap garantiza una
  línea si otro motor mide la fuente unos px más ancha (desborde de pocos px en el margen en vez de partir).
- `site-menu.css`: las dos consultas `(max-width: 768px)` → `(max-width: 969px)` (con `scripting: enabled`
  y la de `max-height: 500px`).
- `search-bar.css`: `@media (max-width: 768px)` (nav envuelto sin JS) → `(max-width: 969px)`.
- `site-menu.ts`: `window.matchMedia('(max-width: 768px)')` → `'(max-width: 969px)'` (cierre al pasar a
  escritorio).
- Sin tokens nuevos; los breakpoints son literales como los 768/769 actuales. No se tocan tokens.css ni
  las media queries de 768 px de otras hojas (post.css, article.css, search-results.css, etc.).
- Sin JS (salvo el literal de site-menu.ts) ni dependencias.
- Sin JavaScript habilitado, de 0 a 969 px se ve el header envuelto de las features 51/61 (antes a <= 768).

## Tests heredados a reapuntar (nota «Ajuste feature 93 (precedente REQ-43-06)»)

- tests/mobile-hamburger-menu.test.mjs: MQ y regex con 768px → 969px.
- tests/header-height-64.test.mjs: índices de `@media (max-width: 768px)` y `@media (min-width: 769px)`.
- tests/header-anchor-offset-mobile.test.mjs: bloque `@media (max-width: 768px)` de layout.css.
- tests/geist-pixel-extend.test.mjs: site-menu.css y search-bar.css salen de la lista UNCHANGED.
- tests/system-design-nav-link.test.mjs: se reescribe contra REQ-93-01..40.
- El implementer revisa además cualquier otro test que falle por estos literales.

## Verificación de navegador (implementer)

- Anchos 375, 768, 800, 850, 900, 1024 y 1280 (más 969 y 970 para el borde), en `/` y `/posts/00-agilismo/`.
- Capturas reales en `progress/research/nav93/impl/` (las de `progress/research/nav93/` son de la simulación).

## Apertura suave del menú hamburguesa (REQ-93-27..39, ampliación 2026-10-16)

- Literal humano: «pon una apertura suave tmb por que se abre y se cierra de golpe horrible ese menu hamburguesa».
- Hoy (site-menu.css) el panel pasa de `display: none` a `display: flex` con `[data-menu='open']`: no se
  puede animar. site-menu.ts solo alterna `data-menu` y aria-expanded: no se toca para la transición.
- Cambio, solo CSS en site-menu.css, dentro de `(max-width: 969px) and (scripting: enabled)`:
  - Las propiedades de caja del panel (flex en columna, `position: absolute`, top/left/right, max-height,
    overflow, padding, fondo, borde) pasan de la regla `[data-menu='open'] .site-menu` a `.site-menu`.
  - Cerrado: `visibility: hidden; opacity: 0; transform: translateY(-0.5rem); pointer-events: none;`
    (el desplazamiento es en rem, como los tamaños literales ya presentes en esta hoja; sin token nuevo).
  - Abierto (`[data-menu='open'] .site-menu`): `visibility: visible; opacity: 1; transform: none; pointer-events: auto;`
  - `transition: opacity var(--transition-default), transform var(--transition-default), visibility var(--transition-default);`
    La interpolación discreta de visibility deja el panel visible durante todo el cierre y lo oculta al final;
    al abrir es visible desde el primer frame, así el foco al primer enlace (site-menu.ts) funciona. Sin
    transition-delay literal.
  - `visibility: hidden` saca el panel del orden de tabulación y del árbol de accesibilidad (REQ-93-32); no
    hace falta `inert` ni JS.
  - `@media (prefers-reduced-motion: reduce) { header.site-navbar .site-menu { transition: none; } }`: la red
    global de layout.css (REQ-56-02) solo fija transition-duration a 0.01ms y no anula delays; se declara
    explícito (REQ-93-36).
- Sin saltos de layout: el panel es `position: absolute` en ambos estados; el header sigue en 65 px.
- Escritorio (>= 970 px) sin cambios: `.site-menu { display: contents; }`.
- Límites: site-menu.css tiene 65 líneas (quedará < 100); tokens.css (99) y layout.css (99) no se tocan.
- Verificación CDP (implementer): a 375 y 900 px, muestreo de `getComputedStyle(panel).opacity` con rAF tras
  el clic de apertura y de cierre (valor intermedio) o `transitionend`; Tab con menú cerrado; aria-expanded;
  Escape → foco al botón; emulación `prefers-reduced-motion: reduce` (sin valor intermedio); ida y vuelta
  con el ClientRouter (`/` → `/posts/00-agilismo/` → atrás). Frames en progress/research/nav93/impl/.
- Tests heredados: si tests/mobile-hamburger-menu.test.mjs u otro congela `display: none` del panel o la
  regla `[data-menu='open']`, se reapunta con la nota de REQ-93-25.

## Documentación (implementer, REQ-93-40)

- docs/conventions.md dice «breakpoint móvil en 768px»: añadir que el header (menú hamburguesa, nav
  envuelto sin JS y logo de escritorio) usa 969/970 px como excepción (feature 93). Nota H5 de la bitácora.

## Alternativas descartadas

- Umbral ~850 px: a 850 el header desborda 13 px y la etiqueta va en 3 líneas.
- Umbral 943 px con nowrap: el contenido invade el margen lateral entre 943 y 966 px.
- Mantener el recorte «Diseño»: revocado por el humano.
- Animar max-height/height del panel: requiere una altura fija o JS; opacity + transform no reflowean.
- Transición con JS (Web Animations o GSAP): innecesaria; CSS puro cubre apertura y cierre.
- Token nuevo de duración: tokens.css está en 99 líneas; se reutiliza --transition-default.
