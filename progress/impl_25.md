# Informe de implementación — Feature 25 related-cards-present

- Feature: 25 — Presentar los recomendados como cards pequeñas acordes al diseño
- Estado: implementada, `./init.sh` en verde; pendiente de reviewer (NO marcada `done`)
- Fecha: 2026-09-17

## Plan ejecutado

- Tests primero contra la spec (requirements.md REQ-25-01..06 + design.md), observar rojo
- Pintar cards en `src/pages/posts/[id].astro` desde el view-model de la 24
- Estilar rejilla 2 col en `src/styles/post-next.css` compactando a ≤100 líneas
- Ajustar la convención REQ-24 que anticipaba esta feature y dejar `./init.sh` en verde

## Ciclo rojo (test-first)

Test nuevo `tests/related-cards-present.test.mjs` (7 tests, REQ-25-01..06 + convención),
ejecutado ANTES de tocar `src/`:

```
not ok 1 - REQ-25-01: el detalle muestra una card por recomendado con miniatura, título enlazado y meta
not ok 2 - REQ-25-02: post-next.css presenta las cards en rejilla de dos columnas con hairline y wash
ok 3 - REQ-25-03: post-next.css estila las cards solo con tokens de tokens.css
not ok 4 - REQ-25-04: las cards van en una columna a ancho completo con miniatura oculta en 768px o menos
ok 5 - REQ-25-05: la página resuelve las cards en build sin JS de runtime
ok 6 - REQ-25-06: la página de detalle y post-next.css no superan las 100 líneas
ok 7 - Convención: post-next.css convive con el botón, sin <style> ni JS y post.css intacto
# pass 4 / # fail 3
```

Rojo en REQ-25-01/02/04: la vista era lista simple de títulos y el CSS no tenía
rejilla ni miniatura. Ningún código de la feature existía antes que su test.

## Cambio

- `src/pages/posts/[id].astro` (73 → 79 líneas): cada item de `relatedLinks`
  pinta `<img class="post__related-thumb" src={/assets/content/${item.img}}>`
  + `<div class="post__related-body">` con `<a href={item.href}>{item.title}</a>`
  y `<p class="post__related-meta">Por {item.author} • {item.readtime} min</p>`.
  Frontmatter intacto (ya importaba `resolveRelatedTitles` y resolvía
  `relatedLinks` en `getStaticPaths`): solo imports y paso de datos (regla 8),
  prerender intacto, cero JS.
- `src/styles/post-next.css` (91 → 25 líneas): reescritura compacta (sin pedir
  `blocked`). Rejilla `display: grid; grid-template-columns: 1fr 1fr` en
  `.post__related-list`; thumb canónico 112px + `aspect-ratio: 16 / 9` +
  `border-radius: var(--radius-thumb)`; hairline `var(--color-border)`, wash
  `var(--color-surface)` en hover, subrayado del título (idioma feature 9).
  Se conserva `.post__related-item:last-child { border-bottom: none }` para no
  romper REQ-23-04. Media 768px: 1 columna, ancho completo, miniatura oculta
  (precedente REQ-09-09). Solo tokens; `post.css` intacto (100/100);
  repositorio/entidad/esquema sin tocar.
- `tests/related-card-model.test.mjs` (ajuste anticipado, precedente REQ-43-06
  con justificación en el encabezado): su convención decía "la vista ya pinta
  las cards (eso es feature 25)" con `doesNotMatch(item.img|author|readtime)`;
  con la 25 implementada se invierte a tres `assert.match`. Sin JS y
  repositorio intacto no cambian. Destinos `/posts/[id]` intactos: ningún otro
  test de las features 19/21/22/23/24 se toca.

## Ciclo verde (evidencia)

Scope (25 + 24 + 23 + 21 + 19): 38 pass / 0 fail, incluidos REQ-23-01..07 y
REQ-21-01..07 sin cambios.

`./init.sh` completo en verde:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Alcance respetado

- Una sola feature (25); sin descripción ni tags en la card (D2 del design);
  sin tocar `post.css`, repositorio, entidad, esquema ni frontmatter curado.
- Archivos tocados: `[id].astro` 79/100, `post-next.css` 25/100,
  `related-titles.ts` intacto, tests nuevos + 1 ajuste justificado.
