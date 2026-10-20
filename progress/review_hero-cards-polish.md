# Review — feature 101

**Veredicto:** APPROVED

Alcance revisado (git diff, solo la 101): src/styles/{tokens,hero-card,hero-section,htb-card,htb-stadistics}.css, specs/101_hero-cards-polish/design.md, tests/hero-cards-polish.test.mjs (nuevo), tests/{design-tokens,hero-cards-unique-tech,hero-cards-icon-fit,hero-cards-styles,system-design-nav-link}.test.mjs y progress/research/hero101/. No he revisado lo AJENO: public/assets/svg/sprite.svg, src/content/posts/systems-design/*.md y tests/hack-the-box-sprite.test.mjs. En feature_list.json, el cambio de estado de la 93 y la 100 y la entrada de la 102 son del líder y quedan fuera de esta revisión.

Dependencias: depends_on [100] y la 100 está `done`. La 101 está `in_progress`.

## Evidencia test-first (progress/impl_hero-cards-polish.md)
- Rojo antes del código: 32 tests, 12 fallos. Entre ellos los nuevos REQ-101-01/04/07/11-13/14/21 y los tests ajustados REQ-02-03, REQ-97-19/20, REQ-98-18/19 y REQ-97-05..08. REQ-101-15/16/17/19 son guardas y pasan antes y después, lo que es correcto.
- Las guardas REQ-93-13/37 dieron rojo con el código puesto (1062/1064). Están documentadas como aviso 3 y se reapuntaron.
- Verde: pnpm test da 1064/1064. Además ejecuté `./init.sh` yo mismo: exit 0 (formato, tests al 100 %, build y «El entorno está perfecto»).

## Verificación independiente (Chrome headless + CDP; mis scripts en scratchpad/rv101/)
Mi medidor es propio y distinto del del implementer. El área del logo sale de `getBoundingClientRect()` del `<use>`, es decir, de la geometría real del símbolo con el transform aplicado, recortada al article. No usa el viewBox proyectado.

Línea base: la build de HEAD en un worktree no enlazaba el CSS (artefacto del junction), así que medí la base sobre el mismo HTML cambiando las tres hojas por los bundles CSS de HEAD (index/Layout/HtbStadistics). Hice un control con el mismo mecanismo y las hojas de la feature: sale idéntico a la medida normal en los 7 anchos (items y cards byte a byte). Además, la base reproduce los defectos de partida: CSS 456,3 px², HTML 605,6 px² y aviso HTB roto a 769/800.

| Comprobación | Resultado (375/769/800/1024/1200/1280/1600) |
|---|---|
| Geometría del mosaico frente a la base | 1280/1600: x/y/w/h/col/row idénticos en los 16 items (REQ-101-18). 375: idéntica. 769-1200: misma columna, orden y anchos; solo la fila 2 baja de 149 a 140 px (el aviso HTB ya no estira la fila; es el aviso 4 del informe y es una mejora) |
| Solape título/logo, 14 cards de icono | 0 px² en todos los anchos (base: CSS/HTML 456/606 a 769-1024 y 220/258 a 1200) |
| Logo: centro dentro y >= 40 % visible | 14/14 en todos los anchos; mínimo 57,2 % (YOUTUBE a 1280/1600) |
| Títulos de las 15 cards | cada palabra en 1 caja y dentro del article |
| Aviso HTB | «Estadísticas», «no», «disponibles» en 1 caja cada una, rect dentro del article y 0 px² con el título, en los 7 anchos (base: falla a 769/800) |
| Grandes frente a la mediana de las 11 cards 2x2 (1280 y 1600) | NODE JS 1,99x, NESTJS 1,92x, TYPESCRIPT 2,12x (base 1,13/1,09/1,19); logo visible 69/70/65 % con centro dentro |
| Contraste | NESTJS #3A0D18 (rgb 58,13,24 calculado) frente al título blanco 16,79:1 y frente al logo #E0234E 3,61:1. Mínimo de los títulos del hero 4,98:1 (CLAUDE, sin cambio) |
| Scroll horizontal | ni el documento ni .new-hero desbordan |
| Atributo style / script | 0 / 1 (el de la server island, igual que en la base) |
| Errores de consola | 0 en los 7 anchos |

Capturas: las 5 de progress/research/hero101/ (más before/) coinciden con las mías (shots-feat). Visualmente, a 1280/1600 las grandes ganan presencia sin verse raras: el hexágono de NODE JS y la cabeza de NESTJS se reconocen bien. El «TS» de TYPESCRIPT asoma con las letras cortadas por abajo (65 % visible), en la línea del sangrado de CSS, AWS o GITHUB. NESTJS se distingue con claridad sobre el granate oscuro. A 800 el aviso HTB se lee entero en 2 líneas y CSS/HTML dejan su título libre.

## Valoración de las 4 desviaciones
1. **REQ-101-14 (premisa falsa).** Confirmado: `src/styles/hero-section.css:46-50` define --card-column/--card-row (REQ-98-18) y las dos líneas que se quitaron de hero-card.css eran las que aplicaban los spans. Mover `grid-column/grid-row` a `hero-section.css:52` (`.hero-grid > .hero-card`) cumple la letra (hero-card.css sin referencias) y la intención (limpieza, celda junto a sus spans) sin romper REQ-101-18: la geometría a 1280/1600 es idéntica. El `auto !important` de `hero-card.css:70/91` sigue ganando en <= 1200 y <= 768. Se acepta.
2. **--icon-scale 7 en las grandes de escritorio.** El diagnóstico es correcto: el `<svg>` mide 32px de alto (`hero-card.astro:20`) y el viewBox se ajusta por altura, así que el ancho solo desplaza el logo. design.md permitía calibrar y la tabla está actualizada con lo medido. Los anchos 240/230/220 de REQ-101-04 se conservan y la escala solo se aplica >= 1201 px, porque el @media fija 3/3/2. Se acepta.
3. **Guardas REQ-93-13/37 reapuntadas a 268e9ad y 6b75e45.** He comprobado que esos commits contienen el código de la 93 (ronda 1: layout.css y nav-label.css; ronda 3 dentro de 6b75e45: site-menu.css, search-bar.css, layout.css y site-menu.ts). La intención original («la 93 no toca media queries ajenas, tokens.css ni dependencias») se mantiene y deja de depender del árbol de trabajo, con el mismo precedente que la 102 en REQ-93-04/21/22. Se conservan `tokens.css == 99 líneas` y `site-menu.css <= 100`. Cada línea lleva la nota (`tests/system-design-nav-link.test.mjs:337-344,377-378`). No se debilita nada: la guarda nunca tuvo el propósito de vigilar features posteriores. Se acepta.
4. **Padding superior de HTB x4,5 (antes x3,5).** Es una calibración prevista («valores calibrables con la medida de REQ-101-11/12»), está documentada en design.md con la medida de x3,5 (79 px²), sale de `--gap-card` y se limita a las dos hojas HTB (REQ-101-13; los .astro no cambian respecto de 0c786e4). Se acepta.

Invariantes previas: el mosaico de la 99 está intacto, el dominio y hero-cards.json no cambian respecto de 0c786e4 (REQ-101-17, test), el contraste AA se mantiene, ningún archivo de la 93 (layout.css, site-menu.css, search-bar.css, site-menu.ts) aparece en el diff, y cada test ajustado lleva «Ajuste feature 101 (precedente REQ-43-06)» (REQ-101-20).

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x]. Ningún .astro tocado.
- C2 (sin lógica en la UI; datos vía repositorio): [x]. Sin cambios en .astro ni en el dominio.
- C3 (tokens, sin valores sueltos): [x]. Colores solo desde tokens.css (test REQ-101-15) y paddings HTB desde --gap-card.
- C4 (<= 100 líneas): [x]. hero-card.css 99, hero-section.css 65, htb-card.css 30, htb-stadistics.css 63, tokens.css 99 y hero-cards-polish.test.mjs 100.
- C5 (sin dependencias nuevas): [x].
- C6 (`./init.sh` verde): [x]. Exit 0, ejecutado por el reviewer.
- C7 (página correcta en escritorio y móvil sin errores de consola): [x]. CDP en 7 anchos y 0 errores.
- C8 (artefactos de sesión y sin temporales en el repo): [x]. Mis scripts están en el scratchpad; preview 4421/4422 y worktree retirados; el :4321 (PID 34400) no se tocó.

## Observaciones no bloqueantes
1. `tests/system-design-nav-link.test.mjs` (143 líneas; 128 en HEAD) y `tests/hero-cards-styles.test.mjs` (181; 177 en HEAD) ya pasaban de 100 antes de la 101, y la 101/102 los alargan un poco. Conviene partirlos en una feature de limpieza.
2. El «TS» de TYPESCRIPT a escala 7 asoma cortado (65 % visible). Cumple REQ-101-06 con margen, pero si el humano lo prefiere más entero puede bajarse a 6 solo en typescript (1,70x según el informe).
3. Los valores revisables para el humano (#3A0D18, escala 7 y HTB x4,5 / 0,75rem) están listados en el informe.

## Cambios requeridos
Ninguno.
