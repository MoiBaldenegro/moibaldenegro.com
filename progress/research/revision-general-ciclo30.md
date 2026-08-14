# Revisión general del proyecto — Ciclo 30 (spec_author)

> Petición del humano: «dale una revisión a todo el proyecto, estila las partes
> de la aplicación que no se hayan estilado o tengan margen de mejora, y una
> refactorización completa basada en los estándares del proyecto. De entrada
> las navegaciones a los detalles del content no funcionan; sospecho que es
> porque el id no se está pasando, ni tampoco el slug (aunque ahora mismo no se
> usa, es mejor exponerlo porque se usará después)».
>
> Fecha: 2026-08-14. Estado del repo: árbol git limpio (la limpieza de specs y
> la modificación HTB están commiteadas: `0b7f359`, `8078975`).
> `feature_list.json` existe con `features: []` (limpieza manual del humano).

---

## 1. Estado verificado en disco (sin tocar nada)

- `feature_list.json`: esqueleto válido (`project`, `description`, `rules`,
  `features: []`). La limpieza manual es legítima (historial 1-32 `done`
  conservado en `progress/history.md` y en `progress/impl_*`/`review_*`).
- `specs/`: solo queda `_template/` (requirements.md + design.md). Borrada
  entera por el humano (commit `0b7f359`).
- `src/`: 9 hojas CSS, 2 JSON, content.config.ts, 3 páginas, 1 layout,
  4 componentes, 4 entidades, 4 repositorios (todo leído en disco).
- `tests/`: 26 archivos (todos leídos). `scripts/`: 5 validadores + audit.
- `docs/`: architecture.md, conventions.md, verification.md, dependencies.md.
- `progress/history.md`: 419 líneas con el historial completo de features
  1-32 y los estados canónicos de las features 22/27/28/31/32 (HTB).
- `./init.sh` en ROJO confirmado: `node --test` sobre los 5 archivos
  sospechosos → **41 tests / 30 pass / 11 fail exactos** (coincide con el
  reporte del líder 195/11; el resto de la suite no se ejecutó completo porque
  `tests/about-page.test.mjs` REQ-11-05 ejecuta un build real dentro de la
  suite, pesado e innecesario para confirmar las causas).

## 2. Causa raíz de los 11 fallos de la suite (verificado ejecutando los tests)

| Test | Fallos | Causa raíz | Feature que lo restaura |
|---|---|---|---|
| `tests/htb-profile-repository.test.mjs` | 6 (REQ-22-02 ×4 datos/cabecera, console.*, ≤100 líneas) | `htb-profile-repository.ts` (106 líneas) sin el 3er argumento de constructor (fetch inyectable, contrato REQ-22-02): los tests construyen `new HtbProfileRepository('TOK','42',fakeFetch)` y el repo ignora el fetch → llama a la **API real** con token `TOK` → 401 → los asserts de perfil fallan. Además 5 `console.log` (líneas 22/30/33/47/57) con el `Response` del fetch (el token viaja en la cabecera) y 106 líneas. | 33 |
| `tests/htb-api-graceful-degradation.test.mjs` | 2 (REQ-27-01, REQ-27-07/10) | REQ-27-01: mismo problema del fetch inyectable ignorado (real 401 → null). REQ-27-07/10: el template de `htb-stadistics.astro` no usa `{profile && ...}`. | 33 + 34 |
| `tests/htb-stadistics-prerender-fix.test.mjs` | 1 (REQ-32-04) | `htb-stadistics.astro` no condiciona la sección con `{profile && ...}` (usa `profile?.x ?? 'N/D'`). | 34 |
| `tests/view-transitions.test.mjs` | 1 (REQ-24-04) | `specs/24_view-transitions/design.md` no existe (specs/ borrada). | 35 |
| `tests/ssr-cloudflare-align.test.mjs` | 1 (REQ-21-06) | `specs/21_ssr-cloudflare-align/requirements.md` no existe Y el test lee `feature_list.json` buscando la feature 21 (imposible en el ciclo nuevo, ids 33+) → el test debe actualizarse. | 35 |

Nota sobre los tests HTB: **ya inyectan un fetch mock** (`fakeFetch`) — el
patrón es correcto y coincide con el loader inyectable de PostsRepository y de
los repos JSON (features 19/31). NO hay que cambiar los tests a red real: hay
que restaurar el contrato del repositorio (3er parámetro con default = fetch
global). La observación del líder «tests que llaman a la API real» es el
**síntoma** de que el repo ignora el fetch inyectado, no un defecto de los
tests.

## 3. Bug de navegación a los detalles del content (petición principal)

Cadena completa verificada:

1. `src/components/latest-articles.astro` (31 líneas) renderiza las cards
   **sin ningún `<a href>`** (líneas 11-28): nada es navegable.
2. La entidad `Post` (`src/domain/entities/post.ts`, 15 líneas) **no declara
   `id` ni `slug`** → `post.id` en las líneas 18/20 de
   `latest-articles.astro` es `undefined` → `transition:name` renderiza
   `img-undefined`/`title-undefined` en TODAS las cards.
3. `src/pages/posts/[id].astro` (39 líneas) genera `params: { id: entry.id }`
   (id real de la entrada, p. ej. `00-agilismo`) y usa
   `transition:name={`title-${entry.id}`}`/`img-${entry.id}` (líneas 31/33) →
   los pares de transición de las cards (`-undefined`) **nunca coinciden** con
   los del detalle (`-00-agilismo`) → transiciones rotas además de no navegar.
4. `getStaticPaths` empareja por **índice** (`posts[index]`, línea 17) tras
   validar solo la longitud (líneas 10-14): si `getCollection` y el loader
   devuelven órdenes distintas, la card del artículo A mostraría los datos del
   artículo B en `/posts/<id-de-A>` — desalineación silenciosa.
5. El `slug` existe en el schema (`src/content.config.ts` línea 11:
   `slug: z.string()`) y en el frontmatter de ambos `.md`
   (`00-agilismo`, `01-diseño-detallado`) pero **no se expone** en la entidad
   ni se consume en ninguna parte (el humano quiere exponerlo para uso futuro).

Decisión de diseño: la ruta se queda en `/posts/[id]` con `id = entry.id`
(contrato fijado por `tests/view-transitions.test.mjs` REQ-24-05:
`params: { id: entry.id }`) y el `slug` se expone en la entidad `Post` para el
futuro. El enlace de la card será `/posts/${post.id}` con el id real.

## 4. Hallazgos de la revisión completa (UI, estándares, docs)

- **A1. Markup muerto en el hero:** `new-hero.astro` renderiza
  `.hero-noise` y `.hero-flower` (líneas 20-21) sin ninguna regla CSS
  (`hero-section.css` solo define `.new-hero`, `.hero-background`,
  `.hero-gradient`, `.hero-grid`) → dos divs muertos.
- **A2. Ancla vacía en HeroCard:** `hero-card.astro` línea 25: `<a href="">`
  envuelve el icono sin destino ni estilos → enlace roto/engañoso.
- **A3. Indentación inconsistente:** `htb-stadistics.astro` usa **tabs**
  (líneas 14-44) frente a 2 espacios del resto; `new-hero.astro` y
  `hero-card.astro` tienen sangrado extra (4-8 espacios) que empeora la
  legibilidad.
- **A4. Accesibilidad/estados:** `Layout.astro` línea 18: viewport sin
  `initial-scale=1`; navbar sin `aria-current` en el enlace de la página
  actual ni estilos de estado activo; sin estilos `:focus-visible` globales;
  las cards de `latest-articles` solo cambian `border-color` en hover (sin
  sombra token ni affordance de click — esto llega con la navegación).
- **A5. Sección de artículos sin encabezado:** `latest-articles.astro` abre
  `<section class="latest-articles">` sin título de sección («Últimos
  artículos») → jerarquía H1→H2 rota en `/` (el hero tiene h1 y las cards
  h2 sin sección ancla).
- **A6. Espaciado vertical HTB:** `.htb-stadistics` es una tarjeta de ancho
  completo sin margen vertical → pegada al borde inferior del viewport tras
  la sección de artículos.
- **A7. Docs obsoletos:** `docs/architecture.md` regla 6 referencia
  «custom properties de `global.css` (definidas en `DESIGN.md`)» — el archivo
  real es `src/styles/tokens.css` (no existe `global.css` ni `DESIGN.md`).
  `CHECKPOINTS.md` está congelado en el estado de las features 22-25
  («suite 158/158», «feature 25 in_progress», líneas 27-36).
- **A8. Resto de docs OK:** `docs/conventions.md`, `docs/verification.md`,
  `docs/dependencies.md` y `README.md` reflejan la realidad (verificados;
  el historial los alineó en la feature 23 y 29/30 los amplió).
- **A9. Sin desviaciones de estándares en `src/`:** ningún `.astro` tiene
  `<style>` ni `style=`, ninguna hoja tiene hex/rgba sueltos (audit de la
  feature 12 lo garantiza), ningún archivo supera 100 líneas salvo
  `htb-profile-repository.ts` (106), los repos JSON usan loader inyectable
  (31), `prerenderEnvironment: 'workerd'` + fallback `cloudflare:workers`
  (32), `wrangler.jsonc` con flags correctos (32). El único componente con
  lógica en frontmatter permitida es `[id].astro` (resolución de la 24).
- **A10. Datos `hero-cards.json`:** `gridColumn/gridRow/rotate/scale/iconWidth`
  duplican valores hardcodeados en `hero-card.css` (por `[data-color-token]`)
  y no se consumen desde la UI — contrato fijado por REQ-06-02/REQ-09-03
  (tests los exigen) → **se dejan intactos**, documentado para no tocarlos.

## 5. Decisiones de granularidad y numeración

**Numeración:** las features nuevas arrancan en **33** (historial llega a 32;
los artefactos permanentes `progress/impl_<N>_*.md`, `progress/review_<N>_*.md`
y los specs históricos en git usan 1-32; además `tests/` referencian
`specs/21_*` y `specs/24_*`). El arnés selecciona la `pending` de menor id →
**33 será la primera implementable**.

**Granularidad (6 features, una por problema cohesivo):**

| id | name | Qué | Capas | depends_on |
|---|---|---|---|---|
| 33 | `htb-profile-repository-restore` | Contrato canónico del repo HTB (fetch inyectable, sin console.*, ≤100 líneas, errores nombrados intactos) | dominio | — |
| 34 | `htb-section-degradation-restore` | Restaurar `{profile && ...}` en el template de la sección HTB | UI/componente | [33] |
| 35 | `specs-historico-restore` | Restaurar specs 21/24 (únicas leídas en runtime) + actualizar REQ-21-06 del test para no depender del backlog nuevo | arnés | — |
| 36 | `posts-navigation-fix` | Bug de navegación: entidad Post con id+slug, repo los entrega, cards enlazan `/posts/${post.id}`, `[id].astro` empareja por id | dominio + UI | — |
| 37 | `visual-polish-refactor` | Pulido estético: markup muerto, ancla vacía, aria-current/focus-visible, indentación, encabezado de sección, espaciado HTB, viewport | UI/estilos | [34, 36] |
| 38 | `docs-harness-alignment` | Alinear docs/architecture.md (global.css→tokens.css) y CHECKPOINTS.md sin referencias obsoletas | docs | — |

Orden de implementación del arnés: **33 → 35 → 36 → 38 → 34 → 37**.

**Cambios de tests REQUERIDOS por las features (documentados, con justificación):**

1. `tests/posts-repository.test.mjs` (feature 36): la entidad gana `id`/`slug`
   → `REAL_ENTRY` necesita `slug: '00-agilismo'` y `EXPECTED_POST` los dos
   campos nuevos (REQ-07-01/02 se extienden, no se rompen).
2. `tests/latest-articles-restore.test.mjs` REQ-20-06 (feature 36): la
   prohibición de enlaces `/posts` era transitoria (Decisión 3 de la feature
   20, revocada por la petición del humano) → se actualiza de «ausencia» a
   «presencia» del enlace `/posts/${post.id}`.
3. `tests/ssr-cloudflare-align.test.mjs` REQ-21-06 (feature 35): el backlog
   nuevo no puede contener la feature 21 (la limpieza manual del humano lo
   impide y el historial vive en `progress/history.md`) → el test verifica la
   excepción de dependencias contra la spec restaurada + `docs/dependencies.md`.
4. Los tests HTB **no se tocan** (contrato correcto; se restaura el código).
5. `tests/view-transitions.test.mjs` y `tests/article-card-images.test.mjs`
   siguen en verde sin cambios (los regex `img-${post.id}`/`title-${post.id}`
   siguen casando; `post.id` ahora existe).

**Restauración de specs: alcance acotado a 21 y 24** (las únicas que los tests
leen en runtime). Las specs 01-20, 22-23, 25-32 permanecen como historial en
git (`0b7f359^`) y en los artefactos `progress/impl_*`/`review_*`; restaurarlas
todas no aporta valor al arnés y la limpieza fue decisión explícita del humano.
Si el humano quiere el historial completo de specs en disco, será una petición
separada.

## 6. Features dadas de alta (33-38) — resumen

Trazabilidad REQ → acceptance en `specs/<NN>_<name>/requirements.md` y
`feature_list.json` (acceptance convertibles en test, test-first).

- **33 `htb-profile-repository-restore`** (REQ-33-01..07): fetch inyectable
  como 3er argumento (default = fetch global), token solo en Authorization,
  HtbProfileDataError en los 4 modos de fallo, sin console.*, ≤100 líneas,
  getProfileOrNull degradada a null. Cierra 7 fallos de la suite.
- **34 `htb-section-degradation-restore`** (REQ-34-01..06 + design.md):
  `{profile && ...}` en el template, N/D por campo ausente cuando hay perfil,
  sin lógica ni console.* en el frontmatter, ≤100 líneas. Cierra 2 fallos.
- **35 `specs-historico-restore`** (REQ-35-01..05): specs 21 (REQ-21-01..06) y
  24 (REQ-24-01..05 + design.md) restauradas con formato EARS; test REQ-21-06
  actualizado contra spec + registro de dependencias; suite al 100 %. Cierra
  2 fallos.
- **36 `posts-navigation-fix`** (REQ-36-01..08 + design.md): entidad Post con
  `id`+`slug` readonly; repositorio entrega id (entry.id) y slug (data.slug),
  lanza PostsDataError sin slug; cards enlazan `/posts/${post.id}` con estados
  hover/focus; `[id].astro` empareja por id con error nombrado; pares
  transition:name coherentes con ids reales.
- **37 `visual-polish-refactor`** (REQ-37-01..08 + design.md): eliminar
  `.hero-noise`/`.hero-flower`, ancla vacía de HeroCard, `aria-current` +
  `focus-visible` con tokens, indentación 2 espacios uniforme, encabezado
  «Últimos artículos», espaciado vertical HTB, viewport `initial-scale=1`;
  sin hex/rgba sueltos y ≤100 líneas.
- **38 `docs-harness-alignment`** (REQ-38-01..04): architecture.md referencia
  `src/styles/tokens.css` (no global.css); CHECKPOINTS.md sin referencias
  obsoletas; sin tokens prohibidos del kit (REQ-01-05); suite/formato en verde.

## 7. Riesgos y notas para el implementer

- REQ-11-05 (`tests/about-page.test.mjs`) ejecuta un **build real** dentro de
  la suite: cualquier regresión de build se verá ahí (y en `./init.sh`).
- La restauración de `htb-profile-repository.ts` debe respetar el contrato
  exacto de los tests: firma `(token, userId, fetchFn?)`, default `fetch`
  global, `HtbProfileDataError` para los 4 modos, y el comentario de cabecera
  sin `console` (el test 10 lo lee tras quitar comentarios).
- `docs/architecture.md` NO puede contener el token «hero» (REQ-25-06) ni los
  tokens del kit (REQ-01-05) → la corrección de global.css no debe introducirlos.
- `[id].astro` debe seguir ≤100 líneas tras el emparejado por id y conservar
  `prerender = true`, `Layout`, `params: { id: entry.id }`.
- La card de `latest-articles` debe conservar `latest-articles__image` con
  `alt={post.title}`/`loading="lazy"` y el primer `<h2>` con
  `transition:name={`title-${post.id}`}` (regex de REQ-24-03 sobre el primer
  match del archivo).
- `feature_list.json` ya validado por `scripts/check-format.mjs` tras el alta
  (verificado en esta sesión: FORMATO ✔).
