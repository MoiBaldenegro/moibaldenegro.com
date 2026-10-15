# Review — feature 95

**Veredicto:** APPROVED

Alcance: solo la feature 95 (ronda 2: 4 cards con entrada y salida lateral), según REQ-95-01..31 y
design.md. La ronda 1 (5 cards) quedó revocada por decisión humana y no se evalúa. La 93 (blocked) no se
evalúa. La feature no declara `depends_on`, así que no hay dependencias pendientes.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `<style>` en `.astro`: [x]. La animación vive en
  `src/styles/latest-cards-slide.css` (52 líneas). `latest-horizontal.astro` y `site-footer.astro` no tienen `<style>`.
- C2 Sin lógica en la UI: [x]. `site-footer.astro:13` solo pasa datos:
  `latestPosts(await new PostsRepository().getPosts(), FOOTER_LATEST_POSTS_LIMIT)`. Las constantes están en
  `src/domain/latest-posts.ts:20-21`.
- C3 Datos vía repositorio: [x]. No cambia.
- C4 Tokens, sin valores sueltos: [x]. `--latest-slide-distance: calc(4 * var(--gap-card))`
  (`latest-cards-slide.css:18`). No hay colores ni px sueltos. `tokens.css` no cambia frente a HEAD.
- C5 ≤ 100 líneas: [x]. Archivos tocados: latest-posts.ts 25, site-footer.astro 66,
  latest-horizontal.astro 12, latest-cards-slide.css 52 y home-latest-articles-five.test.mjs 100.
  `tests/home-latest-articles-limit.test.mjs` pasa de 320 (HEAD) a 328 líneas. Ya superaba el límite antes,
  y REQ-95-31 lo admite de forma explícita.
- C6 Sin dependencias: [x]. `package.json` y `pnpm-lock.yaml` sin cambios. No hay JS de runtime nuevo
  (sigue habiendo un solo `<script>` en latest-horizontal.astro).
- C7 Datos JSON válidos: [x]. No cambian.
- C8 `./init.sh` verde: [x]. Lo ejecuté yo: EXIT 0, «El entorno está perfecto», tests al 100 % y build OK.
- C9 Vista correcta en desktop y móvil: [x]. Verificado en Chrome headless (ver abajo) y con las capturas
  `progress/research/home95/motion-375-mid.png` y `motion-1280-end.png`.
- C10 Harness: [x]. La 95 sigue en `in_progress` hasta que el líder la cierre. `progress/current.md` está al día.
  No hay temporales en el repo: los scripts de medición están en el scratchpad.

## TDD (pregunta de revisión)
Sí. `progress/impl_home-latest-articles-five.md` (Ronda 2, «Evidencia rojo/verde») recoge el test nuevo en
rojo antes de la implementación: 6 de 7 fallan, y REQ-95-08 pasa porque solo exige que los archivos
congelados sigan igual. También recoge en rojo los tests ajustados (REQ-30-01/02/03/13 y REQ-73-33). En
verde: 7/7 y suite 990/990. El fichero con la salida en rojo está en el scratchpad (`red95r2-final.txt`).

## Revisión de código frente a la spec
- REQ-95-01/02/03: `LATEST_POSTS_LIMIT = 4` y `FOOTER_LATEST_POSTS_LIMIT = 3`. El footer importa la constante
  y la pasa explícita.
- REQ-95-08: los congelados no cambian (`git diff --quiet HEAD` lo comprueba en el test).
- REQ-95-09: cada aserción ajustada lleva la nota «Ajuste feature 95 (precedente REQ-43-06)»
  (home-latest-articles-limit.test.mjs y latest-horizontal-compact-sticky.test.mjs:89-91).
- REQ-95-10/11: `search-index-lazy-load.test.mjs:96-97` usa `size < 47000` con la nota y conserva las
  aserciones de que no hay `id="search-index"`. Peso medido por mí: **43 646 B**; el implementer anotó
  43 634 B. Umbral: ceil((43 646 + 3 000) / 1000) × 1000 = **47 000**, el mismo que en el test y ≤ 48 000.
  El test sigue detectando un índice embebido: `search-index.json` pesa 39 026 B, así que 43 646 + 39 026 ≫ 47 000.
- REQ-95-13..21: la hoja coincide con el esqueleto de design.md. Todo va dentro de `@media (no-preference)`
  con un único `@supports`. `animation-timeline: view()` va después del shorthand. En el modo horizontal hay
  `animation: none`, y `.home__landing` usa `overflow-x: clip`. La hoja se importa en
  `latest-horizontal.astro:3` y termina en el CSS externo, no inline en el HTML.

## Verificación independiente (Chrome headless + CDP, script propio `rev95.mjs` en el scratchpad)
Sobre el build de `./init.sh` + `astro preview` (:4361), con barridos de 61 posiciones (movimiento) y
31 (reduce), cargando desde y = 0:

| Viewport | Cards | Footer | Máx. scrollWidth − clientWidth | CLS recorrido |
|----------|-------|--------|--------------------------------|---------------|
| 375 | 4 | 3 | 0 | 0 |
| 768 | 4 | 3 | 0 | 0 |
| 1024 | 4 | 3 | −10 | 0 |
| 1280 (horizontal) | 4 | 3 | −10 | 0 |
| 375 reduce | 4 | — | 0 | 0 |
| 1280 reduce | 4 | — | −10 | 0,0001 |

- Animación (375/768/1024): las 4 cards tienen una `CSSAnimation` `latest-card-slide` sobre `ViewTimeline`.
  `getKeyframes()` solo anima `opacity` y `transform`, sin translateY. Clasificando todas las muestras del barrido:
  - Entrando: 8/12, 12/12 y 18/19 con tx > 0 y opacity < 1; el resto ya ha pasado entry 40 % y está en
    reposo. Ninguna tiene tx < 0.
  - Centradas: 8/8, 8/8 y 4/4 en identidad con opacity 1.
  - Saliendo: 11/11, 11/11 y 13/13 con tx < 0 y opacity < 1. Ninguna tiene tx > 0.
- Reduced motion (375 y 1280): `matchMedia` es true. En las 124 muestras por viewport, `getAnimations()` está
  vacío, transform none y opacity 1.
- 1280×800 con movimiento: existe `.latest-articles--horizontal-pin` y las cards tienen `animation-name: none`
  sin animaciones. Recorriendo el tramo fijado (inicio y = 1205) de 20 en 20 px, hay 6 posiciones en las que
  las cards 3 y 4 caben completas en la sección (±2 px). Por ejemplo, en y = 2425: c3 [33, 629], c4 [643, 1239],
  sección [0, 1270]. No hay scroll horizontal.

## Hallazgo del implementer (CLS 0,508 al recargar a 1280): confirmado preexistente
Lo reproduje con la página llevada al fondo y `Page.reload` (scroll restaurado), 4 recargas por viewport:

| Árbol | 1280 | 1024 | 375 |
|-------|------|------|-----|
| Feature 95 (4 cards + hoja) | 0,5085 en 3/4 (fuente `site-footer`) | 0,0033 en 4/4 (`latest-articles`) | 0 |
| **HEAD c878808** (3 cards, sin hoja; worktree en el scratchpad, 38 063 B) | **0,5085 en 4/4** (`site-footer`) | 0 | 0 |

El salto de 0,5085 a 1280 ya existe en HEAD, así que no lo introduce la 95. Encaja con la explicación del
implementer: el envoltorio `-pin` del modo horizontal (features 73/75) se dimensiona en JS después del primer
render. No entra en REQ-95-28, que mide el recorrido desde y = 0 (CLS 0). Recomiendo abrir una feature aparte
si el humano lo quiere corregir.

A 1024 la 95 sí añade, solo al recargar con el scroll restaurado, un salto pequeño de 0,0033: está muy por
debajo de 0,1 y no bloquea.

Nota del método: el primer build de HEAD en el worktree salió sin `<link rel="stylesheet">` porque usé la ruta
con el casing incorrecto (`C--Users…` en lugar de `c--Users…`). Lo repetí con la ruta real, que dio CSS
enlazado y 38 063 B (coincide con el control de 38 067 B del implementer). Quité la unión a node_modules
(node_modules principal intacto) y eliminé el worktree. Paré los preview (:4361/:4362).

## Observaciones no bloqueantes
1. `src/components/latest-articles.astro` conserva un comentario que dice «3 más recientes». Está congelado
   por REQ-87-06 y REQ-95-08, así que el implementer no podía tocarlo. Conviene corregirlo en una feature que
   descongele ese archivo.
2. Siguen pendientes de validación humana los valores por defecto de la animación: dirección, 56 px, rangos
   0–40 % / 60–100 %, activa en móvil y sin animación nueva en el modo horizontal (anotados en `progress/current.md`).

## Cambios requeridos (si aplica)
Ninguno.
