# Progreso actual

> Estado de la sesión actual. Mientras trabajas, documenta aquí lo que haces.

### Feature en curso

_10 — client-init-on-navigation (in_progress; implementación)_

### Plan

- Escribir PRIMERO tests/client-init-on-navigation.test.mjs (REQ-10-01..09) y verlos en ROJO
- Implementar: 4 scripts .astro con listener astro:page-load (sin llamada directa)
- Guard de idempotencia module-level en initSearchLive (patrón search-escape)
- Comentario de cabecera de search-escape.ts: ejecución única + astro:page-load
- Ajustar tests de inspección de features 3/4/5/6 (llamada directa → listener), justificando cada ajuste
- Verificar: test feature verde, suite completa, check-format, audit-design-tokens, ./init.sh, ≤100 líneas

### Bitácora

- 2026-08-18: feature 10 marcada in_progress en feature_list.json. Lectura de spec (REQ-10-01..09), research, componentes y tests afectados (search-dedicated-view REQ-03-02, search-bar-header Decisión 1, search-landing-live REQ-05-07, search-keyboard-escape REQ-06-00; root-term-search usa llamada unitaria directa, no cambia).

### Estado:

- Escribiendo tests de la feature 10 (test-first).