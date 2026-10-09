# Review — feature 55 (ronda 2)

**Veredicto:** APPROVED

Ronda 2: verificación de los cambios requeridos en la ronda 1. Archivos revisados:
`src/styles/latest-articles.css`, `tests/home-heading-hierarchy.test.mjs`,
`tests/home-latest-articles-limit.test.mjs` (REQ-30-08) y la sección «Ronda 2» de
`progress/impl_55.md`. El resto de la feature ya se revisó en la ronda 1 y no cambia.
Los demás cambios de `home-latest-articles-limit.test.mjs` (slugs ASCII, helper `astroBuild`)
son de otras features ya aprobadas y no se re-revisan.

Verificación: `./init.sh` verde (formato, tests 100 %, build); `pnpm test` 729/729, 0 fallos.
`depends_on`: ninguno.

## Resolución de los cambios de la ronda 1
1. [x] `latest-articles.css:45`: `.latest-articles__title { margin: 0.83em 0; ... }`. Es
   exactamente el margen por defecto que el navegador da al `h2` (`margin-block: 0.83em`,
   `margin-inline: 0`). Al ir en `em`, sigue escalando con el `font-size` de la media query móvil
   (`1.15rem`), igual que antes. `font-size` y `line-height` ya eran explícitos. El `font-weight`
   por defecto es `bold` tanto en `h2` como en `h3`. La apariencia es idéntica y ya no depende
   del nivel del encabezado. La medición en Chrome headless documentada en `impl_55.md`
   (17,928 px a 1280 px y 15,272 px a 375 px) coincide con el cálculo: 0.83 × 21.6 y 0.83 × 18.4.
2. [x] `tests/home-heading-hierarchy.test.mjs:48`: la aserción exige
   `margin: 0.83em 0|margin-block: 0.83em` en la regla `.latest-articles__title` (helper
   `rule()`), con un mensaje que nombra la regresión. El rojo previo está documentado en
   `impl_55.md` («Ronda 2», punto 1). La fila de `latest-articles.css` de la tabla de cambios
   está corregida (98 líneas, margen de la ronda 2).
3. [x] REQ-30-08 (`home-latest-articles-limit.test.mjs:251-255`) pasa de 97 a 98 líneas.
   El cambio está justificado en un comentario (precedente REQ-43-06) y en la cabecera. Las
   aserciones de la rejilla y de los tokens siguen igual. El ajuste es el mínimo imprescindible
   y no debilita el test.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>`): [x]
- C2 (sin lógica en UI): [x]
- C3 (datos vía repositorio): [x]
- C4 (solo tokens para colores): [x]: el margen no es un color; `.latest-articles__title` sigue con `var(--color-text)`.
- C5 (≤100 líneas): [x]: latest-articles.css 98, test nuevo 72.
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` verde, suite al 100 %): [x]
- C8 (se ve correcto en desktop y móvil): [x]: margen idéntico al del `h2` anterior en ambos anchos.
- REQ-55-01..04, 06..08: [x] (sin cambios desde la ronda 1)
- REQ-55-05: [x]: la apariencia de las cards del hero y de los artículos se conserva.

## Cambios requeridos
Ninguno.
