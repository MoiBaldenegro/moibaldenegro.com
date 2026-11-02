# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

_Feature en curso: 8 — mxvi-band-below-articles (in_progress, implementer, 2026-11-02)_

### Plan

- Test nuevo tests/mxvi-band-below-articles.test.mjs (orden, adyacencias, conteo, imports, líneas) y verlo en rojo
- Ajustar la aserción REQ-04-08 de tests/promo-tiles-section-ui.test.mjs (REQ-08-09)
- Mover <MxviLogosBanner/> tras <LatestHorizontal /> en src/pages/home.astro
- ./init.sh en verde y revisión visual a 375, 768 y 1280 px
- Informe en progress/impl_mxvi-band-below-articles.md

### Bitácora

- 2026-11-02: spec_author da de alta la feature 8 mxvi-band-below-articles (depends_on [7]); análisis en progress/research/mxvi-band-below-articles.md; spec en specs/08_mxvi-band-below-articles/requirements.md y design.md. Conflicto anotado: el test REQ-04-08 exige LatestHorizontal seguido de PromoTiles y se ajusta en REQ-08-09.
- 2026-11-02: implementer toma la feature 8 (in_progress).
- 2026-11-02: test nuevo tests/mxvi-band-below-articles.test.mjs en rojo (2 fallos de orden); aserción REQ-04-08 ajustada (REQ-08-09, rojo); home.astro reordenado; ./init.sh en verde (71/71, build OK). Informe en progress/impl_mxvi-band-below-articles.md. Revisión visual REQ-08-10 pendiente en navegador.

### Estado: feature 8 in_progress, lista para el reviewer.
