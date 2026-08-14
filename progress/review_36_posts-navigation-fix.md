# Review — feature 36 `posts-navigation-fix`

> Fecha: 2026-08-14. Reviewer: agente revisor (nivel 1).
> Spec: `specs/36_posts-navigation-fix/requirements.md` (REQ-36-01..08) + `design.md`.
> Informe del implementer: `progress/impl_36_posts-navigation-fix.md`.

## Resumen

La petición del humano («las navegaciones a los detalles del content no
funcionan») queda resuelta: las cards de la portada ahora enlazan a
`/posts/${post.id}` con el id real, la entidad `Post` expone `id` y `slug`
readonly, el repositorio los entrega (id desde `entry.id`, slug desde
`data.slug`, `PostsDataError` sin slug), `[id].astro` empareja por id con un
`Map` (sin `posts[index]`) y lanza error nombrado, los pares `transition:name`
casan card↔detalle y el enlace se estila con tokens (hover/focus incluidos).

**Veredicto: APPROVED** — sin cambios requeridos.

## Evidencias

1. **Tests de la feature** (4 archivos autorizados):
   `node --test tests/posts-repository.test.mjs tests/latest-articles-restore.test.mjs tests/article-card-images.test.mjs tests/view-transitions.test.mjs`
   → **37 tests, 37 pass, 0 fail** (verificado en disco).
2. **Suite completa**: `node --test "tests/**/*.test.mjs"` → **207 tests,
   207 pass, 0 fail** (verificado en disco).
3. **`./init.sh`** → «✔ El entorno está perfecto. Podemos empezar a trabajar»
   (formato ✔, tests ✔, build ✔; verificado en disco).
4. **Build real (`dist/client/`)**: `href="/posts/00-agilismo"` y
   `href="/posts/01-diseño-detallado"` en `index.html`; pares de transición
   coherentes por artículo — `transition-new(img-00-agilismo)` +
   `transition-new(title-00-agilismo)` en la card y en
   `dist/client/posts/00-agilismo/index.html` (ídem para
   `01-diseño-detallado`). Antes: `img-undefined`/`title-undefined` y cero
   enlaces.
5. **Ciclo TDD** (`progress/impl_36_posts-navigation-fix.md`): ROJO
   documentado con comando exacto y 4 fail cuyas causas coinciden una a una
   con los diffs verificados (REQ-07-01 sin `readonly id`, REQ-07-02 deepEqual
   sin id/slug, REQ-36-03 sin `PostsDataError`, REQ-20-06 sin enlace). VERDE
   documentado y reproducido (37/37 y 207/207).
6. **Tests autorizados**: `git diff --name-only` — los únicos archivos de
   test tocados por esta feature son `tests/posts-repository.test.mjs`
   (fixture: `slug` en REAL_ENTRY, `id`/`slug` en EXPECTED_POST, bucle REQ-07-01
   con id/slug, test nuevo REQ-36-03) y `tests/latest-articles-restore.test.mjs`
   (REQ-20-06 pasa de «ausencia» a «presencia» del enlace, con cabecera que
   documenta la transitoriedad revocada). Exactamente lo que autoriza la
   descripción de la feature en `feature_list.json`. El resto del diff
   (`htb-stadistics.astro`, `htb-profile-repository.ts`,
   `ssr-cloudflare-align.test.mjs`) pertenece a features 33-35 ya aprobadas.
7. **`feature_list.json`**: feature 36 en `status: "in_progress"`,
   `depends_on: []` (sin dependencias pendientes).

## Comprobación requisito por requisito

| REQ | Verificación en código | Estado |
|---|---|---|
| REQ-36-01 | `src/domain/entities/post.ts:10-11` — `readonly id: string;` y `readonly slug: string;` en `interface Post` (20 líneas ≤100). | ✔ |
| REQ-36-02 | `src/domain/repositories/posts-repository.ts:43-49` — `id` de `(entry).id` (con guard de texto, líneas 44-46) y `slug: expectString(data, 'slug', index)`. Test REQ-07-02 pasa con `EXPECTED_POST` incluyendo id/slug. | ✔ |
| REQ-36-03 | `expectString` (posts-repository.ts:72-79) lanza `PostsDataError` si `data.slug` no es texto; test REQ-36-03 (entrada sin slug → `assert.rejects(..., PostsDataError)`) en verde. | ✔ |
| REQ-36-04 | `src/components/latest-articles.astro:13` — `<a class="latest-articles__link" href={`/posts/${post.id}`}>` envuelve `<img>` (clase, `alt={post.title}`, `loading="lazy"`, líneas 14-20) y `<h2>` (línea 21); meta/descripción/tags fuera del enlace (Decisión 1 del design.md). REQ-20-06/05, REQ-17-01/06/07 en verde. | ✔ |
| REQ-36-05 | `src/pages/posts/[id].astro:15-17` — `Map(posts.map(p => [p.id, p]))` y `postById.get(entry.id)`; ambas fuentes son la colección architecture (repo vía `getCollection('architecture')` y `getCollection("architecture")`). Sin `posts[index]` (grep confirmado). | ✔ |
| REQ-36-06 | `[id].astro:10-14` lanza `PostsDataError` si colección y repositorio no coinciden en número; líneas 18-20 lanzan `PostsDataError` nombrado si no existe post con ese id. | ✔ |
| REQ-36-07 | Cards: `transition:name={`img-${post.id}`}` / `title-${post.id}`; detalle: `title-${entry.id}` / `img-${entry.id}` (líneas 38/40). Como `post` se resuelve por `postById.get(entry.id)`, los ids coinciden por artículo. REQ-24-03/05 en verde y evidencia en build (pares `img-00-agilismo`/`title-00-agilismo` idénticos card↔detalle). | ✔ |
| REQ-36-08 | `src/styles/latest-articles.css:82-90` — `.latest-articles__link:hover .latest-articles__title` / `:focus-visible` con `var(--color-accent-hover)` y anillo `outline: 2px solid var(--color-accent)`; hover de card con `var(--shadow-card-hover)`. 0 hex / 0 rgb/rgba en la hoja (verificado por script); todos los tokens existen en `tokens.css`. | ✔ |

## Convenciones

- **Sin `<style>` en .astro**: ni `latest-articles.astro` ni `[id].astro`
  tienen bloque `<style>` ni atributo `style=` (grep confirmado).
- **Sin lógica de negocio en componentes**: frontmatter de
  `latest-articles.astro` solo importa la hoja y obtiene datos con
  `new PostsRepository().getPosts()`; sin `function`/`if`/`for`. El
  `getStaticPaths` de `[id].astro` es el patrón de rutas aceptado por
  REQ-24-05 (tests lo exigen).
- **≤100 líneas** (verificado en disco): post.ts 20, posts-repository.ts 97,
  [id].astro 46, latest-articles.astro 33, latest-articles.css 96.
- **Tokens**: todos los valores de color/radio/sombra de
  `latest-articles.css` vía `var(--...)`; sin valores sueltos.
- **Errores nombrados**: `PostsDataError` en repositorio y página (sin fallos
  silenciosos).
- **Sin debug**: sin `console.*`, `debugger` ni TODOs en los archivos tocados.
- **Dependencias**: ninguna añadida (sin cambios en package.json).

## Checkpoints

- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` con `<style>`.
- C2: [x] Sin lógica JS en la UI; frontmatter solo importa y pasa datos.
- C3: [x] Ningún componente lee JSON directamente (vía PostsRepository).
- C4: [x] Colores/espaciados/radios/sombras solo desde `tokens.css`.
- C5: [x] Ningún archivo supera las 100 líneas.
- C6: [x] Sin dependencias externas añadidas.
- C7: [x] Datos válidos (sin cambios en `src/data/`).
- C8: [x] Repositorios validan con errores nombrados (`PostsDataError`).
- C9: [x] `./init.sh` en verde (entorno, formato, tests 207/207, build).
- C10: [ ] ← Razón: inspección visual en navegador (pendiente global de
  CHECKPOINTS.md, fuera del scope de esta feature; no verificada por el
  reviewer — igual que en reviews previas).
- C11: [ ] ← Razón: feature 36 sigue `in_progress`; el líder la marca `done`
  tras este APPROVED (patrón del ciclo, igual que features 33-35).
- C12: [x] `progress/current.md` documenta la sesión; historial al día.
- C13: [x] Sin archivos temporales, `print()` de debug ni TODOs.

## Veredicto

`Veredicto: APPROVED`
