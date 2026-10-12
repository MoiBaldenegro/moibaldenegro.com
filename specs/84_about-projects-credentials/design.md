# Diseño — Proyectos, contenido, formación y filosofía (feature 84 about-projects-credentials)

## Contexto visual

- Pantalla: /about, debajo del stack (feature 83). Cierra la página: proyectos → contenido →
  formación/certificaciones/idiomas → filosofía (cita de cierre).

```
Proyectos destacados (h2)
┌ Raúl ↗ ──────────┐ ┌ mouter-router ↗ ─┐ ┌ MFinance ↗ ──────┐
│ descripción      │ │ descripción      │ │ descripción      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
┌ Testimo ↗ ───────┐ ┌ Harness Kit ↗ ───┐   repeat(auto-fit, minmax(260px, 1fr))

Contenido (h2)
Articulos dedicados a la ingeniería de software …   (p.about__intro, slot)
┌ Blog ──────────────────────┐ ┌ Curso de Rust desde Cero ─┐

Formación y certificaciones (h2)
┌ Educación (h3) ┐ ┌ Certificaciones (h3) ┐ ┌ Idiomas (h3) ┐

Filosofía (h2)
┃ “Deterministic Engineering in an Agentic World”   (lang="en", grande)
┃ Uso la IA para construir software, pero con procesos verificables …
```

## Hojas

- `about-projects.css`: proyectos y contenido (tarjetas enlazadas, rejilla).
- `about-credentials.css`: formación/certificaciones/idiomas y filosofía (cita con
  `border-left` de acento).
- `.about__intro` sigue en about.css (REQ-39-06, color `--color-text-secondary`).

## Tokens usados (solo de tokens.css; no se añaden tokens)

| Token | Uso |
|-------|-----|
| `--color-surface` | fondo de tarjetas |
| `--color-border` / `--color-border-strong` | borde en reposo / hover y foco de tarjetas |
| `--color-accent` / `--color-accent-hover` | títulos enlazados, borde de la cita, outline de foco |
| `--color-text` / `--color-text-secondary` | títulos y lema / descripciones, emisores, niveles |
| `--radius-card` | tarjetas |
| `--shadow-card-rest` / `--shadow-card-hover` | sombras de tarjetas |
| `--transition-default` | hover (anulado con prefers-reduced-motion) |
| `--gap-card` | todo margin/padding/gap (o calc() sobre él) |
| `--font-sans` | tipografía |

## Decisiones y constraints

- D1 Tarjetas de proyecto: el enlace está en el h3 (no toda la tarjeta envuelta en `<a>`) para
  que el lector de pantalla anuncie un nombre corto; texto visually-hidden " (sitio externo)".
- D2 Solo datos verificados de la investigación (autoría alta). Excluidos Cinnamon, "neww relic",
  Salud Digna y el canal homónimo.
- D3 La filosofía cierra la página como cita (`<blockquote>` con `<p lang="en">` para el lema y un
  `<p>` en español), sin comillas tipográficas en los datos (se añaden por CSS `::before/::after`
  si se desea, con `content` decorativo).
- D4 El literal `<p class="about__intro">{SITE_DESCRIPTION}</p>` entra por `<slot />` en la
  sección Contenido: contextualiza el blog y mantiene REQ-39-05 sin cambiar el test.
- Restricciones: estilos separados, ≤100 líneas, sin JS, tokens.css intacto, solo tokens (el
  sitio no define tema claro).

## Alternativa descartada

- Tarjeta entera como enlace (`<a>` envolviendo h3 + descripción): descartada porque el nombre
  accesible del enlace sería el texto completo de la tarjeta.
- Embeber vídeos de YouTube: descartado; añade iframes de terceros y peso a la página.
