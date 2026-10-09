# Review — feature 30

**Veredicto:** APPROVED

- Fecha: 2026-09-30
- Rol: `reviewer` (nivel 1)
- Spec: `specs/30_home-latest-articles-limit/requirements.md` (REQ-30-01..REQ-30-17)
- Informe del implementer: `progress/impl_30.md` (verificado contra el código real, no leído como verdad)
- Alcance de `src/` de la feature: `src/components/latest-articles.astro` (modificado) + `src/domain/latest-posts.ts` (nuevo) + `tests/home-latest-articles-limit.test.mjs` (nuevo)

## Checkpoints

- C1: [x] `./init.sh` verde (ejecutado por el reviewer, salida abajo)
- C2: [x] Ciclo rojo/verde con evidencia capturada (no descrita de memoria)
- C3: [x] Arquitectura y convenciones respetadas (capas, frontmatter, tokens, sin JS de runtime, sin dependencias)
- C4: [x] Alcance y limpieza correctos; nada revertido de contexto ajeno
- C5: [x] Coherencia total spec ↔ implementación ↔ tests (REQ-30-01..17 con test concreto)

## 1. Verificación independiente de lo que la home muestra (punto 2 del encargo)

No me fié del test: reconstruí el build con `./init.sh` y conté sobre el HTML emitido.

```
$ node -e "..."   # sobre dist/client/index.html, sección <section class="latest-articles">
cards en dist/client/index.html: 3
hrefs: ["/posts/05-diseno-arquitectonico-vs-diseno-detallado",
        "/posts/02-ciclo-de-vida-y-arquitectura",
        "/posts/01-procesos-memoria"]
titulos: ["Diseño Arquitectónico vs. Diseño Detallado",
          "El Rol de la Arquitectura en el Ciclo de Vida del Software",
          "Procesos y memoria - segundo post OS"]
```

¿Son los 3 más recientes por `created` y en orden descendente? **Sí.** Contrastado
contra el frontmatter real de los 8 artículos (`grep -rn "^created:" src/content/posts/`):

| slug (frontmatter) | created |
|---|---|
| `05-diseno-arquitectonico-vs-diseno-detallado` | 28 Septiembre 2026 |
| `02-ciclo-de-vida-y-arquitectura` | 24 Septiembre 2026 |
| `01-procesos-memoria` | 19 Septiembre 2026 |
| `00-prueba-os` | 18 Septiembre 2026 |
| `03-principios solid` | 21 Agosto 2026 |
| … | … |

Los tres pintados son exactamente las tres fechas más recientes y en orden
descendente. Además, en todo el HTML de la portada no hay **ninguna** otra ruta
`/posts/*` (el índice de búsqueda de `src/pages/index.astro:16` sigue usando la
colección completa, así que la búsqueda no se recorta: correcto y sin tocar ese
archivo, `git diff --stat -- src/pages/index.astro` vacío).

Cero JS de runtime en la sección (REQ-30-15): sobre el HTML emitido,
`<script>` en la sección = `false`, `client:` en la sección = `false`. Los 7
`<script>` de la página vienen del `Layout` (preexistente, ajenos a la feature).

## 2. Recuento real de la colección (punto 3 del encargo): 8 artículos, el recorte NO es un no-op

`src/content/posts/` contiene **8** artículos (`architecture/` 6 + `os/` 2), con
`created` reales distintos. Por tanto el recorte es observable y los tests
prueban algo real:

- Test unitario: `fakePosts(8)` → exactamente 3, y `fakePosts(n)` con
  n ∈ {3,4,5,8,20} → siempre 3 (REQ-30-01).
- Test end-to-end: cuenta real de cards sobre el build (REQ-30-13).

Además lo confirmé empíricamente (§4, mutante M1b): revirtiendo el componente a
su estado de HEAD, el mismo test falla con `la portada pinta 8 cards en vez de 3
(REQ-30-13)`. El "3" se ve contrastado contra 8, no contra 3.

## 3. Ciclo rojo/verde (punto 1 del encargo): evidencia capturada, suficiente

`progress/impl_30.md` §2 pega la salida **literal** de TAP de la ejecución en
rojo con `src/domain/latest-posts.ts` inexistente (`ERR_MODULE_NOT_FOUND`,
`# fail 1`, `code: 'ERR_TEST_FAILURE'`, rutas absolutas de Windows, Node
v22.22.2), y §5.1/§5.2/§5.3 pegan la salida literal del verde. No es una
descripción de memoria: son bloques de salida con contadores `# tests/# pass/# fail`.

Verde reconfirmado por el reviewer de forma independiente:

```
$ ./init.sh
--- Herramientas y dependencias ---  ✔ node ✔ pnpm ✔ node_modules
--- Archivos del harness ---         ✔ AGENTS.md ✔ feature_list.json ✔ progress/current.md
--- Formato ---                     ✔ formato de feature_list.json y progress/current.md
--- Tests ---                        ✔ tests al 100% (node:test)
--- Build ---                        ✔ build de producción (pnpm build)
=== El entorno está perfecto. Podemos empezar a trabajar. ===
```

**Salvedad registrada (no bloqueante).** El rojo capturado es de nivel *import*
(el módulo no existía), no de una aserción concreta. REQ-30-01 de la spec pide
literalmente «observar un fallo antes de existir el módulo de dominio», así que
se cumple; y los tests de REQ-30-06 y REQ-30-13 no podían pasar hasta que el
componente usara la función de dominio (demostrado en §4 con los mutantes M1 y
M1b). Es evidencia válida para el ciclo test-first de esta feature, aunque más
débil que un rojo de aserción.

## 4. Los tests son discriminantes (punto 4 del encargo): mutación real, no razonamiento

Copia temporal **fuera del repo** (`%TEMP%/opencode/mut30`, ya eliminada; en
ningún momento se editó un archivo del repo) con `src/`, `tests/`, `astro.config.mjs`,
`public/` y `node_modules` por junction. Base: 13/13 verde. Mutantes y resultado:

| # | Mutante | Tests que lo matan |
|---|---|---|
| M1 | El recorte se queda en el `.astro` (`(await getPosts()).slice(0, 3)`) | **REQ-30-06** (falla) |
| M1b | Componente como en HEAD (sin recorte) | **REQ-30-06** y **REQ-30-13** (falla: *pinta 8 cards*) |
| M2 | `latestPosts` no recorta (`slice()`) | **REQ-30-01, REQ-30-02, REQ-30-03** |
| M3 | `latestPosts` reordena por `created` descendente | **REQ-30-01, REQ-30-02, REQ-30-03** |
| M4 | `latestPosts` muta la entrada (`splice`) | **REQ-30-03** (`no mutó el arreglo de entrada`) |
| M5 | Sin guarda de límite no entero positivo | **REQ-30-05** |

Ningún mutante sobrevive. Los tests no pasan con cualquier implementación.

## 5. Cobertura REQ ↔ test (punto 10 del encargo)

| REQ | Test concreto en `tests/home-latest-30…` → `tests/home-latest-articles-limit.test.mjs` |
|---|---|
| 30-01 | test 1 «REQ-30-01: con ocho artículos la función de dominio devuelve exactamente tres» (líneas 148-156): `length === 3` + ids `['p-0','p-1','p-2']` + barrido n∈{3,4,5,8,20} |
| 30-02 | test 2 (158-172): 8 entradas reales por el constructor de `PostsRepository` → ids = los 3 slugs más recientes y `created` descendente `28/24/19 Septiembre 2026` |
| 30-03 | test 3 (174-192): entrada en orden ascendente → salida en el orden recibido; `deepEqual` contra snapshot; `length === 4`; `notEqual(result, oldestFirst)` (copia, no misma referencia) |
| 30-04 | test 4 (194-203): n∈{0,1,2} → `result.length === total` con `doesNotThrow` |
| 30-05 | test 5 (205-214): límites `0,-1,-3,2.5,NaN,Infinity` → `[]`, `Array.isArray`, `doesNotThrow` |
| 30-06 | test 6 (216-232): importa `latest-posts`, usa `latestPosts(…getPosts())`, sin `\bslice\b` / `\bif\s*\(` / `\bfor\s*\(` |
| 30-07 | test 7 (234-245): encabezado «Últimos artículos» presente y **antes** del primer `<article>`, `<article class="latest-articles__card">`, `href={`/posts/${post.id}`}`, `{posts.map(` |
| 30-08 | test 8 (247-257): CSS en 97 líneas exactas, `.latest-articles__list` sin `grid-template-columns`, `display:grid` + `gap: var(--gap-card)`, card con `var(--color-surface)`, sin hex/rgb sueltos |
| 30-09 | test 9 (259-270) + ejecución propia de los 5 tests de inspección (**48/48**) + `git diff` vacío de esos 5 archivos |
| 30-10 | test 9: ninguna de las 5 cabeceras de test existentes cita `REQ-30-xx`, o sea que no hubo ajuste de aserción que justificar |
| 30-11 | evidencia del rojo pegada en `progress/impl_30.md` §2 |
| 30-12 | tests 1-5: todos sobre entidades `Post` de prueba (`fakePost`/`fakePosts`/`entryFor`), con los 5 casos que enumera el REQ |
| 30-13 | test 10 (272-289): `spawnSync(astro build)` desde el propio test + `dist/client/index.html`: exactamente 3 `latest-articles__card` y `deepEqual` de los 3 hrefs contra los slugs reales más recientes (precedente `about-page.test.mjs`) |
| 30-14 | test 11 (291-302): `posts-repository.ts` en 100 líneas exactas, sin `latest-posts`/`latestPosts`/`LatestPost`, y el módulo nuevo exporta `latestPosts(` |
| 30-15 | test 12 (304-309): sin `<script`, sin `client:`, sin `set:html`/`is:inline` (+ confirmado sobre el HTML emitido, §1) |
| 30-16 | test 13 (311-318): `latest-posts.ts` 21 líneas, `latest-articles.astro` 36 líneas, `latest-articles.css` 97 líneas (todas ≤ 100) |
| 30-17 | suite completa verde + `./init.sh` verde (ejecutados por el reviewer, §3) |

Ningún REQ sin test. La función de dominio es discriminante en todos los
sentidos que importan (no reordena, no muta, totaliza límites imposibles).

## 6. Reglas duras y limpieza (puntos 5, 6, 7, 9)

- **Frontmatter solo imports y paso de datos**: `latest-articles.astro` (36
  líneas) = import de CSS, import del repositorio, import de `latest-posts.ts`
  y `const posts = latestPosts(await new PostsRepository().getPosts());`. Ni
  `slice`, ni `if (`, ni `for (`. Sin `<style>` embebido.
- **CSS intacto**: `git diff b825f64 HEAD -- src/styles/latest-articles.css`
  → vacío. 97 líneas; `.latest-articles__list { display: grid; gap:
  var(--gap-card); }` sin número de columnas; sin hex/rgb (verificado por
  grep y por el test 8).
- **`posts-repository.ts` intacto**: `git diff b825f64 HEAD --
  src/domain/repositories/posts-repository.ts` → vacío; 100 líneas; el orden
  canónico sigue viniendo de `byCreatedDesc` (líneas 29, 36-44). El recorte
  vive en el módulo nuevo, tal como exigía la spec.
- **Datos solo vía repositorio**: el componente no lee JSON; sigue
  `new PostsRepository().getPosts()`.
- **Cero JS de runtime**: sin `<script>`/`client:`/`set:html`/`is:inline` en el
  componente; sección resuelta en build (REQ-30-15).
- **Tests de inspección intactos (punto 5)**: `git diff b825f64 HEAD --stat --
  tests/latest-articles-restore.test.mjs tests/articles-ui-refactor.test.mjs
  tests/article-card-images.test.mjs tests/view-transitions.test.mjs
  tests/visual-polish-refactor.test.mjs` → **vacío**. Cero aserciones relajadas,
  cero cabeceras tocadas, por tanto el precedente REQ-43-06 de REQ-30-10 ni
  siquiera llega a Needed. Ejecutados: **48 tests, 48 pass, 0 fail**.
- **Sin atajos (punto 6)**: `grep -nE "\.skip|todo:|assert\.ok\(true"` → sin
  resultados en el test nuevo. Los nombres de los tests coinciden con lo que
  verifican (verificado uno por uno en §5). El test 2 no es una lista hardcodeada
  ciega: los 8 slugs y `created` están extraídos del frontmatter real
  (`grep -rn "^slug:" src/content/posts/` los confirma uno a uno) y la lista
  entra por el **constructor de `PostsRepository`**, así que el orden se produce
  realmente por `byCreatedDesc`; si el repositorio ordenara al revés, el test 2
  fallaría.
- **Sin dependencias**: `git diff -- docs/dependencies.md package.json` → vacío.
  Nada añadido al registro de dependencias (decisión exclusiva del humano).
- **Sin debug**: `grep -nE "console\.(log|debug)|TODO|FIXME|print\(|debugger"`
  sobre los 3 archivos de la feature → sin resultados. `.env` está en
  `.gitignore:20` y **no** está trackeado. Sin archivos temporales en el repo.
- **Contexto ajeno no revertido**: `src/pages/about.astro` conserva el `<h1>`
  duplicado que venía en el working tree (`git diff` lo muestra como añadido,
  presente en el árbol) y `worker-configuration.d.ts` conserva el estado
  regenerado por `wrangler types`. Ninguno de los dos fue tocado ni revertido
  por el implementer. Los cambios de la feature 28
  (`scripts/validate-dependencies.mjs`, `tests/dependencies-registry-crlf.test.mjs`)
  siguen intactos.
- **Dependencias de la feature**: en `feature_list.json`, la feature 30 tiene
  `depends_on: []` → no se saltó ninguna dependencia pendiente.
- **Alcance**: los únicos archivos de `src/` del diff son
  `src/components/latest-articles.astro` y `src/domain/latest-posts.ts`; el
  único archivo de `tests/` es el nuevo. `src/pages/index.astro` no se toca.

## 7. Desviaciones y observaciones (ninguna bloqueante)

1. **`LATEST_POSTS_LIMIT = 3` exportado** (`src/domain/latest-posts.ts:17`): el
   informe lo declara como añadido propio y no exigido por la spec. No
   contradice ningún REQ, no altera la firma descrita por la spec, convierte un
   número mágico en dato nombrado del dominio y está cubierto por REQ-30-16 y
   por el uso en REQ-30-01/05. **Aceptado.**
2. **Test nuevo de 318 líneas.** La regla de 100 líneas de
   `docs/architecture.md` §12 se aplica en la práctica a `src/`/`scripts/`: en
   `tests/` hay 56 de 62 archivos por encima de 100 (hasta 393) y el propio
   REQ-30-16 acota el límite a «el módulo de dominio nuevo y los archivos
   `latest-articles.astro` y `latest-articles.css`». Los tres archivos de `src/`
   de la feature cumplen (21 / 36 / 97). **Aceptado como precedente del repo**;
   no lo cuento como violación de REQ-30-16.
3. **Rojo de nivel import**, no de aserción (§3). Cumple el literal de
   REQ-30-11 y esa debilidad queda compensada porque los mutantes M1 y M1b
   demuestran que los tests de REQ-30-06 y REQ-30-13 no pasan hasta que el
   componente recorta de verdad. **Aceptado.**
4. **El test 9 (REQ-30-09/10) es una aserción proxy**: comprueba que las 5
   cabeceras de los tests de inspección no citan `REQ-30-xx`, en lugar de
   ejecutarlos. La garantía real «pasan sin modificar aserciones» la dan el
   `git diff` vacío y la ejecución 48/48 (suite completa e `init.sh`). Cobertura
   suficiente; lo dejo anotado por transparencia.
5. **Fuera del alcance del implementer, pendiente del líder**:
   - Mientras se revisaba, el líder commiteó todo el working tree en
     `c19d375`, un commit titulado por la feature 28 que **mezcla las features 28
     y 30** y además arrastra la edición humana de `about.astro` y el
     `worker-configuration.d.ts` regenerado. `docs/conventions.md` §Commits pide
     «un commit por feature o fix; sin cambios no relacionados mezclados». No
     imputable al implementer, pero conviene que el líder lo registre/splittee.
   - `feature_list.json`: la feature 30 sigue en `pending` (el implementer no la
     tocó, por diseño) → **el líder debe marcarla `done`** para cerrar el
     checkbox de Harness de `CHECKPOINTS.md`.
   - `feature_list.json` tiene la feature **10 `client-init-on-navigation` en
     `in_progress`**: preexistente y ajeno a esta feature, pero impide el
     checkbox «ninguna otra a medias».
   - `CHECKPOINTS.md:27-28` dice «suite 221/221 … 2026-08-14». Está desactualizado
     respecto a la suite real de este ciclo (**562/562** verificada hoy). El texto
     ya venía así en HEAD (el archivo no aparece en el diff de `c19d375`); lo
     dejo señalado para que el líder lo refresque al cerrar.
6. **Inspección visual en navegador (≤768px)**: no verificada (no hay navegador en
   el entorno). Ya estaba anotada como pendiente en `CHECKPOINTS.md:29` y la
   feature no cambia ni una regla CSS (la rejilla no declara columnas), así que el
   riesgo visual es nulo. No bloquea.

## Cambios requeridos

Ninguno.