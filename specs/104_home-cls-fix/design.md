# Diseño — Reserva del layout horizontal de «Últimos artículos» desde el primer pintado (feature 104 home-cls-fix)

## Contexto visual

- Sección afectada: «Últimos artículos» de la portada en escritorio (>= 1201 px, movimiento permitido,
  JS habilitado). Apilado (<= 1200 px), reduced motion y sin JS no cambian.
- Estado actual: el servidor entrega el layout apilado (4532 px de documento a 1280×800). El ClientRouter
  restaura el scroll sobre él, se pintan 1-2 frames y luego latest-horizontal.ts crea el envoltorio y la
  clase .latest-articles--horizontal (3075 px). Con el scroll al fondo el footer salta dentro del viewport:
  CLS 0.4837 (1280×800) y 0.4074 (1600×900). Capturas: progress/research/cls104/before/.
- Estado deseado: desde el primer pintado la sección ya tiene el layout horizontal (par de cards en fila,
  centrado, sección de 100vh) y debajo el hueco del recorrido; al llegar el JS el envoltorio ocupa
  exactamente ese alto y nada visible se desplaza. Prototipo medido: CLS 0 en los 10 casos.
  Capturas: progress/research/cls104/prototype/.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--container-max` | (tokens.css) | Ancho de card dentro de la fórmula copiada de latest-horizontal.css |
| `--gap-card` | (tokens.css) | Gap del track, inset del par y recorrido reservado |

Custom properties propias de la sección (no son tokens nuevos): `--latest-card-width` y
`--latest-pair-inset`, con el mismo texto que en latest-horizontal.css (REQ-104-04).

## Decisiones y constraints

- Hoja nueva src/styles/latest-horizontal-reserve.css importada por latest-horizontal.astro (el mismo
  componente que monta el efecto; así la reserva solo existe en la portada).
- Consulta: `@media (min-width: 1201px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)`.
  Es la consulta DESKTOP de latest-horizontal.ts más `scripting: enabled` para que sin JS siga el
  apilado (precedente: site-menu.css de la 93).
- Selector base: `.latest-articles:not(.latest-articles--horizontal):has(> .latest-articles__list > .latest-articles__card:nth-child(3))`
  (con 2 cards init() no monta el horizontal, REQ-73-19/26). En cuanto el JS añade la clase, `:not()` la
  desactiva y manda latest-horizontal.css + envoltorio.
- Declaraciones copiadas de latest-horizontal.css: sección `width: 100%; min-height: 100vh; overflow: clip`;
  encabezado `width: calc(2 * var(--latest-card-width) + var(--gap-card)); margin-inline: auto`; track
  `display: flex; gap: var(--gap-card)`; card `flex: 0 0 var(--latest-card-width); width: var(--latest-card-width)`;
  primera card `margin-inline-start: var(--latest-pair-inset)`.
- Sin `position: sticky` (el sticky necesita el envoltorio; el frame previo al JS solo reserva alturas)
  ni `will-change`, `transform` u `opacity` (REQ-96-35/37: las cards se ven quietas antes del JS).
- Recorrido: `margin-bottom: calc((n - 2) * (var(--latest-card-width) + var(--gap-card)))` en la sección,
  una regla por cada n entre 3 y LATEST_POSTS_LIMIT (hoy solo n = 3, con
  `:has(> .latest-articles__list > .latest-articles__card:nth-child(3):last-child)`), porque
  latest-articles.astro está congelado (REQ-96-39) y no puede pasar n por custom property. Es la
  fórmula de pinScrollLength (src/domain/latest-horizontal.ts): alto del envoltorio = sección + recorrido.
- Límite de 100 líneas, sin dependencias, sin JS nuevo, estilos fuera del .astro.

## Alternativa descartada

- Renderizar el envoltorio y la clase desde el servidor y gatearlos con `(scripting: enabled)`: elimina
  también la creación en JS, pero obliga a reescribir latest-horizontal.ts, latest-articles.astro y
  REQ-73-25 (la sección vuelve a su sitio al revertir), todos congelados por la 96. Descartada por alcance.
- Retrasar la restauración del scroll hasta después de init(): la hace el ClientRouter de Astro antes de
  astro:page-load y no es configurable sin parchear el framework. Descartada.
- Script inline en el head que añade una clase antes del primer pintado: equivalente a
  `(scripting: enabled)` pero añade JS de runtime. Descartada.
