# Informe de implementación — feature 69 hero-profile-image-mobile

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Pedido del humano: «arregla eso de mobile de una vez en la imagen».

## Ciclo rojo/verde (REQ-69-12)

- Test nuevo `tests/hero-profile-image-mobile.test.mjs` escrito primero.
- ROJO: `ℹ pass 2 / ℹ fail 2`. Fallaban los dos REQ-69-01: `.profile-image` sin regla en ≤1200
  px y `grid-auto-rows: 140px` y `190px` fijos.
- VERDE: 4/4. Suite completa 799/799; `./init.sh` en verde. tokens.css sigue en 97 líneas (sin
  tokens nuevos), así que REQ-69-11 no aplica.

## Cambios (solo dentro de los @media; escritorio intacto)

- `src/styles/profile-card.css` (74 líneas):
  - En ≤1200 px: `.profile-image { height: auto; aspect-ratio: 16 / 9; }`.
  - En ≤768 px: `.profile-image { aspect-ratio: 1 / 1; }` (la foto es 952×960).
  - `.profile-image img` se conserva (width/height 100%, object-fit: cover; REQ-48-05/65-06).
- `src/styles/hero-section.css` (55 líneas): `grid-auto-rows: minmax(140px, auto)` en ≤1200 y
  `minmax(190px, auto)` en ≤768. La fila de la tarjeta de perfil crece con su contenido y las
  hero-cards (sin contenido en flujo) conservan su alto exacto.

## Verificación real (REQ-69-02..09): Chrome headless + CDP sobre `astro preview`

| ancho | .profile-image ANTES | DESPUÉS | username dentro de la foto | badge visible | hero-cards encima del perfil (antes → después) | hero-cards (después = antes) |
|-------|----------------------|---------|----------------------------|---------------|------------------------------------------------|------------------------------|
| 320 | 293×0 | 293×293 | no → sí | no → sí | 0 → 0 | 12 × 295×190 |
| 375 | 345×0 | 345×345 | no → sí | no → sí | 0 → 0 | 12 × 347×190 |
| 768 | 718×24 | 718×718 | no → sí | no → sí | 0 → 0 | 12 × 720×190 |
| 1024 | 961×441 | 961×541 | sí → sí | no → sí | **12 → 0** | 12 × 149×140 |
| 1280 | 493×352 (img 502×359) | 493×352 (img 502×359) | sí | sí | 0 → 0 | sin cambios (495/189/393/800 × 204) |

- REQ-69-03: la img cubre su contenedor en todos los anchos. Es algo mayor por el
  `transform: scale(1.02)` preexistente; por ejemplo, a 375 px la img mide 352×352 para un
  contenedor de 345×345.
- REQ-69-04/05: el username nunca interseca el h1 ni el p, y el h1 y el p quedan dentro de la
  tarjeta en todos los anchos. Antes, a 320 px el texto se salía de la tarjeta.
- REQ-69-07: `document.elementFromPoint` en el centro de `.verified` cae dentro de
  `.profile-username` en los 5 anchos. Antes solo ocurría a 1280.
- Capturas antes/después por ancho en `progress/research/hero69/`
  (hero69-before-<ancho>.png y hero69-after-<ancho>.png). Revisadas a ojo a 375 y 1024 px: la foto
  se ve completa con el badge, y a 1024 px las tarjetas empiezan debajo del perfil.

## Observación fuera de alcance

- A 1024 px algunos títulos de hero-card («ACTIONS», «TWITCH») quedan pisados por su icono
  decorativo. Es preexistente: el tamaño de las cards no cambia (149×140 antes y después).
