# Requisitos — feature 14 `whoami-page`

## Requisitos

REQ-14-01 La página de perfil SHALL servirse en la ruta /whoami desde src/pages/whoami.astro.
REQ-14-02 El repositorio SHALL eliminar src/pages/about.astro.
REQ-14-03 El enlace del header a la página de perfil SHALL mostrar el texto whoami y apuntar a /whoami.
REQ-14-04 El enlace del header a la página de perfil SHALL llevar aria-current="page", WHERE la ruta actual es /whoami o /whoami/.
REQ-14-05 La columna de navegación del footer SHALL mostrar el enlace whoami hacia /whoami.
REQ-14-06 El título de la página de perfil SHALL ser «whoami — moisesbaldenegro.com».
REQ-14-07 WHEN una petición llega a /about o /about/, el sitio SHALL responder 301 con destino /whoami.
REQ-14-08 WHEN una petición llega a la raíz /, el sitio SHALL responder 301 con destino /whoami.
REQ-14-09 El sitemap SHALL listar /whoami/ en lugar de /about/.
REQ-14-10 El autor de los artículos en los datos estructurados SHALL apuntar a /whoami.
REQ-14-11 Los enlaces de las tarjetas promocionales SHALL apuntar a /whoami en lugar de /about.
REQ-14-12 Los archivos de src SHALL dejar de enlazar a la ruta /about.
