# Informe de implementación — feature 39 post-page-redesign

> Fecha: 2026-08-14. Rol: implementer. Feature 39: «Rediseñar el detalle de
> artículo: contenido a ancho completo y header hero vistoso».
> Spec: `specs/39_post-page-redesign/requirements.md` (REQ-39-01..09) y
> `design.md`. Análisis: `progress/research/rediseno-detalle-post-ciclo31.md`.

## Alcance (archivos tocados)

| Archivo | Cambio |
|---------|--------|
| `src/pages/posts/[id].astro` | Nuevo marcado: `header.post__hero` (img + `.post__hero-copy` con h1 y p) + import de `post-header.css`. 51 líneas. |
| `src/styles/post.css` | `.post__content` pierde `max-width: 760px` y `margin: auto` (REQ-39-01); `.post__meta` sin margen. 96 líneas. |
| `src/styles/post-header.css` | **Nuevo**: panel hero con degradado de `--color-hero-*`, glow con `--color-glow`, radio/borde/sombra, píldora `.post__meta` y media query 768px. 48 líneas. |
| `tests/post-header.test.mjs` | **Nuevo** (test-first, autorizado por el análisis §4): 12 tests contra REQ-39-01..09. |
| `feature_list.json` / `progress/current.md` | Feature 39 en `in_progress`; bitácora de sesión. |

Sin cambios (contratos preservados): `tokens.css` (87 líneas, REQ-39-09),
`Layout.astro`, cards, y los tests existentes (`post-page-styles` REQ-26-02..07,
`view-transitions` REQ-24-03/05) — verificados en verde sin modificación.

## Ciclo rojo/verde (evidencia)

### ROJO — test-first antes de implementar

`node --test tests/post-header.test.mjs` (sin tocar `src/` todavía):

```
not ok 1 - REQ-39-01: .post__content pierde max-width y el contenedor conserva el ancho del sitio
not ok 2 - REQ-39-02: el marcado declara header.post__hero con img y .post__hero-copy
not ok 3 - REQ-39-02/03: el panel estiliza degradado, glow, radio, borde y sombra
not ok 4 - REQ-39-04: .post__meta se muestra como píldora con tokens
ok 5 - REQ-39-05: el primer h1 y el primer img conservan los pares de transición
not ok 6 - REQ-39-06: la página importa post-header.css y ambas hojas no superan 100 líneas
not ok 7 - REQ-39-07: media query 768px para header y tipografía del detalle
ok 8 - REQ-39-08: se conservan main.post y article.post__content
ok 9 - REQ-39-09: tokens.css conserva 87 líneas sin tokens nuevos
not ok 10 - REQ-39-09: las hojas del detalle no contienen hex/rgba sueltos
not ok 11 - REQ-39-09: colores, radios, bordes y sombras de post-header.css usan var()
ok 12 - Convención: [id].astro sigue ≤100 líneas y sin estilos embebidos
# tests 12
# pass 4
# fail 8
```

8 en rojo (todo lo que dependía del marcado/hoja nueva), 4 en verde (lo que el
estado actual ya cumplía: pares de transición, main/article, tokens.css y
límite de líneas).

### VERDE — tras implementar

```
node --test tests/post-header.test.mjs
# tests 12  # pass 12  # fail 0

node --test "tests/**/*.test.mjs"
# tests 233  # pass 233  # fail 0        (221 del ciclo 30 + 12 nuevos)

node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles

./init.sh
✔ node instalado / ✔ pnpm instalado / ✔ dependencias instaladas
✔ AGENTS.md / ✔ feature_list.json / ✔ progress/current.md
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación en el build (dist/)

`dist/client/posts/00-agilismo/index.html` (tras `pnpm build` vía init.sh):

- CSS del bundle: `.post{width:min(var(--container-max), 95%)...}` y
  `.post__content{font-family:var(--font-sans)}` — **sin max-width**: el
  contenido ocupa el ancho completo del contenedor del sitio (REQ-39-01).
- `.post__hero{...background:linear-gradient(160deg, var(--color-hero-top)
  0%, var(--color-hero-mid) 45%, var(--color-hero-bottom) 100%)...border:
  1px solid var(--color-border-strong)...box-shadow:var(--shadow-card)...}` y
  `.post__hero:before{...background:radial-gradient(circle,
  var(--color-glow), transparent 70%)...}` (REQ-39-02/03).
- `.post__meta{border-radius:var(--radius-pill);background:color-mix(in
  srgb, var(--color-surface) 70%, transparent);border:1px solid
  var(--color-border-strong);padding:6px 14px;display:inline-flex}` +
  ajuste `padding:4px 10px` en `@media (width<=768px)` (REQ-39-04/07).
- HTML: `<main class="post"><header class="post__hero"><img ... class=
  "post__image"><div class="post__hero-copy"><h1 class="post__title">...
  <p class="post__meta">...</div></header><article class="post__content">`
  (REQ-39-02/08). Los pares `transition:name` compilados por Astro
  (scopes de transición) se conservan en el primer h1 y el primer img.

## Decisiones documentadas

- **Ancho**: Opción A del análisis — eliminar `max-width`/`margin: auto` de
  `.post__content`; el artículo hereda el ancho del contenedor
  (`min(var(--container-max), 95%)`). Trade-off de líneas largas mitigado con
  `line-height: 1.7` y `pre { overflow-x: auto }` ya existentes (design.md
  Decisión 1).
- **Límite de 100 líneas en post.css**: el REQ-39-06 solo limita
  `post-header.css`; sin embargo, decidí mantener post.css ≤100 (96 líneas):
  la píldora `.post__meta` (inline-flex, radius-pill, color-mix, borde) vive
  en `post-header.css` (es parte del panel hero, design.md Decisión 5 «dentro
  del panel») y post.css conserva la regla `.post__meta` del contrato
  REQ-26-03 (color/font-size/margin: 0), alineado con la estimación del
  análisis §3 («post.css ≈ 97 líneas»).
- **Transiciones (REQ-39-05)**: el primer `<img>` y el primer `<h1>` del
  archivo conservan `img-${entry.id}` / `title-${entry.id}` con el mismo
  orden (img antes del bloque de copia). El wrap en `.post__hero` no afecta
  al morph (análisis §5). Cero cambios en `view-transitions.test.mjs` y
  `post-page-styles.test.mjs` (autorización del análisis §4: ninguna).
- **Tokens**: solo existentes (`--color-hero-*`, `--color-glow`,
  `--color-surface`, `--color-border-strong`, `--radius-card`, `--radius-pill`,
  `--shadow-card`, `--gap-card`, `--container-max`, `--font-sans`); gradientes
  con `color-mix` (precedente `hero-section.css`); `tokens.css` intacto en 87
  líneas (REQ-39-09).

## Estado del backlog

`feature_list.json`: feature 39 en `status: "in_progress"` (la marca `done`
solo la aplica el flujo tras el veredicto APPROVED del reviewer).
