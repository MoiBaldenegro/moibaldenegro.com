# Informe de implementación — feature 74 csp-router-inline-script

Implementado por el líder en rol de implementer (autorización humana; subagente implementer no
disponible). Origen: con la CSP obligatoria (feature 64), cada navegación del ClientRouter hacia
una página cuyo último script module pendiente es inline registraba la violación
«Loading the script 'data:application/javascript,' violates … script-src». El router de Astro
(router.js:110) inserta ese script vacío para esperar a los módulos inline. Prioridad baja, al
final del backlog por decisión humana.

## Fase 1: assetsInlineLimit (REQ-74-01/02/04)

- Test nuevo tests/csp-router-inline-script.test.mjs escrito primero.
  ROJO pass 2 / fail 2: no había función y el último módulo de los posts era inline.
- astro.config.mjs: vite.build.assetsInlineLimit = (filePath) => /astro_type_script|[?&]type=script/
  ? false : undefined. Los scripts de componentes Astro nunca se incrustan; el resto de assets
  conserva el límite por defecto. code-copy pasa a ser un chunk /_astro/code-copy…js.
- VERDE 4/4; suite 826/826.
- Resultado parcial (navegación real, ver tabla): desaparece la violación al ENTRAR en el post,
  pero aparece al VOLVER a la portada. El router salta los scripts ya ejecutados y el último
  módulo pendiente es el cargador inline de la server island de HTB, siempre inline.
  REQ-74-07 → feature detenida (blocked) y decisión humana.

## Fase 2: opción A del humano («sobre la 74 vamos a permitirlo, opción A»)

- Spec enmendada (REQ-74-03, 07 y 10..15). Nueva directiva
  `script-src-elem 'self' 'unsafe-inline' https://static.cloudflareinsights.com data:`. Repite
  todos los orígenes de script-src, porque la sustituye para los elementos <script>. script-src
  queda igual: rige atributos y eval, sin data: ni unsafe-eval.
- Test-first (REQ-74-09): se actualizaron primero las constantes CSP de csp-enforce,
  security-headers y csp-router-inline-script, y la clasificación del test de build
  (los scripts se juzgan por script-src-elem). Se añadió REQ-74-03/07/10: data: solo en img-src
  y script-src-elem, y script-src-elem ⊇ script-src.
  ROJO pass 11 / fail 8 con la política anterior en el módulo y en _headers.
- src/domain/http/security-headers.ts (40 líneas) y public/_headers (14) con la política de
  REQ-74-03 y un comentario del motivo.
- VERDE: suite 826/826; ./init.sh en verde.
- REQ-74-11: el test REQ-64-12 de csp-enforce usa la misma función allowed. Ahora clasifica los
  scripts con script-src-elem, acepta el beacon real y rechaza https://evil.example. El test de
  build sigue exigiendo que data: solo aparezca en img (REQ-74-13).

## Verificación real: navegación con el ClientRouter (clics) sobre astro preview, 1280×800 (REQ-74-05/06/08)

Recorrido: portada → post con código → portada → /about → /search → post con vídeo.

| paso | CSP de REQ-64-11 sin cambios | solo assetsInlineLimit | opción A (REQ-74-03) |
|---|---|---|---|
| → /posts/03-principios-solid/ | 1 violación (script-src-elem data); Copiar sin probar* | 0; Copiar «Código copiado» | 0; «Código copiado» |
| → / (vuelta a la portada) | 0 | **1 violación** (script-src-elem data) | **0** |
| → /about/ | 0 | 0 | 0 |
| → /search/ | 0 | 0 | 0 |
| → /posts/02-principios-del-diseno-de-software/ | 0 | 0 | 0 |

\* En la primera pasada a Chrome le faltaba el permiso de portapapeles y el resultado de Copiar
no es representativo.

- astro:page-load se dispara en cada destino (1 por paso).
- Con la opción A, el beacon real https://static.cloudflareinsights.com/beacon.min.js/v4bc70e2…
  inyectado en la página carga («loaded») sin violaciones.
- En la portada, el script inline de la isla HTB desaparece tras la navegación (la isla se
  resolvió); en local no pinta datos por falta de credenciales de la API.
- Cabecera servida (curl -I): la política de REQ-74-03.

## Producción (REQ-74-14)

Pendiente del deploy humano. Se repetirá la navegación sobre https://moisesbaldenegro.com.
