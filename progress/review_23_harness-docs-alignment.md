# Review — feature 23 harness-docs-alignment

**Veredicto:** APPROVED

**Spec:** `specs/23_harness-docs-alignment/requirements.md` (REQ-23-01..05)
**Informe del implementer:** `progress/impl_23_harness-docs-alignment.md`
**Contexto:** `progress/research/refactor-post-manual.md` D5
**Estado en `feature_list.json`:** feature 23 `in_progress` (correcto en fase de revisión; el cierre a `done` lo decide el líder)

## 1. Pregunta de revisión (test-first, rojo → verde)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?**

Sí, con la salvedad propia de una feature de docs: la spec 23 no ordena test nuevo — el contrato es `tests/harness-kit-integrity.test.mjs` (feature 1, REQ-01-05), que escanea los 27 archivos del kit. El implementer documentó el ciclo completo en `impl_23` §1:

- **ROJO (antes de editar):** `node --test tests/harness-kit-integrity.test.mjs` → `not ok 3 - REQ-01-05 ... error: 'harness-kit/docs/architecture.md: fuga "og-image"'` (6 pass/1 fail) + escaneo del kit completo con fugas: `architecture.md` og-image:45 y hero:15,21,56; `conventions.md` og-image:14; `validate-feature-list.mjs` og-image:10; `verification.md:69` ref. test inexistente.
- **VERDE (tras editar, reproducido por mí en disco):** 7/7 pass; escaneo posterior 0 coincidencias de `og-image|hero|tomatesoft|cards-data` en los 27 archivos del kit.
- **Suite final:** `pnpm test` → 180/181. Único fallo: `REQ-11-05` (`about-page.test.mjs:213`), que cae porque `astro build` falla por `src/pages/posts/[id].astro:3` → `MISSING_EXPORT "markdownPostRepository"` (confirmado en disco con `pnpm build`). Este residual es **ajeno a la feature 23** (página del usuario canalizada para la feature 24). El contrato de esta feature — REQ-01-05 — está en verde.
- **Dependencias:** `depends_on: []` — sin dependencias, ninguna saltada; récord en backlog consistente.

## 2. Cobertura REQ-23-XX (evidencia en disco, verificada independientemente)

| REQ | Evidencia verificada | ✔ |
|-----|----------------------|---|
| REQ-23-01 | Los scripts citados en los docs son reales: `scripts/check-format.mjs`, `scripts/validate-feature-list.mjs`, `scripts/audit-design-tokens.mjs` existen (ls `scripts/`). Citas en disco: `architecture.md:13` (`check-format.mjs`), `:45` (`validate-feature-list.mjs`); `conventions.md:14` (`check-format.mjs`, `audit-design-tokens.mjs`); `verification.md:18` (`check-format.mjs`). `generate-types` (script de package.json, REQ-21-02) intacto. `generate-og-image.mjs` no existe y ya no se cita. | ✔ |
| REQ-23-02 | `grep -rn "og-image" docs/ scripts/validate-feature-list.mjs` → 0 ocurrencias; `grep -rn "generate-og-image" docs/ scripts/` → 0. Comentario de `validate-feature-list.mjs:6-8` ahora dice "excepción documentada en docs/architecture.md §13 (aprobada en la feature 19)", coherente con `architecture.md:45`. | ✔ |
| REQ-23-03 | Test de integridad (escanea los 27 archivos del kit por `og-image|hero|tomatesoft|cards-data`) → 7/7 verde, reproducido. `grep -rn "hero" docs/architecture.md` → 0 (ni `hero.css` ni "hero" como nombre de sección). | ✔ |
| REQ-23-04 | `architecture.md:21` fila `src/styles/`: `tokens.css` + `layout.css`, `profile-card.css`, `latest-articles.css` — todas reales en `src/styles/` (ls). Fuera `hero.css` (eliminada feature 4). `architecture.md:15` y `:56`: componentes reales (`LatestArticles`, `GameOfLifeBackground`, `HtbStadistics`) sin token prohibido. | ✔ |
| REQ-23-05 | `grep -rn "regeneracion-limpia" tests/ docs/` → 0. `verification.md:69` referencia el test real `tests/harness-kit-integrity.test.mjs` (existe). | ✔ |

Acceptance 1 (test de integridad en verde): **7/7** ✔.

## 3. Alcance de archivos tocados

| Archivo | Cambio (mtime 2026-08-12 19:00, ventana de la feature 23) | Dentro del alcance |
|---------|------------------------------------------------------------|--------------------|
| `docs/architecture.md` | Líneas 15/21/45/56: componentes reales, fila styles sin `hero.css`, §13 precedente real | ✔ |
| `docs/conventions.md` | Línea 14: ejemplos → `check-format.mjs`/`audit-design-tokens.mjs` | ✔ |
| `scripts/validate-feature-list.mjs` | Solo el comentario (líneas 6-8): precedente inexistente → excepción documentada §13 | ✔ |
| `docs/verification.md` | Línea 69: test inexistente → `harness-kit-integrity.test.mjs` | ✔ |
| `feature_list.json` | Feature 23: `in_progress` (la marca `done` el líder) | ✔ |
| `progress/current.md` + `progress/impl_23_...md` | Bitácora de la sesión | ✔ |

**Verificado:** ningún archivo de `src/`, `tests/` ni feature cerrada (18-22) lleva mtime en la ventana de la feature 23. El diff global del working tree incluye cambios no commiteados de las features 18-22 (trabajo preexistente ya revisado y aprobado en sus reviews), no de esta feature. Ningún test nuevo se creó (la spec 23 no lo ordena: el contrato es el test de integridad existente).

## 4. `./init.sh` y CHECKPOINTS

`./init.sh` ejecutado: **2 comprobaciones rojas, ambas ajenas a esta feature**:
1. `tests al 100%` → 180/181; el único fallo es REQ-11-05, que cae por el build (`[id].astro` → `MISSING_EXPORT markdownPostRepository`), canalizado para la feature 24.
2. `build de producción` → rojo por el mismo `[id].astro:3` (página del usuario, fuera del alcance 23).

El contrato propio de la feature (REQ-01-05, integridad del kit) está verde; en reviews previos el líder instruyó no bloquear por residuales ajenos documentados. Checkpoints:

- [x] C1 (estilos separados) — no toca UI
- [x] C2 (sin lógica en UI) — no toca UI
- [x] C3 (datos vía repositorio) — no aplica
- [x] C4 (tokens, no valores sueltos) — no aplica
- [x] C5 (≤100 líneas) — docs/scripts sin cambios de código (solo comentario)
- [x] C6 (sin dependencias externas) — no aplica
- [x] C7-8 (datos válidos, errores nombrados) — no aplica
- [ ] C9 (`./init.sh` verde global) — Razón: 2 residuales ajenos documentados (REQ-11-05 y build por `[id].astro`, feature 24)
- [ ] C10 (inspección visual) — no aplica a feature de docs (pendiente global)
- [ ] C11 (feature en `done`) — la marca el líder tras revisión; `in_progress` correcto ahora
- [x] C12 (`current.md` documenta la sesión) — verificado en disco
- [x] C13 (sin temporales/debug/TODOs) — verificado

## 5. Observaciones

1. **Residual único de suite:** REQ-11-05 falla porque `astro build` falla por `src/pages/posts/[id].astro:3` (`MISSING_EXPORT "markdownPostRepository"` — página del usuario, `72e5c52`). Es la causa documentada para la feature 24 / decisión del líder; no es imputable a la feature 23.
2. La spec 23 (`specs/23_harness-docs-alignment/requirements.md`) menciona los tokens prohibidos en su propio enunciado — es un artefacto permanente fuera del escaneo del kit (`getKitFiles()` no incluye `specs/<NN>_*`), comportamiento correcto del contrato REQ-01-05.
3. Decisión respetada: se editaron menciones, NO se creó `generate-og-image.mjs` (crearlo sería feature aparte con spec). Coherente con la opción mínima del líder.
4. Coherencia cross-feature verificada: `architecture.md §13` y el comentario de `validate-feature-list.mjs` se refieren mutuamente ("aprobado en la feature 19") sin token prohibido.

## Conclusión

Todas las REQ-23-01..05 y el acceptance 1 (integridad 7/7) verificadas en disco; fuga "og-image" eliminada de los 27 archivos del kit; docs alineados con los scripts y hojas reales; evidencia rojo/verde completa. Los únicos rojos de `./init.sh` son residuales ajenos documentados (REQ-11-05/build por `[id].astro`, feature 24). **APPROVED.**