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
