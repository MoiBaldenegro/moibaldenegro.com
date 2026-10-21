# Implementación — feature 112 hero-rich-card-logos

Spec: `specs/112_hero-rich-card-logos/requirements.md` (REQ-112-01..26) y `design.md`. Análisis: `progress/research/hero-rich-card-logos.md`.
Valores por defecto de la spec aplicados sin cambios, con una sola adición prevista por la Decisión 4 (margen negativo del wordmark).

## Cambios

- `src/domain/entities/hero-card.ts`: `HeroRichCard` gana `readonly icon?: string`, `readonly backgroundIcon?: string` y `readonly backgroundIconSize?: HeroBackdropSize` (REQ-112-01).
- `src/domain/repositories/hero-cards-fields-parse.ts`: `readSpriteRef` admite también el campo `icon`.
- `src/domain/repositories/hero-cards-parse.ts`: `parseRichCard` lee `icon` y `backgroundIcon` (`readSpriteRef`) y `backgroundIconSize` (`readBackdropSize`) con el mismo `HeroCardsDataError` (REQ-112-02..05). Si no están, la tarjeta no tiene esas claves.
- `src/data/hero-cards.json`: la card htb declara `icon #htb`, `backgroundIcon #htb-wordmark` y `backgroundIconSize sm`; el resto de sus campos no cambia (REQ-112-06, con la autorización humana de la petición).
- `src/components/hero-card-art.astro` (nuevo, 31 líneas): pinta `.card-backdrop` (con `data-backdrop-size`) y `.card-icon` con el mismo marcado que tenía `hero-card.astro`. Importa `hero-card.css` y `hero-card-accents.css` (REQ-112-08).
- `src/components/hero-card.astro`: sustituye su marcado de fondo e icono por `<HeroCardArt card={card} />` (REQ-112-09/10).
- `src/components/hero-cards/htb-card.astro`: `{(card.icon || card.backgroundIcon) && <HeroCardArt card={card} />}` va tras el header, antes de `.hero-card__body` y de `a.card-link` (REQ-112-11/12).
- `src/styles/htb-card.css` (36 líneas):
  - `.hero-card--rich .card-icon { opacity: 0.16; pointer-events: none; }`
  - `.hero-card--rich[data-color-token="htb"] { --icon-width: 150px; --icon-rotation: -8deg; --icon-scale: 6; }`
  - `--icon-scale: 3` dentro de `@media (max-width: 1200px)` (REQ-112-13/14).
  - No hay regla `:hover` nueva: el hover sale de `.hero-card:hover .card-icon svg` (hero-card.css).
- `src/styles/hero-card-accents.css` (67 líneas): `.card-backdrop:has(use[href$="#htb-wordmark"]) svg { aspect-ratio: 300 / 58.8; margin-bottom: calc(-100% * 5.9 / 300); }` (REQ-112-15).
  - Sobre el margen (Decisión 4 de design.md, igual que el de anthropic-wordmark en la 105): `getBBox` del symbol da el glifo en x 18.4..281.766 e y 5.719..52.9 de 0 0 300 58.8.
  - Sin el margen, el borde inferior del `use` quedaba a 2,3-8,3 px del de la card (5,1 / 2,3 / 2,7 / 6,8 / 8,3 px a 375 / 800 / 1024 / 1280 / 1600) (incumplía REQ-112-19). Con el margen queda a 1 px, que es el borde de 1 px de la card, en los cinco anchos.
- Sin JS, sin `<style>` ni style inline, sin tokens nuevos ni hex. `hero-card.css` (99 líneas) no se toca.

## Ciclo rojo / verde

Test nuevo: `tests/hero-rich-card-logos.test.mjs`. Son 100 líneas y solo usa `node:test`, la stdlib, `../src/` y `./helpers/astro-build.mjs`.

La línea base de las cards de icono se guardó antes de tocar código: `progress/research/hero112/icon-cards-baseline.html`, sacada de un build recién hecho de 39 895 B con 14 `article.hero-card` de icono.

Rojo, antes de implementar (`node --test tests/hero-rich-card-logos.test.mjs`):

```
✖ REQ-112-01: HeroRichCard declara icon, backgroundIcon y backgroundIconSize opcionales y readonly
✖ REQ-112-02/03/04: la rica devuelve los tres campos si los declara y no tiene las claves si los omite
✖ REQ-112-05: icon, backgroundIcon o backgroundIconSize inválidos lanzan HeroCardsDataError con archivo, índice y campo
✖ REQ-112-06/07: la card htb del JSON declara #htb, #htb-wordmark y sm; los symbol de las ricas existen en el sprite
✖ REQ-112-08/09/11/12: hero-card-art.astro pinta las capas; hero-card y htb-card lo usan sin marcado propio
✖ REQ-112-13/14/15: opacidad e inercia del cubo, geometría htb y ratio del wordmark, sin :hover nuevo
✖ REQ-112-10/11/25 (build): cards de icono byte a byte iguales, capas HTB antes del cuerpo y peso bajo el umbral
   (falla por "la card HTB no lleva wordmark + cubo justo antes de .hero-card__body"; la comparación con la línea base pasaba)
✖ REQ-112-22: capturas de la card HTB en reposo y hover a 375/800/1024/1280/1600 px
✖ REQ-112-23/26: test solo con node: y helpers, archivos tocados <= 100 líneas y hero-card.css sin cambios de tamaño
ℹ pass 0
ℹ fail 9
```

Durante la implementación corregí dos cosas del propio test antes del verde:

- Lo recorté a 100 líneas.
- Usa `class="hero-card__body"` y `class="card-link"` como referencias de orden. Antes usaba `card-link` a secas, que coincide con el import `hero-card-link.css`.

Verde, mismo archivo:

```
✔ REQ-112-01 … ✔ REQ-112-23/26 (9 tests)
ℹ tests 9
ℹ pass 9
ℹ fail 0
```

Suite completa (`pnpm test`): `ℹ tests 1163`, `ℹ pass 1163`, `ℹ fail 0`.

`./init.sh`: todo ✔ («El entorno está perfecto»), con código de salida 0.

## Peso de la portada (REQ-112-25)

- Antes: `dist/client/index.html` pesaba 39 895 B (build limpio al empezar).
- Después: entre 40 203 y 40 215 B según el build (varía la clave de la isla). Son unos +310 B por las dos capas de la card HTB.
- Superaba 40 000 B, así que el umbral de REQ-47-06 (`tests/search-index-lazy-load.test.mjs`) pasa a 42 000 B. La nota es «Ajuste feature 112 (precedente REQ-43-06)» y cita la aprobación humana de 2026-10-20 («queda aprobado subir lo permitido de lineas de codigo para la portada por que si seguiremos haciendo cosas»).
- 42 000 B es el tope de REQ-96-07. Queda un margen de ~1 790 B. El test nuevo falla si se llega a 42 000 B.

## Tests heredados ajustados (REQ-112-24)

Todos llevan «Ajuste feature 112 (precedente REQ-43-06)» en la línea ajustada.

| Test | Ajuste |
|---|---|
| `tests/search-index-lazy-load.test.mjs` | Umbral de 40 000 a 42 000 B con nota y aprobación humana. El archivo ya tenía 155 líneas; se le suma 1 línea de comentario. |
| `tests/hero-cards-polish.test.mjs` (REQ-101-11/12/13, REQ-101-17) | Ignora el import y el uso de HeroCardArt y el comentario de la 112 en htb-card.astro. El JSON congelado ignora el `icon` de la rica htb. |
| `tests/hero-cards-extra-logos.test.mjs` (REQ-103-01, 05..08, 12/13) | HeroRichCard ya puede tener `backgroundIcon` (sigue sin `cornerIcon`). Las ricas pueden llevar backgroundIcon pero no cornerIcon. `card.backgroundIcon` se busca en hero-card.astro + hero-card-art.astro. |
| `tests/hero-backdrop-subtle-bottom.test.mjs` (REQ-105-01) | El orden backdrop < icon se lee en hero-card-art.astro (+1 línea, 95 líneas). |
| `tests/hero-backdrop-size.test.mjs` (REQ-108-06/07, 06/07/17, 15/16/17) | El marcado del fondo se lee en hero-card-art.astro. La regex del article admite `hero-card--rich`. El peso se compara con el umbral vigente. La guarda del umbral admite 40000\|42000. |
| `tests/hero-backdrop-bottom-left.test.mjs` (REQ-109-15/16) | La guarda del umbral admite 40000\|42000. |
| `tests/hero-cards-links-new-tab.test.mjs` (REQ-110-13/14) | Acepta la nota de la 110 o de la 112. |
| `tests/hero-cards-links-xlink.test.mjs` (REQ-107-29, 30/31/35, 26/27/36) | Los `<use>` se leen en hero-card.astro + hero-card-art.astro. Los `<use>` esperados incluyen los de la rica. El peso se compara con el umbral vigente. `tests/search-index-lazy-load.test.mjs` sale de la lista de no tocar, porque REQ-112-25 lo exige y lo vigila el test nuevo. |
| `tests/hero-cards-mobile-visibility.test.mjs`, `tests/hero-cards-links.test.mjs` | El peso se compara con el umbral vigente de REQ-47-06. |
| `tests/htb-hero-card.test.mjs` (REQ-92-01), `tests/hero-cards-unique-tech.test.mjs` (REQ-97-10) | La card htb esperada incluye sus tres campos de logo. |

Observación: `tests/htb-hero-card.test.mjs` (144 líneas) y `tests/search-index-lazy-load.test.mjs` (155 → 156) ya superaban las 100 líneas antes de la 112.

- En htb-hero-card el ajuste va dentro de la línea existente, sin crecer.
- En search-index-lazy-load se añade solo la línea de la nota obligatoria.

Todos los demás archivos tocados tienen 100 líneas o menos.

## Archivos ajenos (REQ-112-26)

En esta sesión no se tocaron:

- `public/assets/svg/sprite.svg`
- `src/content/posts/**`
- `tests/hack-the-box-sprite.test.mjs`
- `src/styles/hero-card.css`
- `src/styles/tokens.css`

Sus mtime son anteriores a la sesión: hero-card.css 2026-10-20 20:41, sprite 2026-10-20 15:54, post 2026-10-20 18:02, tokens 2026-10-19, test HTB 2026-10-19.

Ojo: `git diff HEAD` ya listaba `src/styles/hero-card.css` (cambio de la 111) y `src/content/posts/systems-design/00-systems-design-template.md` (edición humana) desde antes de empezar, como muestra el git status inicial. No son de esta feature.

## Verificación en navegador (Chrome headless + CDP)

- Script: `progress/research/hero112/m112.mjs` (copia de `scratchpad/cdp112/m112.mjs`).
- Datos crudos: `progress/research/hero112/final.json`. Resumen: `progress/research/hero112/summary.txt`.
- Servidor: `astro preview --port 4620` sobre el build final, con la isla `server:defer` real. Se paró al terminar. El `pnpm dev` de :4321 (PID 34400) no se tocó.
- La isla devolvió el aviso «Estadísticas no disponibles» (variante empty). Para cubrir la otra variante, en la sesión CDP se inyectó en el cuerpo la lista (Nivel/Puntos/Owns) con las clases reales de htb-stadistics.css y también se midió.
- Contraste: se ponen los textos en transparente, se captura su caja y se toma el píxel del fondo compuesto que da el contraste más bajo frente al color del texto. En hover, al color del texto se le aplica `contrast(1.4)`.

Errores de consola, red y excepciones: 0 en todo el recorrido.

### Hover del cubo (REQ-112-16)

| Ancho | `--icon-*` | transform en reposo | transform en hover | esperado `rotate(2deg) scale(s*1.12)` | regla que casa |
|---|---|---|---|---|---|
| 375 | 150px, -8deg, 3 | matrix(2.9708, -0.4175, …) | matrix(3.35795, 0.117262, …) | matrix(3.357953, 0.117262, …) | `.hero-card:hover .card-icon svg` |
| 800 | 150px, -8deg, 3 | ídem 375 | ídem 375 | ídem | ídem; GITHUB da la misma regla y fórmula (2.23864) |
| 1024 | 150px, -8deg, 3 | ídem | ídem | ídem | ídem; GITHUB coincide |
| 1280 | 150px, -8deg, 6 | matrix(5.94161, -0.835039, …) | matrix(6.71591, 0.234525, …) | matrix(6.715906, 0.234525, …) | ídem; GITHUB coincide (5.59659) |
| 1600 | 150px, -8deg, 6 | ídem 1280 | ídem 1280 | ídem | ídem; GITHUB coincide |

### Capas, puntero y wordmark (REQ-112-17/19/20)

En los cinco anchos, en reposo y en hover:

- **Capas.** Orden DOM: card-header, card-backdrop, card-icon, hero-card__body. z-index: backdrop 0, icon auto, header 4, body 5. La card HTB no tiene `href` (null), así que no hay `a.card-link` que medir.
- **Opacidad y eventos.** `.card-icon` tiene opacity 0.16. pointer-events es none en `.card-icon`, en su svg y en `.card-backdrop`. El backdrop tiene opacity 0.06, `data-backdrop-size="sm"` y aspect-ratio 300 / 58.8.
- **elementFromPoint en el cuerpo.** Se midió en cuatro puntos (centro, 15/30 %, 85/80 % y 50/95 %) y siempre devuelve `.hero-card__body`.
  - Sobre el centro del cubo devuelve `article` (a 375/1280/1600, donde el cubo queda fuera del cuerpo) o `.hero-card__body` (a 800/1024). Nunca devuelve `.card-icon` ni `.card-backdrop`.
- **Wordmark.**
  - El borde inferior del `use` de `.card-backdrop` queda a 1 px del de la card (el borde de 1 px) en los cinco anchos, en reposo, en hover y con las dos variantes del cuerpo.
  - Solape del `use` con el título: 0 px² en todos los casos.
- **Overflow.** La card tiene `overflow: hidden`: cubo y wordmark quedan recortados dentro de la card.

| Ancho | card (px) | scrollWidth / innerWidth | use wordmark (w x h) | borde inferior del use | solape con título |
|---|---|---|---|---|---|
| 375 | 346.8 x 190 | 365 / 375 (sin scroll horizontal) | 181.5 x 32.5 | 1 px | 0 |
| 800 | 113.4 x 140 | 790 / 800 | 58.6 x 10.5 | 1 px | 0 |
| 1024 | 148.9 x 140 | 1014 / 1024 | 77.3 x 13.9 | 1 px | 0 |
| 1280 | 494.5 x 422 | 1270 / 1280 | 259.4 x 46.5 | 1 px | 0 |
| 1600 | 616.8 x 422 | 1590 / 1600 | 323.8 x 58 | 1 px | 0 |

### Contraste (REQ-112-18)

Mínimo por texto, en :1. Todos dan 4.5:1 o más.

| Ancho | estado | HACK THE BOX | «Estadísticas no disponibles» | lista inyectada: Nivel / valor / Puntos / valor / Owns / valor |
|---|---|---|---|---|
| 375 | reposo | 13.11 | 7.45 | 7.73 / 10.31 / 8.04 / 9.5 / 8.04 / 6.05 |
| 375 | hover | 19.01 | 13.12 | 13.38 / 16.37 / 13.54 / 15.56 / 13.54 / 9.55 |
| 800 | reposo | 13.05 | 4.89 | 7.36 / 10.75 / 7.36 / 10.06 / 4.73 / 6.15 |
| 800 | hover | 18.69 | 8.75 | 13.01 / 16.72 / 12.93 / 16.14 / 8.23 / 9.7 |
| 1024 | reposo | 13.05 | 6.86 | 7.55 / 10.32 / 7.65 / 10.2 / 7.45 / 6.15 |
| 1024 | hover | 18.69 | 12.46 | 13.18 / 16.37 / 13.25 / 16.14 / 13.12 / 9.7 |
| 1280 | reposo | 12.76 | 6.86 | 6.86 / 9.5 / 7.17 / 9.93 / 7.55 / 10.46 |
| 1280 | hover | 18.43 | 12.46 | 12.46 / 15.56 / 12.81 / 15.99 / 13.18 / 16.46 |
| 1600 | reposo | 12.76 | 6.86 | 6.86 / 9.5 / 7.17 / 9.93 / 7.55 / 10.46 |
| 1600 | hover | 18.43 | 12.46 | 12.46 / 15.56 / 12.81 / 15.99 / 13.18 / 16.46 |

Los mínimos más ajustados están a 800 px en reposo: «Owns» 4.73 y el aviso 4.89. En esa celda estrecha (113 px) el cubo a escala 3 pasa justo por detrás del texto.

### Cards de icono y mosaico intactos (REQ-112-10)

- El HTML de las 14 cards de icono coincide byte a byte con la línea base (lo comprueba el test de build).
- En cada ancho se midieron los rects de todas las cards del mosaico y los de los svg de icono de las cards de icono, con las capas de la rica y tras quitarlas del DOM. Coinciden (`mosaicSame` y `iconsSame` true en los cinco anchos).
- Las reglas nuevas de CSS solo casan con `.hero-card--rich` o con `#htb-wordmark`.

### Capturas (REQ-112-22)

- `progress/research/hero112/htb-rest-{375,800,1024,1280,1600}.png` y `htb-hover-{375,800,1024,1280,1600}.png`.
- Extra: `alt-list-hover-<w>.png`, con la variante de lista inyectada en hover.

## Observaciones para el humano y el reviewer (no bloquean)

- La caja transformada del svg del cubo solapa la del título a 800 y 1024 px (2 744 y 1 891 px² en reposo; en hover 1 318 a 800 y 0 a 1024). Es el svg a opacidad 0.16 y el título mantiene 13:1 o más. REQ-112-19 solo pide solape 0 con el wordmark.
- En las celdas estrechas (800/1024) el cubo apenas asoma tras el cuerpo, como se ve en las capturas. Si se quiere más presencia, hay que revisar `--icon-scale 3` o `--icon-width` en ≤ 1200 px (es un valor por defecto revisable).
- El glifo del wordmark empieza en x = 18.4 de 300: con sm queda unos 6-23 px a la derecha del left de 16/10 px. No se compensa porque la spec no lo pide; REQ-109-08 solo lo hace con anthropic-wordmark.
- El `margin-bottom calc(-100% * 5.9 / 300)` depende del path de `#htb-wordmark` del sprite (glifo hasta y = 52.9, medido con getBBox). Si el symbol cambia, hay que repetir la medida, igual que con anthropic-wordmark (observación (al) de la 105).
