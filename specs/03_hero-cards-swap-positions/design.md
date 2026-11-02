# Diseño — hero-cards-swap-positions

## Contexto visual

- Sección afectada: mosaico de tarjetas del hero (`src/components/new-hero/new-hero.astro`, motor `src/domain/hero-grid-layout.ts`, datos `src/data/hero-cards.json`).
- Estado actual: zona superior con `node` en el hueco grande (5x2); fila 1 = [nestjs GRANDE, css, react, html, claude-code]; fila 2 = [bash, webassembly, astro GRANDE, opencode, tauri].
- Estado deseado: zona superior con `nestjs` en el hueco grande (5x2); fila 1 = [node GRANDE, tauri, react, opencode, claude-code]; fila 2 = [bash, webassembly, astro GRANDE, html, css].

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-*` existentes | sin cambios | Cada tarjeta conserva su fondo; no se crean ni modifican tokens |

## Decisiones y constraints

- Decisión 1: el cambio es solo de datos (orden del array y campo `row` en `hero-cards.json`). No se tocan el motor, los componentes ni las hojas de estilo.
- Decisión 2: `featured` se trata como propiedad propia de la tarjeta, no como posicional. En el motor es `featured` lo que elige el hueco grande dentro de cada grupo (zona superior o fila), pero en los tres pares el valor coincide (node y nestjs son ambos `featured`; css, tauri, html y opencode ninguno), así que conservarlo por tarjeta deja exactamente una `featured` por grupo y el resultado es idéntico al de tratarlo como posicional.
- Decisión 3: la geometría del icono (`--icon-width`, `--icon-scale`, `--icon-rotation` en `hero-card.css` / `hero-card-brands.css`) va por `data-color-token` y viaja con la tarjeta; no se reajusta. node (240px, escala 7) pasa de un hueco 5x2 a uno 4x2 y nestjs (230px, escala 7) al revés: se valida en la regresión visual (REQ-03-13). Si no encaja, se abre feature aparte.
- Restricciones: estático, sin dependencias, ≤100 líneas por archivo, sin estilos nuevos.

## Alternativa descartada

- Alternativa considerada: intercambiar solo `title`/`icon`/`colorToken` dejando cada objeto en su sitio.
- Motivo del descarte: mezcla propiedades de marca (rotate, scale, iconWidth) con la posición y rompe la identidad `id` ↔ tarjeta; mover el objeto completo es más simple y trazable.
