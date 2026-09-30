# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- **30 `home-latest-articles-limit`** — «En la pagina principal queremos que se
  muestren solo los 3 articulos mas recientes».
  Inicio: 2026-09-30, rol `implementer`.
  `status` en `feature_list.json` se deja tal cual (`pending`): el líder lo
  cambia a `done` tras el `APPROVED` del reviewer.

### Plan

- Escribir PRIMERO `tests/home-latest-articles-limit.test.mjs` contra
  `specs/30_home-latest-articles-limit/requirements.md` (unitarios de
  `latestPosts`, integración con las 8 entradas reales por el constructor de
  `PostsRepository`, inspección del componente y de `latest-articles.css`, y
  verificación end-to-end sobre el build real con `spawnSync`, precedente
  `tests/about-page.test.mjs:212-236`).
- Observar el test en ROJO (el módulo `src/domain/latest-posts.ts` aún no
  existe) y capturar la salida real.
- Implementar `src/domain/latest-posts.ts` (`latestPosts(posts, limit = 3)`:
  sin reordenar, sin mutar, `[]` si el límite no es entero positivo) y cambiar
  una línea del frontmatter de `src/components/latest-articles.astro`
  (`latestPosts(await new PostsRepository().getPosts())`).
- Dejar la suite y `./init.sh` en verde, sin tocar `latest-articles.css`, ni
  `posts-repository.ts`, ni ningún test existente.
- Informe en `progress/impl_30.md`.

### Bitácora

- 2026-09-30 (implementer): `./init.sh` en verde al arrancar (entorno
  perfecto). Estado inicial verificado: `latest-articles.astro` (34 líneas) pinta
  `posts.map(...)` sobre la colección completa de `getPosts()`; con los 8
  artículos reales eso son 8 cards en `dist/client/index.html`.
- Decisiones heredadas del `spec_author` (no rediseñadas): recorte en un módulo
  de dominio nuevo `src/domain/latest-posts.ts`; orden heredado del comparador
  canónico `byCreatedDesc` del repositorio sobre `created` (sin reordenar);
  `latest-articles.css` intacto (97 líneas, rejilla de una columna);
  `posts-repository.ts` intacto (100/100 líneas).
- **Ciclo rojo capturado**: `node --test tests/home-latest-articles-limit.test.mjs`
  → `ERR_MODULE_NOT_FOUND` de `src/domain/latest-posts.ts` (`# fail 1`). Salida
  literal en el informe.
- **Implementado**: `src/domain/latest-posts.ts` (21 líneas: `latestPosts(posts,
  limit = LATEST_POSTS_LIMIT)` con `Number.isInteger`/`> 0` → `[]` y `slice`, sin
  reordenar ni mutar) y una línea del frontmatter de `latest-articles.astro`
  (`latestPosts(await new PostsRepository().getPosts())`). El marcado no cambia.
- **Verificado en el build real**: `dist/client/index.html` emite 3 cards con
  `/posts/05-diseno-arquitectonico-vs-diseno-detallado`,
  `/posts/02-ciclo-de-vida-y-arquitectura` y `/posts/01-procesos-memoria`.
- **Verde**: test de la feature 13/13; los 5 tests de inspección de
  `latest-articles.astro` 48/48 sin tocar una aserción; `pnpm test` 562/562;
  `./init.sh` en verde al 100%.
- `feature_list.json` **no se ha tocado** (la feature 30 conserva `pending`); el
  líder la marca `done` tras el `APPROVED` del reviewer.
- Informe completo (evidencias roja/verde, desviaciones y trazabilidad REQ↔test)
  en `progress/impl_30.md`.