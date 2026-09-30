# Requisitos — El registro de dependencias se valida igual en CRLF y en LF (feature 28)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-28-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-28-01 WHEN el registro usa finales de línea CRLF, parseRegistry SHALL devolver el mismo conjunto de entradas que devuelve cuando el registro usa finales de línea LF.
REQ-28-02 El patrón de separación de líneas de parseRegistry SHALL aceptar LF y CRLF como delimitadores de línea.
REQ-28-03 parseRegistry SHALL devolver el nombre del paquete y el valor de cada campo sin caracteres de retorno de carro.
REQ-28-04 validateDependencies SHALL devolver un arreglo vacío al ejecutarse contra el package.json y el docs/dependencies.md reales del repositorio.
REQ-28-05 Un test node:test SHALL validar un registro temporal escrito con CRLF y un registro temporal escrito con LF y comprobar que validateDependencies no devuelve errores en ninguno de los dos casos.
REQ-28-06 Los tests de tests/dependencies-registry.test.mjs que leen el contenido de docs/dependencies.md SHALL pasar en verde.
REQ-28-07 node scripts/check-format.mjs SHALL terminar sin reportar errores de validación del registro de dependencias.
REQ-28-08 scripts/validate-dependencies.mjs SHALL resolver el parseo del registro sin exigir que docs/dependencies.md tenga finales de línea LF.
REQ-28-09 scripts/validate-dependencies.mjs SHALL respetar el límite de 100 líneas tras el cambio.
REQ-28-10 WHEN se ejecuta ./init.sh, el arnés SHALL terminar en verde sin errores de formato ni tests fallidos.
