# Diseño — Carcasa de /about, hero y cifras (feature 82 about-hero-stats)

## Contexto visual

- Pantalla: /about. Estado actual: tarjeta con nombre, handle, línea de tecnologías y la
  descripción del sitio. Estado deseado: un hero de presentación profesional seguido de una franja
  de cifras; las secciones 83 y 84 se añaden debajo.

```
≥ 900 px
┌───────────────────────────────────────────────────────────────────┐
│  ┌──────────┐   [@moibaldenegro]                                  │
│  │  FOTO    │   Moisés Baldenegro Melendez            (h1)        │
│  │ 1:1 con  │   Senior Software Engineer | Backend & … (titular)  │
│  │ anillo   │   Guadalajara, Jalisco, México                      │
│  └──────────┘   Resumen (2-3 líneas)                              │
│                 AI Engineering • Rust • …  (enfoque, secundario)  │
│                 (GH) (in) (YT)        [ Descargar CV ↓ ]          │
└───────────────────────────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬──────────┐
│   +6     │    4     │ Sep 2025 │    3     │   cifras en acento
│ años ... │ roles …  │ sistema… │ certif.  │   etiqueta secundaria
└──────────┴──────────┴──────────┴──────────┘
≤ 768 px: foto centrada (min(60vw, 220px)) sobre el texto; cifras 2×2.
```

## Marcado

- about.astro: `<Layout title="About — moisesbaldenegro.com" description={SITE_DESCRIPTION}>` →
  `<div class="about">` → `<AboutHero …/>`, `<AboutStats stats={about.stats}/>` y, al final, la
  `<section>` actual con `<p class="about__intro">{SITE_DESCRIPTION}</p>` (hasta la 84).
- about-hero.astro: `<section class="about-hero" aria-labelledby="about-name">` con
  `<img class="about-hero__photo">` (width 952, height 960, `loading="eager"`,
  `decoding="async"`), `<p class="about-hero__handle">`, `<h1 id="about-name">`,
  `<p class="about-hero__headline">`, `<p class="about-hero__location">`,
  `<p class="about-hero__summary">`, `<p class="about-hero__focus">`, `<ul class="about-hero__links">`
  y `<a class="about-hero__cv" href="/cv.pdf" download="moises-baldenegro-cv.pdf">Descargar CV</a>`.
- Enlaces: `<a href={href}><svg aria-hidden="true" focusable="false"><use href="/assets/svg/sprite.svg#github"/></svg>GitHub<span class="visually-hidden"> (sitio externo)</span></a>`
  (patrón del enlace a X de Layout.astro: sin target=_blank).
- about-stats.astro: `<section class="about-stats" aria-labelledby="about-stats-title">` con
  `<h2 id="about-stats-title" class="visually-hidden">Cifras destacadas</h2>` y
  `<ul class="about-stats__list">` → `<li><span class="about-stats__value">+6</span><span class="about-stats__label">años de experiencia</span></li>`.

## Tokens usados (solo de tokens.css; no se añaden tokens)

| Token | Uso |
|-------|-----|
| `--color-background` | fondo de la página y del CTA |
| `--color-surface` | fondo de la tarjeta de cifras |
| `--color-hero-top`, `--color-hero-mid` | degradado del fondo del hero |
| `--color-glow` | halo detrás de la foto y sombra de foco del CTA |
| `--color-text` | nombre, resumen, texto del CTA y de los enlaces |
| `--color-text-secondary` | ubicación, enfoque, etiquetas de cifras |
| `--color-accent` / `--color-accent-hover` | anillo de la foto, borde del CTA, valores de cifras |
| `--color-border` / `--color-border-strong` | bordes de tarjetas y píldoras de enlaces |
| `--color-username-bg` / `--color-username-border` / `--color-username-text` | píldora del handle |
| `--radius-card` / `--radius-pill` | foto y tarjetas / enlaces, CTA y handle |
| `--shadow-card` | sombra de la foto |
| `--gap-card` | todo margin/padding/gap (o calc() sobre él) |
| `--transition-default` | hover/focus de enlaces y CTA |
| `--font-sans` | tipografía |
| `--container-max` | ancho máximo de `.about` |

## Decisiones y constraints

- D1 Foto: `aspect-ratio: 1; object-fit: cover; object-position: center top;
  border-radius: var(--radius-card); outline: 2px solid var(--color-accent); outline-offset:
  calc(var(--gap-card) / 2); box-shadow: var(--shadow-card)`. Ancho `min(100%, 280px)` en
  escritorio. Recorte por CSS, la imagen original no cambia.
- D2 CTA de contorno: texto `--color-text` sobre `--color-background` con borde `--color-accent`
  (blanco sobre acento daría ≈3,97:1 < 4,5:1). Hover/focus: borde `--color-accent-hover` y
  `box-shadow` con `--color-glow`. `:focus-visible` con outline `--color-accent`.
- D3 Descarga: `<a href="/cv.pdf" download="moises-baldenegro-cv.pdf">` → el navegador descarga el
  PDF generado en build por la feature 81. Cero JS.
- D4 Cifras: valor en `--color-accent` (≈4,7:1 sobre `--color-surface`, texto grande), etiqueta en
  `--color-text-secondary`.
- D5 Tema: solo tokens; sin `prefers-color-scheme` (el sitio no define tema claro).
- D6 Accesibilidad: un solo h1 (nombre); h2 de cifras visually-hidden; iconos aria-hidden con
  texto visible; orden DOM = orden visual.
- Restricciones: estilos separados (about.css, about-hero.css, about-stats.css), ≤100 líneas,
  sin dependencias, sin JS, tokens.css intacto (97 líneas).

## Alternativa descartada

- CTA relleno de acento con texto blanco: descartado por contraste (≈3,97:1).
- Botón que abre un diálogo de impresión o una página /cv: descartado por el cambio del humano
  (PDF generado en build, cero JS).
