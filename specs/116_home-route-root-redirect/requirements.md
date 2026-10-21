# Requisitos — Feature 116: home-route-root-redirect

## Requisitos

REQ-116-01 La portada SHALL renderizarse desde src/pages/home.astro con prerender true y el mismo contenido que tenía src/pages/index.astro (hero, últimos artículos, latest horizontal, SearchLive y footer).
REQ-116-02 El build SHALL emitir dist/client/home/index.html y no emitir dist/client/index.html.
REQ-116-03 El proyecto SHALL dejar de contener src/pages/index.astro.
REQ-116-04 La función pura rootRedirect de src/domain/http/root-redirect.ts SHALL devolver '/about' para el pathname '/' y null para cualquier otro pathname incluidos '/home', '/about' y '/arquitectura'.
REQ-116-05 WHEN llega una petición GET o HEAD a '/', src/middleware.ts SHALL responder 301 con Location '/about' seguido de la query original y con las cabeceras de withSecurityHeaders.
REQ-116-06 IF el pathname de la petición es un slug antiguo de posts, THEN src/middleware.ts SHALL seguir respondiendo la 301 de legacyRedirect sin cambios.
REQ-116-07 La configuración SHALL dejar astro.config.mjs sin la clave redirects y public/ sin el archivo _redirects.
REQ-116-08 El enlace del logo del header en src/layouts/Layout.astro SHALL apuntar a '/home' con aria-current page cuando Astro.url.pathname es '/home' o '/home/'.
REQ-116-09 El enlace Inicio de la navegación del footer en src/domain/site-footer.ts SHALL apuntar a '/home'.
REQ-116-10 El logo del footer en src/components/site-footer/site-footer.astro SHALL apuntar a '/home'.
REQ-116-11 El enlace «Volver al inicio» de src/components/not-found/not-found.astro SHALL apuntar a '/home'.
REQ-116-12 El proyecto del blog en src/data/about.json SHALL llevar href '/home'.
REQ-116-13 La función clearDestination de src/components/search-results/term-route.ts SHALL devolver '/home' en una ruta /<término> con término no vacío.
REQ-116-14 Los archivos de src/ SHALL dejar de contener enlaces internos con href '/' exacto.
REQ-116-15 La función buildSitemap SHALL incluir la loc absoluta <site>/home/ y no incluir la loc <site>/ de la raíz.
REQ-116-16 La función robotsTxt SHALL mantener su salida actual con Allow: / y la línea Sitemap absoluta.
REQ-116-17 La página /home SHALL declarar link rel canonical con la URL absoluta https://moisesbaldenegro.com/home/ y sin meta robots noindex.
REQ-116-18 WHEN se pide /home, el sitio SHALL servir la portada estática y no la ruta catch-all [...term].astro de búsqueda por término.
REQ-116-19 WHEN el ClientRouter navega desde o hacia /home, el sitio SHALL completar la navegación sin errores en consola ni recarga completa.
REQ-116-20 Los tests que leen dist/client/index.html o src/pages/index.astro SHALL apuntar a dist/client/home/index.html o src/pages/home.astro con la nota «Ajuste feature 116 (precedente REQ-43-06)» y sin relajar sus aserciones ni el umbral de 42 000 B de REQ-47-06.
REQ-116-21 Los tests que esperan '/' como destino de Inicio o del logo o de clearDestination o de la loc de portada del sitemap o del href del proyecto del blog SHALL esperar '/home' con la misma nota de ajuste.
REQ-116-22 Cada archivo creado o modificado en src/ SHALL quedar en 100 líneas o menos sin dependencias nuevas.
