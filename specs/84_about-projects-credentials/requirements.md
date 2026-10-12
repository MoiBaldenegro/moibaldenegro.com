# Requisitos — Proyectos, contenido, formación y filosofía en /about (feature 84 about-projects-credentials)
# Origen: petición humana 2026-10-12 (puntos 5, 6 y 7). Análisis: progress/research/about-redesign.md §3 (H1, H11) y §4.
# Toca UI: ver design.md en esta carpeta. depends_on [83] (about.astro ya compone hero, cifras, timeline y stack).
# Compatibilidad: el literal <p class="about__intro">{SITE_DESCRIPTION}</p> de REQ-39-05 sigue en about.astro, ahora como hijo (slot) de AboutContent; tests/single-h1-headings.test.mjs pasa sin cambios.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-84-01/02/03→1, REQ-84-04/05/06→2, REQ-84-07/08/09→3, REQ-84-10/11/12→4, REQ-84-13/14/15→5, REQ-84-16/17/18/19→6, REQ-84-20/21/22→7.

## Requisitos

REQ-84-01 La página src/pages/about.astro SHALL componer en este orden AboutHero, AboutStats, AboutTimeline, AboutSkills, AboutProjects, AboutContent, AboutCredentials y AboutPhilosophy.
REQ-84-02 La página SHALL pasar <p class="about__intro">{SITE_DESCRIPTION}</p> como contenido del slot de AboutContent y eliminar la sección final que lo contenía.
REQ-84-03 La página SHALL limitarse a imports y paso de datos en el frontmatter con 100 líneas o menos.
REQ-84-04 El componente src/components/about/about-projects.astro SHALL renderizar una sección con el h2 Proyectos destacados y una tarjeta por proyecto con su nombre en un h3 enlazado a su href.
REQ-84-05 Cada tarjeta de proyecto SHALL mostrar la descripción del proyecto y un texto visually-hidden que indica sitio externo en el enlace.
REQ-84-06 El HTML construido de /about SHALL contener los cinco proyectos Raúl, mouter-router, MFinance, Testimo y Harness Kit con las URLs de progress/research/about-redesign.md §4.
REQ-84-07 El componente src/components/about/about-content.astro SHALL renderizar una sección con el h2 Contenido, su slot tras el h2 y una tarjeta enlazada por elemento de content.
REQ-84-08 La sección Contenido SHALL enlazar el blog a la ruta / y el Curso de Rust desde Cero a https://www.youtube.com/@moibaldenegro.
REQ-84-09 El HTML construido de /about SHALL estar libre de enlaces a youtube.com/@moisesbaldenegro1546 y a cinnamon.ai.
REQ-84-10 El componente src/components/about/about-credentials.astro SHALL renderizar una sección con el h2 Formación y certificaciones y tres bloques con los h3 Educación, Certificaciones e Idiomas.
REQ-84-11 El bloque Educación SHALL mostrar Ingeniería en Ciberseguridad y Telecomunicaciones con Universidad LAMAR, Campus Chapultepec, Guadalajara, Jalisco sin fechas.
REQ-84-12 Los bloques Certificaciones e Idiomas SHALL mostrar las tres certificaciones con su emisor y los dos idiomas con su nivel.
REQ-84-13 El componente src/components/about/about-philosophy.astro SHALL renderizar una sección con el h2 Filosofía, el lema Deterministic Engineering in an Agentic World con lang en y el texto de philosophy.
REQ-84-14 Los componentes AboutProjects y AboutContent SHALL importar src/styles/about-projects.css y los componentes AboutCredentials y AboutPhilosophy src/styles/about-credentials.css.
REQ-84-15 Las hojas nuevas SHALL expresar colores, radios, sombras, transiciones y tipografía solo con var() de tokens.css y margin, padding y gap solo con var(--gap-card), calc() sobre var(--gap-card), 0 o auto.
REQ-84-16 WHILE el viewport mide 900 px o más, los proyectos y los bloques de formación SHALL distribuirse en rejillas de al menos dos columnas.
REQ-84-17 WHILE el viewport mide 375 px de ancho, la página SHALL cumplir scrollWidth igual a clientWidth.
REQ-84-18 La página SHALL conservar un solo h1 con h2 por sección y h3 por elemento sin saltos de nivel.
REQ-84-19 El HTML construido de /about SHALL estar libre de correos electrónicos, números de teléfono, elementos script propios de la página y de los términos excluidos de REQ-80-16.
REQ-84-20 El test tests/about-projects-credentials.test.mjs SHALL escribirse y observarse en rojo antes de crear los componentes y las hojas.
REQ-84-21 Cada archivo creado o modificado SHALL medir 100 líneas o menos.
REQ-84-22 WHEN termina la feature, la suite completa SHALL pasar en verde con tests/about-page.test.mjs y tests/single-h1-headings.test.mjs sin cambios.
