# Review — feature 12 cleanup-dead-code

Fecha: 2026-08-10. Reviewer sin subagentes. Revisión contra `specs/12_cleanup-dead-code/requirements.md` (REQ-12-01..07), acceptance de `feature_list.json`, `docs/architecture.md` (regla 13), `docs/conventions.md` (prefijo `audit-`), `docs/verification.md`.

**Veredicto:** APPROVED

## Evidencia verificada en disco (por mí mismo)

### REQ-12-01..05 — archivos eliminados (Test-Path → False en los 7)
| Objetivo | Test-Path | git status |
|---|---|---|
| `src/config.ts` | False | D |
| `src/application/` (read-post.ts, read-hero-cards.ts) | False | D (ambos archivos) |
| `src/entities/context.md` | False | D |
| `src/repositories/context.md` | False | D |
| `src/services/context.md` | False | D |
| `src/components/Welcome.astro` | False | D |
| `src/ui/` | False | nunca trackeada (carpeta vacía) |

Carpetas residuales `src/entities/`, `src/repositories/`, `src/services/` también eliminadas (Test-Path False). `src/content.config.ts` sigue vivo (glob ✔) — no se tocó, como exige la spec.

### Referencias residuales (grep src/ y tests/)
- `src/domain/entities/post.ts:4` — comentario que alude a `src/content.config.ts` (archivo vivo, legítimo).
- `tests/posts-repository.test.mjs:33` — comentario igualmente sobre `src/content.config.ts` (legítimo).
- `tests/cleanup-dead-code.test.mjs` — menciones a los nombres eliminados solo dentro del propio test (legítimo).
- Cero referencias a `Welcome`, `config.ts` (salvo content.config.ts), `read-post`, `read-hero-cards`, `context.md`, `src/ui` en código vivo.

### REQ-12-06 — `scripts/audit-design-tokens.mjs`
- 31 líneas (≤100 ✔). Solo Node stdlib: `node:fs` (readdirSync, readFileSync), `node:path` (dirname, join), `node:url` (fileURLToPath). Sin dependencias externas.
- Prefijo de verbo `audit-`: admitido en la lista cerrada de `docs/conventions.md`.
- Recorre `src/styles/*.css` (ruta `../src/styles` resuelta con `import.meta.url`), excluye `tokens.css`.
- Regex de color: `#[0-9a-fA-F]{3,8}\b|rgba?\(` (hex 3-8 dígitos + rgb()/rgba()).
- Ejecutado por mí: limpio → `AUDIT ✔ ningún color fuera de tokens.css en src/styles` exit 0.
- Camino de fallo probado por mí: hoja temporal `src/styles/tmp-test.css` con `#ab12cd` → `TOKENS ✘ tmp-test.css:1: color suelto "#ab12cd" ...` exit 1; hoja borrada tras la prueba (Test-Path False posterior). El test 7 usa el mismo patrón con limpieza en `finally`.
- No se importa desde el código de la app (grep `audit-design-tokens` en src/ → 0 resultados). Cumple la regla 13 del arnés.

### Test `tests/cleanup-dead-code.test.mjs` (93 líneas ≤100 ✔)
Cubre REQ-12-01..05 (mustNotExist sobre los 7 objetivos + carpetas residuales), REQ-12-06 ×2 (existencia + exit 0 en limpio con `assert.match(stdout, /AUDIT/)`, y fallo exit ≠ 0 ante hoja temporal con limpieza en `finally`). REQ-12-07 se verifica con build/init.sh (acceptance lo pide así).

### Test-first (rojo/verde)
`progress/impl_12_cleanup-dead-code.md` documenta el ROJO honesto 7/7 fail (0 pass) capturado antes de tocar nada, con nota de rigor: el test 7 se endureció con `existsSync` sobre el script para que `spawnSync` con script inexistente no diera falso positivo en rojo (rojo 7/7 real). VERDE documentado: 7/7, suite 87/87.

### Verificación ejecutada por mí
- `node --test "tests/**/*.test.mjs"` → `# tests 87 # pass 87 # fail 0` ✔
- `node scripts/check-format.mjs` → `FORMATO ✔` exit 0 ✔
- `pnpm.cmd build` → `2 page(s) built` `Complete!` exit 0 ✔
- `./init.sh` (Git Bash) → `✔ El entorno está perfecto. Podemos empezar a trabajar.` exit 0 ✔

### Trazabilidad acceptance ↔ REQ (feature 12)
| Acceptance | REQ | Estado |
|---|---|---|
| src/config.ts ya no existe | REQ-12-01 | ✔ |
| src/application ya no existe | REQ-12-02 | ✔ |
| ningún context.md en entities/repositories/services | REQ-12-03 | ✔ |
| Welcome.astro y src/ui ya no existen | REQ-12-04, REQ-12-05 | ✔ |
| audit-design-tokens.mjs existe y verde en limpio | REQ-12-06 | ✔ (además falla ante color suelto) |
| pnpm build y pnpm test sin errores | REQ-12-07 | ✔ (87/87, 2 pages, init.sh verde) |

### Alcance (git status)
Feature 12 toca exactamente: 7 borrados (D), `scripts/audit-design-tokens.mjs` (??), `tests/cleanup-dead-code.test.mjs` (??), `progress/impl_12_cleanup-dead-code.md` (??) y `feature_list.json` (status 12 = `in_progress`, línea 166). El resto del working tree (package.json, hero-card.astro, latest-articles.astro, new-hero.astro, Layout.astro, hero.data.ts, hero.css, harness-kit test, specs/, src/domain/, etc.) pertenece a las features 1-11 ya APPROVED (repos sin commits del refactor: solo 4 commits del starter). Sin cambios fuera de alcance atribuibles a la feature 12.

## Checkpoints
- C1: [x] — Sin estilos embebidos: grep `<style|style=` en src/**/*.astro → 0 resultados; la feature no toca UI.
- C2: [x] — Sin lógica en UI (repos de features previas; esta feature solo elimina código muerto).
- C3: [x] — Ningún componente lee JSON directo (grep readFileSync/import .json/fetch en src/components → 0).
- C4: [x] — Tokens: el nuevo guardián impone la regla; audit en verde sobre las 6 hojas.
- C5: [x] — ≤100 líneas en los archivos de esta feature (script 31, test 93). Los >100 restantes (hero-cards.json 134 = dato JSON, tests de features previas 104-264) son de features 1-11 ya aprobadas, no de la 12.
- C6: [x] — Sin dependencias externas (solo node: stdlib en el script).
- C7: [x] — Datos JSON válidos y repositorios con errores nombrados (suite 87/87 y build verdes).
- C8: [x] — `./init.sh` en verde completo.
- C9: [x] — UI: la feature no modifica UI (Welcome.astro no era importado); build renderiza las 2 páginas sin errores.
- C10: [ ] — `feature_list.json` con la tarea en `done`: aun `in_progress` POR DISEÑO — el cierre a `done` lo orquesta el líder tras este veredicto (verification.md: "lo lanza el líder, nunca el implementer"). No bloqueante.
- C11: [ ] — `progress/history.md` al día: se actualiza en el cierre de sesión del líder, no en la etapa de review. No bloqueante. `progress/current.md` sí documenta la sesión (bitácora feature 12 ✔).
- C12: [x] — Sin temporales ni debug: verificado (tmp-test.css borrado; grep tmp/temp/~ → 0 en src/).

## Cambios requeridos
Ninguno.
