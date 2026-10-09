# Auditoría → backlog: hallazgos de SEO, accesibilidad, rendimiento y seguridad

Fecha: 2026-10-08 · Agente: spec_author · Petición del humano: «pásalos al backlog empezando por los bugs».
Fuentes: `progress/research/audit_seo.md`, `progress/research/audit_a11y.md`,
`progress/research/audit_perf_security.md`.

## 1. Qué es y alcance

Las tres auditorías (sobre `dist/client/` y el código fuente, porque producción no resuelve) dejan
unos 60 hallazgos. Aquí se convierten en **28 features (ids 31-58)**. El orden de ids sigue la
prioridad: primero los bugs funcionales, después la prioridad alta y por último media y baja.
Los hallazgos triviales se agrupan cuando forman un cambio coherente, sin crear features gigantes.
No se ha tocado `src/` ni `tests/`. La feature 10 (`in_progress`) y el resto del backlog siguen intactos.

Todas las specs cumplen EARS estricto. Cada una incluye 3 REQ comunes al final: test en rojo
antes del código, máximo de 100 líneas por archivo y `./init.sh` en verde. Cada `acceptance` cita
su REQ. Las features que tocan UI llevan además `design.md`: 34, 36-39, 48, 51-57.

## 2. Hallazgo operativo (NO dado de alta)

- **El dominio no resuelve (NXDOMAIN).** `moibaldenegro.com` y `www` no están delegados en `.com`
  (audit_seo A1, audit_a11y §0, audit_perf_security §1). Es un problema operativo, no de código:
  hay que revisar el registro y la renovación del dominio, la delegación de los NS a Cloudflare
  y el custom domain del Worker `moibaldenegro-web`. Cuando resuelva: dar de alta Search Console y
  repetir las auditorías en vivo (cabeceras, HSTS, redirecciones, compresión, barra final, 404 en Workers).
- También son operativos, sin feature: **HSTS y «Always Use HTTPS»**, que se configuran en la zona
  de Cloudflare (perf A3), y la **compresión** en el edge (perf B6).

## 3. Tabla hallazgo → feature

| Id | Feature | Prioridad | Hallazgos que cubre | depends_on | Estado |
|----|---------|-----------|---------------------|------------|--------|
| 31 | search-clear-button-fix | Bug | a11y A3 (selector `[data-search-clear]` que coge la × del header; confirmado) | 10 | pending |
| 32 | search-pagination-listeners | Bug | a11y M6 (listeners acumulados y pérdida del foco) | 10, 31 | pending |
| 33 | broken-resources-fix | Bug | seo M6, perf B1, seo B1 (favicon duplicado): `/favicon.svg` (confirmado) y `arch03.webp` | — | pending |
| 34 | not-found-page | Alta | seo A2 (soft 404), `noindex` en /search y en términos | — | pending |
| 35 | seo-head-base | Alta | seo A3, A4 (site y canonical), M3, B1 (orden del head) | 33, 34 | pending |
| 36 | search-status-announcements | Alta | a11y A1 (aria-live) y anuncio de página de M6 | 32 | pending |
| 37 | focus-visible-global | Alta | a11y A2, B7, M2 (× de 32 px) | — | pending |
| 38 | layout-main-skip-link | Alta | a11y A4 (skip link y main en el Layout) | 35 | pending |
| 39 | single-h1-headings | Alta | seo A5, a11y B1 (doble h1 en /about) | — | pending |
| 40 | security-headers | Alta | perf A2 (`_headers` + middleware, CSP en Report-Only) | — | pending |
| 41 | astro-security-upgrade | Alta | perf A1 (CVE crítica, astro <7.2.8, y avisos high) | — | **blocked** |
| 42 | sitemap-robots-endpoints | Media | seo A4 (sitemap y robots sin dependencias) | 34, 35 | pending |
| 43 | social-meta-tags | Media | seo M1 (Open Graph y Twitter/X) | 35 | pending |
| 44 | article-json-ld | Media | seo M2 (BlogPosting) | 35 | pending |
| 45 | ascii-post-slugs | Media | seo M4, perf B7, a11y §4 (slugs) | — | pending |
| 46 | search-index-endpoint | Media | perf M1, paso 1 (`/search-index.json` prerenderizado) | — | pending |
| 47 | search-index-lazy-load | Media | perf M1, paso 2 (fetch bajo demanda; se quita el JSON embebido) | 36, 46 | pending |
| 48 | image-loading-hints | Media | perf M2 y M3 (parte de código), seo B3 y a11y B8 (height del logo) | — | pending |
| 49 | static-cache-headers | Media | perf M4 (`/assets/*`) y M5 (isla de HTB) | 40 | pending |
| 50 | youtube-embed-hardening | Media | perf M6 | — | pending |
| 51 | header-mobile-reflow | Media | a11y M1 | 37, 38 | pending |
| 52 | contrast-badge-kicker | Media | a11y M3, M4 | 36 | pending |
| 53 | link-image-accessible-names | Media | a11y M7, B8 (alt del logo), B9, B10; seo B3 | 36 | pending |
| 54 | code-copy-status | Media | a11y M5 | 36 | pending |
| 55 | home-heading-hierarchy | Baja | seo B2, a11y B1 (portada) y B2 (SVG con aria-hidden) | — | pending |
| 56 | reduced-motion | Baja | a11y B3, perf B3 | — | pending |
| 57 | search-form-progressive | Baja | a11y B5, B6 | 10, 36 | pending |
| 58 | manifest-generator-cleanup | Baja | seo B5, B6 | 35 | pending |

## 4. Orden y justificación

1. **Bugs (31-33).** El humano pidió empezar por aquí. 31 y 32 tocan `search-results-controller.ts`
   y dependen de la 10 (`in_progress`), que reescribe el arranque de los scripts de búsqueda con
   `astro:page-load`. Con esa dependencia el arnés no las elige hasta que la 10 esté cerrada, y se
   evitan conflictos en los mismos archivos. 33 no tiene dependencias y es implementable ya.
2. **Alta (34-41).** Va primero el soft 404 (34), porque añade la prop `noindex` al Layout. Después,
   el SEO base del head (35), que depende de 33 y 34 porque tocan las mismas líneas del head.
   La región aria-live (36) va detrás de la paginación (32), en el mismo controlador. Luego van el
   foco (37), el skip link y el main (38, que depende de 35 por el Layout), el doble h1 (39) y las
   cabeceras (40). La 41 queda `blocked`.
3. **Media y baja (42-58).** Se ordenan por impacto. Primero lo que depende del SEO base
   (42-44), después los slugs (45), el rendimiento del índice (46-47), las imágenes y la caché
   (48-50) y por último el resto de a11y y la limpieza. `.visually-hidden` nace en la 36 y la
   reutilizan 52, 53 y 54, de ahí su `depends_on`.

## 5. Decisiones tomadas en las specs (revisables por el humano)

- **33:** se quitan los `<link>` a `/favicon.svg` en lugar de inventar un SVG. El post de SOLID pasa
  a `arch00.webp`, la portada genérica que ya usan otros 3 posts, **hasta que el humano aporte
  `arch03.webp`**.
- **34:** `statusForTermPath` devuelve 404 si el último segmento tiene extensión de archivo o si el
  primer segmento es `posts`. Cualquier otro término sigue en 200 con `noindex`, porque el
  filtrado se hace en cliente.
- **35:** solo se usa contenido que ya existe. Título de la home: «Moisés Baldenegro Melendez |
  moibaldenegro.com», con el nombre del perfil de `hero.json`. Descripción de la home y de /about:
  el texto de presentación que ya está en `about.astro`. Descripción de /search: el texto de su guía.
- **39:** el `# …` inicial de los posts se **degrada a `##`** en lugar de borrarse, para no perder texto del autor.
- **40:** la CSP va en **Report-Only**. La CSP nativa de Astro se descarta porque no admite
  ClientRouter ni Shiki.
- **42:** `@astrojs/sitemap` se descarta porque es una dependencia externa y no incluye rutas SSR. Se usa la
  alternativa sin dependencias: endpoints prerenderizados `sitemap.xml.ts` y `robots.txt.ts`.
- **43/44:** `og:locale` es `es_MX` y las fechas van en `YYYY-MM-DD` sin zona horaria (ISO 8601
  válido). Elegir otra configuración regional o añadir zona horaria es decisión del humano.
- **52:** `--color-verified` pasa a `#0a6f9e`. Contraste calculado con la fórmula WCAG: 5.55:1 con
  blanco y 3.18:1 con `--color-username-bg`. El candidato del informe, `#0b7fb3`, da 4.47:1 y no
  llega al umbral. El kicker con `--color-accent-hover` da 5.73:1 sobre `--color-hero-top`.

## 6. Pendiente de decisión del humano (sin feature)

- **Posts de prueba publicados** (seo M5): `os/00-prueba-os.md` y `os/01-procesos-memoria.md`.
  Varios tests se apoyan en ellos (p. ej. la 30 los cuenta entre los 3 más recientes), así que
  marcarlos como borrador necesita una decisión explícita.
- **Description duplicada** en `00-agilismo.md` y `03-principios_solid.md`. Hace falta texto nuevo del autor.
- **Assets:** el `arch03.webp` real; reexportar el logo (2048×716 a ~144×50) y el hero (JPG de
  152 KB a WebP). Necesitan una herramienta de imagen.
- **Tarjetas del hero duplicadas** (NODE JS, GITHUB ACTIONS, YOUTUBE, TWITCH) y su efecto hover sin
  ser enlaces (a11y B2).
- **Barra final** (`trailingSlash`, seo B4): verificar en vivo con Cloudflare antes de decidir.
- **Mejoras opcionales que quedan fuera:** contador visible de resultados, botón de copiar que no se
  desplace con el scroll del `pre`, `WebSite`/`Person` en JSON-LD de la home, alt descriptivos por
  portada y el token de comentario de Shiki (3.93:1, hoy sin uso).

## 7. Riesgos y trabas

- **Numeración:** ya existen carpetas `specs/33_*` a `specs/44_*` de un ciclo anterior. Las nuevas
  carpetas usan otro slug, así que no se pisan, y el validador resuelve por `<NN>_<slug>`. Los ids
  `REQ-33..44` coinciden con citas antiguas en tests históricos. Ya hay precedente de ese
  solapamiento (spec 30, ids 21 y 24).
- **Tests existentes que cambiarán:** 38 (`<main class="post">`), 45 (slugs antiguos en
  `home-latest-articles-limit.test.mjs`), 47 (índice embebido, REQ-03-07/05-04) y 55 (h2 de la card).
  Cada spec obliga a documentar el ajuste con el precedente REQ-43-06.
- **Archivos al límite:** `search-live.ts` (99), `post.css` (100), `post-header.css` (99) y
  `latest-articles.css` (97). Las specs 36, 47 y 52 prevén extraer módulos o hacer cambios mínimos.
- **Verificación en vivo imposible** mientras el dominio no resuelva (34, 40, 49, 51).

## 8. Decisiones del humano aplicadas (2026-10-08)

### Feature 10 `client-init-on-navigation`: de in_progress a blocked (aparcada)

- Decisión textual: «la 10 me parece que la podemos ignorar, no tenemos reporte de que esté
  funcionando mal». Pasa a `blocked` con la nota de aparcamiento al inicio de su `description`.
  Se conserva en el array y no se borra.
- Hallazgo: el código de la 10 ya está en `src/` y commiteado. Los cuatro scripts (`search-results`,
  `search-bar`, `search-live`, `search-escape`) registran su init con `astro:page-load`, y
  `tests/client-init-on-navigation.test.mjs` existe y pasa en verde. Falta el cierre formal
  (revisión), que queda aparcado.
- Se quita el 10 de `depends_on` en todas las features que la tenían, que son exactamente 31, 32 y 57:
  - **31** `search-clear-button-fix` → `[]`. Su dependencia era de orden porque toca el mismo
    script de `search-results.astro`. El fix (`data-search-results-clear` buscado dentro de
    `.search-results`) no necesita la 10. Su test simulado cita `client-init-on-navigation.test.mjs`
    solo como precedente de técnica, y ese archivo existe.
  - **32** `search-pagination-listeners` → `[31]`. Comparte archivos con la 31, no con la 10.
  - **57** `search-form-progressive` → `[36]`. Necesita que `search-bar.astro` reinicie con
    `astro:page-load` para precargar `q` tras una navegación suave. Eso ya está en el código, y los
    tests de la 57 usan document simulado. Riesgo: si alguien revierte ese registro, la precarga
    de `q` fallaría solo tras una navegación suave.
- Ninguna feature necesita de verdad la 10, así que no queda ninguna dependiente.

### Feature 41 `astro-security-upgrade`: de blocked a pending (autorizada)

- Decisión textual: «sí lo autorizo». Pasa a `pending`. El title y la description ya no dicen
  «requiere aprobación» y registran la aprobación del 2026-10-08.
- Registro de la aprobación: nueva sección «Aprobaciones de cambio de versión» en
  `docs/dependencies.md`. Va en prosa, antes de las entradas `###`, y no altera los campos
  `version`/`approved`. La razón: `scripts/validate-dependencies.mjs` exige que `version` coincida
  con `package.json`, y subirla ahora rompería `./init.sh`. El implementer de la 41 actualiza
  `version` y `approved: 2026-10-08` de astro, @astrojs/cloudflare y wrangler al cambiar
  `package.json` (REQ-41-03). Con esto se cumple la condición de REQ-41-05: la aprobación queda
  registrada en `docs/dependencies.md`.
- Orden: la 41 no tiene `depends_on`. Al ser la pending de menor id sin dependencias pendientes
  después de 31, entra en la cola según la regla de menor id.

Verificación: `./init.sh` en verde tras los cambios.
