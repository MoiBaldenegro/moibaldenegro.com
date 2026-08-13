# Review — feature 19 `json-repositories-restore`

**Fecha:** 2026-08-12 · **Reviewer:** agente revisor (nivel 1)
**Feature:** 19 «Restaurar HeroProfileRepository y HeroCardsRepository a lectura fs con URL inyectable»
**Spec:** `specs/19_json-repositories-restore/requirements.md` (REQ-19-01..06, contrato `specs/05_hero-profile-domain/` REQ-05-03/04 y `specs/06_hero-cards-domain/` REQ-06-03/05)
**Informe del implementer:** `progress/impl_19_json-repositories-restore.md`
**Veredicto:** APPROVED

---

## 1. Pregunta de revisión (test-first, rojo → verde)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?**

Sí, para el contrato de esta feature. Es una **restauración**: los tests
(`tests/hero-profile-repository.test.mjs` REQ-05-01..05 y
`tests/hero-cards-repository.test.mjs` REQ-06-01..06) ya existían como contrato de
las features 5/6 y eran el primer paso del ciclo. Evidencia en `impl_19` §2
(«Ciclo rojo/verde») y verificada por mí en disco:

- **ROJO (antes de implementar, capturado en `impl_19`):**
  `node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs`
  → **0 pass / 2 fail**, `TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module
  ".../src/data/hero.json?raw" needs an import attribute of "type: json"` (Node v22).
  Es el crash causado por la migración manual a `?raw` sin `with { type: 'json' }`.
- **VERDE (después de implementar, verificado por mí en disco):**
  `node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs`
  → **16/16 pass / 0 fail** (`# tests 16`, `# pass 16`, `# fail 0` — ejecutado en
  esta revisión; salida TAP completa con los 16 `ok`).
  Suite completa `pnpm test` → **144 tests, 137 pass, 7 fail** — los 7 fallos son
  **todos** de features ajenas (ver §4), ninguno del contrato REQ-05/REQ-06/REQ-19.

## 2. Cobertura REQ-19-01..06 (evidencia verificada en disco)

| REQ | Requisito | Evidencia | Resultado |
|---|---|---|---|
| REQ-19-01 | `HeroProfileRepository` entrega `HeroProfile` leyendo `src/data/hero.json`; constructor acepta URL inyectable cuyo default resuelve al archivo del proyecto | `hero-profile-repository.ts:14` `DEFAULT_DATA_URL = pathToFileURL(join(process.cwd(), 'src', 'data', 'hero.json'))`; línea 26 `constructor(dataUrl: URL = DEFAULT_DATA_URL)`; línea 30 `getProfile()` retorna `parseHeroProfile(this.readJson())`. Test REQ-05-03 (`new HeroProfileRepository()` entrega el perfil real) `ok` | ✔ |
| REQ-19-02 | Archivo ausente o malformado → `HeroProfileDataError` | `readJson()`: catch de `readFileSync` → `HeroProfileDataError` (líneas 38-42) y catch de `JSON.parse` → `HeroProfileDataError` (líneas 45-47); validación de forma (`asRecord`/`expectString`/`expectBoolean`, líneas 51-84) también lanza `HeroProfileDataError`. Tests REQ-05-04 ×3 (ausente / JSON inválido / forma inválida) `ok` | ✔ |
| REQ-19-03 | `HeroCardsRepository` entrega las tarjetas leyendo `src/data/hero-cards.json`; constructor acepta URL inyectable cuyo default resuelve al archivo | `hero-cards-repository.ts:14` `DEFAULT_DATA_URL = pathToFileURL(join(process.cwd(), 'src', 'data', 'hero-cards.json'))`; línea 26 `constructor(dataUrl: URL = DEFAULT_DATA_URL)`; línea 30 `getCards()`. Test REQ-06-03 (`new HeroCardsRepository()` entrega las 12 tarjetas) `ok` | ✔ |
| REQ-19-04 | Archivo ausente o malformado → `HeroCardsDataError` | `readJson()`: catch de `readFileSync` → `HeroCardsDataError` (líneas 38-42) y catch de `JSON.parse` (líneas 45-47); validación de forma/tarjetas (`asCard`/`expectString`/`expectNumber`, líneas 51-94) también lanza `HeroCardsDataError`. Tests REQ-06-05 ×4 (ausente / JSON inválido / forma inválida / tarjeta inválida) `ok` | ✔ |
| REQ-19-05 | Lectura con `node:fs`; imports `?raw` eliminados | Ambos repos importan `readFileSync` de `node:fs`, `join` de `node:path` y `pathToFileURL` de `node:url`; `grep '\?raw' src/` → **0 ocurrencias** (verificado en esta revisión) | ✔ |
| REQ-19-06 | ≤100 líneas por archivo de repositorio | `wc -l`: `hero-profile-repository.ts` = 83, `hero-cards-repository.ts` = 93 (ambos ≤ 100). Tests REQ-05-05 y REQ-06-06 `ok` | ✔ |

Nota de **firma de contrato**: el diff vs HEAD muestra el cambio de
`constructor(rawData: string = rawJsonData)` (string incrustado, migración manual)
a `constructor(dataUrl: URL = DEFAULT_DATA_URL)` (URL inyectable, patrón original),
que es exactamente lo que los tests inyectan (`new HeroProfileRepository(fileUrl)` /
`new HeroCardsRepository(fileUrl)`) y exige `new HeroProfileRepository()` sin
argumentos (§ diffs de `?raw` / de `ae2597b`).

**Dependencias:** `depends_on: []` en `feature_list.json` — vacío, satisfecho
trivialmente; la feature no saltó ninguna dependencia pendiente.

## 3. Archivos tocados vs alcance permitido

Confirmado con `git status --short` y `git diff`:

| Archivo | Estado | ¿Dentro de alcance? |
|---|---|---|
| `src/domain/repositories/hero-profile-repository.ts` | restaurado (83 líneas) desde el estado canónico `ae2597b` (HEAD tenía `?raw` + string incrustado) | ✔ sí (REQ-19-01/02/05/06) |
| `src/domain/repositories/hero-cards-repository.ts` | restaurado (93 líneas) desde `ae2597b` (HEAD tenía `?raw` + string incrustado) | ✔ sí (REQ-19-03/04/05/06) |
| `feature_list.json` | f. 19 `pending` → `in_progress` (respeta la regla de no eliminar features del array; 18-24 del alta de spec_author intactas) | ✔ sí (estado del arnés) |
| `progress/current.md`, `progress/impl_19_json-repositories-restore.md` | documentación de sesión | ✔ sí (bitácora) |
| `src/domain/entities/post.ts`, `src/domain/repositories/posts-repository.ts` | cambios de la feature 18 (ya revisada/APPROVED) | ✔ ajeno a la 19, previos |
| `src/components/`, `src/data/`, `src/styles/`, `astro.config.mjs`, `package.json` | **NO tocados** | ✔ |

`git diff --stat src/ src/data/` confirma que solo los dos repositorios JSON tienen
cambios de esta feature (los otros dos archivos de dominio son de la f. 18). No hay
archivos fuera de alcance tocados por la feature 19.

## 4. Conformidad con `docs/architecture.md` y `docs/conventions.md`

- **Regla 2 (sin dependencias externas):** solo `node:fs`, `node:path` y `node:url`
  (stdlib de Node); sin dependencias nuevas. ✔
- **Regla 3 / convención de errores:** `HeroProfileDataError` y `HeroCardsDataError`
  (clases PascalCase + sufijo `Error`, mensajes en español, nunca fallo silencioso:
  `readJson()` y el parseo lanzan error nombrado). ✔
- **Regla 4 (inmutabilidad):** `private readonly dataUrl: URL`; instancias nuevas
  para cada lectura, sin mutar estado compartido. ✔
- **Regla 8 (lógica separada de la UI):** toda la lógica vive en `src/domain/`;
  ningún archivo de UI tocado. ✔
- **Regla 12 (≤100 líneas):** 83 / 93. ✔
- **Capas (repositorios como única vía de acceso):** los repos leen los JSON vía fs
  y entregan entidades tipadas (`HeroProfile`, `HeroCard`); los consumidores
  (`new-hero.astro`, `about.astro`) usan `new HeroProfileRepository()` /
  `new HeroCardsRepository()` sin argumentos y quedan satisfechos sin cambios. ✔
- **Convenciones de nombres:** errores con sufijo `Error`, funciones helper
  camelCase verbo-primero (`parseHeroProfile`, `expectString`…). ✔

## 5. Checkpoints (`CHECKPOINTS.md`)

- C1 (repositorios validan y lanzan errores nombrados `*Error` sin fallos silenciosos): [x]
- C2 (ningún archivo de la feature supera las 100 líneas): [x]
- C3 (`./init.sh` termina en verde): [ ] ← Razón: **2 comprobaciones rojas, ambas por piezas fuera del alcance de esta feature**: (a) 7 tests residuales — todos de las features 20 (`REQ-10-01` ×2, `REQ-17-01/06/07`), 21 (`REQ-11-05`) y 23 (`REQ-01-05`); (b) build roto por `src/pages/posts/[id].astro:3` que importa `markdownPostRepository` (ver §6, hallazgo canalizado por el líder — fuera del alcance del veredicto). El contrato de la feature 19 (16/16) está verde y el `?raw` causante del crash ya no existe.
- C4 (`feature_list.json` con la tarea en `done`): [ ] ← Razón: la feature 19 queda `in_progress`; el cierre a `done` es decisión del líder tras esta revisión (flujo normal del arnés).
- C5 (sin dependencias externas nuevas): [x]

## 6. Observaciones (fuera del veredicto)

1. **Build roto por `src/pages/posts/[id].astro` — confirmado.** El build falla con
   `[MISSING_EXPORT] "markdownPostRepository" is not exported by
   "src/domain/repositories/posts-repository.ts"` en `src/pages/posts/[id].astro:3:10`
   (verificado ejecutando `pnpm build`). La página fue creada por el usuario (commit
   manual `72e5c52`) e importa la API que elimina la feature 18 (ya APPROVED). Es la
   pieza fuera de alcance que el líder ya canalizó como hallazgo aparte; los imports
   `node:fs`/`node:path`/`node:url` de los repos restaurados aparecen en el grafo del
   build pero **no** son causa del fallo. **No bloqueo por esto** (instrucción del líder).
2. Ambos repos restaurados difieren del estado canónico `ae2597b` **solo** en un salto
   de línea final adicional (el canónico no termina en newline); sin impacto funcional
   ni de contrato, nota de estilo menor.
3. **Nota de alcance (coincide con el research D2):** `index.astro`/`about.astro` son
   prerender, así que `node:fs` se ejecuta solo en build (entorno Node), no en el
   worker. Si una ruta servida en runtime llegara a usar estos repositorios, sería otra
   feature (riesgo: Workers sin `node:fs`); documentado en `impl_19`.
4. La firma `URL` inyectable restaurada es coherente con el contrato de tests (URLs de
   archivos temporales vía `pathToFileURL`) — se descartó la alternativa
   `with { type: 'json' }`, que mantendría la divergencia de firma. Decisión sólida.

## 7. Conclusión

La feature 19 restaura íntegramente el contrato REQ-19-01..06: ambos repositorios
JSON leen con `node:fs` (`readFileSync`), constructor con URL inyectable cuyo default
resuelve al archivo real (`pathToFileURL(join(process.cwd(), 'src', 'data', ...))`),
validación que lanza `HeroProfileDataError`/`HeroCardsDataError`, sin `?raw` (grep 0
ocurrencias) y dentro del límite de 100 líneas (83/93). Test del contrato **16/16 en
verde** (verificado en esta revisión); el ciclo rojo/verde está evidenciado y la suite
completa queda en 137 pass / 7 fail con residuales SOLO de las features 20/21/23. Sin
dependencias externas y sin tocar archivos fuera de alcance.

**Veredicto: APPROVED** — el cierre a `done` y la canalización de
`src/pages/posts/[id].astro` quedan a decisión del líder.
