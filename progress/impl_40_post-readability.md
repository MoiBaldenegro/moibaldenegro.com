# Informe de implementación — feature 40 post-readability

> Rol: implementer. Fecha: 2026-08-14. Spec:
> `specs/40_post-readability/requirements.md` (REQ-40-01..12) + `design.md`.
> Research previos: `progress/research/legibilidad-detalle-post-ciclo32.md`
> (análisis del spec_author), `text-wrap-pretty-legibilidad.md` y
> `legibilidad-contenido-articulos.md`. Suite base: 233 tests en verde antes
> de esta feature.

## Cambios realizados (solo lo que el diseño exige)

| Archivo | Cambio |
|---------|--------|
| `src/pages/posts/[id].astro` | +1 línea: import de `../../styles/post-readability.css` después de post.css y post-header.css (REQ-40-01, design Decisión 7: el orden de import fija la cascada); el `<section>` del Content pasa a `<section class="post__body">` (REQ-40-01). 51 → 52 líneas. |
| `src/styles/post-readability.css` | **Nuevo** (37 líneas, ≤100 ✓). Columna de lectura: `.post__body` con `max-inline-size: 70ch; margin-inline: auto; font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (REQ-40-02/03); `.post__content p` con `text-wrap: pretty; letter-spacing: 0.01em; margin-block-end: 1lh` (REQ-40-04/05/06); grupo `h1,h2,h3` con `text-wrap: balance` (REQ-40-07); `.post__content h2 { font-size: 1.75rem; margin-block: 1.5lh 0.5lh; }` y `.post__content h3 { font-size: 1.4rem; margin-block: 1.25lh 0.375lh; }` (REQ-40-08, design Decisión 4); media query 768px con h2 1.4rem / h3 1.2rem (REQ-40-09). Solo unidades relativas (rem/ch/lh/em), sin tokens nuevos, sin hex/rgba. |
| `tests/post-readability.test.mjs` | **Nuevo** (test-first, 13 tests): contrato REQ-40-01..12 + convenciones. |
| `feature_list.json` | feature 40 `pending` → `in_progress` (el implementer NO marca done). |
| `progress/current.md` | Sesión documentada. |

Sin cambios: `post.css`, `post-header.css`, `tokens.css` (87 líneas intactas,
REQ-40-11), tests existentes (ninguno modificado), `scripts/` y `src/domain/`.

Nota de decisión (documentada): el design.md proponía el grupo de balance en
tres líneas (`.post__content h1,` / `.post__content h2,` / `.post__content
h3`); la implementación lo declara en **una sola línea** con la misma
semántica CSS. Motivo: el test nuevo distingue las reglas de tamaño exactas
de h2/h3 de la regla de balance compartida; con el grupo en una línea, la
línea de selector contiene comas y no colisiona con la regla exacta de h3.
Es un detalle de formato del selector, sin efecto en el resultado visual ni
en ningún contrato.

## Ciclo rojo/verde (evidencia TDD)

### ROJO — antes de implementar (`node --test tests/post-readability.test.mjs`)

```
not ok 1 - REQ-40-01: el Content se envuelve en section.post__body
  error: 'la página no declara <section class="post__body"> (REQ-40-01)'
not ok 2 - REQ-40-01: [id].astro importa post-readability.css después de post.css y post-header.css
  error: 'src/pages/posts/[id].astro no importa ../../styles/post-readability.css (REQ-40-01)'
not ok 3 - REQ-40-02: .post__body acota la medida a 70ch centrada
  error: 'src/styles/post-readability.css no existe (REQ-40-10)'
...
# tests 13
# pass 0
# fail 13
```

El test se escribió PRIMERO contra la spec (REQ-40-01..12 + design.md) y se
observó en rojo: 13/13 fallos por ausencia de implementación (sin
`post__body`, sin import, sin hoja nueva).

### VERDE — tras implementar (feature + suite completa)

```
$ node --test tests/post-readability.test.mjs
1..13
# tests 13
# suites 0
# pass 13
# fail 0
# duration_ms 71.3269

$ node --test "tests/**/*.test.mjs"
1..246
# tests 246
# suites 0
# pass 246
# fail 0
# duration_ms 3857.7789

$ node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles

$ ./init.sh
✔ node instalado ✔ pnpm instalado ✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe ✔ feature_list.json existe ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Suite completa: **246/246** (233 previas + 13 nuevas). Los tests existentes
(post-header REQ-39, post-page-styles REQ-26, view-transitions REQ-24,
design-tokens REQ-02) pasan **sin modificación**: REQ-39-01 literal (la regla
`.post__content` de post.css conserva el ancho completo, REQ-40-12), pares
`title-${entry.id}`/`img-${entry.id}` intactos (REQ-24-03/05), tokens.css en
87 líneas (REQ-40-11).

## Verificación en el build (`dist/` tras `pnpm build`)

El detalle `dist/client/posts/00-agilismo/index.html` (CSS inlined por el
build) renderiza:

- `section.post__body` envolviendo el markdown del `<Content />` (h1 + p…)
  dentro de `article.post__content` y `header.post__hero` (marcado intacto).
- `.post__body{max-inline-size:70ch;margin-inline:auto;font-size:clamp(1.0625rem,1rem + .3vw,1.1875rem)}`
  — columna de lectura acotada y centrada.
- `.post{width:min(var(--container-max), 95%);...}` — contenedor full-width
  conservado (REQ-39-01/40-12); `.post__content` sin `max-width`.
- `.post__content p{text-wrap:pretty;letter-spacing:.01em;margin-block-end:1lh}`
  después de la regla de post.css (cascada correcta: la última hoja gana).
- `.post__content h2{...font-size:1.75rem}` y `h3{...font-size:1.4rem}` con
  márgenes lh; `text-wrap:balance` en el grupo h1-h3.
- `@media (width<=768px){.post__content h2{font-size:1.4rem}.post__content h3{font-size:1.2rem}}`
  (el minificador normaliza `max-width: 768px` a `width<=768px`; misma
  semántica, REQ-40-09).

## Riesgos controlados

- **Cascada**: import de post-readability.css DESPUÉS de post.css y
  post-header.css (fijado por test REQ-40-01 y verificado en el CSS del
  build: los overrides de p/h2/h3 aparecen después de las reglas de post.css).
- **Firefox y text-wrap pretty**: degradación silenciosa por diseño (mejora
  progresiva, sin `@supports`); `balance` tiene soporte ~92%.
- **100 líneas**: [id].astro 52, post-readability.css 37, post.css y
  post-header.css intactos (100 y 48).
- **Sin tokens nuevos**: unidades relativas literales (precedente REQ-26-05);
  audit-design-tokens en verde; tokens.css 87 líneas.

## Estado del arnés

- `feature_list.json`: feature 40 en `in_progress` (NO marcada done: el cierre
  requiere el `progress/review_40_post-readability.md` con APPROVED).
- `progress/current.md`: actualizado con la sesión y el plan ejecutado.
