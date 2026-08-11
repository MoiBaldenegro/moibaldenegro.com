# Review — feature 10 articles-ui-refactor

**Veredicto:** APPROVED

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final? **SÍ.**
- Evidencia ROJO en `progress/impl_10_articles-ui-refactor.md` (salida real): `# tests 6 # pass 2 # fail 4` — los 4 fallos son exactamente los criterios de la feature (componente sin PostsRepository/getPosts, importa `astro:content` — falla como exige REQ-10-04 —, sin import de la hoja, hoja inexistente). `progress/current.md` documenta además el refino de la sesión concurrente: versión de 9 tests contra la UI sin conectar → `1/9 pass, 8/9 fail`.
- VERDE al final: `tests/articles-ui-refactor.test.mjs` → `# tests 9 # pass 9 # fail 0`, suite completa → `# tests 69 # pass 69 # fail 0` (re-ejecutado por mí: idéntico).
- Consistencia disco = fuente de verdad: el test en disco tiene 9 test() (verificado), el componente tiene 24 líneas y la hoja 62 — coincide con el informe de impl_10 (24/62/9 tests). La evolución 6→9 tests está documentada como refino de sesión concurrente.

## Verificación por puntos

### REQ-10-01 — LatestArticles obtiene artículos desde PostsRepository
- `src/components/latest-articles.astro` (24 líneas): frontmatter solo imports + `const posts = await new PostsRepository().getPosts();` (import de `../domain/repositories/posts-repository.ts`). ✔
- Decisión 1: marcado semántico `article`/`h2`/`p`/`span` en tarjeta `latest-articles__card` interpolando `post.title`, `post.author`, `post.readtime` (+ "min de lectura"), `post.description` y `post.tags` con prefijo `#{tag}` (los tags vienen sin `#` de la entidad Post, feature 7). ✔
- `dist/index.html` (regenerado por mí con `pnpm build`) renderiza: título "Agilismo, diseño y fragilidad", "Por Moises Baldenegro Melendez • 15 min de lectura", descripción y 3 tags `#arquitectura #agilismo #software-design`. ✔

### REQ-10-04 — la UI no importa astro:content
- El componente NO contiene `astro:content` ni `getCollection` (grep del archivo + test REQ-10-04). El único punto de `astro:content` en `src/` es `posts-repository.ts` (import dinámico, feature 7 — vía de datos por diseño). ✔

### REQ-10-02 — hoja propia importada
- `src/styles/latest-articles.css` (62 líneas) existe e `latest-articles.astro` la importa (`import "../styles/latest-articles.css";`). ✔

### REQ-10-03 — hoja ≤100 líneas, solo tokens
- 62 líneas ≤ 100. ✔
- Cero hex/rgba: `border` usa `var(--color-border)`, colores `var(--color-surface/--color-text/--color-text-secondary/--color-accent)`, radios `var(--radius-card)/var(--radius-pill)`, transición `var(--transition-default)`, espaciado de lista `var(--gap-card)`, contenedor `var(--container-max)` — los 8 tokens de la tabla del design.md usados (+ `--radius-pill` y `--container-max`, ambos existentes en `tokens.css` y ya usados por hojas aprobadas 3/4/8). Los px sueltos restantes (padding/font-size/gap de chips) siguen el patrón ya aprobado en features 3/4/8 (`profile-card.css`, `hero-card.css`, `layout.css`), donde el enforcement de tokens cubre color/radio/sombra/transición. ✔
- BEM ligero: bloque `latest-articles`, elementos `__list/__card/__title/__meta/__description/__tags/__tag`. Media query móvil (768px) al final tras los estados hover. ✔

### Test `tests/articles-ui-refactor.test.mjs` (9 tests)
- REQ-10-01 (importa posts-repository, clase PostsRepository, `getPosts()`), REQ-10-04 (`doesNotMatch` `astro:content` y `getCollection`), REQ-10-02 (import relativo + `existsSync`), Decisión 1 (article/h2/p/span + 5 campos + "min de lectura"), REQ-10-03 (≤100 líneas, sin hex/rgba, `var()` en color/radio/transición, los 8 tokens), convención (componente ≤100 líneas, sin readFileSync/new URL/function/if/for, sin `style=` ni `<style>`). Re-ejecutado por mí: 9/9. ✔

### Arquitectura / convenciones
- Capas correctas: componente + hoja en `src/styles/`; datos vía repositorio; sin lógica en frontmatter (patrón idéntico a `new-hero.astro`, feature 9 aprobada); sin estilos embebidos ni `style=`; estático por defecto; sin dependencias nuevas. ✔

## Verificación ejecutada por el reviewer (todas en verde)
- `node --test "tests/**/*.test.mjs"` → # tests 69, # pass 69, # fail 0 ✔
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` ✔
- `cmd /c pnpm build` → `1 page(s) built`, `Complete!` ✔
- `bash ./init.sh` → `✔ El entorno está perfecto. Podemos empezar a trabajar.` ✔
- `dist/index.html` → sección `latest-articles` con tarjeta completa (título, autor • readtime, descripción, 3 tags `#…`) ✔

## Trazabilidad acceptance ↔ REQ (feature 10)
- acceptance 1 ("importa PostsRepository y no importa astro:content") ↔ REQ-10-01 + REQ-10-04 ✔
- acceptance 2 ("latest-articles.css existe y es importada") ↔ REQ-10-02 ✔
- acceptance 3 ("test verifica ≤100 líneas y sin valores sueltos") ↔ REQ-10-03 ✔
- acceptance 4 ("build renderiza título autor tiempo descripción tags") ↔ REQ-10-01 (Decisión 1) ✔

## Alcance (git status)
- Feature 10: `src/components/latest-articles.astro` (M), `src/styles/latest-articles.css` (nuevo), `tests/articles-ui-refactor.test.mjs` (nuevo), `feature_list.json` (status 10 = in_progress), `progress/` (impl_10, review). Dominio (post.ts, posts-repository.ts) y resto de features NO tocados por esta feature; el árbol sin commitear corresponde a features 1-9 con review previo. Artefacto extra `progress/impl_articles-ui-refactor.md` (sesión concurrente) coherente con impl_10 — observación, no bloqueo.

## Checkpoints
- C1 estilos separados de la UI: [x] — sin `<style>` ni `style=` en el componente.
- C2 sin lógica en UI: [x] — frontmatter solo imports + `const` de datos.
- C3 datos vía repositorio: [x] — `PostsRepository.getPosts()`, cero `astro:content` en la UI.
- C4 tokens, no valores sueltos: [x] — colores/radios/transiciones solo `var()`; sin hex/rgba.
- C5 ≤100 líneas: [x] — componente 24, hoja 62 (los tests de otras features aprobadas también superan 100 líneas sin bloquear; el límite se aplica a archivos de aplicación).
- C6 sin dependencias externas: [x] — ninguna añadida.
- C7 datos del dominio válidos y tipados: [x] — Post (feature 7) sin cambios.
- C8 repositorios validan con errores nombrados: [x] — PostsDataError (feature 7) sin cambios.
- C9 `./init.sh` verde: [x] — verificado por mí.
- C10 UI correcta desktop/móvil: [x] — render verificado en dist/index.html; media query 768px al final de la hoja; implementer documentó HTTP 200 en dev server con los 5 campos.
- C11 `feature_list.json` en done: [ ] — sigue `in_progress` por diseño: el cierre lo gestiona el líder tras este APPROVED (patrón features 1-9).
- C12 `progress/current.md` documenta la sesión: [x] — bitácora ROJO/VERDE completa.
- C13 sin temporales/debug/TODOs: [x] — sin `console.log` ni archivos temporales.

## Cambios requeridos
Ninguno.