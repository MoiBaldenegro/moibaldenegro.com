# Review — feature 4

**Veredicto:** APPROVED

Feature 4 `promo-tiles-section`, revisada contra `specs/04_promo-tiles-section/requirements.md`
(REQ-04-01..21), `design.md`, `docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`.
La feature no tiene `depends_on`. Las features 1, 2 y 3 están `done` y la 4 es la única `in_progress`.

## Pregunta de revisión (TDD)

- Rojo: `progress/impl_promo-tiles-section.md` §3 recoge la salida en rojo de los dos tests nuevos
  antes de escribir el código: `ERR_MODULE_NOT_FOUND` del repositorio, `ENOENT` de `promo-tiles.astro`
  y `promo-tiles.css`, falta el token `color-promo-youtube`, y 0/5 en pass.
- Verde: 10/10 en los tests de la feature y 41/41 en la suite. He vuelto a ejecutar `./init.sh` en esta
  revisión y sale verde (entorno, formato, tests al 100 % y build).

## Coherencia acceptance <-> REQ

Los 10 criterios de `acceptance` cubren REQ-04-01..21 sin huecos. Cada uno tiene su test:
- `tests/promo-tiles-section.test.mjs` cubre REQ-04-01..07 y REQ-04-13.
- `tests/promo-tiles-section-ui.test.mjs` cubre REQ-04-08..12 y REQ-04-14..20.
- REQ-04-21 (regresión visual) tiene evidencia CDP en el informe §4: viewports 375, 768 y 1280,
  1 o 2 columnas según el caso, scrollWidth igual a clientWidth y 0 errores de consola de la sección.

## Verificación puntual

- `src/data/promo-tiles.json:1-44`: textos, tonos, hrefs y alts coinciden letra a letra con la tabla
  de design.md.
- `src/domain/repositories/promo-tiles-parse.ts:25-60`: comprueba que haya exactamente 4 cuadros, que
  los campos sean texto no vacío y que los href empiecen por `/` o `https://`. Cuando falla lanza
  `PromoTilesDataError` con un mensaje que nombra `promo-tiles.json`, `tiles[i]` y el campo.
- `src/domain/repositories/promo-tiles-repository.ts:31-43`: si falla el loader o el JSON no es válido,
  lanza un error con nombre propio. No hay fallos silenciosos.
- `src/components/promo-tiles/promo-tiles.astro`: el frontmatter solo tiene imports y la llamada al
  repositorio. La decisión de si un enlace es externo vive en `src/domain/promo-tiles.ts:10-12`.
  No hay `<script>` ni `<style>`.
- `dist/client/home/index.html`: la sección se renderiza tras el carrusel. Los enlaces `https://`
  llevan `target="_blank" rel="noopener noreferrer"` y los `/about` no llevan ninguno de los dos.
- `public/assets/pic01..04.webp`: son VP8 de 1920x1920, coherente con `width`/`height="1920"`.
- `src/styles/tokens.css`: 100 líneas. Los 8 tokens tienen los valores de design.md y se compactaron
  dos comentarios sin cambiar ningún valor. `audit-design-tokens` sale verde.
- La posición respecto a la referencia `section.PNG` es correcta: `src/pages/home.astro:24-25` pone
  `<LatestHorizontal />` seguido de `<PromoTiles />` dentro de `.home__landing`.

## Checkpoints
- C1 (estilos en `src/styles/`, sin `<style>` en `.astro`): [x]
- C2 (sin lógica en la UI; el frontmatter solo importa y pasa datos): [x]
- C3 (los datos llegan vía repositorio): [x]
- C4 (colores, radios y espaciados desde tokens): [x]. Los px literales de `promo-tiles.css` (52px,
  20px, 14px, 8px 18px…) son las medidas que fija design.md y siguen la norma del resto de hojas.
  El audit de colores sale verde.
- C5 (archivos de 100 líneas o menos): [x]. El máximo es `tokens.css` con 100 y `promo-tiles.css`
  tiene 98.
- C6 (sin dependencias nuevas): [x]
- C7 (JSON válido y tipado por la entidad `PromoTile`, readonly): [x]
- C8 (errores con nombre `*Error`): [x]
- C9 (`./init.sh` en verde): [x]
- C10 (desktop y móvil correctos y sin errores de consola): [x]. Evidencia CDP en el informe §4.
  Los dos 404 que aparecen (`/_server-islands/HtbStadistics` por el servidor estático y
  `api-auth.webp`) no tienen que ver con esta feature.
- C11 (backlog: la feature en curso es la única a medias): [x]. Sigue en `in_progress` hasta este
  APPROVED; la marca `done` es del líder.
- C12 (`progress/` documentado): [x]
- C13 (sin temporales, debug ni TODOs): [x]

## Cambios requeridos (si aplica)

Ninguno. Observaciones que no bloquean, para el líder al cerrar:
1. `public/assets/pic01..04.webp` no están en git. Hay que añadirlas en el commit de la feature
   o los cuadros saldrán sin imagen.
2. `progress/current.md` todavía tiene el bloque de la franja MXVI de una sesión anterior.
   Al cerrar el ciclo hay que moverlo a `progress/history.md` junto con el de esta feature.
3. `src/styles/promo-tiles.css:73` y `:81` repiten el `border-radius: var(--radius-pill)` que ya
   declara `.promo-tile__link` (`:65`). Es redundante pero inocuo, y hace que la regla de cada
   variante cumpla REQ-04-11/12 por sí sola.
