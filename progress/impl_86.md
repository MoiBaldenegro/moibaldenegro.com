# Informe de implementación — feature 86 geist-pixel-display

Variante: Geist Pixel **Circle** (`GeistPixel-Circle.woff2`), elección humana 2026-10-12.

## Tests escritos (antes del código)

- `tests/geist-pixel-display.test.mjs` (nuevo) — REQ-86-01..07 y REQ-86-16 (importa `astro.config.mjs`; Layout, tokens, typography, ausencia de `font-family` sobre h1/h2/sus clases en el resto de hojas, ≤100 líneas).
- `tests/geist-font-build.test.mjs` (ampliado) — REQ-86-08 (fusionado con REQ-85-17: ahora 2 preloads, uno de ellos el de Geist Pixel y `:root{--font-geist-pixel:`) y REQ-86-09 (los bytes de Circle se emiten en `_astro/fonts/`; los de Square, Grid, Triangle y Line no).

## Rojo (REQ-86-15) — anotado ANTES de tocar astro.config.mjs, Layout.astro, tokens.css y typography.css

`node --test tests/geist-pixel-display.test.mjs tests/geist-font-build.test.mjs`:

```
✔ REQ-85-16: dist/client/_astro/fonts contiene los woff2 de Geist y Geist Mono
✔ REQ-85-18: /, /about y un artículo sin URLs absolutas en @font-face ni en preloads de fuente
✔ REQ-86-07: ninguna otra hoja declara font-family sobre h1, h2 o sus clases
✔ REQ-86-16: archivos de la feature con 100 líneas o menos
✖ failing tests:
✖ REQ-85-17/REQ-86-08: / tiene 2 preloads woff2 crossorigin en /_astro/fonts/ (Geist y Geist Pixel)
✖ REQ-86-01: Geist Pixel con fontProviders.local(), --font-geist-pixel y solo GeistPixel-Circle.woff2 400 normal
✖ REQ-86-02: Geist Pixel con display swap y fallbacks terminados en monospace
✖ REQ-86-03: Layout.astro renderiza <Font> de --font-geist-pixel con preload en el head
✖ REQ-86-04: tokens.css define --font-display sobre --font-geist-pixel y mide <= 100 líneas
✖ REQ-86-05/06: typography.css pone h1 y h2 en --font-display con font-synthesis: none
✖ REQ-86-09: _astro/fonts contiene el woff2 de Pixel Circle y ninguna otra variante Pixel
ℹ fail 7
ℹ pass 4
ℹ tests 11
```

Los 4 en verde ya en rojo son guardas (REQ-85-16/18 sin cambios; REQ-86-07: hoy ninguna hoja declara `font-family` sobre un h1/h2; REQ-86-16: longitudes). Las 7 fallas cubren todos los REQ nuevos verificables de forma estática o en el build.
