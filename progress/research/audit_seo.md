# Auditoría SEO y metadatos — moibaldenegro.com

Fecha: 2026-10-08 · Agente: explorer · Feature: ninguna (auditoría a petición del líder)

## Alcance y método

- Stack verificado en el repo: Astro `^7.2.0` (build reporta `Astro v7.2.0`), adapter
  `@astrojs/cloudflare ^14.2.1`, `output: 'server'` (`package.json`, `astro.config.mjs`).
  `astro.config.mjs` **no define `site`** ni `trailingSlash` (default `'ignore'`).
- **Producción no auditable:** `moibaldenegro.com` y `www.moibaldenegro.com` devuelven
  **NXDOMAIN** (resolvedor local, `1.1.1.1` y DoH de Cloudflare: `Status: 3`, autoridad
  en `a.gtld-servers.net`, es decir, el dominio no está delegado en `.com`). WebFetch
  también falla con `ENOTFOUND`. Por tanto el análisis "en producción" se hizo sobre el
  **build local `dist/client/`** (fecha 2026-10-08 12:39) más el código fuente. Lo que
  depende del runtime (rutas SSR, `robots.txt`/`sitemap.xml` servidos por el worker,
  redirecciones de barra final) se deduce del código y queda marcado como **no
  verificado en vivo**.
- Páginas analizadas: `/` (`dist/client/index.html`), `/about`, `/search`,
  `/posts/01-procesos-memoria`, `/posts/03-principios solid`.

## Resumen de estado

| Comprobación | Estado |
|---|---|
| `<html lang>` | OK: `lang="es"` (`src/layouts/Layout.astro:16`) |
| `<title>` por página | Parcial: existe, pero sin marca en artículos, genérico en home/search |
| meta description | **Ausente en todas las páginas** |
| canonical | **Ausente** |
| Open Graph / Twitter | **Ausentes** |
| Un solo `h1` | **Falla** en 7 de 8 artículos y en `/about` |
| `alt` de imágenes | Presente en todas; calidad mejorable |
| `sitemap.xml` / `robots.txt` | **Ausentes** (y capturados por la ruta catch-all) |
| JSON-LD Article | **Ausente** |
| 404 | **No existe**: toda URL desconocida responde 200 (soft 404) |
| URLs | Slugs con espacio, `ñ` e inconsistentes con el nombre de archivo |

---

## Hallazgos priorizados

### ALTA

**A1. El dominio no resuelve (NXDOMAIN).**
- Evidencia: `nslookup moibaldenegro.com 1.1.1.1` → "Non-existent domain"; DoH
  `cloudflare-dns.com/dns-query?name=moibaldenegro.com` → `Status: 3`.
- Impacto: sin DNS no hay rastreo ni indexación posible; todo lo demás es secundario.
- Recomendación: verificar registro/renovación del dominio y delegación de NS a
  Cloudflare; añadir el dominio personalizado al Worker `moibaldenegro-web`
  (`wrangler.json`). Tras publicarlo, dar de alta la propiedad en Search Console.

**A2. Soft 404 universal: no hay página 404 y la ruta `[...term]` responde 200 a cualquier URL.**
- Evidencia: `src/pages/[...term].astro:9` (`prerender = false`, rest param) renderiza
  "Búsqueda por término" para cualquier path; no existe `src/pages/404.astro`; no hay
  `Astro.response.status` en ningún archivo (`grep` sin resultados). Así,
  `/posts/no-existe`, `/robots.txt`, `/sitemap.xml` o `/cualquier-cosa` devolverían
  HTML 200 con `<title>Búsqueda: …</title>` (no verificado en vivo por A1).
- Fuente: Google trata como *soft 404* las páginas 2xx que parecen error/vacías y no
  indexa URLs 4xx — https://developers.google.com/search/docs/crawling-indexing/http-network-errors
- Impacto: espacio de URLs infinito e indexable con contenido duplicado (todas las
  páginas de término son el mismo documento, ver comentario en `[...term].astro:11-14`),
  desperdicio de crawl budget, señales de baja calidad.
- Recomendación (elegir una, requiere spec):
  1. Crear `src/pages/404.astro` (https://docs.astro.build/en/basics/astro-pages/) y en
     `[...term].astro` añadir `<meta name="robots" content="noindex">` (vía prop del
     Layout) para que las páginas de búsqueda no se indexen
     (https://developers.google.com/search/docs/crawling-indexing/block-indexing).
  2. Si se decide que términos sin resultados son "no encontrados", fijar
     `Astro.response.status = 404` en el frontmatter
     (https://docs.astro.build/en/reference/api-reference/ — `Astro.response`). Ojo: hoy
     el filtrado es en cliente, así que el servidor no sabe si hay resultados; la opción 1
     es la más simple y compatible con el diseño actual.
  - Aplicar también `noindex` a `/search`.

**A3. Sin meta description en ninguna página.**
- Evidencia: `src/layouts/Layout.astro:8-10` solo acepta `title`; en el HTML generado
  las únicas `<meta>` son `charset`, `viewport`, `generator` y las dos de view
  transitions (`dist/client/index.html`, `posts/01-procesos-memoria/index.html`, etc.).
  El frontmatter de cada post ya tiene `description` (`src/content.config.ts:19`) pero
  no se usa en el `<head>`.
- Fuente: descripciones únicas y descriptivas por página, sin límite de longitud —
  https://developers.google.com/search/docs/appearance/snippet
- Recomendación: añadir prop `description` al Layout y emitir
  `<meta name="description">`. Pasar `post.description` en `posts/[id].astro:44`, y
  textos propios en `index.astro`, `about.astro`, `search.astro`.
- Nota de contenido: `00-agilismo.md:7` y `03-principios_solid.md:7` tienen **la misma
  description** ("En este capitulo aprenderemos los conceptos fundamentales…"); hay que
  diferenciarlas.

**A4. Sin `site` en la config, sin canonical, sin sitemap ni robots.txt.**
- Evidencia: `astro.config.mjs` sin `site`; `public/` no contiene `robots.txt` ni
  sitemap; `dist/client/` tampoco. Sin `link rel="canonical"` en ningún HTML.
- Fuentes:
  - `site` es lo que Astro usa para sitemap y URLs canónicas; `Astro.site` es
    `undefined` sin él — https://docs.astro.build/en/reference/configuration-reference/ ,
    https://docs.astro.build/en/reference/api-reference/
  - Canonical absoluto, en `<head>`, autorreferente recomendado —
    https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
  - Sitemap — https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - `@astrojs/sitemap` requiere `site`, no incluye rutas SSR dinámicas, genera
    `sitemap-index.xml` + `sitemap-0.xml` y sugiere `Sitemap:` en robots.txt —
    https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Recomendación:
  1. `site: 'https://moibaldenegro.com'` en `astro.config.mjs`.
  2. Canonical en Layout: `new URL(Astro.url.pathname, Astro.site)`.
  3. Sitemap: `@astrojs/sitemap` es dependencia externa → por regla del repo se discute
     antes (estado `blocked`). Alternativa sin dependencias: endpoints prerenderizados
     `src/pages/sitemap.xml.ts` (lista `/`, `/about` y `/posts/<slug>` desde
     `PostsRepository`, con `lastmod` a partir de `updated`) y `src/pages/robots.txt.ts`
     con `Sitemap: https://moibaldenegro.com/sitemap.xml`. Ambos deben ser
     `prerender = true` o vivir en `public/` para que **no** los capture `[...term]`.
     Excluir `/search` y términos del sitemap.

**A5. Doble `h1` en artículos y en `/about`.**
- Evidencia: `src/pages/posts/[id].astro:50` pinta `<h1>{title}</h1>` y 7 de 8
  markdown empiezan con `# …` (todos salvo `03-principios_solid.md`), p. ej.
  `src/content/posts/os/01-procesos-memoria.md:18`. HTML resultante:
  `h1 "Procesos y memoria - segundo post OS"` + `h1 "01. Procesos y memoria"`.
  `/about`: `src/pages/about.astro:15` y `:20` son ambos `h1` (el segundo es un párrafo
  largo).
- Fuente: Google usa los `h1` como fuente del title link; conviene un encabezado
  principal distintivo — https://developers.google.com/search/docs/appearance/title-link
- Recomendación: eliminar el `# …` inicial de los markdown (el título ya lo pone la
  plantilla) o degradarlo a `##`; en `about.astro:20` cambiar a `<h2>`/`<p>`.

### MEDIA

**M1. Sin Open Graph ni Twitter/X cards.**
- Evidencia: ninguna `og:*` ni `twitter:*` en el HTML generado.
- Fuentes: propiedades requeridas `og:title`, `og:type`, `og:image`, `og:url`; para
  artículos `article:published_time`, `article:modified_time`, `article:author`,
  `article:tag`; `og:locale` por defecto `en_US` — https://ogp.me/ . La doc oficial de
  X (developer.x.com) devolvió 402/404 y **no se pudo verificar**; fuentes secundarias
  coinciden en que `twitter:card` es obligatorio y que X cae a `og:*` para
  título/descr./imagen (https://kb.theseoframework.com/kb/twitter-cards-and-x-sharing/ ,
  https://frontendchecklist.io/rules/seo/twitter-cards).
- Recomendación: en Layout, props `description`, `image`, `type` y emitir
  `og:title`, `og:description`, `og:url` (= canonical), `og:image` (URL absoluta),
  `og:type` (`website`/`article`), `og:locale="es_MX"` (o `es_ES`), `og:site_name`,
  `twitter:card="summary_large_image"`, `twitter:site="@moibaldenegro"` (cuenta enlazada
  en `Layout.astro:39`). En posts: `article:published_time`/`modified_time` en ISO.

**M2. Sin datos estructurados JSON-LD `Article`/`BlogPosting`.**
- Evidencia: ningún `application/ld+json` en `dist/client/**`.
- Fuente: no hay propiedades obligatorias; recomendadas `headline`, `image`,
  `datePublished`, `dateModified` (ISO 8601 con zona horaria), `author` con `name` y
  `url` — https://developers.google.com/search/docs/appearance/structured-data/article
- Recomendación: en `posts/[id].astro` emitir `BlogPosting` con
  `headline=post.title`, `image` absoluta, `author: {"@type":"Person", name, url:
  "https://moibaldenegro.com/about"}`. Las fechas del frontmatter son texto español
  ("19 Septiembre 2026"); reutilizar `parseSpanishDate` (`src/domain/search/parse-date.ts`,
  devuelve `YYYY-MM-DD`) y añadir zona horaria (p. ej. `T00:00:00-06:00`). Construir el
  objeto en un módulo `.ts` de dominio (regla "lógica fuera de la UI") y serializar con
  el mismo escape `</script` que ya usan las páginas. Opcional: `WebSite` +
  `Person` en la home.

**M3. Títulos no óptimos.**
- Evidencia: home `<title>moibaldenegro.com</title>` (fallback de `Layout.astro:30`);
  `/search` → `Búsqueda`; artículos → solo el título del post sin marca (p. ej.
  `Principios solid`, `Procesos y memoria - segundo post OS`); términos → `Búsqueda: x`.
- Fuente: títulos únicos, descriptivos, concisos; marca al final con delimitador; evitar
  etiquetas vagas — https://developers.google.com/search/docs/appearance/title-link
- Recomendación: en Layout componer `"{title} | moibaldenegro.com"`; home con texto
  descriptivo (p. ej. "Moisés Baldenegro — Ingeniería y arquitectura de software").
  Corregir capitalización "Principios SOLID".

**M4. URLs problemáticas: espacios, `ñ` y slugs incoherentes.**
- Evidencia: `03-principios_solid.md:2` `slug: 03-principios solid` →
  `dist/client/posts/03-principios solid/` (URL `/posts/03-principios%20solid`);
  `01-diseño_detallado.md:2` `slug: 01-diseño-detallado`;
  `04-ciclo-de-vida-y-arquitectura.md:2` `slug: 02-ciclo-de-vida-y-arquitectura`
  (prefijo 02 vs archivo 04, choca con `02-principios-…`).
- Fuente: no-ASCII debe ir percent-encoded; preferir guiones y palabras legibles —
  https://developers.google.com/search/docs/crawling-indexing/url-structure
- Recomendación: slugs ASCII en minúscula con guiones: `03-principios-solid`,
  `01-diseno-detallado`, `04-ciclo-de-vida-y-arquitectura`. Si alguna URL ya se
  compartió, añadir redirecciones 301 (`redirects` en `astro.config.mjs`) y actualizar
  `next`/`related` que las referencian (p. ej. `03-principios_solid.md:11`).

**M5. Contenido de prueba publicado e indexable.**
- Evidencia: `src/content/posts/os/00-prueba-os.md` ("Post de prueba…") y
  `os/01-procesos-memoria.md` (incluye "Keyword única xyz-os-test-456", `:30`) se
  generan en `dist/client/posts/`; aparecen en "Últimos artículos" de la home.
- Recomendación: no publicarlos (campo `draft` en el schema filtrado en el repositorio)
  o `noindex` hasta tener contenido real. Contenido fino/de prueba resta calidad.

**M6. Recursos rotos.**
- Evidencia: `03-principios_solid.md:5` `img: arch03.webp` pero
  `public/assets/content/` solo tiene `arch-entry_05.webp, arch00.webp, entry-01..03.webp`
  → imagen hero rota en ese post. `Layout.astro:20` y `:27` enlazan `/favicon.svg`, que
  no existe en `public/`.
- Recomendación: añadir `arch03.webp` (o corregir el nombre) y añadir `favicon.svg` o
  quitar ambos `<link>`. Además 3 posts comparten `arch00.webp`: para OG/JSON-LD conviene
  una imagen propia por artículo.

### BAJA

**B1. `<head>` desordenado y duplicado.** `Layout.astro:19-28`: favicons antes de
`<meta charset>` (debe ir en los primeros 1024 bytes; conviene que sea el primer hijo de
`<head>`), y `icon svg` / `icon` repetidos (`:20`/`:27`, `:21`/`:28`). Mover `charset` y
`viewport` arriba y quitar duplicados. Fuente:
https://html.spec.whatwg.org/multipage/semantics.html#charset

**B2. Jerarquía de encabezados en la home.** `index.html`: `h1` → `h3` (tarjetas,
`src/components/hero-card.astro:12`, saltando `h2`; además repetidas, p. ej. "NODE JS"
x2) → `h2` "Últimos artículos" y cada tarjeta de artículo también `h2`
(`latest-articles.astro:25`, debería ser `h3`). Recomendación: tarjetas de skills como
`<p>`/`<span>` o `h2` oculto de sección; títulos de artículos en `h3`.

**B3. `alt` mejorable.** Todas las `img` tienen `alt` (OK), pero:
- `posts/[id].astro:47` y `:71`, `latest-articles.astro:21`: `alt` = título del post,
  que duplica el texto adyacente (enlace/h1). Si la imagen es decorativa, `alt=""`; si
  no, describir la imagen.
- Logo (`Layout.astro:36`) dentro de un enlace a `/`: mejor `alt="Inicio — moibaldenegro.com"`
  (describe el destino del enlace). Falta `height` (CLS).
- Fuente: alt útil y contextual, sin relleno de keywords —
  https://developers.google.com/search/docs/appearance/google-images

**B4. Barra final.** `trailingSlash` default `'ignore'`
(https://docs.astro.build/en/reference/configuration-reference/) y build en formato
directorio (`posts/<slug>/index.html`): `/posts/x` y `/posts/x/` pueden servir el mismo
contenido. No verificado en vivo (A1). El canonical de A4 lo neutraliza; opcionalmente
fijar `trailingSlash: 'never'` + `build.format: 'file'` o confirmar que Cloudflare
redirige una variante a la otra.

**B5. `site.webmanifest` genérico.** `public/site.webmanifest`: `"name": "MyWebSite"`,
`"short_name": "MySite"`. Poner el nombre real del sitio. Sin impacto directo en ranking.

**B6. `meta generator`.** `Layout.astro:29` expone `Astro v7.2.0`. Inocuo para SEO;
quitar es opcional (fingerprinting).

---

## Orden sugerido de features (para spec_author)

1. Dominio/DNS (A1, operativo, fuera del código).
2. `site` + Layout SEO: props `title/description/image/type/noindex`, canonical,
   description, OG/Twitter, orden del head (A3, A4-canonical, M1, M3, B1).
3. 404 + `noindex` en búsqueda (A2).
4. `sitemap.xml` + `robots.txt` sin dependencias (A4).
5. Limpieza de contenido: h1 duplicados, slugs, imágenes rotas, posts de prueba,
   descriptions duplicadas (A5, M4, M5, M6).
6. JSON-LD BlogPosting (M2).
7. Ajustes menores (B2–B6).

## Pendientes no investigados (fuera de alcance)

- Rendimiento/Core Web Vitals (index.html pesa ~72 KB por el índice de búsqueda
  embebido; imágenes sin `width/height`).
- Comportamiento real de Cloudflare Workers Assets con barra final y con `404.html` en
  modo `output: 'server'` — verificar en cuanto el dominio resuelva.
- Doc oficial de X Cards (inaccesible en esta sesión).
