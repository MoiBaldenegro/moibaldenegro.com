# Review — feature 21 `ssr-cloudflare-align`

**Verificador:** reviewer nivel 1 · **Fecha:** 2026-08-12
**Spec:** `specs/21_ssr-cloudflare-align/requirements.md` (REQ-21-01..06, sin design.md — no toca UI/presentación, correcto)
**Informe del implementer:** `progress/impl_21_ssr-cloudflare-align.md` (leído completo)
**Research:** `progress/research/refactor-post-manual.md` (D4, D7.1, riesgo R1)

**Veredicto:** APPROVED

## Resumen

La feature 21 canaliza al arnés la decisión SSR + adapter Cloudflare del
usuario (regla 2 con excepción documentada), añade `.wrangler/` a `.gitignore`
y destrackea el estado de miniflare (riesgo R1) sin borrar archivos locales, y
adapta REQ-11-05 de `tests/about-page.test.mjs` al output real del adapter
(`dist/client/about/index.html`) conservando la semántica. Todo el contrato
REQ-21-01..06 está en verde (7/7). El build completo queda bloqueado por
`src/pages/posts/[id].astro` (pieza del USUARIO, ajena a la spec 21, pendiente
de la feature 24) — se documenta como dependencia, no como fallo de la 21.

## Tabla REQ-21-01..06 con evidencia

| REQ | Spec | Evidencia en disco (verificación independiente) | Resultado |
|-----|------|--------------------------------------------------|-----------|
| REQ-21-01 | mantiene output server + adapter cloudflare; esquema env | `astro.config.mjs:7` `output: 'server'`; `:4,29` import/uso `cloudflare({ imageService: 'cloudflare' })`; `:10-25` esquema `env` con `IN_MAINTENANCE` (public/client), `HTB_API_TOKEN` (secret/server/optional), `HTB_USER_ID` (secret/server/optional). Tests 1 y 2 verdes. Build emite `dist/client/` + `dist/server/` (research D4); el build **completo** aborta solo en `[id].astro` (ajeno, ver §Build). Presente en disco, sin reformateo (no aparece en `git status` → intacto desde commit del usuario). | ✅ |
| REQ-21-02 | script generate-types con wrangler types | `package.json:14` `"generate-types": "wrangler types"`; `package.json` con `@astrojs/cloudflare ^14.2.1` y `wrangler ^4.121.0`. Test 3 verde. Intacto (no en `git status`). | ✅ |
| REQ-21-03 | `.wrangler/` fuera de git | `.gitignore:4-5` `.wrangler/` con comentario "wrangler / cloudflare local state (sqlite de miniflare)". `git ls-files .wrangler` → **vacío** (verificado: exit 0, sin salida). Índice: 15 ficheros `D` staged (solo índice, `git rm --cached`). **Archivos locales intactos en disco**: `find .wrangler -name "*.sqlite"` = 5 + `.sqlite-shm`/`.sqlite-wal` presentes con mtime 11–12 ago (no borrados). | ✅ |
| REQ-21-04 | test about verifica ruta real del adapter | `tests/about-page.test.mjs:30` `DIST_ABOUT_PATH = new URL('../dist/client/about/index.html', ...)`. Test 6 (REQ-21-04) verde + verifica que la ruta antigua `dist/about/index.html` ya no está. Diff mínimo confirmado: solo la constante, mensaje de assert y comentario de cabecera. | ✅ |
| REQ-21-05 | IF /about no se genera THEN test falla | Semántica conservada, sin debilitamiento: `assert.equal(build.status, 0)` (línea 222-226) + `existsSync(DIST_ABOUT_PATH)` (línea 227-230). El test **sigue fallando hoy** por el build abortado en `[id].astro` (prueba de que la semántica se mantiene). Comentario de cabecera coherente (líneas 20-25). | ✅ |
| REQ-21-06 | dependencias del adapter justificadas | Documentada en 3 sitios: descripción de la feature 21 en `feature_list.json` (excepción regla 2: deploy a Cloudflare Workers es objetivo declarado; regla 9: páginas prerender, solo la feature 22 renderiza `server:defer`), `specs/21_ssr-cloudflare-align/requirements.md` REQ-21-06, y cabecera del test nuevo (líneas 6-15). Test 7 verde. | ✅ |

**Evidencia rojo/verde (pregunta de revisión):** `tests/ssr-cloudflare-align.test.mjs` escrito **primero**; ROJO capturado 5 pass/2 fail (REQ-21-03 ×2: `.gitignore` sin `.wrangler/` y 15 sqlite trackeados) → verde 7/7 tras `.gitignore` + `git rm -r --cached .wrangler`. REQ-11-05 adaptado: ROJO 10 pass/1 fail (build abortado por `[id].astro`) registrado antes de tocar nada más.

## Archivos tocados vs alcance permitido

| Archivo | Cambio | Dentro de alcance |
|---------|--------|-------------------|
| `tests/ssr-cloudflare-align.test.mjs` | **nuevo**, 120 líneas, 7 tests contrato REQ-21-01..06 | ✅ feature |
| `tests/about-page.test.mjs` | Solo adaptación REQ-21-04/05 (constante + mensaje + cabecera) | ✅ feature |
| `.gitignore` | `.wrangler/` con comentario | ✅ feature |
| Índice de git | 15 ficheros `.wrangler/state/**` destrackeados (solo índice) | ✅ feature |
| `feature_list.json` | status 21 `pending` → `in_progress` (cierre a `done` lo decide el líder) | ✅ correcto |

**NO tocados (verificado en disco, fuera de alcance):** `astro.config.mjs` y
`package.json` (no aparecen en `git status` → intactos, sin reformateo);
`src/pages/posts/[id].astro` (`git status` limpio → no modificado); dominio
posts/`posts-repository.ts` (18), repos JSON (19), `latest-articles.astro`
(20 — su `M` en git status es de la 20, ya revisada/APPROVED), docs del kit
(23 — siguen pendientes sus fugas), `htb-stadistics.astro` (22), GOL
(14-16). No se tocaron piezas fuera del alcance de la 21.

## Nota explícita — build roto por `src/pages/posts/[id].astro`

`src/pages/posts/[id].astro` **existe** (commit manual del usuario `72e5c52`,
35 líneas, `getStaticPaths` + `prerender = true`) e importa
`markdownPostRepository` (línea 2) — **API eliminada por REQ-18-05** → el build
aborta en `[id].astro:3` con `MISSING_EXPORT`. La página declara
`transition:name` `title-${post.id}` e `img-${post.id}` — exactamente los pares
del design de la feature 24 `view-transitions`, que es su cauce natural
(adaptarla a `PostsRepository` o eliminarla). La spec 21 (REQ-21-01..06) **no
cubre** esa página y el implementer no la tocó (instrucción del líder).
Conforme a la directiva del líder, **esto NO bloquea la feature 21**: su
contrato REQ-21-01..06 está verde 7/7 y la pieza que la habilita (REQ-11-05
adaptado a `dist/client/about/index.html`) está implementada y verificada. La
dependencia del build completo queda **registrada como pendiente de la
feature 24**.

## Verificación independiente en disco (ejecutada por el reviewer)

| Comando / comprobación | Resultado |
|------------------------|-----------|
| `node --test tests/ssr-cloudflare-align.test.mjs` | **7/7 pass** ✅ |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` ✅ |
| `pnpm test` (suite completa) | **157 pass / 2 fail** — residuales SOLO: (a) `REQ-11-05` (build abortado por `[id].astro`, pendiente de la 24 — ajeno a la 21); (b) `REQ-01-05` del kit (feature 23 `harness-docs-alignment`, ajeno). La feature 22 no tiene tests aún. |
| `git ls-files .wrangler` | vacío (exit 0, sin salida); 15 `D` staged solo en índice; archivos locales intactos en disco ✅ |
| `./init.sh` | 2 comprobaciones en rojo, **ambas ajenas al alcance 21**: `tests al 100%` (2 residuales arriba) y `build de producción` (solo `[id].astro`). Todo lo demás verde (entorno, formato). |
| Spec 21 | `specs/21_ssr-cloudflare-align/` solo contiene `requirements.md` (sin design.md: correcto, no toca UI). |

## Checkpoints

- C1: [x] — Estilos en `src/styles/*.css` (la 21 no toca UI; sin violaciones nuevas)
- C2: [x] — Sin lógica JS en UI (no toca UI)
- C3: [x] — Componentes no leen JSON (no toca componentes)
- C4: [x] — Tokens (no toca estilos)
- C5: [x] — ≤100 líneas: el test nuevo tiene 120; se acoge al precedente establecido del repo (todos los tests aprobados superan 100, p.ej. about-page.test.mjs con 267 líneas) — la regla se aplica en `src/` y `scripts/`, no a tests. No bloqueante (ver Observaciones)
- C6: [x] — Dependencias externas: `@astrojs/cloudflare`/`wrangler` con excepción documentada (REQ-21-06)
- C7: [x] — `src/data/*.json` válido (no toca datos)
- C8: [x] — Repositorios validan con `*Error` (no toca repos)
- C9: [ ] ← Razón: `./init.sh` en rojo por 2 comprobaciones **ajenas al alcance 21** — tests (`REQ-11-05` → `[id].astro`, pendiente de la feature 24; `REQ-01-05` → feature 23) y build (solo `[id].astro`). Según la directiva del líder, este rojo **no bloquea** la 21: la dependencia queda documentada pendiente de la 24.
- C10: [ ] ← Razón: no aplica a esta feature — la 21 es de infraestructura/pipeline, no toca UI ni hay cambio visual que verificar en desktop/móvil.
- C11: [ ] ← Razón: la feature 21 sigue `in_progress`; el cierre a `done` lo decide el líder tras esta review (comportamiento correcto del ciclo). Ninguna otra feature a medias por la 21.
- C12: [x] — `progress/current.md` documenta la sesión 21 en detalle; `progress/history.md` está al día con los cierres de 18/19/20/17 (el cierre de la 21 irá al cerrarla).
- C13: [x] — Sin temporales, `print()`/`console.*` ni TODOs en la feature (grep limpio en el test nuevo; `.wrangler/` local ahora ignorado por git).

## Dependencias

Feature 21 declara `depends_on: []` → **sin dependencias pendientes que saltar**
(comprovación 4 del protocolo: trivialmente satisfecha).

## Observaciones (no bloqueantes)

1. `tests/ssr-cloudflare-align.test.mjs` = 120 líneas, por encima del límite de
   100 de la regla 12. No es bloqueante: se suma al precedente ya aprobado del
   repo (los tests de todas las features cerradas superan 100, p.ej.
   `about-page.test.mjs` 267 líneas). Si el líder quiere la regla estricta
   también en tests, sería decisión de arnés aparte, no de esta feature.
2. `astro.config.mjs` conserva la indentación no canónica del usuario
   (esquema env indentado a 8-10 espacios, `schema:{` sin espacio). Correcto
   según la orden "no reformatear la configuración del usuario" y verificado
   por test (regex tolerante). No se toca.
3. REQ-11-05 permanecerá en rojo en la suite hasta que la feature 24 resuelva
   `[id].astro` (adaptarlo a `PostsRepository` o eliminarlo). Una vez hecho,
   REQ-11-05 pasará a verde **sin más cambios en `tests/about-page.test.mjs`**
   (cambio ya completo y correcto).
4. El research D4 (refactor-post-manual) afirmaba "no hay `src/pages/posts/`";
   el hallazgo del implementer de la 18 lo corrigió (`[id].astro` sí existe).
   La 21 lo documenta correctamente como pieza ajena e intocada.
