# Review — feature 53

**Veredicto:** APPROVED

Feature: `link-image-accessible-names`. Spec: `specs/53_link-image-accessible-names/requirements.md` + `design.md`.
Implementer: el líder en rol de implementer (autorización humana explícita); revisado con el mismo rigor.
Dependencias: `depends_on: [36]` → feature 36 en `done`.

## Verificación por requisito

- REQ-53-01: `alt=""` en `src/components/latest-articles.astro` (img `latest-articles__image`),
  `src/components/search-results/item-html.ts:12` (`search-results__thumb`),
  `src/pages/posts/[id].astro` (`post__image` junto al `h1` y `post__related-thumb`). OK.
- REQ-53-02: logo en `src/layouts/Layout.astro` con `alt="Inicio — moibaldenegro.com"`. OK.
- REQ-53-03: `@moibaldenegro<span class="visually-hidden"> (X, sitio externo)</span>`; la clase
  `.visually-hidden` existe en `src/styles/layout.css:79` (Layout la carga). OK.
- REQ-53-04: `src/styles/post-next.css` añade `position: relative` a `.post__related-item` y
  `.post__related-link::after { content: ""; position: absolute; inset: 0; }`, sin valores
  nuevos (solo propiedades estructurales), mismo patrón que `search-results.css`. OK.
- REQ-53-05: test de build sobre `client/index.html` comprueba que ninguna card repite el título
  en el alt y que el alt es vacío. OK.
- REQ-53-06: `progress/impl_53.md` documenta el rojo (`pass 1 / fail 5`: 53-01..05 en rojo,
  53-07 verde por tratarse de un límite ya cumplido) antes del código, y el verde final. OK.
- REQ-53-07: líneas — Layout.astro 65, latest-articles.astro 39, [id].astro 86, item-html.ts 26,
  post-next.css 27, test nuevo 77. OK.
- REQ-53-08: `./init.sh` verde (entorno, formato, tests, build) y `pnpm test` 716/716, fail 0. OK.

## Tests heredados ajustados (6)

- `architecture-nav-link`, `navbar-logo-home`, `remove-navbar-logo`, `restore-navbar-home-link`:
  la regex del enlace a X solo añade un grupo opcional `(<span class="visually-hidden">[^<]*<\/span>)?`;
  se sigue exigiendo el `href` exacto y el texto visible `@moibaldenegro`, así que la protección
  original (que el enlace no se pierda) se mantiene. Comentario de ajuste con precedente REQ-43-06; mensajes intactos y veraces.
- `article-card-images` (REQ-17-06) y `latest-articles-restore` (REQ-20-05): pasan de
  `alt={post.title}` a `alt=""`; siguen exigiendo clase, `src` con `post.img` y `loading="lazy"`.
  Títulos, mensajes y comentarios de cabecera actualizados; las únicas menciones restantes a
  `alt={post.title}` son históricas («antes alt={post.title}»), no falsas.
  (Los cambios de 93→95 líneas de tokens.css en `article-card-images` pertenecen a la feature 51 ya aprobada; no se re-revisan.)

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x]
- C2 (sin lógica en UI; frontmatter solo imports/paso de datos): [x] — la feature solo cambia atributos/markup.
- C3 (datos vía repositorios): [x] — sin cambios en acceso a datos.
- C4 (solo tokens, sin valores hardcodeados): [x] — el `::after` no declara colores, espaciados, radios ni sombras.
- C5 (≤100 líneas por archivo tocado de producción y test nuevo): [x]
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (tests al 100%, `pnpm test` 716/716): [x]
- C9 (test-first documentado con rojo previo): [x]
- C10 (dependencias en `done`): [x]
- C11 (inspección visual desktop/móvil): [ ] ← no verificada en navegador por el reviewer; el único cambio visible es la fila clicable de recomendados. No bloquea.

## Observaciones menores (no bloqueantes)

1. `tests/article-card-images.test.mjs:13-14`: el comentario de cabecera conserva «sin tocar el
   dominio — Decisión 5 del design.md)», con un paréntesis de cierre sobrante tras la reescritura;
   cosmético.
2. REQ-53-05 solo se verifica en la portada; los resultados de búsqueda se renderizan en cliente y
   quedan cubiertos por la aserción estática de REQ-53-01 sobre `item-html.ts`.

## Cambios requeridos (si aplica)
Ninguno.
