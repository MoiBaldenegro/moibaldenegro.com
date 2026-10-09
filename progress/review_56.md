# Review — feature 56

**Veredicto:** APPROVED

Revisión nivel 1 de `reduced-motion` (spec `specs/56_reduced-motion/requirements.md` + `design.md`,
informe `progress/impl_56.md`; implementado por el líder en rol de implementer, revisado con el mismo rigor).

## Verificación ejecutada

- `./init.sh`: verde (entorno, formato, tests al 100 %, build).
- `pnpm test`: 734/734, 0 fallos.
- `node --test tests/reduced-motion.test.mjs`: 5/5 (REQ-56-01, 02, 03, 04, 06).
- Dependencias: la feature 56 no declara `depends_on`; no hay dependencia pendiente saltada.

## Revisión por archivo

- `src/styles/hero-section.css` (54 líneas): `animation: float ...` sale de la regla `.hero-gradient`
  (antes l. 28) y solo existe dentro de `@media (prefers-reduced-motion: no-preference)` (l. 29-32). Cumple REQ-56-01.
- `src/styles/layout.css` (97 líneas): bloque final `@media (prefers-reduced-motion: reduce)` sobre
  `*, *::before, *::after` con `animation-duration`/`transition-duration: 0.01ms !important` y
  `animation-iteration-count: 1`. Cumple REQ-56-02. El `!important` está justificado (red de seguridad
  global que tiene que ganar a reglas de componente y a `--transition-default`).
- `src/styles/hero-card.css` (84 líneas, l. 81-84) y `src/styles/profile-card.css` (71 líneas, l. 68-71):
  `.hero-card:hover { transform: none; }` y `.profile-card:hover { transform: none; }` dentro de
  `@media (prefers-reduced-motion: reduce)`, al final de cada hoja. Misma especificidad que las reglas
  originales (`hero-card.css:17-18`, `profile-card.css:17`) y posterior en el mismo archivo: ganan por
  orden de fuente sin `!important`. Cumple REQ-56-03.
- `tests/reduced-motion.test.mjs` (58 líneas, nuevo): inspección estática con extracción de bloques @media
  de llaves equilibradas y comentarios eliminados; cubre las acceptance 1, 2, 3, 4 y 6. Sin dependencias.
- REQ-56-04: ningún `.ts` de `src/` consulta la media query (lo comprueba el test); todo es CSS.
- Tokens: no se introducen colores, espaciados, radios ni sombras nuevos; `0.01ms` es una duración de la
  técnica estándar de reduced-motion, no un token de diseño.

## Sobre la ubicación de la anulación del hover (acceptance 3)

La descripción de la feature dice «bloque global en layout.css que ... anula los transform de hover», y la
acceptance 3 habla de «el bloque reduce». Sin embargo, el requisito normativo REQ-56-03 (EARS) no fija el
archivo: solo exige que, con reduce, las tarjetas omitan el desplazamiento por transform en hover. Se acepta
la decisión de ponerla en cada hoja de componente porque:
1. Poner `.hero-card:hover { transform: none }` en `layout.css` dependería del orden de concatenación de
   hojas en el bundle (misma especificidad, distinta hoja) o exigiría `!important`; en la hoja del componente
   gana de forma determinista por orden de fuente.
2. Mantiene la regla junto a la que anula (cohesión por componente, coherente con `docs/architecture.md`:
   cada componente importa su propia hoja).
3. El test verifica el comportamiento exigido en la ubicación elegida, y `impl_56.md` documenta y justifica
   la desviación.
Es una lectura literal más débil de la acceptance 3, pero cumple el requisito y es la opción más robusta.

## Evidencia test-first (REQ-56-05)

`progress/impl_56.md` registra el rojo previo (`pass 2 / fail 3`: fallan 56-01, 56-02 y 56-03; 56-04 y 56-06
ya pasaban porque no había JS y las hojas estaban dentro del límite) y el verde posterior (5/5, suite
734/734, `./init.sh` verde). Es coherente: los tres tests que dependen del código nuevo estaban en rojo.
Reproducido aquí el verde.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x]
- C2 (sin lógica JS en UI; cero JS de runtime añadido): [x]
- C3 (sin lectura directa de JSON; no aplica, no se toca): [x]
- C4 (solo tokens, sin valores de diseño hardcodeados): [x]
- C5 (≤ 100 líneas: 54 / 97 / 84 / 71 / 58): [x]
- C6 (sin dependencias externas nuevas): [x]
- C7 (`./init.sh` verde: entorno, formato, tests 734/734, build): [x]
- C8 (vista correcta en desktop y móvil sin errores en consola): [x]  ← el reviewer no abrió navegador; se
  apoya en la verificación CDP del informe (`animation-name: none` y `transition-duration: 1e-05s` con
  reduce; `float` y `0.28s` sin reduce). El cambio no altera el aspecto sin reduce.
- C9 (`feature_list.json` con la tarea en `done`): [ ]  ← sigue `in_progress`; la transición a `done` la
  hace el líder tras este APPROVED (fuera del alcance de esta revisión).
- C10 (`progress/` documentado): [x]
- C11 (sin temporales, debug ni TODOs sin contexto): [x]

## Observaciones no bloqueantes

1. `src/styles/hero-card.css:54` (`.hero-card:hover .card-icon svg { transform: rotate(2deg) scale(...) }`)
   sigue aplicándose con reduce. No es desplazamiento de la tarjeta (REQ-56-03 queda cumplido) y con reduce
   el cambio es instantáneo (transition 0.01ms), así que no hay animación; si se quiere que el hover sea
   totalmente estático, valorarlo en una feature futura.
2. El test de REQ-56-06 lee las cuatro hojas de la feature, pero no comprueba el propio test; es trivial
   (58 líneas) y lo cubren las comprobaciones globales de líneas de la suite.

## Cambios requeridos (si aplica)
Ninguno.
