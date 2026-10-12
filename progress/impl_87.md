# Informe de implementación — feature 87 geist-pixel-extend

## Tests escritos (antes del código)

- `tests/geist-pixel-extend.test.mjs` (nuevo): REQ-87-01/02/03/04 (una prueba por selector), REQ-87-05 (la regla h1, h2 sigue ahí; no hay `#`, hex ni rgb/hsl; los únicos `font-family` son var(--font-display) y var(--font-mono)), REQ-87-06/07/19 (`git diff --quiet HEAD` de las 9 hojas, el marcado y `tests/geist-pixel-display.test.mjs`), REQ-87-07 (los tags siguen siendo span/p) y REQ-87-19 (≤ 100 líneas).

## Rojo (REQ-87-16), anotado ANTES de tocar src/styles/typography.css

`node --test tests/geist-pixel-extend.test.mjs`:

```
✖ REQ-87-01/02/03/04: .site-navbar nav a en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .site-navbar .search-bar__input en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .hero-card .card-title en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .latest-articles__title en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .post__related .post__related-link en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .latest-articles__tag en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .search-results__tag en var(--font-display) con font-synthesis: none
✖ REQ-87-01/02/03/04: .post__hero .post__kicker en var(--font-display) con font-synthesis: none
✔ REQ-87-05: la regla h1, h2 sigue intacta y solo hay tokens de fuente, sin almohadilla ni colores
✔ REQ-87-06/07/19: hojas de componente, marcado y el test de la 86 sin cambios frente a HEAD
✔ REQ-87-07: los tags siguen siendo span/p sin enlace
✔ REQ-87-19: typography.css mide 100 líneas o menos
ℹ tests 12
ℹ pass 4
ℹ fail 8
```

Las 4 que ya pasan son guardas: comprueban que lo que debe seguir igual sigue igual. Las 8 que fallan corresponden a las 8 reglas nuevas.

## Alturas base del header (REQ-87-13), medidas ANTES del cambio

Medido con Chrome headless y CDP sobre `astro preview` (build de HEAD + 86), con DPR 1, en `/`, `/posts/00-agilismo/`, `/search?q=software` y `/about/`:

| viewport | altura de header.site-navbar | scrollWidth/clientWidth |
|----------|------------------------------|-------------------------|
| 800×800  | **65 px** en las 4 páginas | 790/790 |
| 1000×800 | **65 px** en las 4 páginas | 990/990 |
| 1280×800 | **65 px** en las 4 páginas | 1270/1270 |

## Implementación

- `src/styles/typography.css` (pasa de 15 a **30 líneas**): una regla nueva con los 8 selectores `.site-navbar nav a`, `.site-navbar .search-bar__input`, `.hero-card .card-title`, `.latest-articles__title`, `.post__related .post__related-link`, `.latest-articles__tag`, `.search-results__tag` y `.post__hero .post__kicker`, con `font-family: var(--font-display); font-synthesis: none;` (REQ-87-01..04). La regla `h1, h2` de la 86 no se toca. El archivo no lleva `#` (tampoco en comentarios), ni colores, ni otra fuente distinta de display/mono (REQ-87-05).
- No se tocó ningún otro archivo de `src/`: ni hojas de componente ni marcado (REQ-87-06/07). `tests/geist-pixel-display.test.mjs` sigue igual (REQ-87-19).

## Verificación real: Chrome headless + CDP sobre astro preview, después del cambio

Pasos: `pnpm build`, `astro preview --port 4387` y Chrome headless con un perfil nuevo, `Network.setCacheDisabled` y DPR 1. Páginas: `/`, `/posts/00-agilismo/` (tiene Recomendados), `/search?q=software` (6 resultados, 19 tags) y `/about/`. En la portada, antes de medir y capturar, se hace scroll hasta `.latest-articles` para que termine su animación de entrada. El script es ad hoc y vive en el scratchpad de la sesión, fuera del repo.

- **REQ-87-09**: a 375, 800, 1000 y 1280, el `font-family` computado de todos los elementos presentes empieza por `"Geist Pixel-7d2ccea19c8c15a9"`. Son los 3 enlaces del header, el input, las 12 `.card-title`, los 3 `.latest-articles__title`, `.post__related-link`, los 9 `.latest-articles__tag`, los 19 `.search-results__tag` y `.post__kicker`. Con el menú abierto a 375 también lo son los enlaces y el input.
- **REQ-87-10**: `.latest-articles__meta`, `.latest-articles__description`, `.post__related-meta` y `.search-results__description` siguen en `Geist-bbea48628ea22a68`, es decir, en Sans y no en Pixel.
- **REQ-87-08**: `.site-menu__toggle` sale en `Arial` (fuente del UA del botón, no cambia) y `.search-bar__clear` en `Geist-bbea…` (Sans). Ninguno de los dos está en Pixel.
- **REQ-87-11**: no hay desborde horizontal en las 4 páginas × 375/1000/1280 (y también a 800): 375/375, 990/990 y 1270/1270 (el clientWidth de 1270 se debe al `scrollbar-gutter: stable`).
- **REQ-87-12**: en `/` a 375, 1000 y 1280 ningún `.card-title`, `.latest-articles__title` ni `.latest-articles__tag` se sale de su card (lista de desbordes vacía).
  - Fuera del alcance del REQ: a **800×800**, «TYPESCRIPT» ya se salía de su tarjeta bento **antes** del cambio, 15,25 px con Sans en la medición base. Ahora se sale 9,56 px (borde derecho 142,7 frente a 133,2 de la card), así que Pixel lo reduce. 800 no está entre los anchos de REQ-87-12 y el problema viene de antes, de `hero-card.css` (lista cerrada). Queda anotado por si el humano quiere abrir una feature.
- **REQ-87-13**: `header.site-navbar` mide **65 px** a 800, 1000 y 1280 en las 4 páginas, igual que la base. **La altura no cambia.**
- **REQ-87-14**: a 375×812, con el menú abierto (`aria-expanded="true"`), `.site-menu` da scrollWidth 375 = clientWidth 375. Los 3 enlaces y el input van de 9,4 a 365,6 px, dentro del viewport.
- **REQ-87-15**: el CLS acumulado de `/` a 1280×800 con la caché vacía (`Network.clearBrowserCache` + caché desactivada, PerformanceObserver `layout-shift` buffered) es **0**. En el resto de cargas también fue 0.

## Tamaños más pequeños en Pixel (REQ-87-18), para la revisión humana de legibilidad

- `.post__kicker` a 375 px: **12 px** (a 800/1000/1280: 12,8 px).
- `.search-results__tag`: **12,48 px** en todos los anchos.
- Para comparar: `.card-title` mide 13,12 px a 375, los enlaces del header 13,6 px a 375 (15,2 px en escritorio y 16 px con el menú abierto), `.latest-articles__tag` 13,6 px y `.latest-articles__title` 18,4 / 21,6 px.
- Lo que se ve en las capturas: a DPR 1 los puntos de Circle no se distinguen. El texto se ve monoespaciado, fino y algo más claro que el Sans, pero se lee. A DPR 2 la textura de puntos ya se aprecia. La negrita de `.card-title`, kicker y h3 desaparece por `font-synthesis: none`, como estaba previsto en la Decisión 3.

## Capturas (REQ-87-17): `progress/research/geist87/`

Hay una captura por zona en 1280×800 y 375×812, cada una a DPR 1 y DPR 2 (sufijo `-<ancho>-dpr<1|2>.png`):

- Header: `geist87-header-1280-dpr1.png`, `geist87-header-1280-dpr2.png`. Con el menú móvil abierto: `geist87-header-menu-375-dpr1.png`, `geist87-header-menu-375-dpr2.png`.
- Cards bento: `geist87-bento-{1280,375}-dpr{1,2}.png`.
- Card de últimos artículos con sus tags (tras hacer scroll a la sección): `geist87-latest-card-{1280,375}-dpr{1,2}.png`.
- Kicker del artículo: `geist87-post-kicker-{1280,375}-dpr{1,2}.png`. Recomendados: `geist87-related-{1280,375}-dpr{1,2}.png`.
- Lista de /search con tags (`?q=software`): `geist87-search-{1280,375}-dpr{1,2}.png`.

## Verde

`node --test tests/geist-pixel-extend.test.mjs tests/geist-pixel-display.test.mjs`: **19 pass, 0 fail**.

`./init.sh`:

```
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Archivos: `src/styles/typography.css` (30 líneas) y `tests/geist-pixel-extend.test.mjs` (75 líneas, nuevo).

## Incidencias

- El primer `pnpm build` tras el cambio falló con EPERM, porque mi propio `astro preview` tenía bloqueado `dist/` en Windows. Ese intento produjo mediciones y capturas del build anterior. Las borré, paré **solo** ese preview por su PID (`taskkill /PID <pid> /T`, tras comprobar que su línea de comandos era `astro preview --port 4387`), recompilé y repetí todo. Las cifras de arriba son de la segunda pasada. Chrome headless se cerró con `proc.kill()` del script y se comprobó por PID que había terminado. No se cerró ningún proceso global.
