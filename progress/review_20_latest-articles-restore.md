# Review — feature 20 `latest-articles-restore`

**Fecha:** 2026-08-12 · **Reviewer:** agente revisor (nivel 1)
**Feature:** 20 «Restaurar latest-articles.astro al contrato de la entidad Post (features 10 y 17)»
**Spec:** `specs/20_latest-articles-restore/requirements.md` (REQ-20-01..07) + `design.md` (Decisiones 1-5)
**Contratos referenciados:** `specs/10_articles-ui-refactor/` (REQ-10-01..04) y `specs/17_article-card-images/` (REQ-17-01..09)
**Informe del implementer:** `progress/impl_20_latest-articles-restore.md`
**Veredicto:** APPROVED

---

## 1. Pregunta de revisión (test-first, rojo → verde)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?**

Sí. La feature es una **restauración con test-first**: el contrato de features 10/17 ya
existía y el test nuevo de la spec 20 (REQ-20-06 no estaba cubierto por ningún test
previo) se escribió PRIMERO. Ciclo rojo/verde documentado en `impl_20` §1 y verificado:

- **ROJO (evidenciado en `impl_20` §1):** contrato features 10/17 → `15 pass / 5 fail`
  (`post.data.img`, `post.data.title`, sin `loading="lazy"`, sin `PostsRepository`, sin
  `<span>`); test nuevo `tests/latest-articles-restore.test.mjs` → `3 pass / 5 fail`
  (REQ-20-01/03/04/05/06). El diff del componente contra HEAD refleja exactamente esas
  causas (entradas crudas, enlace `/posts/${id}`, `transition:name`, sin alt/lazy). ✔
- **VERDE (verificado por mí en disco, esta revisión):**
  `node --test tests/articles-ui-refactor.test.mjs tests/article-card-images.test.mjs tests/latest-articles-restore.test.mjs`
  → **28 tests, 28 pass, 0 fail** (salida TAP completa con los 28 `ok`).
  Suite completa `pnpm test` → **152 tests, 150 pass, 2 fail** — los 2 fallos son **todos**
  de features ajenas (ver §4), ninguno del contrato 10/17/20. ✔

## 2. Cobertura REQ-20-01..07 (evidencia verificada en disco)

| REQ | Requisito | Evidencia | Resultado |
|---|---|---|---|
| REQ-20-01 | Artículos desde `PostsRepository`; frontmatter solo imports/paso de datos | `latest-articles.astro:4,6`: `import { PostsRepository }` + `const posts = await new PostsRepository().getPosts()`; sin lógica en frontmatter. Tests REQ-20-01 y REQ-10-01 `ok` | ✔ |
| REQ-20-02 | No importa `astro:content` ni `getCollection` | El componente solo importa la hoja y el repositorio; `astro:content` queda en el loader del dominio (`posts-repository.ts:36-39`). Tests REQ-20-02 y REQ-10-04 `ok` | ✔ |
| REQ-20-03 | Marcado semántico `article`/`h2`/`p`/`span` con los 5 campos | Líneas 12-25: `<article>` con `<h2>{post.title}`, `<p>` meta, `<p>{post.description}`, `<div>` de tags con `<span>#{tag}</span>`; interpolaciones `post.title/author/readtime/description/tags`. Test REQ-20-03 `ok` | ✔ |
| REQ-20-04 | Texto «min de lectura» junto al autor | Línea 20: `Por {post.author} • {post.readtime} min de lectura`. Tests REQ-20-04 y REQ-10-01 `ok` | ✔ |
| REQ-20-05 | `<img>` con clase `latest-articles__image`, src `post.img`, `alt={post.title}`, `loading="lazy"` | Líneas 13-18. Tests REQ-20-05 y REQ-17-01/06/07 `ok` | ✔ |
| REQ-20-06 | Sin enlace a `/posts` ni `transition:name` | 0 `<a>` y 0 `transition:*` en el archivo (inspección + diff: el anchor y los atributos del componente manual fueron eliminados; Decisión 3/4 del design.md). Test REQ-20-06 (`doesNotMatch /posts` y `transition:name`) `ok` | ✔ |
| REQ-20-07 | Componente y hoja ≤100 líneas; la hoja conserva las reglas de la feature 17 con tokens y sin colores sueltos | Componente = 30 líneas; `latest-articles.css` = 75 líneas (intacta, no aparece en `git status`), regla `.latest-articles__image` con `width 100%`, `aspect-ratio 16/9`, `object-fit cover`, `var(--radius-card)`, `var(--color-border)`, `var(--gap-card)`, sin hex/rgba. Tests REQ-20-07, REQ-10-03 y REQ-17-02..08 `ok` | ✔ |

**Dependencias:** `depends_on: [18]` en `feature_list.json` — feature 18 `posts-domain-restore`
está **done**. Satisface la regla de no saltar dependencias. ✔

## 3. Archivos tocados vs alcance permitido

Confirmado con `git status --porcelain` y `git diff` (el único cambio de código de esta
feature en `src/` es el componente):

| Archivo | Estado | ¿Dentro de alcance? |
|---|---|---|
| `src/components/latest-articles.astro` | restaurado (30 líneas; diff 18+/15- contra el componente manual del usuario) | ✔ sí (REQ-20-01..07) |
| `tests/latest-articles-restore.test.mjs` | nuevo (8 tests, 222 líneas) | ✔ sí (test-first REQ-20-01..07) |
| `feature_list.json` | f. 20 `pending` → `in_progress` | ✔ sí (estado del arnés) |
| `progress/current.md`, `progress/impl_20_latest-articles-restore.md` | bitácora e informe de sesión | ✔ sí |
| `src/styles/latest-articles.css` | **NO tocado** (no aparece en `git status`; 75 líneas intactas) | ✔ (Decisión 5 design.md) |
| `src/domain/entities/post.ts`, `src/domain/repositories/posts-repository.ts` | **NO tocados por la f. 20** (los `M` en git status son de la feature 18, ya `done`) | ✔ |
| `src/styles/tokens.css` | **NO tocado** (REQ-17-09, 96 líneas) | ✔ |
| `src/pages/posts/[id].astro` | **NO tocado** (hallazgo canalizado del líder, fuera del alcance 20) | ✔ |
| Feature 17 `article-card-images` | status intacto (`in_progress`; la cierra el líder, no esta feature) | ✔ (D6 research) |

No hay archivos fuera de alcance tocados por la feature 20.

## 4. Efecto sobre la feature 17 (article-card-images, sigue `in_progress`)

`tests/article-card-images.test.mjs` (REQ-17-01..09, 11 tests) está **en verde**
dentro de los 28 pass verificados — el contrato de la feature 17 quedó restaurado
(imagen con clase/`alt`/`loading` en el componente + regla de la hoja intacta).
La feature 17 queda **lista para cierre por el líder** con revisión sobre
`impl_17`/`review_17` (APPROVED existente). Esta feature NO tocó su status
(verificado: sigue `in_progress` en `feature_list.json`). ✔

## 5. Conformidad con `docs/architecture.md` y `docs/conventions.md`

- **Regla 1/Capas + «Datos vía repositorio»:** la UI consume `PostsRepository` (dominio) que entrega entidades; `astro:content` queda encapsulado en el loader del repositorio. ✔
- **Regla 7 (estilos separados):** sin `<style>` ni `style=` en el componente; importa `src/styles/latest-articles.css`. ✔
- **Regla 8 (lógica separada de la UI):** frontmatter solo imports + `const` de datos — sin `function`/`if`/`for`, sin lecturas de archivos. ✔
- **Regla 12 (≤100 líneas):** componente 30, hoja 75. ✔
- **Regla 6 (tokens, no valores sueltos):** la hoja consuma solo `var(--…)`; sin hex/rgba (REQ-10-03/17-08 pasan). ✔
- **Convenciones:** BEM (`latest-articles__*`), errores del dominio nombrados (`PostsDataError` en el repositorio), orden de imports en el frontmatter (estilos → dominio → datos). ✔
- **Rutas explícitas (regla 10):** el enlace muerto `/posts/${id}` se elimina — la ruta no existe en `src/pages/` (solo `index.astro`, `about.astro` y el `[id].astro` del hallazgo, fuera de contrato); un enlace a 404 es un bug. ✔

## 6. Estado de `./init.sh` (ejecutado en esta revisión)

**`./init.sh` NO termina en verde — 2 comprobaciones rojas, ambas por piezas fuera del
alcance de esta feature:**

1. **`tests al 100%`:** `pnpm test` → 150 pass / 2 fail. Los 2 fallos son de features
   **ajenas**: REQ-11-05 (feature 21 `ssr-cloudflare-align`, pendiente) y REQ-01-05
   (feature 23 `harness-docs-alignment`, pendiente). Cero fallos del contrato 10/17/20.
2. **`build de producción`:** falla SOLO en `src/pages/posts/[id].astro:3` —
   `[MISSING_EXPORT] "markdownPostRepository" is not exported by "src/domain/repositories/posts-repository.ts"`
   (página del commit manual del usuario `72e5c52`; API eliminada por REQ-18-05).
   Es el hallazgo canalizado aparte por el líder; **no lo juzgo ni bloqueo por esto**,
   pero lo CONFIRMO como observación (ver §7.1).

Formato (`check-format.mjs`) y guard de tokens (`audit-design-tokens.mjs`) pasan en verde.

## 7. Observaciones (fuera del veredicto)

1. **`src/pages/posts/[id].astro` — confirmado como hallazgo aparte.** La página existe
   (trackeada, commit manual `72e5c52`), importa `markdownPostRepository` en la línea 3
   y rompe el build. El implementer de la 20 hizo lo correcto: no la tocó y la documentó
   como dependiente de la resolución del líder (adaptar a `PostsRepository` o eliminar).
2. El componente restaurado no termina en salto de línea final (`git diff` avisa
   "No newline at end of file"); sin impacto funcional ni de contrato (REQ-20-07 pasa),
   queda como nota de estilo menor, coherente con la observación 4 de review_18.
3. El contrato visual de la feature 17 (`latest-articles.css`) no se tocó en absoluto;
   la restauración del componente revalidó REQ-17-01/06/07 sin tocar REQ-17-02..09.

## 8. Checkpoints (`CHECKPOINTS.md`)

- C1 (repositorios validan con errores nombrados / datos vía repositorio): [x]
- C2 (ningún archivo de la feature supera 100 líneas, sin valores sueltos): [x]
- C3 (`./init.sh` termina en verde): [ ] ← Razón: 2 comprobaciones rojas, ambas ajenas a esta feature — (a) 2 tests residuales de las features 21 (REQ-11-05) y 23 (REQ-01-05), ambas `pending` en backlog; (b) build roto por `src/pages/posts/[id].astro` (hallazgo canalizado del líder). El contrato de la feature 20 (28/28) está verde.
- C4 (`feature_list.json` con la tarea en `done`): [ ] ← Razón: la feature 20 queda `in_progress`; el cierre a `done` es decisión del líder tras esta revisión (flujo normal del arnés).
- C5 (sin dependencias nuevas externas): [x]

## 9. Conclusión

La feature 20 restaura íntegramente el contrato features 10+17 en
`src/components/latest-articles.astro`: `new PostsRepository().getPosts()` (sin
`astro:content` en la UI), marcado semántico `article`/`h2`/`p`/`span` con los 5
campos de la entidad + «min de lectura», `<img>` con clase `latest-articles__image`,
`post.img`, `alt={post.title}` y `loading="lazy"`, sin enlace muerto a `/posts` ni
`transition:name` sin amparo, 30 líneas, sin estilos inline ni lógica. La hoja
`latest-articles.css` (75 líneas) no se tocó. Test-first con rojo evidenciado y
verde verificado: 28/28 en los 3 archivos de contrato. La feature 17 queda habilitada
para cierre (sus REQ-17-01..09 en verde, status intacto). Los rojos de `./init.sh`
son exclusivamente ajenos (features 21/23 + página del usuario `[id].astro`,
canalizada aparte).

**Veredicto: APPROVED** — el cierre a `done` de las features 20 y 17 queda a
decisión del líder.