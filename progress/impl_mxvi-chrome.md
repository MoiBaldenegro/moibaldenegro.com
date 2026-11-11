# Implementación — feature 11 `mxvi-chrome`

Segunda fase del refactor del sitio al design system MXVI: el chrome compartido (base,
header, menú móvil, búsqueda y footer) usa las clases `.mx-*`. Spec:
`specs/11_mxvi-chrome/requirements.md` (REQ-11-01..12) y `design.md`. Fecha: 2026-11-11.

## 1. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/mxvi-chrome.test.mjs` | Nuevo, escrito antes del código: 9 tests para REQ-11-01..11 (72 líneas) |
| `tests/mxvi-foundation.test.mjs`, `square-corners-sitewide.test.mjs`, `promo-tiles-section-ui.test.mjs` | Contratos ajustados: orden de imports con `mxvi/base.css`, scrollbar en `mxvi/base.css`, línea base de radios sin las hojas borradas (54 en 21 hojas), `mx-visually-hidden` |
| `scripts/sync-mxvi.mjs` | Copia también `base.css` (entradas `base.css` y `components.css`) |
| `src/styles/mxvi/` | Resincronizada desde `mxvi-design-system@a848482`: 35 hojas con `base.css` |
| `src/layouts/Layout.astro` | Importa `mxvi/base.css` en lugar de `layout.css`; header `mx-navbar` / `mx-navbar__inner` / `mx-navbar__menu`, `mx-logo mx-nav-link`, `mx-nav-link`, `mx-icon-button mx-navbar__toggle`, `mx-skip-link` |
| `src/components/search-bar/search-bar.astro` | `mx-search` y sus elementos; sin imports de hojas propias |
| `src/components/site-footer/site-footer.astro` | `mx-footer`, `mx-footer-brand`, `mx-footer__column`, `mx-label`, `mx-link-list`, `mx-link mx-link--subtle`, `mx-social-link`, `mx-meta mx-meta--mono`, `mx-button`, `mx-footer-bar` |
| `src/components/site-menu/site-menu.{astro,ts}` | Sin hoja propia; el script localiza `.mx-navbar` (data-* intactos) |
| 12 componentes `.astro`/`.ts` | `visually-hidden` → `mx-visually-hidden` |
| `src/styles/typography.css` | Sin los selectores del header y del campo de búsqueda |
| `src/styles/{layout,site-menu,search-bar,search-bar-icon,site-footer}.css` | Eliminadas |

## 2. Correcciones subidas al design system

Encontradas al comparar con las hojas antiguas y las capturas; se corrigen en el design
system y se resincroniza (la copia no se edita a mano):

- `86a6451`: `html, body` a altura completa, botón sin `line-height`, navbar no sticky en
  viewports bajos y `scroll-padding-top` del header.
- `a848482`: enlaces del menú móvil que solo animan `color` (foco inmediato al abrir), la X
  del buscador hereda la visibilidad del panel cerrado, y el botón «Descargar CV» hereda el
  tamaño de letra del footer (0.92rem).

## 3. Evidencia del rojo

`node --test tests/mxvi-chrome.test.mjs` antes del código: 9 fallos de 9 (más los
contratos ajustados en rojo).

## 4. Verde

`./init.sh` en verde: tests al 100 %, build OK.

## 5. Regresión visual (REQ-11-12)

15 capturas de página completa (home, about, artículo, búsqueda, 404 a 390/768/1440):
alturas idénticas; peor diferencia 0.044 %, solo en los bordes del logo del header. El
design system calcula el alto del logo con su proporción real (2048×716 → 25.17 px a
72 px de ancho); el sitio antes lo forzaba a 25 px con el atributo `height`. Se acepta: es
antialiasing de 0.17 px y el logo deja de estar deformado.

Comportamiento del menú móvil comprobado en navegador a 390 px: abre, el foco va al primer
enlace, y al cerrarse con texto en el buscador la X queda oculta.
