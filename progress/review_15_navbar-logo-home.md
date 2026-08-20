# Review — feature 15 `navbar-logo-home`

**Veredicto:** APPROVED

## Verificación contra el estado real en disco

### `src/layouts/Layout.astro` (46 líneas, ≤100)
- Línea 36: `<a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/"><img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/></a>` — contrato 686a7cc exacto.
- SIN enlace de texto Home: `git diff` confirma la retirada de `<a href="/">Home</a>` y `grep -r Home src/` → sin coincidencias.
- Conserva About (37), Arquitectura (38), @moibaldenegro (39) y SearchBar (40).
- Sin `<style>`, sin JS de runtime, frontmatter solo imports/const (convenciones 7/8/9, architecture.md).

### Tests
- **`tests/navbar-logo-home.test.mjs`** (nuevo, 178 líneas, patrón inspector): cubre REQ-15-01/03, REQ-15-02 (único marcador de `/`), REQ-15-04, REQ-15-05, REQ-15-06, REQ-15-07. Las aserciones de REQ-15-07 verifican en los 4 archivos ajustados los tres marcadores exigidos: `feature 15 navbar-logo-home`, `REQ-43-06` y `mxvi_logo` — los 4 los cumplen (verificado por lectura directa y por el test en verde).
- **4 archivos ajustados con justificación REQ-43-06 en el encabezado** (verificado en el diff contra HEAD):
  - `tests/architecture-nav-link.test.mjs` (REQ-08-04): aserción `Home` de texto → ancla del logo; encabezado documenta el ajuste de la 15 + precedente REQ-43-06.
  - `tests/layout-refactor.test.mjs` (REQ-08-05): `href="/" >Home` → `href="/" ><img ... mxvi_logo.webp`; justificación en el encabezado.
  - `tests/restore-navbar-home-link.test.mjs` (REQ-12-01..05): aserciones invertidas al contrato del logo (incluye `doesNotMatch` de Home de texto en REQ-12-03/04); encabezado documenta el doble ajuste (13 y 15).
  - `tests/remove-navbar-logo.test.mjs` (REQ-13-01/02/03/05/06): aserciones invertidas (logo PRESENTE, único marcador; REQ-13-05 reaserciona el ajuste de restore-navbar-home-link; REQ-13-06 invertido); encabezado documenta la corrección humana.
- **NO tocados** (git status limpio de ambos): `tests/visual-polish-refactor.test.mjs` (REQ-37-03 en verde: 3 aria-current con `/`, paths incluye `/`) y `tests/fix-navbar-jump.test.mjs` (REQ-14, sin referencias al navbar; layout.css conserva `scrollbar-gutter: stable` — el único diff de `src/styles/layout.css` es el de la feature 14).

### Assets y alcance
- `public/assets/mxvi_logo.webp` presente (REQ-15-05).
- `git status`: solo los archivos esperados (Layout.astro, 5 tests, feature_list.json, progress/*). Feature 10 no tocada; artefactos históricos 12/13 intactos como bitácora.
- Dependencias: `depends_on: [13]` → 13 `done`; 12 `done`. Sin dependencias pendientes.

## Test-first (rojo → verde)

El informe `progress/impl_15_navbar-logo-home.md` evidencia el ciclo completo:
- **ROJO** (antes de implementar, contra el marcado con Home de texto y sin logo): 14/27 pass, 13 fallos, con las aserciones concretas por REQ (REQ-08-04/05, REQ-12-01..04, REQ-13-01/02/06, REQ-15-01/02/05).
- **VERDE** (tras implementar): 27/27 en los 5 archivos + `./init.sh` completo.
- Re-ejecutado por el reviewer: suite específica 44/44 (27 de la feature + 9 visual-polish + 8 fix-navbar-jump) y **`./init.sh` íntegro en verde** (formato, tests 100%, build de producción).

## Checkpoints
- C1: [x] — Layout.astro sin `<style>` (también lo aserciona layout-refactor REQ-08-04 y restore REQ-12-02).
- C2: [x] — frontmatter solo imports y paso de datos; sin lógica JS en UI.
- C3: [x] — sin acceso a JSON (no aplica a esta feature; nada nuevo tocado).
- C4: [x] — sin CSS nuevo en la feature; layout.css solo contiene el cambio aprobado de la feature 14 (tokens intactos, verificado por diff y por REQ-08-06/REQ-14-03 en verde).
- C5: [x] — Layout.astro 46 líneas (≤100). Los archivos de test del patrón inspector superan 100 líneas, precedente establecido y aprobado en las features 12/13/14/37 (visual-polish-refactor: 236; fix-navbar-jump: 150); el límite se aplica a código de `src/` y a las hojas CSS, como en las revisiones previas.
- C6: [x] — `src/data/*.json` no tocado.
- C7: [x] — repositorios no tocados.
- C8: [x] — `./init.sh` en verde (ejecutado por el reviewer).
- C9: [ ] — inspección visual en navegador no verificable por el reviewer (pendiente humana, como en ciclos previos).
- C10: [ ] — feature 15 sigue `in_progress`; el líder la marca `done` tras este APPROVED (protocolo del arnés).
- C11: [x] — `progress/current.md` documenta la sesión; `progress/history.md` al día (cierre 13/14 ya registrado; el cierre de la 15 lo mueve el líder al finalizar).
- C12: [x] — sin temporales, sin debug prints, sin TODOs huérfanos.

## Justificación por REQ-15-01..07
- **REQ-15-01**: el navbar enlaza `/` solo mediante el ancla del logo (L36); sin `<a href="/">Home</a>` (grep y diff). ✔
- **REQ-15-02**: aria-current ternaria `pathname === '/' ? 'page' : undefined`; único marcador de `/` (asercionado en REQ-15-02 y REQ-13-02). ✔
- **REQ-15-03**: `<img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/>`. ✔
- **REQ-15-04**: About, Arquitectura, @moibaldenegro y SearchBar conservados (L37-40; REQ-15-04 en verde). ✔
- **REQ-15-05**: asset presente en `public/assets/` y referenciado desde Layout.astro (REQ-15-05 en verde). ✔
- **REQ-15-06**: Layout.astro 46 líneas ≤ 100 (REQ-15-06 en verde). ✔
- **REQ-15-07**: los 4 tests (12/13 y REQ-08-04/05) asercionan el contrato real del logo con justificación `feature 15` + `REQ-43-06` en el encabezado y aserciones del logo (REQ-15-07 en verde). ✔

## Cumplimiento de convenciones
- Capas y estructura (architecture.md §1): solo se tocó `src/layouts/` (chrome compartido) y `tests/`. ✔
- Estilos separados de la UI, sin tokens nuevos, sin valores sueltos. ✔
- Estático por defecto (cero JS nuevo). ✔
- ≤100 líneas en código/hojas. ✔
- Sin dependencias nuevas; sin scripts del arnés nuevos. ✔
- Tests con justificación documentada del ajuste (precedente REQ-43-06), coherente con la práctica del arnés. ✔

## Cambios requeridos
Ninguno.