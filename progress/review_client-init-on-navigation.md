# Review — feature 10

**Veredicto:** APPROVED

Reviewer nivel 1, 2026-10-20. Alcance: solo los archivos que lista
`progress/impl_client-init-on-navigation.md`. Los cambios de 101-104 y los cambios ajenos del humano
(`public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`,
`tests/hack-the-box-sprite.test.mjs`) quedan fuera.

## Revisión de los archivos

- `src/components/search-results/search-results-controller.ts:31-35` (95 líneas). REQ-10-10: hay un
  guard `if (document.querySelector('[data-search-guide]') === null) return;` antes de `queryTerm`,
  de `wireClear` y de `load`. El marcador solo existe en `search-results.astro:7` y es el mismo que
  usa `search-escape.ts:25`. El informe justifica bien por qué se usa este marcador y no
  `.search-results` (con `.search-results`, los fakes de las features 17/32 dejaban de pasar). El
  comentario explica el porqué.
- `src/components/search-live/search-live.ts:81-84` (94 líneas). REQ-10-11: `removeEventListener` y
  `changeHandler = null` se ejecutan ahora antes de `if (panel === null) return;`. El cambio es
  mínimo y correcto. REQ-10-06 (sin acumular manejadores) se sigue cumpliendo.
- `tests/client-init-on-navigation-gaps.test.mjs` (nuevo, 89 líneas). Cubre los criterios de
  aceptación 9 y 10 con un document simulado, más un test de control. La convención de archivos de
  menos de 100 líneas se cumple.
- `tests/client-init-on-navigation.test.mjs:109`. La aserción de REQ-10-07 pasa de `size` del Map a
  contar listeners activos. El cambio está justificado: el fake deja la clave con un array vacío
  después de retirar el listener, que es lo que pide REQ-10-11. La aserción `calls.add.length === 0`
  se mantiene. No debilita el test.
- `progress/research/client-init10/`: `run.mjs` (71 líneas), `lib.mjs` (30), `before|after.json` y
  14 PNG. Cumple REQ-10-15.
- Arquitectura y convenciones: ningún `.astro` tocado, sin dependencias nuevas, sin JS de runtime
  nuevo, archivos de 100 líneas o menos.
- `depends_on` [3, 4, 5, 6, 7, 9]: todas en `done`.

## Pregunta de revisión (rojo/verde)

Sí. El informe registra el rojo de `client-init-on-navigation-gaps.test.mjs` antes de tocar `src/`:
3 fallos con los mensajes de las aserciones (título «Búsqueda: about», «Búsqueda: x», listener
1 !== 0) y el control en verde. Después queda en verde: `pnpm test` 1089/1089 y `./init.sh` con
exit 0.

## Verificación independiente

- `./init.sh`: verde (harness, formato, tests al 100 %, build de producción).
- Mi propio script de Chrome headless + CDP (en el scratchpad, aparte del del implementer) contra
  `pnpm preview --port 4380` sobre el dist que generó `init.sh`. El servidor se paró al terminar y
  :4321 no se tocó. Se hizo una sola carga completa: `navigation` = 1 y la marca `window.__hard` se
  conserva hasta el final.
  - REQ-10-12: 3 visitas a cada ruta. /arquitectura 6/6/6 items, /diseno-de-sistemas 3/3/3,
    /search?q=diseño 6/6/6 (por `requestSubmit` de la barra, con un término distinto al del
    implementer).
  - REQ-10-10: 5 visitas a /about, siempre con el título «About — moisesbaldenegro.com». 2 visitas a
    /posts/00-systems-design-template/, con el título «Mi plantilla para diseñar sistemas |
    moisesbaldenegro.com».
  - Índice: 0 peticiones de `search-index.json` en la portada, en /about y en el post antes de
    cualquier página de búsqueda. En toda la sesión hubo 1 sola petición (caché del loader).
  - REQ-10-11: en /about, 0 listeners `search:change` activos y 0 ejecuciones del manejador de la
    portada tras dos eventos `input`.
  - REQ-10-14: tras 8 vueltas a la portada, 1 listener activo y 1 ejecución por cada evento.
  - REQ-10-13, después de unas 25 navegaciones: con «spring» en vivo el panel es visible, la landing
    se oculta y hay 1 item. El botón de limpiar vacía el input, oculta el panel y muestra la
    landing. Con «api» y Escape enviado por CDP, el input queda vacío y la portada restaurada.
  - REQ-10-15: 0 errores de consola, 0 excepciones y 0 entradas Log de nivel error.
- Capturas revisadas: `after-diseno-visita2.png` (3 resultados pintados en la 2.ª visita) y
  `after-home-escape.png` (portada restaurada, input vacío con foco). Son coherentes con
  `after.json`.

## Checkpoints
- C1 Estilos en src/styles, sin `<style>` en .astro: [x] (no se toca UI)
- C2 Sin lógica en UI: [x]
- C3 Datos vía repositorios: [x] (no aplica)
- C4 Tokens sin valores hardcodeados: [x] (no aplica)
- C5 Ningún archivo supera 100 líneas: [x] (95 / 94 / 89 / 71 / 30)
- C6 Sin dependencias externas: [x]
- C7 JSON válido y tipado: [x] (no aplica)
- C8 Repositorios con errores nombrados: [x] (no aplica)
- C9 `./init.sh` en verde: [x]
- C10 Página correcta y sin errores de consola: [x] (verificado en desktop con CDP; la feature no
  toca UI)
- C11 feature_list.json con la tarea en `done`: [ ] ← la marca el líder al cerrar (sigue en
  `in_progress`, como corresponde antes del veredicto)
- C12 progress al día: [x]
- C13 Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)
1. El comentario de cabecera de `tests/client-init-on-navigation-gaps.test.mjs:5` y los nombres de
   los tests hablan de «.search-results», pero el guard usa `[data-search-guide]`. Es coherente
   porque los dos nodos conviven en la vista de resultados y el informe lo explica. Si se retoca el
   archivo, conviene nombrar el marcador real.
2. REQ-10-08 cita `progress/research/client-init-on-navigation.md` para justificar los ajustes. El
   ajuste de esta ronda (REQ-10-07, línea 109) está justificado en
   `progress/impl_client-init-on-navigation.md`. Es suficiente.

## Cambios requeridos (si aplica)
Ninguno.
