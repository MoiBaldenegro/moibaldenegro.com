# Requisitos — harness-docs-alignment

REQ-23-01 Los documentos del kit SHALL no citar scripts inexistentes, WHERE las referencias de scripts corresponden a archivos reales de scripts/.
REQ-23-02 El archivo scripts/validate-feature-list.mjs SHALL eliminar la referencia al script inexistente, WHERE el token og-image desaparece de todos los archivos del kit.
REQ-23-03 Los documentos del kit SHALL no contener los tokens prohibidos de la aplicación, WHERE ningún archivo del kit incluye og-image hero tomatesoft ni cards-data.
REQ-23-04 El documento docs/architecture.md SHALL actualizar las referencias obsoletas de hojas de estilos, WHERE la hoja hero.css ya no existe desde la feature 4.
REQ-23-05 El documento docs/verification.md SHALL no referenciar tests inexistentes, WHERE tests/regeneracion-limpia.test.mjs no existe en el repositorio.