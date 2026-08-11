# Diseño — about-page

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? Nueva página `/about` enlazada desde la navbar del layout (hoy el enlace devuelve 404).
- ¿Estado actual y estado deseado? Actual: no existe `src/pages/about.astro`. Deseado: página con el layout único, que muestra nombre, username y descripción del autor obtenidos de `HeroProfileRepository`, sin inventar contenido.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | de tokens.css | Fondo de la página |
| `--color-text` | de tokens.css | Texto principal |
| `--color-text-secondary` | de tokens.css | Username |
| `--color-border` | de tokens.css | Bordes |
| `--color-surface` | de tokens.css | Tarjeta de perfil |
| `--radius-card` | de tokens.css | Radios |
| `--gap-card` | de tokens.css | Espaciado |
| `--container-max` | de tokens.css | Ancho del contenido |

## Decisiones y constraints

- Decisión 1: se crea la página (no se quita el enlace): la navbar ya la referencia y un sitio personal necesita la ruta funcional; el contenido se limita a los datos reales del perfil.
- Decisión 2: la página usa el layout único y pasa su propio título (`About — moibaldenegro.com`).
- Decisión 3: la hoja `src/styles/about.css` sigue el patrón del sitio (BEM ligero, tokens) y el test `tests/about-page.test.mjs` verifica su existencia y límites; la generación de la ruta se comprueba en el build.
- Restricción del proyecto aplicable: rutas explícitas (una página por archivo), un solo layout, datos vía repositorio, ≤100 líneas por archivo y tokens.

## Alternativa descartada

- Alternativa considerada: quitar el enlace "About" de la navbar para no tener una ruta huérfana.
- Motivo del descarte: degrada el sitio (un enlace roto pasa a ser navegación eliminada) y contradice la intención visible en el diseño actual del navbar.
