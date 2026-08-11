# Requisitos — about-page

REQ-11-01 El sitio SHALL exponer la ruta /about mediante el archivo src/pages/about.astro.
REQ-11-02 La página about SHALL usar el layout único del sitio.
REQ-11-03 La página about SHALL mostrar el perfil del autor desde el repositorio HeroProfileRepository.
REQ-11-04 La página about SHALL importar sus estilos desde src/styles/about.css con tokens del diseño y un máximo de 100 líneas.
REQ-11-05 IF la ruta /about no se genera en el build, THEN el test de páginas SHALL fallar.
