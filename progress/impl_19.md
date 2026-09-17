# Informe de implementación — Feature 19 next-post-button

> Botón "Siguiente artículo" en la página de detalle del post.
> Spec: `specs/19_next-post-button/requirements.md` + `design.md`.
> Base: feature 18 `next-post-data` (verificada en `done` antes de empezar).

## Cambio

- `src/pages/posts/[id].astro` (54 → 60 líneas): importa
  `../../styles/post-next.css` y renderiza bajo el contenido un pie de
  navegación `{post.next && (<footer class="post__next"><a
  class="post__next-link" href={post.next}>Siguiente artículo</a></footer>)}`.
  El destino sale solo de la entidad `Post` entregada por `PostsRepository`
  (`getStaticPaths` ya la resolvía; `getCollection` solo empareja
  `entry.id` ↔ `post.id`, sin leer `next` de la colección). Enlace estático
  prerendered, cero JS.
- `src/styles/post-next.css` (nueva, 35 líneas): scoping `.post__next`,
  fondo `var(--color-accent)` + hover `var(--color-accent-hover)`, texto
  `var(--color-surface)`, radio `var(--radius-card)`, espaciado
  `var(--gap-card)`, transición `var(--transition-default)`; media
  `(max-width: 768px)` con el enlace a `width: 100%`. `post.css` intacto
  (100 líneas, al límite).
- `tests/next-post-button.test.mjs` (nuevo, 7 tests): REQ-19-01..06 +
  convención (import sin `<style>`/`<script>`, `post.css` en 100 líneas).

## Evidencia rojo → verde

Rojo (tests escritos antes del código, página y CSS aún sin tocar):

```
# tests 7
# pass 0
# fail 7
```

`src/styles/post-next.css no existe (REQ-19-04)` y
`la página no muestra el texto Siguiente artículo (REQ-19-01)` entre otros.

Verde tras implementar (`node --test tests/next-post-button.test.mjs`):

```
# tests 7
# pass 7
# fail 0
```

Suite completa `./init.sh`: entorno ✔, formato ✔, tests al 100% ✔,
build de producción ✔ — "El entorno está perfecto."

## Estado

- `feature_list.json`: feature 19 en `in_progress` (el cierre a `done`
  espera el `APPROVED` de `progress/review_19.md`).
- Sin bloqueos; alcance limitado al `acceptance` de la feature 19.
