# Review — feature 109

**Veredicto:** APPROVED

## Revisión 2

Revisor nivel 1, 2026-10-20. Segunda revisión tras el CHANGES_REQUESTED de la revisión 1 (abajo). He revisado
«Ronda de revisión 1» en `progress/impl_hero-backdrop-bottom-left.md`. Los archivos ajenos (`src/data/hero-cards.json`,
`sprite.svg`, posts, `tests/hack-the-box-sprite.test.mjs`) no se han evaluado.

### Cambios requeridos de la revisión 1
1. Resuelto. `src/styles/hero-card-accents.css:55` añade, fuera de `@media`,
   `.card-backdrop[data-backdrop-size="sm"]:has(use[href$="#anthropic-wordmark"]) svg { margin-left: calc(-100% * 2 / 182); }`.
   Las líneas 53-54 la comentan. La regla general de anthropic (línea 43) no cambia. La hoja tiene 65 líneas.
2. Resuelto. `tests/hero-backdrop-bottom-left.test.mjs:43-46` (94 líneas) exige el `margin-left` en la regla sm y
   comprueba que la regla general no lo lleva. El rojo está documentado (9 pass / 1 fail, `actual: undefined`). El
   heredado REQ-108-11 (`tests/hero-backdrop-size.test.mjs:75-78`, 98 líneas) excluye las reglas `... svg` y amplía la
   nota «Ajuste feature 109 (precedente REQ-43-06)». El ajuste está justificado porque esa regla no es de tamaño de la caja.
3. Resuelto, con medición propia. Script `rev109/r109.mjs` contra `astro preview --port 4597` con el build de este
   `./init.sh`, 375/800/1024/1280/1600, DPR 1. Resumen con `rev109/sum2.mjs` contra `base.json`.
   - CLAUDE CODE sm, x del `use` / hueco derecho: 10 / 132,7, 10 / 35,6, 10,1 / 50,8, 16 / 61 y 16,1 / 81,3. Todo dentro
     de ±1 px de 10/16 y con el hueco derecho mayor que el izquierdo.
   - REQ-109-07: con el JSON real, CLAUDE CODE (lg) y GITHUB (md) dan Δ 0 frente a la base en los 5 anchos. md y lg
     inyectados también dan Δ 0 en las dos cards.
   - REQ-109-09/10: hueco inferior entre 1 y 1,6 px y solape con el título 0. z-index 0, opacidad 0.06 y sin scroll
     horizontal. 0 errores de consola o red.
   - Los únicos avisos de `sum2.mjs` son `svgL` de anthropic sm (7,7 / 14,8 / 14,5). Son esperables: la caja se
     desplaza a propósito y REQ-109-08 mide el `use`.
   - Las capturas `progress/research/hero109/claude-code-sm-{375..1600}.png` están regeneradas. En
     `claude-code-sm-375.png` el glifo queda abajo-izquierda y el título está libre.
4. Resuelto. La cabecera del informe dice «Estado: lista para revisión (ronda 1 aplicada)» con exit 0. La línea con
   código 1 queda marcada como histórica (línea 42).
5. Resuelto. La cabecera de la hoja (líneas 1-8) está partida en líneas de 100 caracteres o menos.

### Verificación general
- `./init.sh`: exit 0 (formato, tests al 100 % y build).
- Dependencias: `depends_on [108]` y la 108 está `done`.
- `dist/client/index.html`: 39 781 B (< 40 000).
- Servidor de :4597 parado al terminar. :4321 sin tocar.

### Checkpoints
- C1 (estilos en `src/styles/*.css`, ningún `<style>` en `.astro`): [x]
- C2 (sin lógica en la UI): [x]
- C3 (datos vía repositorio): [x] (no aplica)
- C4 (tokens, sin valores sueltos): [x] (geometría del glifo, el mismo criterio que 105/108)
- C5 (<= 100 líneas, sin dependencias nuevas): [x]
- Datos (JSON válido, errores con nombre): [x] (no aplica)
- `./init.sh` en verde: [x]
- Página correcta en desktop y móvil sin errores de consola: [x]
- `feature_list.json` con la tarea en `done`: [ ]  ← Razón: sigue `in_progress`. La cierra el líder tras este APPROVED.
- `progress/` al día: [x]
- Sin temporales, debug ni TODOs: [x]

## Cambios requeridos
Ninguno.

---

# Revisión 1 (histórica)


Veredicto de la revisión 1 (superado por la revisión 2): CHANGES_REQUESTED

Revisor nivel 1, 2026-10-20. Alcance: `src/styles/hero-card-accents.css`, `tests/hero-backdrop-bottom-left.test.mjs`
y los 3 tests heredados ajustados (`tests/hero-backdrop-subtle-bottom.test.mjs`, `tests/hero-cards-extra-logos.test.mjs`,
`tests/hero-backdrop-size.test.mjs`). Los archivos ajenos (`src/data/hero-cards.json`, `sprite.svg`, posts,
`tests/hack-the-box-sprite.test.mjs`) no se han evaluado.

## Verificación independiente

- `./init.sh`: exit 0 (formato OK, tests al 100%, build OK). Los 4 archivos de test de la 109 juntos: 39/39 en verde.
- Dependencias: `depends_on [108]` y la 108 está `done`. La 109 está `in_progress`.
- Ciclo rojo/verde documentado en `progress/impl_hero-backdrop-bottom-left.md` (rojo: 2 pass / 7 fail antes del CSS;
  verde después).
- Líneas: hoja 61, test nuevo 88, heredados 94/99/97 (todos <= 100). Solo `node:`. La nota «Ajuste feature 109
  (precedente REQ-43-06)» está en los 3 heredados.
- `dist/client/index.html`: 39 777 B (< 40 000; el umbral de REQ-47-06 no cambia).
- Chrome headless + CDP (scripts en `<scratchpad>/rev109/r109.mjs` y `sum.mjs`), 375/800/1024/1280/1600, DPR 1,
  con sm/md/lg inyectados en CLOUDFLARE, CLAUDE CODE y GITHUB. Línea base: `cdp109/dist-base` servido en estático.
  Final: estático y `astro preview` (:4593). Servidores parados al terminar; :4321 sin tocar.
  - Errores: `astro preview` 0. En estático solo salen los 404 esperables de `/_server-islands/HtbStadistics`.
  - REQ-109-07: con el JSON real, CLAUDE CODE (lg) y GITHUB (md) quedan en Δ 0 px frente a la base en los 5 anchos.
    md y lg inyectados también dan Δ 0 en ambas cards.
  - REQ-109-09: hueco inferior del `use` entre 1,0 y 1,6 px en las 45 combinaciones. CLOUDFLARE baja de 5,8–22,7 px
    a 1,1–1,6 px gracias al ratio 512 / 76.
  - REQ-109-10: el `use` no se solapa con el título en ninguna combinación (0 en las 45). z-index 0, opacidad 0.06,
    sin scroll horizontal.
  - REQ-109-08: GITHUB y CLOUDFLARE en sm tienen el `use` exacto a 16 px (10 px con 1200 px o menos) y el hueco derecho
    es mayor que el izquierdo. **CLAUDE CODE en sm falla:** la caja del svg está exacta, pero el `use` queda a
    12,3 px a 375 (marca 10), 17,2 px a 1280 y 17,6 px a 1600 (marca 16). Eso supera la tolerancia de ±1 px.
    A 800 y 1024 queda dentro (10,7 y 11). Coincide con lo que anota el implementer.
- Capturas `progress/research/hero109/`: hay 45 de tamaños y 15 con el JSON real. Revisé
  `claude-code-sm-1280`, `cloudflare-sm-375` y `github-lg-1600`: concuerdan con las medidas (sm abajo-izquierda,
  logo bajo el icono principal, título libre).

## Valoración del caso CLAUDE CODE sm

La intención del humano («alineación estática abajo-izquierda», que los logos pequeños no se centren) se cumple a la
vista: el hueco derecho es de 60–80 px y el izquierdo de 17 px. Aun así, REQ-109-08 es un requisito EARS objetivo:
mide el **`use`** con ±1 px y falla en 3 de 5 anchos (hasta 1,6 px por encima de la tolerancia). El proyecto ya tiene
un precedente para este mismo glifo: la 105 compensó la holgura interna de `#anthropic-wordmark` en vertical con
`margin-bottom: calc(-100% * 2 / 182)` (línea 42 de la hoja). El arreglo horizontal cabe en una línea, entra en el
alcance (solo la hoja de la 109) y no toca el sprite. Por eso **no lo acepto como desviación**: hay que corregirlo.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, ningún `<style>` en `.astro`): [x]
- C2 (sin lógica en la UI): [x] (no se toca ningún `.astro`)
- C3 (datos vía repositorio): [x] (no aplica, la feature es solo CSS)
- C4 (tokens, sin valores sueltos): [x] (son geometría del logo, el mismo criterio que 105/108; no hay colores ni sombras)
- C5 (<= 100 líneas, sin dependencias nuevas): [x]
- Datos (JSON válido, errores con nombre): [x] (no aplica)
- `./init.sh` en verde: [x]
- Página correcta en desktop y móvil sin errores de consola: [ ]  ← Razón: REQ-109-08 falla en CLAUDE CODE sm a 375,
  1280 y 1600 px (`use` a 12,3 / 17,2 / 17,6 px frente a 10 / 16 / 16 ± 1). El resto está correcto y hay 0 errores en preview.
- `feature_list.json` con la tarea en `done`: [ ]  ← Razón: sigue `in_progress` (lo cierra el líder tras el APPROVED).
- `progress/` al día: [ ]  ← Razón: `progress/impl_hero-backdrop-bottom-left.md` sigue diciendo
  «## Estado: BLOQUEADA» y que «`./init.sh` no termina con código 0». Solo hay una nota al final que lo desmiente.
- Sin temporales, debug ni TODOs: [x]

## Cambios requeridos
1. `src/styles/hero-card-accents.css`: compensar la holgura izquierda del glifo de `#anthropic-wordmark` (2 de 182
   unidades, igual que el `margin-bottom` de la línea 42) **solo en sm**. En md y lg no se puede aplicar, porque
   rompería el Δ 0 de REQ-109-07 con el JSON real (CLAUDE CODE es lg). Por ejemplo, fuera de `@media`:
   `.card-backdrop[data-backdrop-size="sm"]:has(use[href$="#anthropic-wordmark"]) svg { margin-left: calc(-100% * 2 / 182); }`
   El porcentaje se calcula sobre el ancho de `.card-backdrop`, que es el del svg, así que vale para cualquier ancho
   y no hace falta repetirlo en `@media`. Hay que mantener la hoja en <= 100 líneas y actualizar el comentario.
2. Test primero: añadir a `tests/hero-backdrop-bottom-left.test.mjs` una aserción de esa regla (en rojo antes del CSS),
   con el test en <= 100 líneas. Anotar el rojo y el verde en el informe.
3. Volver a medir con CDP CLAUDE CODE sm a los 5 anchos. El `use` debe quedar a 16/10 px ± 1 y con hueco derecho >
   izquierdo, sin cambios en md/lg ni en el real (Δ <= 1). Regenerar `progress/research/hero109/claude-code-sm-<w>.png`.
4. `progress/impl_hero-backdrop-bottom-left.md`: sustituir la cabecera «Estado: BLOQUEADA» y la línea de
   `./init.sh` con código 1 por el estado real (exit 0 tras la 111) y añadir la medición corregida.
5. (Opcional, cosmético) La línea 3 de la cabecera de `hero-card-accents.css` mide unos 150 caracteres, frente a las
   ~100 del resto. Conviene reflowearla.
