# Review — feature 73

**Veredicto:** APPROVED

Feature 73 latest-horizontal-compact-sticky. Revisada contra la spec enmendada
(`specs/73_latest-horizontal-compact-sticky/requirements.md` REQ-73-01..34 y `design.md`, que
recogen el par de cards de `progress/research/horizontal_feedback.md` §5), los 16 acceptance de
`feature_list.json` (id 73), `docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`.

## Pregunta de revisión (test-first y dependencias)

- Test-first: según `progress/impl_73.md` §«Ciclo rojo/verde», `tests/latest-horizontal-compact-sticky.test.mjs`
  se escribió primero y quedó en rojo (1 pasa / 4 fallan; solo pasaba REQ-73-33/34, que no
  depende del código nuevo) y después en verde (5/5, suite 822/822). Es coherente con el contenido
  del test: las aserciones de los bloques 1-4 fallan sin `pairCardWidth`/`pairInset`/`cardLeftX`,
  sin la hoja con `clip-path` y sticky y con `pin:` en el efecto. REQ-73-34 cumplido.
- Dependencias: `depends_on: [72]`, y la 72 está en `done`. La 74 (`depends_on: [73]`) sigue
  `pending`, así que no se ha adelantado.
- `./init.sh` (ejecutado en esta revisión): EXIT 0. Entorno, formato, tests al 100 % y build en
  verde. No hubo bloqueo de `dist/` por dev server ni preview.

## Verificación por archivo

- `src/domain/latest-horizontal.ts` (51 líneas):
  - Puro: sin `gsap`, `window` ni `document`.
  - Firmas y fórmulas iguales a REQ-73-02..08: `pairInset` acotado con `Math.max(0, …)` (l. 23) y
    `focusScrollTarget` con `k = clamp(index - 1, 0, count - 2)` (l. 49).
  - Guardas de REQ-73-09: entradas inválidas devuelven 0 o `start`, sin lanzar. Son guardas
    numéricas de una geometría pura que exige la spec, así que no incumplen la regla de errores
    explícitos (el precedente es la 71).
- `src/components/latest-horizontal/latest-horizontal.ts` (81 líneas):
  - Sin `pin:` ni `anticipatePin` (REQ-73-18). Activa el efecto solo con 3 o más cards: `cards.length < 3` (l. 81 del módulo).
  - El envoltorio `latest-articles--horizontal-pin` se inserta con `before` + `append` (REQ-73-19).
  - El alto del envoltorio se fija en `sizeWrapper` al crearlo y en `refreshInit`, nunca en
    `onRefresh` (REQ-73-20).
  - Trigger: el envoltorio, con `start 'top top'`, `end` como función con `pinScrollLength`,
    `scrub: true`, `ease: 'none'` e `invalidateOnRefresh: true` (REQ-73-22).
  - W se mide con `getBoundingClientRect` y G con `columnGap`, ambos en funciones.
  - Limpieza (REQ-73-25): quita listeners y observer, aplica `wrapper.replaceWith(section)` y
    quita la clase.
  - Se conservan de la 72 `init`/`destroy` idempotentes, `focusin` y `restoreScroll`.
- `src/styles/latest-horizontal.css` (39 líneas):
  - Todos los selectores contienen `.latest-articles--horizontal`.
  - Valores desde tokens (`--container-max`, `--gap-card`). Los literales `95%`, `100vh`, `30rem`,
    `3.5rem`, `16 / 9` y `0` son no cromáticos y la design.md los autoriza expresamente (mismo
    precedente que la 72).
  - Sticky con `top: 0`, `min-height: 100vh`, `overflow: clip` y `clip-path` (REQ-73-21/15).
  - Encabezado de ancho `2W + G` (REQ-73-16). Track con `gap` y sin `padding-inline` (REQ-73-11).
    `margin-inline-start` solo en `:first-child`.
- `tests/latest-horizontal-compact-sticky.test.mjs` (92 líneas): cubre los acceptance 1, 2, 5, 6
  y 9 (inspección), y 15/16 (REQ-73-33/34). Los valores numéricos son literalmente los de la
  design.md.
- Arquitectura y convenciones:
  - Lógica en `.ts`, CSS en `src/styles/`, `.astro` sin `<style>` (`latest-horizontal.astro` no se
    ha tocado).
  - Sin dependencias nuevas y todos los archivos con ≤100 líneas.
  - `latest-articles.astro`, `latest-articles.css` y `LATEST_POSTS_LIMIT = 3` intactos
    (REQ-73-33).
- Verificación CDP (`progress/impl_73.md`) y capturas (`progress/research/gsap73/`, abiertas):
  - Geometría: en `h73-1280x800-p0.png` se ven las cards 1 y 2 alineadas con el h2, y en `p1` las
    cards 2 y 3 en las mismas posiciones.
  - Recorte: en `h73-1440x900-p0.5.png` el track queda recortado en los bordes del par.
  - En `h73-1600x700-p0.png` el par está centrado y el h2 alineado con la card 1.
  - En `h73-stacked-375.png` la vista está apilada, y `h73-click-post.png` muestra la llegada al post.
  - Las cifras medidas coinciden con la tabla de la design.md: W 596,25, inset 31,75, x
    −305,13/−610,25 a 1280 y −686,25 a 1440, y márgenes 340,9 a 1600×700.
  - Con rueda real hubo 247 frames, una desviación de 0 px y 0 retrocesos (REQ-73-23/24).

## Puntos que pidió valorar el líder

1. **Error de consola en el clic (REQ-73-30).** Lo acepto como preexistente y fuera del alcance,
   con el mismo criterio que en `progress/review_72.md` (punto 1).
   - Origen: es la violación CSP `data:application/javascript,` que inserta el router de Astro
     (`node_modules/astro/dist/transitions/router.js` runScripts) al llegar a un post que termina
     en un script module inline (code-copy).
   - La 73 no lo introduce: impl_72 lo reproduce sin el efecto y en producción. La navegación
     funciona y la portada en carga directa da 0 violaciones (REQ-73-31).
   - Ya es la feature 74 (`pending`, `depends_on: [73]`). Por decisión humana va al final del
     backlog.
   - Salvedad trazable: el acceptance 13 («cero errores en la consola») no se cumple de forma
     literal hasta que se cierre la 74. Ver la recomendación 1.
2. **`style=""` vacío en el track tras revertir.** No bloquea.
   - Viene de que `mm.revert()` de GSAP limpia la `transform` en línea del track pero deja el
     atributo vacío.
   - REQ-73-25 y el acceptance 8 exigen «sin clase ni estilos en línea» para la sección, y la
     sección queda sin atributo `style` (impl_73 §Reversión). El track no tiene ninguna
     declaración en línea, así que el render es idéntico al de sin JS.
   - La design.md dice «El DOM queda como sin JS». Un atributo vacío es una diferencia cosmética
     del DOM, no de presentación ni de comportamiento.
   - Quitarlo con `track.removeAttribute('style')` sería un pulido opcional. No lo exijo.
3. **Reescritura del test de la 71 con las firmas nuevas.** Correcta.
   - La design.md (tabla «Estructura») y el acceptance 16 piden expresamente ajustar
     `tests/latest-horizontal-geometry.test.mjs` con el precedente REQ-43-06.
   - El encabezado (l. 3-6) documenta el motivo.
   - Conserva la intención de REQ-71-01/02/03/04/05/09/10/11/13 con la semántica nueva: pureza,
     recorrido, scroll 1:1, acotado del progreso y foco en los extremos. También comprueba las
     entradas inválidas con `count` 2 incluido, que ahora es inválido.
   - Desaparecen las aserciones de `cardCenterX` (REQ-71-06/07/08). Es coherente, porque la
     design.md sustituye `cardCenterX` por `cardLeftX`, y `cardLeftX` y el caso `focusScrollTarget(1, …)`
     se prueban en el test nuevo de la 73. No queda ninguna intención sin cobertura.
   - `tests/latest-articles-horizontal-scroll.test.mjs` (l. 37-45) también documenta el ajuste
     (sin `pin:` ni `anticipatePin`, `length < 3`) y mide 98 líneas.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]
- C2 Sin lógica JS en archivos de UI; el frontmatter solo importa: [x]
- C3 Ningún componente lee JSON directamente: [x] (la feature no toca datos)
- C4 Valores desde `tokens.css`, sin hardcodear: [x] ← Los literales no cromáticos están autorizados por la design.md.
- C5 Ningún archivo supera 100 líneas: [x] (51 / 81 / 39 / 92 / 64 / 98)
- C6 Sin dependencias externas nuevas: [x]
- C7 `src/data/*.json` válido y tipado: [x] (sin cambios)
- C8 Repositorios con errores nombrados: [x] (sin cambios)
- C9 `./init.sh` en verde: [x] ← Ejecutado en esta revisión: EXIT 0 (tests y build).
- C10 Página correcta en escritorio y móvil sin errores en consola: [x] ← Lo respaldan las capturas de 1280, 1440, 1600×700, 1024, 375 y reduced motion. Salvedad: el error CSP preexistente del router (punto 1, feature 74). La feature no añade errores propios.
- C11 `feature_list.json` con la tarea en `done` y ninguna otra a medias: [ ] ← La 73 sigue en `in_progress`, como corresponde antes del veredicto. El líder debe pasarla a `done` al cerrar y conservarla en el array.
- C12 `progress/current.md` documenta la sesión: [x]
- C13 Sin temporales, debug ni TODOs sin contexto: [x]

## Cambios requeridos (si aplica)

Ninguno. Recomendaciones no bloqueantes:
1. Al implementar la 74, volver a verificar REQ-73-30 (clic en la card 3 con p=1 y cero errores
   en consola) para cerrar la salvedad del acceptance 13.
2. Opcional: `track.removeAttribute('style')` en la limpieza del efecto, para que el DOM quede
   byte a byte igual que sin JS.
