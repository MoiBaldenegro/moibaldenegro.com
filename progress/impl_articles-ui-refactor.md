# Informe de implementación — feature 10 `articles-ui-refactor`

- **Fecha:** 2026-08-10 (implementer)
- **Feature:** 10 — articles-ui-refactor — "Conectar LatestArticles al PostsRepository con estilos propios"
- **Spec:** `specs/10_articles-ui-refactor/requirements.md` (REQ-10-01..04) + `specs/10_articles-ui-refactor/design.md` (Decisiones 1-3 y tabla de tokens)
- **Estado:** implementada, ciclo rojo/verde completo, `./init.sh` en verde. Pendiente: reviewer.

## Alcance (acceptance de feature_list.json)

1. `latest-articles.astro` importa PostsRepository y no importa astro:content (REQ-10-01, REQ-10-04).
2. `src/styles/latest-articles.css` existe y es importada por el componente (REQ-10-02).
3. `tests/articles-ui-refactor.test.mjs` verifica `latest-articles.css` ≤100 líneas y sin valores sueltos (REQ-10-03).
4. El build renderiza los artículos con título, autor, tiempo, descripción y tags (REQ-10-01).

## Verificación de sesión concurrente

Al iniciar se verificó en disco que no existía ningún artefacto previo de la feature 10
(no `tests/articles-ui-refactor.test.mjs`, no `src/styles/latest-articles.css`, no
`progress/impl_articles-ui-refactor.md`, no `progress/review_articles-ui-refactor.md`)
→ implementación desde cero. La feature 9 se verificó CERRADA en disco
(review APPROVED; cerrada por la sesión concurrente) y quedó intacta.

## Test escrito primero (ROJO)

`tests/articles-ui-refactor.test.mjs` — 9 tests contra REQ-10-01..04 y design.md:

- REQ-10-01: el componente importa `posts-repository`, usa la clase `PostsRepository` y llama `getPosts()`.
- REQ-10-04: NO contiene `astro:content` ni `getCollection` (el test falla si la UI accede a la fuente de datos directamente).
- REQ-10-02: importa `../styles/latest-articles.css` y la hoja existe.
- REQ-10-01 (Decisión 1): marcado semántico `article`/`h2`/`p`/`span` que interpola `post.title`, `post.author`, `post.readtime`, `post.description`, `post.tags` y muestra "min de lectura".
- REQ-10-03: hoja ≤100 líneas; sin hex ni `rgb()/rgba()`; colores/radios/transiciones con `var()`; usa los 8 tokens de la tabla del design.md (`--color-surface`, `--color-text`, `--color-text-secondary`, `--color-border`, `--color-accent`, `--radius-card`, `--gap-card`, `--transition-default`).
- Convención: componente ≤100 líneas, sin lógica (`readFileSync`/`new URL`/`function`/`if`/`for`), sin `style=` inline ni `<style>` embebido.

### Evidencia del ROJO (salida real ejecutada)

```
$ node --test tests/articles-ui-refactor.test.mjs
# tests 9
# pass 1
# fail 8
```

Los 8 fallos (antes de implementar): REQ-10-01 (componente sin `posts-repository`/`getPosts()`),
REQ-10-04 (importa `astro:content` y usa `getCollection`), REQ-10-02 (sin import de la hoja
y `src/styles/latest-articles.css` no existe), REQ-10-01 marcado (no interpola `post.*` ni usa
`<article>/<h2>/<p>/<span>`), REQ-10-03 ×3 (hoja inexistente). El único pass era el invariante
de convención (componente original de 22 líneas, sin lógica ni estilos embebidos).

## Implementación

### `src/components/latest-articles.astro` (28 líneas)

```astro
---
import "../styles/latest-articles.css";

import { PostsRepository } from "../domain/repositories/posts-repository.ts";

const posts = await new PostsRepository().getPosts();
---

<section class="latest-articles">
  <div class="latest-articles__list">
    {posts.map((post) => (
      <article class="latest-articles__card">
        <h2 class="latest-articles__title">{post.title}</h2>
        <p class="latest-articles__meta">Por {post.author} • {post.readtime} min de lectura</p>
        <p class="latest-articles__description">{post.description}</p>
        <div class="latest-articles__tags">
          {post.tags.map((tag) => (
            <span class="latest-articles__tag">#{tag}</span>
          ))}
        </div>
      </article>
    ))}
  </div>
</section>
```

- Frontmatter solo imports + `const` de datos (top-level await de Astro sobre
  `PostsRepository.getPosts()`, que envuelve `getCollection('architecture')` — feature 7).
- Cero lógica: ni `readFileSync`, ni `new URL`, ni `function/if/for`.
- Marcado semántico BEM ligero (`latest-articles__*`) mapeando la entidad `Post`.

### `src/styles/latest-articles.css` (58 líneas)

Solo tokens de `tokens.css` (los 8 del design.md + `--radius-pill` y `--container-max`,
patrón ya usado por `layout.css`/`hero-card.css`): `--color-surface` (fondo de tarjeta),
`--color-text` (título/descripción), `--color-text-secondary` (metadatos),
`--color-border` (borde), `--color-accent` (tags y hover), `--radius-card`/`--radius-pill`
(radios), `--gap-card` (espaciado de la lista), `--transition-default` (transición),
`--container-max` (ancho). Cero hex, cero `rgb()/rgba()`. Media query móvil-primero
(768px) al final, igual que el resto de hojas.

## Evidencia del VERDE (salidas reales ejecutadas)

```
$ node --test tests/articles-ui-refactor.test.mjs
# tests 9
# pass 9
# fail 0

$ pnpm test
# tests 69        (suite completa: 60 previos + 9 nuevos)
# pass 69
# fail 0

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm build
[build] ✓ Completed in 272ms.
[build] 1 page(s) built in 851ms
[build] Complete!

$ ./init.sh
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación de la UI (build + dev server)

### Build — `dist/index.html`

```
OK  latest-articles
OK  Agilismo, diseño y fragilidad        (título, REQ-10-01)
OK  Moises Baldenegro Melendez           (autor)
OK  15 min de lectura                    (tiempo)
OK  conceptos fundamentales              (descripción)
OK  #arquitectura / #agilismo / #software-design   (3 tags renderizadas)
tags renderizadas: 3
hojas enlazadas: /_astro/index.DJVOk3kH.css
latest-articles__card en css del build: SI
var(--color-surface) en css del build: SI
```

`astro:content` en `src/` queda únicamente donde corresponde: `content.config.ts`
(definición de colecciones) y `posts-repository.ts` (única vía de acceso, feature 7);
el componente ya no lo toca (REQ-10-04). `src/config.ts` es código muerto que
eliminará la feature 12 (cleanup-dead-code), fuera del scope de esta feature.

### Dev server (background, `pnpm dev --port 4321`)

```
HTTP 200
OK  latest-articles
OK  Agilismo, diseño y fragilidad
OK  Moises Baldenegro Melendez
OK  15 min de lectura
OK  conceptos fundamentales
OK  #arquitectura / #agilismo / #software-design
chips de tag renderizados: 6   (3 spans + 3 en el CSS inyectado por Astro en dev)
style= inline en la seccion: no
```

Server detenido tras la verificación (proceso terminado, puerto 4321 libre).

## Cumplimiento de acceptance

1. ✔ `latest-articles.astro` importa `PostsRepository` (`../domain/repositories/posts-repository.ts`) y usa `getPosts()`; no contiene `astro:content` ni `getCollection` (REQ-10-01, REQ-10-04).
2. ✔ `src/styles/latest-articles.css` existe (58 líneas) e importada por el componente (REQ-10-02).
3. ✔ `tests/articles-ui-refactor.test.mjs` (9/9) verifica ≤100 líneas, sin hex/rgba y solo `var()` en colores/radios/transiciones + los 8 tokens del design.md (REQ-10-03).
4. ✔ Build y dev server renderizan el artículo real `src/content/architecture/00-agilismo.md` con título, autor, tiempo de lectura, descripción y 3 tags (REQ-10-01).

## Convenciones respetadas

Datos vía repositorio (sin `astro:content` en la UI), estilos separados (sin `<style>` ni
`style=`), lógica fuera de la UI (frontmatter solo imports + `const`), tokens sin valores
sueltos, ≤100 líneas en todos los archivos (componente 28, CSS 58), estático por defecto
(cero JS de runtime añadido), un solo layout intacto (el componente sigue consumido por
`index.astro` dentro de `Layout`). Sin dependencias externas nuevas.

## Notas

- Timestamps de la sesión (2026-08-10): test escrito → ROJO capturado → implementación
  (componente + CSS) → VERDE (9/9, 69/69, build, init.sh) → verificación visual dev server.
- `feature_list.json`: feature 10 en `status: "in_progress"` (pendiente de reviewer).
- La feature 9 (sesión concurrente) se cerró durante esta sesión; no se tocó.
