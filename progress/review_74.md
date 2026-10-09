# Review — feature 74

**Veredicto:** APPROVED

Alcance revisado: la spec enmendada con la opción A (specs/74_csp-router-inline-script/requirements.md,
REQ-74-01..15), progress/research/horizontal_feedback.md §6 y progress/impl_74.md. Archivos:
astro.config.mjs (L45, ya en el commit c0d0e4d), src/domain/http/security-headers.ts (L11-12, L20-21),
public/_headers (L9), tests/csp-router-inline-script.test.mjs (L16, L31-40),
tests/csp-enforce.test.mjs (L4, L18, L56) y tests/security-headers.test.mjs (L7, L20).
Dependencia: depends_on [73], y la 73 está en `done`.

## Pregunta de revisión (test-first)
- Fase 1: impl_74.md registra el ROJO 2/4 de tests/csp-router-inline-script.test.mjs antes de
  tocar astro.config.mjs, y después el VERDE 4/4.
- Fase 2: impl_74.md registra el ROJO (pass 11 / fail 8) con las constantes nuevas de los tres
  tests y la política de REQ-64-11 aún en el módulo y en _headers. Después la cambia y llega al
  VERDE 826/826 (REQ-74-09).
- `./init.sh` verde en esta revisión: formato, tests al 100% y build. No hubo bloqueo de dist/.

## Seguridad de la política resultante
- REQ-74-03: el valor de security-headers.ts y el de public/_headers coinciden byte a byte con la
  spec. script-src-elem repite 'self', 'unsafe-inline' y el origen del beacon, así que Web
  Analytics no se rompe. REQ-64-12 se sigue validando con la clasificación por script-src-elem
  (csp-enforce L90-92: acepta el beacon real y rechaza evil.example).
- REQ-74-07/10: script-src no cambia (sin data: ni 'unsafe-eval'). script-src-attr y worker-src
  heredan de script-src, así que no reciben data:. data: solo aparece en img-src y
  script-src-elem, y el test lo afirma (csp-router-inline-script L34-38).
- Riesgo residual: bajo y aceptado por el humano. 'unsafe-inline' ya permitía ejecutar cualquier
  `<script>` inyectado. data: solo añade la variante src=data:, que podría saltar un filtro que
  bloquee el cuerpo inline pero no el atributo src. object-src 'none', base-uri 'self' y
  frame-ancestors 'none' se mantienen.
- REQ-74-13: `allowed` (csp-enforce L53) sigue rechazando cualquier src data: de script en el
  HTML del build. El data: solo se tolera en runtime, porque lo inserta el router.

## REQ-74-14 (producción)
Pendiente del deploy humano. impl_74.md lo declara así (sección «Producción»). No bloquea la
aprobación del código, pero la verificación en https://moisesbaldenegro.com debe quedar
anotada antes de dar por cerrada la parte operativa: cero violaciones en la navegación de
REQ-74-05, beacon.min.js con 200 y POST a /cdn-cgi/rum sin bloqueo.

## Checkpoints
- Estilos en src/styles, sin `<style>` en .astro: [x] (no se toca UI)
- Sin lógica en UI: [x]
- Datos vía repositorio: [x] (no aplica)
- Tokens: [x] (no aplica)
- <= 100 líneas: [x] (astro.config.mjs 56, security-headers.ts 40, _headers 14,
  csp-enforce 100, security-headers.test 88, csp-router-inline-script 67)
- Sin dependencias externas: [x]
- Datos JSON válidos: [x]
- Repositorios con errores nombrados: [x] (no aplica)
- ./init.sh verde: [x]
- Página correcta en desktop y móvil sin errores en consola: [x] para lo que cubre la feature:
  navegación real con CDP a 1280×800 con 0 violaciones en los 5 pasos (impl_74.md). Móvil no
  aplica.
- feature_list.json con la tarea en done y ninguna otra a medias: [ ]  ← La 74 sigue
  `in_progress` hasta que el líder la cierre tras este veredicto. No es un defecto.
- progress/current.md documenta la sesión: [x]
- Sin temporales, debug ni TODOs: [x]

## Cambios requeridos (si aplica)
Ninguno bloqueante.

Observación no bloqueante: la cabecera de tests/csp-router-inline-script.test.mjs (L1-5) sigue
diciendo «Se evita sin tocar la CSP: los scripts de componentes Astro nunca se incrustan». Tras la
opción A ya no es exacto. La nota de ajuste de L31 lo corrige localmente, pero conviene
actualizar la cabecera en un próximo toque.
