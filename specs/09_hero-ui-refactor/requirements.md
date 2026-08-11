# Requisitos — hero-ui-refactor

REQ-09-01 El componente NewHero SHALL obtener el perfil y las tarjetas desde los repositorios del dominio.
REQ-09-02 El componente HeroCard SHALL recibir la tarjeta como prop tipada con la entidad HeroCard.
REQ-09-03 El componente HeroCard SHALL aplicar el fondo mediante el atributo data-color-token sin estilos inline.
REQ-09-04 El frontmatter de los componentes del hero SHALL limitarse a imports y paso de datos.
REQ-09-05 WHEN el archivo src/data/hero.data.ts sigue existiendo, THEN el test de UI SHALL fallar.
