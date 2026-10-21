# Diseño — feature 108 hero-backdrop-size

## Contexto visual

- Componente: logo de fondo `.card-backdrop` de las cards de icono (hoy CLAUDE CODE con `anthropic-wordmark` y GITHUB con `github-wordmark`), estilos en `src/styles/hero-card-accents.css` (49 líneas).
- Hoy (105): left/right -16px (-10px en `<= 1200 px`), bottom 0, alto por aspect-ratio del symbol, opacidad 0.06, z-index 0.
- Deseado: el tamaño se elige desde `hero-cards.json` con `backgroundIconSize`; si falta, la geometría de la 105.

## Tokens usados (solo de los tokens del diseño del proyecto)

Ninguno nuevo. Los desplazamientos son geometría del logo (mismo criterio que la 105); `tokens.css` no se toca.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — enum cerrado y no número: la convención prohíbe `style=` en `.astro`, y un número libre exigiría style inline o una regla por cada valor posible. `HERO_BACKDROP_SIZES = ['sm', 'md', 'lg']` en la entidad, validado en el parse; `data-backdrop-size` en `div.card-backdrop` (solo si el JSON lo declara) y una regla por valor.
- Decisión 2 — valores:

| Tamaño | left/right (> 1200 px) | left/right (<= 1200 px) | Efecto |
|--------|------------------------|-------------------------|--------|
| `sm` | 16px | 10px | El logo queda dentro de la card |
| `md` (por defecto) | -16px | -10px | Geometría de la 105 (base de `.card-backdrop`, sin regla propia) |
| `lg` | -56px | -36px | Logo mayor, desborda más (recorte del overflow) |

  El alto sigue saliendo del aspect-ratio del symbol (105), así que `bottom: 0` mantiene el glifo anclado abajo en los tres tamaños; el `margin-bottom` de `anthropic-wordmark` es un % del ancho y escala solo.
- Decisión 3 — en el JSON, claude-code y github declaran `"md"` (sin cambio visual; deja el campo visible para editarlo). `backgroundIconSize` sin `backgroundIcon` es error de datos.
- Restricciones: sin JS, sin style inline, `hero-card.css`/`tokens.css` sin tocar, `hero-card-accents.css` ≤ 100 líneas, sin tocar `sprite.svg`.
- Presupuesto de peso (REQ-108-17/18): la portada debe seguir < 40 000 B (REQ-47-06, umbral intacto); los dos `data-backdrop-size="md"` suman ≈ 48 B sobre lo que dejen la 106 (≈ 39 802 B) y la 107. Medir `dist/client/index.html` antes y después y, si no cabe sin debilitar el propósito, parar en `blocked` y reportar el peso.

## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600 (base `cdp105/` del scratchpad), inyectando `data-backdrop-size` sm/md/lg en CLAUDE CODE y GITHUB: ancho del `use` (sm < interior de la card < md < lg), borde inferior a ≤ 2 px del de la card, solape 0 con el título, y con el JSON real los rectángulos iguales a la línea base (±1 px). Capturas: `progress/research/hero108/<card>-<tamaño>-<w>.png`.

## Alternativa descartada

- Número en el JSON pasado como custom property por `style`: prohibido por la convención (sin style inline).
- Escala con `transform: scale()`: rompería el anclaje inferior y contradice REQ-105-03 (sin transform en la hoja).
