# Informe de implementación — feature 8 layout-refactor

- **Feature:** 8 — layout-refactor (layout único personalizado: idioma es, título real, estilos separados y navbar compartida)
- **Spec:** `specs/08_layout-refactor/requirements.md` (REQ-08-01..06) + `specs/08_layout-refactor/design.md` (Decisiones 1-3)
- **Estado previo:** `pending` → marcada `in_progress` al inicio de la sesión.
- **Fecha:** 2026-08-10

## Verificación de sesión concurrente

Antes de escribir nada se comprobó en disco que no existía trabajo previo de la
sesión concurrente: `src/styles/layout.css`, `tests/layout-refactor.test.mjs`,
`progress/impl_layout-refactor.md` ni `progress/review_layout-refactor.md` → **implementación desde cero**.

## Contexto leído

- `docs/architecture.md` (un solo layout, estilos separados de la UI, tokens no valores sueltos, ≤100 líneas)
  y `docs/conventions.md` (kebab-case en estilos, solo tokens, media queries al final).
- `specs/08_layout-refactor/requirements.md` (REQ-08-01..06) y `design.md`:
  - Decisión 1: la navbar se mueve de `new-hero.astro` a `Layout.astro`; sus estilos pasan de la hoja del hero a `layout.css`.
  - Decisión 2: prop `title` con default `moibaldenegro.com`; las páginas pueden personalizar el `<title>`.
  - Decisión 3: `lang="es"` y el reset de `html/body` se trasladan a `layout.css` con tokens; desaparece el `<style>` embebido.
- Estado real previo: `Layout.astro` (plantilla starter: `lang="en"`, "Astro Basics", `<style>` embebido, sin chrome),
  `new-hero.astro` (navbar duplicada Home/About/@moibaldenegro en `<header class="hero-navbar">`),
  `hero-section.css` (reset + estilos `.hero-navbar*` + scrollbar marcados "transitorio: pasa al layout.css de la feature 8"),
  `tokens.css` (tokens existentes: `--color-background`, `--color-surface`, `--color-text`, `--color-border-strong`,
  `--color-accent`, `--color-accent-hover`, `--color-navbar`, `--color-scrollbar-*`, `--container-max`, `--radius-pill`,
  `--transition-default`, `--font-sans`).

## Ciclo rojo/verde

### ROJO (test escrito contra la spec, antes de implementar)

`node --test tests/layout-refactor.test.mjs` con el layout starter intacto y sin `layout.css`:

```
# Subtest: REQ-08-01: Layout.astro declara lang="es"
not ok 1 - REQ-08-01: Layout.astro declara lang="es"
  error: 'el layout no declara lang="es" (REQ-08-01)'
  actual: '<html lang="en"> ... <title>Astro Basics</title> ... <style> ... </style>'
# Subtest: REQ-08-02: el layout muestra el título por defecto moibaldenegro.com
not ok 2 - REQ-08-02: ...
  error: 'el <title> no usa el valor por defecto moibaldenegro.com (REQ-08-02)'
# Subtest: REQ-08-03: ...
not ok 3 - REQ-08-03: ...
  error: 'el layout no declara la prop title (REQ-08-03)'
# Subtest: REQ-08-04: ...
not ok 4 - REQ-08-04: ...
  error: 'src/styles/layout.css no existe (REQ-08-04)'
# Subtest: REQ-08-05: ...
not ok 5 - REQ-08-05: ...
  error: 'el layout no contiene la navbar compartida (REQ-08-05)'
# Subtest: REQ-08-06: ...
not ok 6 - REQ-08-06: ...
  error: 'src/styles/layout.css no existe (REQ-08-04/06)'
1..6
# tests 6
# pass 0
# fail 6
```

ROJO reproducible (retirando temporalmente `layout.css` tras la implementación → 3 fail; restaurado → verde):

```
$ mv src/styles/layout.css <temp>/ && node --test tests/layout-refactor.test.mjs
not ok 4 - REQ-08-04: sin <style> embebido y con layout.css importada
not ok 5 - REQ-08-05: la navbar compartida vive en el layout único
not ok 6 - REQ-08-06: layout.css no supera 100 líneas y usa solo tokens
# tests 6
# pass 3
# fail 3
$ mv <temp>/layout.css src/styles/ && node --test tests/layout-refactor.test.mjs
# tests 6
# pass 6
# fail 0
```

### Implementación

1. **`src/styles/layout.css` (nuevo, 53 líneas):** reset global (`*`, `html/body` con `--color-background`,
   `--color-text`, `--font-sans`), navbar `.site-navbar` (sticky, `--color-navbar`, `--color-border-strong`,
   `--container-max`, enlaces con `--color-text`/`--color-accent`/`--color-accent-hover`, subrayado `::after`
   con `--radius-pill` y `--transition-default`) y scrollbar global (`--color-scrollbar-*`) — todo migrado de
   `hero-section.css` (marcado como "transitorio" en la feature 3) y consumiendo solo tokens. Media 768 al final.
2. **`src/layouts/Layout.astro` (refactorizado):** `lang="es"` (REQ-08-01), `interface Props { title?: string }`
   + `const { title } = Astro.props` y `<title>{title ?? 'moibaldenegro.com'}</title>` (REQ-08-02/03), importa
   `tokens.css` + `layout.css` y elimina el bloque `<style>` embebido (REQ-08-04), renderiza el `<header class="site-navbar">`
   con Home / About / @moibaldenegro como chrome compartido (REQ-08-05).
3. **`src/components/new-hero/new-hero.astro`:** retirado el `<header class="hero-navbar">` (la navbar ya no
   se duplica en el hero; ahora vive solo en el layout).
4. **`src/styles/hero-section.css`:** eliminados los bloques huérfanos tras la migración: reset (→ layout.css),
   `.hero-navbar*` + media 768 de navbar (→ layout.css), scrollbar (→ layout.css). Queda solo la sección hero
   (fondo y cuadrícula, 61 líneas).
5. **`tests/hero-section-styles.test.mjs` (ajuste por consecuencia directa de REQ-08-05/06):** REQ-03-02 exigía
   el selector `.hero-navbar` en la hoja del hero; al mover la navbar al layout sus estilos ya no pertenecen al
   hero. Se retira `.hero-navbar` de la lista de selectores y se documenta la nota en el comentario del test.

### VERDE

```
$ node --test tests/layout-refactor.test.mjs
# tests 6
# pass 6
# fail 0

$ pnpm test   (suite completa)
# tests 53
# pass 53
# fail 0

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm build
✓ 1 page(s) built in 751ms — Complete!

$ ./init.sh
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación visual / build

**HTML generado** (`dist/index.html`, tras `pnpm build`):

```
lang="es": true
title: moibaldenegro.com
navbar header count (class="site-navbar"): 1
links Home: true | About: true | @moibaldenegro: true
hero-navbar (antigua duplicada): false
<style> embebido en <body>: false
hero presente (.new-hero + .hero-grid): true
```

**Bundle CSS** (`dist/_astro/index.DVL7e1Mx.css`): `.site-navbar` presente, `.hero-navbar` ausente
(sin estilos huérfanos), `body{background: var(--color-background)` presente.

**Dev server** (`pnpm dev` en background + curl):

```
$ curl -s -o <temp>/index-dev.html -w "HTTP %{http_code}\n" http://localhost:4321/
HTTP 200
lang="es": true
title: moibaldenegro.com
site-navbar count: 1          (navbar única, sin duplicados)
links: true
hero-navbar (antigua): false
hero presente: true
```

Hojas servidas en dev: `/src/styles/layout.css` con el contenido completo (reset + `.site-navbar` + scrollbar,
solo `var(--...)`); `/src/styles/hero-section.css` con **0 coincidencias** de `hero-navbar` (limpieza de huérfanos).

## Acceptance → REQ

| Acceptance (feature_list.json) | REQ | Verificación |
|---|---|---|
| Layout.astro declara `lang="es"` y el título por defecto moibaldenegro.com | REQ-08-01, REQ-08-02 | test 1 y 2 verdes; HTML generado `lang="es"` + `<title>moibaldenegro.com</title>` |
| Una página puede pasar un título propio al layout | REQ-08-03 | `interface Props { title?: string }` + `<title>{title ?? 'moibaldenegro.com'}</title>` (test 3 verde) |
| Layout.astro sin bloques `<style>` y `src/styles/layout.css` importada | REQ-08-04 | test 4 verde; grep `<style` en Layout.astro sin coincidencias; import de `layout.css` presente |
| La navbar con Home About y @moibaldenegro se renderiza desde el layout | REQ-08-05 | test 5 verde; dev server y build con `site-navbar` 1 vez; `new-hero.astro` sin navbar |
| `tests/layout-refactor.test.mjs` verifica layout.css ≤100 líneas y sin valores sueltos | REQ-08-06 | test 6 verde (53 líneas; sin hex/rgba; props de color/radio/transición con `var()`) |

## Alcance (git status)

Archivos tocados por la feature 8 (el árbol acumula también las features 1-7 sin commits intermedios):

- `src/layouts/Layout.astro` (M) — layout único refactorizado.
- `src/styles/layout.css` (nuevo) — reset + navbar + scrollbar con tokens.
- `src/components/new-hero/new-hero.astro` (M) — navbar retirada del hero.
- `src/styles/hero-section.css` (M) — bloques huérfanos retirados (reset/navbar/scrollbar → layout.css).
- `tests/layout-refactor.test.mjs` (nuevo) — test de la feature.
- `tests/hero-section-styles.test.mjs` (M) — REQ-03-02 sin `.hero-navbar` (navbar ya no pertenece al hero).
- `feature_list.json` (M) — status de la feature 8: pending → in_progress.
- `progress/current.md` (M) — bitácora de la sesión.

Sin dependencias nuevas; sin layouts nuevos; todas las hojas ≤100 líneas; solo tokens.

## Pendiente

Revisión externa del reviewer (el líder la lanza).
