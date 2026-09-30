# Implementación — feature 28 `dependencies-registry-crlf`

> Sesión del implementer. Spec: `specs/28_dependencies-registry-crlf/requirements.md`
> (REQ-28-01..10). Análisis previo: `progress/research/validador-dependencias-crlf.md`.
> Alcance: solo arnés (`scripts/validate-dependencies.mjs` +
> `tests/dependencies-registry-crlf.test.mjs`). Nada de `src/`.
> `feature_list.json` se deja como está (`status: "pending"`): el `done` lo marca
> el líder tras el APPROVED del reviewer.

## 1. Causa raíz (confirmada en disco)

`scripts/validate-dependencies.mjs` dividía el registro con
`content.split('\n')` y sus dos regex terminadas en `$` usaban `(.+)$`. En
JavaScript el metacarácter `.` **no** matchea los *line terminators* (`\r`,
`\n`, `\2028`, `\u2029`), así que con `docs/dependencies.md` en CRLF cada línea
llegaba como `"### astro\r"` y ni `/^###\s+(.+)$/` ni
`/^-\s*([a-z]+)\s*:\s*(.+)$/` podían casar (no hay *match parcial* recuperable).
Resultado: `parseRegistry()` devolvía un `Map` vacío → las 4 dependencias de
`package.json` se daban por no aprobadas.

Síntomas reproducidos **antes** de tocar nada:

```console
$ node scripts/check-format.mjs ; echo "---exit $?"
FORMATO ✘ docs/dependencies.md: la dependencia "@astrojs/cloudflare" (dependencies) no está aprobada en el registro
---exit 1
FORMATO ✘ docs/dependencies.md: la dependencia "astro" (dependencies) no está aprobada en el registro
FORMATO ✘ docs/dependencies.md: la dependencia "wrangler" (dependencies) no está aprobada en el registro
FORMATO ✘ docs/dependencies.md: la dependencia "@cloudflare/workers-types" (devDependencies) no está aprobada en el registro

$ node --test tests/dependencies-registry.test.mjs | tail -6
1..8
# tests 8
# pass 5
# fail 3        <-- los dos de REQ-29-01 y REQ-29-02/03 con los archivos reales
```

Confirma el diagnóstico: `docs/dependencies.md` está en CRLF (`core.autocrlf=true`
y sin `.gitattributes`), por eso el fix va en el **parser** y no en el archivo.
`docs/dependencies.md` **no se ha modificado** (`git diff -- docs/dependencies.md`
vacío al cierre; un test nuevo lo verifica).

## 2. Ciclo ROJO (tests primero)

Test nuevo escrito **antes** del código: `tests/dependencies-registry-crlf.test.mjs`
(11 casos cubriendo REQ-28-01..05, 07, 08 y 09, con fixtures temporales en
`node:os.tmpdir()`; nunca escribe en `docs/dependencies.md`). Ejecutado contra el
parser sin arreglar:

```console
$ node --test tests/dependencies-registry-crlf.test.mjs tests/dependencies-registry.test.mjs
not ok 1 - REQ-28-01/02/03: con CRLF y con LF el parser devuelve las mismas entradas, sin \\r
  error: |-
    el registro en CRLF no devuelve las mismas entradas
    + actual - expected
    + []
    - [
    -   'astro',
    -   'wrangler'
    - ]

not ok 2 - REQ-28-03/08: el docs/dependencies.md real se parsea entero, sin \\r y con sus 4 entradas
  error: |-
    el parser no reconoce el registro real: []

not ok 3 - REQ-28-05: validateDependencies no reporta errores con un registro temporal en CRLF
  error: |-
    el validador falla con el registro en CRLF
    + actual - expected
    + [
    +   'docs/dependencies.md: la dependencia "astro" (dependencies) no está aprobada en el registro'
    + ]
    - []

not ok 5 - REQ-28-04: validateDependencies no reporta errores con los archivos reales
not ok 6 - REQ-28-08: el parser separa líneas con un patrón que acepta LF y CRLF
  error: 'el parser no separa líneas con split(/\\r?\\n/) (REQ-28-08)'
not ok 7 - REQ-28-07: check-format.mjs termina sin errores del registro de dependencias
  error: |-
    check-format reporta dependencias sin aprobar: FORMATO ✘ docs/dependencies.md: la dependencia "@astrojs/cloudflare" (dependencies) no está aprobada en el registro
    FORMATO ✘ docs/dependencies.md: la dependencia "astro" (dependencies) no está aprobada en el registro
    FORMATO ✘ docs/dependencies.md: la dependencia "wrangler" (dependencies) no está aprobada en el registro
    FORMATO ✘ docs/dependencies.md: la dependencia "@cloudflare/workers-types" (devDependencies) no está aprobada en el registro

not ok 9 - REQ-29-01: docs/dependencies.md existe y registra las 4 aprobadas con todos los campos
  error: 'docs/dependencies.md: falta la entrada aprobada "astro" (REQ-29-01)'
not ok 10 - REQ-29-01: versión y ámbito del registro cubren package.json (dependencies + devDependencies)
  error: 'docs/dependencies.md: "@astrojs/cloudflare" (dependencies) sin entrada aprobada (REQ-29-01/02)'
not ok 13 - REQ-29-02/03: el validador no falla con el registro y package.json reales
# tests 16
# pass 7
# fail 9
```

Los 3 tests **preexistentes** de REQ-29 que leen el registro real fallan
también (REQ-28-06 en rojo). Este bloque es el rojo del fichero de test
**definitivo**: para reproducirlo se restauró temporalmente
`git show HEAD:scripts/validate-dependencies.mjs` (el parser sin el fix), se
ejecutó la suite y se volvió a instalar el fix.

## 3. Fix aplicado

Un solo archivo de código: `scripts/validate-dependencies.mjs` (66 → 72 líneas,
muy por debajo del límite de 100 → **REQ-28-09**, sin módulo hermano). Diff
completo:

```diff
@@ cabecera
 // (claves: version, scope, approved, motivo). Node stdlib, <=100 líneas.
+// El parseo tolera finales de línea LF y CRLF (REQ-28-01..03, feature 28).

 // Parsea el registro en un Map package -> { package, fields }.
+// Los finales de línea pueden ser LF o CRLF (REQ-28-01/02/08): con
+// core.autocrlf=true y sin .gitattributes, docs/dependencies.md llega en CRLF
+// en Windows. Por eso se separan las líneas con /\r?\n/ y las regex absorben
+// cualquier resto con (.+?)\s*$ en vez de (.+)$: en JavaScript `.` no matchea
+// un line terminator como \r, así que `(.+)$` nunca casaría con "### astro\r".
 export function parseRegistry(content) {
   const entries = new Map();
   let current = null;
-  for (const line of content.split('\n')) {
-    const header = line.match(/^###\s+(.+)$/);
+  for (const line of content.split(/\r?\n/)) {
+    const header = line.match(/^###\s+(.+?)\s*$/);
     if (header !== null) {
       current = { package: header[1].trim(), fields: {} };
       entries.set(current.package, current);
       continue;
     }
     if (current === null) continue;
-    const field = line.match(/^-\s*([a-z]+)\s*:\s*(.+)$/);
+    const field = line.match(/^-\s*([a-z]+)\s*:\s*(.+?)\s*$/);
     if (field !== null) current.fields[field[1]] = field[2].trim();
   }
   return entries;
 }
```

Tres cambios, tal y como recomienda el spec y el research §3 opción A:

1. `content.split(/\r?\n/)` (REQ-28-02): LF y CRLF son delimitadores válidos, así
   que el `\r` desaparece **antes** de aplicar las regex.
2. `(.+?)\s*$` en las dos regex como red de seguridad: absorbe cualquier resto de
   espacios/CR aunque la separación no lo haya quitado (tolerancia a
   trailing whitespace) y evita la trampa del metacarácter `.` (REQ-28-01/03).
3. `.trim()` de los grupos se conserva, así que ningún valor arrastra `\r`
   (REQ-28-03).

Nada más cambia: `validateDependencies`, `check-format.mjs`, `package.json` y
`docs/dependencies.md` quedan intactos.

## 4. Ciclo VERDE

### 4.1 Tests de la feature + los preexistentes del registro

```console
$ node --test tests/dependencies-registry-crlf.test.mjs tests/dependencies-registry.test.mjs
ok 1 - REQ-28-01/02/03: con CRLF y con LF el parser devuelve las mismas entradas, sin \\r
ok 2 - REQ-28-03/08: el docs/dependencies.md real se parsea entero, sin \\r y con sus 4 entradas
ok 3 - REQ-28-05: validateDependencies no reporta errores con un registro temporal en CRLF
ok 4 - REQ-28-05: validateDependencies no reporta errores con un registro temporal en LF
ok 5 - REQ-28-04: validateDependencies no reporta errores con los archivos reales
ok 6 - REQ-28-08: el parser separa líneas con un patrón que acepta LF y CRLF
ok 7 - REQ-28-07: check-format.mjs termina sin errores del registro de dependencias
ok 8 - REQ-28-09: el validador del registro no supera las 100 líneas
ok 9 - REQ-29-01: docs/dependencies.md existe y registra las 4 aprobadas con todos los campos
ok 10 - REQ-29-01: versión y ámbito del registro cubren package.json (dependencies + devDependencies)
ok 11 - REQ-29-02: el validador falla con una dependencia de package.json sin registro
ok 12 - REQ-29-03: el validador falla con una entrada del registro sin campos obligatorios
ok 13 - REQ-29-02/03: el validador no falla con el registro y package.json reales
ok 14 - REQ-29-04/05: los documentos del arnés documentan la política de aprobación exclusiva del humano
ok 15 - REQ-29-06: check-format.mjs integra la validación del registro
ok 16 - REQ-29-01..06: el validador del registro existe y no supera las 100 líneas
# tests 16
# pass 16
# fail 0
```

Los tests de REQ-29 **no se han modificado** (`git diff -- tests/dependencies-registry.test.mjs`
vacío): sus aserciones de contrato se conservan tal cual y simplemente pasan.

### 4.2 Formato

```console
$ node scripts/check-format.mjs ; echo "---exit $?"
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
---exit 0
```

### 4.3 Suite completa

```console
$ pnpm test
1..549
# tests 549
# pass 549
# fail 0

# 6 ejecuciones consecutivas: 6/6 en verde, 0 fallos
```

### 4.4 `./init.sh`

```console
$ ./init.sh ; echo "exit=$?"
=== init.sh: verificando entorno ===

--- Herramientas y dependencias ---
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)

--- Archivos del harness ---
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe

--- Formato ---
✔ formato de feature_list.json y progress/current.md

--- Tests ---
✔ tests al 100% (node:test)

--- Build ---
✔ build de producción (pnpm build)

✔ El entorno está perfecto. Podemos empezar a trabajar.
exit=0
```

**100% verde: 0 errores de formato, 0 tests fallidos (549/549), build OK.**

## 5. Trazabilidad REQ ↔ test

| REQ | Test (en `tests/dependencies-registry-crlf.test.mjs`) |
|-----|----------------------------------------------------------|
| REQ-28-01 | `REQ-28-01/02/03` (deepEqual de entradas y valores CRLF vs LF) |
| REQ-28-02 | `REQ-28-01/02/03` + `REQ-28-05` (fixture CRLF y LF) |
| REQ-28-03 | `REQ-28-01/02/03` (valores del fixture) y `REQ-28-03/08` (registro real) |
| REQ-28-04 | `REQ-28-04` (archivos reales) |
| REQ-28-05 | `REQ-28-05` × 2 (fixtures temporales CRLF y LF) |
| REQ-28-06 | los 3 tests preexistentes de REQ-29, sin tocar |
| REQ-28-07 | `REQ-28-07` (`spawnSync` de `scripts/check-format.mjs`) |
| REQ-28-08 | `REQ-28-08` (inspección del `split(/\r?\n/)` y de `(.+?)\s*$`) + `REQ-28-03/08` (4 entradas del registro real conservadas) |
| REQ-28-09 | `REQ-28-09` (≤100 líneas) |
| REQ-28-10 | `pnpm test` (549/549) + `./init.sh` en verde (§4.4) |

## 6. Desviaciones, hallazgos y notas

1. **`status` de la feature 28 sin tocar.** Sigue `pending` por instrucción
   explícita del líder; el `done` va tras el `APPROVED` de `progress/review_28.md`.
2. **Sin módulo hermano.** El fix cabe en el propio validador (72 ≤ 100 líneas),
   así que no hizo falta dividirlo (lo contemplaba el encargo por si acaso).
3. **Tests nuevos en fichero propio** (`tests/dependencies-registry-crlf.test.mjs`,
   113 líneas) en vez de ampliar `tests/dependencies-registry.test.mjs` (ya de 141):
   así no se tocan los tests de REQ-29 ni su cabecera de contrato, y la
   trazabilidad feature↔test queda 1:1. Las 113 líneas son comentarios de
   cabecera y mensajes de aserción; ningún test del arnés impone 100 líneas a los
   ficheros de `tests/` (sí a `scripts/validate-dependencies.mjs`, REQ-28-09).
4. **Test de inspección de REQ-28-07 por `spawnSync`**: usa
   `fileURLToPath(CHECK_FORMAT_URL)`; con `URL.pathname` en Windows el spawn
   fallaba con ENOENT y la aserción pasaba en falso. Además comprueba
   `result.error === undefined` para que el test no pueda quedar verde por no
   ejecutar nada.
5. **Flakiness preexistente ajena a esta feature.** Con la máquina tranquila la
   suite es estable: **6 de 6 ejecuciones `pnpm test` en verde (549/549)** y
   `./init.sh` en verde. Bajo carga (build o procesos conviviendo) aparece
   ~1 de cada 4 un fallo **preexistente y ajeno** a la feature 28:
   `tests/hero-ui-refactor.test.mjs` (`REQ-09-05`) muere con
   `ENOENT: no such file or directory, open '...\src\styles\tmp-audit.css'`,
   porque `tests/cleanup-dead-code.test.mjs:80` (REQ-12-06) escribe y borra ese
   fichero temporal **dentro de `src/`** y `node --test` ejecuta los ficheros en
   paralelo: el glob de `src/` de `hero-ui-refactor` lo lee a mitad de vida.
   Evidencia de que no lo introduce esta feature: con el árbol sin los cambios
   de la 28 (parser de HEAD y sin el test nuevo) la suite corrió 4/4 sin ese
   fallo; con ellos, 6/6 en verde; el fallo solo apareció bajo carga. **No lo
   he tocado** porque pertenece a las features 9 y 12 (una sesión, una feature):
   el arreglo natural es el mismo patrón que aplica esta feature —mover el
   fixture de `cleanup-dead-code.test.mjs` a `node:os.tmpdir()` y hacer el
   `scripts/audit-design-tokens.mjs` que acepta una ruta externa, o que
   `hero-ui-refactor.test.mjs` salte ficheros que desaparecen a mitad de glob— y
   el líder decide si abre una feature para ello.
6. **`src/pages/about.astro` aparece modificado en el working tree** con un
   `<section><h1>Articulos dedicados a la ingeniería de software aplicada…`
   añadido al final. **No es un cambio mío** (esta feature solo toca
   `scripts/validate-dependencies.mjs` y `tests/`; ningún test del arnés escribe
   en `src/pages/`: los únicos `writeFileSync` de `tests/` son los de
   `cleanup-dead-code.test.mjs` sobre `src/styles/tmp-audit.css` y los fixtures
   temporales de los tests del registro). Lo dejo **sin revertir** por si es una
   edición humana en curso; con la suite completa pasa en verde
   (`pnpm test` 549/549 con ese contenido presente).
7. **`worker-configuration.d.ts`**: `pnpm build` lo regenera (hash de wrangler) y
   con el `.env` local del líder añade `IN_MAINTENANCE` al diff. Lo he revertido
   para no ensuciar el cambio de la feature; **volverá a cambiar en cada
   `./init.sh`** mientras exista ese `.env` (es comportamiento del build, no de
   este fix).
8. **`docs/dependencies.md` intacto**: `git diff -- docs/dependencies.md` vacío.
   Sus finales de línea siguen siendo CRLF y el validador los tolera. No se ha
   añadido `.gitattributes` ni normalizado el archivo (opciones B y D del
   research, explícitamente fuera de alcance).
