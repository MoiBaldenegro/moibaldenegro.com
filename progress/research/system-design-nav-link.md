# Análisis — Atajo en el header para artículos de diseño de sistemas (feature 93)

Petición humana 2026-10-14 (literal): «Agregar en el header atajo para artículos de diseño de sistemas».

## Qué es

Un enlace más en el nav de `src/layouts/Layout.astro` (dentro de `.site-menu`, junto a About y
Arquitectura), con el mismo patrón que la feature 08 (`architecture-nav-link`): `href="/<término>"`
servido por `src/pages/[...term].astro` (SSR, `prerender = false`), `aria-current="page"` cuando la ruta
activa es `/<término>` o `/<término>/`.

## Cómo hace el matching la ruta /<término>

- `termFromPathname` (src/components/search-results/term-route.ts) decodifica el path y cambia `/` por espacios.
- `searchIndex` (src/domain/search/search.ts) filtra por **subcadena** del término normalizado
  (`normalizeText`: minúsculas, sin diacríticos) sobre `título + descripción + tags (sin #) + cuerpo`.

## Datos reales (src/content/posts, 8 artículos)

No existe ningún artículo, tag, título ni texto que diga «diseño de sistemas» o «system design».
Recuento de artículos que devuelve cada término candidato (simulación del matching por subcadena):

| Término | Artículos | Comentario |
|---------|-----------|------------|
| `diseno de sistemas` / `diseño de sistemas` | 0 | No existe |
| `system design` / `system-design` | 0 | No existe |
| `software-design` (tag) | 4 | 00-agilismo, 01-diseño_detallado, 02-principios, 05-diseno-arquitectonico-vs-diseno-detallado |
| `diseno de software` | 2 | 01, 02 (solo por texto) |
| `diseno` | 7 | Incluye un post de OS (01-procesos-memoria): ruido |
| `sistemas` | 5 | Incluye 00-prueba-os (sistemas-operativos): ruido |
| `arquitectura` (atajo actual) | 7 | Ya cubierto por el enlace Arquitectura |

## Conclusión inicial: bloqueo (resuelto)

- Ninguna opción identificaba «diseño de sistemas» de verdad; la más cercana era el tag `software-design`
  (diseño de software). La feature 93 se dio de alta en `blocked` con la pregunta (a)/(b)/(c).

## Decisión humana 2026-10-14 (desbloqueo)

- Respuesta literal: «aunque aun no existan existirán, tú impleméntalo».
- Concreción del orquestador (opción b sin retaguear artículos): URL `/system-design` servida por
  `[...term].astro` (mismo patrón que `/arquitectura`), etiqueta visible «System Design», coherente con
  el tag `#software-design`; el tag futuro será `#system-design`.
- No se toca el frontmatter de ningún artículo. Hoy `/system-design` devuelve 0 artículos y muestra el
  estado vacío («No se encontraron resultados…» en search-results.astro; región de estado
  `statusMessage(0, …)` = «Sin resultados para "system-design"»). Es aceptable.
- Verificable sin depender del contenido: `statusForTermPath('/system-design')` = 200 (no 404) y
  `termFromPathname('/system-design')` = `system-design` (term-route.ts). No se afirma «0 resultados» en
  un test para que no rompa cuando se publiquen artículos con `#system-design`.
- Spec reescrita (REQ-93-01..14) y feature en `pending`.

## Corrección humana 2026-10-14 (idioma de la etiqueta y la URL)

- Respuesta literal: «Es en español, ahora mismo a la vista del usuario es en español, Diseño de sistemas».
- Concreción del orquestador: etiqueta visible «Diseño de sistemas» (no «System Design»); URL en español
  y ASCII `/diseno-de-sistemas` (como `/arquitectura` y la feature 45 ascii-post-slugs); tag futuro
  `#diseno-de-sistemas`. El name/slug de la feature (`system-design-nav-link`) no cambia para no romper
  rutas de artefactos (specs/93_system-design-nav-link/, este informe, tests/system-design-nav-link.test.mjs).
- Lo demás no cambia: sin retaguear artículos; 200 con estado vacío; enlace tras Arquitectura con
  aria-current en `/diseno-de-sistemas` y `/diseno-de-sistemas/`; 65 px a 800/1000/1280; sin desborde
  769-900 px; menú móvil intacto.
- Verificable: `statusForTermPath('/diseno-de-sistemas')` = 200 y `termFromPathname('/diseno-de-sistemas')`
  = `diseno-de-sistemas` (los guiones se conservan; solo `/` pasa a espacio). Con el término con guiones,
  hoy 0 artículos; un artículo futuro con tag `#diseno-de-sistemas` casará por subcadena en tags.
- REQ-93-01..14 y acceptance reescritos con los nuevos valores; feature sigue en `pending`.

## Qué toca

- `src/layouts/Layout.astro` (78 líneas, +1 línea): un `<a>` nuevo en `.site-menu` tras Arquitectura,
  `href="/diseno-de-sistemas"`, texto «Diseño de sistemas».
- Sin CSS nuevo: `.site-navbar nav a` (typography.css, Geist Pixel, feature 87) y
  `.site-navbar a[aria-current="page"]` (layout.css) ya cubren el enlace.
- Test nuevo `tests/system-design-nav-link.test.mjs` (patrón de tests/architecture-nav-link.test.mjs).
- No toca src/content/posts (REQ-93-11).

## Riesgos y trabas

- Altura del header: feature 87 midió 65 px a 800/1000/1280; «Diseño de sistemas» (18 caracteres) es más
  largo que «System Design» (13) y que «Arquitectura» (12), y en Geist Pixel el riesgo de que el enlace
  parta en dos líneas o el nav desborde a ~769-900 px es alto. Se verifica con Chrome headless (65 px y
  sin desborde horizontal entre 769 y 900 px); si falla, el implementer para y reporta (REQ-93-09) sin
  recortar la etiqueta ni tocar CSS sin decisión humana.
- `tests/geist-pixel-extend.test.mjs` congela frente a HEAD `layout.css`, `site-menu.css`, `search-bar.css`
  (Layout.astro ya salió de la lista en la feature 89). Cualquier cambio en esos CSS es ajuste permitido
  con nota (precedente REQ-43-06).
- Menú móvil (features 78/79): el enlace vive dentro de `#site-menu`, así que entra en el panel; se
  verifica a 375 px.

## Bloqueo del implementer 2026-10-14 (REQ-93-08/09 anteriores)

- Fuente: progress/impl_system-design-nav-link.md. Con «Diseño de sistemas» el header desborda en horizontal
  entre 769 y ~875 px (851/759 a 769 px; 853/840 a 850 px; el documento gana scroll horizontal) y la etiqueta
  se parte en 3 líneas (769-875 px) o 2 (900 px, ~950 px); 1 línea a 1000/1280 px. 65 px a 800/1000/1280.
  Móvil 375 px OK (panel 375/375, etiqueta en una línea).

## Decisión humana 2026-10-14 (desbloqueo 2)

- Literal: «metele un articulo para que no salga ninguna coincidencia pues, y si desborda la etiqueta en
  mobile, en mobile dejalo en "diseño" nada mas solo en mobile».
- Concreción del líder: (1) añadir el tag `diseno-de-sistemas` a ≥ 1 artículo que trate de verdad diseño de
  sistemas/arquitectura (revoca «no tocar frontmatter»); (2) «Diseño de sistemas» donde cabe y «Diseño» en
  los anchos estrechos que desbordan (769-~900 px y menú móvil), nombre accesible estable, solo CSS;
  (3) se mantiene el resto; (4) el informe de implementación es progress/impl_system-design-nav-link.md.

### Artículo elegido: 05-diseno-arquitectonico-vs-diseno-detallado

- `src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md` («Diseño Arquitectónico
  vs. Diseño Detallado»): trata el diseño arquitectónico de alto nivel (componentes, entregables, cómo se
  complementa con el detallado), que es lo que se entiende por diseño de sistemas. Ya lleva
  `#software-architecture`.
- Descartados: 00-agilismo (agilismo y fragilidad), 01-diseño_detallado y 02-principios (diseño de bajo
  nivel / de software, no de sistemas), 03-principios_solid (SOLID, nivel de clase), 04-ciclo-de-vida
  (rol de la arquitectura en el SDLC: proceso, no diseño), posts de os/.
- Cambio: `tags: "#arquitectura #software-design #software-architecture #diseno-de-sistemas"` (solo se
  añade el tag al final). El slug va en el campo `slug`, así que URL y slug no cambian. Tests heredados que
  citan el post (home-latest-articles-limit: slug y fecha; single-h1-headings: título) no miran tags: no se
  rompen. Efecto visible: un chip de tag más en la cabecera del post y en las tarjetas que pintan tags.
- Matching: `searchIndex` busca por subcadena en tags sin `#`, así que el término `diseno-de-sistemas` casa con
  el tag. Hoy /diseno-de-sistemas lista 1 artículo; el test exige ≥ 1 (no un número exacto).
- El test heredado REQ-93-11 anterior («posts sin cambios frente a HEAD») se reescribe: el diff de
  src/content/posts solo puede tocar ese archivo y solo su línea tags (REQ-93-15/16).

### Etiqueta y breakpoint

- Marcado: `<a … aria-label="Diseño de sistemas" href="/diseno-de-sistemas">Diseño<span
  class="site-menu__label-rest"> de sistemas</span></a>`; CSS nuevo `src/styles/nav-label.css` importado en
  Layout.astro: `@media (max-width: 959px) { .site-menu__label-rest { display: none; } }`.
- Breakpoint 959/960: la etiqueta completa se parte hasta ~950 px y va en una línea a 1000 px; 960 es el
  primer múltiplo de 10 por encima. El implementer lo confirma; si a 960 se parte, sube al menor múltiplo de
  10 px que quepa en una línea (tope 1000) y lo anota. Cubre 769-959 y el menú hamburguesa (≤ 768), que es
  lo que pidió el líder; el humano dijo «solo en mobile», pero en 769-950 la etiqueta completa desborda o se
  parte, así que se aplica la concreción del líder.
- Sin desborde exigido ahora en 769-1000 px (antes 769-900) y a 375 px. Si con «Diseño» aún desborda,
  el implementer para (REQ-93-14).
- El test previo REQ-93-06 («sin clase propia, sin CSS que mencione diseno-de-sistemas») queda revocado: el
  span lleva clase y hay CSS nuevo, pero no se tocan layout.css ni site-menu.css (congelados).
- Riesgo: algún test heredado puede fijar la lista de imports de Layout.astro o el texto exacto de los
  enlaces; si ocurre, reapunte con nota REQ-93-18 (precedente REQ-43-06).
- Spec reescrita: REQ-93-01..19; feature 93 de `blocked` a `pending`.
