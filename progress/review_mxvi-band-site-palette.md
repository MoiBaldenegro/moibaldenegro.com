# Review — feature 7

**Veredicto:** APPROVED

Feature 7 `mxvi-band-site-palette` (depends_on [6], la 6 está en `done`). Revisión del
2026-11-02 contra `specs/07_mxvi-band-site-palette/` (requirements.md y design.md),
`docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `<style>` en `.astro`: [x] (`src/components/mxvi-logos-banner.astro` no se tocó y no tiene `<style>` ni `<script>`)
- C2 Sin lógica en la UI, frontmatter solo importa y pasa datos: [x]
- C3 Datos solo vía `src/domain/repositories`: [x] (`MxviLogosRepository().getLogos()`)
- C4 Colores desde `tokens.css`, sin valores hardcodeados: [x] (`mxvi-logos-banner.css` L11-13, L37, L48-49 usan solo `--color-hero-mid`, `--color-hero-top`, `--color-glow`, `--color-border`, `--color-accent`, `--gap-card`; no hay hex, rgb ni rgba. `grep` de `--color-mxvi-band-*` en `src/` y `scripts/`: 0 coincidencias)
- C5 <=100 líneas por archivo: [x] (css 63, tokens 99, test nuevo 83, test feature 6: 99)
- C6 Sin dependencias nuevas: [x]
- C7 Datos JSON válidos y repositorios con errores nombrados: [x] (no se tocaron)
- C8 `./init.sh` en verde: [x] (lo ejecuté yo: entorno, formato, tests al 100% y build en verde, "El entorno está perfecto")
- C9 Página correcta en desktop y móvil sin errores de consola: [x], con una observación fuera de alcance (ver más abajo)
- C10 Harness: [x] para la revisión. La feature sigue en `in_progress` y `progress/current.md` tiene la bitácora. El líder la pasa a `done` y cierra la sesión.
- C11 Sin temporales ni debug: [x]

## TDD (rojo y verde)
- Reproduje el rojo yo mismo: ejecuté `tests/mxvi-band-site-palette.test.mjs` contra `mxvi-logos-banner.css`, `tokens.css` y el test de la feature 6 de `HEAD`. Salió 5 fail y 4 pass, con los mismos tests que cita `progress/impl_mxvi-band-site-palette.md` §2: fallan 01/02, 03/04, 06, 07/08 y 09. Los 4 que pasan (05, 10, 11, 14) son guardas de regresión, y está justificado.
- Verde: la suite completa pasa con `./init.sh`.
- `tests/mxvi-logos-banner.test.mjs`: solo se retiraron las aserciones de tokens azules (diff en L57-58 y L89-90), tal como pide el design.

## Intención del humano (verificada)
- Ya no es la banda azul de Apple. Uso `linear-gradient(90deg, hero-mid, hero-top, hero-mid)` con un `radial-gradient` de `--color-glow` encima. En el navegador se ve morado oscuro y apagado, como continuación del hero. No es un bloque brillante. Capturas en `progress/research/mxvi-band-site-palette-review/band-{375,768,1280}px.png`.
- Los tokens azules se eliminaron de `tokens.css`. Se conservan `--space-mxvi-band`, `--opacity-logo-band` y `--opacity-logo-band-hover`.
- Borde fino `1px solid rgba(255,255,255,.08)` arriba y abajo (valor calculado).
- Full-bleed: la banda mide 100vw en los 3 anchos y `scrollWidth` es igual al ancho de cliente, así que no hay scroll horizontal. Dentro no hay texto ni otros elementos (0 `button/p/h*/span/img`, `innerText` vacío). Solo hay 4 enlaces, con `target=_blank`, `rel="noopener noreferrer"`, `aria-label` y href del repositorio.
- Columnas: 2 a 375 y 768 px y 4 a 1280 px. Los logos se ven completos.
- Hover y focus de teclado (Tab real por CDP; `:focus-visible` es true): `drop-shadow(rgb(179,122,194) 0 0 7px)` más el outline blanco de 2px. Capturas `band-hover-1280px.png` y `band-focus-1280px.png`.
- Con `prefers-reduced-motion: reduce` y hover, se queda `transform: none` y se mantienen la opacidad 1 y el halo.
- Medidas en `progress/research/mxvi-band-site-palette-review/review-medidas.json`.

## Observaciones (no bloqueantes, fuera del alcance de la feature 7)
1. Consola: en `/home/` sale un único error, un 404 de `/assets/content/api-auth.webp`. La imagen la pide `src/content/posts/systems-design/07-auth-api-design.md`, que viene del commit e8926ca y no tiene relación con la cinta. Conviene abrir una feature aparte.
2. `mxvi-logos-banner.css` L23 (`gap: clamp(18px, 5vw, 72px)`) y L61-62 (`gap: 16px 24px`, `height: 64px`) tienen espaciados literales que vienen de la feature 6. Esta feature no los tocó y no son colores, así que no la bloquean. Si se quiere cumplir la regla de tokens también en espaciados, habría que abrir una feature aparte.

## Cambios requeridos (si aplica)
Ninguno.
