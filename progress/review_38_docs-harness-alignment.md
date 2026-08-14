# Review — feature 38 `docs-harness-alignment`

Fecha: 2026-08-14. Reviewer: nivel 1, lanzado por el líder tras el informe del
implementer (`progress/impl_38_docs-harness-alignment.md`).

**Veredicto:** APPROVED

## Resumen

La feature 38 alinea `docs/architecture.md` y `CHECKPOINTS.md` con el estado
real del arnés (hallazgo A7 del ciclo 30). La regla 6 de architecture.md ya no
referencia `global.css`/`DESIGN.md` (inexistentes) y nombra
`src/styles/tokens.css`; CHECKPOINTS.md deja de estar congelado en las
features 22-25 (suite 158/158, feature 25 `in_progress`). Alcance respetado:
solo los dos docs + el test nuevo de la feature. Sin tokens prohibidos del
kit. Verificación independiente en disco: todo en verde.

## Evidencias (verificación independiente, en disco)

1. **Diff aislado de la feature 38** (`git diff HEAD` sobre ambos docs; el resto
   del árbol corresponde a features 33-37 ya aprobadas y al bookkeeping del
   arnés):
   - `docs/architecture.md`: regla 6 `global.css (definidas en DESIGN.md)` →
     `src/styles/tokens.css`; tabla `public/` `tomateLogo.svg` (inexistente) →
     `favicon.svg` (real); entidades `Card`/`Feature`/`Plan` (inexistentes) →
     `HtbProfile`/`Post` (reales); `src/data/` «cards, features, etc.» →
     «cards de tecnologías, perfil, etc.». Sin otros cambios (reglas 1-5, 7-13
     y flujo de datos intactos).
   - `CHECKPOINTS.md`: bloque Verificación «reviewer de la feature 25, suite
     158/158» → «cierre del ciclo 30 (2026-08-14): suite 221/221, harness-kit
     7/7, build OK»; bloque Harness «features 22-24 done; feature 25
     in_progress» → «features 1-38 done, conservadas en el array…». El ítem
     pendiente de inspección visual se conserva (sigue siendo cierto).
2. **Nuevo archivo** `tests/docs-harness-alignment.test.mjs` (3 tests,
   REQ-38-01..03) — único archivo añadido por la feature, junto con los dos
   docs modificados. `feature_list.json` y `progress/current.md` son
   bookkeeping del arnés; `src/` y demás tests no fueron tocados por esta
   feature.
3. **Grep independiente** (case-insensitive) sobre `docs/architecture.md` y
   `CHECKPOINTS.md` de `global.css|DESIGN.md|tomatesoft|cards-data|og-image|
   hero|158/158|in_progress`: **0 coincidencias** (exit 1). Idem grep sobre
   `docs/` completo para los tokens prohibidos.
4. **Test-first en rojo verificado**: el informe documenta el ciclo rojo
   (`node --test tests/docs-harness-alignment.test.mjs` → 2 fail: REQ-38-01
   por global.css/DESIGN.md, REQ-38-02 por 158/158 e in_progress; REQ-38-03 ya
   verde) previo a tocar los docs, y el verde posterior (3/3). Evidencia
   coherente con el contenido actual de los docs.
5. **Ejecuciones reales (esta revisión)**:
   - `node --test tests/docs-harness-alignment.test.mjs
     tests/harness-kit-integrity.test.mjs tests/project-readme.test.mjs
     tests/design-tokens.test.mjs` → 20/20 pass (REQ-38-01..03, REQ-01-05
     harness-kit 7/7, REQ-13-01..05, REQ-02-03).
   - `node --test "tests/**/*.test.mjs"` → **221/221 pass** (218 baseline del
     cierre de la 37 + 3 nuevos), 0 fail (incluye REQ-25-06 de
     game-of-life-removal: architecture.md sin el token «hero»).
   - `./init.sh` → formato ✔, tests ✔, build ✔ → **«El entorno está
     perfecto»**.
   - `node scripts/check-format.mjs` → FORMATO ✔ (en el informe del
     implementer; init.sh lo revalida).

## Comprobación requisito por requisito

| REQ | Criterio | Resultado |
|---|---|---|
| REQ-38-01 | architecture.md regla 6 referenciar `src/styles/tokens.css` (hoy global.css/DESIGN.md) | ✔ Línea 31 del doc: «solo desde las custom properties de `src/styles/tokens.css`». Sin `global.css` ni `DESIGN.md` (grep 0 + test REQ-38-01 verde). |
| REQ-38-02 | CHECKPOINTS.md sin features del historial en progreso ni conteos de suite del ciclo previo | ✔ Sin `158/158`, sin `in_progress`, sin features en progreso. El conteo «221/221» es el estado verificado al cierre del ciclo 30 (actual), no un conteo de ciclo previo. |
| REQ-38-03 | Docs del arnés sin tokens prohibidos del kit | ✔ Grep 0 en ambos docs (tomatesoft, cards-data, og-image, hero). REQ-01-05 (harness-kit 7/7) y REQ-25-06 («hero» en architecture.md, case-insensitive) en verde. |
| REQ-38-04 | Suite completa y formato en verde tras la alineación | ✔ Suite 221/221, `./init.sh` «El entorno está perfecto», check-format ✔. |

Acceptance de feature 38 en `feature_list.json`: las 4 se cumplen (evidencias
arriba).

## Checkpoints (CHECKPOINTS.md recorridos)

- C1 Arquitectura (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 Sin lógica JS en UI: [x]
- C3 Repositorios como única vía de datos: [x]
- C4 Tokens, no valores sueltos: [x]
- C5 ≤100 líneas por archivo: [x]
- C6 Sin dependencias externas nuevas: [x]
- C7 `src/data/*.json` válido y tipado: [x]
- C8 Repositorios con errores nombrados: [x]
- C9 `./init.sh` en verde (entorno, formato, tests 100%, build): [x]
- C10 Inspección visual desktop/móvil: [ ] — pendiente de inspección visual en
  navegador (no verificada por el reviewer; feature 38 es solo docs, no
  bloqueante)
- C11 `feature_list.json` con la tarea en done: [ ] — feature 38 sigue
  `in_progress` a la espera de este veredicto y del cierre del líder (estado
  esperado pre-cierre)
- C12 `progress/current.md` documenta la sesión y `history.md` al día: [x]
- C13 Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)

- La nota del bloque Harness de CHECKPOINTS.md dice «features 1-38 done…» con
  la feature 38 aún `in_progress` en el JSON en el momento de la revisión: es
  la descripción del estado al cierre del ciclo 30 y la casilla C11 está
  correctamente sin marcar hasta que el líder cierre la 38. No constituye
  mención de features en progreso (REQ-38-02 se cumple).
- Dependencias: `depends_on: []` — ninguna dependencia pendiente saltada.

## Cambios requeridos

Ninguno.

Veredicto: APPROVED
