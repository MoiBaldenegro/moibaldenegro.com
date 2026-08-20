# Diseño — Eliminar el salto horizontal al navegar por el navbar (feature 14)

## Contexto visual

- **Superficie afectada:** `src/styles/layout.css` (reset global + navbar),
  importada por `src/layouts/Layout.astro` en todas las páginas.
- **Estado actual:** scrollbar global estilizado con `::-webkit-scrollbar {
  width: 10px }` (solo visible con overflow). Con ClientRouter se navega entre
  páginas de alturas distintas → el scrollbar aparece/desaparece y el viewport
  se ensancha/estrecha ~10px → el contenido centrado «salta» ~5px a la derecha
  al hacer clic en el nav.
- **Estado deseado:** el ancho del viewport permanece estable durante la
  navegación; el contenido no se desplaza.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| — | — | Sin tokens nuevos: `scrollbar-gutter` es una propiedad de layout (no color/radio/transición); las reglas `::-webkit-scrollbar` existentes usan `--color-scrollbar-thumb` / `--color-scrollbar-track` y se conservan |

## Decisiones y constraints

- Decisión 1: `html { scrollbar-gutter: stable; }` en layout.css (reset
  global). Reserva permanentemente el hueco del scrollbar vertical: el
  scrollbar deja de aparecer/desaparecer y el viewport conserva el ancho en
  cada navegación. Soporte: Chrome/Edge 94+, Firefox 97+, Safari 18.2+.
- Decisión 2: el hueco reservado muestra el track deshabilitado en páginas sin
  overflow (comportamiento esperado de `stable`); las reglas
  `::-webkit-scrollbar` existentes no cambian.
- Restricciones del proyecto: estático por defecto (cero JS de runtime),
  ≤100 líneas por archivo (layout.css pasa de 69 a ~70), tokens.

## Alternativa descartada

- Alternativa considerada: `html { overflow-y: scroll; }` (forzar el scrollbar
  siempre visible).
- Motivo del descarte: regresión estética (track permanente en todas las
  páginas, incluso las cortas) y comportamiento inconsistente con los overlay
  scrollbars de macOS (no ocupan espacio → el fix no aplica allí pero el
  track forzado sí se vería distinto). `scrollbar-gutter: stable` reserva el
  espacio solo cuando hace falta, sin forzar el track visible.