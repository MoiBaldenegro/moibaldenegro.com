# Review — feature 102 (latest-posts-tests-from-content)

**Veredicto:** APPROVED

Fecha: 2026-10-19. Revisor: reviewer (nivel 1). Spec: `specs/102_latest-posts-tests-from-content/requirements.md` (REQ-102-01..12).
Informe: `progress/impl_latest-posts-tests-from-content.md`. Análisis: `progress/research/latest-posts-tests-from-content.md`.

## Checkpoints
- C1 Arquitectura (sin `<style>` en .astro, lógica fuera de UI, repositorios, tokens): [x]. La feature no toca `src/`; el helper reutiliza el dominio (`PostsRepository.getPosts()` + `latestPosts()` + `parseSpanishDate`) en vez de duplicar el orden.
- C2 ≤100 líneas: [x] en los archivos nuevos (helper 40, test 54) y en `tests/latest-cards-gsap-motion.test.mjs` (100, REQ-102-11). Observación: `tests/home-latest-articles-limit.test.mjs` (331 -> 335) y `tests/system-design-nav-link.test.mjs` (128 -> 134) ya superaban las 100 líneas antes de la feature; ninguno de los dos entra en el límite de REQ-102-11. No bloquea.
- C3 Sin dependencias externas: [x] (solo `node:test` y la stdlib de Node; REQ-102-10).
- C4 Test-first: [x]. El informe documenta Rojo 1 (test nuevo 0/4 sin el helper), Rojo 2 (los 4 tests afectados en rojo) y Verde (4/4, 46/46, suite 1055/1055).
- C5 `./init.sh`: [x] exit 0 (formato, tests al 100 %, build). `pnpm test`: tests 1055, pass 1055, fail 0, cancelled 0, skipped 0.
- C6 Dependencias: [x]. La 102 no tiene `depends_on`.
- C7 Alcance (REQ-102-11): [x]. El diff de la feature se limita al helper, el test nuevo, los tres tests ajustados, `tests/system-design-nav-link.test.mjs`, `feature_list.json` y `progress/`. No toca `src/`, el contenido de los posts, `public/assets/svg/sprite.svg` ni `tests/hack-the-box-sprite.test.mjs` (todos ajenos, del humano).
- C8 Inspección visual: [ ]. No aplica: la feature no toca UI.

## Verificación por requisito
- REQ-102-01/02: `tests/helpers/latest-real-posts.mjs:30-40` acepta `limit` y `root` y lee recursivamente `**/*.md`, igual que el loader de `src/content.config.ts` (`pattern: "**/*.md"`). Con el contenido real devuelve `00-systems-design-template, 05-diseno-arquitectonico-vs-diseno-detallado, 04-ciclo-de-vida-y-arquitectura` (comprobado).
- REQ-102-03: `latest-real-posts.mjs:34-38` revisa los `limit + 1` primeros. Mutación en el scratchpad (copia de `src/content/posts` con `00-systems-design-template` en `created: "28 Septiembre 2026"`): lanza `created empatado (28 Septiembre 2026) entre 05-diseno-arquitectonico-vs-diseno-detallado, 00-systems-design-template`. Los tests `tests/latest-real-posts.test.mjs:81-94` cubren el empate dentro y fuera de la ventana.
- REQ-102-04/05/06/07: `home-latest-articles-five.test.mjs:47-57`, `home-latest-articles-limit.test.mjs:290-307` y `latest-cards-gsap-motion.test.mjs:30-36` comparan con `deepEqual` contra `newest`, conservan 3 cards, 6 `data-astro-transition-scope` y 3 `site-footer__post`, y añaden `newest.length === 3`. Ya no queda ninguna lista literal (sale `NEWEST`, sale `REAL_SLUGS_BY_NEWEST.slice` en REQ-30-13 y sale el array inline).
- REQ-102-08: todas las líneas ajustadas llevan «Ajuste feature 102 (precedente REQ-43-06)». Las notas de la 96 se conservan (en `home-latest-articles-five.test.mjs:21` la nota de la 96 sigue en la línea del comentario que sustituye a `NEWEST`). REQ-96-39/40/42 en verde.
- REQ-102-09: el comentario de `home-latest-articles-limit.test.mjs:74-76` lo describe como fixture de la feature 30. Las aserciones de REQ-30-01/02 no cambian.
- REQ-102-12: `system-design-nav-link.test.mjs:74-85` usa `git diff 268e9ad^ 268e9ad` y no usa `git diff HEAD` ni el árbol de trabajo. La línea 127 sigue con `git diff HEAD` sobre tokens.css/package.json, que el acceptance deja fuera de forma explícita. Comprobado a mano: el commit solo toca el post 05 y su `-U0` es exactamente `-tags: "…"` / `+tags: "… #diseno-de-sistemas"` (el `trimEnd` absorbe el espacio final). La guarda pasa con los posts del humano sin commitear y se salta si el commit no existe. Mantiene la intención original: `names === POST` es ahora una igualdad estricta, más fuerte que el antiguo `'' || POST`.

## Pruebas de mutación (árbol restaurado; `git diff` con el mismo sha1 antes y después, `latest-articles.astro` OK por sha1)
1. Orden: `src/components/latest-articles.astro:9` con `.reverse()`. REQ-95-06/07/12, REQ-30-13 y REQ-96-04/05 en rojo (0 pass / 3 fail).
2. Límite: `latestPosts(..., 4)` en el componente. Los 3 tests en rojo («no hay 3 cards», «la portada pinta 4 cards en vez de 3 (REQ-30-13)», deepEqual).
3. Empate: ver REQ-102-03 (el helper lanza un error que nombra los dos slugs).

Limitación conocida, no bloquea: una mutación en `byCreatedDesc` afecta a la vez al helper y al build, así que los tests del build no la detectarían por sí solos. La cubren los tests con fixtures de `tests/latest-real-posts.test.mjs:67-73`, que fijan el orden esperado a mano.

## Observaciones no bloqueantes
1. El informe `progress/impl_latest-posts-tests-from-content.md` sigue citando «REQ-102-01..11» y su sección «Para el reviewer» trata la guarda de la 93 como fuera de spec. La ampliación REQ-102-12 y el acceptance 7 ya la cubren. Conviene actualizarlo al cerrar.
2. En `tests/latest-cards-gsap-motion.test.mjs:9` hay dos `import` en una línea y en la `:32` se unen `build`/`html`/`section` para quedar en 100 líneas. Es legible y no rompe convenciones, pero el archivo ya no tiene margen.

## Cambios requeridos
Ninguno.
