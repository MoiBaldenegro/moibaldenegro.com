# Review — feature 32 `prerender-workerd`

**Veredicto:** APPROVED

Fecha: 2026-08-13 · Reviewer: agente revisor externo del arnés.

## Alcance revisado

Feature 32 `prerender-workerd` (depends_on [31], feature 31 `done` en
`feature_list.json`). Spec: `specs/32_prerender-workerd/requirements.md`
(REQ-32-01..07). Informe: `progress/impl_32_prerender-workerd.md`.

## Comprobaciones con evidencia (código real, no solo informe)

### 1. `astro.config.mjs` — REQ-32-01 ✅
- L28: `prerenderEnvironment: 'workerd'` (verificado en disco, diff git confirma
  que SOLO esa línea cambió: `-prerenderEnvironment: 'node'` → `+...'workerd'`).
- `optimizeDeps.include: ['astro/assets/services/noop']` (L32-34) y
  `server.watch.ignored: ['**/.vite/**']` (L35-40) intactos.
- Esquema env `IN_MAINTENANCE`/`HTB_API_TOKEN`/`HTB_USER_ID` (L7-24) intacto
  (necesario para REQ-21-01/REQ-22-08: test `htb-stadistics-section` lo verifica).

### 2. `src/components/htb-stadistics.astro` — REQ-32-02/04 ✅
- 45 líneas (≤100, test lo verifica).
- Frontmatter con las 4 líneas restauradas: alias `ENV_TOKEN`/`ENV_ID` de
  `astro:env/server` (L2), `import { env } from 'cloudflare:workers'` (L3),
  `const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;` (L7) y
  `const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;` (L8).
- Sin `console.*` (test REQ-32-04 `doesNotMatch`), sin lógica extra
  (`doesNotMatch /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/` en frontmatter).
- Marcado `{profile && ...}` intacto (L13) y `getProfileOrNull()` conservado
  (L10, REQ-27-07/08). El diff git confirma que el marcado NO cambió (solo el
  frontmatter).

### 3. `wrangler.jsonc` — REQ-32-07 ✅
- Sin cambios (no aparece en `git status`). `compatibility_flags` con
  `global_fetch_strictly_public` y `nodejs_compat` presentes (L4), verificado
  además por el test REQ-32-07. Fundamentado en
  `progress/research/nodejs-compat-prerender-workerd.md` (toolchain miniflare
  5.20260804.1-alpha date-unaware: mantener ambos flags).

### 4. Prerrequisito feature 31 — `src/` sin imports `node:*` ✅
- Grep de `node:` en `src/`: 0 imports de módulos node (única coincidencia es
  el token CSS `--color-marca-node` en `tokens.css`, no un import). La feature
  31 está `done` (review_31 APPROVED) y su prerequisito sigue limpio.

### 5. Tests — ciclo rojo/verde y suite ✅
- `tests/htb-stadistics-prerender-fix.test.mjs` reescrito contra la spec 32
  (REQ-32-01..07). Informe documenta el rojo previo (3 fail: los asserts que
  fijan el nuevo estado canónico) y el verde posterior (6/6). Verificado por
  mí: `node --test` sobre los 4 tests clave
  (prerender-fix, htb-stadistics-section, htb-api-graceful-degradation,
  astro-config-dev-workaround) → 29/29 pass.
- `tests/htb-stadistics-section.test.mjs` y
  `tests/htb-api-graceful-degradation.test.mjs` sin modificaciones (no
  aparecen en `git status`).
- Suite completa: `pnpm test` → **206 tests / 206 pass / 0 fail**.
- Contingencia REQ-32-06 documentada en spec e informe (NODE_OPTIONS
  ipv4first para #15525): no fue necesaria (build sin ECONNREFUSED).

### 6. `./init.sh` — ejecutado por mí ✅
- Termina en "El entorno está perfecto": herramientas, archivos del harness,
  formato, tests al 100% y **build de producción** (REQ-11-05 ejercita el
  prerender workerd real vía miniflare) en verde.

### 7. Verificación de runtime de la isla (riesgo PR #16720) — reproducida ✅
La spec no la exige como REQ (solo REQ-32-05 build), pero la reproduje para
confirmar la evidencia del informe con `astro preview` (workerd real):
- `GET /` → **200**, HTML con la isla `server:defer`
  `/_server-islands/HtbStadistics?e=<payload cifrado>&p=&s=` y el enlace
  `/about`.
- `GET /_server-islands/HtbStadistics?e=<payload real del HTML>&p=&s=` →
  **200** con body vacío: sin vars HTB locales, `getProfileOrNull()` degrada a
  `null` y la sección no se renderiza. **Sin 500, sin `[object Object]`** — el
  falso positivo `isNode` (PR #16720, ausente en astro 7.2.0) no se manifiesta.
- `GET /about` → 307 → `/about/` → **200** con el perfil real.

### 8. Trazabilidad acceptance ↔ REQ ✅
| Acceptance feature 32 | REQ | Evidencia |
|---|---|---|
| A1 | REQ-32-01 | config real + test REQ-32-01 (6/6) |
| A2 | REQ-32-03 | informe: rojo 3 fail → verde 6/6 (red-first) |
| A3 | REQ-32-02 | componente real L2-8 + test REQ-32-02/03 |
| A4 | REQ-32-04 | componente L10/13 + tests section/degradation verdes sin modificar |
| A5 | REQ-32-05 + REQ-11-05 | `./init.sh` build OK (workerd) |
| A6 | REQ-32-06 | documentada en spec e informe; no aplicada (sin ECONNREFUSED) |
| A7 | REQ-32-07 | wrangler.jsonc real + test REQ-32-07 |
| A8 | REQ-32-05 | suite 206/206 + init.sh verde |

### 9. Dependencias ✅
`depends_on: [31]`; feature 31 `done` en `feature_list.json` con review
APPROVED (`progress/review_31_json-repositories-loader.md`). No se implementó
saltando ninguna dependencia pendiente.

## Checkpoints (CHECKPOINTS.md)

- C1 — Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
  (htb-stadistics.astro importa su hoja, sin bloque `<style>`).
- C2 — Frontmatter solo imports y paso de datos: [x] (solo imports, consts y
  llamada al repositorio; test lo verifica).
- C3 — Ningún componente lee JSON directamente: [x] (HtbProfileRepository).
- C4 — Tokens, no valores sueltos: [x] (sin cambios de estilos en esta
  feature; REQ-32-04 no toca presentación).
- C5 — ≤100 líneas por archivo: [x] (componente 45 líneas; resto sin cambios).
- C6 — Sin dependencias externas nuevas: [x] (package.json no modificado).
- C7 — `src/data/*.json` válido: [x] (sin cambios).
- C8 — Repositorios con errores nombrados: [x] (getProfileOrNull de la 27
  intacto; sin cambios en el dominio).
- C9 — `./init.sh` verde: [x] (ejecutado por mí, "El entorno está perfecto").
- C10 — Página correcta en desktop/móvil: [ ] (pendiente inspección visual en
  navegador, arrastrado de sesiones previas; no bloquea esta revisión de
  config/prerender — runtime verificado vía preview).
- C11 — `feature_list.json` con la tarea en `done`: [ ] (la 32 sigue
  `in_progress` a la espera de que el líder la marque `done` tras APPROVED;
  estado normal del flujo).
- C12 — `progress/current.md` documenta la sesión: [x] (feature 32 IMPLEMENTADA
  con detalle; history.md al día).
- C13 — Sin temporales/debug/TODOs: [x] (sin `console.*` en el componente;
  preview cerrado tras la verificación).

## Observaciones (no bloqueantes)

1. El informe dice "GET /about → HTTP 200"; en mi reproducción `/about`
   responde 307 → `/about/`, y `/about/` responde 200 con el perfil real
   (trailing-slash del preview server). Es una imprecisión menor del informe,
   no del código: la página real responde 200.
2. El 400 inicial del endpoint de la isla fue por una URL inventada
   (`e=abc`); con el payload real del HTML el endpoint responde 200. En
   producción el navegador usa el payload que el propio HTML incrusta.

## Cambios requeridos

Ninguno. La feature cumple REQ-32-01..07, respeta `docs/architecture.md` y
`docs/conventions.md`, el ciclo rojo/verde está evidenciado en el informe, la
suite queda 206/206 en verde y `./init.sh` termina en "El entorno está
perfecto".