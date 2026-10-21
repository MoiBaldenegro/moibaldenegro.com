# Implementación — feature 109 hero-backdrop-bottom-left

Implementer, 2026-10-20. Spec: `specs/109_hero-backdrop-bottom-left/` (REQ-109-01..16). Análisis:
`progress/research/hero-backdrop-anchor-new-tab.md`. Sin subagentes, sin commits.

## Estado: lista para revisión (ronda 1 aplicada)

`./init.sh` termina con código 0 (formato, tests al 100 % y build). Los 8 fallos previos ajenos a la 109, que salían
del JSON del humano y bloquearon la primera entrega, quedaron resueltos con el cierre de la feature 111 (re-baseline
del JSON). Tras la ronda 1, la suite completa da `tests 1147, pass 1147, fail 0`. Ver «Ronda de revisión 1».

## Cambios

- `src/styles/hero-card-accents.css` (57 → 61 líneas): base `.card-backdrop` con `left: -16px; right: auto;
  width: calc(100% + 32px)` (≤ 1200 px: `left: -10px; width: calc(100% + 20px)`); `sm` `left 16px / width 60%`
  (≤ 1200: `10px / 60%`); `lg` `left -56px / width calc(100% + 112px)` (≤ 1200: `-36px / calc(100% + 72px)`);
  nueva regla `.card-backdrop:has(use[href$="#cloudflare"]) svg { aspect-ratio: 512 / 76; }`. Sin cambios en
  bottom 0, z-index 0, opacidad 0.06, ratios/margen de anthropic y github. Comentarios actualizados.
- `tests/hero-backdrop-bottom-left.test.mjs` (nuevo, 88 líneas, solo `node:`).
- Tests heredados ajustados con «Ajuste feature 109 (precedente REQ-43-06)» (REQ-109-14):
  `tests/hero-backdrop-subtle-bottom.test.mjs` (REQ-105-04, 94 líneas), `tests/hero-cards-extra-logos.test.mjs`
  (REQ-103-21/22, en el sitio, 100 líneas), `tests/hero-backdrop-size.test.mjs` (REQ-108-08/09/10 y REQ-108-11:
  left + width en vez de left + right, 95 líneas).
- No tocados: sprite.svg, src/content/posts (su diff es previo a la sesión), tests/hack-the-box-sprite.test.mjs,
  hero-cards.json, hero-card.astro, hero-card.css, tokens.css, tests/search-index-lazy-load.test.mjs.

## Ciclo rojo / verde

Rojo (`node --test tests/hero-backdrop-bottom-left.test.mjs`, antes del CSS, tras ajustar el chequeo de height para
admitir el `height: auto` del svg de la 105):

```
✖ REQ-109-01 ... ✖ REQ-109-02 ... ✖ REQ-109-03 ... ✖ REQ-109-04 (".card-backdrop { right: -16px }")
✖ REQ-109-05 ... ✔ REQ-109-06 (preservación) ... ✖ REQ-109-12 (sin capturas) ... ✖ REQ-109-13/14 (sin nota)
✔ REQ-109-15/16 (preservación)
ℹ pass 2  ℹ fail 7
```

Verde (`pnpm test`, suite completa tras el CSS y las capturas): `ℹ tests 1140 ℹ pass 1132 ℹ fail 8`; los 8 son los
de la tabla de arriba (previos). Los 9 tests de la 109 y los heredados ajustados (REQ-103-21/22, REQ-105-04,
REQ-105-06, REQ-108-08/09/10, REQ-108-11) pasan. Línea base antes de tocar nada: `pass 1122 fail 9`.
(Histórico de la primera entrega. Tras la 111 y la ronda 1, `./init.sh` termina con código 0; ver abajo.)

## Peso de la portada (REQ-109-16)

`dist/client/index.html`: antes 39 789 B; después 39 781 B / 39 785 B (dos builds). Solo cambian el hash del CSS y
la clave de la server island de HTB (±8 B entre builds); el CSS no se inlina. Umbral de REQ-47-06 (< 40 000) intacto.

## Verificación en navegador (REQ-109-07..12)

Chrome headless + CDP, 375/800/1024/1280/1600 × 1000, DPR 1. Script `<scratchpad>/cdp109/m109.mjs` (base
`cdp108/m108.mjs`, añade CLOUDFLARE, caja del svg y huecos). Línea base: `dist` previo servido estático (:4491).
Final: estático (:4492) y `astro preview --port 4493` (con server island; **0 errores de consola/red**; el estático
solo da los 404 esperables de `/_server-islands/HtbStadistics`). Servidores parados al terminar; :4321 sin tocar.
A 375 px las cards se muestran poniendo `data-show-on-mobile="true"` por CDP (regla de la 106); sm/md/lg se inyectan
con `setAttribute('data-backdrop-size', …)`. x medido desde el borde exterior de la card (borde de 1 px: el
`left` CSS se mide desde el padding box, así 17 px = 16 + 1).

**REQ-109-07 (JSON real vs base, Δmax de x/y/ancho/alto/hueco inferior del use):** CLAUDE CODE (lg) 0 px y GITHUB
(md) 0 px en los cinco anchos (preview y estático); mosaico Δ 0 (las cards ocultas 0×0 a 375 se excluyen).

**REQ-109-08/09/10 (inyectado; x / hueco derecho / hueco inferior del use, px; solape con el título):**

| w | card | sm (antes x/hDer/inf) | md | lg |
|---|---|---|---|---|
| 375 | CLOUDFLARE | 11 / 128.9 / 1.3 (11/11/17.9) | -9 / -9 / 1.5 (antes inf 20) | -35 / -35 / 1.6 (antes 22.7) |
| 375 | CLAUDE CODE | 13.3 / 131.2 / 1 (14.6/14.6/1) | -5 / -5 / 1 | -30.4 / -30.4 / 1 |
| 375 | GITHUB | 11 / 128.9 / 1 (11/11/1) | -9 / -9 / 1 | -35 / -35 / 1 |
| 800 | CLOUDFLARE | 11 / 35.6 / 1.1 (11/11/5.8) | -9 / -9 / 1.2 (7.9) | -35 / -35 / 1.3 (10.6) |
| 800 | CLAUDE CODE | 11.7 / 36.3 / 1 | -7.5 / -7.5 / 1 | -33 / -33 / 1 |
| 800 | GITHUB | 11 / 35.6 / 1 | -9 / -9 / 1 | -35 / -35 / 1 |
| 1024 | CLOUDFLARE | 11 / 49.8 / 1.1 (11/11/7.6) | -9 / -9 / 1.2 (9.7) | -35 / -35 / 1.3 (12.4) |
| 1024 | CLAUDE CODE | 12 / 50.8 / 1 | -7.1 / -7.1 / 1 | -32.6 / -32.6 / 1 |
| 1024 | GITHUB | 11 / 49.8 / 1 | -9 / -9 / 1 | -35 / -35 / 1 |
| 1280 | CLOUDFLARE | 17 / 60 / 1.2 (17/17/9.1) | -15 / -15 / 1.3 (12.4) | -55 / -55 / 1.4 (16.6) |
| 1280 | CLAUDE CODE | 18.2 / 61.2 / 1 | -12.5 / -12.5 / 1 | -51.7 / -51.7 / 1 |
| 1280 | GITHUB | 17 / 60 / 1 | -15 / -15 / 1 | -55 / -55 / 1 |
| 1600 | CLOUDFLARE | 17 / 79.5 / 1.2 (17/17/11.7) | -15 / -15 / 1.4 (15) | -55 / -55 / 1.5 (19.2) |
| 1600 | CLAUDE CODE | 18.6 / 81.1 / 1 | -12 / -12 / 1 | -51.1 / -51.1 / 1 |
| 1600 | GITHUB | 17 / 79.5 / 1 | -15 / -15 / 1 | -55 / -55 / 1 |

- Solape del use con el título: 0 en las 45 combinaciones; z-index 0 y opacidad 0.06 en todas.
- Hueco inferior ≤ 2 px en todas (máx. 1.6 px, CLOUDFLARE lg a 375). CLOUDFLARE pasa de 5.8–22.7 px a 1.1–1.6 px
  gracias al ratio 512 / 76. md y lg dan los mismos x/ancho que antes (el sm era el único centrado).
- sm: caja del svg a 16 px (10 px en ≤ 1200) del padding box en las tres cards; hueco derecho > izquierdo siempre.
- **Desviación a revisar (REQ-109-08, CLAUDE CODE sm):** el glifo de `#anthropic-wordmark` empieza en x ≈ 2 de 182
  unidades del viewBox (misma holgura que el margen inferior de la 105), así que el `use` queda a +0.7…+2.3 px de
  la caja (12.3 px a 375, 17.2/17.6 px a 1280/1600 frente a 10/16): fuera de ±1 px a 375, 1280 y 1600. La caja está
  exactamente en 16/10 px. Corregirlo pide un `margin-left: calc(-100% * 2 / 182)` solo para anthropic en sm (no
  en md/lg para no romper REQ-109-07) o tocar el sprite (ajeno): no lo hago sin decisión.

Capturas: `progress/research/hero109/<card>-<tamaño>-<w>.png` para cloudflare, claude-code y github × sm/md/lg ×
5 anchos (45), más `<card>-real-<w>.png` (15) con el JSON real. Mediciones crudas en `<scratchpad>/cdp109/`
(base.json, final.json, final-static.json, summary.txt).

## Ronda de revisión 1 (CHANGES_REQUESTED → correcciones 1-5)

1. **CSS** (`src/styles/hero-card-accents.css`, 61 → 65 líneas): regla nueva fuera de `@media`, solo para sm:
   `.card-backdrop[data-backdrop-size="sm"]:has(use[href$="#anthropic-wordmark"]) svg { margin-left: calc(-100% * 2 / 182); }`
   La acompaña un comentario (precedente del `margin-bottom` de la 105). El porcentaje se calcula sobre el ancho de
   `.card-backdrop` y vale para cualquier ancho. md y lg no cambian.
2. **Test primero** (`tests/hero-backdrop-bottom-left.test.mjs`, 88 → 94 líneas): un test nuevo, «REQ-109-08: sm compensa
   la holgura izquierda...», exige ese `margin-left` en la regla sm y que la regla general de anthropic no lo lleve.
   - Rojo (antes del CSS): `✖ REQ-109-08: sm compensa la holgura izquierda de anthropic-wordmark (2 de 182) solo
     en sm, fuera de @media`, con `actual: undefined, expected: 'calc(-100% * 2 / 182)'`. Los otros 9 pasan
     (9 pass / 1 fail).
   - Al añadir el CSS falló el heredado REQ-108-11 (`tests/hero-backdrop-size.test.mjs`), que recorría cualquier regla
     con `data-backdrop-size` y exigía solo `left`/`width`. Ajusté su filtro para excluir las reglas del svg interior
     (`!head.endsWith(' svg')`) y amplié la nota «Ajuste feature 109 (precedente REQ-43-06)» (95 → 98 líneas).
   - Verde: los 4 archivos de test de la 109 dan `tests 40, pass 40, fail 0`. La suite completa (`pnpm test`) da
     `tests 1147, pass 1147, fail 0`, y `./init.sh` termina con exit 0 (formato ✔, tests al 100 % ✔, build ✔).
3. **Nueva medición con CDP**: scripts del reviewer (`<scratchpad>/rev109/r109.mjs` y `sum.mjs`, copiados a
   `<scratchpad>/r1/`) contra `astro preview --port 4595` con el build nuevo. Línea base: `rev109/base.json`.
   0 errores de consola o red. Servidor parado al terminar y :4321 sin tocar.

   | w | CLAUDE CODE sm: x del `use` (marca) / hueco dcho / hueco inf | antes |
   |---|---|---|
   | 375 | 10 (10) / 132.7 / 1 | 12.3 |
   | 800 | 10 (10) / 35.6 / 1 | 10.7 |
   | 1024 | 10.1 (10) / 50.8 / 1 | 11 |
   | 1280 | 16 (16) / 61 / 1 | 17.2 |
   | 1600 | 16.1 (16) / 81.3 / 1 | 17.6 |

   - REQ-109-08 se cumple en los 5 anchos (±0,1 px) y el hueco derecho es mayor que el izquierdo. x se mide desde el
     padding box, igual que en `sum.mjs`. La caja del svg queda ahora a 7,7–14,8 px porque se desplaza a propósito.
     REQ-109-08 mide el `use`, así que los avisos `svgL` de `sum.mjs` para anthropic sm son esperables.
   - REQ-109-07: con el JSON real, CLAUDE CODE (lg) y GITHUB (md) quedan con Δ 0 frente a la base en los 5 anchos.
     md y lg inyectados también dan Δ 0 en CLAUDE CODE y GITHUB. CLOUDFLARE solo cambia por el ratio 512 / 76 de la
     primera entrega.
   - REQ-109-09/10: hueco inferior entre 1 y 1,6 px y solape con el título 0 en las 45 combinaciones. z-index 0,
     opacidad 0.06 y sin scroll horizontal.
   - Capturas regeneradas: `progress/research/hero109/claude-code-sm-{375,800,1024,1280,1600}.png`.
4. **Cabecera del informe**: se sustituye «Estado: BLOQUEADA» por el estado real y se marca como histórica la línea
   de `./init.sh` con código 1.
5. **Reflow**: la línea 3 de la cabecera de la hoja (~150 caracteres) se parte en dos líneas de ~100.

Peso de la portada: `dist/client/index.html` 39 781 B (< 40 000). Archivos ajenos sin tocar en esta ronda: hero-cards.json,
sprite.svg, posts, tests/hack-the-box-sprite.test.mjs.
