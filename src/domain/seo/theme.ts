// Color de tema del sitio (feature 63, REQ-63-01). El manifest y la meta theme-color no
// pueden leer custom properties: esta constante replica --color-background de
// src/styles/tokens.css (color opaco; --color-navbar es rgba). Un test vigila que token,
// constante y public/site.webmanifest coincidan.
export const THEME_COLOR = '#070716';
