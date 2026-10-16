# Review — feature 99

**Veredicto:** APPROVED

Alcance: solo la feature 99 hero-os-panel-mosaic (REQ-99-01..34). La 93 (blocked) no se evalúa. Revisor: reviewer (nivel 1), 2026-10-16.

## Checkpoints
- C1 (arquitectura: estilos en `src/styles/`, sin `<style>` en `.astro`, frontmatter solo imports y datos): [x]. `new-hero.astro` llama a `layoutHeroCards(new HeroCardsRepository().getCards())` y pasa `colSpan`/`rowSpan`. La 99 no cambia ningún `.astro` (el diff de los componentes es de la 98, que está sin commitear). Ningún article tiene `style` (medido con CDP) y no hay `<script>` nuevo.
- C2 (lógica en el dominio, datos vía repositorio): [x]. Plantillas en `src/domain/hero-grid-template.ts` (nuevo, 31 líneas) y colocación en `src/domain/hero-grid-layout.ts` (95). `featured` se tipa en `src/domain/entities/hero-card.ts` (43) y se valida en `src/domain/repositories/hero-cards-parse.ts` (94). No usa `Math.random` ni `Date` (grep vacío).
- C3 (tokens, sin valores sueltos): [x]. `hero-card.css` no trae colores nuevos. Los cambios de la 99 son solo `--icon-width`/`--icon-scale`/`--icon-rotation`, en la regla base o dentro del `@media (max-width: 1200px)` que ya existía (REQ-99-30).
- C4 (100 líneas o menos, sin dependencias): [x]. En `src/`: 95/31/43/94/17/98. En tests: `hero-mosaic-layout` 99, `hero-cards-unique-tech` 99, `hero-cards-icon-fit` 92. `hero-card-kinds-domain` (126) y `hero-cards-repository` ya pasaban de 100 en HEAD; se acepta por el precedente C5 de la review 97 (kinds-domain incluso baja 1 línea). No hay dependencias nuevas.
- C5 (TDD con rojo y luego verde): [x]. `progress/impl_hero-os-panel-mosaic.md` documenta el rojo antes de tocar dominio, JSON y hojas: 42 tests, 15 en fallo, y en `hero-mosaic-layout` 6 de 7 en fallo. El log del scratchpad `red99.txt` lo confirma (✖ REQ-99-05/06, 07/08/09, 10/11/12, 13/14, 15/16/17, 18; pass 1). El verde queda en 1030/1030. La nota «Ajuste feature 99 (precedente REQ-43-06)» aparece en los 5 tests ajustados (REQ-99-32).
- C6 (dependencias en `done`): [x]. La 99 no declara `depends_on`. La 98, sobre la que se construye, está `done`.
- C7 (`./init.sh` en verde): [x]. Ejecutado por el revisor: entorno, formato, tests al 100 % y build, todo en verde (exit 0).
- C8 (desktop y móvil sin errores de consola): [x]. 0 errores y 0 excepciones en los 5 anchos (CDP independiente).

## Verificación independiente

### Dominio
Scripts `rv99/err.mjs` y `rv99/err2.mjs` del scratchpad, ejecutados contra `src/` real:

- Salida real = mapa de design.md: htb 6,1 5x4 · rust 11,1 · aws 11,3 · cloudflare 6,5 · node 8,5 5x2 · nestjs 1,7 4x2 · css 5,7 · react 7,7 · html 9,7 · claude-code 11,7 · bun 1,9 · claude 3,9 · typescript 5,9 4x2 · youtube 9,9 · github 11,9. Dos llamadas seguidas dan la misma salida (REQ-99-13/14).
- Los featured se asignan en el orden del JSON: si typescript va primero, ocupa el hueco grande de la zona superior (REQ-99-08).
- `HeroGridLayoutError` en cada caso de la spec:
  - 2, 4 o 0 featured: «hay N tecnologías con featured y la plantilla tiene 3 huecos grandes libres» (REQ-99-10).
  - Red social con featured: el mensaje lleva su id «yt» (REQ-99-11).
  - 14 y 16 cards: filas incompletas (98-12).
  - 6 personalizadas: máximo 5 (98-13).
  - Red fuera de la última fila: el mensaje lleva su id «gh» (98-14).
- Parseo: si se omite `featured`, llega `false`. `"true"`, `1` y `null` lanzan `HeroCardsDataError` con «la tarjeta 0 tiene un campo "featured" que debe ser booleano» (REQ-99-03/04). En el JSON real solo tienen featured `node`, `nestjs` y `typescript` (REQ-99-01).

### Chrome headless + CDP
Script `rv99/measure.mjs` sobre `pnpm preview --port 4411`, con el build del `./init.sh`. Ya lo paré; el `pnpm dev` de :4321 (PID 34400) no se tocó.

- **1280 y 1600:**
  - Grid de 12 x 10, 0 solapes y 0 celdas vacías.
  - Todos los article coinciden con el mapa de design.md en columna, span, fila y span (0 discrepancias), y `data-col-span`/`data-row-span` = tamaño medido.
  - Grandes: NODE JS en las columnas 8-12 (filas 5-6), NESTJS en 1-4 (filas 7-8) y TYPESCRIPT en 5-8 (filas 9-10); las de filas contiguas no comparten columna.
  - YOUTUBE y GITHUB van en las filas 9-10 con 2 columnas. HTB ocupa las columnas 6-10 y las filas 1-4, sin descendientes fuera del article (REQ-99-19..22, 25).
- **375 / 800 / 1024:** 1 x 16 o 6 x 4 sin solapes. Las 3 celdas vacías del final a 800/1024 son la Decisión 5 (sin cambios de geometría en tablet).
- **Títulos (REQ-99-23):** 15/15 dentro de su card y 0 palabras partidas en los 5 anchos.
- **Article dentro del viewport (REQ-99-24):** ningún article ni descendiente del hero pasa del borde derecho. `scrollWidth` = `clientWidth` en todos los anchos menos a 800 (838/800), que viene del header (feature 93, fuera de alcance).
- **CLOUDFLARE (REQ-99-26/27):** el símbolo completo (viewBox 0 0 512 76) queda al 100 % dentro en los 5 anchos y tapa 0 px² de título. Se lee entero: nube + «CLOUDFLARE». El fallo «CLOU» de la 98 queda resuelto.
- **Logos (REQ-99-28):** centro dentro y al menos el 40 % del área en las 14 cards de icono y los 5 anchos. El mínimo es CSS a 800 (48,4 %).
- **REQ-99-29:** RUST, AWS, CLAUDE CODE, NESTJS, GITHUB, CLAUDE y BUN tapan 0 px² de su título en los 5 anchos. Las que cambian de tamaño (NODE JS, NESTJS, TYPESCRIPT, REACT, CLAUDE CODE, YOUTUBE) también tapan 0.
- **Capturas:** las de `progress/research/hero99/hero-grid-{375,800,1024,1280,1600}.png` coinciden con las mías (`rv99/shots/`).

### Criterio visual (intención humana)
- **Panel tipo SO con patrones distintos:** se cumple. Cada par de filas tiene un ritmo distinto: `[5,2]`, `[2]`, `[2,5]`, `[4,2,2,2,2]`, `[2,2,4,2,2]`. Las grandes bajan en escalera derecha → izquierda → centro, y la columna alineada CLAUDE CODE/YOUTUBE de la 98 ya no existe.
- **Grandes = tecnologías más pro:** se cumple. Son Node.js, NestJS y TypeScript, las tres primeras del subtítulo del perfil, en vez de REACT, CLAUDE CODE y YOUTUBE.

## Observaciones (no bloquean; para el humano y el líder)
1. **Logo pequeño en las cards grandes:** el logo de NODE JS (5x2), NESTJS (4x2) y TYPESCRIPT (4x2) es solo algo mayor que el de una 2x2 (165/160/150 px frente a 115 px de base), así que la card se ve algo vacía a 1280/1600. Además, NESTJS rojo sobre rojo es poco visible (está exenta por contraste desde la 97). Si el humano quiere que las grandes «pesen» más, la vía es una feature de ajuste de `--icon-width` en las tres reglas base (con el JSON a la par). La spec no lo exige.
2. **Columnas que siguen alineadas:** las columnas 9-10 y 11-12 coinciden entre las filas 7-8 y 9-10 (HTML/YOUTUBE y CLAUDE CODE/GITHUB). Lo fija el mapa aprobado de design.md y cumple REQ-99-16; se anota por si el humano quiere aún menos alineación.
3. **CSS y HTML a 800/1024:** siguen tapando su título (456 y 606 px²). Ya estaba en la observación (l) de la 97 y no entra en REQ-99-29.
4. **HTB a 800 px:** el texto «Estadísticas no disponibles» queda apretado y recortado visualmente en la card 1x1 de tablet. Es de la 98 (REQ-99-25 solo cubre 1280/1600).
5. **`hero-card.css` sigue con `grid-column: var(--card-column)` y `grid-row: var(--card-row)` en `.hero-card`:** ya no se definen desde la 98. Es inocuo; limpieza opcional en una feature futura.
6. **`--icon-scale: 1` de cloudflare en la regla base:** se justifica en el informe (el ancla `right: 4px` con escala mayor que 1 saca el símbolo de 512x76) y lo exige el rango 2..5 de REQ-97-19 dentro de `@media`. Es un valor por defecto revisable.

## Cambios requeridos (si aplica)
Ninguno.
