# Informe de implementación — feature 36 `posts-navigation-fix`

> Fecha: 2026-08-14. Implementer: agente implementador (una sola feature).
> Spec: `specs/36_posts-navigation-fix/requirements.md` (REQ-36-01..08) + `design.md`.
> Estado: implementación COMPLETA, pendiente de reviewer del líder (no marcada `done`).

## Resumen

Petición principal del humano: «las navegaciones a los detalles del content no
funcionan; sospecho que es porque el id no se está pasando, ni tampoco el slug».
Causas verificadas por el spec_author y corregidas aquí:

1. `latest-articles.astro` no renderizaba ningún enlace → ahora cada card
   enlaza a `/posts/${post.id}` con el id real (REQ-36-04).
2. La entidad `Post` no exponía `id` ni `slug` → ahora los expone readonly
   (REQ-36-01) y el repositorio los entrega: `id` desde `entry.id`, `slug`
   desde `data.slug`, lanzando `PostsDataError` si falta el slug (REQ-36-02/03).
   Antes los `transition:name` renderizaban `img-undefined`/`title-undefined`.
3. `[id].astro` emparejaba por índice (`posts[index]`) → ahora empareja por id
   con un `Map` y lanza `PostsDataError` nombrado si falta la entrada,
   conservando `params: { id: entry.id }` (REQ-36-05/06, contrato REQ-24-05).
4. El `slug` existía en `content.config.ts` y en los frontmatters pero no se
   exponía → expuesto en la entidad para uso futuro; la ruta sigue
   `/posts/[id]` con `id = entry.id` (decisión del design.md).
5. El enlace de la card se estila con tokens del diseño, incluidos hover y
   focus (REQ-36-08).

## Archivos tocados (scope autorizado, ninguno fuera de lista)

| Archivo | Cambio |
|---|---|
| `src/domain/entities/post.ts` | + `readonly id: string` y `readonly slug: string` (REQ-36-01). 19 líneas. |
| `src/domain/repositories/posts-repository.ts` | `parsePost` extrae `id` de `entry.id` (con guard de texto) y `slug` vía `expectString` (lanza `PostsDataError` sin slug, REQ-36-02/03). 96 líneas. |
| `src/pages/posts/[id].astro` | `getStaticPaths` empareja por id con `Map` sin `posts[index]`; error nombrado `PostsDataError` si falta la entrada o si colección/repo no coinciden; `params: { id: entry.id }` conservado. 45 líneas. |
| `src/components/latest-articles.astro` | `<a class="latest-articles__link" href={`/posts/${post.id}`}>` envuelve imagen + `<h2>` (meta/descripción/tags fuera del enlace, Decisión 1 del design.md); imagen conserva clase, `alt={post.title}`, `loading="lazy"` y `transition:name`; primer h2 conserva `transition:name`. 32 líneas. |
| `src/styles/latest-articles.css` | `.latest-articles__card:hover` gana `box-shadow: var(--shadow-card-hover)`; regla `.latest-articles__link` (display block, `--radius-card`, sin subrayado); hover/focus del título con `--color-accent-hover`; `:focus-visible` con anillo acento (patrón feature 37). Solo tokens, sin hex/rgba. 96 líneas. |
| `tests/posts-repository.test.mjs` | Autorizado por la spec (fixture): `slug: '00-agilismo'` en `REAL_ENTRY.data`, `id`/`slug` en `EXPECTED_POST`, campos `id`/`slug` añadidos al bucle de REQ-07-01, test nuevo REQ-36-03 (entrada sin slug → `PostsDataError`). Cabecera documenta la extensión REQ-36-01..03. |
| `tests/latest-articles-restore.test.mjs` | Autorizado por la spec: REQ-20-06 pasa de «ausencia» a «presencia» del enlace `/posts/${post.id}` (regex `/href=\{`\/posts\/\$\{post\.id\}`\}/` + clase `latest-articles__link`). Cabecera documenta la transitoriedad revocada (REQ-36-04). |

No se tocaron otros tests ni otros archivos de `src/`. `tokens.css` sin cambios
(87 líneas, REQ-17-09/REQ-26-07 en verde). Los regex de REQ-24-03 y REQ-17-01/05-07
siguen casando sin cambios en `tests/view-transitions.test.mjs` ni
`tests/article-card-images.test.mjs`.

## Ciclo TDD — evidencia del ROJO

Comando exacto (tests autorizados a actualizar, antes de implementar):

```
node --test tests/posts-repository.test.mjs tests/latest-articles-restore.test.mjs
```

Resultado: **17 tests, 13 pass, 4 fail** — todos por las causas reales:

```
not ok 6 - REQ-20-06: cada card enlaza a la ruta /posts/{id} con el id real (REQ-36-04)
  error: 'la card no enlaza a /posts/${post.id} (REQ-36-04, REQ-20-06 actualizado)'
  code: 'ERR_ASSERTION'
not ok 9 - REQ-07-01: la entidad Post tipa los artículos con campos readonly
  error: 'falta "readonly id" en Post (REQ-07-01)'
  code: 'ERR_ASSERTION'
not ok 10 - REQ-07-02: PostsRepository entrega los artículos de la colección como Post[]
  error: 'el Post entregado no coincide con el artículo real'  (+ actual - expected)
not ok 12 - REQ-36-03: una entrada sin slug de texto lanza PostsDataError
  error: 'Missing expected rejection (PostsDataError).'
```

Los 4 fallos corresponden exactamente a las causas verificadas: (1) sin enlace
en la card, (2) entidad sin `id`/`slug`, (2) repositorio sin entrega de
`id`/`slug`, (3) sin guard de `slug` en el repositorio.

## Ciclo TDD — evidencia del VERDE

### 1. Tests de la feature

```
node --test tests/posts-repository.test.mjs tests/latest-articles-restore.test.mjs tests/article-card-images.test.mjs tests/view-transitions.test.mjs
```

Resultado: **37 tests, 37 pass, 0 fail**.

### 2. Suite completa

```
node --test "tests/**/*.test.mjs"
```

Resultado: **207 tests, 207 pass, 0 fail** (206 previos + 1 test nuevo REQ-36-03).

```
# tests 207
# pass 207
# fail 0
```

### 3. `./init.sh`

```
=== init.sh: verificando entorno ===
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

### 4. Evidencia funcional en el HTML generado (build real en `dist/client/`)

Antes: `img-undefined`/`title-undefined` en todas las cards y cero enlaces.
Ahora (artículo real `01-diseño-detallado` se codifica `dise\F1o-detallado`):

```
dist/client/index.html:
  href="/posts/00-agilismo"
  href="/posts/01-diseño-detallado"
  transition-new(img-00-agilismo)
  transition-new(title-00-agilismo)
  transition-new(img-01-dise\F1o-detallado)
  transition-new(title-01-dise\F1o-detallado)

dist/client/posts/00-agilismo/index.html:
  transition-new(img-00-agilismo)      ← casa con la card
  transition-new(title-00-agilismo)    ← casa con la card

dist/client/posts/01-diseño-detallado/index.html:
  transition-new(img-01-dise\F1o-detallado)   ← casa con la card
  transition-new(title-01-dise\F1o-detallado) ← casa con la card
```

Los pares `transition:name` de las cards y del detalle ahora usan ids reales y
coinciden por artículo (REQ-36-07, REQ-24-03/05 en verde).

## Notas y decisiones

- **Regex del enlace**: el patrón correcto es `post\.id\}` + backtick + `\}`
  (el `}` de cierre de la interpolación `${post.id}` va antes del backtick de
  cierre del template literal), igual que la regex canónica de REQ-24-03 en
  `tests/view-transitions.test.mjs`. Mi primera versión del test tenía el
  orden invertido y falló en verde (test incorrecto, no código); corregida.
- **REQ-36-06 (error nombrado)**: la página lanza `PostsDataError` tanto si
  colección y repositorio no coinciden en número como si una entrada no tiene
  post por id. No hay test automatizado nuevo para `[id].astro` (solo estaba
  autorizada la actualización de los dos archivos de test listados); el
  comportamiento queda verificado por inspección y por la acceptance REQ-24-05
  de `tests/view-transitions.test.mjs` (params con `entry.id`, uso de
  PostsRepository), que sigue en verde sin cambios.
- **Límite 100 líneas**: post.ts 19, posts-repository.ts 96, [id].astro 45,
  latest-articles.astro 32, latest-articles.css 96 — todos ≤100 (REQ-07-05 en
  verde).
- **Sin hex/rgba sueltos**: `latest-articles.css` usa solo tokens
  (`--color-accent`, `--color-accent-hover`, `--color-border`,
  `--shadow-card-hover`, `--radius-card`, `--transition-default` ya presente);
  los guards REQ-10-03/REQ-17-08/REQ-20-07 en verde.
- **`feature_list.json`**: feature 36 en `status: "in_progress"` (no marcada
  `done`; la marca el líder tras el APPROVED del reviewer).
