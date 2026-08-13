# Review — feature 17 article-card-images

**Veredicto:** CHANGES_REQUESTED

## Resumen

- **Spec:** `specs/17_article-card-images/requirements.md` (REQ-17-01..09) + `specs/17_article-card-images/design.md` (Decisiones 1-7)
- **Acceptance:** feature id 17 en `feature_list.json` (status `in_progress`, correcto en fase de review)
- **Informe implementador:** `progress/impl_17_article-card-images.md`
- **Revisado por:** agente revisor (nivel 1) — verificación independiente ejecutada en esta sesión
- **Fecha:** 2026-08-11

## Verificación de la pregunta de revisión (test-first)

**¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al final?** PARCIAL: el test existe y el ROJO está evidenciado, pero **el VERDE final NO se cumple en disco**.

- ROJO evidenciado en `progress/impl_17_article-card-images.md` §1: 7 fail / 4 pass con salidas reales transcritas. **Reproducido por el revisor**: ejecutar `node --test tests/article-card-images.test.mjs` da **8 pass / 3 fail** — el test falla hoy con los mismos errores de la fase roja (`'el <img> no lleva la clase latest-articles__image (REQ-17-01)'`, `'el <img> no usa alt={post.title} (REQ-17-06)'`, `'el <img> no declara loading="lazy" (REQ-17-07)'`).
- VERDE declarado en el informe (11/11 y suite 144/144): **NO verificado en disco** — la suite completa da **140/144 (4 fail)** y `./init.sh` termina en ROJO.

### Evidencia del estado real en disco (verificación independiente)

1. `src/components/latest-articles.astro:16` contiene
   `<img src={`/assets/content/${post.img}`} alt=""/>`
   — **SIN** `class="latest-articles__image"`, **SIN** `alt={post.title}`, **SIN** `loading="lazy"`.
   El cambio reportado en `impl_17` §2 ("`latest-articles.astro:16` → `<img class="latest-articles__image" ... alt={post.title} loading="lazy"/>`") **no está aplicado en disco**. El mtime del archivo (11:33:59) es **posterior** al del informe (11:33:42), lo que indica que el archivo fue reescrito tras el ciclo del implementer (presumiblemente por la edición concurrente del usuario sobre el mismo componente; en cualquier caso, el estado que manda es el de disco y está en rojo).
2. `src/components/latest-articles.astro:12` usa `<a  class="latest-articles__card">` en lugar de `<article class="latest-articles__card">` (el HEAD tiene `<article>`). Ese cambio **rompe REQ-10-01** de la feature 10 (`tests/articles-ui-refactor.test.mjs:90` exige `'<article'`): fallo nº 4 de la suite.
3. La parte CSS de la feature **sí está aplicada y correcta**: `src/styles/latest-articles.css` (75 líneas, ≤100) con la regla `.latest-articles__image` (líneas 47-55): `display: block`, `width: 100%`, `aspect-ratio: 16 / 9`, `object-fit: cover`, `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0` — cumple REQ-17-02/03/04/05 + Decisión 4 + REQ-17-08. En el bundle: `latest-articles__image{aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-card);border:1px solid var(--color-border);width:100%;margin:var(--gap-card) 0;display:block}`.
4. `tokens.css`: **96 líneas, sin tokens nuevos** (REQ-17-09 ✔). `git diff src/styles/tokens.css` muestra SOLO los cambios de features previas aprobadas (`--opacity-hero`, `--opacity-gol`, `--size-gol-cell`); nada de la feature 17.
5. `dist/index.html` (build fresco ejecutado por el revisor): `<img src="/assets/content/arch00.webp" alt="">` — sin clase, sin alt real, sin lazy. El CSS bundle sí contiene la regla.

## Checklist con evidencia concreta

### Checkpoints (CHECKPOINTS.md)

- C1 (estilos separados de la UI): [x] — la regla vive en `latest-articles.css`; el componente no tiene `<style>` ni `style=` (test de convención lo asevera y pasa).
- C2 (sin lógica en UI): [x] — frontmatter solo imports + `getPosts()`; sin función/if/for.
- C3 (datos vía repositorio): [x] — `PostsRepository`; sin lectura directa de JSON.
- C4 (tokens, no valores sueltos): [x] — la regla de la imagen usa solo `var(--radius-card)`, `var(--color-border)`, `var(--gap-card)`; 0 hex/rgb; `aspect-ratio: 16/9` es valor propio justificado en design.md (Decisión 2) y verificado por test. `audit-design-tokens.mjs` ✔.
- C5 (≤100 líneas por archivo): [x] — `latest-articles.css` 75, `latest-articles.astro` 25, `tokens.css` 96.
- C6 (sin dependencias externas): [x] — ninguna añadida (node:test, node:fs stdlib).
- C7-8 (datos válidos, errores nombrados): [x] — sin cambios de dominio; `arch00.webp` del usuario es válido y el build lo sincroniza sin errores.
- C9 (init.sh verde): [ ] — **en ROJO**: `./init.sh` → `✘ tests al 100% (node:test)` (4 fallos), "NO se debe continuar hasta resolverlo". Razón: los 3 fallos REQ-17 + 1 fallo REQ-10-01.
- C10 (UI desktop/móvil): [ ] — la regla CSS con `width: 100%` + `aspect-ratio` escala en todos los breakpoints (Decisión 7), pero **en el render real la `<img>` no lleva la clase**, así que la imagen sigue saliendo a tamaño natural (el problema original del usuario NO está resuelto en el build actual).
- C11 (feature_list.json): [x] — status `in_progress` correcto en fase de review.
- C12 (current.md documenta): [x] — documenta plan, ROJO y el cambio declarado, pero **no documenta que el componente quedó en estado pre-cambio** (el informe/current.md describen un estado que no está en disco).
- C13 (sin temporales/debug/TODOs): [x] — sin temporales, sin print() de debug, sin TODOs en src/.

### Trazabilidad acceptance ↔ REQ (feature 17)

| Acceptance (feature_list.json) | REQ | Evidencia |
|---|---|---|
| Test escrito en rojo antes de la implementación y verde al final | REQ-17-01..09 | Test existe y el ROJO está evidenciado/reproducido; **el verde final NO** (3 tests de la feature fallan en disco) |
| `latest-articles.astro` renderiza la imagen con clase `latest-articles__image`, `alt={post.title}` y `loading="lazy"` | REQ-17-01, 06, 07 | **FALLA** — `latest-articles.astro:16` = `<img src={`/assets/content/${post.img}`} alt=""/>` sin clase/alt/lazy |
| `latest-articles.css` declara width 100%, aspect-ratio 16:9 y object-fit cover | REQ-17-02, 03, 04 | [x] — regla presente (líneas 47-55) y tests 4-6 de la feature en verde |
| Uso de `var(--radius-card)`, `var(--color-border)`, `var(--gap-card)`, sin hex/rgba, ≤100 líneas | REQ-17-05, 08 | [x] — regla con los 3 tokens, 0 hex/rgb, hoja de 75 líneas; tests 5, 7, 8 en verde |
| tokens.css sin añadir tokens, 96 líneas | REQ-17-09 | [x] — 96 líneas; sin `--aspect-`/`--ratio-`/`--radius-image`; tests 9-10 en verde |

### Verificaciones ejecutadas por el revisor (en secuencia)

1. `node --test tests/article-card-images.test.mjs` → **8 pass / 3 fail** (REQ-17-01, 06, 07).
2. `node --test "tests/**/*.test.mjs"` → **140/144, 4 fail** (los 3 REQ-17 + REQ-10-01 de la feature 10).
3. `node scripts/check-format.mjs` → `FORMATO ✔`.
4. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css`.
5. `pnpm build` → `✓ Complete!`, `2 page(s) built`.
6. `./init.sh` → **ROJO**: `✘ tests al 100% (node:test)` (exit 1).
7. `git diff src/styles/tokens.css` → solo `--opacity-hero`, `--opacity-gol`, `--size-gol-cell` (features previas aprobadas); nada de la 17 (REQ-17-09 ✔).
8. `dist/index.html` → `<img src="/assets/content/arch00.webp" alt="">` (sin clase/alt/lazy) + bundle CSS con la regla correcta.
9. `wc -l` → tokens.css 96, latest-articles.css 75, latest-articles.astro 25.
10. Búsqueda TODOs/debug en src → sin hallazgos.

## Cambios requeridos

1. **Aplicar en disco el cambio de `src/components/latest-articles.astro:16`** (REQ-17-01/06/07): `<img class="latest-articles__image" src={`/assets/content/${post.img}`} alt={post.title} loading="lazy"/>`. El estado actual no tiene clase, ni `alt={post.title}`, ni `loading="lazy"`, y los 3 tests de la feature fallan.
2. **Resolver la regresión de `src/components/latest-articles.astro:12`** (`<a class="latest-articles__card">` sin `<article>`): rompe REQ-10-01 de la feature 10 (`tests/articles-ui-refactor.test.mjs:90`). Si el `<a>` es intencional (edición del usuario), coordinarlo y ajustar/justificar el test de la feature 10 en una discusión aparte; si no, revertir a `<article class="latest-articles__card">`. La suite completa debe quedar en verde.
3. **Actualizar `progress/impl_17_article-card-images.md` y `progress/current.md`** para que reflejen el estado real en disco (suite 140/144 y `./init.sh` en rojo al cierre del ciclo), y registrar el resultado del nuevo ciclo rojo/verde una vez aplicados los cambios.

## Notas (no bloqueantes)

1. La parte CSS está impecable (regla correcta, tokens, ≤100 líneas, bundle verificado); el problema es exclusivamente que el cambio del componente no está en disco y hay una regresión `<article>`→`<a>`.
2. `tokens.css` sin cambios de la feature 17 (REQ-17-09 ✔) — correcto, no requiere acción.
3. El test de la feature (217 líneas) es de buena calidad: mapea 1:1 a REQ-17-01..09 + Decisión 4 y reproduce de forma fiable el estado rojo. No requiere cambios.

## Conclusión

La mitad CSS de la feature (REQ-17-02/03/04/05/08/09) está correcta y verificada, pero la mitad componente (REQ-17-01/06/07) **no está aplicada en disco**, el test de la feature está en rojo, la suite completa da 140/144 y `./init.sh` termina en rojo, además de romper REQ-10-01 de una feature previa. No se puede aprobar con tests rojos ni con `./init.sh` en rojo. **CHANGES_REQUESTED.**

---

# Ronda 2 (2026-08-12)

**Veredicto:** APPROVED

**Re-revisado por:** agente revisor (nivel 1) — verificación independiente en disco tras la feature 20 `latest-articles-restore` (APPROVED en `progress/review_20_latest-articles-restore.md`)

**Spec:** `specs/17_article-card-images/requirements.md` (REQ-17-01..09) + `design.md` (Decisiones 1-7)
**Informe del implementer actualizado:** `progress/impl_17_article-card-images.md` §7 "Cierre tras feature 20 (re-review)"
**Estado en `feature_list.json`:** feature 17 `in_progress` (correcto en fase de re-review; el cierre a `done` lo decide el líder)

## 1. Verificación de los 3 cambios requeridos (evidencia en disco)

### Cambio 1 — Aplicar en disco `<img>` con clase/alt/loading (REQ-17-01/06/07) — ✅ RESUELTO

`src/components/latest-articles.astro:13-18` (edit Ronda 2, leído en disco):

```
<img
  class="latest-articles__image"
  src={`/assets/content/${post.img}`}
  alt={post.title}
  loading="lazy"
/>
```

- Clase `latest-articles__image` ✔ (REQ-17-01), referencia `post.img` ✔ (REQ-17-01), `alt={post.title}` ✔ (REQ-17-06), `loading="lazy"` ✔ (REQ-17-07).
- Sin `post.data.*`: `git diff` del componente muestra `post.data.img`/`post.data.title` reemplazados por `post.img`/`post.title`.
- Los 3 tests que fallaban en ronda 1 (`REQ-17-01`, `REQ-17-06`, `REQ-17-07`) pasan ahora (ver §3).

### Cambio 2 — Resolver la regresión `<a class="latest-articles__card">` → `<article>` (REQ-10-01) — ✅ RESUELTO

`src/components/latest-articles.astro:12` = `<article class="latest-articles__card">`. Sin `<a>` y sin enlaces muertos: grep en el componente → 0 `href=`, 0 `</a>`, 0 `/posts` (el único match de `<a` es el falso positivo `<article`). El marcado semántico de REQ-10-01 (Decisión 1) está íntegro: `<h2>` título, `<p class="latest-articles__meta">Por {post.author} • {post.readtime} min de lectura</p>`, `<p>` descripción, `<div>` de tags con `<span>#{tag}</span>` por tag. El test `REQ-10-01 (Decisión 1)` pasa (ver §3).

### Cambio 3 — Actualizar `impl_17` y `current.md` al estado real — ✅ HECHO

- `progress/impl_17_article-card-images.md` §7 (2026-08-12) documenta el estado real en disco: cambio del `<img>` RESUELTO (mtime/reescritura por la feature 20), regresión `<a>` RESUELTO (componente restaurado sin anchor), verificación de contrato `tests/article-card-images.test.mjs` → `# tests 11 / # pass 11 / # fail 0`.
- `progress/current.md` líneas 20-30: nota de re-review de la feature 17 con el estado de los 3 cambios.

## 2. Pregunta de revisión (test-first, rojo → verde)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?**

Sí — ciclo completo evidenciado y verificado en disco:

- **ROJO:** `impl_17` §1 documenta el test `tests/article-card-images.test.mjs` escrito PRIMERO contra la spec y observado en rojo (7 fail / 4 pass con salidas reales: `<img src={`/assets/content/${post.img}`} alt=""/>` sin clase/alt/loading y sin regla CSS). El reviewer de ronda 1 lo reprodujo (8/11 y 3 fallos REQ-17-01/06/07).
- **VERDE (esta revisión, en disco):** `node --test tests/article-card-images.test.mjs tests/articles-ui-refactor.test.mjs` → **20 tests, 20 pass, 0 fail** (salida TAP completa): 11/11 del contrato REQ-17-01..09 + 9/9 de REQ-10-01..04 (feature 10 sin regresión).
- **Dependencias:** la feature 17 se apoya en las features 7 (posts-domain) y 10 (articles-ui-refactor), ambas `done`; la restauración vino de la feature 20, cuya `depends_on: [18]` (posts-domain-restore) está `done`. Ninguna dependencia pendiente saltada.

## 3. Suite de contrato en verde (confirmada)

```
$ node --test tests/article-card-images.test.mjs tests/articles-ui-refactor.test.mjs
1..20
# tests 20
# pass 20
# fail 0
```

- `tests/article-card-images.test.mjs` (REQ-17-01..09 + Decisión 4) → **11/11** ✔.
- `tests/articles-ui-refactor.test.mjs` (REQ-10-01..04, feature 10) → **9/9** ✔ (incluidos REQ-10-01 y REQ-10-01 Decisión 1: marcado semántico y `PostsRepository`).

## 4. CSS y tokens (REQ-17-02..05/08/09) — intactos y correctos

- `src/styles/latest-articles.css` (75 líneas, ≤100): regla `.latest-articles__image` (líneas 47-55) con `display: block`, `width: 100%`, `aspect-ratio: 16 / 9`, `object-fit: cover`, `border-radius: var(--radius-card)`, `border: 1px solid var(--color-border)`, `margin: var(--gap-card) 0`. Sin hex ni rgb()/rgba() en la regla. `git diff --stat` → **sin cambios** respecto a HEAD (no se tocó en las features 17/20).
- `src/styles/tokens.css` (96 líneas, REQ-17-09): sin tokens nuevos (`git diff --stat` vacío; sin `--aspect-`, `--ratio-`, `--radius-image`).
- `node scripts/check-format.mjs` → `FORMATO ✔` · `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.

## 5. Estado de `./init.sh` (ejecutado en esta revisión)

**`./init.sh` NO termina en verde global — 2 comprobaciones rojas, ambas por piezas FUERA del alcance de la feature 17:**

1. **`tests al 100%`:** suite completa `node --test "tests/**/*.test.mjs"` → 152 tests, **150 pass, 2 fail**. Los 2 fallos son de features **ajenas y pendientes**: `REQ-11-05` (feature 21 `ssr-cloudflare-align`) y `REQ-01-05` (feature 23 `harness-docs-alignment`). **Cero fallos del contrato 10/17**.
2. **`build de producción`:** responde a `check-format` ✔, pero rojo por `src/pages/posts/[id].astro:2,7` (página creada por el usuario, no del arnés) que importa/usa `markdownPostRepository`, API eliminada por REQ-18-05 → `MISSING_EXPORT`. Hallazgo canalizado aparte por el líder (features 21/24 o limpieza).

Formato y guard de tokens pasan. Los rojos de `./init.sh` que en ronda 1 eran **imputables a esta feature** (3 fallos REQ-17-01/06/07 + regresión REQ-10-01) **ya no existen**: el contrato 10/17 está en verde.

## 6. Conformidad con `docs/architecture.md` y `docs/conventions.md`

- **Regla 7 (estilos separados):** sin `<style>` ni `style=` en el componente (tests de convención REQ-17-08 y REQ-10-03 lo aseveran y pasan).
- **Regla 8 (lógica separada de la UI):** frontmatter solo imports (estilos → dominio) + `const posts = await new PostsRepository().getPosts()`; sin `function`/`if`/`for`.
- **Regla 12 (≤100 líneas):** componente 29-30, hoja 75, tokens.css 96 — todos dentro del límite.
- **Regla 6 (tokens, no valores sueltos):** la regla de la imagen solo consume `var(--radius-card)`, `var(--color-border)`, `var(--gap-card)`; `aspect-ratio: 16/9` justificado en design.md (Decisión 2) y verificado por test.
- **Convenciones:** BEM (`latest-articles__image`), orden de imports correcto, sin hex/rgba.

## 7. Checkpoints (CHECKPOINTS.md, estado re-evaluado en ronda 2)

- C1 (estilos separados de la UI): [x]
- C2 (sin lógica en UI): [x]
- C3 (datos vía repositorio): [x]
- C4 (tokens, no valores sueltos): [x]
- C5 (≤100 líneas por archivo): [x]
- C6 (sin dependencias externas): [x]
- C7-8 (datos válidos, errores nombrados): [x]
- C9 (init.sh verde): [ ] ← Razón: `./init.sh` queda en rojo por 2 piezas ajenas a esta feature — (a) 2 tests residuales de las features 21 (REQ-11-05) y 23 (REQ-01-05), ambas `pending` en backlog; (b) build roto por `src/pages/posts/[id].astro` (página del usuario canalizada aparte). El contrato 10/17 (20/20) está verde. El leader me instruyó explícitamente no bloquear por ello.
- C10 (UI desktop/móvil): [x] — `width: 100%` + `aspect-ratio` + `object-fit: cover` escalan en todos los breakpoints (Decisión 7); la regla está aplicada a un `<img>` que ahora SÍ lleva la clase en disco.
- C11 (feature_list.json): [x] — feature 17 `in_progress` (correcto en fase de re-review).
- C12 (current.md documenta): [x] — `progress/current.md` y `impl_17` §7 reflejan el estado real en disco.
- C13 (sin temporales/debug/TODOs): [x]

## 8. Observaciones (fuera del veredicto)

1. **`src/pages/posts/[id].astro` (creado por el usuario) — CONFIRMADO como hallazgo aparte.** Existe (commit manual `72e5c52`), en la línea 2 importa `markdownPostRepository` y en la 7 lo usa dentro de `getStaticPaths()` → `MISSING_EXPORT` en el build. Fuera del alcance de la feature 17; no lo toco ni bloqueo por ello, queda para las features 21/24 o limpieza por el líder.
2. El componente no termina en nueva línea final (nota de estilo menor ya observada en `review_20` §7.2; sin impacto funcional ni de contrato — REQ-17-08 pasa).
3. La feature 17 queda habilitada para cierre: el contrato REQ-17-01..09 (11/11) y el de la feature 10 (9/9) están verdes; `git diff` confirma que la hoja CSS y tokens.css no se tocaron en la restauración.

## Conclusión

Los 3 cambios requeridos en ronda 1 están verificados en disco y los tests de la feature en verde: el `<img>` lleva clase/`alt={post.title}`/`loading="lazy"`, la card volvió a `<article>` sin enlaces muertos, y los informes reflejan el estado real. El contrato de las features 17 y 10 pasa 20/20 y los rojos de `./init.sh` son exclusivamente ajenos (features 21/23 pendientes + página del usuario `[id].astro` canalizada aparte). La evidencia test-first (rojo → verde) del ciclo completo queda documentada. **APPROVED.**
