# Review — feature 98

**Veredicto:** APPROVED

Alcance: solo la 98 (hero-mosaic-layout). Revisé el git diff y los archivos nuevos frente a `specs/98_hero-mosaic-layout/requirements.md` (REQ-98-01..38), `design.md`, `docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`. Los cambios de la 97 (aprobada, sin commit) que aparecen en el mismo diff (tokens rust/aws/claude-code/nestjs/cloudflare, título a 0,8rem, congelados de tokens.css en las suites de la 95/96) quedan fuera de esta revisión.
Dependencias: `depends_on: [97]` y la 97 está en `done`.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` ni `style=`): [x]. Los spans van en `src/styles/hero-section.css` (líneas 46-50) y el fondo y el icono en `src/styles/hero-card.css` (líneas 58-72). `hero-card.astro` y `htb-card.astro` solo emiten `data-col-span`/`data-row-span`. En el DOM medido, ningún article tiene `style`.
- C2 (lógica en dominio, frontmatter solo imports y datos): [x]. Orden, plantilla, auto-placement y errores están en `src/domain/hero-grid-layout.ts`. `new-hero.astro:12` solo hace `layoutHeroCards(new HeroCardsRepository().getCards())`.
- C3 (datos vía repositorio): [x]. `hero-cards-parse.ts` valida `category` con `readOption` (catálogo cerrado). Lo comprobé aparte: sin category entrega `tech` y con `"video"` lanza `HeroCardsDataError` («la tarjeta 0 declara un category inválido "video"»).
- C4 (tokens, sin hardcodear colores): [x]. `--color-marca-claude: #B4532F` da 4,98:1 frente a #ffffff y `--color-marca-bun: #3D2B1F` da 13,43:1 (cálculo WCAG propio). Salen `--color-overlay-strong/soft`, que no tienen referencias en `src/` (grep vacío). `tokens.css` tiene 99 líneas.
- C5 (≤ 100 líneas): [x]. `hero-grid-layout.ts` 89, `hero-card.ts` 41, `hero-cards-parse.ts` 92, `hero-card.css` 98, `hero-section.css` 63, `tokens.css` 99, `hero-cards.json` 17, `tests/hero-mosaic-layout.test.mjs` 97. Algunos tests reapuntados ya pasaban de 100 en HEAD; unos bajan y otros suben solo por la nota (precedente C5 de la review 97).
- C6 (sin dependencias, estático): [x]
- C7 (TDD rojo → verde): [x]. `progress/impl_hero-mosaic-layout.md` («Ciclo rojo / verde») registra `ERR_MODULE_NOT_FOUND` de `src/domain/hero-grid-layout.ts` (72 tests, 23 fallos) antes de crear el módulo o tocar JSON, hojas o componentes. También registra el segundo rojo de `EXPECTED_1200` antes del CSS y el verde final (1028/1028).
- C8 (`./init.sh` verde): [x]. Lo ejecuté yo: exit 0, con formato, tests al 100 % y build correctos.
- C9 (REQ-98-36, notas de ajuste): [x]. Hay nota «Ajuste feature 98 (precedente REQ-43-06)» en los 9 tests de la lista y en `hero-ui-refactor`. Ningún assert fija 13 tarjetas.
- C10 (verificación en navegador, sin errores de consola): [x]. Ver abajo.

## Verificación independiente (Chrome headless + CDP; build + `pnpm preview` en :4399, ya parado; :4321 sin tocar)

Scripts propios en el scratchpad: `rv98/measure.mjs`, `rv98/layout.js` y `rv98/err.mjs`. Columna y fila se calculan desde las pistas resueltas del grid (`gridTemplateColumns/Rows` + gap).

- REQ-98-20/21/22/23, a 1280 y 1600 (idénticos):
  - Grid de 12 × 10. Perfil 1/5 × 1/6.
  - Zona superior: htb 6/5 × 1/4, html 11/2 × 1/2, node 11/2 × 3/2, react 6/5 × 5/2, rust 11/2 × 5/2.
  - Fila 7: typescript 1/2, css 3/2, aws 5/2, claude-code 7/4, nestjs 11/2.
  - Fila 9: cloudflare 1/2, claude 3/2, bun 5/2, youtube 7/4, github 11/2.
  - Coincide con design.md las 15 cards. Hay 0 solapes y 0 celdas vacías. Cada fila inferior tiene 5 cards (4 de span 2 y 1 de span 4). Las redes van en la última fila y HTB arriba, junto al perfil. `data-*-span` coincide con el tamaño medido.
- REQ-98-28: ninguna palabra de los 15 títulos se parte ni queda fuera de su card a 375/800/1024/1280/1600.
- REQ-98-29: `article.right ≤ innerWidth` en todas las cards a los 5 anchos. Dentro del hero no hay ningún elemento más allá del viewport, sin contar `.hero-gradient`, que es decorativo. Solo hay scroll de documento a 800 (838/800), y lo provocan `search.search-bar` y su formulario. Es de la feature 93 y queda fuera de alcance.
- REQ-98-30: a 1280/1600, ningún descendiente de HACK THE BOX se sale de su article. El `scrollHeight` sobrante de 45 px es el glow `::after`.
- REQ-98-31: la nube de cloudflare queda al 100 % a los 5 anchos.
- REQ-98-32: en las 8 cards el centro queda dentro y el área dentro es ≥ 40 %. El mínimo es NESTJS a 800, con 49,6 %.
- REQ-98-33: solape 0 con el título en RUST, AWS, CLAUDE CODE, CLOUDFLARE, GITHUB, CLAUDE y BUN a los 5 anchos.
- Consola: 0 errores (exception, console.error y Log error) a los 5 anchos.
- HeroGridLayoutError (prueba aparte de la del implementer):
  - 14 tarjetas: «se recibieron 14 tarjetas…» (REQ-98-12); 16 también lanza.
  - 6 personalizadas: lanza (REQ-98-13).
  - Red en la zona superior con 5 cards: lanza con «"gh"» (REQ-98-14).
  - 6 redes en 15 cards: lanza con «"s0"».
  - Con 15 válidas, 10 sin personalizadas y 0 cards coloca sin error.
- Capturas de `progress/research/hero98/hero-grid-{375,800,1024,1280,1600}.png`: coinciden con la medida (mosaico de escritorio igual al mapa; tablet 6 columnas y móvil 1 columna, como describe la Decisión 4).
- Petición humana:
  - están las 12 tecnologías del sprite, una card por id (claude y claude-code son distintas);
  - solo YouTube y GITHUB como redes, al final;
  - htb arriba;
  - la fila de Claude Code queda tal cual;
  - el sprite no tiene más símbolos de tecnología (los restantes son instagram, x, linkedin, strava, twitch, verified, htb y htb-wordmark).

## Cambios requeridos (si aplica)
Ninguno.

## Observaciones no bloqueantes (para el líder o el humano)
1. Con menos de 5 tarjetas, `layoutHeroCards` no lanza error (con 3 coloca htb, x0 y x1 y deja huecos en la zona superior). La spec no lo pide, porque REQ-98-12 solo cubre las tarjetas que quedan tras la zona superior. Si se quiere que el mosaico se cierre siempre, habría que abrir un REQ.
2. `src/styles/hero-card.css:86` mete tres reglas en una sola línea (`claude`, `bun`, `youtube`) para no pasar de 100 líneas. No rompe ninguna convención escrita, pero se lee peor. Si la hoja crece, habría que dividirla.
3. Siguen como en la 97, fuera del alcance de la spec:
   - En tablet, la card HACK THE BOX ocupa 1 columna y recorta «Estadísticas no disponibles».
   - A 800/1024, HTML, NODE JS, REACT, TYPESCRIPT, CSS y NESTJS tapan parte de su título.
   - YOUTUBE solapa 123 px² su título a 800/1024. Su rojo da 4,0:1, pero YOUTUBE no está en REQ-98-33.
