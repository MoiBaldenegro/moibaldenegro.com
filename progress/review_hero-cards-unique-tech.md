# Review — feature 97

**Veredicto:** APPROVED

Alcance: solo la feature 97 (hero-cards-unique-tech): `git diff` + archivos nuevos frente a HEAD `fbee915`. Se contrasta
con REQ-97-01..23, la tabla y las Decisiones 1-8 de `specs/97_hero-cards-unique-tech/design.md` (base de cloudflare
140px / 0) y la Ronda 3 de `progress/impl_hero-cards-unique-tech.md`. La 93 (blocked) no se evalúa. La 97 no tiene
`depends_on`, así que no salta ninguna dependencia.

## Checkpoints
- C1: [x] Estilos en `src/styles/*.css`; ningún `.astro` cambia ni lleva `<style>`. Los ajustes van en `src/styles/hero-card.css:73-82`, dentro del `@media (max-width: 1200px)` existente.
- C2: [x] Sin lógica nueva en UI: `src/components/hero-card.astro` no cambia.
- C3: [x] Datos vía repositorio: solo cambia `src/data/hero-cards.json`. `tests/hero-cards-repository.test.mjs` (EXPECTED_CARDS) valida el loader con las 13 entradas nuevas.
- C4: [x] Tokens: los 5 fondos nuevos salen de `--color-marca-*` (`src/styles/tokens.css:44-51`). Los px de `hero-card.css:75-82` (offsets del header, `--icon-width`) siguen el mismo patrón que la base preexistente (`left: 22px`, `--icon-width` por token) y no son colores, espaciados de token, radios ni sombras.
- C5: [x] Líneas: `tokens.css` 99, `hero-card.css` 94, `hero-cards-unique-tech.test.mjs` 99, `hero-cards-icon-fit.test.mjs` 88, `latest-cards-gsap-motion.test.mjs` 100. Los tests reapuntados que pasan de 100 (repository 172, styles 190, htb 147) ya pasaban en HEAD (168/187/146); la 97 solo añade las líneas de nota.
- C6: [x] No hay dependencias nuevas (`package.json` y el lockfile sin cambios).
- C7: [x] Ejecuté `./init.sh` yo mismo dos veces, al empezar y al terminar: exit 0, formato ✔, tests al 100 % ✔, build ✔, «El entorno está perfecto».
- C8: [x] Hay evidencia de rojo/verde en el impl. Ronda 1: `hero-cards-unique-tech` 4/6 en rojo antes de tocar `src/` y los 4 reapuntados 6 fallos. Ronda 2: `hero-cards-icon-fit` 2/5 en rojo antes de editar la hoja, y rojo CDP a 800 px (nube 0 %, solape RUST 597,1 y GITHUB 1775,4 px²; REQ-97-23). Ronda 3: repository 10/11 en rojo. Verde: 1020/1020.
- C9: [x] Se ve bien en desktop y en móvil y no hay errores de consola (verificación independiente, abajo).
- C10: [x] Harness: la 97 sigue `in_progress` y no se elimina ni cambia de estado ninguna feature (HEAD 95 → 96 features). No hay temporales en el repo; mis scripts están en el scratchpad (`rv97/`).

## Verificación independiente (Chrome headless + CDP, scripts propios en scratchpad/rv97)

Método: `astro preview` del build actual (:4412) y de HEAD (export `git archive` + build en el scratchpad, :4411). En el
HTML de HEAD se inyectaron sus propias hojas compiladas, porque la preview exportada no emitía los `<link>`. Comprobé que
la línea base es válida porque da 0 errores y la misma geometría en las celdas sin cambios. Logo según la Decisión 7:
caja del svg con `transform`/`transition: none` temporales, viewBox `xMidYMid meet`, matriz computada con origen en el
centro y AABB. El pnpm dev de :4321 (PID 34400) no se tocó; mis previews y Chrome quedaron cerrados.

| Ancho | Geometría 13 cards vs HEAD (x, y, w, h, grid-column, grid-row) | iconos repetidos | palabras fuera / partidas | `p.card-title.right` > article | `article.right` > innerWidth | errores consola |
|---|---|---|---|---|---|---|
| 375 | 13/13 idéntica | 0 (12 distintos) | 0 / 0 | 0 | 0 | 0 |
| 800 | 13/13 idéntica | 0 | 0 / 0 (HEAD: TYPESCRIPT se salía) | 0 | 0 | 0 |
| 1024 | 13/13 idéntica | 0 | 0 / 0 | 0 | 0 | 0 |
| 1280 | 13/13 idéntica | 0 | 0 / 0 | 0 | 0 | 0 |
| 1600 | 13/13 idéntica | 0 | 0 / 0 | 0 | 0 | 0 |

Cada celda da: % del logo dentro / centro dentro / solape con las palabras del título (px²). Coinciden al decimal con la
Ronda 3 del impl:

| Card | 375 | 800 | 1024 | 1280 | 1600 |
|---|---|---|---|---|---|
| RUST | 95,2 / sí / 0 | 92,3 / sí / 0 | 95,2 / sí / 0 | 65,2 / sí / 0 | 65,2 / sí / 0 |
| AWS | 96,4 / sí / 0 | 92,5 / sí / 0 | 96,4 / sí / 0 | 67,7 / sí / 0 | 67,7 / sí / 0 |
| CLAUDE CODE | 100 / sí / 0 | 90,5 / sí / 0 | 100 / sí / 0 | 80,6 / sí / 0 | 80,6 / sí / 0 |
| NESTJS (exenta) | 65,3 / sí / 0 | 49,6 / sí / 871 | 65,0 / sí / 871 | 67,5 / sí / 0 | 67,5 / sí / 0 |
| GITHUB ACTIONS | 100 / sí / 0 | 100 / sí / 0 | 100 / sí / 0 | 75,8 / sí / 0 | 75,8 / sí / 0 |
| CLOUDFLARE (nube) | 100 % / 0 | 100 % / 0 | 100 % / 0 | 97,2 % / 0 | 97,2 % / 0 |

- REQ-97-16 ✔ (nube ≥ 90 % a los 5 anchos). REQ-97-17 ✔. REQ-97-18 ✔: solape 0 en las 5 cards no exentas.
- Exención de NESTJS verificada en el sprite: su único fill es `#E0234E`, 4,65:1. claude-code `#D97757` (3,12), aws `currentColor`+`#F90` y cloudflare `currentColor`+`#fbad41`/`#f6821f` no están exentos y dan 0 de solape.
- Contraste REQ-97-09 frente a `--color-text` `#ffffff` (fondo y color computados en el DOM, coinciden con los tokens): rust 6,62, aws 13,57, claude-code 11,65, nestjs 7,80, cloudflare 5,88. Todos ≥ 4,5.
- Sprite: los 5 ids nuevos existen (`rust` 0 0 224 224, `aws` y `claude-code` 0 0 24 24, `nestjs`, `cloudflare` 0 0 512 76). No queda twitch, instagram, x, linkedin, strava, claude ni bun. YouTube es la única red. github se titula GITHUB ACTIONS.
- htb intacta: JSON (posición 13, 9 / span 4 x 9 / span 2) y regla CSS idénticas a HEAD (REQ-97-10). `hero-section.css` sin diff (REQ-97-21).
- Capturas: las de `progress/research/hero97/hero-grid-{375,800,1024,1280,1600}.png` coinciden con las mías (scratchpad `rv97/shots-cur/`). A 1280/1600 se ve la nube entera seguida de «CLOU», y a ≤ 1200 px los 5 logos nuevos se reconocen sin tapar el título.

## Observaciones (no bloquean)
1. `progress/current.md`, «Feature en curso», dice «97 … (**pending** tras la ronda 2…)», pero el estado real es `in_progress` (lo recoge la última línea de la bitácora). El líder lo puede alinear al cerrar.
2. Fuera de alcance (anotado ya en design.md): a 800/1024 REACT, HTML, NODE JS, YOUTUBE, TYPESCRIPT, CSS y NESTJS siguen tapando su título. A 800 px el bloque «Estadísticas no disponibles» de HACK THE BOX se sale de su card, igual que en HEAD (celda htb congelada por REQ-97-10). El scroll horizontal 838/800 a 800 px viene del header (feature 93).
3. Valores por defecto revisables por el humano: YouTube como única red, los hex de marca y los overrides ≤ 1200 px (github 110px/2/0deg, rust 3, aws 3, claude-code 2, cloudflare 34px/0deg).

## Cambios requeridos (si aplica)
Ninguno.
