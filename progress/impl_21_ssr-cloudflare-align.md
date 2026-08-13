# Informe de implementación — feature 21 `ssr-cloudflare-align`

- **Fecha:** 2026-08-12 · implementer
- **Spec:** `specs/21_ssr-cloudflare-align/requirements.md` (REQ-21-01..06, sin design.md: no toca UI/presentación)
- **Contexto:** decisión del spec_author de MANTENER SSR + adapter Cloudflare (research `progress/research/refactor-post-manual.md` D4). Esta feature canaliza la decisión al arnés: configuración canónica, `.wrangler` fuera de git y REQ-11-05 adaptado al output real del adapter.

## 1. Ciclo rojo/verde (evidencia)

### 1.1 Test nuevo — `tests/ssr-cloudflare-align.test.mjs` (contrato REQ-21-01..06)

Escrito **primero**, sin tocar código de la feature. ROJO capturado antes de implementar:

```
# tests 7
# pass 5
# fail 2
not ok 4 - REQ-21-03: .gitignore excluye .wrangler/
  error: '.gitignore no excluye .wrangler/ (REQ-21-03)'
not ok 5 - REQ-21-03: git ls-files no lista archivos de .wrangler
  error: git sigue trackeando estado de .wrangler/ (REQ-21-03):
         .wrangler/state/v3/cache/miniflare-CacheObject/metadata.sqlite, ... (15 ficheros sqlite de miniflare)
```

Tras implementar (`.gitignore` + `git rm -r --cached .wrangler`):

```
# tests 7
# pass 7
# fail 0
ok 1 - REQ-21-01: astro.config.mjs declara output server y el adapter cloudflare
ok 2 - REQ-21-01: el esquema env declara las variables de entorno
ok 3 - REQ-21-02: package.json define generate-types con wrangler types
ok 4 - REQ-21-03: .gitignore excluye .wrangler/
ok 5 - REQ-21-03: git ls-files no lista archivos de .wrangler
ok 6 - REQ-21-04: tests/about-page.test.mjs verifica el output real del adapter
ok 7 - REQ-21-06: la excepción de dependencias externas queda documentada
```

### 1.2 Contrato REQ-11-05 — `tests/about-page.test.mjs` (adaptado por la spec 21: REQ-21-04/05)

Adaptación mínima ordenada por la spec: `DIST_ABOUT_PATH` pasa de `../dist/about/index.html` a
`../dist/client/about/index.html` (output real del adapter: HTML en `dist/client/`, server en
`dist/server/`); comentario de cabecera actualizado; semántica REQ-21-05 conservada (el test
**falla si la ruta no se genera** — `assert.equal(build.status, 0)` + `existsSync`).

ROJO capturado tras la adaptación (antes de tocar nada más):

```
# tests 11
# pass 10
# fail 1
not ok 10 - REQ-11-05: el build genera la ruta /about con los datos reales del perfil
  error: astro build falló (REQ-11-05):
    [ERROR] [vite] ✗ Build failed in 147ms
    [MISSING_EXPORT] "markdownPostRepository" is not exported by "src/domain/repositories/posts-repository.ts".
       ╭─[ src/pages/posts/[id].astro:3:10 ]
```

**Estado actual (2026-08-12, mismo resultado tras el `pnpm build` de verificación):** REQ-11-05
sigue en rojo en la suite, pero **exclusivamente** porque el build real aborta en
`src/pages/posts/[id].astro:3` (`MISSING_EXPORT markdownPostRepository`, API eliminada por
REQ-18-05). Es la pieza **fuera del alcance de la spec 21** (la spec no cubre la página):
`src/pages/posts/[id].astro` NO se toca (instrucción del líder: si la spec 21 no cubre la
página, dejarla sin tocar y documentar; la feature 24 la cubrirá — el propio `[id].astro`
declara `transition:name` `title-${post.id}`/`img-${post.id}`, que son los pares del design de
la feature 24). Cuando la página se adapte a `PostsRepository` (o se elimine) en la 24, el
build pasará y REQ-11-05 quedará en verde **sin más cambios en este test**.

## 2. Cobertura REQ-21-XX

| REQ | Cómo se cumple |
|-----|----------------|
| REQ-21-01 | `astro.config.mjs` ya era canónico (output `'server'`, adapter `cloudflare({ imageService: 'cloudflare' })`, esquema `env` con `IN_MAINTENANCE` public/client, `HTB_API_TOKEN` y `HTB_USER_ID` secret/server/optional) — verificado por `tests/ssr-cloudflare-align.test.mjs` (2 tests). Sin cambios: no se reformatea la configuración del usuario. El build genera `dist/client` + `dist/server` (layout del adapter, verificado en research D4); el build completo queda pendiente del `[id].astro` (ver §4). |
| REQ-21-02 | `package.json` define `"generate-types": "wrangler types"` (ya canónico) — verificado por test. |
| REQ-21-03 | `.gitignore` añade `.wrangler/` (+ comentario "wrangler / cloudflare local state (sqlite de miniflare)") y `git rm -r --cached .wrangler/` deja de trackear los 15 ficheros sqlite de `.wrangler/state/` (riesgo R1 del research). `git ls-files .wrangler` → 0. Los archivos locales NO se borran (siguen en disco). El índice queda con 15 eliminaciones staged para el commit del líder. |
| REQ-21-04 | `tests/about-page.test.mjs` REQ-11-05 adaptado a `dist/client/about/index.html` con build real; el test de contrato REQ-21-04 lo verifica (y que la ruta estática antigua `dist/about/index.html` ya no está). |
| REQ-21-05 | Semántica conservada: si el build no genera la ruta, el test falla (assert de status 0 + existsSync, sin debilitamiento). |
| REQ-21-06 | Justificación documentada en: descripción de la feature 21 en `feature_list.json` (excepción a la regla 2 con el objetivo declarado del usuario: deploy a Cloudflare Workers; regla 9 cumplida porque las páginas siguen prerender y solo la feature 22 renderiza server:defer), `specs/21_ssr-cloudflare-align/requirements.md` REQ-21-06, cabecera del test nuevo y este informe. |

## 3. Archivos tocados

- `tests/ssr-cloudflare-align.test.mjs` — **nuevo** (7 tests, contrato REQ-21-01..06).
- `tests/about-page.test.mjs` — REQ-11-05: `DIST_ABOUT_PATH` → `dist/client/about/index.html`; comentario de cabecera y mensajes de assert actualizados (solo lo que ordena la spec 21).
- `.gitignore` — añadida la línea `.wrangler/`.
- Índice de git — 15 ficheros `.wrangler/state/**` destrackeados (`git rm -r --cached .wrangler`), archivos locales intactos.
- `feature_list.json` — status de la feature 21: `pending` → `in_progress` (el cierre a `done` lo decide el líder tras review).
- NO tocados: `astro.config.mjs`, `package.json` (ya canónicos), dominio posts (18), repos JSON (19), `latest-articles.astro` (20), docs del kit (23), `htb-stadistics.astro` (22), GOL (14-16), `src/pages/posts/[id].astro` (fuera del alcance de la spec 21).

## 4. Verificación final

| Comando | Resultado |
|---------|-----------|
| `node --test tests/ssr-cloudflare-align.test.mjs` | 7/7 pass (VERDE) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` |
| `pnpm test` (suite completa) | 157 pass / 2 fail — residuales SOLO: (a) `REQ-11-05` → build abortado por `[id].astro` (fuera de alcance 21, pendiente de la 24); (b) `REQ-01-05` → feature 23 `harness-docs-alignment` (ajena). La feature 22 no tiene tests aún. |
| `pnpm build` | Falla en el mismo punto único: `[MISSING_EXPORT] "markdownPostRepository" ... src/pages/posts/[id].astro:3:10` — pieza fuera del alcance de la spec 21. |
| `./init.sh` | 2 comprobaciones en rojo, ambas ajenas al alcance 21: `tests al 100%` (2 residuales: REQ-11-05 + REQ-01-05) y `build de producción` (solo `[id].astro`). |

## 5. Estado del build y de `src/pages/posts/[id].astro`

- **`src/pages/posts/[id].astro`:** EXISTE (commit manual del usuario `72e5c52`), 35 líneas, con
  `getStaticPaths` + `prerender = true`, e importa `markdownPostRepository` de
  `posts-repository.ts` — API eliminada por REQ-18-05 → **el build está roto hoy** en ese único
  punto (`MISSING_EXPORT`).
- **Decisión aplicada:** la spec 21 NO cubre la página (REQ-21-01..06 no la mencionan y no hay
  design.md) → **no se toca**; se documenta. La página declara `transition:name`
  `title-${post.id}` e `img-${post.id}` — exactamente los pares del design de la feature 24
  `view-transitions` → la 24 es su cauce natural: adaptarla a `PostsRepository` (y dejar la
  ruta `/posts/[id]` como ruta real de posts) o eliminarla.
- **Dependencia:** el build completo (`REQ-21-01` acceptance "pnpm build genera dist/client y
  dist/server sin errores") queda bloqueado por la resolución de `[id].astro` en la feature 24
  (o feature dedicada). La pieza de la feature 21 que lo habilita (REQ-11-05 adaptado a
  `dist/client/about/index.html`) está implementada y verificada por contrato.