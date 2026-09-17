# Informe de implementación — Feature 23 related-titles-design-align

> Fecha: 2026-09-17. Estado: implementada, pendiente de review externo.
> Spec: `specs/23_related-titles-design-align/requirements.md` (REQ-23-01..07)
> + `design.md`. Research: `progress/research/recomendados-next-design.md`.
> Base: feature 22 done (hrefs íntegros a entry.id reales + related en toda
> la cadena). Informe previo: `progress/impl_22.md`.

## Qué se hizo

La lista de Recomendados mostraba el href crudo (`/posts/00-agilismo`) como
texto y el botón/lista estaban fuera del design system (botón con fondo de
acento + texto oscuro; lista en columna con gap, sin hairlines ni wash).

1. **Títulos en build (REQ-23-01/02):** módulo nuevo
   `src/domain/related-titles.ts` (23 líneas) con
   `resolveRelatedTitles(posts, related): RelatedLink[]` (`{href, title}`; un
   href sin post conocido degrada a su propio texto sin romper el build; la
   integridad la audita REQ-22-06). `src/pages/posts/[id].astro` (73/100) lo
   importa y pasa `relatedLinks` por props desde `getStaticPaths`; el
   frontmatter solo hace imports y paso de datos (regla 8), el marcado itera
   `relatedLinks` (`href={item.href}>{item.title}`), cero JS de runtime y
   `prerender` intacto. El repositorio no se extendió (97 wc / 98 conteo del
   arnés, intacto) y `post.css` sigue en 100/100.
2. **Botón al sistema (REQ-23-03/05):** `.post__next-link` con
   `background: var(--color-surface)` + `color: var(--color-text)` +
   `border: 1px solid var(--color-border)` (idioma de `.search-results__page-button`);
   hover con `border-color: var(--color-accent)`. Se elimina el fondo de
   acento con texto oscuro.
3. **Lista al modo lista canónico (REQ-23-04/05):** `.post__related-item` con
   `border-bottom: 1px solid var(--color-border)` (+ `:last-child: none`),
   hover con `background: var(--color-surface)` (wash); `.post__related-link`
   en `var(--color-text)` 1.05rem con subrayado en hover;
   `.post__related-title` en `var(--color-text)` 1.35rem (escala de
   `search-results.css`, sin tokens nuevos, D3 del design).
4. **Responsive (REQ-23-06):** se conserva `@media (max-width: 768px)` con
   botón y lista a `width: 100%`. Hoja en 91/100, solo tokens.

## Ciclo rojo/verde (evidencia)

**Rojo** — `node --test tests/related-titles-design-align.test.mjs` con solo
el test escrito (sin código):

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'.../src/domain/related-titles.ts' imported from
'.../tests/related-titles-design-align.test.mjs'
# tests 1
# pass 0
# fail 1
```

(el módulo aún no existía; las aserciones de inspección sobre
`relatedLinks`, superficie/borde del botón y hairlines tampoco se cumplían
contra el estado previo: botón con `background: var(--color-accent)` +
`color: var(--color-surface)` y lista sin hairlines).

**Verde** — tras implementar, área tocada:

```
node --test tests/related-titles-design-align.test.mjs
  tests/related-posts-list.test.mjs tests/next-post-button.test.mjs
# tests 24
# pass 24
# fail 0
```

**Suite del arnés** — `./init.sh`: formato ✔, tests al 100% ✔, build ✔,
«El entorno está perfecto». Nota: una corrida intermedia de `pnpm test`
mostró 1 fallo transitorio en `tests/hero-ui-refactor.test.mjs` (REQ-09-05,
barrido de `hero.data` en `src/`, ajeno a esta feature: ningún archivo tocado
menciona `hero.data`); pasó aislado (7/7) y en las dos corridas completas
siguientes (504/504) y en el `./init.sh` final.

## Ajuste colateral justificado (precedente REQ-43-06)

`tests/related-posts-list.test.mjs` (REQ-21-01/04) iteraba `post.related`
con el href crudo como texto; tras la feature la vista itera `relatedLinks`
(`resolveRelatedTitles(posts, post.related)`) y el texto es el título. Se
actualizaron esas dos aserciones con la justificación en la cabecera del
test. Los destinos `/posts/[id]` no cambian; REQ-21-02/03/05/06/07 y todos
los tests de la feature 19 siguen en verde sin cambios.

## Archivos tocados

- `src/domain/related-titles.ts` (nuevo, REQ-23-01/02)
- `src/pages/posts/[id].astro` (73/100: import + prop + títulos)
- `src/styles/post-next.css` (91/100: botón y lista al design system)
- `tests/related-titles-design-align.test.mjs` (nuevo, REQ-23-01..07)
- `tests/related-posts-list.test.mjs` (REQ-21-01/04 al título + justificación)
- `feature_list.json` (23 → `in_progress`), `progress/current.md`

## Pendiente (fuera de scope)

- El `status: done` lo marca el cierre tras `progress/review_23.md` con
  veredicto `APPROVED` (verificado en disco).
