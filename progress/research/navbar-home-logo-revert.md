# Análisis: corrección del humano — el logo ES el enlace Home (revert de la feature 13)

> Sesión spec_author. Petición humana corregida explícitamente tras la feature
> 13 `remove-navbar-logo` (APPROVED y done en dirección equivocada): «claro, el
> Logo te dije claramente que reemplazaba al Home, el home se va».

## 1. La corrección del humano (decisión D)

- Petición original: «El home fue reemplazado por el logo, ajusta lo que tengas
  que ajustar para que quede como estaba, era correcto». El líder la interpretó
  como «restaurar el Home de texto y quitar el logo» → feature 13.
- **Corrección explícita del humano**: «claro, el Logo te dije claramente que
  reemplazaba al Home, el home se va».
- **D — La intención real SIEMPRE fue**: el logo del navbar ES el enlace Home.
  «Quede como estaba» = el estado del commit `686a7cc` (diseño correcto):
  ancla del logo con aria-current de la portada y SIN enlace de texto «Home».
  La feature 13 fue en la dirección equivocada; esta sesión revierte su efecto
  sobre el marcado y los tests.

## 2. Verificación en disco y git (2026-08-20)

1. `git show 686a7cc:src/layouts/Layout.astro`: navbar =
   `<a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/"><img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/></a>`
   + About (aria-current) + Arquitectura (aria-current) + @moibaldenegro +
   SearchBar. SIN enlace de texto Home. Confirmado: ese es el diseño que el
   humano quiere. (El diff de 686a7cc sobre Layout.astro solo limpia un espacio
   en blanco; el diseño del logo ya estaba en el árbol en ese commit.)
2. Estado actual en disco (working tree, HEAD `4888e66` + features 12/13 sin
   commitear): enlace de texto Home con aria-current de la portada + About +
   Arquitectura + @moibaldenegro + SearchBar; SIN ancla del logo. Es el efecto
   de las features 12 y 13 que hay que revertir.
3. `public/assets/mxvi_logo.webp` existe y se conserva (ya existía en
   `72e5c52`, predata la regresión; ver research `navbar-home-logo-jump.md`).
4. `layout.css` ya estiliza `.site-navbar a[aria-current="page"]` (acento +
   subrayado): el ancla del logo hereda el estado activo de la portada igual
   que en 686a7cc. Sin CSS nuevo.
5. `node scripts/check-format.mjs` → FORMATO ✔ antes de tocar nada.

## 3. Qué se revierte de la feature 13 (solo marcado y tests)

- **Marcado**: `src/layouts/Layout.astro` vuelve al contrato 686a7cc — el
  ancla del logo es el único enlace de la portada (`aria-current` de `/` con
  degradado a `undefined`) y el enlace de texto Home se retira del navbar.
- **Tests**: se invierten las aserciones que la feature 13 (y su predecesora
  12) ajustaron al contrato equivocado.
- **NO se tocan los artefactos históricos**: `specs/13_*`,
  `progress/impl_13_*`, `progress/review_13_*`, `specs/12_*` quedan como
  bitácora permanente (el arnés no reescribe historia; el precedente es el
  propio ajuste de tests con justificación documentada, REQ-43-06).
- **REQ-13-06 se invierte**: «ningún archivo de src/ referencia el asset»
  deja de valer; `Layout.astro` vuelve a referenciar `mxvi_logo.webp`. El
  asset público se conserva (fuera de alcance borrarlo).

## 4. Tests que cambian y por qué (precedente REQ-43-06)

Verificado archivo por archivo; la corrección invierte la dirección de la
feature 13, así que ahora son **4 archivos de test** los que ajustan
aserciones (la 13 documentó 1; la corrección humana amplía el alcance):

| Test | Aserciones afectadas | Cambio al contrato real |
|------|----------------------|-------------------------|
| `tests/restore-navbar-home-link.test.mjs` (feat. 12) | REQ-12-01/02/03/04 | Se invierten: el «enlace de la portada» es el ancla del logo (`<img src="/assets/mxvi_logo.webp" ...>` dentro de `<a href="/">` con aria-current); el texto Home desaparece; About/Arquitectura/@moibaldenegro/SearchBar se conservan |
| `tests/remove-navbar-logo.test.mjs` (feat. 13) | REQ-13-01/02/03/05/06 | Se invierten: logo PRESENTE como único marcador de la portada, sin Home de texto; REQ-13-05 se reescribe para verificar que `restore-navbar-home-link.test.mjs` ajusta al contrato del logo (con justificación en el encabezado); REQ-13-06 se invierte (Layout.astro vuelve a referenciar el asset) |
| `tests/architecture-nav-link.test.mjs` | REQ-08-04 | La aserción `<a...href="/">Home</a>` pasa al ancla del logo (el «home» del navbar es el logo); About/Arquitectura/@moibaldenegro/SearchBar se conservan; REQ-08-01/02/03/05 y ≤100 líneas no cambian |
| `tests/layout-refactor.test.mjs` | REQ-08-05 | La aserción `href="/" >Home` pasa al ancla del logo como enlace de la portada; el resto de REQ-08 del layout no cambia |
| `tests/visual-polish-refactor.test.mjs` | REQ-37-03 | **VERDE sin cambios** (verificado): logo + About + Arquitectura = 3 `aria-current` con degradado `'page' : undefined`; `paths` incluye `/` |
| `tests/fix-navbar-jump.test.mjs` (feat. 14) | — | No referenciado: **no se toca** (independiente y correcta) |

Justificación del ajuste en el encabezado de cada archivo: precedente
REQ-43-06 — los tests de inspección siguen a la presentación real confirmada
por el humano.

## 5. Alcance / fuera de alcance

Dentro:
- `src/layouts/Layout.astro` (marcado del navbar: logo = portada, sin Home de
  texto) — lo implementa el `implementer`, no este rol.
- Tests: `restore-navbar-home-link.test.mjs`, `remove-navbar-logo.test.mjs`,
  `architecture-nav-link.test.mjs` (REQ-08-04), `layout-refactor.test.mjs`
  (REQ-08-05) — ajuste con justificación documentada.
- Spec 15 (`specs/15_navbar-logo-home/`).

Fuera de alcance:
- Feature 14 `fix-navbar-jump` (independiente y correcta; NO se toca).
- Feature 10 `client-init-on-navigation` (in_progress; NO se toca).
- Artefactos históricos 12/13 (specs, impl_, review_) — quedan como bitácora.
- CSS (ningún cambio), JS (estático por defecto), assets (se conserva el logo).

## 6. Riesgos

- **R1 — Pérdida de trazabilidad del ajuste de tests**: tocar 4 archivos sin
  documentar el porqué rompería la auditoría del arnés. Mitigado: REQ-15-07
  exige justificación en el encabezado de cada test (precedente REQ-43-06).
- **R2 — REQ-37-03 (≥2 aria-current con `/`)**: si el logo no asumiera
  exactamente la condición del Home actual, la portada perdería el marcador y
  el test podría caer a 2 marcadores sin `/`. Mitigado: REQ-15-02 fija la
  condición exacta `pathname === '/' ? 'page' : undefined` (verificado: 3
  marcadores con `/`).
- **R3 — Ambigüedad semántica de «Home» en REQ-08-04/08-05**: los tests
  existentes asercionan el texto «Home»; el contrato real lo elimina.
  Mitigado: las aserciones se reescriben al ancla del logo y el término
  «Home» pasa a designar el logo.
- **R4 — El logo sin alt descriptivo**: mitigado por REQ-15-03 (alt +
  width 72, mismo marcado que 686a7cc; accesibilidad del enlace de imagen).

## 7. Feature creada

- **15 `navbar-logo-home`** (depends_on [13], done): retirar el enlace de
  texto Home del navbar y devolver el ancla del logo como marcador de la
  portada (contrato 686a7cc); invertir las aserciones de los tests 12/13 y
  REQ-08-04/08-05 con justificación documentada. `depends_on: [13]` porque
  esta feature existe para invertir el contrato REQ-13-01..06; la 12 ya está
  done y su test se ajusta como consecuencia del mismo revert (sin ciclo ni
  auto-referencia). Spec: `specs/15_navbar-logo-home/requirements.md` +
  `design.md` (toca marcado/UI del navbar).