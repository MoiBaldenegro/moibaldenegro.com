# Análisis — Flake de tests por src/styles/tmp-audit.css (feature 59)

## Problema

`tests/cleanup-dead-code.test.mjs` (test «REQ-12-06: el guardián falla ante un
color fuera de tokens.css», líneas 75-93) escribe `src/styles/tmp-audit.css`
dentro del repo, lanza `scripts/audit-design-tokens.mjs` y borra la hoja en un
`finally`. `pnpm test` ejecuta `node --test "tests/**/*.test.mjs"`, que corre
los archivos de test en procesos paralelos. Otros tests recorren `src/` con
`readdirSync` + `readFileSync` (p. ej. REQ-25-07 en
`tests/game-of-life-removal.test.mjs`, REQ-09-05 en
`tests/hero-ui-refactor.test.mjs`; también hacen readdir sobre src/ o
src/styles `focus-visible-global`, `visual-polish-refactor`,
`broken-resources-fix`, `fix-navbar-jump`, `related-card-model`, entre otros).
Si la hoja se borra entre el readdir y el read, el walker falla con
`ENOENT ... src\styles\tmp-audit.css`. Además, mientras existe, cualquier
test que audite src/styles ve un hex suelto (falso rojo potencial).

Frecuencia reportada por el líder: 2 de cada 4 corridas. Registrado en
progress/history.md (cierres de 25, 26 y 28; arranque posterior) y por los
reviewers de 36 y 38.

## Causa raíz

El script auditado tiene la ruta fija:
`STYLES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles')`
(scripts/audit-design-tokens.mjs, 30 líneas). No acepta ruta, así que el test
solo puede inyectar el caso sucio escribiendo dentro de src/styles.

## Solución propuesta (patrón de la feature 28)

1. `scripts/audit-design-tokens.mjs` acepta un argumento opcional
   (`process.argv[2]`) con el directorio a auditar; sin argumento conserva
   `src/styles` y la salida actual (`AUDIT ✔ ...`). Sigue en stdlib y < 100
   líneas.
2. El test REQ-12-06 «falla ante color suelto» crea un directorio con
   `mkdtempSync(join(tmpdir(), ...))`, escribe allí la hoja sucia (y
   opcionalmente un tokens.css para cubrir la exclusión), invoca el script
   con esa ruta y borra el directorio con `rmSync(..., {recursive, force})`
   en `finally`.
3. Test de guarda: inspección estática de `tests/**/*.mjs` que falla si
   alguna llamada de escritura/borrado (writeFileSync, appendFileSync,
   unlinkSync, rmSync, mkdirSync, renameSync) apunta a una ruta bajo `src/`.

Descartado: serializar la suite (`--test-concurrency=1`) — oculta la causa y
ralentiza; tolerar ENOENT en cada walker — dispersa el arreglo en N tests.

## Alcance y riesgos

- Toca solo `scripts/audit-design-tokens.mjs` y `tests/cleanup-dead-code.test.mjs`
  (+ test nuevo de guarda). No toca src/ ni UI: sin design.md.
- Complejidad simple: 1 feature (id 59), sin dependencias.
- Hallazgo lateral (no en alcance): `tests/cloudflare-types-install.test.mjs`
  REQ-30-04 puede crear/borrar `worker-configuration.d.ts` en la raíz del repo
  (no en src/); no afecta a los walkers de src/, se deja anotado.
- La verificación de «varias corridas seguidas» es empírica: 5 corridas de
  `pnpm test` en verde, registradas en progress/impl_59.md.

Spec: specs/59_tokens-audit-tmp-fixture/requirements.md
