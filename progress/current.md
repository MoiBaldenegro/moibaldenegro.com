# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

**Ciclo 29 CERRADO (2026-08-13).** Backlog completo: **features 1-32 `done`
conservadas en el array, 0 pendientes, 0 en progreso** — no hay feature
implementable en este momento. `./init.sh` en "El entorno está perfecto"
(formato OK, tests 206/206 al 100 %, build de producción en workerd OK).

**Estado final del sitio (ciclo 29, dirección del humano):**
- Prerender en **workerd** (`prerenderEnvironment: 'workerd'`, default del
  adapter 14.2.1) — `astro.config.mjs` solo cambió esa línea; el bloque vite
  (optimizeDeps.include, server.watch.ignored) intacto.
- Fallback `cloudflare:workers` **restaurado** en `htb-stadistics.astro`
  (alias ENV_TOKEN/ENV_ID de astro:env/server + `env.HTB_*` con `||`), con la
  degradación elegante de la feature 27 intacta (getProfileOrNull +
  `{profile && ...}`); el crash `setInternals` del camino node ya no existe.
- `src/` **sin módulos node**: repositorios JSON con loader inyectable +
  `with { type: 'json' }` (feature 31); `wrangler.jsonc` sin cambios
  (`nodejs_compat` y `global_fetch_strictly_public` conservados, REQ-32-07).
- Registro de dependencias aprobadas operativo en el arnés (features 29/30):
  docs/dependencies.md validado por check-format; `worker-configuration.d.ts`
  versionado.

**Siguiente paso del líder:** cuando el humano pida nueva feature, darla de
alta vía spec_author; el arnés está en verde total esperando.

### Última sesión

**2026-08-13 — feature 32 cerrada (prerender en workerd con el fallback
`cloudflare:workers` restaurado).** Veredicto del reviewer: **APPROVED**
(`progress/review_32_prerender-workerd.md`, verificado en disco, sin cambios
requeridos). Ciclo TDD: `tests/htb-stadistics-prerender-fix.test.mjs`
reescrito en rojo (3 fail) contra REQ-32-01..07 → verde 6/6 tras implementar
config + componente; suite completa 206/206; `./init.sh` en "El entorno está
perfecto" (build real en workerd, sin ECONNREFUSED — contingencia REQ-32-06
documentada, no aplicada); `astro preview` verificado (isla server:defer 200
con degradación a null, sin `[object Object]` — riesgo PR #16720 no
manifestado). Detalle completo en `progress/history.md` (Sesión 2026-08-13 —
feature 32) y `progress/impl_32_prerender-workerd.md`.

Antes (misma fecha): feature 31 cerrada (repositorios JSON al patrón loader
sin `node:fs` + arnés a verde; `progress/review_31_json-repositories-loader.md`
APPROVED).

### Artefactos permanentes (no se borran)

- Informes de implementación: `progress/impl_31_json-repositories-loader.md`,
  `progress/impl_32_prerender-workerd.md`.
- Reviews: `progress/review_31_json-repositories-loader.md`,
  `progress/review_32_prerender-workerd.md`.
- Specs: `specs/31_json-repositories-loader/`, `specs/32_prerender-workerd/`.
- Research del ciclo 29: `progress/research/prerender-workerd-adapter.md`,
  `progress/research/lectura-json-sin-nodefs.md`,
  `progress/research/nodejs-compat-prerender-workerd.md`,
  `progress/research/ciclo-prerender-workerd.md`.
- Historial append-only: `progress/history.md` (sesiones 2026-08-13,
  features 25-32).

### Plantilla (resto de sesión)

(Sin trabajo en curso: ciclo cerrado, backlog vacío de pendientes.)
