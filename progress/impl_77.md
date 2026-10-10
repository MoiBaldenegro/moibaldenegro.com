# Informe de implementación — feature 77 header-height-64

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Petición humana: «el header podemos bajarlo a 64px y queda más bonito».

## Ciclo rojo/verde (REQ-77-12)

- Test nuevo tests/header-height-64.test.mjs (35 líneas en la ronda 1) escrito primero. ROJO: pass 3 / fail 1
  (REQ-77-01/02, porque el token valía 74px).
- VERDE: 4/4. Suite completa 839/839; ./init.sh en verde.

## Cambios

- src/styles/tokens.css: `--header-height: 64px` (antes 74px); comentario actualizado. Sigue en
  97 líneas y sin tokens nuevos.
- src/styles/layout.css (99 líneas):
  `@media (min-width: 769px) { .site-navbar a img { display: block; } }`. El logo de 72×25 era
  inline, alineado a la línea de base, y quedaba 2 px por encima del centro del nav. Ya ocurría
  con 74 px; REQ-77-06 exige ±1 px. Se limita a escritorio: aplicada también en móvil, el header
  de 375 px pasaba de 165 a 162 px y rompía REQ-77-10.
- tests/header-mobile-reflow.test.mjs (REQ-51-01): afirma 64px, con nota de ajuste (precedente
  REQ-43-06).

## Verificación real: Chrome headless + CDP sobre astro preview

| viewport | header antes → después | nav | desborde | scroll-padding-top | centro respecto al nav: logo / enlaces / buscador |
|---|---|---|---|---|---|
| 1280×800 | 75 → **65** | 74 → 64 | no | 74px → 64px | −2 → **0** / 0 / 0 |
| 1440×900 | 75 → **65** | 74 → 64 | no | 74px → 64px | −2 → **0** / 0 / 0 |
| 375×812 | 165 → **165** | 164 → 164 | no | 170px → 170px | idénticos a antes (−55,5 / −54 / 47) |

Todas las cajas quedan dentro del nav (REQ-77-05/07).

### Anclas (REQ-77-09)

| viewport | #contenido: top del destino / bottom del header | encabezado de post |
|---|---|---|
| 1280 | 65 / 65 ✔ | 64,1; el header ya no es visible en esa posición ✔ |
| 1440 | **64 / 65** (1 px) | 63,8; header fuera de la vista ✔ |
| 375 | 165 / 165 ✔ | 170,2 ✔ |

A 1440, el destino #contenido queda 1 px bajo el BORDE inferior del header: el nav mide 64 px y el
borde suma 1. Es lo mismo que antes del cambio (74 frente a 75 a 1440). La propia spec lo hace
inevitable: REQ-77-08 exige scroll-padding-top = 64 px con var(--header-height) y REQ-77-04 un
header de 65 px con borde. #contenido es el `<main>` (sin fondo ni borde), así que el solape es la
línea de 1 px del borde sobre su primer píxel vacío, sin impacto visual. Alternativa si se quiere
exactitud: `scroll-padding-top: calc(var(--header-height) + 1px)`, que contradice REQ-77-08 tal
como está escrito.

### Capturas

progress/research/header77/h77-{before,after}-{1280,1440,375}.png.

## Ronda 2 (CHANGES_REQUESTED en review_77.md)

1. Ubicación (docs/conventions.md: media queries al final): la regla
   `@media (min-width: 769px) { .site-navbar a img { display: block; } }` se movió al FINAL de
   layout.css, junto a las demás media queries, con el comentario en la misma línea. layout.css
   queda en 99 líneas: los tests legacy cuentan con split('\n') y con 100 líneas fallaban
   REQ-08-06, 36-10, 37-08, 38-10, 51-07, 56-06 y 61-08.
2. Test de la regla del logo: nuevo test REQ-77-06 en tests/header-height-64.test.mjs. Exige el
   bloque `@media (min-width: 769px)` con `.site-navbar a img { display: block }`, que la regla
   aparezca una sola vez (no fuera del bloque) y que no esté en el bloque móvil ni antes de él.
   - ROJO con la regla aún en la línea 39 (antes de las media queries): pass 4 / fail 1.
   - Tras moverla: VERDE 5/5.
   - MUTANTE (regla eliminada): pass 4 / fail 1. Al restaurarla, 5/5.
3. y 4. Spec enmendada por spec_author (progress/research/header_64.md):
   - REQ-77-15/16: regla del logo acotada a más de 768 px, al final del archivo;
   - corrección de la Decisión 1 de design.md;
   - REQ-77-09 con una tolerancia de 1 px (el borde del header) en el destino del ancla, porque
     ya ocurría con 74/75. No se usa calc(... + 1px).
5. Cifra de líneas del test corregida (35 en la ronda 1).

Nueva medición CDP tras mover la regla, idéntica a la anterior:
- 1280 y 1440: header de 65 px, nav de 64, sin desborde; logo, enlaces y buscador centrados (0 px).
- 375: idéntico a antes (165 px).
- Anclas: #contenido a 65/65 (1280), 64/65 (1440, dentro de la tolerancia de 1 px del borde) y
  165/165 (375).
