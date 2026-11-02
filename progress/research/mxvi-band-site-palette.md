# Análisis — la cinta MXVI con la paleta del sitio (feature 7, corrige la feature 6)

## Petición humana (vía líder, 2026-11-02)

"Está muy bien, pero la estás haciendo idéntica a Apple; es el concepto, tiene que ir con la
web, no copiar literal el mismo diseño." Se conserva el concepto (cinta full-bleed con
degradado + resplandor y 4 logos-enlace) pero el fondo deja de ser el azul de Apple Events y
pasa a construirse con la paleta oscura y morada del sitio.

## Estado actual (revisado)

- `src/styles/mxvi-logos-banner.css` (56 líneas): `.mxvi-logos` pinta
  `radial-gradient(ellipse at center, var(--color-mxvi-band-glow), transparent 60%)` sobre
  `linear-gradient(90deg, edge, center, edge)` con los tokens azules. Logos blancos por
  `filter: grayscale(1) brightness(0) invert(1)`, opacidad `--opacity-logo-band` (.62) y en
  hover/focus-visible `--opacity-logo-band-hover` (1) + `translateY(-4px) scale(1.04)`.
  Transición solo de `opacity` y `transform`. Reduced motion anula transición y transform.
- `src/styles/tokens.css` (100 líneas, en el límite): bloque de la cinta en las líneas 66-69:
  `--color-mxvi-band-edge #0b2a7a`, `--color-mxvi-band-center #2f6fe4`,
  `--color-mxvi-band-glow rgba(150,200,255,.45)`, `--space-mxvi-band`, `--opacity-logo-band`,
  `--opacity-logo-band-hover`. Los 3 tokens azules solo se usan en mxvi-logos-banner.css y en
  tests/mxvi-logos-banner.test.mjs (grep en src/, tests/, scripts/, docs/).
- `src/components/mxvi-logos-banner.astro`: no cambia (datos vía MxviLogosRepository, enlaces,
  aria-label, svg decorativos, sin texto).
- `tests/mxvi-logos-banner.test.mjs` (100 líneas, en el límite): el test "REQ-06-08/09" exige
  los tokens azules en el degradado y el test "REQ-06-16/17/19" exige que tokens.css los
  defina. Ambos quedarían rojos al corregir: hay que retirar esas aserciones azules (el resto
  del archivo se conserva) y poner los tests nuevos en un archivo nuevo.

## Paleta del sitio disponible (tokens existentes)

`--color-background #070716`, `--color-hero-top #3C1F44`, `--color-hero-mid #150A18`,
`--color-hero-bottom #05050b`, `--color-glow rgba(108,56,122,.35)`, `--color-accent #B37AC2`,
`--color-border rgba(255,255,255,.08)`, `--gap-card 14px`. Precedentes de uso: hero-section.css
(radial hero-top -> hero-mid -> hero-bottom), site-footer.css (radial elíptico de --color-glow
+ borde fino), about-hero.css (resplandores con `var(--color-glow)` y `calc(var(--gap-card) * n)`).

## Propuesta

- Fondo: `radial-gradient(ellipse ... at center, var(--color-glow), transparent ...)` sobre
  `linear-gradient(90deg, var(--color-hero-mid), var(--color-hero-top), var(--color-hero-mid))`.
  Morado oscuro y sutil, continuación del hero; sin colores nuevos.
- Borde fino superior e inferior: `border-block: 1px solid var(--color-border)`.
- Hover/focus-visible del logo: se mantiene opacidad + elevación y se añade al `filter` un
  `drop-shadow(0 0 calc(var(--gap-card) / 2) var(--color-accent))`. Como el logo ya tiene
  `filter` en reposo, la regla hover/focus redeclara el filtro completo (blanco + drop-shadow,
  con el drop-shadow después del invert). `filter` entra en la `transition`.
- Reduced motion: sigue anulando transición y transform; opacidad y halo se conservan.
- tokens.css: se eliminan las definiciones azules; el bloque queda con `--space-mxvi-band` y
  las opacidades (comentario actualizado). El archivo baja de 100 líneas.

## Riesgos y trabas

- Límite de 100 líneas en tests/mxvi-logos-banner.test.mjs: tests nuevos en
  `tests/mxvi-band-site-palette.test.mjs`; en el viejo solo se retiran aserciones azules.
- Contraste: el fondo morado es muy oscuro; logos blancos al .62 siguen legibles.
- `drop-shadow` con `--color-accent` sólido puede quedar fuerte: radio pequeño; ajuste visual
  en revisión.
- Ningún doc de docs/ referencia los tokens azules: no hay que tocar docs/.

## Descomposición

Simple-media (1 CSS + tokens + tests) con una sola intención visual: **1 feature**
(id 7 `mxvi-band-site-palette`, depends_on [6]), con design.md por tocar presentación.
