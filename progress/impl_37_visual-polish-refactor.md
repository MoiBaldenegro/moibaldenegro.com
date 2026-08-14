# Informe de implementación — feature 37 `visual-polish-refactor`

> Fecha: 2026-08-14. Ciclo TDD completo (rojo → verde) contra
> `specs/37_visual-polish-refactor/requirements.md` (REQ-37-01..08) y
> `design.md` (decisiones 1-3 y tabla de tokens).

## Alcance (aceptado)

Hallazgos A1-A6 de la revisión del ciclo 30
(`progress/research/revision-general-ciclo30.md`): markup muerto del hero,
ancla vacía de HeroCard, accesibilidad de navbar (aria-current + focus-visible
+ viewport initial-scale), indentación uniforme de 2 espacios en todos los
`.astro`, encabezado de la sección de artículos y espaciado vertical HTB.

## Ciclo ROJO (tests primero, sin tocar código)

1. **Tests nuevos** `tests/visual-polish-refactor.test.mjs` (REQ-37-01..08):
   - REQ-37-01: `new-hero.astro` sin `.hero-noise` ni `.hero-flower`.
   - REQ-37-02: `hero-card.astro` sin `<a href="">` (sin anclas).
   - REQ-37-03: navbar con `aria-current="page"` comparando
     `Astro.url.pathname` (Decisión 1) + viewport con `initial-scale=1`
     (design item 3).
   - REQ-37-04: `layout.css` con `:focus-visible` de tokens (Decisión 2:
     `outline: 2px solid var(--color-accent)` + `outline-offset: 2px`).
   - REQ-37-05: ningún `.astro` de `src/` con tabs.
   - REQ-37-06: `h2.latest-articles__heading` «Últimos artículos» al inicio
     de la sección y su regla CSS con tokens (`--color-text`, `--gap-card`).
   - REQ-37-07: `.htb-stadistics` con `margin-block: var(--gap-card)`.
   - REQ-37-08: archivos modificados ≤100 líneas y hojas sin hex/rgba.
2. **Test actualizado (autorizado por la spec, Decisión 3)** REQ-24-03 de
   `tests/view-transitions.test.mjs`: el primer `<h2>` del archivo pasa a ser
   el encabezado de sección; la aserción localiza la card por
   `h2.latest-articles__title` (mismo contrato `title-${post.id}`, selector
   más preciso). Comentario de cabecera del test documenta el cambio.

Evidencia del rojo (salida real de `node --test tests/visual-polish-refactor.test.mjs`):

```
not ok 1 - REQ-37-01: new-hero.astro no contiene los contenedores muertos del fondo
not ok 2 - REQ-37-02: hero-card.astro no renderiza un enlace con href vacío
not ok 3 - REQ-37-03: la navbar marca con aria-current el enlace de la página actual
not ok 4 - REQ-37-03 (design): el viewport declara initial-scale=1
not ok 5 - REQ-37-04: layout.css declara estados de foco visible con tokens
not ok 6 - REQ-37-05: ningún .astro del sitio contiene tabs de indentación
not ok 7 - REQ-37-06: la sección de artículos muestra el encabezado «Últimos artículos»
not ok 8 - REQ-37-06: latest-articles.css estila el encabezado con tokens
not ok 9 - REQ-37-07: la sección de estadísticas conserva espaciado vertical con token
# tests 20  # pass 2  # fail 9
```

Los 9 fallos corresponden a las causas reales verificadas en disco (markup
muerto presente, ancla vacía presente, navbar sin aria-current, viewport sin
initial-scale, layout.css sin `:focus-visible`, tabs en
`htb-stadistics.astro`/`Layout.astro`/`index.astro`/`about.astro`, sección de
artículos sin encabezado, `.htb-stadistics` sin margen vertical).

## Implementación

| Archivo | Cambio |
|---|---|
| `src/components/new-hero/new-hero.astro` | Eliminados `.hero-noise` y `.hero-flower` (REQ-37-01); indentación unificada a 2 espacios. 55 líneas. |
| `src/components/hero-card.astro` | Eliminado `<a href="">`; el icono queda como `<div>` (REQ-37-02, Decisión 2); indentación a 2 espacios. 22 líneas. |
| `src/layouts/Layout.astro` | `aria-current="page"` en Home y About comparando `Astro.url.pathname` (REQ-37-03, Decisión 1); viewport `initial-scale=1`; tabs→2 espacios. 34 líneas. |
| `src/styles/layout.css` | Estado activo `a[aria-current="page"]` (acento + subrayado con tokens) y `:focus-visible` global (`2px solid var(--color-accent)`, `outline-offset: 2px` — REQ-37-04). 69 líneas. |
| `src/components/htb-stadistics.astro` | Tabs→2 espacios, contrato de la feature 34 intacto (`{profile && ...}`, `?? 'N/D'`, frontmatter solo imports/envs/getProfileOrNull). 45 líneas. |
| `src/styles/htb-stadistics.css` | `margin-block: var(--gap-card)` en `.htb-stadistics` (REQ-37-07; `margin-inline: auto` intacto, sin romper el centrado). 56 líneas. |
| `src/components/latest-articles.astro` | Encabezado `<h2 class="latest-articles__heading">Últimos artículos</h2>` al inicio de la sección (REQ-37-06, Decisión 3). 34 líneas. |
| `src/styles/latest-articles.css` | Regla `.latest-articles__heading` con tokens (`--color-text`, `--gap-card`); comentarios comprimidos y regla `:focus-visible` en una línea para mantener ≤100. 97 líneas. |
| `src/pages/index.astro`, `src/pages/about.astro` | Tabs→2 espacios (REQ-37-05, «ningún .astro del sitio»). Sin otros cambios. |

Hallazgo de implementación: en prerender estático `Astro.url.pathname`
incluye la barra final (`/about/`), por lo que el enlace About compara ambas
formas (`=== '/about' || === '/about/'`) — verificado empíricamente con una
página de diagnóstico temporal (eliminada tras el build) y en el HTML final.

## Ciclo VERDE

Tests de la feature y de contratos de los componentes afectados
(visual-polish-refactor, view-transitions, layout-refactor, hero-ui-refactor,
hero-section-styles, hero-cards-styles, latest-articles-restore,
articles-ui-refactor, htb-stadistics-section, htb-stadistics-prerender-fix,
htb-api-graceful-degradation, game-of-life-removal):

```
# tests 95  # pass 95  # fail 0
```

Suite completa:

```
# tests 218  # pass 218  # fail 0
```

(207 previos + 11 nuevos de la feature 37 = 218.)

Evidencia en HTML generado (`dist/client/`):
- `/`: `<a aria-current="page" href="/">` (solo Home).
- `/about`: `<a aria-current="page" href="/about">` (solo About).
- `/posts/00-agilismo`: ningún enlace marcado.
- `h2.latest-articles__heading` con «Últimos artículos» antes de las cards.
- Viewport con `initial-scale=1`.

Arnés completo:

```
./init.sh → ✔ formato  ✔ tests al 100%  ✔ build  → «El entorno está perfecto.»
node scripts/audit-design-tokens.mjs → AUDIT ✔ ningún color fuera de tokens.css
```

## Trazabilidad acceptance ↔ REQ

| Acceptance feature 37 | REQ / evidencia |
|---|---|
| new-hero sin `.hero-noise`/`.hero-flower` | REQ-37-01 (test 1) |
| hero-card sin `<a href="">` | REQ-37-02 (test 2) |
| navbar con aria-current + layout.css con `:focus-visible` de tokens | REQ-37-03/04 (tests 3-5) |
| ningún `.astro` con tabs | REQ-37-05 (test 6) |
| encabezado «Últimos artículos» con tokens + REQ-24-03 actualizado | REQ-37-06 (tests 7-8) |
| espaciado vertical HTB con token | REQ-37-07 (test 9) |
| ≤100 líneas y sin hex/rgba en modificados | REQ-37-08 (tests 10-11) + audit |

## Notas

- Efecto colateral autorizado aplicado: REQ-24-03 de
  `tests/view-transitions.test.mjs` con selector `h2.latest-articles__title`.
- No se tocaron otros tests ni archivos de `src/` fuera de la lista del
  alcance (los tabs de `index.astro`/`about.astro` son exigidos por
  REQ-37-05).
- Pendiente de cierre del líder: los estados 33/34 en `feature_list.json`
  siguen `pending` pese a tener review APPROVED en disco (asincronía de
  cierre de sesiones previas); la feature 37 queda `in_progress` a la espera
  del reviewer.
