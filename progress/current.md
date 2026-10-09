# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

- (ninguna: features 73, 74 y 75 en done; 10 en blocked por decisión humana)

### Plan

- (vacío)

### Bitácora

- (vacía)

### Análisis spec_author (feature 76)

- Análisis en curso: cards que cruzan la página (full bleed) en el horizontal de «Últimos artículos» — feedback humano tras 73-75.
- Plan:
  - Quitar el recorte lateral del par (REQ-73-15) y la parte lateral del clip-path de entrada (REQ-75-15).
  - Recorte solo por overflow: clip de la sección (= ancho del viewport), sin scroll horizontal del documento.
  - Ajustar las aserciones de clip-path en los tests de la 73 y la 75 (precedente REQ-43-06) y test nuevo test-first.
  - Verificación CDP a 1280×800 y 1440×900 (márgenes con card, posiciones del par, scrollWidth, rueda real, capturas).
- Alta en backlog: feature 76 latest-cards-full-bleed (pending, depends_on [75]). Spec: specs/76_latest-cards-full-bleed/requirements.md (REQ-76-01..19) y design.md. Análisis: progress/research/cards_full_bleed.md.
- ENMIENDA B 76 (spec_author, 2026-10-09): márgenes limpios en reposo (Δ = max(0, inset − G); x propia card 1 = −Δ·p, card n = Δ·(1 − p), mismo scrub). requirements.md reescrito (REQ-76-01..27), design.md con alternativa A revisable y punto abierto de la entrada (scale < 1), 9 acceptance en feature_list.json. Análisis: progress/research/cards_full_bleed.md §7.

### Feature 75 → done. Feature 76 latest-cards-full-bleed (opción B)

- ROJO 5 fallos → VERDE; suite 835/835. Chrome a 1280, 1440 y 1600×700: márgenes limpios en
  reposo, cards cruzando la ventana a mitad del recorrido, sin scroll horizontal y rueda real sin
  retrocesos. Informe en progress/impl_76.md. Reviewer lanzado.
