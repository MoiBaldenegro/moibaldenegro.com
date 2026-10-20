# Implementación — feature 10 client-init-on-navigation

Implementer, 2026-10-20. Spec: specs/10_client-init-on-navigation/requirements.md (REQ-10-01..15).
Análisis previo: progress/research/client-init-on-navigation-unblock.md. Datos del navegador:
progress/research/client-init10/ (script, helper, JSON y capturas `before-*` / `after-*`).

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/components/search-results/search-results-controller.ts` (94 líneas) | REQ-10-10: `initSearchResults` sale nada más empezar si no existe `[data-search-guide]`. Sin la vista de resultados no reescribe `document.title`, no conecta el botón de limpiar y no pide el índice. Comentario de 3 líneas. |
| `src/components/search-live/search-live.ts` (94 líneas) | REQ-10-11: el `removeEventListener` del manejador `search:change` anterior y `changeHandler = null` pasan **antes** de `if (panel === null) return;`. |
| `tests/client-init-on-navigation-gaps.test.mjs` (nuevo, 89 líneas) | 4 tests unitarios con document simulado: REQ-10-10 en /about, REQ-10-10 en /posts/<slug>?q=x, un control con la vista de resultados (el título sí pasa a «Búsqueda: arquitectura» y se pide el índice) y REQ-10-11. |
| `tests/client-init-on-navigation.test.mjs` (266 líneas, sin cambio de longitud) | Se cambia 1 línea de REQ-10-07, explicada abajo. |
| `progress/research/client-init10/` (nuevo) | `lib.mjs` (copia del helper CDP de cls104 sin el observer de CLS), `run.mjs` (recorrido), `before.json` / `after.json` y 14 PNG. |

Ajenos, sin tocar: public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md y
tests/hack-the-box-sprite.test.mjs. No hay dependencias nuevas, JS de runtime nuevo ni cambios de UI.

### Decisiones

- **Marcador `[data-search-guide]` en lugar de `.search-results`.** Los dos solo existen en
  search-results.astro: el guide está dentro del contenedor y no aparece en el panel en vivo.
  search-escape.ts ya usa ese mismo marcador para detectar la vista /search (`escapeContext`). Con
  `.search-results` fallaban 9 tests de las features 17 y 32 (term-search-oldest-first y
  search-pagination-listeners): sus document simulados devuelven `null` para `.search-results` y
  arreglarlo obligaba a reescribir esos fakes. Con el guide pasan sin cambios. El test de REQ-10-10
  usa un document simulado sin ninguno de los dos nodos, que es el caso del criterio
  («página sin el contenedor .search-results»).
- **Ajuste de REQ-10-07** (tests/client-init-on-navigation.test.mjs:109). Antes:
  `assert.equal(calls.listeners.size, 0, …)`. Ahora:
  `assert.equal([...calls.listeners.values()].flat().length, 0, …)`. El estado de módulo
  (`changeHandler`) se comparte entre los tests del archivo. Tras REQ-10-06, la llamada sin panel ya
  **retira** el manejador anterior (justo lo que pide REQ-10-11). Eso deja en el Map del fake una clave
  `search:change` con un array vacío, así que `size` vale 1 aunque no quede ningún listener activo.
  La aserción `calls.add.length === 0` (no registra nada) sigue igual. Ahora el test cuenta listeners
  activos, que es lo que quiere decir su mensaje.

## Ciclo rojo / verde

### Rojo: tests nuevos escritos antes de tocar src/

`node --test tests/client-init-on-navigation-gaps.test.mjs`:

```
✖ REQ-10-10: en /about sin .search-results no cambia document.title ni pide el índice
  AssertionError: reescribió document.title fuera de la página de resultados
  + 'Búsqueda: about'
  - 'Sobre mí | Moisés'
✖ REQ-10-10: en /posts/<slug> sin .search-results no cambia document.title ni pide el índice
  + 'Búsqueda: x'
  - 'Sobre mí | Moisés'
✔ REQ-10-10 (control): con .search-results el título sí pasa a «Búsqueda: <término>»
✖ REQ-10-11: initSearchLive sin panel tras una visita con panel retira el manejador search:change
  AssertionError: el manejador anterior sigue escuchando
  1 !== 0
ℹ tests 4  ℹ pass 1  ℹ fail 3
```

El control pasa en rojo a propósito: protege el comportamiento que no debe cambiar.

### Verde

- `node --test tests/client-init-on-navigation*.test.mjs tests/search-*.test.mjs tests/root-term-search.test.mjs tests/term-search-oldest-first.test.mjs`: pass 204, fail 0.
- `pnpm test`: tests 1089, pass 1089, fail 0.
- `./init.sh` (final, tras la verificación en navegador): exit 0, «✔ El entorno está perfecto»
  (archivos del harness, formato, tests al 100 % y build de producción).

## Verificación en navegador (REQ-10-12..15)

Chrome headless + CDP a 1440x900 contra `pnpm build` + `pnpm preview --port 4370`. El :4321 no se
tocó y el servidor propio se paró al terminar. Se hizo una sola carga completa de `/`; el resto de
navegaciones son clics en los enlaces del header (`header a[href=…]`) o un `requestSubmit` de la barra
(→ `navigate('/search?q=arquitectura')`). Al final, `performance.getEntriesByType('navigation').length === 1`
y la marca `window.__hard` sigue viva (`hardLoadsKept: true`), así que no hubo ninguna recarga.
Un script inyectado con `Page.addScriptToEvaluateOnNewDocument` envuelve los manejadores
`search:change` del documento (solo los registra search-live.ts). Cuenta ejecuciones (`runs`) y
listeners activos (`active`).

Recorrido: 3 rondas de portada → /arquitectura → /about → /diseno-de-sistemas → portada →
/search?q=arquitectura (vía barra) → portada. Después: /about (evento de cambio), portada → post,
portada (8.ª vuelta), búsqueda en vivo, limpiar y Escape.

Para comprobar que los huecos eran reales, el mismo script corrió también contra un build con las
versiones HEAD de los dos controladores. Fue un cambio temporal, restaurado justo después del build;
luego se reconstruyó dist con el fix.

| Comprobación | before (HEAD) | after (fix) |
|---|---|---|
| REQ-10-12 items en /arquitectura, visitas 1/2/3 | 6/6/6 | 6/6/6 |
| REQ-10-12 items en /diseno-de-sistemas, visitas 1/2/3 | 3/3/3 | 3/3/3 |
| REQ-10-12 items en /search?q=arquitectura, visitas 1/2/3 | 6/6/6 | 6/6/6 |
| REQ-10-10 title en /about (3 visitas) | «Búsqueda: about» x3 | «About — moisesbaldenegro.com» x3 |
| REQ-10-10 title en /posts/00-systems-design-template | «Búsqueda: posts 00-systems-design-template» | «Mi plantilla para diseñar sistemas \| moisesbaldenegro.com» |
| REQ-10-11 ejecuciones del manejador de la portada al escribir y borrar en la barra de /about | 2 | 0 |
| REQ-10-11 listeners search:change activos en /about | 1 | 0 |
| REQ-10-14 ejecuciones con 1 evento search:change en la portada tras 8 vueltas | 1 | 1 |
| REQ-10-14 listeners activos en la portada | 1 | 1 |
| REQ-10-13 en vivo: «arquitectura» → panel visible, landing oculta, items | sí / sí / 6 | sí / sí / 6 |
| REQ-10-13 botón limpiar → input vacío, panel oculto, landing visible | sí | sí |
| REQ-10-13 «diseño» y Escape (CDP Input.dispatchKeyEvent) con foco en la barra → input vacío, portada restaurada | sí | sí |
| REQ-10-15 errores de consola / excepciones / Log error | 0 / 0 / 0 | 0 / 0 / 0 |

Conclusiones:
- Los dos huecos eran **reales** en el navegador. Antes del fix, /about y los posts tenían como título
  «Búsqueda: …», y el manejador de la portada seguía ejecutándose en /about sobre un panel ya
  desconectado. Con el fix, las dos cosas desaparecen.
- REQ-10-12/13/14 ya se cumplían antes del fix y se siguen cumpliendo: el bug original (no pintaba
  en la 2.ª visita) está resuelto por astro:page-load y sin regresión. REQ-10-14 ya lo cubría el guard
  de REQ-10-06.

Capturas de la 2.ª visita (REQ-10-12) y del resto, en progress/research/client-init10/:
`after-arquitectura-visita2.png`, `after-diseno-visita2.png`, `after-search-visita2.png`,
`after-about.png`, `after-post.png`, `after-home-live.png` y `after-home-escape.png` (más sus `before-*`).
Salida completa: `after.json` / `before.json` (pasos con path, title, items y contadores).
Reproducir: `node progress/research/client-init10/run.mjs <outdir> <puertoCDP> <label>` con el preview
en :4370 (o `BASE=…`) y `PROF=<dir de perfiles temporal>`.

## Pendiente

- Reviewer externo (lo lanza el líder). La feature queda en `in_progress`.
