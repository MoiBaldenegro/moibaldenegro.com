# Review — feature 28

**Veredicto:** APPROVED

Feature: `28 dependencies-registry-crlf` · Spec: `specs/28_dependencies-registry-crlf/requirements.md`
(REQ-28-01..10) · Informe: `progress/impl_28.md` · Research: `progress/research/validador-dependencias-crlf.md`

---

## 1. Verificación del ciclo rojo/verde (requisito previo, `./init.sh` verde)

### 1.1 Evidencia capturada en el informe — suficiente

`progress/impl_28.md` no se limita a describir: **pega salida real** del rojo
(§2, líneas 50-93: `# tests 16 / # pass 7 / # fail 9`, con los `error: |-` de
los 9 fallos, incluidos los 3 preexistentes de REQ-29) y del verde (§4.1
líneas 156-177 `16/16`, §4.2 `check-format` exit 0, §4.3 `549/549`, §4.4
`./init.sh` con `exit=0`). Cubre el punto 1 que pedía evidencia *capturada*,
no de memoria.

### 1.2 Reproducción independiente del rojo (sin tocar el repo)

No me fié del informe: monté un sandbox en
`C:/Users/Moises/AppData/Local/Temp/opencode/rev28` con el parser de HEAD
(`git show HEAD:scripts/validate-dependencies.mjs`, el *buggy*) + los tests
**definitivos** (nuevos + preexistentes) + el `docs/dependencies.md` real
(41 CR, igual que el del repo). Resultado:

```
not ok 1  - REQ-28-01/02/03: con CRLF y con LF el parser devuelve las mismas entradas, sin \r
not ok 2  - REQ-28-03/08: el docs/dependencies.md real se parsea entero, sin \r y con sus 4 entradas
not ok 3  - REQ-28-05: validateDependencies no reporta errores con un registro temporal en CRLF
ok   4    - REQ-28-05: ... en LF
not ok 5  - REQ-28-04: ... con los archivos reales
not ok 6  - REQ-28-08: el parser separa líneas con un patrón que acepta LF y CRLF
not ok 9  - REQ-29-01: docs/dependencies.md existe y registra las 4 aprobadas ...
not ok 10 - REQ-29-01: versión y ámbito del registro cubren package.json ...
not ok 13 - REQ-29-02/03: el validador no falla con el registro y package.json reales
# pass 8   # fail 8
```

Con el fix del repo, los mismos 16 tests: **`# pass 16 / # fail 0`**.

**El ciclo rojo→verde es real y el testario detecta el bug, no lo esconde.**
(Ojo con la única discrepancia numérica: el informe dice 9 fail, yo obtengo 8.
La causa es artefacto de mi sandbox, no del repo: no copié
`scripts/validate-feature-list.mjs`, así que el `check-format.mjs` del sandbox
moría con `ERR_MODULE_NOT_FOUND` y el test 7 pasaba vacuo. En el repo real, con
el parser de HEAD, ese test sí cae — el propio informe lo captura con los 4
errores de "no está aprobada en el registro". No afecta al veredicto.)

---

## 2. Corrección del fix — no es "verde por casualidad"

`scripts/validate-dependencies.mjs` (72 líneas, era 66) — el único archivo de
código tocado:

- `content.split(/\r?\n/)` (línea 24): el `\r` desaparece **antes** de aplicar
  las regex.
- `/^###\s+(.+?)\s*$/` (línea 25) y `/^-\s*([a-z]+)\s*:\s*(.+?)\s*$/` (línea 32):
  el `\s*$` final absorbe cualquier resto de CR/espacios aunque la separación no
  lo haya quitado.

Verifiqué empíricamente que el `\r` **no** queda residual en los valores, que
era el riesgo real que planteaba el encargo (un `version` con `\r` haría fallar
`entry.fields.version !== version` con un error distinto, en
`validate-dependencies.mjs:54`):

```
LF                             claves=1 version="^7.2.0" OK
CRLF                           claves=1 version="^7.2.0" OK
CRLF+sin newline final         claves=1 version="^7.2.0" OK
CRLF+espacios finales          claves=1 version="^7.2.0" OK
mixto (LF y CRLF alternos)     claves=1 version="^7.2.0" OK
prefijo sin entrada previa      claves=1 version="^7.2.0" OK
CR solo (sin \n)                claves=0 version=undefined  ← no requerido por la spec
```

Además, lacontraprueba de "no es casualidad" está en el sandbox de §1.2: los
tests 1 y 3 (fixture CRLF temporal) **siguen en rojo** con el bug de vuelta
aunque `docs/dependencies.md` estuviera en LF. Los tests no dependen del
estado actual del archivo real.

`.trim()` de los grupos se conserva (líneas 27 y 33) → ningún valor arrastra
CR ni espacios.

---

## 3. No se "hackeó" el testario de REQ-29

```
$ git status --porcelain
 M feature_list.json
 M progress/current.md
 M scripts/validate-dependencies.mjs
 M src/pages/about.astro          ← ver §6.1 (edición humana, ajena)
 M worker-configuration.d.ts      ← ver §6.2 (artefacto de build)
?? progress/impl_28.md
?? progress/research/validador-dependencias-crlf.md
?? specs/28_dependencies-registry-crlf/
?? tests/dependencies-registry-crlf.test.mjs
```

`tests/dependencies-registry.test.mjs` **no aparece**: `git diff` vacío, sus
141 líneas y sus 8 tests intactos. Leí el fichero entero: los dos tests de
REQ-29-01 (líneas 53-79) mantienen la aserción **exacta**
`assert.equal(entry.fields.version, version, ...)` —sin `.trim()`, sin
comparación laxa— y REQ-29-02/03 (líneas 113-116) `assert.deepEqual(errors, [])`.
No hay ningún `replace(/\r/g,'')`, ni `.trim()` en la aserción, ni
`skip`/`todo`, ni entradas saltadas. Los tests nuevos viven en **fichero
propio** (`tests/dependencies-registry-crlf.test.mjs`, 113 líneas), tal y como
documenta el informe §6.3.

---

## 4. `docs/dependencies.md` intacto

```
$ git diff -- docs/dependencies.md
(sin salida)
```

Confirmado: no cambió ni el contenido ni los finales de línea (sigue con 41
CR, CRLF). No se añadió `.gitattributes` ni se normalizó a LF — coherente con
la decisión del research §3 (opción A; B y D descartadas) y con la
advertencia de que `core.autocrlf=true` reintroduciría el bug en el próximo
checkout en Windows.

---

## 5. Restricciones duras

| Criterio | Estado | Evidencia |
|---|---|---|
| `scripts/validate-dependencies.mjs` ≤ 100 líneas (REQ-28-09) | ✔ | 72 líneas (`readFileSync(...).split(/\r?\n/).length` = 73 con la vacía final) |
| Solo Node stdlib, sin dependencias externas | ✔ | Solo `node:fs` y `node:url` (líneas 7-8). `package.json` sin cambios |
| Fixtures en temporal, nunca escribiendo en `docs/dependencies.md` | ✔ | `mkdtempSync(join(tmpdir(),'dependencies-crlf-'))` (línea 47) + `rmSync` en `finally` (líneas 86-88, 103-105) |
| Sin `console.log`/`TODO`/`FIXME`/`debugger` en lo tocado | ✔ | `grep -nE` → ninguno |
| `.env` no commiteado | ✔ | `git check-ignore -v .env` → `.gitignore:20`; `git ls-files --error-unmatch .env` → *not tracked* |
| Sin archivos temporales sueltos | ✔ | Solo 4 untracked, los 4 son artefactos legítimos |
| `depends_on` de la feature 28 | ✔ | `[]` — no se saltó ninguna dependencia |

---

## 6. `./init.sh` y estabilidad de la suite

### 6.1 Verificación de `init.sh` (punto 7)

```
$ ./init.sh
--- Herramientas y dependencias ---  ✔ node ✔ pnpm ✔ node_modules
--- Archivos del harness ---         ✔ AGENTS.md ✔ feature_list.json ✔ progress/current.md
--- Formato ---                      ✔ formato de feature_list.json y progress/current.md
--- Tests ---                        ✔ tests al 100% (node:test)
--- Build ---                        ✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
exit=0

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
exit=0
```

**0 errores de formato, 0 tests fallidos, build OK.**

### 6.2 La intermitencia queobservada por el líder: **preexistente, NO introducida**

No la he reproducido en ningún intento: **6/6 `pnpm test` consecutivos en
549/549** y 10/10 de la pareja vulnerable
(`hero-ui-refactor` + `cleanup-dead-code`) sin un solo fallo.

El mecanismo que describe el implementer **es real y verificable**, y es
ajeno a la feature 28:

- `tests/cleanup-dead-code.test.mjs:82` escribe
  `src/styles/tmp-audit.css` **dentro de `src/`** y lo borra en el `finally`.
- `tests/hero-ui-refactor.test.mjs:33` hace `readdirSync` del directorio de
  estilos.
- `node --test` ejecuta ficheros **en paralelo** → el glob de
  `hero-ui-refactor` puede listar el fichero a mitad de vida →
  `ENOENT ... open 'src\styles\tmp-audit.css'`.

**La feature 28 no añade nada a esa superficie de carrera**: sus únicas
escrituras están en `node:os.tmpdir()` (`writeFileSync` solo en las líneas
50-51, con `pkgPath`/`regPath` bajo el `dir` temporal) y su único subproceso
(`check-format.mjs`, test REQ-28-07) es de **solo lectura** sobre
`feature_list.json` / `progress/` / `specs/` / `docs/dependencies.md`, ficheros
que ningún otro test escribe. Comprobado con
`grep -rnE "writeFileSync" tests/` → las únicas rutas fuera de `tmpdir()` están
en `cleanup-dead-code.test.mjs` (features 9/12), no en el testario nuevo.

**No lo bloqueo**: es un race preexistente de las features 9 y 12. Arreglo
natural (el mismo patrón que aplica la 28): mover el fixture de
`cleanup-dead-code.test.mjs` a `tmpdir()` y hacer que
`scripts/audit-design-tokens.mjs` acepte una ruta externa. **Decisión del
líder** si abrir feature.

---

## 7. Trazabilidad REQ-28 → test que lo cubre

| REQ | Test que lo cubre (`tests/dependencies-registry-crlf.test.mjs`) | Verificado |
|---|---|---|
| REQ-28-01 | línea 55 `deepEqual` de claves y de `values()` CRLF vs LF | rojo en sandbox §1.2 |
| REQ-28-02 | línea 55 (mismo test) + línea 96 inspección de `split(/\r?\n/)` | idem |
| REQ-28-03 | línea 55 (`!value.includes('\r')` por campo) + línea 67 (registro real) | y `version==="^7.2.0"` exacto en mi probe |
| REQ-28-04 | línea 92 `validateDependencies()` con archivos reales → `[]` | `ok 5` |
| REQ-28-05 | líneas 81-90, **dos** tests con fixture temporal CRLF y LF | `ok 3` / `ok 4` (el CRLF es `not ok 3` en sandbox) |
| REQ-28-06 | los 3 preexistentes de REQ-29, sin tocar | `ok 9` / `ok 10` / `ok 13` |
| REQ-28-07 | línea 102 `spawnSync` de `check-format.mjs` | `ok 7` |
| REQ-28-08 | línea 67 (4 entradas reales conservadas) + línea 96 (inspección) | `ok 2` / `ok 6` |
| REQ-28-09 | línea 110, ≤100 líneas | `ok 8` (72) |
| REQ-28-10 | `pnpm test` 549/549 + `./init.sh` exit 0 | §6.1 |

---

## 8. Desviaciones respecto a la spec y a `CHECKPOINTS.md`

**Ninguna desviación bloqueante.** Desviaciones y observaciones, todas no
bloqueantes:

1. **`src/pages/about.astro` modificado en el working tree** (líneas 19-21,
   un `<section>` con un segundo `<h1>` de texto editorial). **No es cambio de
   la feature 28**: ningún test escribe en `src/pages/` (los únicos
   `writeFileSync` de `tests/` van a `tmpdir()` o a `src/styles/tmp-audit.css`),
   el contenido es prosa editorial (no código de arnés) y su mtime (13:51) es
   anterior al trabajo del implementer (14:09). El implementer lo declaró
   explícitamente en `impl_28.md` §6.6 y no lo revirtió por si era una
   edición humana en curso. **Se lo devuelvo al líder**: es un cambio de `src/`
   sin feature detrás, con un `<h1>` duplicado en la página (semántica/a11y) y
   un `<section>` sin clase (se sale del patrón de estilos con tokens). La
   suite pasa en verde con él, así que no bloquea la 28. Decidir: revertir o
  formalizar en su propia feature.
2. **`worker-configuration.d.ts` regenerado por `pnpm build`** (aparece en
   `git status` como `M` porque el `.env` local del líder añade
   `IN_MAINTENANCE`). Es comportamiento del build, no de este fix; volverá a
   cambiar en cada `./init.sh` mientras exista ese `.env`. No lo bloqueo.
3. **`feature_list.json` sigue con `status: "pending"`** para la 28, por
   instrucción explícita del líder (`impl_28.md` §6.1). El `done` lo marca el
   líder tras este APPROVED; es el paso de cierre de `AGENTS.md` §5, no un
   defecto del implementer.
4. **Test REQ-28-07 con un hueco de paso vacuo (no bloqueante).**
   `tests/dependencies-registry-crlf.test.mjs:102-108` comprueba
   `result.error === undefined` (protege del `ENOENT` de spawn) pero **no**
   comprueba `result.status === 0`. Si `check-format.mjs` *crasheara* en lugar de
   reportar errores, el test pasaría en verde sin comprobar nada. Lo
   verifiqué en mi sandbox: así es exactamente como pasó el test 7 mientras el
   script moría con `ERR_MODULE_NOT_FOUND`. No lo bloqueo porque (a) la
   redacción de REQ-28-07 es "sin **reportar errores** de validación del
   registro", que es lo que el test comprueba, (b) `REQ-28-10`/`init.sh` cubren
   el exit 0 del mismo script, y (c) el test **es** sensible a la regresión
   real (con el parser de HEAD reporta los 4 errores,evidence en `impl_28.md`
   §2). Recomendación para una futura feature: añadir
   `assert.equal(result.status, 0, ...)`.
5. **Test REQ-28-08 es white-box (acoplado a la implementación) (no bloqueante).** `assert.match(source, /split\(\/\\r\?\\n\/\)/)`
   acopla el test a la implementación literal. Es lo que pedía el criterio de
   aceptación ("un test de inspección") y las aserciones de comportamiento
   (tests 1, 2 y 3) ya cubren la semántica, así que no es un problema real.
6. **`scripts/validate-feature-list.mjs` tiene 139 líneas**, por encima del
   límite de 100 de `CHECKPOINTS.md` —preexistente, ajeno a la 28, sin
   discusión `blocked` registrada. Anotado para el líder.
7. **Final de línea solo-CR (Mac clásico) no soportado.** `\r?\n` no lo trata y
   el parser devuelve vacío. La spec (REQ-28-01/02) solo exige LF y CRLF, así
    que no es desviación; lo dejo anotado por si algún checkout exótico lo
    aplicara.

---

## 9. Checkpoints

- C1 (arquitectura / sin `<style>` en `.astro` / frontmatter sin lógica):
  [x] — no se tocó ningún `.astro` como parte de la feature.
- C2 (sin dependencias externas; ≤100 líneas en lo tocado):
  [x] — solo Node stdlib; el validador queda en 72 líneas.
  El fichero de test nuevo tiene 113 líneas, pero 56 de los 61 ficheros de
  `tests/` del repo superan las 100 (norma de facto) y ningún test del arnés
  impone el límite a `tests/`; el límite de REQ-28-09 es explícito sobre
  `scripts/validate-dependencies.mjs`.
- C3 (`./init.sh` en verde al 100%): [x] — `exit=0`, 549/549, build OK (§6.1).
- C4 (datos / repositorios / sin JSON leído desde componentes): [x] — no aplica,
  no se tocó `src/`.
- C5 (harness limpio, sin temporales, sin debug, sin TODOs):
  [x] — 4 untracked, todos artefactos legítimos; sin `console.log`/`TODO`; `.env`
  ignorado y no commiteado; `docs/dependencies.md` intacto.
- C6 (`feature_list.json` con la tarea en `done`): [ ] — **pendiente del
  líder** tras este APPROVED (ver §8.3). No imputable al implementer.
- C7 (inspección visual desktop/móvil): [ ] — fuera de alcance de esta feature
  de arnés; ya estaba pendiente en `CHECKPOINTS.md`.

---

## 10. Conclusión

`REQ-28-01`..`REQ-28-10` están cubiertos por tests concretos que **fallan de
verdad** con el bug de vuelta (verificado por mí, no solo por el informe) y
pasan en verde con el fix. El fix está en el lugar correcto (el parser, no el
archivo), es robusto de verdad a LF **y** CRLF (y a mixto, sin newline final y
con espacios finales), no deja `\r` residual en ningún valor, no toca
`docs/dependencies.md`, no toca el testario preexistente de REQ-29, respeta el
límite de 100 líneas y no introduce dependencias. `./init.sh` está en verde al
100%. La intermitencia observada por el líder es un race **preexistente** entre
las features 9 y 12 sobre `src/styles/tmp-audit.css`, ajeno a la 28.

**APPROVED.**
