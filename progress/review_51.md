# Review — feature 51 header-mobile-reflow

**Veredicto:** APPROVED

Revisión de nivel 1, **ronda 2** (2026-10-08). El implementer fue el líder, con autorización humana
explícita. Spec: `specs/51_header-mobile-reflow/requirements.md` + `design.md`.
Dependencias `depends_on` [37, 38]: las dos están en `done` (comprobado en la ronda 1).

## Alcance de la ronda 2

En la ronda 1 pedí un único cambio, solo de documentación: sustituir en `progress/impl_51.md` el
«no verificada en navegador» de REQ-51-05 por lo que se observe en el navegador. Según el informe,
el código y los tests no han cambiado. `tokens.css` sigue en 95 líneas y `layout.css` en 93, igual
que en la ronda 1.

## Verificación ejecutada

- `./init.sh`: verde (entorno, formato, tests al 100 %, build de producción).
- `progress/impl_51.md:17-40`, sección «REQ-51-05». Ahora describe una verificación real: Chrome
  headless por CDP contra `astro preview`, en `/posts/03-principios-solid/`, con
  `Emulation.setDeviceMetricsOverride`, `getBoundingClientRect()` y `getComputedStyle()`. Incluye una
  tabla por caso (`impl_51.md:24-28`) con la geometría del header y del buscador, el inicio de
  `main`, el `position` calculado y la presencia de scroll horizontal. Ya no aparecen ni el «no hay
  navegador disponible» ni el «Pendiente para el humano».
- He comparado esas cifras con las que medí yo en la ronda 1:
  - 320×640: header 0→137, `sticky`, buscador 94→136, `main` en 137. **Coinciden.**
  - Zoom 400 % (320×180 CSS, escala 4): header 0→137, `static`, buscador 94→136, `main` en 137.
    **Coinciden.**
  - Escritorio 1280×800 (caso de control que añade el implementer): header 0→75, `sticky`, `main`
    en 75. Cuadra con `min-height: 74px` más el borde inferior de la barra, así que el escritorio no
    cambia.
  - `scroll-padding-top` resuelto en 74 px (`impl_51.md:33`). Cuadra con `var(--header-height)`.
- La acceptance 5 («verificación manual en navegador a 320 px y con zoom al 400 % documentada con
  capturas o descripción en progress/impl_51.md») **queda cumplida**: la descripción cubre los dos
  casos que exige y la conclusión (`impl_51.md:30-33`) se apoya en las medidas.
- La sección «Ronda 2» (`impl_51.md:50-52`) registra el cambio y declara que no hay cambios de código
  ni de tests.
- El ciclo rojo/verde (REQ-51-06) sigue documentado (`impl_51.md:42-48`), sin cambios desde la
  ronda 1.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en .astro): [x]
- C2 (sin lógica en UI): [x]  ← la feature solo toca CSS
- C3 (sin lectura directa de JSON): [x]  ← no aplica
- C4 (solo tokens, sin valores hardcodeados): [x]  ← 74px en el token `--header-height`. El `500px` de la media query lo fija REQ-51-04.
- C5 (≤100 líneas): [x]  ← tokens.css 95, layout.css 93
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` verde, tests al 100 %, build): [x]
- C8 (vista correcta en desktop y móvil): [x]  ← verificado en Chrome headless a 320 px, con zoom al 400 % y en escritorio (medidas del implementer y del reviewer coincidentes)
- C9 (feature en `done`, ninguna a medias): [ ]  ← sigue `in_progress`. No bloquea: lo cierra el líder tras esta aprobación.
- C10 (progress al día): [x]  ← `progress/impl_51.md` documenta REQ-51-05 con lo observado
- C11 (sin temporales, debug ni TODOs sin contexto): [x]

## Cambios requeridos
Ninguno.

## Observaciones (no bloquean, para una feature futura vía spec_author)
- A 320 px en vertical, `scroll-padding-top` (74 px) es menor que la barra sticky (137 px). Al saltar
  a un ancla quedan unos 63 px del encabezado bajo la barra.
- A 320 px el logo queda pegado al borde superior de la barra porque el nav no tiene padding
  vertical.

Las dos observaciones ya están recogidas en `impl_51.md:35-40`. No forman parte del alcance de esta
feature.
