# Review — feature 14 (fix-navbar-jump)

**Veredicto:** APPROVED

**Fecha:** 2026-08-20 · **Reviewer:** nivel 1 · **Base:** informe
`progress/impl_14_fix-navbar-jump.md`, spec `specs/14_fix-navbar-jump/`
(REQ-14-01..05 + design.md), análisis `progress/research/navbar-home-logo-jump.md`
(Problema B, decisión D4).

## Verificación en disco (independiente del informe)

- `src/styles/layout.css` (75 líneas, ≤100 OK): la regla
  `html { scrollbar-gutter: stable; }` está en L12, en la sección «Reset
  global» tras `html, body { ... }`, con comentario contextual (L7-11) que
  documenta la causa raíz (scrollbar estilizado 10px que aparece/desaparece
  con ClientRouter entre páginas de alturas distintas → viewport se
  ensancha/estrecha ~5px) y la degradación (REQ-14-04).
- `git diff HEAD -- src/styles/layout.css` = **exactamente** +6 líneas
  (comentario + regla): sin tokens nuevos, sin `overflow-y: scroll`, sin
  cambios en las reglas `::-webkit-scrollbar` (conservadas en L68-70 con
  width 10px, thumb/track con `--color-scrollbar-thumb` /
  `--color-scrollbar-track`).
- `tests/fix-navbar-jump.test.mjs` (nuevo, 150 líneas, patrón node:test +
  stdlib de los tests de inspección CSS existentes): 6 tests que cubren
  REQ-14-01/02 (regla html con scrollbar-gutter stable), design.md D1 (vigila
  que no aparezca la alternativa descartada `overflow-y: scroll`), REQ-14-03
  (≤100 líneas + tokens exclusivos), REQ-14-04 (`::-webkit-scrollbar`
  conservadas) y REQ-14-05 (recorrido recursivo de `src/` verificando que
  `scrollbar-gutter` vive solo en layout.css).
- `git status`/`git diff` (feature 14): NO se tocó `src/layouts/Layout.astro`
  (el diff de Layout.astro es la retirada del logo de la feature 13, ya
  APPROVED en `progress/review_13_remove-navbar-logo.md`), NO se tocó
  `src/pages` (status limpio), no hay JS de runtime (grep propio del reviewer:
  `scrollbar-gutter|overflow-y` → única coincidencia en `src/` es
  layout.css L12).

## Pregunta de revisión: test-first rojo → verde

- Rojo documentado en el informe (L60-79): `node --test` con el test nuevo
  antes de la implementación → 4 fallos, exactamente los tests que dependen
  de la regla `html { }` ausente, y 2 verdes invariantes (≤100 líneas y
  `::-webkit-scrollbar` conservadas). El bug del helper `listFiles` del test
  6 se corrigió en el propio test antes de implementar (transparencia
  documentada); el rojo resultante es limpio y válido.
- Verde re-verificado por el reviewer: `node --test tests/fix-navbar-jump.test.mjs`
  → 6/6 pass, 0 fail. `./init.sh` ejecutado por el reviewer → entorno OK,
  formato OK, tests al 100%, build de producción OK.
- Dependencias: `depends_on: []` → no hay dependencias pendientes que saltar.

## Justificación por REQ

- **REQ-14-01** — ✅ El selector `html` (L12) reserva el hueco del scrollbar
  vertical con `scrollbar-gutter: stable` (test 1).
- **REQ-14-02** — ✅ La reserva permanente del hueco mantiene estable el ancho
  del viewport al navegar entre páginas de alturas distintas (mecanismo
  asercionado por el test 1 y razonado en el research D4).
- **REQ-14-03** — ✅ layout.css declara la reserva en el selector html; 75
  líneas ≤ 100 (test 3); sin valores de color/radio/borde/transición sin
  token en la regla (test 4: sin hex, sin rgb()/rgba()).
- **REQ-14-04** — ✅ Las reglas `::-webkit-scrollbar` existentes (width 10px,
  thumb/track con tokens) se conservan intactas (test 5); los navegadores sin
  soporte de `scrollbar-gutter` conservan el comportamiento actual (degradación
  elegante documentada en el comentario y en el design.md).
- **REQ-14-05** — ✅ Cero JS de runtime: grep del reviewer + test 6
  (recorrido recursivo de `src/`) confirman que `scrollbar-gutter` solo existe
  en `src/styles/layout.css`.

## Cumplimiento de convenciones

- Estilos en `src/styles/*.css`; sin `<style>` en `.astro` (nada tocado en
  componentes/páginas/layout).
- Estático por defecto: sin scripts ni módulos de cliente nuevos (REQ-14-05).
- Tokens: la nueva regla es propiedad de layout (no color/radio/transición);
  no introduce valores sueltos (test 4).
- ≤100 líneas: layout.css en 75. El archivo de test (150 líneas) sigue el
  precedente establecido del repo: la regla de ≤100 aplica a `src/` y
  `scripts/`, no a tests (nota ya recogida en el review de la feature 13).
- Spec EARS estricto (una línea = un SHALL); design.md presente (toca
  presentación, precedente feature 11).
- Sin dependencias externas; sin `dist/` editado; cierre limpio (sin
  temporales, sin debug, sin TODOs).

## Checkpoints

- C1: [x]
- C2: [x]
- C3: [x]
- C4: [x]
- C5: [x]
- C6: [x]
- C7: [x]
- C8: [x]
- C9: [x]  ← `./init.sh` ejecutado por el reviewer en verde (formato, tests
  al 100%, build OK).
- C10: [ ] ← Razón: inspección visual desktop/móvil pendiente (la deja el
  propio CHECKPOINTS como no verificada por el reviewer; requiere navegador;
  el fix es CSS-only de reserva de hueco, sin regresión esperada).
- C11: [ ] ← Razón: `feature_list.json` conserva la feature 14 en
  `in_progress`; el marcado a `done` es el paso posterior del líder tras la
  aprobación (flujo normal del arnés, no un defecto de la feature).
- C12: [x] ← `progress/current.md` documenta la sesión y el informe `impl_14`
  queda como artefacto permanente.
- C13: [x]

## Cambios requeridos

Ninguno.