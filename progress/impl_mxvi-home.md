# Implementación — feature 12 `mxvi-home`

Tercera fase del refactor del sitio al design system MXVI: la home usa las clases `.mx-*`.
Spec: `specs/12_mxvi-home/requirements.md` (REQ-12-01..16) y `design.md`. Fecha: 2026-11-11.

## 1. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/mxvi-home.test.mjs` | Nuevo, escrito antes del código: 9 tests para REQ-12-01..14 |
| `tests/hero-row-new-tools*.test.mjs`, `mxvi-logos-banner`, `mxvi-band-site-palette`, `promo-tiles-section-ui`, `square-corners-sitewide` | Contratos apuntados a las hojas del design system (`brand-colors`, `brand-geometry`, `logo-band`, `promo`, `buttons`, `tags`); línea base de radios 37 en 14 hojas |
| `src/components/new-hero/new-hero.astro` | `mx-hero` / `mx-hero__background` / `mx-hero__glow` / `mx-bento`; perfil `mx-profile-card` con `mx-handle` y `mx-verified` |
| `src/components/hero-card.astro`, `hero-card-art.astro`, `hero-cards/htb-card.astro` | `mx-brand-tile` con `data-brand`, `data-cols`, `data-rows`, `data-hide-mobile`; capas `__header`, `__title`, `__icon`, `__backdrop[data-size]`, `__corner`, `__link`, `__arrow`; rica `--rich`, `__body`, `__loading` |
| `src/components/htb-stadistics.astro` | `mx-tile-stats` y sus elementos |
| `src/components/latest-articles.astro` | `mx-page latest-articles`, `mx-heading`, `mx-article-list`, `mx-article-card` con `mx-media`, `mx-meta`, `mx-tag-list` / `mx-tag` |
| `src/components/mxvi-logos-banner.astro` | `mx-logo-band mx-logo-band--bleed` |
| `src/components/promo-tiles/promo-tiles.astro` | `mx-promo-grid`, `mx-promo-tile`, `mx-button--cta` / `--cta-outline` |
| `src/components/new-hero/hero-cards-motion.ts`, `latest-horizontal/*.ts` | Selectores `.mx-bento`, `.mx-brand-tile`, `data-hide-mobile`, `.mx-article-list`, `.mx-article-card` |
| `src/styles/hero-cards-motion.css` | Lego sobre `.mx-bento > .mx-brand-tile`; `.home-hero { min-height: 100vh }` |
| `src/styles/latest-horizontal.css`, `latest-horizontal-reserve.css` | Selectores `.mx-heading`, `.mx-article-list`, `.mx-article-card`; raíz con doble clase para ganar a `.mx-page` |
| `src/styles/typography.css` | Sin los selectores de las tarjetas del hero y de los artículos |
| 11 hojas | Eliminadas: hero-section, profile-card, hero-card, hero-card-accents, hero-card-link, hero-card-brands, htb-card, htb-stadistics, latest-articles, mxvi-logos-banner, promo-tiles |

## 2. Correcciones subidas al design system (`b646f3b`)

Bento a 1 columna por tarjeta entre 769 y 1200 px; foto del perfil con su proporción real y
banda 16:9 en tablet; interlineado móvil de la descripción; insignia de verificado con peso
normal; márgenes del meta de la tarjeta de artículo; banda de logos con color de texto, sin
desplazamiento con movimiento reducido y modificador `--bleed` (100vw).

## 3. Rojo y verde

`node --test` antes del código: 15 fallos (9 de la feature y 6 de contratos ajustados).
Después: `./init.sh` en verde (105/105 tests, build OK).

## 4. Regresión visual (REQ-12-15/16)

- Nueva línea base desde la feature 11 con un ancho más (1024 px) y la búsqueda con
  resultados: 24 capturas de página completa (home, about, artículo, búsqueda, búsqueda con
  `q`, 404 a 390/768/1024/1440). Resultado: 0 % en las 24.
- Modo horizontal a 1440 px sin movimiento reducido (build anterior frente al nuevo, 9
  posiciones de scroll): misma altura de página y misma posición de la sección; 0 % en 7 de
  9, y 0.025 % en las dos primeras, solo en bordes antialiasados de iconos rotados mientras
  GSAP anima las tarjetas del hero (el mismo build contra sí mismo da 0.005 %).
- Lego en móvil: solo anima la tarjeta visible y todas terminan con opacidad 1, igual que antes.
