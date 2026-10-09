# Informe de implementación — feature 56 reduced-motion

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/56_reduced-motion/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/styles/hero-section.css` (54 líneas) | La animación `float` de `.hero-gradient` solo se declara dentro de `@media (prefers-reduced-motion: no-preference)` (opt-in, REQ-56-01). |
| `src/styles/layout.css` (97 líneas) | Red de seguridad global: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }` (REQ-56-02). |
| `src/styles/hero-card.css`, `src/styles/profile-card.css` | `@media (prefers-reduced-motion: reduce) { .X:hover { transform: none; } }` al final de cada hoja: la anulación vive junto a la regla que anula y gana por orden de fuente dentro de la misma hoja, sin `!important` entre hojas (REQ-56-03). |
| `tests/reduced-motion.test.mjs` (NUEVO) | Animación solo con no-preference, bloque global reduce sobre `*, *::before, *::after`, anulación del hover en ambas tarjetas, ningún `.ts` consulta la media query (REQ-56-04) y ≤ 100 líneas. |

Las view transitions no se tocan: ClientRouter ya las desactiva con reduced-motion (design).

## Verificación en Chrome headless (CDP, `Emulation.setEmulatedMedia`, portada en astro preview)

| `prefers-reduced-motion` | `animation-name` de `.hero-gradient` | `transition-duration` de `.hero-card` |
|---|---|---|
| no-preference | `float` | `0.28s` |
| reduce | `none` | `1e-05s` (0,01 ms) |

## Ciclo rojo/verde (REQ-56-05)

Rojo: ✖ 56-01 · ✖ 56-02 · ✖ 56-03 · ✔ 56-04 (ya sin JS) · ✔ 56-06 (`ℹ pass 2 / ℹ fail 3`).
Verde — 5/5; `pnpm test` 734/734; `./init.sh` verde.
