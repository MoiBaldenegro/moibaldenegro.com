# Review — feature 9

**Veredicto:** APPROVED

Feature: `square-corners-sitewide`. Revisión de nivel 1, 2026-11-02.
Spec: `specs/09_square-corners-sitewide/requirements.md` (REQ-09-01..17) y `design.md`.

## Checkpoints
- C1 Estilos solo en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]. `grep -rnE 'radius' src --include=*.astro --include=*.ts` no devuelve nada, y el test REQ-09-12 lo cubre.
- C2 No hay lógica en la UI: [x]. La feature solo cambia CSS y tests.
- C3 Ningún componente lee JSON directamente: [x]. No se toca.
- C4 Radios solo desde tokens: [x]. `src/styles/tokens.css:71` define `--radius-square: 0;` una sola vez. `grep -rnE 'radius' src --include=*.css | grep -v 'var(--radius-square)'` solo devuelve esa definición y dos comentarios de cabecera (`search-bar.css:3`, `search-results.css:3`) que nombran el token nuevo. No queda ningún `50%`, px, rem ni `0` literal, ni radios asimétricos: `.hero-card::after` en `hero-card.css:34`, `.verified`, `::-webkit-scrollbar-thumb`, `.promo-tile`, `.about-philosophy__quote` y `.about-timeline__result` usan `var(--radius-square)`. `grep -rnE 'radius-(card|pill|thumb)' src tests` no devuelve nada. Fuera de `src/styles` no hay ninguna hoja `.css`. El `rx="1.5"` de `code-copy.ts` se conserva, como dice REQ-09-13.
- C5 Archivos de 100 líneas o menos: [x]. Los más largos son `post.css` y `tests/square-corners-sitewide.test.mjs`, con 100 cada uno, y `layout.css`/`post-header.css`, con 99. `tokens.css` pasa de 99 a 97.
- C6 Sin dependencias nuevas: [x]. `package.json` y `pnpm-lock.yaml` no cambian.
- C7 Datos válidos y errores nombrados: [x]. No se tocan.
- C8 `./init.sh` en verde: [x]. Lo ejecutó el reviewer: herramientas, formato, tests al 100% y build pasan, y termina con «El entorno está perfecto».
- C9 Se ve correcta en desktop y móvil sin errores: [x]. Lo comprobó el reviewer con capturas de Chrome headless de `/` (redirige a /about), `/about` y `/search` a 375 y 1280 px. Las tarjetas, los pills (`.about-timeline__period`, @handle), los botones, el input de búsqueda, la foto, los marcadores del timeline, el bloque de resultado y el pulgar del scrollbar salen con esquinas rectas. El implementer comprobó el CSS servido de las 5 rutas.
- C10 Feature en `in_progress` y ninguna otra a medias: [x]. Las features 1 a 8 están en `done`. La 9 no tiene `depends_on`, así que no se ha saltado ninguna dependencia pendiente. El estado `done` lo marca el líder tras este veredicto.
- C11 `progress/current.md` e `impl_` documentados: [x].
- C12 Sin temporales ni debug: [x]. `post-readability.css` y `search-live.css`, que habían quedado como modificados sin cambios reales, se restauraron.

## Evidencia TDD
- Rojo: `progress/impl_square-corners-sitewide.md` §2 recoge 14 tests con 6 fallos antes de tocar CSS o tokens. Fallan REQ-09-01/02, 03, 04/05, 06..10 y los dos tests existentes actualizados por REQ-09-14. Los 4 que ya pasan protegen cosas que no deben cambiar (11, 12, 13, 17), y el informe lo justifica.
- Verde: la suite completa da 79/79, y `./init.sh` sale en verde en la ejecución del reviewer.
- El test `tests/square-corners-sitewide.test.mjs:17` extrae cada `[a-z-]*radius:` de todas las hojas y exige exactamente `var(--radius-square)`. Así cubre los `50%`, los literales, los valores múltiples y las propiedades `border-*-*-radius`.

## Observaciones (no bloqueantes)
- Las capturas a 375 px de Chrome headless salen cortadas en horizontal. Es un artefacto conocido del tamaño mínimo de ventana en headless y no tiene que ver con esta feature, que solo cambia valores de radio.

## Cambios requeridos (si aplica)
Ninguno.
