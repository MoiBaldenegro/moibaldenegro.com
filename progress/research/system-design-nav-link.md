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

## Desbloqueo 3 — decisión humana 2026-10-16

- Literal: «Has todo lo que tengas pendiente de una ves, y si vas atocar el menu hamburguesa mete diseño de
  sitemas igual si cabe ese croe no es le problema, ya ves que ahorita estabamos rerecortando s solo "diseño"
  ponlo completo tambien».
- Concreción del orquestador: opción (a) de la ronda 2 (subir el corte del menú hamburguesa, ~850 px o el
  mínimo necesario medido); etiqueta SIEMPRE completa «Diseño de sistemas» (barra y panel); se retira el
  recorte (nav-label.css y span); ajuste de CSS congelado con nota «Ajuste feature 93 (precedente REQ-43-06)».

### Medición del umbral (spec_author, Chrome headless + CDP sobre el dev server de localhost:4321)

Método: sin tocar src/. Script `cdp93sa.mjs` (y `cdp93sa-fine.mjs`) en el scratchpad de la sesión
(C:/Users/Moises/AppData/Local/Temp/claude/C--Users-Moises-Desktop-moibaldenegro-com/5a16f5af-f87c-46b3-b4a6-91a79cca298f/scratchpad).
Por CSSOM desactiva nav-label.css, reescribe las media queries 768/769 de layout.css, site-menu.css y
search-bar.css al umbral candidato, deja el enlace con texto plano «Diseño de sistemas» sin aria-label y,
en la pasada final, añade `white-space: nowrap` a `.site-navbar nav a`. DPR 1, fuentes cargadas, `/` y
`/posts/00-agilismo/` (mismos valores).

Barrido en modo barra (etiqueta completa, sin nowrap):

| Ancho | Header scrollW / clientW | Enlace w x h |
|------:|------:|------|
| 769 | 851 / 759 (+92) | 62 x 57 (3 líneas) |
| 800 | 851 / 790 (+61) | 62 x 57 |
| 850 | 853 / 840 (+13) | 62 x 57 |
| 862 | 853 / 852 (+1) | 62 x 57 |
| 865 | 855 / 855 | 62 x 57 |
| 895 | 885 / 885 | 72 x 38 (2 líneas) |
| 966 | 956 / 956 | 139 x 38 (2 líneas) |
| 967 | 957 / 957 | 139 x 19 (1 línea) |
| 970 | 960 / 960 | 139 x 19 |

Con nowrap (siempre 1 línea, 139 x 19): desborda hasta 942 px (940: 932/930) y deja de desbordar desde 943,
pero hasta 965 el contenido del nav (908 px) supera la caja del nav (95 %): el buscador llega al borde del
header (sbRight 932 = clientWidth).

Conclusión: ~850 px no basta (a 850 desborda +13 px y la etiqueta va en 3 líneas). El contenido natural del
nav con la etiqueta completa mide 908 px y el nav mide 0,95 × (W − 10): cabe sin comprimir desde W ≈ 966-967.
**Umbral elegido: menú hamburguesa a <= 969 px, barra desde 970 px** (primer múltiplo de 10 >= 967, 3-4 px
de holgura, coincide con el 970 confirmado en la ronda 2). Se añade `white-space: nowrap` a `.site-navbar a`
como red de seguridad entre motores (si la fuente mide unos px más, desborda unos px en el margen en vez de
partir la etiqueta).

Pasada final (umbral 969, nowrap, texto plano) — capturas en progress/research/nav93/:

| Ancho | Modo | Header alto | Header scrollW / clientW | Documento | Panel abierto (scrollW / clientW) | Enlace en panel |
|------:|------|------:|------:|------:|------:|------|
| 375 | hamburguesa | 65 | 375 / 375 | 375 / 375 | 375 / 375 | «Diseño de sistemas», 356 x 44, 1 línea |
| 768 | hamburguesa | 65 | 758 / 758 | 758 / 758 | 758 / 758 | 720 x 44 |
| 800 | hamburguesa | 65 | 790 / 790 | 790 / 790 | 790 / 790 | 751 x 44 |
| 850 | hamburguesa | 65 | 840 / 840 | 840 / 840 | 840 / 840 | 798 x 44 |
| 900 | hamburguesa | 65 | 890 / 890 | 890 / 890 | 890 / 890 | 846 x 44 |
| 969 | hamburguesa | 65 | 959 / 959 | 959 / 959 | 959 / 959 | 911 x 44 |
| 970 | barra | 65 | 960 / 960 | 960 / 960 | — | 139 x 19, 1 línea |
| 1024 | barra | 65 | 1014 / 1014 | 1014 / 1014 | — | 139 x 19 |
| 1280 | barra | 65 | 1270 / 1270 | 1270 / 1270 | — | 139 x 19 |

Orden del panel: About, Arquitectura, Diseño de sistemas, @moibaldenegro. aria-current="page" en
/diseno-de-sistemas y /diseno-de-sistemas/; ausente en / y /arquitectura (1280 px).

### Hallazgos

- H1. Con el span `site-menu__label-rest`, en el panel abierto (`.site-menu a { display: flex }`) el texto y
  el span son dos flex items y el espacio inicial se colapsa: «Diseñode sistemas» (primera pasada de la
  simulación). Retirar el span es obligatorio, no solo estético.
- H2. aria-label se retira: con el texto completo siempre visible el nombre accesible coincide con el texto
  y el atributo es redundante (primera regla de ARIA).
- H3. Además de layout.css y site-menu.css, el corte vive en search-bar.css (nav envuelto sin JS, <= 768) y
  en site-menu.ts (`matchMedia('(max-width: 768px)')`, cierre al pasar a escritorio): los cuatro se mueven a
  969/970 para que el modo sea coherente. Sin JS, de 0 a 969 px se ve el header envuelto (features 51/61).
- H4. layout.css está congelado en 99 líneas (tests/sticky-footer.test.mjs, tests/mobile-hamburger-menu.test.mjs):
  el nowrap entra en una línea existente de `.site-navbar a`.
- H5. Tests a reapuntar: mobile-hamburger-menu (768 → 969), header-height-64 (768/769), header-anchor-offset-mobile
  (bloque 768 de layout.css), geist-pixel-extend (site-menu.css y search-bar.css salen de UNCHANGED),
  system-design-nav-link (reescritura).
- H6. docs/conventions.md («breakpoint móvil en 768px») y el comentario de tokens.css (`--header-height-mobile`,
  «<=768px») quedan desalineados para el header: excepción documentable por el líder; la spec no los toca
  (tokens.css congelado en 99 líneas).

### Spec reescrita

- specs/93_system-design-nav-link/requirements.md: REQ-93-01..26 (sustituyen a los anteriores 01..19;
  revocados el span, el aria-label, nav-label.css y el corte 959/969 de etiqueta).
- specs/93_system-design-nav-link/design.md reescrito. Feature 93 de `blocked` a `pending`.

## Ampliación 2026-10-16: apertura suave del menú hamburguesa

- Literal humano (2026-10-16): «pon una apertura suave tmb por que se abre y se cierra de golpe horrible ese menu hamburguesa».
- Estado actual: src/styles/site-menu.css oculta el panel con `display: none` y lo muestra con `display: flex`
  bajo `header.site-navbar[data-menu='open']`; display no es animable, de ahí el golpe. site-menu.ts solo
  alterna data-menu, aria-expanded y aria-label, y enfoca el primer enlace al abrir.
- Solución CSS pura: panel siempre en flex absoluto en modo hamburguesa; cerrado con visibility hidden +
  opacity 0 + translateY negativo; transición de opacity, transform y visibility con var(--transition-default)
  (.28s cubic-bezier(.2,.8,.2,1), único token de transición existente). La interpolación discreta de
  visibility mantiene el panel visible durante el cierre sin delay literal.
- H7. La red global de reduced-motion de layout.css (feature 56) fija transition-duration a 0.01ms pero no
  anula delays: se exige `transition: none` explícito en site-menu.css (REQ-93-36).
- H8. visibility: hidden saca el panel del tab y del árbol de accesibilidad: no hace falta inert ni tocar
  site-menu.ts. Riesgo: tests heredados que congelen `display: none` del panel (mobile-hamburger-menu) se
  reapuntan con REQ-93-25.
- H5 (nota del líder, = H6 de arriba): docs/conventions.md «breakpoint móvil en 768px» vs. header 969/970:
  pasa a tarea de documentación del implementer (REQ-93-40, design.md).
- Spec: REQ-93-27..40 añadidos a specs/93_system-design-nav-link/requirements.md; design.md con sección
  «Apertura suave» y «Documentación»; 4 acceptance nuevos en feature_list.json (feature 93 sigue pending).
