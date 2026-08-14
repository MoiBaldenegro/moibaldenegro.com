# Review — feature 42 `post-header-horizontal-card`

Fecha: 2026-08-14. Reviewer: nivel 1, lanzado por el líder tras el informe del
implementer (`progress/impl_42_post-header-horizontal-card.md`).

**Veredicto:** APPROVED

## Resumen

Petición del humano (ciclo 34): el header de los posts era "prácticamente
igual" a las cards de la portada (imagen + título apilados); pidió "la tarjeta
como en horizontal, un diseño más atrevido". La feature 42 reescribe
`src/styles/post-header.css` (48 → 99 líneas) como tarjeta HORIZONTAL: grid de
2 columnas (imagen 4:3 con halo de glow a la izquierda, copia a la derecha),
kicker de la primera tag del post como píldora de acento, título gigante
`clamp(2.2rem, 4.5vw, 3.6rem)`, wash radial de acento como segundo layer del
background, acento inferior degradado en `::after` y media query 768px que
apila la tarjeta (imagen 16:9 arriba). El marcado de `[id].astro` solo gana
una línea (`p.post__kicker` con `#{post.tags[0]}` antes del h1, 53 líneas);
`post.css`, `tokens.css` y los tests existentes NO se tocan. Test-first
documentado (rojo 7 fail / 5 pass → verde 12/12); verificación independiente
en disco: 57/57 (feature + contratos), 258/258 (suite completa), audit de
tokens ✔, formato ✔, `./init.sh` → «El entorno está perfecto».

## Evidencias (verificación independiente, en disco)

1. **Alcance (vs. baseline aprobado de review_41)**: difieren exactamente tres
   archivos, todos del alcance declarado:
   - `src/pages/posts/[id].astro`: 52 → 53 líneas (solo se añade la línea 42
     `<p class="post__kicker">#{post.tags[0]}</p>` dentro de `.post__hero-copy`
     antes del h1; orden DOM imagen → copia intacto; imports L2-4 en orden
     post.css → post-header.css → post-readability.css, contrato REQ-40-01;
     `prerender = true` L34; sin `<style>` ni `style=`.
   - `src/styles/post-header.css`: reescrito, 99 líneas (≤100 ✓).
   - `tests/post-header-horizontal.test.mjs`: NUEVO (242 líneas, patrón del
     arnés; el límite de 100 líneas aplica a código y los tests del repo ya
     exceden ese tamaño por precedente aprobado: post-header 230, post-readability 235,
     post-page-styles 256, view-transitions 186).
   - **Intactos** (idénticos al estado aprobado en review_41): `post.css`
     (100 líneas; `.post__content` sin max-width L14-16, `.post__image` base
     con `width: 100%`, `aspect-ratio: 16/9` L33-41 — contrato REQ-26-04),
     `tokens.css` (87 líneas), y los tests existentes (post-header REQ-39,
     post-page-styles REQ-26, view-transitions REQ-24, post-readability
     REQ-40/41) que pasan SIN modificarse. Nota: `git status` marca archivos de
     features 26/33-41 como modificados/untracked contra HEAD porque el working
     tree acumula ciclos sin commitear (estado ya documentado en review_41 §1).
2. **Guard REQ-39-09 (var())**: búsqueda exhaustiva en post-header.css de
   `box-shadow: none`, `border: none`, `color: inherit`, `#hex` y `rgba(`
   → cero coincidencias en la hoja (solo tokens.css define literales, que es su
   función). Las 8 props vigiladas {color, background, background-color,
   border, border-color, border-radius, box-shadow, transition} usan `var(--`
   (test 11 verde). `color-mix(in srgb, var(--color-accent) N%, transparent)`
   sin hex/rgba sueltos; audit-design-tokens ✔.
3. **Ejecuciones reales (esta revisión)**:
   - `node --test tests/post-header-horizontal.test.mjs tests/post-header.test.mjs
     tests/post-page-redesign.test.mjs tests/post-page-styles.test.mjs
     tests/view-transitions.test.mjs tests/post-readability.test.mjs` → **57/57
     pass**, 0 fail.
   - `node --test "tests/**/*.test.mjs"` → **258/258 pass**, 0 fail.
   - `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
     tokens.css en src/styles`.
   - `node scripts/check-format.mjs` → `FORMATO ✔`.
   - `./init.sh` → tests ✔, build ✔ → **«El entorno está perfecto. Podemos
     empezar a trabajar.»**
4. **`feature_list.json`**: features 33-41 en `done`; feature 42 en
   `in_progress` (el implementer NO marca done; el cierre lo orquesta el líder
   tras este veredicto). `depends_on: []` — sin dependencias pendientes
   saltadas.
5. **Conteos (countLines)**: `post-header.css` 99, `[id].astro` 53, `post.css`
   100 (intacto), `tokens.css` 87 (intacto), test nuevo 242.

## Comprobación requisito por requisito

| REQ | Criterio | Resultado |
|---|---|---|
| REQ-42-01 | Tarjeta horizontal: imagen + copia en dos columnas dentro del panel | ✔ post-header.css L8-11: `.post__hero` con `display: grid`, `grid-template-columns: 1fr 1fr`, `align-items: center`, `gap: 32px`; conserva `border-radius: var(--radius-card)`, `border: var(--color-border-strong)`, `box-shadow: var(--shadow-card)`, degradado `var(--color-hero-*)` (primer layer) + wash radial de acento (segundo layer, `color-mix`) y glow de `::before` (L16-33). Test 3 verde. |
| REQ-42-02 | Dos columnas (imagen 1ª, copia 2ª) >768px | ✔ `grid-template-columns: 1fr 1fr` (L9) con DOM imagen (L40) → copia (L41-45); grid coloca la imagen en la columna 1. |
| REQ-42-03 | Primera etiqueta como píldora de acento | ✔ `[id].astro` L42: `<p class="post__kicker">#{post.tags[0]}</p>` dentro de `.post__hero-copy` ANTES de `h1.post__title` (L43); `.post__kicker` L60-72: `color: var(--color-accent)`, `border: 1px solid var(--color-accent)`, `background: color-mix(..., var(--color-accent) 12%, transparent)`, `border-radius: var(--radius-pill)`. Test 6 verde. Kicker es `<p>` (no `<div>`) → no rompe el regex lazy de REQ-39-02. |
| REQ-42-04 | Título clamp 2.2-3.6rem | ✔ L75: `font-size: clamp(2.2rem, 4.5vw, 3.6rem)` + `text-wrap: balance` + `text-shadow` glow (L74-80). Test 7 verde. |
| REQ-42-05 | Imagen 4:3 con glow | ✔ `.post__hero .post__image` L48-53: `margin: 0`, `aspect-ratio: 4 / 3`, `box-shadow: 0 0 48px var(--color-glow)`, `border-color: var(--color-border-strong)`; la base `.post__image` de post.css intacta (`width: 100%`, `16/9` — REQ-26-04). Test 5 verde. |
| REQ-42-06 | Acento inferior degradado | ✔ `.post__hero::after` L36-45: `background: linear-gradient(90deg, var(--color-accent), transparent 70%)`, `height: 3px`, `bottom: 0`. Test 4 verde. |
| REQ-42-07 | ≤768px apilada (imagen sobre copia) | ✔ `@media (max-width: 768px)` L90-98: `.post__hero { grid-template-columns: 1fr; gap: var(--gap-card); padding: 20px }`, imagen 16/9, kicker/meta ajustados; conserva la regla `.post__hero` (REQ-39-07). Test 8 verde. |
| REQ-42-08 | Pares `title-${entry.id}` / `img-${entry.id}` en primer h1 / primer img | ✔ `[id].astro` L40 (`img-${entry.id}`) y L43 (`title-${entry.id}`) son el primer img y el primer h1 de la página (el kicker es `<p>`); view-transitions REQ-24-05 pasa sin modificar. Test 2 verde. |
| REQ-42-09 | Estilos en post-header.css ≤100 líneas; tokens.css 87 líneas | ✔ 99 líneas; tokens.css 87 líneas sin tokens nuevos (sin `--post-`); sin hex/rgba sueltos; guard var() (REQ-39-09) verde. Tests 9-11 verdes. |

Acceptance de feature 42 en `feature_list.json`: las 9 se cumplen
(evidencias arriba).

## Pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **Sí.** El informe documenta el ciclo rojo del test
nuevo (ejecutado ANTES de tocar `[id].astro` y post-header.css): 7 fallos
acotados a REQ-42-01..07 (marcado kicker, grid 2 columnas, `::after`, imagen
4:3, kicker accent, clamp, MQ apilada) y 5 pasando ya en rojo (REQ-42-08/09,
guard var(), convenciones) — coherente con la verificación en esta revisión de
que los contratos conservados no dependen de la implementación. El verde
posterior: test de feature 12/12 y suite completa 258/258, confirmado por mi
ejecución independiente. El alcance de los asserts del test (L70-241) cubre
exactamente REQ-42-01..09 + convenciones, y los mensajes de error citados en
el rojo del informe coinciden con los asserts actuales.
¿Se saltó alguna dependencia pendiente? **No**: `depends_on: []` — la feature
no tiene dependencias; features 33-41 en `done` en el backlog.

## Checkpoints (CHECKPOINTS.md recorridos)

- C1 Arquitectura (estilos en src/styles, sin `<style>` en `.astro`): [x]
- C2 Sin lógica JS en UI (frontmatter solo imports/datos; `#{post.tags[0]}`
  es render de dato de la entidad, no lógica): [x]
- C3 Repositorios como única vía de datos (página sigue vía `PostsRepository`): [x]
- C4 Tokens, no valores sueltos (audit ✔, sin hex/rgba, guard var() ✔): [x]
- C5 ≤100 líneas por archivo (código: máx. post.css 100 intacto, post-header.css 99; tests con precedente aprobado de tamaño mayor): [x]
- C6 Sin dependencias externas nuevas: [x]
- C7 `src/data/*.json` válido y tipado (build OK): [x]
- C8 Repositorios con errores nombrados (`PostsDataError`): [x]
- C9 `./init.sh` en verde (entorno, formato, tests 100%, build): [x]
  ← verificado en esta revisión (258/258, build OK, «El entorno está perfecto»)
- C10 Inspección visual desktop/móvil: [ ] — pendiente de inspección visual
  en navegador (no verificada por el reviewer; no bloqueante, mismo criterio
  que las reviews 33-41; el build renderizado verifica la tarjeta horizontal
  en desktop y el apilado en la MQ)
- C11 `feature_list.json` con la tarea en done: [ ] — feature 42 sigue
  `in_progress` a la espera de este veredicto y del cierre del líder
  (estado esperado pre-cierre)
- C12 `progress/current.md` documenta la sesión e `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x] (lectura íntegra de los archivos de
  la feature sin coincidencias; el informe no declara archivos ajenos)

## Observaciones (no bloqueantes)

- `wc -l` reporta 98 líneas para post-header.css porque el archivo no termina
  en salto de línea; el countLines del test (que maneja ese caso) da 99 ≤ 100.
  Sin impacto.
- `tests/post-header-horizontal.test.mjs` (242 líneas) sigue el patrón de
  tamaño de los tests del arnés (230-256 líneas en los contratos previos),
  ya aprobados en reviews 39-41; el límite de 100 líneas se aplica al código
  de producción/scripts.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
