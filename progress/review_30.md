# Review — feature 30

**Veredicto:** APPROVED

## Checkpoints
- C1: [x] FULL-BLEED REAL — `src/styles/latest-articles.css:5-12` declara `width: 100vw`, `max-width: none`, `margin-inline: calc(50% - 50vw)`; la columna `width: min(var(--container-max), 95%)` desapareció (test REQ-30-01 en verde, `tests/full-bleed-scroll-cards.test.mjs:64-86`). Recorrido contra viewport: `viewportDistance(track.scrollWidth, window.innerWidth)` en `src/components/latest-articles-scroll.ts:56`, sin `section.clientWidth` (test REQ-30-02/08 en verde, líneas 88-107).
- C2: [x] SIN SENSACIÓN DE CAJA — `index.astro` conserva `<NewHero>` en flujo normal; el módulo no referencia `NewHero` y el pin se ancla solo con `trigger: section` (`latest-articles-scroll.ts:61`); sin `scroll-snap` en `src/` (solo mención en comentario línea 3) y sin `overflow auto/scroll` en `.latest-articles` (solo `overflow: hidden` del modificador `--scroll`, línea 29, contención de la pista, no scroll interno). Sin `<button>` en `latest-articles.astro`. Tests REQ-30-03 y anti-carrusel en verde (líneas 109-133).
- C3: [x] SIGUE SIENDO SCROLL-DRIVEN — `pin: true`, `scrub: true`, `ease: 'none'`, `invalidateOnRefresh`, `ScrollTrigger.refresh()`, registro en `astro:page-load` con limpieza (`ScrollTrigger.getAll().forEach(kill)`) en `latest-articles-scroll.ts:45-70` y `latest-articles.astro:36-39`. Sin botones/puntos de navegación. Pares `title-<id>`/`img-<id>`, 3 cards (`.slice(0, 3)`), live-search (`data-landing-sections`), `prefers-reduced-motion` y degradado sin JS intactos (tests REQ-30-04/05/06/07 en verde).
- C4: [x] Arquitectura + convenciones + spec — estilos solo en `src/styles/`, sin `<style>`; lógica solo en módulo `.ts`; solo tokens (sin hex ni `rgb()`, test REQ-30-09 en verde); `gsap` ya aprobado en `docs/dependencies.md:44-49`, sin dependencia nueva; líneas: `latest-articles.css` 86/100, `latest-articles-scroll.ts` 70/100, `latest-articles.astro` 39/100 (test REQ-30-10 en verde). `depends_on [29]` satisfecho (feature 29 `done`, `feature_list.json:523`). Ciclo rojo/verde documentado en `progress/impl_30.md:38-71` (rojo: `viewportDistance` sin exportar; verde 11/11; suite 568/568 + `./init.sh` verde).
- C5: [x] `./init.sh` en verde al revisar (entorno, formato, tests 100%, build OK; verificado 2026-09-21) y test dedicado `tests/full-bleed-scroll-cards.test.mjs` 11/11 en verde. Nota preexistente no bloqueante: `CHECKPOINTS.md:29` (inspección visual desktop/móvil en navegador) sigue pendiente y no la introduce esta feature.

## Cambios requeridos (si aplica)
Ninguno.
