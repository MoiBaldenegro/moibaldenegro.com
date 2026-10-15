# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- (ninguna: feature 96 en done; 93 y 10 en blocked a la espera de decisión humana)

### Plan

- (vacío)

### Bitácora

- Pendientes humanos: (a) feature 93 system-design-nav-link **blocked** (REQ-93-13/14): incluso con la etiqueta corta «Diseño» el header desborda en horizontal entre 769 y 849 px (a 850 px ya no); su cambio sigue en el árbol con ./init.sh en verde (detalle en progress/impl_system-design-nav-link.md, ronda 2). Opciones: (1) subir el corte del menú hamburguesa hasta ~850 px; (2) reducir el gap del nav o el ancho del buscador en esa franja; (3) ocultar el enlace en esa franja. Las tres tocan CSS congelado o el alcance de la spec. (b) validar los valores por defecto de la 96 (no bloquean): entrada desde la derecha 72 px → 0 (xPercent equivalente por card), scale 0,96 → 1, opacity 0 → 1, 0,8 s power3.out, stagger 0,12; salida hacia la izquierda 0 → −60 px + opacity → 0, 0,5 s power2.in, stagger 0,08; opacity en vez de autoAlpha (para no sacar las cards del orden de tabulación); rangos apilado 'top 85%' / 'bottom 20%', horizontal 'top 75%' / clamp(bottom 40%) del envoltorio y containerAnimation 'left 85%' / 'right 15%'. (c) ajuste de texto pendiente (observación del reviewer, Revisión 3): REQ-96-51 menciona trigger.isActive y trigger.progress, pero el código decide solo con progress (justificado); spec_author debería alinear el texto, sin cambiar código. (d) CLS 0,508 preexistente al recargar la portada a 1280 con el scroll restaurado al fondo (modo horizontal, features 73/75); sigue aplicando: el reviewer midió 0,5125 en la secuencia encadenada a 1280 (carga limpia: 0 a 375/768/1280, 0,008 a 1024), ajeno a la 96. (e) validar los valores por defecto de la 92 (celda 9 / span 4 x 9 / span 2; stats Nivel, Puntos y Owns; tokens --color-marca-htb y --color-marca-htb-accent; texto «Estadísticas no disponibles»). (f) la feature 10 sigue blocked.
