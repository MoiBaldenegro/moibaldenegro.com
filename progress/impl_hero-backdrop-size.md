# Implementación — feature 108 hero-backdrop-size

Estado: implementada, `./init.sh` en verde (exit 0). Lista para el reviewer.
Fecha: 2026-10-20. Spec: `specs/108_hero-backdrop-size/requirements.md` y `design.md`. Petición humana: «…y ya que andas
ahi en tamaño del logo de fondo ponlo ahi tambien para poder manipular desde el JSON».

## Cambios

| Archivo | Cambio | Líneas |
|---------|--------|------:|
| `src/domain/entities/hero-card.ts` | `HERO_BACKDROP_SIZES = ['sm', 'md', 'lg'] as const`, `HeroBackdropSize` y `readonly backgroundIconSize?: HeroBackdropSize` en `HeroCard` (REQ-108-01) | 60 |
| `src/domain/repositories/hero-cards-fields-parse.ts` | `readBackdropSize(card, sizes, index)`: ausente = `{}` (sin clave); presente exige `backgroundIcon` y un valor del catálogo; si no, `HeroCardsDataError` con `hero-cards.json`, índice y `backgroundIconSize` (REQ-108-02..04) | 75 |
| `src/domain/repositories/hero-cards-parse.ts` | `...readBackdropSize(card, HERO_BACKDROP_SIZES, index)` en `parseIconCard` | 71 |
| `src/data/hero-cards.json` | `"backgroundIconSize": "md"` solo en claude-code y github (REQ-108-05) | 17 |
| `src/components/hero-card.astro` | `<div class="card-backdrop" data-backdrop-size={card.backgroundIconSize}>`; Astro omite el atributo si es `undefined` (REQ-108-06/07). Sin `style=` | 51 |
| `src/styles/hero-card-accents.css` | `.card-backdrop[data-backdrop-size="sm"]` 16px/10px y `[data-backdrop-size="lg"]` -56px/-36px (solo left/right); md = regla base de la 105 sin regla propia (REQ-108-08..11) | 57 |
| `tests/hero-backdrop-size.test.mjs` | Test nuevo (10 casos) | 93 |
| `tests/hero-cards-extra-logos.test.mjs` | REQ-103-09/10/11: `layer()` añade `data-backdrop-size` si el JSON declara el campo. Nota «Ajuste feature 108 (precedente REQ-43-06)» | 100 |
| `tests/hero-cards-polish.test.mjs` | REQ-101-17: el JSON frente a la 99 ignora también `backgroundIconSize`. Nota «Ajuste feature 108 (precedente REQ-43-06)» | 100 |

No se tocan: `public/assets/svg/sprite.svg`, `src/content/posts/`, `tests/hack-the-box-sprite.test.mjs`, `src/styles/hero-card.css`,
`src/styles/tokens.css` ni `tests/search-index-lazy-load.test.mjs` (`git status` sin cambios en ellos; REQ-108-16/17). Sin JS nuevo
y sin style inline.

Decisión: el marcado emite `data-backdrop-size` siempre que el JSON lo declara (también con `md`), como fijan REQ-108-05/06. No
se aplicó la optimización de omitirlo cuando vale el valor por defecto porque la spec exige `data-backdrop-size="md"` en el
HTML de CLAUDE CODE y GITHUB y el peso cabe holgado (abajo).

## Ciclo rojo / verde (REQ-108-15)

Rojo (`node --test tests/hero-backdrop-size.test.mjs`, test escrito antes que el código):

```
✖ REQ-108-01: ... (AssertionError: The input did not match /export const HERO_BACKDROP_SIZES = \['sm', 'md', 'lg'\] as const;/)
✖ REQ-108-02/03: ... (Expected values to be strictly deep-equal)
✖ REQ-108-04: ... (Missing expected exception: {"backgroundIcon":"/assets/svg/sprite.svg#github-wordmark","backgroundIconSize":"xl"})
✖ REQ-108-05: ... (+ [] - [['claude-code','md'],['github','md']])
✖ REQ-108-06/07: ... (no match /<div class="card-backdrop" data-backdrop-size=\{card\.backgroundIconSize\}>/)
✖ REQ-108-06/07/17 (build): ... (AssertionError: claude-code)
✖ REQ-108-08/09/10: ... (Expected values to be strictly deep-equal)
✔ REQ-108-11: las reglas de tamaño solo declaran left y right; base de la 105 intacta
✖ REQ-108-14: ... (falta claude-code-sm-375.png)
✔ REQ-108-15/16/17: test solo con node:, archivos tocados <= 100 líneas y umbral de REQ-47-06 intacto
ℹ tests 10  ℹ pass 2  ℹ fail 8
```

REQ-108-11 y REQ-108-15/16/17 pasan en rojo porque son guardas (sin reglas de tamaño aún no hay nada que incumpla; base de
la 105 y umbral intactos); lo nuevo lo fijan REQ-108-08/09/10 (en rojo).

Verde (mismo comando, tras implementar y tomar las capturas):

```
✔ REQ-108-01 ✔ REQ-108-02/03 ✔ REQ-108-04 ✔ REQ-108-05 ✔ REQ-108-06/07 ✔ REQ-108-06/07/17 (build)
✔ REQ-108-08/09/10 ✔ REQ-108-11 ✔ REQ-108-14 ✔ REQ-108-15/16/17
ℹ tests 10  ℹ pass 10  ℹ fail 0
```

Suite completa (`pnpm test`): `ℹ tests 1131 ℹ pass 1131 ℹ fail 0`. `./init.sh`: exit 0, «✔ El entorno está perfecto».
Antes de ajustar los heredados fallaban solo REQ-101-17 (JSON frente a la 99) y REQ-103-09/10/11 (marcado exacto del article).

## Peso de `dist/client/index.html` (REQ-108-17/18)

| Medida | Bytes |
|--------|------:|
| Antes (`pnpm build`, árbol tras la 107) | **39 457** |
| Después, build del test (`astroBuild`) | 39 505 |
| Después, `pnpm build` (dos ejecuciones) | **39 501** / 39 513 |
| Umbral REQ-47-06 (sin cambios) | < 40 000 |

Delta estructural: `data-backdrop-size="md"` ×2 = **48 B** (diff del HTML: solo cambian las dos `div.card-backdrop`, el
hash del CSS y la clave cifrada de la server island de HTB, cuya longitud varía ±8 B entre builds). Margen restante ≈ 490 B.

## Verificación en navegador (REQ-108-12/13/14)

Chrome headless (`--headless=new`) + CDP, viewport 375/800/1024/1280/1600 x 1000, DPR 1. Script
`<scratchpad>/cdp108/m108.mjs` (base `cdp105/m105.mjs`). Línea base: `dist/client` de antes de la feature copiado y servido
estático (:4481). Después: el mismo build final servido estático (:4482) y `astro preview --port 4483` (con la server island
de HTB; 0 errores de consola/red). Los tres servidores se pararon al terminar; el `pnpm dev` de :4321 no se tocó. A 375 px
las dos cards están ocultas por la regla de la 106: se desactiva poniéndoles `data-show-on-mobile="true"` por CDP.
`sm`/`md`/`lg` se inyectan por CDP con `setAttribute('data-backdrop-size', …)`; el JSON no se cambió para la prueba.

### REQ-108-12: JSON real (`md`) frente a la línea base

| Ancho | `use` CLAUDE CODE Δmax | `use` GITHUB Δmax | Mosaico (todas las cards) Δmax |
|------:|----:|----:|----:|
| 375 | 0 | 0 | 0 |
| 800 | 0 | 0 | 0 |
| 1024 | 0 | 0 | 0 |
| 1280 | 0 | 0 | 0 |
| 1600 | 0 | 0 | 0 |

(Δ sobre x, y, ancho, alto y hueco inferior del `use` respecto a la card; estático y preview dan lo mismo.)

### REQ-108-13: sm / md / lg inyectados (preview)

`w` = ancho del `use`, `gap` = borde inferior de la card − borde inferior del `use`, `tít` = solape (px²) de las líneas del
título con el rectángulo del `use`. En todos: z-index 0, opacidad 0.06, `bottom` 0.

| Ancho | Card (interior) | Logo | sm w / gap / tít | md w / gap / tít | lg w / gap / tít |
|------:|------|------|------|------|------|
| 375 | 346.8 x 190 (345) | CLAUDE CODE | 317.5 / 1 / 0 | 356.7 / 1 / 0 | 407.6 / 1 / 0 |
| 375 | | GITHUB | 324.7 / 1 / 0 | 364.7 / 1 / 0 | 416.7 / 1 / 0 |
| 800 | 113.4 x 140 (111) | CLAUDE CODE | 89.3 / 1 / 0 | 128.5 / 1 / 0 | 179.4 / 1 / 0 |
| 800 | | GITHUB | 91.4 / 1 / 0 | 131.4 / 1 / 0 | 183.4 / 1 / 0 |
| 1024 | 148.9 x 140 (147) | CLAUDE CODE | 124.0 / 1 / 0 | 163.2 / 1 / 0 | 214.0 / 1 / 0 |
| 1024 | | GITHUB | 126.9 / 1 / 0 | 166.9 / 1 / 0 | 218.8 / 1 / 0 |
| 1280 | 189.4 x 204 (187) | CLAUDE CODE | 151.9 / 1 / 0 | 214.5 / 1 / 0 | 292.7 / 1 / 0 |
| 1280 | | GITHUB | 155.4 / 1 / 0 | 219.4 / 1 / 0 | 299.4 / 1 / 0 |
| 1600 | 238.3 x 204 (236) | CLAUDE CODE | 199.8 / 1 / 0 | 262.4 / 1 / 0 | 340.6 / 1 / 0 |
| 1600 | | GITHUB | 204.3 / 1 / 0 | 268.3 / 1 / 0 | 348.3 / 1 / 0 |

- sm < interior de la card < md < lg en los 10 casos; borde inferior a 1 px (<= 2 px) en los 30; solape con el título 0 en los 30.
- left/right computados: sm 16px (10px en <= 1200), md -16px (-10px), lg -56px (-36px).
- Mosaico sin cambios con cualquier tamaño (Δmax 0 en las cards visibles); `scrollWidth` del documento < viewport (sin
  desbordamiento horizontal: el `overflow: hidden` de la card recorta el lg). A 375 px las cards ocultas (0 x 0) dan una `y`
  distinta solo por el scroll restaurado entre navegaciones; las 3 visibles, Δ 0.
- Fondo bajo el icono principal (z-index 0, antes de `.card-icon` en el DOM, sin cambios de la 105) en los tres tamaños.
- Errores de consola/red en preview: 0. (El servidor estático da los 404 esperables de `/_server-islands/HtbStadistics`.)

Capturas (REQ-108-14): `progress/research/hero108/<card>-<sm|md|lg>-<w>.png` (30) y, además, `<card>-json-<w>.png` (10) con el
marcado real del build.

## Observaciones

- Con `lg`, el glifo de GitHub muestra parte de «Hu» dentro de los huecos oscuros del octocat; ocurre igual con `md` (es la
  observación (ai) de la 103, preexistente) y no cambia el orden de pintado.
- Valores por defecto revisables por el humano (design.md, Decisión 2): sm 16px/10px, md -16px/-10px, lg -56px/-36px.
