# Investigación: la portada muestra solo los 3 artículos más recientes

- Fecha: 2026-09-30
- Rol: `spec_author` (no implementa: solo análisis, spec y alta en el backlog)
- Petición literal: «En la pagina principal queremos que se muestren solo los 3 articulos mas recientes»
- Feature de alta: **30 `home-latest-articles-limit`** → `specs/30_home-latest-articles-limit/requirements.md`
- `design.md`: **NO** (la feature no toca UI; ver §6)

---

## 1. Reafirmación del problema y alcance

Hoy la sección «Últimos artículos» de la portada (`/`) pinta **una card por cada
artículo de la colección**: con los 8 artículos reales de `src/content/posts/`
(`architecture/` 6 + `os/` 2) el HTML emitido en `dist/client/index.html`
contiene 8 ocurrencias de `latest-articles__card` (verificado con
`grep -o "latest-articles__card" dist/client/index.html | wc -l` → `8`, y 8
hrefs `/posts/<slug>` distintos). La petición es recortar esa lista a los 3
artículos más recientes.

Alcance: **solo la lista de la portada**. No se toca el índice de búsqueda
(`buildSearchIndex` en `src/domain/search/index.ts` sigue con la colección
completa), ni `/posts/[id]`, ni `[...term].astro`, ni la sección de recomendados
(`next`/`related`). Es **una sola feature** (complejidad simple/media: un módulo
nuevo de dominio + una línea del frontmatter + tests); no procede dividirla
porque no hay dos capas independientes: el recorte no altera esquema, entidad,
repositorio, CSS ni marcado.

## 2. Archivos inspeccionados (con líneas)

| Archivo | Hallazgo |
|---|---|
| `src/pages/index.astro:1-36` | La home es `prerender = true` (l. 11). Delega la lista en `<LatestArticles/>` (l. 29) y, aparte, construye el índice de búsqueda con `new PostsRepository().getPosts()` (l. 16) + `getCollection('posts')` (l. 17) para `buildSearchIndex` (l. 20). **El índice de búsqueda no se toca**: es catálogo de búsqueda, no la lista visible. |
| `src/components/latest-articles.astro:1-34` | 34 líneas. Frontmatter: solo `import "../styles/latest-articles.css"` (l. 2), `import { PostsRepository }` (l. 4) y `const posts = await new PostsRepository().getPosts();` (l. 6). El marcado (l. 9-34) itera `posts.map(...)` → **pinta la colección completa, sin ningún recorte**. Encabezado `<h2 class="latest-articles__heading">Últimos artículos</h2>` en l. 10. |
| `src/domain/repositories/posts-repository.ts:1-100` | `PostsRepository` expone **una sola** API: `getPosts(): Promise<Post[]>` (l. 22-30). Ya devuelve la lista **ordenada por `created` descendente** mediante `byCreatedDesc` (l. 29, l. 36-44) usando `parseSpanishDate` (l. 7). **No existe ningún método «últimos N»**. El archivo está en **100/100 líneas**. |
| `src/domain/entities/post.ts:16-29` | Campos reales de `Post`: `id`, `slug`, `title`, `author`, `img`, `readtime`, `description`, `tags`, **`created`**, `updated`, `next`, `related`. **El campo de fecha de publicación es `created`** (texto español, p. ej. `"28 Septiembre 2026"`). `updated` existe pero es la fecha de edición, no de publicación. |
| `src/content.config.ts` | El esquema de la colección declara `created: z.string()` y `updated: z.string()` como obligatorios: ningún artículo real puede carecer de `created` (si el campo faltara, el build falla en el esquema, no en la vista). |
| `src/domain/search/parse-date.ts:26-36` | `parseSpanishDate` devuelve `''` ante fecha ausente o inválida; con orden descendente esa fecha queda **al final** (comentario l. 5). Es decir: un `created` inválido nunca desplaza a un artículo válido por encima, y **no hay días de crédito** sobre `Math.max(0, limit)`. |
| `src/styles/latest-articles.css:19-22` | `.latest-articles__list { display: grid; gap: var(--gap-card); }` — **no declara `grid-template-columns`**: la rejilla es de una sola columna. Hoja de 97/100 líneas. |
| `dist/client/index.html` | Build real actual: 8 cards, 8 `/posts/<slug>` (00-agilismo, 00-prueba-os, 01-diseño-detallado, 01-procesos-memoria, 02-ciclo-de-vida-y-arquitectura, 02-principios-del-diseno-de-software, 03-principios solid, 05-diseno-arquitectonico-vs-diseno-detallado). |

## 3. Datos reales: fechas `created` de los 8 artículos

Verificado en el frontmatter de `src/content/posts/*/*.md` (líneas 9-10 de cada
archivo), no en fixtures:

| `slug` | `created` | `parseSpanishDate` |
|---|---|---|
| `05-diseno-arquitectonico-vs-diseno-detallado` | 28 Septiembre 2026 | `2026-09-28` |
| `02-ciclo-de-vida-y-arquitectura` | 24 Septiembre 2026 | `2026-09-24` |
| `01-procesos-memoria` | 19 Septiembre 2026 | `2026-09-19` |
| `00-prueba-os` | 18 Septiembre 2026 | `2026-09-18` |
| `03-principios solid` | 21 Agosto 2026 | `2026-08-21` |
| `02-principios-del-diseno-de-software` | 20 Agosto 2026 | `2026-08-20` |
| `01-diseño-detallado` | 19 Agosto 2026 | `2026-08-19` |
| `00-agilismo` | 10 Agosto 2026 | `2026-08-10` |

- **Los 8 tienen `created` y las 8 fechas parsean** (meses del catálogo de
  `parse-date.ts:9-22`, «Septiembre» incluido). Ningún artículo real carece de fecha.
- **Los 3 más recientes son, en orden descendente**: `05-diseno-arquitectonico-vs-diseno-detallado`,
  `02-ciclo-de-vida-y-arquitectura`, `01-procesos-memoria`. Es el resultado que
  debe fijar el test con datos reales.

## 4. Decisión: dónde va el recorte (y por qué no en el repositorio ni en la vista)

**Opción A — método `getLatestPosts(n)` en `PostsRepository`.** Descartada:
`src/domain/repositories/posts-repository.ts` ya está en **100/100 líneas**
(regla dura de `docs/architecture.md` §12 y REQ-07-05, aserción existente en
`tests/posts-repository.test.mjs`). Añadir un método lo rompería → la feature
tendría que ir `blocked` para discutir el límite. Además, «últimos N de una
portada» no es una responsabilidad de la fuente de datos: el repositorio entrega
la colección (una fuente), no la política editorial de una vista.

**Opción B — `.slice(0, 3)` en el frontmatter del `.astro`.** Descartada por dos
reglas duras, no por gusto:
1. «Lógica separada de la UI»: el frontmatter de un `.astro` solo hace imports y
   paso de datos (`AGENTS.md` §7, `docs/conventions.md` §Orden dentro de un
   archivo `.astro`).
2. **Razón técnica concluyente**: `tests/latest-articles-restore.test.mjs:154-158`
   (REQ-20-07) y `tests/articles-ui-refactor.test.mjs:189-193` fallan si el
   componente contiene `function`, `if (` o `for (`. El recorte pertenece a un
   módulo `.ts` de `src/domain/`, no al componente.

**Opción C — módulo de dominio puro `src/domain/latest-posts.ts` (ELEGIDA).**
Una función `latestPosts(posts, limit = 3)` que:
- **no reordena**: confía en el orden canónico que ya garantiza
  `PostsRepository.getPosts()` (`byCreatedDesc`, `posts-repository.ts:29,36-44`),
  reutilizando el precedente de la feature 22 en vez de inventar un comparador
  nuevo (doble orden = dos verdades que pueden divergir);
- **no muta** la entrada (`slice` devuelve copia);
- recorta con `slice(0, Math.max(0, limit))` (una línea, sin ramas).
- Precedente de ubicación y nombre: `src/domain/related-titles.ts` (utilidad
  camelCase en la raíz de `src/domain/`) y `src/domain/search/parse-date.ts`.
  Convenciones: `.ts` camelCase para utilidades.

Consumidor: `src/components/latest-articles.astro` pasa de
`const posts = await new PostsRepository().getPosts();` a
`const posts = latestPosts(await new PostsRepository().getPosts());`
(+1 línea de import; el componente pasa de 34 a 35 líneas, muy por debajo de 100).

**Impacto en las demás vistas**: `index.astro` sigue llamando `getPosts()` para el
índice de búsqueda (l. 16): la búsqueda conserva la colección completa. Ninguna otra
vista usa `getPosts()` para la portada.

## 5. Tests existentes: **ninguno se rompe** (verificado archivo por archivo)

Los tests que tocan `latest-articles.astro` / `latest-articles.css` son
**inspección estática de contrato y marcado**; ninguno comprueba el número de
artículos ni la lista completa:

| Test | Qué aserta | ¿Se ve afectado? |
|---|---|---|
| `tests/latest-articles-restore.test.mjs` (REQ-20-01..07) | importa `PostsRepository` y llama `getPosts()` (l. 54-71), no importa `astro:content` (73-85), marcado `article/h2/p/span` + 5 campos (87-101), «min de lectura» (103-109), `img` con clase/`post.img`/`alt`/`loading` (111-132), enlace `/posts/${post.id}` (134-145), ≤100 líneas y sin `function`/`if (`/`for (`/`<style>`/`style=`/`readFileSync` (147-174), CSS con tokens y ≤100 líneas (176-225) | **No.** El import y `getPosts()` se conservan; el marcado no cambia; sin `if (`/`for (` en el componente. |
| `tests/articles-ui-refactor.test.mjs` (REQ-10-01..04) | mismos contratos + tokens del CSS | **No.** |
| `tests/article-card-images.test.mjs` (REQ-17-01..08) | `img` de la card, regla `.latest-articles__image`, `latest-articles.css` ≤100 líneas (97) y conteo de `tokens.css` = 93 | **No.** No se toca CSS ni tokens. |
| `tests/view-transitions.test.mjs` (REQ-24-03) | `<img>` y `h2.latest-articles__title` en el componente | **No.** |
| `tests/visual-polish-refactor.test.mjs` (REQ-37-06, l. 155-178) | `<h2 class="latest-articles__heading">Últimos artículos</h2>` presente y **posicionado antes** del `map` de artículos, y la regla `.latest-articles__heading` con tokens | **No.** El encabezado y su orden en el archivo se conservan intactos. |

**Conclusión**: el recorte **no obliga a relajar ni ajustar ninguna aserción
existente**. Aun así la spec incluye el REQ que obliga a documentar el
precedente REQ-43-06 si algún test necesitara un ajuste futuro, para que nadie
relaje una aserción en silencio (mismo espíritu que
`specs/15_navbar-logo-home/requirements.md` REQ-15-07).

Tests **nuevos** (test-first, se escriben antes del módulo y se observan en rojo):
`tests/home-latest-articles-limit.test.mjs`, con (a) casos unitarios de
`latestPosts` sobre entidades `Post` de prueba: 8 entradas → exactamente 3 en orden
descendente; 2 entradas → 2; 0 entradas → `[]`; `limit` 0 o negativo → `[]`; la
entrada no se muta; (b) el orden lo fija el repositorio de verdad, inyectando las
8 entradas reales por el constructor `new PostsRepository(async () => entries)`
(precedente `tests/next-related-hrefs-reales.test.mjs:186-190`) y comprobando los
3 `slug` reales de §3; (c) inspección del componente (importa el módulo de dominio,
no contiene `slice`/`if (`/`for (`, conserva `getPosts()`, encabezado y markup);
(d) verificación end-to-end sobre el **build real**: precedentada en
`tests/about-page.test.mjs:212-236`, que ejecuta `astro build` con `spawnSync` y
lee `dist/client/index.html`; ahí se comprueba que hay **exactamente 3**
`latest-articles__card` y que sus `href` son los 3 `slug` esperados. Se elige
ejecutar el build dentro del test (y no leer un `dist` possibly obsoleto, ya que
`init.sh` corre los tests **antes** del build).

## 6. Decisión: sin `design.md` (la feature no toca UI)

- `.latest-articles__list` **no declara número de columnas** (rejilla de una
  columna): pasar de 8 a 3 cards no cambia ni una regla, ni un token, ni el
  `gap`. La hoja se queda en 97/100 líneas **sin tocar**.
- El marcado de la card, el encabezado «Últimos artículos» (REQ-37-06), las
  clases BEM, el enlace `/posts/${post.id}` (REQ-36-04) y los `transition:name`
  (REQ-24-03) **no cambian**: sigue una card por artículo, ahora 3.
- No hay decisión de presentación que documentar (ni rejilla, ni columnas, ni
  jerarquía, ni responsive). Por eso **no se crea `design.md`**; el requisito
  REQ-30-08 fija por test que la hoja queda intacta y REQ-30-07 que el marcado y
  el encabezado se conservan. Si al implementar apareciera una necesidad real de
  presentación, se discussiona antes (estado `blocked`), no se improvisa.

## 7. Ambigüedades resueltas (con razonamiento)

1. **Campo de orden**: `created` (fecha de publicación, obligatoria en el
   esquema), no `updated`. Se **reutiliza** el comparador canónico
   `byCreatedDesc` del repositorio; el módulo de dominio no reordena.
2. **Menos de 3 artículos**: se muestran **todos los disponibles** (0, 1 o 2),
   sin excepción ni crasheo; con 0 la lista queda vacía y la sección conserva su
   encabezado. Se evita un error de contrato que hoy no existe y que sería
   invención: hoy la portada tolera de 0 a N artículos.
3. **Límite no positivo** (`0`, negativo, no entero): arreglo vacío, sin
   excepción. Es la totalización de `Math.max(0, limit)` y fija un contrato
   determinista y testeable en vez de dejar comportamiento implícito.
4. **Orden de los 3**: descendente de `created`, reutilizando el orden del
   repositorio (sin doble orden).
5. **Encabezado REQ-37-06**: intacto; hay REQ y test que lo fijan.
6. **Dependencias en el backlog**: `depends_on: []`. La feature se apoya en el **estado ya cerrado** del
   código (repositorio, entidad, componente, tokens), no de features *pendientes*
   del backlog, así que no declara dependencias (regla de selección del arnés:
   una dependencia se declara cuando condiciona la ejecución; aquí todas las
   features involucradas están `done`).

## 8. Nota sobre el id 30 y el espacio de REQ (hallazgo para el líder)

- `feature_list.json` contiene hoy las features **1..28**; el id 30 está libre en
  el backlog (y el 29 también, pero está reservado semánticamente por la feature
  histórica `dependencies-registry`, cuyos `REQ-29-01..06` se citan en
  `scripts/validate-dependencies.mjs:2` y `tests/dependencies-registry.test.mjs:1`).
- **Hallazgo adicional**: el id 30 también está ocupado *históricamente* por
  `cloudflare-types-install`, cuyos `REQ-30-01..06` se citan en
  `tests/cloudflare-types-install.test.mjs:1,4-15` (comentarios; ese test es
  válido hoy y sigue verde). El backlog actual **ya tiene este solapamiento**
  (precedente verificado): el id 20 del backlog es `related-posts-data`
  (`specs/20_related-posts-data/requirements.md`, `REQ-20-01..07`) mientras el
  test vivo `tests/latest-articles-restore.test.mjs` cita `REQ-20-01..07` de la
  feature histórica `latest-articles-restore` (misma spec borrada, test vivo
   intacto). Es decir, el repo ya tolera ids de REQ repetidos entre ciclos.
- Decisión: se usa **id 30 y `REQ-30-01..15`** según la instrucción del líder, y
  se deja constancia aquí y en el encabezado de la spec. Si el líder prefiere
  evitar la ambigüedad de citación con `cloudflare-types-install.test.mjs`, el
  identificador alternativo libre sería el 45 (siguiente tras el 44 histórico
  de `specs/`); cambiarlo es una decisión suya, no del implementer.

## 9. Riesgos

| Riesgo | Mitigación en la spec |
|---|---|
| Que un test vivo se rompa al cambiar el frontmatter | REQ-30-09 exige que los tests de inspección existentes sigan verdes sin tocar aserciones; verificado archivo por archivo en §5 |
| Que el implementer ponga el `.slice(0, 3)` en el `.astro` (viola REQ-20-07 y la regla de frontmatter) | REQ-30-06 + test de inspección que prohíbe `slice`/`if (`/`for (` en el componente |
| Que se invente un segundo comparador de fechas y diverja del repositorio | REQ-30-03 (no reordena) + test de no mutación y de orden heredado |
| Que se corte también el índice de búsqueda por tocar `getPosts()` | REQ-30-06 acota el cambio al componente; `index.astro:16` sigue con la colección completa (nota en la `description` de la feature) |
| Que se crezca `posts-repository.ts` por encima de 100 líneas | REQ-30-14 prohíbe tocar el repositorio; el recorte va en un módulo nuevo |
| Colisión de citación `REQ-30-xx` con el test histórico `cloudflare-types-install` | Documentada en §8 para decisión del líder; no afecta a la validación (`scripts/validate-specs.mjs` solo valida las features del backlog) |

## 10. Artefactos de esta sesión

- `specs/30_home-latest-articles-limit/requirements.md` (15 REQ EARS).
- `progress/research/home-3-articulos-recientes.md` (este informe).
- `feature_list.json`: alta de la feature **30 `home-latest-articles-limit`**
  (`status: "pending"`, `depends_on: []`).
- Sin `design.md` (§6).
