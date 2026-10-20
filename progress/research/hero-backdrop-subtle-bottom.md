# Análisis — feature 105 hero-backdrop-subtle-bottom

**Problema.** El humano pide (2026-10-20) que el logo de fondo de las cards del hero (`.card-backdrop`, feature 103) se pinte por debajo del icono principal (hoy va encima, con z-index 2 desde la revisión 1 de la 103), que sea más sutil y que pueda ser más grande y desbordar, anclado abajo.

**Qué toca.** Solo `src/styles/hero-card-accents.css` (41 líneas) y los tests: `tests/hero-cards-extra-logos.test.mjs` (100 líneas; REQ-103-19/20/31 fijan 22px/40px/0.1/z-index 2) y un test nuevo. No cambian el marcado, los datos, `hero-card.css` (ya tiene `isolation: isolate` y `overflow: hidden`) ni `tokens.css`.

**Hallazgos.**
1. Capa: con z-index 0 y `.card-backdrop` antes que `.card-icon` en el DOM, el icono queda encima. Es el estado previo a la revisión 1 de la 103, con el wordmark tapado al 84-91 %, y el humano lo acepta.
2. Anclaje: un `<use>` que apunta a un `<symbol>` aplica el `preserveAspectRatio` del symbol (xMidYMid meet). En el svg exterior no tiene efecto sin viewBox, y el sprite es ajeno. Con un alto fijo de 80px, ANTHROPIC (viewBox 182x24) quedaría a unos 25 px del borde inferior. Solución: svg con `height: auto` y el aspect-ratio exacto del symbol en reglas `.card-backdrop:has(use[href$="#id"]) svg` (anthropic 182 / 24; github 249.1 / 67.5), con `bottom: 0`.
3. La «sección final» con la propuesta del implementer no está en `progress/impl_hero-cards-extra-logos.md`: el archivo acaba en la medida de la revisión 1. Se toman los valores que transmitió el orquestador. Se adoptan left/right -16/-10; se sustituyen bottom -8/-6 y el alto 80/56 (ver la alternativa descartada de `specs/105_hero-backdrop-subtle-bottom/design.md`).
4. Contraste: con 0.06 el color compuesto se acerca al fondo de marca, así que el contraste sube respecto a 8,73 / 14,46.

**Riesgos.** `tests/hero-cards-extra-logos.test.mjs` está en 100 líneas: el ajuste tiene que sustituir aserciones, no añadirlas. El `:has(use[href$=...])` depende de que el atributo `href` esté en el marcado (lo está, junto a `xlink:href`).

**Valores por defecto revisables.** z-index 0 (alternativa -1), opacidad 0.06, left/right -16px / -10px, bottom 0, alto según el aspect-ratio del symbol (respaldo 4 / 1).
