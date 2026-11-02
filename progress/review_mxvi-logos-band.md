# Review — feature 6

**Veredicto:** APPROVED

Feature: 6 `mxvi-logos-band` (cinta MXVI full-bleed con logos-enlace).
Spec: `specs/06_mxvi-logos-band/requirements.md` (REQ-06-01..20) y `design.md`.
Informe revisado: `progress/impl_mxvi-logos-band.md`. Revisión: 2026-11-02, reviewer nivel 1.

## Aclaración del humano (verificada)
- La cinta solo toma de Apple Events el concepto: banda full-bleed con degradado lineal azul y resplandor radial (`src/styles/mxvi-logos-banner.css:3-10`).
- No hay botones, títulos, párrafos, texto ni elementos extra. En el DOM real (Chrome headless) los descendientes de `.mxvi-logos` son solo `div`, `a`, `svg` y `use`, y `innerText` está vacío a 375, 768 y 1280 px.
- Los únicos interactivos son los 4 `<a class="mxvi-logos__link">`, uno por SVG (`src/components/mxvi-logos-banner.astro:12-18`). Cada uno lleva el `href` del repositorio, `target="_blank"`, `rel="noopener noreferrer"` y un `aria-label` propio ("MXVI M — GitHub", "MXVI X — GitHub", ...). Cada `svg` lleva `aria-hidden="true"` y `focusable="false"`. Confirmado en `dist/client/home/index.html`.
- La `<section class="mxvi-logos">` ya no lleva `aria-hidden` (`.astro:10`; en el DOM, `getAttribute('aria-hidden')` da null).

## Checkpoints
- C1 (Arquitectura — estilos en `src/styles/`, sin `<style>` en `.astro`): [x] El CSS está en `src/styles/mxvi-logos-banner.css` y el componente lo importa (`.astro:4`); no hay `<style>` (lo cubre también el test REQ-06-01/18).
- C2 (Arquitectura — sin lógica en UI): [x] El frontmatter solo tiene imports y `const logos = new MxviLogosRepository().getLogos()` (`.astro:4-7`). No hay `<script>` en el componente. Los 3 `<script>` de `home/index.html` son anteriores y de otros componentes: sin JS de runtime nuevo.
- C3 (Arquitectura — datos vía repositorio): [x] `.astro:5,7`; no hay `.json` ni ids hardcodeados.
- C4 (Arquitectura — tokens): [x] Los colores, las opacidades y el padding vertical salen de los 6 tokens nuevos (`tokens.css`, bloque "Cinta MXVI") y de `--color-text`/`--transition-default`. `audit-design-tokens` está en verde y el test REQ-06-16/17/19 prohíbe `#hex`, `rgba(` y opacidades numéricas en la hoja. Se retira `--opacity-logo-muted` sin dejar referencias (`grep` en `src/`: 0). Ver la observación 1 sobre longitudes.
- C5 (Arquitectura — <=100 líneas): [x] `wc -l`: astro 20, css 56, tokens.css 100, test 100. tokens.css está justo en el límite, compactado a dos tokens por línea sin cambiar valores (lo confirma `git diff`).
- C6 (Arquitectura — sin dependencias nuevas): [x] `package.json` no cambia.
- C7 (Datos — JSON válido y tipado): [x] No cambia en esta feature (los datos son de la feature 5).
- C8 (Datos — errores nombrados): [x] No aplica: no hay lógica de datos nueva.
- C9 (Verificación — `./init.sh` verde): [x] El reviewer lo ejecutó dos veces: entorno, formato, tests al 100% y build en verde.
- C10 (Verificación — visual desktop/móvil, REQ-06-20): [x] Verificado por el reviewer con `pnpm preview` y Chrome headless (CDP) en `/home/`. Capturas en `progress/research/mxvi-logos-band-review/band-{375,768,1280}px.png`.
  - 375 px: la cinta ocupa de 0 a 375 y el `scrollWidth` del documento es 375. Rejilla 2×2 con los 4 logos completos (166×64).
  - 768 px: el `scrollWidth` (758) es igual al ancho útil. Rejilla 2×2 con los 4 logos completos (353×64).
  - 1280 px: el `scrollWidth` (1270) es igual al ancho útil. Rejilla de 4 columnas con los 4 logos completos (256×128).
  - Opacidad de reposo 0.62 y fondo con las dos capas de degradado esperadas en los tres anchos. No hay desbordamiento horizontal.
  - Consola: el único error es un 404 de `/assets/content/api-auth.webp`. Es anterior y ajeno a esta feature: lo referencia `src/content/posts/systems-design/07-auth-api-design.md` (commit e8926ca) y el archivo no existe en `public/assets/content/`. No hay errores de la cinta.
  - No verificado de forma interactiva: el hover/focus real con puntero o teclado ni la emulación de `prefers-reduced-motion`. Se revisaron solo en el CSS (ver C1-C4 y la evidencia de REQ-06-10..13 más abajo).
- C11 (Harness — estado de la tarea): [x] La feature 6 está en `in_progress` con `depends_on: [5]`, y la 5 está en `done`. No se saltó ninguna dependencia. El paso a `done` lo hace el líder.
- C12 (Harness — progress documentado): [x] `progress/current.md:11-25` tiene el plan y la bitácora con el orden test → código; el informe está en `progress/impl_mxvi-logos-band.md`.
- C13 (Harness — limpieza): [x] Sin temporales, sin debug y sin TODOs. El reviewer añadió solo las capturas de evidencia en `progress/research/mxvi-logos-band-review/`.

## Requisitos clave revisados
- REQ-06-10/11/12: `css:38-42` hover y `:focus-visible` comparten la regla de opacidad `var(--opacity-logo-band-hover)` y `translateY(-4px) scale(1.04)`. `css:23-26` define el contorno de `:focus-visible` (2px `var(--color-text)`, offset 6px). `css:35` define `transition` con `var(--transition-default)`.
- REQ-06-13: `css:44-51` aplica `prefers-reduced-motion: reduce` a reposo, hover y focus con `transition: none; transform: none`, sin tocar la opacidad (el test lo asegura con `doesNotMatch(/opacity/)`).
- REQ-06-08: `css:4-5` (`100vw` + `margin-inline: calc(50% - 50vw)`), sin `overflow: hidden`. El `overflow-x: clip` de `.home__landing` (`latest-cards-motion.css:5-7`) evita el scroll horizontal, como se comprobó en el navegador.
- REQ-06-14/15: `css:14` usa 4 columnas y `css:53-56` pasa a 2 columnas en `max-width: 768px`.

## Evidencia TDD
- Rojo: el §3 del informe y `progress/current.md:21` registran 7 fallos y 1 pase antes del código. El único test que ya pasaba era REQ-06-14/15, que el CSS anterior cumplía, y queda como guarda de regresión. Hubo un rojo intermedio por dos helpers del test (regex de la expresión `map` y `trimEnd` antes de contar líneas), corregido sin quitar aserciones. Revisado en `tests/mxvi-logos-banner.test.mjs:47,98`: los cambios son legítimos.
- Verde: 8/8 en `tests/mxvi-logos-banner.test.mjs` y `./init.sh` en verde, reproducido por el reviewer.

## Observaciones (no bloqueantes)
1. `css:16,51,54-55` tiene longitudes de layout literales: `gap: clamp(18px, 5vw, 72px)`, alto del logo, `gap: 16px 24px`, `64px`, `-4px`, `2px` y `6px`. Las fija `design.md`, REQ-06-17 solo exige tokens para colores, opacidades y padding de la cinta, y gap y alturas ya estaban así antes de la feature. Aun así, `docs/architecture.md` §6 pide espaciados desde tokens. Se puede tokenizar en una feature futura, cuando `tokens.css` tenga margen (ahora está en 100 líneas).
2. Con scrollbar clásica (768 y 1280 px en escritorio), `100vw` incluye el ancho de la barra: la sección empieza en -5 px y mide 10 px más que el área útil. El `overflow-x: clip` lo recorta sin scroll ni descentrado visible, pero depende de que `.home__landing` mantenga ese clip.
3. Los 4 enlaces apuntan al mismo `https://github.com/MoiBaldenegro`. Es un dato de la feature 5 (`src/data/mxvi-logos.json`) y no afecta a esta revisión.

## Cambios requeridos (si aplica)
Ninguno.
