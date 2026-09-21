# Review — feature 28

**Veredicto:** APPROVED

## Checkpoints
- Arquitectura: estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x] (verificado: `src/components/latest-articles.astro` 34 líneas y `src/pages/index.astro` 36 líneas sin `<style>`; la feature no tocó CSS)
- Arquitectura: sin lógica JS en UI, frontmatter solo importa y pasa datos: [x] (`latest-articles.astro:6` solo `await new PostsRepository().getPosts()` + `.slice(0, 3)`, sin sort/reverse ni `getCollection`)
- Arquitectura: ningún componente lee JSON directamente, todo vía repositorio: [x] (usa `PostsRepository.getPosts()`, cuyo orden `byCreatedDesc` verificado en `src/domain/repositories/posts-repository.ts:29,36`)
- Arquitectura: tokens de `src/styles/tokens.css`, sin hardcode: [x] (la feature no tocó ninguna hoja de estilos; `latest-articles.css` conserva tokens `var(--...)` preexistentes)
- Arquitectura: ningún archivo supera 100 líneas: [x] (`package.json` 31, `docs/dependencies.md` 49, `latest-articles.astro` 34, `index.astro` 36)
- Arquitectura: sin dependencias externas sin discusión: [x] (`gsap@^3.15.0` en `dependencies` de `package.json:19` + entrada `### gsap` en `docs/dependencies.md:44-49` con version `^3.15.0` y scope `dependencies` idénticos, más `approved` y `motivo` con autorización humana solo para `src/pages/index.astro`)
- Datos: JSON válido/entidades y repositorios con errores nombrados: [x] (repositorio intacto, no tocado — 100/100 sin margen, declarado en `progress/impl_28.md`)
- Verificación: `./init.sh` en verde: [x] (ejecutado en revisión: entorno, formato, tests 100% —incl. `tests/gsap-setup-recent-limit.test.mjs` 5/5—, build OK)
- Verificación: página correcta en desktop/móvil sin errores de consola: [ ]  ← Razón: pendiente inspección visual en navegador (preexistente en `CHECKPOINTS.md`, fuera del alcance de esta feature sin `design.md` ni cambios visuales)
- Harness: `feature_list.json` con la tarea en `done`: [ ]  ← Razón: la feature 28 sigue en `in_progress` hasta este APPROVED; el `done` lo marca el líder/implementer al cerrar (ninguna feature eliminada del array, verificado ids 1-29 presentes)
- Harness: `progress/current.md` documenta la sesión y `history.md` al día: [x]
- Harness: sin temporales, debug ni TODOs: [x]

## Pregunta de revisión
- ¿Test antes del código y en rojo, suite en verde al final? Sí. `progress/impl_28.md` documenta rojo previo (`not ok` 1-3, `ok` 4-5) y verde posterior (5/5); el verde previo de REQ-28-04/05 está declarado como esperado (lógica pura de `slice` y archivos aún sin modificar). Suite final en verde verificada en disco (`node --test` 5/5 + `./init.sh` verde).
- ¿Dependencias `depends_on` todas en `done`? Sí. La feature 28 declara `depends_on: []`, sin bloqueo.

## Cambios requeridos (si aplica)
Ninguno. Nota de alcance: la selección `.slice(0, 3)` vive en `src/components/latest-articles.astro:6` (compuesto por `src/pages/index.astro:29` vía `<LatestArticles/>`), no literalmente en `index.astro`; cumple REQ-28-03 ("La portada") y la decisión D6 (selección en presentación, repositorio 100/100 intacto).
