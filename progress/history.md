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

## Sesión 2026-08-13 — Feature 28 `htb-stadistics-prerender-fix` (reversión de la edición manual que rompía el build)

**Petición:** `./init.sh` en ROJO por una edición manual SIN commitear en
`src/components/htb-stadistics.astro` (`import { env } from 'cloudflare:workers'`
+ fallbacks `ENV_TOKEN || env.HTB_*`). Con `prerenderEnvironment: 'node'`
(feature 21) el prerender corre en node, donde el módulo virtual
`cloudflare:workers` no existe → `default-prerenderer.js` crashea →
`tests/about-page.test.mjs` REQ-11-05 (build real) fallaba. Decisión del
spec_author (`progress/research/registro-dependencias-aprobadas.md` §4):
REVERTIR al estado canónico 22+27 — el fallback es redundante (astro:env/server
ya resuelve las envs del worker en runtime, REQ-22-08) y REQ-27-02 ya cubre las
envs ausentes; sin fallback "seguro" (REQ-28-04 fija la ausencia con test).

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/htb-stadistics-prerender-fix.test.mjs` (6 tests)
  contra REQ-28-01..06 → ROJO 3/6 (fallan exactamente REQ-28-01, REQ-28-02,
  REQ-28-04: las aserciones que fijan la ausencia de la edición manual; pasan
  REQ-28-03, REQ-28-06 y convención) → VERDE 6/6 tras la reversión.
- `htb-stadistics.astro`: frontmatter revertido al estado canónico 22+27
  (`import { HTB_API_TOKEN, HTB_USER_ID } from 'astro:env/server'` +
  `HtbProfileRepository` + `getProfileOrNull()`); el marcado visible
  `{profile && ...}` de la feature 27 NO cambia; `git diff` del componente
  queda vacío (idéntico a HEAD). NO se tocaron `astro.config.mjs` ni el esquema
  env (workaround de dev fijado por `tests/astro-config-dev-workaround.test.mjs`).
- Ningún test vigente modificado (`git diff -- tests/` vacío): las suites de las
  features 22 y 27 pasan intactas.
- Verificación final: suite 187/187 (180 previos + 6 del test nuevo), build OK
  con prerender en node (REQ-28-05, REQ-11-05 verde), `./init.sh` → "El entorno
  está perfecto".
- **Reviewer:** `progress/review_28_htb-stadistics-prerender-fix.md` con
  Veredicto **APPROVED** (verificado en disco, 2026-08-13; sin cambios
  requeridos; checkpoints C1-C9/C12 ✔, C10 visual no aplicable — marcado sin
  cambios, C11 cierre).
- **Cierre:** status de feature 28 en `feature_list.json`: `done` (conservada
  en el array — features 1-28 done conservadas; pendientes: 29
  `dependencies-registry` y 30 `cloudflare-types-install` (depends_on [29])).
  `check-format` en verde tras el cambio. **Siguiente implementable: 29**.
## Sesión 2026-08-13 — Feature 29 `dependencies-registry` (registro de dependencias aprobadas integrado en el arnés)

**Petición (orden del humano, 2026-08-13):** "actualiza el arnés para tener un
registro de dependencias aprobadas; NINGÚN agente está autorizado a aprobar
dependencias, solo pone `blocked`; únicamente son autorizadas por humanos
después de que sean discutidas". Aprobaciones humanas a materializar: astro
^7.2.0, @astrojs/cloudflare ^14.2.1, wrangler ^4.121.0 (dependencies) y
@cloudflare/workers-types ^5.20260812.1 (devDependencies), aprobadas el
2026-08-13. Análisis previo: `progress/research/registro-dependencias-aprobadas.md`
(Decisiones 3-5: el registro cubre dependencies + devDependencies incluyendo
astro; worker-configuration.d.ts es de la feature 30; sin design.md — sin UI).

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/dependencies-registry.test.mjs` (8 tests) contra
  REQ-29-01..06 → ROJO (`ERR_MODULE_NOT_FOUND: Cannot find module
  'scripts/validate-dependencies.mjs'`, 0 pass / 1 fail: ni el validador ni el
  registro ni la documentación existían) → VERDE 8/8 tras implementar.
- `docs/dependencies.md` (nuevo): formato de bloques `### <package>` +
  `- clave: valor` con `version`, `scope`, `approved` y `motivo`. 4 entradas
  aprobadas por el humano el 2026-08-13 (astro framework del proyecto,
  @astrojs/cloudflare adapter de despliegue en Cloudflare Workers, wrangler CLI
  de despliegue y generación de tipos, @cloudflare/workers-types tipos del
  runtime), versiones y ámbitos exactos de package.json.
- `scripts/validate-dependencies.mjs` (67 líneas, Node stdlib, prefijo
  `validate-`): exporta `parseRegistry` y `validateDependencies(packagePath,
  registryPath)`; falla si una dependencia de package.json no tiene entrada
  aprobada, si version/scope no coinciden, o si una entrada no declara los
  campos obligatorios (verificado con fixtures temporales en el test).
- `scripts/check-format.mjs` integra `validateDependencies()` (REQ-29-06);
  `./init.sh` lo ejecuta en cada arranque (comprobación Formato).
- Arnés documentado (REQ-29-04/05): AGENTS.md (fila del mapa §2 + bullet §7),
  docs/architecture.md (regla 2 ampliada), docs/conventions.md (sección
  «## Dependencias»), docs/verification.md (comprobación 3 + Estado del
  harness): ningún agente aprueba dependencias; la aprobación es decisión
  exclusiva del humano y se materializa en `docs/dependencies.md`.
- Sin tokens prohibidos del kit (og-image/hero/tomatesoft/cards-data: 0 en los
  archivos tocados; REQ-01-05 verde). Sin design.md. Feature 30 intacta.
- Verificación final: `./init.sh` → "El entorno está perfecto" (formato OK,
  tests al 100 % — 195 totales: 187 previos + 8 del test nuevo —, build OK).
- **Reviewer:** `progress/review_29_dependencies-registry.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos;
  checkpoints C1-C3, C5 ✔; C4 no aplica — sin UI). Trazabilidad acceptance↔REQ
  completa (8/8 comprobaciones).
- **Cierre:** status de feature 29 en `feature_list.json`: `done` (conservada
  en el array — features 1-29 done conservadas; pendiente: 30
  `cloudflare-types-install` (depends_on [29] done)). `check-format` en verde
  tras el cambio. **Siguiente implementable: 30** (genera y commitea
  `worker-configuration.d.ts` vía `pnpm generate-types`; REQ-30-01..06).

## Sesión 2026-08-13 — Feature 30 `cloudflare-types-install` (tipos de Cloudflare Workers instalados)

**Petición (orden del humano, 2026-08-13):** "hay que instalar los tipos
también" — materializar `worker-configuration.d.ts` bajo el registro de
dependencias aprobadas. Decisión del spec_author:
`progress/research/registro-dependencias-aprobadas.md` (Decisión 3: el archivo
se commitea — tsconfig.json lo incluye, .gitignore no lo excluye y
wrangler.jsonc versionado lo genera de forma idempotente; es contrato de tipos
del proyecto, no caché como `.astro/`). Sin design.md (sin UI).

**Ciclo (implementer TDD → reviewer):**
- Hechos verificados en disco antes de tocar nada: `worker-configuration.d.ts`
  NO existía (tsconfig.json línea 6 lo incluye), `git check-ignore` exit 1
  (no excluido), script `generate-types: wrangler types` declarado (REQ-21-02),
  `@cloudflare/workers-types` ^5.20260812.1 en devDependencies, `wrangler.jsonc`
  versionado y registro de la feature 29 con ambos paquetes aprobados
  2026-08-13.
- Test escrito PRIMERO: `tests/cloudflare-types-install.test.mjs` (7 tests,
  REQ-30-01..06) → ROJO 3 fail (REQ-30-01/05 archivo ausente, REQ-30-02 sin
  contrato, REQ-30-03/05 sin rastrear en git; rojo estable — el test de
  regeneración restaura el estado si el archivo no existía) → VERDE 7/7.
  Contrato fijado con la marca real del generador v4 (`Generated by Wrangler`)
  tras inspeccionar el output (el intento inicial en minúscula falló; el test
  fija la marca estable del generador, que es lo que REQ-30-02 pide).
- `worker-configuration.d.ts` generado (551.093 bytes) con `wrangler types`
  (wrangler 4.121.0, `node node_modules/wrangler/bin/wrangler.js types` =
  `pnpm generate-types`; sin red ni auth en Windows, verificado): cabecera de
  generación + `interface __BaseEnv_Env` (ASSETS, HTB_API_TOKEN,
  IN_MAINTENANCE, HTB_USER_ID) + `Cloudflare.Env`/`Env`/`NodeJS.ProcessEnv` +
  runtime types de workerd@1.20260804.1. Staged con `git add` (git ls-files lo
  rastrea, REQ-30-03) sin commit (los commits los orquesta el líder). Nada más
  tocado: tsconfig/.gitignore/package.json/wrangler.jsonc/astro.config.mjs
  intactos; docs/dependencies.md ya amparaba los paquetes (REQ-30-06).
- Idempotencia verificada: hash sha256 `e74176bb…dcabc` estable en 2 corridas
  seguidas de `wrangler types` (por el reviewer) + test REQ-30-04 byte a byte.
- Verificación final: test 7/7, suite completa al 100 % (202 totales: 195
  previos + 7 del test nuevo), build OK consumiendo `worker-configuration.d.ts`
  vía el include de tsconfig sin errores de tipos, `./init.sh` → "El entorno
  está perfecto".
- **Reviewer:** `progress/review_30_cloudflare-types-install.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos;
  checkpoints C1-C3, C5 ✔; C4 no aplica — sin UI; nota no bloqueante: el test
  tiene 135 líneas, dentro del precedente aprobado del arnés para tests).
- **Cierre:** status de feature 30 en `feature_list.json`: `done` (conservada
  en el array — features 1-30 done). `check-format` en verde tras el cambio.
  **Backlog: 0 pendientes, 0 in_progress, 0 blocked — ciclo 28 cerrado**
  (features 28-30: prerender fix, registro de dependencias operativo y tipos de
  Cloudflare instalados; estado final: `./init.sh` verde con build OK).

## Sesión 2026-08-13 — Feature 31 `json-repositories-loader` (repositorios JSON al patrón loader sin node:fs)

**Petición (orden del humano, ciclo 29):** el fallback `cloudflare:workers` de
`htb-stadistics.astro` ES NECESARIO; lo que se elimina es el USO DE MÓDULOS
NODE en `src/` (`node:fs`/`node:path`/`node:url` de los repositorios JSON)
porque el prerender debe pasar a `prerenderEnvironment: 'workerd'` (feature 32).
Decisión del spec_author: `progress/research/ciclo-prerender-workerd.md`
(2 features: 31 = repos sin node:* + reconciliar el workaround, devuelve el
arnés a verde; 32 = switch a workerd + fallback restaurado). Patrón canónico
verificado empíricamente: `progress/research/lectura-json-sin-nodefs.md`
(probe 5/5 node --test + build OK). Sin design.md (sin UI).

**Ciclo (implementer TDD → reviewer):**
- Tests escritos PRIMERO contra la spec (REQ-31-01..08):
  `tests/hero-profile-repository.test.mjs` y `tests/hero-cards-repository.test.mjs`
  reescritos al contrato de loader inyectable `() => string` (sin URLs ni
  archivos temporales; loader que lanza = ausente, string inválido = malformado,
  objeto con forma mala = forma inválida; asserts de datos reales REQ-05-01/02 y
  REQ-06-01/02/04 conservados con node:fs — permitido en tests; guard REQ-31-03
  sin `node:` ni sufijo de raw) y `tests/astro-config-dev-workaround.test.mjs`
  (REQ-31-07: estado canónico humano c2bbfa1 — optimizeDeps conserva `include`
  y NO exige `disabled`; no se restaura la línea en astro.config.mjs).
- ROJO capturado: 24 tests → 20 pass / 4 fail (loader inyectable de ambos repos
  + guards REQ-31-03; los modos de error pasaban "por accidente" con el código
  viejo, documentado en el informe).
- `hero-profile-repository.ts` (84 líneas) y `hero-cards-repository.ts`
  (94 líneas) migrados al patrón canónico: `import x from '../../data/x.json'
  with { type: 'json' }` en el `.ts` del dominio + `DEFAULT_RAW =
  JSON.stringify(x)` como default del loader; sin parameter properties
  (strip-only de Node), sin `?raw`, errores nombrados
  `HeroProfileDataError`/`HeroCardsDataError` y semántica REQ-05-04/REQ-06-05
  preservadas 1:1. Consumidores sin argumentos intactos (about.astro,
  new-hero.astro). Corrección en el ciclo: ruta `../../data/` (desde
  `src/domain/repositories/`) y comentarios de cabecera sin la cadena literal
  del sufijo prohibido (el guard la detecta).
- VERDE: tests de la feature 24/24; suite completa al 100 %; `./init.sh` →
  "El entorno está perfecto" (antes de la feature 31 estaba ROJO por el test
  del workaround — la 31 devuelve el arnés a verde completo, REQ-31-08).
  `grep 'from node:' / '?raw' src/` → 0.
- **Reviewer:** `progress/review_31_json-repositories-loader.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos; 8/8
  comprobaciones y checkpoints C1-C3, C5 ✔; C4 no aplica — sin UI; `./init.sh`
  re-ejecutado por el reviewer en verde). Alcance respetado: `git diff --`
  sobre htb-stadistics.astro/astro.config.mjs/wrangler.jsonc vacío.
- **Cierre:** status de feature 31 en `feature_list.json`: `done` (conservada
  en el array — features 1-31 done). `check-format` en verde tras el cambio
  (validado por `./init.sh`). Artefactos permanentes conservados:
  `progress/impl_31_json-repositories-loader.md`, `progress/review_31_*`,
  `specs/31_*` y los 4 informes de research del ciclo 29. **Backlog: 1
  pendiente — 32 `prerender-workerd` (depends_on [31] done): siguiente
  implementable.**

## Sesión 2026-08-13 — Feature 32 `prerender-workerd` (prerender en workerd con el fallback `cloudflare:workers` restaurado)

**Petición (orden del humano, ciclo 29):** el fallback `import { env } from
'cloudflare:workers'` en `htb-stadistics.astro` ES NECESARIO (astro:env/server
no entrega las envs del worker en runtime con el adapter) y lo que se elimina
es el uso de módulos node: el prerender pasa a `prerenderEnvironment:
'workerd'` (default del adapter 14.2.1, prerender en workerd real vía
miniflare, offline y sin auth), donde `cloudflare:workers` resuelve de forma
nativa y el crash `setInternals` del camino node (feature 28) desaparece.
Base técnica: `progress/research/prerender-workerd-adapter.md`,
`progress/research/nodejs-compat-prerender-workerd.md` y
`progress/research/ciclo-prerender-workerd.md`. Depende de la feature 31
(repositorios sin `node:*` — prerrequisito de workerd). La feature 28 permanece
`done` como historial (precedente feature 25); su test se reescribe a PRESENCIA.
Sin design.md (solo frontmatter y config; la presentación no cambia).

**Ciclo (implementer TDD → reviewer):**
- Tests escritos PRIMERO contra la spec (REQ-32-01..07):
  `tests/htb-stadistics-prerender-fix.test.mjs` reescrito al nuevo estado
  canónico: presencia del fallback `cloudflare:workers` + alias
  `ENV_TOKEN`/`ENV_ID` + `const ... = ENV_* || env.HTB_*` (REQ-32-02/03),
  `astro.config.mjs` con `prerenderEnvironment: 'workerd'` y bloque vite
  intacto (REQ-32-01), `getProfileOrNull()` + `{profile && ...}` sin lógica
  (REQ-32-04), guard de `wrangler.jsonc` con ambos flags (REQ-32-07) y
  convención ≤100 líneas.
- ROJO capturado: 6 tests → 3 pass / 3 fail (los asserts que fijan el nuevo
  estado canónico: config `'node'`, ausencia de `cloudflare:workers` y de los
  fallbacks); pasaban ya los guards de degradación 27, flags de wrangler y
  convención.
- `astro.config.mjs`: solo la línea `prerenderEnvironment: 'node'` →
  `'workerd'` (diff git confirma 2 +/-1); `optimizeDeps.include` y
  `server.watch.ignored` intactos. `htb-stadistics.astro` (45 líneas):
  restauradas las 4 líneas del humano encima del import de `astro:env/server`,
  sin `console.*` ni lógica extra; el marcado `{profile && ...}` NO cambia.
  `wrangler.jsonc` sin cambios (mantener `nodejs_compat` — toolchain miniflare
  date-unaware — y `global_fetch_strictly_public`; REQ-32-07).
- VERDE: test de la feature 6/6; suite completa 206/206 al 100 %; `./init.sh`
  → "El entorno está perfecto" con el build de producción en workerd
  (REQ-32-05/REQ-11-05). Contingencia IPv4/IPv6 (REQ-32-06, #15525): NO fue
  necesaria — build sin ECONNREFUSED; mitigación documentada en spec e informe
  (`NODE_OPTIONS=--dns-result-order=ipv4first`).
- Verificación de runtime (riesgo PR #16720 `isNode`, ausente en astro 7.2.0):
  `astro preview` (workerd real) → `GET /` 200 con la isla server:defer
  `/_server-islands/HtbStadistics`; el endpoint de la isla responde 200 con
  body vacío (sin vars HTB locales → `getProfileOrNull()` degrada a `null` →
  la sección no se renderiza): **sin 500, sin `[object Object]`**; `GET /about`
  200 con el perfil real.
- **Reviewer:** `progress/review_32_prerender-workerd.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-13; sin cambios requeridos; 9/9
  comprobaciones con evidencia en código real, `./init.sh` re-ejecutado por el
  reviewer en verde; observación no bloqueante: `/about` responde 307 →
  `/about/` por trailing-slash del preview, imprecisión menor del informe, no
  del código).
- **Cierre:** status de feature 32 en `feature_list.json`: `done` (conservada
  en el array — features 1-32 done, **0 pendientes**). `./init.sh` verde tras
  el cierre. Artefactos permanentes conservados:
  `progress/impl_32_prerender-workerd.md`, `progress/review_32_*`,
  `specs/32_*` y los informes de research del ciclo 29. **Ciclo 29 CERRADO**:
  estado final del sitio — prerender en workerd, fallback `cloudflare:workers`
  restaurado en htb-stadistics, `src/` sin módulos node (repos con loader
  inyectable + `with { type: 'json' }`), registro de dependencias aprobadas
  operativo en el arnés, `worker-configuration.d.ts` versionado.

## Sesión 2026-08-14 — features 33-38 (ciclo 30, cierre)

**Ciclo 30 CERRADO (2026-08-14).** Revisión general del proyecto (petición del
humano: navegaciones a los detalles del content rotas + revisión/refactor
completa) descompuesta en 6 features (research:
`progress/research/revision-general-ciclo30.md`). Todas cerradas con reviewer
APPROVED en disco (`progress/review_33..38_*.md`):

- **33 `htb-profile-repository-restore`** (dominio, deps []): restaurado el
  contrato canónico de `htb-profile-repository.ts` (fetch inyectable como 3er
  argumento, sin console.*, ≤100 líneas, HtbProfileDataError en los 4 modos,
  getProfileOrNull → null). **Causa raíz de 8 de los 11 fallos de la suite.**
  APPROVED.
- **34 `htb-section-degradation-restore`** (UI, deps [33]): restaurado
  `{profile && ...}` en `htb-stadistics.astro` (REQ-27-08/REQ-32-04; campos con
  `?? 'N/D'`, frontmatter solo imports). APPROVED.
- **35 `specs-historico-restore`** (arnés, deps []): restauradas las specs
  21/24 desde git (`0b7f359^`) — las únicas leídas en runtime — + REQ-21-06
  ajustado contra la spec restaurada + docs/dependencies.md. Suite 206/206.
  APPROVED.
- **36 `posts-navigation-fix`** (dominio+UI, deps []) — **fix principal del
  humano**: entidad `Post` con `id`+`slug` readonly, el repositorio entrega
  id/slug con guard `PostsDataError` (sin slug → error), las cards enlazan a
  `/posts/${post.id}` (antes href ausente e `img-undefined` en los
  transition:name) y `[id].astro` empareja por id con Map (sin `posts[index]`).
  Navegación a los detalles del content funcional. Suite 207/207. APPROVED.
- **37 `visual-polish-refactor`** (UI, deps [34, 36], A1-A6): markup muerto
  eliminado (.hero-noise/.hero-flower), `<a href="">` vacío de hero-card
  eliminado, `aria-current="page"` en navbar, `:focus-visible` con tokens,
  viewport con `initial-scale`, indentación 2 espacios, encabezado «Últimos
  artículos», margen HTB con token; REQ-24-03 actualizado al selector
  `h2.latest-articles__title` (autorizado). Suite 218/218. APPROVED.
- **38 `docs-harness-alignment`** (docs, deps [], A7): `docs/architecture.md`
  regla 6 → `src/styles/tokens.css` (sin global.css/DESIGN.md; además
  tomateLogo.svg → favicon.svg y entidades Card/Feature/Plan → HtbProfile/Post
  reales, sin el token «hero») y `CHECKPOINTS.md` a la realidad actual
  (features 1-38 done, sin conteos/features congelados, sin 158/158 ni
  features en progreso). Test nuevo `tests/docs-harness-alignment.test.mjs`
  (REQ-38-01..03), ciclo rojo 2 fail → verde. Suite 221/221. APPROVED.

**Incidente de integridad resuelto:** estados de las features 33/34 revertidos
a `pending` por agente externo (probablemente al regenerar
`feature_list.json`), pese a tener `Veredicto: APPROVED` en disco
(`progress/review_33_...md`, `progress/review_34_...md`); corregidos a `done`
tras verificar el APPROVED en disco, sin tocar el resto del backlog.

**Estado final:** suite completa **221/221** al 100 % (218 baseline de la 37 +
3 nuevos de la 38); `./init.sh` en «El entorno está perfecto» (formato ✔,
tests ✔, build ✔); `feature_list.json` con features 33-38 `done` conservadas
en el array (0 pendientes, 0 en progreso). Artefactos permanentes del ciclo:
`progress/impl_33..38_*.md`, `progress/review_33..38_*.md`,
`specs/33_*..38_*` (+ `specs/21_*`, `specs/24_*` restauradas) y research
`progress/research/revision-general-ciclo30.md`. Siguiente paso del líder:
cuando el humano pida nueva feature, darla de alta vía spec_author; el arnés
está en verde total esperando.

## Sesión 2026-08-14 — Feature 39 `post-page-redesign` (rediseño del detalle de posts: ancho completo + header hero)

**Petición (orden del humano, ciclo 31):** sobre `src/pages/posts/[id].astro` —
(1) el contenido debe ocupar el mismo ancho de la página (se elimina el
`max-width: 760px` de `.post__content` dentro del contenedor de
`min(var(--container-max), 95%)`); (2) un header más vistoso (hoy h1 + meta +
imagen apilados) → panel hero con degradado y resplandor de los tokens del
hero. Análisis previo del spec_author:
`progress/research/rediseno-detalle-post-ciclo31.md` (decisión de ancho
opción A: ancho completo del contenedor, trade-off de legibilidad documentado;
propuesta de panel «imagen + título dentro del panel», sin overlay, para
conservar el contrato REQ-26-04 de la imagen; autorización: CERO cambios en
tests existentes y un test nuevo `tests/post-header.test.mjs`). Spec EARS
`specs/39_post-page-redesign/requirements.md` (REQ-39-01..09) + design.md
(toca UI → design.md obligatorio).

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/post-header.test.mjs` (12 tests, REQ-39-01..09
  + convención) → **ROJO** 8 fail / 4 pass (falla todo lo dependiente del
  marcado/hoja nuevos; pasan los contratos que el estado actual ya cumplía:
  pares de transición, main/article, tokens.css en 87, límite de líneas) →
  **VERDE** 12/12.
- `src/pages/posts/[id].astro` (46 → 51 líneas): nuevo marcado
  `header.post__hero` (img.post__image → div.post__hero-copy con
  h1.post__title y p.post__meta) + import de `src/styles/post-header.css`. El
  primer `<h1>` y el primer `<img>` conservan los pares `title-${entry.id}` /
  `img-${entry.id}` (REQ-39-05; `view-transitions` REQ-24-03/05 verdes sin
  modificar).
- `src/styles/post.css` (99 → 100 líneas, límite exacto ≤100 REQ-26-06):
  `.post__content` pierde `max-width: 760px` y `margin: auto` → el contenido
  ocupa el ancho completo del contenedor del sitio (REQ-39-01); `.post__meta`
  pasa a `margin: 0` (el espaciado lo aporta el panel). Resto del contrato
  REQ-26-03 (`.post`, `.post__title`, `.post__meta`, `.post__image`, scoping
  de tipografía) intacto.
- `src/styles/post-header.css` (**NUEVO**, 48 líneas): panel hero con
  `linear-gradient(160deg, var(--color-hero-top) 0%, var(--color-hero-mid)
  45%, var(--color-hero-bottom) 100%)`, glow en `.post__hero::before` con
  `radial-gradient(circle, var(--color-glow), transparent 70%)`, radio
  `--radius-card`, borde `--color-border-strong`, sombra `--shadow-card`;
  píldora `.post__meta` (inline-flex, `--radius-pill`, `color-mix(in srgb,
  var(--color-surface) 70%, transparent)`, `--color-border-strong`) y media
  query `(max-width: 768px)` con paddings reducidos (REQ-39-02/03/04/06/07).
- Sin cambios: `tokens.css` (87 líneas, REQ-39-09), `Layout.astro`, cards y
  los tests existentes (`post-page-styles` REQ-26-02..07,
  `view-transitions` REQ-24-03/05, `articles-ui-refactor`) — verificados en
  verde sin modificación alguna.
- Verificación final: test 12/12; suite completa **233/233** al 100 % (221
  baseline del cierre de la 38 + 12 nuevos); `node scripts/audit-design-tokens.mjs`
  → `AUDIT ✔`; build OK con el header hero renderizado en
  `dist/client/posts/*/index.html` (`.post__content{font-family:...}` sin
  max-width en el bundle y `.post__hero` con gradiente/glow/píldora);
  `./init.sh` → «El entorno está perfecto».
- **Reviewer:** `progress/review_39_post-page-redesign.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-14; «Cambios requeridos:
  Ninguno»; 9/9 REQ en verde con evidencia en código real, `./init.sh`
  re-ejecutado por el reviewer; checkpoints C1-C9/C12 ✔, C10 inspección
  visual no bloqueante, C11 cierre; observación no bloqueante: post.css está
  en 100 líneas — límite exacto —, no en 96 como declaraba el informe del
  implementer; REQ-26-06 verde igualmente).
- **Cierre:** status de feature 39 en `feature_list.json`: `done` (cambiado
  de `in_progress`; la feature se conserva en el array — features 1-39 done).
  `check-format` e `./init.sh` en verde tras el cambio. **Ciclo 31 CERRADO**:
  backlog 0 pendientes, 0 en progreso. Artefactos permanentes conservados:
  `progress/impl_39_post-page-redesign.md`,
  `progress/review_39_post-page-redesign.md`, `specs/39_post-page-redesign/`
  y el research `progress/research/rediseno-detalle-post-ciclo31.md`. El
  arnés queda en verde total esperando la siguiente petición del humano.

## Feature 40 — post-readability (CERRADA, ciclo 32)

**Petición del humano:** «hazle mejoras para lectura; creo que hay una prop
pretty o algo así; buenas prácticas para mejorar la lectura; en desktop la
fuente se ve muy pequeña» sobre `src/pages/posts/[id].astro`. La «prop
pretty» = `text-wrap: pretty`. Dos research previos
(`progress/research/text-wrap-pretty-legibilidad.md` y
`legibilidad-contenido-articulos.md`): la causa dominante es la medida
(~140-190 caracteres por línea en el contenedor de 1500px vs. óptimo
45-75ch), no el contraste (10.18:1, cumple AA/AAA); el cuerpo 16px está en
el mínimo para lectura larga (18-20px recomendado). Análisis del spec_author:
`progress/research/legibilidad-detalle-post-ciclo32.md` (resolución de la
tensión con REQ-39-01: ancho completo estructural conservado, medida acotada
SOLO en la columna de texto `post__body`). Spec EARS
`specs/40_post-readability/requirements.md` (REQ-40-01..12) + design.md.

**Ciclo (implementer TDD → reviewer):**
- Test escrito PRIMERO: `tests/post-readability.test.mjs` (13 tests,
  REQ-40-01..12 + convención) → **ROJO** 13/13 (fallos por ausencia de
  implementación: sin `post__body`, sin import, sin hoja nueva) → **VERDE**
  13/13.
- `src/pages/posts/[id].astro` (51 → 52 líneas): import de
  `../../styles/post-readability.css` DESPUÉS de post.css y post-header.css
  (el orden de import fija la cascada, design Decisión 7) y el `<section>`
  del Content pasa a `<section class="post__body">` (REQ-40-01). Pares
  `title-${entry.id}`/`img-${entry.id}` intactos (REQ-24-03/05).
- `src/styles/post-readability.css` (**NUEVO**, 44 líneas): `.post__body`
  con `max-inline-size: 70ch; margin-inline: auto` (REQ-40-02) y `font-size:
  clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (REQ-40-03, fluido 17→19px);
  `.post__content p` con `text-wrap: pretty`, `letter-spacing: 0.01em` y
  `margin-block-end: 1lh` (REQ-40-04/05/06); grupo `h1, h2, h3` con
  `text-wrap: balance` (REQ-40-07); h2 `1.75rem` / h3 `1.4rem` con márgenes
  en `lh` (REQ-40-08); media query 768px con h2 1.4rem / h3 1.2rem
  (REQ-40-09). Solo unidades relativas (rem/ch/lh/em), sin tokens nuevos,
  sin hex/rgba (REQ-40-10/11).
- Sin cambios: `tokens.css` (87 líneas, REQ-40-11), `post.css` y
  `post-header.css` (contratos REQ-26/REQ-39 intactos) y los tests
  existentes (`post-header` REQ-39-01..09, `post-page-styles` REQ-26-02..07,
  `view-transitions` REQ-24-03/05, `design-tokens`) — verificados en verde
  sin modificación alguna (REQ-40-12: `.post__content` conserva el ancho
  completo sin max-width).
- Verificación final: test 13/13; suite completa **246/246** al 100 % (233
  baseline del cierre de la 39 + 13 nuevos); `node scripts/audit-design-tokens.mjs`
  → `AUDIT ✔`; build OK: en `dist/client/posts/*/index.html` la columna
  `.post__body` (70ch centrada + clamp) envuelve el markdown y el CSS
  inlined confirma la cascada (overrides de p/h2/h3 después de post.css) y
  el full-width de `.post`/`.post__content`; `./init.sh` → «El entorno está
  perfecto».
- **Reviewer:** `progress/review_40_post-readability.md` con Veredicto
  **APPROVED** (verificado en disco, 2026-08-14; «Cambios requeridos:
  Ninguno»; 12/12 REQ en verde con evidencia en código real, suite 246/246
  y `./init.sh` re-ejecutados por el reviewer; checkpoints C1-C9/C12/C13 ✔,
  C10 inspección visual no bloqueante, C11 cierre; observaciones no
  bloqueantes: 44 líneas reales de post-readability.css (el informe
  declaraba 37) y `pretty` sin `@supports` — degradación silenciosa por
  diseño).
- **Cierre:** status de feature 40 en `feature_list.json`: `done` (cambiado
  de `in_progress`; la feature se conserva en el array — features 1-40 done).
  `check-format` e `./init.sh` en verde tras el cambio. **Ciclo 32
  CERRADO**: backlog 0 pendientes, 0 en progreso. Artefactos permanentes
  conservados: `progress/impl_40_post-readability.md`,
  `progress/review_40_post-readability.md`, `specs/40_post-readability/` y
  los research `progress/research/text-wrap-pretty-legibilidad.md`,
  `legibilidad-contenido-articulos.md` y `legibilidad-detalle-post-ciclo32.md`.
  El arnés queda en verde total esperando la siguiente petición del humano.

## Sesión 2026-08-14 — Feature 40 `post-readability` (mejoras de legibilidad del detalle de posts, ciclo 32 — cierre)

Petición del humano: «hazle mejoras para lectura; creo que hay una prop pretty
o algo así; buenas prácticas para mejorar la lectura; en desktop la fuente se
ve muy pequeña» sobre `src/pages/posts/[id].astro` (la «prop pretty» =
`text-wrap: pretty`). La investigación previa (2 explorers:
`progress/research/text-wrap-pretty-legibilidad.md` y
`legibilidad-contenido-articulos.md`) concluyó que la causa dominante es la
medida (~140-190 caracteres por línea en el contenedor de 1500px vs. óptimo
45-75ch), no el contraste (10.18:1 cumple AA/AAA), y que el cuerpo 16px está
en el mínimo para lectura larga (18-20px recomendado).

Implementación (TDD, test-first en rojo 13/13 → verde 13/13):
- Columna de lectura `post__body` de 70ch centrada (`max-inline-size: 70ch;
  margin-inline: auto`), respetando el full-width estructural de la feature
  39 (contenedor `.post`, header `.post__hero` y regla `.post__content`
  conservan el ancho completo; REQ-39-01 literal, REQ-40-12).
- Cuerpo `font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (fluido
  17→19px, unidades rem para WCAG 1.4.4).
- `text-wrap: pretty` en p (la «prop pretty» que mencionó el humano) +
  `text-wrap: balance` en h1-h3 (mejora progresiva; Firefox degrada
  silenciosamente sin `@supports`, riesgo documentado y aceptado).
- `margin-block-end: 1lh` y `letter-spacing: 0.01em` en p; jerarquía h2
  1.75rem / h3 1.4rem con márgenes asimétricos en `lh`; media query 768px
  (h2 1.4rem / h3 1.2rem).
- Hoja nueva `src/styles/post-readability.css` (44 líneas) consumiendo solo
  tokens existentes (literales de tipografía/layout con unidades relativas
  rem/ch/lh/em; tokens.css intacto en 87 líneas, REQ-40-11);
  `src/pages/posts/[id].astro` pasa a 52 líneas con el import de la hoja
  DESPUÉS de post.css y post-header.css (el orden de import fija la cascada)
  y `section.post__body` envolviendo el `<Content />` (REQ-40-01).
- Sin cambios en tests existentes (post-header REQ-39-01..09,
  post-page-styles REQ-26-02..07, view-transitions REQ-24-03/05,
  design-tokens REQ-02): todos en verde sin modificación alguna. Test nuevo
  `tests/post-readability.test.mjs` (13 tests, contrato REQ-40-01..12).

Verificación final: suite completa **246/246** al 100 % (233 baseline del
cierre de la 39 + 13 nuevos); `node scripts/audit-design-tokens.mjs` →
`AUDIT ✔`; build OK (verificado en `dist/client/posts/*/index.html`: columna
`.post__body` centrada con el markdown, `.post`/`.post__content` full-width
conservados y overrides ganando la cascada en el CSS inlined);
`./init.sh` → «El entorno está perfecto».

Reviewer: `progress/review_40_post-readability.md` con Veredicto **APPROVED**
(«Cambios requeridos: Ninguno»; 12/12 REQ en verde con evidencia en código
real, suite 246/246 y `./init.sh` re-ejecutados por el reviewer;
observaciones no bloqueantes: 44 líneas reales de la hoja nueva frente a las
37 declaradas en el informe, y `pretty` sin `@supports` — degradación
silenciosa por diseño). Cierre: feature 40 `done` en `feature_list.json`
(conservada en el array; features 1-40 done), `check-format` e `./init.sh`
en verde tras el cambio. **Ciclo 32 CERRADO**: backlog 0 pendientes, 0 en
progreso. Artefactos permanentes conservados:
`progress/impl_40_post-readability.md`,
`progress/review_40_post-readability.md`, `specs/40_post-readability/` y los
research `progress/research/text-wrap-pretty-legibilidad.md`,
`legibilidad-contenido-articulos.md` y `legibilidad-detalle-post-ciclo32.md`.
El arnés queda en verde total esperando la siguiente petición del humano.

## Sesión 2026-08-14 — Feature 41 `post-reading-width-restore` (ancho completo de lectura restaurado, ciclo 33 — cierre)

Petición del humano (rechazo de la feature 40): «no compa lo volvieron a
poner muy angosto». La columna de lectura de `max-inline-size: 70ch` de la
feature 40 (medida óptima de la investigación) se elimina: la decisión del
humano manda y el contenido del detalle de posts vuelve al **ancho completo
del contenedor del sitio** (REQ-39-01 literal, como pedía la feature 39).
Análisis previo del spec_author:
`progress/research/ancho-lectura-fullwidth-ciclo33.md` (decisión estructural:
conservar `section.post__body` como contenedor tipográfico SIN acotación;
trade-off de líneas largas documentado y acatado — el humano prioriza el
ancho completo sobre la medida óptima de línea). Spec EARS
`specs/41_post-reading-width-restore/requirements.md` (REQ-41-01..13) +
design.md.

Implementación (TDD, test actualizado primero en rojo 2 fail → verde 13/13):
- `src/styles/post-readability.css` (44 → 42 líneas): eliminadas
  `max-inline-size: 70ch` y `margin-inline: auto` de `.post__body` (la regla
  queda solo con `font-size: clamp(...)`; REQ-41-01/02). Conservadas TODAS
  las mejoras tipográficas de la 40 que no estrechan: clamp 17→19px
  (`1.0625rem`–`1.1875rem`), `text-wrap: pretty` en p, `text-wrap: balance`
  en h1-h3, `margin-block-end: 1lh`, `letter-spacing: 0.01em`, h2 1.75rem /
  h3 1.4rem con márgenes en lh y media query 768px (REQ-41-03..09). Sin
  hex/rgba, sin tokens nuevos (REQ-41-11/12).
- `tests/post-readability.test.mjs` actualizado con la autorización de la
  spec (REQ-41-10): el test REQ-40-02 pasa de verificar 70ch a verificar la
  AUSENCIA de `max-width`/`max-inline-size` en `.post__body`, y el test
  REQ-40-12 se refuerza con el guard de que NINGUNA regla de la hoja acota
  el ancho (patrón que distingue el contexto `@media (max-width: 768px)` y
  no descarta comentarios — riesgo 1 del research §8). REQ-40-01, 03..11 y
  convenciones intactos. Ciclo rojo: 2 fallos acotados a las aserciones de
  la medida (11 tipográficas pasando ya en rojo).
- Sin cambios: `src/pages/posts/[id].astro` (52 líneas, `section.post__body`
  conservada envolviendo el `<Content />`, REQ-41-02), `post.css` (100
  líneas, `.post__content` sin max-width, REQ-41-13), `post-header.css` (48
  líneas) y `tokens.css` (87 líneas, REQ-41-12). Contratos post-header
  (REQ-39), post-page-styles (REQ-26), view-transitions (REQ-24) y
  design-tokens en verde sin modificación.

Verificación final: test de la feature 13/13; suite completa **246/246** al
100 %; `node scripts/audit-design-tokens.mjs` → `AUDIT ✔`; build OK —
verificado en `dist/client/posts/*/index.html`: `section.post__body`/
`header.post__hero`/`article.post__content` presentes, `.post__body` sin
acotación (0 ocurrencias de 70ch/max-inline-size) y `.post__content` sin
max-width → el cuerpo ocupa el mismo ancho que el header hero (full-width),
que es exactamente la decisión del humano; `./init.sh` → «El entorno está
perfecto».

Reviewer: `progress/review_41_post-reading-width-restore.md` con Veredicto
**APPROVED** (verificado en disco, 2026-08-14; «Cambios requeridos: Ninguno»;
37/37 en feature + contratos, suite 246/246 y `./init.sh` re-ejecutados por
el reviewer; checkpoints C1-C9/C12/C13 ✔, C10 inspección visual en navegador
no bloqueante, C11 cierre; observaciones no bloqueantes: `wc -l` 41 vs.
countLines 42 por la ausencia de salto de línea final, y la inspección
visual en navegador queda pendiente del humano como en ciclos anteriores).
Cierre: feature 41 `done` en `feature_list.json` (cambiado de `in_progress`;
la feature se conserva en el array — features 1-41 done), `check-format` e
`./init.sh` en verde tras el cambio. **Ciclo 33 CERRADO**: backlog 0
pendientes, 0 en progreso. Artefactos permanentes conservados:
`progress/impl_41_post-reading-width-restore.md`,
`progress/review_41_post-reading-width-restore.md`,
`specs/41_post-reading-width-restore/` y el research
`progress/research/ancho-lectura-fullwidth-ciclo33.md`. El arnés queda en
verde total esperando la siguiente petición del humano.

---

### Ciclo 34 — Feature 42 `post-header-horizontal-card` (cerrada, APPROVED)

Petición del humano sobre el header de los posts: «la imagen con el título,
pon aquí la tarjeta como en horizontal, un diseño más atrevido». El header
vertical de la feature 39 (imagen full-width + copia debajo, «prácticamente
igual» a las cards de la portada) pasa a una tarjeta HORIZONTAL con acentos
de la identidad dark/glow, solo con tokens existentes (tokens.css en 87
líneas, REQ-42-09).

Cambios (alcance exacto, verificado por el reviewer contra el baseline de la
review 41):
- `src/pages/posts/[id].astro`: 52 → 53 líneas; solo se añade el kicker
  `<p class="post__kicker">#{post.tags[0]}</p>` dentro de `.post__hero-copy`
  ANTES de `h1.post__title` (REQ-42-03). Orden DOM imagen → copia intacto
  (REQ-39-02), pares `transition:name` `img-${entry.id}`/`title-${entry.id}`
  en el primer img y el primer h1 (REQ-42-08), imports en orden REQ-40-01.
- `src/styles/post-header.css`: reescrito a 99 líneas (≤100 ✓). `.post__hero`
  pasa a `display: grid` con `grid-template-columns: 1fr 1fr`,
  `align-items: center` y `gap: 32px` (REQ-42-01/02), conservando el
  degradado hero con `var(--color-hero-*)` (primer layer, contrato
  REQ-39-02/03) + wash radial de acento como segundo layer (`color-mix` con
  `var(--color-accent)`), radio/borde/sombra de tokens y glow de `::before`.
  `::after` = acento inferior degradado con `var(--color-accent)` (REQ-42-06).
  `.post__hero .post__image` con `margin: 0`, `aspect-ratio: 4 / 3` y
  `box-shadow: 0 0 48px var(--color-glow)` (REQ-42-05); la base
  `.post__image` de post.css NO se toca (REQ-26-04: el grid acota el ancho).
  `.post__kicker` = píldora de acento (color/borde `var(--color-accent)`,
  fondo `color-mix` al 12%). `.post__hero .post__title` =
  `clamp(2.2rem, 4.5vw, 3.6rem)` + `text-wrap: balance` + glow (REQ-42-04).
  `.post__meta` conservada íntegra (REQ-39-04). Media query 768px: apilado
  `grid-template-columns: 1fr` con imagen 16:9 arriba y copia debajo
  (REQ-42-07, conserva `.post__hero` → REQ-39-07). Sin hex/rgba sueltos y
  toda declaración de color/borde/sombra con `var(--` (guard REQ-39-09).
- `tests/post-header-horizontal.test.mjs`: NUEVO (test-first, 12 tests,
  REQ-42-01..09 + convenciones).
- Sin cambios: `post.css` (100 líneas), `tokens.css` (87 líneas) y los tests
  existentes (post-header REQ-39, post-page-styles REQ-26, view-transitions
  REQ-24, post-readability REQ-40/41, design-tokens).

Ciclo rojo/verde: test nuevo en ROJO 7 fail / 5 pass antes de implementar
(fallos acotados a REQ-42-01..07; REQ-42-08/09 y convenciones pasando ya en
rojo) → VERDE 12/12. Suite completa **258/258** (246 + 12 nuevos);
`node scripts/audit-design-tokens.mjs` → `AUDIT ✔`;
`node scripts/check-format.mjs` → `FORMATO ✔`; build OK — verificado en
`dist/client/posts/*/index.html`: `.post__hero` con
`grid-template-columns: 1fr 1fr` (desktop) y `grid-template-columns: 1fr` +
imagen `aspect-ratio: 16/9` en la media query `(width<=768px)` (móvil);
kicker `<p class="post__kicker">#arquitectura</p>` en ambos posts; imagen
`aspect-ratio: 4/3` con `box-shadow` glow; título `clamp(2.2rem,4.5vw,3.6rem)`;
acento `::after` con `var(--color-accent)`; `./init.sh` → «El entorno está
perfecto».

Reviewer: `progress/review_42_post-header-horizontal-card.md` con Veredicto
**APPROVED** (verificado en disco, 2026-08-14; «Cambios requeridos: Ninguno»;
57/57 en feature + contratos, suite 258/258, audit ✔, formato ✔ y
`./init.sh` re-ejecutados por el reviewer; checkpoints C1-C9/C12/C13 ✔, C10
inspección visual en navegador pendiente del humano como en ciclos
anteriores, C11 cierre; observaciones no bloqueantes: `wc -l` 98 vs.
countLines 99 por la ausencia de salto de línea final y el tamaño del test
nuevo (242 líneas) siguiendo el precedente aprobado de los tests del arnés).
Cierre: feature 42 `done` en `feature_list.json` (cambiado de `in_progress`;
la feature se conserva en el array — features 1-42 done), `check-format` e
`./init.sh` en verde tras el cambio. **Ciclo 34 CERRADO**: backlog 0
pendientes, 0 en progreso. Artefactos permanentes conservados:
`progress/impl_42_post-header-horizontal-card.md`,
`progress/review_42_post-header-horizontal-card.md`,
`specs/42_post-header-horizontal-card/` y el research
`progress/research/header-horizontal-posts-ciclo34.md`. El arnés queda en
verde total esperando la siguiente petición del humano.

## Feature 43 — hero-back-navigation-fix (CERRADA, 2026-08-14)

Fix del hero perdido al volver del detalle (`/posts/[id]` → `/`): la imagen del
hero de la portada se perdía (404 `GET /posts/assets/moises-hero.jpg`) porque
`src/data/hero.json` declaraba la ruta RELATIVA `assets/moises-hero.jpg` y el
`<ClientRouter />` re-parsea la portada con DOMParser antes de cambiar la URL
(resuelve contra `/posts/`). Cambios (REQ-43-01..07, spec
`specs/43_hero-back-navigation-fix/`): (1) `hero.json` pasa a la ruta absoluta
`/assets/moises-hero.jpg` (REQ-43-01); (2) `transition:persist="hero-profile"`
en el `<img>` del hero de la portada (`new-hero.astro`, REQ-43-02); (3) copia
OCULTA del hero en `[id].astro` dentro de `.post__hero`, DESPUÉS de
`img.post__image` y de `.post__hero-copy`, SIN `transition:name`, mismo src vía
`HeroProfileRepository` (REQ-43-03/07 — el persist de Astro exige el elemento
en AMBAS páginas y el nodo viejo sobrevive al swap); (4) preload del hero en el
head del layout (`<link rel="preload" as="image" href={heroProfile.image}>`,
REQ-43-04); (5) regla de ocultación estructural
`.post__hero [data-astro-transition-persist="hero-profile"] { display: none; }`
en `layout.css` (REQ-43-05; sigue al atributo que viaja con el nodo, acotada a
`.post__hero` que solo existe en el detalle; sin `hidden`/`aria-hidden` que
viajarían con el nodo). Cambio de test existente AUTORIZADO (REQ-43-06):
`tests/hero-profile-repository.test.mjs` `EXPECTED_PROFILE.image` →
`'/assets/moises-hero.jpg'` (el fixture sigue al dato real; resto del test
intacto). Nuevo test test-first `tests/hero-back-navigation.test.mjs` (6
tests). Ciclo rojo/verde: ROJO 7 fail (6 REQ-43 + REQ-31-01/04 por el fixture ya
actualizado) → VERDE 15/15 en la feature; suite completa **264/264** (258 + 6
nuevos); `node scripts/audit-design-tokens.mjs` → `AUDIT ✔`; `./init.sh` →
«El entorno está perfecto». Build verificado en `dist/`: portada con persist +
preload; detalle con preload + copia persistida tras `img.post__image` y
`.post__hero-copy`; regla `display:none` en el CSS compilado. `tokens.css`
intacto (87 líneas). Sin cambios visuales en el diseño aprobado (se conservan
los pares `transition:name` img/title, REQ-24-03/05/42-08).

Reviewer: `progress/review_43_hero-back-navigation-fix.md` con Veredicto
**APPROVED** (verificado en disco 2026-08-14; 37/37 en feature + contratos,
suite 264/264, audit ✔, formato ✔ y `./init.sh` re-ejecutados por el reviewer;
checkpoints C1-C5 ✔; riesgo residual no bloqueante documentado: morph de
imágenes en back sigue expuesto al bug upstream de Chromium 331926174/#10595,
mitigado con persist + preload y pendiente de la feature 44). Cierre: feature
43 `done` en `feature_list.json` (cambiado de `in_progress`; la feature se
conserva en el array), `check-format` e `./init.sh` en verde tras el cambio.
Artefactos permanentes conservados: `progress/impl_43_hero-back-navigation-fix.md`,
`progress/review_43_hero-back-navigation-fix.md`, `specs/43_hero-back-navigation-fix/`
y los research `progress/research/fix-imagen-hero-y-rendimiento-ciclo36.md` y
`progress/research/view-transitions-imagen-perdida.md`. Backlog: 1 pendiente
(feature 44 performance-jank-reduction), 0 en progreso.

## Sesión 2026-08-18 — Feature 1 `hero-test-fixture-align` (cierre, ciclo de búsqueda global)

### Bitácora

- 2026-08-18 (implementer, feature 1, cierre): CERRADA — progress/review_01_hero-test-fixture-align.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 1 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: fixture del test del hero alineado al dato real (ruta absoluta /assets/moises-hero.jpg, precedente REQ-43-06); suite 258/258, ./init.sh verde, src/ intacto. Siguiente pendiente: feature 2 search-domain (sin deps).

## Sesión 2026-08-18 — Feature 2 `search-domain` (cierre, ciclo de búsqueda global)

### Bitácora

- 2026-08-18 (implementer, feature 2, cierre): CERRADA — progress/review_02_search-domain.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 2 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: dominio de búsqueda en src/domain/search/ (normalize.ts, parse-date.ts, index.ts, search.ts; PAGE_SIZE=6; coincidencia por subcadena normalizada en título/descripción/tags/cuerpo; fecha española → YYYY-MM-DD; orden desc; paginación 1-based; índice serializable para el cliente). ROJO ERR_MODULE_NOT_FOUND → VERDE 17/17 en la feature; suite 275/275; ./init.sh verde. Siguiente pendiente: feature 3 search-dedicated-view (depende de 2, done).

## Sesión 2026-08-18 — Feature 3 \search-dedicated-view\ (cierre, ciclo de búsqueda global)

### Bitácora

- 2026-08-18 (implementer, feature 3, cierre): CERRADA — progress/review_03_search-dedicated-view.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 3 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: vista /search?q= prerendered con índice embebido (escape <\/script) y filtrado client-side; deep linking, guía sin q, empty state con limpiar, paginación sin recarga, tarjetas → /posts/[id]; componente canónico search-results reutilizable por la feature 5. ROJO ERR_MODULE_NOT_FOUND → VERDE 25/25; suite 300/300; audit tokens y ./init.sh verdes; build con ruta /search verificada. Siguiente pendiente: feature 4 search-bar-header (depende de 2, done).

## Sesi�n 2026-08-18 � Feature 4 `search-bar-header` (cierre, ciclo de b�squeda global)

### Bit�cora

- 2026-08-18 (implementer, feature 4, cierre): CERRADA � progress/review_04_search-bar-header.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 4 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: barra de b�squeda en el header del Layout (search-bar.astro 21 l�neas + search-bar.ts 64 con funciones puras + search-bar.css 75 con tokens existentes); X visible solo con texto con retorno de foco; Enter ? /search?q= con navigate de astro:transitions/client (view transitions conservadas); CustomEvent search:change para la portada; aria-labels accesibles. ROJO ERR_MODULE_NOT_FOUND ? VERDE 20/20; suite 320/320; audit tokens e ./init.sh verdes. Siguiente pendiente: feature 5 search-landing-live-transition (depende de 3 y 4, done).

## Sesión 2026-08-18 — Feature 5 `search-landing-live-transition` (cierre, ciclo de búsqueda global)

### Bitácora

- 2026-08-18 (implementer, feature 5, cierre): CERRADA — progress/review_05_search-landing-live-transition.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 5 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: live search en la portada con transición dinámica del layout (search-live.ts 99 líneas se suscribe a search:change y alterna hidden sobre data-landing-sections/data-search-live; index.astro 35 con índice embebido + wrapper; search-live.astro 17 reusa la presentación de la feature 3; empty state con término, primeros PAGE_SIZE + enlace /search?q=). ROJO ERR_MODULE_NOT_FOUND → VERDE 20/20; suite 340/340; audit tokens e ./init.sh verdes. Siguiente pendiente: feature 6 search-keyboard-escape (depende de 3, 4 y 5, done).

## Sesión 2026-08-18 — Feature 6 `search-keyboard-escape` (cierre, ciclo de búsqueda global)

### Bitácora

- 2026-08-18 (implementer, feature 6, cierre): CERRADA — progress/review_06_search-keyboard-escape.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 6 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: Escape limpia/cierra la búsqueda activa (search-escape.ts 66 líneas con escapeContext/escapeAction/activeTerm + initSearchEscape; arranque en Layout vía search-escape.astro 9 líneas; reutiliza clearQuery/removeQueryParam/applyLive de las features 3/4/5; stopPropagation siempre; no-op con consulta vacía). ROJO ERR_MODULE_NOT_FOUND → VERDE 20/20; suite 360/360; audit tokens e ./init.sh verdes. **Ciclo de búsqueda global CERRADO: features 1-6 done, backlog 0 pendientes.**

## Sesión 2026-08-18 — Búsqueda global (vista /search, live search en la Landing, Escape)

### Resumen ejecutivo

- Ciclo de búsqueda global CERRADO. El backlog se regeneró desde cero tras la
  ausencia de feature_list.json (esqueleto del validador; ids 1-6 para las
  features nuevas del ciclo; el histórico vive en history.md y en los
  artefactos permanentes).
- Features 1-6 implementadas (test-first, rojo→verde), revisadas por reviewer
  (APPROVED en disco) y cerradas: 1 hero-test-fixture-align (fixture alineado
  al dato real), 2 search-domain (dominio TS puro: normalización, coincidencia,
  fecha española, paginación, índice), 3 search-dedicated-view (/search?q=
  prerendered con deep linking, resultados, empty state y paginación), 4
  search-bar-header (barra en el header con X, foco y Enter), 5
  search-landing-live-transition (live search en la Landing con transición
  dinámica del layout) y 6 search-keyboard-escape (Escape limpia/cierra la
  búsqueda activa).
- Suite final **360/360** (258 iniciales + 102 nuevos del ciclo); node
  scripts/check-format.mjs ✔, audit-design-tokens ✔ y bash ./init.sh
  "El entorno está perfecto" (incluye pnpm build) en cada cierre y al final.
- Artefactos permanentes conservados: specs/01..06_* (requirements.md +
  design.md donde aplica), progress/impl_01..06_*.md, progress/review_01..06_*.md,
  progress/research/global-search-landing.md; backlog: 1-6 done, 0 pendientes.

### Bitácora (movida de progress/current.md)

# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Ninguna: TODAS las features del ciclo (1-6) están done; backlog sin
  pendientes (ciclo de búsqueda global CERRADO, 2026-08-18).

## Cierre feature 6 (2026-08-18, implementer)

- 2026-08-18 (implementer, feature 6, cierre): CERRADA —
  progress/review_06_search-keyboard-escape.md con Veredicto APPROVED y
  "Cambios requeridos: Ninguno" (verificado en disco). Status de feature 6 en
  feature_list.json: done (cambiado de in_progress; la feature se conserva en
  el array). node scripts/check-format.mjs en verde tras el cambio y
  bash ./init.sh "El entorno está perfecto" (suite 360/360 + build). Resumen:
  Escape limpia/cierra la búsqueda activa (search-escape.ts 66 con
  escapeContext/escapeAction/activeTerm + initSearchEscape; arranque en el
  Layout vía search-escape.astro 9; reutiliza clearQuery/removeQueryParam/
  applyLive de las features 3/4/5 por import; stopPropagation siempre;
  no-op con consulta vacía). ROJO ERR_MODULE_NOT_FOUND → VERDE 20/20; suite
  360/360; audit de tokens e ./init.sh verdes; build verificado para / y
  /search. **Ciclo de búsqueda global CERRADO: features 1-6 done, backlog 0
  pendientes.**

### Evolución (implementer, 2026-08-18, feature 6 search-keyboard-escape)

- Feature 6 marcada in_progress en feature_list.json (2026-08-18).
- ROJO capturado: node --test tests/search-keyboard-escape.test.mjs → exit 1,
  ERR_MODULE_NOT_FOUND (src/components/search-escape/search-escape.ts no
  existe), 0 pass / 1 fail. Tests escritos primero (20 tests, REQ-06-01..04 +
  restricciones del arnés). Fallo intermedio de test (fake con panel en modo
  guía) corregido → 20/20.
- Implementación: src/components/search-escape/{search-escape.ts 66,
  search-escape.astro 9} (controlador puro: escapeContext, escapeAction,
  activeTerm, initSearchEscape con guard anti-duplicado para view
  transitions; componente script-only que importa y arranca) +
  src/layouts/Layout.astro 38 (integra <SearchEscape /> tras </header>).
  Reutiliza por import: clearQuery/activeQuery (f4), removeQueryParam/
  queryTerm (f3) y applyLive (f5). Arranque en el Layout: Escape es
  comportamiento global de la búsqueda; contexto detectado por DOM
  ([data-search-live] → portada, [data-search-guide] → /search, resto →
  none). Consulta activa: q de la URL en /search, memoria de la barra en la
  portada. stopPropagation SIEMPRE (REQ-06-04). Sin CSS ni UI nueva.
- VERDE: test feature 20/20; suite completa 360/360 (340 + 20);
  check-format FORMATO ✔; audit-design-tokens AUDIT ✔; ./init.sh
  "El entorno está perfecto" (incluye build). Build verificado: bundle
  search-escape con stopPropagation/keydown/replaceState/data-*; index.html
  y search/index.html referencian el bundle.
- Informe: progress/impl_06_search-keyboard-escape.md. Sigue in_progress: el
  APPROVED del reviewer la marca done.

### Cierre feature 5 (2026-08-18, implementer)

- 2026-08-18 (implementer, feature 5, cierre): CERRADA —
  progress/review_05_search-landing-live-transition.md con Veredicto APPROVED
  y "Cambios requeridos: Ninguno" (verificado en disco); status done en
  feature_list.json (la feature se conserva en el array).

### Análisis en curso

- Búsqueda global: vista dedicada /search?q= compartible, live search en la
  Landing con transición dinámica del layout, barra en el header, paginación y
  soporte Escape. Análisis completo en
  progress/research/global-search-landing.md.

### Plan (feature 3 search-dedicated-view)

- 1) Tests primero: tests/search-dedicated-view.test.mjs (inspección por regex
  sobre search.astro, search-results.astro, controller .ts y search-results.css
  + unitarios por import directo del controller: cardHtml, queryTerm,
  removeQueryParam, paginationHtml). ROJO esperado: archivos inexistentes.
- 2) Implementar: src/pages/search.astro (prerender, índice embebido con
  JSON.stringify + escape <\/script, Layout title="Búsqueda") + componente
  src/components/search-results/search-results.astro (guía, empty state con
  mensaje exacto y botón limpiar, grid, paginación) + controller .ts
  (URLSearchParams q, searchIndex/PAGE_SIZE del dominio, document.title con el
  término, limpiar elimina q, paginación sin recarga) + hoja
  src/styles/search-results.css (solo tokens de design.md).
- 3) VERDE: test feature, suite completa (275 + nuevos), check-format,
  audit-design-tokens, ./init.sh "El entorno está perfecto"; verificar
  dist/client/search.html con el índice serializado y el escape.
- 4) Informe: progress/impl_03_search-dedicated-view.md.

### Plan (feature 5 search-landing-live-transition)

- 1) Tests primero: tests/search-landing-live-transition.test.mjs (unitarios
  por import directo del controlador search-live.ts: layoutMode, livePage,
  seeAllUrl, applyLive con DOM fake + inspección por regex sobre index.astro,
  search-live.astro, search-live.ts y search-live.css). ROJO esperado:
  ERR_MODULE_NOT_FOUND.
- 2) Implementar: src/components/search-live/search-live.ts (controlador:
  suscripción a search:change, alterna hidden sobre data-landing-sections /
  data-search-live, render con searchIndex+PAGE_SIZE del dominio y cardHtml
  de feature 3, empty con término, enlace ver todos) + search-live.astro
  (wrapper del panel que importa search-results.css, REQ-05-04) +
  src/styles/search-live.css (solo tokens de design.md) + src/pages/index.astro
  (índice embebido id="search-index" con escape <\/script, wrapper
  data-landing-sections alrededor de hero/artículos/HTB, <SearchLive/>).
- 3) VERDE: test feature; suite completa pnpm test (320 + nuevos); 
  check-format; audit-design-tokens; ./init.sh "El entorno está perfecto";
  verificar dist/client/index.html con el índice serializado y escape.
- 4) Informe: progress/impl_05_search-landing-live-transition.md. NO marcar
  done (el APPROVED del reviewer la cierra).

### Evolución (implementer, 2026-08-18, feature 5 search-landing-live-transition)

- Feature 5 marcada in_progress en feature_list.json (2026-08-18).
- ROJO capturado: node --test tests/search-landing-live-transition.test.mjs →
  exit 1, ERR_MODULE_NOT_FOUND (src/components/search-live/search-live.ts no
  existe), 0 pass / 1 fail. Tests escritos primero (20 tests, REQ-05-01..07 +
  restricciones del arnés).
- Implementación: src/components/search-live/{search-live.ts 99,
  search-live.astro 17} (controlador puro: layoutMode, livePage, seeAllUrl,
  applyLive, initSearchLive; wrapper del panel que importa search-results.css
  de la feature 3, REQ-05-04) + src/styles/search-live.css 31 (solo tokens de
  design.md) + src/pages/index.astro 35 (índice embebido id="search-index"
  con escape <\/script, wrapper data-landing-sections, <SearchLive />).
- VERDE: test feature 20/20; suite completa 340/340 (320 + 20);
  check-format FORMATO ✔; audit-design-tokens AUDIT ✔; ./init.sh
  "El entorno está perfecto" (incluye build).
- Build verificado: dist/client/index.html con data-landing-sections, panel
  data-search-live hidden, empty state y "Ver todos los resultados"; índice
  JSON.parse OK (2 entradas, sin </script crudo; escape <\/script en el
  fuente); bundle search-live minificado con addEventListener(changeEventName)
  + detail.term + toggleAttribute hidden + livePage(PAGE_SIZE=6) + seeAllUrl.
- Informe: progress/impl_05_search-landing-live-transition.md. Sigue
  in_progress: el APPROVED del reviewer la marca done.

- Feature 3 marcada in_progress en feature_list.json.
- ROJO capturado: node --test tests/search-dedicated-view.test.mjs → exit 1,
  ERR_MODULE_NOT_FOUND (src/components/search-results/* no existen),
  0 pass / 1 fail. Tests escritos primero (25 tests, REQ-03-01..10).
- Implementación: src/pages/search.astro (prerender, índice embebido con
  JSON.stringify + escape <\/script, Layout title="Búsqueda") +
  src/components/search-results/{search-results.astro,search-results-controller.ts}
  (guía/empty/grid/paginación por data-*, URLSearchParams q, searchIndex del
  dominio, document.title con término, limpiar elimina q, paginación sin
  recarga) + src/styles/search-results.css (solo tokens existentes).
- VERDE: test feature 25/25; suite completa 300/300 (275 + 25);
  check-format FORMATO ✔; audit-design-tokens AUDIT ✔; ./init.sh
  "El entorno está perfecto" (incluye build).
- Build verificado: dist/client/search/index.html (ruta /search) con el
  índice serializado (JSON válido, sin </script sin escapar), el controlador
  embebido inline (minificado) y el CSS inlined.
- Líneas: search.astro 28, search-results.astro 28, controller 98,
  search-results.css 54 (todas ≤100).
- Informe: progress/impl_03_search-dedicated-view.md. Sigue in_progress: el
  APPROVED del reviewer la marca done.

## Cierre feature 3 (2026-08-18, implementer)

- 2026-08-18 (implementer, feature 3, cierre): CERRADA —
  progress/review_03_search-dedicated-view.md con Veredicto APPROVED y
  "Cambios requeridos: Ninguno" (verificado en disco). Status de feature 3 en
  feature_list.json: done (cambiado de in_progress; la feature se conserva en
  el array). node scripts/check-format.mjs en verde tras el cambio y
  bash ./init.sh "El entorno está perfecto" (suite 300/300 + build). Resumen:
  vista /search?q= prerendered con índice embebido (escape <\/script) y
  filtrado client-side; deep linking, guía sin q, empty state con limpiar,
  paginación sin recarga, tarjetas → /posts/[id]; componente canónico
  search-results reutilizable por la feature 5. ROJO ERR_MODULE_NOT_FOUND →
  VERDE 25/25; suite 300/300; audit de tokens y ./init.sh verdes; build con
  ruta /search verificada. Siguiente pendiente: feature 4 search-bar-header
  (depende de 2, done).

### Evolución (implementer, 2026-08-18)

- ROJO capturado: node --test tests/hero-profile-repository.test.mjs →
  exit 1, 8 pass / 1 fail (REQ-31-01/REQ-31-04; actual
  '/assets/moises-hero.jpg' vs expected 'assets/moises-hero.jpg').
- Ajuste aplicado (único cambio, línea 34 del fixture):
  image: 'assets/moises-hero.jpg' → image: '/assets/moises-hero.jpg'
  (idéntico a src/data/hero.json; REQ-01-01/02; src/ NO tocado, REQ-01-04).
- VERDE: test individual 9/9 pass; suite completa pnpm test 258/258;
  check-format FORMATO ✔; ./init.sh "El entorno está perfecto".
- Informe: progress/impl_01_hero-test-fixture-align.md (rojo/verde, cambio
  exacto, src/ intacto salvo la línea en blanco preexistente de
  src/styles/hero-card.css de un ciclo abortado).
- Feature 1 sigue in_progress: el APPROVED del reviewer lo marca done.

### Evolución (implementer, 2026-08-18, feature 4 search-bar-header)

- Feature 4 marcada in_progress en feature_list.json (2026-08-18).
- ROJO capturado: node --test tests/search-bar-header.test.mjs → exit 1,
  ERR_MODULE_NOT_FOUND (src/components/search-bar/search-bar.ts no existe),
  0 pass / 1 fail. Tests escritos primero (20 tests, REQ-04-01..08 +
  restricciones del arnés).
- Implementación: src/components/search-bar/{search-bar.astro,
  search-bar.ts} (UI sin lógica + control puro: isFilled, searchUrl,
  submitQuery, changeEventName, activeQuery, emitChange, clearQuery,
  initSearchBar) + src/styles/search-bar.css (solo tokens de design.md) +
  Layout.astro integra <SearchBar /> en el <nav> (layout 34 → 36 líneas).
  Navegación Enter con navigate() de astro:transitions/client (view
  transitions, Decisión 3); evento search:change con detail { term } para
  la portada (REQ-04-07); API clara para la feature 6 (clearQuery,
  activeQuery).
- VERDE: test feature 20/20; suite completa 320/320 (300 + 20);
  check-format FORMATO ✔; audit-design-tokens AUDIT ✔; ./init.sh
  "El entorno está perfecto" (incluye build).
- Build verificado: barra en el header de TODAS las páginas (/, /about,
  /search, /posts/*) con input aria-label y botón X aria-label; bundle del
  control con search:change + is-filled + navigate del ClientRouter.
- Líneas: search-bar.astro 21, search-bar.ts 64, search-bar.css 75,
  Layout.astro 36 (todas ≤100).
- Informe: progress/impl_04_search-bar-header.md. Sigue in_progress: el
  APPROVED del reviewer la marca done.

## Cierre feature 4 (2026-08-18, implementer)

- 2026-08-18 (implementer, feature 4, cierre): CERRADA —
  progress/review_04_search-bar-header.md con Veredicto APPROVED y "Cambios
  requeridos: Ninguno" (verificado en disco). Status de feature 4 en
  feature_list.json: done (cambiado de in_progress; la feature se conserva
  en el array). node scripts/check-format.mjs en verde tras el cambio y
  bash ./init.sh "El entorno está perfecto" (suite 320/320 + build).
  Resumen: barra de búsqueda en el header del Layout (search-bar.astro 21 +
  search-bar.ts 64 con funciones puras + search-bar.css 75 con tokens
  existentes); X visible solo con texto con retorno de foco; Enter →
  /search?q= con navigate de astro:transitions/client (view transitions
  conservadas); CustomEvent search:change para la portada; aria-labels
  accesibles. ROJO ERR_MODULE_NOT_FOUND → VERDE 20/20; suite 320/320; audit
  de tokens e ./init.sh verdes. Siguiente pendiente: feature 5
  search-landing-live-transition (depende de 3 y 4, done).

## Cierre feature 1 (2026-08-18, implementer)

- 2026-08-18 (implementer, feature 1, cierre): CERRADA —
  progress/review_01_hero-test-fixture-align.md con Veredicto APPROVED y
  "Cambios requeridos: Ninguno" (verificado en disco). Status de feature 1 en
  feature_list.json: done (cambiado de in_progress; la feature se conserva en
  el array). node scripts/check-format.mjs en verde tras el cambio. Siguiente
  pendiente: feature 2 search-domain (sin deps).
- Feature 2 search-domain: dominio TS puro (normalización, coincidencia,
  orden por fecha, paginación, índice) testeable con node:test.
- Feature 3 search-dedicated-view: /search?q= prerendered con deep linking,
  resultados, empty state y paginación.
- Feature 4 search-bar-header: barra en el header del Layout (X, foco, Enter).
- Feature 5 search-landing-live-transition: live search en la portada.
- Feature 6 search-keyboard-escape: Escape limpia/cierra la búsqueda.

### Backlog y specs creadas (spec_author, 2026-08-18)

- Features dadas de alta en feature_list.json (todas pending):
  1 hero-test-fixture-align, 2 search-domain, 3 search-dedicated-view,
  4 search-bar-header, 5 search-landing-live-transition, 6 search-keyboard-escape.
- Specs creadas: specs/01_hero-test-fixture-align/requirements.md,
  specs/02_search-domain/requirements.md, specs/03_search-dedicated-view/
  (requirements.md + design.md), specs/04_search-bar-header/ (requirements.md
  + design.md), specs/05_search-landing-live-transition/ (requirements.md +
  design.md), specs/06_search-keyboard-escape/requirements.md.
- Eliminadas las 9 carpetas vacías del intento abortado
  (specs/01_vista-busqueda-dedicada, specs/01_vista-busqueda-dedida,
  specs/02..08_*): no colisionan con las specs nuevas del ciclo.
- Informe de análisis: progress/research/global-search-landing.md.
- Nota: src/styles/hero-card.css conserva un cambio trivial en working tree
  (línea en blanco) de un ciclo abortado; no genera feature (humano confirmó
  que el código es correcto).

## Evolución feature 2 (implementer, 2026-08-18)

- Feature 2 search-domain marcada in_progress en feature_list.json.
- ROJO capturado: node --test tests/search-domain.test.mjs → exit 1,
  ERR_MODULE_NOT_FOUND (src/domain/search/*.ts no existen), 0 pass / 1 fail.
- Tests escritos primero: tests/search-domain.test.mjs (17 tests,
  REQ-02-01..09, fixtures con fechas españolas y diacríticos).
- Implementación: src/domain/search/{normalize,parse-date,index,search}.ts
  (TS puro; API: normalizeText, parseSpanishDate, buildSearchIndex,
  SearchIndexEntry, PAGE_SIZE=6, searchIndex, searchPosts, SearchPage).
- Decisiones: PAGE_SIZE=6; fecha inválida/ausente → '' (ordena al final en
  desc); consulta vacía coincide con todo el catálogo; índice plano con
  datos de tarjeta (img/readtime/author) para la UI (features 3/5).
- VERDE: node --test tests/search-domain.test.mjs 17/17; suite completa
  pnpm test 275/275 (258 + 17); check-format FORMATO ✔; ./init.sh
  "El entorno está perfecto" (incluye pnpm build).
- REQ-02-09: normalize.ts 12 líneas, parse-date.ts 36, index.ts 44,
  search.ts 61 (todas ≤100).
- Informe: progress/impl_02_search-domain.md. Sigue in_progress: el
  APPROVED del reviewer la marca done.
- 2026-08-18 (implementer, feature 7, cierre): CERRADA — progress/review_07_root-term-search.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 7 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: catch-all on-demand src/pages/[...term].astro (31 líneas, prerender=false) — /loquesea filtra el catálogo con deep linking y empty state (nunca 404); term-route.ts (33 líneas) con termFromPathname/clearDestination; controlador compartido con cambios aditivos (q gana, si no pathname; limpiar → raíz); reutiliza Layout + search-results; /search?q= y barra intactas. ROJO ERR_MODULE_NOT_FOUND → VERDE 21/21; suite 381/381; audit tokens e ./init.sh verdes. Siguiente pendiente: feature 8 architecture-nav-link (depende de 7, done).
- 2026-08-18 (implementer, feature 8, cierre): CERRADA — progress/review_08_architecture-nav-link.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 8 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs en verde tras el cambio. Resumen breve: enlace Arquitectura → /arquitectura en el navbar (Layout.astro 39 líneas, +1 línea; aria-current=page en /arquitectura y /arquitectura/ como patrón About; Home/About/@moibaldenegro/SearchBar conservados; sin CSS/JS nuevos). ROJO 3 fail/2 pass → VERDE 5/5; suite 386/386; audit tokens e ./init.sh verdes. **Ciclo de ruta dinámica CERRADO: features 7-8 done, backlog 0 pendientes.**

---

## Sesión 2026-08-18 — Ruta dinámica de búsqueda por término (/loquesea)

### Resumen ejecutivo

- El humano corrigió la interpretación inicial (índice estático /arquitectura):
  la ruta debe ser dinámica slash+argumento — `/loquesea` filtra el catálogo por
  ese término (nunca 404). El ciclo implementa y descubre esa ruta.
- Feature 7 root-term-search: catch-all on-demand `src/pages/[...term].astro`
  (prerender=false, SSR) con índice embebido, deep linking, empty state con el
  término y coexistencia intacta con `/search?q=`; módulos `term-route.ts` y
  controlador compartido con cambios aditivos.
- Feature 8 architecture-nav-link: enlace `Arquitectura` → `/arquitectura` en el
  navbar del Layout único (39 líneas, +1 línea), aria-current="page" con el
  mismo patrón que About, sin CSS ni JS nuevos (hereda layout.css).
- Ciclo test-first rojo/verde en ambas features: ROJO (f7 ERR_MODULE_NOT_FOUND;
  f8 3 fail/2 pass) → VERDE (f7 21/21, f8 5/5); suite final 386/386; check-format,
  audit-design-tokens y `./init.sh` ("El entorno está perfecto") en verde.
- Artefactos permanentes: specs/07_root-term-search/, specs/08_architecture-nav-link/,
  progress/impl_07_root-term-search.md, progress/impl_08_architecture-nav-link.md,
  progress/review_07_root-term-search.md, progress/review_08_architecture-nav-link.md,
  progress/research/arquitectura-404-route.md. Backlog: features 1-8 done, 0 pendientes.

### Bitácora del ciclo (desde progress/current.md)

- 2026-08-18: spec_author analizó la petición del 404 en /arquitectura. Features 7 (root-term-search) y 8 (architecture-nav-link) dadas de alta como pending con specs en specs/07_root-term-search/ y specs/08_architecture-nav-link/. Análisis en progress/research/arquitectura-404-route.md.
- 2026-08-18: CORRECCIÓN del humano: la ruta debe ser dinámica (slash+argumento), no un índice estático. Reescritas features 7/8: catch-all src/pages/[...term].astro on-demand (SSR, verificado: prioridad de rutas Astro no colisiona con /, /about, /search, /posts/[id]; getCollection disponible en SSR; precedente HTB stats). Se eliminó la spec obsoleta specs/07_architecture-index-page/. Coexistencia con /search?q= conservada; barra de búsqueda sin cambios (decisión D6).
- 2026-08-18 (implementer): feature 7 en curso. Tests escritos primero (tests/root-term-search.test.mjs) y ROJO capturado. Implementación en curso: term-route.ts, cambios aditivos en el controlador, [...term].astro.
- 2026-08-18 (implementer): feature 7 implementada y VERDE — test feature 21/21, suite completa 381/381 (360 previos + 21 nuevos, sin romper search-dedicated-view ni search-landing-live-transition), check-format ✔, audit-design-tokens ✔, ./init.sh → "El entorno está perfecto" (build OK: la página on-demand vive en dist/server, sin dist/client/arquitectura/index.html). NO marcada done: espera reviewer. Informe en progress/impl_07_root-term-search.md.
- 2026-08-18 (implementer, feature 7, cierre): CERRADA — progress/review_07_root-term-search.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 7 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs y bash ./init.sh en verde tras el cambio. Siguiente pendiente: feature 8 architecture-nav-link (depende de 7, done).
- 2026-08-18 (implementer): feature 8 en curso (status in_progress en feature_list.json). Test escrito PRIMERO (tests/architecture-nav-link.test.mjs, 5 tests de inspección por regex sobre Layout.astro/layout.css) y ROJO capturado: 3 fail (REQ-08-01, REQ-08-02/03, REQ-08-05 — el enlace no existe), 2 pass (REQ-08-04, ≤100 líneas). Implementación: +1 línea en src/layouts/Layout.astro (enlace Arquitectura → /arquitectura entre About y @moibaldenegro, aria-current con la misma condición que About: /arquitectura y /arquitectura/ → 'page', resto → undefined; design.md D1/D3). Layout.astro: 39 líneas. Informe en progress/impl_08_architecture-nav-link.md. NO marcada done: espera reviewer.
- 2026-08-18 (implementer, feature 8, cierre): CERRADA — progress/review_08_architecture-nav-link.md con Veredicto APPROVED y sin cambios requeridos (verificado en disco). Status de feature 8 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs y bash ./init.sh en verde tras el cambio. **TODAS las features del ciclo (7-8) done; backlog sin pendientes.**

## Sesión 2026-08-18 — Feature 9 search-results-list-mode (modo lista en resultados de búsqueda)

### Resumen ejecutivo

- Petición del humano: "no queremos que salgan las tarjetas gigantes" en los resultados de búsqueda; diseñar items nuevos para un modo lista atractivo que sigan navegando al detalle `/posts/[id]`.
- Feature 9 search-results-list-mode: rediseño de la presentación canónica (features 3/5/7) a modo lista ÚNICO sin toggle (D1) — `ul.search-results__list[data-search-list]` con `li.search-results__item` en una columna, hairline `--color-border`, miniatura 112×63 (16:9) con radio nuevo `--radius-thumb: 10px`, título enlazado con stretched link (fila entera navega a `/posts/[id]`), meta (autor • min de lectura), descripción clamp 2 líneas, tags píldoras pequeñas; hover con wash `--color-surface` + título subrayado; ≤768px oculta miniatura y reduce espaciado. Guía, empty state con limpiar, paginación sin recarga y enlaces `/posts/[id]` conservados (REQ-09-11/12).
- Extracción (D3): `cardHtml`+`esc` → `src/components/search-results/item-html.ts` (27 líneas, precedente term-route.ts); controlador 100 → 84 líneas; rename D5 `data-search-grid`/`.search-results__grid` → `data-search-list`/`.search-results__list` en componente, controlador, panel en vivo (`search-live.*`) y `search-escape.ts` (alterna `list`). `search-results.css` reescrita (62 líneas, solo tokens); `tokens.css` 87 → 91 líneas con el token aprobado `--radius-thumb: 10px` (justificado en design.md).
- Tests: nuevo `tests/search-results-list-mode.test.mjs` (14 tests, REQ-09-01..12 + restricciones); ajustados los tests 03/05/07/06 solo en lo que el rediseño cambia (clases y wording cuadrícula→lista) y los 5 tests que fijaban tokens.css en 87 líneas (REQ-17-09/26-07/39-09/40-11/42-09) al nuevo estado canónico 91 líneas, con justificación por test en el informe (precedente REQ-43-06).
- Ciclo test-first rojo/verde: ROJO (test nuevo ERR_MODULE_NOT_FOUND por item-html.ts inexistente + 7 fallos en tests ajustados) → VERDE (feature 14/14; suite completa 400/400 = 386 previos + 14 nuevos; check-format ✔, audit-design-tokens ✔, `./init.sh` → "El entorno está perfecto"; build verificado: `ul.search-results__list[data-search-list]` en dist/client/search/index.html y dist/client/index.html, cero data-search-grid en dist, CSS empaquetado con --radius-thumb y hover wash).
- Artefactos permanentes: specs/09_search-results-list-mode/, progress/research/search-results-list-mode.md, progress/impl_09_search-results-list-mode.md, progress/review_09_search-results-list-mode.md. Backlog: features 1-9 done, 0 pendientes.

### Bitácora del ciclo (desde progress/current.md)

- 2026-08-18: spec_author analiza la petición "modo lista en resultados de búsqueda": investigación en progress/research/search-results-list-mode.md; alta de la feature 9 search-results-list-mode (pending) en feature_list.json; specs en specs/09_search-results-list-mode/ (requirements.md EARS + design.md con token nuevo --radius-thumb justificado); wording de presentación actualizado en REQ-03-04/03-09, REQ-07-06 y acceptance de features 3/7 (tarjeta → item, precedente REQ-43-06); comportamiento (resultados, empty, paginación, /posts/[id]) conservado. Pendiente: implementer.
- 2026-08-18 (implementer): feature 9 en curso (pending → in_progress). Entorno verde (./init.sh). Plan escrito. Comienza el ciclo rojo: escritura de tests/search-results-list-mode.test.mjs + ajuste de tests 03/05/07.
- 2026-08-18 (implementer): ROJO capturado: test nuevo falla (item-html.ts inexistente, ERR_MODULE_NOT_FOUND) y 7 fallos en los tests ajustados (root-term-search 2, search-keyboard-escape 1, search-landing-live-transition 3, search-dedicated-view no carga por import inexistente).
- 2026-08-18 (implementer): implementación completa: item-html.ts (27 líneas) con itemHtml+esc; controlador 100→84 líneas importando itemHtml y pintando en [data-search-list]; search-results.astro y search-live.astro con ul[data-search-list]; search-live.ts importa itemHtml (99 líneas); search-escape.ts alterna 'list' en vez de 'grid'; search-results.css reescrita al modo lista (62 líneas, solo tokens); tokens.css 87→91 líneas con --radius-thumb: 10px.
- 2026-08-18 (implementer): ajuste de los 5 tests de features previas que fijaban tokens.css en 87 líneas (REQ-17-09/26-07/39-09/40-11/42-09) al nuevo estado canónico 91 líneas, con justificación documentada (precedente REQ-43-06: el artefacto sigue a la presentación real; el token fue aprobado en el design.md de la feature 9).
- 2026-08-18 (implementer): VERDE completo: test feature 14/14; suite 400/400 (386 + 14 nuevos); check-format ✔; audit-design-tokens ✔; ./init.sh → "El entorno está perfecto"; build verificado: dist/client/search/index.html y dist/client/index.html con ul.search-results__list[data-search-list hidden], cero data-search-grid en dist, CSS empaquetado con .search-results__list, --radius-thumb y hover wash. Todos los archivos src/ ≤100 líneas. Informe en progress/impl_09_search-results-list-mode.md. NO marcada done: espera reviewer.
- 2026-08-18 (implementer, feature 9, cierre): CERRADA — progress/review_09_search-results-list-mode.md con Veredicto APPROVED (línea 3) y "Cambios requeridos: Ninguno" (verificado en disco). Status de feature 9 en feature_list.json: done (cambiado de in_progress; la feature se conserva en el array). node scripts/check-format.mjs y bash ./init.sh en verde tras el cambio. **TODAS las features del ciclo (1-9) done; backlog sin pendientes.**

## Sesión 2026-08-20 — Fix iframe de video en artículos + restauración enlace Home

Petición humana: «el iframe no agarra los estilos, queremos que se vea bien presentable, por ejemplo del article 02». El líder detectó además una regresión preexistente del navbar (suite en rojo).

- **spec_author**: análisis en `progress/research/iframe-video-styles.md` (causa raíz: `article.css` solo se importaba en `index.astro`, no en `posts/[id].astro` → iframe sin estilos; valores hardcodeados 12px/500px; clases muertas `.article`/`.prose`; enlace Home perdido del navbar en reescrituras manuales). Alta de features 11 y 12 (independientes) + specs/11 y specs/12.
- **Feature 11 — article-iframe-styles (done, APPROVED)**: import de `article.css` en `src/pages/posts/[id].astro`, retirado el import muerto de `index.astro`, hoja reescrita con tokens (`var(--radius-card)`/`var(--gap-card)`), scoping `.post__content .video-container`, sin `min-height` ni radio en el iframe, sin clases muertas (18 líneas). Tests: `tests/article-iframe-styles.test.mjs` (9, REQ-11-01..09), ciclo rojo 7 fail → verde 9/9. Artefactos: `progress/impl_11_article-iframe-styles.md`, `progress/review_11_article-iframe-styles.md`.
- **Feature 12 — restore-navbar-home-link (done, APPROVED)**: `<a href="/">Home</a>` plano restaurado en el navbar de `Layout.astro` (sin clase/style/aria-current; el logo ya marca `/`). Tests existentes REQ-08-04/05 pasan; nuevos `tests/restore-navbar-home-link.test.mjs` (REQ-12-01..05). Artefactos: `progress/impl_12_restore-navbar-home-link.md`, `progress/review_12_restore-navbar-home-link.md`.
- **Cierre**: suite 424/424 en verde, `./init.sh` ✔ (entorno perfecto), audit-design-tokens ✔, build ✔.
- Pendiente: feature 10 `client-init-on-navigation` sigue `in_progress` (sesión previa sin artefactos; no se tocó).

## Sesión 2026-08-20 — Navbar «como estaba» (sin logo) + saltito del nav

Petición humana (2 problemas): (1) «el home fue reemplazado por el logo, ajusta lo que tengas que ajustar para que quede como estaba, era correcto»; (2) «arregla un pequeño saltito que se ve por ejemplo al clickar cualquier parte del nav, se ve un pequeño movimiento a la derecha, elimínalo».

- **spec_author**: análisis en `progress/research/navbar-home-logo-jump.md`. Problema A: el commit 686a7cc reemplazó el enlace Home de texto (estado 72e5c52) por el ancla del logo; la feature 12 lo había restaurado sin aria-current. Problema B: con ClientRouter el scrollbar estilizado (10px) aparece/desaparece entre páginas de alturas distintas → el contenido centrado salta ~5px a la derecha. Alta de features 13 y 14 + specs.
- **Feature 13 — remove-navbar-logo (done, APPROVED)**: retirado el ancla del logo de `Layout.astro`; el enlace Home asume `aria-current` de la portada con degradado a undefined (REQ-37-03 intacto: Home + About + Arquitectura). Solo se ajustaron REQ-12-03/04 de `tests/restore-navbar-home-link.test.mjs` (justificación REQ-43-06 en el encabezado); layout-refactor/architecture-nav-link/visual-polish sin cambios. Asset `public/assets/mxvi_logo.webp` conservado. Incidente documentado: el workerd del dev server reescribió `article.css`; restaurada la versión tokenizada de la feature 11 (verificada por el reviewer). Artefactos: `progress/impl_13_remove-navbar-logo.md`, `progress/review_13_remove-navbar-logo.md`.
- **Feature 14 — fix-navbar-jump (done, APPROVED)**: `html { scrollbar-gutter: stable; }` en `src/styles/layout.css` (69→75 líneas) reserva el hueco del scrollbar; se conservan `::-webkit-scrollbar`; sin `overflow-y: scroll` (descartada), sin JS, sin tocar Layout.astro. Tests: `tests/fix-navbar-jump.test.mjs` (6, REQ-14-01..05). Artefactos: `progress/impl_14_fix-navbar-jump.md`, `progress/review_14_fix-navbar-jump.md`.
- **Cierre**: suite completa en verde (429 tests), `./init.sh` → «El entorno está perfecto» ✔, build ✔.
- Pendiente: feature 10 `client-init-on-navigation` sigue `in_progress` (sesión previa sin artefactos; no se tocó).

## Sesión 2026-08-20 — Corrección del humano: el logo ES el Home (se retira el texto Home)

El humano corrigió la interpretación de la sesión anterior: «claro, el Logo te dije claramente que reemplazaba al Home, el home se va». La feature 13 (remove-navbar-logo) fue en la dirección equivocada; la intención real siempre fue el diseño 686a7cc: el ancla del logo es el enlace Home del navbar y el texto «Home» no debe existir.

- **spec_author**: análisis en `progress/research/navbar-home-logo-revert.md` (decisión D: revertir el efecto de la feature 13 sobre marcado y tests, precedente REQ-43-06). Alta de la feature 15 + specs/15.
- **Feature 15 — navbar-logo-home (done, APPROVED)**: `Layout.astro` queda con el ancla del logo (`aria-current` de la portada) + About + Arquitectura + @moibaldenegro + SearchBar, sin texto Home (46 líneas). Ajustados con justificación REQ-43-06: `tests/architecture-nav-link.test.mjs` (REQ-08-04), `tests/layout-refactor.test.mjs` (REQ-08-05), `tests/restore-navbar-home-link.test.mjs` (REQ-12-03/04), `tests/remove-navbar-logo.test.mjs` (REQ-13-xx). Nuevo `tests/navbar-logo-home.test.mjs` (REQ-15-01..07). Visual-polish REQ-37-03 y feature 14 (scrollbar-gutter) intactos y verdes. Un intento de implementación terminó vacío sin artefacto → re-lanzado con protocolo anti-silencio (artefacto `progress/impl_15_navbar-logo-home.md` en disco). Artefactos: `progress/impl_15_navbar-logo-home.md`, `progress/review_15_navbar-logo-home.md`.
- **Cierre**: suite completa en verde, `./init.sh` → «El entorno está perfecto» ✔.
- Pendiente: feature 10 `client-init-on-navigation` sigue `in_progress` (sesión previa sin artefactos; no se tocó).

## Sesión 2026-08-20 — Video del artículo más pequeño y centrado en desktop

Petición humana: «en la versión más grande en desktop, el iframe no quiero que se vea tan grande, un poco más pequeño y centrado, esto solo en desktop».

- **spec_author**: análisis en `progress/research/video-desktop-width.md`. Causa: `.post` llega a `min(1500px, 95%)` en desktop y `.video-container` es full-width → video ~1400px. Alta de la feature 16 + specs/16 (REQ-16-01..09).
- **Feature 16 — video-desktop-width (done, APPROVED)**: `@media (min-width: 769px)` en `src/styles/article.css` acota el contenedor a `max-width: var(--video-max-width)` (token nuevo `--video-max-width: 640px` en tokens.css, grupo Contenedor, justificado — precedente --radius-thumb) y lo centra con `margin: var(--gap-card) auto`. En ≤768px se conserva el full-width (REQ-11 intactos). 5 tests con aserción de líneas de tokens.css actualizados (91→93) con justificación REQ-43-06. Test nuevo `tests/video-desktop-width.test.mjs`. Artefactos: `progress/impl_16_video-desktop-width.md`, `progress/review_16_video-desktop-width.md`.
- **Cierre**: suite completa en verde, `./init.sh` → «El entorno está perfecto» ✔.
- Pendiente: feature 10 `client-init-on-navigation` sigue `in_progress` (sesión previa sin artefactos; no se tocó).

## Sesión 2026-08-20 — Los más antiguos primero en la búsqueda por término /<término>

Petición humana: «En las búsquedas cuando accedemos al /algo, queremos que los más antiguos aparezcan primero».

- **spec_author**: análisis en `progress/research/term-search-oldest-first.md`. D1: parámetro opcional `order?: 'desc'|'asc'` (default 'desc') en el dominio; D2: el controlador pasa 'asc' solo cuando `q === ''` (ruta /<término>) y lo propaga a la paginación; D3/D4: /search?q= y panel en vivo conservan desc (search-live.ts está 100/100 y no se toca). Alta de la feature 17 + specs/17 (sin design.md, sin UI).
- **Feature 17 — term-search-oldest-first (done, APPROVED)**: `search.ts` 61→71 líneas (SearchOrder, order default 'desc', byDateAsc); `search-results-controller.ts` 84→91 líneas (orden por origen del término, propagado a prev/next). Ningún test existente cambió (default preservado, sin precedente REQ-43-06). Test nuevo `tests/term-search-oldest-first.test.mjs` (11 tests, rojo 7 fail → verde 11/11). Artefactos: `progress/impl_17_term-search-oldest-first.md`, `progress/review_17_term-search-oldest-first.md`.
- **Cierre**: suite completa en verde, `./init.sh` → «El entorno está perfecto» ✔.
- Pendiente: feature 10 `client-init-on-navigation` sigue `in_progress` (sesión previa sin artefactos; no se tocó).

---

## Sesión 2026-09-17 — Cierre feature 18 next-post-data

- Feature 18 next-post-data cerrada en done (review APPROVED en progress/review_18.md, verificado en disco).
- Implementación (informe en progress/impl_18.md): campo opcional next en esquema architecture, entidad Post (readonly next: string | null) y PostsRepository con validador expectNext (ausente -> null; formato distinto de /posts/<id> -> PostsDataError); cadena curada 00-agilismo -> 01-diseño-detallado -> 02-principios-del-diseno-de-software -> 03-principios solid (último sin next).
- TDD: tests/next-post-data.test.mjs 6/7 en rojo antes, 16/16 en verde después (con posts-repository); fixture EXPECTED_POST alineado con next: null (precedente REQ-43-06/36).
- Cierre: ./init.sh en verde (entorno, formato, tests 466/466, build); feature 18 en done conservada en el array; feature 19 next-post-button queda pending desbloqueada (depends_on [18] satisfecho).

## Sesión 2026-09-17 — Cierre feature 19 next-post-button

- Feature 19 next-post-button cerrada en done (review APPROVED en progress/review_19.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_19.md): pie de navegación en `src/pages/posts/[id].astro` (54 → 60 líneas, `{post.next && (...)}` con enlace `href={post.next}` de texto "Siguiente artículo", destino solo desde la entidad Post vía PostsRepository, sin JS) + hoja nueva `src/styles/post-next.css` (35 líneas, solo tokens existentes, media 768px a ancho completo; `post.css` intacto en 100 líneas).
- TDD: tests/next-post-button.test.mjs (7 tests REQ-19-01..06 + convención) 0/7 en rojo antes, 7/7 en verde después.
- Cierre: ./init.sh en verde (entorno, formato, tests 100%, build); feature 19 en done conservada en el array.

## Sesión 2026-09-17 — Cierre feature 20 related-posts-data

- Feature 20 related-posts-data cerrada en done (review APPROVED en progress/review_20.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_20.md): campo opcional related en esquema architecture, entidad Post (readonly related: readonly string[] | null) y PostsRepository con validador expectRelated (ausente -> null; no-arreglo/vacío/items no-/posts/<id> -> PostsDataError); último artículo 03-principios_solid.md con related de 2 rutas; posts-repository.ts compactado a 98 líneas.
- TDD: tests/related-posts-data.test.mjs 6/7 en rojo antes, 7/7 en verde después; fixture EXPECTED_POST alineado con related: null (precedente REQ-43-06 de la feature 18).
- Cierre: ./init.sh en verde (entorno, formato, tests 480/480, build); feature 20 en done conservada en el array; feature 21 related-posts-list queda desbloqueada en datos (depends_on [19, 20] ambos done).

## Sesión 2026-09-17 — Cierre feature 22 next-related-hrefs-fix

- Feature 22 next-related-hrefs-fix cerrada en done (review APPROVED en progress/review_22.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_22.md): solo frontmatter en src/content/architecture/*.md — 00 next → /posts/01-diseño_detallado, 01 next → /posts/02-principios, 02 next → /posts/03-principios_solid, 03 related → [/posts/00-agilismo, /posts/01-diseño_detallado], más related cruzado en 00/01/02 (00→02, 01→03, 02→00); sin tocar src/domain, src/pages, src/styles ni repositorio.
- TDD: tests/next-related-hrefs-fix.test.mjs (REQ-22-01..07) 0/7 en rojo antes, 7/7 en verde después (45/45 con suites vecinas); CHAIN de tests/next-post-data.test.mjs alineado a los entry.id reales (precedente REQ-43-06).
- Cierre: ./init.sh en verde (entorno, formato, tests 100%, build); feature 22 en done conservada en el array; feature 23 related-titles-design-align queda desbloqueada (depends_on [22] satisfecho).

## Sesión 2026-09-17 — Cierre feature 23 related-titles-design-align

- Feature 23 related-titles-design-align cerrada en done (review APPROVED en progress/review_23.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_23.md): módulo nuevo src/domain/related-titles.ts (23 líneas, resolveRelatedTitles(posts, related) → RelatedLink[] {href, title}); [id].astro 73/100 (import + relatedLinks por props desde getStaticPaths, marcado href={item.href}>{item.title}, prerender intacto, cero JS); post-next.css 91/100 (botón superficie+borde+texto claro, lista con hairline/wash/subrayado, responsive 768px, solo tokens); post.css 100/100 y posts-repository.ts intactos.
- TDD: tests/related-titles-design-align.test.mjs (REQ-23-01..07) en rojo antes (ERR_MODULE_NOT_FOUND) y en verde después (área tocada 24/24); tests REQ-21-01/04 ajustados al título con justificación precedente REQ-43-06 (destinos sin cambios).
- Cierre: ./init.sh en verde (entorno, formato, tests 504/504, build); feature 23 en done conservada en el array.

## Sesión 2026-09-17 — Feature 24 `related-card-model` (cierre)

- Feature 24 related-card-model cerrada en done (review APPROVED en progress/review_24.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_24.md): src/domain/related-titles.ts (23 → 29 líneas, ≤100 OK) — RelatedLink extendido con readonly img/author/readtime; resolveRelatedTitles los resuelve desde los Posts con el mismo Map por href (/posts/<id>); href desconocido degrada a { href, title: href, img: '', author: '', readtime: 0 } sin lanzar. Sin tocar content.config.ts, entidad Post, posts-repository.ts (98/100), frontmatter, [id].astro ni post-next.css (eso es feature 25). Sin JS de runtime, sin dependencias, sin tokens.
- TDD: tests/related-card-model.test.mjs nuevo (REQ-24-01..06 + convención) en rojo antes (3 pass / 4 fail: REQ-24-01/02/03/05) y en verde después (área tocada 16/16 con related-titles-design-align); tests REQ-23-01/02 ajustados a la forma extendida con justificación precedente REQ-43-06 en cabecera (destinos sin cambios).
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests al 100%, build); feature 24 en done conservada en el array. Siguiente implementable: 25 related-cards-present (depends_on [24]).

## Sesión 2026-09-17 — Feature 25 `related-cards-present` (cierre)

- Feature 25 related-cards-present cerrada en done (review APPROVED en progress/review_25.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_25.md): [id].astro (73 → 79 líneas) pinta una card por recomendado desde el view-model de la 24 — thumb /assets/content/<img> + título como texto del enlace + meta Por X • N min; frontmatter intacto (regla 8), prerender intacto, cero JS. post-next.css (91 → 25 líneas, reescritura compacta sin pedir blocked): rejilla 2 col, thumb canónico 112×63 con --radius-thumb, hairline var(--color-border), wash var(--color-surface) en hover, subrayado del título; responsive 1 col a ancho completo con miniatura oculta en ≤768px (precedente REQ-09-09); solo tokens; post.css 100/100 y repositorio intactos.
- TDD: tests/related-cards-present.test.mjs nuevo (REQ-25-01..06 + convención) en rojo antes (4 pass / 3 fail: REQ-25-01/02/04) y en verde después (scope 38/38 con suites 19/21/23/24 intactas); convención REQ-24 que anticipaba esta feature invertida a assert.match con justificación precedente REQ-43-06.
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests al 100%, build); feature 25 en done conservada en el array. Ciclo de recomendados 22/23/24/25 completo.
- Nota de cierre (flake preexistente, ajeno a la 25): tras el cierre, una corrida de ./init.sh falló SOLO en tests/hero-ui-refactor.test.mjs REQ-09-05 con ENOENT sobre src/styles/tmp-audit.css — carrera entre cleanup-dead-code.test.mjs REQ-12-06 (crea/borra esa hoja temporal en paralelo) y el walker de src/ del test del hero. Re-corrida inmediata en verde (formato + tests 100% + build). Ningún archivo de la 25 implicado.

## Sesión 2026-09-17 — Feature 26 `next-related-hrefs-reales` (cierre)

- Feature 26 next-related-hrefs-reales cerrada en done (review APPROVED en progress/review_26.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_26.md): solo frontmatter *.md — 00 next→/posts/01-diseño-detallado + related→/posts/02-principios-del-diseno-de-software; 01 next→/posts/02-principios-del-diseno-de-software + related→/posts/03-principios solid; 02 next→/posts/03-principios solid (conserva related /posts/00-agilismo, HIT); 03 related→[/posts/00-agilismo, /posts/01-diseño-detallado]. Verdad de terreno: post.id=entry.id=slug=segmento de ruta (la 22 asumió nombre de fichero y rompió 6 de 8 hrefs). Sin tocar esquema/entidad/repositorio/vista/CSS.
- TDD: tests/next-related-hrefs-reales.test.mjs nuevo (REQ-26-01..05) en rojo antes (0 pass / 5 fail) y en verde después; REQ-26-05 valida contra post.id de PostsRepository (loader inyectado, ids = slugs), sin filenames. Ajustes con justificación REQ-43-06: tests/next-post-data.test.mjs (CHAIN a slugs reales) y tests/next-related-hrefs-fix.test.mjs (REQ-22-01..04 a slugs reales, entryIds() desde campo slug, REQ-22-07 estrechado a espacios perimetrales por el espacio canónico de `03-principios solid`). Fixtures sintéticos de 23/24 intactos para la 27.
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests 523/523, build); feature 26 en done conservada en el array. Siguiente implementable: 27 anchor-nunca-url (depends_on [26]).
- Nota de cierre (flake del arnés, ajeno a la 26): dos corridas de ./init.sh fallaron SOLO en el paso de tests y pasaron al reintentar sin cambios (pnpm test 523/523 directo, bash ./init.sh y ./init.sh final en verde) — misma clase de carrera paralela documentada en el cierre de la 25. Ningún archivo de la 26 implicado.

## Sesión 2026-09-17 — Feature 27 `anchor-nunca-url` (cierre)

- Feature 27 anchor-nunca-url cerrada en done (review APPROVED en progress/review_27.md, verificado en disco, sin cambios requeridos).
- Implementación (informe en progress/impl_27.md): src/domain/related-titles.ts (31 → 32 líneas, ≤100 OK) — resolveRelatedTitles pasa de degradar ({ href, title: href }) a filtrar con flatMap (href sin Post → []); conserva no-throw y related null → []. Sin tocar .astro ni CSS, sin JS de runtime.
- TDD: tests/anchor-nunca-url.test.mjs nuevo (REQ-27-01..04) en rojo antes (2 pass / 2 fail: REQ-27-01 2!==1, REQ-27-03 título=/posts/no-existe) y en verde después (área tocada 27/27 con suites 23/24/25 intactas); test REQ-24-03 ajustado al filtrado con justificación precedente REQ-43-06 en cabecera (destinos conocidos sin cambios).
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests al 100%, build); feature 27 en done conservada en el array.

## Sesión 2026-09-30 — Feature 28 `dependencies-registry-crlf` (cierre)

- Feature 28 dependencies-registry-crlf cerrada en done (review APPROVED en progress/review_28.md, verificado en disco, sin cambios requeridos). Alta por spec_author con spec en specs/28_dependencies-registry-crlf/requirements.md (REQ-28-01..10, sin design.md: no toca UI) y análisis en progress/research/validador-dependencias-crlf.md.
- Bloqueo previo de init.sh (3 checks en rojo) resuelto en dos partes. (a) Build: IN_MAINTENANCE faltaba porque .env está en .gitignore y no existe; el líder creó el .env local con IN_MAINTENANCE=false (NO versionado, no es change de la feature). (b) Formato + 3 tests: docs/dependencies.md está en CRLF y en JS el metacarácter . NO matchea \r (line terminator), así que las regex /^###\s+(.+)$/ y /^-\s*([a-z]+)\s*:\s*(.+)$/ de parseRegistry nunca matcheaban y devolvían un Map vacío → las 4 dependencias de package.json figuraban como no aprobadas.
- Fix (informe en progress/impl_28.md): scripts/validate-dependencies.mjs, 3 líneas (66 → 72 líneas, ≤100) — split(/\r?\n/) y grupos (.+?)\s*$ en las dos regex. docs/dependencies.md NO se toca (con core.autocrlf=true y sin .gitattributes el CRLF vuelve en el próximo checkout).
- TDD: tests/dependencies-registry-crlf.test.mjs nuevo (REQ-28-01..10) en rojo antes (9 fail con el parser restaurado a HEAD, reproducido en sandbox por el reviewer: 8 fail → 16/16 con el fix) y en verde después; aserciones de contrato de REQ-29 intactas (git diff vacío) y fixtures en node:os.tmpdir(), sin escrituras en el repo.
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests 549/549, build); feature 28 en done conservada en el array.
- Nota de cierre (flake preexistente, ajeno a la 28): una corrida de ./init.sh falló solo en tests (right tras cerrar el implementer) y las 4 siguientes dieron verde. Causa raíz identificada y preexistente (misma clase que en los cierres de las features 25 y 26): tests/cleanup-dead-code.test.mjs REQ-12-06 escribe y borra src/styles/tmp-audit.css dentro del repo mientras tests/hero-ui-refactor.test.mjs REQ-09-05 camina src/ en paralelo bajo node --test. El arreglo natural es el mismo patrón que aplica la 28 (fixture en node:os.tmpdir()). PENDIENTE DE DECISIÓN DEL LÍDER: abrir feature.
- Sin tocar por decisión propia: src/pages/about.astro aparece modificado en el working tree con un <section><h1>Articulos dedicados…</h1></section> añadido al final (duplica el h1 de la cabecera). No es cambio de esta sesión (la 28 solo toca scripts/ y tests/); se deja sin revertir por si es una edición humana en curso. worker-configuration.d.ts lo regenera pnpm build.
- NO se dio de alta la feature del .env.example (build de clon limpio: IN_MAINTENANCE sin default en astro.config.mjs): el espacio de REQ-29-xx ya lo usan scripts/validate-dependencies.mjs y tests/dependencies-registry.test.mjs (feature histórica 29 dependencies-registry). Queda documentado en §6 del research; si el humano lo aprueba, sería id 30.

## Sesión 2026-09-30 — Feature 30 `home-latest-articles-limit` (cierre)

- Feature 30 home-latest-articles-limit cerrada en done (review APPROVED en progress/review_30.md, verificado en disco, sin cambios requeridos). Requerimiento del usuario: "En la pagina principal queremos que se muestren solo los 3 articulos mas recientes". Alta por spec_author con spec en specs/30_home-latest-articles-limit/requirements.md (REQ-30-01..17, sin design.md: no toca UI) y análisis en progress/research/home-3-articulos-recientes.md. depends_on [].
- Implementación (informe en progress/impl_30.md): src/domain/latest-posts.ts NUEVO (22 líneas) — latestPosts(posts, limit = LATEST_POSTS_LIMIT = 3) con posts.slice(0, limit) (copia, no muta) y guarda Number.isInteger(limit) && limit > 0 → [] en otro caso. NO reordena: reutiliza el orden canónico por created de PostsRepository.getPosts() (comparador byCreatedDesc, una sola verdad). src/components/latest-articles.astro (frontmatter) solo aplica latestPosts(getPosts()): importa y pasa datos, sin slice/if/for (REQ-30-06). Sin JS de runtime, la sección se resuelve en build.
- Sin tocar: src/styles/latest-articles.css (97 líneas, rejilla de una columna, solo tokens) y src/domain/repositories/posts-repository.ts (100 líneas) — el recorte vive en un módulo de dominio hermano, no en el repositorio ya saturado. 3 de 8 artículos: la colección real tiene 8, así que el recorte no es un no-op.
- TDD: tests/home-latest-articles-limit.test.mjs nuevo (REQ-30-01..05, 11..13, 318 líneas) en rojo antes (ERR_MODULE_NOT_FOUND: el módulo de dominio aún no existía, cumple el literal de REQ-30-11) y en verde después; incluye verificación del HTML de la portada emitido por build real (patrón de about-page.test.mjs) que cuenta 3 cards. Los 5 tests de inspección existentes de latest-articles.astro (latest-articles-restore, articles-ui-refactor, article-card-images, view-transitions, visual-polish-refactor, 48/48) pasan SIN diff: ninguna aserción de contrato se tocó, no hizo falta el precedente REQ-43-06.
- Verificación independiente del líder sobre dist/client/index.html: la sección «Últimos artículos» (encabezado conservado, REQ-37-06 intacto) contiene exactamente 3 enlaces — /posts/05-diseno-arquitectonico-vs-diseno-detallado, /posts/02-ciclo-de-vida-y-arquitectura, /posts/01-procesos-memoria — los 3 created más recientes en descendente.
- Cierre: ./init.sh en verde re-verificado tras el APPROVED (entorno, formato, tests al 100%, build); feature 30 en done conservada en el array.
- Commit c19d375 (hecho por el humano, no por los agentes) mezcla las features 28 y 30 e incluye el <h1> duplicado de src/pages/about.astro y el worker-configuration.d.ts regenerado por el build.
- Pendientes de decisión del humano, NO abiertos: (1) src/pages/about.astro mantiene un <h1> duplicado (el de la cabecera y el añadido al final) — accesibilidad/SEO; (2) el flake preexistente de parallel test runner (cleanup-dead-code.test.mjs escribe src/styles/tmp-audit.css mientras hero-ui-refactor.test.mjs camina src/), ya registrado en los cierres de 25 y 26; (3) la feature 10 sigue in_progress y abandonada; (4) no se dio de alta la feature del .env.example para que un clon limpio pueda buildear (IN_MAINTENANCE sin default en astro.config.mjs).

## Sesión 2026-10-08 — Auditoría del sitio, backlog 31-58 y feature 31 `search-clear-button-fix`

- Auditoría pedida por el humano ("audita esta página web"): 3 explorers en paralelo → progress/research/audit_seo.md, audit_a11y.md, audit_perf_security.md. El dominio moibaldenegro.com da NXDOMAIN: se auditó sobre dist/client + código; cabeceras/HSTS/compresión en vivo quedan pendientes de re-auditar cuando resuelva.
- spec_author dio de alta las features 31-58 (bugs primero) con specs en specs/31_* … specs/58_*; análisis en progress/research/audit_backlog.md. Decisiones humanas aplicadas (§8): 10 → blocked (aparcada, sin reporte de fallo), se quita de depends_on de 31/32/57; 41 (astro >=7.2.8 por CVE crítica) autorizada → pending, registrada en docs/dependencies.md.
- El subagente implementer no está disponible en esta sesión de Claude Code (Agent type 'implementer' not found); el humano autorizó explícitamente al líder a tomar su rol "por esta ocasión". El reviewer sí se lanza como subagente.
- Feature 31 cerrada en done (APPROVED en progress/review_31.md, verificado en disco). El botón del estado vacío pasa a data-search-results-clear y wireClear lo busca dentro de .search-results; el × del header conserva data-search-clear sin manejadores ajenos. TDD: tests/search-clear-button-fix.test.mjs en rojo 5/6 → verde; 4 tests previos actualizados al nuevo contrato. Suite 568/568, ./init.sh verde. Informe en progress/impl_31.md.
- Observación no bloqueante del reviewer: tests/term-search-oldest-first.test.mjs mantiene [data-search-clear] en su fake DOM sin aserciones; alinear en una feature futura.
- Flake de ./init.sh observado al arrancar (una corrida en rojo, la siguiente en verde): es el flake preexistente ya registrado (cleanup-dead-code.test.mjs escribe src/styles/tmp-audit.css mientras hero-ui-refactor.test.mjs camina src/).

## Sesión 2026-10-08 — Feature 32 `search-pagination-listeners` (cierre)

- Feature 32 cerrada en done (APPROVED en progress/review_32.md, verificado en disco). Líder en rol de implementer por autorización humana explícita (implementer no disponible en la sesión).
- Nuevo src/components/search-results/search-pagination.ts: estado único Pager { page, render } y wirePagination con un listener por botón por inicialización; tras cada cambio de página el foco va a ul[data-search-list] (tabindex="-1"). renderSearch ya no registra listeners y devuelve data.page. Controlador en 91 líneas.
- TDD: tests/search-pagination-listeners.test.mjs en rojo 5/7 → verde; REQ-17-02/03/05 de term-search-oldest-first actualizados al nuevo contrato. Suite 575/575, ./init.sh verde. Informe en progress/impl_32.md.

## Sesión 2026-10-08 — Feature 33 `broken-resources-fix` (cierre)

- Feature 33 cerrada en done (APPROVED en progress/review_33.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Layout.astro sin /favicon.svg (inexistente) ni el favicon.ico duplicado; el post de SOLID usa arch00.webp hasta que el humano aporte un arch03.webp propio. Guardas en tests/broken-resources-fix.test.mjs (rojo 5/6 → verde). Suite 581/581, ./init.sh verde. Informe en progress/impl_33.md.

## Sesión 2026-10-08 — Feature 34 `not-found-page` (cierre)

- Feature 34 cerrada en done (APPROVED en progress/review_34.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Página 404 propia (src/pages/404.astro prerender + componente not-found.astro + not-found.css con tokens). [...term].astro responde Astro.response.status = statusForTermPath(pathname): 404 para rutas con extensión de archivo y /posts/<inexistente>, 200 para términos. Prop noindex en Layout, usada en 404, /search y [...term]. Test con build a outDir temporal para no pisar dist/. Suite 590/590, ./init.sh verde. Informe en progress/impl_34.md.

## Sesión 2026-10-08 — Feature 35 `seo-head-base` (cierre)

- Feature 35 cerrada en done (APPROVED en progress/review_35.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- site en astro.config.mjs; src/domain/seo/head.ts (composeTitle, canonicalUrl y textos de descripción existentes); Layout con meta description, canonical absoluto y charset+viewport primero; cada página pasa título/descripción (portada: nombre del perfil + texto de presentación). Suite 597/597, ./init.sh verde. Informe en progress/impl_35.md.
- Pendientes anotados: canonical con barra final (formato directorio) vs. enlaces internos sin barra (audit_seo B4); descriptions duplicadas de 00-agilismo y 03-principios_solid (contenido, decisión humana).

## Sesión 2026-10-08 — Feature 36 `search-status-announcements` (cierre)

- Feature 36 cerrada en done (APPROVED en progress/review_36.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Nodo role="status" aria-live="polite" (.visually-hidden, utilidad global en layout.css) en /search, /<término> y el panel en vivo; search-status.ts con statusMessage, writeStatus y liveAnnouncer (debounce 300 ms). Suite 603/603, ./init.sh verde. Informe en progress/impl_36.md.

## Sesión 2026-10-08 — Feature 37 `focus-visible-global` (cierre)

- Feature 37 cerrada en done (APPROVED en progress/review_37.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Regla de foco global :where(a, button, input, select, textarea, [tabindex]):focus-visible con anillo de acento; search-bar.css ya no anula el outline; × del buscador de 32x32 centrado. Suite 610/610, ./init.sh verde. Informe en progress/impl_37.md.

## Sesión 2026-10-08 — Feature 38 `layout-main-skip-link` (cierre)

- Feature 38 cerrada en done (APPROVED en progress/review_38.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Un único <main id="contenido" tabindex="-1"> en el Layout y enlace .skip-link «Saltar al contenido» como primer hijo de body (oculto con transform hasta el foco, z-index sobre el navbar, solo tokens). Los main de páginas/componentes pasan a div con su clase.
- Arreglado el flake de builds en paralelo (workerd/miniflare: «assets:storage not found»): tests/helpers/astro-build.mjs serializa los builds de los 5 tests que construyen con un lock mkdir en node_modules/. Suite 616/616 (x3), ./init.sh verde. Informe en progress/impl_38.md.

## Sesión 2026-10-08 — Feature 39 `single-h1-headings` (cierre)

- Feature 39 cerrada en done (APPROVED en progress/review_39.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Los 7 posts con «# …» inicial lo degradan a «## …»; /about pinta la presentación como p.about__intro desde SITE_DESCRIPTION (una sola fuente con la meta description). Un único h1 por post y en /about verificado en build. Suite 621/621, ./init.sh verde. Informe en progress/impl_39.md.

## Sesión 2026-10-08 — Feature 40 `security-headers` (cierre) y alta de la 59

- Feature 40 cerrada en done (APPROVED en progress/review_40.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- src/domain/http/security-headers.ts (objeto congelado, única fuente) + withSecurityHeaders; src/middleware.ts para respuestas del Worker; public/_headers con la regla /* idéntica; el build conserva /_astro/* inmutable. Informe en progress/impl_40.md. Pendiente operativo: HSTS/Always Use HTTPS en la zona de Cloudflare y verificar con curl -I cuando el dominio resuelva.
- El flake preexistente de tmp-audit.css (cleanup-dead-code escribe en src/ mientras otros tests lo recorren) pasó a fallar 2 de 4 corridas: el líder pidió a spec_author darlo de alta → feature 59 (análisis en progress/research/flaky-tmp-audit.md).

## Sesión 2026-10-08 — Feature 41 `astro-security-upgrade` (cierre)

- Feature 41 cerrada en done (APPROVED en progress/review_41.md, verificado en disco). Aprobada por el humano el 2026-10-08; líder en rol de implementer por autorización humana explícita.
- astro 7.2.0 → 7.3.8, @astrojs/cloudflare 14.2.1 → 14.3.4, wrangler 4.121.0 → 4.149.0; docs/dependencies.md actualizado (approved 2026-10-08). pnpm audit: de 29 avisos (1 critical) a 2 high, 0 critical. Informe en progress/impl_41.md.
- Pendiente de decisión humana: wrangler 4.149.0 pide @cloudflare/workers-types >= 5.20261006.1 (instalado 5.20260812.1, no aprobado subirlo).

## Sesión 2026-10-08 — Feature 42 `sitemap-robots-endpoints` (cierre)

- Feature 42 cerrada en done (APPROVED en progress/review_42.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- src/domain/seo/sitemap.ts (buildSitemap y robotsTxt puros) + endpoints prerenderizados src/pages/sitemap.xml.ts y robots.txt.ts, sin dependencias. loc con barra final como los canonical. Suite 640/640, ./init.sh verde. Informe en progress/impl_42.md.

## Sesión 2026-10-08 — Feature 43 `social-meta-tags` (cierre)

- Feature 43 cerrada en done (APPROVED en progress/review_43.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- src/domain/seo/social.ts (socialMeta pura: og:* + twitter:*; artículos con article:published/modified_time); Layout con props image/type/published/modified; el post pasa portada, article y fechas. Suite 647/647, ./init.sh verde. Informe en progress/impl_43.md. Revisable por el humano: og:locale es_MX, fechas sin zona horaria, portadas compartidas.

## Sesión 2026-10-08 (sesión 2) — Feature 44 `article-json-ld` (cierre)

- La sesión 1 se cortó por límite de tokens con la 44 a medias; la sesión 2 retomó el handoff dejado en feature_list.json y progress/current.md.
- Feature 44 cerrada en done (APPROVED en progress/review_44.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- src/domain/seo/json-ld.ts (blogPostingJsonLd + serializeJsonLd con escape de </script); posts/[id].astro emite un único script application/ld+json. 6 tests heredados que prohibían <script ahora admiten solo application/ld+json (precedente REQ-43-06). Suite 654/654, ./init.sh verde. Informe en progress/impl_44.md.
- Respuestas del humano en la sesión 2: subir @cloudflare/workers-types (aprobación registrada, feature 60); adelantar la 59 (se hace a continuación, fuera del orden por id, por indicación humana); fechas sin zona horaria (decisión del líder: YYYY-MM-DD); portadas propias por post las pondrá un humano a mano.

## Sesión 2026-10-08 (sesión 2) — Feature 59 `tokens-audit-tmp-fixture` (cierre)

- Feature 59 cerrada en done (APPROVED en la ronda 3 de progress/review_59.md, verificado en disco). Adelantada a la 45 por indicación humana. Líder en rol de implementer por autorización humana explícita.
- Causa del flake histórico: cleanup-dead-code (REQ-12-06) escribía/borraba src/styles/tmp-audit.css mientras otros tests recorrían src/ en paralelo (ENOENT). scripts/audit-design-tokens.mjs acepta un directorio opcional; REQ-12-06 usa mkdtempSync(tmpdir()) + rmSync en finally.
- Guarda nueva tests/helpers/src-write-guard.mjs (rondas 2 y 3 por CHANGES_REQUESTED): argumentos con paréntesis equilibrados, segmento 'src', asignaciones/reasignaciones multilínea, APIs fs sync/async/promesas y destino de rename/copy/cp, con autoverificación de casos positivos y negativos. 5 corridas seguidas 661/661 sin ENOENT; ./init.sh verde. Informe en progress/impl_59.md.

## Sesión 2026-10-08 (sesión 2) — Feature 45 `ascii-post-slugs` (cierre)

- Feature 45 cerrada en done (APPROVED en la ronda 2 de progress/review_45.md, verificado en disco; ronda 1 pidió corregir 3 comentarios desactualizados). Líder en rol de implementer por autorización humana explícita.
- Slugs ASCII 03-principios-solid, 01-diseno-detallado y 04-ciclo-de-vida-y-arquitectura; next/related actualizados; corregido el next roto del post 05 (04-principios-solid inexistente → 03-principios-solid); redirecciones 301 en astro.config.mjs verificadas con astro preview (workerd). 8 tests heredados ajustados (REQ-43-06). Suite 667/667, ./init.sh verde. Informe en progress/impl_45.md.

## Sesión 2026-10-08 (sesión 2) — Feature 46 `search-index-endpoint` (cierre)

- Feature 46 cerrada en done (APPROVED en la ronda 2 de progress/review_46.md; la ronda 1 detectó dos aserciones de escape que solo pasaban por un comentario). Líder en rol de implementer por autorización humana explícita.
- src/domain/search/index-json.ts (searchIndexJson: bodies por slug, buildSearchIndex, JSON.stringify y escape de </script) como única función; endpoint prerenderizado /search-index.json (≈39 KB) idéntico al índice embebido; las 3 páginas la usan. Tests heredados reapuntados al dominio y verificados con una prueba de mutación. Suite 672/672, ./init.sh verde. Informe en progress/impl_46.md.

## Sesión 2026-10-08 (sesión 2) — Feature 47 `search-index-lazy-load` (cierre)

- Feature 47 cerrada en done (APPROVED en la ronda 2 de progress/review_47.md; la ronda 1 detectó una carrera en la portada, un error silencioso, un error genérico sin validar y un catch vacío). Líder en rol de implementer por autorización humana explícita.
- index-loader.ts (un fetch por sesión, caché síncrona, SearchIndexLoadError, fallos no cacheados); live-search.ts (último término gana, error visible y anunciado, precarga en el primer focus); controladores con loader inyectable; páginas sin índice embebido. Portada 72 477 B → 30 376 B; /search 49 355 B → 7 323 B; /<término> sin índice ni reconstrucción por petición. Suite 681/681, ./init.sh verde. Informe en progress/impl_47.md. Pendiente: verificación manual en navegador real.

## Sesión 2026-10-08 (sesión 2) — Feature 48 `image-loading-hints` (cierre)

- Feature 48 cerrada en done (APPROVED en progress/review_48.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- width/height intrínsecos en todas las img (logo 72x25, hero 952x960, portadas 1376x768), fetchpriority="high" solo en la imagen LCP (hero de la portada y portada del post), lazy + decoding async en miniaturas. Sin cambios de CSS (aspect-ratio/object-fit ya presentes). Suite 687/687, ./init.sh verde. Informe en progress/impl_48.md.

## Sesión 2026-10-08 (sesión 2) — Feature 49 `static-cache-headers` (cierre)

- Feature 49 cerrada en done (APPROVED en progress/review_49.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- src/domain/http/cache-policy.ts (ASSETS 1 semana, isla HTB 1 hora); regla /assets/* en public/_headers; la isla HTB fija Cache-Control con la constante. Verificado con astro preview: isla max-age=3600, /assets max-age=604800, HTML max-age=0. Suite 693/693, ./init.sh verde. Informe en progress/impl_49.md.

## Sesión 2026-10-08 (sesión 2) — Feature 50 `youtube-embed-hardening` (cierre)

- Feature 50 cerrada en done (APPROVED en la ronda 2 de progress/review_50.md; la ronda 1 pidió corregir el nombre/comentario de un test y una cifra del informe). Líder en rol de implementer por autorización humana explícita.
- iframe de 02-principios.md con youtube-nocookie.com, loading="lazy", referrerpolicy estricta y allow sin autoplay; test que recorre todos los posts. Suite 699/699, ./init.sh verde. Informe en progress/impl_50.md.

## Sesión 2026-10-08 (sesión 2) — Feature 51 `header-mobile-reflow` (cierre)

- Feature 51 cerrada en done (APPROVED en la ronda 2 de progress/review_51.md; la ronda 1 exigió la verificación real en navegador). Líder en rol de implementer por autorización humana explícita.
- Token --header-height (74px); nav con min-height en lugar de altura fija; scroll-padding-top en la regla html; header estático con viewport ≤500px de alto. 5 tests de conteo de tokens.css + meta-test a 95 líneas (precedente REQ-43-06). Verificado con Chrome headless + CDP: a 320 px el header crece a 137 px con el buscador dentro; con zoom 400% pasa a static; escritorio sin cambios. Suite 704/704. Informe en progress/impl_51.md.
- Observaciones para una feature futura: scroll-padding-top insuficiente a 320 px (header 137 px) y logo pegado al borde superior en móvil.

## Sesión 2026-10-08 (sesión 2) — Feature 52 `contrast-badge-kicker` (cierre)

- Feature 52 cerrada en done (APPROVED en progress/review_52.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- --color-verified #17b8ff → #0a6f9e (blanco 2,25 → 5,55:1); insignia con ✓ aria-hidden y «Verificado» visually-hidden; texto del kicker con --color-accent-hover (4,10 → 5,73:1 sobre hero-top). REQ-42-03 ajustado (REQ-43-06). Suite 710/710, ./init.sh verde. Informe en progress/impl_52.md.

## Sesión 2026-10-08 (sesión 2) — Feature 53 `link-image-accessible-names` (cierre)

- Feature 53 cerrada en done (APPROVED en progress/review_53.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- alt="" en imágenes decorativas junto a títulos (cards, resultados, portada del post, recomendados); logo «Inicio — moibaldenegro.com»; aviso visually-hidden «(X, sitio externo)»; fila de recomendado clicable con ::after. 6 tests heredados ajustados (REQ-43-06). Suite 716/716, ./init.sh verde. Informe en progress/impl_53.md.

## Sesión 2026-10-08 (sesión 2) — Feature 54 `code-copy-status` (cierre)

- Feature 54 cerrada en done (APPROVED en la ronda 2 de progress/review_54.md; la ronda 1 detectó que «Copiado» desbordaba el botón de 30 px). Líder en rol de implementer por autorización humana explícita.
- Región role="status" compartida en code-copy.astro; anuncios «Código copiado» / «No se pudo copiar el código» (la región se vacía antes de escribir); texto visible «Copiado» 2000 ms con el botón creciendo (width:auto). Verificado con Chrome headless en 1280 y 375 px. Suite 723/723, ./init.sh verde. Informe en progress/impl_54.md.

## Sesión 2026-10-08 (sesión 2) — Feature 55 `home-heading-hierarchy` (cierre)

- Feature 55 cerrada en done (APPROVED en la ronda 2 de progress/review_55.md; la ronda 1 detectó que el margen del título dependía del nivel del encabezado). Líder en rol de implementer por autorización humana explícita.
- Títulos de las tarjetas del hero como p.card-title (svg aria-hidden/focusable=false); títulos de las cards de artículo en h3 con margin explícito 0.83em 0 (idéntico al h2 previo, medido en Chrome). Portada sin saltos de nivel en el build. REQ-24-03, REQ-53-05 y REQ-30-08 ajustados. Suite 729/729, ./init.sh verde. Informe en progress/impl_55.md.

## Sesión 2026-10-08 (sesión 2) — Feature 56 `reduced-motion` (cierre)

- Feature 56 cerrada en done (APPROVED en progress/review_56.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- Animación float del hero solo con prefers-reduced-motion: no-preference; red de seguridad global reduce en layout.css (0.01ms); hover sin transform en .hero-card y .profile-card con reduce (en cada hoja). Verificado en Chrome con setEmulatedMedia. Suite 734/734, ./init.sh verde. Informe en progress/impl_56.md.

## Sesión 2026-10-08 (sesión 2) — Feature 57 `search-form-progressive` (cierre)

- Feature 57 cerrada en done (APPROVED en la ronda 2 de progress/review_57.md; la ronda 1 detectó que limpiar /search no vaciaba la barra precargada). Líder en rol de implementer por autorización humana explícita.
- Buscador del header como <search><form action="/search" method="get"> con input type=search name=q enterkeyhint=search; con JS el submit navega con view transitions; precarga de q en /search; Escape solo con el foco en la búsqueda; resetQuery al limpiar /search. Verificado en Chrome headless (precarga, Escape, Enter, envío sin JS). Suite 743/743, ./init.sh verde. Informe en progress/impl_57.md.

## Sesión 2026-10-08 (sesión 2) — Feature 58 `manifest-generator-cleanup` (cierre)

- Feature 58 cerrada en done (APPROVED en progress/review_58.md, verificado en disco). Líder en rol de implementer por autorización humana explícita.
- site.webmanifest con name/short_name moibaldenegro.com; sin meta generator en Layout ni en el build. Suite 747/747, ./init.sh verde. Informe en progress/impl_58.md.

## Sesión 2026-10-08 (sesión 2) — Feature 60 `workers-types-upgrade` (cierre) y fin del backlog de la auditoría

- Feature 60 cerrada en done (APPROVED en progress/review_60.md, verificado en disco). Aprobada por el humano el 2026-10-08; líder en rol de implementer por autorización humana explícita.
- @cloudflare/workers-types 5.20260812.1 → 5.20261009.1 (satisface el peer de wrangler 4.149.0; pnpm install sin avisos de peer); docs/dependencies.md actualizado y nota APLICADA; REQ-30-06 ajustado. Suite 751/751, ./init.sh verde. Informe en progress/impl_60.md.
- Backlog de la auditoría completado: features 31-60 en done (59 adelantada por indicación humana). La 10 sigue en blocked (aparcada por decisión humana). Nada commiteado: todo el trabajo está en el working tree.
- Pendientes para el humano: DNS del dominio (NXDOMAIN) y HSTS/Always Use HTTPS en Cloudflare; portadas propias por post; theme_color del manifest; scroll-padding y padding del header a 320 px; botón de copiar que se desplaza con el scroll horizontal del pre; CSP de Report-Only a enforcement tras revisar reportes.

## 2026-10-09 — Secuencia post-auditoría (features 61-64)

- spec_author dio de alta 61-64 (análisis en progress/research/post_audit_backlog.md) a petición humana («inicia una nueva secuencia de trabajo para acomodar tmb esos detalles»). Líder en rol de implementer (subagente implementer no disponible; autorización humana vigente).
- Feature 61 header-anchor-offset-mobile cerrada en done (APPROVED en progress/review_61.md). Token --header-height-mobile 170px (header medido 165 px a 320), scroll-padding móvil y padding-block del nav; logo a 14 px del borde. Tests de conteo de tokens.css 95→97. Suite 756/756. Hallazgo: el header solo es sticky el primer viewport (body height:100%), documentado en impl_61.md.
- Feature 62 code-copy-fixed-corner cerrada en done (APPROVED en ronda 2, progress/review_62.md). initCodeCopy envuelve cada pre en div.code-block (position: relative) y el botón cuelga del envoltorio: no se desplaza con el scroll horizontal (verificado en Chrome a 375 px). code-copy-button.test.mjs compactado a 98 líneas. Suite 761/761.
- Feature 63 theme-color-dark cerrada en done (APPROVED en ronda 2, progress/review_63.md). THEME_COLOR (src/domain/seo/theme.ts) = --color-background #070716; manifest theme_color/background_color y meta theme-color en el layout. Suite 766/766. Cambio ajeno en src/domain/search/normalize.ts (no del implementer) excluido y señalado al humano.
- Feature 64 csp-enforce → blocked (REQ-64-07). moibaldenegro.com y www.moibaldenegro.com dan NXDOMAIN (curl/nslookup 2026-10-09): no hay HTML de producción ni informes Report-Only que revisar. Sin esa revisión, una CSP obligatoria podría bloquear scripts que Cloudflare inyecta en el borde, como Web Analytics (static.cloudflareinsights.com). No se escribió código. Se reanuda cuando el dominio resuelva o el humano fije la política para esos orígenes.
- Fin de la secuencia post-auditoría: 61, 62 y 63 en done; 64 y 10 en blocked. Pendiente para el humano: (a) origen del cambio en src/domain/search/normalize.ts (`if (!text) return '';`, mtime 09:42:58, no lo escribió el implementer); (b) header sticky solo durante el primer viewport (body height:100%, impl_61.md); (c) DNS del dominio para desbloquear la 64.
- Feature 68 (deploy roto por _redirects inválido) cerrada en done (APPROVED, progress/review_68.md). Quitada la clave de redirecciones de astro.config.mjs (el slug con espacio generaba líneas de 4 tokens y Cloudflare rechazaba el deploy, code 100324). Las 301 de los slugs antiguos las hace el middleware con legacyRedirect, verificado con preview + curl. Suite 774/774. Hallazgo: los builds de los tests dejan .wrangler/deploy/config.json apuntando a un temporal borrado.
- Feature 65 card-image-height-auto cerrada en done (APPROVED, progress/review_65.md). Añadido height: auto en .post__image, .latest-articles__image, .post__related-thumb y .search-results__thumb: las imágenes de card vuelven a su proporción (antes medían 768 px de alto por el atributo height de la feature 48). REQ-48-05 endurecido. Suite 784/784.
- Feature 64 csp-enforce cerrada en done (APPROVED, progress/review_64.md). La CSP pasa a obligatoria con la política de REQ-64-11, que permite Cloudflare Web Analytics por decisión humana. Verificado en local con Chrome: 0 violaciones en 7 páginas y el beacon carga. REQ-64-15 (verificación en producción) queda pendiente del deploy humano. Suite 786/786.
- REQ-64-15 verificado en producción tras el deploy humano: 0 violaciones CSP en 7 páginas; beacon de Web Analytics 200 y /cdn-cgi/rum 204 (progress/impl_64.md).
- Feature 66 site-domain-moisesbaldenegro cerrada en done (APPROVED, progress/review_66.md). site, BRAND, about, alt del logo, manifest, User-Agent de HTB y README pasan a moisesbaldenegro.com. Se conservan @moibaldenegro y el Worker moibaldenegro-web. 11 tests legacy ajustados. Suite 792/792.
- Feature 67 normalize-text-empty-guard-test cerrada en done (APPROVED, progress/review_67.md). El test cubre la guarda manual del humano en normalizeText; su eficacia está demostrada por mutación. Suite 795/795.
- Feature 69 hero-profile-image-mobile cerrada en done (APPROVED, progress/review_69.md). En ≤1200 px `.profile-image` usa aspect-ratio (16/9, y 1/1 en ≤768) y las filas usan `grid-auto-rows: minmax(..., auto)`. La foto del hero se ve a 320, 375, 768 y 1024 px; el escritorio queda igual. Suite 799/799.
- Fin de la secuencia (features 61-69): 61-69 en done, 10 en blocked por decisión humana. Pendientes para el humano: (a) header sticky solo el primer viewport (impl_61.md); (b) .wrangler/deploy/config.json apunta a un temporal tras la suite (impl_68.md); (c) iconos que pisan títulos de hero-card a 1024 px (impl_69.md).
- Pendientes cerrados por el humano (2026-10-09): el header que se va con el scroll es el comportamiento esperado; los tests no se ejecutan en el pipeline de producción, así que .wrangler/deploy/config.json no afecta al deploy; los iconos de las hero-cards a 1024 px no se pasan al backlog. Secuencia cerrada.
- Feature 70 gsap-dependency-approval cerrada en done (APPROVED, progress/review_70.md). gsap 3.15.0 exacta, registrada en docs/dependencies.md con licencia NO OSI de Webflow y alcance limitado a la portada. Suite 805/805.
- Feature 71 latest-horizontal-geometry cerrada en done (APPROVED, progress/review_71.md). Funciones puras trackTravel, pinScrollLength, trackOffset, cardCenterX y focusScrollTarget en src/domain/latest-horizontal.ts. Suite 812/812.
- Feature 72 latest-articles-horizontal-scroll cerrada en done (APPROVED, progress/review_72.md). Scroll horizontal fijado con GSAP ScrollTrigger en la portada, solo con >=1201 px y sin reduced motion. Mejora progresiva: en otros casos queda el layout apilado. Verificado en Chrome en 11 escenarios; 44 928 B gzip, solo en la portada; avisos @license conservados con comments.legal. Suite 818/818.
- Hallazgo pendiente de decisión humana: con la CSP obligatoria (feature 64), cada navegación del ClientRouter hacia una página con scripts inline registra la violación del script «data:application/javascript,» que inserta el router de Astro. Sin impacto funcional; también ocurre en producción.
- Feature 73 latest-horizontal-compact-sticky cerrada en done (APPROVED, progress/review_73.md). Par de cards que llena el contenedor (1-2 → 2-3), scroll 1:1 y sticky CSS en lugar del pin de ScrollTrigger: 0 px de salto con rueda real. Suite 822/822.
- Feature 74 csp-router-inline-script cerrada en done (APPROVED, progress/review_74.md). assetsInlineLimit (code-copy pasa a ser un chunk) más la opción A del humano: data: solo en script-src-elem. 0 violaciones al navegar con el ClientRouter, también al volver a la portada. REQ-74-14 (producción) queda pendiente del deploy. Suite 826/826.
- Feature 75 latest-cards-entrance cerrada en done (APPROVED en ronda 2, progress/review_75.md). Las cards entran desde arriba ligadas al scroll (ease cúbica de salida, sin rebote) y se clavan exactamente en el inicio del tramo fijado. Correcciones durante la verificación: el ancho de card dividido por la escala del track y clearTrack. Suite 831/831.
- Fin de la secuencia 73-75. Pendiente para el humano: commit y deploy; verificación en producción de REQ-74-14 (navegación sin violaciones CSP) y prueba visual de la 73/75.
- Feature 76 latest-cards-full-bleed cerrada en done (APPROVED en ronda 2, progress/review_76.md). Sin clip-path lateral: las cards cruzan los bordes de la ventana. Con la opción B, la primera y la última card llevan una x propia de ±Δ para que los márgenes queden limpios en reposo. Suite 835/835. El humano: «quedó espectacular».
- Feature 77 header-height-64 cerrada en done (APPROVED en ronda 2, progress/review_77.md). --header-height pasa a 64px: header de escritorio de 65 px con el borde. El logo se centra con display:block solo en >768 px, para que móvil quede idéntico. Spec enmendada (REQ-77-15/16 y tolerancia de 1 px en REQ-77-09). Suite 840/840.
- Feature 78 site-menu-state cerrada en done (APPROVED, progress/review_78.md): estado puro y wiring del menú hamburguesa móvil. Suite 845/845.
- Feature 79 mobile-hamburger-menu cerrada en done (APPROVED en ronda 2, progress/review_79.md). En ≤768 px con JS, el header es de 65 px con el logo y el botón ☰ en píldora, y un panel con los enlaces y el buscador. Escritorio idéntico a la línea base, sin JS como antes, 0 violaciones de CSP y CLS 0. Suite 849/849.
- Backlog 80-84 dado de alta por spec_author (2026-10-12): rediseño de /about con los datos del CV y /cv.pdf generado en build con pdf-lib 1.17.1 (aprobada por el humano). Análisis en progress/research/about-redesign.md; investigación en about-moises-baldenegro.md y about-cv.md.
- Feature 80 about-data-repository cerrada en done (APPROVED, progress/review_80.md). src/data/about.json con el contenido canónico, sin teléfono ni correo. Incluye la entidad readonly AboutProfile, AboutRepository con loader inyectable e import con atributo, about-parse.ts con AboutDataError nombrado, y about-links.ts con heroLinks y cvContact. Sin UI. Suite 856/856.
- Feature 81 cv-pdf-endpoint cerrada en done (APPROVED, progress/review_81.md). pdf-lib 1.17.1 exacta instalada y registrada en docs/dependencies.md (nota del 2026-10-12 APLICADA). Dominio puro en src/domain/cv/ (win-ansi, text-wrap, cv-sections, cv-layout) más el adaptador cv-pdf.ts, único import de pdf-lib (StandardFonts, metadatos y fechas constantes, bytes deterministas), y el endpoint prerenderizado src/pages/cv.pdf.ts. El prerender en workerd funciona sin cambios: dist/client/cv.pdf de 2 páginas A4, sin correo ni teléfono, fuera del sitemap. 3 tests legacy del conjunto de dependencias ajustados (precedente REQ-43-06). Suite 867/867.
- Feature 82 about-hero-stats cerrada en done (APPROVED, progress/review_82.md). about.astro pasa a ser una composición de HeroProfileRepository y AboutRepository con AboutHero y AboutStats. El hero lleva la foto 1:1 con anillo de acento, el h1 por slot declarado en la página para conservar REQ-39-05, el handle, el titular, la ubicación, el resumen y el enfoque, los enlaces del sprite y el CTA de contorno «Descargar CV» a /cv.pdf. Debajo, 4 cifras bajo un h2 visually-hidden. Hojas about-hero.css y about-stats.css solo con tokens, con about.css como carcasa. Verificado con CDP a 1280, 768 y 375 (contraste ≥ 4.77:1); capturas en progress/research/about82/. Suite 873/873.

- Feature 83 about-experience-skills cerrada en done (APPROVED, progress/review_83.md). Nuevos componentes AboutTimeline y AboutSkills, compuestos en about.astro tras las cifras y antes de la intro. Timeline: h2 Experiencia, ol de 4 puestos con h3 de role, organización · lugar, period en píldora (los puestos 2-4 solo muestran la duración), logros y Resultado destacado con borde de acento; desde 769 px, línea vertical con --color-border-strong y marcadores ::before de --color-accent. Stack: 6 tarjetas de área con píldoras, 3 columnas desde 900 px. Hojas about-timeline.css y about-skills.css solo con tokens y --gap-card, con reduced-motion. Verificado con CDP a 1280, 768 y 375 (sin scroll horizontal, contraste ≥ 7.04:1); capturas en progress/research/about83/. Suite 879/879.
- Feature 84 about-projects-credentials cerrada en done (APPROVED, progress/review_84.md). about.astro queda con las 8 secciones en orden: hero, cifras, experiencia, stack, proyectos, contenido, formación y filosofía. La sección final se elimina y p.about__intro pasa por el slot de AboutContent. Nuevos componentes:
  - AboutProjects: 5 proyectos verificados, con el enlace en el h3, texto «sitio externo» visually-hidden y toda la tarjeta clicable vía ::after.
  - AboutContent: blog (/) y Curso de Rust desde Cero (@moibaldenegro).
  - AboutCredentials: Educación sin fechas, 3 certificaciones con emisor y 2 idiomas con nivel.
  - AboutPhilosophy: blockquote con el lema en lang=en y borde de acento.
  Hojas about-projects.css y about-credentials.css solo con tokens y --gap-card, con reduced-motion. Verificado con CDP a 1280, 768 y 375 (3 columnas a 1280, sin scroll horizontal a 375, contraste ≥ 6.67:1); capturas en progress/research/about84/. Suite 885/885.
- Feature 85 geist-font-base cerrada en done (APPROVED, progress/review_85.md). geist 1.7.2 exacta con pnpm.overrides "geist>next": "-" (lockfile sin next/react/react-dom), entrada ### geist en docs/dependencies.md (SIL OFL 1.1) y nota del 2026-10-12 APLICADA. Fonts API de Astro con fontProviders.local(): Geist (variable + cursiva) y Geist Mono, display swap y fallbacks métricos; <Font> en Layout.astro con un único preload (Geist normal); --font-sans pasa a var(--font-geist-sans, …), nuevo --font-mono y src/styles/typography.css (code/pre/kbd/samp en Mono). Fuentes servidas desde /_astro/fonts/, CSP sin cambios. tokens.css se mantiene en 97 líneas (la 86 tendrá que revisar los tests que lo fijan). 3 tests legacy del conjunto de dependencias ajustados (precedente REQ-43-06). Suite 899/899.
- Feature 86 geist-pixel-display cerrada en done (APPROVED, progress/review_86.md). Geist Pixel Circle (GeistPixel-Circle.woff2, elección humana) registrada con fontProviders.local() (--font-geist-pixel, display swap, fallbacks ui-monospace/monospace), <Font cssVariable="--font-geist-pixel" preload /> en Layout.astro, token --font-display (tokens.css sigue en 97 líneas: se quitó una línea en blanco) y en typography.css h1, h2 { font-family: var(--font-display); font-synthesis: none; }. REQ-85-17 se amplía a 2 preloads y se añade REQ-86-09 (solo se emite Circle, comparando bytes). CDP: Pixel en todos los h1/h2 de /, /about, /search, artículo y 404; Sans en body/p/h3; sin desborde horizontal; h1 del hero a 375 px sin desborde (no se tocó profile-card.css); CLS 0. Capturas para la revisión humana de la legibilidad de Circle en h2 de 21.6-28 px (a 1x se ven finos y claros) en progress/research/geist86/. Informe: progress/impl_86.md.
- Feature 87 geist-pixel-extend cerrada en done (APPROVED, progress/review_87.md). Una sola regla nueva en src/styles/typography.css (30 líneas), con selectores con ancestro y font-synthesis: none, lleva --font-display (Geist Pixel Circle) a los enlaces del header y su buscador, los títulos de las cards bento (.card-title), los títulos de últimos artículos y de Recomendados, y los tags (.latest-articles__tag, .search-results__tag, .post__kicker). Ninguna hoja de componente ni marcado cambia. Test nuevo: tests/geist-pixel-extend.test.mjs. Con CDP: Pixel en todos esos elementos; meta, descripciones y botones-icono siguen en Sans. El header mide 65 px a 800/1000/1280, igual que la base, sin scroll horizontal y con el menú móvil abierto dentro del viewport. CLS 0. Tamaños mínimos: kicker de 12 px a 375 y tags de búsqueda de 12,48 px. Capturas a DPR 1 y 2 en progress/research/geist87/. Nota: a 800 px «TYPESCRIPT» ya se salía de su tarjeta bento antes del cambio (15,25 px con Sans, 9,56 px con Pixel); está fuera del REQ y queda para decisión humana. Informe: progress/impl_87.md.
- Feature 88 hero-profile-mask cerrada en done. La foto del hero se desvanece hacia abajo con mask-image en .profile-image img (gradiente con var(--color-surface) → transparent), sin .profile-overlay; la píldora del handle pasa a var(--font-mono); la descripción de hero.json se alinea al CV (headline y skills de about.json). Test nuevo: tests/hero-profile-mask.test.mjs (rojo 0/5 → verde 5/5); REQ-31 ajustado a la nueva descripción. Captura en progress/research/hero88/. Informe: progress/impl_88.md. Ampliación del mismo día («que se vea completa la foto»): en escritorio la foto se muestra entera con su proporción real (952/960, sin scale), con .profile-image en absolute y el texto alineado abajo sobre el desvanecido; la píldora pasa a .profile-content encima del h1; h1 y descripción más compactos. Tablet (<=1200 px) mantiene el flujo de la feature 69. Tests REQ-88-09/10/11 (rojo 3 → verde 8/8). Ajuste final: píldora más pequeña, menos padding inferior y h1 con tope de 2.4rem para que en escritorio grande (1920 px) la píldora quede en el cuello y no en la cara. REQ-88-12: el h1 escala con el bloque (container-type: inline-size + min(2.4rem, 6.8cqi)) para no partirse en dos líneas en escritorio grande. REQ-88-13: la tarjeta de perfil ya no se desplaza en hover (sin :hover ni transition); REQ-56-03 queda solo para .hero-card.
- Feature 89 site-footer cerrada en done. Footer en el layout único (src/components/site-footer/site-footer.astro, montado tras </main>) con marca (logo, titular y ubicación de about.json, CTA «Descargar CV»), columnas Navegación, Últimos artículos (3 más recientes con fecha y minutos) y Conecta (GitHub, LinkedIn, YouTube y X con iconos del sprite), y barra inferior con © año + nombre y «Volver arriba» (#top, sin JS). Lógica en src/domain/site-footer.ts (footerColumns, copyrightLine con fecha inyectable); hoja src/styles/site-footer.css solo con tokens, 1/2/4 columnas a <600/600-899/>=900 px. Test nuevo tests/site-footer.test.mjs (rojo 0/7 → verde 7/7); REQ-87-06 y REQ-82-08 ajustados (precedente REQ-43-06). CDP a 375, 768 y 1280 sin scroll horizontal en /, /about, /search, /rust y un artículo. Capturas en progress/research/footer89/. Informe: progress/impl_89.md.
- Feature 90 hero-card-kinds-domain cerrada en done (APPROVED, progress/review_90.md). Catálogo HERO_CARD_KINDS (icon, htb), HeroCardKind, HeroCard con kind icon, nueva HeroRichCard y unión HeroGridCard en src/domain/entities/hero-card.ts. Parseo extraído a src/domain/repositories/hero-cards-parse.ts (HeroCardsDataError re-exportado desde el repositorio, patrón about-parse.ts): kind ausente = icon; kind desconocido o campo obligatorio ausente lanza HeroCardsDataError con índice y valor/campo. Fixture EXPECTED_CARDS con kind icon (precedente REQ-43-06). Test nuevo tests/hero-card-kinds-domain.test.mjs (rojo pass 9/fail 3 → verde). Sin UI. Suite 946/946. Análisis: progress/research/hero-extensible-cards.md. Informe: progress/impl_90.md.
- Feature 91 hero-card-registry cerrada en done (APPROVED, progress/review_91.md). Lógica pura en src/domain/hero-card-registry.ts: pickCardComponent(registro, kind) y HeroCardKindError, que lleva el kind en el mensaje. Nuevo src/components/hero-cards/hero-grid-card.astro: recibe card: HeroGridCard, declara el registro literal { icon: HeroCard } y renderiza el componente elegido con card={card}. new-hero.astro usa HeroGridCard sin condicionales por tipo. Sin cambio visual: 12 article.hero-card con los data-color-token en su orden y hero-section.css sin cambios. La receta para añadir tipos nuevos está en specs/91_hero-card-registry/design.md. Test nuevo tests/hero-card-registry.test.mjs (rojo ERR_MODULE_NOT_FOUND → verde 8/8). Suite 954/954. Informe: progress/impl_91.md.
- Feature 92 htb-hero-card cerrada en done (APPROVED, progress/review_92.md). La card de Hack The Box pasa a ser una card más del grid del hero: entrada htb (kind htb, colorToken htb) en hero-cards.json en la celda 9 / span 4 x 9 / span 2; tokens --color-marca-htb y --color-marca-htb-accent en tokens.css (99 líneas); regla [data-color-token="htb"] en hero-card.css; src/components/hero-cards/htb-card.astro (article.hero-card.hero-card--rich) con <HtbStadistics server:defer> y fallback «Cargando estadísticas de HTB...», registrada en hero-grid-card.astro. La isla htb-stadistics.astro pasa a lista compacta (Nivel, Puntos, Owns; degradado «Estadísticas no disponibles») conservando credenciales, getProfileOrNull() y Cache-Control; index.astro deja de montar la sección suelta. Test nuevo tests/htb-hero-card.test.mjs (rojo 12/13 → verde); tests heredados de REQ-92-14 reapuntados con nota de precedente. CDP a 1440/1024/375 sin recortes ni scroll horizontal. Suite 967/967. Informe: progress/impl_92.md.
- Feature 94 sticky-footer cerrada en done (APPROVED en ronda 3, progress/review_sticky-footer.md). Petición humana 2026-10-14: el footer debe quedar siempre abajo en páginas cortas (p. ej. /search sin resultados). Sticky footer solo CSS en src/styles/layout.css (99 líneas): body flex column con min-height 100vh/100dvh y body > main { flex: 1 0 auto }; el reset html, body conserva height: 100%. Ronda 1: se quitó height: 100% y el header sticky dejó de irse («oye pero rompiste el header ya no se va nunca se queda pegado»); ronda 2: blocked con el arreglo propuesto y spec corregida por spec_author (REQ-94-04/08/12 reescritos, REQ-94-14 nuevo); ronda 3: test de REQ-94-04 invertido (rojo 7/1 → verde 8/8) y height: 100% restaurado. Chrome headless: header top 0 tras 500 px y −1265 tras 2000 px en / y post 04 a 375/800/1280, footer Δ 0 en páginas cortas, header 65 px, menú móvil OK. tests/geist-pixel-extend.test.mjs saca layout.css de UNCHANGED con nota (precedente REQ-43-06). Sin tocar Layout.astro, site-footer.css ni site-menu.css. Suite 983/983. Spec: specs/94_sticky-footer/; análisis: progress/research/sticky-footer.md; informe: progress/impl_sticky-footer.md. Nota: el humano commiteó el árbol (94 + 93) en 268e9ad durante la sesión.
- Feature 95 home-latest-articles-five cerrada en done (APPROVED, progress/review_home-latest-articles-five.md). Petición humana 2026-10-15 «de 3 a 5 últimos artículos», bloqueada en ronda 1 porque con 5 cards dist/client/index.html pesaba 49 289 B y superaba REQ-47-06 (< 40 000 B; cada transition:name emite un <style> inline de ~2,4 KB). Sustituida por la decisión humana «mejor solo deja 4 y trata de agregar también una animación de entrada salida lateral»; spec reescrita por spec_author (REQ-95-01..31). Ronda 2: LATEST_POSTS_LIMIT = 4 en src/domain/latest-posts.ts y FOOTER_LATEST_POSTS_LIMIT = 3 explícito en site-footer.astro; hoja nueva src/styles/latest-cards-slide.css (solo CSS, animation-timeline: view() bajo @supports y prefers-reduced-motion: no-preference, solo transform/opacity, entrada desde la derecha 56 px en entry 0-40 % y salida a la izquierda en exit 60-100 %, .home__landing con overflow-x: clip, animation: none en el modo horizontal >=1201 px) importada por latest-horizontal.astro. Umbral de REQ-47-06 subido a 47 000 B (peso medido 43 634 B + 3000 redondeado; nota precedente REQ-43-06), conservando transition:name. Test nuevo tests/home-latest-articles-five.test.mjs (rojo 6/7 → verde 7/7); home-latest-articles-limit, latest-horizontal-compact-sticky y search-index-lazy-load ajustados. Chrome headless + CDP a 375/768/1024/1280: 4 cards, sin scroll horizontal, reduced motion sin animaciones, cards 3 y 4 al final del tramo de 1280, CLS <= 0.0006, footer 3. Capturas en progress/research/home95/. Suite 990/990. Spec: specs/95_home-latest-articles-five/; análisis: progress/research/home-5-articulos-recientes.md; informe: progress/impl_home-latest-articles-five.md.
- Feature 96 latest-cards-gsap-motion cerrada en done (APPROVED en Revisión 3, progress/review_latest-cards-gsap-motion.md). Decisión humana 2026-10-15: «ni las 4 me gustaron reestablece a 3, pero mejora la animación de entrada y salida de las cards» + «busca opciones clásicas en la librería… cómo entran y cómo salen de los laterales». LATEST_POSTS_LIMIT = 3 y REQ-47-06 de nuevo a < 40 000 B (index.html 38 063 B). Entrada/salida lateral con GSAP 3.15.0 (dependencia ya aprobada en la 70): valores en src/domain/latest-cards-motion.ts (más cardPhase/phaseState puros), runtime en src/components/latest-horizontal/cards-motion.ts y sincronización en src/components/latest-horizontal/cards-sync.ts; tweens por tiempo con ScrollTrigger.batch y los cuatro callbacks, sin scrub, opacity (no autoAlpha) y focusin que muestra la card enfocada; rama horizontal H-integrado (containerAnimation); se retiran latest-cards-slide.css, la entrada del track de la 75 y latest-entrance.ts. Rondas: (1) `overwrite: true` mataba el fromTo de x de las cards extremas de la 76 → `gsap.killTweensOf(cards, 'xPercent,scale,opacity')` sin overwrite (REQ-96-22/49/50); (2) card 3 invisible con el scroll restaurado (recarga/history.back) porque los triggers con containerAnimation no se actualizan sin onUpdate → fase por card desde progress tras crear los triggers y en cada refresh, sin hide() incondicional, stop() antes de cada killTweensOf (REQ-96-51/52). Tests nuevos tests/latest-cards-gsap-motion.test.mjs y tests/latest-cards-scroll-restore.test.mjs (rojo antes de cada paso), heredados ajustados con nota. CDP a 375/768/1024/1280 sin regresiones; frames en progress/research/home96/. Suite 1009/1009. Spec: specs/96_latest-cards-gsap-motion/; análisis: progress/research/home-3-cards-gsap-motion.md; informe: progress/impl_latest-cards-gsap-motion.md. Nota del reviewer: parte de la ronda 2 ya estaba en el commit 3f8f06f antes de aprobarse; el resto queda sin commit.
- Feature 97 hero-cards-unique-tech cerrada en done (APPROVED, progress/review_hero-cards-unique-tech.md). Petición humana 2026-10-15: cards del hero sin tecnologías repetidas con los nuevos logos del sprite y prioridad a tecnologías sobre redes. Sin tocar la geometría (gridColumn/gridRow y orden del array intactos; celda htb sin cambios), las celdas twitch, node-bottom, github-bottom, youtube-bottom y twitch-bottom pasan a rust, aws, claude-code, nestjs y cloudflare; Twitch sale del todo y YouTube queda como única red. tokens.css sigue en 99 líneas (5 tokens fuera, 5 dentro). Título ajustado en ≤ 1200 px (header 14 px, 0,8rem, letter-spacing 0,04em) y ajustes de icono por tramo solo con --icon-width/--icon-rotation/--icon-scale en los @media existentes de hero-card.css. Rondas: bloqueo 1 por tests de otras features que congelaban tokens.css (REQ-97-13 los saca con nota «Ajuste feature 97 (precedente REQ-43-06)»); bloqueo 2 porque la base de cloudflare 170px / -6 dejaba la nube al 62,3 % a ≥ 1201 px (pasa a 140px / 0, ~97 %). Tests nuevos tests/hero-cards-unique-tech.test.mjs y tests/hero-cards-icon-fit.test.mjs; reapuntados con nota repository, styles, design-tokens, htb, home-latest-articles-five y latest-cards-gsap-motion. CDP a 375/800/1024/1280/1600: nube al 97,2 % a 1280/1600 y al 100 % a 375/800/1024, solape 0, geometría 13/13 idéntica, 0 errores; capturas en progress/research/hero97/. Suite 1020/1020. Informe: progress/impl_hero-cards-unique-tech.md; análisis: progress/research/hero-cards-unique-tech.md; spec: specs/97_hero-cards-unique-tech/.
- Feature 98 hero-mosaic-layout cerrada en done (APPROVED, progress/review_hero-mosaic-layout.md). Petición humana 2026-10-16: todas las tecnologías del sprite en el hero, solo YouTube y GitHub como redes y al final, filas inferiores de 5 cards con una sola doble y las personalizadas arriba. Pasa de 13 a 15 cards: 12 tecnologías (entran claude y bun; Claude y Claude Code son cards distintas), YOUTUBE y GITHUB (título GITHUB) en la última fila y HACK THE BOX en la zona superior junto al perfil. La colocación deja de estar a mano: src/domain/hero-grid-layout.ts (layoutHeroCards + HeroGridLayoutError) ordena personalizadas → tecnologías → redes, aplica la plantilla superior y filas inferiores 2-2-2-4-2 simulando el auto-placement; los componentes emiten data-col-span/data-row-span y hero-section.css los traduce a spans; fuera gridColumn/gridRow del JSON y de la entidad; category (tech/social) en entidad y parseo. Tokens --color-marca-claude #B4532F y --color-marca-bun #3D2B1F; salen --color-overlay-strong y --color-overlay-soft (tokens.css en 99 líneas). Test nuevo tests/hero-mosaic-layout.test.mjs (rojo ERR_MODULE_NOT_FOUND, 23/72 fallos → verde) y 9 tests reapuntados con nota «Ajuste feature 98 (precedente REQ-43-06)». CDP a 375/800/1024/1280/1600: mapa de escritorio 15/15 idéntico a design.md (12x10 sin huecos ni solapes), títulos dentro, nube de cloudflare al 100 %, 0 solapes y 0 errores de consola; ajustes en <= 1200 px: claude scale 3, bun scale 3 / 0deg, youtube scale 3. Capturas en progress/research/hero98/. Suite 1028/1028. Spec: specs/98_hero-mosaic-layout/; análisis: progress/research/hero-mosaic-layout.md; informe: progress/impl_hero-mosaic-layout.md.
- Feature 99 hero-os-panel-mosaic cerrada en done (APPROVED, progress/review_hero-os-panel-mosaic.md). Notas humanas 2026-10-16 sobre la captura acomodo.PNG: «si todas tienen patrones diferentes mejor por que queremos similar el menu panel como de un sistema operativo» y «cada una de las que quedan grande sea la que tiene mas relevancia sea una tecnologia mas pro» (quedan atendidas). Campo booleano featured en hero-cards.json, entidad y parseo (ausente = false; no booleano lanza HeroCardsDataError); plantillas en src/domain/hero-grid-template.ts (nuevo) y colas featured/pequeñas en src/domain/hero-grid-layout.ts, que lanza HeroGridLayoutError si el número de featured no coincide con los 3 huecos grandes o si una red social es featured. Grandes NODE JS (8/span 5 x 5/span 2), NESTJS (1/span 4 x 7/span 2) y TYPESCRIPT (5/span 4 x 9/span 2); AWS, CLOUDFLARE y RUST pequeñas arriba; zona superior [5x4, 2x2, 2x2, 2x2, 5x2] y filas inferiores alternando 4-2-2-2-2 / 2-2-4-2-2, sin columnas alineadas entre grandes contiguas ni tiles de 2 filas de alto. Sin CSS de spans nuevo, sin style inline ni JS de cliente; determinista en build. Iconos ajustados solo con --icon-width/--icon-scale/--icon-rotation (CLOUDFLARE completo con scale 1, 170px / 100px; en ≤ 1200 px node 3, nestjs 3, react 3, typescript 2, youtube 2). Tests primero (rojo 15/42, hero-mosaic-layout 6/7 en fallo) y 5 tests ajustados con nota «Ajuste feature 99 (precedente REQ-43-06)». CDP a 375/800/1024/1280/1600: mapa 15/15 = design.md, 12x10 sin huecos ni solapes, 0 errores de consola; capturas en progress/research/hero99/. Suite 1030/1030. Spec: specs/99_hero-os-panel-mosaic/; análisis: progress/research/hero-os-panel-mosaic.md; informe: progress/impl_hero-os-panel-mosaic.md.

## 2026-10-19 — Cierre de las features 93, 100 y 102

- Feature 93 system-design-nav-link cerrada en done (APPROVED en ronda 3, progress/review_system-design-nav-link.md). Petición humana 2026-10-14 (atajo «Diseño de sistemas» en el header hacia /diseno-de-sistemas) y desbloqueo 3 por decisión humana 2026-10-16 («Has todo lo que tengas pendiente de una ves… ponlo completo tambien»). Etiqueta siempre completa «Diseño de sistemas» en barra y panel, sin span ni aria-label; se borra nav-label.css; white-space: nowrap en .site-navbar a; el corte del menú hamburguesa pasa de 768/769 a 969/970 en layout.css, site-menu.css, search-bar.css y site-menu.ts (umbral medido: la etiqueta cabe en una línea desde 967 px). Ampliación 2026-10-16 («pon una apertura suave tmb…»): apertura y cierre solo CSS en site-menu.css (visibility/opacity/translateY con var(--transition-default), sin transición con prefers-reduced-motion; visibility sin transición al abrir y solo color en los enlaces del panel, correcciones a design.md halladas al medir, REQ-93-34). docs/conventions.md documenta la excepción 969/970 (REQ-93-40). Test reescrito tests/system-design-nav-link.test.mjs (rojo pass 4 / fail 10 → verde 15/15) y tests heredados reapuntados con nota «Ajuste feature 93 (precedente REQ-43-06)». CDP a 375..1280: umbral 969/970, etiqueta en 1 línea, header 65 px, sin scroll horizontal, foco, Escape, reduced-motion y ClientRouter OK; capturas en progress/research/nav93/. Observación del reviewer (preexistente, de la 94): tras más de un viewport de scroll el header sale de pantalla por html, body { height: 100% } (REQ-94-04). Spec: specs/93_system-design-nav-link/; análisis: progress/research/system-design-nav-link.md; informe: progress/impl_system-design-nav-link.md.
- Feature 100 specs-three-digit-ids cerrada en done (APPROVED, progress/review_specs-three-digit-ids.md). Mantenimiento del arnés (decisión del líder 2026-10-16): scripts/validate-specs.mjs acepta ids de feature de 2 o más dígitos (REQ_PREFIX con primer grupo (\d{2,}); el segundo sigue en (\d{2})); <NN> aclarado en docs/conventions.md y specs/_template/requirements.md (padding mínimo a 2 dígitos; 3 o más desde el id 100). El pulido del hero se renumeró a la 101 (depende de la 100). Test nuevo tests/specs-three-digit-ids.test.mjs (rojo pass 3 / fail 6 → verde 9/9); check-format exit 0. Spec: specs/100_specs-three-digit-ids/; análisis: progress/research/specs-three-digit-ids.md; informe: progress/impl_specs-three-digit-ids.md.
- Feature 102 latest-posts-tests-from-content cerrada en done (APPROVED, progress/review_latest-posts-tests-from-content.md). Tras el ajuste autorizado por el humano de los posts de systems-design (2026-10-19), los tests de últimos artículos dejan de fijar slugs a mano: helper tests/helpers/latest-real-posts.mjs (frontmatter slug/created + PostsRepository.getPosts() + latestPosts(), raíz parametrizable, error ante empate en los limit + 1 primeros); REQ-95-06/07/12, REQ-30-13 y REQ-96-04/05 comparan contra él sin debilitar (nota «Ajuste feature 102 (precedente REQ-43-06)»; latest-cards-gsap-motion.test.mjs en 100 líneas). Ampliación (decisión del líder): la guarda REQ-93-04/21/22 comprueba el commit 268e9ad que cerró la 93 en vez de git diff HEAD (REQ-102-12). Test nuevo tests/latest-real-posts.test.mjs (rojo 0/4 → verde 4/4). Sin cambios en src/. Suite 1055/1055; ./init.sh exit 0. Spec: specs/102_latest-posts-tests-from-content/; análisis: progress/research/latest-posts-tests-from-content.md; informe: progress/impl_latest-posts-tests-from-content.md.
- Resueltos y fuera de la bitácora: la 93 ya no está blocked; los fallos por la imagen design00.webp desaparecen con el ajuste humano de los posts (img arch00.webp) y la 102. Backlog tras el cierre: 101 pending (depende de la 100, ya done) y 10 blocked.

## 2026-10-19 — Cierre de la feature 101

- Feature 101 hero-cards-polish cerrada en done (APPROVED, progress/review_hero-cards-polish.md). Origen: observaciones 1-5 del reviewer de la 99 y petición humana 2026-10-16 («Has todo lo que tengas pendiente de una ves»). Token --color-marca-nestjs #3A0D18 (título blanco 16,79:1, logo 3,61:1); grandes de escritorio con --icon-width 240/230/220 px y --icon-scale 7 (el svg mide 32px de alto y el ancho no agranda el logo), en tablet 165/160/150 px y escalas 3/3/2; css y html con --icon-scale 3 en <= 1200 px; padding superior de HTB * 4.5 de --gap-card en <= 1200 px (htb-card.css y htb-stadistics.css). Desvío aceptado de REQ-101-14: --card-column/--card-row sí se definen en hero-section.css (spans de la 98), así que grid-column/grid-row pasan de hero-card.css a hero-section.css (.hero-grid > .hero-card) con geometría idéntica a 1280/1600. Guardas REQ-93-13/37 reapuntadas a los commits de la 93 (268e9ad, 6b75e45). Test nuevo tests/hero-cards-polish.test.mjs y tests ajustados con nota «Ajuste feature 101 (precedente REQ-43-06)»; rojo 12 fallos → verde 1064/1064; ./init.sh exit 0. CDP del reviewer en 375/769/800/1024/1200/1280/1600: 0 px² título/logo en las 14 cards de icono, aviso HTB entero, grandes ~2x la mediana de las 2x2, 0 errores de consola. Capturas en progress/research/hero101/. Observaciones no bloqueantes: tests/system-design-nav-link.test.mjs (143 líneas) y tests/hero-cards-styles.test.mjs (181) superan 100 desde antes (feature de limpieza); el «TS» de TYPESCRIPT asoma cortado a escala 7 (65 % visible; podría bajarse a 6). Spec: specs/101_hero-cards-polish/; análisis: progress/research/hero-cards-polish.md; informe: progress/impl_hero-cards-polish.md.
- Backlog tras el cierre: sin pending; la 10 sigue blocked, a verificar.

## 2026-10-19 — Cierre de la feature 103

- Feature 103 hero-cards-extra-logos cerrada en done (APPROVED en Revisión 2, progress/review_hero-cards-extra-logos.md). Cards de icono con 2 logos extra opcionales (cornerIcon en la esquina superior derecha y backgroundIcon como fondo inferior de baja opacidad), campos omitidos = card idéntica. Entidad y parse (módulo hermano para <= 100 líneas), datos de CLAUDE CODE (claude-code + esquina claude + fondo anthropic-wordmark) y GITHUB (fondo github-wordmark, sin esquina), render condicional aria-hidden en hero-card.astro y hoja nueva src/styles/hero-card-accents.css; hero-card.css y tokens.css sin tocar. Revisión 1 CHANGES_REQUESTED (el icono principal tapaba el wordmark: 84 % / 91 % a 1280 px); spec ajustada con REQ-103-31..33 y endurecidos REQ-103-24/26; .card-backdrop a z-index 2 (test REQ-103-31 en rojo antes del CSS). CDP a 375/800/1024/1280/1600: 15 cards a 0,00 px de la base, fondo visible en 100/100 puntos, solape con el título 0, contraste 8,73:1 / 14,46:1, hover sin cambios, 0 errores; capturas en progress/research/hero103/. Suite 1075/1075. Informe: progress/impl_hero-cards-extra-logos.md.
- Backlog tras el cierre: sin pending; la 10 sigue blocked, a verificar.

## 2026-10-20 — Cierre de la feature 104

- Feature 104 home-cls-fix cerrada en done (APPROVED, progress/review_home-cls-fix.md). Origen: pendientes (c) y (d) de progress/current.md y encargo humano 2026-10-16 («Has todo lo que tengas pendiente de una vez»). spec_author (2026-10-19) midió CLS 0,4837 (1280×800) y 0,4074 (1600×900) al recargar y con history.back con el scroll al fondo (0 a mitad del tramo y en carga limpia); causa: el ClientRouter restaura scrollY sobre el layout apilado previo al JS (4532 px) y luego el envoltorio horizontal deja 3075 px, con el footer entrando en el viewport. Arreglo solo CSS: hoja nueva src/styles/latest-horizontal-reserve.css (43 líneas) importada por latest-horizontal.astro, bajo @media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled) y .latest-articles:not(.latest-articles--horizontal) con 3+ cards: replica el layout horizontal y reserva margin-bottom = (n − 2) × (W + G). Sin JS nuevo ni dependencias; congelados de REQ-96-39 intactos. Pendiente (c) resuelto en texto: REQ-96-51 corregido con nota «Ajuste de texto feature 104» (el código decide solo con progress). Test nuevo tests/home-cls-fix.test.mjs (rojo 8/10 → verde 10/10); suite 1085/1085; ./init.sh exit 0. CDP (implementer y reviewer): CLS 0 en los 10 casos a 1280×800 y 1600×900, diferencia de docH/footTop 0 px entre frames con y sin envoltorio, sin JS y con reduced motion igual que antes, CLS 0 al recorrer a 375/768/1024/1280/1600 y mediciones de la 96 sin regresión, 0 errores de consola. Observaciones del reviewer (no bloquean): riesgo residual aceptado (si el JS está habilitado pero el módulo no carga, la sección queda en fila sin recorrido); si LATEST_POSTS_LIMIT crece hará falta la regla del nuevo n en reserve.css (REQ-104-06 lo detecta). Spec: specs/104_home-cls-fix/; análisis: progress/research/home-cls-fix.md; datos: progress/research/cls104/; informe: progress/impl_home-cls-fix.md.
- Backlog tras el cierre: sin pending; la 10 sigue blocked, a verificar.

## 2026-10-20 — Cierre de la feature 10

- Feature 10 client-init-on-navigation cerrada en done (APPROVED, progress/review_client-init-on-navigation.md). Desbloqueada (blocked -> pending) por spec_author el 2026-10-20 por la instrucción humana del 2026-10-16 («Has todo lo que tengas pendiente de una ves»), sin decisión humana pendiente (depends_on 3/4/5/6/7/9 done, sin dependencias externas). Spec ampliada con REQ-10-10..15. El código de re-inicialización con astro:page-load ya estaba en src/ (REQ-10-01..09 en verde); se corrigen los dos huecos reales: initSearchResults sale sin tocar document.title ni pedir el índice si la página no tiene [data-search-guide] (REQ-10-10) e initSearchLive retira su manejador search:change antes del return sin panel (REQ-10-11). Test nuevo tests/client-init-on-navigation-gaps.test.mjs (rojo 3/4 → verde 4/4). CDP before/after contra build + preview: los huecos eran reales (title «Búsqueda: about» y 2 ejecuciones del manejador antiguo en /about) y desaparecen con el fix; REQ-10-12..15 OK, 0 errores de consola; script y capturas en progress/research/client-init10/. Suite 1089/1089; ./init.sh exit 0. Observaciones del reviewer (no bloquean): la cabecera y los nombres de tests/client-init-on-navigation-gaps.test.mjs hablan de «.search-results» pero el guard usa [data-search-guide] (renombrar si se retoca); el ajuste de REQ-10-07 se justifica en el informe y no en el research citado por REQ-10-08. Spec: specs/10_client-init-on-navigation/; análisis: progress/research/client-init-on-navigation-unblock.md; informe: progress/impl_client-init-on-navigation.md.
- Backlog tras el cierre: sin pending ni blocked.

## 2026-10-20 — Cierre de la feature 105

- Feature 105 hero-backdrop-subtle-bottom cerrada en done (APPROVED, progress/review_hero-backdrop-subtle-bottom.md). Petición humana 2026-10-20 («el logo del fondo no importa que sea mas grande que desborde… ponle un pequeño toque de opacidad mas aun para que sea bien sutil y asegurate que quede hasta abajo por que esta quedando por encima del SVG principal ahora»). Reemplaza REQ-103-19/20/31/32. Cambio solo en src/styles/hero-card-accents.css (49 líneas): .card-backdrop a z-index 0 (por DOM bajo .card-icon), --card-backdrop-opacity 0.06, left/right -16px (-10px en <= 1200 px), bottom 0 y sin height; svg width 100%, height auto, aspect-ratio de respaldo 4 / 1 y regla por logo .card-backdrop:has(use[href$="#id"]) svg con el ratio del viewBox del symbol (anthropic-wordmark 182 / 24, github-wordmark 249.1 / 67.5). Desviación aceptada por el reviewer: margin-bottom calc(-100% * 2 / 182) en anthropic-wordmark (su trazo acaba en y = 22 de 24). Test nuevo tests/hero-backdrop-subtle-bottom.test.mjs (rojo 8 fallos → verde 20/20) y tests/hero-cards-extra-logos.test.mjs ajustado con nota «Ajuste feature 105 (precedente REQ-43-06)» (100 líneas). Suite 1098/1098; ./init.sh exit 0. CDP (implementer y reviewer) a 375/800/1024/1280/1600: borde inferior del use a 1 px de la card, ancho del use mayor que el interior, 0 puntos con el fondo antes que el icono, opacidad 0.06 / z-index 0, solape título 0, contraste 12,27:1 / 18,88:1, 15 cards a 0 px de la línea base, 0 errores de consola y red; capturas en progress/research/hero105/. Observaciones del reviewer (no bloquean): el margin-bottom de anthropic-wordmark depende del path del sprite (y = 2..22 de 24) y ningún test lo fija; design.md no recoge la desviación (solo el impl); en CLAUDE CODE el svg exterior sobresale entre 0,4 y 3 px por abajo (lo recorta la card). Spec: specs/105_hero-backdrop-subtle-bottom/; análisis: progress/research/hero-backdrop-subtle-bottom.md; informe: progress/impl_hero-backdrop-subtle-bottom.md.
- Backlog tras el cierre: sin pending ni blocked.

## 2026-10-20 — Cierre de la feature 106

- Feature 106 hero-cards-mobile-visibility cerrada en done (APPROVED, progress/review_hero-cards-mobile-visibility.md). Petición humana 2026-10-20: opciones configurables de las cards del hero desde src/data/hero-cards.json (visibilidad en móvil, enlace con flecha y tamaño del logo de fondo); spec_author dio de alta 106, 107 hero-cards-links y 108 hero-backdrop-size (ambas depends_on [106]); análisis en progress/research/hero-cards-json-options.md. Cambio: campo showOnMobile en HeroCard/HeroRichCard (por defecto false en icono, true en ricas; no booleano = HeroCardsDataError), explícito en las 15 cards (true solo en HTB), parse partido en hero-cards-fields-parse.ts; data-show-on-mobile="true" solo cuando showOnMobile es true en hero-card.astro y htb-card.astro; .hero-grid > .hero-card:not([data-show-on-mobile]) { display: none } en el @media (max-width: 768px) de hero-section.css. Ronda 1 bloqueada: pintar true|false en las 15 cards llevaba dist/client/index.html de 39 775 a 40 194 B y rompía REQ-47-01/06 (< 40 000); el líder eligió la opción 2 (atributo condicional + :not) y spec_author reescribió REQ-106-08/09 y añadió REQ-106-18/19 sin tocar el umbral. Ronda 2: tests propios y heredados (91-06, 92-04, 99-18, 101-11/12/13, 103-09/10/11) ajustados primero (rojo 7 fail) y verde después; suite 1107/1107, ./init.sh exit 0; index.html 39 775 → 39 802 B (margen 198 B). CDP 375/800/1024/1280/1600 OK; capturas en progress/research/hero106/. Riesgo de peso para 107 (REQ-107-27/28, ≈ 350-380 B sobre 198 B: probable bloqueo) y 108 (REQ-108-17/18). Spec: specs/106_hero-cards-mobile-visibility/; informe: progress/impl_hero-cards-mobile-visibility.md.
- Backlog tras el cierre: 107 y 108 pending (dependencia 106 ya en done).

## 2026-10-20 — Cierre de la feature 107

- Feature 107 hero-cards-links cerrada en done (APPROVED en Revisión 2, progress/review_hero-cards-links.md). Petición humana 2026-10-20: cards del hero clicables con href desde src/data/hero-cards.json y flecha ↗ en la esquina con hover o foco. Cambio: href (string | null) en HeroCard/HeroRichCard validado en el parse (https:// externo o /ruta interna; otro valor = HeroCardsDataError) con módulo src/domain/hero-card-link.ts; a.card-link como último hijo del article (sin enlaces anidados, también en HTB) con span.visually-hidden «<título> (sitio externo)», rel="noopener" y span.card-link__arrow aria-hidden; hoja nueva src/styles/hero-card-link.css. Valores por defecto: GITHUB https://github.com/MoiBaldenegro, YOUTUBE https://www.youtube.com/@moibaldenegro, HTB y tecnologías null. Ronda 1 bloqueada por peso (REQ-107-28): index.html 39 798 → 40 211 B con el marcado de la spec; el líder eligió la opción 1 y spec_author amplió la 107 (REQ-107-07 reformulado, REQ-107-29..36) para quitar los 17 xlink:href de los <use> de hero-card.astro. Ronda 2: test nuevo tests/hero-cards-links-xlink.test.mjs (rojo 4/5 → verde), 11 tests heredados + hero-cards-extra-logos ajustados con «Ajuste feature 107 (precedente REQ-43-06)»; Revisión 1 CHANGES_REQUESTED corregida en la ronda 3 (solo frontmatter). index.html final 39 457 B (margen ~540 B para la 108; umbral REQ-47-06 < 40 000 intacto). CDP 375-1600 sin diferencias de geometría y 0 errores; capturas en progress/research/hero107/. ./init.sh exit 0. Spec: specs/107_hero-cards-links/; informe: progress/impl_hero-cards-links.md.
- Backlog tras el cierre: 108 pending (dependencia 106 en done).

## 2026-10-20 — Cierre de la feature 108

- Feature 108 hero-backdrop-size cerrada en done (APPROVED, progress/review_hero-backdrop-size.md). Petición humana 2026-10-20: tamaño del logo de fondo de las cards del hero configurable desde src/data/hero-cards.json. Cambio: enum HERO_BACKDROP_SIZES = sm | md | lg en la entidad y campo opcional backgroundIconSize validado en hero-cards-fields-parse.ts (fuera del enum o sin backgroundIcon = HeroCardsDataError; ausente = sin clave); data-backdrop-size en div.card-backdrop solo si el JSON lo declara (hero-card.astro, sin style inline); reglas sm/lg en hero-card-accents.css con md = geometría de la 105 en la regla base. Valores por defecto: md = left/right -16px (-10px en <= 1200 px), sm 16px/10px, lg -56px/-36px; claude-code y github declaran md (sin cambio visual). Test nuevo tests/hero-backdrop-size.test.mjs (rojo → verde) y tests heredados ajustados con «Ajuste feature 108 (precedente REQ-43-06)». Suite 1131/1131; ./init.sh exit 0. Peso de dist/client/index.html 39 457 → 39 501..39 513 B (< 40 000, umbral REQ-47-06 intacto). CDP sm/md/lg a 375/800/1024/1280/1600 OK (sm < md < lg, borde inferior a <= 2 px, solape 0 con el título); capturas en progress/research/hero108/. Observaciones del reviewer (no bloquean): una tarjeta rica que declare backgroundIconSize (incluso inválido) no da error porque parseRichCard ignora los campos de icono, como siempre (si se quiere error, feature aparte para todos esos campos); sm/lg son valores por defecto revisables (design.md, Decisión 2). Spec: specs/108_hero-backdrop-size/; análisis: progress/research/hero-cards-json-options.md; informe: progress/impl_hero-backdrop-size.md.
- Backlog tras el cierre: sin pending ni blocked.

## 2026-10-20 — Cierre de la feature 111

- Feature 111 hero-cards-data-rebaseline cerrada en done (APPROVED, progress/review_hero-cards-data-rebaseline.md). Origen: 8 tests de features cerradas en rojo por ediciones humanas de src/data/hero-cards.json tras la 108, que bloqueaban la 109. implementer 111: 5 tests re-basados con «Ajuste feature 111 (precedente REQ-43-06)» (108/103/107/101/98) + test nuevo tests/hero-cards-data-rebaseline.test.mjs; hero-card.css base cloudflare 270px / 0deg / --icon-scale 1.25 (CDP). JSON, sprite, posts y hack-the-box-sprite intactos (sha256). ./init.sh código 0, 1146/1146; portada 39 777 B (umbral sin cambios). CDP y capturas en progress/research/hero111/. Spec: specs/111_hero-cards-data-rebaseline/; análisis: progress/research/hero-cards-data-rebaseline.md; informe: progress/impl_hero-cards-data-rebaseline.md.
- Pendientes humanos de la 111 (no bloquean): (H2) el svg de .card-icon a 28px no tiene spec; se trató como edición humana, a confirmar. (H3) iconWidth 270px de CLOUDFLARE queda fuera del rango 90-200px de la 97. (H5) #cloudflare-cloud se usa como icono principal y como esquina; a 800 px el icono de esquina de CLOUDFLARE tapa el final del título (fuera de alcance). Además, el scale del JSON no se consume en el render (8 no se replica en CSS; decisión humana a confirmar).
- Observaciones del reviewer de la 111 (no bloquean): (1) src/styles/hero-card.css:56 sigue diciendo «svg de 32px de alto» (mide 28px); corregir al volver a tocar el archivo. (2) REQ-111-14 en tests/hero-cards-data-rebaseline.test.mjs:57-61 compara contra HEAD: si el humano edita sprite.svg o hack-the-box-sprite.test.mjs fuera de una feature, la suite se pone en rojo; tras el commit conviene retirarla o convertirla en guarda de sesión. (3) REQ-111-01 (JSON byte a byte igual) no tiene test; verificado por sha256. (4) A 1201-1280 px la nube queda a la izquierda sobre el wordmark de fondo (109) y a 1201 px asoma 1.7 px por la izquierda (97.8 % dentro, >= 90 %), por el iconWidth 270px.
- Feature 109 hero-backdrop-bottom-left: estaba blocked solo por la suite en rojo por esos tests ajenos; con ./init.sh verde tras la 111 pasa a in_progress y se desbloquea para revisión (código e informe sin cambios salvo una nota de suite verde).

## 2026-10-20 — Cierre de la feature 109

- Feature 109 hero-backdrop-bottom-left cerrada en done (APPROVED en Revisión 2, progress/review_hero-backdrop-bottom-left.md). Petición humana 2026-10-20 (tarea 1 de 7): «EL icono del background ponerle una alineacion estatica de la esquina inferior izquierda, abajo y a la izquierda, por que cuando hay logos pequeños que no desbordan se estan centrando.» Cambio solo CSS en src/styles/hero-card-accents.css (65 líneas): .card-backdrop con left fijo + width y right auto (md -16px / calc(100% + 32px), -10px / calc(100% + 20px) en <= 1200 px; lg -56px / calc(100% + 112px), -36px / calc(100% + 72px), mismos rectángulos que antes); sm 16px / 60 % (10px / 60 % en <= 1200 px), pegado abajo-izquierda; regla sm para anthropic-wordmark con margin-left calc(-100% * 2 / 182) (compensa la holgura izquierda del glifo, x ≈ 2/182; añadida en la ronda 1 de revisión); regla aspect-ratio 512 / 76 para cloudflare. bottom 0, z-index 0, opacidad 0.06 y ratios/margen de anthropic y github intactos. Valores por defecto revisables: left fijo + width; sm 16/10 px con width 60 %; regla sm de anthropic-wordmark; aspect-ratio 512/76 de cloudflare (specs/109_hero-backdrop-bottom-left/design.md). Test nuevo tests/hero-backdrop-bottom-left.test.mjs (rojo → verde) y heredados 103/105/108 ajustados con «Ajuste feature 109 (precedente REQ-43-06)». Estuvo blocked por 8 tests ajenos en rojo (ediciones humanas del JSON), resueltos por la 111. Revisión 1 CHANGES_REQUESTED (CLAUDE CODE sm +0,7..2,3 px a la derecha de 16/10 px) corregida. ./init.sh exit 0; portada 39 777..39 789 B (< 40 000, umbral intacto). CDP a 375/800/1024/1280/1600: sm a 10/16 px ±1 con hueco derecho mayor, md/lg y JSON real Δ 0 frente a la base, hueco inferior 1..1,6 px, solape con el título 0, 0 errores; capturas en progress/research/hero109/. Spec: specs/109_hero-backdrop-bottom-left/; análisis: progress/research/hero-backdrop-anchor-new-tab.md; informe: progress/impl_hero-backdrop-bottom-left.md.
- Backlog tras el cierre: 110 hero-cards-links-new-tab pasa a in_progress (depends_on 107 done).

## 2026-10-21 — Cierre de la feature 110

- Feature 110 hero-cards-links-new-tab cerrada en done (APPROVED, progress/review_hero-cards-links-new-tab.md). Petición humana 2026-10-20 (tarea 2 de 7): «las cards cuando hacen la navegacion debe ser un BLANK, que le habra en una nueva pestaña.» El a.card-link de hero-card.astro y htb-card.astro lleva target="_blank" y rel="noopener noreferrer" en todo href (externo o interno); aviso accesible en span.visually-hidden decidido en src/domain/hero-card-link.ts (cardLinkLabel): «GITHUB (sitio externo) (se abre en una pestaña nueva)» (interno: «<título> (se abre en una pestaña nueva)»). Sin cambio visual ni CSS nuevo. Test nuevo tests/hero-cards-links-new-tab.test.mjs (rojo → verde) y heredados ajustados con «Ajuste feature 110 (precedente REQ-43-06)» (hero-cards-links, hero-cards-extra-logos, hero-cards-polish). Retomada tras corte por límite de API. ./init.sh exit 0 (1154/1154); peso de dist/client/index.html 39 781 → ~39 895 B (< 40 000, umbral de REQ-47-06 sin tocar; REQ-110-14 no aplica). CDP a 375/800/1024/1280/1600: Target.targetCreated con el href en clic y Enter, URL original intacta, nombre accesible correcto en el árbol AX, 0 errores; capturas en progress/research/hero110/. Observación menor del reviewer: el informe dice «flecha a 13/13 px» (caja del glifo), no el font-size (17.6/20 px); nombrar la métrica en informes futuros. Spec: specs/110_hero-cards-links-new-tab/; informe: progress/impl_hero-cards-links-new-tab.md.
- Backlog tras el cierre: sin features pending ni in_progress.

## 2026-10-21 — Cierre de la feature 112

- Feature 112 hero-rich-card-logos cerrada en done (APPROVED, progress/review_hero-rich-card-logos.md). Petición humana 2026-10-20 (tarea 3 de 7): logos de fondo con efecto hover en las cards ricas del hero (HTB). HeroRichCard gana icon/backgroundIcon/backgroundIconSize opcionales; componente compartido src/components/hero-card-art.astro usado por hero-card.astro y htb-card.astro; ./init.sh verde al cerrar.
- spec_author (2026-10-21): alta de la 112 hero-rich-card-logos (pending) con specs/112_hero-rich-card-logos/requirements.md (REQ-112-01..26) y design.md; análisis en progress/research/hero-rich-card-logos.md. Valores por defecto revisables (ap): cubo #htb en .card-icon de la rica con opacity 0.16 y pointer-events none, --icon-width 150px, --icon-rotation -8deg, --icon-scale 6 (3 en <= 1200 px; 110px heredado en <= 768); wordmark #htb-wordmark como .card-backdrop sm (abajo-izquierda, 60 %, opacidad 0.06, ratio 300 / 58.8; alternativa md); componente compartido hero-card-art.astro; si la portada alcanza 40 000 B, umbral REQ-47-06 a 42 000 B (tope REQ-96-07, aprobación humana).
- implementer (2026-10-21): 112 en in_progress; línea base de las 14 cards de icono en progress/research/hero112/icon-cards-baseline.html; test nuevo en rojo (0/9) y luego verde (9/9); suite 1163/1163 y ./init.sh con código 0. Portada 39 895 → ~40 203-40 215 B: umbral de REQ-47-06 a 42 000 B con nota y aprobación humana (REQ-112-25). Añadido el margin-bottom calc(-100% * 5.9 / 300) del wordmark (Decisión 4; getBBox: glifo hasta y = 52.9 de 58.8) para cumplir REQ-112-19. CDP a 375-1600 con 0 errores y servidor de preview :4620 parado. Informe en progress/impl_hero-rich-card-logos.md. Pendiente: reviewer.
- Pendientes humanos de la 112 (aq), valores por defecto revisables que no bloquean: HTB con icon #htb y backgroundIcon #htb-wordmark tamaño sm; cubo con opacidad 0.16, --icon-width 150px, --icon-rotation -8deg, --icon-scale 6 (3 en <= 1200 px); wordmark con opacidad 0.06 al 60 % abajo-izquierda; umbral de REQ-47-06 subido a 42 000 B con aprobación humana (portada ~40 210 B).
- Observación del reviewer de la 112 (ar), no bloquea: a 800/1024 px el cubo de HTB casi no se ve y su caja solapa la del título.
- Backlog tras el cierre: sin features pending ni in_progress.

## 2026-10-21 — Cierre de la feature 113

- Feature 113 purple-to-logo-tone cerrada en done (APPROVED, progress/review_purple-to-logo-tone.md). Petición humana 2026-10-20: igualar los morados del sitio al tono del logotipo (muestreado de public/assets/mxvi_logo.webp: #6C387A, hue 287,3). Cambian 7 tokens de src/styles/tokens.css (99 líneas, sin tokens nuevos): accent #B37AC2, accent-hover #C396CF, hero-top #3C1F44, hero-mid #150A18, glow rgba(108, 56, 122, 0.35), scrollbar-thumb #6C387A y marca-css #6C387A; .skip-link de layout.css con texto var(--color-background) por contraste. Test nuevo tests/purple-to-logo-tone.test.mjs (rojo → verde) y ajustes con «Ajuste feature 113 (precedente REQ-43-06)» en tests/design-tokens.test.mjs:43 y tests/hero-cards-links-xlink.test.mjs:33. Estuvo blocked por contradicción de spec (hero-mid #140A16 con hue 290 frente a REQ-113-06 287 ± 2); el spec_author lo corrigió a #150A18. ./init.sh verde (1168/1168). CDP antes/después a 375/1280 en progress/research/colors113/. Spec: specs/113_purple-to-logo-tone/; análisis: progress/research/purple-to-logo-tone.md; informe: progress/impl_purple-to-logo-tone.md.
- Pendientes humanos de la 113 (at), valores por defecto revisables que no bloquean: logo #6C387A; accent #B37AC2, hover #C396CF, hero-top #3C1F44, hero-mid #150A18, glow rgba(108,56,122,.35), scrollbar #6C387A, marca-css #6C387A; skip-link con texto --color-background.
- Observación del reviewer de la 113 (au), no bloquea: los bloques de código de los posts siguen en morado #B392F0 del tema github-dark del resaltador; quitarlo sería otra feature.
- Backlog tras el cierre: sin features pending ni in_progress.

## 2026-10-21 — Cierre de la feature 114

- Feature 114 search-bar-magnifier-animation cerrada en done (APPROVED, progress/review_search-bar-magnifier-animation.md). Petición humana 2026-10-20: lupa y animación bonita al escribir en la search bar del header. SVG inline decorativo (aria-hidden, focusable false) en src/components/search-bar/search-bar.astro; hoja nueva src/styles/search-bar-icon.css (63 líneas, CSS puro con :focus-within, :placeholder-shown y :has(); sin JS nuevo, sin tokens nuevos); padding-left 42px en src/styles/search-bar.css. Test nuevo tests/search-bar-magnifier-animation.test.mjs (rojo 9/10, REQ-114-08 guarda de regresión → verde 10/10); suite 1178/1178; ./init.sh exit 0; portada 40 562 B (< 42 000). CDP a 375/768/969/970/1024/1280 con 0 errores (progress/research/search114/). Spec: specs/114_search-bar-magnifier-animation/; análisis: progress/research/search-bar-magnifier-animation.md; informe: progress/impl_search-bar-magnifier-animation.md.
- Pendientes humanos de la 114 (av), valores creativos por defecto revisables que no bloquean: lupa SVG inline 16 px a left 16px, reposo --color-text-secondary (gris); foco --color-accent (ciruela) + scale 1.12 + halo 4px --color-glow; animación search-bar-scan 1.6 s infinita (±10deg, 3/-2 px) mientras hay foco y texto; ciruela estática con texto sin foco; reduced-motion sin animación; padding izquierdo 42px.
- Observaciones del reviewer de la 114 (aw), no bloquean: (1) con texto y el foco en el botón ×, la lupa también escanea (:focus-within); aceptable. (2) En reduced-motion manda la regla global de layout.css:97 (!important) sobre transition: none; el efecto es el mismo.
- Backlog tras el cierre: sin features pending ni in_progress.

## 2026-10-21 — Cierre de la feature 115

- Feature 115 hero-cards-lego-motion cerrada en done (APPROVED en Revisión 2, progress/review_hero-cards-lego-motion.md). Petición humana 2026-10-20: entrada y salida aleatoria tipo lego de todas las cards del hero (icono y ricas) con GSAP + ScrollTrigger. Dominio src/domain/hero-cards-motion.ts (constantes congeladas, createRng mulberry32, legoOrder, legoDelays, legoTilt, legoPhase); hoja src/styles/hero-cards-motion.css (custom properties --hero-lego-* compuestas en translate/rotate/scale para no pisar el hover); runtime src/components/new-hero/hero-cards-motion.ts + hero-cards-lego.ts. Test nuevo tests/hero-cards-lego-motion.test.mjs (rojo → verde); suite 1190/1190; ./init.sh exit 0; portada ~40 661 B (< 42 000). Revisión 1 CHANGES_REQUESTED (cards visibles se levantaban al volver a scroll 0 a 1280/1600) corregida con rango de salida propio (LEGO_RANGE.exitStart/exitEnd). CDP a 375/800/1024/1280/1600 con CLS 0 y 0 errores (progress/research/hero115/). Spec: specs/115_hero-cards-lego-motion/; análisis: progress/research/hero-cards-lego-motion.md; informe: progress/impl_hero-cards-lego-motion.md.
- Pendientes humanos de la 115 (ax), valores por defecto revisables que no bloquean: entrada y -32px, giro aleatorio ±3deg, scale 1.04, opacity 0, 0.6 s back.out(1.7); retardo aleatorio ≤ 0.6 s; salida y -24px 0.35 s power2.in; batch top 92% / bottom 8%; semilla aleatoria por carga.
- Observación del reviewer de la 115 (ay), no bloquea: con CPU lenta x6 el mosaico puede verse 30-55 ms antes de ocultarse y encajar; inherente a no ocultar con CSS.
- Backlog tras el cierre: sin features pending ni in_progress.
