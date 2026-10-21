# Análisis — Fila nueva de herramientas en el mosaico del hero (bash, webassembly, astro, opencode, tauri)

> Petición humana (2026-10-21, verbatim): «En las cards del hero pon una nueva fila
> con los los sprites de bash, web assembly, astro, opencode, y tauri, la card
> grande sera la de astro.»
> Análisis del spec_author del ciclo 2026-10-21 (features 1 y 2 del backlog
> regenerado).

---

## 1. Qué pide exactamente la petición

En el mosaico de tarjetas del hero (`src/components/new-hero/new-hero.astro`)
hay que añadir **una fila nueva de 5 tarjetas** con los sprites de **bash**,
**webassembly**, **astro**, **opencode** y **tauri**. Dentro de esa fila:

- **astro** ocupa el hueco grande (4 columnas × 2 filas),
- **bash**, **webassembly**, **opencode** y **tauri** ocupan los huecos pequeños
  (2 columnas × 2 filas).

La petición no dice **dónde** va la fila (ni si las redes sociales se mueven), no
menciona colores de marca ni tamaños de icono, y no pide tocar el sprite
(regla del repo: `public/assets/svg/sprite.svg` no se modifica).

## 2. Estado actual verificado (código + simulación)

### 2.1 Piezas del mosaico

| Capa | Archivo | Estado |
|------|---------|--------|
| Datos | `src/data/hero-cards.json` | 15 tarjetas: 1 rica (`htb`) + 14 de icono |
| Repositorio | `src/domain/repositories/hero-cards-repository.ts` → `hero-cards-parse.ts` → `hero-cards-fields-parse.ts` | valida y lanza `HeroCardsDataError` |
| Entidad | `src/domain/entities/hero-card.ts` (64 líneas) | `HeroCard` (icono) + `HeroRichCard` |
| Motor | `src/domain/hero-grid-layout.ts` (95 líneas) | reparte y coloca; lanza `HeroGridLayoutError` |
| Plantilla | `src/domain/hero-grid-template.ts` (31 líneas) | `TOP_SLOTS` (5 huecos) + `ROW_PATTERNS` alternos |
| UI | `src/components/new-hero/new-hero.astro` → `hero-cards/hero-grid-card.astro` → `hero-card.astro` | emite solo `data-col-span`/`data-row-span` |
| Estilos | `src/styles/hero-card.css` (99 líneas), `src/styles/tokens.css` (99 líneas) | tokens de marca + regla `[data-color-token]` por tarjeta |

### 2.2 Cómo coloca hoy el motor (clave del problema)

`layoutHeroCards()` reparte por **dos colas globales**, no por filas:

1. `featured` (tecnologías con `featured: true`) → los **huecos grandes** en orden de JSON.
2. resto de tecnologías + redes sociales → los **huecos pequeños** en orden de JSON
   (las sociales siempre las últimas).
3. La zona superior son los 5 primeros huecos; las filas inferiores son bloques
   de 5 huecos con patrón alterno: fila par `[4, 2, 2, 2, 2]` (grande primero),
   fila impar `[2, 2, 4, 2, 2]` (grande en 3.ª posición).

Invariantes que lanza `HeroGridLayoutError`: (a) las tarjetas fuera de la zona
superior son múltiplo de 5; (b) el nº de `featured` de tecnología coincide con
el nº de huecos grandes; (c) las `social` caen en la última fila.

### 2.3 Simulación (réplica del motor, ejecutada aparte del repo)

Con los datos actuales (15 tarjetas) las franjas visuales son:

```
fila 1: htb@c6 | rust@c11
fila 3: aws@c11
fila 5: cloudflare@c6 | node@c8
fila 7: nestjs(GRANDE)@c1 | css@c5 | react@c7 | html@c9 | claude-code@c11
fila 9: bun@c1 | claude@c3 | typescript(GRANDE)@c5 | youtube@c9 | github@c11
```

**Añadiendo las 5 tarjetas al final del JSON (20 tarjetas)** el motor **no**
produce la fila pedida:

```
fila 9:  bun | claude | typescript(GRANDE) | bash | webassembly     ← se cuelan aquí
fila 11: astro(GRANDE) | opencode | tauri | youtube | github
```

Es decir: **bash y webassembly quedan en la fila anterior** y la última fila
mezcla la fila nueva con las redes sociales. El motivo es estructural: las
filas del mosaico **no son un concepto del modelo actual**, son un efecto
secundario del reparto por colas.

### 2.4 Restricciones de tamaño (regla dura: ≤100 líneas por archivo)

| Archivo | Líneas | Efecto |
|---------|--------|--------|
| `src/styles/tokens.css` | 99 | no caben 5 tokens `--color-marca-*` nuevos → hay que compactar el bloque de marcas |
| `src/styles/hero-card.css` | 99 | no caben 5 reglas `[data-color-token]` → hoja nueva `src/styles/hero-card-brands.css` |
| `src/domain/hero-grid-layout.ts` | 95 | cualquier lógica de filas lo pasa de 100 → módulos hermanos (precedente: `hero-grid-template.ts`, `hero-cards-fields-parse.ts`) |
| `src/domain/entities/hero-card.ts` | 64 | cabe el campo nuevo |
| `src/domain/repositories/hero-cards-{parse,fields-parse}.ts` | 75 / 75 | caben (el lector del campo nuevo entra) |

### 2.5 Restricciones adicionales

- `public/assets/svg/sprite.svg` **no se toca**: los symbols `bash`, `webassembly`,
  `astro`, `opencode` y `tauri` ya existen (viewBoxes 32×32, 24×24, 85×107, 24×24, 256×289).
- Sin dependencias nuevas (GSAP ya está aprobado). Estático por defecto.
- Tokens, nunca colores sueltos (`scripts/audit-design-tokens.mjs` falla ante
  hex/rgb fuera de `tokens.css`).
- Estilos fuera del `.astro`; lógica en `src/domain/`; datos solo por repositorio.
- **No hay tests previos** (el commit de limpieza borró `tests/`): el implementer
  escribe los tests desde cero con `node:test` (`pnpm test` = `node --test "tests/**/*.test.mjs"`).
- `docs/verification.md` exige regresión visual (dev server a 375/768/1280 px)
  cuando se toca UI.

## 3. Alternativas y decisión

### (a) Filas declaradas en los datos — **ELEGIDA**

Se añade a la tarjeta de icono un campo opcional **`row`** (entero ≥ 1) que
declara a qué fila del mosaico pertenece. El motor agrupa las tarjetas que
comparten `row` en **una fila visual completa** (5 tarjetas: la `featured` al
hueco grande, las demás a los pequeños en orden de JSON) y valida con errores
nombrados. Las tarjetas **sin** `row` son las de la zona superior.

Ventajas: la fila deja de ser un accidente del orden del JSON y pasa a ser un
dato; el motor **falla en voz alta** si una fila está mal (5 tarjetas exactas,
1 `featured` exacta, sociales en la última fila); añadir una fila nueva es
editar el JSON; los cuatro invariantes actuales se conservan (se re-expresan
por fila, más fuertes).

Coste: refactor del motor de colocación (5 archivos de dominio) → **2 features**.

### (b) Reordenar el JSON — DESCARTADA

Con un orden de JSON distinto (`F = [node, nestjs, astro, typescript]`,
`S = [rust, aws, cloudflare, css, react, html, claude-code, bash, webassembly,
opencode, tauri, bun, claude, youtube, github]`) la simulación **sí** produce:

```
fila 9:  bash | webassembly | astro(GRANDE) | opencode | tauri   ← la fila pedida
fila 11: typescript(GRANDE) | bun | claude | youtube | github
```

Es el mismo resultado visual que (a) **sin tocar el motor**. Se descarta por
mantenibilidad: el reparto depende de **dos colas independientes** (featured y
resto) cuyo orden no es legible en el JSON; una tarjeta nueva insertada en
cualquier punto descuadra las filas y solo lo detecta un test que fije el
resultado esperado. El JSON dejaría de describir el mosaico para describir una
coincidencia de orden.

### (c) Relajar el invariante de las redes sociales — DESCARTADA

Permitiría que la fila nueva fuera la última (con `astro` grande al principio,
porque el patrón de fila par pone el grande primero) pero **rompe un requisito
ya establecido** (las sociales en la última fila, esquina inferior derecha) y
mueve el final del mosaico. No lo pide la petición humana → no se toca.

### Consecuencia asumida de (a)

Al insertar la fila nueva como **fila 2**, el patrón alterno se desplaza y la
última fila pasa a usar el patrón `[4, 2, 2, 2, 2]`: la tarjeta grande
`typescript` se sitúa en el **1.er** hueco de su fila (antes en el 3.º) y las
redes sociales siguen en las dos últimas columnas (esquina inferior derecha).
Es el precio de mantener el ritmo "grande primero / grande en medio" sin
repetir patrón entre filas vecinas.

## 4. Qué toca cada feature

### Feature 1 — `hero-grid-explicit-rows` (dominio + datos, **sin cambio visual**)

| Archivo | Cambio |
|---------|--------|
| `src/domain/entities/hero-card.ts` | campo opcional `row?: number` en `HeroCard` |
| `src/domain/repositories/hero-cards-fields-parse.ts` | lector del campo opcional `row` (entero ≥ 1) |
| `src/domain/repositories/hero-cards-parse.ts` | cableado del lector en `parseIconCard` |
| `src/domain/hero-grid-error.ts` (nuevo) | `HeroGridLayoutError` fuera de `hero-grid-layout.ts` (evita import circular) |
| `src/domain/hero-grid-rows.ts` (nuevo) | agrupación por `row` + validaciones |
| `src/domain/hero-grid-template.ts` | patrón de huecos por fila (fila par / impar) |
| `src/domain/hero-grid-layout.ts` | usa filas explícitas; el auto-placement se mantiene |
| `src/data/hero-cards.json` | declara `row` en las 10 tarjetas de las filas inferiores |
| `tests/*.test.mjs` (nuevos) | parseo del campo `row`, validaciones y **regresión de colocación** |

Invariantes que pasan a ser **por fila** (más fuertes que los globales):
5 tarjetas exactas por fila, 1 `featured` exacta por fila, sociales solo en la
última fila, zona superior completa (1 rica + 4 iconos, 1 `featured`).

### Feature 2 — `hero-row-new-tools` (datos + UI)

| Archivo | Cambio |
|---------|--------|
| `src/data/hero-cards.json` | 5 tarjetas nuevas con `row: 2`; las 5 de la fila social pasan a `row: 3` |
| `src/styles/tokens.css` | compactar el bloque de marcas y añadir 5 tokens `--color-marca-*` |
| `src/styles/hero-card-brands.css` (nuevo) | regla `[data-color-token]` de las 5 marcas (fondo + geometría del icono) y sus ajustes ≤1200 px |
| `src/components/hero-card.astro` | importa la hoja nueva |
| `tests/*.test.mjs` (nuevos) | la fila 2 contiene las 5 marcas con `astro` en el hueco grande; tokens y reglas presentes |

## 5. Riesgos y trabas

1. **Refactor del motor sin tests previos.** Mitigación: la feature 1 exige un
   test de regresión que fije la colocación actual de las 15 tarjetas (misma
   fila, mismo span, misma columna) antes y después de la migración.
2. **Límite de 100 líneas.** `hero-grid-layout.ts` (95) se divide en módulos
   hermanos; `tokens.css` (99) se compacta; `hero-card.css` (99) recibe las
   reglas nuevas en una hoja aparte.
3. **Colores de marca propuestos.** No hay color oficial cerrado para bash,
   opencode ni tauri en el repo: la hoja de tokens propone valores
   (apartado "Tokens" del `design.md`) y quedan ajustables por el humano en la
   regresión visual.
4. **Geometría del icono de `astro`.** Su symbol es alto (85×107): el alto del
   `<svg>` (28 px) manda sobre la escala, igual que en las grandes ya
   existentes; los valores propuestos (ancho 200 px, escala 6) se validan en la
   regresión visual a 375/768/1280 px.
5. **Sprite intocable.** Ninguna feature modifica `public/assets/svg/sprite.svg`;
   los symbols ya existen.
6. **El mosaic es rígido.** Con filas declaradas, la zona inferior solo acepta
   filas completas de 5: añadir una tarjeta suelta obliga a otra fila completa.
   Es la misma rigidez que ya imponía el invariante "múltiplo de 5".

## 6. Verificación prevista

- `node scripts/check-format.mjs` (backlog + specs EARS) y `./init.sh` en verde.
- `pnpm test` (node:test) al 100 % con los tests nuevos (parseo, validaciones,
  colocación, datos de la fila nueva).
- `node scripts/audit-design-tokens.mjs`: ningún color fuera de `tokens.css`.
- `pnpm build` sin errores.
- Regresión visual (`docs/verification.md`): dev server y revisión a **375 px,
  768 px y 1280 px**; la fila nueva se ve completa, sin huecos ni solapamientos,
  con `astro` legible en su hueco grande.
