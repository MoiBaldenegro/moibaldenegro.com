# Review — feature 39 `post-page-redesign`

Fecha: 2026-08-14. Reviewer: nivel 1, lanzado por el líder tras el informe del
implementer (`progress/impl_39_post-page-redesign.md`).

**Veredicto:** APPROVED

## Resumen

La feature 39 rediseña la página de detalle de artículo
(`src/pages/posts/[id].astro`): (1) el contenido pasa a ocupar el ancho
completo del contenedor del sitio (se elimina `max-width: 760px` de
`.post__content`); (2) el header pasa a un panel hero con degradado y
resplandor de los tokens del hero que integra imagen, título y meta en
píldora. Los estilos del panel viven en la hoja nueva
`src/styles/post-header.css` (48 líneas), `tokens.css` permanece intacto en
87 líneas y los pares `transition:name` del primer `h1` y primer `img` se
conservan, por lo que los tests existentes no se modificaron. Verificación
independiente en disco: todo en verde (233/233, audit limpio, `./init.sh`
perfecto).

## Evidencias (verificación independiente, en disco)

1. **Diff aislado de la feature 39** (`git diff HEAD` sobre `[id].astro` y
   `post.css`; el resto del árbol corresponde a features 33-38 ya aprobadas y
   al bookkeeping del arnés):
   - `[id].astro`: se añade el import `../../styles/post-header.css` y el
     marcado `header.post__hero` (img.post__image → div.post__hero-copy con
     h1.post__title y p.post__meta). El resto del diff (PostsDataError, Map
     por id) es de la feature 36, ya aprobada. 51 líneas.
   - `post.css`: `.post__content` pierde `max-width: 760px` y `margin: auto`
     (REQ-39-01); `.post__meta` pasa de `margin: 0 0 24px` a `margin: 0` (el
     espaciado lo aporta el panel). El resto de reglas del contrato REQ-26-03
     (`.post`, `.post__title`, `.post__meta`, `.post__image`, scoping de
     tipografía) quedan intactas.
   - `src/styles/post-header.css` (NUEVO, untracked): 48 líneas. Panel con
     `linear-gradient(160deg, var(--color-hero-top) 0%, var(--color-hero-mid)
     45%, var(--color-hero-bottom) 100%)`, glow en `::before` con
     `radial-gradient(circle, var(--color-glow), transparent 70%)`, radio
     `var(--radius-card)`, borde `var(--color-border-strong)`, sombra
     `var(--shadow-card)`; píldora `.post__meta` con `--radius-pill`,
     `color-mix(in srgb, var(--color-surface) 70%, transparent)` y
     `--color-border-strong`; media query `(max-width: 768px)` con
     `padding` del panel y de la píldora reducidos.
2. **Tests tocados**: `git diff tests/` muestra solo archivos de features
   35/36/37 ya aprobadas (ssr-cloudflare-align: feature 35;
   posts-repository y latest-articles-restore: feature 36; view-transitions:
   feature 37 — comentario y selector `h2.latest-articles__title` de las
   cards). `tests/post-page-styles.test.mjs` NO aparece en el diff (intacto).
   La feature 39 solo **añade** `tests/post-header.test.mjs` (230 líneas,
   12 tests, REQ-39-01..09 + convención), exactamente lo autorizado por el
   análisis §4 («No se autoriza ningún cambio en los tests existentes»).
   Cero cambios en tests existentes por parte de la feature 39.
3. **Test-first en rojo verificado**: el informe documenta el ciclo rojo
   (`node --test tests/post-header.test.mjs` → 8 fail / 4 pass, donde los 4
   pass son los contratos que el estado actual ya cumplía: transiciones,
   main/article, tokens.css y límite de líneas) previo a tocar `src/`, y el
   verde posterior (12/12). Evidencia coherente con el contenido actual de
   los archivos.
4. **Ejecuciones reales (esta revisión)**:
   - `node --test tests/post-header.test.mjs tests/view-transitions.test.mjs
     tests/post-page-styles.test.mjs tests/articles-ui-refactor.test.mjs
     tests/latest-articles-restore.test.mjs` → **49/49 pass**.
   - `node --test "tests/**/*.test.mjs"` → **233/233 pass** (221 baseline del
     cierre de la 38 + 12 nuevos), 0 fail.
   - `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
     tokens.css en src/styles`.
   - `./init.sh` → formato ✔, tests ✔, build ✔ → **«El entorno está
     perfecto. Podemos empezar a trabajar.»**
5. **`feature_list.json`**: feature 39 en `status: "in_progress"`;
   `depends_on: []` — sin dependencias pendientes saltadas (la feature no
   depende de ninguna otra pendiente).
6. **Conteos de línea (countLines del arnés)**: `[id].astro` 51,
   `post.css` 100, `post-header.css` 48, `tokens.css` 87. Todos ≤100
   (post.css está exactamente en el límite, no lo supera).

## Comprobación requisito por requisito

| REQ | Criterio | Resultado |
|---|---|---|
| REQ-39-01 | Contenido a ancho completo del contenedor | ✔ `post.css` L12-16: `.post__content { font-family: var(--font-sans); }` sin `max-width` ni `margin: auto`; `.post` conserva `width: min(var(--container-max), 95%)`. Test REQ-39-01 verde. |
| REQ-39-02 | Panel hero con imagen + título + degradado y resplandor de tokens del hero | ✔ `[id].astro` L38-44: `header.post__hero` con `img.post__image` + `.post__hero-copy` (h1 + p). `post-header.css` L12: `linear-gradient(160deg, var(--color-hero-top)…mid…bottom)`; L27: glow `var(--color-glow)` en `::before`. |
| REQ-39-03 | Panel enmarca la imagen con radio/borde/sombra de tokens | ✔ `post-header.css` L9-11: `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border-strong)`, `box-shadow: var(--shadow-card)`; la imagen conserva su marco propio (REQ-26-04) dentro del padding del panel. |
| REQ-39-04 | Meta como píldora con tokens | ✔ `post-header.css` L37-43: `display: inline-flex`, `border-radius: var(--radius-pill)`, `background: color-mix(in srgb, var(--color-surface) 70%, transparent)`, `border: 1px solid var(--color-border-strong)`. |
| REQ-39-05 | Pares `title-${entry.id}` / `img-${entry.id}` conservados | ✔ Primer `<h1>` (L41) e primer `<img>` (L39) del archivo con sus pares intactos y en ese orden (sin imágenes/encabezados antes). `tests/view-transitions.test.mjs` REQ-24-05 verde SIN modificarse por la 39; `post-header.test.mjs` REQ-39-05 verde. |
| REQ-39-06 | Estilos del panel en `post-header.css` ≤100 líneas | ✔ Hoja nueva importada en L3 de `[id].astro`; 48 líneas (≤100). `post.css` en 100 (límite exacto, ≤100, REQ-26-06 verde). |
| REQ-39-07 | Media query 768px para header y tipografía | ✔ `post-header.css` L45-48: `@media (max-width: 768px)` ajusta `.post__hero` y `.post__meta`; `post.css` L96-100 ajusta `.post`, `.post__title` y `.post__content h2`. |
| REQ-39-08 | `main.post` y `article.post__content` conservados | ✔ `[id].astro` L37 y L45. `post-page-styles.test.mjs` REQ-26-03 verde sin modificación. |
| REQ-39-09 | Solo tokens existentes; `tokens.css` en 87 líneas | ✔ `tokens.css` = 87 líneas y NO aparece en `git status` (intacto). Sin hex/rgba sueltos en ninguna hoja del detalle (audit ✔ + tests REQ-39-09 verdes); `post-header.css` usa solo `var()`/`color-mix` con tokens existentes (`--color-hero-*`, `--color-glow`, `--radius-card`, `--radius-pill`, `--color-border-strong`, `--color-surface`, `--shadow-card`, `--gap-card`, `--font-sans`). |

Acceptance de feature 39 en `feature_list.json`: las 8 se cumplen
(evidencias arriba).

## Pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **Sí.** `tests/post-header.test.mjs` se escribió
antes de tocar `src/` (rojo 8/12: todo lo dependiente del marcado/hoja
nueva; verde 4/12: contratos que el estado actual ya cumplía) y la suite
completa quedó en verde (233/233, audit limpio, `./init.sh` perfecto).
¿Se saltó alguna dependencia pendiente? **No**: `depends_on: []` — la
feature no tiene dependencias.

## Checkpoints (CHECKPOINTS.md recorridos)

- C1 Arquitectura (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 Sin lógica JS en UI (frontmatter solo imports/datos; `getStaticPaths`
  es contrato previo de las features 24/36, validado por tests): [x]
- C3 Repositorios como única vía de datos (la página sigue usando
  `PostsRepository`): [x]
- C4 Tokens, no valores sueltos (audit ✔, sin hex/rgba, sin tokens nuevos): [x]
- C5 ≤100 líneas por archivo: [x] (máximo observado: post.css en 100,
  exactamente el límite)
- C6 Sin dependencias externas nuevas: [x]
- C7 `src/data/*.json` válido y tipado: [x]
- C8 Repositorios con errores nombrados (`PostsDataError`): [x]
- C9 `./init.sh` en verde (entorno, formato, tests 100%, build): [x]
  ← verificado en esta revisión (233/233, build OK)
- C10 Inspección visual desktop/móvil: [ ] — pendiente de inspección visual
  en navegador (no verificada por el reviewer; no bloqueante)
- C11 `feature_list.json` con la tarea en done: [ ] — feature 39 sigue
  `in_progress` a la espera de este veredicto y del cierre del líder
  (estado esperado pre-cierre)
- C12 `progress/current.md` documenta la sesión y `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)

- El informe del implementer declara «post.css 96 líneas»; el conteo real
  según `countLines` del arnés es 100 (el diff añadió el salto de línea
  final y el `@media` existente). Cumple el límite (≤100, REQ-26-06), pero
  la cifra declarada difiere de la real. Sin impacto en el veredicto.
- La regla `.post__meta` del contrato REQ-26-03 permanece en post.css
  (color/font-size/margin: 0) y la píldora vive en post-header.css:
  ambas reglas conviven sin conflicto (misma especificidad, la píldora
  añade display/radio/fondo/borde/padding). Tests REQ-26-03 y REQ-39-04
  en verde.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
