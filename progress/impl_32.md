# Informe de implementación — Feature 32 pin-spacer-scroll-fix

- Feature: 32 — pin-spacer-scroll-fix (bugfix de la regresión de la 31)
- Estado: implementada, `./init.sh` en verde (tests 587/587 + build)
- Contratos 10/28/29/30/31 intactos: solo cambia `status` de la 32 a
  `in_progress`; ningún test de esas features se modifica.

## Qué se hizo

- `src/components/latest-articles-scroll.ts` (72 → 85 líneas, ≤100 OK):
  - Nueva función pura `clampPinDistance(trackScrollWidth, viewportWidth,
    maxViewports = 3)` (REQ-32-01/08): acota el espaciado del pin al
    recorrido real con tope de N viewports; una medición previa al layout
    (imágenes lazy, fuentes sin asentar) ya no genera un spacer gigante.
  - `distance()` interno usa `clampPinDistance(track.scrollWidth,
    window.innerWidth)`; el `end` sigue siendo `+=${distance()}` (fin del
    pin derivado del recorrido acotado, contrato REQ-31-04 intacto).
  - Eliminado `invalidateOnRefresh: true` (recálculos encadenados del
    spacer, causa (b)); el `ScrollTrigger.refresh()` incondicional se
    sustituye por refresco vigilado: si el documento ya asentó el layout
    refresca, si no lo hace una sola vez en el evento `load` (REQ-32-02).
  - Conservado: pin + scrub, `start: 'top bottom'` (enganche temprano),
    `x` funcional, registro en `astro:page-load` con `getAll()` + `kill()`,
    `prefers-reduced-motion`, convivencia live-search.
- `src/styles/latest-articles.css` y `src/components/latest-articles.astro`
  sin cambios: full-bleed lado a lado, centrado vertical (`min-height:
  100vh` + flex + `justify-content: center`), 3 cards con pares
  `title-<id>`/`img-<id>`, degradado sin JS.
- Tests nuevos: `tests/pin-spacer-scroll-fix.test.mjs` (9 tests,
  REQ-32-01..10, inspección por regex + unitarios por import directo).
- Sin dependencias nuevas (ScrollTrigger vive en el paquete `gsap` de la
  28); solo tokens en CSS; listener `astro:page-load` con limpieza.

## Evidencia del ciclo rojo/verde

### Rojo (test antes que el código)

```
$ node --test tests/pin-spacer-scroll-fix.test.mjs
# file:///.../tests/pin-spacer-scroll-fix.test.mjs:38
#   clampPinDistance,
#   ^^^^^^^^^^^^^^^^
# SyntaxError: The requested module '../src/components/latest-articles-scroll.ts'
#   does not provide an export named 'clampPinDistance'
# tests 1 / pass 0 / fail 1
```

### Verde (tras implementar)

```
$ node --test tests/pin-spacer-scroll-fix.test.mjs
# tests 9 / pass 9 / fail 0
$ node --test tests/pin-timing-center.test.mjs tests/full-bleed-scroll-cards.test.mjs
  tests/horizontal-scroll-gsap-cards.test.mjs tests/gsap-setup-recent-limit.test.mjs
  tests/client-init-on-navigation.test.mjs
# tests 47 / pass 47 / fail 0
$ pnpm test → # tests 587 / pass 587 / fail 0
$ ./init.sh → ✔ formato / ✔ tests al 100% / ✔ build / El entorno está perfecto.
```

## Trazabilidad acceptance ↔ REQ

- Función pura acota el espaciado al recorrido real → REQ-32-01/08
  (`clampPinDistance`: 2400/1200 → 1200; 20000/1280 → 3840, no 18720).
- Pin con espaciado acotado + sin refrescos incondicionales → REQ-32-01/02
  (`distance()` acotada, `end +=distance()`, sin `invalidateOnRefresh`,
  refresco solo en `load`/`readyState complete`).
- Distancia y fin estables ante mediciones previas → REQ-32-02/08.
- Lado a lado + enganche temprano + centrado → REQ-32-03.
- 3 cards + pares + live-search → REQ-32-04/05; reduced-motion → REQ-32-06;
  sin JS → REQ-32-07; tokens → REQ-32-09; ≤100 líneas → REQ-32-10.
- Suite verde al cierre → restricción `require_tests_to_close`.
