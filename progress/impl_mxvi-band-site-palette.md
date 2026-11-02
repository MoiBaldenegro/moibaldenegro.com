# Implementación — feature 7 `mxvi-band-site-palette`

La cinta MXVI deja de usar el azul de Apple y pasa a la paleta morada del sitio.
Spec: `specs/07_mxvi-band-site-palette/requirements.md` (REQ-07-01..15) y `design.md`.
Análisis: `progress/research/mxvi-band-site-palette.md`. Depende de la feature 6 (done).
Fecha: 2026-11-02.

## 1. Archivos tocados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `tests/mxvi-band-site-palette.test.mjs` | Nuevo, escrito antes del código: 9 tests para REQ-07-01..11 y 14 | 83 |
| `tests/mxvi-logos-banner.test.mjs` | Solo se retiran las aserciones de tokens azules: en REQ-06-08/09 los gradientes se comprueban sin nombrar tokens, y en REQ-06-16/17/19 la lista de tokens se queda en `opacity-logo-band`, `opacity-logo-band-hover` y `space-mxvi-band`. Las demás aserciones no cambian | 99 |
| `src/styles/mxvi-logos-banner.css` | Fondo `radial-gradient(ellipse 60% 120% at center, var(--color-glow), transparent 70%)` sobre `linear-gradient(90deg, var(--color-hero-mid), var(--color-hero-top), var(--color-hero-mid))`. Se añade `border-block: 1px solid var(--color-border)`. En hover y focus-visible el filtro pasa a `grayscale(1) brightness(0) invert(1) drop-shadow(0 0 calc(var(--gap-card) / 2) var(--color-accent))`. La transición del logo ahora incluye `filter`. Reduced-motion sin cambios: anula transition y transform, mantiene opacidad y halo | 63 |
| `src/styles/tokens.css` | Se eliminan `--color-mxvi-band-edge`, `--color-mxvi-band-center` y `--color-mxvi-band-glow` (ya no queda ningún uso en `src/`). Se conservan `--space-mxvi-band`, `--opacity-logo-band` y `--opacity-logo-band-hover` | 99 |

No se crearon tokens nuevos. El componente `.astro`, los datos y el repositorio no se tocaron.
Tampoco cambian el full-bleed, la ausencia de texto y botones, los 4 SVG como únicos enlaces,
el focus-visible, las 2 columnas en móvil ni la ausencia de JS de runtime.

## 2. Evidencia del rojo (antes de tocar CSS y tokens)

`node --test tests/mxvi-band-site-palette.test.mjs tests/mxvi-logos-banner.test.mjs`:

```
✖ REQ-07-01/02: degradado lineal morado del hero y resplandor radial con --color-glow
✖ REQ-07-03/04: sin tokens azules en la hoja ni en tokens.css
✔ REQ-07-05: tokens.css conserva padding y opacidades de la cinta
✖ REQ-07-06: borde fino superior e inferior con --color-border
✖ REQ-07-07/08: hover y focus-visible añaden halo accent al filtro blanco
✖ REQ-07-09: la transición del logo anima opacity, transform y filter
✔ REQ-07-10: reduced-motion anula transición y transform, no opacidad ni halo
✔ REQ-07-11: la hoja no contiene hexadecimales, rgb( ni rgba(
✔ REQ-07-14: archivos tocados con <=100 líneas
✔ REQ-06-01/18 … REQ-06-16/17/19 (8 tests de la feature 6 en verde)
ℹ tests 9  ℹ pass 4  ℹ fail 5   (solo el archivo nuevo)
```

Los 4 tests de REQ-07 que ya pasaban en rojo son guardas de regresión: 05, 10, 11 y 14
describen propiedades que el código actual ya cumplía y que el cambio no debe romper.

## 3. Evidencia del verde

`node --test` (suite completa):

```
✔ REQ-07-01/02 … ✔ REQ-07-14 (9/9)
ℹ tests 66
ℹ pass 66
ℹ fail 0
```

`./init.sh` (exit 0): entorno, archivos del harness, formato, tests al 100% y build de producción
en verde. Mensaje final: "El entorno está perfecto".

La build (`dist/client/_astro/home.*.css`) contiene `.mxvi-logos{…border-block:1px solid
var(--color-border);background:radial-gradient(ellipse 60% 120% at center, var(--color-glow),
transparent 70%), linear-gradient(90deg, var(--color-hero-mid), var(--color-hero-top),
var(--color-hero-mid));…}`, y `dist/client/home/index.html` tiene 4 `mxvi-logos__link`.

## 4. Trazabilidad

| REQ | Cobertura |
|-----|-----------|
| 01/02 | Test REQ-07-01/02 |
| 03/04 | Test REQ-07-03/04, y `grep` en `src/` sin coincidencias |
| 05 | Test REQ-07-05 |
| 06 | Test REQ-07-06 |
| 07/08 | Test REQ-07-07/08: filtro blanco seguido de drop-shadow con `--gap-card` y `--color-accent`, más opacidad, transform y outline |
| 09 | Test REQ-07-09 |
| 10 | Test REQ-07-10 |
| 11 | Test REQ-07-11 |
| 12/13 | Tests REQ-06 de `tests/mxvi-logos-banner.test.mjs` en verde |
| 14 | Test REQ-07-14 y `./init.sh` en verde |
| 15 | Revisión visual en navegador a 375, 768 y 1280 px: **pendiente para el reviewer**. No hubo navegador en esta sesión. Solo se comprobó el CSS y el HTML de la build |

## 5. Notas

- El drop-shadow va después de `invert(1)` para que el halo conserve el color accent.
- El tamaño de la elipse del glow (`60% 120%`) y el stop `transparent 70%` buscan un resplandor
  suave y ancho. El diseño los deja como valores orientativos.
- Ya había un `astro dev` en marcha (pid 12184, de antes de esta sesión). No se paró ni se
  reinició. Su `/home` no muestra la cinta, posiblemente por estado desactualizado, así que la
  revisión visual conviene hacerla tras `astro dev stop` + `astro dev --background`.
