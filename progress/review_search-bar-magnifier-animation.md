# Review — feature 114

**Veredicto:** APPROVED

Alcance revisado (solo la 114): `src/components/search-bar/search-bar.astro` (33 líneas),
`src/styles/search-bar-icon.css` (nuevo, 63), `src/styles/search-bar.css` (90; solo
`padding: 10px 42px 10px 42px` en la línea 13), `tests/search-bar-magnifier-animation.test.mjs`
(nuevo, 98). Ajenos no evaluados: `public/assets/svg/sprite.svg`,
`src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`.
`search-bar.ts`, `search-live/*`, `search-escape/*` y `package.json` sin cambios (git status).
`depends_on: []`, sin dependencias pendientes.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en el .astro: [x] (hoja importada en search-bar.astro:3).
- C2 Sin lógica en UI / sin JS nuevo: [x] (el `<script>` de la línea 29-33 es el previo; estado «hay texto» por `:placeholder-shown` + `:has()`).
- C3 Ningún componente lee JSON directamente: [x] (no aplica).
- C4 Tokens: [x] — colores solo `--color-text-secondary`, `--color-accent`, `--color-glow`, `--transition-default`; 0 hex/rgb en search-bar-icon.css. Los literales px (16px, 4px del halo, 42px) los fija la spec (REQ-114-07, design.md Decisión 3) y siguen el precedente de search-bar.css (`10px 42px`); no hay tokens nuevos.
- C5 <= 100 líneas: [x] (33 / 63 / 90 / 98).
- C6 Sin dependencias externas: [x].
- C7 `src/data/*.json` válido: [x] (no tocado).
- C8 Repositorios con errores nombrados: [x] (no tocado).
- C9 `./init.sh` verde: [x] — ejecutado por el reviewer: exit 0, formato, tests 100 %, build; `dist/client/index.html` = 40 562 B (< 42 000 B, REQ-114-10).
- C10 Correcta en desktop y móvil sin errores de consola: [x] — verificación propia (ver abajo), 0 errores/excepciones.
- C11 Feature en `done`: [ ] ← la marca el líder tras este APPROVED (ahora `in_progress`, correcto).
- C12 progress al día: [x] (informe completo en progress/impl_search-bar-magnifier-animation.md).
- C13 Sin temporales/debug/TODOs: [x].

## TDD
Rojo documentado (9/10 en rojo antes del código; REQ-114-08 es guarda de regresión y pasa en
rojo a propósito, justificado) y verde 10/10; suite 1178/1178. Correcto.

## Verificación independiente (Chrome headless + CDP, preview propio :4791, ya parado; :4321 intacto)
Scripts y capturas en el scratchpad (`rev114.mjs`, `tab.mjs`, `shots/`).
- 375/768/969: panel (☰ visible), input 347/720/911 px; 970/1024/1280: barra, 240 px.
  Header 65 px y sin scroll horizontal en los 6 anchos; input 41 px; lupa 16x16 a 13 px del
  borde superior, extremo derecho a 32-33 px < padding 42 px (no se solapa con el texto).
- Vacío: rgb(184,184,197), sin animación, borde normal. Foco: accent, scale 1.12, borde accent
  y halo `0 0 0 4px rgba(108,56,122,.35)`. Escribiendo («spring», `Input.insertText`):
  `search-bar-scan:running`, transform cambia entre muestras (rotación ~6deg → ~1deg).
  Texto sin foco: accent, matriz sin escala, `getAnimations()` vacío.
- Reduced-motion (375 y 1280): ningún estado anima (matriz fija scale 1.12), transición 1e-05s.
- Accesibilidad: SVG `aria-hidden="true"`, `focusable="false"`, fuera del orden de tabulación;
  input con `aria-label="Buscar artículos"`; foco por Tab: `:focus-visible` con outline 2px
  solid accent (REQ-37-02 intacto).
- Búsqueda en vivo: «spring» → 1, «api» → 6; × vacía el valor, oculta el panel y deja foco en el
  input; Escape vacía y oculta. Igual tras / → /about → history.back() con ClientRouter a 375 y 1280.
- Consola: 0 errores, 0 excepciones.

## Valoración visual
Capturas de progress/research/search114/ revisadas (vacío, foco, escribiendo, móvil en panel):
la lupa encaja con la paleta, el halo ciruela es suave y el balanceo (±3 px, ±10deg, 1.6 s) es
sutil; no distrae del texto. Cumple la petición humana.

## Observaciones no bloqueantes
1. Con texto y el foco en el botón ×, la lupa también escanea (`:focus-within` del design.md, paso 3). Aceptable.
2. En reduced-motion manda la regla global de layout.css:97 (`!important`) sobre `transition: none`; el efecto es el mismo.

## Cambios requeridos
Ninguno.
