# Análisis — Recomendación "siguiente post" en el detalle de artículo

> Requerimiento bruto del humano: «Vamos a modificar los posts para que tenga
> una nueva propiedad que será un url con el siguiente post, así podremos
> renderizar un botón en el detail y podemos manipular qué artículo le
> recomendamos leer después de terminar el actual».
> Fecha: 2026-09-17. Rol: spec_author (solo análisis y alta en backlog, sin código).

## Reafirmación del problema y alcance

El humano quiere una recomendación editorial manual al final de cada artículo:
cada post declara a qué artículo sigue (una url curada a mano) y la página de
detalle (`src/pages/posts/[id].astro`) renderiza un botón "siguiente" con ese
destino. El alcance cubre dos capas: (a) la capa de datos —nueva propiedad
`next` en el esquema, el contenido y el repositorio— y (b) la capa de
presentación —el botón en el detalle—. No incluye orden automático, ni
recomendaciones múltiples, ni resaltado de búsqueda, ni cambios en la
portada o la vista `/search`.

## Qué toca

| Capa | Archivo(s) | Estado actual |
|------|------------|---------------|
| Esquema | `src/content.config.ts` (30 líneas) | `z.object` con `slug, title, author, img, readtime, description, tags, created, updated`; sin `next` |
| Contenido | `src/content/architecture/00..03*.md` (4 artículos) | Frontmatter sin `next` |
| Entidad | `src/domain/entities/post.ts` (19 líneas) | `Post` con `id, slug, title, author, img, readtime, description, tags, created, updated`; sin `next` |
| Repositorio | `src/domain/repositories/posts-repository.ts` (96 líneas wc) | `parsePost` valida cada campo con `expectString/expectNumber/expectTags`; lanza `PostsDataError`; sin `next` |
| Detalle | `src/pages/posts/[id].astro` (54 líneas) | Hero + `<Content />`; sin pie de navegación |
| Estilos | `src/styles/post.css` (100 líneas exactas) | Al límite: NO ampliable; el botón necesita hoja nueva (`post-next.css`) |
| Consumidores | `src/domain/search/*`, `[...term].astro`, `search.astro`, `LatestArticles` | Leen `Post`/`SearchIndexEntry`; un campo nuevo opcional no los rompe |

Corrección a la premisa del encargo: los posts NO viven en `src/data/*.json`
(`src/data` solo tiene `hero.json` y `hero-cards.json`); viven en la colección
de contenido `architecture` (`src/content/architecture/*.md` + esquema en
`src/content.config.ts`) y se entregan vía `PostsRepository`. La feature de
datos trabaja sobre esa colección, no sobre JSON.

## Decisiones (D1–D5)

- **D1 — `next` opcional, ruta interna.** Tipo: texto con formato de ruta
  interna `/posts/<id>`; ausente o nulo = último artículo sin recomendación.
  Sin este formato el botón no tiene destino válido que renderizar.
- **D2 — Cadena curada por defecto en orden cronológico.**
  `00-agilismo → 01-diseño-detallado → 02-principios → 03-principios-solid`,
  el último sin `next`. Es el default editorial sensato; el humano la
  "manipula" editando frontmatter (ese era el objetivo explícito).
- **D3 — Descomposición en 2 features (complejidad media: datos + UI).**
  18 `next-post-data` (esquema + frontmatter + entidad + repositorio, sin UI)
  primero —es la base que el implementer ejecuta primero— y 19
  `next-post-button` (botón en el detalle + hoja nueva, `depends_on: [18]`).
- **D4 — Hoja de estilos nueva.** `post.css` está en 100/100 líneas y no se
  toca; el botón vive en `src/styles/post-next.css` con solo tokens existentes
  (sin tokens nuevos) y breakpoint móvil 768px.
- **D5 — Sin JS de runtime.** El botón es un `<a>` estático prerendered
  (el detalle ya es `prerender = true`); excepción a "estático por defecto"
  innecesaria, sin `design.md` para la feature 18.

## Riesgos y trabas

- **R1 — `posts-repository.ts` en 96/100 líneas.** Añadir `next` + validador
  (~8 líneas) supera el techo; el implementer debe compactar (p. ej. recortar
  comentarios de cabecera) para cerrar en ≤100. Cubierto con acceptance
  explícito; si resulta inviable, la feature pasa a `blocked` (regla del arnés).
- **R2 — Integridad referencial no validada.** El repositorio valida formato
  (`/posts/<id>`) pero no que el destino exista (requeriría parseo en dos
  pasadas, más líneas). Riesgo asumido: la cadena la cura el implementer y los
  acceptance fijan los 4 valores exactos; un typo se detecta en revisión.
- **R3 — Directorio `specs/18_main-page-cards-redesign/` vacío preexistente.**
  Resto de un ciclo anterior (sin traits en `feature_list.json`, sin
  `requirements.md`; no lo valida el arnés). No colisiona con
  `specs/18_next-post-data/`; se deja intacto (los artefactos son permanentes).
- **R4 — Tests de `Post` existentes fijan la forma exacta** (`EXPECTED_POST`
  en `tests/posts-repository.test.mjs`, índice de búsqueda). Los tests nuevos
  extienden sin romper los actuales (campo opcional con default nulo).
