# Feature 10 client-init-on-navigation: desbloqueo (spec_author, 2026-10-20)

## Por qué estaba blocked

- No era un bloqueo técnico. La aparcó el humano el 2026-10-08: «la 10 me parece que la podemos
  ignorar, no tenemos reporte de que esté funcionando mal» (ver progress/research/audit_backlog.md §8).
- No pide dependencias externas ni superar 100 líneas. depends_on 3, 4, 5, 6, 7 y 9 están todas en done.
- Instrucción humana del 2026-10-16: «Has todo lo que tengas pendiente de una ves». Con ella, el
  orquestador pide desbloquearla si no hace falta ninguna decisión humana. No hace falta, así que
  pasa a pending.

## Estado del código (revisión estática, sin navegador)

- Los cuatro `<script>` registran la init con `document.addEventListener('astro:page-load', ...)`:
  search-results.astro:28, search-bar.astro:26, search-live.astro:17 y search-escape.astro:8.
  REQ-10-01..05 se cumplen.
- initSearchEscape tiene guard de módulo (removeEventListener del manejador anterior). REQ-10-04 se cumple.
- initSearchLive retira el manejador `search:change` anterior antes de añadir el nuevo. REQ-10-06 se cumple.
- El comentario de cabecera de search-escape.ts ya declara la re-init. REQ-10-09 se cumple.
- El header no lleva transition:persist (solo new-hero.astro lo usa), así que initSearchBar
  conecta cada vez un DOM nuevo y no acumula listeners en un input persistente.

## Huecos sospechados (hay que confirmarlos en navegador y corregirlos test-first)

1. REQ-10-10. El listener astro:page-load de search-results se registra al evaluar el módulo por
   primera vez y sigue vivo en el resto de la sesión, también en páginas sin `.search-results`.
   initSearchResults calcula `termFromPathname(location.pathname)`: para `/about` sale `about` y
   para `/posts/x` sale `posts x`. Con ese término reescribe `document.title = "Búsqueda: about"`
   y llama a withSearchIndex, que pide el índice. Fix probable: salir al principio si no existe
   `.search-results`.
2. REQ-10-11. initSearchLive hace `if (panel === null) return;` antes de retirar `changeHandler`.
   Al salir de la portada, el manejador de la visita anterior sigue escuchando `search:change`
   sobre el panel desconectado, y escribir en la barra de /about lo dispara (puede pedir el
   índice). Fix probable: retirar el manejador antes del return.

## Verificación en navegador exigida (REQ-10-12..15)

- Chrome headless + CDP contra `pnpm build` + preview. El helper que sirve de base es
  progress/research/cls104/scripts/lib.mjs (spawn de chrome.exe, logs de consola y excepciones).
- Navegar siempre con clic en los enlaces del navbar (ClientRouter, sin recarga). Rutas:
  /arquitectura, /diseno-de-sistemas y /search?q=<término>, con dos o más visitas a cada una
  desde otra página.
- Tras tres o más navegaciones, comprobar la búsqueda en vivo, el botón de limpieza y Escape.
- Volver tres o más veces a la portada y comprobar que un evento de cambio de consulta ejecuta
  el manejador una sola vez.
- El recorrido debe dar 0 errores de consola. Capturas, script y salida van en progress/research/client-init10/.

## Riesgos

- Los tests nuevos no pueden pasar de 100 líneas por archivo. tests/client-init-on-navigation.test.mjs
  ya tiene 266 líneas, así que los nuevos REQ van en un archivo de test aparte.
- Si los huecos 1 y 2 no se reproducen en navegador, el implementer lo documenta. Aun así añade
  el test unitario, que es el criterio de los REQ.
