# Informe de implementación — feature 5 hero-profile-domain

- **Feature:** 5 — hero-profile-domain
- **Implementer:** agente implementador (sesión 2026-08-10)
- **Spec:** `specs/05_hero-profile-domain/requirements.md` (REQ-05-01..05)
- **Estado:** implementada, pendiente de revisión (status `in_progress` en `feature_list.json`)

## Alcance (contra la spec)

| REQ | Qué exige | Cómo se cumple |
|-----|-----------|----------------|
| REQ-05-01 | El perfil del hero en `src/data/hero.json` | `src/data/hero.json` (7 líneas) con `name`, `username`, `verified`, `image` y `description` con los valores reales del perfil actual de `hero.data.ts` |
| REQ-05-02 | Entidad `HeroProfile` en `src/domain/entities/hero-profile.ts` | `interface HeroProfile` con los 5 campos `readonly` (inmutable, 10 líneas) |
| REQ-05-03 | `HeroProfileRepository` entrega la entidad leyendo `hero.json` | Clase `HeroProfileRepository.getProfile(): HeroProfile`; lee el JSON con `readFileSync` (`node:fs`, sin dependencias externas) y valida la forma |
| REQ-05-04 | Con `hero.json` ausente o malformado lanza `HeroProfileDataError` | Clase `HeroProfileDataError extends Error` con `name = 'HeroProfileDataError'`; se lanza en 3 casos: archivo no legible, JSON inválido y forma inválida (campo con tipo incorrecto o contenido no-objeto). Nunca fallo silencioso |
| REQ-05-05 | Entidad y repositorio ≤ 100 líneas | Entidad 10 líneas, repositorio 79 líneas (verificado por el test y `wc -l`) |

## Decisiones

- **`src/domain/` no existía:** se creó con `entities/` y `repositories/` (kebab-case plural). No se creó el dominio de tarjetas (feature 6).
- **`src/data/hero.data.ts` NO se borró** (lo hará la feature 9 cuando la UI deje de importarlo); los imports actuales (`new-hero.astro → ../../data/hero.data`) siguen funcionando.
- **Testabilidad:** el constructor de `HeroProfileRepository` acepta una `URL` con valor por defecto `new URL('../../data/hero.json', import.meta.url)`; los casos de error del test usan directorios temporales (`mkdtempSync` en `os.tmpdir()`, limpiados en `finally`), sin tocar el `hero.json` real.
- **Type stripping:** los tests `.mjs` importan los módulos `.ts` del dominio con extensión; Node v22.22.2 lo soporta por defecto (verificado con experimento previo; el repo tiene `"type": "module"`).
- **Mensajes de error en español** (convención): `hero.json: el archivo no es un JSON válido`, `hero.json: el campo "name" debe ser un texto`, etc.

## Archivos creados

- `src/data/hero.json` (7 líneas)
- `src/domain/entities/hero-profile.ts` (10 líneas)
- `src/domain/repositories/hero-profile-repository.ts` (79 líneas)
- `tests/hero-profile-repository.test.mjs` (109 líneas, 7 tests)

## Ciclo rojo/verde (evidencia)

### ROJO — antes de implementar (solo el test en disco)

Comando: `node --test tests/hero-profile-repository.test.mjs`

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'C:\Users\Moises\Desktop\moibaldenegro.com\src\domain\repositories\hero-profile-repository.ts'
imported from C:\Users\Moises\Desktop\moibaldenegro.com\tests\hero-profile-repository.test.mjs
...
# tests 1
# pass 0
# fail 1
```

### VERDE — tras implementar JSON + entidad + repositorio

Comando: `node --test tests/hero-profile-repository.test.mjs`

```
ok 1 - REQ-05-01: src/data/hero.json almacena el perfil con los 5 campos
ok 2 - REQ-05-02: la entidad HeroProfile tipa el perfil con campos readonly
ok 3 - REQ-05-03: HeroProfileRepository entrega la entidad leyendo hero.json
ok 4 - REQ-05-04: con hero.json ausente el repositorio lanza HeroProfileDataError
ok 5 - REQ-05-04: con hero.json malformado (JSON inválido) lanza HeroProfileDataError
ok 6 - REQ-05-04: con hero.json de forma inválida lanza HeroProfileDataError
ok 7 - REQ-05-05: entidad y repositorio no superan las 100 líneas
# tests 7
# pass 7
# fail 0
```

### Suite completa

Comando: `pnpm test` → `# tests 30` · `# pass 30` · `# fail 0` (23 previas + 7 nuevas).

## Puerta de entrada: `./init.sh`

```
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Verificación de alcance y estado

- `src/data/hero.data.ts` intacto (timestamp previo; no borrado).
- `hero.json` validado como JSON real: `JSON.parse` correcto y `deepEqual` con el perfil esperado en el test REQ-05-03.
- Sin dependencias nuevas (`package.json` sin cambios de esta feature).
- `git status`: solo se añadieron los 4 archivos de la feature + `feature_list.json`/`progress/` ya versionados como untracked del flujo.

## Estado del ciclo

- `feature_list.json`: feature 5 marcada `in_progress` (la cierra el líder con el APPROVED del reviewer).
- Pendiente: revisión del reviewer (el implementer no lanza subagentes).
