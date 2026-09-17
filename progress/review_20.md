# Review — feature 20

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en `src/styles/*.css`, ningún `.astro` con `<style>`): [x]
- C2 (sin lógica JS en UI; frontmatter solo importa/pasa datos): [x]
- C3 (ningún componente lee JSON directo; todo vía `src/domain/repositories`): [x] ← `posts/[id].astro` no se toca; `related` solo se entrega vía `PostsRepository` (`src/domain/repositories/posts-repository.ts:53,86-91`)
- C4 (tokens, sin hardcodeo): [x] ← sin CSS tocado en la feature
- C5 (≤100 líneas): [x] ← `post.ts` 26, `posts-repository.ts` 98, `content.config.ts` 32 (REQ-20-07 verificado por test propio + re-verificado en disco)
- C6 (sin dependencias externas): [x] ← `git status` no muestra `package.json` ni `docs/dependencies.md`
- C7 (`src/data`/`src/content` válido y tipado por entidad): [x] ← esquema `related: z.array(z.string()).optional()` (`src/content.config.ts:28`), entidad `readonly related: readonly string[] | null` (`src/domain/entities/post.ts:25`), `03-principios_solid.md:11` declara `related: [/posts/00-agilismo, /posts/01-diseño-detallado]`
- C8 (repositorios validan y lanzan errores nombrados, sin fallos silenciosos): [x] ← `expectRelated` lanza `PostsDataError` con mensaje en español (`posts-repository.ts:89`); `[]`, no-arreglo e items no-`/posts/<id>` rechazan según D3 de `progress/research/recommended-list.md` y REQ-20-05
- C9 (`./init.sh` verde): [x] ← ejecutado por el reviewer: entorno ✔, formato ✔, tests ✔, build ✔
- C10 (desktop/móvil sin errores consola): [ ] ← Razón: sin UI en esta feature (capa de datos, sin `design.md`); no aplica inspección visual, igual que `CHECKPOINTS.md`
- C11 (`feature_list.json` en `done`, ninguna a medias): [ ] ← Razón: feature 20 en `in_progress`; el líder la pasa a `done` tras este APPROVED (no es fallo del implementer)
- C12 (`progress/current.md` documenta, `history.md` al día): [x]
- C13 (sin temporales/debug/TODOs): [x]

## Pregunta de revisión
- ¿Test antes del código, en rojo, y suite verde al final? **Sí.** `progress/impl_20.md` documenta rojo previo (`tests/related-posts-data.test.mjs`: 6 fail / 1 pass, con REQ-20-07 pasando pre-cambio por ser constraint ya cumplido — explicación creíble y verificable) y verde posterior (7/7 + `./init.sh` verde + `pnpm test` 480/480). El reviewer re-ejecutó `./init.sh` en verde.
- ¿Dependencias todas en `done`? **Sí.** `depends_on: [18]` y la feature 18 (`next-post-data`) está en `done` en `feature_list.json`.

## Notas (no bloqueantes)
1. `expectRelated` exige arreglo no vacío (`value.length === 0` → `PostsDataError`). Es más estricto que el literal de REQ-20-05 pero coincide con D3 del research (`recomendado = arreglo no vacío`) y está cubierto por el test REQ-20-05 (`[]` en la lista de inválidos). Contrato coherente.
2. La compactación de `posts-repository.ts` (cabecera, `getPosts`, `asData`, `loadArchitectureEntries`, `expectTags`) es solo formato: `asData` refactorizado preserva el mismo mensaje de error y los mismos casos de rechazo; `expectNext` intacto. Ningún test existente de contrato cambia (solo el fixture `EXPECTED_POST` gana `related: null` con justificación REQ-43-06 en el encabezado de `tests/posts-repository.test.mjs:25-29`).
3. `specs/21_related-posts-list/` sin seguimiento en `git status` es artefacto del `spec_author` para la feature 21 (pendiente), no scope-creep del implementer.

## Cambios requeridos (si aplica)
Ninguno.
