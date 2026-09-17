# Review — feature 18

**Veredicto:** APPROVED

## Checkpoints
- C1: [x]
- C2: [x]
- C3: [x]
- C4: [x]
- C5: [x]
- C6: [x]
- C7: [x]
- C8: [x]
- C9: [x]
- C10: [ ]  ← Razón: feature sin UI (sin `design.md`, decisión D5 del research); no hay nada visual que inspeccionar en desktop/móvil. El pendiente global de inspección visual de CHECKPOINTS.md queda fuera del alcance de esta feature.
- C11: [ ]  ← Razón: feature 18 sigue en `in_progress` a la espera de este veredicto (estado correcto pre-cierre); el paso a `done` lo hace el implementer/líder tras el APPROVED. Sin otras alteraciones: ninguna feature eliminada del array.
- C12: [x]
- C13: [x]

## Pregunta de revisión
- ¿Test antes del código, en rojo, y suite en verde al final? Sí. `progress/impl_18.md` documenta el rojo previo (`node --test tests/next-post-data.test.mjs`: 1 pass / 6 fail, REQ-18-01..06 en `not ok`, REQ-18-07 ya en verde por estar bajo el techo) y el verde posterior (subset `next-post-data + posts-repository`: 16/16; `./init.sh` final en verde, suite 466/466 + build). Re-verificado por el reviewer: subset 16/16 en verde y `./init.sh` en verde (entorno, formato, tests 100%, build).
- ¿Dependencias en `done`? Sí. Feature 18 declara `depends_on: []`, sin dependencias que bloquear. No salta ninguna dependencia pendiente (la 19 depende de esta, no al revés; la 10 `in_progress` de otra sesión no se toca).

## Evidencia verificada en disco
- `src/content.config.ts` (31 líneas): `next: z.string().optional()` (línea 27) → REQ-18-01.
- `src/domain/entities/post.ts` (23 líneas): `readonly next: string | null` (línea 22) + comentario REQ-18-02 → REQ-18-02, REQ-18-07.
- `src/domain/repositories/posts-repository.ts` (99 líneas): `next: expectNext(data, index)` (línea 56) + validador `expectNext` (líneas 83-90: ausente → `null`; no texto o sin formato `/posts/<id>` → `PostsDataError` con mensaje en español) → REQ-18-03/04/05, REQ-18-07. Compactación de cabecera y `throw` de `expectString`/`expectNumber` (líneas 71-81) sin cambio de mensajes ni contrato.
- Frontmatter: `00-agilismo.md` → `next: /posts/01-diseño-detallado`; `01-diseño_detallado.md` → `next: /posts/02-principios-del-diseno-de-software`; `02-principios.md` → `next: /posts/03-principios solid`; `03-principios_solid.md` sin `next` (sin diff en git: ya cumplía) → REQ-18-06, cadena cronológica 10 → 19 → 20 → 21 Ago 2026 con ids reales (`entry.id` = slug del frontmatter).
- `tests/next-post-data.test.mjs` (nuevo, 7 tests REQ-18-01..07: esquema, entidad, entrega valor, entrega nulo, 7 casos inválidos → `PostsDataError`, cadena curada exacta, ≤100 líneas entidad/repositorio).
- `tests/posts-repository.test.mjs`: solo fixture `EXPECTED_POST` + `next: null` (línea 77) con justificación en cabecera (líneas 20-24, precedente REQ-43-06); ninguna aserción de contrato de features 7/36 cambia.
- Convenciones: sin `<style>` nuevo, sin lectura directa de colección desde UI (flujo colección → esquema → repositorio → entidad), sin tokens nuevos (cambio solo de datos), errores nombrados `PostsDataError` en español, `readonly`, sin dependencias, sin JS de runtime, sin tocar `dist/`, una sola feature. Trazabilidad acceptance (7 items) ↔ REQ-18-01..07 completa; spec EARS en `specs/18_next-post-data/requirements.md` (7 SHALL, IDs correctos), sin `design.md` por no tocar UI (correcto).
- `./init.sh` ejecutado por el reviewer: verde (entorno, formato, tests 100%, build).

## Observación menor (no bloqueante)
- El comentario de cabecera de `tests/posts-repository.test.mjs` (líneas 20-24) dice que «el artículo 00-agilismo.md no declara next», cuando tras esta feature sí lo declara (`next: /posts/01-diseño-detallado`). El fixture `next: null` sigue siendo válido como caso REQ-18-04 (frontmatter que omite `next` → nulo) porque `REAL_ENTRY` es sintético sin `next`; solo la redacción del comentario quedó desfasada. Se deja como observación para una futura pasada, no exige corrección en este ciclo.

## Cambios requeridos (si aplica)
- Ninguno.
