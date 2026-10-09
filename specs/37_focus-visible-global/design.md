# Diseño — Foco visible global en controles interactivos y × del buscador con objetivo táctil de 32px (feature 37 focus-visible-global)

## Contexto visual

- Header (buscador) y controles de /search. Estado actual: el input no muestra anillo de foco y el × es diminuto. Estado deseado: anillo de acento de 2px en cualquier control enfocado por teclado y × de 32×32 px.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | #7d68ff | anillo de foco (5.04:1 sobre el fondo) |
| `--color-text-secondary` | #b8b8c5 | glifo del × |

## Decisiones y constraints

- :where() mantiene especificidad 0 para que los componentes puedan ajustar el offset sin !important.
- Se conserva el cambio de borde del input como refuerzo, no como único indicador.
- Restricciones: solo tokens, estilos en src/styles, ≤100 líneas.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Mantener solo el cambio de borde con un token más claro.
- Motivo del descarte: No llega a 3:1 de cambio de contraste exigido por 1.4.11.
