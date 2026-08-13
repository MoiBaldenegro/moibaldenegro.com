# Review — feature 31 `json-repositories-loader`

**Veredicto:** APPROVED

Fecha: 2026-08-13 · Reviewer del arnés. Revisión contra
`specs/31_json-repositories-loader/requirements.md`, `docs/architecture.md`,
`docs/conventions.md`, `docs/verification.md`, `CHECKPOINTS.md` e informes de
investigación `progress/research/lectura-json-sin-nodefs.md` y
`progress/research/ciclo-prerender-workerd.md`.

## Comprobaciones con evidencia

### 1. Patrón loader en `src/domain/repositories/` (REQ-31-01, REQ-31-02, REQ-31-03, REQ-31-08)

- `hero-profile-repository.ts` (85 líneas) y `hero-cards-repository.ts`
  (95 líneas), ambos ≤100 (REQ-31-08, verificado por test y por conteo real).
- Patrón canónico del informe de investigación aplicado idéntico en ambos:
  - Import con atributo: `import heroJson from '../../data/hero.json' with { type: 'json' }`
    (línea 10) y `import heroCardsJson from '../../data/hero-cards.json' with { type: 'json' }`
    (línea 10) — ruta correcta `../../data/` desde `src/domain/repositories/`.
  - Contrato `export type HeroProfileJsonLoader = () => string` /
    `HeroCardsJsonLoader` (contenido crudo).
  - Única materialización: `const DEFAULT_RAW = JSON.stringify(heroJson)` (línea 17) /
    `JSON.stringify(heroCardsJson)` (línea 17).
  - Default del constructor: `constructor(load = () => DEFAULT_RAW)`.
  - **Sin parameter properties**: `private readonly load` explícita + asignación
    en el constructor (líneas 27-31) — compatible con strip-only de Node.
  - `JSON.parse` + validación de forma conservados; `readJson()` envuelve
    fallos de loader y de parseo en los errores nombrados.
- **Errores nombrados conservados**: `HeroProfileDataError` (líneas 19-24) y
  `HeroCardsDataError` (líneas 19-24) con `name` explícito; mensajes en
  español conforme a `docs/conventions.md`.
- Errores de forma inválida preservados 1:1 (REQ-05-04/REQ-06-05): perfil no
  objeto, campos no string/boolean; tarjeta no objeto, campos no string/number.
- `git diff` confirma la migración: salen `node:fs`, `node:path`, `node:url` y
  el contrato `dataUrl: URL`; entra el contrato loader.

### 2. `node:` y `?raw` en `src/` (REQ-31-03)

- `grep 'node:' src/` → **1 resultado**: `--color-marca-node: #08783A;` en
  `tokens.css` (línea 42) — token de marca de la marca "Node", no un import de
  módulo (no coincide con `from 'node:`). Ningún `from 'node:` en src/.
- `grep '\?raw' src/` → **0 resultados**.
- Los comentarios de cabecera de los repos evitan la cadena literal prohibida
  ("sufijo de raw", no "?raw") — correcto, no falsean el guard.
- Guardes REQ-31-03 en ambos tests: `doesNotMatch /from['"]node:/` y
  `doesNotMatch /\?raw/` sobre el archivo del repositorio (líneas 94-102 y
  144-152 respectivamente).

### 3. Consumidores sin argumentos (REQ-31-04, REQ-31-05, REQ-11-05)

- `src/pages/about.astro:6` — `new HeroProfileRepository().getProfile()`.
- `src/components/new-hero/new-hero.astro:11-12` —
  `new HeroCardsRepository().getCards()` y `new HeroProfileRepository().getProfile()`.
- `src/pages/index.astro` renderiza `<NewHero/>` (portada) sin instanciar
  repositorios directamente.
- El build real (que incluye los prerender de `/`, `/about` y `/posts/[id]`
  vía `tests/about-page.test.mjs` REQ-11-05) pasa en `./init.sh` — los
  consumidores con el nuevo default del loader funcionan en build.

### 4. Tests al contrato de loader (REQ-31-01..06)

- `tests/hero-profile-repository.test.mjs` (9 tests) y
  `tests/hero-cards-repository.test.mjs` (11 tests):
  - Default real: `new HeroProfileRepository()` entrega el perfil real
    (REQ-31-04) y `new HeroCardsRepository()` las 12 tarjetas reales
    (REQ-31-05) — asserts `deepEqual` contra los datos de disco.
  - Loader inyectable usado de verdad: perfil/tarjeta inyectados que no existen
    en disco → prueba que se lee por el loader, no por filesystem
    (REQ-31-01/02).
  - Tres modos de fallo → error nombrado (REQ-31-06): loader que lanza
    (ausente), `'{ esto no es JSON'` (malformado), objeto con forma mala /
    no-arreglo / tarjeta inválida (forma inválida).
  - **Sin URLs temporales**: cero `mkdtempSync`/`pathToFileURL`/`tmpdir` en
    ambos tests (grep verificado; los únicos usos de `mkdtempSync` están en
    `tests/dependencies-registry.test.mjs`, feature 29, fuera de alcance).
  - `node:fs` solo para leer los datos reales — permitido (la restricción es
    sobre `src/`, informe sección 2.4).
  - Guards REQ-31-03 y límite REQ-31-08 presentes en ambos.

### 5. Reconciliación REQ-31-07

- `tests/astro-config-dev-workaround.test.mjs` (4 tests): test 1 pasa de exigir
  `disabled: false` a fijar el estado canónico humano c2bbfa1 —
  `optimizeDeps` conserva `include: ['astro/assets/services/noop']` y
  `doesNotMatch /disabled\s*:/` (líneas 29-46). Los otros 3 tests
  (`server.watch.ignored`, entradas retiradas que no vuelven, esquema env
  REQ-22-07/08) quedan intactos.
- `astro.config.mjs` leído: `optimizeDeps.include` presente, **sin** `disabled`,
  sin `exclude`/`noExternal` — coincide con el estado canónico. No se restauró
  la línea (REQ-31-07 cumplido). `prerenderEnvironment: 'node'` permanece
  (correcto: el switch a `'workerd'` es de la feature 32).

### 6. `./init.sh` ejecutado por el reviewer

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Verde completo (antes de la feature 31 estaba rojo por el test del
workaround). REQ-31-08 (suite en verde + entorno perfecto) verificado.

### 7. Alcance respetado (solo feature 31)

`git diff -- src/components/htb-stadistics.astro astro.config.mjs wrangler.jsonc`
→ **vacío** (exit 0, sin salida). No se tocaron los archivos de la feature 32.
`git status --porcelain`: modificados solo `feature_list.json`,
`progress/current.md`, los 2 repositorios y los 3 tests; sin archivos
temporales ni `print()` de debug.

### 8. Trazabilidad acceptance ↔ REQ (feature 31)

| Acceptance (feature_list.json) | REQ | Evidencia |
|---|---|---|
| Tests reescritos en rojo al contrato loader, verde al final | REQ-31-01/02/06 | Ciclo rojo (4 fail: loader inyectable ×2 + guards ×2) → verde (24/24) documentado en `progress/impl_31_*.md` |
| Repos sin imports node ni `?raw`, verificado por test | REQ-31-03 | Guards en ambos tests + grep de src/ por el reviewer |
| `new HeroProfileRepository()` entrega perfil real | REQ-31-04 | Test línea 60-63, `deepEqual` |
| `new HeroCardsRepository()` entrega 12 tarjetas | REQ-31-05 | Test línea 72-75, `deepEqual` |
| Loader que lanza / malformado / forma inválida → errores nombrados | REQ-31-06 | 3 modos de fallo en cada test → `HeroProfileDataError`/`HeroCardsDataError` |
| Test workaround fija c2bbfa1 (include sin disabled) | REQ-31-07 | Test 1 del archivo + `astro.config.mjs` leído |
| Repos ≤100 líneas | REQ-31-08 | 85 y 95 líneas reales + test |
| Suite verde + init.sh entorno perfecto | REQ-31-08 | Ejecutado por el reviewer (sección 6) |

### Pregunta de revisión (TDD y dependencias)

- **¿Test antes del código y en rojo?** Sí. `progress/impl_31_*.md` documenta
  el ciclo rojo (salida `# fail 4` con los 4 tests que prueban la migración:
  loader inyectable de ambos repos y guards REQ-31-03) previo a la
  implementación, y el verde final (24/24). Los tests de modo de error pasaban
  "por accidente" con el código viejo — el informe lo reconoce y los tests que
  prueban la migración de verdad (loader + guard) son los que fallaron en rojo.
- **¿Dependencias todas en `done`?** La feature 31 declara `depends_on: []`
  (sin dependencias) — no hay dependencia saltada. La 32 (`depends_on: [31]`)
  sigue `pending` y su alcance (astro.config.mjs, htb-stadistics.astro,
  wrangler.jsonc) no fue invadido.

## Checkpoints

- Arquitectura: estilos separados: [x] (no toca UI; sin `<style>` nuevo)
- Arquitectura: lógica fuera de UI: [x] (la lógica de carga sigue en `src/domain/repositories/`)
- Arquitectura: datos vía repositorio: [x] (consumidores intactos, sin lectura directa de JSON)
- Arquitectura: tokens, no valores sueltos: [x] (sin cambios en estilos)
- Arquitectura: ≤100 líneas: [x] (repos 85/95 verificado por test y por el reviewer)
- Arquitectura: sin dependencias externas nuevas: [x] (se retiran `node:*`; no se añade nada)
- Datos: `src/data/*.json` válido y tipado: [x] (build OK, tests de datos reales verdes)
- Datos: repositorios validan con errores nombrados: [x] (verificado en código, REQ-31-06)
- Verificación: `./init.sh` verde: [x] ← verificado por el reviewer de la feature 31 (2026-08-13)
- Verificación: página correcta en desktop/móvil: [ ] ← inspección visual en navegador,
  fuera del alcance de esta feature (sin cambios de UI; se mantiene el pendiente histórico)
- Harness: `feature_list.json` con la tarea en `done`: [ ] ← feature 31 sigue `in_progress`;
  el líder la marca `done` tras este APPROVED (protocolo)
- Harness: `progress/current.md` documenta la sesión: [x] (sección "Feature en curso" con plan y estado)
- Harness: sin temporales/debug/TODOs: [x] (git status limpio salvo artefactos del arnés)

## Conclusión

La implementación coincide 1:1 con el patrón canónico verificado
empíricamente en `progress/research/lectura-json-sin-nodefs.md` (probe 5/5):
loader inyectable `() => string` con default = import con atributo +
`JSON.stringify`, sin parameter properties, sin `?raw`, sin `node:*` en `src/`,
errores nombrados y semántica REQ-05-04/REQ-06-05 intactas. La reconciliación
REQ-31-07 devuelve el arnés a verde. Sin desviaciones de scope. Sin tests
rojos. `./init.sh` verde ejecutado por el reviewer.

**Veredicto: APPROVED**