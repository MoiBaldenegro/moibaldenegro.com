# Review — feature 16

**Veredicto:** APPROVED

## Checkpoints (CHECKPOINTS.md)

### Arquitectura (docs/architecture.md)
- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` contiene `<style>`. (Feature sin cambios en `.astro`.)
- C2: [x] No hay lógica JS en archivos de UI; frontmatter solo importa y pasa datos. (Sin JS: estático por defecto, design.md Decisión 4.)
- C3: [x] Ningún componente lee JSON directamente; todo pasa por `src/domain/repositories`. (Sin cambios en componentes/repositorios.)
- C4: [x] Colores, espaciados, radios y sombras vienen de `src/styles/tokens.css`; no hay valores hardcodeados. (MQ usa solo `var(--video-max-width)` y `var(--gap-card) auto`; token nuevo justificado en tokens.css líneas 78-79.)
- C5: [x] Ningún archivo supera las 100 líneas. (article.css 28, tokens.css 93, post.css 100 exactas.)
- C6: [x] No se añadieron dependencias externas sin discusión previa.

### Datos
- C7: [x] `src/data/*.json` válido y entidades tipadas. (Sin cambios.)
- C8: [x] Repositorios validan y lanzan errores nombrados. (Sin cambios.)

### Verificación
- C9: [x] `./init.sh` termina en verde. (Ejecutado por el reviewer 2026-08-20: formato ✔, tests al 100% ✔, build de producción ✔.)
- C10: [ ] Inspección visual en navegador (desktop/móvil) — pendiente de verificación humana; no verificable por el reviewer automático (ya marcada así en CHECKPOINTS.md).

### Harness
- C11: [ ] `feature_list.json` con la tarea en `done` — la feature 16 queda `in_progress` hasta que el líder cierre el ciclo tras este APPROVED (flujo normal del arnés).
- C12: [x] `progress/current.md` documenta la sesión (feature 16, bitácora y plan marcados) y `progress/history.md` al día.
- C13: [x] No quedan archivos temporales, `print()` de debug ni TODOs sin contexto.

## Justificación por requisito (REQ-16-01..09)

Verificado contra disco y ejecución real (no solo contra el informe):

- **REQ-16-01** — `src/styles/article.css` línea 24 declara `@media (min-width: 769px)`, complementaria del breakpoint móvil 768px existente. Test `REQ-16-01` pasa.
- **REQ-16-02** — dentro de la MQ (líneas 26-27): `max-width: var(--video-max-width)` y `margin: var(--gap-card) auto` sobre `.post__content .video-container`. Test `REQ-16-02/05` pasa.
- **REQ-16-03** — la regla base (líneas 5-12) conserva `width: 100%; max-width: 100%; margin: var(--gap-card)`. El diff git confirma que la regla base NO fue modificada. Test `REQ-16-03/06` pasa.
- **REQ-16-04** — `src/styles/tokens.css` línea 79 declara `--video-max-width: 640px` en el grupo Contenedor, con comentario justificativo (línea 78, precedente `--radius-thumb` feature 9). Test `REQ-16-04` pasa.
- **REQ-16-05** — la MQ usa exclusivamente tokens: el test aserciona `doesNotMatch` de valores sueltos `\d+(px|rem|em|%)` en `max-width` y `margin` del bloque MQ. Pasa. (El ajuste del lookahead negativo durante el verde está documentado en impl_16 y no relaja la aserción: la sustitución por detección de valores sueltos es más robusta con la misma intención.)
- **REQ-16-06** — regla base sin cambios (verificado en diff) y la MQ va DESPUÉS de la regla base (test `REQ-16-01/06` aserciona `mqIndex > baseIndex`). Los 9 tests REQ-11 (`tests/article-iframe-styles.test.mjs`, sin modificaciones en disco) pasan 9/9: el regex `containerRule()` captura la primera ocurrencia y la regla base no cambió (D4 del research).
- **REQ-16-07** — article.css tiene 28 líneas (≤100). Test `REQ-16-07` pasa.
- **REQ-16-08** — `tests/video-desktop-width.test.mjs` (nuevo, 176 líneas) cubre MQ de escritorio, conservación de full-width en móvil, token nuevo y límite de líneas, con trazabilidad REQ en el encabezado.
- **REQ-16-09** — los 5 tests de conteo (article-card-images REQ-17-09, post-page-styles REQ-26-07, post-header REQ-39-09, post-readability REQ-40-11, post-header-horizontal REQ-42-09) actualizan la aserción a 93 con justificación REQ-43-06 y referencia a `--video-max-width` en el encabezado. Verificado por grep en los 5 archivos y por el test `REQ-16-09` (que recorre los 5). Los diffs git confirman que el ajuste se limita al encabezado y a la aserción de conteo: ninguna otra aserción fue tocada.

## Cumplimiento de convenciones

- **Estilos separados de la UI**: el cambio vive en `src/styles/article.css` y `src/styles/tokens.css`; ningún `<style>` ni atributo `style` nuevo.
- **Tokens, no valores sueltos**: `max-width` y `margin` de la MQ solo con tokens; token nuevo `--video-max-width: 640px` justificado (precedente `--radius-thumb`, design.md Decisión 2).
- **Estático por defecto**: cero JS de runtime.
- **≤100 líneas**: article.css 28, tokens.css 93, post.css 100 exactas (sin cambios).
- **Media query al final del archivo CSS** (conventions.md): la MQ es la última regla de article.css.
- **Breakpoint sin solapamiento ni hueco**: `min-width: 769px` complementa los `max-width: 768px` existentes (layout.css, post.css, search-results.css).
- **Sin dependencias externas**: ninguna añadida.
- **Alcance respetado**: `git status` confirma que NO se tocaron `post.css`, `Layout.astro`, `src/pages/posts/[id].astro`, features 14/15 ni `tests/article-iframe-styles.test.mjs`.

## Pregunta de revisión (ciclo rojo/verde)

¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al final? **Sí.** Evidencia en `progress/impl_16_video-desktop-width.md`: en ROJO `node --test tests/video-desktop-width.test.mjs` → 5 fail / 2 pass, con los fallos esperados contra la spec (REQ-16-01 sin MQ, REQ-16-04 sin token, REQ-16-09 sin ajuste de los 5 tests) y los 2 pass esperados (contrato base REQ-16-03/06 y REQ-16-07 intactos); en VERDE 16/16 (feature 16 + REQ-11) y `./init.sh` completo en verde con build OK. El reviewer ejecutó `./init.sh` y los tests específicos (16/16 pass) de forma independiente: confirmado.

## Dependencias

Feature 16 `depends_on [11]` → feature 11 en `done` (verificado en `feature_list.json`). No se saltó ninguna dependencia pendiente.

## Cambios requeridos

Ninguno.

## Notas

- article.css no termina en salto de línea final (heredado del estado previo, línea `}` final sin `\n`); no viola convención documentada y los tests de conteo son robustos a ello. No bloquea.
- C10 (inspección visual) queda pendiente de verificación humana, como estaba marcado en CHECKPOINTS.md; C11 se resolverá cuando el líder cierre la feature tras este APPROVED.