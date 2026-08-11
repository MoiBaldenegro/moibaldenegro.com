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
