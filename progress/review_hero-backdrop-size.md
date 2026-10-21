# Review — feature 108

**Veredicto:** APPROVED

Feature 108 hero-backdrop-size (spec `specs/108_hero-backdrop-size/`). Petición humana (2026-10-20): «…y ya que andas ahi
en tamaño del logo de fondo ponlo ahi tambien para poder manipular desde el JSON». Revisión de nivel 1, 2026-10-20.
Alcance: los 9 archivos de `progress/impl_hero-backdrop-size.md`. No se revisó lo que no es de esta feature
(`public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`).

## Checkpoints
- C1 Arquitectura (estilos en `src/styles`, sin `<style>`, sin lógica en UI, datos vía repositorio): [x]
  `hero-card.astro:26` solo pasa `data-backdrop-size={card.backgroundIconSize}`, sin `style=` (grep: 0). La validación
  vive en `hero-cards-fields-parse.ts:62-67` (`readBackdropSize`) y la llama `hero-cards-parse.ts:58`. Las reglas están en
  `hero-card-accents.css:47-48` y `:55-56`, una por valor; md es la regla base de la 105 (`:30`, `:54`) y no tiene regla propia.
- C2 Tokens / sin valores sueltos: [x] Solo hay desplazamientos de geometría (16/10, -56/-36 px), con el mismo criterio
  que la 105 (lo dice design.md). `tokens.css` y `hero-card.css` no se tocaron (`git diff --stat` vacío).
- C3 ≤ 100 líneas, sin dependencias: [x] entidad 60, fields-parse 75, parse 71, JSON 17, astro 51, accents 57,
  test nuevo 93, extra-logos 100, polish 100. No hay dependencias nuevas.
- C4 Datos (entidad tipada, enum validado en el parse, errores con nombre): [x] `HERO_BACKDROP_SIZES` / `HeroBackdropSize`
  y `readonly backgroundIconSize?` (`hero-card.ts:21,23,46`). Lo comprobé por mi cuenta con `HeroCardsRepository`:
  sm/md/lg llegan tal cual. `"MD"`, `"xl"`, `""`, `" md"`, `0`, `true`, `null`, `["md"]`, `{}` y la falta de
  `backgroundIcon` dan `HeroCardsDataError` con «hero-cards.json», «tarjeta 1» y «backgroundIconSize». Si se omite el
  campo, la clave no aparece. El JSON real declara `md` solo en claude-code y github.
- C5 TDD (rojo antes del código, verde al final): [x] El informe registra el rojo (8/10 en fallo) y explica los 2 casos
  que pasan en rojo (son guardas) y el verde 10/10. La suite pasa 1131/1131. Los ajustes heredados (REQ-103-09/10/11,
  REQ-101-17) llevan la nota «Ajuste feature 108 (precedente REQ-43-06)».
- C6 Dependencias: [x] `depends_on: [106]`, y la 106 está en `done`.
- C7 `./init.sh`: [x] exit 0, «El entorno está perfecto» (tests al 100% y build).
- C8 Peso (REQ-108-17/18): [x] `dist/client/index.html` = **39 501 B** tras mi `./init.sh`, frente a 39 457 B antes
  según el informe (+48 B por los dos `data-backdrop-size="md"`). El umbral de REQ-47-06 sigue en `size < 40000`
  (`tests/search-index-lazy-load.test.mjs:97`, archivo sin diff).
- C9 Navegador (desktop y móvil sin errores): [x] Verificación propia con `astro preview` (:4493, ya parado) y Chrome
  headless + CDP, viewport 375/800/1024/1280/1600 x 1000 (script `<scratchpad>/rev108/r108.mjs`):
  - JSON real (`md`) frente a la línea base de la 105 (atributo quitado por CDP): el `use` de CLAUDE CODE y GITHUB y
    todas las cards del mosaico tienen Δmax 0 en los 5 anchos.
  - sm/md/lg inyectados: el ancho del `use` cumple sm < interior de la card < md < lg en los 10 casos (p. ej. a 1280,
    CLAUDE CODE da 151.9 < 187 < 214.5 < 292.7). Hueco inferior de 1 px en los 30 casos. Solape con el título 0 en
    los 30. left/right computados: 16/-16/-56 px (10/-10/-36 px a ≤ 1200). En todos: bottom 0, z-index 0, opacidad
    0.06 y ningún atributo `style`. El fondo va antes que `.card-icon`, que es absoluto y sigue en el DOM, así que el
    icono principal se pinta encima. Mosaico con Δ 0 en los tres tamaños. Sin scroll horizontal.
  - 0 errores de consola/red. Mis cifras coinciden al décimo de píxel con la tabla del informe.
  - Las capturas de `progress/research/hero108/` (30 de tamaño + 10 `json`) son coherentes con las mías: por ejemplo
    `github-lg-1280.png` y `claude-code-sm-375.png` muestran el glifo anclado abajo, detrás del icono y lejos del título.
- C10 Harness: [ ] La feature sigue `in_progress`. Le toca al líder ponerla en `done` tras este APPROVED y cerrar la sesión.

## Observaciones (no bloqueantes)
1. Una tarjeta rica (`kind` htb/…) que declare `backgroundIconSize`, incluso inválido (`"zz"`), no da error: lo ignora
   `parseRichCard` (`hero-cards-parse.ts:62-71`). Es el comportamiento de siempre para todos los campos de icono
   (`backgroundIcon` e `iconWidth` también se ignoran en las ricas), y REQ-108-02 sitúa el campo en tarjetas con
   `backgroundIcon`. Si el humano quiere que un campo de icono en una tarjeta rica sea error de datos, eso pide una
   feature aparte que cubra todos esos campos.
2. Los valores sm/lg (16/10 y -56/-36 px) son los valores por defecto revisables de design.md (Decisión 2).

## Cambios requeridos (si aplica)
Ninguno.
