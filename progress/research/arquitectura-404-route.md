# Análisis — Búsqueda por término en la raíz: /loquesea (corrección del humano)

> Sesión: 2026-08-18 · Agente: spec_author · Ciclo: post-búsqueda global (features 1-6 done)

## Petición original y corrección del humano

Petición original: "aca no me sale un 404 http://localhost:4321/arquitectura".

**Corrección del humano (íntegra)**: "no no haber no es una ruta estática como
arquitectura tiene que ser dinámica para filtrar por ese parámetro / es slash
lo que se busque slash :argumento /loquesea".

Interpretación confirmada: NO quiere una página estática `/arquitectura`
(índice fijo de la colección, como propuse en la primera versión). Quiere una
**ruta dinámica de búsqueda por término en la URL**: `/loquesea` (slash +
argumento) debe filtrar el catálogo por ese término, con URL compartible y
deep linking. Probó `http://localhost:4321/arquitectura` esperando que
filtrara por "arquitectura"; el 404 era el síntoma, la ruta dinámica es el
requisito.

## 1. Qué toca (capas, datos, rutas, repositorios)

| Capa | Estado actual | Efecto de esta descomposición |
|------|---------------|------------------------------|
| `src/pages/` | `index.astro` (/), `about.astro`, `search.astro`, `posts/[id].astro` — todas prerendered | **Nuevo** `[...term].astro` (catch-all en la raíz) **on-demand** (feature 7) |
| `src/domain/repositories/posts-repository.ts` | `PostsRepository.getPosts()` con loader inyectable | Sin cambios (se reutiliza; `getCollection` funciona en SSR, ver §3) |
| `src/domain/search/` | `buildSearchIndex`, `searchIndex` (normalización, coincidencia, orden, paginación) | Sin cambios (se reutiliza) |
| `src/components/search-results/` | `search-results.astro` + `search-results-controller.ts` (lee `?q=`) | Feature 7: el controlador deriva también el término del pathname (función pura) |
| `src/pages/search.astro` | Vista `/search?q=` prerendered (feature 3) | Sin cambios (coexiste, REQ-07-11) |
| `src/components/search-bar/search-bar.ts` | Enter navega a `/search?q=` (feature 4, REQ-04-05/06) | Sin cambios (limitación documentada, D6) |
| `src/layouts/Layout.astro` | Navbar Home/About/@moibaldenegro + SearchBar | Feature 8: añade enlace Arquitectura → `/arquitectura` |

## 2. Decisión técnica (verificada) — catch-all on-demand en la raíz

**Forma elegida**: `src/pages/[...term].astro` en la raíz, sin `prerender`
(on-demand SSR; en `output: 'server'` el default es on-demand, se declara
`export const prerender = false` por claridad).

**Verificación 1 — prioridad de rutas (no colisiona)**: la doc oficial de Astro
(Routing — Route Priority Order) ordena: rutas estáticas > dinámicas con
parámetro > rest parameters (catch-all). Concretamente: `pages/[...slug].astro`
captura `/abc`, `/xyz`, `/abc/xyz` pero **no** `/posts/create` ni `/posts/1`
(más específicas). Por tanto `/`, `/about`, `/search` (estáticas) y
`/posts/[id]` (2 segmentos, dinámica específica) ganan al catch-all → las
rutas existentes no se ven afectadas (REQ-07-09). `/search/foo` (2 segmentos)
caería en el catch-all con término "search/foo" → empty state; aceptable y
documentado (términos multi-segmento se normalizan en el cliente).

**Verificación 2 — getCollection en runtime SSR**: la doc de Astro (Content
Collections) muestra el patrón oficial para server mode: `export const
prerender = false` + `getEntry`/`getCollection` por request, y confirma que en
Astro 5 `getCollection` está disponible en rutas SSR. `PostsRepository` (que
envuelve `getCollection('architecture')`) funciona por tanto en runtime: el
content layer se empaqueta en el server bundle del worker, sin `node:fs` en
runtime (se mantiene "node:fs solo en build").

**Verificación 3 — precedente on-demand en el sitio**: `astro.config.mjs` ya
declara `output: 'server'` + adapter Cloudflare con
`prerenderEnvironment: 'workerd'`; HTB stats se sirve on-demand vía
`server:defer` (feature 20). El catch-all on-demand no introduce una
capacidad nueva en el arnés, solo extiende el patrón existente a una ruta.

**Decisión de render**: el documento **no depende del término** — el
frontmatter construye el índice embebido (PostsRepository + getCollection +
buildSearchIndex, idéntico a `search.astro`) y el cliente filtra por el
término extraído de `window.location.pathname` (mecanismo client-side de la
feature 3). El servidor nunca filtra: con 2 artículos el coste por request es
trivial. Deep linking garantizado: al cargar `/<término>`, el controlador
inicializa los resultados prefiltrados.

**Reapertura de D1/D2 de `global-search-landing.md`**: en el ciclo anterior se
eligió `/search?q=` sobre `/search/:arg` precisamente porque la forma
slash+arg exigía on-demand y el humano aceptó ambas. Ahora el humano pide
**explícitamente** la forma slash+argumento y en la raíz: la decisión D1/D2 se
reabre y se resuelve a favor del catch-all on-demand, que cumple la petición
sin tocar la vista `/search?q=` (que se conserva como forma alternativa).

## 3. Decisiones de producto (D1-D6)

- **D1 — Forma de URL**: catch-all en la raíz `/[...term]`, no `/search/[term]`
  (lo que el humano probó es la raíz sin prefijo; `/search/arquitectura` no
  habría arreglado el 404 de `/arquitectura`).
- **D2 — On-demand SSR**: catch-all no prerenderizable (términos arbitrarios);
  on-demand con precedente HTB stats (ver §2).
- **D3 — No se cambia `/posts/[id]`**: el detalle sigue en su ruta; el
  catch-all filtra el catálogo y las tarjetas enlazan a `/posts/[id]`
  (REQ-07-06). Cambiar la ruta de detalle rompería enlaces existentes y no lo
  pide el humano.
- **D4 — Coexistencia con `/search?q=`**: la vista existente se conserva
  (REQ-07-11); el controlador lee `q` si existe, si no, deriva el término del
  pathname. Ambas formas producen los mismos resultados. No hay redirección
  entre formas (no romper URLs compartidas).
- **D5 — Empty state, no 404**: términos sin coincidencias muestran el estado
  vacío con el término (patrón REQ-03-05), nunca un 404 (REQ-07-04). La
  acción "Limpiar" en la ruta dinámica navega a la raíz `/` (no hay parámetro
  que quitar; en `/search?q=` sigue como REQ-03-08).
- **D6 — La barra de búsqueda NO se toca**: el Enter (feature 4) sigue
  navegando a `/search?q=`; cambiarlo tocaría la feature 4 y sus tests
  (REQ-04-05/06) sin necesidad. Limitación documentada: el humano obtiene la
  forma slash+arg tecleando/compartiendo la URL, y la barra sigue siendo la
  vía de entrada con `?q=`. Si el humano quisiera Enter → `/loquesea`, sería
  una feature nueva que toca search-bar.ts.

## 4. Descomposición en features

| id | name | Depende de | Justificación |
|----|------|-----------|---------------|
| 7 | root-term-search | — | Núcleo de la petición: catch-all on-demand `[...term].astro` que sirve el documento con índice embebido y filtra client-side por el término del pathname. Deep linking, empty state, coexistencia con `/search?q=`. |
| 8 | architecture-nav-link | [7] | Enlace "Arquitectura" en el navbar → `/arquitectura` (atajo de búsqueda de la sección temática, la URL exacta que el humano probó), con aria-current según patrón de About. Descubrimiento de la ruta dinámica. |

Orden (one_feature_at_a_time): 7 → 8. Sin ciclos ni auto-referencias.

## 5. Trazabilidad petición ↔ features

| Necesidad del humano | Feature | Cómo la satisface |
|----------------------|---------|-------------------|
| `/loquesea` (slash+argumento) debe filtrar el catálogo | 7 (REQ-07-01..03) | Catch-all en la raíz on-demand; al cargar `/<término>` presenta resultados prefiltrados (deep linking) |
| `/arquitectura` no debe dar 404 | 7 (REQ-07-01, 07-02) | La ruta existe y sirve el documento de resultados para cualquier término |
| Términos sin coincidencias: contenido, no error | 7 (REQ-07-04) | Empty state con el término consultado |
| URL compartible (slash+arg) | 7 (REQ-07-03) | La URL es la forma canónica de la búsqueda por término |
| Coherencia con lo existente (`/search?q=`, `/posts/[id]`) | 7 (REQ-07-06, 07-09, 07-11) | Coexistencia sin romper enlaces; tarjetas → `/posts/[id]` |
| Descubrimiento de la ruta desde el sitio | 8 (REQ-08-01..05) | Enlace en el navbar con estado activo |

## 6. Impacto en enlaces existentes

- **Ninguno se rompe**: `/`, `/about`, `/search?q=`, `/posts/[id]` y las
  tarjetas existentes permanecen intactos (REQ-07-09, REQ-07-11).
- **Nuevas URLs**: cualquier `/<término>` de un segmento (p. ej.
  `/arquitectura`) pasa de 404 a 200 con el documento de resultados.
- **Rutas de 2+ segmentos no estáticas** (`/foo/bar`, `/search/foo`): caen en
  el catch-all con término multi-segmento → empty state (no rompen nada).
- **Feature 4 (barra)**: sin cambios (D6).

## 7. Riesgos y notas para el implementador

- **getCollection en runtime**: soportado en SSR (verificado), pero es la
  primera ruta del sitio que lo usa por request; el índice embebido se
  construye por request (coste trivial con 2 artículos). Si el catálogo
  creciera mucho, se evaluaría cache del índice (fuera de alcance).
- **Extracción del término**: el controlador debe derivar el término de
  `window.location.pathname` (decodificado) cuando no hay `?q=`, y normalizar
  slashes a espacios para términos multi-segmento (función pura testeable).
- **≤100 líneas por archivo**: la página replica el frontmatter corto de
  `search.astro`; los cambios del controlador se limitan a funciones puras.
- **Pruebas**: node:test sin navegador → tests unitarios de las funciones
  puras (extracción de término del pathname, limpiar → raíz) y tests de
  inspección sobre `.astro`/`.ts` (patrón del ciclo 1-6).
- **No hay dependencias externas**; el JS de cliente es módulos propios
  (patrón features 3/4/5).

## 8. Archivos de esta sesión

- `specs/07_root-term-search/requirements.md` + `design.md` (reemplaza la spec
  obsoleta `specs/07_architecture-index-page/`, eliminada)
- `specs/08_architecture-nav-link/requirements.md` + `design.md` (reescritas:
  el enlace ahora es atajo de la búsqueda por término)
- `feature_list.json`: features 7 y 8 reescritas (se conservan 1-6 done)