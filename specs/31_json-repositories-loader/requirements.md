# Requisitos — json-repositories-loader

REQ-31-01 El repositorio HeroProfileRepository SHALL aceptar un loader inyectable que entrega el contenido crudo del archivo en el constructor, WHERE el loader por defecto materializa el archivo src/data/hero.json mediante un import con atributo.
REQ-31-02 El repositorio HeroCardsRepository SHALL aceptar un loader inyectable que entrega el contenido crudo del archivo en el constructor, WHERE el loader por defecto materializa el archivo src/data/hero-cards.json mediante un import con atributo.
REQ-31-03 Los repositorios SHALL no importar módulos node ni usar el sufijo raw, WHERE el prerender del sitio debe ejecutarse en workerd.
REQ-31-04 El repositorio HeroProfileRepository SHALL entregar la entidad HeroProfile con el loader por defecto, WHERE el contenido proviene de src/data/hero.json.
REQ-31-05 El repositorio HeroCardsRepository SHALL entregar las 12 entidades HeroCard con el loader por defecto, WHERE el contenido proviene de src/data/hero-cards.json.
REQ-31-06 IF el loader lanza un fallo de lectura o entrega un contenido que no es un JSON válido o no tiene la forma esperada, THEN los repositorios SHALL lanzar los errores nombrados HeroProfileDataError y HeroCardsDataError.
REQ-31-07 El test astro-config-dev-workaround.test.mjs SHALL fijar el estado canónico del bloque vite.optimizeDeps, WHERE el bloque conserva include y no exige la opción disabled.
REQ-31-08 Los archivos de los repositorios SHALL respetar el límite de 100 líneas cada uno.