# Review — feature 96

**Veredicto:** APPROVED

> **Veredicto vigente: el de la Revisión 3** (abajo). El Cambio requerido 1 de la Revisión 2 (card 3 invisible con el
> scroll restaurado) queda resuelto. Las Revisiones 2 y 1 se conservan debajo como histórico.

## Checkpoints (Revisión 3)
- C1: [x]. No hay CSS nuevo ni `<style>` en `.astro`.
- C2: [x]. La lógica pura (`cardPhase` y `phaseState`) vive en `src/domain/latest-cards-motion.ts:22-41`, sin gsap, window
  ni document (el test lo comprueba). El runtime está en `cards-motion.ts` y en el módulo hermano `cards-sync.ts`.
- C3: [x]. No cambia.
- C4: [x]. Sin valores sueltos en CSS. Los px de la animación salen de `CARDS_ENTER`/`CARDS_EXIT`.
- C5: [x]. Líneas: cards-motion.ts 99, cards-sync.ts 42, latest-cards-motion.ts 41, latest-cards-gsap-motion.test.mjs
  100, latest-cards-scroll-restore.test.mjs 78, gsap-dependency-approval.test.mjs 74.
- C6: [x]. `package.json` y el lockfile no cambian. `cards-sync.ts` importa gsap y la nota «Ajuste feature 96» lo recoge
  en REQ-70-08/09 (`tests/gsap-dependency-approval.test.mjs:61-73`).
- C7: [x]. Ejecuté `./init.sh` yo mismo: EXIT 0, «El entorno está perfecto», tests al 100 % y build OK.
- C8: [x]. El impl («Ronda de revisión 2», «Rojo») documenta seis rojos sucesivos antes del código: cardPhase y
  phaseState, progress frente a isActive, silencio, `stop()` y cards-sync.ts, scale 1 y coalesce. También el verde:
  15/15 en los tests de la 96, 1009/1009 en `pnpm test` y `./init.sh` verde. REQ-70-08/09 salió en rojo en la suite al
  crear cards-sync.ts y se amplió con nota, lo que se acepta.
- C9: [x]. La vista es correcta en desktop y móvil con el scroll restaurado y no hay errores de consola (ver abajo).
- C10: [x]. La 96 sigue en `in_progress`. Los scripts de medición están en el scratchpad y no en el repo.

# Revisión 3

Alcance: solo la feature 96, contra REQ-96-01..52 y design.md («Restauración del scroll (revisión 4)», :122). Quedan
fuera `public/assets/svg/sprite.svg`, `tests/hack-the-box-sprite.test.mjs`, la 93 y la 95. La 96 no tiene `depends_on`.

## Revisión del código
- `cards-motion.ts:64-98` (horizontal):
  - Ya no hay `hide(cards)` incondicional.
  - `sync = phaseSync(...)` y `sync()` van después de crear los triggers (`:81-82`).
  - En el refresh se hace `restore(); sync();` (`:90`), con alta y baja del listener (`:92`, `:95`).
  - La limpieza anula una resincronización pendiente (`:94`).
- `cards-sync.ts:33-41`: `phaseSync` fuerza `t.update(false, false, true)` con los callbacks en silencio, decide la fase
  con `cardPhase` y solo coloca la card si su fase difiere de la última pedida, así que no corta un tween en curso.
- `stop()` (`:12`) mata enteros solo los tweens con `opacity` de esas cards. La timeline de x de la 76 no tiene opacity y
  no se toca. Sigue sin haber `overwrite` y x no se toca nunca (lo exige el test), así que REQ-96-22 se mantiene.
- REQ-96-51 pide decidir «con trigger.isActive y trigger.progress o con los callbacks equivalentes». La implementación
  usa solo `progress`, justificado y medido en el impl (isActive no es coherente tras un refresh con
  containerAnimation). **Lo acepto** porque isActive se deriva de progress y la medida de REQ-96-52 cuadra.

## Verificación independiente (Chrome headless + CDP)
Sobre el build de `./init.sh`, con un preview propio en :4347 que ya he parado. No toqué :4321 (pid 34400). Scripts en
`scratchpad/rv96/`: `r6.mjs`, `main.mjs`, `r2.mjs`, `r3.mjs` y `rest.mjs`.

**REQ-96-52 a 1280×800** (`r6.mjs`). Para cada y se compara la rueda real desde carga limpia con la recarga (Page.reload)
y con history.back desde un artículo vía footer, tras 2,5 s y sin rueda. Formato por card: [left respecto a la sección,
opacity, tx de la matriz, scale]. El tx incluye la x de la 76.

| y | card 1 | card 2 | card 3 | rueda = recarga = back |
|---|---|---|---|---|
| 1510 | −282,25 / 1 / −8,88 / 1 | 336,88 / 1 / 0 / 1 | 956 / 1 / 8,88 / 1 | sí (±0) |
| 1815 | −656,28 / 0 / −77,78 / 1 | 31,75 / 1 / 0 / 1 | **642 / 1 / 0 / 1** | sí |
| 2000 | igual que 1815 | igual | **642 / 1 / 0 / 1** | sí |
| 2280 | igual que 1815 | igual | **642 / 1 / 0 / 1** | sí |
| 2295 | −656,28 / 0 / −77,78 / 1 | −28,28 / 0 / −60,03 / 1 | 581,97 / 0 / −60,03 / 1 | sí |

- En 1510 el tx de ±8,88 de las extremas es la x de la 76 y coincide con la rueda, así que xPercent es 0.
- **Clic en la card 3 al final del tramo.** Carga limpia, rueda hasta 1815, clic en la card 3 (navega a
  `/posts/01-procesos-memoria/`) y `history.back()`. Vuelve a y 1815 con card 1 op 0, card 2 en 31,75 / op 1 y **card 3
  en 642 con margen derecho 31,75 y op 1**: idéntico a antes del clic. Al subir a 1205 quedan 31,75 / 642 con op 1, y al
  bajar de nuevo a 1815 el margen de la card 3 sigue en 31,75. Captura: `rv96/shots3-back-card3-1815.png`.
- **Apilado a 375.** En y 3106, 3713 y 4283 (una card a media pantalla) la recarga y el back coinciden con la rueda. Las
  cards activas están en op 1 / tx 0 / scale 1, las no alcanzadas en el estado de hide() (+72 / 0,96 / op 0) y la salida
  en −60 / op 0.

**REQ-96-49/50** (`r3.mjs` y `r2.mjs`):
- Carga limpia y rueda hasta 1815: título en 31,75 y card 3 con margen derecho 31,75.
- Recarga en 2295, 2280, 2000 y 1815, y back desde 2295: al subir a 1815 la card 3 tiene margen 31,75, y en 1205 la
  **card 1 está en left 31,75** y la card 2 en 642.
- Al bajar otra vez a 1815 todo queda igual.

**Lo esencial, sin regresiones:**
- 3 cards y 3 `site-footer__post` a 375, 768, 1024 y 1280. Sin scroll horizontal en 15 posiciones por ancho.
  `.latest-articles--horizontal-pin` solo existe a 1280.
- Card 2 en apilado, 375 / 768, con tweens por tiempo:
  - Bajo el pliegue: 72 / op 0.
  - Entrada: 39,4 / 0,45 y 36,3 / 0,50 a ~200 ms, y 0 / 1 a 1 s.
  - Salida: −60 / 0.
  - Regreso: −38,8 / 0,45 y −42 / 0,41, y luego 0 / 1.
  - Por encima: +60 / 0.
- Horizontal a 1280:
  - Llegada: 22,8 / 0,68 y 47,3 / 0,34 a ~150 ms, y luego 32 / 642 con op 1.
  - Sticky: sección en top 0 / left 0 / right 1270 al final del tramo.
  - Salida del par final: −60 / 0. Regreso a 32 / 642 con op 1.
  - Por encima de la llegada: +60 / op 0.
  - La x de la 76 no está congelada: card 1 va de −2,76 (1300) a −8,58 (1500) y card 3 de 9,17 a 3,35 y a 0 (1815),
    con los mismos valores al volver.
  - Viewports 1440×1000 y 1920×1080: el par final se ve al final del tramo y sale al fondo.
- Tab: con 4 Tab se llega a la card 1 (op 1, identidad). `focus({preventScroll})` lleva la card 3 de op 0 a op 1.
- Reduced motion a 375 y 1280: 33 de 33 muestras sin style, con transform none y op 1. 0 ScrollTrigger y sin pin.
- Sin JS a 375 y 1280: style null, transform none y op 1.
- CLS en carga limpia: 375 → 0, 768 → 0, 1024 → 0,008, 1280 → 0. El 0,5125 de la secuencia encadenada a 1280 sigue
  siendo el pendiente humano (c), ajeno a la 96.
- ScrollTrigger tras ida y vuelta con el ClientRouter (dos vueltas): 1280 da 5→0→5→0→5 y 375 da 3→0→3→0→3.
- 0 errores de consola en todos los scripts.
- `dist/client/index.html` pesa 38 063 B (< 40 000).

## Observaciones (no bloqueantes)
1. El texto de REQ-96-51 dice «con trigger.isActive y trigger.progress». La implementación usa solo progress, de forma
   justificada. Conviene que `spec_author` alinee el texto («con trigger.progress…»), sin cambiar código.
2. Parte de esta ronda ya está en el commit `3f8f06f`, previo a esta revisión: `src/domain/latest-cards-motion.ts` con
   `cardPhase`/`phaseState`, la primera versión de `tests/latest-cards-scroll-restore.test.mjs` y REQ-96-51/52. El resto
   (cards-motion.ts, cards-sync.ts y los tests ajustados) sigue sin commit. Lo dejo anotado para el líder, porque la
   feature se commiteó parcialmente antes de aprobarla.
3. `stop()` (`cards-sync.ts:12`) identifica los tweens propios por `'opacity' in t.vars`. Si en el futuro otro tween
   anima opacity sobre las cards, también lo mataría. Hoy no hay ninguno. Convendría un comentario o una marca explícita
   si se amplía.
4. El impl avisa de que sobrescribió `rv96/shots2/back-card3-1815.png` (la captura del defecto de la Revisión 2). La
   nueva captura de la Revisión 3 está en `rv96/shots3-back-card3-1815.png`.

---

# Revisión 2 (histórico; su Cambio requerido 1 quedó resuelto en la Revisión 3)

**Veredicto (Revisión 2):** CHANGES_REQUESTED. Checkpoints: C1-C8 y C10 [x], C9 [ ] (card 3 invisible con el scroll
restaurado).

Alcance: solo la feature 96. Quedan fuera `public/assets/svg/sprite.svg`, `tests/hack-the-box-sprite.test.mjs`, la 93
y la 95. La 96 no tiene `depends_on`.

## El cambio de la Revisión 1 está resuelto
- Los cuatro tweens, en `src/components/latest-horizontal/cards-motion.ts:30`, `:33` y `:44`, van con
  `ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.to|fromTo(...)))` y ninguno lleva `overwrite`.
  Esto cumple REQ-96-22 en su revisión 3.
- `keep`/`restore` (`:88-89`) solo guardan y reponen `xPercent` y `scale`, nunca x. El test lo exige (`:54`).
- La interpretación «11,73 = x de la 76» está retirada del impl.
- La x de la 76 ya no se congela (1280×800, carga limpia, rueda real, `rv96/rest.mjs`):

  | y | card 1 | card 3 |
  |---|---|---|
  | 1300 | −2,76 | +14,99 |
  | 1500 | −8,58 | +9,17 |
  | 1700 | −14,40 | +3,35 |
  | 1815 | −17,75 | 0 |

  Al volver a 1700 y 1500 los valores son los mismos.
- **REQ-96-49** (`rv96/r3.mjs`): con carga limpia y rueda hasta y = 1815 exacto, la sección va de 0 a 1270 y el
  título está en left 31,75. La card 2 queda en 31,75 y la card 3 tiene un **margen derecho de 31,75**. Cumple.
- **REQ-96-50** (`rv96/r3.mjs`), probado de dos formas: recargando con el scroll en 2295 (el máximo), y yendo
  del fondo a un artículo y volviendo con history.back (vuelve a 2295).
  - Al subir a 1815, la card 3 tiene margen 31,75.
  - En el reposo de llegada (y 1205), la **card 1 está en left 31,75** y la card 2 en 642.
  - Cumple, sin errores de consola.

## Lo ya validado no tiene regresiones
Verificado con Chrome headless + CDP, sobre el build de `./init.sh` y un preview propio en :4347, ya parado. No toqué
:4321 (pid 34400).
- 3 cards y 3 `site-footer__post` a 375, 768, 1024 y 1280, sin scroll horizontal en ninguna de las 15
  posiciones de cada ancho. A 1280 existe `.latest-articles--horizontal-pin`.
- Card 2 en apilado:

  | | 375 | 768 |
  |---|---|---|
  | Bajo el pliegue | 72 / op 0 | 72 / op 0 |
  | Entrada, 200 ms | 39,5 / op 0,45 | 36,1 / op 0,50 |
  | Entrada, 1 s | 0 / op 1 | 0 / op 1 |
  | Salida | −60 / op 0 | −60 / op 0 |
  | Regreso, 200 ms | −42 / op 0,40 | −42 / op 0,40 |
  | Regreso, 1 s | 0 / op 1 | 0 / op 1 |
  | Por encima | +60 / op 0 | +60 / op 0 |

  Son tweens por tiempo y no hay scrub.
- Modo horizontal a 1280:
  - El par de llegada entra con stagger (20 / op 0,72 y 43 / op 0,40 a 150 ms) y termina en 32..628 y
    642..1238 con op 1.
  - Sticky: la sección queda en top 0 al final del tramo.
  - En el fondo, el par final sale a −60 / op 0. Al subir vuelve a 32 / 642 con op 1.
  - Por encima de la llegada, el par sale por la derecha (+60 / op 0).
- Tab: con 4 Tab se llega a la card 1 (op 1, identidad). `focus({preventScroll})` lleva la card 3 de op 0 a op 1.
- Reduced motion a 375 y 1280: 33 de 33 muestras sin style, con transform none y op 1. 0 ScrollTrigger.
- Sin JS: cards completas (style null, transform none, op 1).
- CLS en carga limpia: 375 → 0, 768 → 0, 1024 → 0,0034, 1280 → 0 (`r2.mjs`).
  - El 0,5125 de la secuencia encadenada de `main.mjs` a 1280 viene de la recarga con el scroll heredado de 1024,
    un shift del footer antes del JS. Ya figura como pendiente humano (c) y no es de esta feature.
- ClientRouter, dos vueltas: 1280 da 5→0→5→0→5 y 375 da 3→0→3→0→3, con 0 errores de consola.
- `dist/client/index.html` pesa 38 067 B (< 40 000).

## Cambios requeridos
1. **La card 3 queda invisible al restaurar el scroll dentro o después del tramo horizontal (1280×800).** Pasa con
   recarga y con history.back. La única excepción es el scroll máximo exacto.
   - Medidas (`rv96/r3.mjs` y `rv96/r4.mjs`, sin rueda tras restaurar). Posiciones relativas a la sección, en el
     formato [left, margen derecho, opacity]:
     - Recarga en 1815, 2000 o 2280:
       - card 1 `[-596,25, 1270, 1]`
       - card 2 `[31,75, 642, 1]`
       - **card 3 `[725,95, -28,35, 0]`**
       - Al subir a 1815 sigue igual: la tercera ocupa su hueco en pantalla con opacity 0 y el estado de `hide()`
         (xPercent +72 px, scale 0,96).
       - Solo se recupera al subir hasta el inicio del tramo (y 1205) y volver a bajar.
     - **Flujo habitual con el ClientRouter**: carga limpia, rueda hasta 1815 (card 3 visible en 642, op 1), clic en la
       card 3 y `history.back()`. Al volver a y = 1815, la card que se acaba de pulsar está en op 0.
       - Captura: `rv96/shots2/back-card3-1815.png`, con solo la card 2 y un hueco vacío a la derecha.
     - Recarga a mitad del tramo (y 1510): card 3 en left 1040 (dentro de la sección, ya pasado `left 85%`) con op 0.
     - Con la recarga exacta en 2295 sí se ve, porque ahí dispara el trigger de salida del par final y su onEnterBack la anima.
   - En apilado (375), con recarga y history.back y una card en vista, las cards visibles quedan en op 1. Esto solo
     afecta al modo horizontal.
   - Causa probable: al restaurar el scroll, los triggers `cross` (`containerAnimation: timeline`,
     `cards-motion.ts:73-79`) no lanzan su `onEnter` para las cards que ya pasaron `crossStart`. A eso se suma que
     `hide(cards)` va después de crearlos (`:85`). Lo debe diagnosticar el implementer, por ejemplo sincronizando
     al terminar el refresh el estado de cada card con `trigger.progress` o `isActive`.
   - REQ-96-50 solo cubre el fondo, así que la spec no cubre este caso. Antes de cambiar el test y el código hay que pedir
     a `spec_author` un requisito nuevo, por ejemplo: «WHEN la portada se carga con el scroll restaurado (recarga o
     history.back) en cualquier posición del tramo o posterior a 1280×800, toda card cuyo rectángulo cae dentro de
     la sección tras los tweens SHALL quedar con opacity 1, xPercent 0 y scale 1».
   - Evidencia CDP en el impl:
     - Recargas en 1510, 1815, 2000 y 2280.
     - Clic en la card 3 a 1815 y history.back.
     - Repetir REQ-96-49/50 y la ida y vuelta del ClientRouter.
   - No he comprobado si el defecto ya existía en la Revisión 1. El cambio de `overwrite` no afecta al disparo de los
     triggers.

---

# Revisión 1 (histórico; su Cambio requerido 1 quedó resuelto en la Revisión 2)

**Veredicto (Revisión 1):** CHANGES_REQUESTED

Alcance: solo la feature 96 (latest-cards-gsap-motion, rama H-integrado), contra REQ-96-01..48 y design.md
(revisión 2). Quedan fuera `public/assets/svg/sprite.svg`, `tests/hack-the-box-sprite.test.mjs`, la 93
(blocked) y la 95 (done), salvo los ajustes de tests con nota. La 96 no declara `depends_on`, así que no hay
dependencias pendientes.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, ningún `<style>` en `.astro`: [x]. `src/styles/latest-cards-motion.css`
  (7 líneas) solo declara `.home__landing { overflow-x: clip; }`. `latest-cards-slide.css` está borrado y nadie lo referencia.
- C2 Lógica fuera de la UI: [x]. Los valores están en `src/domain/latest-cards-motion.ts` (21 líneas,
  congelados, sin gsap ni window ni document). El runtime está en `cards-motion.ts`.
  `site-footer.astro:13` solo pasa `FOOTER_LATEST_POSTS_LIMIT`.
- C3 Datos vía repositorio: [x]. No cambia.
- C4 Tokens: [x]. No hay longitudes ni colores en CSS. `tokens.css`, `latest-articles.css`, `latest-horizontal.css`,
  `latest-articles.astro` y `src/domain/latest-horizontal.ts` no cambian frente a HEAD (`git diff --quiet HEAD`).
- C5 ≤ 100 líneas: [x]. cards-motion.ts 97, latest-horizontal.ts 92, track-dom.ts 36, latest-cards-motion.ts 21,
  latest-horizontal.astro 12 y el test nuevo 100.
- C6 Sin dependencias nuevas: [x]. `package.json` y el lockfile no cambian. gsap 3.15.0 ya estaba aprobado (70).
- C7 `./init.sh` verde: [x]. Lo ejecuté yo: EXIT 0 («El entorno está perfecto»), tests al 100 % y build OK.
- C8 Test primero (rojo/verde): [x]. El impl documenta el rojo del test nuevo (9/9 fail), el de los ajustados
  (11 fail) y el de las dos correcciones, más el verde final (1003/1003).
- C9 Vista correcta en desktop y móvil sin errores de consola: [ ]. Razón: regresión de la x de las cards
  extremas de la feature 76 en el modo horizontal (Cambio requerido 1). No hay errores de consola.
- C10 Harness: [x]. La 96 está en `in_progress` y la rama H-integrado aparece en current.md y en el impl
  (REQ-96-30). Los scripts de medición están en el scratchpad, no en el repo.

## Verificación independiente (Chrome headless + CDP, build de ./init.sh, preview propio en :4347, ya parado)

Cumple:
- REQ-96-43: 375/768/1024/1280 tienen 3 cards y 3 `site-footer__post`. `scrollWidth <= clientWidth` en las 15
  posiciones de scroll de cada ancho.
- REQ-96-44: secuencia de la card 2 a 375 y 768:
  - Bajo el pliegue: 72/op 0.
  - Entrada (a 200 ms): 36/op 0,5. A 1 s: 0/op 1.
  - Salida: −60/op 0.
  - Regreso (a 200 ms): −42 (375) y −39 (768). A 1 s: 0/op 1.
  - Por encima: +60/op 0.
  - Son tweens por tiempo: siguen avanzando sin scroll, no hay scrub.
- REQ-96-45 (lo que mide el criterio): a 1280×800 existe `.latest-articles--horizontal-pin` y el sticky se
  mantiene (top de la sección = 0 en todo el tramo 1205→1815). Al final, la card 2 queda en 32..628 y la 3 en
  653..1250, dentro de la sección (0..1270) con op 1.
  - Con rueda real: el par inicial entra por la derecha con stagger y la tercera cruza el borde desde la derecha.
  - El par final sale por la izquierda en el fondo y vuelve por la izquierda al subir. Por encima de la llegada, el par sale por la derecha.
- REQ-96-36/47 (teclado): 4 Tab hasta la card 1 (op 1, identidad). `focus({preventScroll:true})` sobre la
  card 3 con op 0 la lleva a op 1 en 1 s.
- REQ-96-34/46: con reduce a 375 y 1280 salen 33/33 muestras sin atributo style, con transform none y op 1.
  No hay ScrollTrigger ni envoltorio.
- REQ-96-35: sin JS, las cards se ven completas (style null, transform none, op 1) a 375 y 1280.
- CLS al recorrer: 375 → 0, 768 → 0, 1024 → 0,0034, 1280 → 0.
- REQ-96-32/33: ClientRouter, dos vueltas portada → artículo (clic con tween en curso) → history.back.
  ScrollTrigger: 1280 da 5→0→5→0→5 y 375 da 3→0→3→0→3. Cero errores de consola. El recuento sale de
  `Runtime.queryObjects` + `constructor.getAll()`, sin globales de depuración.
- REQ-96-06/07: `dist/client/index.html` = 38 059 B (< 40 000). El umbral vuelve a 40 000 con su nota.
- REQ-96-48: frames en `progress/research/home96/` coherentes (estados intermedios visibles). En
  `horizontal-1280-4-salida-izquierda.png` la captura coincide casi con el inicio del tween (cards casi opacas).
  Aceptable.
- `clamp(bottom 40%)` (REQ-96-26): lo acepto como lectura válida. El start sigue siendo `CARDS_HORIZONTAL.leave`
  y cae después del final del tramo (1815 < 2295 a 1280×800). Sin clamp, a 1280×800 el punto coincide con el
  scroll máximo y no se alcanza la salida que exige REQ-96-45. A 1440×1000 y 1920×1080, `bottom 40%`
  (2491 / 2610) supera el máximo (2330 / 2401). El par final se funde al llegar al fondo, con el borde inferior
  de las cards en y≈283-297. Es decir, más arriba que en el punto nominal, así que no se adelanta respecto
  al diseño. Queda como valor revisable por el humano.
- REQ-96-17: en el horizontal, `hide(cards)` va después de crear los triggers (cards-motion.ts:84). Se desvía de
  la letra, pero la desviación está justificada en el impl y la medida en carga limpia es correcta.
  Observación, no bloquea.

No cumple: ver Cambio requerido 1.

## Cambios requeridos
1. **REQ-96-28 / regresión de la feature 76: `overwrite: true` mata la x de las cards extremas.**
   - Dónde: `src/components/latest-horizontal/cards-motion.ts:31`, `:33` y `:43`.
   - Causa: en GSAP, `overwrite: true` mata *todos* los tweens de los mismos targets, sean cuales sean las
     propiedades. Eso incluye el `fromTo(cards[i], { x: edgeOffsets(0…) }, { x: edgeOffsets(1…) })` de la
     timeline (`latest-horizontal.ts:71`). Desde el primer enter/exit sobre la card 1 o la 3, su x queda
     congelada en el valor de ese instante.
   - Medida con carga limpia y rueda real a 1280×800:
     - La card 1 conserva `transform: translate(0px, 0px)` en y = 1000, 1300 y 1500. Debería ir de 0 a −17,75
       (`edgeOffsets`: `offsets[0] = −delta·p`).
     - La card 3 se congela en `translate(11.4939px, 0px)` de y = 1500 a y = 1815. Debería llegar a 0
       (`offsets[n−1] = delta·(1−p)`).
     - Resultado: al final del tramo la tercera queda en 653..1250. Margen derecho de 20 px frente a 32 a la izquierda.
   - El impl interpreta mal la cifra: «→ 11,73 = x de la 76» al final del tramo. En p = 1, la x de la 76 de la
     última card es 0. Lo que se ve es la x congelada.
   - Con recarga al fondo de la página (scroll restaurado, también al volver con history.back desde un
     artículo), las x se congelan en los valores finales (card 1 −17,75 y card 3 0). El par de llegada reposa
     entonces con la card 1 en left 14 en vez de 32: desalineada 18 px del título. En ese caso la tercera
     cruza en 1312 en vez de 1324+.
   - Arreglo: que los tweens solo interrumpan sus propias propiedades. Por ejemplo, `overwrite: 'auto'`, o
     `gsap.killTweensOf(els, 'xPercent,scale,opacity')` antes de cada tween con `overwrite: false`. Las dos
     opciones chocan con la letra de REQ-96-22 («overwrite true»), que el test nuevo exige
     (`tests/latest-cards-gsap-motion.test.mjs:53`). Hay que ajustar REQ-96-22 y su acceptance con
     `spec_author` antes de cambiar el test y el código. La intención de REQ-96-22 («un callback nuevo
     interrumpe al anterior sin que dos tweens compitan») se mantiene.
   - Test en rojo antes del cambio: que los tweens de cards-motion.ts no declaren `overwrite: true`, o que
     declaren el overwrite por propiedades elegido.
   - Evidencia CDP en el impl:
     - A 1280×800 con rueda real, la card 1 pasa de x 0 a −17,75 y la card 3 de +17,75 a 0 a lo largo del tramo.
     - Al final del tramo, la card 3 queda en 642..1238.
     - Tras recargar al fondo y subir, el par de llegada queda en left 32 / 642.
2. Tras el cambio 1, repetir REQ-96-45 (llegada, cruce, salida y regreso) y la ida y vuelta del ClientRouter, y
   anotar las cifras corregidas en `progress/impl_latest-cards-gsap-motion.md`. Hay que retirar la
   interpretación errónea «11,73 = x de la 76». Si `keep`/`restore` (cards-motion.ts:85-90) siguen siendo
   necesarios con el overwrite por propiedades, verificar que no reponen una x desfasada.
