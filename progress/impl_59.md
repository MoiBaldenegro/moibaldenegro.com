# Informe de implementación — feature 59 tokens-audit-tmp-fixture

- Fecha: 2026-10-08 (sesión 2). Adelantada a la 45 por indicación humana («si hace falta adelanta 59»).
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/59_tokens-audit-tmp-fixture/requirements.md`. Análisis: `progress/research/flaky-tmp-audit.md`.

## Causa del flake

`tests/cleanup-dead-code.test.mjs` (REQ-12-06) escribía y borraba `src/styles/tmp-audit.css` para
probar que el guardián de tokens falla. `node --test` corre los archivos en paralelo y los tests que
recorren `src/` (REQ-25-07, REQ-37-03, etc.) fallaban con `ENOENT` si el archivo desaparecía entre
`readdir` y `read`. En la sesión llegó a fallar 2 de cada 4 corridas.

## Cambios

| Archivo | Cambio |
|---|---|
| `scripts/audit-design-tokens.mjs` (34 líneas, solo `node:`) | Argumento opcional `[directorio]` (`process.argv[2]`, `resolve`); sin él audita `src/styles` con la misma salida `AUDIT ✔ …` (REQ-59-01/02/08). |
| `tests/cleanup-dead-code.test.mjs` | REQ-12-06 crea la hoja sucia en `mkdtempSync(join(tmpdir(), 'tokens-audit-'))`, llama a `runAudit(dir)` y borra el directorio con `rmSync` en `finally` (REQ-59-04/05). `runAudit(...args)` reenvía argumentos; se quita `unlinkSync`. |
| `tests/tokens-audit-tmp-fixture.test.mjs` (NUEVO) | Script con directorio sucio → exit ≠ 0; con tokens.css + hoja limpia → exit 0; sin argumentos → exit 0 y `AUDIT`; REQ-12-06 sin `tmp-audit.css` y con mkdtemp/finally; **guarda**: recorre `tests/**/*.mjs` y falla si `writeFileSync/appendFileSync/unlinkSync/rmSync/mkdirSync/renameSync` reciben una ruta literal bajo `src/` o una variable derivada de ella (propagación por asignaciones); la propia guarda se autoverifica con un caso derivado. |

## Ciclo rojo/verde

Rojo — antes de tocar el script y el test heredado:

```
✖ REQ-59-01/03 (el script ignoraba el argumento y auditaba src/styles limpio → exit 0)
✖ REQ-59-04/05 (cleanup-dead-code seguía con tmp-audit.css)
✖ REQ-59-06 (la guarda detectó: cleanup-dead-code.test.mjs → 'writeFileSync(rutaTemporal')
✔ REQ-59-01 limpia · ✔ REQ-59-02 · ✔ REQ-59-08
ℹ pass 3 / ℹ fail 3
```

(La primera versión del test cargaba con un `\b` mal escapado en un template literal; se sustituyó
por un helper `wordRe` sin barras invertidas antes de observar el rojo definitivo.)

## Verificación REQ-59-07: cinco corridas seguidas de `pnpm test`

| Corrida | Resultado |
|---|---|
| 1 | 660 pass · 0 fail |
| 2 | 660 pass · 0 fail |
| 3 | 660 pass · 0 fail |
| 4 | 660 pass · 0 fail |
| 5 | 660 pass · 0 fail |

Sin `ENOENT`. `src/styles/tmp-audit.css` no existe y `git status --porcelain src/` no muestra archivos
nuevos creados por los tests (los `??` son archivos de las features 31-44). `./init.sh` verde.

## Ronda 2 — cambios requeridos de progress/review_59.md

La guarda REQ-59-06 se reescribe en `tests/helpers/src-write-guard.mjs` (NUEVO, 79 líneas, helper:
no es `*.test.mjs`) y el test la importa:

| Punto | Resolución |
|---|---|
| 1. Argumento cortado en la primera coma | `callArgs` extrae los argumentos de nivel superior con paréntesis/corchetes/llaves equilibrados y respetando cadenas; en `rename*`, `copyFile*` y `cp*` se analiza también el destino (2.º argumento). |
| 2. Segmento suelto `'src'` | La expresión está contaminada si contiene un literal con `src/` **o** el literal exacto `'src'`/`"src"` (idioma `join(…, 'src', …)` / `resolve(…, 'src', …)`). |
| 3. Asignaciones multilínea | `scanExpression` lee la expresión hasta `;` o un salto de línea con profundidad 0, así que `const x = join(\n ROOT,\n 'src', …)` queda contaminada; la contaminación se propaga hasta un punto fijo. |
| 4. Más APIs | Se vigilan `writeFileSync, appendFileSync, unlinkSync, rmSync, rmdirSync, mkdirSync, renameSync, copyFileSync, cpSync, createWriteStream` y las variantes async/promesas `writeFile, appendFile, unlink, rm, rmdir, mkdir, rename, copyFile, cp` (también con prefijo `fs.`). |
| 5. Autoverificación | Test nuevo «REQ-59-06 (autoverificación)» con 7 casos positivos (URL derivada, `join(ROOT, 'src/…')`, segmento `'src'`, asignación multilínea, destino de `renameSync`, `fs.writeFile` de promesas, `copyFileSync` con segmento) y 2 negativos (ruta bajo `mkdtempSync(tmpdir())` cuyo *contenido* menciona `src/`, y lectura de `src/`). |
| 6. Falso positivo de fixture que imite `src/` en tmp | Documentado como limitación aceptada en el comentario de cabecera del helper. |

Ciclo rojo/verde de la ronda: los casos se añadieron primero **contra la guarda antigua** del test
→ rojo (`AssertionError: no detecta: join con literal src/`); al cambiar a la guarda nueva → 7/7.

Verificación: 5 corridas seguidas de `pnpm test` → 661 pass · 0 fail en las cinco, sin `ENOENT`.
`./init.sh` verde.

## Ronda 3 — cambios requeridos de review_59 (ronda 2)

| Punto | Resolución |
|---|---|
| 1. `const p =⏎ join(…)` no se marcaba | Las asignaciones se reconocen con `nombre\s*=(?![=>])\s*`: la expresión empieza **después** de los espacios y saltos de línea que siguen al `=`, así que `scanExpression` ya no se corta en ese primer `\n`. |
| 2. Caso en POSITIVE + rojo/verde | Añadidos «salto de línea tras el =» y «reasignación sin declaración» (`let p;⏎p = join(ROOT, 'src/x')`). Rojo con la guarda de la ronda 2: `AssertionError: no detecta: salto de línea tras el =`. Verde tras el arreglo. |
| 3. Comentario y reasignación (opcional) | Se cubre la reasignación: el patrón ya no exige `const/let/var` y excluye `==`, `=>` y `obj.prop =`. Nuevo caso NEGATIVE «comparación y flecha no son asignaciones». El comentario de cabecera describe el comportamiento real y declara como limitación aceptada las expresiones partidas en varias líneas **fuera** de paréntesis (p. ej. `a +⏎ 'src/x'`). |

El escaneo real de `tests/**/*.mjs` sigue sin marcas (sin falsos positivos con el patrón más amplio).
Verificación: 5 corridas seguidas de `pnpm test` → 661 pass · 0 fail en las cinco, sin `ENOENT`;
`./init.sh` verde.
