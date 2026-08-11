# Diseño — hero-ui-refactor

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? `src/components/new-hero/new-hero.astro` y `src/components/hero-card.astro` en la portada.
- ¿Estado actual y estado deseado? Actual: `new-hero.astro` importa `heroCards` y `profile` directamente de `src/data/hero.data.ts` y `hero-card.astro` aplica `style={...}` inline con `--card-bg` y posiciones de cuadrícula. Deseado: ambos componentes consumen `HeroProfileRepository` y `HeroCardsRepository`, el frontmatter solo importa y pasa datos, y `hero-card.astro` usa `data-color-token` con clases (hojas de la feature 4); `src/data/hero.data.ts` se elimina.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-*` | de tokens.css | Fondos de tarjeta vía `data-color-token` |
| `--color-surface` | de tokens.css | Fondo del perfil |
| `--radius-card` | de tokens.css | Radios |
| `--shadow-card` | de tokens.css | Sombras |

## Decisiones y constraints

- Decisión 1: `new-hero.astro` obtiene `profile` y `cards` en el frontmatter a partir de los repositorios (única vía de acceso a datos) y los pasa como props.
- Decisión 2: `hero-card.astro` renderiza `<article class="hero-card" data-color-token={card.colorToken}>` y usa clases para posiciones; ningún `style` inline.
- Decisión 3: `src/data/hero.data.ts` se borra en esta feature porque es el último punto que lo importa (features 5 y 6 ya migraron su contenido a JSON).
- Restricción del proyecto aplicable: datos vía repositorio, lógica separada de la UI, estilos separados de la UI y ≤100 líneas por archivo.

## Alternativa descartada

- Alternativa considerada: mantener el acceso directo a `hero.data.ts` y solo quitar los estilos inline.
- Motivo del descarte: perpetúa la violación "Datos vía repositorio" y deja un archivo de datos obsoleto con tipos duplicados en el dominio.
