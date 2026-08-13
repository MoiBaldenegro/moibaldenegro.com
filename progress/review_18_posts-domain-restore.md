# Review — feature 18 `posts-domain-restore`

**Fecha:** 2026-08-12 · **Reviewer:** agente revisor (nivel 1)
**Feature:** 18 «Restaurar el dominio de artículos: entidad Post y clase PostsRepository»
**Spec:** `specs/18_posts-domain-restore/requirements.md` (REQ-18-01..06, contrato `specs/07_posts-domain/` REQ-07-01..05)
**Informe del implementer:** `progress/impl_18_posts-domain-restore.md`
**Veredicto:** APPROVED

---

## 1. Pregunta de revisión (test-first, rojo → verde)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?**

Sí, para el contrato de esta feature. La feature es una **restauración**: los tests
(`tests/posts-repository.test.mjs`, REQ-07-01..05) ya existían como contrato de la
feature 7. El ciclo rojo/verde documentado y verificado:

- **ROJO (antes de implementar, evidenciado en `impl_18` §2):**
  `SyntaxError: The requested module '../src/domain/repositories/posts-repository.ts' does not provide an export named 'PostsRepository'`
  → 0 pass / 1 fail en el test del contrato; suite completa 113 pass / 10 fail.
- **VERDE (después de implementar, verificado por mí en disco):**
  `node --test tests/posts-repository.test.mjs` → **8/8 pass / 0 fail** (ejecutado
  en esta revisión; salida completa TAP con los 8 `ok`).
  Suite completa `pnpm test` → **130 tests, 121 pass, 9 fail** — los 9 fallos son
  **todos** de features ajenas (ver §4), ninguno del contrato REQ-07/REQ-18.

## 2. Cobertura REQ-18-01..06 (evidencia verificada en disco)

| REQ | Requisito | Evidencia | Resultado |
|---|---|---|---|
| REQ-18-01 | Entidad `Post` con 8 campos `readonly` en `post.ts`, no vacía | `src/domain/entities/post.ts` (14 líneas): `interface Post` con `readonly title author img readtime description tags created updated`. Test REQ-07-01 `ok` | ✔ |
| REQ-18-02 | `PostsRepository` con loader inyectable; default envuelve `getCollection` de `astro:content` | `posts-repository.ts:16-34`: `class PostsRepository` con `constructor(loadEntries = loadArchitectureEntries)`; `loadArchitectureEntries` (líneas 36-39) hace dynamic import de `astro:content` y llama `getCollection('architecture')`. Tests REQ-07-02 (entrega `Post[]` fiel + inspección del default) `ok` | ✔ |
| REQ-18-03 | Artículo que no cumple el esquema → `PostsDataError` | Validación campo a campo (`parsePost`/`asData`/`expectString`/`expectNumber`/`expectTags`, líneas 41-91). Tests REQ-07-03 ×3 (campo ausente, tipo incorrecto, `data` no objeto) `ok` | ✔ |
| REQ-18-04 | Lectura de la colección fallida → `PostsDataError` | `getPosts()` envuelve el loader en try/catch y lanza `PostsDataError` (líneas 23-31). Test REQ-07-03 (4º caso) `ok` | ✔ |
| REQ-18-05 | `PostsRepository` exportada; `markdownPostRepository` eliminada | `grep -rn markdownPostRepository src/domain/` → **0 ocurrencias** (verificado en esta revisión; los 4 matches residuales están en `latest-articles.astro` y `src/pages/posts/[id].astro`, consumidores fuera del dominio → alcances f. 20 y hallazgo del líder). El error de build `[MISSING_EXPORT]` (ver §6) confirma que el export ya no existe | ✔ |
| REQ-18-06 | Entidad y repositorio ≤ 100 líneas | `wc -l`: `post.ts` = 14, `posts-repository.ts` = 90 (ambos ≤ 100). Test REQ-07-05 `ok` | ✔ |

**Dependencias:** `depends_on: []` en `feature_list.json` — vacío, satisfecho trivialmente.

## 3. Archivos tocados vs alcance permitido

Confirmado con `git status --short` y `git diff` (solo los dos archivos de dominio
tienen cambios de implementación en `src/`):

| Archivo | Estado | ¿Dentro de alcance? |
|---|---|---|
| `src/domain/entities/post.ts` | restaurado (14 líneas; HEAD tenía el blob vacío `e69de29`) | ✔ sí (REQ-18-01) |
| `src/domain/repositories/posts-repository.ts` | restaurado (90 líneas; HEAD tenía `markdownPostRepository` + interfaz comentada) | ✔ sí (REQ-18-02..05) |
| `feature_list.json` | f. 18 `pending` → `in_progress` | ✔ sí (estado del arnés) |
| `progress/current.md`, `progress/impl_18_posts-domain-restore.md` | documentación de sesión | ✔ sí (bitácora) |
| `src/components/latest-articles.astro` | **NO tocado** (ni siquiera aparece modificado en el working tree; su estado roto es del commit manual del usuario) | ✔ |
| Repositorios JSON `?raw` (`hero-profile/cards`) | **NO tocados** | ✔ (f. 19) |
| `astro.config.mjs`, `package.json` (SSR/adapter) | **NO tocados** | ✔ (f. 21) |
| Docs del kit (`docs/architecture.md`, `docs/conventions.md`, `scripts/validate-*.mjs` con fugas og-image) | **NO tocados por esta feature** (los `M` en git status son de la sesión de verificación del harness/spec_author, anteriores y ya canalizados en f. 23) | ✔ |
| `src/components/htb-stadistics.astro` | **NO tocado** | ✔ (f. 22) |
| `src/styles/tokens.css` | **NO tocado** | ✔ |
| Feature 17 `article-card-images` | status intacto (`in_progress`) | ✔ (decisión documentada) |

No hay archivos fuera de alcance tocados por la feature 18.

## 4. Conformidad con `docs/architecture.md` y `docs/conventions.md`

- **Regla 2 (sin dependencias externas):** solo `astro:content` (módulo virtual del framework, patrón canónico `ae2597b`) y `node:` implícito; sin dependencias nuevas. ✔
- **Regla 3 / convención de errores:** `PostsDataError` (clase PascalCase + sufijo `Error`, mensajes en español, nunca fallo silencioso). ✔
- **Regla 4 (inmutabilidad):** campos `readonly` en la entidad; `loadEntries` `readonly`. ✔
- **Regla 8 (lógica fuera de UI):** toda la lógica en `src/domain/`; ningún archivo de UI tocado. ✔
- **Regla 12 (≤100 líneas):** 14 / 90. ✔
- **Convenciones de nombres:** `Post`/`PostsRepository`/`PostsDataError` PascalCase, helpers camelCase verbo-primero (`parsePost`, `expectString`…), ruta `entities/` y `repositories/` conforme a capas. ✔
- **Datos vía repositorio / capas:** el repositorio es la única vía de acceso; entrega entidades tipadas. ✔

## 5. Checkpoints (`CHECKPOINTS.md`)

- C1 (repositorios validan y lanzan errores nombrados `*Error`): [x]
- C2 (ningún archivo de la feature supera 100 líneas): [x]
- C3 (`./init.sh` termina en verde): [ ] ← Razón: **2 comprobaciones rojas, ambas por piezas fuera del alcance de esta feature**: (a) 9 tests residuales — todos de features 19 (`hero-*-repository` crash `?raw`), 20 (`REQ-10-01` ×2, `REQ-17-01/06/07`), 21 (`REQ-11-05`) y 23 (`REQ-01-05`); (b) build roto por `src/pages/posts/[id].astro` que importa `markdownPostRepository` (ver §6). El contrato de la feature 18 (8/8) está verde.
- C4 (`feature_list.json` con la tarea en `done`): [ ] ← Razón: la feature 18 queda `in_progress`; el cierre a `done` es decisión del líder tras esta revisión (flujo normal del arnés).
- C5 (sin dependencias externas nuevas): [x]

## 6. Observaciones (fuera del veredicto)

1. **Build roto por `src/pages/posts/[id].astro` — confirmado.** El build falla con
   `[MISSING_EXPORT] "markdownPostRepository" is not exported by "src/domain/repositories/posts-repository.ts"` en `src/pages/posts/[id].astro:3:10` (verificado ejecutando `pnpm build`). La página existe trackeada (commit manual del usuario `72e5c52` "push", 2026-08-11) e importa la API que REQ-18-05 ordena eliminar. Es consecuencia **correcta** de la feature (el export desaparece), no un defecto de la implementación: adaptarla o eliminarla excede el acceptance de la 18 (solo dominio) y su destino ya está canalizado por el líder (spec_author debe cubrir la ruta, probablemente con las features 20/24). **No bloqueo por esto** — el implementer hizo lo correcto al no tocarla y documentarla.
2. El research `refactor-post-manual.md` (D4) afirmaba "no hay `src/pages/posts/`": incorrecto — la página sí existe. El líder ya lo tiene registrado en `progress/current.md` como pendiente del spec_author.
3. Los 4 matches de `markdownPostRepository` en `src/` viven en consumidores (`latest-articles.astro`, `[id].astro`), no en el dominio; su resolución es de las features 20 y del hallazgo citado.
4. `posts-repository.ts` no termina en salto de línea (`git diff` avisa "No newline at end of file"); sin impacto funcional ni de contrato (test REQ-07-05 pasa), queda como nota de estilo menor.
5. El test negativo REQ-18-05 no está cubierto por el contrato de tests (ausencia de `markdownPostRepository` verificada por grep/inspección); el error de build `[MISSING_EXPORT]` lo corrobora de forma independiente.

## 7. Conclusión

La feature 18 restaura el contrato REQ-18-01..06 íntegramente: entidad `Post` con 8
campos readonly (14 líneas), clase `PostsRepository` con loader inyectable cuyo
default envuelve `astro:content`/`getCollection('architecture')`, validación campo a
campo con `PostsDataError`, mapeo a `Post[]`, función `markdownPostRepository`
eliminada, límite de 100 líneas respetado, sin dependencias externas y sin tocar
archivos fuera de alcance. Test del contrato 8/8 en verde. Los rojos de
`./init.sh` son exclusivamente ajenos (features 19/20/21/23 + página del usuario
`[id].astro`, canalizada aparte).

**Veredicto: APPROVED** — el cierre a `done` y la canalización de
`src/pages/posts/[id].astro` quedan a decisión del líder.