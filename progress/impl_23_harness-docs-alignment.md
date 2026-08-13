# Informe de implementación — feature 23 harness-docs-alignment

- **Fecha:** 2026-08-12 · implementer
- **Spec:** `specs/23_harness-docs-alignment/requirements.md` (REQ-23-01..05)
- **Contexto:** `progress/research/refactor-post-manual.md` D5 (3 puntos de fuga "og-image", no 2; token "hero" en architecture.md; `docs/verification.md:69` referencia test inexistente).
- **Decisión respetada (spec_author/líder):** alinear los docs con la realidad de disco editando las menciones; **NO** crear `generate-og-image.mjs` (sería feature aparte con spec). Ejemplos pasan a scripts reales.

## 1. Ciclo rojo/verde

### ROJO (estado inicial, antes de editar) — `node --test tests/harness-kit-integrity.test.mjs`

```
# Subtest: REQ-01-05: los tokens de la app no aparecen en los archivos del kit
not ok 3 - REQ-01-05: los tokens de la app no aparecen en los archivos del kit
  error: 'harness-kit/docs/architecture.md: fuga "og-image"'
1..7
# tests 7
# pass 6
# fail 1
```

Escaneo previo del kit completo (mismo alcance que `getKitFiles()` del test, 27 archivos):

```
docs/architecture.md :: og-image :: líneas 45
docs/architecture.md :: hero :: líneas 15,21,56
docs/conventions.md :: og-image :: líneas 14
scripts/validate-feature-list.mjs :: og-image :: líneas 10
```

Además: `docs/verification.md:69` referencia `tests/regeneracion-limpia.test.mjs` (test inexistente en `tests/` — REQ-23-05). No se exige test nuevo en la spec 23: el contrato es `tests/harness-kit-integrity.test.mjs`, ya existente (feature 1).

### VERDE (tras editar) — `node --test tests/harness-kit-integrity.test.mjs`

```
1..7
# tests 7
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Escaneo posterior idéntico: `scan completo` **sin ninguna coincidencia** de `og-image|hero|tomatesoft|cards-data` en los 27 archivos del kit.

## 2. Cobertura REQ-23-XX

| REQ | Cómo se cumple |
|-----|----------------|
| REQ-23-01 | `docs/architecture.md` §13 y `docs/conventions.md` citan solo scripts reales de `scripts/`: `validate-feature-list.mjs`, `check-format.mjs`, `audit-design-tokens.mjs` (verificados en disco con glob; `generate-og-image.mjs` no existe en `scripts/`). |
| REQ-23-02 | `scripts/validate-feature-list.mjs` (línea 10, solo el comentario): "precedente generate-og-image.mjs" → "excepción documentada en docs/architecture.md §13 (aprobada en la feature 19)". El token og-image desaparece de todos los archivos del kit (verificado por escaneo). |
| REQ-23-03 | Escaneo completo del kit tras las ediciones: 0 coincidencias de `og-image`, `hero`, `tomatesoft` ni `cards-data` (salida: `scan completo` sin líneas de fuga). |
| REQ-23-04 | `docs/architecture.md:21` → fila `src/styles/`: `global.css`/`hero.css`/`cards.css` (obsoletos; `hero.css` eliminada en la feature 4) sustituidos por `tokens.css` + hojas reales (`layout.css`, `profile-card.css`, `latest-articles.css`…). Líneas 15 y 56: "Navbar, Hero, Cards, Footer" → componentes reales de `src/components/` sin token prohibido (`LatestArticles`, `GameOfLifeBackground`, `HtbStadistics`). |
| REQ-23-05 | `docs/verification.md:69`: `tests/regeneracion-limpia.test.mjs` (inexistente) → `tests/harness-kit-integrity.test.mjs` (test real del kit que guarda el contrato de regeneración limpia de la feature 1). |

Cobertura del acceptance 1: `tests/harness-kit-integrity.test.mjs` en verde (7/7, contrato REQ-01-05).

## 3. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `docs/architecture.md` | Línea 15 (fila `src/components/`): componentes reales. Línea 21 (fila `src/styles/`): `tokens.css` + hojas reales, fuera `hero.css`. Línea 45 (§13): precedente `generate-og-image.mjs` → `validate-feature-list.mjs` (139 líneas, detector de ciclos `depends_on`, aprobado en la feature 19). Línea 56 (diagrama de flujo): `Navbar, Hero, Cards, Footer` → `LatestArticles, GameOfLifeBackground, HtbStadistics`. |
| `docs/conventions.md` | Línea 14 (ejemplo scripts): `generate-og-image.mjs` → `scripts/check-format.mjs`, `scripts/audit-design-tokens.mjs`. |
| `scripts/validate-feature-list.mjs` | Solo el comentario de la línea 10: precedente inexistente → excepción documentada en `docs/architecture.md §13` (feature 19). |
| `docs/verification.md` | Línea 69: referencia al test inexistente `regeneracion-limpia.test.mjs` → `tests/harness-kit-integrity.test.mjs`. |
| `feature_list.json` | Feature 23: `status: pending` → `in_progress` (la marcará el líder tras revisión; esta feature NO se marca done sola). |
| `progress/current.md` | Sección "Feature en curso" para la 23 (plan + estado). |

NO se tocó: `src/`, `tests/` (la spec 23 no ordena test nuevo; el contrato es el test de integridad existente), ninguna feature cerrada (18-22), ni `scripts/` fuera del comentario de `validate-feature-list.mjs`.

## 4. Verificación final

| Comando | Resultado |
|---------|-----------|
| `node --test tests/harness-kit-integrity.test.mjs` | ✔ 7/7 pass (REQ-23-01..05, contrato REQ-01-05) |
| Escaneo de tokens del kit (replica `getKitFiles()`) | ✔ 0 fugas de `og-image|hero|tomatesoft|cards-data` |
| `node scripts/check-format.mjs` | ✔ `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` |
| `pnpm test` | 180/181 pass — **1 residual SOLO REQ-11-05** (`tests/about-page.test.mjs:213`): `astro build falló` porque el build cae por `src/pages/posts/[id].astro:3` → `MISSING_EXPORT "markdownPostRepository"` (hallazgo canalizado del implementer de la 18; alcance de la feature 24, ajena a esta feature). |
| `pnpm build` | Falla SOLO por `[id].astro` (`MISSING_EXPORT markdownPostRepository`), confirmado en disco; fuera del alcance 23. |

**Residuales ajenos:** únicamente la feature 24 (`view-transitions`, que debe resolver `[id].astro`) y su efecto sobre REQ-11-05 (el build no llega a generar `dist/client/about/index.html`). Ningún residual pertenece a esta feature.