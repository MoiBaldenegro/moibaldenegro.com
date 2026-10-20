# Análisis — feature 102 latest-posts-tests-from-content

Fecha: 2026-10-19. Autor: spec_author. Spec: `specs/102_latest-posts-tests-from-content/requirements.md` (sin design.md: no toca UI).

## Problema

El humano autorizó ajustar sus posts y el orquestador lo hizo (cambios sin commitear, no se tocan):

- `src/content/posts/systems-design/00-systems-design-template.md`: img `arch00.webp`, tags `#diseno-de-sistemas #arquitectura #software-design`, created «16 Octubre 2026».
- `src/content/posts/systems-design/00-spring-api.md`: sin h1 duplicado, tags `#diseno-de-sistemas #spring #java #software-design` (slug `00-spring-boot`, created «16 Septiembre 2026»).

Con eso el post más reciente es `/posts/00-systems-design-template` y la portada pinta, correctamente,
`00-systems-design-template, 05-diseno-arquitectonico-vs-diseno-detallado, 04-ciclo-de-vida-y-arquitectura`.
Varios tests fijan a mano los 3 slugs esperados y quedan en rojo: son frágiles al contenido. No hay bug en src/:
`PostsRepository.getPosts()` (byCreatedDesc con parseSpanishDate) + `latestPosts()` hacen lo esperado.

## Fallos actuales (node --test "tests/**/*.test.mjs", 2026-10-19): 1051 tests, 1047 pass, 4 fail

| Test | Archivo:línea | Causa |
|------|---------------|-------|
| REQ-95-06/07/12 | tests/home-latest-articles-five.test.mjs:46 (const NEWEST en :20, aserción :52) | slugs fijados a mano |
| REQ-30-13 | tests/home-latest-articles-limit.test.mjs:288 (REAL_SLUGS_BY_NEWEST.slice(0, 3) en :300) | slugs fijados a mano |
| REQ-96-04/05 | tests/latest-cards-gsap-motion.test.mjs:30 (lista literal en :33) | slugs fijados a mano |
| REQ-93-04/21/22 | tests/system-design-nav-link.test.mjs:74 (:76-77) | guarda de alcance por `git diff HEAD --name-only -- src/content/posts`: falla porque los 2 posts están modificados sin commitear. No depende del orden de posts: se pone verde al commitear los posts. FUERA de alcance de la 102 (decisión del líder: commitear los posts o pedir una feature aparte para relajar la guarda). |

## Revisados y sin cambio (verdes, no frágiles al orden)

- REQ-33-05 (tests/broken-resources-fix.test.mjs:42): ya deriva del contenido (recorre todos los .md y comprueba que su img existe). Estaba en rojo por design00.webp; con arch00.webp pasa. Correcto tal cual.
- REQ-33-04 (broken-resources-fix:36): fija arch00.webp del post SOLID a propósito (post concreto, no «el más reciente»).
- REQ-39-01 (tests/single-h1-headings.test.mjs): ya deriva del contenido (ningún post con h1); verde tras quitar el h1 de 00-spring-api. REQ-39-02 fija 7 posts concretos a propósito.
- REQ-30-01/02 (home-latest-articles-limit:159/170): usan REAL_SLUGS_BY_NEWEST/REAL_CREATED como fixture inyectado al repositorio (no leen el contenido): no fallan. El comentario de :73-74 («Los 8 artículos reales… verificados en el frontmatter») ya es falso (hay 10 posts): se aclara como fixture (REQ-102-09), sin tocar aserciones.
- Resto de tests con slugs/imágenes concretas (anchor-nunca-url, article-json-ld, ascii-post-slugs, csp-router-inline-script, geist-font-build, legacy-redirects, next-*, not-found-page, posts-repository, posts-unified-collection, related-*, root-term-search, search-*, seo-head-base, single-h1-headings, sitemap-robots-endpoints, social-meta-tags, term-search-oldest-first): apuntan a un post concreto por diseño o usan fixtures; no dependen de qué post es el más reciente.

## Solución propuesta

1. Helper `tests/helpers/latest-real-posts.mjs` (no es *.test.mjs, no lo ejecuta el glob; precedente tests/helpers/astro-build.mjs):
   lee el frontmatter (slug, created, img) de `src/content/posts/**/*.md`, construye entradas `{ data }`, las pasa a
   `new PostsRepository(async () => entries).getPosts()` (mismo byCreatedDesc del dominio) y aplica `latestPosts(posts, limit)`.
   Raíz de contenido parametrizable para poder testear con fixtures en os.tmpdir().
2. Empates: el orden del loader glob de Astro no es determinable desde el test; si dos de los `limit + 1` primeros
   comparten created, el helper lanza un error que nombra los posts empatados (diagnóstico explícito, no un falso verde).
3. Los 3 tests en rojo comparan contra el helper con `LATEST_POSTS_LIMIT` importado del dominio; conservan la cuenta de
   cards = 3, el orden exacto, transition-scope = 6 y footer = 3, y añaden que lo derivado tiene 3 elementos. Nota
   «Ajuste feature 102 (precedente REQ-43-06)» en cada línea ajustada; se conservan las notas «Ajuste feature 96» (las exige REQ-96-39/40/42).
4. Test-first: `tests/latest-real-posts.test.mjs` (fixtures en tmpdir: orden desc, corte, no mutación de entradas, empate) en rojo
   antes de crear el helper.

## Riesgos y trabas

- tests/latest-cards-gsap-motion.test.mjs está en 100 líneas y se auto-verifica <= 100 (REQ-96-39/40/42): el ajuste debe ser neto 0 líneas.
- Las features 93 y 100 (APPROVED) no se pueden cerrar con REQ-93-04/21/22 en rojo: depende de commitear los posts (acción humana/orquestador), no de esta feature.
- Sin cambios en src/; sin dependencias.

## Ampliación 2026-10-19 (decisión del líder): guarda REQ-93-04/21/22 en alcance

- Motivo: la guarda de tests/system-design-nav-link.test.mjs usaba `git diff HEAD --name-only -- src/content/posts` y caía con los posts del humano sin commitear (dependía del árbol de trabajo). El líder decide incluirla en la 102 (implementación ya hecha por el implementer, ver progress/impl_latest-posts-tests-from-content.md, «Guarda REQ-93-04/21/22»).
- Comprobado: el commit 268e9ad («feature 94 y 93») toca en src/content/posts solo `architecture/05-diseno-arquitectonico-vs-diseno-detallado.md`, con exactamente `-tags: "#arquitectura #software-design #software-architecture"` / `+tags: "… #diseno-de-sistemas"`. La intención de la guarda (la 93 solo añadió el tag al post 05) se conserva y se vuelve determinista.
- Spec: nuevo REQ-102-12 (guarda sobre `git diff 268e9ad^ 268e9ad`, sin `git diff HEAD` ni árbol de trabajo) y acceptance 7. REQ-102-11 amplía el alcance a tests/system-design-nav-link.test.mjs y exige `./init.sh` con código 0; REQ-102-10 exige el test nuevo en verde dentro de la suite. El acceptance REQ-102-10/11 deja de aceptar REQ-93-04/21/22 en rojo: suite completa en verde (0 fail).
- La fila de REQ-93-04/21/22 «FUERA de alcance» de la tabla de fallos queda superada por esta ampliación. El riesgo de no poder cerrar la 93/100 por esa guarda desaparece.
