# Diseño — Respetar prefers-reduced-motion en animaciones y transiciones (feature 56 reduced-motion)

## Contexto visual

- Hero de la portada y tarjetas. Estado deseado con reduce: glow estático y tarjetas sin elevación; sin reduce: idéntico al actual.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-default` | .28s cubic-bezier(.2,.8,.2,1) | se conserva sin reduce |

## Decisiones y constraints

- no-preference en la animación del hero (opt-in) y reduce global como red de seguridad.
- Sin tocar las view transitions, que ya se desactivan solas.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Eliminar la animación del glow para todos.
- Motivo del descarte: Es una decisión de diseño del humano; aquí solo se respeta la preferencia.
