# Diseño — Confirmar el copiado de código con región de estado y texto visible (feature 54 code-copy-status)

## Contexto visual

- Botón de copiar de los bloques de código de los artículos. Estado deseado: tras copiar aparece «Copiado» junto al icono 2 s; lectores de pantalla oyen «Código copiado».

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | #7d68ff | texto «Copiado» |
| `--font-sans` | Inter… | tipografía del texto |

## Decisiones y constraints

- Región de estado única por página, compartida por todos los bloques.
- Duración fija de 2000 ms para el texto visible.
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Mantener solo el cambio de aria-label.
- Motivo del descarte: No se anuncia de forma fiable (audit_a11y.md M5).
