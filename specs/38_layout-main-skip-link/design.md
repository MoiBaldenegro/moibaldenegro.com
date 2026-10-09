# Diseño — Un único main en el Layout y enlace «Saltar al contenido» (feature 38 layout-main-skip-link)

## Contexto visual

- Todas las páginas. Estado actual: sin skip link y main incoherente. Estado deseado: al pulsar Tab desde la carga aparece arriba a la izquierda una pastilla «Saltar al contenido» que lleva al main.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | #7d68ff | fondo del skip link |
| `--color-text` | #ffffff | texto del skip link |
| `--radius-pill` | 999px | forma de pastilla |

## Decisiones y constraints

- main id="contenido" con tabindex="-1" para que el foco aterrice de forma fiable al seguir el enlace.
- Los main antiguos pasan a div/section conservando la clase para no tocar su CSS.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Mantener el main en cada página y solo añadir el skip link.
- Motivo del descarte: En la portada el main seguiría sin envolver todo el contenido principal.
