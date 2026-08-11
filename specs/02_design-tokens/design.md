# Diseño — design-tokens

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? Todo el sitio: los tokens son la base de presentación de todas las pantallas.
- ¿Estado actual y estado deseado? Actual: las variables de diseño viven en `:root` dentro de `src/styles/hero.css` (mezcladas con los estilos del hero) y el resto de hojas usan valores sueltos (hex, rgba, px). Deseado: un único archivo `src/styles/tokens.css` con las custom properties del diseño y el resto de hojas consumiendo `var(--...)`.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#070716` (paleta actual) | Fondo general del sitio |
| `--color-surface` | `#101018` | Superficies de tarjetas y paneles |
| `--color-text` | `#ffffff` | Texto principal |
| `--color-text-secondary` | `#b8b8c5` | Texto secundario |
| `--color-border` | `rgba(255,255,255,.08)` | Bordes suaves |
| `--color-border-strong` | `rgba(255,255,255,.15)` | Bordes destacados |
| `--color-accent` | `#7d68ff` (hover navbar actual) | Acentos y estados |
| `--color-marca-*` | hex actuales de hero.data.ts (react, html, node, github, youtube, twitch, typescript, css) | Fondos de tarjetas del hero |
| `--radius-card` | `22px` | Radios de tarjetas |
| `--gap-card` | `14px` | Espaciado de la cuadrícula |
| `--container-max` | `1500px` | Ancho máximo del contenedor |
| `--shadow-card` | `0 25px 80px rgba(0,0,0,.35)` | Sombras de tarjetas |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Transiciones |
| `--font-sans` | `Inter, ui-sans-serif, system-ui, sans-serif` | Tipografía del sitio |

## Decisiones y constraints

- Decisión 1: los tokens viven en un único archivo central `src/styles/tokens.css` importado por las hojas de estilos (nunca `<style>` embebido), siguiendo la arquitectura "Tokens, no valores sueltos".
- Decisión 2: los tokens de marca de las tarjetas se nombran `--color-marca-<tecnología>` (p. ej. `--color-marca-react`) y se derivan de los hex actuales de `hero.data.ts`; los datos futuros (feature 6) referenciarán `colorToken` en lugar de hex.
- Decisión 3: el test `tests/design-tokens.test.mjs` (node:test, test-first) verifica la existencia de tokens.css y de al menos un token por grupo, y el patrón `--grupo-nombre` kebab-case.
- Restricción del proyecto aplicable: sin dependencias externas (CSS puro con custom properties), ≤100 líneas por archivo y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: mantener las variables en `:root` de `hero.css` y solo documentarlas.
- Motivo del descarte: no centraliza el diseño, mezcla tokens con estilos de componente y perpetúa la violación de "Tokens, no valores sueltos".
