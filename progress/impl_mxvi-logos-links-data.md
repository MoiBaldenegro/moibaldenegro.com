# Informe de implementación — feature 5 `mxvi-logos-links-data`

- **Feature**: id 5 — `mxvi-logos-links-data` (Datos y repositorio de los logos MXVI con URL por logo).
- **Spec**: `specs/05_mxvi-logos-links-data/requirements.md` (REQ-05-01..14).
- **Análisis**: `progress/research/mxvi-logos-band.md`.
- **Sesión**: 2026-11-02 — implementer (TDD: test en rojo → código → suite en verde).
- **Estado**: implementada y verificada; `status: "in_progress"`. **No** se marca `done` (pendiente del APPROVED del reviewer).

---

## 1. Qué se ha hecho

Base de datos/dominio de la feature 6, siguiendo el patrón de `PromoTilesRepository` (feature 4). Sin UI ni CSS:
`src/components/mxvi-logos-banner.astro` y su hoja **no** se tocan (eso es la feature 6).

| Archivo (nuevo) | Líneas | Contenido |
|---|---|---|
| `src/data/mxvi-logos.json` | 32 | Array `logos` con 4 entradas mxvi-m, mxvi-x, mxvi-v, mxvi-i: `id`, `letter`, `viewBox`, `href` (`https://github.com/MoiBaldenegro`) y `label` ("MXVI <L> — GitHub"). |
| `src/domain/entities/mxvi-logo.ts` | 14 | `interface MxviLogo` con `readonly id, letter, viewBox, href, label: string`. |
| `src/domain/repositories/mxvi-logos-parse.ts` | 58 | `MxviLogosDataError` + `parseMxviLogos(data)`: exige array `logos` de exactamente 4, cada entrada objeto con los 5 campos texto no vacío, `href` que empieza por `https://` y `viewBox` que casa con `/^0 0 [1-9]\d* [1-9]\d*$/` (enteros positivos). Mensajes: `mxvi-logos.json: el campo "logos[<i>].<campo>" del logo logos[<i>] ...`. Construye objetos nuevos con exactamente los 5 campos. |
| `src/domain/repositories/mxvi-logos-repository.ts` | 44 | `MxviLogosRepository` con loader inyectable `() => string` (default: import con atributo `with { type: 'json' }` serializado), `getLogos()`; loader que lanza o texto no JSON → `MxviLogosDataError` con `mxvi-logos.json`. Re-exporta `MxviLogosDataError`. |
| `tests/mxvi-logos-data.test.mjs` | 99 | 10 tests contra REQ-05-01..14. |

Otros cambios: `feature_list.json` (feature 5 → `in_progress`) y `progress/current.md` (feature en curso, plan, bitácora).

## 2. Trazabilidad REQ → test

| REQ | Test |
|---|---|
| REQ-05-01/03/04/05/07 | `getLogos()` por defecto == los 4 logos exactos en orden (deepEqual). |
| REQ-05-01/02 | Lectura directa de `src/data/mxvi-logos.json`: ids en orden, 5 claves exactas, todos texto no vacío. |
| REQ-05-02/06/08 | Loader inyectado con el array invertido y un href distinto: orden del JSON y 5 campos exactos. |
| REQ-05-06 | Fuente de `mxvi-logo.ts`: `export interface MxviLogo` y `readonly <campo>: string;` para los 5. |
| REQ-05-09 | Loader que lanza; texto no JSON. |
| REQ-05-10 | `{}`, `logos: 'x'`, raíz array, 3 y 5 logos. |
| REQ-05-11 | sin `label` (índice 2), `href` vacío (1), `letter` numérico (3), `id` en blanco (0), sin `viewBox` (0), entrada no objeto (1): mensaje con `mxvi-logos.json`, `logos[i]` y el campo. |
| REQ-05-12 | `http://x.com`, `/about`, `www.x.com` → `logos[2]` y `href`. |
| REQ-05-13 | `0 0 abc 716`, `717 716`, `0 0 0 716`, `0 0 -5 716`, `0 0 7.5 716`, `1 0 717 716` → `logos[1]` y `viewBox`. |
| REQ-05-14 | Los 5 archivos nuevos (JSON, entidad, parse, repositorio y el propio test) tienen <=100 líneas. |

## 3. Evidencia del ciclo rojo/verde

### Rojo (test escrito antes de cualquier código de la feature)

`node --test tests/mxvi-logos-data.test.mjs` — el módulo del repositorio aún no existe:

```
node:internal/modules/esm/resolve:272
    throw new ERR_MODULE_NOT_FOUND(
          ^

Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\Moises\Desktop\moibaldenegro.com\src\domain\repositories\mxvi-logos-repository.ts' imported from C:\Users\Moises\Desktop\moibaldenegro.com\tests\mxvi-logos-data.test.mjs
✖ tests\mxvi-logos-data.test.mjs (48.272ms)
ℹ tests 1
ℹ pass 0
ℹ fail 1
✖ failing tests:
✖ tests\mxvi-logos-data.test.mjs (48.272ms)
```

Durante la implementación, una primera ejecución con el código ya creado dejó en rojo solo REQ-05-14
(`./mxvi-logos-data.test.mjs tiene 107 líneas`): el propio archivo de test superaba 100 líneas. Se compactó el
test (sin quitar ninguna aserción de REQ) hasta 99 líneas.

### Verde — test de la feature

```
✔ REQ-05-01/03/04/05/07: getLogos() devuelve los cuatro logos exactos en orden (1.2078ms)
✔ REQ-05-01/02: src/data/mxvi-logos.json declara 4 logos con los 5 campos de texto (0.4556ms)
✔ REQ-05-02/06/08: con un loader inyectado entrega entidades con 5 campos en el orden del JSON (0.2254ms)
✔ REQ-05-06: la entidad MxviLogo expone campos readonly id, letter, viewBox, href y label (0.3359ms)
✔ REQ-05-09: un loader que lanza o un texto no JSON lanzan MxviLogosDataError (0.9432ms)
✔ REQ-05-10: sin array logos o con 3 o 5 logos lanza MxviLogosDataError (0.2234ms)
✔ REQ-05-11: campo ausente, vacío o no texto lanza error con índice y campo (0.3552ms)
✔ REQ-05-12: un href que no empieza por https:// lanza error con el índice (0.152ms)
✔ REQ-05-13: un viewBox sin la forma "0 0 <ancho> <alto>" lanza error con el índice (0.2336ms)
✔ REQ-05-14: los archivos nuevos de la feature tienen como máximo 100 líneas (0.5351ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.9769
```

### Verde — `./init.sh`

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md

--- Tests ---
✔ tests al 100% (node:test)

--- Build ---
✔ build de producción (pnpm build)

✔ El entorno está perfecto. Podemos empezar a trabajar.
```

`pnpm test`: 51 tests, 51 pass, 0 fail. `node scripts/audit-design-tokens.mjs`: AUDIT ✔ (no se toca CSS).

## 4. Decisiones y notas para el reviewer

- `href` solo admite `https://` (decisión de `progress/research/mxvi-logos-band.md`): a diferencia de promo-tiles,
  `/about` se rechaza.
- `viewBox` exige literalmente `0 0 <ancho> <alto>` con enteros positivos sin ceros a la izquierda; `0 0 0 716`
  y orígenes distintos de `0 0` se rechazan.
- Las comprobaciones de `href` y `viewBox` se hacen tras validar que los 5 campos son texto no vacío, por lo
  que un `href` vacío reporta el error de campo (REQ-05-11), no el de prefijo.
- El componente `mxvi-logos-banner.astro` sigue con su array hardcodeado: migrarlo al repositorio es REQ-06-01
  (feature 6). Hasta entonces el JSON nuevo no se consume desde la UI.
- Sin dependencias nuevas, sin commits ni push.
