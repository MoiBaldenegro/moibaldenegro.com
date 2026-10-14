# Diseño — feature 91 hero-card-registry

## Contexto visual

- Sección afectada: grid bento del hero (`src/components/new-hero/new-hero.astro`).
- Estado actual: `new-hero.astro` mapea las tarjetas directamente a `hero-card.astro` (un solo diseño posible).
- Estado deseado: `new-hero.astro` mapea cada tarjeta a `hero-cards/hero-grid-card.astro`, que elige el componente por `card.kind`. Sin cambio visual: las 12 tarjetas de icono se ven idénticas.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| (ninguno nuevo) | — | La feature no añade estilos; las tarjetas de icono siguen con `hero-card.css`. |

## Decisiones y constraints

- Decisión 1: el registro es un objeto literal en el frontmatter del despachador (imports + paso de datos); la resolución y el error viven en `src/domain/hero-card-registry.ts` (lógica separada de la UI, testable con objetos simples en node:test).
- Decisión 2: un `kind` sin componente registrado rompe el build con `HeroCardKindError` (nunca una celda vacía en silencio).
- Decisión 3: el despachador no envuelve la tarjeta en ningún elemento extra: el componente registrado es el ítem directo del grid (`.hero-grid > article`), para que hereden celdas, gap y reglas responsive.
- Receta de extensión (tipos futuros): 1) valor nuevo en `HERO_CARD_KINDS`; 2) componente `src/components/hero-cards/<kind>-card.astro` con raíz `article.hero-card` + `data-color-token` y su hoja `src/styles/<kind>-card.css`; 3) una entrada en el registro de `hero-grid-card.astro`; 4) la tarjeta en `hero-cards.json` y su regla `[data-color-token]` de fondo y celda en `hero-card.css`. `new-hero.astro` y `hero-section.css` no se tocan.
- Restricciones: estático, sin dependencias, ≤100 líneas por archivo, sin `<style>` ni `style=` inline, tokens.

## Alternativa descartada

- Alternativa: condicional por tipo en `new-hero.astro` (`card.kind === 'icon' ? ... : ...`).
- Motivo del descarte: cada tipo nuevo tocaría el núcleo del grid y mete lógica en la UI.
