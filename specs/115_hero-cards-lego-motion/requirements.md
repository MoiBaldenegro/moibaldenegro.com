# Requisitos — Feature 115: hero-cards-lego-motion

## Requisitos

REQ-115-01 El módulo src/domain/hero-cards-motion.ts SHALL exportar congeladas las constantes de entrada, salida y rango de disparo de las cards del hero sin importar GSAP ni acceder al DOM.
REQ-115-02 La función createRng de src/domain/hero-cards-motion.ts SHALL devolver para una semilla entera un generador pseudoaleatorio que produce la misma secuencia de valores en [0, 1) en cada llamada con esa semilla.
REQ-115-03 La función legoOrder SHALL devolver para count y un generador inyectado una permutación de los índices 0..count-1 obtenida por Fisher-Yates.
REQ-115-04 La función legoDelays SHALL asignar a cada card un retardo igual a su posición en la permutación por min(step, max / (count - 1)) de modo que ningún retardo supera max.
REQ-115-05 La función legoTilt SHALL devolver para un generador inyectado y maxDeg un giro inicial en grados dentro de [-maxDeg, maxDeg].
REQ-115-06 WHEN la portada dispara astro:page-load, el módulo src/components/new-hero/hero-cards-motion.ts SHALL registrar dentro de un gsap.matchMedia la entrada y la salida de todas las cards .hero-grid > .hero-card incluidas las tarjetas ricas como HTB.
REQ-115-07 WHEN una card entra en el viewport, el runtime SHALL animarla desde opacity 0, desplazamiento vertical -32px, escala 1.04 y su giro aleatorio hasta el reposo con la curva back.out(1.7) en 0.6 s y el retardo aleatorio de su posición.
REQ-115-08 WHEN una card sale del viewport por arriba o por abajo, el runtime SHALL levantarla hasta desplazamiento -24px, escala 1.04 y opacity 0 con la curva power2.in en 0.35 s.
REQ-115-09 WHEN varias cards entran en el mismo lote, el runtime SHALL lanzarlas en el orden de la permutación aleatoria y no en el orden del DOM.
REQ-115-10 El runtime SHALL animar solo las custom properties --hero-lego-y, --hero-lego-rotate y --hero-lego-scale y la propiedad opacity de cada card.
REQ-115-11 La hoja src/styles/hero-cards-motion.css SHALL componer translate, rotate y scale de .hero-grid > .hero-card con esas custom properties y los valores de respaldo 0px, 0deg y 1.
REQ-115-12 La hoja src/styles/hero-cards-motion.css SHALL limitar transition-property de .hero-grid > .hero-card a transform, box-shadow y filter para que la transición del hover no interpole la animación.
REQ-115-13 IF el JavaScript no se ejecuta, THEN las cards del hero SHALL mostrarse completas y en reposo porque ninguna hoja CSS fija opacity 0 ni desplazamiento inicial.
REQ-115-14 IF el usuario declara prefers-reduced-motion reduce, THEN el runtime SHALL dejar las cards en reposo sin crear tweens ni ScrollTriggers.
REQ-115-15 WHILE el viewport mide como máximo 768 px, el runtime SHALL animar solo las cards con data-show-on-mobile.
REQ-115-16 WHEN la página se carga o se vuelve con el scroll restaurado en medio o al fondo, el runtime SHALL dejar en opacity 1 y en reposo antes de 1.5 s todas las cards que intersectan el viewport.
REQ-115-17 WHEN una card enlazada recibe el foco con teclado y no está en reposo, el runtime SHALL llevarla al reposo con opacity 1.
REQ-115-18 WHEN la página dispara astro:before-swap, el runtime SHALL revertir su gsap.matchMedia y retirar de las cards los estilos en línea que haya puesto.
REQ-115-19 La portada SHALL mantener un CLS menor o igual a 0.1 en la carga y en la restauración del scroll, WHERE el viewport mide 375, 800, 1024, 1280 o 1600 px.
REQ-115-20 La feature SHALL conservar el hover de la card, el giro del icono, los enlaces de las features 107 y 110 y los logos de las features 103, 105, 109 y 112 sin cambios en hero-card.astro, htb-card.astro, hero-card-art.astro ni hero-card.css.
REQ-115-21 La portada construida dist/client/index.html SHALL pesar menos de 42 000 B.
REQ-115-22 Cada archivo creado o tocado por la feature SHALL tener como máximo 100 líneas sin añadir dependencias a package.json.
