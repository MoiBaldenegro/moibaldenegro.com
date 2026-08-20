# Análisis: ancho del video embebido en desktop (feature 16)

> Sesión spec_author. Petición del humano: «oye en la versión más grande en
> desktop, el iframe no quiero que se vea tan grande, un poco más pequeño y
> centrado, esto solo en desktop».

## 1. Causa raíz verificada (disco, 2026-08-20)

1. El video vive en el cuerpo markdown de los artículos:
   `<div class="video-container"><iframe …youtube…></iframe></div>`
   (02-principios.md), renderizado bajo `.post__content` en
   `src/pages/posts/[id].astro`.
2. `src/styles/article.css` (feature 11, 19 líneas) da al contenedor
   `width: 100%; max-width: 100%; aspect-ratio: 16/9; margin: var(--gap-card);
   overflow: hidden; border-radius: var(--radius-card)` → el video es
   full-width del contenido.
3. En desktop la página de detalle usa `.post { width: min(var(--container-max),
   95%); }` con `--container-max: 1500px` (tokens.css) → el video full-width
   mide ~1400px: enorme. El humano quiere «un poco más pequeño y centrado»,
   solo en desktop; móvil/tablet conserva el full-width.
4. Breakpoints existentes: `@media (max-width: 768px)` en layout.css, post.css
   y search-results.css → el escritorio es el rango complementario ≥769px.
5. `post.css` está en 100 líneas exactas (REQ-26-06): NO se toca. `[id].astro`
   ya importa article.css (REQ-11-01): NO necesita cambios.

## 2. Decisiones

- **D1 (alcance)**: una sola feature (16) de presentación, en article.css +
  tokens.css. Sin JS (estático por defecto), sin tocar post.css (100 líneas
  exactas, REQ-26-06) ni `[id].astro` (article.css ya se importa desde la
  feature 11).
- **D2 (mecanismo)**: media query `@media (min-width: 769px)` al final de
  article.css (DESPUÉS de la regla base, ver Riesgos) que sobrescribe SOLO
  `max-width` y `margin` del contenedor:
  `max-width: var(--video-max-width); margin: var(--gap-card) auto;`
  (centrado horizontal con el mismo gap vertical). La regla base
  `.post__content .video-container` NO se toca → en ≤768px se conserva
  exactamente el full-width actual (`width: 100%; max-width: 100%;
  margin: var(--gap-card)`).
- **D3 (token)**: token nuevo `--video-max-width: 640px` en el grupo
  Contenedor de tokens.css (junto a --container-max). Justificación:
  (a) la escala existente no aplica (--container-max 1500px es el contenedor
  del sitio, no un embed); (b) precedente --radius-thumb (feature 9): el valor
  componente-específico se tokeniza con justificación en design.md;
  (c) 640px es el embed 16:9 estándar de YouTube y ~46% de la columna desktop
  (~1400px): «un poco más pequeño». Consecuencia: tokens.css pasa de 91 a 93
  líneas (comentario justificativo + token). Alternativa descartada: 640px
  hardcodeado en article.css (el guardián audit-design-tokens.mjs solo audita
  colores y architecture.md §6 no lista anchos, sería permisible) — se
  descarta por coherencia con el sistema de tokens (--container-max ya es un
  token de ancho) y para evitar fricción de revisión («valor suelto»).
- **D4 (impacto en tests REQ-11)**: NINGUNO. Los tests
  tests/article-iframe-styles.test.mjs asercionan la regla base (primer match
  del regex `containerRule()`) y la regla base no cambia: REQ-11-02/05
  (`width: 100%`, `margin: var(--gap-card)`) siguen verdes sin ajuste. El
  override vive dentro de la MQ, después de la regla base. Solo cambian los 5
  tests que fijan tokens.css en 91 líneas exactas (REQ-17-09
  article-card-images, REQ-26-07 post-page-styles, REQ-39-09 post-header,
  REQ-40-11 post-readability, REQ-42-09 post-header-horizontal): se actualizan
  al nuevo estado canónico 93 con justificación en el encabezado (precedente
  REQ-43-06; mismo procedimiento que la feature 9 usó para --radius-thumb
  87→91).

## 3. Alcance y fuera de alcance

Alcance: media query desktop en article.css, token --video-max-width en
tokens.css, test nuevo tests/video-desktop-width.test.mjs (inspección, patrón
de article-iframe-styles), ajuste mecánico de los 5 tests de conteo de
tokens.css.

Fuera de alcance: tamaño del video en móvil/tablet (conserva full-width),
contenido/rendimiento de YouTube (preconnect, lazy), rediseño del contenedor,
post.css, `[id].astro`, la feature 10 (in_progress).

## 4. Riesgos

- tokens.css 91→93: los 5 tests de conteo exacto quedan en rojo hasta su
  ajuste (mecánico, precedente feature 9); la suite avisa si se olvida uno.
- El regex `containerRule()` de REQ-11 captura la primera ocurrencia del
  selector: la MQ debe ir DESPUÉS de la regla base (orden en el archivo).
- MQ `min-width: 769px` complementa los `max-width: 768px` existentes: sin
  solapamiento ni hueco (768px = móvil, 769px = desktop).
- `margin: var(--gap-card) auto` mantiene el gap vertical de la regla base y
  centra en horizontal; `auto` no es un valor auditado (solo colores/radios).

## 5. Trazabilidad de la descomposición

| Feature | id | REQ | Verificación |
|---------|----|-----|--------------|
| video-desktop-width | 16 | REQ-16-01..09 | tests/video-desktop-width.test.mjs (inspección) + ajuste de 5 tests REQ-17-09/26-07/39-09/40-11/42-09 (REQ-43-06) |