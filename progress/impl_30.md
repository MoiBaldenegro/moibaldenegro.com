# Informe de implementación — feature 30 `home-latest-articles-limit`

- Fecha: 2026-09-30
- Rol: `implementer`
- Petición: «En la pagina principal queremos que se muestren solo los 3 articulos mas recientes»
- Spec: `specs/30_home-latest-articles-limit/requirements.md` (REQ-30-01..17, sin `design.md`)
- Análisis previo: `progress/research/home-3-articulos-recientes.md`
- Verificación: `./init.sh` en verde (suite 562/562) + build de producción OK

---

## 1. Qué hace hoy la portada y qué cambia (antes/después)

**Antes.** `src/components/latest-articles.astro` (34 líneas) hacía
`const posts = await new PostsRepository().getPosts();` y el markup iteraba
`posts.map(...)` sobre la colección completa: **8 cards** para los 8 artículos
reales de `src/content/posts/` (`architecture/` 6 + `os/` 2), con 8 hrefs
`/posts/<slug>` en `dist/client/index.html`.

**Después.** El frontmatter pide la lista al módulo de dominio
`latestPosts(await new PostsRepository().getPosts())`. El build emite **exactamente
3 cards**, con estos enlaces y en este orden:

```
cards: 3
hrefs: /posts/05-diseno-arquitectonico-vs-diseno-detallado
       /posts/02-ciclo-de-vida-y-arquitectura
       /posts/01-procesos-memoria
```

(comprobado sobre el HTML emitido por `astro build`, no sobre fixtures).

**Alcance acotado**: el índice de búsqueda de la portada **no** se recorta:
`src/pages/index.astro:16` sigue llamando `getPosts()` para `buildSearchIndex`,
así que la búsqueda conserva la colección completa. Ningún otro archivo de
`src/pages/` ni de `src/components/` cambia.

---

## 2. Ciclo rojo (tests primero)

Orden real de la sesión: `feature_list.json` sin tocar, `progress/current.md`
actualizado, **test escrito primero**, ejecutado en rojo, y solo después el
código.

Comando: `node --test tests/home-latest-articles-limit.test.mjs` (con
`src/domain/latest-posts.ts` inexistente):

```
TAP version 13
# node:internal/modules/esm/resolve:275
#     throw new ERR_MODULE_NOT_FOUND(
#           ^
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module
#   'C:\Users\Moises\Desktop\moibaldenegro.com\src\domain\latest-posts.ts'
#   imported from ...\tests\home-latest-articles-limit.test.mjs
#     at finalizeResolution (node:internal/modules/esm/resolve:275:11)
#     ... {
#   code: 'ERR_MODULE_NOT_FOUND',
#   url: 'file:///C:/Users/Moises/Desktop/moibaldenegro.com/src/domain/latest-posts.ts'
# }
# Node.js v22.22.2
# Subtest: tests\home-latest-articles-limit.test.mjs
not ok 1 - tests\home-latest-articles-limit.test.mjs
  ---
  duration_ms: 81.7964
  type: 'test'
  location: '...\tests\home-latest-articles-limit.test.mjs:1:1'
  failureType: 'testCodeFailure'
  exitCode: 1
  signal: ~
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 1
# pass 0
# fail 1
```

**Interpretación**: rojo por la razón correcta (REQ-30-11): el módulo de dominio
que la spec exige no existe todavía, así que el archivo entero no llega a
cargar. Es el rojo que el ciclo test-first admite como evidencia del módulo
ausente; conviene ser preciso y no adornarlo: **no** se ejecutó una segunda
pasada en rojo "con el módulo ya creado pero sin tocar el componente", de modo
que el fallo observado es de import, no de una aserción concreta. La primera
ejecución en verde se produjo después de crear `src/domain/latest-posts.ts` **y**
cambiar la línea del frontmatter; mientras la lista no estuviera recortada, el
test de REQ-30-13 (exactamente 3 cards en el build real) y el de REQ-30-06
(importar el módulo y no traer la lógica al `.astro`) no podían pasar.

---

## 3. Código implementado

### 3.1 `src/domain/latest-posts.ts` (nuevo, 21 líneas)

```ts
import type { Post } from './entities/post.ts';

export const LATEST_POSTS_LIMIT = 3;

export function latestPosts(posts: readonly Post[], limit: number = LATEST_POSTS_LIMIT): Post[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];
  return posts.slice(0, limit);
}
```

**Criterio de dominio elegido** (los cuatro puntos de la spec §4 del análisis,
respetados sin rediseño):

1. **Módulo puro nuevo en `src/domain/`**, no un método del repositorio: la
   función se llama sobre *la lista que pinta una vista*, no sobre la fuente de
   datos. Ubicación y nombre siguen el precedente `src/domain/related-titles.ts`.
2. **No reordena** (REQ-30-03): confía en el orden canónico que ya garantiza
   `PostsRepository.getPosts()` (`byCreatedDesc` sobre `created`,
   `posts-repository.ts:29,36-44`). Una sola verdad de orden: no se inventa un
   segundo comparador que pueda divergir.
3. **No muta** la entrada: `slice` devuelve copia; la entidad `Post` ya es
   `readonly` de punta a punta.
4. **Límite no entero positivo → `[]`** (REQ-30-05), sin lanzar: es la
   totalización determinista del contrato en lugar de un comportamiento
   implícito. Con menos de tres artículos devuelve todas las disponibles
   (REQ-30-04) porque `slice` no rellena.

Se exporta también `LATEST_POSTS_LIMIT = 3` para que el «3» sea un dato
nombrado del dominio y no un número mágico repetido.

### 3.2 `src/components/latest-articles.astro` (34 → 36 líneas)

Único cambio del componente (más 1 import y un comentario que lo justifica):

```diff
 import { PostsRepository } from "../domain/repositories/posts-repository.ts";
+import { latestPosts } from "../domain/latest-posts.ts";
 
-const posts = await new PostsRepository().getPosts();
+// La lista visible se recorta a los 3 más recientes en el módulo de dominio
+// (REQ-30-01..06): aquí solo imports y paso de datos.
+const posts = latestPosts(await new PostsRepository().getPosts());
```

El markup **no** cambia: encabezado `<h2 class="latest-articles__heading">Últimos
artículos</h2>` antes del primer `<article>` (REQ-37-06), una card por artículo,
`href={`/posts/${post.id}`}` (REQ-36-04), `transition:name`, `loading="lazy"`. No
se introduce `<script>`, `client:`, `set:html` ni `is:inline` (REQ-30-15): la
sección se resuelve en build.

### 3.3 `tests/home-latest-articles-limit.test.mjs` (nuevo, 317 líneas, 13 tests)

| Test | REQ | Qué fija |
|---|---|---|
| corte exacto | 30-01 | 8 entradas → 3; y 3/4/5/8/20 entradas → siempre 3 |
| tres más recientes | 30-02 | 8 entradas reales por el constructor de `PostsRepository` → los 3 `slug` esperados y sus `created` descendentes |
| sin reordenar ni mutar | 30-03 | entrada en orden ascendente → salida en el orden recibido; `deepEqual` contra snapshot; la copia no es la misma referencia |
| menos de tres | 30-04 | 2, 1 y 0 entradas → todas las disponibles, `doesNotThrow` |
| límite no positivo | 30-05 | `0`, `-1`, `-3`, `2.5`, `NaN`, `Infinity` → `[]`, `doesNotThrow` |
| frontmatter sin lógica | 30-06 | importa `latest-posts`, usa `latestPosts(await new PostsRepository().getPosts())`, sin `slice`/`if (`/`for (` |
| marcado conservado | 30-07 | encabezado «Últimos artículos» antes de las cards, `<article class="latest-articles__card">`, `href={`/posts/${post.id}`}`, `{posts.map(` |
| CSS intacto | 30-08 | 97 líneas exactas, `.latest-articles__list` sin `grid-template-columns`, `display: grid` + `gap: var(--gap-card)`, tokens y sin hex/rgb sueltos |
| tests existentes sin ajuste | 30-09/10 | ninguno de los 5 tests de inspección de `latest-articles.astro` cita `REQ-30-xx` (es decir: no hubo que relajar ninguna aserción) |
| build real | 30-13 | `spawnSync(astro build)` y luego `dist/client/index.html`: exactamente 3 `latest-articles__card` y los 3 `/posts/<slug>` esperados |
| repositorio intacto | 30-14 | `posts-repository.ts` conserva 100 líneas y no menciona `latest-posts`/`latestPosts`; el módulo nuevo exporta `latestPosts(` |
| sin JS de runtime | 30-15 | sin `<script`, `client:`, `set:html`, `is:inline` |
| 100 líneas | 30-16 | módulo nuevo, componente y CSS ≤ 100 líneas |

---

## 4. Archivos que quedan intactos (verificado con `git diff`)

```
$ git status --short
 M src/components/latest-articles.astro     ← único archivo de src/ de la feature
?? src/domain/latest-posts.ts                ← nuevo
?? tests/home-latest-articles-limit.test.mjs ← nuevo
```

- `src/styles/latest-articles.css`: **sin tocar**, 97 líneas (REQ-30-08).
- `src/domain/repositories/posts-repository.ts`: **sin tocar**, 100/100 líneas
  (REQ-30-14).
- Ningún test existente modificado: `git status` no muestra ningún ` M tests/…`;
  los 5 tests de inspección de `latest-articles.astro` pasan **48/48** sin tocar
  una sola aserción:

```
$ node --test tests/latest-articles-restore.test.mjs tests/articles-ui-refactor.test.mjs \
    tests/article-card-images.test.mjs tests/view-transitions.test.mjs tests/visual-polish-refactor.test.mjs
1..48
# tests 48
# pass 48
# fail 0
```

- `src/pages/about.astro`: **sin tocar** (la edición humana ajena que ya venía
  en el working tree se deja intacta).
- `feature_list.json`: **sin tocar por el implementer**; la feature 30 conserva
  el `status` que tenía (`pending`) porque el líder lo cambia a `done` tras el
  `APPROVED` del reviewer.
- No se tocó `docs/dependencies.md` ni `package.json`: cero dependencias nuevas
  (solo Node stdlib y `node:test`).

---

## 5. Ciclo verde

### 5.1 Test de la feature

```
$ node --test tests/home-latest-articles-limit.test.mjs
ok 1 - REQ-30-01: con ocho artículos la función de dominio devuelve exactamente tres
ok 2 - REQ-30-02: los tres son los más recientes por created, en orden descendente
ok 3 - REQ-30-03: devuelve el orden recibido sin reordenar ni mutar la entrada
ok 4 - REQ-30-04: con menos de tres artículos devuelve todas las entradas sin lanzar
ok 5 - REQ-30-05: un límite no entero positivo devuelve un arreglo vacío sin lanzar
ok 6 - REQ-30-06: el frontmatter recorta con la función de dominio, sin lógica ni slice
ok 7 - REQ-30-07: conserva encabezado, card por artículo y enlace /posts/${post.id}
ok 8 - REQ-30-08: latest-articles.css no cambia: 97 líneas, rejilla sin columnas y tokens
ok 9 - REQ-30-09/10: los tests de inspección existentes no documentan ajuste por esta feature
ok 10 - REQ-30-13: el build real de la portada emite exactamente tres cards con los tres más recientes
ok 11 - REQ-30-14: posts-repository.ts conserva sus 100 líneas y el recorte vive en un módulo nuevo
ok 12 - REQ-30-15: la sección se resuelve en build, sin scripts de cliente ni hidratación
ok 13 - REQ-30-16: el módulo nuevo y latest-articles.astro respetan 100 líneas
1..13
# tests 13
# pass 13
# fail 0
```

### 5.2 Suite completa

```
$ pnpm test
1..562
# tests 562
# suites 0
# pass 562
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 4413.0605
```

(562 = 549 previos + 13 nuevos. Tres ejecuciones consecutivas de la suite
completa: 562/562 en las tres, sin intermitencias.)

### 5.3 `./init.sh`

```
=== init.sh: verificando entorno ===

--- Herramientas y dependencias ---
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)

--- Archivos del harness ---
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe

--- Formato ---
✔ formato de feature_list.json y progress/current.md

--- Tests ---
✔ tests al 100% (node:test)

--- Build ---
✔ build de producción (pnpm build)

=== El entorno está perfecto. Podemos empezar a trabajar. ===
```

`./init.sh` también estaba en verde **al arrancar** la sesión, así que el verde
final no oculta un entorno roto previo.

---

## 6. Desviaciones respecto a la spec

1. **`src/domain/latest-posts.ts` exporta además `LATEST_POSTS_LIMIT = 3`.**
   No lo pedía ninguna aserción; es un añadido de legibilidad (el «3» como dato
   nombrado del dominio en lugar de un literal suelto) que no contradice ningún
   REQ y no toca la firma que la spec describe. Si el reviewer lo considera
   fuera de alcance, se quita en un minuto sin romper ningún test.
2. **`worker-configuration.d.ts`.** El líder pidió revertirlo para no ensuciar la
   feature: se revirtió con `git checkout --` y la suite pasó a **561/562**, con
   `tests/cloudflare-types-install.test.mjs` REQ-30-04 en rojo. Motivo: ese test
   exige **idempotencia estricta byte a byte** entre `worker-configuration.d.ts` y
   lo que produce hoy `wrangler types`, y la versión commiteada en HEAD ya no
   coincide con la que genera la versión instalada de wrangler (por eso el
   archivo «ya venía modificado» antes de empezar). El propio test reescribe el
   archivo al ejecutarse, así que tras esa corrida el working tree volvió
   exactamente al estado previo de la sesión (`M worker-configuration.d.ts`, 8
   inserciones / 1 borrado) y la suite volvió a 562/562 en las cuatro corridas
   siguientes. **El archivo no lo edité a mano en ningún momento**: su estado
   final es el mismo que había al empezar, y no forma parte de la feature.
3. **Comprobación visual en navegador (≤768px).** No verificada por el
   implementer (no hay navegador en el entorno); el `design.md` no existe porque
   la feature no cambia ni una regla CSS. Queda pendiente de inspección visual
   para quien lo pueda hacer, tal como ya está anotado en `CHECKPOINTS.md`.

## 7. Tests tocados

- **Creado**: `tests/home-latest-articles-limit.test.mjs`.
- **Modificados**: ninguno. Ninguna aserción existente se relajó ni se ajustó
  (REQ-30-09/REQ-30-10 verificados con `git status` y ejecutando los 5 tests de
  inspección: 48/48).

## 8. Trazabilidad REQ ↔ test

| REQ | Test |
|---|---|
| 30-01 | corte exacto (8 entradas → 3; y 3/4/5/8/20 → 3) |
| 30-02 | tres más recientes por `created` en descendente (entradas reales) |
| 30-03 | sin reordenar + entrada no mutada |
| 30-04 | 2, 1 y 0 artículos → todas las disponibles, sin lanzar |
| 30-05 | límites `0`, `-1`, `-3`, `2.5`, `NaN`, `Infinity` → `[]` |
| 30-06 | inspección del frontmatter (import + llamada, sin `slice`/`if (`/`for (`) |
| 30-07 | encabezado, card por artículo y enlace `/posts/${post.id}` |
| 30-08 | `latest-articles.css` intacto: 97 líneas, rejilla sin columnas, tokens |
| 30-09 | los 5 tests de inspección pasan sin modificar aserciones (48/48) |
| 30-10 | ningún test existente cita `REQ-30-xx` (no hubo ajuste que justificar) |
| 30-11 | evidencia del rojo (§2) |
| 30-12 | los casos unitarios anteriores, todos sobre entidades `Post` de prueba |
| 30-13 | `astro build` desde el test + 3 cards y 3 hrefs en `dist/client/index.html` |
| 30-14 | `posts-repository.ts` en 100 líneas y sin la lógica del recorte |
| 30-15 | sin `<script>`, `client:`, `set:html` ni `is:inline` |
| 30-16 | módulo nuevo, componente y CSS ≤ 100 líneas |
| 30-17 | `pnpm test` 562/562 + `./init.sh` en verde (§5) |