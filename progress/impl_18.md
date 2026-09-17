# Informe de implementación — Feature 18 next-post-data

> Propiedad `next` (ruta interna /posts/<id>) en posts: esquema, contenido,
> entidad y repositorio. Spec: `specs/18_next-post-data/requirements.md`
> (REQ-18-01..07). Análisis previo:
> `progress/research/next-post-recommendation.md` (D1–D5, R1–R4).

## Estado

- `feature_list.json`: feature 18 en `in_progress`. NO se marca `done`: queda
  a la espera de `progress/review_18.md` con veredicto `APPROVED`.
- `./init.sh` en verde al cierre (ver evidencia abajo).

## Plan ejecutado

- Tests primero en `tests/next-post-data.test.mjs` (REQ-18-01..07), rojo
  verificado antes de tocar `src/`.
- Implementación mínima del acceptance (sin UI, sin JS, sin tokens nuevos).
- Alineación del fixture `EXPECTED_POST` existente (precedente REQ-43-06,
  mismo patrón que la feature 36) y suite completa en verde.

## Hallazgo previo (ids reales de la colección)

- Las rutas prerendered son `/posts/00-agilismo`,
  `/posts/01-diseño-detallado`, `/posts/02-principios-del-diseno-de-software`
  y `/posts/03-principios solid`: el `entry.id` real es el `slug` del
  frontmatter, NO el nombre del fichero (verificado en
  `.astro/data-store.json`: claves `00-agilismo`, `01-diseño-detallado`,
  `02-principios-del-diseno-de-software`, `03-principios solid` frente a
  ficheros `01-diseño_detallado.md`, `02-principios.md`,
  `03-principios_solid.md`).
- La cadena curada usa esos ids (orden cronológico por `created`: 10 → 19 →
  20 → 21 Ago 2026): 00 → 01 → 02 → 03, el último sin `next`.

## Evidencia del ciclo rojo (test-first)

Comando: `node --test tests/next-post-data.test.mjs` (antes de implementar).

```text
not ok 1 - REQ-18-01: el esquema architecture declara next opcional como texto
not ok 2 - REQ-18-02: la entidad Post expone readonly next con texto o nulo
not ok 3 - REQ-18-03: el repositorio entrega next cuando el frontmatter lo declara
not ok 4 - REQ-18-04: el repositorio entrega nulo cuando el frontmatter omite next
not ok 5 - REQ-18-05: next con formato inválido lanza PostsDataError
not ok 6 - REQ-18-06: los 4 artículos declaran la cadena curada con el último sin next
ok 7 - REQ-18-07: entidad y repositorio no superan las 100 líneas
# tests 7
# pass 1
# fail 6
```

(REQ-18-07 ya pasaba en rojo porque los ficheros aún estaban por debajo del
techo; se re-verifica en verde tras el cambio.)

## Cambios (archivos tocados)

- `src/content.config.ts` (30 → 32 líneas): `next: z.string().optional()`
  en el esquema `architecture` (REQ-18-01).
- `src/domain/entities/post.ts` (20 → 23 líneas): `readonly next:
  string | null` + comentario (REQ-18-02).
- `src/domain/repositories/posts-repository.ts` (97 → 99 líneas):
  `next: expectNext(data, index)` en `parsePost` + validador `expectNext`
  (ausente → `null`; presente con formato distinto de `/posts/<id>` →
  `PostsDataError`) (REQ-18-03..05, REQ-18-07). Para cerrar en ≤100 se
  compactó la cabecera (5 → 3 líneas) y los `throw` de `expectString` /
  `expectNumber` a una línea; ningún mensaje ni contrato cambia (riesgo R1
  cerrado sin `blocked`).
- `src/content/architecture/00-agilismo.md`: `next:
  /posts/01-diseño-detallado`.
- `src/content/architecture/01-diseño_detallado.md`: `next:
  /posts/02-principios-del-diseno-de-software`.
- `src/content/architecture/02-principios.md`: `next: /posts/03-principios
  solid`.
- `src/content/architecture/03-principios_solid.md`: sin `next` (último de
  la cadena) (REQ-18-06).
- `tests/posts-repository.test.mjs` (solo fixture): `EXPECTED_POST` gana
  `next: null` con justificación en la cabecera (precedente REQ-43-06: el
  fixture sigue a la entidad real; mismo patrón que la feature 36 con
  id/slug). Ninguna aserción de contrato de las features 7/36 cambia.
- `tests/next-post-data.test.mjs` (nuevo): 7 tests REQ-18-01..07.
- `feature_list.json`: feature 18 `pending` → `in_progress`.
- `progress/current.md`: anotación de feature en curso, plan y bitácora.

## Evidencia del ciclo verde

Comando: `node --test tests/next-post-data.test.mjs
tests/posts-repository.test.mjs` (tras implementar).

```text
ok 1 - REQ-18-01: el esquema architecture declara next opcional como texto
ok 2 - REQ-18-02: la entidad Post expone readonly next con texto o nulo
ok 3 - REQ-18-03: el repositorio entrega next cuando el frontmatter lo declara
ok 4 - REQ-18-04: el repositorio entrega nulo cuando el frontmatter omite next
ok 5 - REQ-18-05: next con formato inválido lanza PostsDataError
ok 6 - REQ-18-06: los 4 artículos declaran la cadena curada con el último sin next
ok 7 - REQ-18-07: entidad y repositorio no superan las 100 líneas
ok 8 - REQ-07-01 ... ok 16 - REQ-07-05 (tests existentes, sin cambios)
# tests 16
# pass 16
# fail 0
```

Comando: `./init.sh` (cierre). Salida final:

```text
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Suite: 466/466 tests en verde (verificado en 3 ejecuciones consecutivas de
`pnpm test` además del `./init.sh` final). El build confirma que el esquema
con `next` y los 4 frontmatter son válidos para Astro.

## Nota honesta: un rojo transitorio no reproducible

- La primera ejecución de `./init.sh` tras implementar reportó `tests al
  100%` en rojo (con el build posterior en verde); `init.sh` suprime la
  salida de `pnpm test`, así que no quedó registrado qué test falló.
- Inmediatamente después, `pnpm test` directo dio 466/466, y dos
  ejecuciones más + un segundo `./init.sh` quedaron en verde sin tocar
  nada en disco entre medias.
- Ningún test lee artefactos generados (verificado: ningún
  `tests/*.test.mjs` referencia `.astro/` salvo una mención en un
  comentario), por lo que no hay causa atribuible al cambio; se documenta
  como transitorio no reproducible. Si el reviewer lo vuelve a ver, el
  paso es re-ejecutar `pnpm test` con salida visible para capturar el test
  implicado.

## Convenciones respetadas

- Estilos: no toca UI ni CSS (feature sin `design.md`, decisión D5).
- Tokens: sin valores nuevos (cambio solo de datos).
- Datos vía repositorio: el campo fluye colección → esquema → repositorio →
  entidad; ningún componente lee la colección directamente.
- ≤100 líneas: entidad 23, repositorio 99 (REQ-18-07 en verde).
- Sin dependencias, sin JS de runtime, sin tocar `dist/`.
- Una sola feature: no se toca la feature 10 (`in_progress` por otra
  sesión) ni la 19 (`pending`, depende de esta).
