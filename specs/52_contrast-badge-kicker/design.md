# Diseño — Contraste y texto accesible de la insignia verificado y contraste del kicker del artículo (feature 52 contrast-badge-kicker)

## Contexto visual

- Insignia ✓ del hero de la portada y kicker «#etiqueta» de la cabecera del artículo. Estado deseado: misma forma, colores con contraste suficiente.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-verified` | #0a6f9e (antes #17b8ff) | fondo de la insignia |
| `--color-text` | #ffffff | glifo ✓ |
| `--color-accent-hover` | #9a89ff | texto del kicker |

## Decisiones y constraints

- #0a6f9e es el primer azul de la misma familia que cumple 4.5:1 con blanco y 3:1 con el fondo del username (valores calculados en el análisis).
- El borde del kicker conserva --color-accent.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Texto oscuro sobre el azul actual de la insignia.
- Motivo del descarte: Rompe el estilo de marca del perfil.
