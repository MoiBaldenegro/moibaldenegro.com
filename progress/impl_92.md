# Implementación — feature 92 htb-hero-card

Spec: `specs/92_htb-hero-card/requirements.md` + `design.md`. Análisis: `progress/research/hero-extensible-cards.md`. Valores por defecto de la spec: celda `9 / span 4` x `9 / span 2`, stats Nivel, Puntos y Owns, tokens `--color-marca-htb` (#1A2332) y `--color-marca-htb-accent` (#9FEF00), texto degradado «Estadísticas no disponibles».

## Rojo (REQ-92-15)

Escribí `tests/htb-hero-card.test.mjs` (REQ-92-01..13, 13 tests) antes de tocar el JSON, los tokens, las hojas o los componentes. Salida de `node --test tests/htb-hero-card.test.mjs`:

```
✖ REQ-92-01: hero-cards.json incluye la tarjeta htb tras twitch-bottom
✖ REQ-92-02: tokens.css declara los tokens de marca HTB sin superar 100 líneas
✖ REQ-92-03: hero-card.css fija fondo y celda de la card htb
✖ REQ-92-04: htb-card.astro pinta article.hero-card.hero-card--rich con p.card-title
✖ REQ-92-05: htb-card.astro monta la isla con server:defer y fallback dentro del article
✖ REQ-92-06: el registro de hero-grid-card.astro asocia htb con htb-card.astro
✔ REQ-92-07: la isla conserva credenciales, getProfileOrNull, caché y ausencia de lógica
✖ REQ-92-08: con perfil la isla pinta Nivel, Puntos y Owns (user / root) con N/D
✖ REQ-92-09: sin perfil la isla pinta Estadísticas no disponibles
✖ REQ-92-10: index.astro deja de importar y renderizar la sección HTB
✖ REQ-92-11/12: la card hereda .hero-card y su contenido va en flujo sobre los pseudo-elementos
✖ REQ-92-13: hojas de la card e isla solo con tokens y archivos tocados ≤100 líneas
✖ REQ-92-10 (build): el fallback aparece una sola vez dentro de la card htb del grid
ℹ tests 13
ℹ pass 1
ℹ fail 12
```

REQ-92-07 ya pasaba en rojo, y es lo esperado: protege lo que la isla tenía que conservar (credenciales `ENV || env`, `getProfileOrNull()`, `Cache-Control`, nada de lógica).

Hice un único ajuste a mi propio test durante el verde, en REQ-92-13. Al principio exigía `var(--color-marca-htb-accent)` literal. Ahora acepta también la forma con respaldo `var(--color-marca-htb-accent, var(--color-accent))`. Lo cambié porque REQ-22-05, un test heredado que la spec no manda tocar, sigue pidiendo `var(--color-accent)` en la hoja.

## Cambios

- `src/data/hero-cards.json`: entrada `{ id: htb, kind: htb, title: HACK THE BOX, colorToken: htb, gridColumn: 9 / span 4, gridRow: 9 / span 2 }`, colocada después de twitch-bottom (REQ-92-01).
- `src/styles/tokens.css` (99 líneas): `--color-marca-htb: #1A2332` y `--color-marca-htb-accent: #9FEF00` en el grupo de marca (REQ-92-02).
- `src/styles/hero-card.css` (85 líneas): regla `[data-color-token="htb"] { --card-bg: var(--color-marca-htb); --card-column: 9 / span 4; --card-row: 9 / span 2; }` (REQ-92-03).
- `src/components/hero-cards/htb-card.astro` (nuevo, 23 líneas): componente prerenderizado con `<article class="hero-card hero-card--rich" data-color-token={card.colorToken}>`, `header.card-header > p.card-title` y `div.hero-card__body`. Dentro monta `<HtbStadistics server:defer>` con `<p class="hero-card__loading" slot="fallback">Cargando estadísticas de HTB...</p>`. La prop es `card: HeroRichCard` (REQ-92-04/05).
- `src/styles/htb-card.css` (nuevo, 22 líneas): el cuerpo lleva `position: relative; z-index: 5` para quedar sobre `::before/::after`. Su padding superior (`calc(var(--gap-card) * 4)`) deja libre el `card-header` absoluto. El contenido va en flujo y sin alto fijo. No redefine radio, borde, sombra, transform ni transición, que se heredan de `.hero-card` (REQ-92-11/12, Decisión 6).
- `src/components/hero-cards/hero-grid-card.astro`: el registro pasa a `{ icon: HeroCard, htb: HtbCard }` (REQ-92-06).
- `src/components/htb-stadistics.astro` (35 líneas): frontmatter idéntico (credenciales, `getProfileOrNull()`, `Cache-Control`) más un comentario. La raíz pasa de `section` a `div.htb-stadistics`. Desaparecen el h2, la intro y los campos Nombre, País y Miembro desde. Pinta `{profile && (<ul class="htb-stadistics__list">…)}` con Nivel, Puntos y Owns `user / root` (N/D si el valor es nulo) y `{!profile && <p class="htb-stadistics__empty">Estadísticas no disponibles</p>}` (REQ-92-07/08/09).
- `src/styles/htb-stadistics.css` (54 líneas): queda solo la lista compacta. Las etiquetas van en mayúsculas con `--color-text-secondary` y los valores en `var(--color-marca-htb-accent, var(--color-accent))` con `--font-mono`. Lleva `flex-wrap` para columnas estrechas y el aviso degradado sobre `--color-surface`. No hay hex ni rgb/rgba (REQ-92-13).
- `src/pages/index.astro`: quité el import de HtbStadistics y la sección suelta (REQ-92-10).
- No toqué `new-hero.astro`, `hero-section.css` ni `hero-card.astro`.

## Tests heredados adaptados (REQ-92-14), todos con nota de precedente

La spec los enumera:
1. `tests/htb-stadistics-section.test.mjs`: REQ-22-01 se comprueba ahora en `htb-card.astro` en vez de `index.astro` (mismo server:defer, mismo slot fallback, mismo texto). Para REQ-22-05, `--container-max` sale de la lista de tokens. No cambian getProfileOrNull, la ausencia de fetch y de console, los secretos no interpolados, el esquema env ni la comprobación de sin lógica y sin estilos.
2. `tests/search-landing-live-transition.test.mjs`: REQ-05-00 «conserva la sección HTB» se comprueba ahora en `htb-card.astro`. Añadí además que `index.astro` sigue montando `<NewHero/>`, que es quien contiene la card.
3. `tests/visual-polish-refactor.test.mjs`: REQ-37-07 ya no busca `margin-block` en la sección. Ahora exige un `gap` con `var(--gap-card)` en `.htb-stadistics__list`.
4. `tests/hero-cards-repository.test.mjs`: REQ-06-01 pasa a 13 entradas, de las que 12 son de icono (sin kind) y 1 es htb. En REQ-31-02/05, `EXPECTED_CARDS` incluye la HeroRichCard htb y se mantiene el deepEqual.
5. `tests/hero-ui-refactor.test.mjs`: REQ-09-03 pasa a 13 entradas con 1 htb. Sigue exigiendo una regla CSS por cada colorToken.
6. `tests/hero-card-kinds-domain.test.mjs`: REQ-90-09 pasa a 13 entradas, y las 12 de icono siguen sin campo kind.
7. `tests/hero-card-registry.test.mjs`: REQ-91-07 sigue exigiendo las 12 de icono en el orden del JSON. La htb queda fuera de ese recuento porque su presencia la cubre REQ-92-10 (build).

La spec no los enumera, pero REQ-92-02/03 los obliga (los dos tokens ponen tokens.css en 99 líneas, como dice la descripción de la feature, y hero-card.css gana una regla). Usé el mismo patrón que las features 51, 61 y 89 (precedente REQ-43-06):
8. Conteo de tokens.css de 97 a 99: REQ-17-09 (`article-card-images`), REQ-26-07 (`post-page-styles`), REQ-39-09 (`post-header`), REQ-40-11 (`post-readability`), REQ-42-09 (`post-header-horizontal`), REQ-77-01/02 (`header-height-64`), REQ-83-13/14 (`about-experience-skills`), REQ-82-14..17 (`about-hero-stats`), REQ-84-13..15 (`about-projects-credentials`) y REQ-79-08/35/36 (`mobile-hamburger-menu`). En los cuatro tests de about y menú, la nota va en la misma línea, porque esos tests limitan su propio archivo a 100 líneas.
9. `tests/video-desktop-width.test.mjs`: el meta-test REQ-16-09 pasa a exigir 99 y que la justificación cite `--color-marca-htb`.
10. `tests/geist-pixel-extend.test.mjs`: REQ-87-06/07/19 saca `src/styles/hero-card.css` de la lista «sin cambios frente a HEAD», como se hizo con Layout.astro en la feature 89.

Ninguna comprobación de seguridad o degradación quedó más débil. Siguen igual getProfileOrNull, la prohibición de getProfile(), `{profile &&`, la ausencia de lógica, Cache-Control con la constante, el fallback de credenciales y no interpolar secretos.

## Verificación visual (REQ-92-11/12)

Hice `pnpm build`, levanté `astro preview --port 4392` y medí con Chrome headless + CDP (DPR 1). El script es ad hoc y está en el scratchpad, fuera del repo. Comprobé dos estados:
- **Real**: la isla respondió y quedó en el estado degradado «Estadísticas no disponibles», porque no hay perfil con las credenciales locales.
- **Con perfil**: inyecté en el DOM la lista con Nivel «Pro Hacker», Puntos 1234 y Owns «120 user / 80 root».

| Viewport | Card (x, y, w x h) | scrollWidth / clientWidth | Hijos fuera de la card |
|---|---|---|---|
| 1440x900 | 951, 380, 444 x 204, en la misma fila que twitch-bottom | 1430 / 1430 | ninguno (real y con perfil) |
| 1024x900 | 149 x 149 degradada; 149 x 276 con perfil (la fila crece) | 1014 / 1014 | ninguno |
| 375x812 | 356 x 190 | 375 / 375 | ninguno |

No hay scroll horizontal en ningún viewport y ningún hijo (título, cuerpo, items, aviso) sale de la caja de la card. `scrollHeight > clientHeight` también ocurre en la card twitch-bottom de referencia: lo provoca el glow `::after` de `.hero-card` (bottom -45px), que no es contenido. Radio computado: 22px. Fondo: rgb(26, 35, 50), que es `--color-marca-htb`. Valores: rgb(159, 239, 0), que es `--color-marca-htb-accent`. Paré el preview por su PID y el puerto quedó libre.

Hover y reduced-motion vienen de la clase `hero-card`: el test confirma que htb-card.css no los redefine y que siguen las reglas de hero-card.css.

## Verde (REQ-92-16)

- `node --test tests/htb-hero-card.test.mjs`: 13/13 en verde.
- `pnpm test`: 967 tests, 967 pass, 0 fail.
- `./init.sh`:

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Notas para el reviewer

- No añadí dependencias. Todos los archivos tocados tienen 100 líneas o menos, salvo los tests, que ya superaban ese límite antes; el nuevo tiene 146. No hay `<style>` ni `style=` inline. El único JS de cliente es el script de la isla de Astro.
- Como antes, la respuesta degradada de la isla se cachea una hora, sin cambio.
- No hice commits. La feature queda en `in_progress` hasta el APPROVED.
