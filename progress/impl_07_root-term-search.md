# Informe de implementación — feature 7 root-term-search

Fecha: 2026-08-18. Rol: implementer. Feature: 7 — root-term-search
("Búsqueda por término en la raíz: /loquesea filtra el catálogo con deep
linking"). Spec: specs/07_root-term-search/ (REQ-07-01..11, design.md
Decisiones 1-6). Análisis: progress/research/arquitectura-404-route.md.
Estado al iniciar: pending → in_progress (feature_list.json). NO marcada done
(el APPROVED del reviewer la cierra).

## Estado inicial

- Suite 360/360 en verde; features 1-6 done. `src/pages/search.astro`
  (prerendered, índice embebido), `src/components/search-results/`
  (search-results.astro + search-results-controller.ts de 98 líneas con
  queryTerm/removeQueryParam/pageLabel/cardHtml/initSearchResults) y
  `src/styles/search-results.css` existentes y REUTILIZADOS.
- No existían: src/pages/[...term].astro, term-route.ts,
  tests/root-term-search.test.mjs. El controlador solo leía `?q=` y el
  limpiar eliminaba el parámetro q (REQ-03-08).

## Ciclo rojo/verde (test-first)

1. Tests escritos PRIMERO: tests/root-term-search.test.mjs (21 tests, patrón
   mixto del arnés: unitarios por import directo de las funciones puras
   nuevas — termFromPathname, clearDestination — + wiring con DOM fake de
   initSearchResults + inspección por regex sobre [...term].astro y el
   controlador compartido).
2. ROJO capturado (módulos inexistentes):

   ```
   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
   '...src\components\search-results\term-route.ts' imported from
   ...tests\root-term-search.test.mjs
   # tests 1
   # pass 0
   # fail 1
   ```

   (exit 1; 0 pass / 1 fail). Fallo intermedio corregido: los tests de wiring
   que invocaban el handler de limpiar tras retirar los globals de node:test
   (`window is not defined`) — el helper initWith ahora expone fireClear()
   (ejecuta el click con los globals instalados) y cleanup() (los retira al
   terminar) → 21/21.
3. VERDE (feature): `node --test tests/root-term-search.test.mjs` →
   `# tests 21 / # pass 21 / # fail 0`.

## Archivos creados/modificados

| Archivo | Líneas | Rol |
|---------|--------|-----|
| src/pages/[...term].astro (NUEVO) | 31 | Catch-all en la raíz on-demand (`export const prerender = false`, REQ-07-01/02) |
| src/components/search-results/term-route.ts (NUEVO) | 33 | Funciones puras de la ruta por término (REQ-07-03/10) |
| src/components/search-results/search-results-controller.ts (MODIFICADO, aditivo) | 100 | Deriva el término del pathname cuando no hay ?q=; limpiar navega a la raíz en la ruta dinámica |
| tests/root-term-search.test.mjs (NUEVO) | 394 | 21 tests REQ-07-01..11 (unitarios + wiring + inspección; exento de la regla de 100 líneas, precedente del arnés) |

Modificados además: feature_list.json (feature 7 → in_progress),
progress/current.md (bitácora). NO se tocaron: search.astro, search-results.astro,
search-results.css, search-bar (feature 4), search-live (feature 5),
search-escape (feature 6), posts/[id].astro, index.astro, dominio
src/domain/search/, Layout.astro.

## Firmas de la API nueva (cambios aditivos)

En `src/components/search-results/term-route.ts`:

- `termFromPathname(pathname: string): string` — extrae el término de
  /<término>: decodifica (decodeURIComponent), quita slashes iniciales y
  finales, normaliza multi-segmento (slashes → espacios, p. ej.
  '/search/foo' → 'search foo'); '/search' y '/search/' devuelven '' (la
  vista dedicada sin q sigue mostrando la guía, REQ-03-03). Encoding
  malformado (p. ej. '/%E0%A4%A') se degrada al pathname crudo sin
  decodificar: la página nunca rompe por la URL (errores explícitos solo en
  el dominio de datos).
- `clearDestination(pathname: string): string` — en /<término> no hay
  parámetro q que quitar: limpiar navega a la raíz '/'. En /search (sin
  término) devuelve el propio path (no-op defensivo, nunca visible: el
  botón de limpiar solo existe en el empty state).

En `src/components/search-results/search-results-controller.ts` (firmas
existentes intactas: queryTerm, removeQueryParam, pageLabel, cardHtml —
search-dedicated-view.test.mjs, search-live.ts y search-escape.ts siguen
importándolas sin cambios):

- `initSearchResults(): void` — ahora `const q = queryTerm(window.location.search)`
  y `const term = q !== '' ? q : termFromPathname(window.location.pathname)`;
  `wireClear(document.title, q !== '')` recibe el origen del término.
- `wireClear(baseTitle: string, fromQuery: boolean): void` — fromQuery=true:
  comportamiento REQ-03-08 intacto (removeQueryParam + replaceState);
  fromQuery=false (ruta /<término>): `window.location.assign(clearDestination(...))`
  → navega a la raíz (REQ-07-10).

## Decisiones de extracción del término (pathname vs q)

- **q gana cuando existe** (REQ-07-11): /search?q= conserva exactamente su
  comportamiento; el pathname solo se usa si q está ausente o vacío.
- **Multi-segmento**: '/foo/bar' → término 'foo bar' (slashes → espacios)
  tras quitar slashes iniciales/finales; '/search/foo' → 'search foo' →
  empty state (documentado en el research §2; nunca rompe).
- **Decodificación**: decodeURIComponent con degradación segura ante URIError
  (UTF-8 malformado); '/agilismo%20detallado' → 'agilismo detallado'.
- **'/search' sin q → ''** → guía (protege REQ-03-03: el controlador
  compartido no deriva 'search' como término en la vista dedicada).

## Decisión de limpiar → raíz

En /<término> no existe parámetro que quitar: la acción "Limpiar búsqueda"
navega a `/` (portada) vía `window.location.assign` (REQ-07-10, design.md
D5). En /search?q= sigue como REQ-03-08 (remover q + replaceState). El
destino es una función pura (clearDestination) testeable; el wiring usa DOM
nativo sin dependencias ni imports de módulos virtuales (node:test directo).

## Cómo sirve la página [...term].astro (REQ-07-01..08)

- `export const prerender = false` (on-demand; en output 'server' el default
  ya es on-demand, se declara por claridad — design.md D2; precedente HTB
  stats). Sin getStaticPaths: términos arbitrarios no enumerables.
- Frontmatter idéntico al patrón de search.astro (design.md D3): PostsRepository
  + getCollection('architecture') + buildSearchIndex(posts, bodies); índice
  serializado en `<script type="application/json" id="search-index"
  is:inline set:html={indexJson}>` con escape `<\/script` (`'<\\/script'` en
  fuente, idéntico byte a byte a search.astro/index.astro). El servidor nunca
  filtra: el cliente extrae el término del pathname (REQ-07-03).
- Título: `const term = termFromPathname(`/${Astro.params.term ?? ''}`)` y
  `<Layout title={`Búsqueda: ${term}`}>` — REQ-07-07 con la MISMA
  normalización que el cliente (sin mismatch en multi-segmento); el
  controlador además actualiza document.title al cargar.
- Presentación: `<SearchResults />` (componente canónico de la feature 3,
  REQ-07-08) + Layout.astro. Sin `<style>`, sin CSS nuevo, sin tokens nuevos
  (reutilización total de search-results.css).
- REQ-07-09: la prioridad de rutas de Astro (estáticas y /posts/[id] ganan al
  catch-all) se verifica con el test de inspección de archivos existentes;
  /foo/bar multi-segmento cae en el catch-all → empty state (documentado).

## Evidencia del VERDE

- Feature: `node --test tests/root-term-search.test.mjs` → `# tests 21 /
  # pass 21 / # fail 0`.
- Suite completa: `bash -c "pnpm test"` → `# tests 381 / # pass 381 /
  # fail 0` (360 previos + 21 nuevos; search-dedicated-view.test.mjs y
  search-landing-live-transition.test.mjs intactos y en verde — los cambios
  del controlador son aditivos y su API pública no cambió).
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json,
  progress/current.md, specs/ y docs/dependencies.md correctos`.
- `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
  tokens.css en src/styles`.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está
  perfecto. Podemos empezar a trabajar.` (incluye `pnpm build`).
- Build on-demand verificado: NO existe `dist/client/arquitectura/index.html`
  (la ruta la sirve el worker; el bundle de servidor vive en `dist/server`);
  las rutas estáticas siguen generadas (`dist/client/search/index.html`,
  `dist/client/about/index.html`, `dist/client/posts/00-agilismo/index.html`).

## Confirmación ≤100 líneas

src/pages/[...term].astro 31 · search-results-controller.ts 100 ·
term-route.ts 33. El test (394 líneas) sigue el precedente del arnés
(search-dedicated-view 352, search-landing-live-transition 380): la regla de
100 líneas aplica a código de src/, no a tests de inspección.

## Notas

- JS de runtime justificado: deep linking client-side (mecanismo de la
  feature 3) sobre índice embebido; sin frameworks ni dependencias; lógica
  en .ts separado (regla 8), funciones puras sin document/window en ámbito
  de módulo.
- La barra de búsqueda (feature 4) y /search?q= no se tocan (design.md D6,
  REQ-07-11): ambas formas de URL coexisten y producen los mismos resultados.
- Feature 8 (architecture-nav-link, depends_on 7) podrá enlazar a
  /arquitectura cuando esta feature reciba el APPROVED.