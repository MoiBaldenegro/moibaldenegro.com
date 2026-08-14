# Review — feature 40 `post-readability`

Fecha: 2026-08-14. Reviewer: nivel 1, lanzado por el líder tras el informe del
implementer (`progress/impl_40_post-readability.md`).

**Veredicto:** APPROVED

## Resumen

La feature 40 mejora la legibilidad del detalle de artículo
(`src/pages/posts/[id].astro`): columna de lectura de 70ch centrada en la
clase nueva `post__body` (el contenedor `.post`, el header `.post__hero` y la
regla `.post__content` conservan el ancho completo — REQ-39-01 literal),
cuerpo `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`, `text-wrap: pretty` en p,
`text-wrap: balance` en h1-h3, `margin-block-end: 1lh` y `letter-spacing:
0.01em` en p, jerarquía h2 1.75rem / h3 1.4rem con márgenes en `lh` y media
query 768px. Todo en la hoja nueva `src/styles/post-readability.css` (44
líneas), sin tokens nuevos (`tokens.css` intacto en 87 líneas). Test-first
documentado (rojo 13/13 → verde 13/13); suite completa 246/246 en verde;
`./init.sh` perfecto. Verificación independiente en disco: todo en verde.

## Evidencias (verificación independiente, en disco)

1. **Archivos de la feature 40**:
   - `src/pages/posts/[id].astro` (52 líneas): import de
     `../../styles/post-readability.css` en la línea 4, DESPUÉS de `post.css`
     (L2) y `post-header.css` (L3) — el orden de import fija la cascada
     (design, Decisión 7). L47: `<section class="post__body">` envuelve el
     `<Content />` dentro de `article.post__content` (REQ-40-01). El resto
     del frontmatter (`getStaticPaths`, `PostsRepository`, `render`) es
     contrato previo de las features 24/36, intacto. `prerender = true` (L34).
   - `src/styles/post-readability.css` (**NUEVO**, 44 líneas): `.post__body`
     con `max-inline-size: 70ch; margin-inline: auto; font-size:
     clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (REQ-40-02/03); `.post__content
     p` con `text-wrap: pretty; letter-spacing: 0.01em; margin-block-end: 1lh`
     (REQ-40-04/05/06); grupo `.post__content h1, h2, h3` con `text-wrap:
     balance` (REQ-40-07); h2 `font-size: 1.75rem; margin-block: 1.5lh 0.5lh`
     y h3 `font-size: 1.4rem; margin-block: 1.25lh 0.375lh` (REQ-40-08);
     `@media (max-width: 768px)` con h2 1.4rem / h3 1.2rem (REQ-40-09).
     Media query al final del archivo (convención). Sin colores, sin tokens
     nuevos: solo unidades relativas (rem/ch/lh/em), precedente REQ-26-05.
   - `tests/post-readability.test.mjs` (**NUEVO**, 211 líneas, 13 tests):
     contrato REQ-40-01..12 + convención. Sin modificar ningún test existente.
2. **Tests existentes NO modificados por la feature 40**: `git diff
   tests/` muestra solo los archivos de features ya aprobadas —
   `ssr-cloudflare-align.test.mjs` (feature 35), `posts-repository` y
   `latest-articles-restore` (feature 36), `view-transitions` (feature 37:
   comentario y selector `h2.latest-articles__title`, verificado en el diff y
   aprobado en `review_37`). `post-page-styles.test.mjs` y
   `design-tokens.test.mjs` NO aparecen en el diff (intactos);
   `post-header.test.mjs` es untracked de la feature 39 ya aprobada. La única
   adición de test es `post-readability.test.mjs`.
3. **Cascada verificada en el build** (`dist/` tras `pnpm build`, inspección
   del informe + confirmación de `init.sh`): los overrides de `p`/`h2`/`h3`
   de post-readability.css aparecen después de las reglas de post.css en el
   CSS inlined; `.post` conserva `width:min(var(--container-max),95%)` y
   `.post__content` no declara max-width.
4. **Ejecuciones reales (esta revisión)**:
   - `node --test tests/post-readability.test.mjs tests/post-page-redesign.test.mjs
     tests/post-page-styles.test.mjs tests/view-transitions.test.mjs
     tests/design-tokens.test.mjs` → **37/37 pass**, 0 fail.
   - `node --test "tests/**/*.test.mjs"` → **246/246 pass** (233 baseline de
     la feature 39 + 13 nuevos), 0 fail.
   - `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
     tokens.css en src/styles`.
   - `./init.sh` → formato ✔, tests ✔, build ✔ → **«El entorno está
     perfecto. Podemos empezar a trabajar.»**
5. **`feature_list.json`**: features 33-39 en `done`; feature 40 en
   `in_progress` (el implementer NO marca done; el cierre lo orquesta el
   líder tras este veredicto). `depends_on: []` — sin dependencias pendientes
   saltadas.
6. **Conteos de línea (countLines)**: `[id].astro` 52, `post-readability.css`
   44, `post.css` 100 (límite exacto, intacto), `post-header.css` 48,
   `tokens.css` 87. Todos ≤100.
7. **Sin restos de debug**: `grep console./TODO/FIXME/debugger` en los tres
   archivos nuevos/modificados → sin coincidencias.

## Comprobación requisito por requisito

| REQ | Criterio | Resultado |
|---|---|---|
| REQ-40-01 | El render del Content envuelto en `section.post__body` | ✔ `[id].astro` L47-49: `<section class="post__body">` envuelve `<Content />` dentro de `article.post__content` (L46); import de `post-readability.css` (L4) después de `post.css` (L2) y `post-header.css` (L3). Tests REQ-40-01 (×2) verdes. |
| REQ-40-02 | Columna de 70ch centrada; contenedor y header full-width | ✔ `post-readability.css` L10-14: `max-inline-size: 70ch; margin-inline: auto`. `.post` conserva `width: min(var(--container-max), 95%)` (post.css L7); `.post__hero` sin max-width (post-header.css); `.post__content` sin max-width (REQ-40-12). |
| REQ-40-03 | clamp() 1.0625rem..1.1875rem | ✔ L13: `font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (fluido 17→19px, design Decisión 2). |
| REQ-40-04 | `text-wrap: pretty` en p | ✔ L19: `.post__content p { text-wrap: pretty; ... }`. |
| REQ-40-05 | Espaciado final de bloque 1lh | ✔ L21: `margin-block-end: 1lh` (ritmo vertical atado al line-height, design Decisión 4). |
| REQ-40-06 | `letter-spacing: 0.01em` | ✔ L20: `letter-spacing: 0.01em` (confort de tema oscuro, design Decisión 5). |
| REQ-40-07 | `text-wrap: balance` en encabezados | ✔ L25-27: grupo `.post__content h1, .post__content h2, .post__content h3 { text-wrap: balance; }`. |
| REQ-40-08 | h2 1.75rem y h3 1.4rem | ✔ L30-33: h2 `font-size: 1.75rem; margin-block: 1.5lh 0.5lh`; L35-38: h3 `font-size: 1.4rem; margin-block: 1.25lh 0.375lh`. |
| REQ-40-09 | Media query 768px adaptando h2/h3 | ✔ L41-43: `@media (max-width: 768px)` con h2 1.4rem y h3 1.2rem. post.css conserva su propia media query (contrato REQ-39-07 intacto); la hoja nueva gana la cascada por orden de import. |
| REQ-40-10 | Hoja `post-readability.css` ≤100 líneas | ✔ 44 líneas reales (countLines). Sin hex/rgba (no declara colores; audit ✔). |
| REQ-40-11 | Solo tokens existentes; tokens.css en 87 líneas | ✔ La hoja nueva no define ni consume custom properties nuevas (solo unidades relativas rem/ch/lh/em, precedente REQ-26-05); `tokens.css` = 87 líneas, sin tokens `--post-`/`--reading-`/`--font-size-`. |
| REQ-40-12 | `.post__content` conserva ancho completo | ✔ post.css L14-16: `.post__content { font-family: var(--font-sans); }` sin `max-width` ni `margin: auto` (REQ-39-01 literal); la medida vive solo en `post__body`. |

Acceptance de feature 40 en `feature_list.json`: las 8 se cumplen
(evidencias arriba).

## Pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **Sí.** El informe documenta el ciclo rojo de
`tests/post-readability.test.mjs` (13/13 fail por ausencia de implementación,
con los mensajes de error citados: sin `post__body`, sin import, sin hoja
nueva) previo a tocar `src/`, y el verde posterior (13/13). El contenido
actual del test es coherente con los archivos implementados (verificado en
disco, regla por regla). La suite completa quedó en verde: 246/246 en esta
revisión, `init.sh` perfecto.
¿Se saltó alguna dependencia pendiente? **No**: `depends_on: []` — la
feature no tiene dependencias.

## Checkpoints (CHECKPOINTS.md recorridos)

- C1 Arquitectura (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 Sin lógica JS en UI (frontmatter solo imports/datos; `getStaticPaths` es
  contrato previo de las features 24/36, validado por tests): [x]
- C3 Repositorios como única vía de datos (la página sigue usando
  `PostsRepository`): [x]
- C4 Tokens, no valores sueltos (audit ✔, sin hex/rgba, sin tokens nuevos;
  la hoja nueva solo usa unidades relativas): [x]
- C5 ≤100 líneas por archivo: [x] (máximo observado: post.css en 100,
  exactamente el límite, intacto)
- C6 Sin dependencias externas nuevas: [x]
- C7 `src/data/*.json` válido y tipado: [x] (build OK)
- C8 Repositorios con errores nombrados (`PostsDataError`): [x]
- C9 `./init.sh` en verde (entorno, formato, tests 100%, build): [x]
  ← verificado en esta revisión (246/246, build OK, «El entorno está
  perfecto»)
- C10 Inspección visual desktop/móvil: [ ] — pendiente de inspección visual
  en navegador (no verificada por el reviewer; no bloqueante, mismo criterio
  que las reviews 33-39)
- C11 `feature_list.json` con la tarea en done: [ ] — feature 40 sigue
  `in_progress` a la espera de este veredicto y del cierre del líder
  (estado esperado pre-cierre)
- C12 `progress/current.md` documenta la sesión y `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x] (grep sin coincidencias)

## Observaciones (no bloqueantes)

- El informe del implementer declara `post-readability.css` con «37 líneas»;
  el conteo real según `countLines` es 44 (el archivo fue creciendo en la
  implementación con comentarios y márgenes de encabezado). Cumple el límite
  (≤100, REQ-40-10), pero la cifra declarada difiere de la real. Sin impacto
  en el veredicto.
- `post-readability.css` no usa `@supports` para `text-wrap: pretty`
  (Firefox degrada silenciosamente): decisión de diseño documentada (mejora
  progresiva, design Decisión 3), riesgo controlado y aceptable.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
