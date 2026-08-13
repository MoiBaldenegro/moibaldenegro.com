# Investigación: lectura de JSON sin `node:fs` — patrón canónico para los repositorios de dominio

Fecha: 2026-08-13 · Investigador: explorer del arnés · Alcance: la pregunta acotada (features 5/6/19).
Contexto repo: `hero-profile-repository.ts` y `hero-cards-repository.ts` usan `node:fs`/`node:path`/`node:url`
para leer `src/data/*.json`; decisión humana (ciclo 29): eliminar módulos node de `src/` para que el
prerender del adapter corra en workerd. Stack real verificado en repo: Node v22.22.2, Astro 7.2.0,
@astrojs/cloudflare 14.2.1, Vite 8.2.1 (rolldown 1.2.3), `"type": "module"`, engines `>=22.12.0`,
tsconfig `astro/tsconfigs/strict`.

Todos los resultados clave fueron **verificados empíricamente** con los binarios reales del repo
(Node v22.22.2 con type stripping, vite 8.2.1, astro 7.2.0) en un sandbox temporal fuera del repo
(`...\Temp\opencode\json-probe`, junction a `node_modules` del proyecto; el repo quedó intacto,
`git status` solo muestra artefactos previos del líder).

---

## Resumen ejecutivo

1. **Node 22.22.2 ejecuta `import data from './x.json' with { type: 'json' }` sin flags, estable**
   (JSON modules e import attributes "no longer experimental" desde v22.12.0 — el `engines` del repo,
   `>=22.12.0`, alinea exacto). `assert { type: 'json' }` ya **no existe** en Node 22 (eliminado en
   v22.0.0): solo `with`.
2. **Vite 8.2.1/rolldown consume el atributo sin config**: el static import con atributo se
   transforma a objeto JS inlineado (verificado en build SSR y en transform dev). Astro 7 no necesita
   config: JSON es soportado out-of-the-box y `astro/tsconfigs/base.json` ya trae
   `resolveJsonModule: true` (los tipos funcionan sin tocar tsconfig).
3. **`?raw` queda descartado para `src/`** por divergencia de runtime: en Node sin atributo →
   `ERR_IMPORT_ATTRIBUTE_MISSING` (crash exacto de la feature 19, reproducido); con atributo → Node
   devuelve el **objeto parseado** mientras Vite devuelve el **string crudo** (semántica distinta en
   la misma línea de código).
4. **Patrón canónico recomendado: constructor con loader inyectable `() => string` (contenido
   crudo), cuyo default es un import estático con atributo alojado en el propio `.ts` del dominio.**
   El repositorio conserva `JSON.parse` + validación de forma y sigue lanzando
   `HeroProfileDataError`/`HeroCardsDataError` (REQ-05-04/REQ-06-05 intactas). Los tests inyectan
   loaders (ausente = loader que lanza; malformado = string inválido; forma inválida = objeto con
   forma mala). Probe: **5/5 verde en `node --test`** y **build Astro 7.2.0 + prerender OK, sin
   `node:fs` en el bundle**.
5. **En workerd el prerender no ve ni `node:*` ni atributos**: el bundler los consume en build; el
   runtime solo ve el objeto inlineado. La migración es la pieza que destraba
   `prerenderEnvironment: 'workerd'` (default del adapter; hoy el repo fuerza `'node'` — ver
   `progress/research/prerender-workerd-adapter.md` del líder).

---

## 1. Matriz empírica (probes con los binarios del repo)

Cada celda = ejecución real (no inferencia). `node` = `node src/x.ts` directo (type stripping
nativo, igual que cuando `node --test` carga el `.ts` del repo); Vite dev = `createServer` +
`ssrLoadModule` (el pipeline que usa Astro en dev); Vite build = `vite build --ssr`; Astro =
`astro build` + prerender de página que usa el repositorio.

| Línea de import | `node` directo (node:test) | Vite dev SSR | Vite/Astro build | Notas |
|---|---|---|---|---|
| `import d from './x.json' with { type: 'json' }` | ✅ objeto parseado | ✅ objeto | ✅ objeto inlineado | **única forma que funciona idéntica en los 3 entornos** |
| `import d from './x.json'` | ❌ `ERR_IMPORT_ATTRIBUTE_MISSING` | ✅ | ✅ | crash de Node reproducido (sin atributo ni siquiera con query) |
| `import r from './x.json?raw'` | ❌ `ERR_IMPORT_ATTRIBUTE_MISSING` | ✅ string | ✅ string | crash exacto de feature 19 (reproducido idéntico) |
| `import r from './x.json?raw' with { type: 'json' }` | ⚠️ devuelve **objeto parseado** | ✅ string | ✅ string | **divergencia silenciosa**: Node ignora la semántica de `?raw` |

Patrón recomendado completo (repositorio probe, ~90 líneas, sin `node:*`, sin parameter
properties, con loader inyectable): `node --test` **5/5 pass**; `astro build` **OK** con
`/index.html` prerendered conteniendo los datos del JSON; `grep node:fs` en `dist/` → vacío.

---

## 2. Respuestas a las 5 preguntas

### 2.1 Node v22.22.2: ¿import de JSON con atributo estable sin flags? ¿`?raw` + atributo?

- **Sí, estable y sin flags.** La tabla de historial oficial de Node ESM:
  `v23.1.0, v22.12.0, v20.18.3, v18.20.5 → Import attributes are no longer experimental` y
  `JSON modules are no longer experimental`. `v22.0.0 → Drop support for import assertions`.
  El docs oficial exige el atributo: *"The `with { type: 'json' }` syntax is mandatory"* y el JSON
  solo expone el export `default`. Fuente: https://nodejs.org/api/esm.html (secciones "Import
  attributes" y "JSON modules"). Node v22.22.2 > v22.12.0 → sin flags, verificado.
- **`?raw` + atributo "funciona" pero con semántica equivocada**: Node resuelve el specifier con
  query como el mismo archivo (la query es parte de la URL del módulo — Node docs: *"Modules are
  loaded multiple times if the import specifier... has a different query or fragment"*) y el loader
  de JSON sirve el **objeto parseado**, no el string crudo (probado: `typeof` = `object`).
  Sin atributo, el mismo specifier crashea con `ERR_IMPORT_ATTRIBUTE_MISSING`. Conclusión:
  **`?raw` no puede aparecer en módulos de `src/`** que node:test carga directamente.

### 2.2 ¿Astro/Vite 7 (Vite 8 / rolldown) procesa `with { type: 'json' }` en .ts de src?

- **Sí.** El RFC oficial de Vite sobre import attributes declara: *"At the moment, only
  `with { type: 'json' }` is recognized by Vite"* (vitejs/vite#18534, comentario del equipo, ver
  también PR #17485 "feat(imports): support for import attributes in Vite").
- Verificado en la instalación real del repo: build SSR y transform dev con el atributo producen el
  objeto JSON inlineado (ver matriz). El static import pasa por el jsonPlugin de Vite; el atributo
  se consume en bundling y **no llega al runtime**.
- **Astro 7 no necesita config**: import de JSON es soporte nativo (guía de imports: *"Imported
  files return the full JSON object in the default import"*) y `astro/tsconfigs/base.json` ya
  incluye `resolveJsonModule: true` (leído de `node_modules/astro/tsconfigs/base.json`) → el
  type-check con atributo funciona sin tocar tsconfig (TypeScript soporta `with` desde 5.3,
  https://devblogs.microsoft.com/typescript/announcing-typescript-5-3/).

### 2.3 Patrón recomendado para el dominio (evaluación de opciones)

| Opción | node:test directo | Prerender workerd | Build | Test de malformado/ausente |
|---|---|---|---|---|
| **(a)** static import con atributo; repo consume el objeto | ✅ | ✅ | ✅ | ⚠️ parse en *import-time*: el JSON malformado rompe la carga del módulo (no pasa por el repo); "ausente" equivale a error de build. Los tests de error de datos pierden el caso "JSON inválido". |
| **(a2)** static import sin atributo | ❌ crash `ERR_IMPORT_ATTRIBUTE_MISSING` | ✅ (bundler) | ✅ | — |
| **(b)** `?raw` + `JSON.parse` en runtime | ❌ crash al cargar el `.ts` (`ERR_IMPORT_ATTRIBUTE_MISSING`); con atributo el contenido NO es el string crudo en Node | ✅ | ✅ | ✅ vía `JSON.parse` del repo, pero el test no puede importar el módulo sin crashear |
| **(c)** loader inyectable `() => string` con default = import estático con atributo (en el `.ts` de dominio) | ✅ **5/5 probe** | ✅ (el bundle no contiene `node:*` ni atributos) | ✅ objeto inlineado | ✅ los tres casos se inyectan: loader que lanza = ausente; string inválido = malformado; objeto con forma mala = forma inválida |

Respuesta a la sub-pregunta de (c): **el import estático con atributo vive en el `.ts` del
dominio**, no en la página `.astro`. Motivos: (i) consumidores actuales usan
`new HeroProfileRepository()` sin argumentos (`new-hero.astro`, `about.astro`) — el default debe
existir donde se define la clase; (ii) si el default viviera solo en `.astro`, cada consumidor
duplicaría el contrato y `node:test` no podría verificar el default; (iii) el `.ts` con atributo se
verificó cargable por Node y por Vite.

### 2.4 Contrato de test mínimo (reemplazo del inyectado de URLs temporales)

Los tests actuales crean archivos temporales y pasan una URL al constructor. Con el patrón (c) el
contrato es **inyectar el contenido crudo vía función**, sin tocar filesystem:

```ts
// datos reales (default): new HeroProfileRepository() -> carga el JSON real via import
// ausente:              new HeroProfileRepository(() => { throw new Error('ENOENT'); })
// malformado:           new HeroProfileRepository(() => '{ esto no es JSON')
// forma inválida:       new HeroProfileRepository(() => JSON.stringify({ name: 42 }))
```

- El repositorio conserva `JSON.parse` + validación de forma y envuelve ambos fallos en
  `HeroProfileDataError`/`HeroCardsDataError` → la semántica de REQ-05-04/REQ-06-05 ("ausente o
  malformado") se preserva 1:1.
- **Los tests SÍ pueden seguir usando `node:fs`** (p. ej. REQ-05-01/REQ-06-01 leen `src/data/*.json`
  para verificar campos) — la restricción del humano es sobre `src/`, no sobre `tests/`.
- Guard nuevo sugerido para el arnés: test que verifique que el repositorio no contiene
  `from 'node:` (reemplaza al REQ-19-05 de "no `?raw`").
- ⚠️ **Detalle crítico del runtime de Node**: el type stripping nativo (strip-only, sin flags) **no
  soporta parameter properties de TypeScript** (`constructor(private readonly x)`) →
  `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` (reproducido en el probe). El patrón actual del repo ya usa
  asignación explícita en el constructor — se debe mantener. Tampoco usar `enum`/`namespace`.

### 2.5 ¿`with` y no `assert`? ¿Versión exacta de estabilidad?

- Exactamente `with { type: 'json' }`. `assert` fue **eliminado en Node v22.0.0** (historial oficial
  de ESM) — en Node 22 `assert` no funciona.
- Estables (flag eliminado / "no longer experimental") desde **v22.12.0** (backports:
  v20.18.3, v18.20.5; también en v23.1.0). El repo exige `node >=22.12.0` → compatible por
  contrato y por instalación (v22.22.2).

---

## 3. Matriz patrón × restricción (resumen accionable)

| Patrón | (a) node:test directo | (b) prerender workerd | (c) build final | Riesgo principal |
|---|---|---|---|---|
| (c) loader inyectable + default estático con atributo | ✅ verificado | ✅ verificado (sin `node:*` en bundle, objeto inlineado; el prerenderer workerd ejecuta ese bundle — ver informe del líder) | ✅ verificado | ninguno conocido; rolldown solo deja sin soporte el **import dinámico** con atributos |
| (a) static con atributo puro | ✅ | ✅ | ✅ | pierde cobertura de "JSON malformado" en tests (requisito REQ-05-04/06-05 vigente) |
| (b) `?raw` | ❌ (crash Node) | — | — | descartado |

---

## 4. Recomendación concreta

**Patrón canónico** (firma del repositorio, aplicable a `hero-profile-repository.ts` y
`hero-cards-repository.ts` sin superar 100 líneas — el probe quedó en ~90):

```ts
import heroJson from '../data/hero.json' with { type: 'json' };

export type HeroJsonLoader = () => string;   // contrato: entrega el CONTENIDO CRUDO
const DEFAULT_RAW = JSON.stringify(heroJson); // única materialización del import

export class HeroProfileRepository {
  private readonly load: HeroJsonLoader;     // NO parameter property (strip-only de Node)

  constructor(load: HeroJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getProfile(): HeroProfile { return parseHeroProfile(this.readJson()); }

  private readJson(): unknown {
    let raw: string;
    try { raw = this.load(); } catch {
      throw new HeroProfileDataError('hero.json: no se pudo leer el perfil');
    }
    try { return JSON.parse(raw); } catch {
      throw new HeroProfileDataError('hero.json: el archivo no es un JSON válido');
    }
  }
}
```

- **Dónde vive el import**: en el `.ts` del dominio (default del loader), nunca en `.astro`, nunca
  con `?raw`.
- **Consumidores**: `new HeroProfileRepository()` sigue funcionando sin cambios
  (`new-hero.astro`, `about.astro`).
- **Contrato de tests**: sin URLs ni archivos temporales; inyección de loader (ver 2.4). Los tests
  de contenido real (REQ-05-01/06-01) se mantienen con `node:fs` — permitido en tests.
- **Config**: nulo en tsconfig (`resolveJsonModule` ya está en la base de Astro). `astro.config.mjs`:
  cambiar `prerenderEnvironment: 'node'` → `'workerd'` (default del adapter 14.2.1; la pieza
  `cloudflare:workers` de `htb-stadistics.astro` deja de crashear, requisito simultáneo — ver
  `progress/research/prerender-workerd-adapter.md`). `wrangler.jsonc`: sin cambios (si bien
  `nodejs_compat` v2 sigue activo por compat date, los repos ya no lo necesitarán).
- **Verificación de cierre**: `./init.sh` verde; si el prerenderer workerd falla con
  `ECONNREFUSED`, usar `NODE_OPTIONS=--dns-result-order=ipv4first` (issue #15525, sin fix en
  14.2.1 — riesgo documentado por el líder).

---

## 5. Pendientes detectados (fuera de alcance, no perseguidos)

- **Import dinámico con atributos en rolldown**: `import('./x.json', { with: { type: 'json' } })`
  no está soportado (rolldown/rolldown#2758, abierto, milestone 1.2). No usar en `src/`; el patrón
  recomendado usa solo static imports.
- Estado aguas arriba del fix #15525 (IPv4/IPv6 del prerenderer) — ya listado por el líder en
  `prerender-workerd-adapter.md`.
- Tras la migración, los tests REQ-19 (feature 19) que exigen `node:fs`/`readFileSync` quedarán
  desactualizados: el ciclo debe re-escribir REQ-19-01..06 (o la feature nueva que canalice la
  migración) al nuevo contrato de loader.

---

## 6. Referencias

Fuentes primarias (docs oficiales y código instalado):

- Node.js docs — ECMAScript modules: historial de import attributes (`v22.0.0` drop de `assert`;
  `v22.12.0` no longer experimental) y JSON modules ("only default export", "syntax mandatory"):
  https://nodejs.org/api/esm.html
- MDN — Import attributes (`with`): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
- TypeScript 5.3 release notes — import attributes (soporte de `with` en TS): https://devblogs.microsoft.com/typescript/announcing-typescript-5-3/
- Astro docs — Imports reference (JSON soportado, default = objeto): https://docs.astro.build/en/guides/imports/
- Astro docs — Cloudflare adapter (prerenderEnvironment); ver también https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Vite docs — Features (JSON, `?raw`/`?url`): https://vite.dev/guide/features
- vitejs/vite#18534 — RFC "Proper Import Attributes support" (Vite reconoce `with { type: 'json' }`;
  atributos como azúcar sobre queries): https://github.com/vitejs/vite/discussions/18534
- vitejs/vite#17485 — "feat(imports): support for import attributes in Vite": https://github.com/vitejs/vite/pull/17485
- rolldown/rolldown#2758 — import attributes en rolldown (abierto; dynamic import sin soporte):
  https://github.com/rolldown/rolldown/issues/2758
- @astrojs/cloudflare 14.2.1 (instalado): `dist/index.d.ts` (`prerenderEnvironment?: 'workerd' |
  'node'`) y `dist/index.js` (default `'workerd'`, L75; prerenderer workerd L369-385).
- astro 7.2.0 (instalado): `tsconfigs/base.json` (`resolveJsonModule: true`).
- Repo: `progress/impl_19_json-repositories-restore.md` (crash `ERR_IMPORT_ATTRIBUTE_MISSING` con
  `?raw`, reproducido en el probe), `progress/research/prerender-workerd-adapter.md` (informe del
  líder sobre prerender en workerd), `src/domain/repositories/*.ts`, `tests/*.test.mjs`.

Verificaciones locales del probe (sandbox `...\Temp\opencode\json-probe`, binarios del repo):
`node` v22.22.2 directo sobre `.ts`; `createServer(...).ssrLoadModule` con vite 8.2.1;
`vite build --ssr`; `astro build` con página + repositorio del patrón (c); `node --test` 5/5.