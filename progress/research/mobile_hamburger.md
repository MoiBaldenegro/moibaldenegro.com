# Análisis — Menú hamburguesa en móvil (features 78 y 79)

Petición humana: «vamos a trabajar algo específicamente en mobile. El header está
saturadísimo; realmente lo que deberíamos tener en mobile es un menú hamburguesa».
Valores por defecto del líder (revisables por el humano) incorporados salvo las
desviaciones justificadas en §4.

## 1. Problema y alcance

- Hoy, a ≤768 px, `.site-navbar nav` se envuelve (`flex-wrap: wrap` en search-bar.css,
  `padding-block: var(--gap-card)` de la 61): el header mide 165 px a 375 px (impl_77.md),
  casi un 20 % de un viewport de 812 px, sticky y siempre visible.
- Deseado: a ≤768 px una sola fila de 64 px (+1 px de borde = 65 px) con el logo a la
  izquierda y un botón de menú (☰ / ✕) a la derecha; un panel bajo el header, a todo el
  ancho, con About, Arquitectura, @moibaldenegro y el buscador.
- Fuera de alcance: escritorio (>768 px) no cambia (±1 px respecto a la 77). El riesgo
  preexistente de envoltura entre 769 y ~800 px (header_64.md) sigue fuera de alcance.

## 2. Qué toca

| Capa | Archivo | Cambio |
|------|---------|--------|
| Dominio (puro) | `src/domain/site-menu.ts` (nuevo, f78) | Estado `open`/`closed`, transiciones por evento, atributos aria, decisión de Escape |
| Componente (wiring) | `src/components/site-menu/site-menu.ts` (nuevo, f78) | Listeners: botón, Escape, clic fuera, foco fuera, enlace, cambio a escritorio; foco |
| Componente (UI) | `src/components/site-menu/site-menu.astro` (nuevo, f79) | Solo importa site-menu.css y arranca el script (patrón search-escape/code-copy) |
| Layout | `src/layouts/Layout.astro` (f79) | Dentro del `<nav>` literal: botón + envoltorio `div#site-menu` con los 3 enlaces y `<SearchBar />`; `<SiteMenu />` tras el header |
| Estilos | `src/styles/site-menu.css` (nuevo, f79) | Modo hamburguesa; layout.css (99 líneas) y search-bar.css no se tocan |
| Tokens | `src/styles/tokens.css` | **Sin cambios** (97 líneas; los tests de conteo no se tocan) |

## 3. Restricciones encontradas (tests y specs vigentes)

- Seis tests leen `Layout.astro` con la regex `/<nav>[\s\S]*?<\/nav>/`: el `<nav>` debe
  seguir **sin atributos** y contener el ancla del logo (antes de About, sin clase), About,
  Arquitectura (sin clase ni style), el enlace a X con su `visually-hidden` y `<SearchBar />`
  (architecture-nav-link, navbar-logo-home, restore-navbar-home-link, search-bar-header).
  Solo un `aria-current` de portada. Layout.astro tiene 66 líneas (≤100).
- `layout.css` tiene 99 líneas: el CSS nuevo va en `src/styles/site-menu.css`.
- REQ-61-01..04 y REQ-77-03/08/10/15/16 se comprueban por texto en layout.css/tokens.css:
  no se modifican. `--header-height-mobile: 170px` sigue sirviendo al caso sin JS.
- REQ-77-06 exige que `.site-navbar a img` aparezca una vez en layout.css: si el modo
  hamburguesa necesita centrar el logo, la regla va en site-menu.css.
- search-escape (f6/f57): listener `keydown` en `document`; solo actúa con el foco en la
  búsqueda y un término activo (`escapeAction !== 'none'`); su `stopPropagation` no frena
  otros listeners del mismo nodo.
- El ClientRouter dispara `astro:page-load` en la carga inicial **en el evento `load`**
  (node_modules/astro/dist/transitions/router.js:492), es decir, tras imágenes y la island
  de HTB. Un modo hamburguesa activado solo por el script provocaría un salto de ~100 px
  del contenido en cada carga en frío (CLS).
- La portada horizontal (72-76) solo actúa en `(min-width: 1201px)`, usa sticky top 0 y no
  lee tokens del header: nada en móvil depende del alto del header (grep de
  `header-height`/`site-navbar` en src: solo layout.css, search-bar.css y tokens.css).
- CSP (REQ-74-03): los scripts de componentes salen como chunk externo (`assetsInlineLimit`
  de la 74); un `<script>` de componente nuevo no requiere cambiar la política.

## 4. Decisiones

- **D1 — Activación por CSS `@media (max-width: 768px) and (scripting: enabled)`**
  (desviación del líder, que proponía clase o atributo puesto por el script). Motivo: el
  primer `astro:page-load` llega con `load`; aun inicializando al evaluar el módulo, el chunk
  se descarga tras el primer pintado en una visita en frío y el header pasaría de 165 a 65 px
  con el contenido ya visible (CLS). Con la media query el primer pintado ya es compacto.
  Sin JS (`scripting: none`) o en navegadores sin la media feature (Chrome < 120,
  Safari < 17, Firefox < 113) la query no casa y se ve el layout envuelto actual con todo
  alcanzable: nunca hay botón muerto sin JS. El script solo gestiona el estado
  (`data-menu="open|closed"` en `.site-navbar`), aria y foco. Riesgo residual documentado:
  con JS activo y el chunk aún sin evaluar, el botón no responde durante ese intervalo.
- **D2 — Disclosure con `<button>` y JS** frente a `<details>/<summary>`, checkbox o
  `popover`. `details`: su contenido cerrado no se muestra en escritorio sin JS (habría que
  duplicar enlaces y `SearchBar`, que es un root único `[data-search-bar]`), y Escape, clic
  fuera, cierre al navegar y coordinación con search-escape necesitan JS igualmente.
  Checkbox: semántica pobre. `popover`: cierra con Escape a la vez que search-escape limpia
  (obligaría a tocar la f6), no expone `aria-expanded` como atributo y añade estilos del top
  layer. JS justificado por accesibilidad (precedentes 3/4/5/6/54).
- **D3 — Orden DOM = orden visual = orden de foco: enlaces arriba, buscador al final del
  panel** (desviación del líder, que proponía buscador arriba). En escritorio el envoltorio
  es `display: contents` y el orden de los ítems del nav no puede cambiar; poner el buscador
  primero exigiría `order` en CSS y desincronizaría el orden de tabulación (WCAG 2.4.3) en
  escritorio o en móvil. Revisable por el humano.
- **D4 — Escape coordinado**: listener `keydown` en el header (burbujea antes que el de
  `document` de search-escape). Si el foco está en la búsqueda y search-escape va a actuar
  (término activo en portada o /search), el menú no hace nada y la búsqueda se limpia como
  hoy; en otro caso Escape cierra y devuelve el foco al botón. Un segundo Escape con la
  búsqueda ya vacía cierra el menú.
- **D5 — Cierres**: botón, Escape, clic fuera del header (sin mover el foco), clic en un
  enlace del panel, foco que sale del header a otro elemento (evita foco tapado por el panel,
  WCAG 2.4.11) y paso a escritorio (`matchMedia('(max-width: 768px)')` change). Al navegar
  con ClientRouter el header se reemplaza por el del HTML nuevo (cerrado por defecto en CSS);
  el script re-inicializa en `astro:after-swap` (antes de la captura de la transición) y al
  evaluar el módulo en la carga inicial. Listeners de `document`/`matchMedia` con guard de
  módulo (patrón search-escape) para no acumularlos.
- **D6 — Anclas**: en modo hamburguesa `:root { scroll-padding-top: var(--header-height) }`
  dentro de la misma media query (`:root` gana a la regla `html` de layout.css sin depender
  del orden de las hojas). Sin JS sigue `--header-height-mobile` (REQ-61-02). Sin tokens nuevos.
- **D7 — Panel**: `position: absolute; top: 100%` respecto al header sticky, ancho completo,
  fondo opaco `--color-background` (un `backdrop-filter` anidado no difumina dentro del
  header, que ya lo tiene), `max-height: calc(100dvh - var(--header-height))` con scroll.
  En `max-height: 500px` el header es `static` (REQ-51-04): el modo hamburguesa le da
  `position: relative` (sigue sin ser sticky) para que el panel se ancle a él. Sin animación
  de apertura (display), así que reduced motion no requiere nada extra.
- **D8 — Icono** por CSS: `::before` con `content: "☰"` y `"✕"` según `aria-expanded`;
  el nombre accesible lo da `aria-label` («Abrir menú»/«Cerrar menú»). Botón 44×44 px.

## 5. Descomposición

- **78 `site-menu-state`** (sin UI, sin design.md): dominio puro + wiring con DOM
  inyectado, test-first con fakes (patrón code-copy). Base de la 79.
- **79 `mobile-hamburger-menu`** (UI, con design.md; depends_on [78]): marcado, CSS,
  componente y verificación en navegador (CDP a 375×812, 768×1024 y 1280×800).

## 6. Riesgos

- `scripting` media: verificar en el build que el minificador CSS conserva la query y que
  el modo «sin JS» de la verificación (`--blink-settings=scriptEnabled=false` o
  `Emulation.setScriptExecutionDisabled`) hace que no case; medir con `DOM.getBoxModel`
  (sin ejecutar JS en la página).
- `display: contents` en el envoltorio con `id`: en escritorio el botón está oculto, así que
  `aria-controls` no se expone; en móvil el panel es `display: flex`.
- Tests de estructura del nav: el envoltorio debe quedar dentro de `<nav>` y no alterar el
  orden logo → About.
- Live search con el panel abierto: los resultados se pintan en `<main>` bajo el panel; se
  verifica que el panel no los tapa por completo a 375×812.
- REQ-77-10 (alto móvil 165 px) queda acotado al modo sin JS; se anota en la spec de la 79.
