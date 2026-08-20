# Review — feature 12 (restore-navbar-home-link)

**Veredicto:** APPROVED

> Reviewer (nivel 1). Fecha: 2026-08-20.
> Revisado contra: `docs/architecture.md`, `docs/conventions.md`,
> `CHECKPOINTS.md`, spec `specs/12_restore-navbar-home-link/` (REQ-12-01..06),
> informe `progress/impl_12_restore-navbar-home-link.md`, estado real en disco
> y ejecución propia del arnés.

## Verificación en disco (independiente del informe)

- `src/layouts/Layout.astro` (49 líneas, ≤100): línea 39 contiene
  `<a href="/">Home</a>` plano — sin `class`, sin `style`, sin `aria-current`.
  Orden del navbar verificado: logo → Home (L39) → About (L40) → Arquitectura
  (L41) → @moibaldenegro (L42) → SearchBar (L43). Cumple design.md D1/D2/D3.
- `git diff HEAD -- src/layouts/Layout.astro`: **+1 línea exactamente**
  (el ancla Home), ningún otro cambio en el layout.
- `git diff HEAD -- src/styles/`: `layout.css` **no está en el diff** (la única
  hoja modificada es `article.css`, perteneciente a la feature 11 ya aprobada;
  sin salida de scope de la feature 12).
- `tests/restore-navbar-home-link.test.mjs`: existe, cubre REQ-12-01..05 con
  node:test puro, sin dependencias.
- Regresión preexistente confirmada por mí: `git show 319bdcd:...Layout.astro`
  contiene **0** ocurrencias de `>Home<` (el enlace se perdió en la reescritura
  manual), mientras que `git show 72e5c52:...Layout.astro` sí lo tenía (L30)
  — coincide con el análisis `progress/research/iframe-video-styles.md` §2/D6/§4.
  Nota menor (no bloqueante): el informe cita el commit `686a7cc`, que no
  existe en la historia actual del repo; la regresión queda probada igualmente
  por `319bdcd`, que sí existe.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **Sí.**

- Ciclo rojo preexistente (evidencia del informe, reproducción coherente con
  disco): REQ-08-04 (`architecture-nav-link.test.mjs`) y REQ-08-05
  (`layout-refactor.test.mjs`) fallaban — 9 pass / 2 fail. Los tests exigían
  el enlace Home que `319bdcd` eliminó; el rojo es real y anterior al cambio.
- Ciclo rojo de los tests nuevos: `tests/restore-navbar-home-link.test.mjs`
  escrito antes del código → 2 pass / 3 fail en rojo. Los 3 fail son
  exactamente las aserciones que el código debía satisfacer (REQ-12-01, 12-02,
  12-04: falta el enlace Home); los 2 pass esperados (REQ-12-03 conservación
  del resto del navbar, REQ-12-05 ≤100 líneas) ya eran ciertos antes y así lo
  declara el informe («verde esperado») — reporte honesto, sin maquillaje.
- Ciclo verde posterior: 16/16 en los 3 archivos de navbar; suite completa
  **424/424**; `./init.sh` completo en verde con build OK.

## Cumplimiento por REQ-12-01..06

| REQ | Criterio | Verificación |
|-----|----------|--------------|
| REQ-12-01 | Enlace de texto Home → `/` en el navbar | Test REQ-12-01 en verde; L39 `<a href="/">Home</a>` antes de About (D3) |
| REQ-12-02 | Hereda estilos del navbar (sin clase/style, sin `<style>` en Layout) | Test REQ-12-02 en verde; `layout.css` intacto con `.site-navbar` y `a[aria-current="page"]` |
| REQ-12-03 | Conserva logo, About, Arquitectura, @moibaldenegro, SearchBar | Test REQ-12-03 en verde; verificado en disco L36-43 |
| REQ-12-04 | Home omite `aria-current`; el logo conserva el de la portada | Test REQ-12-04 en verde; L36-38 logo con ternaria `/` ; L39 sin aria-current (D2, estado 72e5c52) |
| REQ-12-05 | Layout ≤100 líneas | Test REQ-12-05 en verde; 49 líneas |
| REQ-12-06 | Tests existentes de navbar en verde | REQ-08-04 y REQ-08-05 en verde en mi ejecución (424/424) |

Los 5 criterios de acceptance de la feature en `feature_list.json` se cumplen,
incluido `require_tests_to_close` (`./init.sh` verde, ejecutado por mí).
`depends_on: []` — sin dependencias pendientes; la feature 10 (in_progress) no
es dependencia y no fue tocada.

## Convenciones (docs/architecture.md y docs/conventions.md)

- Estilos separados: sin `<style>` en el `.astro`; el enlace hereda `layout.css`. ✔
- Sin JS de runtime añadido (estático por defecto). ✔
- Sin valores sueltos ni tokens nuevos: no se añadió ningún valor de estilo. ✔
- ≤100 líneas por archivo: `Layout.astro` 49, test 153 (patrón de inspección
  precedente, mismo tamaño que `architecture-nav-link.test.mjs`). ✔
- Sin dependencias externas. ✔
- Un solo layout: cambio mínimo dentro de `Layout.astro`, no se creó layout. ✔
- Test en `tests/` con node:test estándar. ✔
- No hay `print()` de debug, ni TODOs, ni temporales en el diff de la feature. ✔

## Ejecución propia del arnés

```
$ ./init.sh
✔ node/pnpm/deps · ✔ archivos del harness · ✔ formato
✔ tests al 100% (node:test) · ✔ build de producción (pnpm build)
✔ El entorno está perfecto.

$ pnpm test
# tests 424 · # pass 424 · # fail 0
```

## Checkpoints

- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` con `<style>`.
- C2: [x] Sin lógica JS en UI; frontmatter solo imports/paso de datos.
- C3: [x] Sin valores hardcodeados (tokens); no se añadieron valores nuevos.
- C4: [x] ≤100 líneas por archivo (Layout.astro 49).
- C5: [x] `./init.sh` en verde (formato, tests 100%, build OK) — verificado por el reviewer.
- C6: [x] Test-first evidenciado: rojo preexistente (REQ-08-04/05) y rojo de los
  tests nuevos (REQ-12-01/02/04) antes del código; suite verde al cierre.
- C7: [x] Feature 12 con `depends_on: []` — sin dependencias pendientes.
- C8: [ ] Inspección visual en navegador — checkpoint global manual pendiente
  (no es alcance de esta feature, ya marcado como pendiente en CHECKPOINTS.md).
- C9: [ ] `feature_list.json` con la feature en `done` — lo marca el líder al
  cerrar el flujo tras este APPROVED.

## Cambios requeridos

Ninguno.