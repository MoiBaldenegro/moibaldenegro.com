# Requisitos — Ancho acotado y centrado del video embebido en desktop (feature 16)

REQ-16-01 La hoja article.css SHALL declarar una media query de escritorio con ancho mínimo de 769 píxeles, WHERE el breakpoint móvil existente del sitio es de 768 píxeles.
REQ-16-02 WHILE el ancho de la ventana es de 769 píxeles o más, el contenedor del video SHALL limitar su ancho máximo al token var(--video-max-width) y centrarse horizontalmente con margen automático.
REQ-16-03 WHILE el ancho de la ventana es de 768 píxeles o menos, el contenedor del video SHALL conservar el ancho completo de la regla base con width 100% y max-width 100%.
REQ-16-04 El token --video-max-width SHALL declararse en tokens.css con el valor 640 píxeles, WHERE la escala de contenedor existente no ofrece un valor aplicable.
REQ-16-05 El contenedor del video SHALL usar exclusivamente tokens para el ancho máximo y el espaciado, WHERE la media query de escritorio declara max-width y margin.
REQ-16-06 La hoja article.css SHALL conservar la regla base del contenedor sin cambios, WHERE las aserciones REQ-11-02 y REQ-11-05 dependen de ella.
REQ-16-07 La hoja article.css SHALL respetar el límite de 100 líneas del arnés.
REQ-16-08 El test de inspección del ancho del video SHALL verificar la media query de escritorio, la conservación del ancho completo en móvil, el token nuevo y el límite de líneas.
REQ-16-09 Los tests que fijan el conteo de líneas de tokens.css SHALL actualizar su aserción al nuevo estado canónico, WHERE el token nuevo --video-max-width incrementa el conteo (precedente REQ-43-06).