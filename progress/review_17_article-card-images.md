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
