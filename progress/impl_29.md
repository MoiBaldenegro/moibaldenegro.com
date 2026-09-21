# Informe de implementación — Feature 29 `horizontal-scroll-gsap-cards`

- Feature: 29 — Animación horizontal gobernada por el scroll con GSAP
  ScrollTrigger para las cards recientes (depends_on [28], ya done).
- Estado al cerrar la sesión: implementada, suite en verde, pendiente de
  `progress/review_29.md` con veredicto `APPROVED` (NO marcada `done`).
- Base verificada antes de tocar nada: `./init.sh` en verde y `gsap` +
  `ScrollTrigger` importables headless en node 22 (el import estático del
  módulo cliente es seguro en los tests).

## Alcance (corrección del humano)

NO es carrusel, NO usa scroll-snap, NO es animación de entrada. Es
scroll-driven: el scroll vertical conduce la traslación horizontal de la
pista de las 3 cards recientes (feature 28) con gsap + ScrollTrigger
(patrón pin + scrub). ScrollTrigger vive dentro del paquete `gsap` de la
feature 28: ninguna dependencia nueva, ningún cambio a
`docs/dependencies.md` ni a `package.json`. No se tocan las features 10
ni 28 ni `src/domain/repositories/posts-repository.ts` (100/100).

## Cambios

- `src/components/latest-articles-scroll.ts` (nuevo, 65/100 líneas):
  importa `gsap` y `ScrollTrigger` desde el paquete `gsap`, registra el
  plugin, limpia triggers previos (`ScrollTrigger.getAll()` + `kill()`)
  para no duplicar pins con el ClientRouter, respeta
  `prefers-reduced-motion` (contenido estático), detecta el modo
  resultados vía el ancestro `data-landing-sections` oculto (convivencia
  live-search intacta) y crea el tween horizontal (`x`, `pin: true`,
  `scrub: true`, `invalidateOnRefresh`) con `ScrollTrigger.refresh()` al
  restaurar. Exporta `trackShift` (progreso vertical → traslación
  horizontal, con sujeción a [0, 1]), `shouldBuildTrigger`,
  `landingHidden` e `initLatestScroll` (no-op seguro sin DOM).
  La clase `latest-articles--scroll` solo se añade con JS activo: sin JS
  la lista conserva la disposición estática. JS de runtime justificado
  como excepción a estático por defecto (REQ-29-01, research D3).
- `src/components/latest-articles.astro` (34 → 39/100): sección con
  `data-latest-scroll`, lista con `data-latest-track` y `<script>` que
  registra `initLatestScroll` como listener de `astro:page-load`
  (precedente feature 10), sin llamada directa ni lógica en el
  frontmatter. Pares `title-<id>`/`img-<id>`, `.slice(0, 3)` y encabezado
  intactos.
- `src/styles/latest-articles.css` (97 → 83/100): compactación de reglas
  de una sola declaración a una línea (sin tocar selectores ni valores)
  y 3 reglas nuevas bajo el modificador `.latest-articles--scroll`
  (`overflow: hidden`, pista en `flex`, cards al 78 %; 85 % en ≤768px).
  Solo tokens: sin hex ni `rgb()/rgba()` fuera de comentarios.
- `tests/horizontal-scroll-gsap-cards.test.mjs` (nuevo, 11 tests):
  cubre los 8 criterios del `acceptance` contra REQ-29-01..10.

## Evidencia del ciclo rojo/verde

### Rojo (antes de implementar, solo existía el test)

```
$ node --test tests/horizontal-scroll-gsap-cards.test.mjs
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module
  '.../src/components/latest-articles-scroll.ts'
  imported from '.../tests/horizontal-scroll-gsap-cards.test.mjs'
not ok 1 - tests/horizontal-scroll-gsap-cards.test.mjs
# fail 1
```

### Verde (tras implementar)

```
$ node --test tests/horizontal-scroll-gsap-cards.test.mjs
# tests 11  # pass 11  # fail 0
```

Dos ajustes durante el verde (documentados, sin cambio de contrato):
ninguno toca la spec — (1) el test de ausencia de `scroll-snap` ignoró
los comentarios del módulo (la palabra aparece en la cabecera que
declara "sin scroll-snap"); (2) `trackShift(0, …)` devolvía `-0` y
`assert.equal` (Object.is) lo distingue de `0`: la implementación
normaliza el cero.

### Suite completa y build (`./init.sh`)

```
--- Formato ---  ✔ formato de feature_list.json y progress/current.md
--- Tests ---    ✔ tests al 100% (node:test)
--- Build ---    ✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
$ pnpm test → # tests 557  # pass 557  # fail 0
```

## Trazabilidad acceptance ↔ REQ

- Módulo importa gsap/ScrollTrigger + pin/scrub → REQ-29-01/02/04.
- Listener `astro:page-load` + limpieza de triggers; `trackShift`
  unitario → REQ-29-03/04.
- `shouldBuildTrigger` + `matchMedia` unitarios/inspección → REQ-29-05.
- Marcado estático + `display: grid` base sin JS → REQ-29-06.
- Pares `title-`/`img-` → REQ-29-07.
- `shouldBuildTrigger`/`landingHidden` + `refresh()` → REQ-29-08.
- Hoja solo tokens + ≤100 líneas por archivo → REQ-29-09/10.

## Notas para el reviewer

- El `design.md` de la 29 documenta como alternativa descartada el
  carrusel con scroll-snap + animación de entrada (corrección verbatim
  del humano); el test lo blinda (`doesNotMatch /scroll-snap/` sobre el
  código sin comentarios, en módulo y hoja).
- `posts-repository.ts` no se toca (sigue 100/100); el orden
  descendente se reutiliza vía el `.slice(0, 3)` de la feature 28.
- Revisión visual en navegador (desktop + ≤768px, ClientRouter y modo
  resultados) pendiente de inspección humana: los tests verifican el
  contrato por inspección + unidades, no el render.
