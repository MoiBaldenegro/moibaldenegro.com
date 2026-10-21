# Review — feature 113

**Veredicto:** APPROVED

## Checkpoints
- C1 (arquitectura: estilos en src/styles, sin `<style>`, sin lógica en UI, datos vía repositorio): [x]. Solo cambian valores en `src/styles/tokens.css` (7 líneas: 27, 28, 32, 33, 35, 47, 64) y `src/styles/layout.css:91` (`.skip-link` pasa a `color: var(--color-background)`). No se añade `style=` en ningún `.astro`.
- C2 (tokens, sin hardcodear): [x]. Busqué hex, rgb, hsl, color-mix y nombres de color (purple, violet, indigo, magenta, fuchsia, orchid, plum, lavender, lilac) en src/styles, src/components, src/layouts, src/pages, src/domain, src/data y src/*.ts, sin contar tokens.css. Solo salen `THEME_COLOR '#070716'` (azul, hue 240) e `INK rgb(0.1,0.1,0.12)` (gris). Los `color-mix` de `post-header.css:17,65` y `hero-section.css:21` usan `var(--color-accent)` y otros tokens. Calculé el HSL de todo tokens.css: los 7 morados dan hue 287,0–287,5 (hero-mid #150A18 da 287,1) y no queda ningún otro token con hue 250–330 y saturación de al menos 15 %. nestjs #3A0D18 da 345°, fuera del rango.
- C3 (máx. 100 líneas, sin dependencias nuevas): [x]. tokens.css 99, layout.css 99, tests/purple-to-logo-tone.test.mjs 99, hero-cards-links-xlink.test.mjs 41. tests/design-tokens.test.mjs tiene 107 líneas, pero ya las tenía en HEAD. La 113 solo cambia en él la línea 43, con la nota de precedente REQ-43-06.
- C4 (`./init.sh` verde y TDD): [x]. Ejecuté `./init.sh`: exit 0, «tests al 100%», build OK. `dist/client/index.html` pesa 40 203 B, menos de 42 000 (REQ-113-13). `progress/impl_purple-to-logo-tone.md` documenta el rojo de la ronda 1 (3/5 en rojo con los tokens antiguos) y el de la ronda 2 (2/5 en rojo tras fijar #150A18 en el test, antes de tocar tokens.css), y después el verde: 1168/1168. Dependencias: `depends_on: []`. La feature está en `in_progress` y la pasa a `done` el líder.
- C5 (se ve bien en desktop y móvil, 0 errores en consola): [x]. Detalle en la verificación independiente de abajo.

## Verificación independiente
- **Muestreo del logo.** Dibujé `public/assets/mxvi_logo.webp` en un canvas con Chrome headless: 2048x716, 928 944 px opacos. Dominan #6c387a (503 865 px) y #f7941d (347 161 px). El resto son variantes de antialiasing (#6a397a, #6c3978…). Coincide con `progress/research/purple-to-logo-tone.md`.
- **CDP sobre `astro preview` :4733** (ya parado; el :4321 de PID 34400 no se tocó). Páginas `/`, `/about/`, `/posts/00-spring-boot/` y `/search/`, a 375 y 1280 px:
  - `--color-accent` calculado vale #b37ac2 en las 8 combinaciones.
  - Texto en color de acento: contraste mínimo 5,84:1 (sobre superficie); 6,17:1 sobre fondo.
  - Skip link enfocado: 6,17:1 (#070716 sobre acento).
  - Contorno de foco, 4 primeros Tab: 5,84–6,17:1, con outline sólido.
  - Hover de un enlace del navbar no activo: rgb(195,150,207), es decir #C396CF, a 8,17:1.
  - Card CSS: blanco sobre #6C387A a 8,45:1.
  - Errores de consola, excepciones, log y red (>= 400): 0 en las 8 combinaciones.
  - Ningún color calculado del DOM es morado fuera de 287 ± 2, salvo el caso de la observación 1.
  - Scripts y salidas en el scratchpad: `rev113/r.mjs`, `rev113/r2.mjs`, `out.json`, `out2.json` y capturas `rv-*.png`.
- **Contrastes desde los tokens (cálculo propio).** accent/fondo 6,17; accent/superficie 5,84; accent/hero-top 4,40 (al menos 3); hover/fondo 8,17; hover/superficie 7,74; blanco/marca-css 8,45. Cumple REQ-113-08..10.
- **Capturas** en `progress/research/colors113/`: 32 de antes y después y 4 `r2-*`. Son coherentes. El antes muestra el violeta azulado #7d68ff con el skip link en blanco sobre violeta. El después y r2 muestran el ciruela del logo: el skip link lleva texto oscuro, el gradiente del hero queda en ciruela y el acento de about (cifras, timeline, «Resultado:») sale en #B37AC2 y casa con el logotipo MXVI del navbar.
- **Interpretación de la petición.** Unificar los morados al hue y la saturación del logo, variando solo la luminosidad para llegar a AA, cumple «igualarlos al mismo tono del logotipo» sin romper la accesibilidad. Usar el tono exacto #6C387A como acento daría 2,36:1 sobre el fondo, que no llega a AA. Pasar `--color-marca-css` al tono del logo también es razonable: la petición dice «todos los tokens», la marca CSS no tiene un morado canónico único y el contraste sube de 7,46 a 8,45. Queda bien documentado como revisable (design.md, decisión 2).

## Observaciones (no bloquean)
1. **El resaltado de código de los posts sigue en morado.** Astro aplica por defecto el tema Shiki github-dark y deja #B392F0 (hue 261) en línea, 44 veces en `dist/client/posts/00-spring-boot/index.html`. No sale de `src/` y queda fuera de REQ-113-06, pero el humano pidió «bajar de la página todo el color morado» y ni el análisis ni el design lo inventarían como excepción, como sí hacen con el `#639` del sprite. Recomiendo que el líder lo consulte con el humano y, si se quiere cambiar, abrir una feature aparte (tema Shiki en `astro.config`).
2. Ya ocurría antes de esta feature y sigue igual: en el post a 375 px, `scrollWidth` vale 462, más que el ancho de 375. Lo anota el informe.
3. `after-home-1280.png` sale con el hero desplazado, como reconoce el informe. Las capturas r2 lo compensan.

## Cambios requeridos (si aplica)
Ninguno.
