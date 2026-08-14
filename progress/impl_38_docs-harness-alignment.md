# Implementación — Feature 38 `docs-harness-alignment` (2026-08-14)

## Alcance

Alinear `docs/architecture.md` y `CHECKPOINTS.md` con el estado real del arnés
(hallazgo A7 de `progress/research/revision-general-ciclo30.md`), sin tocar el
resto de docs (conventions, verification, dependencies, README ya alineados) ni
`src/`. Espec: `specs/38_docs-harness-alignment/requirements.md` (REQ-38-01..04).

## 1. Estado previo verificado

- Suite completa antes de la feature: **218/218** (`node --test
  "tests/**/*.test.mjs"`, confirmado en el arranque).
- `docs/architecture.md` regla 6: «custom properties de `global.css`
  (definidas en `DESIGN.md`)» — ni `global.css` ni `DESIGN.md` existen en el
  repo; el archivo real es `src/styles/tokens.css`.
- `CHECKPOINTS.md`: congelado en features 22-25 («suite 158/158», «feature 25
  `in_progress`», líneas 27-36).
- Referencias adicionales desactualizadas en `docs/architecture.md` verificadas
  contra disco: `tomateLogo.svg` (no existe; `public/` real: `favicon.svg`,
  `favicon.ico`, `assets/`) y entidades `Card`/`Feature`/`Plan` (no existen;
  entidades reales: `hero-card.ts`, `hero-profile.ts`, `htb-profile.ts`,
  `post.ts`). `src/data/` real: `hero.json` (perfil) + `hero-cards.json`
  (cards de tecnologías) — el ejemplo «features» no corresponde a ningún JSON.

## 2. Ciclo ROJO (test-first)

Test nuevo `tests/docs-harness-alignment.test.mjs` (3 tests: REQ-38-01,
REQ-38-02, REQ-38-03) escrito ANTES de tocar los docs. Evidencia:

```
$ node --test tests/docs-harness-alignment.test.mjs
# Subtest: REQ-38-01: architecture.md regla 6 nombra tokens.css y no menciona global.css ni DESIGN.md
not ok 1 - REQ-38-01: ... (AssertionError: expected true, actual false)
# Subtest: REQ-38-02: CHECKPOINTS.md no menciona conteos de suite del ciclo previo ni features en progreso
not ok 2 - REQ-38-02: ... (AssertionError: expected true, actual false)
# Subtest: REQ-38-03: los docs del arnés alineados conservan la ausencia de tokens prohibidos del kit
ok 3 - REQ-38-03: ...
# tests 3
# pass 1
# fail 2
```

Causas reales: REQ-38-01 falla porque architecture.md menciona `global.css`
y `DESIGN.md`; REQ-38-02 falla porque CHECKPOINTS.md contiene «158/158» e
«in_progress». REQ-38-03 ya verde (sin tokens prohibidos del kit).

## 3. Implementación (alineación de los docs)

### `docs/architecture.md` (4 cambios, revisión completa del doc)

| Línea | Antes (desalineado) | Después (realidad del repo) |
|---|---|---|
| regla 6 | «custom properties de `global.css` (definidas en `DESIGN.md`)» | «custom properties de `src/styles/tokens.css`» |
| tabla `public/` | Ej: `tomateLogo.svg` (no existe) | Ej: `favicon.svg` (existe en `public/`) |
| tabla `src/domain/entities/` | ej: `Card`, `Feature`, `Plan` (no existen) | ej: `HtbProfile`, `Post` (reales, sin el token «hero» de REQ-25-06) |
| tabla `src/data/` | «(cards, features, etc.)» | «(cards de tecnologías, perfil, etc.)» |

No se introdujo ningún token prohibido: «hero» NO aparece (REQ-25-06) ni
tomatesoft/cards-data/og-image (REQ-01-05). El resto del doc (reglas 1-5,
7-13, flujo de datos, «Qué NO hacer») verificado contra disco: scripts
`check-format.mjs`/`validate-feature-list.mjs` existen, componentes
`LatestArticles`/`HtbStadistics` y hojas `layout.css`/`profile-card.css`/
`latest-articles.css` reales — sin cambios.

### `CHECKPOINTS.md` (2 cambios)

| Bloque | Antes (congelado) | Después (realidad) |
|---|---|---|
| Verificación | «verificado por el reviewer de la feature 25 (2026-08-13): suite 158/158, harness-kit 7/7, build OK con rutas /posts» | «verificado al cierre del ciclo 30 (2026-08-14): suite 221/221, harness-kit 7/7, build OK» |
| Harness | «features 22-24 `done`; feature 25 `in_progress` a la espera…» | «features 1-38 `done`, conservadas en el array (historial completo del ciclo 30; ninguna a medias)» |

Sin «158/158», sin «in_progress», sin features del historial en progreso
(REQ-38-02). El ítem pendiente de inspección visual se conserva (sigue
siendo cierto, no menciona features ni conteos).

## 4. Ciclo VERDE

```
$ node --test tests/docs-harness-alignment.test.mjs
# tests 3
# pass 3
# fail 0

$ node --test "tests/**/*.test.mjs"
# tests 221        (218 baseline + 3 nuevos de la feature 38)
# pass 221
# fail 0

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md, specs/ y docs/dependencies.md correctos

$ ./init.sh
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.

$ node --test tests/game-of-life-removal.test.mjs tests/harness-kit-integrity.test.mjs
# tests 15
# pass 15
# fail 0        (REQ-25-06 sin token «hero» + REQ-01-05 sin tokens del kit: OK)
```

## 5. Trazabilidad acceptance ↔ REQ

| Acceptance | REQ | Evidencia |
|---|---|---|
| architecture.md regla 6 nombra tokens.css, sin global.css/DESIGN.md | REQ-38-01 | test REQ-38-01 verde; doc líneas 12-31 |
| CHECKPOINTS.md sin features en progreso ni conteos previos (158/158) | REQ-38-02 | test REQ-38-02 verde; doc líneas 26-36 |
| Archivos del kit sin tokens prohibidos (incl. architecture.md) | REQ-38-03, REQ-01-05, REQ-25-06 | tests REQ-38-03 + harness-kit 7/7 + REQ-25-06 verdes; grep 0 coincidencias en los dos docs |
| check-format y suite completa en verde | REQ-38-04 | FORMATO ✔, suite 221/221, `./init.sh` «El entorno está perfecto» |

## 6. Notas

- `progress/current.md` y `feature_list.json` actualizados: feature 38 en
  `in_progress` (pendiente reviewer del líder; NO marcada done).
- No se tocó ningún otro doc ni archivo de `src/`.
