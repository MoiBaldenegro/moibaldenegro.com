# Requisitos — hero-cards-domain

REQ-06-01 El sitio SHALL almacenar las tarjetas del hero en el archivo src/data/hero-cards.json.
REQ-06-02 La entidad HeroCard SHALL tipar las tarjetas del hero en src/domain/entities/hero-card.ts.
REQ-06-03 El repositorio HeroCardsRepository SHALL entregar las tarjetas leyendo el archivo src/data/hero-cards.json.
REQ-06-04 Los datos de las tarjetas SHALL referenciar su color mediante el campo colorToken sin valores hex.
REQ-06-05 IF el archivo src/data/hero-cards.json no existe o está malformado, THEN el repositorio SHALL lanzar un error HeroCardsDataError.
REQ-06-06 Los archivos de entidad y repositorio SHALL respetar el límite de 100 líneas cada uno.
