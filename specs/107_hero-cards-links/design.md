# Diseño — feature 107 hero-cards-links

## Contexto visual

- Componentes: `src/components/hero-card.astro` (icono) y `src/components/hero-cards/htb-card.astro` (rica). Hoja nueva `src/styles/hero-card-link.css`.
- Hoy: ninguna card del hero es un enlace y cada `<use>` del hero repite `xlink:href` además de `href`.
- Deseado: si `href` del JSON no es `null`, la card entera es clicable y, con hover o foco de teclado, aparece una flecha ↗ en la esquina superior derecha. Sin `href`, card idéntica (mismo marcado y estilos).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text` | (sin cambio) | Color de la flecha ↗ |
| `--color-accent` | (sin cambio) | Outline de `:focus-visible` (mismo que el foco global de `layout.css`) |
| `--radius-card` | (sin cambio) | Radio del outline y del enlace |
| `--transition-default` | (sin cambio) | Aparición y desplazamiento de la flecha |

Ningún token nuevo; `tokens.css` no se toca.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — valores en el JSON: github `https://github.com/MoiBaldenegro` y youtube `https://www.youtube.com/@moibaldenegro` (los de `src/data/about.json`); htb y las 12 de tecnología `null`. HTB queda en `null` porque el repo no tiene la URL pública de su perfil (el user id va por variable de entorno): pendiente humano.
- Decisión 2 — validación: `null`/ausente → sin enlace; `https://…` externo; `/…` interno (no `//`). Se rechazan `http://`, `javascript:`, vacío y no texto.
- Decisión 3 — enlace extendido como **último hijo** del `article`: `<a class="card-link" href rel="noopener"><span class="visually-hidden">{title} (sitio externo)</span><span class="card-link__arrow" aria-hidden="true">↗</span></a>`, `position: absolute; inset: 0; z-index: 6`. Al ser hermano y no contenedor, no hay enlaces anidados (tampoco en HTB, cuyo `.hero-card__body` está a z-index 5 y no tiene controles). `rel="noopener"` y sin `target`, como el resto de enlaces externos del sitio. El texto «(sitio externo)» sigue el patrón de `about-projects.astro` y `site-footer.astro`.
- Decisión 4 — foco: el `overflow: hidden` de `.hero-card` recortaría el outline global (offset 2px). `.card-link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: -4px; border-radius: var(--radius-card); }` y la flecha también aparece con `:focus-visible`.
- Decisión 5 — flecha: `position: absolute; top: 16px; right: 16px` (14px en `<= 1200 px`), `opacity: 0` en reposo; `.hero-card:hover .card-link__arrow, .card-link:focus-visible .card-link__arrow { opacity: 1; transform: translate(2px, -2px); }`; `transition: opacity var(--transition-default), transform var(--transition-default)`. `prefers-reduced-motion: reduce`: `transition: none; transform: none` (solo cambia la opacidad). Tamaño del glifo `1.25rem` (`1.1rem` en `<= 1200 px`), `line-height: 1`.
- Decisión 6 — convivencia con el `cornerIcon` de la 103: con esquina y `href`, la flecha va a la izquierda del icono de esquina (`right: 46px` / `40px`) y el header reserva `right: 76px` / `66px`. Con `href` sin esquina, el header reserva `right: 46px` / `40px` (el mismo hueco que la esquina) para que la flecha no tape el título en hover. Selectores con `:has(> .card-link)` y `:has(> .card-corner)`.
- Restricciones: sin JS, sin style inline; `hero-card.css` (99 líneas) y `tokens.css` (99) no se tocan; hoja nueva ≤ 100 líneas; `hero-card-accents.css` intacta.
- Decisión 7 — limpieza de `xlink:href` (ajuste del líder 2026-10-20, opción 1 de `progress/impl_hero-cards-links.md`; REQ-107-29..36): `hero-card.astro` pinta `<use href={…}/>` sin `xlink:href` en el icono, el fondo y la esquina. `xlink:href` está obsoleto en SVG 2 y `href` en `<use>` lo leen Chrome 50+, Firefox 51+ y Safari 12.1+. El proyecto no declara browserslist ni baseline (ni en `package.json` ni en `astro.config.mjs`), y el sitio ya pinta en producción `<use href>` sin `xlink` en `about-hero.astro` y `site-footer.astro` (la portada ya lleva 4 `<use href>` sin `xlink`: github, linkedin, x y youtube), que es el precedente de soporte. `htb-card.astro` no tiene `<use>`. `hero-card-accents.css` selecciona por `use[href$="#…"]`, así que no cambia. Fuera del hero no hay ningún `xlink:href` en `src/`: no hay nada que ampliar.
- Presupuesto de peso (REQ-107-27/28/35): la portada debe seguir < 40 000 B (REQ-47-06, umbral intacto). Medido por el implementer: 39 798 B antes y 40 211 B con el marcado de la spec (+413 B). Los 17 `xlink:href` del hero suman 767 B en `dist/client/index.html` (medido con `grep -o ' xlink:href="[^"]*"'`), así que la 107 queda en ≈ 39 444 B con un margen ≈ 556 B para la 108. Anotar antes, después y margen; si aun así no cabe sin debilitar el propósito, parar en `blocked` y reportar el peso.
## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600: `elementFromPoint` en el centro de GITHUB y YOUTUBE da `a.card-link`; opacidad de la flecha 0 en reposo y 1 con `CSS.forcePseudoState` hover y con foco por Tab (`:focus-visible`); outline visible dentro del rectángulo de la card; solape 0 título/flecha; palabras del título en una sola caja; 15 rectángulos iguales a la línea base (±1 px); 0 errores de consola; cada `<use>` de los 15 article con `getBoundingClientRect` > 0 e igual a la línea base (±1 px) a 1280 y > 0 a 375 con la regla de la 106 desactivada por CDP (REQ-107-32/33). A 375 GITHUB y YOUTUBE están ocultas por la 106 (se mide solo que no hay `a.card-link` focusable visible). Capturas: `progress/research/hero107/github-<w>-{rest,hover,focus}.png` en 800/1024/1280/1600.

## Alternativa descartada

- Envolver el `article` en `<a>`: cambia el hijo directo de `.hero-grid` y rompe `.hero-grid > .hero-card` y los spans del mosaico.
- Poner el `a` dentro del `.card-header`: el header es `position: absolute` y sería el bloque contenedor del enlace y de la flecha, que no cubrirían la card.
