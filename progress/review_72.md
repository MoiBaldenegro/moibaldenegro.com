# Review — feature 72

**Veredicto:** APPROVED

Alcance revisado: `src/components/latest-horizontal/latest-horizontal.ts` (77 líneas),
`src/components/latest-horizontal/latest-horizontal.astro` (11), `src/styles/latest-horizontal.css`
(32), `src/pages/index.astro` (+2), `astro.config.mjs` (+5), `tests/latest-articles-horizontal-scroll.test.mjs`
(100, nuevo), ajustes en `tests/reduced-motion.test.mjs` (60) y `tests/gsap-dependency-approval.test.mjs` (70).
Comparado con `specs/72_latest-articles-horizontal-scroll/requirements.md` y `design.md`, los 16 criterios
de `feature_list.json` (id 72), `docs/architecture.md`, `docs/conventions.md` y `CHECKPOINTS.md`.
He abierto las capturas `h72-1280-p0.png`, `h72-1440-p0.5.png` y `h72-stacked-1280-rm.png` de `progress/research/gsap72/`.

## Pregunta de revisión

- Test-first (REQ-72-31): según `progress/impl_72.md` (líneas 7-15), primero hubo un rojo con 0/6 porque faltaban
  el componente, el módulo y la hoja, y después un verde con 6/6. Hubo un segundo rojo que es legítimo: el test
  de copyright se endureció a `@license Copyright …, GreenSock` (test, línea 83) y falló hasta añadir `comments.legal`.
  Con esto la evidencia queda cubierta.
- Dependencias: `depends_on: [70, 71]` y las dos están en `done`.
- He ejecutado `./init.sh`: termina en verde (entorno, formato, tests al 100% y build).

## Puntos pedidos explícitamente

1. **Error de consola del clic (REQ-72-28).** Lo acepto como preexistente y fuera del alcance de la 72. He comprobado
   la causa: `node_modules/astro/dist/transitions/router.js:110` inserta
   `<script type="module" src="data:application/javascript,"/>`. En cambio, `script-src` de `public/_headers:9` y
   `src/domain/http/security-headers.ts:18` no permite `data:`. La navegación funciona: llega a
   `/posts/01-procesos-memoria/` y no queda ningún `.pin-spacer`. Este módulo no inyecta ese script, y el informe
   reproduce el error a 1024 px sin el efecto y en producción. Para corregirlo habría que tocar la CSP de la feature
   64, lo que mezclaría features (AGENTS.md §3). Aun así, REQ-72-28 no se cumple al pie de la letra.
   **Condición:** el líder debe registrar ese hallazgo como feature aparte (vía spec_author) y citarlo en
   `progress/history.md` al cerrar. No basta con dejarlo como «se propone al humano» en el informe.
2. **Cifra 39/40 de REQ-72-01.** La desviación es aceptable. El archivo no ha cambiado (lo confirma
   `git diff HEAD -- src/components/latest-articles.astro src/styles/latest-articles.css`, sin cambios). `wc -l`
   da 39 porque no termina en salto de línea, y la función `lines()` del test cuenta 40. El test fija 40 con un
   comentario que lo explica (línea 33), así que la intención de REQ-72-01/02 (conteo congelado, archivo sin
   cambios) se cumple. El 39 de la spec y del criterio sale de otra forma de medir; la spec no está mal en lo
   sustancial.

## Trazabilidad REQ (resumen)

- REQ-72-01/02: el `.astro` solo hace el import en el frontmatter y tiene un único `<script>` que importa `./latest-horizontal.ts`, sin `<style>`. Solo `index.astro` lo monta.
- REQ-72-03/04/05/09/19: `registerPlugin` a nivel de módulo (ts:10), consulta `DESKTOP` (ts:12), guarda `cards.length < 2` (ts:29) y opciones del tween (ts:37-49). `x` y `end` son funciones que salen de la geometría de la 71. No hay ScrollSmoother, normalizeScroll, clearScrollMemory ni markers.
- REQ-72-07/17/18: la clase se añade antes de `gsap.to` (ts:36) y se quita en la limpieza (ts:68). `init` llama a `destroy` y este a `mm.revert()`.
- REQ-72-15/27: todos los selectores cuelgan de `.latest-articles--horizontal`, hay `overflow: clip` (css:13) y no hay colores ni px literales.
- REQ-72-06/08/10-14/16/20/21/25/29: las mediciones CDP de `impl_72.md` (líneas 63-138) están dentro de tolerancia (±2 px, saltos de 0 px, un solo pin-spacer, scrollY restaurado en dos ciclos, start/end idénticos tras la búsqueda en vivo, 0 violaciones CSP en la portada). Las capturas cuadran: card 1 centrada y encabezado visible, y con reduced motion queda apilado.
- REQ-72-22/23/24: el test de build está en verde. La portada pesa 44 928 B gzip (límite 51 200) y conserva los 3 avisos `@license`.
- REQ-72-26: `tests/csp-enforce.test.mjs` no se ha modificado.
- REQ-72-30: los dos ajustes legacy citan REQ-43-06 en su encabezado (`reduced-motion.test.mjs:47-48` y `gsap-dependency-approval.test.mjs:58`) y son exenciones acotadas a `latest-horizontal.ts`.
- REQ-72-32: todos los archivos tienen 100 líneas o menos (el test nuevo justo 100).

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
- C2 Sin lógica en UI; frontmatter solo imports: [x] (el `<script>` solo conecta eventos a `init` y `destroy`; la lógica está en `.ts`)
- C3 Datos solo vía repositorios: [x] (no aplica, no se lee ningún JSON)
- C4 Tokens, sin valores hardcodeados: [x] ← Observación: `css:28` usa las constantes de fórmula `30rem`, `3.5rem` y `16 / 9`, documentadas en el comentario `css:5-6`. Son derivadas del layout y no declaran espaciado; pasan el test REQ-72-27 y la auditoría de tokens de `init.sh`.
- C5 Todos los archivos con 100 líneas o menos: [x]
- C6 Sin dependencias sin discusión: [x] (gsap está aprobada en la feature 70; JS de runtime justificado en `latest-horizontal.astro:6-7`)
- C7 `./init.sh` en verde: [x] (lo he ejecutado yo)
- C8 Página correcta en escritorio y móvil sin errores en consola: [x] ← Con la salvedad del error CSP preexistente del router de Astro (punto 1); la feature no añade errores propios.
- C9 Feature en `done` y ninguna otra a medias: [ ] ← sigue `in_progress`. El cierre lo hace el líder tras este APPROVED.
- C10 `progress/current.md` y `history.md` al día: [ ] ← `current.md` no tiene ninguna entrada de la sesión de implementación de la 72 (la bitácora termina en el alta de backlog). El líder debe añadirla y moverla a `history.md` al cerrar.
- C11 Sin temporales, debug ni TODOs: [x]

## Cambios requeridos (si aplica)

Ninguno en el código. Pendientes de cierre para el líder (no bloquean la aprobación):
1. Registrar en `progress/current.md` y luego en `progress/history.md` la sesión de implementación de la 72.
2. Dar de alta, vía spec_author, una feature que resuelva el error CSP `data:` del router de Astro (REQ-72-28 / feature 64), o dejar constancia de la decisión humana si se descarta.
