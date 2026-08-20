# Review — feature 13 (remove-navbar-logo)

**Veredicto:** APPROVED

**Fecha:** 2026-08-20 · **Reviewer:** nivel 1 · **Base:** informe
`progress/impl_13_remove-navbar-logo.md`, spec `specs/13_remove-navbar-logo/`
(REQ-13-01..06 + design.md), análisis `progress/research/navbar-home-logo-jump.md`.

## Verificación en disco (independiente del informe)

- `src/layouts/Layout.astro` (46 líneas): el navbar ya NO contiene el ancla del
  logo; el enlace Home (L36) declara
  `aria-current={Astro.url.pathname === '/' ? 'page' : undefined}`; About (L37),
  Arquitectura (L38), @moibaldenegro (L39) y SearchBar (L40) se conservan.
- `tests/remove-navbar-logo.test.mjs` (nuevo, 177 líneas): cubre REQ-13-01..06
  con el patrón de inspección por regex establecido (node:test, stdlib).
- `tests/restore-navbar-home-link.test.mjs`: REQ-12-03 pasa a exigir la
  AUSENCIA del ancla del logo (L105-109); REQ-12-04 se invierte (Home con
  aria-current, sin ancla, L132-147); la justificación del ajuste está en el
  encabezado (L10-17: «feature 13 remove-navbar-logo», precedente REQ-43-06).
- `git status`: solo modificados `feature_list.json`, `progress/current.md`,
  `src/layouts/Layout.astro`, `tests/restore-navbar-home-link.test.mjs`; nuevos
  artefactos de sesión. `src/styles/layout.css` y `src/styles/tokens.css` NO
  tocados; `tests/layout-refactor.test.mjs` (REQ-08-05),
  `tests/architecture-nav-link.test.mjs` (REQ-08-04) y
  `tests/visual-polish-refactor.test.mjs` (REQ-37-03) NO tocados y verdes.
- `public/assets/mxvi_logo.webp` conservado (existe en disco).

## Incidente article.css (verificado por el reviewer)

- Contenido actual en disco = versión tokenizada correcta de la feature 11
  (19 líneas): scoping `.post__content .video-container` con width/max-width
  100%, aspect-ratio 16/9, margin `var(--gap-card)`, overflow hidden,
  border-radius `var(--radius-card)`; iframe con display block, width/height
  100%, border 0; SIN min-height ni border-radius en el iframe; sin clases
  muertas `.article`/`.prose`.
- `git diff HEAD -- src/styles/article.css` = vacío (sin modificaciones en
  `src/styles/`): el archivo está limpio respecto a HEAD.
- `node --test tests/article-iframe-styles.test.mjs` → 9/9 pass.
- El incidente del workerd queda resuelto: el estado actual es el correcto y
  la suite de la feature 11 sigue verde.

## Pregunta de revisión: test-first rojo → verde

- Rojo documentado en el informe (L23-54): `node --test` contra el Layout sin
  implementar → 5/5 fallos acotados a la brecha real (logo presente, Home sin
  aria-current, REQ-12-03/04 en rojo). La nota sobre el ajuste del propio test
  REQ-13-05 (regex escapado) es transparente y no afecta la validez del rojo.
- Verde re-verificado por el reviewer: `pnpm test` (comando canónico de
  `init.sh`) → 429/429 pass, 0 fail; `./init.sh` completo → entorno, formato,
  tests al 100% y build de producción OK.
- Dependencias: `depends_on: [12]` → feature 12 `done`. No se saltó ninguna
  dependencia pendiente.

## Justificación por REQ

- **REQ-13-01** — ✅ El navbar enlaza la portada solo con el Home de texto
  (L36); sin `<img>` del asset (verificado en disco y por el test REQ-13-01/03).
- **REQ-13-02** — ✅ El Home declara aria-current `page` cuando `pathname ===
  '/'` con degradado a `undefined`; el test REQ-13-02 cuenta exactamente 1
  marcador de la portada en el navbar.
- **REQ-13-03** — ✅ About, Arquitectura, @moibaldenegro y SearchBar
  conservados (L37-40) y asercionados.
- **REQ-13-04** — ✅ Layout.astro en 46 líneas ≤ 100 (REQ-13-04 verde).
- **REQ-13-05** — ✅ Encabezado de `restore-navbar-home-link.test.mjs` con la
  justificación (feature 13 + precedente REQ-43-06); REQ-12-03/04 ajustados al
  contrato real; aserción antigua del logo eliminada (doesNotMatch L157-161 del
  test nuevo).
- **REQ-13-06** — ✅ Grep propio del reviewer: cero referencias a
  `mxvi_logo.webp` en `src/`; el asset solo queda en `public/` (conservado).

## Cumplimiento de convenciones

- Sin `<style>` en `.astro`, sin CSS nuevo (el Home hereda
  `.site-navbar a[aria-current="page"]` de layout.css), sin valores
  hardcodeados, sin JS de runtime, sin dependencias externas.
- Frontmatter de Layout.astro solo imports/paso de datos (sin lógica añadida).
- Spec EARS estricto (una línea = un SHALL); design.md presente (toca UI).
- Tests de inspección con el precedente del repo; los archivos de test exceden
  las 100 líneas por precedente establecido (hasta 393 líneas en tests
  existentes): la regla de ≤100 aplica a código de `src/`/scripts, no a tests.
- Cierre limpio: sin temporales, sin debug, sin TODOs.

## Checkpoints

- C1: [x]
- C2: [x]
- C3: [x]
- C4: [x]
- C5: [x]
- C6: [x]
- C7: [x]
- C8: [x]
- C9: [ ]  ← Razón: inspección visual desktop/móvil pendiente (la deja el
  propio CHECKPOINTS como no verificada por el reviewer; requiere navegador).
- C10: [ ] ← Razón: `feature_list.json` conserva la feature 13 en
  `in_progress`; el marcado a `done` es el paso posterior del líder tras la
  aprobación (flujo normal del arnés, no un defecto de la feature).
- C11: [x] ← `progress/current.md` documenta la sesión y el incidente; el
  informe `impl_13` queda como artefacto permanente.
- C12: [x]

## Nota para el líder

- El dev server activo (no `--background`, pid 23112/25288) sigue corriendo
  desde las 13:01 y comparte `.wrangler/state/` con `pnpm build`: conviene
  reiniciarlo antes de la inspección visual (puede servir contenido stale y
  reescribir `src/styles/article.css` como ocurrió durante la implementación;
  el estado actual de article.css está verificado correcto).
- `specs/14_fix-navbar-jump/` (pendiente) está creada por spec_author — fuera
  del alcance de la feature 13, sin impacto en este veredicto.

## Cambios requeridos

Ninguno.