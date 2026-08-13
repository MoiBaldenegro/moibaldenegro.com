# Informe de implementación — feature 24 `view-transitions` (2026-08-12)

Canalización de View Transitions como feature con spec: `ClientRouter` de
`astro:transitions` en el layout (REQ-24-01), pares `transition:name` en las
cards de `latest-articles` (REQ-24-03), excepción a "Estático por defecto"
documentada (REQ-24-04) y verificación por inspección del estado final
(REQ-24-05), incluida la **resolución de `src/pages/posts/[id].astro`**
(adaptación a `PostsRepository`, prioridad del arnés: desbloquea el build).

## Ciclo rojo

Contrato: `tests/view-transitions.test.mjs` (REQ-24-01..05 contra
`specs/24_view-transitions/requirements.md` y `design.md`), escrito antes de
tocar `src/`. Rojo capturado (2026-08-12):

```
$ node --test tests/view-transitions.test.mjs
ok 1 - REQ-24-01: el layout importa ClientRouter de astro:transitions
ok 2 - REQ-24-01: ClientRouter se renderiza en la cabecera del layout
not ok 3 - REQ-24-03: la imagen de la card lleva el par img-${post.id}
not ok 4 - REQ-24-03: el título de la card lleva el par title-${post.id}
ok 5 - REQ-24-04: el design documenta la excepción de JavaScript de runtime
not ok 6 - REQ-24-05/Resolución: [id].astro usa PostsRepository y no markdownPostRepository
not ok 7 - REQ-24-05/Resolución: getStaticPaths genera params con el id real de la ruta
not ok 8 - REQ-24-05/Resolución: la página de detalle declara los pares coherentes con las cards
ok 9 - REQ-24-05: la página de detalle respeta convenciones (layout, prerender, ≤100 líneas)
# pass 4
# fail 5
```

La parte REQ-24-01 ya estaba satisfecha (el `ClientRouter` fue añadido
manualmente por el usuario y esta feature lo canaliza); los 5 rojos son
exactamente los huecos del estado canalizado: cards sin `transition:name` y
resolución de `[id].astro` pendiente.

## Ciclo verde

Implementación (solo lo que ordena la spec 24 + la resolución canalizada por
el líder):

1. **`src/components/latest-articles.astro`** — reincorpora los pares del
   design (Decisión 2): `transition:name={`img-${post.id}`}` en la imagen y
   `transition:name={`title-${post.id}`}` en el `h2`. Resto del contrato de la
   feature 20 intacto (entidad `Post`, sin enlaces `/posts`).
2. **`src/pages/posts/[id].astro`** — resolución completa (ver abajo).
3. **`tests/latest-articles-restore.test.mjs`** — el aserto transitorio
   REQ-20-06 ("sin atributos transition:name") se relaja a la prohibición del
   enlace `/posts` únicamente: REQ-20-06 de la spec 20 es transitorio
   ("WHERE ... el mecanismo de transiciones se canaliza en la feature 24") y
   el design 24 (Decisión 4) ordena la reincorporación; se conserva la
   prohibición del enlace muerto. Comentario del test actualizado.
4. **`wrangler.jsonc` + `astro.config.mjs`** — fix de build expuesto (ver
   "Hallazgo" más abajo).

```
$ node --test tests/view-transitions.test.mjs
# pass 9     # fail 0      → view-transitions 9/9

$ node --test tests/latest-articles-restore.test.mjs
# pass 8     # fail 0      → contrato feature 20 intacto (REQ-20-06 relajado)

$ pnpm test
# tests 190  # pass 190    # fail 0   → SUITE COMPLETA EN VERDE (primera vez en el ciclo)
```

## Cobertura REQ-24-XX

| REQ | Qué exige | Cómo se cumple | Verificado por |
|-----|-----------|----------------|----------------|
| REQ-24-01 | Layout habilita transiciones; cabecera con `ClientRouter` de `astro:transitions` | `Layout.astro` ya lo importa y renderiza en `<head>` (añadido manual; ahora canalizado) | tests 1-2 |
| REQ-24-02 | Mecanismo canalizado; sin ediciones manuales fuera del arnés | Spec + design + tests cubren el estado final del mecanismo (layout, cards y página de detalle) | tests 1-9 |
| REQ-24-03 | LatestArticles lleva los pares del design (`img-${post.id}` / `title-${post.id}`) | Reincorporados en el componente tras la restauración de la 20 | tests 3-4 |
| REQ-24-04 | Excepción "Estático por defecto" documentada en el design | `design.md` Decisión 3 (API declarativa, sin JS manual, coste limitado a páginas con `transition:*`) | test 5 |
| REQ-24-05 | Test verifica el estado final por inspección | Inspección de Layout, componente y `[id].astro` (imports, params, pares, prerender, ≤100 líneas) | tests 6-9 |

Sin tokens nuevos: `tokens.css` intacto (96/100 líneas); sin dependencias
nuevas (`astro:transitions` es del framework). Sin regla CSS nueva: el design
permite la animación por defecto del framework cuando la duración del token no
aplica; no hay REQ que ordene regla `view-transition-*`.

## Resolución de `src/pages/posts/[id].astro` (canalizada por el líder)

- **Decisión**: adaptar a `PostsRepository` (la spec 24 no ordena eliminarla;
  es el cauce natural declarado por el líder y la contraparte de los pares de
  las cards). Eliminarla habría descartado trabajo deliberado del usuario.
- **Forma**: `getStaticPaths` obtiene las entidades con `new
  PostsRepository().getPosts()` (validación con `PostsDataError` incluida) y
  las entradas de la colección con `getCollection("architecture")` — el
  render del cuerpo markdown requiere la entrada (`render(entry)`), que el
  repositorio no puede entregar porque la entidad `Post` no expone id ni
  cuerpo (REQ-07-01, features 7/18 cerradas). Emparejamiento por índice con
  guard explícito (`entries.length !== posts.length` → error, no fallo
  silencioso, regla 3) — ambas llamadas iteran la misma colección en el mismo
  build. `params: { id: entry.id }`; `prerender = true`; pantalla desde la
  entidad; `<Content />` desde el entry.
- **Rutas reales generadas por el build**: `/posts/00-agilismo` y
  `/posts/01-diseño-detallado` (el glob loader deriva `entry.id` del `slug`
  del frontmatter; coincide con los artefactos `dist/client/posts/` del
  usuario).
- **Coherencia de los pares**: la página de detalle declara los mismos pares
  del design resueltos contra el id real de la ruta:
  `transition:name={`title-${entry.id}`}` y `transition:name={`img-${entry.id}`}`
  (emiten `title-00-agilismo` / `img-00-agilismo`, verificados en el HTML
  prerenderizado). Las cards conservan la expresión literal del design
  (`post.id`), que hoy no se resuelve porque la entidad `Post` no expone id:
  los atributos son inertes (las cards no son enlaces — REQ-20-06; la spec 24
  no ordena re-añadir el enlace). Cuando la entidad exponga el id (feature
  futura), ambos lados emitirán nombres idénticos por artículo.
- **≤100 líneas**: 37 líneas; sin `<style>`, sin `style=`, sin lecturas de
  archivo directas.

## Hallazgo canalizado (enmascarado hasta esta feature)

Con `[id].astro` resuelta, el build avanzó por primera vez hasta el
prerender y **expuso un defecto de integración previo**: el prerenderer
workerd por defecto del adapter `@astrojs/cloudflare` (feature 21) no tiene
`node:fs`, que los repositorios JSON (feature 19) importan a nivel de módulo:
`No such module "node:fs"` y, tras habilitar el módulo, `hero.json: no se
pudo leer el perfil desde "/bundle/src/data/hero.json"` (`process.cwd()` del
bundle ≠ raíz del proyecto). El fallo de `[id].astro` (MISSING_EXPORT) había
enmascarado ambos. **Fix mínimo y canónico** (el propio WARN de Vite lo
sugiere; respeta el supuesto de research D2/feature 19 —"node:fs solo en
build, entorno Node"—): `nodejs_compat` en `compatibility_flags` de
`wrangler.jsonc` y `prerenderEnvironment: 'node'` en el adapter
(`astro.config.mjs`). No se tocan los repositorios ni sus tests (REQ-19
intactos: 190/190 en suite). **Afecta al contrato de las features 19/21**: el
líder coordina el re-review si procede.

## Verificación final completa

```
$ pnpm test                      → # tests 190 # pass 190 # fail 0
$ node scripts/check-format.mjs  → FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos
$ node scripts/audit-design-tokens.mjs → AUDIT ✔ ningún color fuera de tokens.css en src/styles
$ pnpm build                     → prerendering static routes:
                                     /about/index.html (+11ms)
                                     /posts/00-agilismo/index.html (+5ms)
                                     /posts/01-diseño-detallado/index.html (+3ms)
                                     /index.html (+9ms)
                                   ✓ Completed / Server built in 998ms / Complete!
$ ./init.sh                      → ✔ tests al 100% (node:test)
                                     ✔ build de producción (pnpm build)
                                     ✔ El entorno está perfecto.
```

**Build en VERDE por primera vez en todo el ciclo 18-24** (objetivo de cierre
del refactor completo).

## Archivos tocados

- `tests/view-transitions.test.mjs` — NUEVO (contrato REQ-24-01..05).
- `src/components/latest-articles.astro` — pares `transition:name` (30 líneas).
- `src/pages/posts/[id].astro` — resolución a `PostsRepository` (37 líneas).
- `tests/latest-articles-restore.test.mjs` — REQ-20-06 relajado a enlace `/posts` (transición reincorporada por design 24).
- `wrangler.jsonc` — `nodejs_compat` en `compatibility_flags` (fix de build expuesto).
- `astro.config.mjs` — `prerenderEnvironment: 'node'` en el adapter (fix de build expuesto).
- `progress/current.md`, `feature_list.json` (status `in_progress`) — arnés.

NO tocados: entidad/repositorios de posts (18), repos JSON (19), layout ya
canalizado (REQ-24-01 presente), tokens.css (96/100 intacto), features 14-17,
20-23 (salvo el relajamiento transitorio REQ-20-06 explicado), kit/docs.

## Ronda 2 (2026-08-12) — cambio requerido por el reviewer aplicado

`progress/review_24_view-transitions.md` → Veredicto CHANGES_REQUESTED (1
cambio). Aplicado SOLO ese cambio en `src/pages/posts/[id].astro`:

- El `<main>` interior que envolvía `<Content />` (línea 33, cierre 35) pasa a
  `<section>`: era descendiente del `<main>` de la línea 28 y la especificación
  HTML prohíbe `main` dentro de `main` (violaba el marcado semántico de
  `docs/conventions.md`). Cierre ajustado en la misma edición; sin otros
  cambios (ni tests, ni layout, ni rutas).

Verificación tras la corrección:

```
$ node --test tests/view-transitions.test.mjs   → # pass 9  # fail 0
$ node scripts/check-format.mjs                 → FORMATO ✔
$ ./init.sh                                     → ✔ tests al 100% (190/190)
                                                   ✔ build de producción
                                                   ✔ El entorno está perfecto.
```