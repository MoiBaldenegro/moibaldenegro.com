# Informe de implementación — feature 38 layout-main-skip-link

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/38_layout-main-skip-link/requirements.md` + `design.md`. La carpeta
  `specs/38_docs-harness-alignment/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/layouts/Layout.astro` (56 líneas) | `<a class="skip-link" href="#contenido">Saltar al contenido</a>` como primer hijo de `body`; `<main id="contenido" tabindex="-1">` envuelve el `<slot />` (REQ-38-01/02). |
| `new-hero.astro`, `not-found.astro`, `about.astro`, `posts/[id].astro`, `search.astro`, `[...term].astro` | Su `<main class="X">` pasa a `<div class="X">` conservando la clase (el CSS no selecciona `main`) (REQ-38-03). |
| `src/styles/layout.css` (99 líneas) | `.skip-link`: posición absoluta, `transform: translateY(-200%)` fuera de vista (sin display:none ni visibility:hidden), `z-index: 200` (> 100 del navbar), pastilla con `--color-accent`, `--color-text`, `--radius-pill`, padding con `--gap-card`; `.skip-link:focus { transform: none; }` (REQ-38-05/06/07). Reglas compactadas en pocas líneas para respetar el límite de 100. |
| `tests/layout-main-skip-link.test.mjs` (NUEVO) | Inspección + build a outDir temporal: un único `<main` y skip-link como primer hijo de `body` en `/`, `/about`, `/search`, `/404` y cada post. |
| `tests/post-header.test.mjs`, `tests/post-page-styles.test.mjs` | `<main class="post">` → `<div class="post">` con el ajuste documentado en el encabezado (feature 38, precedente REQ-43-06) (REQ-38-08). |

## Fallo intermitente de los builds en paralelo (arreglado aquí)

Con esta feature ya había 5 tests que lanzan `astro build` (about-page, home-latest-articles-limit y
los nuevos de las features 34, 35 y 38). `node --test` corre cada archivo en paralelo y el prerender
del adapter de Cloudflare arranca workerd/miniflare: dos builds simultáneos fallan con
`Directory named "assets:storage" not found` (reproducido 1 de 3 corridas). Se añadió
`tests/helpers/astro-build.mjs` (no es `*.test.mjs`: el glob no lo ejecuta), que serializa los builds
con un lock por `mkdirSync` atómico en `node_modules/.astro-build.lock` (ignorado por git), con
recuperación de locks huérfanos a los 5 min. Los 5 tests usan `astroBuild(args)`. Tras el cambio,
3 corridas seguidas de `pnpm test`: 616/616 cada una y el lock queda liberado.

## Ciclo rojo/verde (REQ-38-09)

Rojo — antes de tocar `src/`:

```
✖ REQ-38-01 · ✖ REQ-38-03 · ✖ REQ-38-05/06/07 · ✖ REQ-38-08 · ✖ REQ-38-02/04 (build) · ✔ REQ-38-10
ℹ pass 1 / ℹ fail 5
```

(Antes de implementar se quitó una excepción que eximía a /search y /404 de la comprobación del
primer hijo de `body`, para hacer el test más estricto.) Tras implementar: layout.css en 108 líneas →
compactado a 99; un comentario nuevo repetía `<main class="post">` literal → reformulado.
Verde — `pnpm test`: 616/616 (×3). `./init.sh`: formato ✔, tests ✔, build ✔.

## Nota

- `main` con `tabindex="-1"` recibe el anillo de foco global (feature 37) al seguir el skip link con
  teclado; no se anula porque REQ-37-03 prohíbe quitar el outline en reglas de foco.
