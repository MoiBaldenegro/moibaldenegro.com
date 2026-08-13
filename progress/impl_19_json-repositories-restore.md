# Informe de implementación — feature 19 `json-repositories-restore`

- **Fecha:** 2026-08-12 · implementer
- **Estado:** implementada; pendiente de revisión del líder/reviewer.
- **Contrato:** `specs/19_json-repositories-restore/requirements.md` (REQ-19-01..06) sobre los tests `tests/hero-profile-repository.test.mjs` (REQ-05-01..05) y `tests/hero-cards-repository.test.mjs` (REQ-06-01..06).
- **Contexto:** `progress/research/refactor-post-manual.md` D2 + specs 05/06 originales.

## Problema

Los repositorios del dominio JSON fueron reescritos manualmente para usar
imports `?raw` sin atributo (`import rawJsonData from '../../data/hero.json?raw'`):
- Node 22 lanza `ERR_IMPORT_ATTRIBUTE_MISSING` cuando `node:test` importa el módulo.
- El constructor pasó a esperar un **string incrustado** como default, mientras los
  tests inyectan **URLs de archivos temporales** (`new HeroProfileRepository(fileUrl)`,
  `new HeroCardsRepository(fileUrl)`) y esperan `new HeroProfileRepository()` para leer
  el JSON real (REQ-05-03/04, REQ-06-03/05).

**Decisión del spec_author (respetada):** restaurar la lectura vía `node:fs` con
constructor que acepta una URL inyectable cuyo default resuelve al archivo real
(`pathToFileURL(join(process.cwd(), 'src', 'data', ...))` — patrón original del commit
`ae2597b`). Es el único enfoque que satisface la firma del contrato de tests y la
arquitectura ("Entregan entidades leyendo desde archivos JSON").

## Ciclo rojo/verde

### ROJO (antes)

`node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs`
→ **0 pass / 2 fail**:

```
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module ".../src/data/hero-cards.json?raw"
needs an import attribute of "type: json"
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module ".../src/data/hero.json?raw"
needs an import attribute of "type: json"
# fail 2
```

### VERDE (después)

`node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs`
→ **16/16 pass**:

```
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# duration_ms ~120
```

Cubre: REQ-06-01 (12 tarjetas), REQ-06-02 (entidad readonly), REQ-06-03
(entrega leyendo el JSON), REQ-06-04 (colorToken sin hex), REQ-06-05 ×4
(ausente/malformado/forma inválida/tarjeta inválida → HeroCardsDataError),
REQ-06-06 (≤100 líneas), REQ-05-01 (perfil 5 campos), REQ-05-02 (entidad
readonly), REQ-05-03 (entrega leyendo el JSON), REQ-05-04 ×3
(ausente/malformado/forma inválida → HeroProfileDataError), REQ-05-05 (≤100 líneas).

## Cobertura REQ-19

| REQ | Cómo se cumple | Verificación |
|-----|----------------|--------------|
| REQ-19-01 | `HeroProfileRepository` lee `src/data/hero.json` con `node:fs`; constructor acepta URL inyectable cuyo default es `pathToFileURL(join(process.cwd(), 'src', 'data', 'hero.json'))` | test REQ-05-03 (`new HeroProfileRepository()` entrega el perfil real) + REQ-05-01 |
| REQ-19-02 | Si el archivo no existe o está malformado → `HeroProfileDataError` | tests REQ-05-04 ×3 |
| REQ-19-03 | `HeroCardsRepository` lee `src/data/hero-cards.json` con `node:fs`; constructor acepta URL inyectable cuyo default resuelve al archivo | tests REQ-06-01/03 (`new HeroCardsRepository()` entrega las 12) |
| REQ-19-04 | Si el archivo no existe o está malformado → `HeroCardsDataError` | tests REQ-06-05 ×4 |
| REQ-19-05 | Lectura con `node:fs` (`readFileSync`); imports `?raw` eliminados | grep `?raw` en `src/` → 0 ocurrencias |
| REQ-19-06 | ≤100 líneas por repositorio | `wc -l`: hero-profile 83, hero-cards 93 |

## Archivos tocados

- `src/domain/repositories/hero-profile-repository.ts` — restaurado desde `ae2597b`
  (83 líneas): `node:fs` + `node:path` + `node:url`, URL inyectable, `HeroProfileDataError`.
- `src/domain/repositories/hero-cards-repository.ts` — restaurado desde `ae2597b`
  (93 líneas): mismo patrón con `hero-cards.json`, `HeroCardsDataError`.
- `feature_list.json` — status feature 19 `pending → in_progress`.
- `progress/current.md` — sesión documentada.

Sin dependencias externas nuevas (solo stdlib de Node). Consumidores
(`src/components/new-hero/new-hero.astro`, `src/pages/about.astro`) usan
`new HeroProfileRepository()` / `new HeroCardsRepository()` sin argumentos → la firma
restaurada los satisface sin cambios de UI.

## Verificación final

| Comando | Resultado |
|---------|-----------|
| `node --test tests/hero-profile-repository.test.mjs tests/hero-cards-repository.test.mjs` | **16/16 pass** (feature 19 verde) |
| `pnpm test` (suite completa) | **137 pass / 7 fail** — residuales SOLO de features 20/21/23 |
| `node scripts/check-format.mjs` | ✔ (vía `./init.sh`, formato OK) |
| `./init.sh` | 2 comprobaciones rojas: tests (7 residuales f.20/21/23) y build (pieza fuera de alcance, ver abajo) |

### Residuales de la suite (NO pertenecen a la 19)

- **Feature 20 `latest-articles-restore`:** REQ-10-01 ×2 y REQ-17-01, REQ-17-06,
  REQ-17-07 (`latest-articles.astro` reescrito manualmente consume `post.data.*`).
- **Feature 21 `ssr-cloudflare-align`:** REQ-11-05 (busca `dist/about/index.html`,
  ahora `dist/client/about/index.html` con el adapter Cloudflare).
- **Feature 23 `harness-docs-alignment`:** REQ-01-05 (token `og-image` en docs del kit).

### Estado del build (documentado)

`pnpm build` falla por pieza fuera del alcance de la 19 (hallazgo ya canalizado del
implementer de la feature 18): `src/pages/posts/[id].astro:3` importa
`markdownPostRepository`, API eliminada por REQ-18-05 → `[MISSING_EXPORT]`. La ruta se
regenerará/canalizará aparte (decisión del líder pendiente). Los imports
`node:fs`/`node:path`/`node:url` de los repositorios restaurados aparecen en el grafo
del build pero NO son causa del fallo. No se corrió build adicional como verificación
(instrucción del líder: no ejecutar build si falla por piezas fuera de alcance).

## Nota de alcance

`index.astro` y `about.astro` son prerender, así que `node:fs` se ejecuta solo en build
(entorno Node), no en el worker. Si una ruta servida en runtime usara estos
repositorios, sería otra feature (riesgo: Workers sin `node:fs`).
