# Review — feature 1 `hero-grid-explicit-rows`

**Veredicto:** APPROVED

- **Feature**: id 1 — `hero-grid-explicit-rows` («El mosaico del hero se coloca por filas declaradas en los datos»).
- **Spec**: `specs/01_hero-grid-explicit-rows/requirements.md` (REQ-01-01..14) + `design.md` (Decisiones 1-6).
- **Revisado por**: reviewer (nivel 1) — 2026-10-21.
- **Alcance**: `src/domain/hero-grid-{layout,template,rows,error}.ts`, `src/domain/entities/hero-card.ts`, `src/domain/repositories/hero-cards-{parse,fields-parse}.ts`, `src/data/hero-cards.json`, `tests/hero-grid-explicit-rows.test.mjs`.
- **Dependencias**: la feature 1 no declara `depends_on` → sin dependencias pendientes que saltar.

---

## 1. Resumen

La feature convierte el reparto del mosaico del hero (dos colas globales) en franjas
declaradas en los datos: la tarjeta de icono declara un `row` opcional (entero ≥ 1);
las tarjetas **sin** `row` forman la zona superior y cada valor de `row` forma una franja
de 5 tarjetas con la `featured` en el hueco grande. El motor valida cada franja con
`HeroGridLayoutError` y los datos (`src/data/hero-cards.json`) se migran declarando
`row` en las 10 tarjetas de las franjas inferiores **sin mover ninguna**.

El review **reprodujo de forma independiente** las tres afirmaciones críticas del
informe del implementer (rojo TDD, regresión de colocación y no-regresión visual) y
todas se sostienen:

| Afirmación del informe | Verificación del reviewer | Resultado |
|---|---|---|
| Ciclo rojo: 6 de 9 tests en rojo antes del código | `git archive HEAD` a un directorio temporal y ejecución del **test nuevo** contra el código **previo** a la feature | Idéntico: `tests 9 / pass 3 / fail 6`, mismos nombres y **mismos mensajes** (`undefined !== 3`, `hay 1 tecnologías con featured…`, `se reciben 9 tarjetas…`, `Missing expected exception … /s0/`, `ENOENT … hero-grid-rows.ts`) |
| Regresión REQ-01-14 (misma franja, span y columna) | Motor de `HEAD` + JSON de `HEAD` vs. motor actual + JSON actual | **Idénticas** las dos tablas y **idénticas** al `MAP` fijado en el test (líneas 20-24) |
| El mosaico visible no cambia | Build de producción de **HEAD** vs. build actual, comparación de `dist/client/home/index.html` y de los 6 CSS | Markup del `.hero-grid` **byte a byte idéntico** (orden y spans); los 6 CSS **byte a byte idénticos** |

Además `./init.sh` está en verde (entorno, formato, tests 9/9, build) y
`node scripts/audit-design-tokens.mjs` responde `AUDIT ✔`.

---

## 2. Checkpoints del protocolo de revisión

- C1 — **Test-first real** (el test se escribió antes del código y se vio en rojo): [x]
  La evidencia no es una declaración: el reviewer reconstruyó el estado previo
  (`git archive HEAD` → temp) y ejecutó el test actual contra él. El resultado
  reproducido es **exactamente** el rojo del informe (`impl_…md` §3.1): mismos 6 fallos,
  mismos mensajes. La fase verde se reproduce con `node --test` en el repo (9/9).
- C2 — **Trazabilidad REQ ↔ acceptance ↔ test** (los 14 REQ implementados, no solo citados): [x]
  Ver tabla §3. No hay REQ sin cobertura real ni `acceptance` sin test que lo respalde.
- C3 — **Coherencia con `design.md`** (Decisiones 1-6 y patrón de huecos): [x]
  Ver tabla §4. Las 6 decisiones se respetan literalmente.
- C4 — **Arquitectura y convenciones** (`docs/architecture.md`, `docs/conventions.md`): [x]
  Lógica en `src/domain/*.ts`, datos solo por repositorio, errores nombrados con
  mensaje en español, sin dependencias nuevas, sin colores sueltos, estático por
  defecto, **todos los archivos tocados ≤ 100 líneas** (§5).
- C5 — **`./init.sh` en verde y no-regresión visual**: [x]
  Verde completo y no-regresión verificada con build comparativo (§1 y §6).

## 2.1 `CHECKPOINTS.md` (estado del proyecto tras esta feature)

- [x] Estilos en `src/styles/*.css`; ningún `.astro` con `<style>` (grep sin resultados; la feature no toca `.astro`).
- [x] Sin lógica JS en archivos de UI (el frontmatter de `new-hero.astro:13` solo importa y pasa datos).
- [x] Ningún componente lee JSON directamente (todo pasa por `HeroCardsRepository`; lo fija el test de higiene, línea 97).
- [x] Colores/espaciados solo de `tokens.css` (`audit-design-tokens.mjs` en verde; la feature no toca `src/styles/`).
- [x] ≤ 100 líneas por archivo **en el alcance de la feature** (máximo real: 98 líneas, el propio test).
- [x] Sin dependencias externas nuevas (`package.json` sin modificar; `docs/dependencies.md` intacto).
- [x] `src/data/*.json` válido y tipado por su entidad.
- [x] Los repositorios validan y lanzan errores nombrados (`HeroCardsDataError`), sin fallos silenciosos.
- [x] `./init.sh` termina en verde (tests 9/9 + build).
- [ ] La página se ve correcta en desktop y móvil (≤ 768 px) sin errores en consola → **pendiente de inspección visual en navegador** (no verificado por el reviewer; no aplica a esta feature porque no cambia el aspecto: verificado a nivel de markup y CSS).
- [ ] `feature_list.json` tiene la tarea en `done` → **lo pone el líder** tras este APPROVED (la feature está en `in_progress`; el reviewer no modifica `feature_list.json`).
- [x] `progress/current.md` documenta la sesión; `progress/history.md` recibe el resumen al cerrar (el líder lo mueve en el cierre de sesión).
- [x] No quedan archivos temporales, `print()` de debug ni TODOs sin contexto.

> Nota: **no he modificado `CHECKPOINTS.md`** (ni `src/`, `tests/`, `feature_list.json`).
> Su estado global ("features 1-38 `done`" del ciclo 30) está desactualizado respecto al
> backlog regenerado y lo actualiza el líder en el cierre del ciclo, junto con el paso a
> `done` de la feature 1.

---

## 3. Trazabilidad REQ → implementación → test (verificada en el código, no por cita)

| REQ | Implementación (archivo:línea) | Test (`tests/hero-grid-explicit-rows.test.mjs`) | ¿Cubierto? |
|-----|-------------------------------|-----------------------------------------------|------------|
| REQ-01-01 | `entities/hero-card.ts:36` `readonly row?: number;` | :26-33 (`parseHeroCards([{...row:3}])[0].row === 3`, ausente → `undefined`) | Sí |
| REQ-01-02 | `repositories/hero-cards-fields-parse.ts:80-87` (`readRow`) + `hero-cards-parse.ts:53` | :30-32 (0, −1, 1.5, `'2'`, `null`, `true` → `HeroCardsDataError` con `hero-cards.json` + índice) | Sí (con matiz, ver H2) |
| REQ-01-03 | `hero-grid-layout.ts:37` (`top = icons.filter(row === undefined)`) + `:40` `topSlots` | :35-42 | Sí |
| REQ-01-04 | `hero-grid-rows.ts:31-40` (`splitFeatured`) + `hero-grid-template.ts:33-40` (`assignToSlots`) | :39-41 (span 5×2 para la `featured`) | Sí |
| REQ-01-05 | `hero-grid-layout.ts:41-45` (zona superior incompleta → error) | :45 (`/zona superior/`) | Sí |
| REQ-01-06 | `hero-grid-rows.ts:36-38` (`featured.length !== 1` → error) | :46-47 (`/featured/`, dos `featured` y cero `featured`) | Sí |
| REQ-01-07 | `hero-grid-rows.ts:17-28` (`groupRows`, agrupado por valor y ordenado ascendente) | :55-56 (`new Set(a.map(p => p.row)).size === 1` por fila) | Sí |
| REQ-01-08 | `hero-grid-template.ts:28-30` (`rowSlots`: grande 4×2 en la franja) | :57-62 (spans 4×2 / 2×2 por fila) | Sí |
| REQ-01-09 | `hero-grid-template.ts:38-39` (`others[index++]` → orden del JSON) | :57-58 (orden exacto `['a2','a0','a1','a3','a4']` y `['b0','b1','b2','b3','b4']`) | Sí |
| REQ-01-10 | `hero-grid-rows.ts:45-49` (`cards.length !== ROW_LENGTH`) | :66-67 (4 y 6 tarjetas → `/fila 1/`) | Sí |
| REQ-01-11 | `hero-grid-rows.ts:36-38` (por fila, `la fila ${row.row}`) | :68-69 (0 y 2 `featured` → `/featured/`) | Sí |
| REQ-01-12 | `hero-grid-rows.ts:56-59` (`card.row !== last.row`) | :73 (`/s0/`) | Sí |
| REQ-01-13 | `hero-grid-rows.ts:52-55` (`social` con `featured`) | :74 | Sí |
| REQ-01-14 | `src/data/hero-cards.json` (solo `"row": N` añadido) + `hero-grid-layout.ts:60-79` (`place()` **sin cambios**) | :77-80 (tabla `MAP` completa) + :82-89 (el JSON declara `row` en las 10 y solo en ellas) | Sí (verificado además por build comparativo) |

**Acceptance de `feature_list.json` → test que lo respalda** (las 5 tienen cobertura real):

| Acceptance | Test(s) |
|---|---|
| A1 (parseo de `row` + `HeroCardsDataError` con archivo e índice) | `REQ-01-01/02` (:26-33) |
| A2 (misma colocación que antes + `row` = franja con `featured` en el hueco grande de 4 columnas y el resto en orden del JSON) | `REQ-01-14` (:77-89) + `REQ-01-07/08/09` (:50-63) |
| A3 (zona superior: `featured` en el grande; incompleta o con dos `featured` → error) | `REQ-01-03/04` (:35-42) + `REQ-01-05/06` (:44-48) |
| A4 (fila con 4/6 tarjetas, 0/2 `featured`, `social` fuera de la última fila o `social` con `featured` → error) | `REQ-01-10/11` (:65-70) + `REQ-01-12/13` (:72-75) |
| A5 (≤ 100 líneas y reparto en módulos hermanos) | `higiene` (:91-98) + `wc -l` del reviewer (ver §5) |

Ningún REQ queda solo citado: en todos los casos el reader localiza el código que lo
implementa y el test que lo ejerce.

---

## 4. Coherencia con `design.md`

| Decisión | Verificación | Estado |
|----------|--------------|--------|
| **D1** — `row` es un entero, no un grupo de texto | `readRow` valida `Number.isInteger(value) && value >= 1` (`hero-cards-fields-parse.ts:83`); `groupRows` ordena por valor (`hero-grid-rows.ts:26`) | Cumple |
| **D2** — «sin `row`» = zona superior (sin segundo campo `zone`) | `hero-grid-layout.ts:37`; la entidad solo añade `row` (`hero-card.ts:36`), no hay campo `zone` | Cumple |
| **D3** — patrón alterno conservado (impar → grande primero; par → grande en 3.ª) | `hero-grid-template.ts:22-30` (`ODD_ROW`/`EVEN_ROW` + `rowSlots`); con filas contiguas reproduce el ritmo anterior (fila 1 = `nestjs` grande primero, fila 2 = `typescript` grande tercero), verificado contra el motor viejo | Cumple |
| **D4** — `HeroGridLayoutError` en módulo propio + re-export | `hero-grid-error.ts:5-10`; `hero-grid-rows.ts:8` lo importa; `hero-grid-layout.ts:10,14` lo importa y **re-exporta** (`export { HeroGridLayoutError }`). Grafo sin ciclos: `error ← rows ← layout`, `error ← layout` | Cumple |
| **D5** — la colocación física no cambia | `place()` y `fits()` (`hero-grid-layout.ts:60-79`) **idénticos** al `HEAD` (el diff no toca esas líneas); solo cambia *qué hueco* recibe cada tarjeta | Cumple |
| **D6** — migración de los datos en esta feature | `src/data/hero-cards.json`: `"row": 1` en nestjs/css/react/html/claude-code, `"row": 2` en bun/claude/typescript/youtube/github; el `git diff` **solo añade** `"row"` (10 líneas cambiadas, ningún título, icono, token ni orden tocado) | Cumple |

Patrón de huecos por fila: cada franja suma 12 columnas × 2 filas
(`4+2+2+2+2` y `2+2+4+2+2`), la `featured` al hueco de 4 columnas, el resto a los de 2 —
coherente con `design.md` §«Reglas de colocación» (puntos 3 y 4).

Orden de salida = orden de los huecos (DOM manda en `grid-auto-flow: row`): con los
datos actuales el orden de huecos coincide con el del JSON, por lo que el HTML generado
es idéntico al anterior (comprobado con el build comparativo).

---

## 5. Convención de arquitectura y límite de líneas

`wc -l` ejecutado por el reviewer sobre **todos** los archivos tocados y sus módulos
hermanos:

```
 10  src/domain/hero-grid-error.ts                  87  src/domain/repositories/hero-cards-fields-parse.ts
 79  src/domain/hero-grid-layout.ts                 78  src/domain/repositories/hero-cards-parse.ts
 60  src/domain/hero-grid-rows.ts                   67  src/domain/entities/hero-card.ts
 40  src/domain/hero-grid-template.ts               98  tests/hero-grid-explicit-rows.test.mjs
 49  src/domain/repositories/hero-cards-repository.ts (sin cambios)
```

**Ningún archivo de la feature llega a 100 líneas** (máximo: el test, 98). El
`hero-grid-layout.ts` baja de 95 → 79 líneas y el reparto en
`hero-grid-rows.ts` / `hero-grid-template.ts` / `hero-grid-error.ts` es exactamente el
previsto por la Decisión 4 y por la restricción «≤ 100 líneas» del `design.md`.

Resto de comprobaciones de arquitectura:

- Lógica en `src/domain/*.ts`; **ningún `.astro` tocado**; el frontmatter de
  `new-hero.astro` sigue siendo solo imports + paso de datos.
- Datos **solo** por repositorio: `HeroCardsRepository` → `parseHeroCards` → entidades.
- Errores explícitos y nombrados, mensajes en español que nombran archivo y fila:
  `hero-cards.json: la tarjeta 0 declara un "row" inválido "0": debe ser un entero >= 1`
  (archivo + índice) y `hero-grid-layout: la fila 1 tiene 4 tarjetas y debe tener 5`.
- Sin dependencias nuevas (`package.json` intacto, `docs/dependencies.md` intacto).
- Sin colores sueltos ni tokens nuevos: la feature no toca `src/styles/` y
  `scripts/audit-design-tokens.mjs` responde `AUDIT ✔`.
- Estático por defecto: no se añade JS de runtime; `public/assets/svg/sprite.svg` intacto.
- Inmutabilidad: `readonly` en la entidad y en las estructuras (`groupRows` devuelve
  `readonly HeroRow[]`).

---

## 6. Regresión (REQ-01-14) y higiene del diff

**Regresión — reproducida por el reviewer (no aceptada por referencia):**

1. Motor de `HEAD` + `hero-cards.json` de `HEAD` →
   `htb 6,1,5x4 · rust 11,1,2x2 · aws 11,3,2x2 · cloudflare 6,5,2x2 · node 8,5,5x2 ·
   nestjs 1,7,4x2 · css 5,7 · react 7,7 · html 9,7 · claude-code 11,7 · bun 1,9 ·
   claude 3,9 · typescript 5,9,4x2 · youtube 9,9 · github 11,9`.
2. Motor actual + `hero-cards.json` actual → **la misma tabla, carácter a carácter**.
3. Esa tabla es exactamente el `MAP` fijado en el test (líneas 20-24) → la regresión
   queda blindada para el futuro.
4. Build comparativo (`astro build` de `HEAD` vs. actual): el bloque `.hero-grid` del
   HTML de producción es **byte a byte idéntico** (mismo orden de `data-color-token`,
   mismos `data-col-span`/`data-row-span`); las únicas diferencias del HTML son el
   UUID y la clave del *server island* de HTB y el orden minificado de los `import` de
   un chunk no relacionado (`search-bar`), ambos artefactos de build. Los **6 CSS**
   son idénticos byte a byte.
5. `git diff src/data/hero-cards.json`: **solo** añade `"row": N` en 10 tarjetas; no
   cambia títulos, iconos, `colorToken`, `rotate`, `scale`, `iconWidth`, `href`,
   `showOnMobile`, `cornerIcon`, `backgroundIcon` ni el orden de las tarjetas.

**Higiene del diff (`git status` / `git diff --stat`):**

- Modificados: `src/data/hero-cards.json`, `src/domain/entities/hero-card.ts`,
  `src/domain/hero-grid-layout.ts`, `src/domain/hero-grid-template.ts`,
  `src/domain/repositories/hero-cards-fields-parse.ts`,
  `src/domain/repositories/hero-cards-parse.ts` → **todos de la feature**.
- Nuevos: `src/domain/hero-grid-error.ts`, `src/domain/hero-grid-rows.ts`,
  `tests/hero-grid-explicit-rows.test.mjs` (+ artefactos del ciclo ya previstos:
  `feature_list.json`, `progress/`, `specs/`).
- **Ajeno a la feature**: `src/middleware.ts` tiene una línea en blanco final añadida
  (`git diff` → `+` al final del archivo). No la he tocado (no me corresponde) y no
  afecta al comportamiento; **conviene que el líder la revierta antes de commitear**
  para que el commit de la feature 1 no arrastre un cambio sin relación.

---

## 7. Hallazgos

### Bloqueantes

**Ninguno.** Los 14 REQ están implementados y probados, las 5 `acceptance` tienen
respaldo en la spec y en un test, las 6 decisiones del `design.md` se respetan, la
evidencia rojo→verde es reproducible, el límite de 100 líneas se cumple y `./init.sh`
está en verde.

### No bloqueantes (observaciones / recomendaciones)

- **H1 — `src/middleware.ts` con un cambio ajeno** (línea en blanco final, línea 20).
  No pertenece a la feature: el líder debería revertirlo antes del commit (no lo he
  modificado yo).
- **H2 — `row` en una tarjeta rica se ignora en silencio.**
  `hero-cards-parse.ts:44` (`parseIconCard`) es el único punto donde se llama a
  `readRow`; `parseRichCard` (`:65`) no lo llama. Leído literalmente, REQ-01-02 dice
  «IF **una tarjeta** declara un "row" que no es un entero ≥ 1 THEN … SHALL lanzar
  `HeroCardsDataError`»: una tarjeta rica con `"row": 0` no dispara el error (se
  descarta en silencio). La lectura natural del REQ es «tarjeta de icono» (REQ-01-01
  define el campo en la entidad de icono) y el implementer lo documenta en
  `impl_…md` §6.6, por lo que no lo considero bloqueante. Recomendación para el
  siguiente ciclo: o validar `row` también en las tarjetas ricas (`readRow` en
  `parseRichCard`), o acotar el texto de REQ-01-02 a «tarjeta de icono» para que la
  spec y el código digan lo mismo.
- **H3 — aserción tautológica en el test.**
  `tests/hero-grid-explicit-rows.test.mjs:79`: `assert.deepEqual(real(), real())`
  compara dos llamadas idénticas y no cubre nada (el `assert` real es el de la línea
  78 contra `MAP`). Recomendación: borrarla o sustituirla por una comprobación con
  contenido (p. ej. que el número de tarjetas colocadas es 15 y que los `id` son
  únicos).
- **H4 — el patrón alterno depende de la paridad del *valor* de `row`.**
  `hero-grid-template.ts:28-30` usa `row % 2`, tal y como fija la Decisión 3 del
  `design.md` («fila impar → …, fila par → …»), y reproduce exactamente el ritmo
  anterior con filas contiguas (1, 2, 3…), que es el caso previsto. Pero si en el
  futuro se declararan filas no contiguas (p. ej. 1 y 3), dos franjas vecinas podrían
  llevar el mismo patrón, lo que el `design.md` describe como undesired. No es un
  defecto de esta feature (es la regla del design); queda anotado para el
  implementer de la feature 2, que usará filas contiguas.
- **H5 — el `acceptance` A5 («ningún archivo del proyecto supera las 100 líneas») es
  literal solo en el alcance de la feature.** Hay archivos preexistentes de más de 100
  líneas ajenos a esta feature: `worker-configuration.d.ts` (generado), contenido en
  `src/content/posts/*.md`, definiciones de agentes en `.opencode/`/`.claude/` y
  `scripts/validate-feature-list.mjs` (138, con la excepción ya documentada en
  `docs/architecture.md` §13). Ninguno lo introduce esta feature.
- **H6 — `tests/harness-kit-integrity.test.mjs` no existe en el repo.**
  `docs/verification.md:71` lo cita como el candado que rechaza vaciar `features`
  sin justificación, pero el commit `7697d5c cleaning` borró `tests/` entero y la
  suite nueva de esta feature no lo restituye. Fuera del alcance de la feature 1
  (que es de dominio/datos), pero el líder debería saber que ese candado ya no está.
- **H7 — `progress/history.md` sigue con la plantilla.** El resumen de la sesión debe
  moverse a `progress/history.md` y `progress/current.md` quedar con la plantilla en
  el cierre de sesión (leader).
- **H8 — la zona superior exige exactamente una `featured`** (0 `featured` →
  `hero-grid-layout: la zona superior tiene 0 tarjetas con featured y necesita una`).
  Es un superconjunto estricto de REQ-01-04/05/06 y es necesario para no dejar un
  hueco grande sin tarjeta; documentado en `impl_…md` §6.3. Sin observaciones.

---

## 8. Cambios requeridos

**Ninguno.** No hay hallazgos bloqueantes: la feature puede pasar a `done`.

Acciones para el líder (no bloquean la aprobación):

1. Marcar la feature 1 como `done` en `feature_list.json` (conservándola en el array).
2. Revertir el cambio ajeno de `src/middleware.ts` (línea en blanco final) antes del
   commit de la feature (H1).
3. Mover el resumen de `progress/current.md` a `progress/history.md` y vaciar
   `current.md` (H7).
4. Opcional (ciclos siguientes): H2, H3 y H6.

---

## 9. Evidencia de los comandos ejecutados por el reviewer

```
$ ./init.sh
  ✔ node / pnpm / node_modules · ✔ AGENTS.md · ✔ feature_list.json · ✔ progress/current.md
  ✔ formato de feature_list.json y progress/current.md
  ✔ tests al 100% (node:test)   ✔ build de producción (pnpm build)
  ✔ El entorno está perfecto. Podemos empezar a trabajar.

$ node --test "tests/**/*.test.mjs"
  ℹ tests 9   ℹ pass 9   ℹ fail 0

$ node scripts/audit-design-tokens.mjs
  AUDIT ✔ ningún color fuera de tokens.css en src/styles

$ git archive HEAD | tar -x -C <temp>            # motor y datos previos a la feature
$ node <temp>/old-placement.mjs                  # tabla de colocación del motor viejo
$ node <temp>/new-placement.mjs                  # tabla de colocación del motor actual
  → ambas idénticas y iguales al MAP del test

$ <temp>/hero-base: IN_MAINTENANCE=false npx astro build   # build de HEAD
$ diff dist/client/home/index.html <temp>/hero-base/dist/client/home/index.html
  → bloque .hero-grid idéntico; los 6 CSS idénticos byte a byte

$ git status --porcelain && git diff --stat
  → 6 modificados (de la feature) + 1 ajeno (src/middleware.ts) + 3 nuevos de dominio/tests
```
