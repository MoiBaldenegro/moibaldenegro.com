# Informe de implementación — feature 20 latest-articles-restore

- **Feature:** 20 — latest-articles-restore ("Restaurar latest-articles.astro al contrato de la entidad Post (features 10 y 17)")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-12
- **Spec:** `specs/20_latest-articles-restore/requirements.md` (REQ-20-01..07) + `specs/20_latest-articles-restore/design.md` (Decisiones 1-5)
- **Análisis previo:** `progress/research/refactor-post-manual.md` (D3/D6)
- **Estado en `feature_list.json`:** `in_progress` (no la marco done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — contrato existente (antes de implementar)

El componente reescrito manualmente consume `post.data.*` (entradas crudas), sin
`PostsRepository`, sin marcado semántico y sin `alt`/`loading`. Ejecuté los dos
tests de contrato existentes (`tests/articles-ui-refactor.test.mjs` REQ-10-01..04
y `tests/article-card-images.test.mjs` REQ-17-01..09) y capturé el rojo:

```
$ node --test tests/articles-ui-refactor.test.mjs tests/article-card-images.test.mjs
not ok 1 - REQ-17-01: el <img> de la card lleva la clase latest-articles__image y referencia post.img
  error: 'el <img> no referencia el campo img de la entidad Post (REQ-17-01)'
  actual: false
not ok 2 - REQ-17-06: el <img> declara alt interpolado con el título del artículo
  error: 'el <img> no usa alt={post.title} (REQ-17-06)'
not ok 3 - REQ-17-07: el <img> declara loading="lazy" para diferir la carga
  error: 'el <img> no declara loading="lazy" (REQ-17-07)'
not ok 12 - REQ-10-01: LatestArticles obtiene los artículos desde PostsRepository
  error: 'latest-articles.astro no usa la clase PostsRepository (REQ-10-01)'
not ok 15 - REQ-10-01 (Decisión 1): mapea Post a marcado semántico con los cinco campos
  error: 'el marcado no usa la etiqueta semántica "<span" (REQ-10-01)'
...
1..20
# tests 20
# pass 15
# fail 5
```

5 fallos en el contrato de features 10 y 17 (los mismos que reportó el líder:
`post.data.*`, sin alt/lazy, sin spans ni `PostsRepository`).

### ROJO — test nuevo de la spec 20 (test-first para REQ-20-XX)

REQ-20-06 (sin enlace a `/posts`, sin `transition:name`) no estaba cubierto por
ningún test existente; la spec 20 define el contrato completo REQ-20-01..07, así
que escribí PRIMERO `tests/latest-articles-restore.test.mjs` (8 tests, patrón de
inspección de archivos de las features previas) y lo observé en rojo:

```
$ node --test tests/latest-articles-restore.test.mjs
not ok 1 - REQ-20-01: obtiene los artículos desde PostsRepository
  error: 'latest-articles.astro no usa la clase PostsRepository (REQ-20-01)'
not ok 3 - REQ-20-03: marcado semántico article/h2/p/span con los cinco campos
  error: 'el marcado no usa la etiqueta semántica "<span" (REQ-20-03)'
not ok 4 - REQ-20-04: muestra el texto "min de lectura" junto al autor
  error: 'el marcado no muestra el tiempo de lectura (REQ-20-04)'
not ok 5 - REQ-20-05: el <img> lleva la clase, src con post.img, alt={post.title} y loading lazy
  error: 'el <img> no referencia post.img (REQ-20-05)'
not ok 6 - REQ-20-06: sin enlaces a la ruta /posts ni atributos transition:name
  error: 'el componente conserva un enlace a la ruta /posts (REQ-20-06)'
# tests 8
# pass 3
# fail 5
```

### VERDE (implementación)

Restauré `src/components/latest-articles.astro` al estado canónico de las
features 10+17 (recuperado de git `ae2597b` + `progress/impl_17_article-card-images.md`):

```
---
import "../styles/latest-articles.css";

import { PostsRepository } from "../domain/repositories/posts-repository.ts";

const posts = await new PostsRepository().getPosts();
---

<section class="latest-articles">
  <div class="latest-articles__list">
    {posts.map((post) => (
      <article class="latest-articles__card">
        <img
          class="latest-articles__image"
          src={`/assets/content/${post.img}`}
          alt={post.title}
          loading="lazy"
        />
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

29 líneas (≤100), frontmatter solo imports + `const` de datos, sin `<a>` (ruta
`/posts` no existe), sin `transition:name` (la feature 24 los reincorporará según
su design), sin estilos inline ni `<style>`. `latest-articles.css` NO se tocó.

Verificación en verde — los 3 archivos de contrato:

```
$ node --test tests/articles-ui-refactor.test.mjs tests/article-card-images.test.mjs tests/latest-articles-restore.test.mjs
# tests 28
# pass 28
# fail 0
```

## 2. Archivos tocados y por qué

| Archivo | Por qué |
|---------|---------|
| `src/components/latest-articles.astro` (reescrito: 29 líneas) | REQ-20-01..07: restauración al contrato features 10+17 — `new PostsRepository().getPosts()`, marcado semántico (article/h2/p/span con post.title/author/readtime/description/tags + "min de lectura"), img con `latest-articles__image` + `post.img` + `alt={post.title}` + `loading="lazy"`, sin anchor ni `transition:name`. |
| `tests/latest-articles-restore.test.mjs` (nuevo, 8 tests) | Test-first REQ-20-01..07: cubre el contrato de la spec 20, incluido REQ-20-06 (sin `/posts`, sin `transition:name`) que ningún test existente verificaba, y REQ-20-07 (componente y hoja ≤100 líneas; la hoja conserva la regla `.latest-articles__image` con tokens y sin colores sueltos). |
| `feature_list.json` | Solo `status` de la feature 20: `pending` → `in_progress`. |
| `progress/current.md`, `progress/impl_20_latest-articles-restore.md` | Bitácora e informe de sesión (regla anti-silencio). |

NO toqué: `src/styles/latest-articles.css` (75 líneas intactas — `git status` no
lo lista), dominio posts (feature 18 done), repos JSON (feature 19 done),
`src/pages/posts/[id].astro` (hallazgo canalizado del implementer de la 18,
fuera del alcance — ver §5), `htb-stadistics.astro` (22), SSR/Cloudflare (21),
docs kit (23), tokens.css (96 líneas, REQ-17-09) ni el status de la feature 17
(la cierra el líder).

## 3. Cobertura REQ-20-XX

| REQ | Qué exige | Cómo se cumple | Verificado por |
|-----|-----------|----------------|----------------|
| REQ-20-01 | Artículos desde PostsRepository con frontmatter solo imports/paso de datos | `import { PostsRepository }` + `const posts = await new PostsRepository().getPosts()`; sin lógica en el frontmatter | Test `latest-articles-restore` (regex posts-repository/PostsRepository/getPosts()) + `articles-ui-refactor` REQ-10-01 |
| REQ-20-02 | No importa astro:content ni getCollection | El componente solo importa la hoja y el repositorio; `astro:content` queda dentro del loader del dominio | Test `latest-articles-restore` + `articles-ui-refactor` REQ-10-04 |
| REQ-20-03 | Marcado semántico article/h2/p/span con post.title·author·readtime·description·tags | `<article>` card con `<h2>` título, `<p>` meta (autor/tiempo), `<p>` descripción, `<div>` de tags con `<span>` por tag interpolar | Test `latest-articles-restore` + `articles-ui-refactor` REQ-10-01 (Decisión 1) |
| REQ-20-04 | Texto "min de lectura" junto al autor | `Por {post.author} • {post.readtime} min de lectura` | Test `latest-articles-restore` + `articles-ui-refactor` REQ-10-01 |
| REQ-20-05 | img con clase latest-articles__image, src post.img, alt={post.title}, loading lazy | `<img class="latest-articles__image" src={`/assets/content/${post.img}`} alt={post.title} loading="lazy" />` | Test `latest-articles-restore` + `article-card-images` REQ-17-01/06/07 |
| REQ-20-06 | Sin enlaces a /posts ni transition:name | El marcado no contiene `<a>` ni atributos `transition:*` (Decisión 3 y 4 del design.md) | Test `latest-articles-restore` (doesNotMatch `/posts` y `transition:name`) + grep manual 0 ocurrencias |
| REQ-20-07 | Componente y hoja ≤100 líneas; hoja conserva reglas feature 17 con tokens | Componente 29 líneas; `latest-articles.css` 75 líneas con la regla `.latest-articles__image` intacta (width 100%, aspect-ratio 16/9, object-fit cover, var(--radius-card)/var(--color-border)/var(--gap-card), sin hex/rgba) | Test `latest-articles-restore` + `article-card-images` REQ-17-02..08 + `articles-ui-refactor` REQ-10-03 |

## 4. Efecto sobre la feature 17 (article-card-images, sigue `in_progress`)

El contrato REQ-17-01..09 vuelve a estar en verde gracias a la restauración del
componente (imagen con clase/alt/loading + hoja intacta). `tests/article-card-images.test.mjs`
pasa 11/11. Con esto el líder puede cerrar la feature 17 con revisión sobre
`impl_17`/`review_17` (APPROVED existente). Esta feature NO toca su status.

## 5. Verificación final

- **Suite completa** `pnpm test`: **150 pass / 2 fail** — residuales SOLO de
  features ajenas: REQ-11-05 (feature 21 ssr-cloudflare-align, ruta `/about`
  esperando adaptación al output del adapter) y REQ-01-05 (feature 23
  harness-docs-alignment, fuga de token del kit). Cero fallos de features
  10/17/20:
  ```
  # tests 152
  # pass 150
  # fail 2
  ```
- **Formato:** `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
- **Guard de tokens:** `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
- **Límites:** componente 29 líneas, hoja 75 líneas (ambos ≤100). Grep de control
  en el componente: 0 ocurrencias de `post.data`, `transition:name`, `href=` ni
  `markdownPostRepository`.
- **Build (documentado, NO verificación de esta feature):** `pnpm build` falla
  SOLO por `src/pages/posts/[id].astro:3` — `[MISSING_EXPORT]
  "markdownPostRepository" is not exported by "src/domain/repositories/posts-repository.ts"`
  (página del commit manual del usuario `72e5c52`, API eliminada por REQ-18-05).
  Es el hallazgo canalizado aparte por el líder: **no lo toqué** (ni elimino, ni
  adapto). El enlace `/posts/${post.id}` queda fuera del alcance de la feature 20
  (Decisión 3 del design.md: ruta inexistente; el marcado restaurado no lleva
  anchor) y depende de la resolución de `[id].astro`.
- **`./init.sh`:** no puede terminar en verde global hasta que las features 21 y
  23 resuelvan sus tests y el build deje de fallar por `[id].astro` (piezas
  canalizadas aparte). Las comprobaciones de formato pasan; los 2 fallos de test
  y el build son de features ajenas a esta.

## 6. Resultado final

Ciclo rojo/verde completo: 5 fallos de contrato (features 10/17) + test nuevo de
la spec 20 en rojo → componente restaurado al estado canónico → 28/28 en los 3
archivos de contrato, suite 150/152 con residuales solo de 21/23, formato ✔ y
tokens ✔. Feature 20 implementada en verde. Listo para que el líder lance al
reviewer.