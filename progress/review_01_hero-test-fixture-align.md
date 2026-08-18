# Review — feature 1 `hero-test-fixture-align`

**Veredicto:** APPROVED

Fecha: 2026-08-18 (reviewer). Spec: `specs/01_hero-test-fixture-align/requirements.md`
(REQ-01-01..04). Backlog: entrada id 1 de `feature_list.json`.

## Pregunta de revisión (test-first)

¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al
final?

Sí, con evidencia verificable en `progress/impl_01_hero-test-fixture-align.md`:

- **Rojo capturado antes del cambio** (sección "Ciclo rojo"): `node --test
  tests/hero-profile-repository.test.mjs` → exit 1, **8 pass / 1 fail**. El
  fallo es exactamente el test de perfil real (`REQ-31-01/REQ-31-04`), con el
  diff del assert mostrando la discrepancia: actual
  `'/assets/moises-hero.jpg'` (dato real) vs expected `'assets/moises-hero.jpg'`
  (fixture obsoleto). El test ya existía y estaba en rojo por el revert manual;
  esta feature alinea el fixture al dato real (precedente REQ-43-06: el
  fixture sigue al dato real), sin tocar `src/`.
- **Verde después del ajuste** (sección "Ciclo verde"): test individual 9/9
  pass y suite completa 258/258 pass — ambos re-ejecutados por mí abajo.

## Verificación independiente (resultados reales obtenidos por el reviewer)

1. `node --test tests/hero-profile-repository.test.mjs` → exit 0,
   **# tests 9 / # pass 9 / # fail 0** (TAP 13; incluye el test
   REQ-31-01/REQ-31-04 ahora en `ok`).
2. `node scripts/check-format.mjs` → exit 0:
   `FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos`.
3. `bash ./init.sh` → exit 0, "✔ El entorno está perfecto. Podemos empezar a
   trabajar." (entorno ✔, formato ✔, tests al 100% ✔, build de producción ✔).
4. Inspección línea 34 de `tests/hero-profile-repository.test.mjs` (dentro de
   `EXPECTED_PROFILE`): `image: '/assets/moises-hero.jpg'` — **idéntico** al
   campo `"image": "/assets/moises-hero.jpg"` de `src/data/hero.json`
   (comparado carácter a carácter).
5. `git diff -- tests/hero-profile-repository.test.mjs` → **un único cambio**:
   la línea 34 del fixture (`-  image: 'assets/moises-hero.jpg',` →
   `+  image: '/assets/moises-hero.jpg',`). `git diff --name-only -- src/` →
   solo `src/styles/hero-card.css`, que es una línea en blanco trivial
   **preexistente** de un ciclo abortado (documentado en
   `progress/current.md`; el humano confirmó que el código es correcto): esta
   sesión NO tocó ningún archivo de `src/`. Cambios de la sesión:
   `tests/hero-profile-repository.test.mjs` (fixture), `feature_list.json`
   (status → in_progress) y `progress/current.md` (bitácora).

## Trazabilidad acceptance ↔ REQ

| Acceptance (feature_list.json id 1) | REQ | Estado |
|---|---|---|
| El fixture EXPECTED_PROFILE declara image con el valor exacto `'/assets/moises-hero.jpg'` | REQ-01-01 | ✔ línea 34 del test, ruta absoluta |
| Valor idéntico al campo image de `src/data/hero.json` | REQ-01-02 | ✔ `'/assets/moises-hero.jpg'` == `"/assets/moises-hero.jpg"` |
| La suite pasa en verde: `node --test tests/hero-profile-repository.test.mjs` sin errores | REQ-01-03 | ✔ 9/9 pass (verificado) |
| Sin modificar `src/` | REQ-01-04 | ✔ diff de la sesión solo en el test (src/ intacto) |

Dependencias: `depends_on: []` — sin dependencias pendientes; trivially
satisfecho.

## Conformidad con architecture.md / conventions.md

El cambio es un ajuste de fixture de test de una línea: no introduce capas,
estilos, lógica de UI, ni lecturas de JSON desde componentes; no supera
límites de líneas (el diff toca una línea existente); no añade dependencias;
no toca `src/`. Sin incumplimientos.

## Checkpoints

- C1 (Arquitectura): [x] — sin cambios de arquitectura; diff solo en un
  fixture de test.
- C2 (Datos): [x] — `src/data/hero.json` y repositorios intactos.
- C3 (Verificación, `./init.sh` verde): [x] — re-ejecutado por el reviewer:
  "El entorno está perfecto" (tests 258/258, build OK). La inspección visual
  desktop/móvil queda [ ] como en el histórico: no aplica a una feature de
  fixture de test sin cambio visual.
- C4 (Harness, tarea en `done`): [ ] — feature 1 sigue `in_progress` a la
  espera de este APPROVED; el líder la marca `done` tras la revisión (flujo
  del arnés, igual que en la feature 43). Ninguna otra feature a medias
  (features 2-6 `pending`).
- C5 (Bitácora y repo limpio): [x] — `progress/current.md` documenta la
  sesión (rojo/verde, cambio exacto, src/ intacto); `progress/history.md` al
  día con las sesiones cerradas (la actual se mueve al cierre); sin archivos
  temporales, `print()` de debug ni TODOs sin contexto.

## Cambios requeridos

Ninguno.
