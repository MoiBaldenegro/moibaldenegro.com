# Informe de implementación — feature 51 header-mobile-reflow

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/51_header-mobile-reflow/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/styles/tokens.css` (93 → 95 líneas) | Token aprobado por el design `--header-height: 74px` con su comentario (REQ-51-01). |
| `src/styles/layout.css` (93 líneas) | `.site-navbar nav`: `height: 74px` → `min-height: var(--header-height)`, la barra crece cuando el buscador baja de línea en móvil (`flex-wrap` de search-bar.css) en vez de desbordarse (REQ-51-02). `html { scrollbar-gutter: stable; scroll-padding-top: var(--header-height); }` (se reutiliza la regla `html` existente en lugar de duplicar el selector) (REQ-51-03). `@media (max-height: 500px) { .site-navbar { position: static; } }` (REQ-51-04). Para respetar el límite de 100 líneas, la utilidad `.visually-hidden` (feature 36) se compacta en una sola regla sin cambiar sus declaraciones (REQ-36-08 sigue en verde). |
| `tests/header-mobile-reflow.test.mjs` (NUEVO) | Token, altura mínima sin altura fija, `scroll-padding-top` y la media query de viewport bajo. |
| 5 tests de conteo de `tokens.css` + `tests/video-desktop-width.test.mjs` (REQ-16-09) | Conteo 93 → 95 con la justificación del token `--header-height` en cada archivo (precedente REQ-43-06, igual que la feature 16 con `--video-max-width`); el meta-test exige ahora 95 y la mención a `--header-height`. |

## REQ-51-05 — verificación en navegador a 320 px y con zoom 400 %

Verificado con **Chrome headless** (Chrome instalado en la máquina) controlado por el protocolo
DevTools desde Node, contra `astro preview` (workerd local), en `/posts/03-principios-solid/`.
Emulación con `Emulation.setDeviceMetricsOverride`; medidas con `getBoundingClientRect()` y
`getComputedStyle()`; captura de cada caso revisada a ojo.

| Caso | Header (top→bottom) | `position` | Buscador (top→bottom, ancho) | `main` empieza en | Scroll horizontal |
|---|---|---|---|---|---|
| 320×640 (móvil vertical) | 0 → 137 px | `sticky` | 94 → 136 px, x 8–312 | 137 px | no |
| Zoom 400 % sobre 1280×720 (= 320×180 CSS, escala 4) | 0 → 137 px | **`static`** (media query ≤ 500 px de alto) | 94 → 136 px, x 8–312 | 137 px | no |
| 1280×800 (escritorio, control) | 0 → 75 px | `sticky` | 16 → 58 px (en línea, a la derecha) | 75 px | no |

Conclusión: a 320 px el header crece de 74 a 137 px (`min-height`) y el buscador queda **dentro** de su
caja (termina en 136 < 137); el `main` empieza justo debajo, sin solaparse. Con zoom 400 % la barra
deja de ser sticky y no tapa el contenido. En escritorio el aspecto es el mismo que antes (74 px de nav).
`scroll-padding-top` resuelto: 74 px en los tres casos.

Observaciones fuera del alcance (anotadas también por el reviewer):
- A 320 px en vertical la barra sticky mide 137 px y el `scroll-padding-top` es 74 px: al saltar a un
  ancla quedan ~63 px del encabezado bajo la barra. Cumple REQ-51-03 literalmente; mejorarlo (padding
  mayor bajo 768 px) sería una feature nueva.
- A 320 px el logo toca el borde superior de la barra (el nav no tiene padding vertical al partirse en
  varias líneas). Cosmético.

## Ciclo rojo/verde (REQ-51-06)

Rojo: ✖ 51-01 · ✖ 51-02 · ✖ 51-03 · ✖ 51-04 · ✔ 51-07 (`ℹ pass 1 / ℹ fail 4`). Durante la
implementación, REQ-51-03 siguió en rojo porque ya existía `html { scrollbar-gutter: stable; }` y el test
lee la primera regla `html`; se unió `scroll-padding-top` a esa regla. Tras el token, fallaron los 5 tests
de conteo y el meta-test REQ-16-09 (esperado) y se actualizaron. Verde — `pnpm test` 704/704 (×2);
`./init.sh` verde.

## Ronda 2 — cambio requerido de progress/review_51.md

La sección REQ-51-05 decía «no verificada en navegador» aunque en la máquina hay Chrome y Edge. Se hizo la verificación real (arriba) y se sustituyó el razonamiento por lo observado. Sin cambios de código ni de tests.
