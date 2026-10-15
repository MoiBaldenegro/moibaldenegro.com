# Informe de implementación — feature 95 home-latest-articles-five

Estado: **blocked** (2026-10-15, implementer). Sin commits. La feature 93 no se ha tocado.

## Qué se hizo

1. `feature_list.json`: 95 pasó a `in_progress` y después a `blocked`.
2. Test nuevo `tests/home-latest-articles-five.test.mjs` (99 líneas). Cubre REQ-95-01/02/03 (constantes e
   import y llamada explícita en el footer), REQ-95-04/05 (5, 6, 8 y 20 entradas, y 0 a 4), REQ-95-06/07
   (build real: 5 cards con los hrefs esperados y 3 `site-footer__post`), REQ-95-08 (`git diff --name-only HEAD`
   vacío sobre los 4 archivos congelados) y REQ-95-13 (archivos en 100 líneas o menos).
3. Tests ajustados con la nota «Ajuste feature 95 (precedente REQ-43-06)» junto a cada aserción y en el
   encabezado (REQ-95-09):
   - `tests/home-latest-articles-limit.test.mjs`: REQ-30-01/02/03/04/13 pasan a 5. En REQ-30-03 se añaden 2
     entradas (hay 6) para que el corte se siga viendo. El archivo ya tenía 320 líneas en HEAD; ahora tiene 329.
   - `tests/latest-horizontal-compact-sticky.test.mjs`: REQ-73-33 espera `LATEST_POSTS_LIMIT = 5` (95 líneas).
4. Implementación:
   - `src/domain/latest-posts.ts`: `LATEST_POSTS_LIMIT = 5` y nueva `FOOTER_LATEST_POSTS_LIMIT = 3` (25 líneas).
   - `site-footer.astro`: `latestPosts(await new PostsRepository().getPosts(), FOOTER_LATEST_POSTS_LIMIT)` (66 líneas).
   - `latest-articles.astro`: **sin cambios**. Iba a actualizar su comentario («3 más recientes»), pero
     tests/geist-pixel-extend.test.mjs (REQ-87-06) exige que el archivo no cambie respecto a HEAD, así que
     lo revertí. El comentario se queda desfasado («3»).
   - CSS y JS del modo horizontal: sin cambios (REQ-95-08).

## Evidencia rojo/verde

Rojo (antes de tocar latest-posts.ts y site-footer.astro), `node --test --test-reporter=tap tests/home-latest-articles-five.test.mjs`:

```
not ok 1 - REQ-95-01: LATEST_POSTS_LIMIT vale 5
not ok 2 - REQ-95-02/03: FOOTER_LATEST_POSTS_LIMIT = 3 y el footer lo pasa explícito
not ok 3 - REQ-95-04: con 5 o más artículos devuelve los 5 primeros sin mutar la entrada
not ok 4 - REQ-95-05: con menos de 5 artículos devuelve todos sin lanzar
not ok 5 - REQ-95-06/07: el build pinta 5 cards en la portada y 3 artículos en el footer
ok 6 - REQ-95-08: no cambian el CSS ni el script del modo horizontal
ok 7 - REQ-95-13: archivos tocados en <= 100 líneas
```
(Del 5: «la portada no pinta 5 cards, actual 3».)

Verde de la feature (home-latest-articles-five + home-latest-articles-limit + latest-horizontal-compact-sticky + site-footer):
`# tests 32 / # pass 32 / # fail 0`.

Suite completa: `# tests 990 / # pass 989 / # fail 1`. **./init.sh en ROJO** («✘ tests al 100%»; el build pasa).

## Bloqueo: choque con REQ-47-06 (feature 47 search-index-lazy-load)

```
not ok 777 - REQ-47-01/06 (build): sin índice embebido y portada < 40 000 bytes
AssertionError: index.html pesa 49297 bytes
```

Mediciones (build con `--outDir` aparte, mismo árbol, solo cambia el límite):

| Límite | dist/client/index.html | bloques `<style>` inline | bytes en `<style>` |
|--------|------------------------|--------------------------|--------------------|
| 3      | 38 059 B (pasa)        | 10                       | 20 993             |
| 5      | 49 289 B (falla)       | 14                       | 30 580             |

Causa: cada card lleva `transition:name` en la `<img>` (`img-<id>`) y en el `<h3>` (`title-<id>`). Astro
emite un `<style>` inline de unos 2,4 KB por cada nombre (las reglas `::view-transition-old/new`). Las cards
4 y 5 añaden 4 bloques, unos 9,6 KB. El marcado de cada card solo pesa unos 0,8 KB. La spec 95 no lo
preveía: dio por hecho que bastaba con cambiar el número de cards.

Para resolverlo hay que tocar otra feature, así que la decisión es del humano o del líder:

- (a) Subir el umbral de REQ-47-06 (por ejemplo a 52 000 B) con nota y precedente REQ-43-06. Cambia la spec 47.
- (b) Poner `transition:name` solo en las 3 primeras cards (o en ninguna). Cambia el marcado de
  latest-articles.astro, que está congelado por REQ-87-06, y el contrato de view transitions de la card.
- (c) Mantener la portada en 3 y descartar la feature.

## Verificación en navegador (REQ-95-11/12)

**No hecha.** Me paré al aparecer el bloqueo, y además el entorno no tiene herramienta de navegador
(ni playwright ni puppeteer en node_modules). Hay que hacerla cuando se resuelva el bloqueo: 375, 768 y
1280 px; 1280x800 con y sin reduced motion; footer con 3 enlaces.

## Estado del árbol

El cambio sigue en el árbol sin commit. Para revertirlo:
`git checkout -- src/domain/latest-posts.ts src/components/site-footer/site-footer.astro tests/home-latest-articles-limit.test.mjs tests/latest-horizontal-compact-sticky.test.mjs`
y borrar `tests/home-latest-articles-five.test.mjs`.

---

# Ronda 2 — 4 cards + entrada/salida lateral (spec revisada REQ-95-01..31)

Implementer, 2026-10-15. Feature 95 en `in_progress`. Sin subagentes ni commits; la 93 (blocked) no se toca.

## Cambios

- `src/domain/latest-posts.ts`: `LATEST_POSTS_LIMIT = 4` y `FOOTER_LATEST_POSTS_LIMIT = 3` (25 líneas). `site-footer.astro` pasa el límite explícito (ya estaba así desde la ronda 1; 66 líneas).
- `src/styles/latest-cards-slide.css` (nueva, 52 líneas): todo dentro de `@media (prefers-reduced-motion: no-preference)` con un único `@supports (animation-timeline: view())`; `.home__landing { overflow-x: clip }`; `--latest-slide-distance: calc(4 * var(--gap-card))` sobre `.latest-articles`; `.latest-articles__card { animation: latest-card-slide linear both; animation-timeline: view(); }` (timeline después del shorthand); `.latest-articles--horizontal .latest-articles__card { animation: none }`; `@keyframes latest-card-slide` con entry 0 % / entry 40 % / exit 60 % / exit 100 %, solo transform y opacity. Sin colores sueltos y sin JS.
- `src/components/latest-horizontal/latest-horizontal.astro`: añade `import '../../styles/latest-cards-slide.css';` (12 líneas, un solo `<script>`).
- Tests: `tests/home-latest-articles-five.test.mjs` reescrito (7 tests, 100 líneas); `home-latest-articles-limit` (REQ-30-01/02/03/04/13) y `latest-horizontal-compact-sticky` (REQ-73-33) pasan de 5 a 4 con la nota «Ajuste feature 95 (precedente REQ-43-06)» junto a cada aserción; `search-index-lazy-load` (REQ-47-01/06) con umbral nuevo y nota (se conserva la aserción de no embeber `id="search-index"`).
- Congelados sin cambios frente a HEAD (REQ-95-08, comprobado con `git diff --quiet HEAD`): latest-articles.css/.astro, latest-horizontal.css/.ts, domain/latest-horizontal.ts, latest-entrance.ts, tokens.css.

## Evidencia rojo/verde (REQ-95-23)

Rojo: test nuevo ejecutado con el árbol anterior (límite 5, sin hoja y sin import). Primero con la versión inicial del test y otra vez con la versión final (100 líneas), restaurando la implementación justo después:

```
✖ REQ-95-01/02/03: límite 4 en portada y 3 explícito en el footer
✖ REQ-95-04/05: 4 primeros sin mutar; con menos, todos sin lanzar
✖ REQ-95-06/07/12: build con 4 cards (transition:name) y footer con 3
✔ REQ-95-08: archivos congelados sin cambios frente a HEAD
✖ REQ-95-13/14/15/16/22: bloques media/supports y keyframes solo transform/opacity
✖ REQ-95-17/18/19/20: distancia, timeline, modo horizontal y recorte
✖ REQ-95-21/31: import en latest-horizontal.astro y archivos <= 100 líneas
ℹ tests 7  ℹ pass 1  ℹ fail 6
  AssertionError: ... /export const LATEST_POSTS_LIMIT = 4;/ ...   | con 5 | no hay 4 cards
  AssertionError: falta src/styles/latest-cards-slide.css | ... /import '\.\.\/\.\.\/styles\/latest-cards-slide\.css';/
```

En la misma pasada en rojo fallaron también los tests ajustados: REQ-30-01/02/03/13 y REQ-73-33 (esperan 4). REQ-95-08 pasa en rojo porque no exige cambios, solo que los archivos congelados sigan igual.

Verde: `node --test tests/home-latest-articles-five.test.mjs` 7/7. `./init.sh` → EXIT 0, «El entorno está perfecto»; `pnpm test`: **990 tests, 990 pass, 0 fail**; build de producción OK.

## Peso de la portada y umbral de REQ-47-06 (REQ-95-10/11)

| Árbol | dist/client/index.html |
|-------|------------------------|
| 3 cards, sin hoja (control) | 38 067 B |
| 4 cards, sin hoja (control) | 43 638 B |
| **4 cards + hoja (árbol final)** | **43 634 B** |

La hoja nueva va en el CSS externo `/_astro/index.*.css` (no se inyecta en el HTML). Umbral = 43 634 + 3 000 = 46 634, redondeado al millar superior: **47 000** (≤ 48 000, así que no hay bloqueo). El test pasa a `size < 47000` con la nota. Con el índice de búsqueda embebido (~39 KB) seguiría fallando.

## Verificación en Chrome headless + CDP (REQ-95-24..30)

Chrome `--headless=new --remote-debugging-port`, WebSocket nativo de Node 24, sobre `pnpm build` + `pnpm preview` (:4329). Script en el scratchpad (no en el repo). Cada carga pasa por `about:blank` y empieza en y = 0. CLS con `PerformanceObserver({type:'layout-shift', buffered:true})`, sin `hadRecentInput`, sumado desde la carga y durante el recorrido.

| Viewport | Modo | Cards | Footer `.site-footer__post` | Posiciones de scroll | Sin scroll horizontal | CLS |
|----------|------|-------|------------------------------|----------------------|-----------------------|-----|
| 375×800 | movimiento | 4 | 3 | 15 | sí (sw − cw = 0 en todas) | 0 |
| 768×800 | movimiento | 4 | 3 | 15 | sí | 0 |
| 1024×800 | movimiento | 4 | 3 | 15 | sí | 0,0006 |
| 1280×800 | movimiento (horizontal) | 4 | 3 | 15 | sí | 0 |
| 375×800 | reduce | 4 | 3 | 11 | sí | 0 |
| 1280×800 | reduce (apilado) | 4 | 3 | 11 | sí | 0 |

Animación (375/768/1024): las 4 cards tienen una `CSSAnimation` `latest-card-slide` con `timeline instanceof ViewTimeline` = true. Muestras con `getComputedStyle`:

| Viewport | Card | entry 20 % (tx px / opacity) | centrada | exit 80 % (tx px / opacity) |
|----------|------|-------------------------------|----------|------------------------------|
| 375 | 2 | +28,05 / 0,499 | identidad / 1 | −43,90 / 0,216 |
| 375 | 3 | +28,05 / 0,499 | identidad / 1 | −46,85 / 0,163 |
| 768 | 2 | +27,95 / 0,501 | identidad / 1 | −42,37 / 0,243 |
| 768 | 3 | +27,91 / 0,502 | identidad / 1 | −42,41 / 0,243 |
| 1024 | 2 | +26,81 / 0,521 | identidad / 1 | −39,02 / 0,303 |
| 1024 | 3 | +27,91 / 0,502 | identidad / 1 | −39,98 / 0,286 |

(En exit el avance medido es mayor que el 80 % geométrico estimado, posiblemente por las insets `auto` de view(), que toman el scroll-padding. El signo y el rango son los que pide la spec.)

Reduced motion (375 y 1280): `matchMedia('(prefers-reduced-motion: reduce)')` = true. En 12 muestras por viewport (4 cards × entry/centrada/exit) `getAnimations().length = 0`, `transform: none` y `opacity: 1`. A 1280 no hay modo horizontal (layout apilado, sin `-pin`).

Modo horizontal 1280×800 con movimiento (REQ-95-27): existe `.latest-articles--horizontal-pin`; las 4 cards con `animation-name: none` y `getAnimations()` vacío. Tramo fijado: inicio y = 1205, recorrido 1221 px (≈ 2 × 615). Al final del tramo, sección [0, 1270]; card 3 [32, 628] y card 4 [642, 1238], las dos completas dentro (±2 px). scrollWidth 1270 ≤ clientWidth 1280.

Capturas en `progress/research/home95/`: `motion-375-mid.png`, `motion-768-mid.png` (card 2 a entry 20 %), `motion-1280-mid.png` (mitad del tramo), `motion-1280-end.png` (cards 3 y 4), `reduce-375.png`, `reduce-1280.png`.

### Hallazgo previo, ajeno a la feature: CLS al recargar la portada a 1280 con el scroll restaurado

En una primera tanda recargaba `/` navegando directamente a la misma URL, así que Chrome restauraba el scroll del recorrido anterior (fondo de la página). En ese caso, a 1280 se mide un único layout-shift de **0,508** unos 70–95 ms tras cargar (fuente: `site-footer`, de fuera del viewport a y = 390). No pertenece al recorrido de arriba abajo de REQ-95-28 (con carga desde y = 0 el CLS es 0). Para aislar la causa, en el mismo árbol:

| Variante (navegación directa con scroll restaurado) | CLS a 1280 |
|------------------------------------------------------|------------|
| 4 cards + hoja (final) | 0,508 en 3 de 4 tandas |
| 4 cards **sin** la hoja nueva | 0,508 en 3 de 3 |
| **3 cards sin la hoja (estado anterior a la feature)** | 0,508 en 1 de 3 |

El salto ya existía antes de la feature 95. Lo provoca el modo horizontal (features 73/75: el envoltorio `-pin` se dimensiona en JS después del primer render, con el scroll ya restaurado), no la hoja nueva. Queda anotado para el líder y el humano por si quieren abrir una feature aparte. En esa misma tanda, a 1024 apareció un salto de 0,008 (`latest-articles` 789 → 798 px de alto) solo con la hoja, con el scroll restaurado; está muy por debajo de 0,1.

## Estado del árbol (ronda 2)

`./init.sh` en verde. Sin commits. Sin servidores abiertos: los preview (:4329/:4330) se pararon y el worktree temporal de comparación (scratchpad) se eliminó con `git worktree remove` tras quitar antes la unión a node_modules. Los scripts de medición están en el scratchpad (`cdp95.mjs`, `cdp95b.mjs`).
