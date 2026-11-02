# Implementación — feature 8 `mxvi-band-below-articles`

La cinta MXVI pasa a ir debajo de los bloques de artículos en la home.
Spec: `specs/08_mxvi-band-below-articles/requirements.md` (REQ-08-01..11) y `design.md`.
Análisis: `progress/research/mxvi-band-below-articles.md`. Depende de la feature 7 (done).
Fecha: 2026-11-02.

## 1. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `tests/mxvi-band-below-articles.test.mjs` | Nuevo, escrito antes del código: 5 tests (REQ-08-01, 02/03/04, 05, 06, 11) | 55 |
| `tests/promo-tiles-section-ui.test.mjs` | REQ-08-09: la aserción de REQ-04-08 pasa de `/<LatestHorizontal\s*\/>\s*<PromoTiles\s*\/>/` a `/<MxviLogosBanner\s*\/>\s*<PromoTiles\s*\/>/` (sigue dentro de `.home__landing`). El nombre del test indica que lo sustituye REQ-08-09. Nada más cambia | 87 |
| `src/pages/home.astro` | Se mueve la línea `<MxviLogosBanner/>` de detrás de `<NewHero/>` a detrás de `<LatestHorizontal />`. Imports, frontmatter y `<SearchLive />` sin cambios | 28 |

No se tocaron el componente `src/components/mxvi-logos-banner.astro` (REQ-08-07), `src/styles/mxvi-logos-banner.css`, los tokens ni los datos. REQ-08-08 es condicional y no hizo falta activarlo: la cinta conserva su `padding-block: var(--space-mxvi-band)` y su `border-block`, y PromoTiles mantiene su propio `padding-block: var(--gap-promo)`.

Orden final de `.home__landing`: NewHero, LatestArticles, LatestHorizontal, MxviLogosBanner, PromoTiles. `<SearchLive />` sigue fuera.

## 2. Evidencia del rojo (antes de tocar home.astro)

`node --test tests/mxvi-band-below-articles.test.mjs`:

```
✖ REQ-08-01: .home__landing renderiza exactamente los componentes en el orden pedido
✖ REQ-08-02/03/04: adyacencias NewHero->LatestArticles, LatestHorizontal->Mxvi, Mxvi->PromoTiles
✔ REQ-08-05: <MxviLogosBanner aparece una sola vez en home.astro
✔ REQ-08-06: imports conservados y <SearchLive /> fuera de .home__landing
✔ REQ-08-11: archivos tocados con <=100 líneas
ℹ tests 5  ℹ pass 3  ℹ fail 2
```

Los tests 05, 06 y 11 ya pasaban antes del cambio. Son guardas de regresión: comprueban propiedades que el código ya cumplía y que la reubicación no debe romper.

Después de cambiar la aserción REQ-04-08 (y antes de tocar home.astro), `node --test tests/promo-tiles-section-ui.test.mjs`:

```
✖ REQ-04-08 (sustituido por REQ-08-09): home.astro importa PromoTiles y lo renderiza justo tras <MxviLogosBanner/>
✔ REQ-04-09/10/14/19 ...
```

## 3. Evidencia del verde

`node --test tests/mxvi-band-below-articles.test.mjs tests/promo-tiles-section-ui.test.mjs` da `tests 9, pass 9, fail 0`.

Suite completa (`node --test`): `tests 71, pass 71, fail 0`. Incluye `tests/mxvi-logos-banner.test.mjs` y `tests/mxvi-band-site-palette.test.mjs` en verde (REQ-08-07/08).

`./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Orden en el build (`dist/client/home/index.html`): `section.new-hero`, `section.latest-articles`, `section.mxvi-logos`, `section.promo-tiles`, y después `section.search-live` fuera del landing.

## 4. REQ-08-10: revisión visual (pendiente de confirmar en navegador)

En esta sesión no tenía navegador para capturar 375, 768 y 1280 px. Lo que sí revisé en el código:
- Sin scroll horizontal: `.home__landing { overflow-x: clip; }` (latest-cards-motion.css) recorta el full-bleed `100vw` de la cinta en cualquier posición.
- Escritorio (>=1201 px): el recorrido horizontal no usa el pin de ScrollTrigger (feature 73), sino el envoltorio `.latest-articles--horizontal-pin` y la reserva `margin-bottom` (latest-horizontal-reserve.css). El hermano siguiente, que antes era PromoTiles y ahora es la cinta, queda después de esa reserva, así que en el flujo no debería solaparse con las cards fijadas.
- Búsqueda en vivo: la cinta sigue dentro de `[data-landing-sections]` y se oculta junto con el resto.

Para cerrar REQ-08-10, el reviewer o el líder deberían verlo con `astro dev --background` a 375, 768 y 1280 px.
