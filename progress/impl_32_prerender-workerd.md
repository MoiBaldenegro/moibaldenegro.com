# Informe de implementación — feature 32 `prerender-workerd`

Fecha: 2026-08-13 · Implementador: agente implementador del arnés
Estado: implementada, pendiente de revisión externa (no marco `done`).

## Resumen

La feature ejecuta la dirección del humano (ciclo 29): el prerender pasa a
`prerenderEnvironment: 'workerd'` (default del adapter 14.2.1) y se restaura el
fallback `cloudflare:workers` en `htb-stadistics.astro` (necesario: con el
adapter, `astro:env/server` no entrega las envs del worker en runtime). Con
workerd, el módulo virtual `cloudflare:workers` resuelve de forma nativa y el
crash `setInternals` del camino node (feature 28) desaparece. El prerrequisito
de la feature 31 (repositorios sin `node:*` en `src/`) está cerrado y APPROVED.

## 1. Ciclo rojo/verde (TDD)

### Test escrito primero (en rojo)

`tests/htb-stadistics-prerender-fix.test.mjs` reescrito íntegramente contra
`specs/32_prerender-workerd/requirements.md` (REQ-32-01..07), según la orden de
la spec REQ-32-03: el test de la feature 28 (que fijaba la AUSENCIA de
`cloudflare:workers`) se reescribe al nuevo estado canónico de PRESENCIA, con
el guard de `wrangler.jsonc` (REQ-32-07) y los guards de la degradación de la
27 (REQ-32-04). La feature 28 permanece `done` como historial (precedente
feature 25).

### Evidencia del rojo (estado previo a implementar, sin cambios de código)

```
$ node --test tests/htb-stadistics-prerender-fix.test.mjs
not ok 1 - REQ-32-01: el adapter declara prerenderEnvironment workerd y conserva el bloque vite
not ok 2 - REQ-32-02: el frontmatter importa env desde cloudflare:workers y los alias de astro:env/server
not ok 3 - REQ-32-02/03: el token y el identificador usan el fallback ENV_* || env.HTB_*
ok 4 - REQ-32-04: conserva getProfileOrNull() con los valores resueltos y {profile && ...}
ok 5 - REQ-32-07: wrangler.jsonc conserva nodejs_compat y global_fetch_strictly_public
ok 6 - Convención: el componente es <=100 líneas y el frontmatter solo importa, define consts y llama
# tests 6
# pass 3
# fail 3
```

Fallen exactamente los 3 tests que fijan el nuevo estado canónico (config con
`'node'`, ausencia del import de `cloudflare:workers`, ausencia de los
fallbacks); pasan los que el estado actual ya cumple (degradación 27, flags de
wrangler, convención de líneas).

### Evidencia del verde (tras la implementación)

```
$ node --test tests/htb-stadistics-prerender-fix.test.mjs
ok 1 - REQ-32-01: el adapter declara prerenderEnvironment workerd y conserva el bloque vite
ok 2 - REQ-32-02: el frontmatter importa env desde cloudflare:workers y los alias de astro:env/server
ok 3 - REQ-32-02/03: el token y el identificador usan el fallback ENV_* || env.HTB_*
ok 4 - REQ-32-04: conserva getProfileOrNull() con los valores resueltos y {profile && ...}
ok 5 - REQ-32-07: wrangler.jsonc conserva nodejs_compat y global_fetch_strictly_public
ok 6 - Convención: el componente es <=100 líneas y el frontmatter solo importa, define consts y llama
# tests 6
# pass 6
# fail 0
```

## 2. Cambios realizados (solo el scope de la feature 32)

### `astro.config.mjs` — diff exacto

```diff
   adapter: cloudflare({
     imageService: 'cloudflare',
-    prerenderEnvironment: 'node',
+    prerenderEnvironment: 'workerd',
   }),
```

Solo esa línea. `optimizeDeps.include` (`['astro/assets/services/noop']`) y
`server.watch.ignored` (`['**/.vite/**']`) permanecen intactos (REQ-32-01,
verificado por test).

### `src/components/htb-stadistics.astro` — frontmatter final

```astro
---
import { HTB_API_TOKEN as ENV_TOKEN, HTB_USER_ID as ENV_ID } from 'astro:env/server';
import { env } from 'cloudflare:workers';
import { HtbProfileRepository } from '../domain/repositories/htb-profile-repository.ts';
import '../styles/htb-stadistics.css';

const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;
const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;

const profile = await new HtbProfileRepository(HTB_API_TOKEN, HTB_USER_ID).getProfileOrNull();
---
```

Restaura las 4 líneas del humano (encima del import de `astro:env/server`),
sin `console.*` ni lógica extra; el marcado `{profile && ...}` NO cambia
(REQ-32-02, REQ-32-04). El archivo queda en 45 líneas (≤100).

### `tests/htb-stadistics-prerender-fix.test.mjs` — cómo quedó

Reescrito de 104 → 172 líneas (contra la spec 32, REQ-32-01..07), con 6 tests:

1. `REQ-32-01` — `astro.config.mjs` declara `prerenderEnvironment: 'workerd'`
   (y no `'node'`); `optimizeDeps.include` y `server.watch.ignored` sin cambios.
2. `REQ-32-02` — frontmatter importa `env` desde `cloudflare:workers` y
   `HTB_API_TOKEN as ENV_TOKEN, HTB_USER_ID as ENV_ID` desde `astro:env/server`.
3. `REQ-32-02/03` — presencia de `const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN;`
   y `const HTB_USER_ID = ENV_ID || env.HTB_USER_ID;`.
4. `REQ-32-04` — conserva `getProfileOrNull()`, constructor con
   `HTB_API_TOKEN/HTB_USER_ID`, `{profile && ...}`, sin `console.*` ni lógica.
5. `REQ-32-07` — `wrangler.jsonc` conserva `global_fetch_strictly_public` y
   `nodejs_compat` juntos en `compatibility_flags`.
6. Convención — componente ≤100 líneas.

La cabecera documenta que esta reescritura SUPERA el test de la feature 28
(ausencia → presencia) y que REQ-32-05 (build real) lo verifica
`tests/about-page.test.mjs` (REQ-11-05); REQ-32-06 es contingencia documentada,
no aserción.

### No tocados (verificado)

- `wrangler.jsonc`: sin cambios (REQ-32-07, test verde; investigación
  `nodejs-compat-prerender-workerd.md`: mantener ambos flags con la toolchain
  miniflare 5.20260804.1-alpha date-unaware).
- `tests/htb-stadistics-section.test.mjs` y
  `tests/htb-api-graceful-degradation.test.mjs`: sin modificaciones (pasan
  verdes con el componente restaurado — REQ-32-04).
- `tests/astro-config-dev-workaround.test.mjs`: sin modificaciones (el bloque
  vite no cambió).

## 3. Confirmación de `./init.sh`

```
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Suite completa: `# tests 206 / # pass 206 / # fail 0`. El build de producción
(REQ-32-05/REQ-11-05) corre el prerender en **workerd real** (adapter 14.2.1:
preview server de Vite + miniflare + binario workerd local, offline) y termina
sin errores; `cloudflare:workers` resuelve nativo y el crash `setInternals` del
camino node ya no existe.

## 4. Contingencia IPv4/IPv6 (REQ-32-06)

**NO fue necesaria**: el primer `pnpm build` (dentro de `./init.sh`) completó
sin `connect ECONNREFUSED`. La mitigación queda documentada por si el bug
#15525 del prerenderer 14.2.1 (sin fix) aparece en otro entorno (p.ej. CI o
máquina con `localhost` resolviendo a `::1` en el fetch del prerenderer):

```
NODE_OPTIONS=--dns-result-order=ipv4first pnpm build
```

La spec ya la declara (REQ-32-06) y este informe deja constancia de la
ejecución correcta sin ella en esta máquina.

## 5. Verificación post-cambio (riesgo PR #16720, isNode sin fix en astro 7.2.0)

`astro preview` (workerd real, mismo runtime de producción):

- `GET /` → **HTTP 200**; el HTML contiene la isla `server:defer` con su
  endpoint cifrado `/_server-islands/HtbStadistics?e=...&p=&s=` y el enlace
  `/about`.
- `GET /_server-islands/HtbStadistics?e=...&p=&s=` → **HTTP 200** con body
  vacío: sin vars HTB locales, `getProfileOrNull()` degrada a `null` y la
  sección no se renderiza (REQ-27-07/08 intactos en runtime). **Sin 500, sin
  `[object Object]`** → el falso positivo `isNode` (PR #16720, ausente en
  astro 7.2.0) no se manifiesta con el bundle actual.
- `GET /about` → **HTTP 200** con el perfil real (ruta prerendered servida
  por el preview workerd).

## 6. Estado del backlog

`feature_list.json`: feature 32 marcada `in_progress` (no marco `done`;
espera revisión). `progress/current.md` actualizado con el plan y el cierre de
sesión. Sin dependencias nuevas, sin ediciones manuales fuera del arnés.
