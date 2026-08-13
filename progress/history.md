# Bitácora de sesiones

> Append-only. Al cerrar una sesión, mueve el resumen de `progress/current.md`
> al final de este archivo y deja `current.md` solo con la plantilla.
---

## Sesión 2026-08-10 — Refactor completo del sitio

# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso (implementer, feature 13 project-readme)

- **Feature en curso:** 13 — project-readme (in_progress en feature_list.json)
- **Plan:**
  - Leer spec specs/13_project-readme/requirements.md (REQ-13-01..05) + docs (architecture/conventions/verification) + estado real en disco (package.json, src/, public/, scripts/, tests/, templates/).
  - Escribir PRIMERO tests/project-readme.test.mjs (ROJO) contra REQ-13-01..05: propósito (13-01), carpetas reales (13-02), comandos pnpm dev/build/preview/test + ./init.sh (13-03), enlaces a los 3 docs del arnés (13-04), cero frases del starter kit (13-05, lista justificada en el informe).
  - Ejecutar el test y capturar el ROJO (README actual es el del starter).
  - Reescribir README.md (propósito real, estructura real, comandos, enlaces al arnés; sin starter kit). Restricción del harness: README.md lo escanea harness-kit-integrity (REQ-01-05) y prohíbe el token "hero" → documentar la estructura sin listar nombres de archivo que lo contengan.
  - VERDE: node --test "tests/**/*.test.mjs", node scripts/check-format.mjs, pnpm build, ./init.sh (Git Bash). Informe en progress/impl_13_project-readme.md.

### Feature en curso (implementer, feature 11 about-page)

- **Feature en curso:** 11 — about-page (in_progress en feature_list.json)
- **Plan:**
  - Leer spec specs/11_about-page/requirements.md (REQ-11-01..05) + design.md + docs/architecture.md + docs/conventions.md + estado actual (Layout.astro con prop title y enlace /about; HeroProfileRepository/HeroProfile/hero.json de las features 5 y 8).
  - Escribir PRIMERO tests/about-page.test.mjs (ROJO) contra REQ-11-01..05: página existe (11-01), usa layout único con title="About — moibaldenegro.com" (11-02/Decisión 2), obtiene name/username/description vía HeroProfileRepository.getProfile() sin leer de src/data ni lógica (11-03), importa about.css ≤100 líneas sin hex/rgba y con los 8 tokens del design.md (11-04), y dist/ genera la ruta /about tras el build (11-05, verificación post-build cuando dist/ existe).
  - Ejecutar el test y capturar el ROJO (about.astro no existe; dist no contiene /about).
  - Implementar: src/pages/about.astro (frontmatter solo imports + const profile = new HeroProfileRepository().getProfile(); marcado semántico BEM about__* con name/username/description reales del perfil) y src/styles/about.css (BEM ligero, solo tokens: --color-background, --color-text, --color-text-secondary, --color-border, --color-surface, --radius-card, --gap-card, --container-max; media query al final).
  - VERDE: node --test "tests/**/*.test.mjs", node scripts/check-format.mjs, pnpm build (verificar dist/about.html o dist/about/index.html), ./init.sh (Git Bash). Informe en progress/impl_11_about-page.md.

### Feature en curso (implementer, feature 12 cleanup-dead-code)

- **Feature en curso:** 12 — cleanup-dead-code (in_progress en feature_list.json)
- **Plan:**
  - Verificar en disco el estado: src/config.ts, src/application/* vacíos, context.md en entities/repositories/services, Welcome.astro, src/ui vacía; grep previo de referencias en src/ y tests/.
  - Escribir PRIMERO tests/cleanup-dead-code.test.mjs (ROJO) contra REQ-12-01..06: no existen config.ts, application/, context.md (entities|repositories|services), Welcome.astro ni src/ui; scripts/audit-design-tokens.mjs existe y termina exit 0 sobre src/styles; además el guardián FALLA (exit ≠ 0) ante una hoja temporal con hex suelto.
  - Ejecutar el test y capturar el ROJO (los archivos todavía existen).
  - Implementar: borrar los archivos/carpetas listados (con verificación grep posterior), crear scripts/audit-design-tokens.mjs (Node stdlib, ≤100 líneas, prefijo audit-).
  - VERDE: node --test "tests/**/*.test.mjs", node scripts/check-format.mjs, pnpm build, ./init.sh (Git Bash). Informe en progress/impl_12_cleanup-dead-code.md.

### Plan (líder)

- Verificar entorno con ./init.sh → 3 fallos de harness: sin feature_list.json, sin script test en package.json, sin templates/ ni .claude/agents/ (exigidos por tests/harness-kit-integrity.test.mjs).
- Lanzar 1 spec_author para analizar el estado del proyecto contra la documentación y descomponer el refactor en features (creando feature_list.json desde cero + specs EARS).
- Implementar feature a feature (implementer → reviewer) hasta cerrar el refactor y dejar ./init.sh en verde.

### Observaciones

- Estado del backlog: features 1-11 CERRADAS (APPROVED verificado en disco; status done en feature_list.json). Feature 12 cleanup-dead-code CERRADA (review_12 con Veredicto APPROVED verificado en disco; status done en feature_list.json). Siguiente pendiente: feature 13 project-readme.

### Bitácora

- 2026-08-10 (implementer, feature 13, cierre): CERRADA — progress/review_13_project-readme.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 13 en feature_list.json: done (cambiado de in_progress). node scripts/check-format.mjs en verde tras el cambio. **El backlog completo del refactor (features 1-13) está cerrado.**

### Bitácora

- 2026-08-10 (implementer, feature 13): Feature 13 project-readme marcada in_progress. Leída spec REQ-13-01..05 + docs (architecture/conventions/verification) + estado real en disco: package.json (pnpm dev/build/preview/test, node --test "tests/**/*.test.mjs"), src/pages (index, about), src/layouts (Layout.astro), src/components (new-hero/, hero-card, latest-articles), src/domain (entities ×3, repositories ×3), src/data (hero.json, hero-cards.json), src/content (architecture/00-agilismo.md) + src/content.config.ts, src/styles (tokens.css + 6 hojas), public/ (favicons + assets/svg), scripts/ (5), tests/ (12), specs/, progress/, templates/. Restricción detectada: harness-kit-integrity (REQ-01-05) escanea README.md (archivo del kit) y prohíbe el token "hero" → el README documenta las carpetas reales sin listar nombres de archivo que contengan ese token (las tarjetas se describen como "tarjetas de tecnologías").
- 2026-08-10 (implementer, feature 13): ROJO capturado — node --test tests/project-readme.test.mjs → 6/6 fail (0 pass): REQ-13-01 sin propósito real, REQ-13-02 sin carpetas reales, REQ-13-03 sin pnpm test, REQ-13-04 sin enlaces, REQ-13-05 README del starter. Escrito PRIMERO tests/project-readme.test.mjs (93 líneas, 6 tests, 16 frases prohibidas del starter justificadas).
- 2026-08-10 (implementer, feature 13): Implementado — README.md reescrito: propósito real (sitio personal de Moisés Baldenegro: portada con perfil y tecnologías, artículos de arquitectura de software, /about), árbol de carpetas real con rutas completas, tabla de comandos (pnpm dev/build/preview/test + ./init.sh), enlaces a los 3 docs del arnés, cero referencias al starter. Corrección intermedia: el árbol inicial usaba nombres relativos (pages/ bajo src/) y el acceptance exige las rutas completas (src/pages...) → rutas completas en el árbol.
- 2026-08-10 (implementer, feature 13): VERDE — test feature 13/13 6/6 ✔, suite completa 93/93 ✔ (87 previos + 6 nuevos), node scripts/check-format.mjs ✔ ("FORMATO ✔"), pnpm.cmd build ✔ (2 page(s) built, exit 0), ./init.sh (Git Bash) → "El entorno está perfecto" ✔ (exit 0, 10/10 comprobaciones). Informe: progress/impl_13_project-readme.md. Pendiente: reviewer (lo lanza el líder). Feature 13 NO marcada done.

### Bitácora

- 2026-08-10 (implementer, feature 12, cierre): CERRADA — progress/review_12_cleanup-dead-code.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco; checkpoints C10/C11 no bloqueantes, por diseño del flujo). Status de feature 12 en feature_list.json: done (cambiado de in_progress). node scripts/check-format.mjs en verde tras el cambio. Features 1-12 cerradas; siguiente pendiente: feature 13 project-readme.

### Bitácora

- 2026-08-10 (implementer, feature 12): Leída spec REQ-12-01..07 + docs (architecture/conventions/verification; regla del arnés: scripts/<slug>.mjs, prefijo `audit-`, Node stdlib, ≤100 líneas, nunca importados de la app). Verificado estado en disco: src/config.ts, src/application (2 archivos de 0 bytes), context.md en entities/repositories/services, Welcome.astro, src/ui vacía. Grep previo: ninguna referencia en src/ ni tests/ a los archivos muertos (única coincidencia: comentario textual sobre src/content.config.ts, archivo vivo que NO se toca). Todos los hex/rgba sueltos están SOLO en tokens.css (las 6 hojas de componentes están limpias). Feature 12 marcada in_progress.
- 2026-08-10 (implementer, feature 12): ROJO capturado — node --test tests/cleanup-dead-code.test.mjs → 7/7 fail (0 pass): REQ-12-01..05 archivos/carpetas todavía existentes, REQ-12-06 script inexistente. Escrito PRIMERO tests/cleanup-dead-code.test.mjs (93 líneas, 7 tests). Nota: el test 7 (guardián cae ante hoja temporal) se endureció con existsSync sobre el script para evitar falso positivo en rojo (spawnSync devuelve status null si el script no existe).
- 2026-08-10 (implementer, feature 12): Implementado — borrados src/config.ts, src/application/, src/entities/ (context.md + carpeta), src/repositories/ (context.md + carpeta), src/services/ (context.md + carpeta), src/components/Welcome.astro y src/ui/ (Test-Path False en los 7). Creado scripts/audit-design-tokens.mjs (31 líneas, stdlib fs/path/url, excluye tokens.css, regex #[0-9a-fA-F]{3,8}\b|rgba?\(, exit 1 con TOKENS ✘ o AUDIT ✔ exit 0). Audit manual: "AUDIT ✔ ningún color fuera de tokens.css en src/styles" exit 0. Grep posterior: sin referencias a lo eliminado.
- 2026-08-10 (implementer, feature 12): VERDE — test feature 12/12... 7/7 ✔, suite completa 87/87 ✔ (80 previos + 7 nuevos), node scripts/check-format.mjs ✔, pnpm.cmd build ✔ (2 page(s) built, exit 0), ./init.sh (bash) → "El entorno está perfecto" ✔ (exit 0). Informe: progress/impl_12_cleanup-dead-code.md. Pendiente: reviewer (lo lanza el líder). Feature 12 NO marcada done.
- 2026-08-10 (implementer, feature 11): Leída spec REQ-11-01..05 + design.md (Decisiones 1-3, tokens de la tabla) + docs/architecture.md + conventions.md + verification.md + contexto: Layout.astro (32 líneas, prop title, navbar /about), hero-profile.ts (entidad readonly), hero-profile-repository.ts (getProfile + HeroProfileDataError), hero.json (perfil real), astro.config (sin build.format → ruta /about = dist/about.html o dist/about/index.html, se confirmará en el build), init.sh (orden: check-format → tests → build → dist solo existe tras build). Feature 11 marcada in_progress.
- 2026-08-10 (implementer, feature 11): ROJO capturado — node --test tests/about-page.test.mjs → 11/11 fail (0 pass): REQ-11-01 página inexistente, REQ-11-02/11-03 sin layout ni repositorio (página no existe), REQ-11-04 hoja inexistente ×5, REQ-11-05 dist sin ruta /about (dist/ de builds previos presente en disco), convención sin página. Escrito PRIMERO tests/about-page.test.mjs (12 checks: página + layout title="About — moibaldenegro.com" + HeroProfileRepository.getProfile() + profile.name/username/description + import about.css + ≤100 líneas + sin hex/rgba + var() en color/radio + 8 tokens del design.md + ruta en dist/ post-build + convenciones).
- 2026-08-10 (implementer, feature 11): Implementado — src/pages/about.astro (17 líneas: imports estilo→dominio, const profile = new HeroProfileRepository().getProfile(), <Layout title="About — moibaldenegro.com"> con main.about > section.about__profile > h1/p/p interpolando profile.name/username/description) y src/styles/about.css (43 líneas, BEM ligero, SOLO tokens: --container-max, --color-background, --color-surface, --color-border, --radius-card, --gap-card, --color-text, --color-text-secondary; media query móvil al final).
- 2026-08-10 (implementer, feature 11): VERDE — test feature 11/11 ✔, suite completa 80/80 ✔, node scripts/check-format.mjs ✔, pnpm build ✔ ("2 page(s) built": /about/index.html + /index.html — formato directory por defecto de Astro sin build.format), ruta /about verificada en dist/about/index.html (título "About — moibaldenegro.com" con U+2014 confirmado, lang="es", navbar con enlace /about, name "Moisés Baldenegro Melendez", username @moibaldenegro y description reales, CSS de about en el bundle), ./init.sh (Git Bash) → "El entorno está perfecto" ✔. Informe: progress/impl_11_about-page.md. Pendiente: reviewer (lo lanza el líder).
- 2026-08-10 (implementer, feature 11, cierre): CERRADA — progress/review_11_about-page.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco; el revisor notó solo imprecisiones de documentación no bloqueantes en impl_11_about-page.md, sin necesidad de tocar el test). Status de feature 11 en feature_list.json: done (confirmado en disco). node scripts/check-format.mjs en verde tras el cambio. Features 1-11 cerradas; siguiente pendiente: feature 12 cleanup-dead-code.

### Bitácora

- 2026-08-11 (implementer, feature 14, cierre): CERRADA — progress/review_14_game-of-life-engine.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco; el revisor re-verificó de forma independiente: 104/104 suite, 15/15 aserciones funcionales propias, check-format y ./init.sh en verde; solo notó una imprecisión no bloqueante de líneas del test en impl_14, sin cambios requeridos). Status de feature 14 en feature_list.json: done (cambiado de in_progress). node scripts/check-format.mjs en verde tras el cambio. Resumen del ciclo: test escrito PRIMERO (tests/game-of-life-engine.test.mjs, 11 tests contra REQ-14-01..09) → ROJO ERR_MODULE_NOT_FOUND (0 pass/1 fail) → src/utils/game-of-life.ts (70 líneas: createGrid, randomizeGrid con densidad, stepGrid con las 4 reglas de Conway, envolvente toroidal, inmutabilidad, GameOfLifeError) → VERDE 11/11 → suite completa 104/104 → ./init.sh "El entorno está perfecto". Único fallo intermedio corregido era del test (blinker 3x3 no oscila en toroidal → 5x5 centrado), motor intacto. Base lista para la feature 15 game-of-life-background (pending, la lanzará el líder aparte).

### Bitácora

- 2026-08-12 (implementer, feature 18, cierre): CERRADA — progress/review_18_posts-domain-restore.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 18 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen del ciclo: restauración del dominio de artículos tras modificaciones manuales (post.ts VACÍO + markdownPostRepository() sin validar) → ROJO: test del contrato tests/posts-repository.test.mjs crashea (SyntaxError "does not provide an export named 'PostsRepository'", 0 pass/1 fail; suite completa 113 pass/10 fail) → restaurados desde el estado canónico git ae2597b: src/domain/entities/post.ts (15 líneas, interface Post con 8 campos readonly, REQ-18-01) y src/domain/repositories/posts-repository.ts (90 líneas, clase PostsRepository con loader inyectable default = dynamic import astro:content + getCollection('architecture'), validación campo a campo con PostsDataError, markdownPostRepository eliminada — grep 0 ocurrencias, REQ-18-02..05; ≤100 líneas, REQ-18-06) → VERDE: test del contrato 8/8 pass; suite completa 121 pass/9 fail con residuales SOLO de features 19/20/21/23. Hallazgo documentado para el líder: src/pages/posts/[id].astro (commit manual del usuario 72e5c52) importa markdownPostRepository → build en ROJO ([MISSING_EXPORT]) hasta canalizar esa página (f. 20/24 o limpieza); el research D4 ("no hay src/pages/posts/") era incorrecto. Siguiente pendiente: feature 19 json-repositories-restore.

### Bitácora

- 2026-08-12 (implementer, feature 17, cierre): CERRADA — progress/review_17_article-card-images.md sección "Ronda 2 (2026-08-12)" con Veredicto APPROVED y sin cambios adicionales (verificado en disco; re-review independiente tras la feature 20). Status de feature 17 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen del ciclo: la feature 17 (imagen de card consistente: clase latest-articles__image + alt={post.title} + loading="lazy" + regla CSS con tokens) quedó originalmente en CHANGES_REQUESTED (ronda 1, 2026-08-11) porque la reescritura manual del usuario de latest-articles.astro deshizo su trabajo en disco; la feature 20 (APPROVED) restauró el componente al contrato features 10+17 y resolvió los 3 cambios requeridos (img con clase/alt/loading en disco, card de vuelta a <article> sin enlace muerto /posts, informes actualizados con el estado real). Ronda 2 re-verificada en disco: tests/article-card-images.test.mjs 11/11 pass (REQ-17-01..09, contrato + convenciones), latest-articles.css 75 líneas intacta (REQ-17-02..08), tokens.css 96 líneas sin tokens nuevos (REQ-17-09), componente 30 líneas sin lógica ni estilos embebidos. Los rojos de ./init.sh son exclusivamente ajenos (features 21/23 pendientes + src/pages/posts/[id].astro canalizada aparte). Siguiente pendiente: feature 21 ssr-cloudflare-align (sin deps).

### Bitácora

- 2026-08-12 (implementer, feature 20, cierre): CERRADA — progress/review_20_latest-articles-restore.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 20 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen del ciclo: restauración de src/components/latest-articles.astro al contrato features 10+17 tras la reescritura manual (post.data.*, sin alt/lazy, sin spans, enlace muerto a /posts/${id} y transition:name sin amparo) → ROJO: contrato existente 15 pass/5 fail (REQ-17-01/06/07 + REQ-10-01 ×2) y test nuevo tests/latest-articles-restore.test.mjs (REQ-20-01..07; REQ-20-06 sin /posts ni transition:name no estaba cubierto) 3 pass/5 fail → componente restaurado al estado canónico (29 líneas: new PostsRepository().getPosts(), marcado article/h2/p/span con post.title/author/readtime/description/tags + "min de lectura", img con clase latest-articles__image + post.img + alt={post.title} + loading="lazy", sin anchor ni transition:name; latest-articles.css 75 líneas intacta) → VERDE: 28/28 en los 3 archivos de contrato; suite completa 150 pass/2 fail con residuales SOLO de features 21 (REQ-11-05) y 23 (REQ-01-05); formato ✔ y audit de tokens ✔. Build en ROJO por src/pages/posts/[id].astro importando markdownPostRepository (hallazgo canalizado aparte, NO causa de la 20). Efecto sobre la feature 17 (in_progress): tests/article-card-images.test.mjs (REQ-17-01..09) de vuelta en verde, habilitando su cierre con re-review; impl_17 y current.md actualizados con el estado real (apartado "Cierre tras feature 20 (re-review)"). Siguiente pendiente: feature 21 ssr-cloudflare-align (sin deps).

### Bitácora

- 2026-08-12 (implementer, feature 19, cierre): CERRADA — progress/review_19_json-repositories-restore.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 19 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen del ciclo: restauración de los repositorios JSON tras la migración manual a imports ?raw sin atributo (constructor con string incrustado, firma divergente del contrato) → ROJO: tests del contrato tests/hero-profile-repository.test.mjs y tests/hero-cards-repository.test.mjs crashean (TypeError ERR_IMPORT_ATTRIBUTE_MISSING en Node v22.22.2, 0 pass/2 fail; suite completa 121 pass/9 fail) → restaurados desde el estado canónico git ae2597b a lectura node:fs: src/domain/repositories/hero-profile-repository.ts (83 líneas: readFileSync + constructor dataUrl: URL con default pathToFileURL(join(process.cwd(), 'src', 'data', 'hero.json')), HeroProfileDataError, REQ-19-01/02/05/06) y src/domain/repositories/hero-cards-repository.ts (93 líneas: mismo patrón con hero-cards.json, HeroCardsDataError, REQ-19-03/04/05/06); imports ?raw eliminados (grep 0 ocurrencias en src/) → VERDE: tests del contrato 16/16 pass; suite completa 137 pass/7 fail con residuales SOLO de features 20 (REQ-10-01 ×2 + REQ-17-01/06/07), 21 (REQ-11-05) y 23 (REQ-01-05). Consumidores (new-hero.astro, about.astro) satisfechos sin cambios; node:fs solo en build (páginas prerender). Build en ROJO por src/pages/posts/[id].astro importando markdownPostRepository (hallazgo canalizado aparte, NO causa de la 19). Siguiente pendiente: feature 20 latest-articles-restore (depende de 18).

## Sesión 2026-08-12 — Verificación del harness + refactorización completa post-modificaciones manuales

**Petición:** "Hicimos algunas modificaciones manuales en todo el proyecto y en el flujo de los agentes; debería estar bien, pero haz una verificación completa del harness y después una refactorización completa del proyecto."

**Veredicto inicial del líder:** init.sh EN ROJO — 10 tests fallando (113 pass/10 fail). Causas: `post.ts` vacío + `posts-repository.ts` reescrito sin validación (crashes), repos JSON con imports `?raw` sin `type: json` (ERR_IMPORT_ATTRIBUTE_MISSING ×2), `latest-articles.astro` reescrito con `post.data.*` (5 fail de features 10/17), proyecto migrado a SSR+Cloudflare que rompió REQ-11-05 (dist/client), fuga de tokens prohibidos "og-image"/"hero" en docs del kit, y hallazgo `src/pages/posts/[id].astro` (usuario, commit `72e5c52`) importando `markdownPostRepository` → build roto todo el ciclo.

**Features resueltas (spec_author → implementer TDD → reviewer n1):**
- 18 `posts-domain-restore` — entidad Post (15 líneas) + clase `PostsRepository` con loader inyectable y validación (90 líneas). APPROVED.
- 19 `json-repositories-restore` — repos `node:fs` con URL inyectable desde canónico `ae2597b`, sin `?raw`. 16/16. APPROVED.
- 17 `article-card-images` (re-review ronda 2) — CHANGES_REQUESTED previo resuelto por la feature 20; cerrada con APPROVED ronda 2.
- 20 `latest-articles-restore` — componente con `PostsRepository`, article/h2/p/span (5 campos), img con clase/`alt={post.title}`/`loading="lazy"`, sin enlace muerto ni transitions. 28/28. APPROVED.
- 21 `ssr-cloudflare-align` — decisión de mantener SSR+adapter Cloudflare (excepción regla 2 documentada), REQ-11-05 adaptado a `dist/client/about/index.html`, `.wrangler/` destrackeado. 7/7. APPROVED.
- 22 `htb-stadistics-section` — dominio HTB (entidad + repositorio con error nombrado), componente sin lógica, CSS con tokens, **0 console.* con secretos**. 22/22. APPROVED.
- 23 `harness-docs-alignment` — 3 fugas "og-image" + token "hero" en docs + referencia a test inexistente alineadas a la realidad. Kit 7/7. APPROVED.
- 24 `view-transitions` — `[id].astro` adaptado a `PostsRepository` (desbloqueó build), `ClientRouter` canalizado con spec; ronda 2 (fix `<main>`→`<section>`). APPROVED ronda 2.

**Cierre:** suite 190/190 (100%), build OK, `./init.sh` → "El entorno está perfecto". Backlog 0 pendientes, 0 in_progress, features 1-24 done conservadas en el array.

**Decisiones pendientes del líder (documentadas, sin abrir):** (a) posible re-review de features 19/21 por el fix de adapter (`nodejs_compat` + `prerenderEnvironment: 'node'`) añadido por el implementer para que el build pase — el reviewer de la 24 lo dejó en pie; (b) clases `post__image`/`post__title` sin hoja `post.css` en `[id].astro` (posible feature futura); (c) fondo GOL desactivado en Layout.astro (comentado, decisión consultada: dejarlo desactivado).

## Sesión 2026-08-13 — Feature 25 `game-of-life-removal` (eliminación del fondo GOL)

**Petición:** decisión definitiva del usuario (2026-08-12): el fondo del Juego de la Vida se ELIMINA del proyecto (no se desactiva).

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/game-of-life-removal.test.mjs` (8 tests, REQ-25-01..07) → ROJO 8/8 fail (archivos GOL existentes, tokens presentes, layout/docs con referencias) → VERDE 8/8 pass tras la eliminación.
- Eliminados (8 + directorio): `GameOfLifeBackground.astro`, `game-of-life.ts`, `game-of-life-canvas.ts`, `gol-render.ts`, `game-of-life.css`, `game-of-life-engine.test.mjs`, `game-of-life-background.test.mjs`, `gol-performance.test.mjs` y `src/utils/` (vacía).
- Modificados (5): `Layout.astro` (37→35, sin import ni comentario GOL), `tokens.css` (96→87, fuera `--opacity-gol`/`--size-gol-cell`/`--opacity-hero`), `hero-section.css` (58→51, comentarios muertos limpios, `.hero-background` intacto), `docs/architecture.md` (ejemplos líneas 15/56 con `LatestArticles`/`HtbStadistics`, sin token 'hero' del kit), `tests/article-card-images.test.mjs` (REQ-17-09: conteo 96→87; cambio juzgado AUTORIZADO por la review — la spec 25 prevé el efecto colateral, semántica "sin tokens nuevos" conservada).
- Verificación final: grep de cadenas GOL 0 en `src/` (en `tests/` solo el test 25), suite 158/158, harness-kit 7/7, `check-format` ✔, build OK (rutas `/about`, `/posts/00-agilismo`, `/posts/01-diseño-detallado`, `/`), `./init.sh` → "El entorno está perfecto".
- **Reviewer:** `progress/review_25_game-of-life-removal.md` con Veredicto **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos; nota no bloqueante sobre condición de carrera del reviewer en build paralelo, descartada).
- **Cierre:** status de feature 25 en `feature_list.json`: `done` (conservada en el array; features 14-16 permanecen `done` como historial inamovible — la 25 revocó su código por decisión de usuario). `check-format` en verde tras el cambio. Siguiente pendiente: feature 26 `post-page-styles`.

## Sesión 2026-08-13 — Feature 26 `post-page-styles` (hoja `post.css` para `/posts/[id]`)

**Petición:** el reviewer de la feature 24 detectó que `src/pages/posts/[id].astro`
renderiza las clases `post__title`/`post__image`/`post__meta` sin ninguna hoja
CSS (`post.css` no existía) — canalizado como feature por el spec_author
(`specs/26_post-page-styles/`, REQ-26-01..08 + design.md Decisiones 1-5).

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/post-page-styles.test.mjs` (12 tests, patrón
  `about-page`/`article-card-images`) → ROJO 2/11 pass / 9 fail (post.css
  ausente + página sin import) → VERDE 11/11 tras la implementación.
- Creada `src/styles/post.css` (99 líneas, BEM `.post__*`, solo tokens):
  contenedor `.post`, `.post__title`, `.post__meta`, `.post__image` (width
  100%, aspect-ratio 16/9, cover, `var(--radius-card)` + `var(--color-border)`
  + `var(--gap-card)`, display block — precedente REQ-17-02..05) y tipografía
  del markdown del `<Content />` con scoping bajo `.post__content`
  (h2/h3, p, ul/ol/li, a con `--color-accent`/hover, code/pre con
  `--color-surface`); consume los 10 tokens de la tabla del design.md; sin
  hex/rgba.
- `[id].astro` (38 → 39 líneas): único cambio `import "../../styles/post.css";`
  (incidencia resuelta en el ciclo: la ruta inicial `../` rompía el build —
  detectado por REQ-11-05 dentro de la suite; corregida a `../../` desde
  `src/pages/posts/`).
- Sin cambios en: `tokens.css` (87 líneas, REQ-26-07 — el "96" del acceptance
  era pre-feature 25), `layout.css`, `Layout.astro`, `latest-articles.astro`
  (enlace a `/posts` FUERA de alcance, REQ-20-06).
- Verificación final: suite 169/169, build OK (CSS inlined en las rutas
  `/posts/00-agilismo` y `/posts/01-diseño-detallado`), `check-format` ✔,
  `./init.sh` → "El entorno está perfecto".
- **Reviewer:** `progress/review_26_post-page-styles.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos;
  checkpoints C1-C5 ✔, C6 inspección visual no aplicable como en reviews
  previas).
- **Cierre:** status de feature 26 en `feature_list.json`: `done` (conservada
  en el array — features 1-26 done). `check-format` en verde tras el cambio.
  **Backlog: 0 pendientes, 0 in_progress** (pendiente real del líder: decidir
  si abre re-review de features 19/21 por el fix de adapter documentado en la
  feature 24; sin features nuevas canalizadas).
