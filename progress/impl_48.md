# Informe de implementación — feature 48 image-loading-hints

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/48_image-loading-hints/requirements.md` + `design.md`.

## Dimensiones intrínsecas medidas (cabeceras de los archivos)

| Imagen | Tamaño real | Atributos |
|---|---|---|
| `mxvi_logo.webp` | 2048×716 | `width="72" height="25"` (72·716/2048 ≈ 25) |
| `moises-hero.jpg` | 952×960 | `width="952" height="960"` |
| Portadas `/assets/content/*.webp` | 1376×768 (`entry-01.webp`: 1024×559) | `width="1376" height="768"` |

Las portadas comparten atributos porque la proporción visual la fija el CSS (`aspect-ratio` +
`object-fit: cover`); `entry-01` (1,83:1 frente a 1,79:1) no se deforma por ello.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/layouts/Layout.astro` | Logo con `height="25"` (REQ-48-02). |
| `src/components/new-hero/new-hero.astro` | Imagen del hero: `width/height` + `fetchpriority="high"`, sin lazy (LCP de la portada) (REQ-48-01/03). |
| `src/components/latest-articles.astro` | Miniaturas: `width/height` + `loading="lazy"` + `decoding="async"` (REQ-48-01/04). |
| `src/pages/posts/[id].astro` | Portada del post: `width/height` + `fetchpriority="high"` (LCP del artículo); miniaturas de recomendados: `width/height` + lazy + async (REQ-48-01/03/04). |
| `src/components/search-results/item-html.ts` | Miniatura de resultados: `width/height` + lazy + async. |
| `tests/image-loading-hints.test.mjs` (NUEVO) | Inspección de cada `<img` (incluidas las multilínea), logo, LCP, miniaturas y CSS sin deformación. |

Sin cambios de CSS: las reglas ya conservan `aspect-ratio` u `object-fit: cover` (REQ-48-05); el
hero usa `height: 100%` con `object-fit: cover` dentro de un contenedor dimensionado.

## Ciclo rojo/verde (REQ-48-06)

Rojo — antes de tocar `src/`: ✖ 48-01 · ✖ 48-02 · ✖ 48-03 · ✖ 48-04 · ✔ 48-05 (el CSS ya cumplía) · ✔ 48-07
(`ℹ pass 2 / ℹ fail 4`). Verde — 6/6; `pnpm test` 687/687; `./init.sh` verde.
