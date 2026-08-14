# Review — feature 41 `post-reading-width-restore`

Fecha: 2026-08-14. Reviewer: nivel 1, lanzado por el líder tras el informe del
implementer (`progress/impl_41_post-reading-width-restore.md`).

**Veredicto:** APPROVED

## Resumen

El humano rechazó la columna de lectura de 70ch de la feature 40 ("no compa lo
volvieron a poner muy angosto"). La feature 41 elimina TODA acotación de
medida (`max-width`/`max-inline-size`) de `src/styles/post-readability.css`
sobre `section.post__body` y conserva íntegras las mejoras tipográficas de la
40 (clamp 17→19px, pretty, 1lh, letter-spacing, balance, h2/h3, MQ 768px). El
markup `section.post__body` de `[id].astro` se conserva como contenedor
tipográfico sin medida; `post.css`, `post-header.css` y `tokens.css` intactos.
Test-first documentado (rojo 2 fallos → verde 13/13); verificación
independiente en disco: 37/37 (feature + contratos), 246/246 (suite completa),
audit de tokens ✔, `./init.sh` → «El entorno está perfecto».

## Evidencias (verificación independiente, en disco)

1. **Alcance de cambios (vs. baseline de la feature 40, review_40)**: solo dos
   archivos difieren del cierre de la 40:
   - `src/styles/post-readability.css`: 44 → 42 líneas (countLines; el archivo
     no termina en salto de línea, `wc -l` 41). Eliminadas `max-inline-size:
     70ch` y `margin-inline: auto` de `.post__body` (en la 40 estaban en
     L11-12 del bloque); comentarios de cabecera y de regla actualizados al
     contrato del ciclo 33.
   - `tests/post-readability.test.mjs`: 211 → 235 líneas, únicamente en lo
     autorizado por design.md §Cambios de test (REQ-41-10): cabecera (L1-8),
     comentario REQ-40-02 (L14-17), comentario REQ-40-12 (L35-39), test
     REQ-40-02/REQ-41-01 (L132-145: ausencia de max-width/max-inline-size en
     `.post__body`) y test REQ-40-12/REQ-41-13 (L212-227: aserción original
     conservada + guard de hoja completa con patrón
     `/(^|[\s{;])(max-width|max-inline-size)\s*:/gm`, que distingue el
     contexto `@media (max-width: 768px)` y NO descarta comentarios — riesgo 1
     del research §8). Los tests REQ-40-01, 03..11 y de convención se
     conservan sin aserciones de medida (solo menciones de 70ch en comentarios
     autorizados de cabecera).
   - **Intactos** (idénticos al estado aprobado en review_40): `[id].astro`
     (52 líneas; imports post.css→post-header.css→post-readability.css L2-4,
     `section.post__body` envolviendo `<Content />` L47-49, `prerender = true`
     L34), `post.css` (100 líneas; `.post__content` sin max-width L14-16,
     `.post` con `var(--container-max)` L7), `post-header.css` (48 líneas),
     `tokens.css` (87 líneas). Nota: `git status` marca `[id].astro` y
     `post.css` como modificados contra HEAD porque el working tree acumula
     features 26/36/39 sin commitear (estado ya documentado en review_40 §2);
     contra el baseline de la 40 no hay cambios.
2. **REQ-41-01/02/13 (ausencia de acotación)**: la hoja solo declara
   `.post__body { font-size: clamp(...) }`, p (pretty/0.01em/1lh), h1-h3
   (balance), h2 1.75rem/h3 1.4rem y la MQ 768px. Único `max-width` presente:
   el de `@media (max-width: 768px)` (L39, contexto permitido por REQ-41-09).
   Cero ocurrencias de `70ch`/`max-inline-size` en la hoja (verificado con
   lectura íntegra + grep). `.post__content` de post.css sin max-width (REQ-39-01
   literal). Sin `console.`/`TODO`/`FIXME`/`debugger` en los dos archivos de la
   feature.
3. **Tipografía conservada (REQ-41-03..09)**: verificada regla por regla en la
   hoja y por los tests REQ-40-03..09 (ver tabla).
4. **Ejecuciones reales (esta revisión)**:
   - `node --test tests/post-readability.test.mjs tests/post-page-redesign.test.mjs
     tests/post-page-styles.test.mjs tests/view-transitions.test.mjs
     tests/design-tokens.test.mjs` → **37/37 pass**, 0 fail.
   - `node --test "tests/**/*.test.mjs"` → **246/246 pass**, 0 fail.
   - `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
     tokens.css en src/styles`.
   - `./init.sh` → formato ✔, tests ✔, build ✔ → **«El entorno está
     perfecto. Podemos empezar a trabajar.»**
5. **`feature_list.json`**: features 33-40 en `done`; feature 41 en
   `in_progress` (el implementer NO marca done; el cierre lo orquesta el líder
   tras este veredicto). `depends_on: []` — sin dependencias pendientes
   saltadas.
6. **Conteos de línea (countLines)**: `post-readability.css` 42, test 235,
   `[id].astro` 52, `post.css` 100 (límite exacto, intacto), `post-header.css`
   48, `tokens.css` 87. Todos ≤100.
7. **Build verificado por el implementer** (`dist/client/posts/00-agilismo/
   index.html`): `section.post__body`/`header.post__hero`/`article.post__content`
   presentes; `.post__body` sin acotación (0 ocurrencias de 70ch/
   max-inline-size en la página); `.post__content` sin max-width → el cuerpo
   ocupa el mismo ancho que el header hero (full-width), que es exactamente la
   decisión del humano.

## Comprobación requisito por requisito

| REQ | Criterio | Resultado |
|---|---|---|
| REQ-41-01 | Ninguna regla de post-readability.css declara max-width/max-inline-size | ✔ Hoja 42 líneas sin acotación en ninguna regla (el único `max-width` es el de la MQ 768px, contexto permitido). Guard reforzado REQ-40-12/REQ-41-13 verde. |
| REQ-41-02 | section.post__body conservada sin acotación | ✔ `[id].astro` L47-49: `<section class="post__body">` envuelve `<Content />` dentro de `article.post__content` (L46); la hoja no acota la sección (solo `font-size` clamp). |
| REQ-41-03 | clamp() 1.0625rem..1.1875rem | ✔ L11: `font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`; test REQ-40-03 verde. |
| REQ-41-04 | `text-wrap: pretty` en p | ✔ L17; test REQ-40-04 verde. |
| REQ-41-05 | `margin-block-end: 1lh` en p | ✔ L19; test REQ-40-05 verde. |
| REQ-41-06 | `letter-spacing: 0.01em` en p | ✔ L18; test REQ-40-06 verde. |
| REQ-41-07 | `text-wrap: balance` en h1-h3 | ✔ L23-25; test REQ-40-07 verde. |
| REQ-41-08 | h2 1.75rem y h3 1.4rem | ✔ L28-31 (h2, márgenes 1.5lh/0.5lh) y L33-36 (h3, márgenes 1.25lh/0.375lh); test REQ-40-08 verde. |
| REQ-41-09 | MQ 768px adaptando h2/h3 | ✔ L39-42: `@media (max-width: 768px)` con h2 1.4rem y h3 1.2rem, al final del archivo (convención); test REQ-40-09 verde. |
| REQ-41-10 | Test actualizado verificando ausencia; tipografía conservada verificada | ✔ Solo REQ-40-02 (ausencia en `.post__body`) y refuerzo de REQ-40-12 (guard de hoja completa) + cabecera; REQ-40-01/03..11 y convención intactos. 13/13 verde. |
| REQ-41-11 | Hoja ≤100 líneas, sin hex/rgba | ✔ 42 líneas; sin colores declarados (solo unidades rem/lh/em, precedente REQ-26-05); audit-design-tokens ✔; test REQ-40-10 verde. |
| REQ-41-12 | Solo tokens existentes; tokens.css en 87 líneas | ✔ tokens.css = 87 líneas sin `--post-`/`--reading-`/`--font-size-`; test REQ-40-11 verde. |
| REQ-41-13 | `.post__content` conserva ancho completo | ✔ post.css L14-16 sin max-width (REQ-39-01 literal); test REQ-40-12/REQ-41-13 verde; contratos post-header/post-page-styles/view-transitions/design-tokens verdes sin modificar. |

Acceptance de feature 41 en `feature_list.json`: las 8 se cumplen
(evidencias arriba).

## Pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **Sí.** El informe documenta el ciclo rojo del test
actualizado (ejecutado ANTES de tocar la hoja): 2 fallos acotados a las
aserciones de la medida — REQ-40-02/REQ-41-01 («.post__body declara
max-inline-size…») y el guard REQ-40-12/REQ-41-13 («post-readability.css
declara max-width o max-inline-size…») — con las 11 aserciones tipográficas
pasando ya en rojo; y el verde posterior (13/13). Los mensajes de error
citados en el informe coinciden con los asserts actuales del test (L132-145,
L212-227), coherente con la ejecución en esta revisión. La suite completa
quedó en verde: 246/246, `init.sh` perfecto.
¿Se saltó alguna dependencia pendiente? **No**: `depends_on: []` — la
feature no tiene dependencias; features 33-40 en `done` en el backlog.

## Checkpoints (CHECKPOINTS.md recorridos)

- C1 Arquitectura (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 Sin lógica JS en UI (frontmatter solo imports/datos; `getStaticPaths` es
  contrato previo de las features 24/36, validado por tests): [x]
- C3 Repositorios como única vía de datos (la página sigue usando
  `PostsRepository`): [x]
- C4 Tokens, no valores sueltos (audit ✔, sin hex/rgba, sin tokens nuevos): [x]
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
  que las reviews 33-40; el build renderizado verifica que el cuerpo comparte
  ancho con el header hero, la decisión del humano)
- C11 `feature_list.json` con la tarea en done: [ ] — feature 41 sigue
  `in_progress` a la espera de este veredicto y del cierre del líder
  (estado esperado pre-cierre)
- C12 `progress/current.md` documenta la sesión y `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x] (lectura íntegra de los archivos de
  la feature sin coincidencias)

## Observaciones (no bloqueantes)

- `wc -l` reporta 41 líneas para post-readability.css porque el archivo no
  termina en salto de línea; el countLines del test (que maneja ese caso)
  da 42 ≤ 100. Sin impacto.
- El informe declara verificación del build en `dist/`; `./init.sh` (que
  regenera el build) confirma el build OK en esta revisión. La inspección
  visual en navegador queda pendiente del humano, como en ciclos anteriores.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
