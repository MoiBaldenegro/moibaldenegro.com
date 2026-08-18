# Análisis — Búsqueda global con vista dedicada y live search en la Landing

Fecha: 2026-08-18. Ciclo de búsqueda global (feature_list.json regenerado desde
cero, ids desde 1). Rol: spec_author.

## 1. Problema (reafirmación)

El humano pide una funcionalidad de búsqueda global sobre el catálogo de
artículos (`src/content/architecture/*.md`) con tres bloques:

1. **Vista dedicada compartible**: URL que refleje el término (`/search/:arg` o
   `/search?q=...`), deep linking con resultados prefiltrados, coincidencias en
   títulos/contenido/tags, orden descendente por fecha, estado de resultados y
   empty state con sugerencia o botón de limpiar.
2. **Barra de búsqueda en la Landing**: input prominente en header/hero, botón
   X de limpieza con retorno de foco, transición dinámica del layout (query > 0
   → ocultar landing y mostrar resultados en vivo; query === '' → restaurar), y
   Enter → navegación a la ruta de búsqueda (URL copiable).
3. **UX**: paginación o scroll sin romper layout y tecla Escape para limpiar o
   cerrar la búsqueda activa.

Además, el arnés exige alinear el fixture del test del hero al dato real
(único test en rojo, 257/258) como feature 1, siguiendo el precedente REQ-43-06
("el fixture sigue al dato real"), sin tocar `src/`.

## 2. Alcance y límites

- **SÍ**: dominio de búsqueda en TS puro (testeable sin UI), vista `/search`,
  barra en el header del layout, live search en la portada, Escape, fixture
  del test del hero.
- **NO**: tocar `src/data/*.json`, `src/content.config.ts` ni el schema de
  artículos (las fechas `created` quedan como están; la conversión vive en el
  dominio de búsqueda). No se agregan dependencias externas. No se crean
  features para el cambio trivial de `src/styles/hero-card.css` (línea en
  blanco en working tree de un ciclo abortado; el humano confirmó que el
  código es correcto y no afecta ninguna decisión de este ciclo).

## 3. Estado verificado del repo (hechos que condicionan el diseño)

- El proyecto es Astro `output: 'server'` con adapter Cloudflare
  (`astro.config.mjs`), `prerenderEnvironment: 'workerd'`, y **todas las
  páginas actuales declaran `export const prerender = true`**
  (`index.astro`, `posts/[id].astro` con `getStaticPaths`, `about`). Patrón
  establecido: prerender, "node:fs solo en build".
- `Post` (src/domain/entities/post.ts): `id, slug, title, author, img,
  readtime, description, tags (string[]), created, updated`. **`created` es un
  texto en español** (p. ej. `"10 Agosto 2026"`): no es una fecha ISO
  ordenable léxicamente → el dominio de búsqueda debe convertirla.
- `PostsRepository.getPosts()` con loader inyectable (patrón para tests); el
  default envuelve `getCollection('architecture')` (módulo virtual, solo
  build). El cuerpo markdown de cada entrada está disponible como
  `entry.body` en la colección (usado en `[id].astro` vía `render`).
- Catálogo actual: 2 artículos (`00-agilismo.md`, `01-diseño_detallado.md`) →
  el índice embebido en el documento es pequeño (aceptable para el patrón
  cliente). Cero coste notable de payload.
- `ClientRouter` de `astro:transitions` ya está en `Layout.astro` (feature 24):
  hay JS de runtime justificado y precedente de excepción a "estático por
  defecto" (24, 43, 44).
- `tokens.css` está en 87/100 líneas: hay margen para tokens nuevos si fuera
  estrictamente necesario, pero el diseño prefiere reutilizar los existentes
  (`--color-surface`, `--color-border`, `--color-text-secondary`,
  `--color-accent`, `--radius-pill`, `--gap-card`, `--transition-default`,
  `--font-sans`, `--shadow-card`).
- `specs/01..08_*` del intento abortado: eliminadas (estaban vacías). El
  historial permanente (21, 24, 33-44, `_template`) no se toca.

## 4. Decisiones de arquitectura

### D1 — Forma de la URL: `/search?q=<término>` (query param), no `/search/:arg`

Decisión: la vista dedicada es **`src/pages/search.astro` prerendered** que lee
el término del **parámetro de URL `q`** y filtra en el cliente sobre un índice
embebido. El humano aceptó explícitamente ambas formas ("ej. /search/typescript
o /search?q=typescript"); se elige `?q=` por coherencia con el arnés:

- Un segmento de path `/search/:arg` exigiría `getStaticPaths` (imposible:
  términos de usuario no enumerables) u **on-demand SSR** en workerd
  (ver D2). El query param mantiene la página prerendered, 100% compartible y
  con deep linking (al cargar `/search?q=x`, el cliente lee `q` e inicializa
  los resultados prefiltrados).
- El live search de la Landing necesita el índice en el cliente de todas
  formas → el filtrado client-side es el mecanismo único, sin duplicar
  server-rendering.
- `ClientRouter` (view transitions) navega entre `/` y `/search?q=x` sin
  recarga completa; el Enter de la barra actualiza la URL.

Alternativa descartada: `/search/:arg` con SSR on-demand — motivos en D2.

### D2 — Prerender vs on-demand para la vista de búsqueda

Decisión: **prerender** (`export const prerender = true`), con el índice del
catálogo (título, descripción, tags y cuerpo sin markdown por artículo)
serializado en el documento (script `type="application/json"` con escape de
`</`). Justificación:

- Coherente con el patrón del sitio (todas las páginas prerendered; el único
  punto on-demand es HTB stats, feature 20). `getCollection` + `render` se
  usan en build (precedente `[id].astro`), sin node:fs en runtime.
- Un `/search/[arg].astro` on-demand en workerd tendría que acceder a la
  colección y renderizar en runtime por request, rompiendo "node:fs solo en
  build" y añadiendo riesgo en el adapter; además sería redundante porque el
  live search de la Landing ya exige el índice en el cliente.
- El deep linking se satisface: el documento siempre trae el catálogo y el
  cliente filtra por `q` al inicializar (requiere JS — ver D3).

### D3 — JS de runtime en el cliente: excepción justificada a "estático por defecto"

El live search, la transición dinámica del layout (ocultar/mostrar secciones),
el botón X, el Escape y el filtrado por URL **requieren JavaScript de runtime
en el cliente**. Es una excepción explícita a la regla 9 de
docs/architecture.md, en la línea de los precedentes aprobados (24
view-transitions, 43 hero, 44 jank). Se documenta en los `design.md` de las
features 4 y 5 y se materializa como REQ-05-07. Forma: módulos `.ts`
importados desde `<script>` de componentes Astro (bundling nativo, sin
framework nuevo, sin dependencias). Lógica pura exportada en módulos
testeables con node:test (patrón de tests por inspección + import directo de
`.ts`, como hacen `posts-repository.test.mjs` y `hero-profile-repository.test.mjs`).

### D4 — Criterios de coincidencia y normalización

- Coincidencia por **subcadena** del término normalizado en: `title`,
  `description`, `tags` (unidos sin `#`) y cuerpo del artículo (markdown
  sin sintaxis).
- Normalización: minúsculas + sin diacríticos (NFD, quitar marcas) en ambos
  lados → "TypeScript"/"typescript", "diseño"/"diseno" coinciden.
- Campos ausentes se tratan como texto vacío (nunca rompen la búsqueda).
- El resaltado visual del término es **opcional** en la petición: queda fuera
  del alcance de los REQ (se anota como mejora futura en los design.md).

### D5 — Orden descendente por fecha de publicación

`created` es texto español (`"10 Agosto 2026"`): el dominio de búsqueda
convierte día + mes en texto + año a un valor comparable `YYYY-MM-DD`
(función pura testeable). Los resultados se ordenan por ese valor desc;
empates mantienen el orden estable de `sort`.

### D6 — Paginación vs scroll continuo

Decisión: **paginación client-side** con constante `PAGE_SIZE` en el dominio
(funciones puras, testeables sin UI) en la vista dedicada. El panel en vivo de
la Landing muestra los primeros `PAGE_SIZE` resultados + enlace "ver todos" a
la vista dedicada (un panel paginado dentro de la portada sería UX pobre y
complejidad innecesaria). Con 2 artículos hoy la paginación no salta, pero la
función queda cubierta por tests de dominio (test-first).

### D7 — Ubicación de la barra: header del Layout (site-wide)

La petición dice "header o sección hero de la Landing Page"; el header del
sitio vive en `src/layouts/Layout.astro` (único layout, regla 11) y es el
header de la Landing. La barra en el Layout (a) es el header de la Landing,
(b) aparece también en `/search` y en los posts → permite refinar la consulta
desde la vista dedicada sin duplicar componentes. El componente
`SearchBar` (carpeta `src/components/search-bar/`) incluye su módulo `.ts` de
control (lógica separada de la UI, regla 8) y su hoja `src/styles/search-bar.css`.

### D8 — Sincronización Enter → `/search?q=`

La navegación con Enter es comportamiento de la barra (feature 4): con
consulta no vacía navega a `/search?q=<consulta>`; con consulta vacía no
navega. La transición del layout en vivo es de la portada (feature 5) y el
Escape es la feature 6. Separación por capas: barra (input/eventos),
portada (transición), teclado (Escape).

## 5. Descomposición en features

| id | name | Depende de | Justificación |
|----|------|-----------|---------------|
| 1 | hero-test-fixture-align | — | Alinea el fixture del test del hero al dato real (precedente REQ-43-06). Un cambio, un archivo de test, sin `src/` → simple, primero (deja la suite en verde para el ciclo). |
| 2 | search-domain | — | Base de datos/lógica: normalización, coincidencia (título/descripción/tags/cuerpo), orden por fecha (parseo español), paginación, índice. TS puro, testeable sin UI. Base para 3-6. |
| 3 | search-dedicated-view | [2] | Vista `/search?q=` prerendered: deep linking, índice embebido, cuadrícula de resultados, empty state con acción de limpiar, paginación, título con término. Capa UI de la vista. |
| 4 | search-bar-header | [2] | Barra de búsqueda en el header del Layout: input accesible, botón X con retorno de foco, Enter → `/search?q=`, evento de cambio de consulta. Capa UI de la barra (design.md). |
| 5 | search-landing-live-transition | [3, 4] | Transición dinámica del layout en la portada: query > 0 → ocultar secciones y mostrar panel en vivo (reusa presentación de 3); query === '' → restaurar. JS de runtime justificado (design.md). |
| 6 | search-keyboard-escape | [3, 4, 5] | Escape: en portada vacía consulta y restaura; en `/search` limpia consulta y vuelve al estado inicial; con consulta vacía no-op. Interacción de cierre sobre elementos de 3/4/5. |

Orden de implementación (one_feature_at_a_time, menor id primero): 1 → 2 → 3 →
4 → 5 → 6. Sin ciclos ni auto-referencias; cada feature es implementable y
verificable por separado (tests node:test por inspección/dominio).

## 6. Trazabilidad petición humana ↔ features

| Petición del humano | Features |
|---------------------|----------|
| Vista dedicada con URL compartible y deep linking | 3 (REQ-03-01, 03-02) |
| Coincidencias en títulos/contenido/tags | 2 (REQ-02-01..03, 02-07) |
| Orden descendente por fecha | 2 (REQ-02-04, 02-05) |
| Estado resultados + empty state con limpiar | 3 (REQ-03-04, 03-05, 03-08) |
| Barra en header/hero con X y retorno de foco | 4 (REQ-04-01..04, 04-08) |
| Transición dinámica del layout (live search) | 5 (REQ-05-01..03, 05-07) |
| Enter → ruta `/search/:arg` compartible | 4 (REQ-04-05, 04-06) |
| Paginación / scroll sin romper layout | 2 (REQ-02-06) + 3 (REQ-03-06) + 5 (REQ-05-06) |
| Escape limpia/cierra búsqueda | 6 (REQ-06-01..04) |
| Suite en verde (fixture obsoleto, REQ-43-06) | 1 (REQ-01-01..04) |

## 7. Riesgos y notas para el implementador

- **≤100 líneas por archivo**: la vista `/search`, el control de la barra y el
  panel en vivo deben modularizarse (componentes + módulos `.ts`). Si alguna
  pieza excediera el límite se discute (estado blocked), no se fuerza.
- **Escape del JSON embebido**: serializar con `JSON.stringify` y escapar
  `</script` (`<\/script`) para no romper el HTML.
- **Pruebas**: el arnés usa node:test sin navegador → tests de dominio sobre
  módulos `.ts` puros (import directo, precedente existente) y tests de
  inspección por regex sobre `.astro`/`.ts` (patrón de features 21-44). Los
  acceptance de cada feature están redactados para convertirse en tests antes
  de implementar (test-first).
- **Tokens**: usar solo tokens existentes de `tokens.css` (margen 87/100 si
  hiciera falta alguno nuevo, con justificación).
- **hero-card.css**: cambio trivial en working tree (línea en blanco) de un
  ciclo abortado; no genera feature (confirmado por el humano). No afecta
  decisiones.
- **Sin dependencias externas**: no se requieren; el JS de cliente es módulos
  propios y APIs nativas (URLSearchParams, CustomEvent, KeyboardEvent).
