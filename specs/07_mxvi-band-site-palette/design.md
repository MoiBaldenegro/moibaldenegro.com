# Diseño — mxvi-band-site-palette (feature 7)

## Contexto visual

- Sección afectada: la cinta MXVI de la home (`src/components/mxvi-logos-banner.astro`,
  estilos en `src/styles/mxvi-logos-banner.css`), entre el hero y los artículos.
- Estado actual: bloque azul brillante (degradado #0b2a7a -> #2f6fe4 + glow azul claro),
  copia literal de la banda de Apple Events; no pega con un sitio oscuro de identidad morada.
- Estado deseado: el mismo concepto (cinta full-bleed con degradado horizontal + resplandor
  radial central y 4 logos-enlace) construido con la paleta del sitio: morado oscuro sutil que
  se lee como continuación del hero, con borde fino arriba y abajo y un leve halo del acento
  morado en hover/focus de cada logo.

## Tokens usados (solo tokens existentes; ninguno nuevo)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-hero-mid` | #150A18 | Extremos del degradado lineal (90deg) |
| `--color-hero-top` | #3C1F44 | Centro del degradado lineal |
| `--color-glow` | rgba(108, 56, 122, 0.35) | Resplandor radial elíptico centrado -> transparent |
| `--color-border` | rgba(255,255,255,.08) | `border-block: 1px solid` superior e inferior |
| `--color-accent` | #B37AC2 | `drop-shadow` del logo en hover y focus-visible |
| `--gap-card` | 14px | Radio del drop-shadow, p. ej. `calc(var(--gap-card) / 2)` |
| `--space-mxvi-band` | clamp(32px, 5vw, 64px) | Padding vertical (se conserva) |
| `--opacity-logo-band` / `--opacity-logo-band-hover` | .62 / 1 | Opacidad reposo / hover (se conservan) |
| `--transition-default` | (existente) | Transición de opacity, transform y filter |

Tokens eliminados de `tokens.css`: `--color-mxvi-band-edge`, `--color-mxvi-band-center`,
`--color-mxvi-band-glow` (sin otro uso en el repo).

## Decisiones y constraints

- Fondo orientativo:
  `radial-gradient(ellipse <tamaño> at center, var(--color-glow), transparent <stop>)` sobre
  `linear-gradient(90deg, var(--color-hero-mid), var(--color-hero-top), var(--color-hero-mid))`.
  Mismo lenguaje que hero-section.css y site-footer.css, que ya usan glow radial morado.
- Borde: `border-block: 1px solid var(--color-border)`, tan fino como el del footer.
- Hover/focus-visible: la regla redeclara el filtro completo
  `grayscale(1) brightness(0) invert(1) drop-shadow(0 0 calc(var(--gap-card) / 2) var(--color-accent))`
  (el drop-shadow va después del invert para no invertir el color del halo), además de la
  opacidad y el `translateY(-4px) scale(1.04)` actuales.
- `prefers-reduced-motion`: se anulan transición y transform; opacidad y halo se mantienen.
- Sin cambios en el componente `.astro`, en los datos ni en el repositorio.
- Restricciones: estilos separados de la UI, solo tokens, <=100 líneas por archivo, sin JS
  de runtime, sin dependencias, TDD (tests nuevos en `tests/mxvi-band-site-palette.test.mjs`;
  en `tests/mxvi-logos-banner.test.mjs` solo se retiran las aserciones de tokens azules).

## Alternativa descartada

- Alternativa: mantener el degradado azul y solo oscurecerlo con tokens azules nuevos.
- Motivo del descarte: sigue siendo la banda de Apple con otro tono y añade colores ajenos a
  la identidad morada; el humano pide reutilizar la paleta existente.
- Alternativa: usar `--color-accent` como color del degradado de fondo.
- Motivo del descarte: produce un bloque morado brillante, el mismo problema que el azul; el
  acento se reserva para el halo de interacción.
