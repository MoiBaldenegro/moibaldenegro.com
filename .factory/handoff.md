# Handoff

Estado en que quedó la última corrida. Cada corrida lo reescribe al terminar.

- Estado: issue #6 (revisar visualmente la página 503 en producción) **NO completado**.
  Requiere a una persona (status `needs-human`).
- Bloqueos:
  1. `wrangler` no está autenticado y no hay `CLOUDFLARE_API_TOKEN` ni
     `CLOUDFLARE_ACCOUNT_ID` en el entorno, así que no se puede activar
     `IN_MAINTENANCE=true` en el Worker de producción (`moibaldenegro-web`).
  2. `https://moisesbaldenegro.com` está detrás de un **Cloudflare Managed
     Challenge (Turnstile)**: `curl` y Chrome headless reciben `403` con
     `Cf-Mitigated: challenge` y la página «Verificación de seguridad en curso».
     La captura real en móvil/escritorio la tiene que hacer una persona en un
     navegador real.
- Verificación local hecha (evidencia en `.factory/outbox/verify-503/`, ignorado
  por git):
  - `wrangler dev -c dist/server/wrangler.json --var IN_MAINTENANCE:true`:
    `/` y `/whoami` → 503 con «Sitio en mantenimiento», `Cache-Control: no-store`,
    `Retry-After: 3600`; `/maintenance.css`, `/favicon.ico`, `/favicon-96x96.png`
    y `/robots.txt` → 200. Capturas a 768px y 1440px correctas.
  - Sin el flag: `/home` y `/whoami` → 200; `/` → 301. **Ojo:** el 301 de `/`
    apunta a `/whoami`, no a `/home` (el issue y `docs/maintenance.md` dicen
    `/home`, que es incorrecto; lo fija `src/domain/http/root-redirect.ts`).
  - `pnpm test`: 143/143 en verde (no se tocó código).
- Siguiente paso: una persona con acceso a Cloudflare activa
  `IN_MAINTENANCE=true`, revisa `https://moisesbaldenegro.com` en móvil (768px) y
  escritorio, y lo vuelve a poner en `false`. Ver `humanRequest` en
  `.factory/outbox/result.json`.
