# Review — feature 87

**Veredicto:** APPROVED

Evaluado sobre working tree + HEAD (19df78f). Único cambio en `src/`: `src/styles/typography.css` (+15 líneas, 30 en total). Test nuevo: `tests/geist-pixel-extend.test.mjs` (75 líneas).

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x] La regla nueva vive en `src/styles/typography.css:17-30` y no se tocó ningún `.astro`.
- C2 (sin lógica en la UI): [x] No cambia el marcado. `git diff HEAD` sobre Layout.astro, hero-card.astro, latest-articles.astro, posts/[id].astro e item-html.ts está vacío.
- C3 (repositorios): [x] No aplica, no se tocan datos.
- C4 (solo tokens): [x] El único valor es `var(--font-display)`. No hay colores ni `#`, tampoco en el comentario de las líneas 17-19.
- C5 (100 líneas como máximo): [x] typography.css tiene 30 líneas y el test 75.
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` en verde): [x] Ejecutado por el reviewer: formato, tests al 100 % y build OK. `node --test` de las features 87 y 86: 19/19 en verde.
- C8 (se ve bien en escritorio y móvil): [x] Evidencia CDP en `progress/impl_87.md` y capturas revisadas: `geist87-header-1280-dpr2.png` (enlaces e input en Pixel, logo como imagen) y `geist87-latest-card-375-dpr2.png` (título y tags en Pixel, meta y descripción en Sans, sin desborde).
- C9 (harness: feature en curso, current/history al día): [x] La feature 87 sigue en `in_progress` en `feature_list.json`. La pasa a `done` el líder al cerrar.
- C10 (sin temporales ni debug): [x] El script CDP quedó en el scratchpad, fuera del repo.

## Verificación específica
- REQ-87-01..04: los 8 selectores están en `typography.css:20-27` con `font-family: var(--font-display); font-synthesis: none`. La especificidad 0,2,0 gana a `.search-bar__input` (`search-bar.css:18`) y a `.post__related-link` (`post-next.css:15`), ambos 0,1,0. El resto solo hereda `--font-sans` de contenedores (`post-header.css:18` en `.post__hero`, `layout.css:16`).
- REQ-87-05: la regla `h1, h2` de la 86 sigue intacta (`typography.css:11-15`).
- REQ-87-06/07/19: `git diff HEAD --stat -- src tests` solo muestra typography.css. Las hojas con listas cerradas de tokens y `tests/geist-pixel-display.test.mjs` no cambian, y la guarda REQ-86-07 sigue en verde.
- REQ-87-08: el botón hamburguesa (Arial, fuente del UA) y la × de limpiar (Sans, `search-bar.css:58`) se quedan fuera. El logo es un `<img>` dentro de `.site-navbar nav a` (`Layout.astro:60`). Ese `a` recibe font-family, pero no tiene texto y no hay efecto visible.
- REQ-87-13: la altura del header es de 65 px en 800, 1000 y 1280, antes y después del cambio. La base se anotó antes de modificar el CSS.
- REQ-87-11/12/14: no hay desborde horizontal a 375/1000/1280 ni en el menú abierto a 375.
- REQ-87-15: CLS 0. REQ-87-16: el rojo (8 fail / 4 pass) se anotó antes del código. REQ-87-17: están las 24 capturas. REQ-87-18: kicker de 12 px a 375 y tags de búsqueda de 12,48 px.
- Las 6 acceptance de `feature_list.json` cubren los 19 REQ según el índice de trazabilidad de `requirements.md`.
- Dependencias: `depends_on [86]`, y la 86 está en `done`.

## Observaciones (no bloqueantes, para el humano)
1. A 800×800 el título bento «TYPESCRIPT» ya se salía de su tarjeta antes de esta feature (15,25 px con Sans). Con Pixel se sale 9,56 px. El ancho de 800 está fuera de REQ-87-12 y el origen está en `hero-card.css`. Si se quiere corregir, conviene abrir una feature aparte.
2. La legibilidad a DPR 1 del kicker y de los tags de búsqueda (12-12,5 px) queda a juicio del humano con las capturas de `progress/research/geist87/`.

## Cambios requeridos (si aplica)
Ninguno.
