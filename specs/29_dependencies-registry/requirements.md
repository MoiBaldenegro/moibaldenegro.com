# Requisitos — dependencies-registry

REQ-29-01 El proyecto SHALL registrar cada dependencia externa aprobada en docs/dependencies.md, WHERE cada entrada declara el paquete, la versión, el ámbito, la fecha de aprobación y el motivo.
REQ-29-02 El validador scripts/validate-dependencies.mjs SHALL fallar cuando una dependencia de package.json no tiene su entrada aprobada en el registro.
REQ-29-03 El validador scripts/validate-dependencies.mjs SHALL fallar cuando una entrada del registro no declara todos los campos obligatorios.
REQ-29-04 El arnés SHALL prohibir la aprobación de dependencias por agentes, WHERE la aprobación es decisión exclusiva del humano y los agentes solo marcan la feature blocked.
REQ-29-05 Los documentos del arnés SHALL documentar la política de aprobación y el registro, WHERE AGENTS.md, docs/architecture.md, docs/conventions.md y docs/verification.md lo integran.
REQ-29-06 El script check-format.mjs SHALL incluir la validación del registro de dependencias, WHERE init.sh la ejecuta en cada arranque.
