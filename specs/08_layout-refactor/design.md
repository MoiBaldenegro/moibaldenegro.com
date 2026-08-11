# Diseño — layout-refactor

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? El chrome compartido de todas las páginas: `src/layouts/Layout.astro`.
- ¿Estado actual y estado deseado? Actual: `Layout.astro` es la plantilla del starter (lang="en", título "Astro Basics", `<style>` embebido con reset de html/body, sin navbar) mientras `new-hero.astro` duplica la navbar (Home, About, @moibaldenegro) con sus estilos en `hero.css`. Deseado: layout con lang="es", título por defecto `moibaldenegro.com` (título por página opcional), estilos separados en `src/styles/layout.css` (reset + navbar) con tokens, y la navbar compartida viviendo solo en el layout.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | de tokens.css | Fondo del documento |
| `--color-text` | de tokens.css | Color base del texto |
| `--color-surface` | de tokens.css | Fondo de la navbar |
| `--color-border-strong` | de tokens.css | Borde inferior de la navbar |
| `--color-accent` | de tokens.css | Hover y subrayado de enlaces |
| `--container-max` | de tokens.css | Ancho del contenido de la navbar |
| `--font-sans` | de tokens.css | Tipografía del documento |

## Decisiones y constraints

- Decisión 1: la navbar se mueve de `new-hero.astro` a `Layout.astro` como parte de este cambio atómico (chrome compartido en el layout único); los estilos de navbar pasan de `hero.css` a `layout.css`.
- Decisión 2: el layout acepta una prop `title` con valor por defecto `moibaldenegro.com`; las páginas pueden personalizar el `<title>`.
- Decisión 3: `lang="es"` y el reset de `html/body` se trasladan a `layout.css` consumiendo tokens; desaparece el `<style>` embebido.
- Restricción del proyecto aplicable: un solo layout, estilos separados de la UI, ≤100 líneas por archivo y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: dejar la navbar dentro de `new-hero.astro` y que cada página futura duplique su propio menú.
- Motivo del descarte: viola "Un solo layout" (el chrome compartido debe vivir solo en el layout) y duplicaría la navegación en cada página nueva.
