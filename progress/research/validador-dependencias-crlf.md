# Análisis — El validador del registro de dependencias no parsea `docs/dependencies.md` en CRLF

> Sesión del spec_author. El diagnóstico previo (lider) fue verificado de nuevo y
> ampliarlo con el análisis de alternativas. Fuera de alcance: la comprobación de
> `IN_MAINTENANCE` (el líder la resolvió con un `.env` local; no entra en el
> backlog). La brecha de clon limpio que sí existe con esa variable se documenta
> en §6 como **no dada de alta** por colisión de numeración.

## 1. Qué es

`./init.sh` falla en 3 comprobaciones. Dos de ellas (4 errores de formato de
`check-format.mjs` + 3 tests rojos de `tests/dependencies-registry.test.mjs`) tienen
una **única causa raíz**: el parser de `scripts/validate-dependencies.mjs` divide
el registro con `content.split('\n')` y sus dos regex terminadas en `$` no
absorben el `\r` residual de un archivo con finales de línea CRLF. El parser
devuelve un `Map` vacío y el validador concluye que *ninguna* dependencia está
aprobada.

## 2. Qué toca (verificado en disco)

| Hecho | Cómo se verificó | Estado |
|-------|------------------|--------|
| `docs/dependencies.md` está en CRLF | `file docs/dependencies.md` → `CRLF line terminators`; `xxd` → `0d0a` | Real, en el working tree |
| El repo no tiene `.gitattributes` | `git ls-files \| grep -i gitattr` → vacío | No existe |
| `core.autocrlf` está activo | `git config --get core.autocrlf` → `true` | Activo |
| Todos los `.md` versionados están en CRLF | barrido con `file` sobre `git ls-files '*.md'`: `AGENTS.md`, `CHECKPOINTS.md`, `docs/architecture.md`, `docs/conventions.md`, `docs/dependencies.md`, `docs/verification.md`, `progress/*.md`, `.opencode/agents/*.md`… | Sí, **todos** |
| El contenido del registro es correcto | 4 entradas (`astro`, `@astrojs/cloudflare`, `wrangler`, `@cloudflare/workers-types`) con `version`, `scope`, `approved`, `motivo` | Correcto, no se toca |
| El parser devuelve vacío | `parseRegistry(readFileSync('docs/dependencies.md','utf8'))` → `[]` | Confirmado |
| Las regex no matchean con `\r` final | `/^###\s+(.+)$/.test("### astro\r")` → `false`; `/^-\s*([a-z]+)\s*:\s*(.+)$/.test("- version: ^7.2.0\r")` → `false` | Confirmado |
| Errores de `check-format.mjs` | 4: `@astrojs/cloudflare`, `astro`, `wrangler` (dependencies) y `@cloudflare/workers-types` (devDependencies) «no está aprobada en el registro» | Reproducido con `node scripts/check-format.mjs` |
| Tests rojos | `node --test tests/dependencies-registry.test.mjs` → 5 pass / **3 fail**: los dos de REQ-29-01 (parsean el registro real) y REQ-29-02/03 «no falla con el registro y package.json reales» | Reproducido |
| Otros consumidores de `.md` en el arnés | `validate-specs.mjs:23` también hace `split('\n')` pero **trima cada línea antes de aplicar sus regex** → inmune a CRLF; `validate-progress.mjs` solo usa `startsWith`/`includes` → inmune; `validate-feature-list.mjs` parsea JSON | **Solo `validate-dependencies.mjs` está roto** |
| Riesgo de ampliar a más archivos | Ningún otro script del arnés parsea `.md` con regex ancladas en fin de línea | El arreglo puede ser local y de un archivo |

### Por qué `.` no matchea `\r` (mecánica del bug)

En JavaScript el metacarácter `.` de una regex **no** matchea los *line
terminators*, que incluyen `\r`, `\n`, `\u2028` y `\u2029` (a diferencia de Python
o PCRE con DOTALL). Como `content.split('\n')` deja el `\r` pegado al final de
cada línea, `(.+)$` no puede absorberlo y la regex falla entera: no hay *match
parcial* que se pueda recuperar. Consecuencia: 0 cabeceras y 0 campos
reconocidos → `Map` vacío → 4 errores de "no aprobada" + 3 tests rojos.

## 3. Alternativas evaluadas

### A. Arreglar el parser (robusto a los finales de línea) — **RECOMENDADA**

- `content.split(/\r?\n/)` para que el `\r` desaparezca antes de aplicar las
  regex, y/o grupos `(.+?)\s*$` en las dos regex como red de seguridad para
  cualquier resto de espacios/CR.
- Costo: 2-3 líneas en un archivo de 66 líneas (queda en ≤100 de sobra).
- Ventaja: **el validador deja de depender de cómo el sistema de archivos de la
  máquina que hizo el checkout dejó los `.md`**. Con `core.autocrlf=true` y sin
  `.gitattributes`, normalizar el archivo es una solución que se deshace sola en
  el siguiente `git checkout` en Windows:   el bug volvería sin que nadie toque el
  código. Es decir, la opción B **no es una corrección, es un parche dependiente
  del entorno**.

### B. Normalizar `docs/dependencies.md` a LF — **DESCARTADA**

- Un solo `writeFileSync(..., 'utf8')` con `\n` lo arregla hoy.
- Pero `core.autocrlf=true` (verificado) y sin `.gitattributes` (verificado):
  cualquier checkout en Windows reintroduce el CRLF y `check-format` vuelve a
  fallar con los mismos 4 errores. Un clon en macOS/Linux no reproduce el bug,
  así que el fallo aparecería solo en algunos agentes: la peor forma de bug.
- Además es una dependencia oculta entre el contenido de un documento y el
  sistema de archivos, justo lo contrario de la robustez que pide el arnés.

### C. Ambas (parser robusto + archivo en LF) — DESCARTADA como parte de la feature

- El fix del parser es condición **necesaria y suficiente**; normalizar el `.md`
  añadiría un cambio de contenido en el working tree que volvería a ensuciarse
  con el próximo checkout y además generaría ruido en el diff de un documento
  que hoy es correcto. No aporta valor de verificación.

### D. Añadir un `.gitattributes` con `* text=auto eol=lf` — **FUERA DE ALCANCE**

- Es la solución de infrastructure correcta a medio plazo, pero toca el
  comportamiento de fin de línea de **todo** el repo (incluidos `.ts`, `.astro`,
  `.json` y los `.md` de docs ya commitados), lo que puede producir diffs
  masivos y romper la suite en Linux/macOS. Merece su propia feature discutida
  con el humano, no colarse en un fix de parser. Queda anotada como
  recomendación en §6.

## 4. Decisiones

1. **El fix es en el parser, no en el archivo** (opción A). `docs/dependencies.md`
   conserva su contenido y sus finales de línea actuales; lo que se exige es que
   el parser lo tolere (REQ-28-01, REQ-28-02, REQ-28-08).
2. **Test-first con fixtures en los dos formatos**: un test que escribe un
   registro temporal con `\r\n` y otro con `\n` y verifica que
   `validateDependencies` devuelve `[]` en ambos casos es la prueba de que el
   bug está muerto y no solo escondido (REQ-28-05). Es el test que hoy **no
   puede existir en verde**: antes del fix fallaría con el fixture CRLF.
3. **No se toca `docs/dependencies.md`**: el contenido ya cumple el contrato de
   REQ-29-01; el defecto era del lector, no del registro.
4. **Alcance de un solo archivo**: `scripts/validate-dependencies.mjs` + los tests
   de `tests/dependencies-registry.test.mjs`. `validate-specs.mjs` es inmune
   (trima), así que no se unifica ni se extrae un helper compartido (evitaría
   tocar dos validadores por un bug de uno solo).
5. **Complejidad simple → 1 feature** (un archivo de código + un archivo de
   test): no procede descomponer.
6. **Sin design.md**: no toca UI ni presentación.

## 5. Feature dada de alta

| id | name | depends_on | Alcance |
|----|------|-----------|---------|
| 28 | `dependencies-registry-crlf` | — | Parser tolerante a CRLF + tests en ambos formatos + verde de `check-format`, `tests/dependencies-registry.test.mjs` y `./init.sh` |

Trazabilidad REQ → acceptance en `specs/28_dependencies-registry-crlf/requirements.md`
y en los `acceptance` de la feature.

## 6. Hallazgos que NO se han dado de alta (para decisión del líder)

1. **`.env.example` / build de un clon limpio.** `astro.config.mjs:9` declara
   `IN_MAINTENANCE: envField.boolean({ access: 'public', context: 'client' })`
   **sin `default`**, y `.gitignore:20` ignora `.env`. Un clon limpio (sin `.env`
   local) falla en `pnpm build`/`dev`. Es una brecha real de reproducibilidad,
   pero **no se da de alta** por dos razones:
   - El líder la excluyó expresamente del alcance de esta sesión.
   - **Colisión de numeración**: el id 29 ya está semanticamente ocupado en este
     repo. `scripts/validate-dependencies.mjs:2` y
     `tests/dependencies-registry.test.mjs` (completo) citan `REQ-29-01..06` de
     la feature histórica *29 dependencies-registry*
     (`progress/research/registro-dependencias-aprobadas.md` §5), que es
     precisamente el artefacto que esta feature 28 hace pasar. Crear una feature
     29 nueva emitiría `REQ-29-xx` ambiguos en el mismo árbol. Si el humano la
     quiere, corresponde a un id libre agreed (p. ej. 30+) o a un renumerado
     explícito del backlog.
2. **`.gitattributes`** (opción D): candidata a feature propia cuando el humano
   valore normalizar los finales de línea a LF en todo el repo. No es necesaria
   para cerrar el rojo actual.
3. **Precedente de huecos de numeración**: `specs/` conserva directorios 21, 24 y
   33-44 sin feature correspondiente en el `feature_list.json` actual (el backlog
   se regeneró limpio). El id 28 está libre en el array y en el árbol de REQ
   (`grep -rl "REQ-28-" tests/ specs/ scripts/ docs/` → sin resultados), por lo
   que la feature 28 no colisiona con nada vivo.
