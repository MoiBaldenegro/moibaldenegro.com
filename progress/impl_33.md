# Informe de implementación — Feature 33 `pin-visible-start`

> El pin engancha con la sección visible llenando el viewport.
> Spec: `specs/33_pin-visible-start/requirements.md` (REQ-33-01..14) y `design.md`.
> Causa raíz definitiva: `progress/research/gsap-horizontal-cards.md` (sección
> "Persistencia de la regresión tras la feature 32").

## Diagnóstico (confirmado en disco antes de tocar nada)

- `src/components/latest-articles-scroll.ts` línea 75 conservaba
  `start: 'top bottom'` con `pin: true`: la sección quedaba FIJADA FUERA DE
  VISTA (borde superior tocando el borde inferior del viewport, bajo el
  pliegue) durante TODO el recorrido; el scrub movía la pista en invisible.
- Evidencia del humano: "el div .pin-spacer tiene un padding de más de 1700
  píxeles, una locura" — ese spacer gigante se recorría en BLANCO.
- La feature 32 solo tocó lo secundario (`clampPinDistance`, refresco
  vigilado) sin mover el enganche: por eso "no se vio ningún cambio".

## Ciclo rojo (test-first: tests escritos ANTES del código, observados en rojo)

- Archivo nuevo `tests/pin-visible-start.test.mjs` (10 tests, REQ-33-01..14),
  incluyendo los que habrían atrapado el spacer gigante invisible:
  - REQ-33-01/02 exige `start: 'top top'` + `pin` + `scrub` y PROHÍBE
    `'top bottom'` (el pin fuera de vista).
  - REQ-33-06/08 exige `clampPinDistance(20000, 1280) === 3840` (medición
    previa al layout acotada a 3 viewports, no 1700px+ de vacío) y prohíbe
    `invalidateOnRefresh: true` y `refresh()` incondicional.
- Salida en rojo (antes de implementar):

```text
not ok 1 - REQ-33-01/02: el pin engancha con la sección visible llenando el viewport
  error: "el trigger no declara el enganche visible start: 'top top' (REQ-33-01, REQ-33-02)"
not ok 8 - REQ-33-12: los tests de la 31 y la 32 siguen a la presentación real visible
# tests 10
# pass 8
# fail 2
```

## Cambio (scope estricto del acceptance, sin salirse)

1. `src/components/latest-articles-scroll.ts` (85/100 líneas): `start:
   'top bottom'` → `start: 'top top'` + comentario de la feature 33. Con el
   `min-height: 100vh` existente, al enganchar la sección llena el viewport
   y el recorrido horizontal lado a lado se ve de principio a fin; antes, el
   hero se va con scroll normal y la sección entra en vista con scroll
   normal. Sin blancos. Resto intacto: pin + scrub, `end: +=distance()`
   acotada (`clampPinDistance` contra el viewport), refresco vigilado de la
   32, full-bleed de la 30, centrado vertical de la 31, 3 cards, pares
   `title-<id>`/`img-<id>`, live-search (`astro:page-load` + limpieza),
   reduced-motion y degradado sin JS.
2. `tests/pin-timing-center.test.mjs` (feature 31) y
   `tests/pin-spacer-scroll-fix.test.mjs` (feature 32): aserciones que
   fijaban `'top bottom'` actualizadas a `'top top'` con justificación en el
   encabezado (precedente REQ-43-06: los tests siguen a la presentación
   real). `feature_list.json` de las features 10, 28, 29, 30, 31 y 32
   intacto (estados y contratos no tocados).
3. Sin CSS nuevo (la hoja ya tenía `min-height: 100vh` + centrado; 94/100
   líneas, solo tokens), sin dependencias nuevas (ScrollTrigger vive en el
   paquete `gsap` de la feature 28), sin `<style>` en `.astro`.

## Ciclo verde

- `tests/pin-visible-start.test.mjs`: 10/10 en verde tras el cambio.
- `./init.sh` en verde al cierre:

```text
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

- Suite: 597/597 tests en verde (`pnpm test`); líneas: scroll.ts 85/100,
  latest-articles.astro 38/100, latest-articles.css 94/100.

## Criterio del humano

- El spacer deja de ser un vacío de 1700px+ sin contenido: el pin engancha
  con la sección visible (`'top top'` + `min-height: 100vh`), el recorrido
  fijado muestra las cards atravesando el viewport, y el espaciado total
  queda acotado a la altura de la sección + el recorrido real
  (`end: +=distance()` con `clampPinDistance`, tope 3 viewports), nada más.
- Nota de verificación (no es feature): el dev server corre con HMR; el
  humano debe recargar duro (Ctrl+Shift+R) tras el fix para descartar caché.

## Estado

- Feature 33 en `in_progress` (NO marcada `done`: se cierra solo con
  `progress/review_33.md` en `APPROVED`, verificado en disco).
- LISTO PARA QUE EL LÍDER LANCE AL REVIEWER.
