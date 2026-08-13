# Review — feature 24 `view-transitions`

**Veredicto:** CHANGES_REQUESTED
**Revisado en disco:** 2026-08-12 · reviewer

## Cierre del refactor — confirmación EXHAUSTIVA (reproducida por el reviewer)

| Verificación | Resultado | Evidencia |
|---|---|---|
| `./init.sh` | ✔ **"El entorno está perfecto"** — 0 comprobaciones fallidas | salida completa reproducida; primer init.sh verde del ciclo 18-24 |
| `pnpm test` | ✔ **190/190** (# tests 190, # pass 190, # fail 0) | salida reproducida — suite completa en verde por primera vez en el ciclo |
| `pnpm build` | ✔ Complete; prerendered static routes: `/about`, `/posts/00-agilismo`, `/posts/01-diseño-detallado`, `/index.html` | salida reproducida; `dist/client/` (index, about/, posts/00-agilismo, posts/01-diseño-detallado, _astro, assets) + `dist/server/` (entry.mjs, chunks, wrangler.json) presentes |
| `[id].astro` sin `markdownPostRepository` | ✔ grep en `dist/client/posts/*/index.html` → 0 coincidencias (exit=1) | artefacto de build limpio |
| Pares reales de la página de detalle | ✔ `view-transition-name: img-00-agilismo` y `title-00-agilismo` en el HTML prerenderizado | coherentes con los ids reales de ruta |
| `node --test tests/view-transitions.test.mjs` | ✔ 9/9 | salida reproducida |
| `node --test tests/latest-articles-restore.test.mjs` | ✔ 8/8 | contrato feature 20 intacto (REQ-20-06 relajado solo en transition:name, prohibición del enlace /posts conservada — amparado por el WHERE de la spec 20: "el mecanismo de transiciones se canaliza en la feature 24" y design 24 Decisión 4) |
| Contratos 18/19/21/22 | ✔ repos 24/24 · ssr-cloudflare 7/7 · htb 22/22 | features previas intactas |
| `node scripts/check-format.mjs` | ✔ FORMATO | salida reproducida |
| `node scripts/audit-design-tokens.mjs` | ✔ AUDIT (ningún color fuera de tokens.css en src/styles) | salida reproducida |

## Cobertura REQ-24-XX (tabla con evidencia)

| REQ | Qué exige | Evidencia en disco |
|---|---|---|
| REQ-24-01 | Layout habilita transiciones; cabecera con ClientRouter de astro:transitions | `src/layouts/Layout.astro:5` `import { ClientRouter } from 'astro:transitions'`; `:24` `<ClientRouter />` en `<head>`; 37 líneas, sin `<style>` — tests 1-2 verdes |
| REQ-24-02 | Mecanismo canalizado; sin ediciones manuales fuera del arnés | spec + design + tests cubren el estado final; el ClientRouter preexistente (manual) queda amparado por REQ-24-01 y la excepción documentada — sin ediciones manuales nuevas |
| REQ-24-03 | LatestArticles lleva los pares del design (`img-${post.id}` / `title-${post.id}`) | `src/components/latest-articles.astro:18` `transition:name={`img-${post.id}`}` y `:20` `transition:name={`title-${post.id}`}`; 30 líneas; sin enlace `/posts` (REQ-20-06) — tests 3-4 verdes |
| REQ-24-04 | Excepción "Estático por defecto" documentada | `specs/24_view-transitions/design.md` Decisión 3 (API declarativa del framework, sin JS manual, coste limitado a páginas con `transition:*`) — test 5 verde |
| REQ-24-05 | Test verifica el estado final por inspección | `tests/view-transitions.test.mjs` 9/9: inspecciona Layout, componente y `[id].astro` (imports PostsRepository, params `entry.id`, pares `title-${entry.id}`/`img-${entry.id}`, layout, prerender, ≤100 líneas, sin style/readFileSync) — tests 6-9 verdes |

## Archivos tocados vs alcance permitido

| Archivo | Cambio | Alcance |
|---|---|---|
| `tests/view-transitions.test.mjs` | NUEVO — contrato REQ-24-01..05 | ✔ spec 24 |
| `src/components/latest-articles.astro` | solo los 2 pares `transition:name` (resto del contrato 20 intacto) | ✔ REQ-24-03 |
| `src/pages/posts/[id].astro` | resolución a PostsRepository (37 líneas) | ✔ canalizada por el líder (desbloquea el build) |
| `tests/latest-articles-restore.test.mjs` | REQ-20-06 relajado a prohibición del enlace `/posts` solo | ✔ amparado por WHERE de spec 20 + design 24 Decisión 4 |
| `wrangler.jsonc` | `nodejs_compat` en compatibility_flags | ⚠ hallazgo canalizado (fix de build expuesto) — documentado en impl_24 y current.md; afecta contrato 19/21 → el líder coordina re-review si procede |
| `astro.config.mjs` | `prerenderEnvironment: 'node'` en el adapter | ⚠ hallazgo canalizado (fix de build expuesto) — ídem |
| `tokens.css` | **intacto: 96 líneas, sin tokens nuevos** | ✔ |
| features 14-23 | sin cambios fuera de lo listado | ✔ contratos verificados en verde |

## Pregunta de revisión (test-first)

✔ ¿Test escrito antes que el código y en rojo? — Sí: `impl_24` captura el rojo (4 pass/5 fail: cards sin pares ×2, `[id].astro` con `markdownPostRepository` ×3) antes de tocar `src/`. ¿Suite en verde al final? — Sí, 190/190 reproducido. ¿Dependencias de la feature 24? — `depends_on: [20]`, feature 20 `done` en `feature_list.json` (verificado); ninguna dependencia omitida.

## Cambios requeridos

1. **`src/pages/posts/[id].astro:33` — HTML semánticamente inválido:** el `<main>` interior que envuelve `<Content />` es descendiente del `<main>` de la línea 28 (la especificación HTML prohíbe `main` dentro de `main`; viola "Marcado semántico" de `docs/conventions.md`). Cambio mínimo: sustituir el `<main>` interior (línea 33) por `<section>` (cierre en línea 35). No afecta a los tests (ninguno inspecciona esa etiqueta; suite sigue 190/190), ni a las rutas ni al prerender. Actualizar `progress/impl_24_view-transitions.md` con la corrección.

## Observaciones finales del refactor completo

1. **Cierre del ciclo 18-24:** con esta feature el build queda en verde por primera vez y `./init.sh` termina en "entorno perfecto" — objetivo de cierre cumplido (verificado y reproducido).
2. **Fix de adapter canalizado:** `nodejs_compat` + `prerenderEnvironment: 'node'` son necesarios y canónicos (el propio output de Vite/supuesto de research D2 de la 19 los respaldan), pero tocan el contrato de las features 19/21: el líder decide si abre re-review de 19/21 o lo documenta como enmienda aprobada. Los tests de 19/21/22 pasan (24/24, 7/7, 22/22) con el fix.
3. **Coherencia de pares cards↔detalle:** las cards emiten hoy `img-undefined`/`title-undefined` en el HTML porque la entidad `Post` no expone `id`; los atributos son inertes (sin enlace — REQ-20-06) y el design 24 los define literalmente como `post.id`. Cuando una feature futura exponga `id` en la entidad, ambos lados emitirán nombres idénticos por artículo (`img-00-agilismo`/`title-00-agilismo` ya verificados en detalle). Comportamiento documentado en `impl_24`, sin fuga al build.
4. **Layout y tokens:** `ClientRouter` canalizado (37 líneas, sin `<style>`); `tokens.css` en 96/100 sin tokens nuevos; sin dependencias nuevas (`astro:transitions` es del framework). Excepción "Estático por defecto" aprobada y documentada en el design (REQ-24-04).
5. **Nota menor no bloqueante:** la clase `post__image`/`post__title` de `[id].astro` no tiene hoja de estilos asociada (no hay `post.css`); la imagen de detalle sale a tamaño natural. La spec 24 no ordena estilos de la página de detalle — posible feature futura si el usuario lo pide (precedente feature 17).

---

# Ronda 2 (2026-08-12)

**Veredicto:** APPROVED

## Cambio requerido de ronda 1 — verificado en disco

| Exigencia | Evidencia |
|---|---|
| `[id].astro:33` — el nodo que envuelve `<Content />` es `<section>`, no `<main>` | `src/pages/posts/[id].astro:33` `<section>` + `:35` `</section>` (cierre correcto) |
| `<main class="post">` único en la página | grep en `[id].astro`: 1 `<main>` (línea 28) + 1 `</main>` (línea 37); en el HTML prerenderizado `dist/client/posts/00-agilismo/index.html`: un único `<main class="post">` con `<section>` interior |
| Sin otros cambios fuera del requerido | archivo de 38 líneas (recuento idéntico a ronda 1; cambio 1:1 `<main>`→`<section>` en apertura y cierre); resto del contenido sin diferencias |
| `src/pages/posts/[id].astro` sigue cumpliendo REQ-24-05 | import Layout + PostsRepository, `getStaticPaths` con `params: { id: entry.id }`, `prerender = true`, pares `title-${entry.id}`/`img-${entry.id}`, sin `<style>` ni `style=` ni `readFileSync`/`new URL(` |

## Re-verificación completa (ronda 2, reproducida por el reviewer)

| Verificación | Resultado |
|---|---|
| `node --test tests/view-transitions.test.mjs` | ✔ 9/9 (# tests 9, # pass 9, # fail 0) |
| `./init.sh` | ✔ **"El entorno está perfecto"** — tests al 100% + build de producción OK, 0 comprobaciones fallidas |
| `pnpm test` (suite completa) | ✔ **190/190** (# tests 190, # pass 190, # fail 0) |
| `node scripts/check-format.mjs` | ✔ FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos |
| `node scripts/audit-design-tokens.mjs` | ✔ AUDIT ✔ ningún color fuera de tokens.css en src/styles |
| Pares de transición en detalle prerenderizado | ✔ `view-transition-name: img-00-agilismo` / `title-00-agilismo` en `dist/client/posts/00-agilismo/index.html` |
| `tokens.css` | ✔ intacto, 96 líneas, sin tokens nuevos |
| Contratos features 18-23 | ✔ sin cambios desde ronda 1 (suite completa 190/190 incluye repos 24/24, ssr 7/7, htb 22/22, latest-articles-restore 8/8) |

## Observación de ronda 2

- Confirmado todo lo demás del veredicto de ronda 1: el cierre del refactor 18-24 queda verificado (init.sh perfecto, suite 190/190, build verde con `/posts/00-agilismo` y `/posts/01-diseño-detallado`). El fix de adapter canalizado (`nodejs_compat` + `prerenderEnvironment: 'node'`) sigue en pie y documentado; el líder decide si abre re-review de las features 19/21 por ese motivo, sin impacto en la feature 24.
- Nota de ronda 1 conservada como no bloqueante: clases `post__image`/`post__title` sin hoja (no hay `post.css`) — posible feature futura, fuera del alcance de la spec 24.