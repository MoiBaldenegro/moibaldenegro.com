# Review — feature 25

**Veredicto:** APPROVED

## Checkpoints
- C1 (REQ-25-01 cards desde view-model 24): [x] — `src/pages/posts/[id].astro:64-72` itera `relatedLinks.map` y pinta `item.img` (`/assets/content/`, línea 66), `href={item.href}` + `{item.title}` (línea 68) y `Por {item.author} • {item.readtime} min` (línea 69); `related-titles.ts:12-18` expone `RelatedLink {href,title,img,author,readtime}` readonly.
- C2 (REQ-25-02 rejilla 2 col hairline/wash/subrayado): [x] — `src/styles/post-next.css:9` `display: grid; grid-template-columns: 1fr 1fr`, `:10` hairline `border-bottom: 1px solid var(--color-border)`, `:12` wash `background: var(--color-surface)` en hover, `:16` subrayado del título, `:13` thumb `width: 112px + aspect-ratio: 16/9 + var(--radius-thumb)`.
- C3 (REQ-25-03 solo tokens): [x] — test `REQ-25-03` en verde: sin hex ni `rgb()/rgba()`, todo `var(--…)` declarado en `tokens.css`; `12px/6px/4px` de padding/margen fino siguen el lenguaje canónico de `search-results.css:30,58` (`padding: 16px 12px` / `12px 6px`), no son colores/radios/sombras sueltos.
- C4 (REQ-25-04 responsive ≤768px): [x] — `post-next.css:18-25` `@media (max-width: 768px)` colapsa a `grid-template-columns: 1fr`, ancho completo (`width: 100%`, línea 20/24) y `.post__related-thumb { display: none }` (línea 23, precedente REQ-09-09).
- C5 (REQ-25-05 sin JS/prerender): [x] — `getStaticPaths` resuelve `relatedLinks: resolveRelatedTitles(posts, post.related)` (línea 28), `export const prerender = true` (línea 37), sin `<script>` ni `client:`; frontmatter solo imports + paso de datos (regla 8).
- C6 (REQ-25-06 ≤100 líneas, post.css/repositorio intactos): [x] — `[id].astro` 77/100, `post-next.css` 25/100; `post.css` 100/100 intacto (test Convención en verde); `posts-repository.ts` y esquema/entidad sin tocar (no aparecen en el diff de la feature).
- C7 (ciclo rojo/verde + ./init.sh): [x] — `progress/impl_25.md` documenta rojo previo (`# pass 4 / # fail 3`, REQ-25-01/02/04 en `not ok` antes de tocar `src/`) y verde posterior (scope 38 pass / 0 fail); `./init.sh` verificado en verde por el revisor (formato + tests 100% + build OK).
- C8 (depends_on + ajuste REQ-24 justificado): [x] — `depends_on: [24]` con feature 24 en `done`; ajuste de `tests/related-card-model.test.mjs:22-26,176-178` invierte la convención a `assert.match(item.img|author|readtime)` con justificación REQ-43-06 en el encabezado; ningún test de features 19/21/22/23/24 roto (init verde).

## Cambios requeridos (si aplica)
Ninguno.
