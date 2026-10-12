# Requisitos — CV en PDF generado en build desde el repositorio del About (feature 81 cv-pdf-endpoint)
# Origen: petición humana 2026-10-12 (botón Descargar CV) y segundo cambio del coordinador: el humano aprueba pdf-lib 1.17.1 exacta; el CV se genera en build desde los mismos datos de /about. Análisis: progress/research/about-redesign.md §1, §3 (H4, H5, H7, H11, H12) y §5.
# No toca UI: sin design.md (el PDF no es CSS ni componente; el botón del hero es la feature 82). depends_on [80].
# Sustituye a la propuesta descartada de /assets/cv/moises-baldenegro-cv.pdf y a la de una página /cv con window.print: no existe ruta /cv HTML ni JS de runtime.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-81-01/02/03→1, REQ-81-04/05/06→2, REQ-81-07/08/09/10/11→3, REQ-81-12/13/14/15→4, REQ-81-16/17/18→5, REQ-81-19/20/21→6, REQ-81-22/23/24→7.

## Requisitos

REQ-81-01 El archivo package.json SHALL declarar pdf-lib con la versión exacta 1.17.1 en dependencies.
REQ-81-02 El registro docs/dependencies.md SHALL contener la entrada ### pdf-lib con version 1.17.1, scope dependencies, approved 2026-10-12 y un motivo que cita la generación del CV en PDF.
REQ-81-03 WHEN se ejecuta node scripts/check-format.mjs tras instalar pdf-lib, el validador de dependencias SHALL terminar sin errores.
REQ-81-04 El módulo src/domain/cv/win-ansi.ts SHALL exportar toWinAnsi(text) que elimina todo carácter fuera de la codificación WinAnsi y colapsa los espacios resultantes.
REQ-81-05 La función toWinAnsi SHALL conservar sin cambios las letras acentuadas, la ñ, el guion –, la viñeta • y la barra vertical.
REQ-81-06 Los textos de about.json que entran en el CV SHALL estar ya en WinAnsi de modo que toWinAnsi los devuelve idénticos.
REQ-81-07 El módulo src/domain/cv/text-wrap.ts SHALL exportar wrapText(text, maxWidth, measure) que parte el texto en líneas cuya anchura según measure no supera maxWidth.
REQ-81-08 IF una sola palabra supera maxWidth, THEN wrapText SHALL dejarla sola en su línea sin perder caracteres.
REQ-81-09 El módulo src/domain/cv/cv-layout.ts SHALL exportar layoutCv(hero, about, measure) que devuelve páginas A4 de 595.28 × 841.89 puntos con operaciones de texto que indican texto, x, y, tamaño y peso, sin importar pdf-lib.
REQ-81-10 La maqueta SHALL contener en este orden el nombre de hero.json, el titular, la ubicación, el contacto de cvContact como URLs visibles, Perfil, Experiencia, Habilidades, Educación, Certificaciones e Idiomas.
REQ-81-11 WHEN la siguiente línea quedaría por debajo del margen inferior de 48 puntos, la maqueta SHALL continuar en una página nueva desde el margen superior.
REQ-81-12 La maqueta SHALL incluir los cuatro puestos con su period, cada logro precedido de la viñeta • y el result del primer puesto.
REQ-81-13 La maqueta SHALL pasar por toWinAnsi cada texto antes de emitir la operación.
REQ-81-14 La maqueta SHALL excluir la foto, la línea de enfoque de hero.json, los proyectos, el contenido y la filosofía.
REQ-81-15 La maqueta SHALL excluir cualquier dirección de correo electrónico y cualquier número de teléfono.
REQ-81-16 El módulo src/domain/cv/cv-pdf.ts SHALL ser el único archivo de src/ que importa pdf-lib y renderizar la maqueta con Helvetica y Helvetica-Bold de StandardFonts sin incrustar fuentes.
REQ-81-17 El adaptador SHALL fijar el título CV — Moisés Baldenegro Melendez, el autor con el nombre de hero.json, el idioma es-MX y unas fechas de creación y modificación constantes.
REQ-81-18 WHEN se genera el PDF dos veces con los mismos datos, el adaptador SHALL producir bytes idénticos.
REQ-81-19 El endpoint src/pages/cv.pdf.ts SHALL declarar export const prerender = true y obtener los datos solo de HeroProfileRepository y AboutRepository.
REQ-81-20 WHEN se invoca GET del endpoint, el endpoint SHALL responder con estado 200, cabecera Content-Type application/pdf y un cuerpo que empieza por %PDF-.
REQ-81-21 WHEN se ejecuta astro build, el build SHALL generar dist/client/cv.pdf con dos páginas A4 como máximo.
REQ-81-22 El test tests/cv-pdf-endpoint.test.mjs SHALL escribirse y observarse en rojo antes de crear los módulos de src/domain/cv/ y el endpoint.
REQ-81-23 Cada archivo creado o modificado en src/ SHALL medir 100 líneas o menos.
REQ-81-24 La feature SHALL dejar sin cambios src/pages/about.astro, src/styles/, src/domain/seo/sitemap.ts y public/, WHERE /cv.pdf es un recurso descargable y no una página indexable.
