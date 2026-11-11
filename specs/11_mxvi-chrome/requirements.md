# Requisitos — feature 11 `mxvi-chrome`

## Requisitos

REQ-11-01 El script scripts/sync-mxvi.mjs SHALL copiar también base.css del design system en src/styles/mxvi/.
REQ-11-02 src/layouts/Layout.astro SHALL importar ../styles/mxvi/base.css en lugar de ../styles/layout.css.
REQ-11-03 El header SHALL usar las clases mx-navbar, mx-navbar__inner, mx-navbar__toggle, mx-navbar__menu, mx-logo y mx-nav-link del design system.
REQ-11-04 El enlace de salto al contenido SHALL usar la clase mx-skip-link.
REQ-11-05 La barra de búsqueda SHALL usar las clases mx-search, mx-search__form, mx-search__icon, mx-search__input y mx-search__clear.
REQ-11-06 El footer SHALL usar las clases mx-footer, mx-footer__inner, mx-footer-brand, mx-footer__column, mx-label, mx-link-list, mx-link y mx-footer-bar.
REQ-11-07 El texto solo para lectores de pantalla SHALL usar la clase mx-visually-hidden.
REQ-11-08 El repositorio SHALL eliminar layout.css, site-menu.css, search-bar.css, search-bar-icon.css y site-footer.css de src/styles.
REQ-11-09 Los archivos de src SHALL dejar de usar las clases site-navbar, site-menu, search-bar, site-footer, skip-link y visually-hidden sin prefijo.
REQ-11-10 El script del menú móvil SHALL localizar el header por la clase mx-navbar y conservar los atributos data-site-menu-toggle y data-site-menu.
REQ-11-11 La hoja typography.css SHALL dejar de declarar la fuente de los enlaces del header y del campo de búsqueda.
REQ-11-12 Cada página del sitio SHALL mostrar el mismo resultado visual que antes del cambio, WHERE la página es home, about, detalle de artículo, búsqueda o 404 a 390, 768 y 1440 px de ancho.
