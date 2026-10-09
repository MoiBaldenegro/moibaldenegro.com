# Análisis — Mejoras pendientes al cerrar la auditoría (features 61-64)

Fecha: 2026-10-09. Autor: spec_author. Origen: observaciones al cerrar las
features 31-60 (progress/research/audit_backlog.md, progress/history.md).

Orden: primero los bugs visibles (61, 62), después el ajuste de marca (63) y
por último el endurecimiento de la CSP (64). Las cuatro son independientes
(sin `depends_on`): tocan archivos disjuntos salvo Layout.astro (63) y el
build que verifica la 64.

| id | name | tipo | archivos previstos | design.md |
|----|------|------|--------------------|-----------|
| 61 | header-anchor-offset-mobile | bug | tokens.css, layout.css (+ tests de conteo de tokens.css) | sí |
| 62 | code-copy-fixed-corner | bug | code-copy.ts, code-copy.css (+ tests/code-copy-button.test.mjs) | sí |
| 63 | theme-color-dark | mejora | public/site.webmanifest, src/domain/seo/theme.ts (nuevo), Layout.astro | sí |
| 64 | csp-enforce | seguridad | src/domain/http/security-headers.ts, public/_headers (+ tests/security-headers.test.mjs) | no |

## 61 — Anclas tapadas por el header en móvil

Estado actual (feature 51): `--header-height: 74px` (tokens.css:81), `html {
scroll-padding-top: var(--header-height) }` (layout.css:11), header sticky
salvo con alto de viewport ≤500px. En ≤768px el nav se envuelve
(search-bar.css:79-89: `flex-wrap: wrap`, buscador al 100%), y la medición de
la feature 51 (impl_51.md) da 137 px de header a 320 px → 63 px del destino
de ancla quedan bajo la barra. Además el nav no tiene padding vertical: cuando
el contenido supera el `min-height`, las líneas se empaquetan arriba y el logo
toca el borde superior del viewport.

Decisión propuesta (asumida, revisable por el humano):
- Token nuevo `--header-height-mobile` en tokens.css cuyo valor es ≥ la altura
  medida del header a 320 px ya con el padding nuevo (orientativo: 137 + 2×14
  = 165 px → p. ej. 168px). El valor final lo fija la medición en navegador.
- En el bloque `@media (max-width: 768px)` existente de layout.css:
  `html { scroll-padding-top: var(--header-height-mobile) }` y
  `padding-block: var(--gap-card)` en `.site-navbar nav`.
- Escritorio (>768px) no cambia: sigue con `--header-height`.

Riesgos y trabas:
- layout.css tiene 97 líneas: hay que meter las reglas dentro del media
  existente o compactar comentarios para no pasar de 100.
- tokens.css tiene 95 líneas y hay tests que fijan ese conteo
  (tests/article-card-images.test.mjs REQ-17-09, tests/post-header-horizontal
  REQ-42-09 y los demás contadores ajustados en la 51). Añadir el token obliga
  a actualizarlos a 97 (precedente REQ-43-06 / feature 51). Está autorizado
  en la spec.
- Entre 375 y 768 px el header ocupa menos líneas: el scroll-padding móvil
  deja algo más de aire que el necesario. Es aceptable (nunca tapa).
- Alternativa descartada: header `position: static` en ≤768px. Cambia el
  comportamiento acordado en la 51 (sticky en móvil vertical); se deja como
  opción si el humano prefiere no fijar un valor medido.
- Verificación real en navegador obligatoria (la review de la 51 la exigió):
  Chrome headless + CDP a 320, 375 y 768 px.

## 62 — Botón de copiar que se desplaza con el scroll horizontal

Causa raíz: code-copy.ts añade el botón como hijo del `pre.astro-code`
(`pre.appendChild(button)`) y code-copy.css lo posiciona `absolute` respecto
al pre (`position: relative` en el pre). El pre tiene `overflow-x: auto`
(post.css:87-93): un hijo absolutamente posicionado dentro de un contenedor
con scroll se desplaza con su contenido.

Decisión: envolver cada pre en un `div.code-block` (`position: relative`),
insertar el envoltorio en el lugar del pre y colgar el botón del envoltorio,
no del pre. El scroll sigue en el pre; el botón queda fijo en la esquina
superior derecha del bloque visible. Idempotente igual que hoy
(`dataset.copyReady`). El texto copiado sigue saliendo de `code`.

Riesgos:
- tests/code-copy-button.test.mjs (REQ-CC-02/03) usa fakes con
  `pre.appendChild`; hay que ampliar los fakes (parentNode/insertBefore) y
  ajustar las aserciones al envoltorio. Autorizado en la spec.
- code-copy.ts tiene 84 líneas: el envoltorio cabe (~6 líneas) sin pasar 100.
- La regla `position: relative` del pre en code-copy.css pasa al envoltorio;
  margin del pre intacto (post.css), así que el aspecto no cambia.
- Alternativa descartada: `position: sticky` del botón dentro del pre (ocupa
  espacio en el flujo, depende de floats y no fija bien el top).

## 63 — theme_color blanco en site.webmanifest

`public/site.webmanifest` declara `theme_color` y `background_color` =
`#ffffff`; el tema es oscuro (`--color-background: #070716`, tokens.css:13).
Layout.astro no tiene `<meta name="theme-color">`. Resultado: barra del
navegador/PWA y splash blancos.

Decisión: ambos campos del manifest = `#070716` (valor de
`--color-background`; `--color-navbar` es rgba y no sirve como color opaco).
Añadir `<meta name="theme-color">` en el head con el mismo valor a través de
una constante `THEME_COLOR` en `src/domain/seo/theme.ts` (lógica fuera del
.astro; el hex no se hardcodea en el componente). Un test garantiza la
igualdad token = constante = manifest para que no se desincronicen.

Riesgo: el manifest y la meta no pueden leer custom properties; la
sincronía la vigila el test (la regla de tokens aplica al CSS).

## 64 — CSP de Report-Only a obligatoria

Hoy: `Content-Security-Policy-Report-Only` en
src/domain/http/security-headers.ts (fuente única, usada por
src/middleware.ts para las respuestas del Worker) y replicada en
public/_headers (assets estáticos). Política:
`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline'; frame-src https://www.youtube-nocookie.com
https://www.youtube.com; frame-ancestors 'none'; base-uri 'self';
object-src 'none'`.

Inventario del build actual (dist/client, 12 HTML, 2026-10-09):
- Scripts: módulos `/_astro/*.js` (ClientRouter, search-bar, search-escape,
  search-live) → `'self'`. Inline: cargador de server islands (home,
  `data-astro-rerun`) y el módulo inline de code-copy (posts) →
  `'unsafe-inline'`. `application/ld+json` no se ejecuta (no le aplica
  script-src).
- Bundles `_astro/*.js`: sin `eval(`, `new Function`, `blob:` ni `Worker(`
  → no hace falta `'unsafe-eval'`.
- fetch: solo rutas relativas (server islands `/_server-islands/...`,
  ClientRouter, índice de búsqueda) → connect-src por `default-src 'self'`.
- Estilos: `/_astro/*.css` + `<style>` inline + atributos `style` de Shiki →
  `'self' 'unsafe-inline'`.
- Imágenes: todas `/assets/...` (contenido, avatar, logo) → `'self'`. Sin
  `@font-face` ni fuentes externas (Inter se usa del sistema).
- iframe: `https://www.youtube-nocookie.com/embed/...` en
  02-principios → frame-src.
- Widget HTB: server island; la API de HTB se consulta en el servidor, el
  navegador solo pide `/_server-islands/HtbStadistics` (mismo origen).
- Manifest, favicons y formulario `/search` (GET) mismo origen.
Conclusión: la política vigente es compatible con todo lo que usa el build;
se aplica tal cual en modo obligatorio, sin relajarla ni ampliarla.

Riesgos:
- Inyección de Cloudflare en el borde (Web Analytics
  `static.cloudflareinsights.com`, Rocket Loader, Email Obfuscation): no se
  pudo comprobar el sitio en vivo (sin red en esta sesión). El implementer
  debe revisar el HTML en vivo (o los informes Report-Only recibidos) y, si
  aparece un origen externo no cubierto, parar y registrarlo antes de aplicar.
- tests/security-headers.test.mjs fija el nombre Report-Only (EXPECTED,
  REQ-40-01/02/03/06): se actualiza al nombre obligatorio. Autorizado.
- Verificación en navegador con la cabecera obligatoria: home (isla HTB),
  about, search, término, post con código (copiar), 02-principios (iframe),
  404 → cero violaciones `securitypolicyviolation` / errores CSP en consola.

## Dudas abiertas para el humano

- 61: se asume mantener el header sticky en móvil (token medido). Si se
  prefiere header estático en ≤768px, se reescribe la spec.
- 64: confirmar si Cloudflare Web Analytics u otra inyección del borde está
  activa en el dominio.
