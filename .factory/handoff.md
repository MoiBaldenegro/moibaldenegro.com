# Handoff

Estado en que quedó la última corrida. Cada corrida lo reescribe al terminar.

- Estado: issue #8 (corregir guía: `/` redirige a `/whoami`, no a `/home`) **completado**.
- Qué se hizo:
  - `docs/maintenance.md` línea final: `301` hacia `/whoami` en vez de `/home`.
    `/home` se mantiene donde corresponde (portada que responde 200 / 503).
  - `tests/maintenance-docs.test.mjs`: nuevo test de regresión que exige
    `` `301` hacia `/whoami` `` y prohíbe `301 ... /home`.
- Verificación:
  - `node --test tests/maintenance-docs.test.mjs`: 5/5 verde.
  - `pnpm test`: 150/150 verde (antes 149; +1 del test de regresión).
  - `./init.sh`: entorno perfecto (formato, tests y build OK).
- Siguiente paso: nada bloqueante. Sigue abierto #6 (revisión visual de la
  página 503 en producción), que requiere una persona con sesión verificada por
  el Cloudflare Managed Challenge.
