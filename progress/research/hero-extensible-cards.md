# Análisis — cards extensibles en el grid del hero y card de Hack The Box

Petición humana 2026-10-14: «en el grid donde mapeamos las cards de Twitch, YouTube, etc. queremos poder también inyectar ahí cards que tengan otro diseño o con más información y que se adapten perfecto a las reglas de ese grid y tengan sinergia; por ejemplo, el componente que ahorita tenemos de Hack The Box con las stats queremos que se convierta en una card ahí, integrada como una más, pero esta tiene funcionalidad; y poder extender nuevas en el futuro».

## Problema reformulado

El grid bento del hero solo sabe pintar un tipo de tarjeta (icono + título de marca). Se quiere:

1. Un mecanismo de **tipos de tarjeta** para que el grid acepte tarjetas con otro diseño o con datos/funcionalidad, que hereden las reglas visuales del grid (celdas, radios, borde, sombra, hover, reduced-motion, responsive) y que se puedan añadir en el futuro **sin tocar el núcleo** (new-hero.astro, hero-section.css).
2. Primera tarjeta rica: **Hack The Box**, que hoy es una sección suelta al final de la portada y pasa a ser una tarjeta más del grid, conservando datos, degradación elegante y el patrón server island. La sección suelta desaparece.

## Interpretación validada contra el código

| Pieza | Estado actual (verificado) |
|-------|----------------------------|
| Grid | `src/styles/hero-section.css`: `.hero-grid` 12 columnas, `grid-auto-rows: 95px`, gap `--gap-card`; ≤1200 px 6 columnas y filas `minmax(140px, auto)`; ≤768 px 1 columna `minmax(190px, auto)`. |
| Montaje | `src/components/new-hero/new-hero.astro` (58 líneas): perfil + `heroCards.map(card => <HeroCard card={card} />)`. |
| Tarjeta | `src/components/hero-card.astro` (22 líneas): `article.hero-card[data-color-token]`, `p.card-title`, svg del sprite. |
| Geometría | `src/styles/hero-card.css` (84 líneas): fondo y celda por `[data-color-token="..."]` (`--card-column`, `--card-row`); los campos `gridColumn`/`gridRow` del JSON **no** los consume el componente (duplicados en CSS). Responsive con `grid-column: auto !important`. Reduced-motion anula el `translateY` del hover. |
| Datos | `src/data/hero-cards.json` (12 tarjetas) vía `HeroCardsRepository` (94 líneas: sin margen para crecer, hay que extraer el parseo, precedente `about-parse.ts`). |
| Entidad | `src/domain/entities/hero-card.ts`: `interface HeroCard` con 9 campos readonly. |
| HTB | `src/components/htb-stadistics.astro` (isla; credenciales `ENV || env`, `getProfileOrNull()`, `Cache-Control` `HTB_ISLAND_CACHE_CONTROL`, `{profile && ...}` con 6 stats y un h2). Montada en `src/pages/index.astro` con `server:defer` y `<p slot="fallback">Cargando estadísticas de HTB...</p>`. Hoja `src/styles/htb-stadistics.css` (sección con `--container-max`, `margin-block`). |
| Tokens | `src/styles/tokens.css` 97 líneas: caben 2 tokens nuevos (99). No hay token ni icono de HTB en el sprite. |

### Ocupación del grid de escritorio (12 x 10 filas)

Perfil 1-5 x 1-6; filas 1-6 de las columnas 6-12 ocupadas; fila 7-8 completa; filas 9-10: twitch-bottom 1-8 y **columnas 9-12 libres**. La celda libre `9 / span 4` x `9 / span 2` (≈380 x 204 px) es el hueco natural de la card HTB: cierra el rectángulo del bento sin mover ninguna tarjeta existente.

## Decisiones propuestas (valores por defecto razonables y reversibles)

1. **Campo `kind` opcional** en las entradas del JSON (ausente = `icon`): las 12 tarjetas no cambian de datos. Catálogo `HERO_CARD_KINDS = ['icon', 'htb']` en la entidad; `HeroCard` (icono) conserva su nombre y campos y gana `kind: 'icon'`; nueva `HeroRichCard` (id, kind, title, colorToken, gridColumn, gridRow); unión `HeroGridCard`. Un `kind` desconocido lanza `HeroCardsDataError` (nunca en silencio).
2. **Registro tipo → componente** como objeto literal en el frontmatter de `src/components/hero-cards/hero-grid-card.astro`, resuelto con la función pura `pickCardComponent` de `src/domain/hero-card-registry.ts` (testable con objetos simples; lanza `HeroCardKindError` si falta). `new-hero.astro` solo cambia `<HeroCard>` por `<HeroGridCard>`.
3. **`server:defer` estático dentro de la card**: Astro no puede aplicar `server:defer` a un componente resuelto dinámicamente (el compilador necesita el import estático para el manifiesto de islas). Por eso la card HTB (`htb-card.astro`, prerenderizada) es el ítem del grid y contiene `<HtbStadistics server:defer>` con su fallback: la celda existe desde el HTML estático (sin saltos de layout) y solo el contenido llega en runtime.
4. **Se conservan los nombres** `htb-stadistics.astro`/`htb-stadistics.css` (la isla): 6 archivos de tests fijan esa ruta, la constante de caché y `getProfileOrNull`. Solo cambia su marcado a una lista compacta.
5. **Stats visibles**: Nivel, Puntos y Owns (user / root). Nombre (redundante con la tarjeta de perfil), País y Miembro desde se retiran por espacio (204 px de alto). Reversible: es una línea por stat.
6. **Degradación**: si la API falla, la card se queda en su celda con el título y «Estadísticas no disponibles» (antes la sección desaparecía; dentro del grid un hueco rompería el bento).
7. **Color**: tokens nuevos `--color-marca-htb: #1A2332` (navy de marca HTB) y `--color-marca-htb-accent: #9FEF00` (verde HTB) para los valores.
8. **Posición** en `hero-card.css` con el mismo patrón `[data-color-token="htb"]` que las demás (una sola fuente de geometría; el test de integración REQ-09-03 lo exige por cada colorToken).

## Descomposición

| Id | Feature | Capa | Depende de |
|----|---------|------|------------|
| 90 | hero-card-kinds-domain | dominio/datos (sin UI) | — |
| 91 | hero-card-registry | UI: despachador y registro | 90 |
| 92 | htb-hero-card | UI: card HTB + retirada de la sección | 90, 91 |

## Riesgos y trabas

- **Tests heredados que cambian por decisión humana** (precedente REQ-43-06, el test sigue al dato real): `hero-cards-repository.test.mjs` (fixture con `kind`, recuento de 12 tarjetas de icono), `hero-ui-refactor.test.mjs` (recuento 12), `htb-stadistics-section.test.mjs` REQ-22-01 y tokens `--container-max`, `search-landing-live-transition.test.mjs` REQ-05-00, `visual-polish-refactor.test.mjs` REQ-37-07 (`margin-block` de sección). Las aserciones de seguridad/degradación (getProfileOrNull, Cache-Control, sin lógica, `{profile &&`) se mantienen.
- **Límite de 100 líneas**: `hero-cards-repository.ts` (94) obliga a extraer el parseo; `tokens.css` queda en 99.
- **Hover `filter: contrast(1.4)`** sobre texto: se hereda por sinergia; verificar legibilidad. Los pseudo-elementos `::before/::after` exigen que el contenido de la card rica lleve `position: relative` y `z-index`.
- **Responsive**: `.hero-card` fuerza `grid-column: auto !important` ≤1200 px; la card HTB ocupa 1 columna de 6 y crece en alto (filas `minmax(..., auto)`): el contenido debe ir en flujo (no absoluto) para no recortarse.
- **Caché de la isla**: la respuesta degradada también se cachea una hora (comportamiento actual, sin cambio).
- No hay dependencias nuevas.
