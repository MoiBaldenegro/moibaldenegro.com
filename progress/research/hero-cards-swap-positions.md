# Análisis — intercambio de posiciones en las cards del hero (feature 3)

## Petición humana

"en las cards del hero: donde ahora está tauri pon css, es decir intercámbialas de lugar; lo mismo con html y opencode, intercámbialas; y un tercer intercambio: cambia NodeJS y NestJS. Esos 3."

## Qué es

Cambio de datos en `src/data/hero-cards.json`: tres pares intercambian su posición visible (índice en el array + campo `row`). Cada tarjeta conserva el resto de sus propiedades (title, colorToken, icon, category, featured, rotate, scale, iconWidth, showOnMobile, href). No toca motor, componentes ni CSS.

## Estado actual verificado (JSON real)

| idx | id | row | featured |
|-----|----|-----|----------|
| 0 | htb | - | - |
| 1 | rust | - | no |
| 2 | aws | - | no |
| 3 | cloudflare | - | no |
| 4 | node | - (zona superior) | sí |
| 5 | nestjs | 1 | sí |
| 6 | css | 1 | no |
| 7 | react | 1 | no |
| 8 | html | 1 | no |
| 9 | claude-code | 1 | no |
| 10 | bash | 2 | no |
| 11 | webassembly | 2 | no |
| 12 | astro | 2 | sí |
| 13 | opencode | 2 | no |
| 14 | tauri | 2 | no |
| 15-19 | bun, claude, typescript, youtube, github | 3 | typescript sí |

## Orden final esperado (completo)

| idx | id | row | featured |
|-----|----|-----|----------|
| 0 | htb | - | - |
| 1 | rust | - | no |
| 2 | aws | - | no |
| 3 | cloudflare | - | no |
| 4 | **nestjs** | - (sin campo row) | sí |
| 5 | **node** | 1 | sí |
| 6 | **tauri** | 1 | no |
| 7 | react | 1 | no |
| 8 | **opencode** | 1 | no |
| 9 | claude-code | 1 | no |
| 10 | bash | 2 | no |
| 11 | webassembly | 2 | no |
| 12 | astro | 2 | sí |
| 13 | **html** | 2 | no |
| 14 | **css** | 2 | no |
| 15-19 | bun, claude, typescript, youtube, github | 3 | sin cambios |

Colocación esperada de `layoutHeroCards` ([id, columna, fila, colSpan, rowSpan]), en orden del JSON:

```
['htb',6,1,5,4], ['rust',11,1,2,2], ['aws',11,3,2,2], ['cloudflare',6,5,2,2], ['nestjs',8,5,5,2],
['node',1,7,4,2], ['tauri',5,7,2,2], ['react',7,7,2,2], ['opencode',9,7,2,2], ['claude-code',11,7,2,2],
['bash',1,9,2,2], ['webassembly',3,9,2,2], ['astro',5,9,4,2], ['html',9,9,2,2], ['css',11,9,2,2],
['typescript',1,11,4,2], ['bun',5,11,2,2], ['claude',7,11,2,2], ['youtube',9,11,2,2], ['github',11,11,2,2]
```

Derivado del motor: zona superior y filas usan `splitFeatured` (la `featured` va al hueco grande y el resto a los pequeños en orden del JSON); fila impar = hueco grande primero, fila par = hueco grande en tercera posición. Es el MAP actual con los ids intercambiados en sus mismas celdas.

## ¿Es "featured" posicional? Decisión

En `src/domain/hero-grid-rows.ts` (`splitFeatured`) el hueco grande de cada grupo (zona superior o fila) lo toma la tarjeta con `featured`: semánticamente marca "el hueco grande". Pero en los tres pares el valor coincide (node/nestjs ambos `true`; css/tauri/html/opencode ambos `false`). **Decisión: `featured` se conserva por tarjeta** (no se mueve con la posición). El resultado es idéntico a tratarlo como posicional, se mantiene exactamente una featured por grupo y las validaciones del motor pasan. Consecuencia visible: nestjs pasa al hueco grande 5x2 de la zona superior y node al hueco grande 4x2 de la fila 1.

## Qué toca

- Datos: `src/data/hero-cards.json` (mover 6 objetos; quitar `row` a nestjs, añadir `"row": 1` a node; css/html pasan a `row` 2; tauri/opencode a `row` 1).
- Tests existentes que fijan orden/filas y hay que actualizar test-first (rojo antes del cambio de datos):
  - `tests/hero-grid-explicit-rows.test.mjs`: constante `MAP` (REQ-01-14) y el test "hero-cards.json declara row..." (lista `[id,row]` y zona superior `['htb','rust','aws','cloudflare','node']` -> `nestjs`).
  - `tests/hero-row-new-tools.test.mjs`: test REQ-02-01/02/03/04 (exige `row: 2` y orden `MARCAS` para opencode/tauri), test REQ-02-01 (`porId[marca].row === 2`, `porFila(1)`), test REQ-02-05/06/07 (fila 2 == MARCAS). Estas aserciones de la feature 2 quedan superadas por la feature 3 (REQ-02-02 y REQ-02-06): hay que reescribirlas para reflejar opencode/tauri en fila 1 y html/css en fila 2, manteniendo sprite, colorToken, featured solo en astro y showOnMobile.
  - `tests/hero-row-new-tools-styles.test.mjs`: no fija orden/filas; sin cambios.
  - Recomendado: test nuevo `tests/hero-cards-swap-positions.test.mjs` con los REQ-03-xx (conservación de propiedades no posicionales de las 6 tarjetas contra un snapshot literal, filas 1 y 2, huecos grandes).
- Límite de 100 líneas: vigilar al editar los tests.

## Riesgos y trabas

- Geometría de icono por `data-color-token`: node (240px, escala 7 en `hero-card.css`) pasa de hueco 5x2 a 4x2; nestjs (230px, escala 7) al revés. Tamaños similares; se verifica en la regresión visual. No se reajusta CSS en esta feature (fuera de alcance; si no encaja, feature aparte).
- REQ-02-02/REQ-02-06 de la spec de la feature 2 quedan superados; documentarlo en los comentarios de los tests.
- Sin dependencias externas; cambio < 100 líneas.
