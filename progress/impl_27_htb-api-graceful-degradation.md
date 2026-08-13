# Informe de implementación — feature 27 htb-api-graceful-degradation

## Resumen

La portada se rompía (500 en el endpoint de la isla `server:defer`) cuando la
API de Hack The Box fallaba o faltaban las envs: `getProfile()` lanzaba
`HtbProfileDataError` sin contención en ninguna capa. Esta feature mueve la
degradación al dominio: `HtbProfileRepository.getProfileOrNull()` captura los
cinco modos de fallo y resuelve a `null`; el componente llama a la vía
degradada y la sección no se renderiza cuando el perfil es `null`. La app ya no
puede responder 500 por datos de HTB (REQ-27-10).

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/htb-api-graceful-degradation.test.mjs` | **NUEVO** (red-first, 8 tests): REQ-27-01..06 (éxito → perfil; 5 modos de fallo → null), REQ-27-09 (getProfile sigue lanzando), REQ-27-07/10 estructural (componente usa getProfileOrNull, sin getProfile(), sin lógica, template `{profile && ...}`) |
| `src/domain/repositories/htb-profile-repository.ts` | Añadido `getProfileOrNull(): Promise<HtbProfile \| null>` (try/catch → null; delega en `getProfile()`); `getProfile()` intacto (contrato REQ-22-02..04). Archivo comprimido 95 → **100 líneas** (≤100): cabecera 3→1 línea y una línea en blanco sobrante eliminada |
| `src/components/htb-stadistics.astro` | Línea 6: `getProfile()` → `getProfileOrNull()`; sección envuelta en `{profile && ( ... )}` (sin `if`/`try`/`for`/`function`, sin `console.*`). 39 → 40 líneas |
| `tests/htb-stadistics-section.test.mjs` | ÚNICA aserción actualizada (líneas 87-91): `/getProfile\(\)/` → `/getProfileOrNull\(\)/` + mensaje. Justificación: Decisión 5 del `design.md` — el componente ya no invoca la vía que lanza; el contrato de `getProfile()` (REQ-22-02..04) se verifica íntegro en `tests/htb-profile-repository.test.mjs`, que NO se tocó. Ninguna otra aserción del test 22 cambió |
| `feature_list.json` | Feature 27: `pending` → `in_progress` → `done` (conservada en el array) |
| `progress/current.md` | Plan y cierre de la sesión |

## Sin cambios (verificado)

- `src/pages/index.astro` (server:defer + slot fallback intactos)
- `src/domain/entities/htb-profile.ts` (entidad intacta)
- `src/styles/htb-stadistics.css` y `src/styles/tokens.css` (87 líneas, sin tokens nuevos)
- `tests/htb-profile-repository.test.mjs` (sin tocar)

## Ciclo rojo → verde (evidencia)

**ROJO** — `node --test tests/htb-api-graceful-degradation.test.mjs` antes de
implementar (7/8 fallan; solo pasa REQ-27-09, ya verde desde la feature 22):

```
# Subtest: REQ-27-01: getProfileOrNull devuelve el perfil mapeado cuando la API responde
not ok 1 - ... error: 'repositoryWith(...).getProfileOrNull is not a function'
   ...
# Subtest: REQ-27-02 .. REQ-27-06
not ok 2-6 - ... 'getProfileOrNull is not a function'
# Subtest: REQ-27-07/10: el componente usa getProfileOrNull y no invoca la vía que lanza
not ok 8 - ... 'htb-stadistics.astro no obtiene el perfil con getProfileOrNull() (REQ-27-07)'
   (el componente aún hacía `getProfile()` en el frontmatter)
# pass 1  # fail 7
```

**VERDE** — tras implementar (8/8):

```
# tests 8  # pass 8  # fail 0
```

## Verificación final

- `node --test tests/htb-api-graceful-degradation.test.mjs` → 8/8 pass
- `node --test tests/htb-profile-repository.test.mjs` → verde sin cambios
- `node --test tests/htb-stadistics-section.test.mjs` → verde (1 aserción actualizada)
- Suite completa: **177/177 pass** (169 previos + 8 nuevos)
- `./init.sh` → formato OK, tests 100%, build OK:

```
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Desviaciones de la spec

Ninguna. Se implementó exactamente REQ-27-01..10 según requirements.md y las
Decisiones 1-6 del design.md: degradación en dominio, componente sin lógica,
sección oculta si null, `getProfile()` conservado, sin tokens/CSS nuevos,
actualización única y justificada de la aserción del test 22.

## Detalle del repositorio (≤100 líneas)

- Cabecera comprimida a 1 línea; una línea en blanco entre `HtbProfileDataError`
  y `HtbProfileRepository` eliminada. Archivo: 100 líneas exactas (límite OK).
- `getProfileOrNull` delega en `getProfile()` y captura todo error → `null`:
  como todos los caminos internos lanzan `HtbProfileDataError` (assertCredentials,
  fetch catch, HTTP no-ok, JSON inválido, perfil inválido), la captura es total.

## Delta astro.config.mjs (decisión del humano, 2026-08-13)

Resolución del CHANGES_REQUESTED nº 1 de `progress/review_27...md`: el reviewer
detectó una modificación sin commit y sin mención en `astro.config.mjs` (mtime
10:26, 8 min tras el commit `cabaa4f` de las 10:18). El humano decidió
**DOCUMENTAR Y CONSERVAR** el workaround (fue lo que estabilizó el dev server
en Windows tras el error de re-optimización de rolldown-vite: "rolldown-runtime
> file does not exist ... optimizeDeps"; el propio Vite sugería "Try adding it
to optimizeDeps"). No es un cambio de la feature 27 ni de ningún agente: es
edición directa del humano líder, aceptada por decisión explícita.

Qué cambió respecto a `cabaa4f` (verificado con `git diff HEAD -- astro.config.mjs`):

- `vite.optimizeDeps`: se eliminó `exclude: ['@astrojs/internal-helpers']` y se
  añadió `include: ['astro/assets/services/noop']` + `disabled: false` (el
  workaround que estabiliza la re-optimización en Windows).
- Se eliminó `ssr.noExternal: ['astro']` (retirada aceptada por el humano).
- Se añadió `vite.server.watch.ignored: ['**/.vite/**']` con el comentario de
  evitar loops de recarga en Windows.
- El bloque `env` quedó reformateado (indentación): cosmético, funcionalmente
  idéntico — el esquema env de REQ-22-07/08 (IN_MAINTENANCE public/client,
  HTB_API_TOKEN y HTB_USER_ID secret/server/optional) permanece intacto.
- Fin de línea y líneas en blanco de cabecera/cola: cosmético.

Cobertura automatizada: `tests/astro-config-dev-workaround.test.mjs` (nuevo,
4 tests) fija el estado canónico del delta — `optimizeDeps.include` con
`astro/assets/services/noop`, `optimizeDeps.disabled === false`,
`server.watch.ignored` con `**/.vite/**`, ausencia de las entradas retiradas
(`@astrojs/internal-helpers` y `noExternal`) y esquema env de REQ-22-07/08 sin
regresión. Resultado: **4/4 pass** contra la config actual. Es un test de
caracterización (fija un estado ya decidido por el humano; no hay ciclo rojo
porque la config no se modifica en esta resolución). `./init.sh` final:
"El entorno está perfecto" (suite 181/181, formato OK, build OK).