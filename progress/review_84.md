# Review — feature 84

**Veredicto:** APPROVED

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `.astro` con `<style>`: [x]
  - Los 4 componentes nuevos importan su hoja: `about-projects.css` (Projects/Content) y `about-credentials.css` (Credentials/Philosophy), como pide REQ-84-14.
- C2 Frontmatter solo con imports y paso de datos: [x]
  - `src/pages/about.astro:1-20` solo importa y llama a `getProfile()`.
  - Los componentes solo desestructuran `Astro.props`.
- C3 Datos vía repositorio: [x]
  - Todo viene de `AboutRepository` (`about.json`, feature 80).
  - Ningún componente lee JSON.
- C4 Solo tokens: [x]
  - Ninguna de las dos hojas tiene hex, rgb ni rgba.
  - Colores, radios, sombras, transiciones y fuente salen de `var(--…)`.
  - Margin, padding y gap usan `var(--gap-card)`, `calc()` sobre ese token, o 0.
  - Las dos hojas anulan sus transiciones con `prefers-reduced-motion`.
  - `tokens.css` no se tocó.
- C5 Archivos ≤ 100 líneas: [x]
  - about.astro 38, projects 24, content 25, credentials 44, philosophy 20, about-projects.css 75, about-credentials.css 85, test 99.
- C6 Sin dependencias nuevas: [x]
  - No hay JS de runtime propio.
  - Los `<script>` de /about son los mismos 4 que emite el Layout.
- C7 `./init.sh` verde: [x]
  - Lo ejecuté y salió con código 0: formato, tests al 100% y build OK.
- C8 Desktop y móvil correctos: [x]
  - Revisé las capturas `progress/research/about84/about84-1280.png` y `about84-375.png`.
  - A 1280 los proyectos van en 3 columnas, el contenido en 2 y la formación en 3.
  - A 375 todo va en 1 columna, sin desbordes visibles.
  - El implementer midió por CDP scrollWidth === clientWidth a 375.
- C9 Test-first: [x]
  - `progress/impl_84.md` documenta el rojo 6/6 antes de crear componentes y hojas, y el verde con la suite en 885/885.
- C10 Dependencias: [x]
  - `depends_on: [83]` y la 83 está en `done`.
- C11 Coherencia acceptance↔REQ: [x]
  - Los 7 criterios de acceptance cubren REQ-84-01..22 según el índice de trazabilidad de requirements.md.

## Verificaciones específicas

- **HTML construido** (`dist/client/about/index.html`):
  - Hay un solo h1 (el nombre).
  - Los h2 van en este orden, sin saltos de nivel: Cifras destacadas (visually-hidden), Experiencia, Stack y habilidades, Proyectos destacados, Contenido, Formación y certificaciones, Filosofía.
  - Los h3 cuelgan siempre de un h2.
- **Enlaces externos:**
  - Los 5 proyectos llevan el enlace en el h3, con `<span class="visually-hidden"> (sitio externo)</span>` y la flecha con `aria-hidden` (D1).
  - El `::after` amplía el área de clic sin alargar el nombre accesible.
  - El foco es visible (`outline` con `--color-accent-hover`).
- **Datos verificados:**
  - Las URLs de los 5 proyectos coinciden con la acceptance.
  - Contenido enlaza a `/` y a `https://www.youtube.com/@moibaldenegro`.
  - En `src/` y `dist/` no aparece Salud Digna, Cinnamon, «neww relic», moisesbaldenegro1546 ni «Lamar University».
  - Educación no lleva fechas.
- **Privacidad:**
  - **Repo:** `git grep --untracked`:
    - «mc.moisesm16» solo aparece en las notas de review_80..83, que dicen que no está.
    - «647» solo da coincidencias benignas: recuentos «647/647» (`progress/history.md:1460`, `progress/impl_43.md:26`, `progress/review_43.md:28`), `L64755` en research, coordenadas de `public/assets/svg/sprite.svg` y citas de reviews anteriores.
  - **/about:** el HTML de /about no contiene «647», y su texto no coincide con los regex de correo ni de teléfono.
  - **/cv.pdf:** descomprimí los streams de `dist/client/cv.pdf` y decodifiqué su texto. No contiene «647», «mc.moisesm16», ningún correo, ningún teléfono ni ninguno de los términos excluidos.
- **Coherencia visual con 82/83:**
  - El patrón de tarjeta es el mismo: `--color-surface`, `--color-border`, `--radius-card`, `--shadow-card-rest`.
  - Los títulos de sección usan la misma escala (clamp 1.5–2rem, peso 800).
  - Los h3 de formación en `--color-accent-hover` son coherentes con los acentos del timeline.
- **Página completa de punta a punta:** hero, cifras, experiencia, stack, proyectos, contenido, formación y filosofía se ven en el orden correcto y cierran con la cita.
- **Tests intocables:** `tests/about-page.test.mjs` y `tests/single-h1-headings.test.mjs` siguen sin cambios en git.

## Observaciones (no bloquean)

1. `src/components/about/about-content.astro:20`: la tarjeta «Curso de Rust desde Cero» enlaza a YouTube (externo) sin el `(sitio externo)` visually-hidden que sí llevan los proyectos y el hero. REQ-84-05 solo lo exige en proyectos, así que no bloquea. Convendría alinearlo en una feature posterior.
2. `src/styles/about.css`: la regla `.about__section` queda sin uso en el HTML. Se conserva por REQ-11-04 (`tests/about-page.test.mjs`) y está justificado en `progress/impl_84.md`.

## Cambios requeridos (si aplica)
Ninguno.
