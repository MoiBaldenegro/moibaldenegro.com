# Informe de implementación — feature 25 `game-of-life-removal`

> Eliminación definitiva del fondo del Juego de la Vida del proyecto (decisión
> del usuario 2026-08-12). Contrato: `specs/25_game-of-life-removal/`
> (requirements + design). Contexto: `progress/research/estilos-posts-y-gol-removal.md`.

## 1. Ciclo rojo → verde

### Test escrito primero (contra la spec 25)

`tests/game-of-life-removal.test.mjs` (8 tests) verifica:
- REQ-25-01: ausencia de `src/components/GameOfLifeBackground.astro`,
  `src/utils/game-of-life.ts`, `src/utils/game-of-life-canvas.ts`,
  `src/utils/gol-render.ts` y `src/styles/game-of-life.css`.
- REQ-25-02: ausencia de `tests/game-of-life-engine.test.mjs`,
  `tests/game-of-life-background.test.mjs` y `tests/gol-performance.test.mjs`.
- REQ-25-03: `tokens.css` ya no define `--opacity-gol`, `--size-gol-cell` ni
  `--opacity-hero`.
- REQ-25-04: `Layout.astro` no importa el componente ni lo referencia comentado.
- REQ-25-05: `hero-section.css` conserva `.hero-background` sin tokens de opacidad.
- REQ-25-06: `docs/architecture.md` omite el componente y no introduce el token
  prohibido 'hero' del kit (REQ-01-05).
- REQ-25-07: escaneo recursivo de `src/` → 0 cadenas GOL; en `tests/` solo el
  test de la feature las menciona (Decisión 6 del design).

### Evidencia ROJA (antes de implementar; los archivos GOL existían)

```
$ node --test tests/game-of-life-removal.test.mjs
not ok 1 - REQ-25-01: los archivos de código del fondo GOL ya no existen
  error: 'el archivo GOL src/components/GameOfLifeBackground.astro todavía existe (REQ-25-01)'
not ok 2 - REQ-25-02: los tests de las features 14-16 ya no existen
  error: 'el test GOL tests/game-of-life-engine.test.mjs todavía existe (REQ-25-02)'
not ok 3 - REQ-25-03: tokens.css ya no define los tokens GOL ni --opacity-hero
  error: 'tokens.css todavía define --opacity-gol (REQ-25-03)'
not ok 4 - REQ-25-04: Layout.astro no importa el componente ni lo referencia comentado
  error: 'Layout.astro todavía menciona GameOfLifeBackground (REQ-25-04)'
not ok 5 - REQ-25-05: hero-section.css conserva .hero-background sin tokens de opacidad
  error: 'hero-section.css todavía menciona --opacity-hero (REQ-25-05)'
not ok 6 - REQ-25-06: docs/architecture.md omite el fondo GOL y no introduce el token hero
  error: 'docs/architecture.md todavía menciona el fondo del Juego de la Vida (REQ-25-06)'
not ok 7 - REQ-25-07: el escaneo de src/ no encuentra cadenas GOL
not ok 8 - REQ-25-07: en tests/ solo este archivo menciona las cadenas GOL
# tests 8
# pass 0
# fail 8
```

### Evidencia VERDE (después de la eliminación)

```
$ node --test tests/game-of-life-removal.test.mjs
1..8
# tests 8
# suites 0
# pass 8
# fail 0
```

## 2. Cobertura REQ-25-XX

| REQ | Requisito (EARS) | Cómo se cumple |
|-----|------------------|----------------|
| REQ-25-01 | El proyecto SHALL eliminar el componente, el motor, el driver, el módulo de dibujo y la hoja del fondo GOL. | Eliminados `GameOfLifeBackground.astro`, `game-of-life.ts`, `game-of-life-canvas.ts`, `gol-render.ts` y `game-of-life.css` (verificado por test y grep; `src/utils/` quedó vacía y se eliminó el directorio). |
| REQ-25-02 | El proyecto SHALL eliminar de la suite los tests del fondo GOL. | Eliminados `tests/game-of-life-engine.test.mjs`, `tests/game-of-life-background.test.mjs` y `tests/gol-performance.test.mjs`. |
| REQ-25-03 | El sistema de tokens SHALL eliminar los tokens GOL y el token de opacidad del hero de tokens.css, WHERE no tienen uso. | Verificado antes: `--opacity-hero` solo lo usaba el bloque comentado de `hero-section.css` (héroe a opacidad plena, look aprobado intacto). Eliminados los 3 tokens; tokens.css pasa de 96 a 87 líneas. |
| REQ-25-04 | El layout único SHALL eliminar el import y la referencia comentada del componente. | `Layout.astro` (35 líneas): fuera el import (antes línea 4) y el comentario `<!-- <GameOfLifeBackground /> -->` (antes línea 27). ClientRouter y navbar intactos. |
| REQ-25-05 | La hoja del hero SHALL conservar `.hero-background` sin referencia al token de opacidad. | `hero-section.css` conserva la regla `.hero-background` intacta (exigida por `tests/hero-section-styles.test.mjs` REQ-03-02) y sin tokens de opacidad; solo se limpiaron comentarios muertos (Decisión 3 del design). |
| REQ-25-06 | La documentación de arquitectura SHALL omitir el componente GOL de sus ejemplos. | `docs/architecture.md` líneas 15 y 56: `GameOfLifeBackground` reemplazado por `LatestArticles`/`HtbStadistics` (Decisión 4, sin token 'hero'). `harness-kit-integrity` 7/7 ✔. |
| REQ-25-07 | IF el escaneo de src/ o de los tests heredados encuentra referencias GOL, THEN el test SHALL fallar. | Grep final: 0 coincidencias en `src/` (incluye src/ entera recursiva); en `tests/` solo `tests/game-of-life-removal.test.mjs` las menciona (Decisión 6). El propio test 25 escanea recursivamente y fallaría ante cualquier regresión. |
| REQ-25-08 | El proyecto SHALL completar la eliminación sin romper la suite ni el build. | Suite 158/158 verde; `pnpm build` OK (rutas `/about`, `/posts/00-agilismo`, `/posts/01-diseño-detallado`, `/`); `./init.sh` → "El entorno está perfecto". |

## 3. Archivos ELIMINADOS y tocados

### Eliminados (8 archivos + 1 directorio vacío)

- `src/components/GameOfLifeBackground.astro` (feature 15)
- `src/utils/game-of-life.ts` (feature 14)
- `src/utils/game-of-life-canvas.ts` (feature 15)
- `src/utils/gol-render.ts` (feature 16)
- `src/styles/game-of-life.css` (feature 15)
- `tests/game-of-life-engine.test.mjs` (feature 14)
- `tests/game-of-life-background.test.mjs` (feature 15)
- `tests/gol-performance.test.mjs` (feature 16)
- Directorio `src/utils/` (quedó vacío tras la eliminación; `git` no rastrea
  directorios, solo archivos — no hay rastro en el índice)

### Creados

- `tests/game-of-life-removal.test.mjs` (197 líneas, 8 tests, REQ-25-01..07)

### Modificados

- `src/layouts/Layout.astro` (37 → 35 líneas): fuera import + comentario GOL.
- `src/styles/tokens.css` (96 → 87 líneas): fuera bloque "Opacidad"
  (`--opacity-gol`, `--opacity-hero`) y bloque "Tamaño" (`--size-gol-cell`).
- `src/styles/hero-section.css` (58 → 51 líneas): comentarios muertos
  (menciones GOL/Decisión 6/REQ-16 y el bloque comentado opacity/will-change)
  limpios; la regla `.hero-background` permanece intacta.
- `docs/architecture.md` (81 líneas): ejemplos de componentes sin
  `GameOfLifeBackground` (líneas 15 y 56), sin introducir 'hero'.
- `tests/article-card-images.test.mjs`: REQ-17-09 fijaba tokens.css en 96
  líneas; la spec 25 (REQ-25-03) elimina 9 líneas de tokens → aserción
  actualizada al estado canónico posterior (87 líneas), conservando la
  semántica "sin tokens nuevos" (grupo aspect/--radius-image). El comentario
  del test NO menciona las cadenas GOL prohibidas por REQ-25-07.

### Intactos (no tocados)

- Features 14-16 en `feature_list.json` (`done`, historial inamovible) y sus
  specs/artefactos en `specs/`, `progress/`.
- Features 18-24, dominio de posts, repositorios, htb-stadistics,
  `src/pages/posts/[id].astro` (view-transitions intacto), resto de tests.
- `tokens.css` conserva los demás tokens (96-9=87 líneas, sin tokens nuevos).

## 4. Verificación final completa

```
$ grep -rin "game-of-life|GameOfLife|gol-canvas|gol-render|mountGameOfLife|--opacity-gol|--size-gol-cell|--opacity-hero" src/
(0 resultados en src/)

$ grep -rl "game-of-life|GameOfLife|gol-canvas|gol-render|mountGameOfLife|--opacity-gol|--size-gol-cell|--opacity-hero" tests/
tests/game-of-life-removal.test.mjs

$ pnpm test
1..158
# tests 158 / # pass 158 / # fail 0        ✔ suite completa 100%

$ node --test tests/harness-kit-integrity.test.mjs
# tests 7 / # pass 7 / # fail 0            ✔ kit sin fugas ('hero' ausente en docs)

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm build
prerendering static routes: /about, /posts/00-agilismo, /posts/01-diseño-detallado, /index.html
Complete!                                  ✔ build OK (rutas /posts generadas)

$ ./init.sh
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 5. Notas

- El look del hero NO cambia: `--opacity-hero` ya estaba inactivo (comentado);
  el hero renderiza a opacidad plena desde antes, que es el aspecto aprobado
  (Decisión 2 del design).
- La suite pasa de 190 a 158 tests (los subtests de las 3 features GOL se
  fueron con sus archivos; el acceptance de la 25 no fija conteo — exige
  suite verde, build OK e init.sh perfecto, cumplido).
- El único test ajeno adaptado fue REQ-17-09 (conteo de líneas de tokens.css),
  consecuencia directa de REQ-25-03; precedente: feature 21 adaptó
  tests/about-page.test.mjs al output real del adapter. La semántica del
  REQ-17-09 se conserva íntegra.
- Sin dependencias nuevas, sin JS de runtime, sin tokens nuevos, sin
  subagentes lanzados.