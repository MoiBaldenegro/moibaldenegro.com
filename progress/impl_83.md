# Implementación — feature 83 about-experience-skills

Spec: `specs/83_about-experience-skills/requirements.md` (REQ-83-01..18) y `design.md`.

## Rojo (REQ-83-17)

El test `tests/about-experience-skills.test.mjs` se escribió y se ejecutó ANTES de crear
`about-timeline.astro`, `about-skills.astro`, `about-timeline.css` y `about-skills.css`. En ese
momento `about.astro` tampoco tenía cambios: `ls src/components/about` → `about-hero.astro
about-stats.astro`. El build en outDir temporal sí corre, pero el HTML no tiene las secciones nuevas.

```
✖ REQ-83-01/02: about.astro compone timeline y stack entre las cifras y la intro
  AssertionError: The input did not match /<AboutTimeline\b[^>]*experience=\{about\.experience\}/
✖ REQ-83-03/04/05/06: h2 Experiencia y un <li> por puesto con role, lugar, periodo y logros
  AssertionError: did not match /<h2\b[^>]*>Experiencia<\/h2>[\s\S]*<ol class="about-timeline__list"/
✖ REQ-83-07/08/09: periodos como texto, solo años 2023 y 2025 y línea con marcadores
  AssertionError: sep 2023 – presente
✖ REQ-83-10/11: h2 Stack y habilidades, un h3 por área y píldoras con borde y radio
  AssertionError: did not match /<h2\b[^>]*>Stack y habilidades<\/h2>/
✖ REQ-83-13/14: imports de hojas y hojas solo con tokens y --gap-card
  AssertionError: timeline
✖ REQ-83-16/18: un solo h1, encabezados sin saltos, sin scripts ni datos privados, <= 100 líneas
  AssertionError: src/styles/about-timeline.css
ℹ tests 6  ℹ pass 0  ℹ fail 6
```

### Rojo de la versión final del test

Después del primer rojo y antes del verde, el test se compactó para quedar en 100 líneas
(REQ-83-18). Se agruparon aserciones en bucles y no se quitó ninguna comprobación. La comprobación
del period pasó de regex a `includes` del `<span>` literal, que es igual de estricta.

Para dejar evidencia del rojo de esta versión se hizo lo siguiente: se quitaron temporalmente de
`about.astro` las líneas de AboutTimeline/AboutSkills y se movieron los 2 componentes y las 2 hojas
al scratchpad, fuera del repo. Después se restauraron.

```
✖ REQ-83-01/02 … AssertionError: did not match /<AboutTimeline\b[^>]*experience=\{about\.experience\}/
✖ REQ-83-03/04/05/06 … did not match /<h2\b[^>]*>Experiencia<\/h2>[\s\S]*<ol class="about-timeline__list"/
✖ REQ-83-07/08/09 … AssertionError: sep 2023 – presente
✖ REQ-83-10/11/12 … did not match /<h2\b[^>]*>Stack y habilidades<\/h2>/
✖ REQ-83-13/14 … AssertionError: timeline
✖ REQ-83-16/18 … AssertionError: src/styles/about-timeline.css
ℹ tests 6  ℹ pass 0  ℹ fail 6
```

## Implementación

- `src/pages/about.astro` (31 líneas):
  - Añade los imports de AboutTimeline y AboutSkills.
  - Compone `<AboutTimeline experience={about.experience} />` y
    `<AboutSkills skills={about.skills} />` después de `<AboutStats>` y antes de la sección con
    `p.about__intro`.
  - El frontmatter no tiene `.map(` ni `.filter(`.
- `src/components/about/about-timeline.astro` (36 líneas). Marcado:
  - `section.about-timeline[aria-labelledby=about-experience-title]` con el h2 «Experiencia».
  - `ol.about-timeline__list` con un `li.about-timeline__item` por puesto. Cada uno contiene un
    `article.about-timeline__card` con:
    - una cabecera con el h3 del role y el `span.about-timeline__period` en píldora (texto tal cual,
      D3);
    - `p.about-timeline__org` con «organización · lugar»;
    - `ul` de logros;
    - si hay result, `p.about-timeline__result` con `<strong>Resultado:</strong>` como etiqueta
      visible (D4).
- `src/components/about/about-skills.astro` (26 líneas):
  - `section.about-skills` con el h2 «Stack y habilidades».
  - `div.about-skills__grid` con un `article` por área: un h3 y `ul.about-skills__items` con los
    items en píldoras.
- `src/styles/about-timeline.css` (86 líneas):
  - Tarjetas con `--color-surface`, `--color-border`, `--radius-card` y `--shadow-card-rest`. En
    hover pasan a `--color-border-strong` y `--shadow-card-hover` con `--transition-default`.
  - Título de sección en peso 800, coherente con el h1 del hero.
  - Periodo: píldora con borde `--color-accent` y `--radius-pill`.
  - Viñetas de los logros en acento.
  - Resultado: `border-left` 3px `--color-accent` sobre `--color-background`, con
    `--radius-thumb` en el lado derecho.
  - En `@media (min-width: 769px)` (D1): la lista lleva
    `border-left: 2px solid var(--color-border-strong)`. Cada `li::before` es un marcador circular
    (`--radius-pill`) de `var(--color-accent)` con un anillo `--color-background`. El primer puesto
    (el actual) suma un halo `--color-glow`.
  - Por debajo de 769 px no hay línea y las tarjetas van a todo el ancho (D2).
  - `prefers-reduced-motion` anula la transición.
- `src/styles/about-skills.css` (56 líneas):
  - Rejilla `repeat(auto-fit, minmax(min(100%, 260px), 1fr))` por defecto. A partir de 900 px pasa
    a `repeat(3, minmax(0, 1fr))` para que las 6 áreas queden en 3×2 sin filas desparejas.
  - Tarjetas iguales a las del timeline.
  - Píldoras con `border: 1px solid var(--color-border-strong)`, `--radius-pill`,
    `--color-text-secondary` y fondo `--color-background`.
  - `prefers-reduced-motion` anula la transición.
- Reglas comunes:
  - Sin hex, rgb() ni rgba().
  - Todo margin, padding y gap usa `var(--gap-card)`, calc sobre ella, o 0.
  - `tokens.css` queda intacto (97 líneas) y no se añaden tokens.
  - Sin JS y sin dependencias.
- No se muestran teléfono ni correo. Los puestos 2–4 solo muestran la duración. En la sección
  Experiencia solo aparecen los años 2023 y 2025.

## Verificación real: Chrome headless + CDP sobre astro preview (REQ-83-09/12/15)

Se hizo `astro build` y luego `astro preview --port 4399`, con Chrome headless y
`Emulation.setDeviceMetricsOverride`. Coordenadas en px:

| viewport | scrollWidth / clientWidth | puestos (left) | línea / marcador | áreas (top) |
|---|---|---|---|---|
| 1280×800 | 1270 / 1280 (sin scrollbar) | 69 ×4 | `2px solid rgba(255,255,255,.15)`; `::before` 12px `rgb(125,104,255)` | 1815 ×3, 2012 ×3 (3 columnas) |
| 768×1024 | 768 / 768 | 19 ×4 | sin línea ni marcador | 2230 ×2, 2427 ×2, 2660 ×2 (2 columnas) |
| 375×812 | 375 / 375 | 9 ×4 (una columna) | sin línea ni marcador | 1 columna |

- REQ-83-12: a 1280, 3 tarjetas de área comparten top (1815).
- REQ-83-15: a 375, scrollWidth === clientWidth y los 4 `li` tienen left 9.
- Contraste de los textos nuevos (color computado sobre el fondo efectivo), igual en los 3
  viewports, todos ≥ 4.5:1:

  | elemento | contraste |
  |---|---|
  | h2 | 19.98 |
  | role | 18.93 |
  | periodo | 18.93 |
  | organización | 9.65 |
  | logros | 18.93 |
  | resultado | 19.98 |
  | etiqueta «Resultado:» | 7.04 |
  | h3 de área | 18.93 |
  | píldoras | 10.18 |

- Capturas de página completa: `progress/research/about83/about83-1280.png`, `about83-768.png` y
  `about83-375.png`.

## Verde

- `node --test tests/about-experience-skills.test.mjs`: 6/6 pass.
- Suite completa: `ℹ tests 879  ℹ pass 879  ℹ fail 0`. `about-hero-stats`, `about-page` y
  `single-h1-headings` pasan sin cambios.
- `./init.sh` (exit 0):

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

| archivo | líneas |
|---|---|
| `src/pages/about.astro` | 31 |
| `src/components/about/about-timeline.astro` | 36 |
| `src/components/about/about-skills.astro` | 26 |
| `src/styles/about-timeline.css` | 86 |
| `src/styles/about-skills.css` | 56 |
| `tests/about-experience-skills.test.mjs` | 100 |

## Notas para el reviewer

- REQ-83-12 dice «al menos dos columnas» a partir de 900 px. Se fijaron 3 columnas para que las
  6 áreas formen una rejilla 3×2. El test acepta `repeat(2|3|auto-fit|auto-fill`.
- El marcador usa `--radius-pill` para ser un círculo, porque REQ-83-14 no admite `50%` como
  radio. Su posición (`top` y `left`) es geometría, con calc sobre `--gap-card` más px de su
  tamaño.
