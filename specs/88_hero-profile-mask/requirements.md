# Requisitos — Foto del hero con máscara de desvanecido y texto alineado al CV (feature 88 hero-profile-mask)
# Origen: petición humana 2026-10-13 con captura de referencia («la foto del perfil sea así, el estilo y la máscara, no el texto; el texto ajustarlo al CV»).
# Toca UI/presentación: ver design.md en esta carpeta.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-88-01→1, REQ-88-02→1, REQ-88-03→2, REQ-88-04→2, REQ-88-05→3, REQ-88-06→4, REQ-88-07→3, REQ-88-08→4, REQ-88-09→5, REQ-88-10→5, REQ-88-11→5, REQ-88-12→6.

## Requisitos

REQ-88-01 La regla .profile-image img de profile-card.css SHALL declarar un mask-image con un linear-gradient hacia abajo que termine en transparent.
REQ-88-02 El mask-image de .profile-image img SHALL usar solo var() de tokens.css como color opaco, WHERE docs/architecture.md prohíbe valores sueltos.
REQ-88-03 El marcado de new-hero.astro y la hoja profile-card.css SHALL prescindir de .profile-overlay.
REQ-88-04 La píldora .profile-username SHALL usar la familia var(--font-mono).
REQ-88-05 Cada segmento de la descripción del perfil en hero.json separado por « • » SHALL aparecer como parte del headline o como item de skills de about.json.
REQ-88-07 IF un test previo fija la descripción anterior del perfil, THEN ese test SHALL fijar la nueva descripción con nota de ajuste, WHERE el precedente REQ-43-06 regula esos ajustes.
REQ-88-06 WHEN se implemente la feature, el test tests/hero-profile-mask.test.mjs SHALL observarse en rojo antes de modificar estilos, marcado o datos.
REQ-88-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
REQ-88-09 La regla .profile-image img SHALL mostrar la foto completa con aspect-ratio 952 / 960 y sin transform.
REQ-88-10 WHILE el viewport mide más de 1200 px, el contenedor .profile-image SHALL posicionarse en absolute sobre la tarjeta para que .profile-content quede encima de la zona desvanecida.
REQ-88-11 La píldora .profile-username SHALL ubicarse dentro de .profile-content antes del h1.
REQ-88-12 WHILE el viewport mide más de 1200 px, el h1 de .profile-content SHALL escalar su font-size con el ancho de .profile-content mediante unidades cqi para ocupar una sola línea.
