# Diseño — feature 89 site-footer

## Contexto visual

- Chrome compartido: el footer vive en `src/components/site-footer/site-footer.astro` y lo monta solo `Layout.astro` tras `<main>` (regla de un solo layout).
- Estilo acorde al sitio: fondo que funde `--color-background` con `--color-hero-bottom`, borde superior `--color-border-strong`, halo `--color-glow` arriba, títulos de columna en Geist Pixel (`--font-display`) y metadatos en Geist Mono.

## Estructura

| Zona | Contenido | Utilidad |
|------|-----------|----------|
| Marca | logo (enlace a /), titular y ubicación de about.json, CTA «Descargar CV» | identidad + conversión |
| Navegación | Inicio, About, Arquitectura, Buscar | rutas principales sin volver al header |
| Últimos artículos | 3 posts más recientes (PostsRepository + latestPosts) | descubrimiento de contenido |
| Conecta | GitHub, LinkedIn, YouTube, X con iconos del sprite | contacto |
| Barra inferior | © año + nombre, «Hecho con Astro · Cloudflare», Volver arriba (#top) | cierre y retorno |

## Tokens usados

| Token | Uso |
|-------|-----|
| `--color-background`, `--color-hero-bottom` | degradado de fondo |
| `--color-glow` | halo superior |
| `--color-border`, `--color-border-strong` | bordes y separador |
| `--color-text`, `--color-text-secondary` | texto y enlaces en reposo |
| `--color-accent`, `--color-accent-hover` | hover, CTA y marcador |
| `--gap-card`, `--radius-pill`, `--container-max`, `--transition-default` | espaciado, píldoras, ancho y transición |
| `--font-display`, `--font-mono` | títulos de columna y metadatos |

## Decisiones y constraints

- Decisión 1: títulos de columna como `<p>` dentro de `<nav aria-label>`/`<section aria-label>`, no h2: no altera la jerarquía de encabezados de las páginas (features 39 y 55).
- Decisión 2: «Volver arriba» es un ancla `#top` sin JavaScript (estático por defecto).
- Decisión 3: el año se calcula en build con `copyrightLine(name, now)`; la fecha es inyectable para el test.
- Restricciones: estático, sin dependencias, ≤100 líneas por archivo, estilos separados, solo tokens, reduced-motion.

## Alternativa descartada

- Formulario de newsletter o contacto: requiere backend y datos personales; fuera de alcance.
