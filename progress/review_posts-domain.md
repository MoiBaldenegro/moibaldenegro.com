# Review — feature 7 posts-domain

**Veredicto:** APPROVED

## Verificación por puntos

### Espec y alcance
- `specs/07_posts-domain/` contiene SOLO `requirements.md` (REQ-07-01..05) — correcto: la feature no toca UI, no procede `design.md`. Verificado por glob.
- Los 5 acceptance de la feature 7 en `feature_list.json` trazan 1:1 con las REQ: acceptance 1→REQ-07-01, 2→REQ-07-02, 3→REQ-07-03, 4→REQ-07-05. (REQ-07-04 no tiene acceptance testeable en la feature; la spec la materializa en la feature 10, ver Observaciones.)

### REQ-07-01 — entidad Post (8 campos)
- `src/domain/entities/post.ts` (15 líneas): `interface Post` con `readonly title/author/img/readtime/description/tags/created/updated`. Coincide 1:1 con el schema Zod de `src/content.config.ts` (líneas 10-26) y con el frontmatter real de `src/content/architecture/00-agilismo.md` (title, author, img, readtime, description, tags string→transform a arreglo, created, updated). Inmutable por `readonly` (arquitectura §4). ✔
- `src/content.config.ts` NO aparece en `git status` ni en diff → no modificado (feature previa). ✔

### REQ-07-02 — repositorio entrega Post[]
- `tests/posts-repository.test.mjs` re-ejecutado por mí: el test inyecta el loader con la entrada real de 00-agilismo.md (tags ya transformados por el schema: `['arquitectura','agilismo','software-design']`) y `getPosts()` devuelve `Post[]` con `deepEqual` al esperado. La colección tiene ≥1 artículo real (00-agilismo.md). ✔
- El default `loadArchitectureEntries()` envuelve `getCollection('architecture')` de `astro:content` vía import dinámico (solo se ejecuta en build Astro); el test lo verifica por inspección (regex `astro:content`, `getCollection`, `architecture`). El import dinámico evita romper `node --test` con el módulo virtual — decisión coherente con el patrón de inyección de los repositorios de las features 5/6 y documentada en el propio test. ✔

### REQ-07-03 — PostsDataError
- `PostsDataError` es clase nombrada que extiende `Error` con `this.name = 'PostsDataError'` y mensajes en español (`architecture: el artículo N tiene un campo "X" que debe ser texto`, etc.) — cumple convenciones (`*Error`, español) y arquitectura §3 (errores explícitos, sin fallos silenciosos). El test cubre 4 casos: campo faltante, tipo incorrecto (readtime string), entrada sin `data` de objeto, y loader que falla → todos `assert.rejects(..., PostsDataError)`. ✔

### REQ-07-05 — ≤100 líneas
- `post.ts`: 15 líneas; `posts-repository.ts`: 91 líneas. Ambos ≤100 (verificado por mí y por el test REQ-07-05). ✔

### Arquitectura y convenciones
- Capas correctas: `src/domain/entities/post.ts` + `src/domain/repositories/posts-repository.ts`. ✔
- Sin dependencias nuevas (astro ya es dependencia). ✔
- Validación en el dominio, no en UI; UI no tocada (`latest-articles.astro` sin cambios en git status). ✔
- Nombres PascalCase (clases), kebab-case (archivos), errores `*Error`. ✔

### Ciclo rojo/verde (pregunta de revisión)
- ¿Test antes del código y en rojo? SÍ — evidencia en `progress/impl_posts-domain.md` y bitácora de `progress/current.md`: `node --test tests/posts-repository.test.mjs` → `ERR_MODULE_NOT_FOUND` (posts-repository.ts inexistente), 0 pass / 1 fail, con el test ya escrito y el repositorio ausente. Evidencia coherente con el disco (el test importa `../src/domain/repositories/posts-repository.ts`).
- ¿Suite verde al final? SÍ — re-ejecutado por mí: `node --test "tests/**/*.test.mjs"` → 47/47 pass / 0 fail.

### Verificación ejecutada por el reviewer (todas en verde)
- `node --test "tests/**/*.test.mjs"` → # tests 47, # pass 47, # fail 0 ✔
- `node scripts/check-format.mjs` → FORMATO ✔ ✔
- `pnpm build` → 1 page(s) built, Complete ✔
- `bash ./init.sh` → "El entorno está perfecto" ✔

## Checkpoints
- Arquitectura
  - C1 estilos separados de la UI: [x] — la feature no toca UI; no introduce estilos.
  - C2 sin lógica en UI: [x] — validación en el dominio; UI no modificada.
  - C3 ningún componente lee JSON/datos directamente: [x] — la feature no introduce accesos directos; `latest-articles.astro` sigue con `getCollection` por diseño de la spec (deuda planificada de la feature 10, ver Observaciones).
  - C4 tokens: [x] — no aplica (sin cambios de estilos).
  - C5 ≤100 líneas: [x] — post.ts 15, posts-repository.ts 91.
  - C6 sin dependencias externas: [x] — solo `astro:content` (ya existente).
- Datos
  - C7 datos del dominio válidos y tipados: [x] — Post tipa la colección architecture; schema no tocado.
  - C8 repositorios validan y lanzan errores nombrados: [x] — PostsDataError en 4 rutas de fallo.
- Verificación
  - C9 `./init.sh` verde: [x] — verificado por mí (tests 100%, formato, build).
  - C10 UI correcta desktop/móvil: [ ] — no aplicable a esta feature (no toca UI); se verifica en features de UI (9/10).
- Harness
  - C11 feature_list.json en done: [ ] — sigue `in_progress` hasta el cierre post-aprobación (el líder/implementer la marca `done`); la feature 7 es la única en curso.
  - C12 current.md documenta la sesión: [x] — bitácora con ROJO/VERDE completa; history se actualiza al cierre.
  - C13 sin temporales/debug/TODOs: [x] — no se detectaron.

## Observaciones (no bloqueantes)
1. **Sesión concurrente / restos ajenos**: `git status` muestra modificaciones sin commitear de features previas (1-6): `package.json`, `tests/harness-kit-integrity.test.mjs`, `src/components/hero-card.astro`, `src/components/new-hero/new-hero.astro`, `src/styles/hero.css` (eliminado), además de los artefactos untracked de features 1-6 (specs/, progress/, src/data/, src/domain/). Ninguno pertenece a la feature 7 ni la contamina; se documentan como observación, no como bloqueo.
2. **REQ-07-04** (repositorio como única vía de acceso para la UI): implementada como única vía del dominio (el default del repositorio es el único punto que envuelve `astro:content`), pero `latest-articles.astro` aún llama a `getCollection` directamente — pendiente planificado y declarado en la spec de la feature 7 y en la acceptance de la feature 10 ("latest-articles.astro importa PostsRepository y no importa astro:content"). No bloquea esta feature.
3. El import dinámico de `astro:content` es una decisión pragmática necesaria para el ciclo node:test; verificable en build Astro real (el default solo se ejecuta en runtime Astro). El `pnpm build` en verde confirma que el módulo resuelve en el build.

## Cambios requeridos
Ninguno.

## Conclusión
La feature 7 cumple REQ-07-01..05 con evidencia rojo/verde real y coherente con el disco: test escrito primero (ROJO `ERR_MODULE_NOT_FOUND`, 0/1), implementación dentro de capas y convenciones (entidad inmutable, repositorio con error nombrado en español, ≤100 líneas, sin dependencias nuevas), y suite completa en verde (47/47) re-ejecutada por el reviewer junto a check-format, build e `./init.sh`. Sin cambios requeridos.
