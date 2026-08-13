# Informe de implementación — feature 18 `posts-domain-restore`

**Implementer:** agente implementador · **Fecha:** 2026-08-12
**Feature:** 18 — Restaurar el dominio de artículos: entidad Post y clase PostsRepository
**Spec:** `specs/18_posts-domain-restore/requirements.md` (REQ-18-01..06, contrato `specs/07_posts-domain/` REQ-07-01..05)
**Estado:** `in_progress` (cierre a decisión del líder tras reviewer)

---

## 1. Qué estaba roto (diagnóstico verificado en disco)

- `src/domain/entities/post.ts` — **VACÍO** (0 líneas). REQ-07-01 exige
  `interface Post` con los 8 campos `readonly`.
- `src/domain/repositories/posts-repository.ts` — reescrito como función
  `markdownPostRepository()` que devuelve las entradas **crudas** de
  `getCollection('architecture')` sin validar ni mapear. No exporta la clase
  `PostsRepository` → el contrato `tests/posts-repository.test.mjs` crashea al
  importar.
- Estado canónico recuperado de git (`ae2597b`): entidad + clase
  `PostsRepository` con loader inyectable y helpers
  `parsePost`/`asData`/`expectString`/`expectNumber`/`expectTags`. Utilizado
  como referencia (la spec vigente de la feature 18 coincide con ese contrato).

## 2. Ciclo ROJO (evidencia antes de implementar)

Test del contrato con el estado roto:

```
> node --test tests/posts-repository.test.mjs
TAP version 13
# file:///C:/Users/Moises/Desktop/moibaldenegro.com/tests/posts-repository.test.mjs:22
#   PostsRepository,
#   ^^^^^^^^^^^^^^^
# SyntaxError: The requested module '../src/domain/repositories/posts-repository.ts' does not provide an export named 'PostsRepository'
...
# tests 1
# pass 0
# fail 1
```

Suite completa antes (línea base, coincide con el veredicto del líder):

```
# tests 123
# pass 113
# fail 10
```

## 3. Implementación

Restaurados desde el estado canónico `ae2597b` (adaptado a la spec 18, que
coincide con REQ-07-01..05):

- `src/domain/entities/post.ts` (15 líneas): `interface Post` con los 8 campos
  `readonly` (`title author img readtime description tags created updated`).
- `src/domain/repositories/posts-repository.ts` (90 líneas):
  - `export class PostsDataError extends Error` (nombre `PostsDataError`,
    mensajes en español).
  - `export class PostsRepository` con constructor que acepta un loader
    inyectable `() => Promise<unknown[]>`, cuyo default
    `loadArchitectureEntries` hace dynamic import de `astro:content` y llama
    `getCollection('architecture')` (REQ-18-02).
  - `getPosts(): Promise<Post[]>`: si la lectura falla → `PostsDataError`
    (REQ-18-04); mapea cada entrada con `parsePost` validando campo a campo y
    lanzando `PostsDataError` ante entradas inválidas (REQ-18-03).
  - **Eliminada** la función `markdownPostRepository` (REQ-18-05) — verificado
    con `grep`: 0 ocurrencias.
- Ambos archivos ≤ 100 líneas (REQ-18-06): entidad 15, repositorio 90.

## 4. Ciclo VERDE (evidencia después de implementar)

Test del contrato:

```
> node --test tests/posts-repository.test.mjs
# tests 8
# pass 8
# fail 0
# duration_ms 92.9508
```

Cobertura de los 8 subtests (todos `ok`): REQ-07-01 (entidad tipa con campos
readonly), REQ-07-02 ×2 (entrega `Post[]` fiel al artículo real; default
envuelve `astro:content`/`getCollection`/`architecture`), REQ-07-03 ×4 (campo
ausente, campo de tipo incorrecto, entrada sin `data` de objeto, fallo de
lectura → `PostsDataError`), REQ-07-05 (≤100 líneas).

Suite completa después:

```
# tests 130
# pass 121
# fail 9
```

Los 9 fallos residuales pertenecen **exclusivamente** a features ajenas
(mismo conjunto esperado por el líder, 19/20/21/23):

| Fallo residual | Feature responsable | Causa (documentada en research) |
|---|---|---|
| `tests\hero-cards-repository.test.mjs` (crash) | 19 `json-repositories-restore` | imports `?raw` sin `with { type: 'json' }` → `ERR_IMPORT_ATTRIBUTE_MISSING` |
| `tests\hero-profile-repository.test.mjs` (crash) | 19 | idem |
| REQ-10-01 ×2 | 20 `latest-articles-restore` | componente consume `post.data.*` crudo, no la entidad |
| REQ-17-01 / 06 / 07 | 20 | `<img>` sin clase `latest-articles__image`, sin `alt={post.title}`, sin `loading="lazy"` |
| REQ-11-05 | 21 `ssr-cloudflare-align` | busca `dist/about/index.html`; el adapter emite `dist/client/about/index.html` |
| REQ-01-05 | 23 `harness-docs-alignment` | tokens prohibidos (`og-image`, `hero`) en docs del kit |

## 5. Cobertura REQ-18-XX

| REQ | Cómo se cumple | Evidencia |
|---|---|---|
| REQ-18-01 | `interface Post` con 8 campos `readonly` en `post.ts` (15 líneas) | test REQ-07-01 `ok` |
| REQ-18-02 | `PostsRepository` con constructor de loader inyectable; default = dynamic import `astro:content` + `getCollection('architecture')` | test REQ-07-02 (ambos) `ok`; inspección del archivo |
| REQ-18-03 | Artículo que no cumple el esquema → `PostsDataError` (validación campo a campo) | tests REQ-07-03 (3 casos) `ok` |
| REQ-18-04 | Lectura fallida de la colección → `PostsDataError` | test REQ-07-03 (4º caso) `ok` |
| REQ-18-05 | `PostsRepository` exportada; `markdownPostRepository` eliminada | `grep -c markdownPostRepository` = 0 |
| REQ-18-06 | Entidad 15 líneas, repositorio 90 líneas (≤100) | test REQ-07-05 `ok` |

## 6. Archivos tocados

- `src/domain/entities/post.ts` — restaurada (15 líneas).
- `src/domain/repositories/posts-repository.ts` — restaurado (90 líneas).
- `feature_list.json` — feature 18: `pending` → `in_progress`.
- `progress/current.md` — plan y ejecución de la sesión + nota de continuidad
  de la feature 17.
- `progress/impl_18_posts-domain-restore.md` — este informe.

NO se tocaron: `latest-articles.astro` (f. 20), repositorios JSON `?raw`
(f. 19), configuración SSR/Cloudflare (f. 21), docs del kit (f. 23),
`htb-stadistics.astro` (f. 22), `tokens.css`, feature 17 (sigue
`in_progress`).

## 7. Verificación final

| Comando | Resultado |
|---|---|
| `node --test tests/posts-repository.test.mjs` | ✔ 8/8 pass |
| `pnpm test` | ✔ 121 pass / 9 fail — residuales SOLO de features 19/20/21/23 (tabla arriba) |
| `node scripts/check-format.mjs` (vía init.sh) | ✔ formato de `feature_list.json` y `progress/current.md` |
| `./init.sh` | ✔ formato · ✘ tests (9 residuales ajenos) · ✘ build (ver hallazgo) |
| `git status --short` | diff de feature limitado a los 2 archivos de dominio + estado del arnés |

### Hallazgo que requiere decisión del líder — `src/pages/posts/[id].astro`

El build falla con:

```
[MISSING_EXPORT] "markdownPostRepository" is not exported by "src/domain/repositories/posts-repository.ts".
   ╭─[ src/pages/posts/[id].astro:3:10 ]
```

Causa raíz: `src/pages/posts/[id].astro` **existe** (trackeado, creado en el
commit manual del usuario `72e5c52` "push", 2026-08-11 17:49, cadena de
deploys) e importa `markdownPostRepository` — la API que REQ-18-05 ordena
eliminar. El research `refactor-post-manual.md` (D4) afirmaba "no hay
`src/pages/posts/`": esa afirmación era **incorrecta** (el spec_author no
detectó la página); la feature 20 asume el enlace `/posts/${post.id}` como
"ruta inexistente (404)".

**No la toqué**: adaptarla o eliminarla excede el acceptance de la feature 18
(solo dominio) y decide una ruta sin spec ni feature en backlog. Queda para el
líder: canalizar la página (¿con la feature 20/24, que ya menciona los pares
`transition:name` `img-${post.id}`/`title-${post.id}`?) o decidir su limpieza.
Con `markdownPostRepository` restaurada el build pasaba; con la eliminación
correcta (REQ-18-05) el build queda en rojo hasta resolver la página — por
eso `pnpm build` no se usa como verificación de esta feature (instrucción
explícita del líder: documentar builds que fallen por piezas fuera de
alcance).

## 8. Riesgos / notas

- La feature 20 podrá cerrar la 17: sus tests REQ-17-01/06/07 seguirán rojos
  hasta restaurar `latest-articles.astro` (f. 20, depende de esta 18).
- El contrato de tests no exige que el test negativo verifique la ausencia de
  `markdownPostRepository`; la eliminación se verificó por inspección/grep
  (REQ-18-05).
- Sin dependencias externas nuevas; patrón idéntico al estado canónico
  aprobado en su día (`ae2597b`).