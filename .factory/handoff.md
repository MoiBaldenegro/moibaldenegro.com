# Handoff

Estado en que quedó la última corrida. Cada corrida lo reescribe al terminar.

- Estado: issue #7 (check de humo del toggle de mantenimiento) **completado**.
- Qué se hizo:
  - Nuevo script `scripts/check-maintenance-smoke.mjs` (Node stdlib, 96 líneas).
    CLI `--base-url <url>` (defecto `http://127.0.0.1:8787`) y `--mode on|off`
    (`on` por defecto). `on`: exige 503 + `Cache-Control: no-store` en `/` y
    `/whoami`, y 200 en `/maintenance.css` y `/favicon.ico`. `off`: exige 301 en
    `/`. Sale con código 0 si cuadra y != 0 si falla. Exporta `parseArgs`,
    `checkMaintenance`, `checkLive` y `runSmoke` para poder testearlo sin red.
  - Test propio `tests/maintenance-smoke.test.mjs` (99 líneas): unitarios con
    `fetch` falso y un test de integración que levanta un `node:http` efímero y
    comprueba los exit codes 0/!=0 del CLI.
  - Documentado en `docs/maintenance.md` §«Comprobación automática (smoke)» y en
    las referencias.
- Verificación:
  - `pnpm test`: 149/149 en verde (antes 143; +6 del nuevo test).
  - `pnpm build`: OK.
  - `node scripts/check-format.mjs`: OK.
  - E2E real contra `wrangler dev -c dist/server/wrangler.json`:
    `--mode on` (con `--var IN_MAINTENANCE:true`) → exit 0;
    `--mode off` (sin var) → exit 0. Logs en `.factory/outbox/` (ignorado).
- Siguiente paso: nada bloqueante para #7. Queda abierto #6 (revisión visual en
  producción, requiere persona). Pendiente menor detectado: `docs/maintenance.md`
  dice que `/` redirige a `/home`, pero `src/domain/http/root-redirect.ts` lo
  manda a `/whoami`; proponer/corregir como issue de docs.
