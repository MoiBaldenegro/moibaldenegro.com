# Review — feature 77 (ronda 2)

**Veredicto:** APPROVED

## Nota de la ronda 1 (CHANGES_REQUESTED)
Se pidieron cinco cambios:
1. Mover la media query del logo (antes en layout.css:39) al final del archivo, según conventions.md:64.
2. Dar test a la regla `display: block` del logo, con evidencia del rojo.
3. Que la spec respalde el cambio en layout.css (design.md, Decisión 1, decía que no se tocaba).
4. Resolver la contradicción entre REQ-77-08 y REQ-77-09 (el ancla queda 1 px bajo el borde).
5. Corregir la cifra de líneas del test en impl_77.md.

## Comprobación de los cinco puntos
1. **Resuelto.** La regla está en `src/styles/layout.css:99-100`, después de las media queries de las líneas 73, 84 y 96, y lleva su comentario. layout.css tiene 100 líneas, justo en el límite.
2. **Resuelto.** Lo cubre `tests/header-height-64.test.mjs:34-43`. Comprueba que existe el bloque `@media (min-width: 769px)` con `display: block`, que la regla aparece una sola vez, que no está en el bloque móvil y que va después de `@media (max-width: 768px)`. La evidencia está en impl_77.md:58-60: rojo con la regla en la línea 39 (4/1), verde (5/5) y mutante con la regla eliminada (4/1). Además lo verifiqué yo con copias en el scratchpad, sin tocar el repo, aplicando cuatro mutantes: regla eliminada, regla movida a la línea 39, regla dentro del bloque móvil y un segundo selector `.site-navbar a img` fuera del bloque. En los cuatro el test REQ-77-06 falla (pass 4 / fail 1).
3. **Resuelto.** Se añaden REQ-77-15 y REQ-77-16 en requirements.md:24-25 y su trazabilidad en la línea 5. design.md enmienda la Decisión 1 (línea 20) y feature_list.json añade el criterio de acceptance 10.
4. **Resuelto.** REQ-77-09 (requirements.md:18) y el criterio 6 de acceptance se miden ahora contra el bottom del nav, lo que equivale a una tolerancia de 1 px por el borde del header. La Decisión 5 (design.md:24) documenta la alternativa `calc(... + 1px)` y por qué se descarta. La medida a 1440 px (64/65) queda dentro de la tolerancia.
5. **Resuelto.** impl_77.md:8 dice «35 líneas en la ronda 1».

## Comprobaciones generales
- **`./init.sh`.** La primera ejecución dio rojo en «tests al 100 %», con entorno, formato y build en verde. init.sh oculta la salida (run_check redirige a /dev/null), así que no se ve qué test falló. `pnpm test` por separado dio 840/840 y la segunda ejecución de init.sh quedó toda en verde.
- **Posible causa del rojo.** Había un dev server activo en :4321 (pid 38092), que no detuve. El fallo parece transitorio y no se puede atribuir a la feature.
- **Dependencias.** La feature 77 no tiene `depends_on`. La 76 está en `done`; solo la 10 (blocked) y la 77 (in_progress) no están cerradas.
- **Arquitectura.** Solo cambia CSS, sin `<style>` en .astro, sin valores sueltos nuevos (`display: block` no es un token), sin JS y sin dependencias. Todos los archivos tienen 100 líneas o menos: layout.css 100, tokens.css 97, el test 47 y requirements.md 25.

## Checkpoints
- Estilos solo en src/styles, sin `<style>` en .astro: [x]
- Sin lógica en la UI: [x]
- Datos vía repositorios: [x] (no aplica)
- Solo tokens, sin valores sueltos: [x]
- Archivos ≤ 100 líneas: [x] (layout.css en 100, sin margen para la próxima feature que lo toque)
- Sin dependencias externas: [x]
- Datos JSON válidos y errores nombrados: [x] (no aplica)
- `./init.sh` en verde: [x] (en la segunda ejecución; el primer rojo fue transitorio, con `pnpm test` en 840/840)
- Se ve bien en desktop y móvil: [x] (medición CDP de la ronda 2 en impl_77.md:63 y capturas en progress/research/header77/)
- feature_list con la tarea en done: [ ] ← Lo hace el líder al cerrar; ahora sigue en `in_progress`, como corresponde.
- current.md/history.md al día: [x]
- Sin temporales ni TODOs: [x]
- Test antes que el código (rojo y luego verde): [x]
- Respeta conventions.md: [x]

## Observaciones no bloqueantes (para el cierre)
1. En `progress/impl_77.md:56-57` se perdieron los literales en línea: «la regla  se movió», «Exige el bloque  con ,». Conviene restaurar `@media (min-width: 769px)` y `.site-navbar a img { display: block; }`.
2. El nombre del test en `tests/header-height-64.test.mjs:34` cita REQ-77-06, pero el requisito que cubre ahora es REQ-77-15/16. Convendría citarlo así para mantener la trazabilidad.
3. La descripción de la feature 77 en feature_list.json todavía dice «REQ-77-01..14». La enmienda añade 15/16 al final, pero el rango no se actualizó.
4. El criterio de acceptance 10 pide que «a 375 px el logo es inline». impl_77.md solo registra el alto (165 px). Por CSS está garantizado, porque la regla no aplica a ≤768 px, pero no hay una medida explícita.
