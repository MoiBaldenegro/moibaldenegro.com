# Requisitos — json-repositories-restore

REQ-19-01 El repositorio HeroProfileRepository SHALL entregar la entidad HeroProfile leyendo el archivo src/data/hero.json, WHERE el constructor acepta una URL inyectable cuyo default resuelve al archivo del proyecto.
REQ-19-02 IF el archivo del perfil no existe o está malformado, THEN el repositorio SHALL lanzar un error HeroProfileDataError.
REQ-19-03 El repositorio HeroCardsRepository SHALL entregar las tarjetas leyendo el archivo src/data/hero-cards.json, WHERE el constructor acepta una URL inyectable cuyo default resuelve al archivo del proyecto.
REQ-19-04 IF el archivo de tarjetas no existe o está malformado, THEN el repositorio SHALL lanzar un error HeroCardsDataError.
REQ-19-05 Los repositorios SHALL leer los datos con node:fs, WHERE los imports con sufijo raw quedan eliminados.
REQ-19-06 Los archivos de los repositorios SHALL respetar el límite de 100 líneas cada uno.