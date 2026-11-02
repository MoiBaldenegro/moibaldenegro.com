# Review — feature 3

**Veredicto:** APPROVED

Feature 3 `hero-cards-swap-positions`. Spec: `specs/03_hero-cards-swap-positions/requirements.md` (REQ-03-01..13) y `design.md`. Informe del implementer: `progress/impl_3.md`.

## Pregunta de revisión (test-first y dependencias)

- Hay test antes del código: `progress/impl_3.md` §"Evidencia ROJO" registra 8 fallos de 19 con los datos sin cambiar. Los que fallan son el test nuevo `tests/hero-cards-swap-positions.test.mjs` (REQ-03-01..06/08, 09/10 y 11/12) y los tests actualizados de `tests/hero-grid-explicit-rows.test.mjs` y `tests/hero-row-new-tools.test.mjs`. Que REQ-03-07 pase en rojo es correcto, porque es un snapshot de conservación (`progress/impl_3.md` l.30). Después del cambio la suite queda en verde: 19/19 en los tres archivos y 25/25 en total.
- Dependencias: la feature 3 no declara `depends_on`. Las features 1 y 2, cuyos datos y tests toca, están en `done`. No se salta ninguna dependencia pendiente.

## Verificación del diff

- `src/data/hero-cards.json`: se mueven las seis líneas enteras, así que cada tarjeta conserva sus propiedades, incluido `featured`. El orden final es htb, rust, aws, cloudflare, nestjs, node, tauri, react, opencode, claude-code, bash, webassembly, astro, html, css, bun, claude, typescript, youtube, github. `nestjs` va sin `row` (zona superior). `node`, `tauri` y `opencode` tienen `row: 1`; `html` y `css`, `row: 2`. Las demás tarjetas no cambian. Cumple REQ-03-01..08.
- Tests: el MAP de `tests/hero-grid-explicit-rows.test.mjs` (l.25-29) y el de `tests/hero-cards-swap-positions.test.mjs` coinciden con las acceptance de REQ-03-09/10: nestjs en (8,5,5,2) y node en (1,7,4,2). En `tests/hero-row-new-tools.test.mjs` (l.15-16) queda constancia de que REQ-02-02 y REQ-02-06 están superados. Las aserciones bajan de forma justificada (`FILA` por marca, `sort()` en la l.24) y no se debilitan sin motivo.
- No se tocan el motor, los componentes ni el CSS, como pide `design.md` (Decisión 1).
- Límite de 100 líneas: `hero-cards.json` tiene 22, el test nuevo 63, `hero-grid-explicit-rows.test.mjs` 100 y `hero-row-new-tools.test.mjs` 74.

## REQ-03-13 (regresión visual): verificada por el reviewer

El implementer no tenía navegador. Yo sí pude ejecutarla con Microsoft Edge headless por CDP, contra `astro preview` del build actual en `/home/` y con `prefers-reduced-motion: reduce`. Con esa opción las cards quedan en reposo, sin la animación GSAP de entrada. Evidencia en `progress/research/hero-cards-swap-positions/` (`review3-375.png`, `review3-768.png`, `review3-1280.png` y medidas en `review3.json`):

- **1280 px:** se muestran las 20 tarjetas sin huecos ni solapamientos. El cálculo de intersecciones entre rectángulos da 0 solapes. nestjs ocupa el hueco grande de la zona superior (span 5 x 2, x=744 y=533) y node el hueco grande de la fila 1 (span 4 x 2, x=32 y=751). La fila 1 es node, tauri, react, opencode, claude-code; la fila 2, bash, webassembly, astro, html, css. Los iconos de node y nestjs se leen bien en sus nuevos huecos (riesgo de la Decisión 3 de `design.md` descartado).
- **375 y 768 px:** solo se ve `htb` (`showOnMobile: false` en el resto, igual que en las features 1 y 2). No hay huecos ni solapes.
- **Consola:** no hay errores de JS. Sí aparece un 404 de `/assets/content/api-auth.webp`, pero viene de `src/content/posts/systems-design/07-auth-api-design.md` (commit previo `e8926ca`). No tiene relación con esta feature ni bloquea el veredicto, aunque conviene abrir una tarea aparte.

## Checkpoints
- Arquitectura (estilos, lógica, repositorios, tokens, 100 líneas, dependencias): [x] (el cambio es solo de datos y tests)
- Datos (`src/data/*.json` válido y tipado; errores nombrados): [x]
- `./init.sh` en verde (entorno, formato, tests al 100%, build): [x] (ejecutado por el reviewer, EXIT=0)
- La página se ve correcta en desktop y móvil sin errores de consola: [x] (ver REQ-03-13; el 404 ajeno queda anotado arriba)
- `feature_list.json` con la tarea en `done` y ninguna otra a medias: [ ] (sigue en `in_progress` a la espera de este veredicto; la cierra el líder)
- `progress/current.md` documenta la sesión: [x]
- Sin archivos temporales, debug ni TODOs: [x]. El archivo sin seguimiento `public/assets/content/Practicas_Ciberseguridad_Telecom_GDL.xlsx` (2026-10-27) es anterior a esta feature y no lo creó el implementer, así que no se incluye en su commit.

## Cambios requeridos (si aplica)

Ninguno.
