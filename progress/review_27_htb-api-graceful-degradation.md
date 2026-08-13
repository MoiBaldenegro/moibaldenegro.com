# Review — feature 27 htb-api-graceful-degradation

**Veredicto:** CHANGES_REQUESTED (ronda 1, 2026-08-13) → **APPROVED** (re-review 2026-08-13, tras resolución del humano líder; ver "Re-review" al final)

Revisor: agente reviewer n1 (2026-08-13). Feature 27 `done` en `feature_list.json`
(depende de la 22, `done`). Evidencia verificada en disco, no solo en el informe.

## Respuesta a la pregunta de revisión

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó
en verde al final?

- **Sí, para los archivos de la feature.** `tests/htb-api-graceful-degradation.test.mjs`
  (nuevo, sin commits previos) documenta en `progress/impl_27...md` el ROJO previo
  a la implementación: 1/8 pass (solo REQ-27-09, ya verde desde la feature 22) y
  7/8 fail con `'getProfileOrNull is not a function'` — exactamente el fallo que
  produciría el estado pre-implementación (método inexistente + componente aún
  con `getProfile()`). La evidencia es coherente con el mtime del test (10:33)
  anterior al del repositorio (10:34). Suite final en verde: 8/8, y `pnpm test`
  completo **177/177** verificado por mí.
- **No, para un archivo modificado en la ventana de la sesión:** `astro.config.mjs`
  (ver "Cambios requeridos" nº 1). No hay ciclo rojo/verde documentado ni mención
  alguna en el impl.

## Fidelidad a la spec (REQ-27-01..10 + Decisiones 1-6)

| Req | Evidencia | Estado |
|-----|-----------|--------|
| REQ-27-01 | `htb-profile-repository.ts:30-36` `getProfileOrNull()` devuelve el perfil mapeado en éxito (test 1 verde) | ✅ |
| REQ-27-02..06 | 5 modos de fallo → `null`: envs ausentes, red caída, HTTP no-ok, JSON inválido, perfil inválido (tests 2-6 verdes; fakeFetch inyectado cubre cada vía, incluido `calls.length === 0` sin credenciales) | ✅ |
| REQ-27-07 | `htb-stadistics.astro:6` llama `getProfileOrNull()`; frontmatter solo importa + llama (test 8 estructural verde) | ✅ |
| REQ-27-08 | Template `{profile && ( ... )}` (líneas 9-41): con perfil `null` la sección no se renderiza (test 8, regex `/\{profile\s*&&/`) | ✅ |
| REQ-27-09 | `getProfile()` intacto (`htb-profile-repository.ts:23-27`), sigue lanzando `HtbProfileDataError` (test 7 verde; `tests/htb-profile-repository.test.mjs` 11/11 sin tocar) | ✅ |
| REQ-27-10 | El componente ya no invoca la única vía que lanza (`doesNotMatch /getProfile\(\)/`), la isla no responde 500 por datos; build OK en `./init.sh` | ✅ |
| Design 1-6 | Ocultar sección (D1), degradación en dominio (D2), captura total (D3), ≤100 líneas (D4: 100 exactas), 1 sola aserción actualizada justificada (D5), red-first + cierre con build (D6) | ✅ |

## Convenciones y regresiones

- `htb-profile-repository.ts`: **100 líneas** (≤100), sin `console.*`; todos los
  throw internos son `HtbProfileDataError` (verificado: `assertCredentials`,
  `requestProfile`, `readJson`, `asProfile`) → la captura total de
  `getProfileOrNull()` cubre el 100% de las vías previstas.
- `htb-stadistics.astro`: 40 líneas; sin `function`/`if (`/`for (`/`try {` (la
  regex del test de convención no dispara con `{profile && (`), sin `console.*`,
  sin fetch, sin `<style>`, sin valores de diseño hardcodeados, sin tokens nuevos.
- `tests/htb-stadistics-section.test.mjs`: diff real = **solo las líneas 87-91**
  (`/getProfile\(\)/` → `/getProfileOrNull\(\)/` + mensaje). No debilita el
  contrato: `getProfile()` sigue verificado en `tests/htb-profile-repository.test.mjs`
  (11/11, sin tocar) y en el test nuevo (REQ-27-09); además el test nuevo añade
  `doesNotMatch /getProfile\(\)/` en el componente (más estricto).
- `tokens.css`: **87 líneas**, no aparece en `git status` → sin cambios.
  `htb-stadistics.css` (54), entidad e `index.astro` sin cambios.
- `./init.sh` (ejecutado por mí): `✔ El entorno está perfecto. Podemos empezar a trabajar.`
  — formato OK, `pnpm test` **177/177**, build OK. (Nota: `node --test tests/`
  directo falla por el glob de Windows — artefacto de invocación, no de la suite;
  `pnpm test` usa `"tests/**/*.test.mjs"` y pasa.)
- Backlog: **27 features `done` conservadas en el array; 0 pending, 0 in_progress,
  0 blocked**; feature 27 `depends_on: [22]` con la 22 en `done` (verificado en
  el JSON con node).

## Checkpoints

- C1: [x] — estilos separados, sin `<style>` en `.astro`.
- C2: [x] — frontmatter solo importa/llama; sin lógica en la UI.
- C3: [x] — datos siempre vía repositorio.
- C4: [x] — tokens, sin valores hardcodeados; tokens.css intacto (87).
- C5: [x] — ≤100 líneas en todos los archivos tocados (repo 100, componente 40).
- C6: [x] — sin dependencias externas nuevas.
- C7: [x] — datos JSON válidos y tipados (sin cambios en `src/data/`).
- C8: [x] — repositorios lanzan errores nombrados; `getProfileOrNull` es la
  excepción justificada y documentada (design.md, Decisión 3).
- C9: [x] — `./init.sh` verde (verificado hoy: suite 177/177, build OK).
- C10: [ ] — inspección visual en navegador pendiente (igual que en reviews
  previas; el estado "ocultar" no tiene CSS que inspeccionar).
- C11: [x] — `feature_list.json` con la 27 en `done` y 0 pendientes/in_progress.
- C12: [x] — `progress/current.md` documenta la sesión; el volcado final a
  `progress/history.md` es cierre del líder tras esta review.
- C13: [x] — delta de `astro.config.mjs` resuelto: documentado y fijado por
  `tests/astro-config-dev-workaround.test.mjs` (4/4) en el re-review; repo limpio.

## Cambios requeridos

1. **Resolver el delta no documentado de `astro.config.mjs`.** El working tree
   tiene una modificación **sin commit** y **sin mención** en
   `progress/impl_27...md` (tabla "Archivos tocados" y "Sin cambios") ni en
   `progress/current.md`: mtime 2026-08-13 **10:26:35** — dentro de la ventana de
   la sesión 27 (8 min tras el commit `cabaa4f` de las 10:18, 7 min antes del
   test red-first de las 10:33). El delta vs HEAD cambia la config de forma
   sustantiva: `vite.optimizeDeps` pasa de `exclude: ['@astrojs/internal-helpers']`
   a `include: ['astro/assets/services/noop']` + `disabled: false`, se elimina
   `ssr.noExternal: ['astro']` y se añade `server.watch.ignored: ['**/.vite/**']`
   (comentario sobre loops de recarga en Windows), además de reformateo y fin de
   línea. Ninguna spec ni test lo cubre y ningún informe del ciclo lo justifica —
   viola "un commit por feature, sin cambios no relacionados" (docs/conventions.md)
   y el requisito de evidencia rojo/verde por archivo. El esquema env queda
   intacto (REQ-22-07/08 verdes) y `./init.sh` pasa con el delta, así que el
   impacto funcional es nulo hoy; el problema es de canalización y trazabilidad.
   **Acción: revertirlo a HEAD (`cabaa4f`) o documentarlo y justificarlo** en
   `impl_27`/`current.md` (y en la spec si se pretende canónico, con test si debe
   quedar verificado). Tras resolver, el líder re-lanza esta review.

## Nota de riesgos residuales (no bloqueante)

- **El modo silencioso puede ocultar bugs reales:** `getProfileOrNull()` usa
  `catch { return null }` sin filtrar por tipo de error. Hoy es correcto porque
  las 5 vías internas lanzan todas `HtbProfileDataError` (verificado), pero un
  error de programación futuro (p. ej. un `TypeError` en `parseHtbProfile`) se
  tragaría como `null` y la sección desaparecería sin rastro (sin `console.*` por
  REQ-22-06). Mitigación vigente: `getProfile()` conserva el lanzamiento y sus
  tests (REQ-27-09) detectarían la regresión en la vía canónica. Aceptado por
  design.md Decisión 3 ("captura total"); queda registrado como riesgo operativo.
- Inspección visual del estado "ocultar" pendiente de navegador (C10), como en
  reviews anteriores.

## Re-review (2026-08-13) — resolución del CHANGES_REQUESTED

**Veredicto final: APPROVED.**

El humano líder resolvió el punto 1 (delta no documentado de `astro.config.mjs`)
documentando y conservando el workaround (era edición directa del humano: bug de
re-optimización de rolldown-vite en Windows; retirada de `ssr.noExternal` y
`exclude` aceptada conscientemente). Re-verificado en disco:

1. **Test de caracterización nuevo y fiel:** `tests/astro-config-dev-workaround.test.mjs`
   (86 líneas, node:test, sin `console.*`) fija el estado canónico del delta:
   `optimizeDeps.include: ['astro/assets/services/noop']` + `disabled: false`
   (test 1), `server.watch.ignored: ['**/.vite/**']` (test 2), ausencia de las
   entradas retiradas `@astrojs/internal-helpers` y `noExternal` (test 3) y el
   esquema env de REQ-22-07/08 sin regresión — `IN_MAINTENANCE` public/client,
   `HTB_API_TOKEN`/`HTB_USER_ID` secret/server/optional (test 4). **4/4 pass**
   ejecutado por mí. No debilita nada: las aserciones REQ-22-07/08 del test de
   la feature 22 siguen intactas y verdes, y este test solo añade fijación del
   estado del workaround.
2. **Sección documentada en el impl:** `progress/impl_27...md` líneas 81-113
   "Delta astro.config.mjs (decisión del humano, 2026-08-13)" con el motivo
   (error "rolldown-runtime > file does not exist ... optimizeDeps", sugerencia
   del propio Vite), el diff concreto vs `cabaa4f`, la aclaración de que es
   edición directa del humano (no de la feature 27) y la cobertura del test;
   línea de resolución en `progress/current.md` (líneas 26-28).
3. **Config intacta:** mtime de `astro.config.mjs` sigue en 10:26:35 — la
   resolución no tocó el archivo; `git diff --stat` idéntico al delta revisado
   (53 líneas: 27+/26-). No hubo retoques posteriores al veredicto de ronda 1.
4. **Regresiones:** `./init.sh` → línea final exacta
   `✔ El entorno está perfecto. Podemos empezar a trabajar.` (formato OK,
   tests al 100%, build OK); `pnpm test` **181/181** (177 de la ronda 1 + 4
   nuevos del workaround) ejecutado por mí.
5. **Backlog y fugas:** `feature_list.json` con 27 features `done` (27 incluida,
   conservada en el array, `depends_on: [22]` en `done`); 0 pending, 0
   in_progress, 0 blocked. `git status --short` muestra solo los archivos
   conocidos del ciclo: los 6 modificados de la sesión 27 (astro.config.mjs
   [delta humano ahora documentado], feature_list.json, current.md,
   htb-stadistics.astro, htb-profile-repository.ts,
   htb-stadistics-section.test.mjs) y los artefactos untracked (impl_27,
   research, review_27, specs/27, y los 2 tests nuevos). Sin fugas.

Checkpoint C13 pasa a **[x]** (repo limpio y canalizado). Riesgo residual único
vigente: el de la nota anterior (captura total en `getProfileOrNull()` puede
enmascarar bugs no-`HtbProfileDataError` futuros) — aceptado por el design y
mitigado por la vía canónica con tests. La inspección visual (C10) sigue
pendiente de navegador, como en las reviews previas del ciclo.
