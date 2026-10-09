# Informe de implementación — feature 49 static-cache-headers

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/49_static-cache-headers/requirements.md` (sin design.md).

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/http/cache-policy.ts` (NUEVO, 8 líneas) | `ASSETS_CACHE_CONTROL = 'public, max-age=604800'` y `HTB_ISLAND_CACHE_CONTROL = 'public, max-age=3600'` (REQ-49-02). |
| `public/_headers` | Regla `/assets/*` → `Cache-Control: public, max-age=604800` (valor idéntico a la constante) (REQ-49-01). La regla `/*` de seguridad no lleva caché (REQ-49-04). |
| `src/components/htb-stadistics.astro` | `Astro.response.headers.set('Cache-Control', HTB_ISLAND_CACHE_CONTROL)` tras obtener el perfil; sin lógica nueva en el frontmatter (las guardas REQ-22-06/32-04 siguen en verde) (REQ-49-03). |
| `tests/static-cache-headers.test.mjs` (NUEVO) | Constantes, regla `/assets/*`, uso de la constante en la isla, ninguna regla con caché larga para `/*` o rutas HTML, y build (outDir temporal): `_headers` con `/*`, `/_astro/*` y `/assets/*`. |

## Verificación en ejecución real (astro preview, workerd local)

| Petición | Cache-Control |
|---|---|
| `/_server-islands/HtbStadistics?...` (URL tomada del HTML de la portada) | `public, max-age=3600` (y `X-Frame-Options: DENY` del middleware) |
| `/assets/moises-hero.jpg` | `public, max-age=604800` |
| `/about/` (HTML) | `public, max-age=0, must-revalidate` (revalidación conservada, REQ-49-04) |

## Ciclo rojo/verde (REQ-49-06)

Rojo — `ERR_MODULE_NOT_FOUND ... src\domain\http\cache-policy.ts`. Verde — 6/6; `pnpm test`
693/693; `./init.sh` verde.

## Nota

Con la isla cacheada una hora, si la API de HTB falla, la respuesta vacía (sin sección) también
queda en caché esa hora; es coherente con la degradación elegante existente.
