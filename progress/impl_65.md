# Informe de implementación — feature 65 card-image-height-auto

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Regresión de la feature 48, reportada por el humano: «las cards están rotas en
todas las páginas de detalle y en el search, angostas y muy altas».

## Ciclo rojo/verde (REQ-65-08)

- Test nuevo `tests/card-image-height-auto.test.mjs` escrito primero.
- ROJO antes de tocar las hojas: `ℹ pass 2 / ℹ fail 2`. Fallaron REQ-65-01..04
  («.post__image sin height: auto») y REQ-65-06 («.latest-articles__image sin height en
  src/styles»). Pasaban REQ-65-05 (atributos conservados) y REQ-65-09 (líneas).
- VERDE: 4/4. Suite completa 784/784; `./init.sh` en verde.

## Cambios (sin añadir líneas)

- `src/styles/post.css` (100): `.post__image` → `width: 100%; height: auto;` en la misma línea.
- `src/styles/latest-articles.css` (98, el conteo fijado no cambia): `.latest-articles__image` →
  `width: 100%; height: auto;`.
- `src/styles/post-next.css`: `.post__related-thumb { width: 112px; height: auto; ... }`.
- `src/styles/search-results.css`: `.search-results__thumb { width: 112px; height: auto; ... }`.
- Los atributos width="1376" height="768" se conservan (CLS, REQ-48-01). El navegador sigue
  reservando el hueco con su proporción.
- `tests/image-loading-hints.test.mjs` (precedente REQ-43-06, nota «Ajuste feature 65»):
  REQ-48-05 deja de aceptar aspect-ratio/object-fit como sustituto y exige height: auto o un
  height explícito. Ese hueco es el que dejó pasar la regresión.

## Verificación real (REQ-65-07): Chrome headless + CDP sobre `astro preview`

Páginas: `/`, `/posts/04-ciclo-de-vida-y-arquitectura/` (con recomendados) y `/search?q=solid`.

| imagen | ancho | ANTES (w×h, ratio) | DESPUÉS (w×h, ratio) | esperado |
|--------|-------|--------------------|----------------------|----------|
| .post__image | 1280 | 554×768, 0.722 | 554×416, 1.333 | 4/3 |
| .post__related-thumb | 1280 | 112×768, 0.146 | 112×63, 1.778 | 16/9 |
| .search-results__thumb (×2) | 1280 | 112×768, 0.146 | 112×63, 1.778 | 16/9 |
| .latest-articles__image (×3) | 1280 | 1149×768, 1.495 | 1149×646, 1.778 | 16/9 |
| .post__image | 375 | 305×768, 0.397 | 305×171, 1.778 | 16/9 |
| .latest-articles__image (×3) | 375 | 305×768, 0.397 | 305×171, 1.778 | 16/9 |
| hero .profile-image img | 1280 / 375 | 502×359 / 352×0 | 502×359 / 352×0 | sin cambio |

A 375 px las miniaturas de búsqueda y de recomendados están ocultas por diseño
(`display: none`). Capturas de /search y de recomendados a 1280 px: las cards tienen alto
normal. La miniatura de recomendados es lazy y en la captura aún no había cargado, pero el
recurso responde 200 (image/webp, 66 KB).

## Observación fuera de alcance

- A 375 px el contenedor `.profile-image` del hero mide 0 px de alto (`height: 68%` de un padre
  sin alto definido en móvil), así que la foto de perfil no se ve en móvil. Era así antes de esta
  feature (la medida previa es idéntica). Conviene revisarlo como feature aparte.
