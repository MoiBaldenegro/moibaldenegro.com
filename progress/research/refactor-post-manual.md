# Investigación — Refactorización completa tras modificaciones manuales (2026-08-12)

## Problema

El usuario hizo modificaciones manuales en todo el proyecto ("debería estar
bien, pero haz una verificación completa del harness y después una
refactorización completa del proyecto"). La verificación del líder detectó
**init.sh EN ROJO**: 10 tests fallando (113 pass / 10 fail). El formato y el
build pasan; los tests no. Este informe verifica cada diagnóstico en disco,
decide las opciones abiertas y descompone la refactorización en features del
backlog (ids 18-24).

## Verificación de diagnósticos en disco (evidencia)

### D1. Dominio de posts deshecho (features 7/10/17) — CONFIRMADO

- `src/domain/entities/post.ts` está **VACÍO** (0 líneas). La spec REQ-07-01
  exige `interface Post` con `readonly title author img readtime description
  tags created updated`.
- `src/domain/repositories/posts-repository.ts` fue reescrito como función
  `markdownPostRepository()` que devuelve las **entradas crudas** de
  `getCollection('architecture')` sin validar ni mapear. El contrato
  (`tests/posts-repository.test.mjs`) exige `export class PostsRepository`
  con constructor de loader inyectable (default = dynamic import de
  `astro:content`), validación → `PostsDataError` y mapeo a `Post[]`.
  Consecuencia: `no export PostsRepository` → el test crashea al importar.
- Estado canónico recuperado de git (`ae2597b`): la implementación correcta
  existe en historial (entidad + clase con `loadEntries` inyectable y helpers
  `parsePost`/`asData`/`expectString`/`expectNumber`/`expectTags`).

### D2. Repositorios JSON migrados a `?raw` sin atributo — CONFIRMADO (+ decisión)

- `hero-profile-repository.ts` y `hero-cards-repository.ts`: imports
  `../../data/*.json?raw` **sin** `with { type: 'json' }`. Verificado con
  Node v22.22.2 (versión del repo): `ERR_IMPORT_ATTRIBUTE_MISSING` al importar
  el módulo en node:test.
- Además el constructor reescrito espera un **string incrustado** como
  default, mientras los tests inyectan **URLs de archivos temporales**:
  `new HeroProfileRepository(fileUrl)` / `new HeroCardsRepository(fileUrl)`
  (REQ-05-04, REQ-06-05) y `new HeroProfileRepository()` sin argumentos debe
  leer el JSON real (REQ-05-03, REQ-06-03).
- **Decisión (tomada tras leer specs y tests): restaurar la lectura vía
  `node:fs`** con constructor que acepta una URL inyectable cuyo default
  resuelve al archivo real (`pathToFileURL(join(process.cwd(),
  'src', 'data', ...))` — patrón original en git `ae2597b`). Es el único
  enfoque que satisface la firma del contrato de tests y la arquitectura
  ("Entregan entidades leyendo desde archivos JSON"). La alternativa
  `with { type: 'json' }` mantendría la divergencia de firma (URL vs string)
  y es ambigua con `?raw` en Vite/Astro.
- **Nota de alcance**: las páginas que usan estos repositorios son
  prerender (`index.astro` y `about.astro` declaran `prerender = true`), así
  que `node:fs` se ejecuta solo en build (entorno Node), no en el worker. Si
  en el futuro una ruta servida en runtime usara estos repositorios, se abre
  feature aparte (riesgo: Workers no tiene `node:fs`).

### D3. latest-articles.astro reescrito — CONFIRMADO

Consume `post.data.*` (entradas crudas) en vez de la entidad `Post`:
- `src={`/assets/content/${post.data.img}`}` (debe ser `post.img`, REQ-17-01).
- `alt={post.data.title}` (debe ser `alt={post.title}`, REQ-17-06).
- Sin `loading="lazy"` (REQ-17-07).
- Sin `<span>` con `post.author`, `post.readtime`, `post.tags` ni "min de
  lectura" (REQ-10-01 Decisión 1); tampoco `post.description`.
- Añade un **enlace muerto** `<a href={`/posts/${post.id}`}>`: no existe
  ninguna ruta `/posts/` en `src/pages/` (solo `index.astro` y `about.astro`)
  → 404.
- Añade atributos `transition:name` sin amparo (ver D7).
- La hoja `latest-articles.css` **sí conserva** la regla
  `.latest-articles__image` (75 líneas) — el CSS de la feature 17 sobrevive.
- Estado canónico (features 10+17) recuperado de git `ae2597b` +
  `progress/impl_17_article-card-images.md`: marcado article/h2/p/span con los
  5 campos, img con clase/`alt`/`loading`, sin anchor ni transiciones.

### D4. Migración SSR + adapter Cloudflare — CONFIRMADO (+ decisión)

- `astro.config.mjs`: `output: 'server'`, adapter `@astrojs/cloudflare`
  (`imageService: 'cloudflare'`), esquema `env` con `IN_MAINTENANCE`
  (public/client), `HTB_API_TOKEN` (secret/server, optional) y `HTB_USER_ID`
  (secret/server, optional).
- `package.json`: dependencias `@astrojs/cloudflare ^14.2.1` y
  `wrangler ^4.121.0`, script `generate-types` (`wrangler types`).
- `.wrangler/deploy/config.json` (sin trackear) y `.wrangler/state/**` —
  **trackeado en git** (ficheros sqlite de miniflare en el índice). `.gitignore`
  NO ignora `.wrangler/`.
- Build: `dist/client/` (HTML+assets: `about/`, `index.html`, `_astro/`) y
  `dist/server/` (entry.mjs, wrangler.json, virtual middleware).
- `tests/about-page.test.mjs` REQ-11-05 busca `dist/about/index.html` → ya no
  existe → falla.
- **Decisión: MANTENER SSR + Cloudflare.** Evidencia de intención del usuario:
  cadena de commits de deploy (de `a64d843` "aasfdsaf" a `f4507c8` "fix:
  update logging..."), `.wrangler/deploy/` presente y script `generate-types`.
  Se canaliza como feature 21 con spec y justificación (reglas 2 y 9 de
  architecture.md), adaptando REQ-11-05 al output real
  (`dist/client/about/index.html`). No se revierte a estático.
- Hallazgo extra: `dist/client/posts/` contiene `00-agilismo` y
  `01-diseño-detallado` (restos de build de experimentos; `dist/` es artefacto
  regenerado — desaparecerán en el próximo build limpio; no hay
  `src/pages/posts/`).

### D5. Fuga de tokens prohibidos en el kit — CONFIRMADO, con 3 puntos (no 2)

El leader reportaba 2 archivos; la verificación encuentra **3** (los tres
dentro del alcance de `getKitFiles()` del test de integridad):

1. `docs/architecture.md:45` — §13 cita `generate-og-image.mjs` (inexistente)
2. `docs/conventions.md:14` — ejemplo `scripts/generate-og-image.mjs`
3. `scripts/validate-feature-list.mjs:10` — comentario "precedente
   generate-og-image.mjs"

Además `docs/architecture.md` contiene el token **"hero"** en 3 líneas
(15, 21, 56), con referencias obsoletas a `hero.css` (hoja eliminada en la
feature 4) y a "Navbar, Hero, Cards, Footer" — el token "hero" está en
`FORBIDDEN_TOKENS` del test de integridad. Y `docs/verification.md:69`
referencia `tests/regeneracion-limpia.test.mjs`, test que NO existe en
`tests/` (solo hay 17 ficheros; ninguno con ese nombre).

**Decisión (opción mínima del líder): alinear los docs con la realidad**
editar las menciones; NO crear el script (crearlo sería feature aparte con
spec). Los ejemplos pasan a scripts reales: `check-format.mjs`,
`validate-feature-list.mjs`, `audit-design-tokens.mjs`.

### D6. Feature 17 `article-card-images` in_progress — DECISIÓN: no tocar status

El trabajo de la feature 17 (regla `.latest-articles__image` en
`latest-articles.css`, 75 líneas) **sobrevive en disco**; lo que rompió sus
tests es la reescritura manual del componente (post.data.*, sin alt/lazy).
Tras la restauración de `latest-articles.astro` (feature 20, que depende de la
18), `tests/article-card-images.test.mjs` (REQ-17-01..09) vuelve a verde y el
líder podrá cerrar la feature 17 con revisión sobre `impl_17` +
`review_17` (APPROVED existente). La feature 20 documenta esto; ninguna
feature nueva depende del id 17.

### D7. Hallazgos adicionales (no listados por el líder) — con decisión consultada

1. **Fondo GOL desactivado silenciosamente**: `Layout.astro:27` tiene
   `<!-- <GameOfLifeBackground /> -->` (import presente pero uso comentado).
   Los tests REQ-15-09 pasan porque el regex cuenta la etiqueta dentro del
   comentario, pero el canvas NO se renderiza (regresión visual vs features
   15-16 aprobadas, look 0.80/0.15 aprobado). **Decisión consultada al
   líder/usuario: dejarlo DESACTIVADO** (posible elección deliberada del
   usuario; no se crea feature; se documenta como hallazgo).
2. **ClientRouter (View Transitions)**: `Layout.astro:5,24` importa y
   renderiza `ClientRouter` de `astro:transitions` (añadido manualmente; JS de
   runtime sin justificación — regla "Estático por defecto"; sin tests que lo
   amparen). **Decisión consultada: canalizarlo como feature con spec**
   (feature 24: spec + design + tests, excepción aprobada). La feature 20
   elimina primero los `transition:name` sueltos del componente para que la 24
   los reincorpore según su design.

## Descomposición (features 18-24)

Orden de implementación por el arnés (menor id pending con deps done):

| id | name | depends_on | Capa | Contrato restaurado |
|----|------|-----------|------|---------------------|
| 18 | posts-domain-restore | — | dominio | REQ-07-01..05 |
| 19 | json-repositories-restore | — | dominio | REQ-05-03/04, REQ-06-03/05 |
| 20 | latest-articles-restore | [18] | UI | REQ-10-01..04, REQ-17-01..09 |
| 21 | ssr-cloudflare-align | — | infraestructura | REQ-11-05 (adaptado), reglas 2/9 |
| 22 | htb-stadistics-section | [21] | UI + dominio | nueva (D4, convenciones) |
| 23 | harness-docs-alignment | — | kit/arnés | REQ-01-05 |
| 24 | view-transitions | [20] | UI | nueva (D7.2, excepción JS) |

Criterios: cada feature es independiente y testeable sola (test-first),
respeta `one_feature_at_a_time`, no mezcla problemas distintos y restaura el
contrato del arnés por capas (dominio → UI → infraestructura → kit).

## Riesgos y trabas

1. **Wrangler/miniflare state trackeado**: `.wrangler/state/**` (sqlite) está
   en el índice de git; la feature 21 debe añadir `.wrangler/` a `.gitignore`
   y dejar de rastrear el estado (los ficheros .sqlite cambian en cada deploy;
   hoy ensucian cada commit).
2. **`node:fs` en repositorios JSON + Workers**: seguro hoy porque las páginas
   son prerender; si alguien des-prerenderiza `index`/`about`, los repos
   crashean en el worker. Documentado como límite de la feature 19.
3. **Secretos en logs**: `htb-stadistics.astro` registra en consola una marca
   del token y el `HTB_USER_ID` completo (el id está clasificado `secret` en el
   esquema env). La feature 22 elimina todo console.* de secretos.
4. **tokens.css al límite**: 96/100 líneas → las features 22 y 24 NO pueden
   añadir tokens nuevos (se reutilizan los existentes; 16:9 y otros valores
   propios quedan justificados en design cuando aplique).
5. **Docs obsoletos**: architecture.md §13 cita un precedente inexistente y
   ejemplos de hojas eliminadas; cualquier nueva mención debe pasar por la
   feature 23 para no re-filtrar tokens prohibidos.

## Cierre

Backlog actualizado en `feature_list.json` (features 18-24, status `pending`).
Specs creadas: `specs/18_posts-domain-restore/`,
`specs/19_json-repositories-restore/`, `specs/20_latest-articles-restore/`
(requirements + design), `specs/21_ssr-cloudflare-align/`,
`specs/22_htb-stadistics-section/` (requirements + design),
`specs/23_harness-docs-alignment/`, `specs/24_view-transitions/`
(requirements + design). `node scripts/check-format.mjs` en verde tras el
alta.