# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- Feature en curso: 93 — system-design-nav-link (**blocked** por el implementer en la ronda 2, 2026-10-14, REQ-93-14)
- Inicio ronda 2: 2026-10-14 (implementer). Feature 10 sigue blocked por decisión humana.
- BLOQUEO REQ-93-13/14 (ronda 2): incluso con la etiqueta corta «Diseño» (49 px, 1 línea), el header desborda en horizontal
  entre 769 y 849 px: scrollWidth/clientWidth del header 837/759 a 769 px, 838/790 a 800, 839/838 a 848; a 850 px 840/840 ya no
  desborda. El documento gana el mismo scroll horizontal. Causa: el nav no tiene holgura en esa franja (gap 42 px + 49 px del
  enlace = 91 px extra; sin el enlace el contenido del nav ya ocupa 727 px frente a 721 px a 769 px). A 375 px, 850-1280 px y en
  el menú móvil está bien; el header mide 65 px a 800/1000/1280. Para quitar el desborde hay que tocar CSS congelado (layout.css
  o site-menu.css: gap, ancho de la búsqueda o subir el corte del menú hamburguesa a unos 850 px) o sacar el enlace en esa
  franja: hace falta una decisión humana. Breakpoint de la etiqueta confirmado a 970 px (a 960 se parte en 2 líneas), CSS en
  969px. El cambio queda en el árbol con ./init.sh en verde. Detalle en progress/impl_system-design-nav-link.md (ronda 2).

### Plan

- Reescribir tests/system-design-nav-link.test.mjs contra REQ-93-01..19 (aria-label, span .site-menu__label-rest, nav-label.css, tag del artículo 05, diff de posts) y observarlo en rojo.
- Enlace en Layout.astro con aria-label y span; src/styles/nav-label.css con @media (max-width: 959px) importado en Layout.astro.
- Añadir solo #diseno-de-sistemas a la línea tags del artículo 05.
- ./init.sh en verde; medir en Chrome headless (65 px, desborde, línea única a >= 960, menú móvil 375).
- Ronda 2 en progress/impl_system-design-nav-link.md.

### Bitácora

- Pendientes humanos: (a) validar los valores por defecto de la 92 (celda 9 / span 4 x 9 / span 2; stats Nivel, Puntos y Owns; tokens --color-marca-htb y --color-marca-htb-accent; texto «Estadísticas no disponibles»); (b) hueco bajo el footer en páginas cortas como /search (sticky footer, requiere tocar body en layout.css), sin implementar; (c) la feature 10 sigue blocked.
- spec_author 2026-10-14: feature 93 system-design-nav-link dada de alta en **blocked**; spec specs/93_system-design-nav-link/ (requirements.md + design.md); análisis progress/research/system-design-nav-link.md.
- Decisión humana 2026-10-14 (feature 93): «aunque aun no existan existirán, tú impleméntalo». Orquestador: /system-design con etiqueta «System Design» (tag futuro #system-design), sin retaguear artículos; hoy la ruta muestra el estado sin resultados (aceptado).
- spec_author 2026-10-14: feature 93 desbloqueada y reescrita a **pending** (REQ-93-01..14 en specs/93_system-design-nav-link/requirements.md, design.md actualizado, análisis actualizado en progress/research/system-design-nav-link.md).
- Corrección humana 2026-10-14 (feature 93): «Es en español, ahora mismo a la vista del usuario es en español, Diseño de sistemas». Orquestador: etiqueta «Diseño de sistemas», URL /diseno-de-sistemas (español ASCII, como /arquitectura y feature 45), tag futuro #diseno-de-sistemas; name/slug system-design-nav-link sin cambios; resto igual.
- spec_author 2026-10-14: feature 93 actualizada con la corrección (sigue **pending**): REQ-93-01..14 y acceptance con «Diseño de sistemas» y /diseno-de-sistemas en specs/93_system-design-nav-link/requirements.md y feature_list.json; design.md con riesgo de desborde alto (etiqueta de 18 caracteres); análisis en progress/research/system-design-nav-link.md.
- Decisión humana 2026-10-14 (feature 93, desbloqueo 2): «metele un articulo para que no salga ninguna coincidencia pues, y si desborda la etiqueta en mobile, en mobile dejalo en "diseño" nada mas solo en mobile».
- spec_author 2026-10-14: feature 93 desbloqueada a **pending**. Spec reescrita REQ-93-01..19 (specs/93_system-design-nav-link/requirements.md + design.md): tag #diseno-de-sistemas en src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md (solo el tag; /diseno-de-sistemas 200 con >= 1 resultado); aria-label «Diseño de sistemas» + span .site-menu__label-rest oculto a <= 959 px vía src/styles/nav-label.css (breakpoint a confirmar midiendo); sin desborde 769-1000 px y 375 px; informe unificado en progress/impl_system-design-nav-link.md. Análisis actualizado en progress/research/system-design-nav-link.md; acceptance actualizados en feature_list.json.
- Petición humana 2026-10-14 (literal): «el footer no se mantiene pegado abajo hay unos casos como por ejemplo cuando no hay ninguna busqueda y queda libre el espacio se esta pasando hacia arriba fijalo siempre abajo». El pendiente humano (b) (hueco bajo el footer en páginas cortas) pasa a la feature 94.
- spec_author 2026-10-14: Análisis en curso: sticky footer. Plan: body flex column + min-height 100vh/100dvh y body > main { flex: 1 0 auto } en layout.css (99 líneas exactas, fuera height: 100%); sin tocar Layout.astro, site-footer.css, site-menu.css ni archivos de la 93; ajustar UNCHANGED de geist-pixel-extend con nota; verificación en Chrome headless.
- spec_author 2026-10-14: feature 94 sticky-footer dada de alta en **pending** (sin depends_on; no depende de la 93); spec specs/94_sticky-footer/ (requirements.md REQ-94-01..13 + design.md); análisis progress/research/sticky-footer.md (incluye el solapamiento posible con la 93 en layout.css y en el `=== 99` de tests/mobile-hamburger-menu.test.mjs).
- implementer 2026-10-14: Feature en curso: 94 — sticky-footer (in_progress; la 93 sigue blocked con sus cambios intactos en el árbol).
  Plan: (1) tests/sticky-footer.test.mjs contra REQ-94-01..11 y verlo en rojo (hecho: 4 fail / 4 pass); (2) layout.css: fuera height de html, body; body flex column + min-height 100vh/100dvh; body > main { flex: 1 0 auto }, 99 líneas exactas; (3) sacar layout.css de UNCHANGED en geist-pixel-extend con nota; (4) ./init.sh verde y medición en Chrome headless; (5) informe en progress/impl_sticky-footer.md.
