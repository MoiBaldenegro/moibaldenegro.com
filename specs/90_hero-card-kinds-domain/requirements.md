# Requisitos — Tipos de tarjeta en el dominio del hero (feature 90 hero-card-kinds-domain)
# Origen: petición humana 2026-10-14 (cards de otro diseño o con más información inyectables en el grid del hero). Análisis: progress/research/hero-extensible-cards.md.
# No toca UI: sin design.md.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-90-01→1, REQ-90-02→1, REQ-90-03→1, REQ-90-04→2, REQ-90-05→2, REQ-90-06→3, REQ-90-07→3, REQ-90-08→4, REQ-90-09→4, REQ-90-10→4, REQ-90-11→5, REQ-90-12→5.

## Requisitos

REQ-90-01 El módulo src/domain/entities/hero-card.ts SHALL exportar el catálogo HERO_CARD_KINDS con los valores icon y htb y el tipo HeroCardKind derivado de ese catálogo.
REQ-90-02 La interfaz HeroCard SHALL conservar sus nueve campos readonly actuales y añadir el campo readonly kind con el tipo literal icon.
REQ-90-03 La interfaz HeroRichCard SHALL declarar los campos readonly id, kind, title, colorToken, gridColumn y gridRow con kind restringido a los valores de HeroCardKind distintos de icon.
REQ-90-04 El método getCards de HeroCardsRepository SHALL devolver un arreglo del tipo unión HeroGridCard en el mismo orden que src/data/hero-cards.json.
REQ-90-05 IF una entrada del JSON omite el campo kind, THEN el repositorio SHALL entregarla como HeroCard con kind icon.
REQ-90-06 IF una entrada declara un kind fuera de HERO_CARD_KINDS, THEN el repositorio SHALL lanzar HeroCardsDataError con el índice de la tarjeta y el valor recibido en el mensaje.
REQ-90-07 IF una entrada de tipo distinto de icon carece de alguno de sus campos de texto obligatorios, THEN el repositorio SHALL lanzar HeroCardsDataError con el índice de la tarjeta y el nombre del campo.
REQ-90-08 El parseo y la validación de las tarjetas SHALL vivir en src/domain/repositories/hero-cards-parse.ts con el repositorio y el parser por debajo de 100 líneas cada uno.
REQ-90-09 El archivo src/data/hero-cards.json SHALL conservar sin cambios las 12 tarjetas de icono actuales en esta feature.
REQ-90-10 El fixture EXPECTED_CARDS de tests/hero-cards-repository.test.mjs SHALL incluir kind icon en cada tarjeta, WHERE el fixture sigue al dato entregado por el repositorio (precedente REQ-43-06).
REQ-90-11 WHEN se implemente la feature, el test tests/hero-card-kinds-domain.test.mjs SHALL observarse en rojo antes de escribir la entidad o el parser.
REQ-90-12 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature.
