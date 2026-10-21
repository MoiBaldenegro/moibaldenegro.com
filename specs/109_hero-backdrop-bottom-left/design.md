# Diseño — feature 109 hero-backdrop-bottom-left

## Contexto visual

- Componente: `.card-backdrop` de las cards de icono (hoy CLOUDFLARE `#cloudflare` sin tamaño, CLAUDE CODE `#anthropic-wordmark` `lg`, GITHUB `#github-wordmark` `md`), estilos en `src/styles/hero-card-accents.css` (57 líneas).
- Hoy (105/108): el tamaño se fija con `left`/`right` simétricos, así que un logo que no desborda (`sm`: 16px/10px a cada lado) queda centrado. Además CLOUDFLARE usa el `aspect-ratio: 4 / 1` genérico con un symbol de 512 × 76: el meet centrado del symbol lo deja centrado en vertical, separado del borde inferior.
- Deseado: alineación estática abajo-izquierda para cualquier tamaño.

## Tokens usados

Ninguno nuevo (geometría del logo, mismo criterio que 105/108). `tokens.css` no se toca.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — anclar por `left` + `width` con `right: auto`: el borde izquierdo es fijo por tamaño y el ancho define el tamaño. md y lg dan el mismo rectángulo que hoy (sin cambio visual con el JSON real).

| Tamaño | left (> 1200 / <= 1200 px) | width (> 1200 / <= 1200 px) | Efecto |
|--------|----------------------------|-----------------------------|--------|
| `sm` | 16px / 10px | 60% / 60% | Dentro de la card, pegado abajo-izquierda, hueco libre a la derecha |
| `md` (base) | -16px / -10px | calc(100% + 32px) / calc(100% + 20px) | Igual que la 105 |
| `lg` | -56px / -36px | calc(100% + 112px) / calc(100% + 72px) | Igual que la 108 |

- Decisión 2 — sin tocar `sprite.svg` (ajeno) no se puede cambiar el `preserveAspectRatio` del symbol (con `<use>` manda el del symbol); el glifo llena su caja solo si el `aspect-ratio` del svg es el del viewBox. Se añade la regla de `#cloudflare` (512 / 76) como ya tienen anthropic y github. Limitación: un logo de fondo nuevo necesita su regla de ratio (o `preserveAspectRatio="xMinYMax meet"` en su symbol, decisión del humano).
- Restricciones: sin JS, sin style inline, sin cambios en `.astro` ni JSON, `hero-card-accents.css` <= 100 líneas, `bottom: 0`, z-index 0, opacidad 0.06, título sin solape, contraste AA intacto (la opacidad no cambia).
- Peso: solo CSS; la portada debe seguir < 40 000 B. Si la hoja se inlina y no cabe, parar y reportar el peso.

## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600 (base `cdp108/`/`cdp105/` del scratchpad; a 375 px con la regla de la 106 desactivada por CDP): rectángulo del `use` frente a la card (borde izquierdo, hueco derecho, hueco inferior <= 2 px, solape 0 con el título) para CLOUDFLARE, CLAUDE CODE y GITHUB con sm/md/lg inyectados; con el JSON real CLAUDE CODE y GITHUB iguales a la línea base (±1 px). Capturas: `progress/research/hero109/<card>-<tamaño>-<w>.png`.

## Alternativa descartada

- `justify-content: flex-start` en el contenedor: no basta, el centrado viene del `left`/`right` simétricos y del meet del symbol.
- Editar `preserveAspectRatio` en `sprite.svg`: archivo ajeno.
