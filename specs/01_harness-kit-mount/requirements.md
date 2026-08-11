# Requisitos — harness-kit-mount

REQ-01-01 El arnés SHALL proporcionar la plantilla templates/feature_list.json con una única feature de ejemplo.
REQ-01-02 El arnés SHALL proporcionar las plantillas templates/current.md y templates/history.md.
REQ-01-03 El comando test del package.json SHALL ejecutar los tests node:test del directorio tests.
REQ-01-04 El test de integridad del kit SHALL verificar únicamente los archivos obligatorios del kit y sus plantillas.
REQ-01-05 WHEN el test de integridad se ejecuta, el escaneo de tokens SHALL limitarse a los archivos del kit.
REQ-01-06 IF init.sh detecta un fallo en formato tests o build, THEN la ejecución SHALL terminar con estado de salida distinto de cero.
