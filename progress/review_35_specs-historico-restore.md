# Review — feature 35 `specs-historico-restore`

**Fecha:** 2026-08-14 · reviewer
**Spec:** `specs/35_specs-historico-restore/requirements.md` (REQ-35-01..05)
**Informe del implementer:** `progress/impl_35_specs-historico-restore.md`
**Veredicto:** APPROVED

## Resumen

La limpieza manual del humano (commit `0b7f359`) borró `specs/` entera, lo que
dejó dos tests en rojo que leen specs en runtime (REQ-21-06 y REQ-24-04). El
implementer restauró `specs/21_ssr-cloudflare-align/requirements.md` y
`specs/24_view-transitions/requirements.md` + `design.md` **byte a byte desde
`0b7f359^`** (verificado: diff vacío en los 3 archivos), y actualizó SOLO
`tests/ssr-cloudflare-align.test.mjs` REQ-21-06 (autorizado por REQ-35-03) para
verificar la excepción contra la spec restaurada + `docs/dependencies.md` en
lugar de la feature 21 del backlog nuevo.

Verificación independiente en disco: todo en verde — tests de la feature
16/16, suite completa 206/206, `check-format.mjs` ✔, `./init.sh` en "El
entorno está perfecto". Sin tokens prohibidos, sin cambios fuera de alcance,
`tests/view-transitions.test.mjs` intacto.

## Evidencias

| Verificación | Resultado | Comando |
|--------------|-----------|---------|
| Spec 21 restaurada fiel al histórico | ✔ diff vacío vs `git show 0b7f359^:specs/21_ssr-cloudflare-align/requirements.md` | `diff /tmp/spec21.md specs/...` → `SPEC21_IDENTICAL` |
| Spec 24 requirements restaurada fiel | ✔ diff vacío vs `0b7f359^` | `SPEC24_IDENTICAL` |
| Spec 24 design restaurado fiel | ✔ diff vacío vs `0b7f359^` | `DESIGN24_IDENTICAL` |
| Validador EARS real del arnés | ✔ 0 errores en ambas requirements.md (llamada con su NN real) | `validateRequirements(text, '21'/'24')` |
| Tests de la feature | ✔ 16/16 pass | `node --test tests/view-transitions.test.mjs tests/ssr-cloudflare-align.test.mjs` |
| Suite completa | ✔ 206/206 pass (0 fail) | `node --test "tests/**/*.test.mjs"` |
| Formato | ✔ `FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos` | `node scripts/check-format.mjs` |
| Arnés completo | ✔ "El entorno está perfecto" (formato, tests al 100 %, build de producción) | `./init.sh` |
| `tests/view-transitions.test.mjs` NO modificado | ✔ diff vacío (exit 0 sin salida) | `git diff HEAD --name-only -- tests/` |
| Único test modificado | ✔ `tests/ssr-cloudflare-align.test.mjs` (diff mínimo, ver §cambio) | `git diff HEAD -- tests/` |
| Tokens prohibidos (tomatesoft/cards-data/og-image/hero) en specs restauradas y `docs/dependencies.md` | ✔ 0 coincidencias (exit 1) | `grep -rniE "tomatesoft|cards-data|og-image|hero" specs/21_... specs/24_... docs/dependencies.md` |
| Feature 35 en backlog | ✔ `status: "in_progress"`, `depends_on: []` | `node -e "..." feature_list.json` |

### El cambio en `tests/ssr-cloudflare-align.test.mjs` (REQ-21-06) es mínimo

El diff (frente a HEAD) contiene únicamente:
1. Comentario de cabecera (5 líneas) que documenta el cambio y su autorización
   REQ-35-03.
2. Cuerpo de REQ-21-06: se reemplaza la búsqueda de la feature 21 en
   `feature_list.json` (3 líneas de lectura + aserción) por la lectura de
   `docs/dependencies.md` con aserciones de `@astrojs/cloudflare` y `wrangler`
   (ambas presentes: líneas 23 y 30 del registro).

Neto: +6 líneas (120 → 126). No se toca ningún otro test ni código de `src/`.
El cambio está documentado en el informe (§1.2) con la evidencia de rojo
antes de restaurar las specs.

## Comprobación requisito por requisito

| REQ | Verificación | Estado |
|-----|--------------|--------|
| REQ-35-01 | `specs/21_ssr-cloudflare-align/requirements.md` existe, idéntica a `0b7f359^`, declara REQ-21-01..06 con EARS válido (0 errores del validador real). | ✔ |
| REQ-35-02 | `specs/24_view-transitions/requirements.md` (REQ-24-01..05) y `design.md` existen, idénticos a `0b7f359^`; el design documenta la excepción a "Estático por defecto" (Decisión 3, págs. 28-33) que REQ-24-04 exige. | ✔ |
| REQ-35-03 | REQ-21-06 del test lee la spec restaurada (`specs/21_.../requirements.md`, aserción `includes('REQ-21-06')`) y `docs/dependencies.md` (aserciones `@astrojs/cloudflare` y `wrangler`); no consulta la feature 21 del backlog. Test en verde (16/16 y 206/206). | ✔ |
| REQ-35-04 | Suite completa 206/206 al 100 %; `./init.sh` en verde (formato ✔, tests ✔, build ✔). | ✔ |
| REQ-35-05 | Ambas requirements.md pasan `validateRequirements` del arnés (una línea = un SHALL, IDs REQ-<NN>-<xx>, patrón EARS, sin verbos vagos): 0 errores en cada una. | ✔ |

## Checkpoints

- C1: [x] — Sin cambios de UI ni estilos (solo specs/tests; ninguna regla de estilos afectada).
- C2: [x] — Sin lógica en archivos de UI (no se tocó `src/`).
- C3: [x] — Sin lecturas de JSON por componentes (no se tocó `src/`).
- C4: [x] — Sin valores hardcodeados nuevos (no se tocó `src/`).
- C5: [x] — Sin archivos nuevos >100 líneas; `tests/ssr-cloudflare-align.test.mjs`
  pasa de 120 a 126 líneas, ya excedía el límite antes de esta feature
  (estado preexistente, no agravado por el alcance mínimo autorizado; otros
  tests del repo, p.ej. `view-transitions.test.mjs` con 179 líneas, tampoco
  se ajustan al límite — el límite no se aplica a `tests/`).
- C6: [x] — Sin dependencias nuevas (verificación de dependencias del registro, sin añadidos).
- C7: [x] — Datos JSON y entidades intactos (sin cambios).
- C8: [x] — Repositorios intactos (sin cambios en esta feature).
- C9: [x] — `./init.sh` en verde, verificado por el reviewer en esta revisión.
- C10: [ ] — Inspección visual pendiente (no aplica: la feature no toca UI).
- C11: [ ] — `feature_list.json` con la feature 35 en `in_progress`: correcto en
  el punto de revisión; el líder la marca `done` tras este APPROVED
  (conservándola en el array). ← Razón: estado del flujo, no defecto.
- C12: [x] — `progress/current.md` documenta la sesión; informe `impl_35` completo con ciclo rojo/verde.
- C13: [x] — Sin temporales, debug ni TODOs sin contexto.

## Pregunta de revisión (test-first)

¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al
final? **Sí.** El informe documenta el ciclo completo:
1. ROJO inicial: 16 tests → 2 fail (REQ-21-06 `'specs/21_.../requirements.md:
   no existe'`; REQ-24-04 `'specs/24_view-transitions/design.md no existe'`).
2. El test REQ-21-06 se actualizó primero (autorizado por REQ-35-03) y siguió
   en rojo por la spec ausente (`'specs/21_ssr-cloudflare-align/requirements.md:
   no existe'`).
3. VERDE tras restaurar las specs: 16/16, suite 206/206, `./init.sh` verde —
   todo re-verificado de forma independiente en esta revisión.

## Dependencias

`depends_on: []` (vacío) en `feature_list.json` para la feature 35: no hay
dependencias que deban estar en `done`, por lo que no se saltó ninguna.

## Cambios requeridos

Ninguno.

---
**Veredicto: APPROVED**
