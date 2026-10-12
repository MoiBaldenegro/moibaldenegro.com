# Requisitos — Timeline de experiencia y stack por área en /about (feature 83 about-experience-skills)
# Origen: petición humana 2026-10-12 (puntos 3 y 4: timeline de 4 puestos con logros y stack agrupado por área). Análisis: progress/research/about-redesign.md §4.
# Toca UI: ver design.md en esta carpeta. depends_on [82] (carcasa de about.astro).
# Los puestos 2-4 muestran duración, nunca fechas inventadas (REQ-80-11).
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-83-01/02→1, REQ-83-03/04/05/06→2, REQ-83-07/08/09→3, REQ-83-10/11/12→4, REQ-83-13/14/15→5, REQ-83-16/17/18→6.

## Requisitos

REQ-83-01 La página src/pages/about.astro SHALL componer AboutTimeline y AboutSkills después de AboutStats y antes de la sección con p.about__intro.
REQ-83-02 La página SHALL pasar about.experience a AboutTimeline y about.skills a AboutSkills sin transformarlos en el frontmatter.
REQ-83-03 El componente src/components/about/about-timeline.astro SHALL renderizar una sección con el h2 Experiencia y una lista ordenada con un elemento por puesto en el orden de los datos.
REQ-83-04 Cada puesto SHALL mostrar el role en un h3, la organización y el lugar, y el period en un span con la clase about-timeline__period.
REQ-83-05 Cada puesto SHALL mostrar sus highlights como lista sin ordenar.
REQ-83-06 IF un puesto tiene result, THEN el timeline SHALL mostrarlo en un párrafo destacado con la etiqueta visible Resultado.
REQ-83-07 El HTML construido de /about SHALL contener los periodos sep 2023 – presente, 1 año 2 meses, 3 años 5 meses y 1 año 4 meses.
REQ-83-08 El HTML construido de /about SHALL contener solo los años 2023 y 2025 dentro de la sección Experiencia.
REQ-83-09 WHILE el viewport mide 769 px o más, el timeline SHALL mostrar una línea vertical con un marcador de var(--color-accent) por puesto.
REQ-83-10 El componente src/components/about/about-skills.astro SHALL renderizar una sección con el h2 Stack y habilidades y una tarjeta por área con su nombre en un h3.
REQ-83-11 Cada tarjeta de área SHALL mostrar sus items como lista de píldoras con borde var(--color-border-strong) y radio var(--radius-pill).
REQ-83-12 WHILE el viewport mide 900 px o más, las tarjetas de área SHALL distribuirse en una rejilla de al menos dos columnas.
REQ-83-13 Los componentes SHALL importar sus hojas src/styles/about-timeline.css y src/styles/about-skills.css.
REQ-83-14 Las hojas nuevas SHALL expresar colores, radios, sombras, transiciones y tipografía solo con var() de tokens.css y margin, padding y gap solo con var(--gap-card), calc() sobre var(--gap-card), 0 o auto.
REQ-83-15 WHILE el viewport mide 375 px de ancho, la página SHALL cumplir scrollWidth igual a clientWidth con el timeline en una sola columna.
REQ-83-16 La página SHALL conservar un solo h1 con los h2 de sección y los h3 de puesto y de área sin saltos de nivel.
REQ-83-17 El test tests/about-experience-skills.test.mjs SHALL escribirse y observarse en rojo antes de crear los componentes y las hojas.
REQ-83-18 Cada archivo creado o modificado SHALL medir 100 líneas o menos con la suite completa en verde.
