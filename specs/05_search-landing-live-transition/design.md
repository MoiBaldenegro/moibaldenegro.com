# Diseño — Transición dinámica del layout en la Landing (feature 5)

## Contexto visual

- **Qué pantalla**: portada `src/pages/index.astro` (hero, últimos artículos,
  estadísticas HTB).
- **Estado actual**: la portada muestra siempre sus secciones habituales; no
  reacciona a la búsqueda.
- **Estado deseado**: mientras la consulta activa tiene al menos un carácter,
  la portada oculta sus secciones habituales y muestra el panel de resultados
  en vivo (misma presentación que la vista dedicada, feature 3); al volver la
  consulta a `''`, las secciones se restauran de inmediato (sin recarga).
  El panel en vivo muestra como máximo `PAGE_SIZE` resultados y un enlace a
  la vista dedicada cuando hay más. Sin coincidencias: estado vacío con el
  término actual.

## Tokens usados (solo tokens existentes de tokens.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#070716` | Fondo de la portada (heredado) |
| `--color-surface` | `#101018` | Fondo del panel de resultados en vivo |
| `--color-border` | `rgba(255,255,255,.08)` | Borde del panel |
| `--color-text` | `#ffffff` | Texto principal del panel |
| `--color-text-secondary` | `#b8b8c5` | Mensaje del estado vacío |
| `--color-accent` | `#7d68ff` | Enlace "ver todos" a la vista dedicada |
| `--radius-card` | `22px` | Radio del panel |
| `--gap-card` | `14px` | Separación interna del panel |
| `--transition-default` | `.28s cubic-bezier(.2,.8,.2,1)` | Transición de aparición del panel |
| `--font-sans` | Inter… | Tipografía del sitio |

> Sin tokens nuevos.

## Decisiones y constraints

- Decisión 1 (mecanismo): un módulo controlador `.ts` (p. ej.
  `src/components/search-live/search-live.ts`) se suscribe al evento de
  cambio de consulta de la barra (feature 4, REQ-04-07) y alterna la clase de
  estado sobre la portada: con consulta no vacía oculta las secciones
  habituales (hidden) y muestra el panel en vivo; con `''` restaura
  (REQ-05-01..03). El `index.astro` integra el panel y su `<script>` importa
  el controlador (frontmatter solo imports y paso de datos, regla 8).
- Decisión 2 (presentación reutilizada): el panel en vivo reusa el componente
  de resultados de la feature 3 (`search-results`), de modo que la
  presentación es idéntica en la vista dedicada y en la portada
  (REQ-05-04). En modo en vivo el componente recibe la opción de mostrar solo
  los primeros `PAGE_SIZE` + enlace "ver todos" → `/search?q=<término>`
  (REQ-05-06).
- Decisión 3 (estado vacío): sin coincidencias el panel muestra el mensaje de
  la vista dedicada con el término actual (REQ-05-05) — sin acción de
  limpiar duplicada; el X de la barra y Escape (feature 6) cubren la limpieza.
- Decisión 4 (JS de runtime justificado): el live search y la transición
  dinámica son interacción en tiempo real → excepción explícita a "estático
  por defecto" (regla 9), REQ-05-07, con precedentes aprobados (24, 43, 44).
  Coste acotado a la portada y a la vista de búsqueda; sin dependencias
  nuevas (CustomEvent + DOM nativos).
- Decisión 5 (sin recarga): ocultar/mostrar secciones es puramente client-side
  (clases + hidden); no se re-renderiza el documento ni se toca el servidor.
  La restauración es inmediata al llegar la consulta a `''` (REQ-05-03).
- Restricciones aplicables: estilos en `src/styles/*.css` (la hoja del panel,
  p. ej. `search-live.css`, se importa desde el componente), tokens sin
  valores sueltos, ≤100 líneas por archivo.

## Alternativa descartada

- Alternativa considerada: re-renderizar la portada vía SSR por cada tecla
  (fetch al servidor con el término).
- Motivo del descarte: exigiría on-demand SSR en workerd por keystroke
  (rompe prerender-by-default, latencia y coste), cuando el índice ya vive en
  el cliente para la vista dedicada (feature 3): filtrar en el cliente es
  instantáneo y coherente con la arquitectura del sitio.
