# Informe de implementación — Feature 34 horizontal-track-shift-fix

- Feature: 34 — "La pista horizontal se traslada el recorrido real al avanzar el scroll"
- Reporte del humano: "ya se fue el espacio pero el scroll horizontal no funciona"
- Causa raíz: `progress/research/gsap-horizontal-cards.md` (sección "Por qué el horizontal no se mueve..."): `distance()` valía 0 al construir el tween (medición única previa al layout asentado) y con `end: '+=0'` el pin quedaba de longitud cero — sin spacer ("se fue el espacio") y sin movimiento ("no funciona"); sin `invalidateOnRefresh` (quitado en la 32) el 0 quedaba congelado.
- Spec: `specs/34_horizontal-track-shift-fix/requirements.md` (REQ-34-01..14) + `design.md`.

## Qué se cambió (scope estricto de la feature 34)

- `src/components/latest-articles-scroll.ts` (85→99 líneas, ≤100 OK):
  - `isPinReady(distance)` (pura, REQ-34-01/04): el pin solo se construye con distancia > 0.
  - `PIN_DISTANCE_ATTR = 'data-pin-distance'` (REQ-34-11): la sección expone la distancia medida + `console.log('[latest-scroll] pin distance: ...')` para DevTools.
  - Guardia en `initLatestScroll`: con medida inicial 0 NO se construye el pin; se difiere al asentar el layout (`load`, `once: true`) de forma vigilada, sin bucles (REQ-34-01/02).
  - `x` y `end` comparten la distancia medida del `build` (sincronizados, `end: \`+=${distance}\`` con valor > 0 garantizado por el guardián; REQ-34-03/04). Sin `invalidateOnRefresh`, sin `refresh()` incondicional (lección de la 32).
  - `trackShift` devuelve `0` (no `-0`) con recorrido ≤ 0: la capa pura es coherente con el guardián.
  - Se conserva: `start: 'top top'` (33), espaciado acotado + refresco vigilado (32), full-bleed lado a lado (30), scroll-driven pin + scrub (29), `astro:page-load` con limpieza `ScrollTrigger.getAll()` (10), 3 cards, pares `title-<id>`/`img-<id>`, live-search, reduced-motion, degradado sin JS.
- `tests/horizontal-track-shift-fix.test.mjs` (nuevo, 12 tests, REQ-34-01..14): incluye los que habrían atrapado la pista parada — REQ-34-01 (con 0 no se construye), REQ-34-03 (`trackShift` proporcional + caso 0) y REQ-34-04 (`end` ligado a distancia > 0).
- `tests/pin-timing-center.test.mjs`, `tests/pin-spacer-scroll-fix.test.mjs`, `tests/pin-visible-start.test.mjs`: SOLO la aserción del patrón de `end` (funcional → sincronizado estático) + nota de ajuste en el encabezado con justificación explícita (precedente REQ-43-06, exigido por REQ-34-12). Nada más.
- NO tocados: feature 10 (sigue `in_progress`, intacta), features 28/29/30 (código y tests), `latest-articles.astro`, `latest-articles.css`, `package.json` (sin dependencias nuevas), resto de tests.

## Evidencia del ciclo rojo/verde

### ROJO 1 — test nuevo antes del código

```
$ node --test tests/horizontal-track-shift-fix.test.mjs
# SyntaxError: The requested module '../src/components/latest-articles-scroll.ts'
#   does not provide an export named 'PIN_DISTANCE_ATTR'
# tests 1  # pass 0  # fail 1
```

### ROJO 2 — tras implementar, dos fallos que atraparon defectos reales

```
ok 1 - REQ-34-01 ...  ok 2 - REQ-34-02 ...
not ok 3 - REQ-34-03 ...   # trackShift(0.5, 0) devolvía -0 (strictEqual contra 0)
ok 4 ... ok 9 ...
not ok 10 - REQ-34-12 ...  # tests 31/32/33 aún fijaban el fin funcional que congelaba el 0
# pass 10  # fail 2
```

Correcciones: guardia `if (maxShift <= 0) return 0` en `trackShift`; corrección de mis regex de REQ-34-12; actualización justificada (REQ-43-06) del patrón de `end` en los 3 tests fosilizados.

### VERDE — suite + arnés

```
$ node --test tests/horizontal-track-shift-fix.test.mjs
ok 1..12  # pass 12  # fail 0
$ pnpm test
# tests 609  # pass 609  # fail 0   (baseline previo: 597/597)
$ ./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Cómo verificar el fix en el navegador (para el humano)

1. Abrir `/` con la consola abierta y recarga dura (Ctrl+Shift+R).
2. Leer `data-pin-distance` en `section[data-latest-scroll]`: es la distancia que usan `x` y `end`. Si vale `0`, el pin NO se construye y se reintenta al asentar (ya no hay pin de longitud cero).
3. Consola: marca `[latest-scroll] pin distance: <n>` al construir y al re-medir.
4. Elements: el `.pin-spacer` envuelve la sección (su altura es el recorrido) y el `transform: translateX` del track cambia al avanzar el scroll vertical.

## Estado

- `feature_list.json`: 34 en `in_progress` (NO marco `done`: espero el `APPROVED` de `progress/review_34.md`; el líder lanza al reviewer).
- `progress/current.md` documenta la sesión.
