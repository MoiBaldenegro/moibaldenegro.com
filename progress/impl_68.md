# Informe de implementación — feature 68 (deploy roto por _redirects inválido)

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Origen: log de deploy de Cloudflare aportado por el humano («Invalid _redirects
configuration: Line 1: Expected exactly 2 or 3 whitespace-separated tokens. Got 4. [code: 100324]»).

## Ciclo rojo/verde (REQ-68-13)

- Test nuevo `tests/legacy-redirects.test.mjs` escrito primero.
- ROJO: `ℹ pass 1 / ℹ fail 7`. REQ-68-10 reprodujo el fallo exacto del deploy:
  `línea con 4 tokens: /posts/03-principios solid/   /posts/03-principios-solid   301`.
  Solo pasaba REQ-68-09 (el middleware ya delegaba en next).
- VERDE: 8/8. Suite completa 774/774; `./init.sh` en verde.

## Cambios

- `astro.config.mjs`: eliminada la clave de redirecciones (y su comentario REQ-45-04) y
  sustituida por una nota que apunta al middleware. El build ya **no genera**
  `dist/client/_redirects`.
- `src/domain/http/legacy-redirects.ts` (nuevo, 23 líneas): `legacyRedirect(pathname)`, una
  función pura. Aplica `decodeURIComponent` (con try/catch, de modo que un escape inválido da
  null), normaliza a NFC (la ñ descompuesta n+U+0303 equivale a la compuesta), quita la barra
  final y busca en un mapa congelado los tres slugs antiguos (con `Object.hasOwn`).
- `src/middleware.ts` (17 líneas): si hay `context.url` y legacyRedirect da destino, responde
  301 con `Location: destino + search` pasando por `withSecurityHeaders` y sin llamar a
  `next`. En otro caso se comporta igual que antes.
- `tests/ascii-post-slugs.test.mjs` (precedente REQ-43-06, notas «Ajuste feature 68»):
  - REQ-45-04 verifica ahora legacyRedirect con las URLs antiguas codificadas.
  - La exclusión de REQ-45-05 incluye legacy-redirects.test.mjs.

## Verificación real (REQ-68-11): `astro preview` + curl

| URL antigua | respuesta | Location | destino final |
|-------------|-----------|----------|---------------|
| /posts/03-principios%20solid | 301 | /posts/03-principios-solid | 200 |
| /posts/03-principios%20solid/ | 301 | /posts/03-principios-solid | 200 |
| /posts/01-dise%C3%B1o-detallado | 301 | /posts/01-diseno-detallado | 200 |
| /posts/01-dise%C3%B1o-detallado/ | 301 | /posts/01-diseno-detallado | 200 |
| /posts/02-ciclo-de-vida-y-arquitectura | 301 | /posts/04-ciclo-de-vida-y-arquitectura | 200 |
| /posts/02-ciclo-de-vida-y-arquitectura/ | 301 | /posts/04-ciclo-de-vida-y-arquitectura | 200 |
| /posts/02-ciclo-de-vida-y-arquitectura?a=1 | 301 | /posts/04-ciclo-de-vida-y-arquitectura?a=1 | 200 |

La 301 lleva las cabeceras de seguridad: x-frame-options DENY y la CSP en Report-Only
(seguirá así hasta la feature 64). `ls dist/client/_redirects` confirma que el archivo no existe.

## Hallazgo fuera de alcance

- Los builds de los tests en outDir temporal sobrescriben `.wrangler/deploy/config.json`
  (escrito por @astrojs/cloudflare), que queda apuntando a un directorio temporal ya borrado.
  Tras correr la suite, `astro preview` (y potencialmente `wrangler deploy` sin rebuild) falla
  con «Could not read file: ...\Temp\social-build-*\server\wrangler.json». Un `pnpm build`
  normal lo restaura (`../../dist/server/wrangler.json`). Si el CI ejecuta los tests después
  del build y antes del deploy, el deploy fallaría. Candidato a feature: el helper
  astro-build.mjs debería guardar y restaurar `.wrangler/deploy/config.json`.
