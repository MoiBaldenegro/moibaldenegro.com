# Review — feature 37

**Veredicto:** APPROVED

Feature: `focus-visible-global` (spec `specs/37_focus-visible-global/`; la carpeta
`specs/37_visual-polish-refactor/` es histórica y no se revisa). Implementó el líder en rol
de implementer por autorización humana explícita; revisado con el mismo rigor.

## Verificación contra la spec
- REQ-37-01: `src/styles/layout.css:63-66` `:where(a, button, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`. Cumple.
- REQ-37-02: `src/styles/search-bar.css:29-31` `.search-bar__input:focus` conserva el refuerzo de borde y ya no declara `outline: none`. Cumple.
- REQ-37-03: `grep outline src/styles/` solo devuelve anillos de acento (code-copy.css:36, latest-articles.css:91, layout.css:64); ninguna anulación. Cumple.
- REQ-37-04: `search-bar.css:40-43` `display: grid; place-items: center; width: 32px; height: 32px`. Cumple.
- REQ-37-05: `search-bar.css:13` padding derecho 42px (>= 40px); el × (right 6px + 32px = 38px) queda dentro de ese hueco. Cumple.
- REQ-37-06: solo `var(--color-accent)`, `var(--color-text-secondary)`, `var(--radius-pill)`; sin hex/rgba. Cumple.
- REQ-37-07: `progress/impl_37.md` documenta el rojo previo (4 fallos / 3 pases, REQ-37-05 ya cumplía) y el verde final; también el falso arranque por SyntaxError en el helper del test, corregido antes del rojo real. Cumple.
- REQ-37-08: layout.css 89, search-bar.css 81, tests/focus-visible-global.test.mjs 62 líneas. Cumple.
- REQ-37-09: `./init.sh` en verde (formato, tests al 100%, build). `node --test tests/focus-visible-global.test.mjs`: 7/7. Cumple.
- Dependencias: la feature 37 no tiene `depends_on`; no se saltó ninguna.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 (sin lógica en UI): [x] (la feature solo toca CSS)
- C3 (sin JSON leído desde componentes): [x] (no aplica, sin cambios)
- C4 (solo tokens): [x]
- C5 (<= 100 líneas): [x]
- C6 (sin dependencias nuevas): [x]
- C7 (datos válidos / errores nombrados): [x] (no aplica, sin cambios)
- C8 (`./init.sh` en verde): [x]
- C9 (vista correcta en desktop/móvil): [ ]  <- No verificado en navegador por el reviewer (también lo anota impl_37.md). No bloquea: se valida por inspección estática.
- C10 (feature en `done`): [ ]  <- Sigue en `in_progress`; el cierre lo hace el líder tras este APPROVED.
- C11 (progress al día): [x]
- C12 (sin temporales ni debug): [x]

## Observaciones (no bloqueantes)
1. `src/styles/layout.css:60` el comentario dice «features 37 y 37-focus-visible-global»; es correcto pero ambiguo, convendría «feature 37 visual-polish-refactor (histórica) y 37 focus-visible-global».
2. El diff de layout.css incluye `.visually-hidden` (líneas 78-89), que pertenece a la feature 36 (ya APPROVED); no se re-revisa.
3. El test REQ-37-03 solo inspecciona reglas de primer nivel con `:focus` en el selector; suficiente hoy, pero no detectaría `outline-style: none` ni anulaciones dentro de `@media`.

## Cambios requeridos
Ninguno.
