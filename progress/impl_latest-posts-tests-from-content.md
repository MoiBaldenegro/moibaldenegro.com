# Informe de implementación — feature 102 latest-posts-tests-from-content

Fecha: 2026-10-19. Autor: implementer. Spec: `specs/102_latest-posts-tests-from-content/requirements.md` (REQ-102-01..11, sin design.md).
Análisis: `progress/research/latest-posts-tests-from-content.md`. Estado en `feature_list.json`: `in_progress` (pendiente de reviewer).

## Archivos

| Archivo | Cambio |
|---------|--------|
| `tests/latest-real-posts.test.mjs` (nuevo, 54 líneas) | REQ-102-01..03 con fixtures en `os.tmpdir()` (mkdtempSync, limpieza en `after`), solo node:test + stdlib (REQ-102-10). |
| `tests/helpers/latest-real-posts.mjs` (nuevo, 40 líneas) | `latestRealPostIds(limit = LATEST_POSTS_LIMIT, root = src/content/posts/)` (async): lee slug y created del frontmatter de cada `.md` (recursivo), los pasa a `new PostsRepository(async () => entries).getPosts()` y a `latestPosts()`; error que nombra los slugs si dos de los `limit + 1` primeros comparten created (comparando `parseSpanishDate`). |
| `tests/home-latest-articles-five.test.mjs` | REQ-95-06/07/12: sale `NEWEST`; el test pasa a async y compara con `latestRealPostIds(LATEST_POSTS_LIMIT)` (del módulo de dominio) + `newest.length === 3`. Se conservan cards = 3, transition-scope = 6, footer = 3 y las notas de la 96. |
| `tests/home-latest-articles-limit.test.mjs` | REQ-30-13: compara con `latestRealPostIds(LATEST_POSTS_LIMIT)` en vez de `REAL_SLUGS_BY_NEWEST.slice(0, 3)` + `newest.length === 3`. Comentario de `REAL_SLUGS_BY_NEWEST` reescrito como fixture de la feature 30 (REQ-102-09); REQ-30-01/02 sin cambios. |
| `tests/latest-cards-gsap-motion.test.mjs` | REQ-96-04/05: igual que los anteriores; neto 0 líneas (sigue en 100: import del helper en la línea 9 y `build`/`html` unidos en una línea). |
| `tests/system-design-nav-link.test.mjs` | REQ-93-04/21/22: guarda reescrita (decisión del líder, ver abajo). |

Todas las líneas ajustadas llevan «Ajuste feature 102 (precedente REQ-43-06)»; las notas «Ajuste feature 96 (precedente REQ-43-06)» se conservan (REQ-96-39/40/42 verde). Sin cambios en `src/` ni en el contenido de los posts. No se tocaron `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md` ni `tests/hack-the-box-sprite.test.mjs`.

## Guarda REQ-93-04/21/22 (decisión del líder, fuera de la spec)

Antes: `git diff HEAD --name-only -- src/content/posts` debía estar vacío o ser solo el post 05; dependía del árbol de trabajo del humano y caía con sus posts sin commitear.

Elegido: comprobar el **commit que cerró la 93** (`268e9ad`, que el humano commiteó junto a la 94; ver `progress/history.md`). La intención («la 93 solo añadió el tag al post 05») se mantiene íntegra y se vuelve determinista:
- en el contenido actual el post 05 conserva `#diseno-de-sistemas` y `/diseno-de-sistemas` (con y sin barra) responde 200 (sin cambio);
- `git diff --name-only 268e9ad^ 268e9ad -- src/content/posts` es exactamente el post 05;
- `git diff -U0 268e9ad^ 268e9ad -- <post 05>` tiene exactamente 2 líneas (`-tags: "…"` y `+tags: "… #diseno-de-sistemas"`), siendo la nueva la vieja + el tag.
- skip si no hay `.git` (como antes) o si el commit no existe (clon superficial).

Descartado: comparar el post 05 actual con `268e9ad` (falla si el humano edita después su propio post, mismo problema de fondo) y acotar `git diff HEAD` al post 05 (seguiría dependiendo del árbol de trabajo).

**Para el reviewer:** REQ-102-11 limita los cambios a los tres tests ajustados + helper + test nuevo, y la spec deja REQ-93-04/21/22 fuera de alcance; este cambio en `tests/system-design-nav-link.test.mjs` lo pidió el líder explícitamente. Si se considera que exige ampliar la spec (p. ej. un REQ-102-12 y su acceptance; el acceptance REQ-102-10/11 dice además «la suite completa solo conserva en rojo REQ-93-04/21/22», que ya no aplica: la suite queda al 100 %), lo debe valorar spec_author.

## Ciclo rojo / verde

### Rojo 1 — test nuevo antes del helper (`node --test tests/latest-real-posts.test.mjs`)

```
✖ REQ-102-01/02: con 4 posts desordenados devuelve los 3 de created más reciente en orden descendente
✖ REQ-102-01: sin raíz lee src/content/posts y con LATEST_POSTS_LIMIT por defecto devuelve 3 ids
✖ REQ-102-03: un empate de created en los limit + 1 primeros lanza un error con los slugs empatados
✖ REQ-102-03: un empate fuera de los limit + 1 primeros no lanza
ℹ tests 4  ℹ pass 0  ℹ fail 4
(AssertionError: falta tests/helpers/latest-real-posts.mjs (REQ-102-01))
```

### Rojo 2 — los cuatro tests afectados antes de ajustarlos

`node --test tests/home-latest-articles-five.test.mjs tests/home-latest-articles-limit.test.mjs tests/latest-cards-gsap-motion.test.mjs tests/system-design-nav-link.test.mjs`

```
✖ REQ-30-13: el build real de la portada emite exactamente tres cards con los tres más recientes (ajuste feature 96)
✖ REQ-93-04/21/22: el artículo 05 lleva el tag, la ruta responde 200 y solo cambia el tag
✖ REQ-95-06/07/12: build con 3 cards (ajuste feature 96) (transition:name) y footer con 3
✖ REQ-96-04/05: build real con 3 cards (transition:name) y footer con 3
ℹ tests 42  ℹ pass 38  ℹ fail 4
```

### Verde — tras el helper y los ajustes

- `node --test tests/latest-real-posts.test.mjs`: tests 4, pass 4, fail 0.
- Los 5 archivos afectados juntos: tests 46, pass 46, fail 0, skipped 0.
- Helper con el contenido real: `['00-systems-design-template', '05-diseno-arquitectonico-vs-diseno-detallado', '04-ciclo-de-vida-y-arquitectura']` (sin empates en los 4 primeros).
- Líneas: `tests/latest-cards-gsap-motion.test.mjs` 100, `tests/home-latest-articles-five.test.mjs` 74, test nuevo 54, helper 40.

### Suite final

`pnpm test`: `ℹ tests 1055 · pass 1055 · fail 0 · cancelled 0 · skipped 0`.

`./init.sh` (exit 0):

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```
