# Informe de implementación — Feature 114: search-bar-magnifier-animation

- Fecha: 2026-10-21. Estado: in_progress (pendiente de reviewer). Sin commits ni subagentes.
- Spec: specs/114_search-bar-magnifier-animation/requirements.md (REQ-114-01..12) y design.md.

## Cambios

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| tests/search-bar-magnifier-animation.test.mjs | Nuevo: 10 tests (REQ-114-01..08, 11, 12) por inspección de componente y hojas | 98 |
| src/components/search-bar/search-bar.astro | Import de search-bar-icon.css + SVG inline `.search-bar__icon` (aria-hidden="true", focusable="false", stroke="currentColor", viewBox 0 0 20 20, círculo r 7 + mango a 45°) dentro del form y antes del input | 33 |
| src/styles/search-bar-icon.css | Nuevo: reposo (--color-text-secondary, absolute left 16px, 16x16, pointer-events none, transition --transition-default); `.search-bar:focus-within` lupa --color-accent + scale(1.12) e input con borde --color-accent + `box-shadow: 0 0 0 4px var(--color-glow)`; `:has(.search-bar__input:not(:placeholder-shown))` lupa ciruela quieta; foco + texto `animation: search-bar-scan 1.6s ease-in-out infinite` (0 → 3px/-10deg → -2px/10deg → 0, con translateY(-50%) y scale 1.12); `@media (prefers-reduced-motion: reduce)` animation none + transition none | 63 |
| src/styles/search-bar.css | Solo `padding: 10px 42px 10px 42px` en `.search-bar__input` (antes 18px a la izquierda) | 90 |

- Sin cambios: search-bar.ts, search-live/*, search-escape/*, tokens.css (lo que aparece modificado en tokens.css es previo, de la 113), package.json, public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md, tests/hack-the-box-sprite.test.mjs.
- Tests heredados: ninguno necesitó ajuste (no hizo falta la nota «Ajuste feature 114 (precedente REQ-43-06)»). focus-visible-global (REQ-37-05, padding derecho >= 40) sigue en verde con 42px.
- Sin JS nuevo, sin tokens nuevos, sin dependencias, sin `outline: none`.

## Ciclo rojo/verde

Rojo (test nuevo antes del código, `node --test tests/search-bar-magnifier-animation.test.mjs`):

```
✖ REQ-114-01: SVG decorativo dentro del form y antes del input
✖ REQ-114-02: stroke currentColor y reposo en --color-text-secondary
✖ REQ-114-03: foco pinta lupa y borde en accent sin anular el outline
✖ REQ-114-04: keyframes search-bar-scan solo con foco y texto
✖ REQ-114-05: con texto sin foco, accent y sin animación
✖ REQ-114-06: reduced-motion anula animación y transición
✖ REQ-114-07: el input reserva 42px a la izquierda (y >= 40 a la derecha)
✔ REQ-114-08: controladores intactos y wiring de astro:page-load
✖ REQ-114-11: solo tokens existentes, sin colores sueltos ni dependencias
✖ REQ-114-12: archivos de la feature <= 100 líneas
ℹ pass 1
ℹ fail 9
```

(REQ-114-08 pasa en rojo a propósito: es guarda de regresión de que los controladores no cambian.)

Verde (mismo test tras implementar): `ℹ pass 10 / ℹ fail 0`.

Suite completa (`pnpm test`): `ℹ tests 1178 / ℹ pass 1178 / ℹ fail 0`.

`./init.sh` (final, exit 0): formato ✔, tests al 100% ✔, build ✔, «El entorno está perfecto».

## Peso (REQ-114-10)

- dist/client/index.html = 40 562 B (< 42 000 B; base ~40 203 B según el análisis, +~360 B del SVG). La hoja nueva va al bundle CSS externo (dist/client/_astro/*.css), no se inlinea en la portada. Cubierto por tests/search-index-lazy-load.test.mjs.

## Verificación Chrome headless + CDP

Build de producción + `astro preview --port 4714` (parado al terminar; el pnpm dev de :4321 no se tocó). Scripts en progress/research/search114/scripts/ (m114.mjs, rm.mjs, lib.mjs); datos en progress/research/search114/cdp114.json; 42 capturas (vacío, foco, escribiendo f0/f1/f2 cada 400 ms, texto sin foco) a 375/768/969/970/1024/1280 y reduced-motion a 1280.

| Estado | Color lupa | Transform | getAnimations() | Input |
|--------|-----------|-----------|-----------------|-------|
| Vacío | rgb(184,184,197) (--color-text-secondary) | translateY(-8px) | [] | borde --color-border, sin sombra |
| Foco | rgb(179,122,194) (--color-accent) | scale 1.12 | [] | borde accent, sombra rgba(108,56,122,.35) 0 0 0 4px, outline 2px solid accent (global REQ-37-02 intacto) |
| Foco + texto | accent | matriz con rotación (en curso) | ["search-bar-scan:running:1600"] | igual que foco |
| Texto sin foco | accent | translateY(-8px), sin escala | [] | borde normal, sin sombra |
| Reduced-motion + texto + foco | accent | scale 1.12 fija | [] | — |

- En los 6 anchos: header 65 px, sin scroll horizontal, padding-left 42px, input 41 px de alto; lupa 16x16 a 16px del borde izquierdo y centrada (13 px arriba).
- Buscador en el panel (botón ☰ visible) a 375/768/969 (input 347/720/911 px) y en la barra a 970/1024/1280 (240 px).
- Búsqueda en vivo: «spring» → 1 resultado, «api» → 6; × limpia (valor "", sin is-filled, panel oculto, foco vuelve al input); Escape limpia (valor "", panel oculto).
- ClientRouter: / → /about/ → history.back() → / a 375 y 1280: animación, en vivo, × y Escape siguen funcionando.
- /search a 1280: estados, × y Escape correctos.
- Reduced-motion: sin animación en ningún estado; transition-duration 0.28s → 1e-05s (la regla global de layout.css con !important manda sobre `transition: none` de la hoja; el efecto es el mismo: sin transición). reduced-motion-transition.json.
- Errores de consola/excepciones: 0 (logs: []).

## Notas para el reviewer

- La animación se aplica con `.search-bar:focus-within`: si el foco está en el botón × con texto, la lupa también escanea (el selector es el de design.md, paso 3).
- Valores creativos por defecto (1.6 s, 3/-2 px, ±10deg, escala 1.12, halo 4 px) revisables por el humano, como indica design.md.
