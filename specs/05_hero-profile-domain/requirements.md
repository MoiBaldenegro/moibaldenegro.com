# Requisitos — hero-profile-domain

REQ-05-01 El sitio SHALL almacenar los datos del perfil del hero en el archivo src/data/hero.json.
REQ-05-02 La entidad HeroProfile SHALL tipar los datos del perfil en src/domain/entities/hero-profile.ts.
REQ-05-03 El repositorio HeroProfileRepository SHALL entregar la entidad HeroProfile leyendo el archivo src/data/hero.json.
REQ-05-04 IF el archivo src/data/hero.json no existe o está malformado, THEN el repositorio SHALL lanzar un error HeroProfileDataError.
REQ-05-05 Los archivos de entidad y repositorio SHALL respetar el límite de 100 líneas cada uno.
