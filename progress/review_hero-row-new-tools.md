# Review — feature 2 `hero-row-new-tools`

**Veredicto:** APPROVED

- **Feature**: id 2 — `hero-row-new-tools` («Fila nueva del hero con bash, webassembly, astro, opencode y tauri»).
- **Spec**: `specs/02_hero-row-new-tools/requirements.md` (REQ-02-01..13) + `design.md` (Decisiones 1-8, tabla de tokens, trazabilidad).
- **Petición humana (2026-10-21, verbatim)**: «En las cards del hero pon una nueva fila con los los sprites de bash, web assembly, astro, opencode, y tauri, la card grande sera la de astro.»
- **Revisado por**: reviewer (nivel 1) — 2026-10-21.
- **Alcance**: `src/data/hero-cards.json`, `src/styles/tokens.css`, `src/styles/hero-card-brands.css` (nuevo), `src/components/hero-card.astro`, `tests/hero-row-new-tools.test.mjs` (nuevo), `tests/hero-row-new-tools-styles.test.mjs` (nuevo), `tests/hero-grid-explicit-rows.test.mjs` (ajuste del `MAP`).
- **Dependencias**: `depends_on: [1]`; la feature 1 está `done` (aprobada en `progress/review_hero-grid-explicit-rows.md`). No se salta ninguna dependencia.

---

## 1. Resumen

La feature inserta en el mosaico del hero la franja pedida por el humano: **`bash`, `webassembly`, `astro` (grande), `opencode`, `tauri`** declarada como `row: 2`, con las redes sociales renumeradas a `row: 3` para mantenerlas en la esquina inferior derecha. El dominio **no** se toca (la feature 1 ya resolvió `row` → franja); la feature 2 es de **datos + tokens + estilos**.

El review **reprodujo de forma independiente** las afirmaciones críticas del informe del implementer (no las acepté por referencia):

| Afirmación del informe | Verificación del reviewer | Resultado |
|---|---|---|
| Ciclo rojo: 10 tests en rojo antes del código | `git archive HEAD` → temporal y ejecución de los tests **nuevos** contra el código **previo** | **Idéntico en lo esencial**: los 8 checks reales de la feature 2 fallan con los mismos mensajes (`falta el token de bash`, `ENOENT … hero-card-brands.css`, `actual: []` vs `expected: ['bash','webassembly','astro','opencode','tauri']`, `no hizo match /import "..\/styles\/hero-card-brands\.css"/`) |
| Colocación: fila 2 = 5 tarjetas, `astro` en el hueco grande de 4 columnas, 12 columnas | Tabla calculada por el motor actual + **medida en el navegador** (CDP, 1280 px) | **Coinciden carácter a carácter** con el `MAP` del test y con la tabla del informe |
| Colocación sin huecos ni solapamientos | CDP: intersección de rectángulos de las 5 tarjetas | `solapes: []`; huecos 14/15/13/15 px (= `--gap-card`) |
| `astro` legible en su hueco grande | Captura propia ampliada ×3 de la tarjeta | Glifo «A» de Astro **reconocible**, con el degradado magenta; recorte inferior coherente con el estilo del sitio |
| 0 errores de consola a 375/768/1024/1280 | CDP con `Runtime.exceptionThrown`, `Runtime.consoleAPICalled` y `Log.entryAdded` | **0 errores** en los cuatro anchos |
| `tokens.css` compactado sin perder tokens | Diff semántico de los 51 tokens de `HEAD` contra los 56 actuales | **0 tokens perdidos, 0 valores cambiados**, 5 nuevos (los de la feature) |
| Ajuste del `MAP` de la feature 1 legítimo | Comparación con el addendum de `progress/impl_hero-grid-explicit-rows.md` + recuento de líneas | **Legítimo**: solo cambian `MAP`, recuentos (15 → 20) y lista de `row`; el resto del archivo idéntico (+6 líneas = 1 `MAP` + 4 nota + 1 lista) |

Además `./init.sh` está **verde** (entorno, formato, tests 18/18, build) y `node scripts/audit-design-tokens.mjs` responde `AUDIT ✔`.

---

## 2. Checkpoints del protocolo de revisión

- C1 — **Test-first real** (test escrito antes del código y observado en rojo): [x]
  Reproducido por el reviewer: `git archive HEAD` a un directorio temporal + `node --test` de los
  tests nuevos contra el código previo → **8 de 9 checks de la feature 2 en rojo** por las razones
  correctas (faltan tokens, falta la hoja, falta el import, faltan las tarjetas y su colocación).
  Fase verde reproducida en el repo: `tests 18 / pass 18 / fail 0`.
- C2 — **Trazabilidad REQ ↔ acceptance ↔ test** (los 13 REQ implementados de verdad, sin REQ solo citado): [x]
  Ver tabla §3. Los 7 `acceptance` de `feature_list.json` tienen respaldo real; ningún test es
  tautológico (el motor real, el repositorio real, el CSS real, el `git diff` real).
- C3 — **Coherencia con `design.md`** (Decisiones 1-8): [x]
  Ver tabla §4: las 8 decisiones se respetan literalmente, con los mismos valores propuestos.
- C4 — **Arquitectura y convenciones** (`docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`): [x]
  Estilos fuera del `.astro`, sin `<style>`, tokens y nunca colores sueltos, datos solo por
  repositorio, sin dependencias nuevas, estático por defecto, `≤ 100 líneas` en **todos** los
  archivos tocados (§5).
- C5 — **`./init.sh` en verde y regresión visual verificada por el reviewer**: [x]
  Verde completo; regresión visual hecha por el reviewer a 375/768/1024/1280 px con capturas y
  medidas propias (§6).

## 2.1 `CHECKPOINTS.md` (evaluación del estado del proyecto tras esta feature)

- [x] Estilos en `src/styles/*.css`; ningún `.astro` con `<style>` (`grep` sin resultados).
- [x] Sin lógica JS en archivos de UI; el frontmatter de `hero-card.astro` solo importa y pasa datos.
- [x] Ningún componente lee JSON directamente: todo pasa por `HeroCardsRepository` (fijado por test).
- [x] Colores/espaciados/radios solo de `tokens.css` (`audit-design-tokens.mjs` en verde; el diff de `tokens.css` solo añade 5 tokens y reordena el bloque en dos marcas por línea).
- [x] ≤ 100 líneas por archivo en el alcance de la feature (máximo real: 100, el test de la feature 1).
- [x] Sin dependencias externas nuevas (`package.json`, `pnpm-lock.yaml` y `docs/dependencies.md` sin modificar).
- [x] `src/data/*.json` válido y tipado por su entidad (`HeroCardsRepository` → `parseHeroCards`).
- [x] Los repositorios validan y lanzan errores nombrados (`HeroCardsDataError`), sin fallos silenciosos.
- [x] `./init.sh` termina en verde (tests 18/18 + build).
- [x] La página se ve correcta en desktop y móvil (≤768 px) sin errores en consola → **verificado por el reviewer** con capturas propias: 1280 px (franja nueva completa), 1024 px (mosaico aplanado, iconos legibles), 768/375 px (franja oculta por diseño, página limpia). **0 errores de consola** en los cuatro anchos.
- [ ] `feature_list.json` tiene la tarea en `done` → **lo pone el líder** tras este APPROVED (la feature 2 está en `in_progress`; el reviewer no modifica `feature_list.json`).
- [x] `progress/current.md` documenta la sesión; `progress/history.md` recibe el resumen al cerrar (el líder lo mueve en el cierre de sesión).
- [x] No quedan archivos temporales, `print()` de debug ni TODOs sin contexto.

> Nota: **no he modificado `CHECKPOINTS.md`** (ni `src/`, `tests/`, `feature_list.json`, `specs/`), igual que en el review de la feature 1: su estado global («features 1-38 `done`», del ciclo 30) está desactualizado respecto al backlog regenerado y lo actualiza el líder en el cierre del ciclo.

---

## 3. Trazabilidad REQ → implementación → test (verificada en el código)

| REQ | Implementación (archivo:línea) | Test | ¿Cubierto? |
|-----|-------------------------------|------|------------|
| REQ-02-01 | `src/data/hero-cards.json:12-16` (5 tarjetas con `icon: /assets/svg/sprite.svg#<id>` y `colorToken: <id>`) | `hero-row-new-tools.test.mjs:18-33` (ids, sprite, colorToken, categoría, `href`, tipos) + `:34-45` (repositorio real) | Sí |
| REQ-02-02 | `:12-16` (`"row": 2` en las cinco) | `:24` (`card.row === 2`) y `:37` (sobre el repositorio) | Sí |
| REQ-02-03 | `:14` (`"featured": true` solo en `astro`) | `:32` (`deepEqual` → `['astro']`) y `:38` | Sí |
| REQ-02-04 | `:12-16` (`"showOnMobile": false`) | `:26` y `:39`; comprobado además en navegador (768/375 px → `display: none`) | Sí |
| REQ-02-05 | `astro` con `colSpan 4 / rowSpan 2` en la fila 2 (`hero-grid-template.ts`, sin cambios) | `:46-57` (`[4,2]` para `astro`) | Sí |
| REQ-02-06 | `bash, webassembly, opencode, tauri` en los huecos pequeños, en ese orden | `:48` (orden de la fila) y `:51` (`[2,2]` para las cuatro) | Sí |
| REQ-02-07 | La fila 2 suma 12 columnas y ocupa una sola franja | `:52` (una sola fila de rejilla), `:53-56` (columna 1 → 12, suma 12) | Sí |
| REQ-02-08 | `src/styles/tokens.css:47-51` (los 5 `--color-marca-*`) | `hero-row-new-tools-styles.test.mjs:14-19` | Sí |
| REQ-02-09 | `src/styles/hero-card-brands.css:10-14` (`--card-bg: var(--color-marca-…)`) | `:20-27`; comprobado además en navegador (fondo computado por tarjeta) | Sí |
| REQ-02-10 | `hero-card-brands.css:12` (`astro`: `--icon-width: 200px`, `--icon-scale: 6`) vs `:10,11,13,14` (110-115 px / 5) | `:28-42` (compara numéricamente astro contra cada una de las cuatro); verificado en navegador (valores computados) | Sí |
| REQ-02-11 | `hero-card-brands.css:18-24` (`@media (max-width: 1200px)`) | `:43-55` (escala del bloque < escala de escritorio, para las cinco); verificado en navegador a 1024 px | Sí |
| REQ-02-12 | `public/assets/svg/sprite.svg` sin tocar; los 5 symbols ya existían | `:58-64` (`git diff --quiet HEAD` + los 5 `<symbol id=…>`) | Sí |
| REQ-02-13 | Capturas a 375/768/1024/1280 px | `hero-row-new-tools.test.mjs` no lo cubre (es regresión visual manual, por diseño de la spec) → **verificado por el reviewer** (§6) | Sí (manual) |

**Acceptance de `feature_list.json` → respaldo real:**

| Acceptance | Respaldo verificado |
|---|---|
| A1 (5 tarjetas con sprite/colorToken/`row: 2`/`featured` solo en astro/`showOnMobile: false`; redes sociales a `row: 3`) | `hero-cards.json:12-21` + test `:18-45` |
| A2 (fila 2 con las 5 en ese orden, `astro` en `colSpan 4`, otras en 2, franja de 12 columnas) | Tabla del motor **recalculada por el reviewer** + `test:46-57` + medidas del navegador |
| A3 (los 5 tokens en `tokens.css`; ningún color fuera) | `tokens.css:47-51` + `test:14-19` + `audit-design-tokens.mjs` en verde |
| A4 (una regla `[data-color-token]` por marca con `--card-bg: var(--color-marca-…)`) | `hero-card-brands.css:10-14` + `test:20-27` |
| A5 (`astro` con `--icon-width` y `--icon-scale` mayores que las pequeñas) | `hero-card-brands.css:12` + `test:28-42` + valores computados en navegador |
| A6 (breakpoint de 1200 px con la escala reducida) | `hero-card-brands.css:18-24` + `test:43-55` + escala 3 medida a 1024 px |
| A7 (sprite sin cambios y con los 5 symbols) | `git diff --quiet HEAD -- public/assets/svg/sprite.svg` vacío + symbols presentes (`bash` 32×32, `webassembly` 24×24, `astro` 85×107, `opencode` 24×24, `tauri` 256×289) |
| A8 (regresión visual a 375/768/1280 px) | Ver §6. **Matiz**: a 375/768 px la fila está **oculta por diseño** (`showOnMobile: false`, Decisión 8), de modo que A8 (tal como está redactada) y REQ-02-04/REQ-02-13 son **mutuamente excluyentes**; la implementación respeta el REQ y la Decisión 8 y lo documenta (`impl_…md` §5 y §8.6). No lo considero bloqueante (ver H2) |

Ningún test es tautológico: el de colocación usa el **motor real** sobre el **repositorio real**, el de datos usa el **JSON real**, los de estilos leen el **CSS real** y comparan valores numéricos, y el del sprite usa `git diff` real. El `MAP` de regresión de la feature 1 es una lista literal de valores esperados (no una comparación consigo mismo).

---

## 4. Coherencia con `design.md` (Decisiones 1-8)

| Decisión | Verificación | Estado |
|----------|--------------|--------|
| **D1** — la fila nueva es la `row: 2`, no la última | `hero-cards.json`: las 5 nuevas con `"row": 2`; las redes sociales con `"row": 3`; el motor sitúa la fila 2 en la franja de rejilla 9 (entre la zona superior y la última) | Cumple |
| **D2** — las redes sociales pasan de `row: 2` a `row: 3` | `hero-cards.json:17-21` (`bun`, `claude`, `typescript`, `youtube`, `github` → `row: 3`); el motor confirma `youtube`/`github` en las columnas 9 y 11 de la última franja → **siguen en la esquina inferior derecha** | Cumple |
| **D3** — `featured` solo en `astro` | `hero-cards.json:14` (única `featured` de la fila 2); el motor asigna el hueco grande de 4 columnas a la `featured` de cada franja | Cumple |
| **D4** — hoja nueva `src/styles/hero-card-brands.css`, importada por `hero-card.astro` | Hoja de 24 líneas; `hero-card.astro:5` `import "../styles/hero-card-brands.css";` (junto a las otras tres); `hero-card.css` sigue en 99 líneas sin tocar | Cumple |
| **D5** — `tokens.css` se compacta, no se divide | Un solo archivo de tokens: 99 → **97** líneas; el bloque de marcas pasa a dos marcas por línea; **0 tokens perdidos y 0 valores alterados** (diff semántico 51 → 56 tokens); se conserva el aviso de la feature 101 sobre el contraste de `nestjs` | Cumple |
| **D6** — geometría del icono | Valores idénticos a los propuestos: `astro` 200 px / −8° / escala 6; `bash` 115 px / −8°; `webassembly` 110 px / −8°; `opencode` 110 px / 0°; `tauri` 115 px / −8°; a ≤1200 px las cuatro bajan a escala 3 y `astro` a 150 px / escala 3. **Valores computados en navegador verificados** a 1280 y 1024 px | Cumple |
| **D7** — el sprite no se toca | `git diff --stat -- public/assets/svg/sprite.svg` **vacío**; los 5 symbols ya existían | Cumple |
| **D8** — `showOnMobile: false` en las cinco | `hero-cards.json:12-16`; en navegador a 768 y 375 px las 5 tienen `display: none` (regla `hero-section.css:67`, REQ-106-09) | Cumple |

Nota de desviación (declarada en `impl_…md` §8.1 y **correcta**): las cuatro pequeñas declaran `--icon-scale: 5` explícito, que es el valor que ya aplicaba la base `.hero-card` (`hero-card.css:6`); no cambia el render, solo hace verificable in-fichero el REQ-02-10.

---

## 5. Convenciones, arquitectura y límite de líneas

`wc -l` ejecutado por el reviewer sobre **todo lo tocado**:

```
  97  src/styles/tokens.css            100  tests/hero-grid-explicit-rows.test.mjs
  24  src/styles/hero-card-brands.css    70  tests/hero-row-new-tools.test.mjs
  41  src/components/hero-card.astro     56  tests/hero-row-new-tools-styles.test.mjs
  22  src/data/hero-cards.json          99  src/styles/hero-card.css (sin cambios)
```

Ningún archivo pasa de 100 líneas. Comprobaciones adicionales:

- **Estilos fuera del `.astro`**: `grep "<style"` en `src/components/**` → sin resultados; el `.astro` solo importa hojas y pasa datos (`hero-card.astro` 41 líneas, frontmatter con imports + `Astro.props`).
- **Tokens, nunca colores sueltos**: `node scripts/audit-design-tokens.mjs` → `AUDIT ✔`; los 5 hex nuevos viven solo en `tokens.css`; en CSS los fondos son `var(--color-marca-…)`.
- **Cascada correcta**: en el CSS de producción (`dist/client/_astro/home.*.css`) la base `.hero-card` (`--icon-rotation: 12deg`, `--icon-scale: 5`) aparece **antes** que las reglas de marca (offsets 3616 < 10065-10307), y los valores computados en el navegador lo confirman.
- **Datos por repositorio**: el JSON se sigue leyendo solo por `HeroCardsRepository` → `parseHeroCards` → `HeroGridCard`; el `.astro` no toca el JSON. No hay ningún sitio con un número de tarjetas fijo (grep de `\b15\b` en `src/` y `tests/`: sin contadores de tarjetas).
- **Sin dependencias nuevas**: `package.json`, `pnpm-lock.yaml` y `docs/dependencies.md` sin modificar; `scripts/check-format.mjs` en verde.
- **Estático por defecto**: cero JS de runtime nuevo; el sprite no se toca; la animación "lego" (`hero-cards-motion.ts`) es agnóstica al número de tarjetas (`legoOrder(count, rng)`).
- **Sin `print()` de debug ni TODOs**: revisados los 4 ficheros de la feature y los 3 tests.
- **Formato**: `node scripts/check-format.mjs` → `FORMATO ✔`.

---

## 6. Regresión visual (REQ-02-13) — hecha por el reviewer

Dev server `astro dev` (pid 34400, `localhost:4321`), página del hero `/home`. Chrome headless 154 por
CDP (WebSocket global de Node), con `Emulation.setDeviceMetricsOverride` y lectura de
`Runtime.exceptionThrown` / `Runtime.consoleAPICalled` / `Log.entryAdded`.

| Ancho | Fila nueva | Medidas del reviewer | Consola | Evidencia |
|-------|------------|----------------------|---------|-----------|
| **1280 px** | visible, 5 tarjetas | `bash` x=32 · `webassembly` x=235 · **`astro` x=439 (393 px = 4 columnas)** · `opencode` x=845 · `tauri` x=1049, todas `y=969` (una sola franja de 204 px de alto); `solapes: []`; huecos 14/15/13/15 px | **0 errores** | `progress/research/hero-row-new-tools/review-1280px.png`, `review-medidas-1280.json` |
| **1024 px** (≤1200 px) | visible (mosaico aplanado en 6 columnas, comportamiento **preexistente** de `hero-card.css:74-75`, `grid-column/grid-row: auto !important`) | los 5 iconos con escala **3** y `astro` con ancho **150 px** (valores computados) | **0 errores** | `review-1024px.png`, `review-computed-1024.json` |
| **768 px** | **oculta por diseño** | las 5 con `display: none`, `w=0 h=0` | **0 errores** | `review-768px.png`, `review-medidas-768.json` |
| **375 px** | **oculta por diseño** | ídem | **0 errores** | `review-375px.png`, `review-medidas-375.json` |

**Legibilidad de `astro` (criterio explícito de la revisión)**: captura ampliada ×3 de la tarjeta
(`review-astro-zoom-1280px.png`): el glifo es la «A» blanca del logo de Astro con el degradado
magenta, **inequívocamente reconocible**; el recorte inferior del glifo es el mismo recurso de estilo
que ya usan las grandes del sitio (`node` con su hexágono, `nestjs` con el ave, `typescript` con el
«TS»), y la «A» no tapa el título «ASTRO» (esquina superior izquierda, `z-index: 4`). Las cuatro
pequeñas se distinguen entre sí (hexágono con `$_` de bash, «WA» violeta de webassembly, cuadrado
blanco de opencode, logo ámbar/cian de tauri) y ninguna invade su título. La franja suma 12 columnas
completas, sin huecos ni solapamientos.

---

## 7. Ajuste del test de la feature 1 (`tests/hero-grid-explicit-rows.test.mjs`)

**Es legítimo y no se ha rebajado ninguna comprobación.** Comparado con la versión fijada en el
addendum de `progress/impl_hero-grid-explicit-rows.md` (94 líneas):

| Cambio | Motivo | Verificación del reviewer |
|--------|--------|----------------------------|
| `MAP` (líneas 24-29): 15 → 20 entradas | La colocación cambia de forma legítima al insertar la fila nueva | La tabla nueva **recalculada por el reviewer con el motor** coincide entrada a entrada, y las **coordenadas medidas en el navegador** (x=32/235/439/845/1049 → columnas 1/3/5/9/11) confirman que el `MAP` no se ha limitado a copiar la salida de la implementación |
| `placed.length` y unicidad de ids: 15 → 20 | El mosaico coloca 20 tarjetas | Comprobado por el reviewer: 20 tarjetas, 20 ids únicos |
| Lista de `row` del JSON: 10 → 15 tarjetas (filas 1/2/3) | Es exactamente el dato que cambia la feature 2 | Coincide con `hero-cards.json` |
| Título del test REQ-01-14 | Cosmético | — |

Lo que **no** ha cambiado: el parseo de `row` (REQ-01-01/02), la zona superior y sus errores
(REQ-01-03..06), la franja de 5 tarjetas con la `featured` en el hueco grande (REQ-01-07..09), los
errores de franja (REQ-01-10/11) y de redes sociales (REQ-01-12/13) y la higiene de 100 líneas.
El recuento de líneas cuadra exactamente: 94 → 100 = +1 (`MAP`) +4 (nota «Ajuste feature 2») +1
(lista de `row`): **no se ha eliminado ni rebajado ninguna aserción con valor** (la aserción
tautológica `real() vs real()` ya había sido sustituida por tres comprobaciones con contenido en el
addendum de la feature 1).

---

## 8. Higiene del diff (`git status` / `git diff`)

- **De esta feature (2)**: `src/data/hero-cards.json` (5 tarjetas nuevas + `row` de las 5 de las redes sociales), `src/styles/tokens.css` (5 tokens + compactación del bloque), `src/styles/hero-card-brands.css` (nuevo), `src/components/hero-card.astro` (+1 import), `tests/hero-row-new-tools.test.mjs` (nuevo), `tests/hero-row-new-tools-styles.test.mjs` (nuevo), `tests/hero-grid-explicit-rows.test.mjs` (ajuste del `MAP`).
- **De la feature 1 (ya aprobada, sin commit)**: `src/domain/hero-grid-{layout,template,rows,error}.ts`, `src/domain/entities/hero-card.ts`, `src/domain/repositories/hero-cards-{parse,fields-parse}.ts`.
- **Ajeno a esta feature**: `src/middleware.ts` (+1 línea en blanco al final). **No lo he tocado** (no me corresponde): lo debería revertir el líder antes del commit (H1).
- Sin archivos temporales en el repo; mis capturas y mediciones quedan como artefacto permanente en `progress/research/hero-row-new-tools/` (`review-*.png`, `review-medidas-*.json`, `review-computed-*.json`).

---

## 9. Hallazgos

### Bloqueantes

**Ninguno.** Los 13 REQ están implementados y probados, los 7 `acceptance` tienen respaldo real, las
8 decisiones del `design.md` se respetan con los valores exactos propuestos, la evidencia rojo→verde
es reproducible, el límite de 100 líneas se cumple, `./init.sh` está en verde y la regresión visual
la ha hecho el reviewer con 0 errores de consola.

### No bloqueantes (observaciones / recomendaciones)

- **H1 — `src/middleware.ts` con un cambio ajeno** (línea en blanco final, línea 20). No pertenece a
  la feature: lo revierte el líder antes del commit (no lo he modificado yo).
- **H2 — contradicción interna de la spec entre REQ-02-04 y REQ-02-13/A8.** REQ-02-04 exige
  `showOnMobile: false` en las cinco tarjetas y la Decisión 8 lo confirma; REQ-02-13 y el `acceptance`
  A8 hablan de «mostrar la fila nueva completa a 375 px y 768 px», lo cual es imposible con lo
  anterior (y con la regla del sitio REQ-106-09). La implementación resuelve el choque a favor del
  REQ (fila oculta en móvil) y lo documenta (`impl_…md` §5 y §8.6). Recomendación para un ciclo
  posterior (spec_author/humano): reescribir REQ-02-13 y A8 como «a 1280 px la fila nueva completa;
  a 375/768 px la página se ve limpia y sin la fila».
- **H3 — el glifo de `astro` queda algo descentrado hacia la derecha** dentro de su hueco grande (la
  «A» ocupa el tercio derecho de la tarjeta, dejando el lado izquierdo vacío). Es **legible** y
  coherente con el estilo del sitio (los iconos sangran por el borde derecho), por lo que no lo
  considero bloqueante; si en una iteración futura se quisiera centrarlo, el ajuste es en
  `src/styles/hero-card-brands.css:12` (`--icon-width`/`--icon-rotation`), nunca en el `.astro`.
- **H4 — la nota «Ajuste feature 2 (precedente REQ-43-06)» referencia un REQ que no existe en este
  ciclo** (el backlog se regeneró con las features 1 y 2; `REQ-43-06` era del ciclo 30). El
  implementer ya lo documenta (`impl_…md` §8.7). Recomendación: en el siguiente ajuste, referenciar
  `specs/02_hero-row-new-tools/requirements.md` en lugar de un REQ inexistente.
- **H5 — `tests/harness-kit-integrity.test.mjs` sigue sin existir** (lo borró el commit `7697d5c
  cleaning`; `docs/verification.md:71` lo cita como el candado que rechaza vaciar `features` sin
  justificación). Ya anotado como H6 en el review de la feature 1; fuera del alcance de esta feature
  (que es de datos/estilos), pero conviene restaurarlo.
- **H6 — `CHECKPOINTS.md` y `progress/history.md` desactualizados** (el primero dice «features 1-38
  `done`» del ciclo 30; el segundo sigue con la plantilla). Los actualiza el líder en el cierre de
  sesión; también ahí va el paso a `done` de la feature 2.

---

## 10. Cambios requeridos

**Ninguno.** No hay hallazgos bloqueantes: la feature puede pasar a `done`.

Acciones para el líder (no bloquean la aprobación):

1. Marcar la feature 2 como `done` en `feature_list.json` (conservándola en el array).
2. Revertir el cambio ajeno de `src/middleware.ts` (línea en blanco final) antes del commit (H1).
3. Mover el resumen de `progress/current.md` a `progress/history.md` y vaciar `current.md`; refrescar
   el estado global de `CHECKPOINTS.md` (H6).
4. Opcional (ciclos siguientes): H2 (aclarar REQ-02-13/A8), H3 (centrado del glifo de `astro`),
   H4 (referencia de la nota), H5 (restituir el test del candado del harness).

---

## 11. Evidencia de los comandos ejecutados por el reviewer

```
$ ./init.sh
  ✔ node / pnpm / node_modules · ✔ AGENTS.md · ✔ feature_list.json · ✔ progress/current.md
  ✔ formato de feature_list.json y progress/current.md
  ✔ tests al 100% (node:test)   ✔ build de producción (pnpm build)
  ✔ El entorno está perfecto. Podemos empezar a trabajar.

$ node --test "tests/**/*.test.mjs"
  ℹ tests 18   ℹ pass 18   ℹ fail 0

$ node scripts/audit-design-tokens.mjs
  AUDIT ✔ ningún color fuera de tokens.css en src/styles

$ node scripts/check-format.mjs
  FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos

$ git archive HEAD | tar -x -C <temp>/head            # código previo a las features 1 y 2
$ cp tests/hero-row-new-tools*.test.mjs tests/hero-grid-explicit-rows.test.mjs <temp>/head/tests/
$ cd <temp>/head && node --test "tests/**/*.test.mjs"
  → ℹ tests 18  ℹ pass 2  ℹ fail 16
  → los 8 checks reales de la feature 2 en rojo por las razones correctas
    («falta el token de bash», ENOENT hero-card-brands.css, actual [] vs las 5 marcas,
     no hizo match el import de la hoja nueva)
  → REQ-02-12 falla solo por artefacto del harness temporal (sin .git: `git diff` devuelve 1);
    en el repo está verde

$ node <temp>/placement.mjs                # tabla de colocación calculada con el motor actual
  → 20 tarjetas; fila 2 = bash c1x2 · webassembly c3x2 · astro c5x4 · opencode c9x2 · tauri c11x2 (12 columnas)
  → fila 3 = typescript c1x4 · bun c5x2 · claude c7x2 · youtube c9x2 · github c11x2 (social al final)
  → idéntica a la tabla del informe y al MAP del test

$ node <temp>/visual.mjs 1280|1024|768|375 <png> <json>   # Chrome headless por CDP
  → 1280: x=32/235/439/845/1049, y=969, solapes: [], huecos 14/15/13/15, 0 errores de consola
  → 1024: mosaico aplanado (6 columnas), escala 3 y astro a 150 px, 0 errores
  → 768/375: las 5 con display:none (showOnMobile: false), 0 errores

$ node <temp>/computed.mjs 1280|1024       # valores computados de las 5 tarjetas
  → 1280: bash 115px/5/-8deg, webassembly 110px/5/-8deg, astro 200px/6/-8deg,
          opencode 110px/5/0deg, tauri 115px/5/-8deg; fondos = los 5 tokens de marca
  → 1024: las cinco a escala 3; astro a 150 px

$ git diff --stat -- public/assets/svg/sprite.svg   # (vacío)
$ git show HEAD:src/styles/tokens.css → diff semántico de tokens
  → 51 tokens en HEAD, 56 ahora; 0 perdidos, 0 cambiados, 5 nuevos (los de la feature)

$ wc -l src/styles/tokens.css src/styles/hero-card-brands.css src/styles/hero-card.css \
       src/components/hero-card.astro src/data/hero-cards.json tests/*.mjs
  → 97 / 24 / 99 / 41 / 22 / 100 / 70 / 56   (ninguno > 100)

$ git status --porcelain && git diff --stat
  → 4 modificados de la feature 2 + 1 hoja nueva + 3 tests (2 nuevos) + 6 modificados de la
    feature 1 (aprobada) + 1 ajeno (src/middleware.ts) + feature_list.json / progress / specs
```
