# Informe implementer — feature 12 cleanup-dead-code

Fecha: 2026-08-10. Implementer sin subagentes. Estado en feature_list.json: `in_progress` (NO marcada done; el cierre lo orquesta el líder tras el reviewer).

## Alcance y trazabilidad

| REQ | Qué se hizo | Evidencia |
|-----|-------------|-----------|
| REQ-12-01 | Eliminado `src/config.ts` (definición de colecciones en ubicación que Astro no reconoce; nada lo importaba) | grep previo: sin imports; test verde |
| REQ-12-02 | Eliminada `src/application/` (read-post.ts y read-hero-cards.ts, ambos de 0 bytes) | test verde |
| REQ-12-03 | Eliminados `src/entities/context.md`, `src/repositories/context.md`, `src/services/context.md` y las carpetas residuales `src/entities/`, `src/repositories/`, `src/services/` (el dominio vive en `src/domain/`) | test verde |
| REQ-12-04 | Eliminado `src/components/Welcome.astro` (starter kit; verificación grep previa: `Welcome` no aparece en src/ aparte del propio archivo) | test verde |
| REQ-12-05 | Eliminada `src/ui/` (vacía, 0 entradas) | test verde |
| REQ-12-06 | Creado `scripts/audit-design-tokens.mjs` (guardián de tokens, 31 líneas, Node stdlib fs/path/url, prefijo de verbo admitido `audit-`, nunca importado desde la app) | `AUDIT ✔` exit 0 en limpio; exit ≠ 0 ante hoja con hex suelto; tests 7/7 |
| REQ-12-07 | `pnpm build` y `pnpm test` sin errores tras la limpieza | build 2 páginas exit 0; suite 87/87 |

## Ciclo rojo/verde (test-first)

### ROJO — `node --test tests/cleanup-dead-code.test.mjs` (antes de tocar nada)

```
not ok 1 - REQ-12-01: src/config.ts ya no existe
not ok 2 - REQ-12-02: src/application ya no existe
not ok 3 - REQ-12-03: ningún context.md en src/entities|repositories|services
not ok 4 - REQ-12-04: src/components/Welcome.astro ya no existe
not ok 5 - REQ-12-05: src/ui ya no existe
not ok 6 - REQ-12-06: el script audit-design-tokens.mjs existe y audita en verde
not ok 7 - REQ-12-06: el guardián falla ante un color fuera de tokens.css
# pass 0
# fail 7
```

Nota de rigor: en una primera pasada el test 7 (guardián cae ante hoja temporal) daba positivo en rojo porque `spawnSync` devuelve `status: null` si el script no existe; se añadió `assert.ok(existsSync(AUDIT_SCRIPT))` al inicio del test 7 para que el rojo sea honesto (7/7 fail).

### VERDE — tras la limpieza y creación del script

```
node --test tests/cleanup-dead-code.test.mjs
ok 1..7  |  # pass 7  # fail 0

node scripts/audit-design-tokens.mjs
AUDIT ✔ ningún color fuera de tokens.css en src/styles   (exit 0)
```

Verificación del guardián también manual con `exit=$LASTEXITCODE` = 0, y prueba de fallo incluida en el test (hoja temporal `src/styles/tmp-audit.css` con `#ab12cd`, creada al vuelo y borrada en `finally`).

## Verificación final

```
node --test "tests/**/*.test.mjs"   → # tests 87  # pass 87  # fail 0
node scripts/check-format.mjs       → FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos (exit 0)
pnpm build                          → 2 page(s) built in 697ms  ✓ Complete!  (exit 0)
./init.sh (bash)                    → ✔ El entorno está perfecto. Podemos empezar a trabajar. (exit 0)
```

## Archivos/carpetas eliminados

- `src/config.ts`
- `src/application/` (read-post.ts, read-hero-cards.ts — 0 bytes cada uno)
- `src/entities/` (context.md + carpeta residual)
- `src/repositories/` (context.md + carpeta residual)
- `src/services/` (context.md + carpeta residual)
- `src/components/Welcome.astro`
- `src/ui/` (vacía)

### Verificación grep previa (antes de borrar, nada los importaba)

- `Welcome` en src/: 0 resultados (solo el propio archivo, confirmado por glob).
- `config.ts|application/|read-post|read-hero-cards|context.md` en src/: única coincidencia un comentario textual en `src/domain/entities/post.ts:4` que alude a `src/content.config.ts` — archivo REAL de Astro content collections, distinto del `src/config.ts` eliminado (no se toca).
- `Welcome|config.ts|read-post|read-hero-cards` en tests/: única coincidencia un comentario en `tests/posts-repository.test.mjs:33` igualmente sobre `src/content.config.ts`.

### Verificación grep posterior (tras borrar, en src/ y tests/)

- `Welcome|config\.ts|application/|read-post|read-hero-cards|context\.md|src/ui|src/entities|src/repositories|src/services` → única coincidencia restante: el comentario sobre `src/content.config.ts` en `post.ts` (referencia a archivo vivo, no a código muerto). Ninguna referencia a los archivos eliminados.
- `Test-Path` sobre los 7 objetivos: `False` en todos.

## Script creado: `scripts/audit-design-tokens.mjs`

- 31 líneas (límite 100 ✔). Node stdlib únicamente: `node:fs` (readdirSync, readFileSync), `node:path` (dirname, join), `node:url` (fileURLToPath).
- Recorre `src/styles/*.css` (resuelto como `../src/styles` relativo al script), excluye `tokens.css`, y con la regex `#[0-9a-fA-F]{3,8}\b|rgba?\(` detecta cualquier valor de color suelto (hex 3-8 dígitos, rgb(, rgba()).
- Ante cualquier hallazgo imprime `TOKENS ✘ <hoja>:<línea>: color suelto "<valor>" (debe salir de tokens.css)` y termina `process.exit(1)`. En limpio imprime `AUDIT ✔ ningún color fuera de tokens.css en src/styles` y termina exit 0.
- No se importa desde el código de la app (regla del arnés): solo se ejecuta a mano o desde tests con `spawnSync`.

## Desviaciones justificadas

- Ninguna funcional. Dos únicas notas:
  1. El test 7 (guardián en rojo) se endureció con `existsSync` sobre el script para evitar un falso positivo del ciclo rojo (detallado arriba). El alcance del test pedido por el líder (existencia + exit 0 + REQ-12-01..05) se mantiene íntegro; se añadió la prueba de fallo del guardián porque REQ-12-06 exige "fallar ante cualquier valor de color fuera de tokens.css" y sin esa prueba el acceptance no queda demostrado.
  2. `pnpm` desde PowerShell requiere `pnpm.cmd` por la política de ejecución del sistema (los tests y el audit se ejecutaron con `node` directo; el build con `pnpm.cmd build` exit 0 y `./init.sh` vía `bash` exit 0).