# Review — feature 37 `visual-polish-refactor`

**Fecha:** 2026-08-14. **Revisor:** nivel 1 (estricto, solo aprobar/rechazar).

## Resumen

Revisión independiente de la feature 37 (pulido estético: hallazgos A1-A6 del
ciclo 30) contra `specs/37_visual-polish-refactor/requirements.md` y
`design.md` (decisiones 1-3). Se verificó en disco cada REQ-37-01..08, la
suite de tests, el arnés completo, el diff de tests autorizado, el estado del
backlog y las convenciones del proyecto. Resultado: **APPROVED**, sin cambios
requeridos.

## Evidencias ejecutadas

| Verificación | Resultado |
|---|---|
| `node --test tests/visual-polish-refactor.test.mjs tests/view-transitions.test.mjs tests/hero-ui-refactor.test.mjs tests/hero-section-styles.test.mjs tests/hero-card-styles.test.mjs tests/layout-refactor.test.mjs tests/articles-ui-refactor.test.mjs` | 47/47 pass, 0 fail |
| `node --test "tests/**/*.test.mjs"` | 218/218 pass, 0 fail |
| `node scripts/audit-design-tokens.mjs` | `AUDIT ✔ ningún color fuera de tokens.css en src/styles` |
| `./init.sh` | `✔ El entorno está perfecto.` (formato, tests 100%, build) |
| `git diff tests/` | Solo cambios autorizados: `view-transitions.test.mjs` (REQ-24-03) + nuevo `visual-polish-refactor.test.mjs`; el resto (`latest-articles-restore`, `posts-repository`, `ssr-cloudflare-align`) corresponde a features 35/36 ya APPROVED |
| HTML generado (`dist/client/`) | `/` → `<a aria-current="page" href="/">Home</a>`; `/about/` → `<a aria-current="page" href="/about">About</a>`; `<h2 class="latest-articles__heading">Últimos artículos</h2>`; viewport `width=device-width, initial-scale=1` |

## Comprobación requisito por requisito

- **REQ-37-01 (markup muerto del hero):** ✔ `new-hero.astro` (55 líneas) no
  contiene `.hero-noise` ni `.hero-flower` (grep en `src/`: 0 coincidencias;
  diff confirma la eliminación; test 1 en verde).
- **REQ-37-02 (ancla vacía):** ✔ `hero-card.astro` (22 líneas) no contiene
  ningún `<a>`: el icono quedó como `<div class="card-icon">` (Decisión 2 del
  design). Test 2 en verde.
- **REQ-37-03 (aria-current + viewport):** ✔ `Layout.astro` (34 líneas)
  compara `Astro.url.pathname` con `/` y `/about` en la navbar y aplica
  `aria-current={... ? 'page' : undefined}`; el viewport declara
  `initial-scale=1`. Hallazgo documentado y verificado: en prerender la ruta
  lleva barra final (`/about/`), por lo que About compara ambas formas
  (`=== '/about' || === '/about/'`) — confirmado en el HTML generado de
  `/about/`, donde About recibe `aria-current="page"` y Home no. Tests 3-4 en
  verde.
- **REQ-37-04 (focus-visible con tokens):** ✔ `layout.css` (69 líneas) declara
  `a:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`
  (Decisión 2) y `latest-articles.css` añade el foco del enlace de card con
  tokens. Test 5 en verde.
- **REQ-37-05 (indentación 2 espacios):** ✔ grep de tabs en todos los `.astro`
  de `src/`: 0 coincidencias (incluye `htb-stadistics.astro`,
  `Layout.astro`, `index.astro`, `about.astro`, que tenían tabs). Test 6 en
  verde.
- **REQ-37-06 (encabezado «Últimos artículos»):** ✔
  `latest-articles.astro` (34 líneas) renderiza
  `<h2 class="latest-articles__heading">Últimos artículos</h2>` al inicio de
  la sección, antes de las cards; `latest-articles.css` (97 líneas) lo estila
  con `--color-text` y `--gap-card` (Decisión 3). REQ-24-03 actualizado al
  selector `h2.latest-articles__title` (mismo contrato `title-${post.id}`, el
  cambio está documentado en el comentario del test). Tests 7-8 en verde.
- **REQ-37-07 (espaciado vertical HTB):** ✔ `htb-stadistics.css` (56 líneas)
  añade `margin-block: var(--gap-card)` en `.htb-stadistics` conservando
  `margin-inline: auto` (centrado intacto). Test 9 en verde.
- **REQ-37-08 (≤100 líneas, sin colores sueltos):** ✔ Todos los modificados
  ≤100 líneas: new-hero 55, hero-card 22, Layout 34, layout.css 69,
  htb-stadistics.astro 45, htb-stadistics.css 56, latest-articles.astro 34,
  latest-articles.css 97, index 16, about 20. Hojas sin hex/rgba fuera de
  tokens (audit + tests 10-11 en verde).

## Dependencias y backlog

`feature_list.json`: feature 37 `in_progress`, `depends_on: [34, 36]` — 34 y
36 están `done` (33/34/35/36 done, 38 pending). Ninguna dependencia pendiente
saltada.

## Ciclo rojo/verde (pregunta de revisión)

Sí: `progress/impl_37_visual-polish-refactor.md` documenta el rojo real
(20 tests, 9 fail con la salida `node --test` transcrita, causas verificadas
en disco: markup muerto, ancla vacía, navbar sin aria-current, viewport sin
initial-scale, layout.css sin `:focus-visible`, tabs en 4 `.astro`, sección
sin encabezado, HTB sin margen) y el verde final (95/95 en tests de la
feature + contratos, 218/218 en la suite completa, `./init.sh` perfecto,
audit de tokens ✔). El estado en disco confirma el verde.

## Convenciones

Sin `<style>` ni `style=` inline en `.astro`; frontmatter solo imports/paso de
datos (sin lógica de negocio); estilos solo con tokens; sin dependencias
nuevas; capas respetadas (componentes → `src/styles/`, datos vía
repositorios). Sin archivos temporales ni debug (el diagnóstico temporal
mencionado en el informe fue eliminado; `git status` no muestra restos).

## Checkpoints

- C1: [x]
- C2: [x]
- C3: [x]
- C4: [x]
- C5: [x]
- C6: [x] (verificación pendiente de inspección visual humana en navegador,
  según el propio CHECKPOINTS.md — no bloquea la feature)

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
