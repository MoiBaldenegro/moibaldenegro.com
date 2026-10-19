# Review — feature 100 (specs-three-digit-ids)

**Veredicto:** APPROVED

Revisor nivel 1, 2026-10-16. Alcance: `scripts/validate-specs.mjs`, `tests/specs-three-digit-ids.test.mjs`, `docs/conventions.md` (solo la línea de `<NN>`), `specs/_template/requirements.md`. No se evalúan la 93 ni la 101.

## Verificación

- `scripts/validate-specs.mjs:10`: `REQ_PREFIX = /^REQ-(\d{2,})-(\d{2})\s+(.+)$/`. Primer grupo con 2 o más dígitos, segundo grupo sigue con exactamente 2 (REQ-100-01). El diff solo cambia esa línea y el comentario de las líneas 8-9. EARS, SHALL_COUNT, VAGUE, el chequeo de design.md vacío y `padStart(2, '0')` quedan sin cambios (REQ-100-06/07).
- No se debilita nada: el test cubre que REQ-07-01 sigue validando (REQ-100-03), que REQ-7-01 y REQ-07-001 siguen dando «falta el prefijo» (REQ-100-05) y que no coincidir con la feature sigue dando error en los dos sentidos, 10 frente a 100 (REQ-100-04).
- `node --test tests/specs-three-digit-ids.test.mjs`: 9/9 en verde.
- `node scripts/check-format.mjs`: `FORMATO ✔ ...`, exit=0 (REQ-100-10).
- Reglas de scripts del arnés: `validate-specs.mjs` solo importa `node:fs`, `node:path` y `node:url` (stdlib). Nada en `src/` lo importa (grep vacío). Tiene 81 líneas y el test 89 (las dos por debajo de 100). Sin dependencias nuevas (`package.json` y `pnpm-lock.yaml` no cambian).
- `docs/conventions.md:38-39` y `specs/_template/requirements.md:4-6,24-25` dicen «padding mínimo a 2 dígitos» y «admite 3 o más dígitos desde el id 100» (REQ-100-11). El otro cambio de `docs/conventions.md` (líneas 67-69, excepción 969/970 px) es de la feature 93, ya estaba antes y no se cuenta aquí.
- Test-first: `progress/impl_specs-three-digit-ids.md` registra 6 tests en rojo antes del cambio (y 3 guardas de regresión que ya pasaban, REQ-100-03/05/07, como corresponde) y 9/9 en verde después (REQ-100-09).
- Dependencias: la feature 100 no tiene `depends_on`. La 101 depende de la 100 y sigue `pending`.
- `./init.sh`: rojo solo en el bloque de tests. Formato y build en verde. TAP: 1046 tests, 1042 pass, 4 fail. Los 4 son exactamente los ajenos que anunció el líder (n.º 99 REQ-33-05, n.º 393 REQ-95-06/07/12, n.º 405 REQ-30-13, n.º 485 REQ-96-04/05), todos por el post del humano `src/content/posts/systems-design/00-systems-design-template.md` sin `design00.webp`. No se cuentan contra la 100.
- REQ-100-12: la 100 no toca `src/`. Los cambios que hay en `src/` en el working tree (site-menu, Layout, layout.css, nav-label.css, search-bar.css, site-menu.css) son de la feature 93 y ya estaban en el snapshot inicial.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>`): [x] (no aplica: no toca UI)
- C2 (sin lógica en UI): [x] (no aplica)
- C3 (datos vía repositorio): [x] (no aplica)
- C4 (tokens): [x] (no aplica)
- C5 (máx. 100 líneas): [x] 81 / 89 líneas
- C6 (sin dependencias externas): [x]
- C7 (`./init.sh` verde): [ ]  ← Razón: 4 fallos ajenos a la 100 (post del humano sin design00.webp). Formato y build en verde; los tests de la 100 están 9/9.
- C8 (visual desktop/móvil): [x] (no aplica: feature de arnés sin UI)
- C9 (harness: tarea en done, ninguna a medias): [ ]  ← Pendiente de cierre por el líder. La 93 también sigue `in_progress` (fuera de alcance).
- C10 (progress documentado): [x]
- C11 (sin temporales ni debug): [x] (el test borra su fixture de tmpdir en un `finally`)

## Observaciones (no bloqueantes)
1. `tests/specs-three-digit-ids.test.mjs:76-77` comprueba que las ids 100 y 101 están en el backlog real. Cuando se limpie o se regenere el backlog, este test se romperá. Conviene tenerlo en cuenta en una feature futura.
2. `.claude/agents/spec_author.md` y `.opencode/agents/spec_author.md` siguen diciendo «padding a 2 dígitos». Lo anotó el implementer y queda fuera de alcance por REQ-100-12.

## Cambios requeridos
Ninguno.
