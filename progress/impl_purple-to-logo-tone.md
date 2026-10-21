# Implementación feature 113 — purple-to-logo-tone

Estado: **BLOQUEADA** (`status: "blocked"` en feature_list.json) porque la spec se contradice. Todo lo demás está implementado y verificado.

## Bloqueo: REQ-113-03 contra REQ-113-06

- REQ-113-03 fija `--color-hero-mid: #140A16`.
- #140A16 es rgb(20, 10, 22). Máximo = B (22), mínimo = G (10), d = 12. Hue = ((R − G) / d + 4) · 60 = **290,0°**. Saturación 37,5 %, L 6,3 %.
- REQ-113-06 pide que todo color de src/ con hue entre 250 y 330 y saturación de al menos 15 % tenga hue **287 ± 2**. 290,0 se sale del rango.
- Las dos SHALL no se pueden cumplir a la vez. El test de REQ-113-06 es fiel a la spec y falla **solo** por este valor. Los otros 6 tokens dan hue 287,0–287,5.
- Este conflicto no lo resuelvo yo: cambiar el valor rompe REQ-113-03, y relajar el detector rompe REQ-113-06. Opciones para el spec_author o el humano:
  1. `--color-hero-mid: #150A18`: rgb(21, 10, 24), hue 287,1, sat 41 %, L 6,7 %. Es el más cercano al tono del logo.
  2. `--color-hero-mid: #140A17`: hue 286,2, sat 39 %, L 6,5 %.
  3. Ampliar la tolerancia de REQ-113-06 a ± 3 grados. Con colores tan oscuros (8 bits, d = 12) el hue cambia de 6 en 6 grados aprox. por cada unidad de canal.
- Una vez corregida la spec, el cambio es una sola línea en `src/styles/tokens.css` (y en la aserción de REQ-113-03 del test, si cambia el valor).

## Qué se hizo

- `src/styles/tokens.css`: cambian 7 valores. Siguen siendo 99 líneas y no hay tokens nuevos.
- `src/styles/layout.css:91`: el texto de `.skip-link` pasa de `var(--color-text)` a `var(--color-background)`. Siguen siendo 99 líneas.
- `tests/purple-to-logo-tone.test.mjs` (nuevo, 99 líneas). Cubre REQ-113-01..12:
  - comprueba los valores de los tokens;
  - detector de morados en `src/styles`, `src/components`, `src/layouts`, `src/pages`, `src/domain` y `src/data`: lee hex, rgb() y hsl() y busca nombres de color (purple, violet, indigo, rebeccapurple, orchid, plum, magenta, fuchsia, lavender…). Antes de recorrer los archivos se comprueba a sí mismo con #6E29C8, #639, #6C387A y #070716;
  - comprueba la regla `.skip-link`;
  - calcula los contrastes WCAG;
  - comprueba las 99 líneas y que los tokens azul marino no cambian.
  - REQ-113-13 ya lo cubre `tests/search-index-lazy-load.test.mjs` (umbral 42 000 B tras un build real).
  - Excepción documentada en la cabecera: `public/` (sprite.svg con #639) y `src/content/` no se escanean.
- Ajustes de tests heredados (nota «Ajuste feature 113 (precedente REQ-43-06)»):
  - `tests/design-tokens.test.mjs:43`: `--color-marca-css` pasa a `#6C387A`, con la nota en la misma línea (el archivo mantiene sus 107 líneas).
  - `tests/hero-cards-links-xlink.test.mjs:33`: `src/styles/tokens.css` sale de la lista de rutas que la 107 exigía sin cambios respecto a HEAD (REQ-107-26). La 113 tiene que cambiar ese archivo.
- No se tocó lo que es ajeno a la feature: `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` y `tests/hack-the-box-sprite.test.mjs`.

## Tokens antes y después

| Token | Antes | Después | Hue después |
|-------|-------|---------|-------------|
| `--color-accent` | #7d68ff | #B37AC2 | 287,5 |
| `--color-accent-hover` | #9a89ff | #C396CF | 287,4 |
| `--color-hero-top` | #25144f | #3C1F44 | 287,0 |
| `--color-hero-mid` | #0b0818 | #140A16 | **290,0** (bloqueo) |
| `--color-glow` | rgba(120, 70, 255, 0.25) | rgba(108, 56, 122, 0.35) | 287,3 |
| `--color-scrollbar-thumb` | #4732a5 | #6C387A | 287,3 |
| `--color-marca-css` | #6E29C8 | #6C387A | 287,3 |

No cambian `--color-background` #070716, `--color-surface` #101018, `--color-hero-bottom` #05050b, `--color-navbar` rgba(8, 8, 18, 0.75), `--color-scrollbar-track` #090912 ni `--color-text-secondary` #b8b8c5 (REQ-113-12).

## Ciclo rojo/verde

### Rojo: test escrito antes del código, con los tokens antiguos

```
✖ REQ-113-01..05: los 7 tokens morados valen la familia del logotipo   (actual '#7d68ff', expected '#B37AC2')
✖ REQ-113-06: ningún morado del código de la app fuera del hue 287 ± 2
    src/styles/tokens.css: #25144f (hue 257.3)
    src/styles/tokens.css: #0b0818 (hue 251.3)
    src/styles/tokens.css: rgba(120, 70, 255, 0.25) (hue 256.2)
    src/styles/tokens.css: #6E29C8 (hue 266.0)
    src/styles/tokens.css: #4732a5 (hue 251.0)
✖ REQ-113-07: .skip-link usa texto --color-background sobre --color-accent   (color: var(--color-text))
✔ REQ-113-08..10: contrastes WCAG del acento, el foco y la marca CSS
✔ REQ-113-11..12: tokens.css en 99 líneas y azul marino intacto
ℹ tests 5  ℹ pass 2  ℹ fail 3
```

(Los tests 08..10 y 11..12 ya pasaban en rojo porque son guardas de regresión. El acento antiguo también cumplía AA como texto.)

### Tras implementar (`pnpm test`): verde salvo el bloqueo

```
ℹ tests 1168  ℹ pass 1166  ℹ fail 2
✖ REQ-107-26/27/36: git diff no toca ... tokens.css   -> resuelto después con el ajuste de hero-cards-links-xlink.test.mjs (5/5 en verde)
✖ REQ-113-06: src/styles/tokens.css: #140A16 (hue 290.0)   -> BLOQUEO (contradicción de la spec)
```

Queda en rojo únicamente REQ-113-06. Por eso `./init.sh` no queda en verde y la feature no se entrega al reviewer.

## Verificación visual: Chrome headless + CDP

- Script: scratchpad `cdp113/m113.mjs`. Servidor: `astro preview --port 4630` sobre `pnpm build`, parado al terminar. El `pnpm dev` de :4321 (PID 34400) no se tocó.
- Páginas: `/`, `/about/`, `/posts/00-spring-boot/` y `/search/`, a 375 y 1280 px.
- 32 capturas en `progress/research/colors113/`. Por cada página y ancho hay 2 de antes (`before-<página>-<ancho>.png` y `before-...-skip.png`, con el skip link enfocado) y 2 de después (`after-...`). Los resultados en bruto están en el scratchpad: `cdp113/before.json` y `cdp113/after.json`.
- Errores de consola, excepciones y log: 0 en las 8 combinaciones, antes y después.
- Peso de `dist/client/index.html`: 40 207 B antes y 40 203 B después (menos de 42 000, REQ-113-13).

| Medida (contraste WCAG medido en el navegador) | Antes | Después |
|---|---|---|
| Textos en color de acento, mínimo por página (11 en /, 5–6 en /about, 1 en post y en /search) | 4,77 | 5,84 (sobre superficie) / 6,17 (sobre fondo) |
| Hover del enlace de acento (/, /about a 1280) | 5,04 | 6,17 |
| Contorno de foco: 4 primeros Tab tras el skip link, todas las páginas | 4,77–5,08 | 5,84–6,17 |
| Skip link (texto sobre acento) | 3,97 (blanco, no AA) | 6,17 (#070716) |
| Card CSS (título blanco sobre la marca) | 7,46 (#6E29C8) | 8,45 (#6C387A) |
| Tokens calculados: acento sobre hero-top / hover sobre fondo | — | 4,40 / 8,17 |

- Observación preexistente, no de esta feature: en el post a 375 px el documento tiene desbordamiento horizontal (`scrollWidth > innerWidth`). Ocurre igual antes y después.
- Observación de la herramienta: la captura `after-home-1280.png` sale con el hero ya desplazado (el viewport se captura tras la carga). Las capturas de antes y después se hicieron con el mismo script y son comparables.

## Ronda 2 (tras el ajuste de spec de REQ-113-03)

Ajuste de spec: `--color-hero-mid` pasa a `#150A18` (hue 287,1°, saturación 41 %, L 6,7 %). Así se resuelve el bloqueo de REQ-113-06. La 113 vuelve a `in_progress`. El resto de la ronda 1 sigue en el árbol y no se repite.

Cambios de esta ronda:
- `tests/purple-to-logo-tone.test.mjs:61`: la aserción de REQ-113-03 pasa a `'#150A18'`.
- `src/styles/tokens.css:33`: `--color-hero-mid: #150A18;`. El archivo sigue en 99 líneas.

### Rojo (tras cambiar el test y antes de tocar tokens.css)

```
✖ REQ-113-01..05: los 7 tokens morados valen la familia del logotipo
    actual: '#140A16',
    expected: '#150A18',
✖ REQ-113-06: ningún morado del código de la app fuera del hue 287 ± 2
  src/styles/tokens.css: #140A16 (hue 290.0)
✔ REQ-113-07 / ✔ REQ-113-08..10 / ✔ REQ-113-11..12
ℹ tests 5  ℹ pass 3  ℹ fail 2
```

### Verde

```
./init.sh  -> exit 0, «✔ tests al 100% (node:test)», «✔ build de producción», «✔ El entorno está perfecto»
pnpm test  -> ℹ tests 1168  ℹ pass 1168  ℹ fail 0
dist/client/index.html: 40 203 B (< 42 000, REQ-113-13)
```

### Re-captura CDP (lo que afecta el gradiente del hero: `/` a 375 y 1280)

- Script: scratchpad `cdp113/m113r2.mjs`. Es `m113.mjs` limitado a `/`. Resultados en `cdp113/r2.json`.
- Servidor: `astro preview --port 4630` sobre el build de `./init.sh`, parado al terminar (PID 8520). El `pnpm dev` de :4321 (PID 34400) no se tocó.
- Capturas en `progress/research/colors113/`: `r2-home-375.png`, `r2-home-375-skip.png`, `r2-home-1280.png` y `r2-home-1280-skip.png`.
- Errores de consola y excepciones: 0 en las 2 combinaciones.

| Medida (en el navegador) | 375 | 1280 |
|---|---|---|
| `--color-hero-mid` calculado | #150a18 | #150a18 |
| Texto de acento, contraste mínimo | 5,84 | 5,84 |
| Skip link | 6,17 | 6,17 |
| Contorno de foco, 4 primeros Tab | 6,17 / 6,17 / 5,84 / 5,84 | 6,17 ×4 |
| Hover del enlace de acento | (no hay ninguno en el viewport) | 6,17 |
| Card CSS (blanco sobre la marca) | 8,45 | 8,45 |

El cambio de #140A16 a #150A18 apenas se ve, porque solo sube 1 o 2 unidades por canal. Los contrastes son los mismos que en la ronda 1.

No se tocaron los archivos ajenos: `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` (su cambio en el árbol ya estaba antes de esta sesión) y `tests/hack-the-box-sprite.test.mjs`.
