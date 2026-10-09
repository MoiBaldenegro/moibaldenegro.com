# Diseño — Color de tema oscuro en site.webmanifest y meta theme-color (feature 63 theme-color-dark)

## Contexto visual

- Barra del navegador móvil, ventana de la PWA instalada y pantalla de arranque.
- Estado actual: site.webmanifest declara theme_color y background_color #ffffff y no hay meta theme-color: barra y splash blancos sobre un sitio oscuro.
- Estado deseado: barra y splash del color de fondo del sitio.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | #070716 | theme_color, background_color y meta theme-color |

## Decisiones y constraints

- Decisión 1: --color-background y no --color-navbar, que es rgba y el manifest exige un color opaco.
- Decisión 2: el manifest y la meta no pueden leer custom properties; la constante THEME_COLOR (src/domain/seo/theme.ts) replica el valor y un test vigila la igualdad token = constante = manifest.
- Decisión 3: la meta se emite desde el layout único (chrome compartido); el frontmatter solo importa la constante.
- Restricciones: sin dependencias, ≤100 líneas por archivo, estático, sin literales de color en componentes.

## Alternativa descartada

- Alternativa considerada: dos metas theme-color con media (prefers-color-scheme).
- Motivo del descarte: el sitio solo tiene tema oscuro.
