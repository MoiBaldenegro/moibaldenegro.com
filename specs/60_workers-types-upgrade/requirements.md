# Requisitos — Subir @cloudflare/workers-types al peer de wrangler 4.149.0 (feature 60 workers-types-upgrade)
# Origen: peer no satisfecho tras la feature 41 (wrangler ^4.149.0 pide @cloudflare/workers-types ^5.20261006.1).
# Aprobación humana 2026-10-08 («si resube la version de cloudflare») registrada en docs/dependencies.md.
# Análisis: progress/research/workers-types-upgrade.md. Patrón: feature 41 (tests/astro-security-upgrade.test.mjs).
# Sin design.md: la feature no toca UI ni presentación.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-60-01→1, REQ-60-02→2, REQ-60-03→3, REQ-60-04→4, REQ-60-05→5, REQ-60-06→6, REQ-60-07→7, REQ-60-08→8.

## Requisitos

REQ-60-01 El archivo package.json SHALL declarar @cloudflare/workers-types en devDependencies con un rango cuya versión mínima es 5.20261006.1 o superior.
REQ-60-02 El lockfile pnpm-lock.yaml SHALL resolver @cloudflare/workers-types en el importer raíz a una versión 5.x igual o superior a 5.20261006.1.
REQ-60-03 La entrada «### @cloudflare/workers-types» de docs/dependencies.md SHALL mostrar la versión nueva de package.json y la fecha de aprobación 2026-10-08.
REQ-60-04 La nota de aprobación del 2026-10-08 sobre @cloudflare/workers-types en docs/dependencies.md SHALL quedar marcada como APLICADA en la feature 60 al cierre.
REQ-60-05 WHEN se ejecuta pnpm install tras la actualización, la salida SHALL omitir avisos de peer dependency no satisfecha sobre @cloudflare/workers-types.
REQ-60-06 El build de producción SHALL completarse sin errores tras la actualización.
REQ-60-07 WHEN se implemente la feature, el test tests/workers-types-upgrade.test.mjs SHALL observarse en rojo antes de modificar package.json, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-60-08 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
