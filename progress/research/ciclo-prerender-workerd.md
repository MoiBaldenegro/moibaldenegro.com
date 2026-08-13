# Ciclo 29: prerender workerd + repositorios sin node:fs + fallback cloudflare:workers — análisis y descomposición

Fecha: 2026-08-13 · Autor: spec_author · Estado: verificado en disco antes de escribir nada.

## 1. Qué es el problema (reafirmación)

El humano corrige la dirección del ciclo 28: el fallback `import { env } from
'cloudflare:workers'` en `htb-stadistics.astro` ES NECESARIO con el adapter de
Cloudflare (astro:env/server no entrega las envs del worker en runtime). Lo que
se debe quitar NO es el fallback sino **el uso de módulos node**: el prerender
debe pasar a `prerenderEnvironment: 'workerd'` (el default del adapter) y
`node:fs`/`node:path`/`node:url` deben desaparecer de src/ (repositorios
hero-profile y hero-cards). Además, `tests/astro-config-dev-workaround.test.mjs`
está EN ROJO hoy porque el humano quitó `disabled: false` del
`astro.config.mjs` en su commit c2bbfa1 (edición deliberada, Vite 8 ya no
soporta esa opción): el test debe actualizarse al nuevo estado canónico.

## 2. Verificación de los hechos del líder (todo confirmado en disco)

| Hecho | Verificado |
|---|---|
| `htb-stadistics.astro` está en estado canónico 22+27 (sin fallback) | ✅ 41 líneas: import astro:env/server, getProfileOrNull(), {profile && ...}, sin cloudflare:workers |
| `hero-profile-repository.ts` usa node:fs/node:path/node:url | ✅ 84 líneas, contrato URL inyectable (DEFAULT_DATA_URL con pathToFileURL) |
| `hero-cards-repository.ts` usa node:fs/node:path/node:url | ✅ 94 líneas, mismo contrato |
| `astro.config.mjs` tiene `prerenderEnvironment: 'node'` y NO tiene `disabled` | ✅ L28 'node'; optimizeDeps.include sin disabled; server.watch.ignored presente |
| `tests/astro-config-dev-workaround.test.mjs` en rojo SOLO por `disabled: false` | ✅ node --test: 3 pass / 1 fail, falla el test 1 (optimizeDeps.include ... con disabled false) |
| `tests/htb-stadistics-prerender-fix.test.mjs` fija la AUSENCIA de cloudflare:workers | ✅ doesNotMatch /cloudflare:workers/, /env\.HTB_*/, /ENV_TOKEN\|ENV_ID/, /\|\|/ |
| `tests/hero-profile/hero-cards-repository.test.mjs` inyectan URLs temporales | ✅ repositoryFor() con mkdtempSync + pathToFileURL (contrato de la feature 19) |
| Informes de investigación (3) coherentes entre sí y con el estado del repo | ✅ prerender-workerd-adapter.md, lectura-json-sin-nodefs.md, nodejs-compat-prerender-workerd.md |

Contexto git: `git status` limpio salvo los 3 informes de research y
current.md (sin commitear); el estado canónico está en los commits del humano
(93ca0f6 + c2bbfa1). No hay ediciones manuales sueltas ajenas al arnés.

## 3. Hechos técnicos que gobiernan la descomposición (fuente: los 3 informes)

1. **prerender 'workerd' es el default del adapter 14.2.1** y corre el prerender
   en workerd real (miniflare + binario local, offline, sin auth; ya probado en
   esta máquina Windows en la feature 30). `cloudflare:workers` se importa
   nativamente en workerd → el crash 'setInternals' es exclusivo del camino
   'node'. Riesgo: bug IPv4/IPv6 del prerenderer (#15525, sin fix en 14.2.1) →
   posible ECONNREFUSED en build → mitigación `NODE_OPTIONS=--dns-result-order=ipv4first`.
2. **node:fs NO funciona en workerd** (issue #15684) → la migración de los dos
   repositorios es requisito simultáneo del switch a workerd.
3. **Patrón canónico verificado (probe 5/5 + build OK)** para los repositorios
   JSON: constructor con loader inyectable `() => string` (contenido crudo),
   default = `import heroJson from '../data/hero.json' with { type: 'json' }` +
   `JSON.stringify(heroJson)`; el repositorio conserva JSON.parse + validación y
   lanza HeroProfileDataError/HeroCardsDataError. `with { type: 'json' }` es
   estable en Node ≥22.12.0 (engines del repo). `?raw` PROHIBIDO en src/
   (ERR_IMPORT_ATTRIBUTE_MISSING). NO parameter properties (strip-only de Node).
   NO import dinámico con atributos (rolldown sin soporte).
4. **wrangler.jsonc sin cambios**: MANTENER `nodejs_compat` (toolchain
   miniflare 5.20260804.1-alpha date-unaware: sin el flag workerd local no
   arranca con imports node y process.env se sustituye por {}) y MANTENER
   `global_fetch_strictly_public` (verificado: sin efecto sobre fetch HTB).
   El adapter copia los flags del jsonc verbatim al dist/server/wrangler.json.
5. **`astro.config.mjs` solo cambia** `prerenderEnvironment: 'node'` →
   `'workerd'`; el resto (optimizeDeps.include, server.watch.ignored, esquema
   env) NO se toca.
6. **Tests a adaptar** (cada uno en su feature, con justificación en la spec):
   - `tests/htb-stadistics-prerender-fix.test.mjs`: fija AUSENCIA de
     cloudflare:workers → debe fijar PRESENCIA (la feature 28 permanece done
     como historial; precedente feature 25).
   - `tests/hero-profile-repository.test.mjs` y
     `tests/hero-cards-repository.test.mjs`: contrato de inyección de loader,
     sin URLs temporales; conservar REQ-05-04/REQ-06-05 (ausente/malformado/
     forma inválida → error nombrado). Los tests SÍ pueden usar node:fs (la
     restricción del humano es sobre src/, no sobre tests/).
   - `tests/astro-config-dev-workaround.test.mjs`: actualizar al estado
     canónico humano c2bbfa1 (optimizeDeps.include sin disabled).

## 4. Descomposición: DOS features (ids 31 y 32)

Criterio aplicado: complejidad media (config + 2 repos + componente + 4 tests),
dos hitos verificables independientes, y requisito explícito del líder de que
la PRIMERA feature devuelva `./init.sh` a VERDE (hoy rojo por el test del
workaround).

### Feature 31 — `json-repositories-loader` (sin depends_on)

Devuelve el arnés a verde y elimina node:* de src/:

1. Reescribe `tests/astro-config-dev-workaround.test.mjs` al estado canónico
   humano (c2bbfa1): el bloque optimizeDeps conserva `include` y NO exige
   `disabled`. Justificación: la edición del humano es deliberada (Vite
   8/rolldown retiró `optimizeDeps.disabled`); el test fijado por él en la
   feature 27 quedó obsoleto y se actualiza — NO se restaura la línea en el
   config.
2. Migra `hero-profile-repository.ts` y `hero-cards-repository.ts` al patrón
   canónico del informe lectura-json-sin-nodefs.md (loader inyectable + import
   con atributo `with { type: 'json' }` + JSON.stringify en el default), sin
   `node:*` ni `?raw`, sin parameter properties, ≤100 líneas.
3. Reescribe `tests/hero-profile-repository.test.mjs` y
   `tests/hero-cards-repository.test.mjs` al contrato de loader: inyección de
   `() => string` (loader que lanza = ausente; string inválido = malformado;
   objeto con forma mala = forma inválida); conserva los asserts de datos reales
   (REQ-05-01/REQ-06-01 siguen leyendo src/data/*.json con node:fs, permitido
   en tests); añade el guard "los repositorios no importan módulos node ni ?raw"
   (reemplaza REQ-19-05). La feature 19 permanece done como historial (su
   contrato node:fs queda superado por decisión humana).

Cierre: suite 100% + build OK (el prerender sigue en 'node' y el patrón loader
funciona en Node — probado en el informe) → `./init.sh` verde. El componente
htb-stadistics.astro NO se toca aquí.

### Feature 32 — `prerender-workerd` (depends_on [31])

Ejecuta la dirección del humano sobre el prerender:

1. `astro.config.mjs`: `prerenderEnvironment: 'node'` → `'workerd'` (explícito,
   default del adapter); NADA más cambia.
2. Restaura en `htb-stadistics.astro` las 4 líneas del humano:
   `import { env } from 'cloudflare:workers'` + `const HTB_API_TOKEN =
   ENV_TOKEN || env.HTB_API_TOKEN;` y `const HTB_USER_ID = ENV_ID ||
   env.HTB_USER_ID;` (con alias ENV_TOKEN/ENV_ID en el import de
   astro:env/server). Nota (informe prerender-workerd-adapter.md): `env` en
   prerender tendrá lo que defina el .env local; sin vars → undefined →
   getProfileOrNull degrada a null → la sección no se renderiza (REQ-27-07/08
   intactos).
3. Reescribe `tests/htb-stadistics-prerender-fix.test.mjs` al nuevo estado
   canónico (PRESENCIA de cloudflare:workers y de los fallbacks; red-first): la
   feature 28 permanece done como historial (precedente feature 25); además
   fija que wrangler.jsonc conserva los flags (nodejs_compat +
   global_fetch_strictly_public) y que el componente conserva
   getProfileOrNull() + {profile && ...} sin lógica.
4. Contingencia documentada en la spec (REQ-32-06): si el build real
   (REQ-11-05, tests/about-page.test.mjs) falla con ECONNREFUSED del
   prerenderer (#15525), mitigar con `NODE_OPTIONS=--dns-result-order=ipv4first`
   y dejar constancia en progress/impl_32_*.md.
5. Verificación post-cambio (riesgo PR #16720 ausente en astro 7.2.0): la isla
   server:defer en `astro preview` debe devolver contenido real, no
   `[object Object]`.

`depends_on: [31]`: el fallback cloudflare:workers NO puede coexistir con el
prerender 'node' (crash setInternals) y workerd NO puede arrancar con node:fs —
la 31 destraba la 32 y la 32 solo es implementable sobre la 31.

### Por qué no una sola feature ni tres

- **Una sola (31 total)**: mezclaría dos hitos verificables (arnés verde sin
  node:* / build en workerd) y concentraría el riesgo del build workerd junto a
  la migración de datos; incumpliría la observación del líder de que el primer
  implementable debe dejar init.sh a verde.
- **Tres (reconciliar test / repos / prerender aparte)**: la reconciliación del
  test del workaround es una edición de una aserción, prerrequisito del arnés
  y no un entregable independiente; la meto en la 31 con REQ propio y
  justificación. Separar "repos" de "prerender" SÍ tiene sentido (ya hecho).

## 5. Riesgos y trabas

1. **ECONNREFUSED IPv4/IPv6 en build** (prerenderer 14.2.1, #15525, sin fix) —
   mitigación documentada en la spec 32 (REQ-32-06).
2. **Falso positivo isNode de Astro 7.2.0 con nodejs_compat** (PR #16720
   ausente) — verificar isla server:defer en `astro preview` tras la feature 32
   (no es acceptance automatizable; queda en la spec como paso de cierre y en
   este informe).
3. **Test 28 obsoleto** (fija ausencia) — se reescribe en la 32; la feature 28
   permanece done (precedente feature 25); su spec REQ-28-02/04 queda superada
   por decisión humana.
4. **Contrato de tests 5/6 (URLs temporales)** — se reescribe a loader en la
   31; semántica REQ-05-04/REQ-06-05 preservada 1:1 (los tres modos de fallo se
   inyectan como loader).
5. **nodejs_compat date-unaware** — por eso wrangler.jsonc NO se toca (REQ-32-07
   lo fija).
6. `docs/dependencies.md` ya ampara todo lo necesario (astro, adapter,
   wrangler, workers-types): ninguna feature requiere dependencia nueva ni
   estado blocked.

## 6. Orden de implementación

1. **31 json-repositories-loader** (pending, sin deps) → arnés vuelve a verde.
2. **32 prerender-workerd** (pending, depends_on [31]) → build en workerd con
   fallback restaurado.

## 7. Features dadas de alta

- **31 json-repositories-loader** — "Migrar repositorios JSON al patrón loader
  inyectable sin node:fs y reconciliar el test del workaround de dev".
  Spec: `specs/31_json-repositories-loader/requirements.md` (sin design.md: no
  toca UI/presentación).
- **32 prerender-workerd** — "Prerender en workerd con el fallback
  cloudflare:workers restaurado en htb-stadistics". Spec:
  `specs/32_prerender-workerd/requirements.md` (sin design.md: solo frontmatter
  y config; la presentación no cambia).