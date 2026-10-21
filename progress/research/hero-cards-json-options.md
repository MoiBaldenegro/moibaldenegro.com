# Análisis — opciones configurables de las cards del hero desde hero-cards.json

Fecha: 2026-10-20. Autor: spec_author. Features creadas: 106, 107 y 108.

## Petición humana (literal, 2026-10-20)

«Quiero que pongas varias opciones mas configurables desde el archivo JSON de la data de las cards, En mobile solo mostrar las cards personalizadas o interactivas, ponlo como una opcion configurable booleana de si se muestra o no en mobile que como te comento dejaremos todas las normales en false y las personalizadas como la de hack the box en true, esto solo en mobile por que en desktop sigue todo normal, y aprovecha para meter una propiedad tambien donde reciban una liga, y poder hacerlas clickables para que redirecciones a esa liga, y ya que andas ahi en tamaño del logo de fondo ponlo ahi tambien para poder manipular desde el JSON, cuando tenga una liga configurada y no sea null, mostramos un flecha apuntando a la esquina pa indicar que es clicable cuando esta el hover activado.»

## Qué se pide (en mis palabras)

Tres opciones nuevas por card en `src/data/hero-cards.json`, leídas vía `HeroCardsRepository` / `parseHeroCards` y la entidad `HeroGridCard`:

1. `showOnMobile` (booleano): en móvil solo se pintan las cards con `true`. HTB (rica) `true`; las 14 de icono `false`. Escritorio y tablet sin cambios.
2. `href` (texto o `null`): con valor, la card entera es un enlace; con hover o foco de teclado aparece una flecha ↗ en la esquina superior derecha. Sin valor, la card queda idéntica.
3. `backgroundIconSize`: tamaño del logo de fondo (feature 105) configurable, con el de la 105 como valor por defecto.

## Estado actual (lo que toca)

- Datos: `src/data/hero-cards.json` (15 cards: `htb` rica + 14 de icono). Entidad `src/domain/entities/hero-card.ts` (47 líneas): `HeroCard` (icono) y `HeroRichCard` (htb). Parse `src/domain/repositories/hero-cards-parse.ts` (**99 líneas**: hay que partirlo antes de añadir campos; la 106 crea un módulo hermano).
- UI: `src/components/hero-card.astro` (41 líneas) y `src/components/hero-cards/htb-card.astro`; montados por `src/components/new-hero/new-hero.astro` vía `hero-grid-card.astro`.
- Estilos: `hero-card.css` (99 líneas, no se toca), `hero-card-accents.css` (49), `hero-section.css` (65), `htb-card.css` (30), `tokens.css` (99, no se toca).
- Breakpoints del hero: `> 1200 px` mosaico de 12 columnas; `769–1200 px` 6 columnas (tablet); `<= 768 px` una columna (`hero-section.css:63`, `hero-card.css:90`). **«Mobile» = `@media (max-width: 768px)`**: es el único tramo de una columna y el que ya usa el hero para su layout móvil; 800 px es tablet y se queda como hoy.
- Patrón de enlace externo del sitio: `about-projects.astro` (enlace extendido con `::after` inset 0, `<span class="visually-hidden"> (sitio externo)</span>` y flecha `↗` `aria-hidden` con `translate(2px, -2px)` en hover y sin movimiento en reduced-motion), `site-footer.astro` (`rel="me noopener"`). Foco global: `layout.css` `:where(a, …):focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }`.
- HTB: `htb-stadistics.astro` no contiene `<a>` ni controles interactivos; su `.hero-card__body` está a `z-index: 5`.
- Perfiles conocidos en `src/data/about.json`: GitHub `https://github.com/MoiBaldenegro`, YouTube `https://www.youtube.com/@moibaldenegro`. No hay URL pública del perfil de HTB en el repo (el user id llega por variable de entorno en `htb-profile-repository.ts`): HTB queda en `null`.

## Decisiones (valores por defecto revisables)

### 106 — showOnMobile

- Campo booleano en ambos tipos de card; en el JSON se declara explícito en las 15 (htb `true`, resto `false`). Si falta: `true` para las ricas y `false` para las de icono (la regla del humano «normales false, personalizadas true» se cumple también para cards nuevas). Valor no booleano: `HeroCardsDataError`.
- Mecanismo (ajustado por el líder el 2026-10-20 tras el bloqueo de peso): atributo `data-show-on-mobile="true"` en el `article` de las dos cards **solo** cuando `showOnMobile` es `true` y una regla en `hero-section.css` dentro de `@media (max-width: 768px)`: `.hero-grid > .hero-card:not([data-show-on-mobile]) { display: none; }`. La versión inicial (`"true|false"` en las 15 + `[data-show-on-mobile="false"]`) llevaba la portada de 39 775 B a 40 194 B y rompía REQ-47-06 (< 40 000 B); la condicional suma ≈ 27 B (≈ 39 802 B). Umbral intacto. `display: none` saca la card del layout (una columna sin huecos: el gap solo existe entre items visibles), del árbol de accesibilidad y del orden de tabulación. Sin JS.
- El dominio del mosaico (`hero-grid-layout.ts`, `hero-grid-template.ts`) no cambia: la plantilla de escritorio sigue con las 15.
- En móvil quedan visibles el perfil y HACK THE BOX.

### 107 — href + flecha

- Campo `href` en ambos tipos: `null` o ausente → sin enlace; si no, `https://…` (externo) o ruta interna `/…` (no `//`). Cualquier otro valor (número, vacío, `http://`, `javascript:`, `//x`) → `HeroCardsDataError`. Entidad: `readonly href: string | null` siempre presente.
- Valores en el JSON: github `https://github.com/MoiBaldenegro`, youtube `https://www.youtube.com/@moibaldenegro`; htb y las 12 de tecnología `null` (revisables; HTB pendiente de que el humano dé la URL de su perfil).
- Marcado: un `a.card-link` como **último hijo** del `article` (hermano, nunca contenedor de otros controles: sin enlaces anidados por construcción, también en HTB), `position: absolute; inset: 0; z-index: 6` (por encima del body de HTB, z-index 5). Contenido: `<span class="visually-hidden">{title} (sitio externo)</span>` (sin «(sitio externo)» si es ruta interna) + `<span class="card-link__arrow" aria-hidden="true">↗</span>`. Nombre accesible: «GITHUB (sitio externo)». Externo con `rel="noopener"`, sin `target` (como el resto del sitio).
- Por qué no envolver la card en `<a>`: cambiaría el hijo directo de `.hero-grid` y rompería `.hero-grid > .hero-card` y los spans. Por qué no meter el `a` en el `header`: el header es `position: absolute`, sería el bloque contenedor del `::after` y de la flecha y no cubriría la card.
- Foco: `.hero-card` tiene `overflow: hidden`; el outline global (offset 2px) quedaría recortado. `.card-link:focus-visible` usa `outline-offset` negativo (-4px) y `border-radius: var(--radius-card)`.
- Flecha: esquina superior derecha, `top/right 16px` (14px en `<= 1200 px`), opacidad 0 en reposo y 1 con `.hero-card:hover` o `.card-link:focus-visible`, con `translate(2px, -2px)` y transición `var(--transition-default)`; en `prefers-reduced-motion: reduce` sin transición ni transform. Color `var(--color-text)`.
- Choque con el `cornerIcon` de la 103: si la card tiene `cornerIcon` y `href`, la flecha se coloca a la izquierda del icono de esquina (`right 46px` / `40px`) y el header reserva `right 76px` / `66px`; con `href` sin esquina, el header reserva `right 46px` / `40px` (el mismo hueco que la esquina). Hoy ninguna card tiene ambos (CLAUDE CODE tiene esquina y `href: null`).
- Hoja nueva `src/styles/hero-card-link.css` importada por `hero-card.astro` y `htb-card.astro`.

### 108 — backgroundIconSize

- Enum cerrado `sm | md | lg` (`HERO_BACKDROP_SIZES`), por defecto `md` = geometría de la 105 (left/right -16px; -10px en `<= 1200 px`). `sm`: left/right 16px (10px), el logo no desborda. `lg`: left/right -56px (-36px). El alto sigue saliendo del aspect-ratio del symbol, así que `bottom: 0` mantiene el anclaje.
- Por qué enum + data-atributo y no un número: la convención prohíbe `style=` en `.astro`, y un número libre exigiría una regla CSS por valor o un style inline. Con el enum, `data-backdrop-size` en `.card-backdrop` (solo se pinta si el JSON lo declara) + una regla por valor en `hero-card-accents.css`.
- Validación: valor fuera del enum o declarado sin `backgroundIcon` → `HeroCardsDataError`. En el JSON, claude-code y github declaran `"md"` (sin cambio visual).

## Riesgos y trabas

- **Presupuesto de peso de la portada (REQ-47-06, `tests/search-index-lazy-load.test.mjs`, `dist/client/index.html` < 40 000 B)**: tras la 106 queda ≈ 39 802 B (margen ≈ 198 B). La 107 suma dos `a.card-link` (≈ 350-380 B estimados: probablemente no cabe tal cual) y la 108 dos `data-backdrop-size="md"` (≈ 48 B). Ambas deben medir el peso antes y después y mantenerse < 40 000 B sin tocar el umbral; si no es posible sin debilitar su propósito, paran en `blocked` y reportan (REQ-107-27/28, REQ-108-17/18). Opciones a decidir entonces: recortar bytes de la portada en una feature previa o revisar el umbral por decisión explícita.

- `hero-cards-parse.ts` en 99 líneas: la 106 lo parte (p. ej. `hero-cards-fields-parse.ts` con los lectores de campos opcionales y `readSpriteRef`).
- Tests que fijan el marcado o la forma exacta y deberán ajustarse con nota «Ajuste feature 1xx (precedente REQ-43-06)»: regex de `<article … data-row-span="\d+">` (p. ej. `hero-cards-extra-logos.test.mjs:56`, `htb-hero-card.test.mjs:58`), `deepEqual` de `getCards()` (REQ-31-02, REQ-90-04/05, REQ-99-03), `REQ-101-17` (JSON sin las claves nuevas frente a 0c786e4), REQ-103-11 (YOUTUBE gana un hijo `a.card-link` en la 107). Varios están en 100 líneas (`hero-cards-polish`, `hero-cards-extra-logos`): compactar o test nuevo.
- La reserva del header con `href` (46px/40px) puede partir títulos en tablet; HTB con `href: null` no cambia. La CDP mide solape 0 título/flecha y palabras en una sola caja.
- Ajeno, no tocar: `public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`.

## Verificación

Chrome headless + CDP a 375/800/1024/1280/1600 con los scripts del scratchpad (`cdp105/`, `cdp103/m-r1.mjs` como base). Capturas en `progress/research/hero106/`, `hero107/` y `hero108/`.

## Ajuste de la 107 tras el bloqueo por peso (spec_author, 2026-10-20)

- Bloqueo (progress/impl_hero-cards-links.md): dist/client/index.html 39 798 B antes y 40 211 B con el marcado de la spec (+413 B); umbral REQ-47-06 < 40 000 sin tocar.
- Decisión del líder (opción 1 del implementer, técnica): la 107 incluye la limpieza de los `xlink:href` del hero; el marcado del enlace no cambia.
- Medición en el dist actual: **17** `<use>` (no 18) repiten `xlink:href` junto a `href`: 14 iconos principales, 2 fondos (anthropic-wordmark, github-wordmark) y 1 esquina (claude). `grep -o ' xlink:href="[^"]*"'` suma **767 B** → la 107 queda en ≈ 39 444 B (margen ≈ 556 B para la 108).
- Origen único: src/components/hero-card.astro (3 `<use>`). htb-card.astro no tiene `<use>`. Fuera del hero no hay `xlink` en src/: about-hero.astro y site-footer.astro ya usan `<use href>` solo (4 en la portada), que es el precedente de soporte; no hay nada que ampliar.
- Compatibilidad: el proyecto no declara browserslist ni baseline (package.json, astro.config.mjs, docs/). `href` en `<use>` es SVG 2 (Chrome 50+, Firefox 51+, Safari 12.1+). La comprobación en Chrome headless queda como REQ-107-32/33 (bbox > 0 de cada use a 1280 y a 375 con la regla de la 106 desactivada por CDP, porque en móvil las cards de icono están ocultas).
- Tests que fijan xlink: solo tests/hero-cards-extra-logos.test.mjs:53 (REQ-103-09/10/11), en 100 líneas: el ajuste es en línea. hero-card-accents.css selecciona por `use[href$=…]` y no cambia. specs/103_hero-cards-extra-logos/design.md menciona `xlink:href` en el marcado (histórico, no se edita).
- Spec: REQ-107-07 reformulado (los hijos cambian solo por el xlink retirado) y REQ-107-29..36 nuevos; design.md Decisión 7 y presupuesto actualizado. Feature 107 de blocked a pending (el árbol ya tiene la implementación del enlace; falta el recorte, los ajustes heredados y la CDP).
- Nota para la 108: su descripción habla de margen ≈ 198 B; tras la 107 quedaría ≈ 556 B.
