# Informe de implementación — feature 31 `json-repositories-loader`

Fecha: 2026-08-13 · Implementador: agente implementador del arnés.
Status: `in_progress` en `feature_list.json` (el cierre lo orquesta el líder
tras el reviewer; ver reglas 9-10 del protocolo).

## Resumen

Migración de `HeroProfileRepository` y `HeroCardsRepository` al patrón canónico
de loader inyectable `() => string` (informe `progress/research/lectura-json-sin-nodefs.md`,
probe 5/5) y reconciliación de `tests/astro-config-dev-workaround.test.mjs` al
estado canónico del humano (commit c2bbfa1). Resultado: `node:*` desaparece de
`src/` (prerrequisito del switch a `prerenderEnvironment: 'workerd'`, feature 32)
y `./init.sh` vuelve a **verde completo** (antes: 1 fallo preexistente en el
test del workaround por el `disabled: false` retirado por el humano).

## Alcance (solo feature 31)

- `src/domain/repositories/hero-profile-repository.ts` y
  `src/domain/repositories/hero-cards-repository.ts` → patrón loader.
- `tests/hero-profile-repository.test.mjs` y
  `tests/hero-cards-repository.test.mjs` → contrato de loader (REQ-31-01/02/06).
- `tests/astro-config-dev-workaround.test.mjs` → REQ-31-07 (sin `disabled`).
- NO tocados: `htb-stadistics.astro`, `astro.config.mjs` (feature 32),
  `wrangler.jsonc`, `tests/htb-stadistics-prerender-fix.test.mjs`.
  Consumidores sin argumentos (`new HeroProfileRepository()` /
  `new HeroCardsRepository()` en `about.astro` y `new-hero.astro`) intactos.

## Ciclo rojo/verde (TDD)

### ROJO — tests escritos primero contra la spec (antes de tocar `src/`)

`node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs tests/astro-config-dev-workaround.test.mjs`

```
# tests 24
# pass 20
# fail 4
```

Fallos observados en rojo (los 4 que prueban la migración):

```
not ok 8  - REQ-31-02: el repositorio lee a través del loader inyectable, no del filesystem
not ok 14 - REQ-31-03: el repositorio no importa módulos node ni usa el sufijo ?raw
not ok 19 - REQ-31-01: el repositorio lee a través del loader inyectable, no del filesystem
not ok 23 - REQ-31-03: el repositorio no importa módulos node ni usa el sufijo ?raw
```

Nota de evidencia: con el código viejo (contrato URL + `readFileSync`), los
tests de modo de error (ausente/malformado/forma inválida) pasaban "por
accidente" — `readFileSync` sobre una función lanza y el try/catch lo envuelve
en el error nombrado. Los tests que prueban la migración de verdad son los de
**loader inyectable** (el repositorio debe leer vía el loader, no del
filesystem) y los **guards REQ-31-03** (sin `node:` ni sufijo de raw), que
fallan en rojo y pasan en verde.

### VERDE — tras implementar el patrón loader

```
# tests 24
# pass 24
# fail 0
```

## Patrón aplicado en cada repositorio

Firma canónica (idéntica semántica de errores, REQ-05-04/REQ-06-05 preservada
1:1; sin parameter properties — restricción strip-only de Node — y sin import
dinámico con atributos — rolldown sin soporte):

```ts
import heroJson from '../../data/hero.json' with { type: 'json' };   // import con atributo
import type { HeroProfile } from '../entities/hero-profile.ts';

export type HeroProfileJsonLoader = () => string;                    // contrato: contenido CRUDO
const DEFAULT_RAW = JSON.stringify(heroJson);                        // única materialización

export class HeroProfileRepository {
  private readonly load: HeroProfileJsonLoader;                      // NO parameter property

  constructor(load: HeroProfileJsonLoader = () => DEFAULT_RAW) {
    this.load = load;
  }

  getProfile(): HeroProfile {
    return parseHeroProfile(this.readJson());
  }

  private readJson(): unknown {
    let raw: string;
    try { raw = this.load(); } catch {
      throw new HeroProfileDataError('hero.json: no se pudo leer el perfil');      // ausente
    }
    try { return JSON.parse(raw); } catch {
      throw new HeroProfileDataError('hero.json: el archivo no es un JSON válido'); // malformado
    }
  }
}
// parseHeroProfile/asRecord/expectString/expectBoolean: validación de forma sin cambios
// (forma inválida → HeroProfileDataError)
```

- `hero-cards-repository.ts`: mismo patrón con `HeroCardsJsonLoader`,
  `DEFAULT_RAW = JSON.stringify(heroCardsJson)` y validación de las 12
  tarjetas sin cambios (REQ-06-03).
- Dónde vive el import: en el `.ts` del dominio (default del loader), nunca en
  `.astro`, nunca con sufijo de raw — conforme al informe de investigación
  (sección 2.3).
- Rutas: `../../data/*.json` desde `src/domain/repositories/` (corregido en la
  primera corrida: `../data/` no resuelve — `src/domain/data/` no existe).
- Límite REQ-31-08: `hero-profile-repository.ts` = 84 líneas,
  `hero-cards-repository.ts` = 94 líneas (≤100).

## Contrato de tests (REQ-31-01..08)

- Inyección de loader, sin URLs ni archivos temporales (se eliminaron
  `mkdtempSync`/`pathToFileURL` de los tests):
  - loader que lanza `Error('ENOENT…')` = archivo ausente
  - `() => '{ esto no es JSON'` = malformado
  - `() => JSON.stringify({ name: 42, username: null })` = forma inválida
  - `() => JSON.stringify({ name: 'X', … })` válido pero inexistente en disco =
    prueba de que se lee por el loader, no por filesystem
- Los asserts de datos reales (REQ-05-01/02, REQ-06-01/02/04) se conservan con
  `node:fs` — permitido en tests (la restricción del humano es sobre `src/`).
- Guard REQ-31-03 en cada test de repositorio: `doesNotMatch /from['"]node:/` y
  `doesNotMatch /\?raw/` sobre el archivo del repositorio (reemplaza REQ-19-05).
  Nota: los comentarios de cabecera de los repos no pueden contener la cadena
  literal del sufijo prohibido (el guard la detecta; reformulado).

## Reconciliación REQ-31-07 (test del workaround)

`tests/astro-config-dev-workaround.test.mjs`: el test 1 pasa de exigir
`disabled: false` a fijar el estado canónico humano c2bbfa1 — el bloque
`optimizeDeps` conserva `include: ['astro/assets/services/noop']` y **NO** debe
contener `disabled` (Vite 8/rolldown retiró `optimizeDeps.disabled`; la línea
NO se restaura en `astro.config.mjs`). Los otros 3 tests del archivo
(`server.watch.ignored`, entradas retiradas que no vuelven, esquema env
REQ-22-07/08) quedan intactos y pasan.

## Verificación final

`./init.sh`:

```
--- Formato ---
✔ formato de feature_list.json y progress/current.md
--- Tests ---
✔ tests al 100% (node:test)
--- Build ---
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Nota de estado: `./init.sh` estaba EN ROJO antes de esta feature (1 fallo
preexistente, `disabled: false` exigido por el test del workaround); tras la
feature 31 la suite queda **verde completa** (tests al 100 % + build OK), tal
como exige la spec del ciclo (el primer implementable devuelve el arnés a
verde). Verificación adicional: grep de `from 'node:` / `?raw` sobre `src/` →
0 resultados. El prerender sigue en `'node'` (feature 32 hará el switch a
`'workerd'` y restaurará el fallback `cloudflare:workers`).

## Archivos tocados

- M `src/domain/repositories/hero-profile-repository.ts` (patrón loader, 84 líneas)
- M `src/domain/repositories/hero-cards-repository.ts` (patrón loader, 94 líneas)
- M `tests/hero-profile-repository.test.mjs` (contrato loader + guard REQ-31-03)
- M `tests/hero-cards-repository.test.mjs` (contrato loader + guard REQ-31-03)
- M `tests/astro-config-dev-workaround.test.mjs` (REQ-31-07)
- M `feature_list.json` (feature 31 → `in_progress`)
- M `progress/current.md` (anotación de la sesión)

Sin commits (los orquesta el líder). Feature 31 lista para revisión externa.