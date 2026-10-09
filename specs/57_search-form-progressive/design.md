# Diseño — Buscador del header como formulario de búsqueda con mejora progresiva (feature 57 search-form-progressive)

## Contexto visual

- Buscador del header en todas las páginas. Estado deseado: mismo aspecto; funciona sin JS; en /search muestra el término buscado.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `(sin cambios)` | - | Se conservan los tokens actuales de search-bar.css |

## Decisiones y constraints

- Elemento <search> nativo para el landmark, sin role redundante.
- Se oculta el × nativo de type=search para conservar el × propio.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Añadir un botón visible de enviar.
- Motivo del descarte: Cambia el diseño del header; Enter y envío nativo bastan.
