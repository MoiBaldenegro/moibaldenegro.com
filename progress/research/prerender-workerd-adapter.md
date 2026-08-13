# Investigación: `prerenderEnvironment: 'workerd'` vs `'node'` en @astrojs/cloudflare 14.2.1 (Astro 7.2.0)

Fecha: 2026-08-13 · Investigador: explorer del arnés · Alcance: solo la pregunta acotada.
Contexto repo: `astro.config.mjs` L28 con `prerenderEnvironment: 'node'`; crash actual en
build real: `Cannot read properties of undefined (reading 'setInternals')` en
`default-prerenderer.js` (prerenderEntry.app undefined) por `import { env } from 'cloudflare:workers'`.

---

## Resumen ejecutivo

- **`'workerd'` es el prerender nativo y por defecto del adapter** (JSDoc en
  `dist/index.d.ts` L29-34 y docs oficiales). Con él, el prerender del build **no pasa por
  Node**: el adapter registra un prerenderer propio (`astro:build:start` →
  `setPrerenderer(createCloudflarePrerenderer(...))`, `dist/index.js` L369-385) que arranca
  un **Vite preview server con `@cloudflare/vite-plugin` (workerd vía Miniflare)** y genera
  las páginas haciendo requests HTTP a endpoints internos (`dist/prerenderer.js`). El bundle
  se ejecuta **dentro de workerd**, donde el módulo virtual `cloudflare:workers` existe de
  forma nativa → `import { env }` **NO crashea**. El crash actual es exclusivo del camino
  `'node'`: el `default-prerenderer` de Astro hace `import(prerenderEntryUrl)` en Node y el
  módulo `cloudflare:workers` no existe ahí (externalizado por el adapter como `cloudflare:*`
  → `app` queda undefined → `setInternals` explota).
- **Recomendación: volver al default `'workerd'`** (quitar `prerenderEnvironment: 'node'`
  de `astro.config.mjs`; mejor dejarlo **explícito** como `'workerd'` para documentar la
  intención). Requisitos del repo para hacerlo: (a) migrar `node:fs` de los dos
  repositorios (hero-profile y hero-cards) — en workerd **no hay filesystem**; (b) nada que
  cambiar en `wrangler.jsonc` (flags ya OK, `nodejs_compat` v2 por compat date ≥ 2024-09-23);
  (c) reconciliar `tests/astro-config-dev-workaround.test.mjs` (hoy **en rojo** por
  `disabled: false`, independiente de este cambio).
- **Riesgo principal nuevo**: en 14.2.1 el prerenderer usa `host: 'localhost'` +
  `fetch('http://localhost:...')`, con bug conocido de mismatch IPv4/IPv6
  (issue #15525, sin fix en esta versión) → posible `ECONNREFUSED` en el primer build
  (mitigación: `NODE_OPTIONS=--dns-result-order=ipv4first`).

---

## 1. ¿Qué hace exactamente el prerender con 'workerd'?

**Mecánica verificada en el adapter local (14.2.1):**

- `astro:config:setup`: si `prerenderEnvironment === 'workerd'`, el adapter pasa al plugin
  `experimental: { prerenderWorker: { config(_, { entryWorkerConfig }) { ... } } }` que clona
  el config del entry worker con `name: "prerender"` (mismas bindings/vars/secrets/compat
  flags) y añade el binding `IMAGES` si aplica (`dist/index.js` L132-152).
- `astro:build:start`: `setPrerenderer(createCloudflarePrerenderer(...))` solo si workerd
  (`dist/index.js` L369-385). Con `'node'` NO se registra prerenderer custom (salvo un hook
  para imágenes estáticas) y Astro usa su `default-prerenderer` en Node.
- `dist/prerenderer.js` (workerd): `setup()` arranca `vite.preview({ configFile: false,
  build.outDir: <serverDir>, plugins: [cfVitePlugin({ ...cfPluginConfig,
  viteEnvironment: { name: 'prerender' } })] })` (L106-122); `getStaticPaths()` (POST
  `/__astro_static_paths`), `render()` (POST `/__astro_prerender` con routeData serializado,
  `redirect: 'manual'`, chequea `x-astro-prerender-error` y `!response.ok`) y
  `collectStaticImages()` (POST `/__astro_static_images`) contra
  `http://localhost:<puerto>` (constantes en `dist/utils/prerender-constants.js`).
  Es decir: **el prerender se ejecuta en workerd sobre el output ya construido**, en el
  mismo runtime que servirá en producción.
- El plugin `@cloudflare/vite-plugin@1.51.3` (instalado; depende de `workerd@1.20260804.1`,
  `miniflare@5.20260804.1-alpha`, `wrangler@4.121.0` — ver su `package.json`) corre los
  workers con **Miniflare + binario local de workerd** (`new Miniflare(...)` en
  `dist/index.mjs`; opciones dev y preview con `telemetry: { enabled: false }`). En dev y
  preview el plugin spawnea workerd en `configureServer`/`configurePreviewServer`; durante
  `astro build` para el environment `ssr` NO se spawnea workerd (solo BuildEnvironment) — el
  único spawn de workerd en build es el prerenderer (verificado en triage del issue #16874).
- **Offline / sin auth / Windows**: el prerender de workerd es 100 % local (localhost↔workerd
  vía miniflare), no necesita cuenta ni red. El paquete `workerd` trae binario nativo para
  Windows (`@cloudflare/workerd-windows-64@1.20260804.1` en `optionalDependencies` de
  `node_modules/.pnpm/workerd@1.20260804.1/node_modules/workerd/package.json`). Este repo ya
  ejecutó workerd localmente en esta máquina Windows con éxito (feature 30: `wrangler types`
  spawnea workerd para generar los runtime types, sin red ni auth, ver
  `progress/impl_30_cloudflare-types-install.md`).
- Único entorno donde workerd no corre: Stackblitz/webcontainer (throw explícito en
  `dist/index.js` L93-95) — no aplica al repo.

Fuentes: adapter `dist/index.js` L132-152, L369-385; `dist/prerenderer.js` L106-178;
`@cloudflare/vite-plugin` `dist/index.mjs` (Miniflare, telemetry, prerenderWorker solo en
build); issue #16874 (triage: no spawn en build para SSR); issue #15684 (triage: prerenderer
= Vite preview + workerd vía miniflare); PR #15077 (Arquitectura del prerenderer).

## 2. ¿`cloudflare:workers` está disponible en el prerender workerd? ¿Qué env lee?

- **Sí, disponible.** El plugin `@astrojs/cloudflare:cf-imports` externaliza los imports
  `cloudflare:*` en el bundling (`dist/index.js` L190-200) y workerd los resuelve de forma
  nativa en runtime. En el camino workerd **el ESM loader de Node nunca se involucra**
  (triage issue #16506: "cloudflare:workers imports resolve natively in the workerd runtime…
  Node's ESM loader is never involved"). Esto es exactamente lo que el repo necesita para
  `import { env }` en componentes que entran en el prerender.
- El camino `'node'`, en cambio, está **roto por diseño** con `cloudflare:workers`
  (issue #16506: `prerenderEnvironment: 'node'` "is expected to fail if your prerender
  bundle transitively imports cloudflare:workers"). El crash `setInternals` del repo es la
  manifestación local de esto: `default-prerenderer.js` de Astro 7.2.0 hace
  `await import(prerenderEntryUrl); const app = prerenderEntry.app; app.setInternals(...)`
  (verificado en `node_modules/astro/dist/core/build/default-prerenderer.js`) y, con el
  módulo virtual ausente en Node, `app` queda undefined.
- **Qué env ve el worker 'prerender'**: al ser clon del config del entry worker, sus
  bindings/vars vienen de `wrangler.jsonc` (vars + secrets + bindings) más las variables
  locales que el plugin resuelve para preview/dev con `wrangler.unstable_getVarsForDev`
  (`.dev.vars`, `.env`, `process.env`; `getLocalDevVarsForPreview` en
  `dist/index.mjs` del plugin escribe `dist/<env>/.dev.vars` que wrangler lee al arrancar
  miniflare). **En este repo**: `wrangler.jsonc` no declara `vars` ni `secrets`; existe un
  `.env` en la raíz del repo (no verificado su contenido por higiene de secretos) → `env`
  durante el prerender tendrá lo que esa fuente local defina. Si `HTB_API_TOKEN` /
  `HTB_USER_ID` no están en `.env`, durante el prerender serán `undefined` → el fallback
  defensivo del componente debe seguir aplicando (los secrets reales de producción se fijan
  aparte con `wrangler secret put`; en runtime on-demand el worker sí los ve).
- Nota: `dist/utils/wrangler-config.js` (`loadWranglerEnv` en `astro:config:done`) copia
  vars del config a `process.env` solo para `astro:env` en el lado Node del build — con
  workerd esa vía no es la que alimenta `env` del prerender.

Fuentes: `dist/index.js` L190-200; `dist/utils/wrangler-config.js`; plugin CF
`dist/index.mjs` (getLocalDevVarsForPreview + unstable_getVarsForDev);
docs oficiales sección "Environment variables and bindings"; issues #16506 (#15237/#15411),
#15077.

## 3. Requisitos y problemas conocidos (flags, Windows, versión 14.2.1)

- **`nodejs_compat` NO es requisito para `cloudflare:workers`**: el módulo virtual es del
  runtime workerd y existe siempre. Solo se necesita si el código prerendered usa `node:*`.
  El repo ya lo tiene (`wrangler.jsonc` L4) y con `compatibility_date: 2026-08-11` (≥
  2024-09-23) entra en el modo **v2** que exige el plugin ("Only the v2 mode is supported…",
  en `dist/index.mjs` del plugin; docs: "Wrangler can inject polyfills, requires nodejs_compat
  and a compatibility date of 2024-09-23 or later"). Nada que cambiar.
- **`node:fs` NO funciona en workerd**: sin filesystem real en el runtime; accesos directos
  a fs durante el prerender fallan ("operation not permitted", reportado en issue #15684).
  ⚠️ El repo usa `node:fs` (`readFileSync`) en `src/domain/repositories/hero-profile-repository.ts`
  L6 y `src/domain/repositories/hero-cards-repository.ts` L6 → **fallarán con workerd**.
  Esto coincide con la decisión del humano (ciclo 29: quitar node:fs de los repositorios con
  una vía compatible con node:test y el build del adapter). Es requisito previo/simultáneo,
  no opcional.
- **WASM dinámico** (`WebAssembly.instantiate`) no permitido en workerd; módulos nativos
  tipo sharp tampoco (issue #15684) — no aplica al repo (imageService 'cloudflare' usa
  bindings de imágenes; el pipeline sharp local del `collectStaticImages` corre en el lado
  Node del build, fuera de workerd, y solo como fallback/compile).
- **Bug IPv4/IPv6 en el prerenderer (relevante en Windows)**: issue #15525 —
  `vite.preview` con `host: 'localhost'` puede bindear a `::1` mientras el fetch Node resuelve
  `127.0.0.1` → `connect ECONNREFUSED` durante `getStaticPaths` y build roto (en algunos
  entornos 404 al deployar). **14.2.1 NO incluye el fix**: `dist/prerenderer.js` L116 sigue
  con `host: "localhost"` y L125 `http://localhost:${address.port}`. Node 22 en Windows
  resuelve `localhost` a `::1` por defecto (verbatim) → riesgo real en este repo. Mitigación
  reportada por usuarios: `NODE_OPTIONS=--dns-result-order=ipv4first` (comentario en #15525).
- **Visibilidad de errores durante prerender**: console.log/warn de workerd se tragan
  (issue #16200) y errores de render en streaming pueden acabar como 200 con HTML truncado
  (issue #16809, mitigado en #17047). En 14.2.1 el prerenderer ya chequea
  `x-astro-prerender-error` y `!response.ok` en `render()` (más que versiones previas) — pero
  conviene que el arnés valide el output HTML del build (el repo ya lo hace: REQ-11-05).
- **Otros bugs del camino NODE que desaparecen con workerd**: dev con `prerenderEnvironment:
  'node'` + rutas dinámicas/catch-all prerendered rompe `cloudflare:workers` en rutas
  on-demand (#16553) y el endpoint `/_image` devuelve 500 (#17348, fix PR #17349) — todos
  del camino node. Con workerd (default) no aplican.
- **CI sandbox sin workerd**: si workerd no puede arrancar, el build falla (ECONNREFUSED,
  issues #15684 triage y #16874). En la máquina local Windows y en inicio `.sh` del arnés
  local ya se demostró que workerd funciona (feature 30) — sin riesgo conocido aquí.

## 4. Coste/limitaciones de workerd frente a node

| Aspecto | workerd (default) | node (opt-out) |
|---|---|---|
| Runtime del prerender | workerd real (== producción): bindings, fetch, caches igual que runtime | Node: FS, módulos nativos, WASM dinámico disponibles |
| `cloudflare:workers` / `env` | ✅ nativo, disponible durante prerender | ❌ módulo inexistente → crash/build roto |
| Coste de build | +workerd process + Vite preview server + HTTP por página (más lento/memoria) | import directo del bundle en Node (más rápido) |
| `node:fs`, `child_process`, nativos ABI | ❌ no disponibles | ✅ disponibles |
| Paridad con producción | ✅ máxima (propósito declarado: "match the production environment as closely as possible", docs) | ❌ el prerender puede comportarse distinto que el runtime |
| Consola/errores | logs de workerd tragados (#16200, #16809) | visibles |

Docs oficiales lo resumen: "By default, prerendered pages are built using Cloudflare's
workerd runtime to match the production environment as closely as possible. Set this option
to 'node' when your prerendered pages depend on Node.js APIs or NPM packages that are not
compatible with workerd" (guía del adapter).

## 5. Dev server: workerd vs node y el workaround de optimizeDeps

- Desde Astro 6/v13 el dev server del adapter corre **enteramente en workerd** (docs:
  "Development server now uses workerd… your development environment is now a much closer
  replica of your production environment"). El plugin node de prerender dev
  (`createNodePrerenderPlugin`, `dist/vite-plugin-dev-server-prerender-middleware.js`) solo
  se registra con `prerenderEnvironment === 'node' && command === 'dev'` (`dist/index.js`
  L187). En Astro 7.2.0, el middleware `astroDevPrerenderHandler` que sirve páginas
  prerendered por el entorno node solo se activa si el adapter puso el símbolo
  `devPrerenderMiddlewareSymbol` (verificado en `node_modules/astro/dist/core/constants.js`
  y `dist/vite-plugin-astro-server/plugin.js`: `shouldHandlePrerenderInCore =
  Boolean(viteServer[devPrerenderMiddlewareSymbol])`). En **workerd**, ese símbolo no se pone:
  las páginas prerendered en dev se sirven por el pipeline SSR normal dentro de workerd →
  `cloudflare:workers` disponible **para todas las rutas** (prerendered y on-demand), y se
  eliminan los bugs conocidos del camino node en dev (#15946 server islands, #16553 rutas
  dinámicas, #17348 /_image).
- **Workaround optimizeDeps compatible**: el adapter mergea `userOptimizeDeps.include` en
  las environments de servidor ("astro"/"ssr"/"prerender") en ambos modos
  (`dist/index.js` L207-257: `...Array.isArray(userOptimizeDeps?.include) ?
  userOptimizeDeps.include : []`), así que `include: ['astro/assets/services/noop']` sigue
  aplicando en workerd dev; `server.watch.ignored` es config pura de Vite dev (no afectada).
  No hay que tocar el bloque.
- ⚠️ **Estado actual del test del workaround**: `tests/astro-config-dev-workaround.test.mjs`
  está **en rojo hoy** (4 tests, 1 fail; verificado con `node --test`): exige
  `disabled: false` dentro de `optimizeDeps` pero `astro.config.mjs` actual solo tiene
  `include`. No lo causa el cambio de prerenderEnvironment (el test no referencia la opción),
  pero hay que reconciliarlo en el ciclo (decidir si se restaura `disabled: false` o se
  actualiza el test — el test fija el estado canónico decidido por el humano en la feature 27).

## Riesgos / limitaciones del cambio

1. **ECONNREFUSED por IPv4/IPv6 en el prerenderer 14.2.1** (Windows, riesgo más probable):
   si el build real falla con `connect ECONNREFUSED 127.0.0.1:<puerto>` en
   `prerenderer.js:64/getStaticPaths`, lanzar con `NODE_OPTIONS=--dns-result-order=ipv4first`
   (#15525). Verificar antes de declarar done.
2. **`node:fs` en repositorios**: bloquea el prerender workerd; migrar primero/junto
   (ya decidido por el humano; features 5/6/19).
3. **Vars/secrets durante prerender**: sin `.env`/`.dev.vars`/`vars` en wrangler, `env`
   estará vacío → mantener fallbacks defensivos de tokens (decisión humana ya tomada).
4. **Errores silenciosos en prerender** (#16200/#16809): el arnés debe seguir validando el
   HTML generado (REQ-11-05 ya lo hace).
5. **Test roto pre-existente** (`astro-config-dev-workaround.test.mjs`): reconciliar en el
   ciclo (no es consecuencia del cambio).
6. Build algo más lento y con un proceso workerd extra durante el prerender (normal).

## Recomendación concreta

1. **`astro.config.mjs`**: cambiar `prerenderEnvironment: 'node'` → `'workerd'` (explícito,
   documentando la intención; es el default del adapter). Mantener el resto del config.
2. Mantener el fallback `import { env } from 'cloudflare:workers'` en
   `htb-stadistics.astro` (necesario en runtime; con workerd ya no crashea el build).
3. Migrar `node:fs` de `src/domain/repositories/hero-profile-repository.ts` y
   `hero-cards-repository.ts` (requisito del prerender workerd; fuera del alcance de esta
   investigación el diseño de la vía, ya canalizado por el humano).
4. `wrangler.jsonc`: sin cambios (compat date 2026-08-11 + `nodejs_compat` dan el modo v2
   requerido; flags actuales correctos).
5. Verificación de cierre: `./init.sh` verde (incluido REQ-11-05 build real con prerender
   workerd); si ECONNREFUSED → `NODE_OPTIONS=--dns-result-order=ipv4first` y documentar.
6. Reconciliar `tests/astro-config-dev-workaround.test.mjs` (rojo hoy).
7. Al arrancar dev tras el cambio, comprobar que las páginas prerendered se sirven con
   `env` disponible (cloudflare:workers) — en workerd dev todo corre en workerd.

## Fuentes

Documentación oficial:
- https://docs.astro.build/en/guides/integrations-guide/cloudflare/ (`prerenderEnvironment`,
  "Development server now uses workerd", "Environment variables and bindings"). Esta URL
  documenta la versión v14.2.1 del adapter (la que tiene el repo).
- https://github.com/withastro/astro/pull/15711 (origen de `prerenderEnvironment`) y
  https://github.com/withastro/astro/releases/tag/%40astrojs%2Fcloudflare%4013.1.0
- https://github.com/withastro/astro/pull/15077 (prerenderer workerd: preview server + HTTP)
- Issues/PRs: #15684 (regresión v6: restricciones workerd), #16506 (cloudflare:workers y
  ESM node), #16553 (node + rutas dinámicas en dev), #17348 + PR #17349 (/_image + catch-all
  con node), #15525 (IPv4/IPv6 localhost prerenderer), #15946 (server islands + node),
  #16200 (logs tragados), #16809/#17047 (errores streaming), #16874 (workerd en build: no
  spawn en SSR). Todos: https://github.com/withastro/astro/issues/<n> y
  https://github.com/withastro/astro/pull/<n>.

Verificaciones locales (node_modules del repo, sin modificar):
- `node_modules/@astrojs/cloudflare/dist/index.js` (default workerd L75; prerenderWorker
  config L132-152; cf-imports external L190-200; configEnvironment L203-285; build:start
  L369-385; build:setup node-only L409-432).
- `node_modules/@astrojs/cloudflare/dist/prerenderer.js` (L106-130 preview server;
  L132-178 endpoints; L116 host localhost).
- `node_modules/@astrojs/cloudflare/dist/index.d.ts` (JSDoc L29-34).
- `node_modules/@astrojs/cloudflare/dist/vite-plugin-dev-server-prerender-middleware.js`;
  `dist/utils/prerender-constants.js`; `dist/utils/wrangler-config.js`.
- `node_modules/astro/dist/core/build/default-prerenderer.js` (crash setInternals);
  `node_modules/astro/dist/core/constants.js` y `dist/vite-plugin-astro-server/plugin.js`
  (gate devPrerenderMiddlewareSymbol).
- `node_modules/.pnpm/@cloudflare+vite-plugin@1.5_*/node_modules/@cloudflare/vite-plugin/package.json`
  (deps workerd/miniflare/wrangler) y `dist/index.mjs` (Miniflare local, telemetry off,
  prerenderWorker solo en build, getLocalDevVarsForPreview).
- `node_modules/.pnpm/workerd@1.20260804.1/node_modules/workerd/package.json`
  (optionalDependencies con `@cloudflare/workerd-windows-64`).
- Repo: `astro.config.mjs`, `wrangler.jsonc`, `src/domain/repositories/hero-profile-repository.ts`,
  `src/domain/repositories/hero-cards-repository.ts`, `tests/astro-config-dev-workaround.test.mjs`
  (rojo hoy, verificado con `node --test`).

Pendientes de investigación detectadas (fuera de alcance, no perseguidas): estado del fix
#15525 aguas arriba (si ya hay release del adapter con `127.0.0.1`); contenido de `.env`
(no leído por higiene de secretos) para saber qué vars llegará a `env` en prerender/dev.