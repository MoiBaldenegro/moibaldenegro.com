# nodejs_compat y prerender workerd — @astrojs/cloudflare 14.2.1

**Fecha:** 2026-08-13
**Investigador:** explorer (sesión de investigación)
**Objetivo:** definir qué hacer con `compatibility_flags` al pasar el prerender de
`node` a `workerd` y eliminar `node:fs` de `src/`.

---

## Resumen ejecutivo

1. **El prerender workerd es workerd de verdad** (binario `workerd` vía miniflare,
   arrancado por un preview server de Vite con `@cloudflare/vite-plugin`), no un
   entorno emulado. No necesita auth ni red: corre local durante `astro build`
   (y `astro dev`). Los tests `node:test` del repo no pasan por workerd.
2. **`nodejs_compat` NO se puede retirar aún**, aunque `src/` quede sin `node:*`.
   Motivo verificado empíricamente en esta máquina: la toolchain instalada
   (`@cloudflare/vite-plugin` 1.51.3 → miniflare 5.20260804.1-alpha) es
   *date-unaware*: con `compatibility_date: "2026-08-11"` pero sin el flag,
   workerd local **no arranca** si el bundle importa `node:` ("No such module
   `node:fs`"). Con el flag, arranca y `node:fs` funciona. Además, sin el flag el
   bundler sustituye `process.env` por `{}` y no inyecta los polyfills de
   unenv. La detección por fecha (flag redundante) llegó en miniflare
   5.20260811.0-alpha / wrangler 4.122.0 / vite-plugin 1.52.0 — aún no instalados.
3. **El flag redundante no rompe nada hoy**: probado en esta máquina que
   workerd 1.20260804.1 + miniflare 5.20260804.1-alpha arrancan igual con
   `compatibility_date` 2026-08-11 + `nodejs_compat` explícito (la validación
   "el flag ya es default" solo la introducen las toolchains nuevas, y ellas lo
   ignoran/descartan automáticamente). En el edge, la fecha ≥ 2026-08-04 ya
   activa `nodejs_compat` + `nodejs_compat_v2` por defecto; los flags se ignoran.
4. **`global_fetch_strictly_public` no afecta al fetch de HTB**: probado en
   workerd local (fetch a `https://labs.hackthebox.com/...` → 200 con el flag
   activo). El flag solo cambia el enrutado de URLs del propio zone (se van por
   la "front door" de Cloudflare en vez de al origin directo). El fetch de
   `labs.hackthebox.com` (host público, no propio) sale igual con o sin el flag.
5. **El adapter NO re-inyecta `nodejs_compat`** en el output: `dist/server/wrangler.json`
   copia los flags de `wrangler.jsonc` tal cual. Retirarlo del jsonc = retirarlo
   del output (y de la config del prerender worker, que los hereda del entry).
6. **El prerender workerd arregla el crash actual de `cloudflare:workers`**: el
   crash documentado en la sesión del repo ("Cannot read properties of
   undefined (reading 'setInternals')") ocurría porque `prerenderEnvironment:
   'node'` corre el prerender con el loader de Node.js, donde el módulo virtual
   `cloudflare:workers` no existe. Con workerd, `cloudflare:workers` resuelve
   nativamente (issues #15237/#16506, arreglado desde adapter 13.1.0).
7. **Riesgo conocido pendiente**: el fix del falso positivo `isNode` dentro de
   workerd con `nodejs_compat` (PR #16720, merged 2026-06-03) NO está en el
   `astro@7.2.0` instalado (verificado en `node_modules/astro/dist`). Riesgo
   teórico de respuestas `[object Object]` en rutas on-demand si el bundler
   separa el polyfill de `process` del runtime de Astro. Verificar la isla
   server:defer tras el cambio (`astro preview`).

---

## Hallazgos por pregunta

### 1. ¿El prerender workerd ejecuta workerd de verdad? ¿Qué necesita para arrancar?

**Sí, workerd real.** En `@astrojs/cloudflare@14.2.1` con
`prerenderEnvironment: 'workerd'` (default):

1. `astro:build:start` llama a `setPrerenderer(createCloudflarePrerenderer(...))`
   (`node_modules/@astrojs/cloudflare/dist/index.js` L370-385).
2. El prerenderer hace `preview()` de Vite con `build.outDir = dist/server` y
   plugins `[cfVitePlugin({ ...cfPluginConfig, viteEnvironment: { name:
   "prerender" } })]` (`dist/prerenderer.js` L106-122). El preview server
   levanta un **miniflare** que ejecuta el binario `workerd` con la config del
   prerender worker.
3. El prerender "renderiza" por HTTP: `POST /__astro_static_paths` y
   `POST /__astro_prerender` contra `http://localhost:<puerto>` (L132-178).
   Imágenes: `POST /__astro_static_images` (solo si hay compilación de imágenes
   en build o binding IMAGES).
4. El prerender worker se resuelve desde el MISMO `wrangler.jsonc` del proyecto:
   `resolveWorkerConfig` con el config customizer del adapter
   (`experimental.prerenderWorker.config` en `index.js` L132-152), que hace
   `{ ...entryWorkerConfig, name: "prerender" }` — **por eso el prerender worker
   hereda `compatibility_date` y `compatibility_flags` del `wrangler.jsonc`**
   (verificado también en `@cloudflare/vite-plugin/dist/index.mjs` L64755-64772
   y, en el output, el `wrangler.json` de dist/server que copia los flags).

**Requisitos de arranque local:** ninguno de auth/red. El binario
`workerd-windows-64@1.20260804.1` ya está instalado en `node_modules/.pnpm/`
y ya fue ejecutado sin problemas en feature 30 (`wrangler types` genera los
runtime types levantando workerd). La toolchain que usa el prerender es la
**empaquetada dentro de `@cloudflare/vite-plugin`** (su `package.json` declara
`wrangler 4.121.0`, `miniflare 5.20260804.1-alpha`, `workerd 1.20260804.1`,
`unenv 2.0.0-rc.24`, `@cloudflare/unenv-preset 2.16.1`), no la copia de
`node_modules/wrangler` del proyecto (que es también 4.121.0 por casualidad).

**Relación con los tests:** los tests del repo (`node --test`) corren en Node;
el prerender workerd solo se activa dentro de `astro build` (y `astro dev`).
No toca la suite.

### 2. `nodejs_compat`: ¿qué da, quién lo necesita, se puede retirar?

**Qué da en workerd:** registra los módulos `node:*` nativos y los globals
(`process`, `Buffer`) y activa `nodejs_compat_v2` (para fechas ≥ 2024-09-23).
Fuente oficial: https://developers.cloudflare.com/workers/runtime-apis/nodejs/ y
el capnp de workerd (`src/workerd/io/compatibility-date.capnp`: `nodeJsCompat`
y `nodeJsCompatV2` con `$compatEnableDate("2026-08-04")`).

**El adapter no auto-inyecta el flag:** grep en `dist/*.js` del adapter →
cero ocurrencias de `nodejs_compat`. El `dist/server/wrangler.json` generado es
`{...inputWorkerConfig}` (vite-plugin `outputConfigPlugin`), es decir, copia el
`wrangler.jsonc` (verificado en el `dist/server/wrangler.json` actual del repo:
`"compatibility_flags":["global_fetch_strictly_public","nodejs_compat"]`).
Retirar el flag del jsonc lo retira del output — no hay re-inyección.

**La fecha 2026-08-11 ya activa nodejs_compat por defecto (edge):**
según los docs oficiales, para `compatibility_date >= 2026-08-04` los flags
`nodejs_compat` y `nodejs_compat_v2` están activos por defecto y "Wrangler,
Miniflare, the Cloudflare Vite plugin, and Vitest Pool Workers ignore these
redundant flags when starting the runtime" — los proyectos existentes no deben
quitarlos al actualizar la fecha.
https://developers.cloudflare.com/workers/configuration/compatibility-flags/

**PERO la toolchain instalada es date-unaware y SÍ depende del flag explícito:**
`getNodeCompat` de miniflare 5.20260804.1-alpha (la que usa el vite-plugin
1.51.3) solo mira flags, no la fecha:
`getNodeCompat("2026-08-11", [])` → `{mode: null}` (probado en esta máquina).
El fix vendrá en miniflare 5.20260811.0-alpha / wrangler 4.122.0 /
vite-plugin 1.52.0 (PRs workers-sdk #15123 y #15148: "Detect Node.js
compatibility from the compatibility date", "Ignore a `nodejs_compat`
compatibility flag that the compatibility date already enables").

**Prueba empírica en esta máquina** (miniflare 5.20260804.1-alpha + workerd
1.20260804.1, en directorio temporal, ya limpiado):

| Caso | Resultado |
|---|---|
| flags `[]`, date 2026-08-11, worker básico | arranca OK |
| flags `["nodejs_compat"]`, date 2026-08-11 | arranca OK (sin error de flag redundante) |
| flags `["global_fetch_strictly_public","nodejs_compat"]`, date 2026-08-11 | arranca OK |
| flags `[]`, date 2026-08-11, `import { readFileSync } from "node:fs"` | **FAIL: workerd no arranca, "No such module `node:fs`"** |
| flags `["nodejs_compat"]`, date 2026-08-11, `import "node:fs"` | OK, `typeof readFileSync === "function"` |

**Qué partes del bundle podrían seguir necesitando nodejs_compat tras eliminar
`node:fs` de `src/`:** el bundle SSR actual (`dist/server/`) tiene **cero**
imports `node:` (grep completo), pero usa `process.env` en ~10 chunks (internals
de Astro) y `Buffer` 21 veces en `entrypoints_*.mjs`. `sharp` está external
(`vite.build.rolldownOptions.external = ["sharp"]`, adapter `astro:build:setup`)
y solo lo toca el pipeline Node-side (build/images), nunca workerd. No hay otel.
Conclusión: quitado `node:fs` de los repos hero, ningún camino del bundle
importa `node:` en runtime; el flag se necesita por la *toolchain* (registro de
módulos en workerd local, no sustituir `process.env` por `{}`, inyectar
polyfills unenv), no por el contenido.

**Efecto de retirarlo con la toolchain actual:** negativo y silencioso en el
bundling — `getProcessEnvReplacements` sustituye `process.env` por `{}` cuando
no hay nodejs_compat (vite-plugin `index.mjs` L66700-66714), y cualquier import
`node:` del bundle (hoy ninguno, mañana cualquiera) deja workerd sin arrancar.

### 3. `global_fetch_strictly_public` y el fetch de HTB

**Semántica oficial** (https://developers.cloudflare.com/workers/configuration/compatibility-flags/):
con el flag, `fetch()` "strictly route[s] requests as if they were made on the
public Internet": las requests a la **propia zona** del Worker hacen loopback a
la "front door" de Cloudflare (tratadas como request de Internet, pueden volver
al mismo Worker). Sin el flag, esas requests van directas al origin de la zona,
ignorando Workers y bypassing la seguridad de Cloudflare.

**Efecto sobre `htb-profile-repository.ts`** (`GET https://labs.hackthebox.com/api/v4/user/profile/basic/<id>`
con `Authorization: Bearer`, ejecutado en runtime por la isla `server:defer`):
**ninguno.** `labs.hackthebox.com` es un host público externo, no es la zona del
worker. Probado en workerd local (miniflare): fetch a la URL de HTB con el flag
activo → respuesta 200 del servidor (el fetch sale bien). También `example.com`
da 200 con y sin el flag. El flag solo cambia el enrutado de URLs del propio
dominio (`moibaldenegro.com`), que este código no fetchea.

**Nota sobre el prerender:** la isla `server:defer` NO se ejecuta durante el
prerender (el contenido diferido se resuelve en runtime con una petición
posterior del navegador al server). Por tanto no hay fetch a HTB en build, ni
ahora ni con workerd.

**ASSETS binding:** este repo no fetchea assets vía `env.ASSETS.fetch()`; los
assets los sirve la plataforma vía el binding (los assets del prerender los lee
el prerenderer Node-side con `node:fs` sobre `dist/client`, no desde workerd).
Si en el futuro se llamara `env.ASSETS.fetch()`, eso es un binding (service
binding), no se enruta por la semántica de este flag.

**Recomendación:** mantener el flag. Es inofensivo en producción (los docs
dicen que los proyectos existentes no necesitan quitarlo) y no cambia ningún
comportamiento observable de esta app.

### 4. Documentación oficial de @astrojs/cloudflare sobre prerender en workerd

- **`prerenderEnvironment`** (docs: https://docs.astro.build/en/guides/integrations-guide/cloudflare/):
  `'workerd' | 'node'`, default `'workerd'` desde 13.1.0. "By default, prerendered
  pages are built using Cloudflare's `workerd` runtime to match the production
  environment as closely as possible. Set this option to `'node'` when your
  prerendered pages depend on Node.js APIs or NPM packages that are not
  compatible with workerd (por ejemplo `node:fs`)". "On-demand rendered pages
  are unaffected by this option and always run in `workerd`." → El repo va en la
  dirección correcta: quitar `node:fs` de src/ y volver al default `workerd`.
  https://docs.astro.build/en/guides/deploy/cloudflare/ (deploy con wrangler).
- **Changelog del adapter:** 13.1.0 añade `prerenderEnvironment` (PR #15711;
  resuelve #15684 "Astro v6 Cloudflare prerendering environment is too
  restrictive": sharp/WASM/fs no disponibles en workerd → opt-out con 'node').
  14.0.0: Vite v8. 14.2.0: build-time image optimization opt-in con
  `cloudflare-binding` y fix de `/_image` en dev para `imageService: 'custom'`
  (el endpoint default de dev importaba `node:fs`, que no carga en workerd).
  El repo usa `imageService: 'cloudflare'` (runtime binding) — no afectado.
- **Arreglos de errores silenciosos del prerender (todos presentes en 14.2.1,
  verificado en el código instalado):** #15860 (los errores de `/__astro_static_paths`
  ahora leen el body y se muestran), #17047 + PR #17049/#17057 (páginas que
  lanzan durante el prerender: el body se buferiza en workerd, errores llegan
  como 500 con header `x-astro-prerender-error`, y `render()` del prerenderer
  lanza → build falla con exit≠0). En el repo, `prerenderer.js` L164-167 ya
  chequea `x-astro-prerender-error` y `getStaticPaths` lee `response.text()`.
- **`cloudflare:workers` en prerender:** issue #16506 (y #15237/#15411):
  `ERR_UNSUPPORTED_ESM_URL_SCHEME` con imports `cloudflare:` en hybrid mode —
  arreglado por el prerender workerd (13.1.0+): "cloudflare:workers imports
  resolve natively in the workerd runtime". Es exactamente el crash que tuvo
  este repo en node mode (diagnóstico de la sesión 28); con workerd deja de
  existir.

### 5. Problemas conocidos: Astro 7.2.0 + Windows + rolldown-vite; versión de wrangler del prerender

**Versión de wrangler del prerender:** la que trae empaquetada
`@cloudflare/vite-plugin` (hoy 1.51.3): `wrangler 4.121.0`, `miniflare
5.20260804.1-alpha`, `workerd 1.20260804.1`. La copia del proyecto
(`wrangler@4.121.0` para `wrangler types`/deploy) coincide hoy por casualidad,
pero actualizar la del proyecto NO cambia el prerender; solo lo cambia un
`@astrojs/cloudflare` nuevo (su dep `@cloudflare/vite-plugin` `^1.39.0` resolverá
a una 1.5x más nueva con `pnpm update`).

**Issues conocidos relevantes:**
- **#16396 (Turborepo mata el build con prerender workerd):** P2 con workaround
  ('node'), pero el propio triaje concluye "I tried Astro v7, and it looks like
  the issue has been resolved". Este repo no usa Turborepo → no aplica.
- **#17047/#16809/#15923 (errores silenciosos → HTML truncado/vacío):** clase de
  bugs arreglada en el adapter (14.2.1 incluida, ver §4).
- **PR #16720 (falso positivo `isNode` con nodejs_compat → `[object Object]` en
  rutas dinámicas):** merged 2026-06-03, PERO **no está en astro 7.2.0 instalado**
  (verificado: `astro/dist/runtime/server/render/util.js` L159 conserva
  `const isNode = typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";`
  y no hay ningún check de `navigator.userAgent === "Cloudflare-Workers"` en
  `runtime/server`). El bug es una carrera de orden de módulos entre el polyfill
  de `process` (@cloudflare/unenv-preset inyectado por el vite-plugin cuando hay
  nodejs_compat) y el runtime de Astro, solo con code-splitting. El bundle del
  repo es pequeño; riesgo teórico, **verificar la isla server:defer en runtime
  tras el cambio** (`astro preview` corre workerd).
- **Windows:** el binario `workerd-windows-64` funciona en esta máquina
  (probado: los tests empíricos de este informe corrieron workerd local en
  Windows sin issues; feature 30 ya lo había ejecutado vía `wrangler types`).
  El workaround humano de dev (`optimizeDeps.include: ['astro/assets/services/noop']`
  + `server.watch.ignored`) sigue siendo obligatorio (tests
  `astro-config-dev-workaround.test.mjs`) — no tocar; el prerender preview no
  usa optimizeDeps (arranca con `configFile: false` sobre output ya buildado).
- **rolldown-vite:** el adapter 14.x usa Vite 8 (rolldown) para los
  environments server; el `vite.environments.prerender` solo se toca en modo
  'node' con imágenes en build (index.js L411-417). No hay issues
  rolldown-específicos del prerender workerd conocidos en esta versión.

---

## Riesgos

1. **Quitar `nodejs_compat` hoy (con la toolchain actual)**: si cualquier import
   `node:` queda en el bundle (hoy cero; mañana cualquiera, p. ej. una dep
   futura), el prerender workerd **no arranca** (error verificado:
   "No such module node:fs"), y el bundler sustituye `process.env` por `{}` y
   omite los polyfills unenv. El edge no se afectaría (la fecha lo activa por
   defecto), pero el build local sí.
2. **Falso positivo `isNode` dentro de workerd (PR #16720, ausente en astro
   7.2.0)**: posibilidad de respuestas `[object Object]` en rutas on-demand
   (isla server:defer de HTB incluida) si el chunking separa el polyfill de
   `process` del runtime de Astro. Mitigación: probar la isla e index en
   `astro preview` (workerd real) tras el switch.
3. **Cambio de comportamiento en errores de prerender**: con workerd, un throw
   durante el prerender ahora FALLA el build (exit≠0, mensaje claro) en vez de
   emitir HTML truncado (fix #17049/#17057). Es el comportamiento deseado, pero
   hay que tenerlo presente si alguna página lanza intencionalmente.
4. **Flags redundantes en deploy**: wrangler 4.121.0 (deploy) no descarta
   `nodejs_compat` con fecha ≥ 2026-08-04 (el descarte llegó en 4.122.0). Los
   docs dicen que el runtime lo ignora (no hace falta quitarlos), pero conviene
   subir wrangler dentro del rango aprobado (`^4.121.0` permite 4.122+; requiere
   decisión humana como siempre) para quedar alineado con el comportamiento
   nuevo (detección por fecha).
5. **CI/sandboxes sin workerd**: el triaje del adapter reporta que en algunos
   sandboxes CI workerd no arranca (ECONNREFUSED). En esta máquina no aplica
   (probado OK), pero si el harness algún día corre el build en otro entorno,
   revisar que el binario workerd exista.

---

## Recomendación concreta

### (a) `wrangler.jsonc` — qué hacer con los flags

- **MANTENER `nodejs_compat` por ahora. NO retirarlo al eliminar `node:fs` de
  `src/`.** Con la toolchain instalada (miniflare 5.20260804.1-alpha,
  date-unaware) el flag es lo que mantiene arrancable el workerd local del
  prerender (empírico), lo que evita la sustitución de `process.env` por `{}` en
  el bundling, y lo que inyecta los polyfills unenv. Es redundante solo en el
  edge (fecha ≥ 2026-08-04), y esa redundancia no rompe nada localmente
  (probado: arranca OK).
- **Re-evaluar tras actualizar la toolchain** (`pnpm update` → el adapter
  resolverá `@cloudflare/vite-plugin` ≥1.52.0 con miniflare ≥5.20260811.0-alpha,
  que detectan nodejs_compat por fecha y descartan el flag redundante). A partir
  de ahí, retirar el flag del jsonc es seguro y opcional (los docs lo sugieren
  para configs nuevas; mantenerlo también es válido: "existing projects do not
  need to remove them"). Mientras tanto, NO perseguir la "limpieza cosmética".
- **MANTENER `global_fetch_strictly_public`**: sin efecto sobre el fetch a
  `labs.hackthebox.com` (verificado), documenta la intención de fetch-only-público
  y no interfiere con el prerender (los subrequests del prerender salen del
  lado Node, no de workerd).
- Subir `wrangler` a ≥4.122.0 (dentro de `^4.121.0` aprobado) cuando se pueda
  (decisión humana) para que deploy/types descarten el flag redundante y
  `wrangler types` sugiera @types/node por fecha, no por flag.

### (b) Qué esperar del prerender workerd en este repo

1. **Cambiar `astro.config.mjs` a `prerenderEnvironment: 'workerd'`** (o dejar
   el default) y **eliminar `node:fs`/`node:path`/`node:url` de
   `hero-profile-repository.ts` y `hero-cards-repository.ts`**. Es la dirección
   que ya fijó el humano y coincide con la doc oficial (los prerendered pages
   corren en workerd por defecto desde 13.1.0; 'node' era el opt-out temporal).
2. Con eso, el prerender workerd **arranca sin auth ni red** durante `astro
   build`: levanta un child process de workerd (~segundos), hace las requests
   HTTP internas y escribe `dist/client`. `cloudflare:workers` (si la isla lo
   usa en runtime) resuelve nativamente — se elimina la clase de crash de la
   sesión 28.
3. **La isla server:defer de HTB no toca el prerender** (no se ejecuta en
   build); su fetch en runtime es a host público y sigue funcionando con los
   flags actuales.
4. Los tests `node:test` siguen corriendo en Node (sin cambios); `./init.sh`
   debe seguir verde con el build usando workerd.
5. **Verificación post-cambio sugerida:** (i) `./init.sh` verde; (ii)
   `astro preview` y comprobar que la isla HTB devuelve contenido real (no
   `[object Object]`, riesgo PR #16720); (iii) inspeccionar
   `dist/server/wrangler.json` (quizá en `dist/server/.prerender/`) y confirmar
   que los flags siguen presentes; (iv) `astro dev` con la isla para confirmar
   el runtime en dev (que ahora también es workerd).

---

## Fuentes

**Código (fuentes primarias, leídas en disco):**
- `node_modules/@astrojs/cloudflare/dist/index.js` (14.2.1): opción
  `prerenderEnvironment`, `experimental.prerenderWorker.config`, hooks de build,
  define/banner de `process`.
- `node_modules/@astrojs/cloudflare/dist/prerenderer.js`: preview server +
  endpoints `/__astro_static_paths`, `/__astro_prerender`, `/__astro_static_images`,
  manejo de `x-astro-prerender-error`.
- `node_modules/@astrojs/cloudflare/dist/wrangler.js`: customizer del config.
- `node_modules/.pnpm/@cloudflare+vite-plugin@1.51.3/.../dist/index.mjs`:
  resolución del prerender worker (L64755+), `hasNodeJsCompat`/`getNodeCompat`
  (L64322), nodeJsCompatPlugin y warnings (L83103-83210), outputConfigPlugin →
  `dist/server/wrangler.json` (L83260+), `getProcessEnvReplacements` (L66700),
  miniflare en preview (L82787).
- `node_modules/.pnpm/miniflare@5.20260804.1-alpha/.../dist/src/index.js`:
  `getNodeCompat` (L100458) — date-unaware.
- `node_modules/.pnpm/workerd@1.20260804.1/...` + `@cloudflare/workerd-windows-64@1.20260804.1`:
  binario usado por el prerender.
- `node_modules/astro@7.2.0/dist/runtime/server/render/util.js` L159: `isNode`
  sin el fix del PR #16720.
- `dist/server/wrangler.json` del repo: flags copiados del jsonc, cero imports
  `node:` en el bundle, 21 usos de `Buffer`.

**Pruebas empíricas (esta máquina, 2026-08-13):** miniflare 5.20260804.1-alpha
+ workerd 1.20260804.1 en temp dir (limpiado): matriz flags/fecha con y sin
`node:fs`; fetch a example.com/HTB/127.0.0.1 con y sin
`global_fetch_strictly_public`.

**Docs oficiales:**
- https://developers.cloudflare.com/workers/configuration/compatibility-flags/
  (Node.js compatibility flag: default-on desde 2026-08-04; global fetch
  strictly public)
- https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- https://docs.astro.build/en/guides/integrations-guide/cloudflare/
  (`prerenderEnvironment`)
- https://docs.astro.build/en/guides/deploy/cloudflare/
- https://github.com/cloudflare/workerd/blob/main/src/workerd/io/compatibility-date.capnp
  (`compatEnableDate("2026-08-04")` para nodeJsCompat y nodeJsCompatV2)

**GitHub (issues/PRs):**
- withastro/astro: #15684, #16396, #17047, #16809, #15923, #16506, #15237,
  #15411, #15860; PRs #15711, #15077, #17049, #17057, #16720 (merged 2026-06-03,
  ausente en astro 7.2.0 instalado).
- cloudflare/workers-sdk: #15123 ("Detect Node.js compatibility from the
  compatibility date", miniflare 5.20260811.0-alpha / wrangler 4.122.0 /
  vite-plugin 1.52.0), #15148 (#15146: ignorar flag redundante), #15711.
- Releases: @astrojs/cloudflare 13.1.0, 14.0.0, 14.2.0.

**Nota:** no se encontró documentación oficial de Cloudflare/Astro que exija
`nodejs_compat` para el prerender workerd del adapter; el requisito real en esta
instalación es de toolchain (miniflare date-unaware), verificado empíricamente.