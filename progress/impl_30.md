# Informe de implementación — Feature 30 `full-bleed-scroll-cards`

> Sección fijada a ancho completo para que las cards atraviesen la web de lado a lado.
> Spec: `specs/30_full-bleed-scroll-cards/requirements.md` (REQ-30-01..10) y `design.md`.
> Research: `progress/research/gsap-horizontal-cards.md` (decisión full-bleed D11-D15).

## Alcance

- La pista scroll-driven (ScrollTrigger pin + scrub, feature 29) sale del container
  de contenido y ocupa TODO el ancho del viewport, de borde a borde.
- El mecanismo scroll-driven se conserva; solo cambia el layout (CSS) y el cálculo
  del recorrido (viewport en vez de sección).
- NO es carrusel: sin scroll-snap, sin botones/puntos de navegación.
- Features 10, 28 y 29 intactas (solo se cambió el `status` de la 30 a `in_progress`).

## Cambios (3 archivos, `src/` + `tests/`)

1. `src/styles/latest-articles.css` — la regla `.latest-articles` abandona la columna
   (`width: min(var(--container-max), 95%)` + `margin: auto`) y declara full-bleed
   solo con CSS (decisión 1 del design): `width: 100vw`, `max-width: none`,
   `margin-inline: calc(50% - 50vw)`. Sin mover marcado ni tocar `index.astro`;
   el hero y el resto de secciones conservan su columna. Solo tokens (sin hex ni
   rgb), ≤100 líneas.
2. `src/components/latest-articles-scroll.ts` — nuevo export puro `viewportDistance(
   trackScrollWidth, viewportWidth)` (recorrido = pista menos viewport, suelo 0) y
   el `distance()` del tween pasa de `track.scrollWidth - section.clientWidth` a
   `viewportDistance(track.scrollWidth, window.innerWidth)` (decisión 2 del design).
   Pin + scrub, `ease: none`, `invalidateOnRefresh`, `refresh()`, registro en
   `astro:page-load` con limpieza de triggers, `prefers-reduced-motion`, convivencia
   live-search y pares `title-<id>`/`img-<id>` intactos. ≤100 líneas.
3. `tests/full-bleed-scroll-cards.test.mjs` (nuevo, 11 tests) — cubre REQ-30-01..10
   contra la spec: inspección del full-bleed CSS, unitario del recorrido contra el
   viewport, anti-carrusel, hero con scroll normal, 3 cards + transiciones,
   live-search, reduced-motion, degradado sin JS, tokens y 100 líneas.

## Ciclo rojo/verde (evidencia)

ROJO (test-first, antes de implementar — el test exige el export que aún no existe):

```
# file:///C:/Users/Moises/Desktop/moibaldenegro.com/tests/full-bleed-scroll-cards.test.mjs:34
#   viewportDistance,
#   ^^^^^^^^^^^^^^^^
# SyntaxError: The requested module '../src/components/latest-articles-scroll.ts'
    does not provide an export named 'viewportDistance'
# tests 1
# pass 0
# fail 1
```

VERDE (tras implementar — feature 30, 11/11):

```
# tests 11
# pass 11
# fail 0
```

VERDE (suite completa + arnés):

```
1..568
# tests 568
# pass 568
# fail 0
./init.sh → ✔ El entorno está perfecto. Podemos empezar a trabajar.
```

(Nota: una primera pasada de `./init.sh` marcó `✘ tests al 100%` de forma
transitoria; `pnpm test` directo dio 568/568 con exit 0 y la repetición de
`./init.sh` quedó en verde completo, incluyendo formato y build.)

## Convivencia verificada

- `tests/horizontal-scroll-gsap-cards.test.mjs` (feature 29), `gsap-setup-recent-limit`
  y `client-init-on-navigation`: 26/26 en verde, sin cambios.
- Sin dependencias nuevas (ScrollTrigger vive en el `gsap` de la feature 28).
- `posts-repository.ts` (100/100) no tocado; `index.astro` no tocado.
