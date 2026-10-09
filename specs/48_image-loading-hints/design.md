# Diseño — Dimensiones, prioridad y carga diferida en las imágenes (CLS y LCP) (feature 48 image-loading-hints)

## Contexto visual

- Logo del header, hero de la portada, portada del post y miniaturas. Estado deseado: misma apariencia, sin saltos de layout al cargar.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `(ninguno nuevo)` | - | Solo atributos HTML; las reglas existentes conservan sus tokens |

## Decisiones y constraints

- width/height intrínsecos para reservar la proporción; el tamaño visual lo sigue fijando el CSS.
- fetchpriority solo en una imagen por página (la LCP).
- Restricciones del proyecto: estático por defecto, sin dependencias, ≤100 líneas por archivo, estilos en src/styles/*.css importados por el componente, solo tokens de tokens.css.

## Alternativa descartada

- Alternativa considerada: Usar <Image> de astro:assets para srcset automático.
- Motivo del descarte: Requiere Cloudflare Images activo en la zona (no verificado) y cambia el pipeline de imágenes.
