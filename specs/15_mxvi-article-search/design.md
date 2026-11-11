# Diseño — feature 15 `mxvi-article-search`

## Contexto visual

- Fase 5 y última del refactor al design system MXVI: detalle de artículo
  (cabecera, prosa, copiar código, siguiente y recomendados), búsqueda (guía,
  sin resultados, resultados y paginación), panel de búsqueda en vivo de la
  home y página no encontrada pasan a las clases `.mx-*`. El resultado visual
  no cambia (REQ-15-13).
- El design system recibe antes lo que no reproducía: enlace al siguiente
  artículo, bloque de recomendados, título del resultado, texto grande y
  variante de página del aviso, imágenes de la prosa con su ancho natural,
  separación del texto «Copiado» y `[hidden]` por encima de los `display` de
  los componentes.

## Tokens usados

Ninguno nuevo.

## Decisiones y constraints

- Decisión 1: se conservan tres hojas propias del sitio con lo que no es
  diseño general: `article.css` (vídeo incrustado, figura `.post-image` y el
  color de fondo de Shiki dentro de `.mx-prose`), `search-live.css` (panel de
  resultados en vivo de la home) y `not-found.css` (relleno de la página).
- Decisión 2: `typography.css` se elimina porque `mxvi/base.css` ya declara la
  fuente del código y de los títulos.
- Decisión 3: los botones de la búsqueda (limpiar y paginación) conservan su
  texto compacto de 13.33px, que el sitio heredaba del navegador sin
  declararlo: el design system lo declara (0.8333rem) en `.mx-button--quiet` y
  en los botones de `.mx-pagination`.
- Restricciones: ≤100 líneas por archivo, estilos separados de la UI, sin
  dependencias, sin JavaScript de runtime nuevo.

## Alternativa descartada

- Usar `mxvi.js` para copiar código.
- Motivo del descarte: el script del sitio integra la región de estado
  accesible, el respaldo de `execCommand` y la idempotencia con las view
  transitions de Astro.
