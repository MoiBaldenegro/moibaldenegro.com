# Requisitos — ssr-cloudflare-align

REQ-21-01 El proyecto SHALL conservar el modo servidor con el adapter de Cloudflare, WHERE astro.config.mjs declara output server y el adapter cloudflare.
REQ-21-02 El script generate-types SHALL declarar la generación de tipos del runtime Cloudflare, WHERE package.json lo define con wrangler types.
REQ-21-03 La carpeta .wrangler SHALL permanecer fuera del control de versiones, WHERE .gitignore la excluye y el estado versionado deja de rastrearse.
REQ-21-04 El test de la página about SHALL verificar la ruta generada por el adapter, WHERE la salida real del build es dist/client/about/index.html.
REQ-21-05 IF la ruta /about no se genera en el build, THEN el test de la página SHALL fallar.
REQ-21-06 Las dependencias del adapter SHALL quedar justificadas en esta feature, WHERE la regla de dependencias externas exige la decisión documentada.