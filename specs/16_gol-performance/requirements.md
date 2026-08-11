# Requisitos — gol-performance

REQ-16-01 El módulo src/utils/game-of-life-canvas.ts SHALL exponer la función pura shouldTick, WHERE la función devuelve true solo cuando el tiempo transcurrido desde el último tick alcanza el intervalo y no muta sus argumentos.
REQ-16-02 El bucle de animación SHALL avanzar una generación únicamente cuando shouldTick devuelve true, WHERE el intervalo de generación TICK_INTERVAL_MS está entre 66.67 y 100 milisegundos.
REQ-16-03 El dibujo del fotograma SHALL escribir los píxeles con una única llamada putImageData, WHERE el lienzo se pinta desde un ImageData y el código no usa fillRect.
REQ-16-04 El lienzo SHALL renderizar a resolución interna de la mitad del viewport, WHERE el factor RENDER_SCALE es 2 y el escalado al tamaño del viewport queda declarado en la hoja de estilos.
REQ-16-05 El fondo del hero SHALL mantenerse como capa propia promovida para la composición, WHERE .hero-background declara will-change opacity y conserva la opacidad del token --opacity-hero.
REQ-16-06 El ruido de pantalla completa SHALL integrarse en el fondo del hero, WHERE .hero-noise deja de existir como capa propia y el patrón se pinta como segundo fondo con alfa derivado del token --color-text.
REQ-16-07 Los tokens de aspecto del fondo SHALL permanecer sin cambios, WHERE --opacity-hero vale 0.80, --opacity-gol vale 0.15 y --size-gol-cell vale 6px.
REQ-16-08 El fondo SHALL conservar la accesibilidad de la feature 15, WHERE el driver mantiene el fotograma estático con prefers-reduced-motion, la pausa con document.hidden y el lienzo conserva pointer-events none.
REQ-16-09 El driver SHALL seguir consumiendo el motor de la feature 14 con imports relativos, WHERE la optimización no añade dependencias externas ni modifica src/utils/game-of-life.ts.
REQ-16-10 Los archivos de la feature SHALL respetar el límite de 100 líneas del arnés.
