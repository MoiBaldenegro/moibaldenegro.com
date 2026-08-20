# Informe de implementación — feature 15 `navbar-logo-home`

> El logo ES el enlace Home del navbar: retirar el texto Home y devolver el
> ancla del logo como marcador de la portada (estado 686a7cc). Corrección
> explícita del humano tras la feature 13 (remove-navbar-logo, dirección
> equivocada): «claro, el Logo te dije claramente que reemplazaba al Home, el
> home se va».
> Spec: `specs/15_navbar-logo-home/requirements.md` (REQ-15-01..07) + `design.md`.
> Análisis: `progress/research/navbar-home-logo-revert.md`.

## 1. Test-first (TDD) — tests escritos ANTES del código

1. **Nuevo** `tests/navbar-logo-home.test.mjs` — REQ-15-01..07:
   - REQ-15-01/03: navbar enlaza la portada con el ancla del logo (img
     `/assets/mxvi_logo.webp`, alt descriptivo, width 72) y sin enlace de
     texto Home hacia `/`.
   - REQ-15-02: aria-current de la portada con degradado a `undefined` y
     único marcador de `/`.
   - REQ-15-04: conserva About, Arquitectura, @moibaldenegro y SearchBar.
   - REQ-15-05: `public/assets/mxvi_logo.webp` existe y Layout.astro lo
     referencia.
   - REQ-15-06: Layout.astro ≤ 100 líneas.
   - REQ-15-07: los 4 tests ajustados documentan el ajuste de la feature 15
     y el precedente REQ-43-06 y asercionan el logo.
2. **Ajustados** (contrato invertido, justificación REQ-43-06 en el encabezado
   de cada archivo — los tests siguen a la presentación real confirmada por el
   humano):
   - `tests/architecture-nav-link.test.mjs` — REQ-08-04: la aserción del
     enlace «Home» de texto pasa al ancla del logo como enlace de la portada.
   - `tests/layout-refactor.test.mjs` — REQ-08-05: `href="/" >Home` pasa al
     ancla del logo (`href="/" ><img ... mxvi_logo.webp`).
   - `tests/restore-navbar-home-link.test.mjs` — REQ-12-01..04: se invierten
     las aserciones (el enlace de la portada es el ancla del logo; sin Home de
     texto; el marcador de `/` vive en el logo).
   - `tests/remove-navbar-logo.test.mjs` — REQ-13-01/02/03/05/06: se invierten
     (logo PRESENTE como único marcador de la portada; REQ-13-05 reaserciona el
     ajuste de restore-navbar-home-link; REQ-13-06 invertido: Layout.astro
     vuelve a referenciar el asset). Helpers muertos (`homeAnchor`,
     `filesUnder`) retirados.
3. **NO tocados** (verificado en el research y con grep): 
   `tests/visual-polish-refactor.test.mjs` (REQ-37-03: 3 aria-current con `/`
   — logo + About + Arquitectura — sigue en verde) y
   `tests/fix-navbar-jump.test.mjs` (feature 14, sin referencias al navbar).

## 2. Evidencia del ciclo rojo → verde

### ROJO (antes de implementar; Layout.astro con Home de texto y sin logo)

```
$ node --test tests/navbar-logo-home.test.mjs tests/architecture-nav-link.test.mjs tests/layout-refactor.test.mjs tests/restore-navbar-home-link.test.mjs tests/remove-navbar-logo.test.mjs
# tests 27
# pass 14
# fail 13
```

Fallos (todos del contrato del logo, contra el marcado viejo):
- REQ-08-04: `el enlace de la portada (ancla del logo) se perdió al añadir
  Arquitectura` (architecture-nav-link).
- REQ-08-05: `falta el ancla del logo (enlace de la portada) en la navbar del
  layout` (layout-refactor).
- REQ-15-01/03: `el navbar no incluye el ancla del logo hacia /`;
  REQ-15-02: `no se encuentra el ancla del logo`; REQ-15-05: `Layout.astro no
  referencia el asset mxvi_logo.webp` (navbar-logo-home).
- REQ-12-01/02/03/04: `el navbar no incluye el ancla del logo hacia /`,
  `el navbar no conserva el ancla del logo`, etc. (restore-navbar-home-link).
- REQ-13-01/02/06: `el navbar no incluye el ancla del logo hacia /`,
  `Layout.astro no referencia el asset mxvi_logo.webp` (remove-navbar-logo).

### VERDE (tras implementar el marcado)

```
$ node --test tests/navbar-logo-home.test.mjs tests/architecture-nav-link.test.mjs tests/layout-refactor.test.mjs tests/restore-navbar-home-link.test.mjs tests/remove-navbar-logo.test.mjs
# tests 27
# pass 27
# fail 0

$ ./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## 3. Cambio de código (único archivo de src/)

`src/layouts/Layout.astro` (línea 36): el enlace de texto
`<a ... href="/">Home</a>` se sustituye por el ancla del logo (contrato
686a7cc exacto):

```astro
<a aria-current={Astro.url.pathname === '/' ? 'page' : undefined} href="/"><img src="/assets/mxvi_logo.webp" alt="Logo de moibaldenegro.com" width="72"/></a>
```

- Sin CSS nuevo: el estado activo hereda `.site-navbar a[aria-current="page"]`
  de `layout.css` (layout.css NO se tocó en esta feature; la feature 14 sigue
  intacta).
- Sin JS de runtime (estático por defecto). Layout.astro: 46 líneas (≤100).
- El asset `public/assets/mxvi_logo.webp` se conserva (REQ-15-05).

## 4. Alcance / fuera de alcance

Dentro (solo esta feature):
- `src/layouts/Layout.astro` (marcado del navbar).
- `tests/navbar-logo-home.test.mjs` (nuevo) y ajuste con justificación de:
  architecture-nav-link, layout-refactor, restore-navbar-home-link,
  remove-navbar-logo.
- `feature_list.json` (status `in_progress`) y `progress/current.md`.

Fuera de alcance (NO tocados):
- Feature 14 `fix-navbar-jump` (`src/styles/layout.css` — el diff del árbol
  contra git incluye layout.css por el trabajo previo de la 14, no por esta
  feature).
- Feature 10 `client-init-on-navigation` (in_progress).
- Artefactos históricos 12/13 (specs, impl_, review_) — quedan como bitácora.
- visual-polish-refactor REQ-37-03 (verde sin cambios).

## 5. Cierre

- Suite completa `./init.sh` en verde (formato, tests 100%, build).
- Listo para que el líder lance al reviewer externo.