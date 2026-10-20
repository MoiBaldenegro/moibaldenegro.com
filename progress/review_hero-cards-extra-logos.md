# Review — feature 103

**Veredicto:** APPROVED

(Veredicto vigente: el de la Revisión 2. La Revisión 1, CHANGES_REQUESTED, se conserva debajo como bitácora.)

## Revisión 2 (nivel 1), 2026-10-19

Alcance: solo la 103 y el cambio requerido de la Revisión 1. La spec se ajustó con REQ-103-31..33 y endureció 24/26; el design.md añade «Ajuste de la revisión 1». Los cambios de la 101/102 y los del humano (`sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`) no se evalúan.

### Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (único cambio de código: `src/styles/hero-card-accents.css:24-31`, `.card-backdrop { z-index: 2 }` y el comentario de la regla)
- C2 Sin lógica en la UI, sin `style` inline, sin `<script>`: [x] (`hero-card.astro` no cambia en esta ronda; CDP: 0 atributos `style` en `.hero-grid`)
- C3 Datos vía repositorio: [x] (no cambia)
- C4 Tokens, sin valores sueltos: [x] (opacidad en `--card-backdrop-opacity`; `z-index: 2` sigue la escala local 3/4 de esquina/header)
- C5 ≤100 líneas: [x] (`hero-card-accents.css` 41, `tests/hero-cards-extra-logos.test.mjs` 100)
- C6 Sin dependencias nuevas: [x]
- C7 TDD documentado: [x] (impl, «Ronda de revisión 1»: `REQ-103-31` en rojo con `actual ['0','3',false,undefined]` y `expected ['2','3',false,undefined]` antes de tocar el CSS; luego 11/11 y suite 1075/1075. Lo comprobé: `node --test tests/hero-cards-extra-logos.test.mjs` da 11/11.)
- C8 `depends_on`: [x] (la 103 no tiene dependencias)
- C9 `./init.sh` en verde: [x] (EXIT 0: archivos del arnés, formato, tests al 100 % y build)
- C10 Integridad REQ-103-29: [x] (los sha256 de `hero-card.css` 874030a4…, `tokens.css` 1c353b42…, `sprite.svg` 6b9c3ed3… y `tests/hack-the-box-sprite.test.mjs` 6a02cacf… son iguales a la tabla del impl; `hero-grid-layout.ts` y `hero-grid-template.ts` sin diff frente a HEAD; `hero-card.css` no declara z-index en `.card-icon`, solo en `.card-header:39`)
- C11 La página se ve correcta en desktop y móvil, sin errores de consola: [x] (ver la verificación y la observación 1)

### Verificación independiente (CDP, Chrome headless, build de `./init.sh` + `astro preview --port 4409`, ya parado; :4321, PID 34400, intacto)

Medidor propio: `scratchpad/rv103/m2.mjs`, que es mi `m.mjs` de la Revisión 1 con una sonda `GRID` añadida. Salida en `rv103/feat-r2.json` y capturas en `rv103/shots-r2/`. Líneas base: `rv101/feat.json` para la geometría (estado previo a la 103) y `rv103/feat.json` (Revisión 1) para el hover y el marcado.

- **Cambio requerido 1 / REQ-103-31/32:** el z-index calculado de `.card-backdrop` es 2 en los cinco anchos. En la rejilla 20x5 sobre el `use` del fondo recortado a la card, `elementsFromPoint()[0]` es `.card-backdrop` en **100/100** puntos en CLAUDE CODE y en GITHUB, a 375, 800, 1024, 1280 y 1600. Icono, título, esquina y otros: 0. Para la medida se inyectó un `pointer-events: auto` temporal en los svg de fondo, icono y esquina, y luego se retiró. La cobertura geométrica por el icono no cambia (84 %/91 % a 1280), pero ahora el fondo se pinta encima. Umbral ≥ 60 %: cumple.
- **REQ-103-33 contraste del título:** los paths del sprite son blancos (`anthropic-wordmark` `fill="#ffff"`, `github-wordmark` `fill="#fff"`) y la opacidad calculada es 0.1. Color compuesto contra el título `rgb(255,255,255)`: CLAUDE CODE 8,73:1 sobre `rgb(92,42,28)` y GITHUB 14,46:1 sobre `rgb(9,18,35)`. El peor caso con tinta negra da 12,69 y 18,99. Todo ≥ 4,5:1, igual que en el impl.
- **REQ-103-23/24 solape con el título:** 0 px, tanto por líneas como por la caja de `.card-title`, para la esquina y para el fondo, en los cinco anchos.
- **Esquina visible:** 18x18 a 15/15 px (≤1200) y 22x22 a 17/17 (≥1201). z-index 3, opacidad 1, `aria-hidden="true"`, `focusable="false"`, dentro de la card. El icono principal no la tapa (0 %).
- **Hover (REQ-103-22):** el estado hover de la card y del svg principal de CLAUDE CODE, GITHUB y BUN es **idéntico** a la línea base de la Revisión 1 en los cinco anchos (`translateY(-4px)`, `contrast(1.4)`, icono `matrix(5.59659,…)` o `matrix(2.23864,…)`). Las capas extra quedan con `transform: none`.
- **Cards sin extras:** el `kids` de las 15 cards es idéntico a la base. Las 12 cards sin campos tienen solo `card-header+card-icon`, y el `right` del header de BUN y GITHUB no cambia.
- **REQ-103-25 geometría:** 16 hijos de `.hero-grid` con 0 diferencias (±1 px) frente a la base en los cinco anchos.
- **REQ-103-26 scroll y errores:** `.new-hero` 365/365, 790/790, 1014/1014, 1270/1270 y 1590/1590, y `.hero-grid` sin desborde. Errores de consola, excepción o log: 0. Las capturas `claude-code-<w>.png` y `github-<w>.png` en `progress/research/hero103/` están regeneradas y coinciden con las mías.
- **Valoración visual:** el cambio resuelve el defecto. En `claude-code-1280.png` y `claude-code-1600.png` se lee «ANTHROP\C» entero como marca de agua tenue sobre el pixel art, sin restar protagonismo al icono. En `github-1024.png` y `github-1280.png` «GitHub» se lee entero sobre y bajo el octocat. A 375 y 800 se ve igual de bien. El título y la esquina quedan limpios.

### Observaciones (no bloquean)
1. La tinta del wordmark es blanca al 10 %, así que sobre zonas blancas del icono principal desaparece. A 1600 px (`github-1600.png`) la «H» de «GitHub» cae sobre el círculo blanco del octocat y casi no se ve: se lee «Git ub», aunque la palabra sigue siendo reconocible. A 1280 solo afecta al borde de la «i». Es un límite del valor por defecto de la tinta, no un incumplimiento de REQ-103-32/33. Si el humano lo quiere perfecto, sería una feature de ajuste a cargo del spec_author: por ejemplo, un `mix-blend-mode` o una tinta oscura solo para GITHUB.

---

## Revisión 1 (nivel 1): CHANGES_REQUESTED (resuelto en la Revisión 2)


Revisión nivel 1 (reintento tras corte de API), 2026-10-19. Alcance: solo los archivos de la 103 según `progress/impl_hero-cards-extra-logos.md`. No se han evaluado los cambios de la 101/102 ni los del humano.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (`src/styles/hero-card-accents.css`, importada en `hero-card.astro:3`)
- C2 Sin lógica en la UI (el frontmatter solo importa y pasa datos), sin `style` inline, sin `<script>`: [x] (`hero-card.astro:1-12`; render condicional `{card.x && (...)}` en las líneas 19 y 33; CDP: 0 atributos `style` en `.hero-grid`)
- C3 Datos vía repositorio: [x] (la entidad `hero-card.ts:32-35` y `readSpriteRef` en `hero-cards-parse.ts:60-69` lanzan `HeroCardsDataError` nombrado)
- C4 Tokens, sin colores sueltos: [x] (sin hex/rgb; `bottom: var(--gap-card)`; los offsets en px siguen el precedente de `hero-card.css`, como dice el design.md)
- C5 ≤100 líneas: [x] (parse 99, entity 47, astro 41, accents 40, tests 100/100)
- C6 Sin dependencias nuevas: [x]
- C7 TDD (rojo antes del código, verde al final) documentado en el impl: [x] (9/19 en rojo; la guarda de no-regresión REQ-103-09/10/11 sale verde en rojo, y el impl lo justifica; después 19/19 y suite 1074/1074)
- C8 `depends_on`: [x] (la 103 no tiene dependencias)
- C9 `./init.sh` en verde: [x] (EXIT 0: formato, tests al 100 %, build)
- C10 Integridad REQ-103-29: [x] (sha256 de `hero-card.css`, `tokens.css`, `sprite.svg` y `tests/hack-the-box-sprite.test.mjs` iguales a los del impl; `hero-grid-layout.ts` y `hero-grid-template.ts` sin diff frente a HEAD; los symbols `claude`, `anthropic-wordmark` y `github-wordmark` existen en el sprite)
- C11 La página se ve correcta en desktop y móvil, sin errores de consola: [ ]  ← Razón: el logo de fondo apenas se ve en escritorio (ver Cambio requerido 1). Consola: 0 errores.

## Verificación independiente (CDP, Chrome headless, build de `./init.sh` + `astro preview --port 4407`, ya parado; no se tocó :4321)

Scripts y capturas en el scratchpad `rv103/` (`m.mjs`, `sum.mjs`, `feat.json`, `shots/`). La línea base es mi medida final de la 101 (`rv101/feat.json`, el estado previo a la 103).

- **Geometría (REQ-103-25):** 16 hijos de `.hero-grid` con x/y/w/h/col/row iguales (±1 px) a la base en 375/800/1024/1280/1600. Diferencias: 0.
- **Cards sin extras:** las 12 cards de icono sin campos tienen solo `card-header+card-icon`. El `right` del header de BUN y GITHUB no cambia (sin `.card-corner` no aplica la regla `:has`).
- **Marcado y a11y:** CLAUDE CODE tiene `header > card-backdrop > card-icon > card-corner` y GITHUB `header > card-backdrop > card-icon`. Todos los svg extra llevan `aria-hidden="true"` y `focusable="false"`, con `pointer-events: none`, z-index 3 (esquina) y 0 (fondo), por debajo del 4 del header.
- **Tamaños:** esquina de 18x18 a 15/15 px del borde exterior (≤1200) y de 22x22 a 17/17 (≥1201), como dice la spec más 1 px de borde. Header `right` de 40px y 46px. Franja de fondo de 28 y 40 px de alto con `opacity` 0.1.
- **Solape título/esquina y título/fondo (REQ-103-23/24):** 0 px en los cinco anchos, tanto por líneas de texto como por la caja de `.card-title`. CLAUDE CODE parte en 2 líneas a 800 y 1024, que es lo previsto en la Decisión 3. Título `rgb(255,255,255)` sobre `rgb(92,42,28)` y sobre `rgb(9,18,35)`: contraste AA de sobra.
- **Hover (REQ-103-22):** en CLAUDE CODE, GITHUB y BUN la card queda en `matrix(1,0,0,1,0,-4)` con `contrast(1.4)` y sombra hover, y el icono principal en `matrix(5.59659,0.195437,…)` (≥1201) o `matrix(2.23864,0.0781749,…)` (≤1200). Es lo mismo en las tres cards, así que el principal está intacto. Las capas extra quedan con `transform: none` y sin transición propia.
- **Scroll:** `.new-hero` 365/365, 790/790, 1014/1014, 1270/1270 y 1590/1590; `.hero-grid` sin desborde. Errores de consola, excepción o log: 0.
- **Cumplimiento literal:** se cumplen los 30 REQ.

## Cambios requeridos

1. **El logo de fondo queda casi tapado por el icono principal en escritorio. Es un mal resultado visual para el caso que pidió el humano («como fondo el de anthropic»).** Medido con CDP: porcentaje del rectángulo del wordmark (`.card-backdrop use`) que cubre el rectángulo del icono principal (`.card-icon use`):

   | Ancho | CLAUDE CODE (anthropic-wordmark) | GITHUB (github-wordmark) |
   |------|------|------|
   | 375 | 6 % | 0 % |
   | 800 | 51 % | 74 % |
   | 1024 | 33 % | 54 % |
   | 1280 | **84 %** | **91 %** |
   | 1600 | 62 % | 73 % |

   Las capturas lo confirman. En `progress/research/hero103/claude-code-1280.png` solo se lee «AN» y en `claude-code-1600.png` «ANTH», así que parece una palabra cortada y no un fondo. En `github-1280.png` y `github-1024.png`, «GitHub» queda partido bajo el octocat. Solo a 375 px el fondo se lee entero. El propio impl lo admite («el icono principal … lo tapa en parte»), pero se dejó así. El fallo viene de los valores por defecto (ae) del design.md: la franja va a todo el ancho inferior, por debajo de un icono que en escritorio, a escala 5, ocupa la mitad inferior derecha de la card. Hay que conseguir que el wordmark de fondo se lea entero (o casi) a los cinco anchos, manteniendo lo que ya está bien: solape 0 con el título, geometría, hover, `aria-hidden` y cards sin extras intactas. Por ejemplo:
   - (a) pintar la capa de fondo por encima de `.card-icon` (z-index entre el del icono y el 4 del header). A opacidad baja queda como marca de agua sobre todo, también sobre el icono.
   - (b) moverla a la franja central o superior libre de la card, entre el header y el icono.
   - (c) otra colocación que el spec_author justifique.

   Como cambia un valor del design.md (y quizá REQ-103-09/19, por el orden en el DOM o la posición), lo tiene que actualizar el spec_author antes de que el implementer lo corrija: test en rojo con un umbral medible, por ejemplo «≤ 25 % del wordmark cubierto por el icono principal a los cinco anchos», y luego en verde. Después hay que regenerar las capturas `claude-code-<w>.png` y `github-<w>.png` en `progress/research/hero103/`.
