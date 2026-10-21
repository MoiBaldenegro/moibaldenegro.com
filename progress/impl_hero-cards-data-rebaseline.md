# Implementación — feature 111 hero-cards-data-rebaseline

Implementer, 2026-10-20. Spec: `specs/111_hero-cards-data-rebaseline/` (REQ-111-01..15, requirements.md + design.md).
Análisis: `progress/research/hero-cards-data-rebaseline.md`. Sin subagentes, sin commits. La 109 sigue `blocked` con su
implementación en el árbol (hero-card-accents.css, tests/hero-backdrop-bottom-left.test.mjs y sus 3 tests ajustados):
no se ha tocado nada de ella.

## Cambios

- `src/styles/hero-card.css` (99 líneas, sin cambio de recuento): regla base `[data-color-token="cloudflare"]`
  `--icon-width 170px → 270px`, `--icon-rotation 0deg` (igual), `--icon-scale 1 → 1.25` (fijado por CDP, ver abajo);
  comentario del bloque de tokens actualizado. Overrides de @media 1200/768 sin tocar (la CDP no los pide).
- Tests re-basados con «Ajuste feature 111 (precedente REQ-43-06)»:
  - `tests/hero-backdrop-size.test.mjs` (95 → 97): REQ-108-05 deriva del JSON los pares id/backgroundIconSize y
    exige sm|md|lg y backgroundIcon presente (REQ-111-03); REQ-108-06/07/17 sin atributo si el JSON no declara tamaño
    (REQ-111-04).
  - `tests/hero-cards-extra-logos.test.mjs` (100 → 99, en el sitio): REQ-103-05..08 deriva del JSON las tarjetas con
    cornerIcon/backgroundIcon (solo de icono, refs al sprite) y comprueba cada symbol en sprite.svg (REQ-111-05);
    REQ-103-09..11 espera svg 28px y mantiene la cadena exacta header → backdrop → icon → corner (REQ-111-06).
  - `tests/hero-cards-links-xlink.test.mjs` (39 → 41): REQ-107-30/31/35 espera tantos `<use href>` como
    icon + cornerIcon + backgroundIcon de las tarjetas de icono (19 hoy) y 0 xlink:href (REQ-111-07). REQ-107-26/27/36:
    `hero-card.css` sale de la lista de archivos congelados frente a HEAD (imprescindible: REQ-111-09 obliga a editarlo).
  - `tests/hero-cards-polish.test.mjs` (100, en el sitio): REQ-101-17 congela la instantánea de la 99 con la entrada
    cloudflare sustituida por los valores actuales (#cloudflare-cloud, scale 8, 270px) (REQ-111-08).
  - `tests/hero-cards-unique-tech.test.mjs` (100, en el sitio): REQ-98-01/02/05 con la fila cloudflare
    `270px, 0, cloudflare-cloud, 8` (fragmento y escala opcionales en la tabla) (REQ-111-08). Esto arrastra REQ-97-07/08,
    que lee la misma tabla y exige ahora `--icon-width: 270px` en la base: queda en verde con el CSS.
  - `tests/hero-cards-repository.test.mjs` NO se toca (REQ-98-01/02/05 vive en hero-cards-unique-tech; 146 líneas).
  - `tests/hero-cards-icon-fit.test.mjs` intacto (REQ-97-20 / REQ-98-35 sin excluir tarjetas, REQ-111-10).
- Test nuevo `tests/hero-cards-data-rebaseline.test.mjs` (61 líneas, solo `node:` + repositorio de dominio): REQ-111-02
  (15 tarjetas sin HeroCardsDataError, campos de cloudflare), REQ-111-09 (270px / 0deg fuera de @media, hero-card.css
  <= 100), REQ-111-03..08/15 (nota en cada test re-basado, <= 100 líneas, repositorio sin crecer), REQ-111-13 (capturas),
  REQ-111-11/12 (este informe), REQ-111-14 (sprite y hack-the-box-sprite sin diff frente a HEAD).

## Rojo

Línea base (`./init.sh` antes de tocar nada): código 1, 1140 tests, 1132 pass, **8 fail**: REQ-108-05,
REQ-108-06/07/17, REQ-103-05/06/07/08, REQ-103-09/10/11, REQ-97-20 / REQ-98-35, REQ-107-30/31/35, REQ-101-17,
REQ-98-01/02/05 (la lista de progress/impl_hero-backdrop-bottom-left.md). Mensajes clave:
`claude-code lg ≠ md`, `data-backdrop-size="undefined"`, `rust con otro marcado (28px vs 32px)`, `uses 19 ≠ 17`,
`cloudflare iconWidth 270px ≠ 170px`, `actual { icon: '#cloudflare-cloud', iconWidth: '270px', scale: 8 }`.

Tras re-basar los tests y escribir el test nuevo, antes del CSS (53 tests de los 7 archivos de la feature):
6 fail — REQ-111-09 (base 170px), REQ-111-13 (sin capturas), REQ-111-11/12 (sin informe), REQ-111-03..08/15 (contador
del repositorio, corregido a 147 = 146 de `wc -l` sin salto final), REQ-97-20 / REQ-98-35 y REQ-97-07/08 (base 170px).

CDP en rojo a 1280 px (REQ-111-12), build del árbol previo servido estático en :4391:
- Árbol previo tal cual (170px / scale 1): nube 61.8x27.9 px en x 68.5, intersección con el título 0, 100 % dentro:
  la geometría ya cumplía; el rojo del árbol previo es REQ-97-20 (CSS 170px frente al JSON 270px).
- Datos del JSON llevados literalmente al CSS (270px / 0deg / **scale 8**, inyectado): nube 494.3x223.6 px en
  x -197.8, solo **27.2 %** dentro del article (< 90 %) y a 7 px del título: **rojo**. Captura
  `progress/research/hero111/red-json-scale8-cloudflare-1280.png` (y `before-cloudflare-1280.png` del árbol previo).
  Confirma la Decisión 1: el scale 8 del JSON no se replica en CSS.

## Calibración de --icon-scale (base, aplica a todos los anchos: los @media no lo redefinen)

Con 270px el centro del svg queda en x = ancho − 139 px, así que la nube se desplaza a la izquierda en las cards
estrechas de escritorio. Medido con override inyectado (1201/1280/1366/1600):

| scale | 1201 dentro | 1280 dentro | 1600 dentro | Título |
|---|---|---|---|---|
| 1.25 | 97.8 % | 100 % | 100 % | 0 |
| 1.5 | 89.8 % | 100 % (a 3 px del borde) | 100 % | 0 |
| 2 | 79.9 % | 90.0 % | 100 % | 0 |

Elegido **1.25** (nube 77.2x34.9 px, +25 % frente al árbol previo): cumple con holgura en todo el tramo >= 1201 px,
no solo en los 5 anchos; 1.5 quedaba pegada al borde a 1280 y por debajo del 90 % a 1201.

## Verde

CDP final sobre `astro preview --port 4393` (con server island; **0 errores** de consola/red) y estático :4392
(solo los 404 esperables de `/_server-islands/HtbStadistics`). Medida con `getBoundingClientRect` del `<use>` de
`.card-icon` (parte visible = intersección con el article) frente a los rects del Range del título. A 375 px la card
está oculta por showOnMobile false (106): se fuerza `data-show-on-mobile="true"` solo para medirla.

| Ancho | Card | --icon-width / scale | Nube (x, y, w x h) | Intersección título | Dentro | Hueco al título |
|---|---|---|---|---|---|---|
| 375 | 346.8x190 | 110px (!important 768) / 1.25 | 248.1, 125.5, 77.2x34.9 | 0 | 100 % | 89.5 px |
| 800 | 113.4x140 | 100px / 1.25 | 19.8, 75.5, 77.2x34.9 | 0 | 100 % | 39.5 px |
| 1024 | 148.9x140 | 100px / 1.25 | 55.3, 75.5, 77.2x34.9 | 0 | 100 % | 39.5 px |
| 1280 | 189.4x204 | 270px / 1.25 | 10.8, 139.5, 77.2x34.9 | 0 | 100 % | 101.5 px |
| 1600 | 238.3x204 | 270px / 1.25 | 59.7, 139.5, 77.2x34.9 | 0 | 100 % | 101.5 px |

Extra (no exigido): 1201 px 97.8 % dentro, 1366 px 100 %. Mosaico: las 15 cards con el mismo rect antes/después a los
5 anchos (Δ 0) y `scrollWidth` igual (365/790/1014/1270/1590, sin desbordamiento horizontal). Capturas:
`progress/research/hero111/cloudflare-{375,800,1024,1280,1600}.png` (logo reconocible, sin tapar el título).

`./init.sh` final: **código 0**, todas las comprobaciones en verde («El entorno está perfecto»); suite completa
`node --test "tests/**/*.test.mjs"`: **1146 tests, 1146 pass, 0 fail** (1140 de la línea base + 6 del test nuevo),
con la 109 incluida en el árbol.

## Peso de la portada

`dist/client/index.html`: 39 777 B antes y 39 777 B después (el CSS no se inlina; el cambio es de valores). Umbral de
REQ-47-06 (< 40 000 B) **intacto**: no hace falta usar la aprobación humana del 2026-10-20 para subirlo.

## Alcance y archivos ajenos

- sha256 iguales al inicio y al final: `src/data/hero-cards.json` (REQ-111-01), `public/assets/svg/sprite.svg`,
  `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs` (REQ-111-14).
- Servidores :4391, :4392 y :4393 parados; :4321 (pnpm dev) sin tocar.

## Hallazgos para el líder/humano (no bloquean, fuera de alcance)

- A 800 px el icono de esquina #cloudflare-cloud (18x18, right 14px) se solapa con el final de «CLOUDFLARE»: el título
  (85.9 px desde x 15) es una sola palabra que no puede partirse en una card de 113 px pese al header reservado a
  right 40px. Preexistente (dato del humano + 103); se ve en `cloudflare-800.png`. Arreglarlo tocaría
  hero-card-accents.css (de la 109) o el tamaño del título: feature aparte.
- Con 270px la nube principal queda a la izquierda/centro en escritorio (no abajo a la derecha como el resto) y cerca
  del wordmark de fondo abajo a la izquierda (109). Es consecuencia del iconWidth del humano (H3).
- H1 sigue vigente: `scale` del JSON no se consume en el render.
