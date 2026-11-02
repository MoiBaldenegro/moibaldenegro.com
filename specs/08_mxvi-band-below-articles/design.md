# Diseño — mxvi-band-below-articles (feature 8)

## Contexto visual

- Pantalla: portada (`src/pages/home.astro`), contenedor `.home__landing`.
- Estado actual: NewHero, **MxviLogosBanner**, LatestArticles, LatestHorizontal, PromoTiles.
  La cinta MXVI va pegada al hero, como continuación del degradado morado.
- Estado deseado (petición humana: "pasa la cinta mejor abajo de los artículos"):
  NewHero, LatestArticles, LatestHorizontal, **MxviLogosBanner**, PromoTiles. La cinta separa
  el bloque de artículos de las tarjetas promocionales.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-mxvi-band` | (existente) | Padding vertical de la cinta; sin cambios salvo ajuste visual |
| `--color-border` | (existente) | `border-block` de la cinta; sin cambios salvo ajuste visual |
| `--gap-promo` | (existente) | Padding vertical de PromoTiles, referencia si hay que separar la cinta |

## Decisiones y constraints

- Decisión 1: solo se mueve la línea `<MxviLogosBanner/>` en `home.astro`; componente, CSS,
  datos y repositorio no cambian (la cinta es full-bleed autónoma: `width: 100vw` +
  `margin-inline: calc(50% - 50vw)`, y `.home__landing` ya recorta con `overflow-x: clip`).
- Decisión 2: si en la nueva posición el espaciado o los bordes se ven mal (p. ej. la cinta
  pegada al final de la reserva sticky de LatestHorizontal en escritorio o a PromoTiles), se
  ajusta solo `src/styles/mxvi-logos-banner.css` con tokens existentes (p. ej. `margin-block`
  con un token de espaciado). Sin hex, rgb ni px sueltos nuevos.
- Decisión 3: en escritorio (>=1201 px) LatestHorizontal es sticky con reserva de
  `margin-bottom`; la cinta debe aparecer solo cuando termina el recorrido horizontal, sin
  solaparse con las cards fijadas. Se verifica a 1280 px.
- Restricciones: estático, sin dependencias, <=100 líneas por archivo, estilos separados de
  la UI, solo tokens.

## Alternativa descartada

- Alternativa considerada: mover la cinta dentro del componente LatestHorizontal o de
  PromoTiles.
- Motivo del descarte: acopla componentes independientes; la composición de la portada vive
  en `home.astro` y basta con reordenar ahí.
