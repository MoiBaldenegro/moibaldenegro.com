# Implementación — feature 82 about-hero-stats

## Rojo (REQ-82-23)

Anotado ANTES de crear `src/components/about/`, `about-hero.css` y `about-stats.css` y antes de
reescribir `src/pages/about.astro` (`ls src/components/about` → `No such file or directory`).

`node --test tests/about-hero-stats.test.mjs` (el build en outDir temporal sí corre: el HTML
actual de /about no tiene el hero nuevo):

```
✖ REQ-82-01/02/03: about.astro compone hero y cifras sin lógica en el frontmatter
    AssertionError: falta import de AboutHero
✖ REQ-82-04/05/06: h1 único, textos del perfil y foto con sus dimensiones
    AssertionError: falta «Senior Software Engineer | Backend & Node.js Developer | Systems Architect»
✖ REQ-82-07: la foto se recorta 1:1 con radio y anillo de acento
    AssertionError: The input did not match the regular expression /aspect-ratio:\s*1\s*;/
✖ REQ-82-08/09/10: enlaces con icono del sprite, CTA de descarga y sin scripts
    AssertionError: github
✖ REQ-82-11/12/13: cifras bajo h2 oculto, about.css carcasa e imports de hojas
    AssertionError: The input did not match /<h2[^>]*class="visually-hidden"[^>]*>Cifras destacadas<\/h2>/
✖ REQ-82-14/15/16/17: hojas nuevas solo con tokens, --gap-card y reduced-motion
    AssertionError: src/styles/about-hero.css no existe
✖ REQ-82-22/24: privacidad del HTML construido y archivos de <= 100 líneas
    AssertionError: src/styles/about-hero.css
ℹ tests 7
ℹ pass 0
ℹ fail 7
```

Las aserciones de privacidad (correo, teléfono, términos excluidos) ya pasaban sobre el HTML
actual; el test falla en la comprobación de longitud porque las hojas nuevas no existen.

### Rojo de la versión final del test

Ajustes del test hechos tras el primer rojo y antes del verde (ver abajo). Para dejar evidencia
del rojo de la versión definitiva se restauraron temporalmente about.astro y about.css de HEAD y
se apartaron los componentes y las hojas nuevas al scratchpad (fuera del repo); después se
devolvieron:

```
✖ REQ-82-01/02/03: about.astro compone hero y cifras sin lógica en el frontmatter
    AssertionError: AboutHero
✖ REQ-82-04/05/06/07: h1 único, textos del perfil y foto enmarcada 1:1
    AssertionError: did not match /<section class="about-hero"[^>]*>[\s\S]*<h1\b[\s\S]*<\/section>/
✖ REQ-82-08/09/10: enlaces con icono del sprite, CTA de descarga y sin scripts
    AssertionError: github
✖ REQ-82-11/12/13: cifras bajo h2 oculto, about.css carcasa e imports de hojas
    AssertionError: did not match /<h2[^>]*class="visually-hidden"[^>]*>Cifras destacadas<\/h2>/
✖ REQ-82-14/15/16/17: hojas nuevas solo con tokens, --gap-card y reduced-motion
    AssertionError: src/styles/about-hero.css no existe
✖ REQ-82-22/24: privacidad del HTML construido y archivos de <= 100 líneas
    AssertionError: src/styles/about-hero.css
ℹ tests 6  ℹ pass 0  ℹ fail 6
```

## Ajustes del test (tras el primer rojo, antes del verde)

1. Entidades HTML: Astro escapa `&` como `&amp;`. Por eso el titular («Backend & Node.js») se
   busca en el texto del HTML con las entidades decodificadas (`&amp; &quot; &#39; &lt; &gt;`).
2. Cuenta de líneas: tokens.css usa CRLF y lleva salto final, así que se cuenta con
   `trimEnd().split(/\r?\n/)`. Da 97, igual que `wc -l` y que los tests REQ-77/79.
3. Se compactó el test para dejarlo en 99 líneas (REQ-82-24): las aserciones se agrupan en bucles
   y no se quitó ninguna comprobación.
4. h1 por slot (decisión D-h1, abajo): el test acepta `profile.name` dentro de
   `<AboutHero …>…</AboutHero>`, no solo en la etiqueta de apertura. Además comprueba en el HTML
   que el h1 está dentro de `section.about-hero`.

## Decisión D-h1 (conflicto REQ-82-04 vs REQ-82-24)

`tests/single-h1-headings.test.mjs` (REQ-39-05/06) debe pasar SIN cambios y exige que el código
fuente de **about.astro** tenga exactamente un `<h1`. REQ-82-04 pide que el h1 lo renderice el
hero. Se cumplen las dos cosas así:
- La página declara `<h1 id="about-name" class="about-hero__name" slot="name">{profile.name}</h1>`
  como hijo de `<AboutHero>`.
- El componente lo coloca con `<slot name="name" />` entre el handle y el titular.

El HTML construido tiene un único h1 dentro de `section.about-hero[aria-labelledby=about-name]`,
igual que el marcado de design.md. El hero recibe por props username, description, image y
about; el nombre le llega por el slot, no como prop `name`. Esta decisión necesita la validación
del reviewer.

## Implementación

- `src/pages/about.astro` (27 líneas), solo imports y datos:
  - `new HeroProfileRepository().getProfile()` y `new AboutRepository().getProfile()`.
  - `<AboutHero>` con el h1 por slot y `<AboutStats stats={about.stats} />`.
  - La sección final con `<p class="about__intro">{SITE_DESCRIPTION}</p>` se conserva.
  - El frontmatter no tiene `.map(`, `.filter(`, `if`, `function` ni `=>`.
- `src/components/about/about-hero.astro` (45 líneas):
  - Importa `../../styles/about-hero.css`.
  - Enlaces de `heroLinks(about)`: cada uno con
    `<svg aria-hidden="true" focusable="false"><use href="/assets/svg/sprite.svg#id"/></svg>`,
    la etiqueta visible y `<span class="visually-hidden"> (sitio externo)</span>`, sin
    target=_blank.
  - Foto con width 952, height 960, `loading="eager"`, `decoding="async"` y alt = photoAlt.
  - CTA `<a class="about-hero__cv" href="/cv.pdf" download="moises-baldenegro-cv.pdf">Descargar CV<span aria-hidden="true">↓</span></a>`.
  - Sin `<script>` ni `/assets/cv/`.
- `src/components/about/about-stats.astro` (21 líneas):
  - Importa `../../styles/about-stats.css`.
  - Una section con aria-labelledby y un h2 visually-hidden «Cifras destacadas».
  - `ul.about-stats__list` con 4 li (value y label).
- `src/styles/about.css` (34 líneas), queda como carcasa:
  - `.about` es un grid de columna; el gap y el padding usan `--gap-card` y calc.
  - `.about__section` es la tarjeta de la intro (surface, border, radius-card).
  - `.about__intro` sigue con `--color-text-secondary` (REQ-39-06).
  - Usa los 8 tokens de REQ-11-04.
- `src/styles/about-hero.css` (93 líneas):
  - Fondo en degradado de `--color-hero-top` a `--color-hero-mid`.
  - Foto (D1): aspect-ratio 1, object-fit cover, object-position center top, `--radius-card`,
    outline 2px `--color-accent` con offset `calc(var(--gap-card) / 2)` y `--shadow-card`.
    El contenedor lleva un halo `--color-glow`.
  - Handle en píldora con los tokens `--color-username-*`.
  - h1 con `clamp(2rem, 1.4rem + 2.4vw, 3.25rem)`, peso 800 y tracking -0.02em.
  - Titular a peso 600. Ubicación y enfoque en color secundario. Resumen con max-width 68ch y
    line-height 1.7.
  - Enlaces en píldora con `--color-border-strong`.
  - CTA de contorno (D2): `--color-text` sobre `--color-background` con borde `--color-accent`.
    En hover/focus pasa a `--color-accent-hover` con glow, y tiene outline en `:focus-visible`.
  - Por defecto se apila centrado con la foto a `min(60vw, 220px)`. Desde 900 px usa 2 columnas
    (`min(100%, 280px) minmax(0, 1fr)`) alineadas a la izquierda.
  - Con `prefers-reduced-motion: reduce`, enlaces y CTA quedan con `transition: none`.
- `src/styles/about-stats.css` (42 líneas):
  - 2 columnas por defecto y 4 desde 900 px.
  - Tarjetas en `--color-surface` con borde y radio.
  - Valor en `--color-accent` (D4) y etiqueta en color secundario.
  - Sin transiciones.
- Reglas comunes:
  - Sin hex, rgb() ni rgba().
  - Todo margin, padding y gap usa `var(--gap-card)`, calc sobre ella, o 0.
  - Sin prefers-color-scheme.
  - tokens.css intacto (97 líneas).
  - Sin dependencias y sin JS.
- Privacidad: el HTML de /about no contiene correo, teléfono ni términos excluidos. Se comprueba
  sobre el texto sin etiquetas y sin bloques script/style.

## Verificación real: Chrome headless + CDP sobre astro preview (REQ-82-18..21)

Se hizo `astro build` y luego `astro preview --port 4399`, con Chrome headless y
`Emulation.setDeviceMetricsOverride`. Cajas en formato [left, top, width, height] px:

| viewport | foto | h1 | cifras (left, top) | scrollWidth / clientWidth |
|---|---|---|---|---|
| 1280×800 | [82, 211, 280, 280] | [411, 199, 723, 57] | (32,623) (337,623) (642,623) (947,623) | 1270 / 1280 |
| 768×1024 | [274, 129, 220, 220] | [100, 419, 568, 45] | (19,840) (391,840) (19,958) (391,958) | 768 / 768 |
| 375×812 | [78, 129, 220, 220] | [31, 419, 312, 70] | (9,1155) (195,1155) (9,1289) (195,1289) | 375 / 375 |

- 1280 (REQ-82-18):
  - La foto está a la izquierda del h1 (362 < 411) y en la misma banda vertical: la foto ocupa
    211–491 y el h1 199–256.
  - Las 4 cifras tienen top 623.
  - Sin desbordamiento horizontal (las scrollbars están ocultas).
- 768 y 375 (REQ-82-19/20):
  - La foto queda encima del h1 (349 < 419).
  - Centros a 768: foto 384, h1 384, viewport 384.
  - Centros a 375: foto 188, h1 187, viewport 187.5.
  - Cifras en 2 columnas.
  - A 375, scrollWidth === clientWidth.
- Estilo computado de la foto: aspect-ratio `1 / 1`, object-fit cover, radio 22px y outline 2px
  `rgb(125, 104, 255)` con offset 7px.
- Contraste (REQ-82-21): color computado frente al fondo efectivo. En el hero se toma el peor
  caso entre las dos paradas del degradado. Los valores son iguales en los 3 viewports:

  | elemento | contraste |
  |---|---|
  | h1, titular, resumen, enlaces | 16.26 |
  | handle | 10.56 |
  | ubicación, enfoque | 8.28 |
  | CTA | 19.98 |
  | valor de cifra | 4.77 |
  | etiqueta de cifra, intro | 9.65 |

  Todos ≥ 4.5:1.
- Capturas de página completa en `progress/research/about82/`: `about82-1280.png`,
  `about82-768.png` y `about82-375.png`.

## Verde

- `node --test tests/about-hero-stats.test.mjs`: 6/6 pass.
- `tests/about-page.test.mjs` y `tests/single-h1-headings.test.mjs` pasan sin cambios.
- Suite completa (`node --test tests/*.test.mjs`): `ℹ tests 873  ℹ pass 873  ℹ fail 0`.
- `./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Archivos tocados, todos de 100 líneas o menos:

| archivo | líneas |
|---|---|
| `src/pages/about.astro` | 27 |
| `src/styles/about.css` | 34 |
| `src/styles/about-hero.css` | 93 |
| `src/styles/about-stats.css` | 42 |
| `src/components/about/about-hero.astro` | 45 |
| `src/components/about/about-stats.astro` | 21 |
| `tests/about-hero-stats.test.mjs` | 99 |

Capturas en `progress/research/about82/`.
