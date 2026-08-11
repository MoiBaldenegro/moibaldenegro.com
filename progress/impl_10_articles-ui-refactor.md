# Informe de implementación — feature 10 articles-ui-refactor

- **Feature:** 10 — articles-ui-refactor (Conectar LatestArticles al PostsRepository con estilos propios)
- **Implementer:** agente implementador (sesión 2026-08-10)
- **Spec:** `specs/10_articles-ui-refactor/requirements.md` (REQ-10-01..04) y `specs/10_articles-ui-refactor/design.md` (Decisiones 1-3, tabla de tokens)
- **Estado final:** implementada, suite en verde. Pendiente de reviewer (lo lanza el líder).

## Ciclo rojo/verde (test-first, evidencia)

### ROJO — antes de implementar

Test escrito primero: `tests/articles-ui-refactor.test.mjs` contra REQ-10-01..04 y design.md. Ejecutado con el componente original (importaba `getCollection` de `astro:content`, sin hoja de estilos):

```
# Subtest: REQ-10-01: LatestArticles obtiene los artículos desde PostsRepository
not ok 1 - ... error: 'latest-articles.astro no importa PostsRepository (REQ-10-01)'
# Subtest: REQ-10-04: el componente no importa astro:content directamente
not ok 2 - ... error: 'latest-articles.astro importa astro:content directamente (REQ-10-04)'
# Subtest: REQ-10-02: latest-articles.css existe y es importada por el componente
not ok 3 - ... error: 'latest-articles.astro no importa ../styles/latest-articles.css (REQ-10-02)'
# Subtest: REQ-10-03: latest-articles.css no supera 100 líneas
not ok 5 - ... error: 'src/styles/latest-articles.css no existe (REQ-10-02/03)'
...
# tests 6  # pass 2  # fail 4
```

Los 4 fallos son exactamente los criterios de la feature (sin repositorio, importa `astro:content` — falla como exige REQ-10-04 —, sin hoja de estilos, sin css en disco). Los 2 ok eran invariantes ya cumplidos (marcado semántico con `#{tag}` y ≤100 líneas del componente).

### VERDE — después de implementar

Test de la feature:

```
tests/articles-ui-refactor.test.mjs → # tests 9  # pass 9  # fail 0
```

Suite completa (`node --test "tests/**/*.test.mjs"`):

```
# tests 69  # pass 69  # fail 0  # duration_ms 173
```

Formato (`node scripts/check-format.mjs`):

```
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos
```

Build (`pnpm build`):

```
[vite] ✓ built ...  generating static routes  ├─ /index.html (+14ms)
[build] 1 page(s) built in 789ms
[build] Complete!
```

`./init.sh` (Git Bash) — 8/8 comprobaciones verdes:

```
✔ node instalado  ✔ gestor de paquetes instalado (pnpm)  ✔ dependencias instaladas
✔ AGENTS.md existe  ✔ feature_list.json existe  ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md  ✔ tests al 100% (node:test)  ✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

Verificación de renderizado en `dist/index.html` (extraído con regex de la sección):

```html
<section class="latest-articles"><div class="latest-articles__list"><article class="latest-articles__card">
<h2 class="latest-articles__title">Agilismo, diseño y fragilidad</h2>
<p class="latest-articles__meta">Por Moises Baldenegro Melendez • 15 min de lectura</p>
<p class="latest-articles__description">En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.</p>
<div class="latest-articles__tags"><span class="latest-articles__tag">#arquitectura</span>
<span class="latest-articles__tag">#agilismo</span><span class="latest-articles__tag">#software-design</span></div>
</article></div></section>
```

Título, autor, tiempo de lectura, descripción y tags con `#` renderizados desde la entidad Post del repositorio.

## Archivos creados/modificados

| Archivo | Acción | Por qué |
|---|---|---|
| `tests/articles-ui-refactor.test.mjs` | Creado (test-first) | Verifica REQ-10-01 (importa PostsRepository y usa getPosts()), REQ-10-04 (falla si el componente importa `astro:content` o usa `getCollection`), REQ-10-02 (hoja importada y en disco), REQ-10-01 Decisión 1 (marcado semántico article/h2/p/span con post.title/author/readtime/description/tags y "min de lectura"), REQ-10-03 (≤100 líneas, sin hex/rgba, colores/radios/transiciones con var(), los 8 tokens del design.md) y convención (componente ≤100 líneas, sin lógica, sin estilos embebidos) |
| `src/components/latest-articles.astro` | Reescrito | Frontmatter solo imports + `const posts = await new PostsRepository().getPosts()`; sección `latest-articles` con tarjeta `latest-articles__card` (h2 título, p meta "Por {author} • {readtime} min de lectura", p descripción, div de spans `#{tag}`); cero `astro:content` en la UI (REQ-10-04). 24 líneas |
| `src/styles/latest-articles.css` | Creado | Hoja propia del componente (REQ-10-02/03): BEM ligero (`latest-articles`, `__list`, `__card`, `__title`, `__meta`, `__description`, `__tags`, `__tag`), 62 líneas, solo tokens; media query móvil al final |

## Tokens usados (design.md, tabla)

- `--color-surface` — fondo de tarjeta
- `--color-text` — título y descripción
- `--color-text-secondary` — metadatos
- `--color-border` / `--color-border-strong` — borde de tarjetas y tags
- `--color-accent` — tags (y hover de tarjeta)
- `--radius-card` — radios de tarjeta
- `--gap-card` — espaciado de la lista
- `--transition-default` — transiciones
- `--container-max` — contenedor (patrón `min(var(--container-max), 95%)` del sitio)

Sin valores hex/rgba hardcodeados (verificado por test REQ-10-03).

## Decisiones y desviaciones

- **Sesión concurrente (disco = fuente de verdad):** durante el ciclo, una sesión concurrente refinó en disco el test (de 6 a 9 tests, añadiendo verificación de los 8 tokens del design.md), el componente (wrapper `latest-articles__list`) y la hoja (paddings/radios de tag con `--radius-pill`, hover con `--color-accent`). El estado en disco es consistente con la spec y pasa 9/9 + suite 69/69 + build + init.sh; se conserva tal cual (patrón ya registrado en features 5-9). No hay desviaciones de alcance: no se tocó dominio (5-7), hero (2-4, 9), layout (8), pages (11) ni arnés (1, 12-13).
- **Comportamiento de tags preservado:** los tags se renderizan con prefijo `#{tag}` (como hacía el componente original), ahora desde la entidad (`post.tags` ya es arreglo sin #).
- **PostsRepository en build estático:** el `await import('astro:content')` dinámico del repositorio (feature 7) resuelve correctamente en el prerender; el build genera `/index.html` sin errores.
- Feature 10 mantiene `status: "in_progress"` en `feature_list.json` (el cierre lo gestiona el líder tras el APPROVED del reviewer).