# Informe de implementación — Feature 21 `related-posts-list`

> Lista de recomendados en la página de detalle del post. Una sola feature
> por sesión (feature 21); sin subagentes. Informe escrito en disco antes de
> devolver el control (regla anti-silencio).

## Dependencias verificadas

- Feature 19 `next-post-button` en `done` (botón Siguiente artículo).
- Feature 20 `related-posts-data` en `done` (entidad `Post.related`,
  repositorio, curaduría del último artículo).
- Feature 21 pasada a `in_progress` en `feature_list.json`.
- Análisis base: `progress/research/recommended-list.md` (D4 convivencia,
  D6 presentación extendiendo `post-next.css`); spec
  `specs/21_related-posts-list/requirements.md` (REQ-21-01..07) y `design.md`.

## Plan ejecutado

- Verificar 19 y 20 en done.
- Tests PRIMERO en rojo contra la spec.
- Implementar sección Recomendados + estilos hasta `./init.sh` verde.
- Informe con evidencia rojo/verde (este archivo).

## Ciclo rojo (test-first, sin código de la feature)

Test nuevo: `tests/related-posts-list.test.mjs` (8 tests: REQ-21-01..07 +
convención). Ejecutado contra `[id].astro` y `post-next.css` sin modificar:

```
not ok 1 - REQ-21-01: el detalle muestra una lista de enlaces con el encabezado Recomendados hacia related
not ok 2 - REQ-21-02: el detalle omite la lista cuando related es nulo
not ok 3 - REQ-21-03: el detalle muestra el botón de siguiente junto a la lista cuando hay next y related
not ok 4 - REQ-21-04: los destinos salen solo de la entidad Post vía PostsRepository
not ok 5 - REQ-21-05: post-next.css estila la lista solo con tokens de tokens.css
not ok 6 - REQ-21-06: la lista va a ancho completo en 768 píxeles o menos
ok 7 - REQ-21-07: la página y post-next.css no superan las 100 líneas
ok 8 - Convención: la página importa post-next.css sin <style> ni JS y post.css queda intacto
# tests 8, # pass 2, # fail 6
```

6/8 en fallo: la lista no existía; solo pasan el límite de líneas y la
convención (estado heredado de la feature 19). Ningún código de la feature
se escribió antes de este rojo.

## Implementación (scope estricto del acceptance)

- `src/pages/posts/[id].astro` (60 → 72 líneas): sección
  `<section class="post__related">` con `<h2>Recomendados</h2>` y `<ul>` que
  itera `post.related.map(...)` con `href={href}`; render condicionado a
  `{post.related && (...)}` (REQ-21-01/02); convive con el pie `post__next`
  (REQ-21-03, ambos condicionados por separado); destinos solo desde la
  entidad `Post` vía `PostsRepository`, sin leer la colección
  (REQ-21-04); sin `<style>`, sin `style=`, sin `<script>` (cero JS).
- `src/styles/post-next.css` (36 → 71 líneas): reglas `.post__related`,
  `.post__related-title`, `.post__related-list`, `.post__related-link`
  (+`:hover`) solo con tokens existentes (`--gap-card`, `--color-text`,
  `--color-accent`, `--color-accent-hover`, `--transition-default`), sin hex
  ni rgb()/rgba() (REQ-21-05); la media `@media (max-width: 768px)`
  existente cubre `.post__related-link` con `width: 100%` (REQ-21-06).
- `post.css` no se toca (100 líneas intactas, D2 del design); sin tokens
  nuevos; sin dependencias.

## Ciclo verde (evidencia)

Feature + regresión del botón (feature 19):

```
ok 1..7 (next-post-button REQ-19-01..06 + convención)
ok 8..15 (related-posts-list REQ-21-01..07 + convención)
# tests 15, # pass 15, # fail 0
```

Suite completa del arnés `./init.sh` (segunda ejecución, EXIT:0):

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)   [pnpm test directo: 488/488]
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Nota: la primera ejecución de `./init.sh` tras implementar marcó el bloque
de tests en rojo de forma transitoria; el re-lanzamiento inmediato quedó en
verde total y `pnpm test` directo confirmó 488/488 sin cambios intermedios.
Sin refactor adicional: el verde se dejó intacto.

## Estado final

- `feature_list.json`: feature 21 en `in_progress` (el `done` lo marca el
  líder tras el `APPROVED` del reviewer en `progress/review_21.md`).
- Archivos tocados: `tests/related-posts-list.test.mjs` (nuevo),
  `src/pages/posts/[id].astro`, `src/styles/post-next.css`,
  `progress/current.md`, `progress/impl_21.md` (este informe).
- Pendiente del reviewer externo (lo lanza el líder).
