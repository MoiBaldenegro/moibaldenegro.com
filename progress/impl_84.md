# Implementación — feature 84 about-projects-credentials

Spec: `specs/84_about-projects-credentials/requirements.md` (REQ-84-01..22) y `design.md`.

## Rojo (REQ-84-20)

`tests/about-projects-credentials.test.mjs` (99 líneas) se escribió y se ejecutó ANTES de crear
`about-projects.astro`, `about-content.astro`, `about-credentials.astro`, `about-philosophy.astro`,
`about-projects.css` y `about-credentials.css`, y antes de tocar `about.astro`
(`ls src/components/about` → `about-hero.astro about-skills.astro about-stats.astro
about-timeline.astro`). El build en outDir temporal corre; el HTML aún no tiene las secciones.

```
✖ REQ-84-01/02/03: about.astro compone las 8 secciones y pasa la intro por el slot de Contenido
  AssertionError [ERR_ASSERTION]: orden 4
✖ REQ-84-04/05/06: h2 Proyectos destacados y 5 tarjetas con enlace en el h3 y descripción
  AssertionError: The input did not match the regular expression /<h2\b[^>]*>Proyectos destacados<\/h2>/
✖ REQ-84-07/08/09: h2 Contenido con la intro por slot y tarjetas al blog y al curso de Rust
  AssertionError: The input did not match the regular expression /<h2\b[^>]*>Contenido<\/h2>\s*<p class="about__intro">/
✖ REQ-84-10/11/12: Formación y certificaciones con Educación, Certificaciones e Idiomas
  AssertionError: The input did not match the regular expression /<h2\b[^>]*>Formación y certificaciones<\/h2>/
✖ REQ-84-13/14/15: Filosofía en blockquote con lema en inglés y hojas solo con tokens
  AssertionError: The input did not match the regular expression /<h2\b[^>]*>Filosofía<\/h2>/
✖ REQ-84-16/18/19/21: rejillas, encabezados sin saltos, sin scripts propios ni datos privados, <= 100 líneas
  AssertionError [ERR_ASSERTION]: src/styles/about-projects.css
ℹ tests 6  ℹ pass 0  ℹ fail 6
```

## Implementación

- `src/pages/about.astro` (38 líneas):
  - Importa y compone, en este orden: AboutHero, AboutStats, AboutTimeline, AboutSkills,
    AboutProjects, AboutContent, AboutCredentials y AboutPhilosophy.
  - `<p class="about__intro">{SITE_DESCRIPTION}</p>` entra como slot de `<AboutContent>`.
  - Se eliminó la sección final `.about__section`.
  - El frontmatter solo hace imports y llama a getProfile().
- `src/components/about/about-projects.astro` (24 líneas):
  - `section.about-projects` con el h2 «Proyectos destacados».
  - Una lista con un `li.about-projects__card` por proyecto. Cada uno tiene:
    - un h3 con el `<a href>` y `<span class="visually-hidden"> (sitio externo)</span>` (D1);
    - una flecha ↗ decorativa con aria-hidden;
    - un `p` con la descripción.
- `src/components/about/about-content.astro` (25 líneas):
  - El h2 «Contenido», luego `<slot />` (la intro) y después las tarjetas del blog (`/`) y del
    Curso de Rust desde Cero (`https://www.youtube.com/@moibaldenegro`).
  - Reutiliza las clases de tarjeta de about-projects.css.
- `src/components/about/about-credentials.astro` (44 líneas):
  - El h2 «Formación y certificaciones» y tres `article` con los h3 Educación, Certificaciones e
    Idiomas.
  - Educación: título, institución y lugar, sin fechas.
  - Certificaciones: nombre y emisor.
  - Idiomas: nombre y nivel.
- `src/components/about/about-philosophy.astro` (20 líneas):
  - El h2 «Filosofía» y un `<blockquote>` con `<p lang="en">` para el lema y un `<p>` para el texto.
  - Las comillas “ ” son decorativas, con CSS `::before/::after` (D3).
- `src/styles/about-projects.css` (75 líneas):
  - Tarjetas con `--color-surface`, `--color-border`, `--radius-card` y `--shadow-card-rest`.
  - En hover pasan a `--color-border-strong` y `--shadow-card-hover`, con una elevación de 2px, y
    el título cambia a `--color-accent-hover`.
  - El `::after` del enlace extiende el área de clic a toda la tarjeta. El nombre accesible sigue
    siendo corto.
  - El foco visible usa un outline de `--color-accent-hover`.
  - Rejilla auto-fit. A partir de 900 px, proyectos en 3 columnas y contenido en 2.
  - `prefers-reduced-motion` anula la transición y el transform.
- `src/styles/about-credentials.css` (85 líneas):
  - Las tarjetas siguen el mismo patrón.
  - Los h3 van en `--color-accent-hover`.
  - Los elementos de lista llevan separadores `--color-border`.
  - A partir de 900 px, rejilla de 3 columnas.
  - La cita lleva `border-left: 4px solid var(--color-accent)` sobre `--color-surface`.
  - El lema va grande, en peso 800, igual que los títulos de sección y el h1 del hero.
  - Reduced-motion anula la transición.
- Reglas comunes:
  - Sin hex, rgb() ni rgba(), y sin prefers-color-scheme.
  - Espaciado solo con `var(--gap-card)`, calc sobre ella, o 0.
  - tokens.css queda intacto (97 líneas).
  - Sin JS y sin dependencias.
- Datos: todo viene de about.json (feature 80), sin cambios. No hay teléfono, correo, Salud Digna,
  Cinnamon, «neww relic», @moisesbaldenegro1546 ni «Lamar University».
- `about.css` no se modificó. La regla `.about__section` queda sin uso en el HTML, pero se conserva
  porque REQ-11-04 (tests/about-page.test.mjs, que no se puede tocar) exige que about.css use esos
  tokens.

## Verificación real: Chrome headless + CDP sobre astro preview (REQ-84-16/17)

`pnpm build` y luego `astro preview --port 4384`, con Chrome headless y
`Emulation.setDeviceMetricsOverride`. Tops absolutos en px:

| viewport | scrollWidth / clientWidth | proyectos (top) | contenido (top) | formación (top) |
|---|---|---|---|---|
| 1280×800 | 1270 / 1280 (sin scroll horizontal) | 2282 ×3, 2448 ×2 | 2770 ×2 | 2962 ×3 |
| 768×1024 | 758 / 768 | 2888 ×2, 3054 ×2, 3221 | 3537 ×2 | 3771 ×2, 4138 |
| 375×812 | 375 / 375 | 1 columna | 1 columna | 1 columna |

- REQ-84-16: a 1280, 3 tarjetas de proyecto comparten top (2282) y 3 bloques de formación también
  (2962).
- REQ-84-17: a 375, scrollWidth === clientWidth.
- La cita tiene borde izquierdo `4px solid rgb(125, 104, 255)` (accent) y el lema tiene
  `lang="en"`.
- Contraste mínimo por elemento (color computado sobre el fondo efectivo), igual en los 3
  viewports:

  | elemento | contraste |
  |---|---|
  | h2 | 19.98 |
  | nombre de proyecto | 18.93 |
  | descripciones | 9.65 |
  | flecha | 6.67 |
  | intro | 10.18 |
  | h3 de formación | 6.67 |
  | credencial | 18.93 |
  | emisor/nivel | 9.65 |
  | lema | 18.93 |
  | texto de filosofía | 9.65 |

  Todos son ≥ 4.5:1.
- Capturas de página completa: `progress/research/about84/about84-1280.png`, `about84-768.png` y
  `about84-375.png`.

## Verde

- `node --test tests/about-projects-credentials.test.mjs` pasa 6/6. Junto con about-experience-skills,
  about-hero-stats, about-page y single-h1-headings: `ℹ tests 34 ℹ pass 34 ℹ fail 0`.
- Suite completa: `ℹ tests 885  ℹ pass 885  ℹ fail 0`. `tests/about-page.test.mjs` y
  `tests/single-h1-headings.test.mjs` no se modificaron.
- `./init.sh` (exit 0):

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

| archivo | líneas |
|---|---|
| src/pages/about.astro | 38 |
| src/components/about/about-projects.astro | 24 |
| src/components/about/about-content.astro | 25 |
| src/components/about/about-credentials.astro | 44 |
| src/components/about/about-philosophy.astro | 20 |
| src/styles/about-projects.css | 75 |
| src/styles/about-credentials.css | 85 |
| tests/about-projects-credentials.test.mjs | 99 |

## Notas para el reviewer

- REQ-84-19 pide que no haya «scripts propios». El test lo comprueba de dos formas:
  - los `<script>` de /about deben ser exactamente los mismos que los de /404, es decir, los del
    Layout;
  - ningún componente nuevo ni about.astro contiene `<script`.
- AboutContent reutiliza las clases de tarjeta `.about-projects__*` (misma hoja, REQ-84-14).
- El script CDP es ad hoc y vive en el scratchpad de la sesión, fuera del repo; no se añade
  ningún script a `scripts/`.
