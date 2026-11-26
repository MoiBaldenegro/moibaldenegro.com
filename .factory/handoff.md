# Handoff

Estado en que quedó la última corrida y qué sigue. Cada corrida lo reescribe al terminar.

- Estado: issue #3 (definir IN_MAINTENANCE en build) resuelto. `astro.config.mjs` declara `IN_MAINTENANCE` con `default: false` (sigue siendo `access: 'public'`, `context: 'client'`), de modo que no hay que pasarla a mano.
- Tests: `pnpm test` en verde (132/132), incluido el nuevo `tests/maintenance-env.test.mjs` que verifica tipo/visibilidad/default del flag.
- Verificado: `unset IN_MAINTENANCE; pnpm build` termina en verde y `./init.sh` completo queda en verde sin prefijos manuales.
- Siguiente paso: no hay acción pendiente de este issue; retomar el backlog de producto (ver feature_list.json / issues abiertos).
