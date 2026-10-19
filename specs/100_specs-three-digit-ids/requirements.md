# Requisitos — El validador de specs acepta ids de feature de 2 o más dígitos (feature 100 specs-three-digit-ids)
# Origen: bloqueo de arnés detectado al dar de alta el pulido del hero (ahora feature 101). scripts/validate-specs.mjs:9 usa REQ_PREFIX = /^REQ-(\d{2})-(\d{2})\s+(.+)$/ y rechaza los prefijos REQ-100-xx. Decisión del líder 2026-10-16 (mantenimiento del arnés, Node stdlib, sin dependencias). Análisis: progress/research/specs-three-digit-ids.md.
# No toca UI: sin design.md.
# Huevo y gallina: las líneas REQ-100-xx de esta misma spec no validan hasta que se aplique REQ-100-01; check-format queda en rojo SOLO por eso hasta que la feature quede implementada test-first.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-100-01→1, REQ-100-02→2, REQ-100-03→2, REQ-100-04→3, REQ-100-05→3, REQ-100-06→4, REQ-100-07→1, REQ-100-08→5, REQ-100-09→5, REQ-100-10→5, REQ-100-11→6, REQ-100-12→6.

## Requisitos

REQ-100-01 La expresión REQ_PREFIX de scripts/validate-specs.mjs SHALL aceptar en el primer grupo un id de feature de 2 o más dígitos (\d{2,}) y mantener el segundo grupo en exactamente 2 dígitos (\d{2}).
REQ-100-02 WHEN validateRequirements recibe una línea REQ-100-01 en EARS válido con expectedNn igual a "100", la función SHALL devolver una lista de errores vacía.
REQ-100-03 WHEN validateRequirements recibe una línea REQ-07-01 en EARS válido con expectedNn igual a "07", la función SHALL devolver una lista de errores vacía.
REQ-100-04 IF el id de feature de una línea REQ no coincide con expectedNn (REQ-10-01 frente a "100" o REQ-100-01 frente a "10"), THEN validateRequirements SHALL devolver el error de prefijo que no coincide con la feature.
REQ-100-05 IF una línea REQ lleva un id de feature de 1 dígito (REQ-7-01) o un secuencial de 3 dígitos (REQ-07-001), THEN validateRequirements SHALL devolver el error «falta el prefijo REQ-<NN>-<xx>».
REQ-100-06 WHEN validateSpecs procesa una feature no-done, la función SHALL resolver su spec en specs/<NN>_<slug>/requirements.md con <NN> = String(id).padStart(2, '0') tanto para ids de 1 dígito (07) como para ids de 3 dígitos (100).
REQ-100-07 El módulo scripts/validate-specs.mjs SHALL conservar sin cambios las reglas EARS, el conteo de una sola palabra clave de obligación por línea, la lista de verbos vagos y el chequeo de design.md vacío.
REQ-100-08 El archivo tests/specs-three-digit-ids.test.mjs SHALL cubrir REQ-100-01 a REQ-100-07 con node:test y solo la stdlib de Node.
REQ-100-09 El informe progress/impl_specs-three-digit-ids.md SHALL registrar la salida del test nuevo en rojo antes del cambio del validador y en verde después.
REQ-100-10 WHILE el backlog contiene las features 100 y 101 sin cerrar, el comando node scripts/check-format.mjs SHALL terminar con código 0 tras el cambio del validador.
REQ-100-11 La definición de <NN> en docs/conventions.md y en specs/_template/requirements.md SHALL indicar que es el id con padding mínimo a 2 dígitos y que admite 3 o más dígitos desde el id 100.
REQ-100-12 Los cambios de la feature SHALL limitarse a scripts/validate-specs.mjs, tests/specs-three-digit-ids.test.mjs, docs/conventions.md, specs/_template/requirements.md y su informe, sin dependencias nuevas y sin tocar src/.
