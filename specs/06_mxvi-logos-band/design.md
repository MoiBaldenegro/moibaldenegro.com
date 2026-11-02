# Diseño — mxvi-logos-band (feature 6)

## Contexto visual

- Pantalla: home (`src/pages/home.astro`), sección `<MxviLogosBanner/>` entre `<NewHero/>` y
  `<LatestArticles/>` dentro de `.home__landing`.
- Estado actual: franja contenida (`min(var(--container-max), 95%)`) sin fondo, 4 logos
  blancos al 18 % de opacidad, `aria-hidden="true"`, no interactivos.
- Estado deseado: cinta full-bleed inspirada en la banda de Apple Events de apple.com:
  degradado azul suave de borde a borde con un leve resplandor radial en el centro. Sobre
  ella, en una pista centrada de ancho `min(var(--container-max), 95%)`, los 4 logos blancos
  semitransparentes; cada uno es un enlace que en hover/focus sube a opacidad plena y se eleva
  ligeramente. Sin texto, títulos ni botones en la cinta.

## Estructura (componente)

```
<section class="mxvi-logos">                                  (sin aria-hidden)
  <div class="mxvi-logos__track">
    {logos.map(({ id, viewBox, href, label }) => (            (MxviLogosRepository().getLogos())
      <a class="mxvi-logos__link" href={href} aria-label={label}
         target="_blank" rel="noopener noreferrer">
        <svg class={`mxvi-logos__logo mxvi-logos__logo--${id}`} viewBox={viewBox}
             aria-hidden="true" focusable="false">
          <use href={`/assets/svg/sprite.svg#${id}`} />
        </svg>
      </a>
    ))}
  </div>
</section>
```

## Tokens usados

Nuevos en `tokens.css` (grupo "Cinta MXVI", feature 6):

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-mxvi-band-edge` | `#0b2a7a` | Azul profundo de los extremos del degradado lineal (90deg) |
| `--color-mxvi-band-center` | `#2f6fe4` | Azul claro del centro del degradado lineal |
| `--color-mxvi-band-glow` | `rgba(150, 200, 255, .45)` | Resplandor radial (elipse) al centro, transparente hacia fuera |
| `--opacity-logo-band` | `.62` | Opacidad de reposo de los logos sobre la cinta |
| `--opacity-logo-band-hover` | `1` | Opacidad de hover y focus |
| `--space-mxvi-band` | `clamp(32px, 5vw, 64px)` | Padding vertical de la cinta |

Existentes: `--container-max` (ancho de la pista), `--color-text` (contorno de foco),
`--transition-default` (transición). `--opacity-logo-muted` queda sin uso y se retira.

Fondo de la cinta (capas, de arriba abajo):

- `radial-gradient(ellipse at center, var(--color-mxvi-band-glow), transparent 60%)`
- `linear-gradient(90deg, var(--color-mxvi-band-edge), var(--color-mxvi-band-center), var(--color-mxvi-band-edge))`

## Interacción

- Reposo: logo con `filter: grayscale(1) brightness(0) invert(1)` (blanco) y
  `opacity: var(--opacity-logo-band)`; `transition: opacity var(--transition-default),
  transform var(--transition-default)`.
- `.mxvi-logos__link:hover .mxvi-logos__logo` y
  `.mxvi-logos__link:focus-visible .mxvi-logos__logo`: `opacity:
  var(--opacity-logo-band-hover)`; `transform: translateY(-4px) scale(1.04)`.
- `.mxvi-logos__link:focus-visible`: `outline: 2px solid var(--color-text);
  outline-offset: 6px`.
- `@media (prefers-reduced-motion: reduce)`: en el logo `transition: none` y, también en
  hover/focus, `transform: none` (la opacidad cambia igual, sin animación).
- El enlace es `display: block` y ocupa su celda de la rejilla.

## Layout

- `.mxvi-logos`: `width: 100vw; margin-inline: calc(50% - 50vw); padding-block:
  var(--space-mxvi-band)`; SIN `overflow: hidden` (cortaría la elevación). `.home__landing`
  ya aplica `overflow-x: clip`, así que `100vw` no crea scroll horizontal.
- `.mxvi-logos__track`: `width: min(var(--container-max), 95%); margin: 0 auto`; grid de 4
  columnas; altura de logo como hoy (`clamp(72px, 10vw, 150px)`).
- `@media (max-width: 768px)`: 2 columnas, logos de 64px de alto (como hoy).

## Decisiones y constraints

- Decisión 1: la cinta es la propia `<section>` (sin wrapper extra): el fondo es puro CSS.
- Decisión 2: logos blancos sobre azul con opacidad de reposo .62: .18 (valor actual) es casi
  invisible sobre azul medio; el hover a 1 aporta el "brillo".
- Decisión 3: `target`/`rel` fijos en el componente: el repositorio solo admite href
  `https://` (feature 5), así que todos los enlaces son externos.
- Restricciones: estático, cero JS de runtime, sin dependencias, CSS solo en src/styles,
  colores solo en tokens.css (`scripts/audit-design-tokens.mjs` en verde), <=100 líneas por
  archivo. tokens.css está en 100 líneas: compactar (p. ej. tokens de la tarjeta de perfil a
  dos por línea y retirar `--opacity-logo-muted`).

## Alternativa descartada

- Alternativa: imagen de fondo (webp) recortada de la banda de Apple Events.
- Motivo del descarte: asset de terceros, peso extra y no tokenizable; el degradado CSS
  reproduce el efecto sin coste.
