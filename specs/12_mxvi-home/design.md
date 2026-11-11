# Diseño — feature 12 `mxvi-home`

## Contexto visual

- Fase 3 del refactor al design system MXVI: la home (hero Bento, tarjeta de
  perfil, tarjetas de marca, tarjeta rica de Hack The Box, últimos artículos,
  banda de logos y tarjetas promocionales) pasa a las clases `.mx-*`. El
  resultado visual no cambia (REQ-12-15/16).
- El design system recibe antes lo que no reproducía: 1 columna por tarjeta y
  foto 16:9 entre 769 y 1200 px, proporción real de la foto del perfil,
  márgenes del meta de la tarjeta de artículo y la banda de logos sin
  desplazamiento con movimiento reducido.

## Tokens usados

Ninguno nuevo. Fondos de marca por `data-brand` (`--color-marca-*`), geometría
del logo en `mxvi/components/molecules/brand-geometry.css`.

## Decisiones y constraints

- Decisión 1: `data-color-token` pasa a `data-brand` y `data-col-span` /
  `data-row-span` a `data-cols` / `data-rows`, los atributos del design system.
  `data-show-on-mobile` (opt-in) pasa a `data-hide-mobile` (opt-out) con la
  misma regla de dominio (`showOnMobile`).
- Decisión 2: el movimiento (GSAP) es del sitio y se queda en el sitio:
  `hero-cards-motion.css`, `latest-horizontal.css`,
  `latest-horizontal-reserve.css` y `latest-cards-motion.css` se conservan y
  apuntan a las clases `.mx-*`. La sección de artículos conserva la clase
  `latest-articles` como gancho del modo horizontal.
- Decisión 3: el alto mínimo de pantalla completa del hero es propio de la home
  y vive en `hero-cards-motion.css` (`.home-hero`), no en el design system.
- Restricciones: ≤100 líneas por archivo, estilos separados de la UI, sin
  dependencias, sin JavaScript de runtime nuevo.

## Alternativa descartada

- Mover el modo horizontal y la entrada tipo lego al design system.
- Motivo del descarte: dependen de GSAP y de la navegación de Astro; el design
  system es CSS y un JS mínimo sin dependencias.
