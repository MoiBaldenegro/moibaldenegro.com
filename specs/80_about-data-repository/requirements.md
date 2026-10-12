# Requisitos — Datos y repositorio del About (feature 80 about-data-repository)
# Origen: petición humana 2026-10-12 de rediseñar /about con el CV del autor. Análisis: progress/research/about-redesign.md (contenido canónico en §4). Fuente primaria: progress/research/about-cv.md.
# No toca UI: sin design.md. Base de las features 81-84. Sin depends_on.
# Nombre, handle, foto y línea de enfoque siguen SOLO en src/data/hero.json (HeroProfileRepository); about.json no los duplica.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-80-01/02/03→1, REQ-80-04/05/06/07/08→2, REQ-80-09/10/11→3, REQ-80-12/13/14→4, REQ-80-15/16/17→5, REQ-80-18/19/20→6.

## Requisitos

REQ-80-01 El archivo src/data/about.json SHALL contener los campos headline, location, photoAlt, summary, links, stats, experience, skills, projects, content, education, certifications, languages y philosophy con el contenido canónico de progress/research/about-redesign.md §4.
REQ-80-02 La entidad AboutProfile de src/domain/entities/about-profile.ts SHALL tipar todos los campos de about.json como readonly, incluidos los arrays y los objetos anidados.
REQ-80-03 El repositorio AboutRepository de src/domain/repositories/about-repository.ts SHALL ser la única vía de acceso a about.json y entregar la entidad con getProfile(), WHERE el contenido se lee con un loader inyectable () => string cuyo default materializa el JSON con import con atributo como hero-profile-repository.ts.
REQ-80-04 IF el loader lanza, THEN el repositorio SHALL lanzar AboutDataError con un mensaje que nombra about.json.
REQ-80-05 IF el contenido no es JSON válido, THEN el repositorio SHALL lanzar AboutDataError.
REQ-80-06 IF un campo de texto obligatorio falta o no es un texto no vacío, THEN el repositorio SHALL lanzar AboutDataError con el nombre del campo en el mensaje.
REQ-80-07 IF un campo de lista falta o no es un array con al menos un elemento, THEN el repositorio SHALL lanzar AboutDataError con el nombre del campo en el mensaje.
REQ-80-08 IF un enlace de links tiene un id fuera del conjunto github linkedin youtube y site, THEN el repositorio SHALL lanzar AboutDataError con el id en el mensaje.
REQ-80-09 El campo experience SHALL contener exactamente cuatro puestos en orden cronológico inverso con role, organization, place, period y highlights.
REQ-80-10 El primer puesto SHALL llevar el period sep 2023 – presente y el campo result con el sistema en producción en septiembre de 2025.
REQ-80-11 Los puestos del segundo al cuarto SHALL llevar como period las duraciones 1 año 2 meses, 3 años 5 meses y 1 año 4 meses sin ningún año ni mes de calendario.
REQ-80-12 El módulo src/domain/about-links.ts SHALL exportar heroLinks(profile) que devuelve los enlaces github, linkedin y youtube en ese orden.
REQ-80-13 El módulo src/domain/about-links.ts SHALL exportar cvContact(profile) que devuelve los enlaces site, linkedin y github en ese orden.
REQ-80-14 IF heroLinks o cvContact no encuentran un id requerido, THEN la función SHALL lanzar AboutDataError con el id ausente en el mensaje.
REQ-80-15 El archivo about.json SHALL estar libre de cualquier dirección de correo electrónico y de cualquier número de teléfono.
REQ-80-16 El archivo about.json SHALL estar libre de los términos Salud Digna, Cinnamon, neww relic, moisesbaldenegro1546 y Lamar University.
REQ-80-17 Los href de links y de projects y de content SHALL ser URLs https absolutas o la ruta interna /.
REQ-80-18 El test tests/about-data-repository.test.mjs SHALL escribirse y observarse en rojo antes de crear about.json, la entidad y el repositorio.
REQ-80-19 Cada archivo creado SHALL medir 100 líneas o menos, WHERE el parseo puede repartirse entre about-repository.ts y un módulo hermano about-parse.ts.
REQ-80-20 La feature SHALL dejar sin cambios src/data/hero.json, src/pages/about.astro, src/styles/ y package.json.
