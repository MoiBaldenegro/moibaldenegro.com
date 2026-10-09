# Review — feature 75

**Veredicto:** APPROVED

Ronda 2. En la ronda 1 el veredicto fue CHANGES_REQUESTED por un único cambio: `impl_75.md`
decía que el header no estaba a la vista durante la entrada y no había evidencia medida de
REQ-75-30. Además se hicieron 5 observaciones no bloqueantes.

## Checkpoints
- Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (`src/styles/latest-horizontal.css`, 52 líneas, sin cambios en esta ronda)
- Sin lógica en UI; lógica en `.ts`: [x] (`src/domain/latest-entrance.ts` y `src/components/latest-horizontal/*.ts`)
- Ningún componente lee JSON directamente: [x] (no aplica)
- Tokens, sin valores cromáticos hardcodeados: [x] (sin cambios respecto de la ronda 1)
- Archivos <= 100 líneas: [x] (latest-horizontal.ts 91, track-dom.ts 20, latest-entrance.ts 35, latest-horizontal.css 52, test 74)
- Sin dependencias nuevas: [x]
- `src/data/*.json` válido / repositorios con `*Error`: [x] (no aplica)
- `./init.sh` en verde: [x] (ejecutado por el reviewer en la ronda 2: entorno, formato, tests al 100 % y build OK; ningún dev server/preview bloqueó dist/)
- Página correcta en desktop y móvil: [x] (capturas `progress/research/gsap75/`; `h75-header-1280-p0.25.png` revisada: navbar completo arriba, track por debajo de y ≈ 574)
- `feature_list.json`: [x] (75 `in_progress`, depends_on [73], la 73 está `done`; la 74 está `done`; no hay otra feature a medias; nada eliminado del array)
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs: [x]
- Ciclo rojo/verde documentado: [x] (impl_75.md: ROJO 0/5, VERDE 5/5; en la ronda 2 la suite y `./init.sh` vuelven a estar en verde)
- Tests de 71/72/73 sin modificar y en verde: [x] (el diff de la ronda 2 solo toca `tests/latest-cards-entrance.test.mjs`)
- REQ-75-30 (header por encima durante la entrada) evidenciado: [x] (impl_75.md, «Durante la entrada (REQ-75-14/30)»)

## Comprobación del cambio requerido (ronda 1)
1. Atendido. `progress/impl_75.md:76-86` retira la afirmación errónea y añade una medición CDP en p 0,05, 0,1 y 0,25, a 1280×800 (scrollY 455/495/615) y a 1440×900 (360/405/540). En todos los casos la clase `latest-articles--entering` está presente, el header se ve (top 0, bottom 75), `elementFromPoint` en el centro de `.site-navbar` devuelve el header, el barrido de la fila del header no encuentra puntos ajenos y el track no llega a esa zona. La captura `h75-header-1280-p0.25.png` lo confirma. Es coherente con `.site-navbar { position: sticky; z-index: 100 }` y con que la sección no tiene z-index. No hacía falta cambiar código.

## Observaciones de la ronda 1 atendidas
- Doble línea en blanco en `latest-horizontal.ts`: eliminada (diff en la línea 27).
- `tests/latest-cards-entrance.test.mjs:53-54`: ahora exige `scrub: true`, `invalidateOnRefresh: true`, `start`, `end` y `ease: entranceEase` dentro del bloque `gsap.fromTo(track` … `});`, separado del tween de x de la 73.
- REQ-75-27 (`test:71`): incluye `track-dom.ts`.
- Cifras de líneas en impl_75.md corregidas (35 y 91, que coinciden con `wc -l`).
- Los cambios mezclados de la 74 ya están en el commit c0d0e4d. El árbol solo contiene cambios de la 75.

## Cambios requeridos
Ninguno.
