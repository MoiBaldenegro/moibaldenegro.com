# Informe de implementación — Feature 20 `related-posts-data`

> Capa de datos de la lista de recomendados: propiedad `related` en esquema,
> contenido, entidad y repositorio. Sin UI (sin `design.md`), sin JS de
> runtime, sin dependencias. Convive con `next` (features 18-19, ambas `done`).

## Pre-condición verificada

- Feature 18 (`next-post-data`) en `done` en `feature_list.json` (cadena curada
  `00-agilismo → 01 → 02 → 03`, el último sin `next`). Su `depends_on: []` y el
  `depends_on: [18]` de la feature 20 quedan satisfechos.

## Plan ejecutado

- Verificar feature 18 en `done`; pasar feature 20 a `in_progress`.
- Escribir primero `tests/related-posts-data.test.mjs` (REQ-20-01..07) y
  observarlo en rojo.
- Implementar: esquema + entidad + repositorio (compactando a ≤100 líneas) +
  curaduría del último artículo.
- Ajustar el fixture afectado con el precedente documentado y dejar
  `./init.sh` en verde.

## Ciclo rojo → verde (evidencia)

### Rojo (antes de implementar, solo el test nuevo existe)

`node --test tests/related-posts-data.test.mjs`:

```text
not ok 1 - REQ-20-01: el esquema architecture declara related opcional como arreglo de texto
not ok 2 - REQ-20-02: la entidad Post expone readonly related con arreglo o nulo
not ok 3 - REQ-20-03: el repositorio entrega related cuando el frontmatter lo declara
not ok 4 - REQ-20-04: el repositorio entrega nulo cuando el frontmatter omite related
not ok 5 - REQ-20-05: related inválido lanza PostsDataError
not ok 6 - REQ-20-06: el último artículo declara related con al menos dos rutas internas
ok 7 - REQ-20-07: entidad y repositorio no superan las 100 líneas
# tests 7
# pass 1
# fail 6
```

(REQ-20-07 pasa pre-cambio porque es un constraint que ya se cumplía; debe
seguir pasando post-cambio.)

### Verde (tras implementar)

`node --test tests/related-posts-data.test.mjs`: 7/7 en verde.

`./init.sh` completo en verde: entorno ✔, formato ✔, tests ✔, build ✔.

`pnpm test`: 480/480 en verde (verificado en runs repetidos; un run intermedio
mostró 479/480 sin reproducirse en 3 runs posteriores: flake ajeno al cambio,
los 7 tests de la feature y el fixture tocado son deterministas y pasan
siempre).

## Cambios (scope estricto del acceptance)

- `src/content.config.ts` (+1 línea, 31→32): `related: z.array(z.string()).optional()`
  en el esquema `architecture` (REQ-20-01).
- `src/domain/entities/post.ts` (+3 líneas, 23→26): `readonly related:
  readonly string[] | null` + comentario REQ-20-02 (REQ-20-02).
- `src/domain/repositories/posts-repository.ts` (98 líneas, ≤100):
  `related: expectRelated(data, index)` en `parsePost` + nuevo validador
  `expectRelated` (nulo si se omite; `PostsDataError` si no es un arreglo no
  vacío de rutas `/posts/<id>` — no-vacío según D3 de
  `progress/research/recommended-list.md`). Compactación sin cambios de
  comportamiento para cerrar en ≤100: cabecera 3→2 líneas, mensaje de
  `getPosts` a una línea, `asData` 10→7 líneas (mismo mensaje de error),
  `loadArchitectureEntries` 4→3 líneas, mensaje de `expectTags` a una línea;
  `expectNext` intacto (REQ-20-03..05, REQ-20-07).
- `src/content/architecture/03-principios_solid.md` (último cronológico, sin
  `next`): `related: [/posts/00-agilismo, /posts/01-diseño-detallado]`
  (REQ-20-06).
- `tests/posts-repository.test.mjs` (fixture, precedente REQ-43-06 ya usado por
  la feature 18 en el mismo archivo): `EXPECTED_POST` gana `related: null`
  (el artículo `00-agilismo.md` no declara `related`, caso REQ-20-04) +
  justificación en el encabezado. Sin este ajuste, REQ-07-02 fallaba con
  `related: null` extra en el `deepEqual` estricto. Ninguna aserción de
  contrato cambia.

## Verificación de restricciones del arnés

- Datos vía repositorio (sin UI en esta feature): ✔ (la entidad solo se
  entrega vía `PostsRepository`).
- ≤100 líneas: `post.ts` 26, `posts-repository.ts` 98 (verificado por
  REQ-20-07 y REQ-07-05). ✔
- Sin UI, sin JS de runtime, sin dependencias nuevas. ✔
- Una sola feature: ningún cambio toca a la feature 21 (presentación,
  pendiente) ni a otra. ✔
