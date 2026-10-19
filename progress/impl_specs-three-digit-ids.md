# Implementación — feature 100 specs-three-digit-ids (implementer, 2026-10-16)

Spec: specs/100_specs-three-digit-ids/requirements.md (REQ-100-01..12). Análisis: progress/research/specs-three-digit-ids.md. Sin design.md (no toca UI). Feature puesta en `in_progress`; la 93 (APPROVED pendiente de cierre) y la 101 no se han tocado.

## Cambios (REQ-100-12)

- `tests/specs-three-digit-ids.test.mjs` (nuevo, 89 líneas, solo node:test + stdlib): 9 tests que cubren REQ-100-01..07, REQ-100-10 y REQ-100-11.
- `scripts/validate-specs.mjs:9-10`: `REQ_PREFIX = /^REQ-(\d{2,})-(\d{2})\s+(.+)$/` (primer grupo a 2 o más dígitos; el secuencial `<xx>` sigue en exactamente 2) y comentario actualizado. EARS, SHALL_COUNT, VAGUE, el chequeo de design.md vacío y `String(id).padStart(2, '0')` sin cambios (REQ-100-06/07).
- `docs/conventions.md` (sección «Una spec por feature»): `<NN>` = id con padding mínimo a 2 dígitos (`07`; admite 3 o más dígitos desde el id 100, p. ej. `100`). Nota: este archivo ya traía cambios sin commitear de la 93 (REQ-93-40, breakpoint del header); el de la 100 es solo esa línea.
- `specs/_template/requirements.md` (cabecera y regla de IDs): misma aclaración.
- Nada en `src/`, sin dependencias nuevas.

Cobertura del test:
- REQ-100-01: texto literal de REQ_PREFIX con `(\d{2,})` y `(\d{2})`.
- REQ-100-07: líneas literales de EARS, SHALL_COUNT, VAGUE y del chequeo de design.md vacío idénticas al estado previo (HEAD).
- REQ-100-02/03: `validateRequirements` devuelve `[]` para REQ-100-01 con "100" y REQ-07-01 con "07".
- REQ-100-04: error de prefijo que no coincide para REQ-10-01 con "100" y REQ-100-01 con "10".
- REQ-100-05: «falta el prefijo REQ-<NN>-<xx>» para REQ-7-01 y REQ-07-001.
- REQ-100-06: fixtures en os.tmpdir() con features 7 y 100 pending → `[]`; al borrar la spec de la 100 → «falta specs/100_hundred-feature/requirements.md».
- REQ-100-10: las features 100 y 101 están en el backlog y `node scripts/check-format.mjs` sale con 0.
- REQ-100-11: los dos textos contienen «padding mínimo a 2 dígitos» y «3 o más dígitos desde el id 100».

## Rojo (antes de tocar el validador y los textos)

```
not ok 1 - REQ-100-01: REQ_PREFIX acepta 2 o más dígitos en el primer grupo y 2 en el segundo
ok 2 - REQ-100-07: EARS, SHALL_COUNT y VAGUE no cambian
not ok 3 - REQ-100-02: REQ-100-01 válido con expectedNn "100" no da errores
ok 4 - REQ-100-03: REQ-07-01 válido con expectedNn "07" no da errores
not ok 5 - REQ-100-04: id de feature distinto de expectedNn da el error de prefijo
ok 6 - REQ-100-05: id de 1 dígito o secuencial de 3 dígitos no tienen prefijo válido
not ok 7 - REQ-100-06: validateSpecs resuelve specs/07_<slug> y specs/100_<slug>
not ok 8 - REQ-100-10: check-format termina con código 0 con las features 100 y 101 en el backlog
not ok 9 - REQ-100-11: <NN> es padding mínimo a 2 dígitos con 3 o más desde el id 100
# tests 9
# pass 3
# fail 6
```

Los 3 que ya pasan en rojo (REQ-100-03/05/07) son guardas de regresión: describen comportamiento que debe conservarse (ids de 2 dígitos, rechazo de 1 dígito y de `<xx>` de 3, reglas sin cambios).

## Verde (después)

```
ok 1 - REQ-100-01 ... ok 9 - REQ-100-11
# tests 9
# pass 9
# fail 0
```

`node scripts/check-format.mjs`:

```
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos
check-format exit=0
```

(antes: código 1 por los 33 errores «falta el prefijo REQ-<NN>-<xx>» de specs/100_* y specs/101_*).

`node --test tests/cv-pdf-endpoint.test.mjs`: `# tests 11 / # pass 11 / # fail 0` (vuelve a verde).

## ./init.sh

```
✔ AGENTS.md / feature_list.json / progress/current.md existen
✔ formato de feature_list.json y progress/current.md
✘ tests al 100% (node:test)
✔ build de producción (pnpm build)
✘ 1 comprobación(es) fallida(s).
```

Suite (`node --test "tests/**/*.test.mjs"`, TAP): `# tests 1046 / # pass 1042 / # fail 4`. Los 4 fallos son exactamente los ajenos ya conocidos, causados por el post del humano `src/content/posts/systems-design/00-systems-design-template.md` sin `public/assets/content/design00.webp` (no corregidos por indicación del líder):

```
not ok 99 - REQ-33-05: el img de cada post existe en public/assets/content/   (error: ...00-systems-design-template.md: falta design00.webp)
not ok 393 - REQ-95-06/07/12: build con 3 cards (ajuste feature 96) (transition:name) y footer con 3
not ok 405 - REQ-30-13: el build real de la portada emite exactamente tres cards con los tres más recientes (ajuste feature 96)
not ok 485 - REQ-96-04/05: build real con 3 cards (transition:name) y footer con 3
```

Ningún fallo de la 100 ni de check-format/cv-pdf-endpoint.

## Observación (fuera de alcance)

.claude/agents/spec_author.md y .opencode/agents/spec_author.md siguen diciendo «padding a 2 dígitos» (hallazgo ya anotado en el análisis); no se tocan por REQ-100-12.
