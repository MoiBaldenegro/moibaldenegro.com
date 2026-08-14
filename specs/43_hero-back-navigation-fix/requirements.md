# Requisitos — Hero perdido al volver del detalle (feature 43)

REQ-43-01 El archivo hero.json SHALL declarar el campo image con la ruta absoluta /assets/moises-hero.jpg.
REQ-43-02 El img del hero en la portada SHALL declarar el identificador de persistencia hero-profile.
REQ-43-03 WHEN la página de detalle renderiza su marcado, la página SHALL incluir una copia oculta del img del hero con el mismo identificador hero-profile.
REQ-43-04 El head del layout SHALL pre-cargar la imagen del hero con un enlace rel preload as image.
REQ-43-05 IF la copia persistida del hero se encuentra bajo la clase post__hero, THEN layout.css SHALL ocultarla con display none.
REQ-43-06 El test hero-profile-repository.test.mjs SHALL fijar el fixture del perfil real con la ruta absoluta de la imagen.
REQ-43-07 La copia oculta del hero SHALL declararse sin transition:name y después del img post__image del detalle.
