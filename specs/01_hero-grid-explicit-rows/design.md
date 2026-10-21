# Diseño — hero-grid-explicit-rows

> Feature 1 del ciclo 2026-10-21. Análisis completo y alternativas:
> `progress/research/hero-fila-nueva-tools.md`.

## Contexto visual

- **Qué se ve afectado**: el mosaico de tarjetas del hero
  (`src/components/new-hero/new-hero.astro`), que hoy se reparte con dos colas
  globales (tecnologías `featured` → huecos grandes; el resto → huecos
  pequeños; redes sociales las últimas).
- **Estado actual**: las franjas visuales (filas de 2 filas de alto) **no
  existen en el modelo**: son un efecto del orden de `src/data/hero-cards.json`
  y del número de tarjetas. No se pueden declarar ni garantizar.
- **Estado deseado**: cada franja inferior se **declara en los datos** con el
  campo `row` de cada tarjeta. El mosaico que se ve hoy debe quedar **igual**
  (esta feature es la base de dominio/datos; la fila nueva es la feature 2).

## Modelo de datos

| Campo | Tipo | Obligatoriedad | Significado |
|-------|------|----------------|-------------|
| `row` | entero ≥ 1 | opcional | fila del mosaico (1 = primera franja inferior). Ausente = zona superior |
| `featured` | booleano | opcional (por defecto `false`) | la tarjeta ocupa el hueco grande de su fila |

Zona superior = tarjetas de icono **sin** `row` (4 huecos: tres de 2×2 y uno
grande de 5×2) más la tarjeta rica (`kind: "htb"`), que ocupa el hueco de 5×4.

## Reglas de colocación

1. Las tarjetas **sin** `row` rellenan la zona superior conservando el orden de
   `hero-cards.json`; la única `featured` de esa zona toma el hueco grande.
2. Las tarjetas **con** `row` se agrupan por su valor: cada grupo es una fila
   visual completa.
3. Dentro de una fila: la tarjeta `featured` toma el hueco grande y las demás
   toman los huecos pequeños en el orden de `hero-cards.json`.
4. Patrón de huecos por fila (se mantiene el ritmo actual, sin repetir patrón
   entre filas vecinas):
   - fila impar → `[4×2 grande, 2×2, 2×2, 2×2, 2×2]`
   - fila par → `[2×2, 2×2, 4×2 grande, 2×2, 2×2]`
   Cada fila suma 12 columnas y 2 filas de rejilla: la franja ocupa la anchura
   completa del mosaico.
5. Validaciones (todas con `HeroGridLayoutError`, mensaje en español):
   zona superior incompleta o con dos `featured`; fila con ≠ 5 tarjetas; fila
   con ≠ 1 `featured`; `social` en una fila que no es la última; `social` con
   `featured`.

## Tokens usados

Ninguno nuevo: esta feature no cambia ni un color ni una medida del mosaico
visible. Se conservan los tokens actuales (`--color-marca-*`, `--radius-card`,
`--gap-card`, `--icon-width`, `--icon-rotation`, `--icon-scale`).

## Decisiones y constraints

- **Decisión 1 — `row` es un entero, no un grupo de texto.** Un entero se
  valida (≥ 1), se ordena y se compara; un nombre de grupo ("stack-2026")
  obligaría a ordenar las filas aparte. Con el entero, el orden de las filas es
  el orden de sus valores.
- **Decisión 2 — "sin `row`" = zona superior.** Evita un segundo campo
  (`zone`) y da un error claro si alguien añade una tarjeta al JSON sin
  declararla: la zona superior no se completa y el motor falla.
- **Decisión 3 — el patrón alterno se conserva.** La fila 2 (la de la feature 2)
  usa el patrón `[2×2, 2×2, 4×2, 2×2, 2×2]`: el hueco grande queda en tercera
  posición, que es donde la petición humana sitúa a `astro`.
- **Decisión 4 — `HeroGridLayoutError` a su propio módulo**
  (`src/domain/hero-grid-error.ts`). El nuevo módulo de filas
  (`src/domain/hero-grid-rows.ts`) lo necesita y `hero-grid-layout.ts` lo
  importa: mantenerlo en `hero-grid-layout.ts` crearía un ciclo de imports.
  `hero-grid-layout.ts` lo re-exporta para no romper a sus importadores.
- **Decisión 5 — la colocación física no cambia.** Se mantiene el
  auto-placement disperso que replica el `grid-auto-flow: row` de CSS: cambia
  qué hueco recibe cada tarjeta, no el algoritmo que calcula su celda.
- **Decisión 6 — migración de los datos en esta feature.**
  `hero-cards.json` declara `row` en las 10 tarjetas de las franjas inferiores
  (`row: 1` y `row: 2`) para que el mosaico siga igual; la feature 2 inserta su
  fila como `row: 2` y renumera la franja de las redes a `row: 3`.
- **Restricciones del proyecto**: ≤ 100 líneas por archivo (`hero-grid-layout.ts`
  está en 95 → se reparte en módulos hermanos `hero-grid-rows.ts` y
  `hero-grid-template.ts`); lógica en `src/domain/`; datos solo por
  repositorio; tokens, nunca colores sueltos; sin dependencias nuevas; estático
  por defecto; errores explícitos y nombrados.

## Trazabilidad REQ → acceptance → test

| REQ | Acceptance (en `feature_list.json`) | Test (en `tests/`) |
|-----|----------------------------------------|---------------------|
| REQ-01-01 | A1 | test del modelo y del parseo: `row` se expone en la entidad |
| REQ-01-02 | A1 | test del parseo: `row` inválido → `HeroCardsDataError` con archivo e índice |
| REQ-01-03, REQ-01-04 | A3 | test de colocación: zona superior y su hueco grande |
| REQ-01-05, REQ-01-06 | A3 | test de colocación: zona superior incompleta o con dos `featured` → error |
| REQ-01-07 | A2 | test de colocación: las tarjetas de una fila caen en la misma franja |
| REQ-01-08, REQ-01-09 | A2 | test de colocación: spans 4/2 y orden dentro de la fila |
| REQ-01-10, REQ-01-11 | A4 | test de colocación: filas mal formadas → `HeroGridLayoutError` |
| REQ-01-12, REQ-01-13 | A4 | test de colocación: `social` fuera de la última fila o con `featured` → error |
| REQ-01-14 | A2 | test de regresión: las 15 tarjetas actuales conservan fila, span y columna |

## Alternativa descartada

- **Alternativa**: reordenar `hero-cards.json` para que las 5 tarjetas nuevas
  caigan juntas sin tocar el motor (simulada: produce exactamente la fila pedida).
- **Motivo del descarte**: el reparto depende de **dos colas independientes**
  (featured y resto) cuyo orden no es legible en el JSON; una tarjeta nueva
  insertada en cualquier punto descuadra las franjas sin que nada lo indique.
  Declarar las filas en los datos hace que el mosaico sea **describible** y que
  el motor **falle en voz alta** cuando una fila está mal.
