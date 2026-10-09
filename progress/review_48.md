# Review — feature 48

**Veredicto:** APPROVED

Feature 48 `image-loading-hints` (spec `specs/48_image-loading-hints/requirements.md` + `design.md`).
Implementada por el líder en rol de implementer (autorización humana explícita); revisada con el
mismo rigor que una entrega del implementer.

## Verificación ejecutada

- `./init.sh`: exit 0, todo verde (entorno, formato, tests 100 %, build).
- `pnpm test`: 687/687 pass, 0 fail.
- HTML generado (`dist/client/index.html`, `dist/client/posts/00-agilismo/index.html`): logo
  `width="72" height="25"`; hero `width="952" height="960" fetchpriority="high"` sin lazy;
  miniaturas de la portada y de recomendados con `width/height` + `loading="lazy"` + `decoding="async"`;
  portada del post `width="1376" height="768" fetchpriority="high"` sin lazy.

## Dimensiones reales (medidas leyendo las cabeceras de `public/assets`)

| Archivo | Real | Declarado | Resultado |
|---|---|---|---|
| `mxvi_logo.webp` | 2048×716 | 72×25 | OK (72·716/2048 = 25,17) |
| `moises-hero.jpg` | 952×960 | 952×960 | OK, exacto |
| `arch00.webp`, `arch-entry_05.webp`, `entry-02.webp`, `entry-03.webp` | 1376×768 | 1376×768 | OK, exacto |
| `entry-01.webp` | 1024×559 | 1376×768 | Proporción 1,83 frente a 1,79 (diferencia de ~2 %). No bloquea: todas las reglas CSS que la muestran fijan `aspect-ratio: 16/9` (o 4/3) con `object-fit: cover` (`src/styles/post.css:36-37`, `post-header.css:50`, `latest-articles.css:64-65`, `post-next.css:13`, `search-results.css:33`), así que la proporción la reserva el CSS y la imagen no se deforma. Está documentado en `progress/impl_48.md`. |

## fetchpriority solo en la imagen LCP

`grep fetchpriority src` → solo 2 coincidencias: `src/components/new-hero/new-hero.astro:32`
(hero, que solo usa `src/pages/index.astro`) y `src/pages/posts/[id].astro:50` (portada del post).
Una por página. Las miniaturas no lo llevan (el test `REQ-48-04` lo comprueba con `doesNotMatch`).

## Requisitos

- REQ-48-01: todas las `<img` de los 5 archivos tienen width/height (`Layout.astro:53`,
  `new-hero.astro:30-31`, `latest-articles.astro:22-23`, `[id].astro:50,75`, `item-html.ts:12`).
- REQ-48-02: `Layout.astro:53` declara `width="72" height="25"`.
- REQ-48-03: hero y portada del post con `fetchpriority="high"` y sin `loading="lazy"`.
- REQ-48-04: `latest-articles.astro:24-25`, `[id].astro:75` e `item-html.ts:12` tienen lazy + async.
- REQ-48-05: sin cambios de CSS; las reglas ya tienen `aspect-ratio`/`object-fit: cover`. El hero
  (`profile-card.css:21`) usa `height: 100%; object-fit: cover` dentro de un contenedor con tamaño.
- REQ-48-06: `progress/impl_48.md` registra el rojo previo (2 pass / 4 fail; 48-05 y 48-07 en verde
  porque ya se cumplían) y luego el verde 6/6. Encaja con el estado previo del código (`git diff`).
- REQ-48-07: Layout 65, new-hero 59, latest-articles 39, [id] 86, item-html 26 y el test 78 líneas.
  Todos ≤ 100.
- REQ-48-08: `./init.sh` y `pnpm test` en verde.
- Dependencias: la feature 48 no tiene `depends_on`, así que no salta ninguna dependencia pendiente.

## Checkpoints
- C1 (estilos fuera de `.astro`, sin `<style>`): [x]
- C2 (sin lógica en la UI; el frontmatter solo importa y pasa datos): [x]. La feature solo añade atributos HTML.
- C3 (datos vía repositorios): [x]. La feature no lo cambia.
- C4 (tokens, sin valores sueltos): [x]. No hay CSS nuevo.
- C5 (≤100 líneas por archivo): [x]
- C6 (sin dependencias externas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (revisión visual en desktop/móvil): [ ]  ← No la ha hecho el reviewer en navegador. Lo que cambia son solo atributos y el HTML generado se ha comprobado arriba.
- C9 (harness: tarea en `done`): [ ]  ← La feature está en `in_progress`. La cierra el líder tras esta aprobación.
- C10 (sin temporales, debug ni TODOs): [x]

## Cambios requeridos (si aplica)

Ninguno.

Observación (no bloqueante): `entry-01.webp` mide 1024×559 y no 1376×768. Si en el futuro alguna
regla CSS de portada perdiera el `aspect-ratio`, convendría volver a exportar esa imagen a
1376×768 o declarar sus dimensiones por imagen.
