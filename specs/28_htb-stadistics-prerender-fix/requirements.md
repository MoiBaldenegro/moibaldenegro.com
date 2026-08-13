# Requisitos — htb-stadistics-prerender-fix

REQ-28-01 El componente htb-stadistics.astro SHALL consumir el token y el identificador exclusivamente desde astro:env/server, WHERE el esquema de entorno los declara secretos de contexto server.
REQ-28-02 El componente htb-stadistics.astro SHALL no importar el módulo cloudflare:workers, WHERE el prerender del sitio se ejecuta en el entorno node.
REQ-28-03 El frontmatter del componente SHALL resolver el perfil con el método getProfileOrNull, WHERE la degradación elegante de la feature 27 permanece intacta.
REQ-28-04 IF la edición manual reintroduce cloudflare:workers o los fallbacks de entorno en el componente, THEN el test de la feature SHALL fallar.
REQ-28-05 El sitio SHALL completar el build de producción sin errores, WHERE el prerender corre en node y el módulo cloudflare:workers no existe en ese entorno.
REQ-28-06 El componente SHALL conservar el marcado canónico de la feature 27, WHERE la sección se condiciona al perfil con la expresión {profile && ...}.
