# Diseño — hero-cards-styles

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? Las tarjetas tecnológicas (`hero-card.astro`) y la tarjeta de perfil (markup dentro de `new-hero.astro`) en la portada.
- ¿Estado actual y estado deseado? Actual: estilos de `.hero-card` y `.profile-card` dentro de `src/styles/hero.css`, y `hero-card.astro` aplica `style={...}` inline con `--card-bg`, `--icon-rotation`, `--icon-scale`, `--icon-width`, `grid-column` y `grid-row`. Deseado: hojas `hero-card.css` y `profile-card.css` de ≤100 líneas cada una, el fondo de cada tarjeta vía `data-color-token` y las posiciones de cuadrícula como variables aplicadas desde la hoja.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-react` | de tokens.css | Fondo de la tarjeta react vía `data-color-token="react"` |
| `--color-marca-html` | de tokens.css | Fondo de la tarjeta html |
| `--color-marca-node` | de tokens.css | Fondo de las tarjetas node |
| `--color-marca-github` | de tokens.css | Fondo de las tarjetas github |
| `--color-marca-youtube` | de tokens.css | Fondo de las tarjetas youtube |
| `--color-marca-twitch` | de tokens.css | Fondo de las tarjetas twitch |
| `--color-marca-typescript` | de tokens.css | Fondo de la tarjeta typescript |
| `--color-marca-css` | de tokens.css | Fondo de la tarjeta css |
| `--color-surface` | de tokens.css | Fondo de la tarjeta de perfil |
| `--color-border` | de tokens.css | Bordes de tarjetas |
| `--radius-card` | de tokens.css | Radios |
| `--shadow-card` | de tokens.css | Sombras |
| `--transition-default` | de tokens.css | Transiciones |

## Decisiones y constraints

- Decisión 1: `hero-card.css` define `[data-color-token="react"] { --card-bg: var(--color-marca-react); }` y reglas análogas; la feature 9 aplica el atributo desde los datos y la feature 6 guarda `colorToken` en el JSON.
- Decisión 2: las posiciones `grid-column` y `grid-row` dejan de ser inline: la hoja usa los tokens de cuadrícula (`--card-column` y `--card-row` definidos en la propia hoja para cada tarjeta) o clases BEM; el atributo `style` desaparece del componente.
- Decisión 3: `src/styles/hero.css` se elimina por completo en esta feature (todo su contenido queda repartido entre las hojas 3 y 4).
- Restricción del proyecto aplicable: estilos separados de la UI (sin `style` inline), ≤100 líneas por archivo y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: mantener los colores hex en el JSON y seguir aplicándolos con `style={...}` inline en el componente.
- Motivo del descarte: viola "Estilos separados de la UI" y "Tokens, no valores sueltos"; el mapeo por `data-color-token` mantiene la presentación en CSS y los datos libres de valores de presentación.
