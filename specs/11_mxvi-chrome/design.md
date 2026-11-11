# Diseño — feature 11 `mxvi-chrome`

## Contexto visual

- Fase 2 del refactor al design system MXVI: el chrome compartido de
  `Layout.astro` (navbar, menú móvil, búsqueda, enlace de salto y footer) pasa
  a las clases `.mx-*`. El resultado visual no cambia (REQ-11-12).
- El design system recibió antes las reglas del sitio que le faltaban
  (`html, body { height: 100% }`, navbar no sticky con alto ≤ 500px,
  `scroll-padding-top` móvil y el interlineado normal de los botones), así que
  sus hojas reproducen el chrome actual.

## Tokens usados

Ninguno nuevo. Las hojas `mxvi/base.css` y `mxvi/components/organisms/navbar.css`,
`footer.css`, `molecules/search.css` y `molecules/navigation.css` leen los tokens
existentes de `src/styles/tokens.css`.

## Decisiones y constraints

- Decisión 1: `layout.css` se elimina porque `mxvi/base.css` contiene lo mismo
  (reset, body, foco, scrollbar, enlace de salto y movimiento reducido) y la
  utilidad `.mx-visually-hidden` vive en `mxvi/components/utilities.css`.
- Decisión 2: se conservan los scripts del sitio (`site-menu.ts`, `search-bar.ts`,
  `search-escape.ts`): integran Escape, view transitions y clic fuera, más que
  `mxvi.js`. Solo cambia el selector del header (`.mx-navbar`); los atributos
  `data-*` se mantienen.
- Decisión 3: el logo del header lleva `mx-logo mx-nav-link` para conservar el
  subrayado de acento de la página actual que hoy recibe por ser un enlace del
  header.
- Restricciones: ≤100 líneas por archivo, estilos separados de la UI, sin
  dependencias, sin JavaScript de runtime nuevo.

## Alternativa descartada

- Usar `mxvi.js` para el menú móvil y la búsqueda.
- Motivo del descarte: perdería la coordinación de Escape con la búsqueda, el
  cierre al hacer clic fuera y el reinicio tras las view transitions de Astro.
