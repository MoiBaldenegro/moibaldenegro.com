# Informe de implementación — feature 37 focus-visible-global

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/37_focus-visible-global/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/styles/layout.css` | `a:focus-visible` → `:where(a, button, input, select, textarea, [tabindex]):focus-visible` con `outline: 2px solid var(--color-accent)` y `outline-offset: 2px` (REQ-37-01). El test histórico REQ-37-04 (visual-polish-refactor) sigue en verde. |
| `src/styles/search-bar.css` | `.search-bar__input:focus` conserva el refuerzo de borde y **ya no** anula el outline (REQ-37-02/03). `.search-bar__clear`: `display: grid; place-items: center; width/height: 32px`, `right: 6px` y `border-radius: var(--radius-pill)` (REQ-37-04/06). El input mantiene `padding: 10px 42px 10px 18px` (≥ 40px a la derecha, REQ-37-05). |
| `tests/focus-visible-global.test.mjs` (NUEVO) | Inspección de las hojas: regla global, ningún `:focus*` con outline none/0 en `src/styles/*.css`, × 32x32 centrado, padding derecho ≥ 40px, sin colores sueltos, ≤ 100 líneas. |

## Ciclo rojo/verde (REQ-37-07)

La primera versión del test no cargaba (`SyntaxError` por un escape de regex mal formado en el helper
del propio test); se reescribió el helper sin construir regex. Rojo real antes de tocar `src/`:

```
✖ REQ-37-01: regla de foco global con :where y tokens
✖ REQ-37-02: search-bar.css no anula el outline
✖ REQ-37-03: ninguna regla :focus/:focus-visible anula el outline
✖ REQ-37-04: × de 32x32 con el glifo centrado
✔ REQ-37-05 (el padding de 42px ya cumplía) · ✔ REQ-37-06 · ✔ REQ-37-08
ℹ pass 3 / ℹ fail 4
```

Tras implementar, REQ-37-02 siguió en rojo porque un comentario nuevo contenía el texto literal
«outline: none»; se reformuló. Verde — `pnpm test`: 610/610. `./init.sh`: formato ✔, tests ✔, build ✔.

## Nota

- El × crece de ~9x16 px a 32x32 px dentro del input; con `right: 6px` queda dentro de los 42px de
  padding derecho. Verificación visual en navegador pendiente (sin producción, dominio NXDOMAIN).
