# Requisitos — Registro de componentes por tipo de tarjeta del hero (feature 91 hero-card-registry)
# Origen: petición humana 2026-10-14 (inyectar en el grid del hero cards de otro diseño y poder extender nuevas en el futuro). Análisis: progress/research/hero-extensible-cards.md.
# Toca UI/presentación: ver design.md en esta carpeta. Depende de la feature 90 (HeroGridCard y HERO_CARD_KINDS).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-91-01→1, REQ-91-02→1, REQ-91-03→2, REQ-91-04→2, REQ-91-05→3, REQ-91-06→3, REQ-91-07→4, REQ-91-08→4, REQ-91-09→5, REQ-91-10→5.

## Requisitos

REQ-91-01 La función pickCardComponent de src/domain/hero-card-registry.ts SHALL devolver la entrada del registro recibido asociada al kind recibido.
REQ-91-02 IF el registro no contiene entrada para el kind recibido, THEN pickCardComponent SHALL lanzar HeroCardKindError con el kind en el mensaje.
REQ-91-03 El componente src/components/hero-cards/hero-grid-card.astro SHALL recibir la prop card tipada como HeroGridCard y renderizar el componente que pickCardComponent devuelve para card.kind con card={card}.
REQ-91-04 El registro de componentes por tipo SHALL ser un único objeto literal en el frontmatter de hero-grid-card.astro que asocia icon con src/components/hero-card.astro.
REQ-91-05 El componente new-hero.astro SHALL renderizar cada tarjeta de getCards() mediante HeroGridCard con card={card} y sin condicionales por tipo de tarjeta.
REQ-91-06 El componente src/components/hero-card.astro SHALL conservar su marcado article.hero-card con data-color-token y su prop card tipada como HeroCard.
REQ-91-07 El HTML de build de la portada SHALL contener las 12 tarjetas de icono con article.hero-card y su data-color-token en el mismo orden que hero-cards.json.
REQ-91-08 Los archivos src/components/new-hero/new-hero.astro y src/styles/hero-section.css SHALL quedar sin cambios de geometría del grid, WHERE la receta de extensión del design.md añade tipos sin tocarlos.
REQ-91-09 WHEN se implemente la feature, el test tests/hero-card-registry.test.mjs SHALL observarse en rojo antes de escribir el módulo de dominio o el despachador.
REQ-91-10 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
