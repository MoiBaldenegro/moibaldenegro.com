# Requisitos — cloudflare-types-install

REQ-30-01 El archivo worker-configuration.d.ts SHALL existir en la raíz del proyecto, WHERE tsconfig.json lo incluye en su lista de tipos.
REQ-30-02 El archivo worker-configuration.d.ts SHALL declarar los tipos del runtime de Cloudflare Workers, WHERE el script generate-types los genera con wrangler types.
REQ-30-03 El archivo worker-configuration.d.ts SHALL permanecer bajo control de versiones, WHERE .gitignore no lo excluye y tsconfig.json depende de él.
REQ-30-04 El script generate-types SHALL regenerar el archivo de tipos, WHERE wrangler types lo produce de forma idempotente.
REQ-30-05 El test de la feature SHALL fallar cuando el archivo de tipos falta, está vacío o deja de rastrearse en git.
REQ-30-06 La dependencia @cloudflare/workers-types SHALL quedar amparada por el registro de dependencias aprobadas, WHERE docs/dependencies.md la declara aprobada por el humano.
