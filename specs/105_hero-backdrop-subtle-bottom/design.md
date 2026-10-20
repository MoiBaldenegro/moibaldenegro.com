# Diseño — feature 105 hero-backdrop-subtle-bottom

## Contexto visual

- Componente: logo de fondo `.card-backdrop` de las cards de icono del hero (hoy CLAUDE CODE con `anthropic-wordmark` y GITHUB con `github-wordmark`). Estilos en `src/styles/hero-card-accents.css` (41 líneas).
- Hoy (103, revisión 1): franja left/right 22px (14px), bottom var(--gap-card), alto 40px (28px), opacidad 0.1, z-index 2: el wordmark se pinta encima del icono principal.
- Deseado (petición humana 2026-10-20): por debajo del icono principal, más sutil (0.06), más grande y desbordando por los lados, anclado al borde inferior de la card (recortado por el `overflow: hidden` de `.hero-card`).

## Tokens usados (solo de los tokens del diseño del proyecto)

- Ninguno nuevo; `tokens.css` no se toca. `--card-backdrop-opacity` sigue como custom property local (0.06).
- Los desplazamientos negativos (-16px / -10px) y los aspect-ratio son geometría del logo, no espaciados del sistema (mismo criterio que las medidas de `.card-icon svg`).

## Decisiones y constraints (valores por defecto revisables)

- Capa: `z-index: 0` en `.card-backdrop`. `.hero-card` ya tiene `isolation: isolate` (hero-card.css:7), y `.card-backdrop` va antes que `.card-icon` en el DOM (REQ-103-09), así que el icono principal (posicionado, sin z-index) se pinta encima. Queda por encima del fondo y del degradado `::before`, y por debajo del glow `::after`, de la esquina (3) y del header (4). Alternativa equivalente: `z-index: -1` (bajo `::before`, más tenue todavía).
- Opacidad: 0.1 → 0.06.
- Anclaje inferior: con `<use>` → `<symbol>`, el `preserveAspectRatio` que manda es el del symbol (xMidYMid meet por defecto; el sprite es ajeno). Un `preserveAspectRatio="xMidYMax meet"` en el svg exterior no tiene efecto sin un viewBox, y añadir el viewBox exigiría datos por logo en el marcado. Con un alto fijo de 80px, ANTHROPIC (182x24) quedaría centrado a unos 25 px del borde inferior. Por eso la franja **no declara height**: el svg toma `width: 100%; height: auto` con el aspect-ratio exacto del symbol, de modo que el glifo llena el svg y su borde inferior coincide con el `bottom: 0` de la card.
- Aspect-ratio por logo, ligado al symbol y no a la card: `.card-backdrop:has(use[href$="#anthropic-wordmark"]) svg { aspect-ratio: 182 / 24; }` y `.card-backdrop:has(use[href$="#github-wordmark"]) svg { aspect-ratio: 249.1 / 67.5; }`, con un respaldo de `4 / 1` en `.card-backdrop svg`. Un test comprueba que coinciden con los viewBox del sprite (que solo se lee).
- Tamaño y desborde: left/right -16px (-10px en <= 1200 px), bottom 0 en los dos rangos. El ancho del logo es el de la card + 32 px (+20 px): mayor que hoy y desbordando por los lados.
- Se mantiene: el título sin solape (el logo está abajo; la CDP lo comprueba), el contraste >= 4,5:1 (con 0.06 el compuesto se acerca al fondo de marca y el contraste sube), el mosaico, las cards sin backdrop, la esquina y el hover.
- Restricciones: sin transform, transition ni :hover en la hoja; sin JS; sin tocar `hero-card.css`, `tokens.css`, `hero-cards.json` ni el marcado de `hero-card.astro` (no hace falta).

## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600 px, con el medidor `cdp103/m-r1.mjs` del scratchpad como base. Se mide: la rejilla 20x5 con `elementsFromPoint` (el fondo nunca antes que el icono principal), el borde inferior del `use` frente al de la card (<= 2 px), la opacidad y el z-index calculados, el solape del título, el contraste compuesto, los 15 rectángulos frente a la línea base, el scroll del hero y los errores. Capturas: `progress/research/hero105/<claude-code|github>-<w>.png`.

## Alternativa descartada

- Propuesta del implementer (alto fijo de 80px / 56px y bottom -8px / -6px): con meet centrado, el wordmark ancho no llega al borde inferior; y si lo limitara el alto, se recortarían 8 px por abajo. Se sustituye por el alto que da el aspect-ratio y bottom 0 (left/right -16/-10 se adoptan).
- `preserveAspectRatio` + `viewBox` en el svg exterior: añade datos de geometría por logo en el `.astro` o en el JSON. Se descarta en favor de las reglas `:has(use[href$=...])` en la hoja.
