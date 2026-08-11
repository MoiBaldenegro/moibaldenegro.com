# Diseño — hero-section-styles

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La sección principal (hero) de la portada: fondo degradado, capa de ruido, navbar, cuadrícula de 12 columnas y sus media queries.
- ¿Estado actual y estado deseado? Actual: estos estilos viven dentro de `src/styles/hero.css` (782 líneas, mezclados con tarjetas y perfil, con valores sueltos). Deseado: `src/styles/hero-section.css` de ≤100 líneas, consumiendo tokens, importada por `new-hero.astro` junto a las hojas de tarjetas (feature 4).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | de tokens.css | Fondo base de la sección |
| `--color-surface` | de tokens.css | Fondo de la navbar |
| `--color-border-strong` | de tokens.css | Borde inferior de la navbar |
| `--color-accent` | de tokens.css | Subrayado y hover de enlaces |
| `--color-text` | de tokens.css | Texto de la navbar |
| `--radius-card` | de tokens.css | Radios de la sección |
| `--gap-card` | de tokens.css | Separación de la cuadrícula |
| `--container-max` | de tokens.css | Ancho de la cuadrícula y la navbar |
| `--transition-default` | de tokens.css | Transiciones |

## Decisiones y constraints

- Decisión 1: se extrae únicamente lo que pertenece a la sección (fondo, navbar, grid y sus media queries); los estilos de `.hero-card`, `.profile-card` y sus media queries quedan para la feature 4.
- Decisión 2: `new-hero.astro` importa `hero-section.css`; los valores de color, radio, sombra y transición salen de `var(--...)`; sin hex ni unidades hardcodeadas.
- Decisión 3: el test `tests/hero-section-styles.test.mjs` verifica el límite de 100 líneas y la ausencia de valores hex/rgba en la hoja.
- Restricción del proyecto aplicable: ≤100 líneas por archivo, estilos separados de la UI y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: dividir `hero.css` en dos partes iguales por longitud (parte 1 y parte 2) para respetar las 100 líneas.
- Motivo del descarte: la división por componente (feature 3 para la sección, feature 4 para tarjetas/perfil) respeta la convención "un componente = un archivo de estilos" y deja hojas con una única responsabilidad.
