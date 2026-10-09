# Requisitos — Actualizar astro a >=7.2.8 y el adapter de Cloudflare por la CVE crítica (requiere aprobación humana) (feature 41 astro-security-upgrade)
# Origen: audit_perf_security.md A1. Análisis, orden y decisiones: progress/research/audit_backlog.md.
# Sin design.md: la feature no toca UI ni presentación.
# Estado blocked: requiere discusión y aprobación del humano antes de implementar.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-41-01→1, REQ-41-02→2, REQ-41-03→3, REQ-41-04→4, REQ-41-05→5, REQ-41-06→6, REQ-41-07→7, REQ-41-08→8, REQ-41-09→9.

## Requisitos

REQ-41-01 El archivo package.json SHALL declarar astro con un rango cuya versión mínima es 7.2.8 o superior.
REQ-41-02 El lockfile pnpm-lock.yaml SHALL resolver astro a una versión 7.2.8 o superior.
REQ-41-03 El registro docs/dependencies.md SHALL reflejar la versión aprobada y la fecha de aprobación del humano para cada dependencia actualizada.
REQ-41-04 WHEN se ejecuta pnpm audit tras la actualización, el informe SHALL mostrar cero avisos de severidad critical.
REQ-41-05 IF el humano no aprueba la actualización, THEN la feature SHALL permanecer en estado blocked sin cambios en package.json.
REQ-41-06 El build de producción SHALL completarse sin errores tras la actualización.
REQ-41-07 WHEN se implemente la feature, el test tests/astro-security-upgrade.test.mjs SHALL observarse en rojo antes de escribir el código de producción, WHERE el ciclo test-first de AGENTS.md §3 exige el rojo previo.
REQ-41-08 Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas, WHERE docs/architecture.md §12 fija ese máximo.
REQ-41-09 La suite completa del arnés y el script ./init.sh SHALL terminar en verde al cierre de la feature, WHERE la regla require_tests_to_close impide cerrarla sin pruebas verdes.
