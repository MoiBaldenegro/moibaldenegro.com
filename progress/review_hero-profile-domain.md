# Review — feature 5 hero-profile-domain

- **Reviewer:** agente revisor (nivel 1, sesión 2026-08-10)
- **Spec:** `specs/05_hero-profile-domain/requirements.md` (REQ-05-01..05)
- **Informe del implementer:** `progress/impl_hero-profile-domain.md`
- **Fecha:** 2026-08-10

**Veredicto:** APPROVED

## Pregunta de revisión (obligatoria)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite
quedó en verde al final? **SÍ.** Evidencia documentada en
`progress/impl_hero-profile-domain.md` (sección "Ciclo rojo/verde"):

- ROJO: `node --test tests/hero-profile-repository.test.mjs` →
  `ERR_MODULE_NOT_FOUND` (import de `hero-profile-repository.ts` inexistente),
  0 pass / 1 fail. Coherente con el disco: el test existe y el módulo solo
  pudo existir tras el ROJO (los nombres de los 7 tests citados en el VERDE
  coinciden 1:1 con el test en disco).
- VERDE: test feature 7/7, suite completa 30/30 (23 previas + 7 nuevas).
- Re-ejecutado por el reviewer en disco: suite 30/30, `check-format` ✔,
  `pnpm build` ✔, `./init.sh` → "El entorno está perfecto" ✔.

## Verificación por puntos (evidencia en disco)

### REQ-05-01 — `src/data/hero.json` almacena el perfil

✔ `src/data/hero.json` (7 líneas) existe, es JSON válido (`JSON.parse` OK) y
contiene exactamente los 5 campos requeridos: `name`, `username`, `verified`,
`image`, `description`.

✔ Valores idénticos al perfil real de `src/data/hero.data.ts` (líneas 29-40),
comparados campo a campo:

| Campo | hero.json | hero.data.ts profile |
|---|---|---|
| name | "Moisés Baldenegro Melendez" | "Moisés Baldenegro Melendez" |
| username | "@moibaldenegro" | "@moibaldenegro" |
| verified | true | true |
| image | "assets/moises-hero.jpg" | "assets/moises-hero.jpg" |
| description | "AI Engineering • Rust • WebAssembly • Full Stack • DevOps • AWS • Azure • Security First • OWASP • Rustacean 🦀" | idéntica |

Acceptance A1 cubierto (test 1: `REQ-05-01: src/data/hero.json almacena el
perfil con los 5 campos`, pasa).

### REQ-05-02 — Entidad `HeroProfile`

✔ `src/domain/entities/hero-profile.ts` (10 líneas) declara
`interface HeroProfile` con los 5 campos del perfil, todos `readonly`
(inmutabilidad, arquitectura §4). Acceptance A1 cubierto (test 2 verifica la
interface y cada `readonly`).

### REQ-05-03 — Repositorio entrega la entidad

✔ `src/domain/repositories/hero-profile-repository.ts` (79 líneas):
`HeroProfileRepository.getProfile(): HeroProfile` lee `src/data/hero.json`
con `readFileSync` (`node:fs`, sin dependencias externas), valida la forma
(`asRecord`, `expectString`, `expectBoolean`) y devuelve la entidad.
Acceptance A2 cubierto (test 3: `deepEqual` contra el perfil real, pasa).

### REQ-05-04 — Error nombrado ante JSON ausente o malformado

✔ `HeroProfileDataError extends Error` con `name = 'HeroProfileDataError'`
(clase PascalCase + sufijo `Error`, convención de errores) y mensajes en
español: "hero.json: no se pudo leer el perfil desde ...", "hero.json: el
archivo no es un JSON válido", "hero.json: el contenido no es un objeto de
perfil", "hero.json: el campo \"x\" debe ser un texto/verdadero o falso".
Nunca fallo silencioso (arquitectura §3: errores explícitos, no falsy).

✔ Se lanza en 3 casos, todos cubiertos por tests que pasan:
1. archivo ausente (test 4, usa `mkdtempSync` sin tocar el hero.json real),
2. JSON inválido (test 5: `'{ esto no es JSON'`),
3. forma inválida (test 6: `{ name: 42, username: null }`).

Acceptance A3 cubierto. Los directorios temporales se limpian en `finally`
(sin restos en disco).

### REQ-05-05 — Límite de 100 líneas

✔ Verificado por el test 7 (pasa) y por `wc -l` del reviewer:
entidad 10 líneas, repositorio 79 líneas. Ambos ≤ 100. Acceptance A4 cubierto.

### Arquitectura y convenciones (docs/architecture.md, docs/conventions.md)

- ✔ Capas correctas: `src/data/` (JSON, única fuente de contenido) →
  `src/domain/repositories/` → `src/domain/entities/`, según el flujo de
  datos de `architecture.md`.
- ✔ Carpetas kebab-case plural (`entities/`, `repositories/`), archivos del
  dominio con nombres correctos (`hero-profile.ts`, `hero-profile-repository.ts`).
- ✔ Un repositorio = una responsabilidad = una fuente de datos (solo hero.json).
- ✔ Entidad inmutable (`readonly` en los 5 campos).
- ✔ `hero.data.ts` INTACTO (sin cambios en `git status`; su borrado es de la
  feature 9, coherente con la descripción del backlog y con la feature 9).
- ✔ Sin dependencias nuevas: `git diff package.json` solo muestra el script
  `test` (feature 1, ya aprobada); `dependencies` sigue siendo solo `astro`.
- ✔ No existe `specs/05_hero-profile-domain/design.md` — correcto: la feature
  no toca UI (convenciones: design.md solo si hay UI/presentación).
- ✔ Testabilidad: el constructor acepta `URL` con default
  `new URL('../../data/hero.json', import.meta.url)`; los tests de error no
  mutan el JSON real.

## Comandos ejecutados por el reviewer (verificación independiente)

| Comando | Resultado |
|---|---|
| `node --test "tests/**/*.test.mjs"` | 30/30 pass, 0 fail (7 de la feature) |
| `node scripts/check-format.mjs` | FORMATO ✔ |
| `pnpm build` | ✔ (1 página, estático, sin errores) |
| `bash ./init.sh` | ✔ "El entorno está perfecto. Podemos empezar a trabajar." |

## Trazabilidad acceptance ↔ REQ (feature 5)

| Acceptance | REQ | Evidencia |
|---|---|---|
| hero.json con name/username/verified/image/description del perfil actual | REQ-05-01, REQ-05-02 | hero.json + tests 1 y 2 |
| test pasa en verde y cubre lectura exitosa | REQ-05-03 | test 3 (deepEqual perfil real) |
| hero.json malformado → HeroProfileDataError | REQ-05-04 | tests 4, 5 y 6 (ausente, JSON inválido, forma inválida) |
| entidad y repositorio ≤ 100 líneas | REQ-05-05 | test 7 + wc -l (10 y 79) |

Alcance confirmado con `git status`: los únicos archivos de la feature son
`src/data/hero.json`, `src/domain/entities/hero-profile.ts`,
`src/domain/repositories/hero-profile-repository.ts` y
`tests/hero-profile-repository.test.mjs` (más el informe de progreso). No hay
cambios ajenos dentro del alcance de la feature 5.

## Checkpoints

- C1: [x] — N/A (la feature no toca UI; no hay estilos ni componentes).
- C2: [x] — N/A (la feature no toca UI).
- C3: [x] — Ninguna lectura directa de JSON añadida; se crea la vía repositorio.
- C4: [x] — N/A (no hay estilos en esta feature).
- C5: [x] — Entidad 10 líneas, repositorio 79 líneas (≤100).
- C6: [x] — Sin dependencias nuevas.
- C7: [x] — `hero.json` válido y tipado por `HeroProfile`.
- C8: [x] — `HeroProfileDataError` nombrado, sin fallos silenciosos.
- C9: [x] — `./init.sh` en verde (entorno, formato, tests 100%, build).
- C10: [ ] — N/A: la feature no toca UI; la verificación visual no aplica
  (la UI se conecta al repositorio en la feature 9).
- C11: [ ] — `feature_list.json` mantiene la feature 5 en `in_progress`:
  es el flujo esperado (el líder la marca `done` tras el APPROVED del reviewer).
- C12: [x] — `progress/current.md` documenta el ciclo completo de la feature 5.
- C13: [x] — Sin temporales ni debug; los directorios temporales de tests se
  limpian en `finally`.

## Cambios requeridos

Ninguno.

## Observaciones (no bloqueantes)

1. **Sesión concurrente en el repo:** `git status` muestra artefactos ajenos
   a la feature 5 — `specs/06_hero-cards-domain/` a `specs/13_project-readme/`
   (untracked, trabajo del spec_author), `progress/review_*.md` de features
   1-4 ya aprobadas, y archivos de las features 1-4 aún sin commitear. No
   interfieren con el dominio del perfil: los archivos de la feature 5 no se
   solapan con ellos. Documentado como observación, no como bloqueo.
2. `progress/impl_hero-profile-domain.md` declara el ROJO con el import del
   repositorio inexistente (ERR_MODULE_NOT_FOUND). No se pudo re-ejecutar el
   ROJO sin revertir código (prohibido para el reviewer), pero la evidencia es
   coherente: los nombres y la numeración de los 7 tests del VERDE coinciden
   exactamente con el archivo en disco.
3. El mensaje de error de archivo no legible incluye `dataUrl.pathname`
   (p.ej. `/C:/Users/.../hero.json`): informativo, sin impacto funcional.

## Conclusión

La feature 5 `hero-profile-domain` cumple las 5 REQ de la spec y los 4
acceptance del backlog. Test-first con ROJO documentado y VERDE reproducido de
forma independiente (suite 30/30, formato, build e init.sh). Respeta la
arquitectura (capas, repositorio como única vía de datos, errores explícitos
nombrados, entidad inmutable, ≤100 líneas) y las convenciones (nombres,
español, sin dependencias). No se toca código de la feature ni del resto del
repo. **APPROVED.**
