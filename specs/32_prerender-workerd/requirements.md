# Requisitos — prerender-workerd

REQ-32-01 La configuración del adapter SHALL declarar prerenderEnvironment workerd, WHERE el resto del bloque vite permanece sin cambios.
REQ-32-02 El componente htb-stadistics.astro SHALL definir el token y el identificador con fallback entre astro:env/server y cloudflare:workers, WHERE el prerender corre en workerd y el módulo virtual existe en ese entorno.
REQ-32-03 El test htb-stadistics-prerender-fix.test.mjs SHALL fijar la presencia del fallback cloudflare:workers en el componente, WHERE la feature 28 permanece done como historial.
REQ-32-04 El componente SHALL conservar la obtención del perfil con el método getProfileOrNull y el marcado condicionado con profile, WHERE la degradación elegante de la feature 27 permanece intacta.
REQ-32-05 El sitio SHALL completar el build de producción sin errores, WHERE el prerender corre en workerd y cloudflare:workers resuelve de forma nativa en ese entorno.
REQ-32-06 IF el build real falla con un error ECONNREFUSED del prerenderer, THEN la mitigación SHALL documentarse con la variable NODE_OPTIONS con dns-result-order ipv4first, WHERE el bug IPv4/IPv6 del prerenderer 14.2.1 sigue abierto.
REQ-32-07 El archivo wrangler.jsonc SHALL conservar los compatibility_flags nodejs_compat y global_fetch_strictly_public sin cambios, WHERE la toolchain instalada es date-unaware.