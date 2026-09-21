# Informe de implementación — Feature 31 pin-timing-center

> Enganche temprano y centrado vertical del pin de las cards.
> Test-first: tests escritos contra specs/31_pin-timing-center antes del código.

## Alcance

- Reporte UX del humano (D16-D19 en progress/research/gsap-horizontal-cards.md):
  el pin full-bleed de la feature 30 enganchaba con `start: 'top center'`
  (cards abajo, casi fuera de vista) y dejaba hueco en blanco al irse el hero.
- Cambio mínimo, solo timing + posicionamiento vertical:
  - `src/components/latest-articles-scroll.ts`: `start: 'top center'` →
    `start: 'top bottom'` (el pin se activa al entrar la sección por el borde
    inferior, con la pista ya visible); `end: +=distance()` en coherencia.
  - `src/styles/latest-articles.css`: `.latest-articles--scroll` ocupa la
    altura del viewport (`min-height: 100vh`) y centra la pista con flex
    (`display: flex; flex-direction: column; justify-content: center`).
- Conservado: pin + scrub, `ease: none`, `invalidateOnRefresh`, `refresh()`,
  registro en `astro:page-load` con limpieza, full-bleed lado a lado,
  `distance()` contra el viewport, 3 cards, pares `title-<id>`/`img-<id>`,
  live-search, reduced-motion, degradado sin JS. No es carrusel (sin
  scroll-snap, sin botones). Sin dependencias nuevas. Features 10, 28, 29
  y 30 intactas (solo cambió el `status` de la 31 a `in_progress`).

## Evidencia del ciclo rojo/verde

### Rojo (tests nuevos contra el código anterior, 2026-09-21)

`node --test tests/pin-timing-center.test.mjs` — primera ejecución: 7 pass / 3 fail.
El 3er fallo era un regex propio demasiado estricto del `end` (no admitía la
anotación de retorno `: string` del código existente, comportamiento a
conservar, no a cambiar); se corrigió el test y se re-ejecutó para el rojo
limpio:

```
not ok 1 - REQ-31-01/02: el trigger engancha temprano, anterior a top center
not ok 2 - REQ-31-01/03: la pista queda centrada verticalmente en el viewport durante el pin
ok 3 - REQ-31-02/04: sin hueco en blanco, el hero sigue normal y la sección libera al agotar
ok 4 - REQ-31-07/08: conserva el full-bleed lado a lado, las 3 cards y el live-search
ok 5 - REQ-31-07: no es carrusel (sin scroll-snap ni navegación por botones/puntos)
ok 6 - REQ-31-05: con movimiento reducido se omite la animación (contenido estático)
ok 7 - REQ-31-06: sin JavaScript las 3 cards quedan visibles sin animación
ok 8 - REQ-31-02: el script registra en astro:page-load con limpieza de triggers
ok 9 - REQ-31-09: la hoja usa solo tokens de tokens.css
ok 10 - REQ-31-10: cada archivo modificado no supera las 100 líneas
# pass 8
# fail 2
```

Detalle del fallo 1: `el trigger no declara el enganche temprano start:
'top bottom'` (el código aún declaraba `start: 'top center'`).
Detalle del fallo 2: `latest-articles.css no declara la regla
.latest-articles--scroll` con centrado (solo `overflow: hidden`).
Los 8 tests de conservación ya pasaban: el mecanismo a preservar estaba intacto.

### Verde (tras implementar, 2026-09-21)

`node --test tests/pin-timing-center.test.mjs`:

```
ok 1 - REQ-31-01/02: el trigger engancha temprano, anterior a top center
ok 2 - REQ-31-01/03: la pista queda centrada verticalmente en el viewport durante el pin
ok 3 - REQ-31-02/04: sin hueco en blanco, el hero sigue normal y la sección libera al agotar
ok 4 - REQ-31-07/08: conserva el full-bleed lado a lado, las 3 cards y el live-search
ok 5 - REQ-31-07: no es carrusel (sin scroll-snap ni navegación por botones/puntos)
ok 6 - REQ-31-05: con movimiento reducido se omite la animación (contenido estático)
ok 7 - REQ-31-06: sin JavaScript las 3 cards quedan visibles sin animación
ok 8 - REQ-31-02: el script registra en astro:page-load con limpieza de triggers
ok 9 - REQ-31-09: la hoja usa solo tokens de tokens.css
ok 10 - REQ-31-10: cada archivo modificado no supera las 100 líneas
# tests 10
# pass 10
# fail 0
```

### Suite completa del arnés

`./init.sh` (2026-09-21): entorno ✔, formato ✔, tests al 100% ✔,
build de producción ✔ → `El entorno está perfecto. Podemos empezar a trabajar.`

## Archivos tocados

- `tests/pin-timing-center.test.mjs` (nuevo, 10 tests REQ-31-01..10).
- `src/components/latest-articles-scroll.ts` (72/100 líneas: solo `start` + 2 líneas de comentario).
- `src/styles/latest-articles.css` (94/100 líneas: solo bloque `.latest-articles--scroll`).
- `feature_list.json` (feature 31 → `in_progress`), `progress/current.md` (bitácora).

## Estado

Implementada, pendiente de revisión externa. NO marcada `done` (sin
`progress/review_31.md` con `APPROVED`).
