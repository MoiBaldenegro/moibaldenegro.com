# Implementación — feature 6 `mxvi-logos-band`

Cinta azul full-bleed con logos MXVI clicables y hover.
Spec: `specs/06_mxvi-logos-band/requirements.md` (REQ-06-01..20) y `design.md`. Análisis:
`progress/research/mxvi-logos-band.md`. Depende de la feature 5 (done, APPROVED). Fecha: 2026-11-02.

## 1. Alcance (aclaración del humano aplicada)

De Apple Events solo se toma el concepto de la cinta: banda full-bleed de borde a borde con
degradado azul suave y un leve resplandor radial central. La cinta no tiene texto, títulos,
botones ni ningún otro elemento. Los únicos elementos interactivos son los 4 SVG, y cada uno
va dentro de su propio `<a>`.

## 2. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `tests/mxvi-logos-banner.test.mjs` | Reescrito test-first: 8 tests para REQ-06-01..19 | 100 |
| `src/components/mxvi-logos-banner.astro` | Datos desde `new MxviLogosRepository().getLogos()`. `<a class="mxvi-logos__link">` con `href`, `aria-label`, `target="_blank"` y `rel="noopener noreferrer"`; el `svg` lleva `aria-hidden="true"` y `focusable="false"`. Se quita `aria-hidden` de la `<section>` | 20 |
| `src/styles/mxvi-logos-banner.css` | Full-bleed (`width: 100vw; margin-inline: calc(50% - 50vw)`, sin `overflow: hidden`). Fondo con `radial-gradient` (glow) sobre `linear-gradient(90deg, edge, center, edge)`. Reposo: `opacity: var(--opacity-logo-band)` y `transition` con `--transition-default`. Hover y focus-visible: `opacity: var(--opacity-logo-band-hover)` y `transform: translateY(-4px) scale(1.04)`. Focus: `outline 2px solid var(--color-text)`, offset 6px. Reduced-motion: `transition: none; transform: none`, la opacidad sigue cambiando. 4 columnas, 2 en <=768 px | 56 |
| `src/styles/tokens.css` | 6 tokens nuevos (`--color-mxvi-band-edge/center/glow`, `--opacity-logo-band`, `--opacity-logo-band-hover`, `--space-mxvi-band`) con los valores de design.md. Se retira `--opacity-logo-muted`. Para compactar, los tokens de la tarjeta de perfil y `--radius-card/--radius-pill` pasan a dos por línea; no cambia ningún valor | 100 |

No se tocaron dependencias, JS de runtime, el sprite ni `home.astro`. `.home__landing` ya tiene
`overflow-x: clip` (`latest-cards-motion.css:5-7`), así que `100vw` no genera scroll horizontal.

## 3. Ciclo rojo/verde

**Rojo.** Primero se escribió el test, con el código anterior todavía en su sitio:
`node --test tests/mxvi-logos-banner.test.mjs`

```
✖ REQ-06-01/18: datos vía repositorio, import del CSS y sin script ni style
✖ REQ-06-02/03/04/05: cada logo es un enlace con svg decorativo dentro
✖ REQ-06-06/07: sección sin aria-hidden y sin texto, títulos, párrafos ni botones
✖ REQ-06-08/09: cinta full-bleed con degradado lineal y resplandor radial
✖ REQ-06-10/11/12: reposo, hover y focus-visible con elevación y transición
✖ REQ-06-13: prefers-reduced-motion anula transición y transformación
✔ REQ-06-14/15: 4 columnas por defecto y 2 en <=768 px
✖ REQ-06-16/17/19: tokens nuevos, sin colores sueltos y <=100 líneas
ℹ tests 8  ℹ pass 1  ℹ fail 7
```

REQ-06-14/15 ya pasaba con el CSS anterior (4/2 columnas) y queda como guarda de regresión.

**Rojo intermedio, corregido en el test.** Tras implementar quedaron 2 fallos causados por los
helpers del test, no por el código:
(a) el filtro de "texto visible" no quitaba la expresión `{logos.map(...)}` y la tomaba como texto;
(b) el contador de líneas sumaba el salto de línea final (100 líneas reales contaban como 101).
Se corrigieron el regex de la expresión y `trimEnd()` antes del `split`. No se quitó ninguna aserción.

**Verde.**

```
node --test tests/mxvi-logos-banner.test.mjs  -> ℹ tests 8  ℹ pass 8  ℹ fail 0
pnpm test                                     -> ℹ tests 57 ℹ pass 57 ℹ fail 0
node scripts/audit-design-tokens.mjs          -> AUDIT ✔ ningún color fuera de tokens.css en src/styles
./init.sh -> ✔ formato ✔ tests al 100% (node:test) ✔ build de producción (pnpm build)
             ✔ El entorno está perfecto. Podemos empezar a trabajar.
```

HTML generado (`dist/client/home/index.html`):
`<section class="mxvi-logos">` sin `aria-hidden` y 4 `<a class="mxvi-logos__link" href="https://github.com/MoiBaldenegro" aria-label="MXVI M — GitHub" target="_blank" rel="noopener noreferrer">`
(y lo mismo para X, V e I), cada uno con su `<svg ... aria-hidden="true" focusable="false">`.

## 4. Trazabilidad

| REQ | Test |
|-----|------|
| 01, 18 | `REQ-06-01/18` |
| 02, 03, 04, 05 | `REQ-06-02/03/04/05` |
| 06, 07 | `REQ-06-06/07` |
| 08, 09 | `REQ-06-08/09` |
| 10, 11, 12 | `REQ-06-10/11/12` |
| 13 | `REQ-06-13` |
| 14, 15 | `REQ-06-14/15` |
| 16, 17, 19 | `REQ-06-16/17/19` (más el audit de tokens en init.sh) |
| 20 | Regresión visual manual: pendiente de verificar por el reviewer en navegador a 375, 768 y 1280 px (no se hizo en esta sesión) |

## 5. Notas

- Los valores de longitud del layout (gap, alto del logo, `translateY(-4px)`, `scale(1.04)`,
  outline de 2px con offset de 6px) son los fijados por design.md. REQ-06-17 solo exige tokens
  para colores, opacidades y el padding vertical de la cinta.
- La feature 6 queda `in_progress`. No se marca `done` hasta el APPROVED del reviewer. Sin commit.
