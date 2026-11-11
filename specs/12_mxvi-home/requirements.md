# Requisitos — feature 12 `mxvi-home`

## Requisitos

REQ-12-01 El hero de la home SHALL usar las clases mx-hero, mx-hero__background, mx-hero__glow y mx-bento del design system.
REQ-12-02 La tarjeta de perfil SHALL usar las clases mx-profile-card, mx-profile-card__image, mx-profile-card__content, mx-handle, mx-verified, mx-profile-card__name y mx-profile-card__description.
REQ-12-03 Cada tarjeta de marca SHALL usar la clase mx-brand-tile con los atributos data-brand, data-cols y data-rows.
REQ-12-04 Una tarjeta de marca SHALL llevar el atributo data-hide-mobile, WHERE su dato showOnMobile no es verdadero.
REQ-12-05 Las capas de la tarjeta de marca SHALL usar las clases mx-brand-tile__header, mx-brand-tile__title, mx-brand-tile__icon, mx-brand-tile__backdrop, mx-brand-tile__corner, mx-brand-tile__link y mx-brand-tile__arrow.
REQ-12-06 La tarjeta de Hack The Box SHALL usar las clases mx-brand-tile--rich, mx-brand-tile__body y mx-brand-tile__loading.
REQ-12-07 Las estadísticas de Hack The Box SHALL usar las clases mx-tile-stats, mx-tile-stats__list, mx-tile-stats__item, mx-tile-stats__label, mx-tile-stats__value y mx-tile-stats__empty.
REQ-12-08 La sección de últimos artículos SHALL usar las clases mx-page, mx-heading, mx-article-list, mx-article-card, mx-article-card__link, mx-media, mx-article-card__image, mx-article-card__title, mx-meta, mx-article-card__description, mx-tag-list y mx-tag.
REQ-12-09 La banda de logos SHALL usar las clases mx-logo-band, mx-logo-band__track, mx-logo-band__link y mx-logo-band__logo.
REQ-12-10 La sección promocional SHALL usar las clases mx-promo-grid, mx-promo-tile, mx-promo-tile__title, mx-promo-tile__subtitle, mx-promo-tile__actions, mx-button--cta, mx-button--cta-outline y mx-promo-tile__image.
REQ-12-11 Los scripts de movimiento de la home SHALL localizar las tarjetas y los artículos por las clases mx-bento, mx-brand-tile, mx-article-list y mx-article-card.
REQ-12-12 El repositorio SHALL eliminar de src/styles las hojas hero-section.css, profile-card.css, hero-card.css, hero-card-accents.css, hero-card-link.css, hero-card-brands.css, htb-card.css, htb-stadistics.css, latest-articles.css, mxvi-logos-banner.css y promo-tiles.css.
REQ-12-13 Los archivos de src SHALL dejar de usar los atributos data-color-token, data-col-span, data-row-span y data-show-on-mobile.
REQ-12-14 La hoja typography.css SHALL dejar de declarar la fuente de los títulos de las tarjetas del hero y de los artículos de la home.
REQ-12-15 La home SHALL mostrar el mismo resultado visual que antes del cambio, WHERE el ancho es 390, 768, 1024 o 1440 px.
REQ-12-16 El modo horizontal de últimos artículos SHALL mostrar el mismo resultado visual que antes del cambio, WHERE el ancho es 1440 px sin movimiento reducido.
