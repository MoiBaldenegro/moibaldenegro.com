# Informe de implementación — feature 61 header-anchor-offset-mobile

Implementado por el líder en rol de implementer (autorización humana de la sesión: el
subagente implementer no está disponible).

## Ciclo rojo/verde (REQ-61-07)

- Test nuevo `tests/header-anchor-offset-mobile.test.mjs` escrito primero contra la spec.
- ROJO observado antes de tocar CSS: `ℹ pass 2 / ℹ fail 3` (REQ-61-01, 02 y 04 fallan;
  03 y 08 ya se cumplían).
- VERDE tras el cambio: 5/5. Suite completa: 756/756; `./init.sh` en verde.

## Cambios

- `src/styles/tokens.css`: token `--header-height-mobile: 170px` (+ comentario) → 97 líneas.
- `src/styles/layout.css` (98 líneas), dentro del `@media (max-width: 768px)` existente:
  `html { scroll-padding-top: var(--header-height-mobile); }` y `padding-block: var(--gap-card)`
  en `.site-navbar nav`. Escritorio sin cambios (la regla html global conserva --header-height).
- Tests de conteo de tokens.css 95 → 97 (precedente REQ-43-06, nota «Ajuste feature 61» en el
  encabezado): REQ-17-09 (article-card-images), REQ-42-09 (post-header-horizontal), REQ-39-09
  (post-header), REQ-26-07 (post-page-styles), REQ-40-11 (post-readability); y el meta-test
  REQ-16-09 (video-desktop-width) que exige 97 y que cada uno documente --header-height-mobile.

## Verificación real (REQ-61-01, 05, 06) — Chrome headless + CDP sobre `astro preview`

Post `/posts/05-diseno-arquitectonico-vs-diseno-detallado/`, viewport 2600 px de alto
(para que el header siga pegado al llegar al ancla, ver hallazgo abajo), ancla
`#la-arquitectura-como-puente-entre-análisis-y-diseño`:

| ancho | alto header | header bottom | top del destino | ¿destino visible? | logo top |
|-------|-------------|---------------|-----------------|-------------------|----------|
| 320   | 165 px      | 165           | 170.4           | sí                | 14 px    |
| 375   | 165 px      | 165           | 169.8           | sí                | 14 px    |
| 768   | 123 px      | 123           | 170.0           | sí                | 14 px    |
| 1280  | 75 px       | 75            | 74.4            | (escritorio, fuera de alcance) | 22.5 px |

- Altura del header a 320 px con el padding nuevo: **165 px** → token 170 px ≥ 165 (REQ-61-01;
  constante MEASURED_HEADER_320 = 165 en el test). Antes del cambio: 137 px de header frente
  a 74 px de scroll-padding (impl_51.md) → ~63 px tapados.
- Logo a 320 px: 14 px del borde superior (≥ 8 px, REQ-61-06). Antes: 0 px.
- Ancla `#contenido` (skip-link) a 320/375/768: top del destino = bottom del header (165/165/123).

## Hallazgos fuera de alcance (para el backlog si el humano quiere)

1. **El header no es sticky en todo el documento**: `html, body { height: 100% }` hace que
   `body` mida un viewport; el `.site-navbar` (hijo de body) solo se queda pegado durante el
   primer alto de viewport de scroll y luego se va. Con viewport de 800 px, anclas profundas
   quedan con el header fuera de pantalla (sin taparlas). Arreglo probable: `min-height: 100%`
   en body; cambia el comportamiento visible, por eso no se toca aquí.
2. Escritorio 1280: el destino queda 0.6 px bajo el borde inferior de 1 px del header
   (75 px de header vs 74 px de scroll-padding). Imperceptible; preexistente.
