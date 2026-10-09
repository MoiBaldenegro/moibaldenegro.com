# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- (ninguna: features 70-72 en done; 10 en blocked por decisión humana)

### Plan

- Análisis en curso: feedback humano de la feature 72 (cards muy separadas, saltito al fijar la sección) y violación CSP del router en las navegaciones del ClientRouter.
- Plan: (1) informe progress/research/horizontal_feedback.md; (2) spec y alta de la 73 latest-horizontal-compact-sticky (cards contiguas con gap de token, scroll 1:1, sticky CSS en lugar del pin de ScrollTrigger, geometría pura ajustada); (3) spec y alta de la 74 csp-router-inline-script (prioridad baja, depends_on [73]); (4) ./init.sh.

### Bitácora

- spec_author: alta de la 73 latest-horizontal-compact-sticky (pending, depends_on [72]; spec specs/73_latest-horizontal-compact-sticky/requirements.md y design.md) y de la 74 csp-router-inline-script (pending, prioridad baja, depends_on [73]; spec specs/74_csp-router-inline-script/requirements.md). Análisis: progress/research/horizontal_feedback.md. Abiertas para el humano: 3 o 4 cards, gap var(--gap-card), scroll 1:1 y, en la 74, opción de build (recomendada) frente a data: en script-src-elem.
- spec_author: check-format en verde. ./init.sh falla en el bloque de tests y en el de build por un fallo de entorno ajeno a estos cambios (solo se tocaron JSON y md). Fallan REQ-11-05 y REQ-30-13, porque `pnpm build` da EPERM al vaciar dist/client: lo tiene bloqueado un `astro preview --port 4399` (más un `astro dev`) en ejecución. Volver a ejecutar ./init.sh tras pararlos.

- spec_author (enmienda de la 73 por instrucción humana): «meter 2 cards para que ocupen todo el ancho y que al final queden la 2 y la 3». La spec, el design y la entrada del backlog se reescriben (REQ-73-01..34; 16 acceptance; nota_retomar actualizada). Análisis en progress/research/horizontal_feedback.md §5.
  - Nueva geometría: W = min((C − G)/2, límite por alto), con C = min(var(--container-max), 95%) y G = var(--gap-card).
  - Inset del par: (V − 2W − G)/2; recorrido (n − 2)(W + G) con scroll 1:1.
  - El track se recorta en los bordes del par y el h2 toma el ancho del par.
  - Con n ≤ 2 no hay efecto.
  - Ampliar a 4 o más posts queda como decisión futura del humano.

### NOTA PARA RETOMAR (2026-10-09, cuota de tokens; geometría ENMENDADA, ver abajo)

- ENMIENDA: el plan de la 73 de abajo («primera centrada y la siguiente asomando», (n−1)(W+G)) queda SUSTITUIDO por el par a todo el ancho de §5 de horizontal_feedback.md: al inicio se ven las cards 1 y 2, al final la 2 y la 3, y el recorrido es (n−2)(W+G). El resto (sticky, wrapper, rueda real por CDP) se mantiene.

- Siguiente feature: **73 latest-horizontal-compact-sticky** (pending, sin empezar; depende de la 72, ya en done).
  Spec en specs/73_latest-horizontal-compact-sticky/ y análisis en progress/research/horizontal_feedback.md.
- Feedback del humano que motiva la 73:
  - las cards están demasiado separadas: deben ir juntas, con la primera centrada y la siguiente asomando a la mitad;
  - hay un «saltito» en «Últimos artículos» al fijarse la sección.
- Diagnóstico:
  - el espacio sale de los slots de ancho de viewport de la 72;
  - el salto solo aparece con rueda real: el pin JS (position fixed) llega un frame tarde, y anticipatePin lo agrava.
- Plan de la 73:
  - gap de token, padding de centrado del track y recorrido (n−1)(W+G);
  - scroll 1:1 con el recorrido;
  - sticky CSS dentro de un wrapper creado por JS en lugar del pin de ScrollTrigger;
  - ajustar src/domain/latest-horizontal.ts y sus tests (precedente REQ-43-06);
  - verificar con eventos mouseWheel por CDP y el top del h2 medido por frame.
- Después viene la 74 csp-router-inline-script (prioridad baja, al final): la violación CSP del script data: del router de Astro.
- Decisiones abiertas del humano: 3 o 4 cards (se usan 3), gap var(--gap-card) y scroll 1:1.
- Estado: features 1-72 en done salvo la 10 (blocked). ./init.sh en verde tras cerrar el preview :4399 del líder.
  Hay un `astro dev` del humano en marcha. Trabajo sin commitear: humano.

### Feature 73 latest-horizontal-compact-sticky (retomada; nueva geometría de par de cards)

- ROJO 1/5 → VERDE 5/5; legacy 71/72 ajustados. Suite 822/822.
- Chrome: par 1-2 → 2-3 exacto a 1280 y 1440, 1600×700 centrado. Rueda real: 0 px de desviación
  y 0 retrocesos. Apilado, reversión, ida y vuelta, teclado, búsqueda, clic y CSP OK.
  Informe en progress/impl_73.md. Reviewer lanzado.
