# Registro de dependencias aprobadas

> **Política de aprobación**: NINGÚN agente aprueba dependencias. La
> aprobación es decisión exclusiva del humano tras discusión, materializada en
> este registro. Si una feature necesita una dependencia nueva, el agente
> marca la feature `blocked` (docs/architecture.md regla 2) y espera la
> decisión humana. El validador `scripts/validate-dependencies.mjs` (integrado
> en `scripts/check-format.mjs`, ejecutado por `./init.sh`) falla si una
> dependencia de package.json (dependencies + devDependencies) no tiene su
> entrada aprobada aquí.

Formato: una entrada por dependencia aprobada. `### <package>` seguido de
líneas `- clave: valor` con `version`, `scope` (dependencies |
devDependencies), `approved` (fecha de aprobación) y `motivo`.

## Aprobaciones de cambio de versión

Registro de las aprobaciones humanas de subida de versión. Cada nota indica
si ya está APLICADA (y en qué feature) o PENDIENTE de aplicar. Las entradas
`###` de abajo se actualizan (version + approved) solo cuando package.json
cambia en la feature correspondiente, para que el validador siga en verde.

* 2026-10-08 — el humano AUTORIZA («sí lo autorizo») la feature 41
  `astro-security-upgrade`: astro a ^7.2.8 o superior (última 7.x),
  @astrojs/cloudflare y wrangler a su última menor, por la CVE crítica
  GHSA-26w7-cxv4-gfx2 (astro <7.2.8). APLICADA en la feature 41: astro ^7.3.8,
  @astrojs/cloudflare ^14.3.4 y wrangler ^4.149.0 con `approved: 2026-10-08`.
* 2026-10-08 — el humano AUTORIZA («si resube la version de cloudflare») subir
  @cloudflare/workers-types (devDependencies) a la versión que satisface el
  peer de wrangler 4.149.0 (`^5.20261006.1`): la última 5.x, >= 5.20261006.1.
  APLICADA en la feature 60 `workers-types-upgrade`: ^5.20261009.1 con
  `approved: 2026-10-08`.

* 2026-10-09 — el humano AUTORIZA el uso de GSAP («Se acaba de autorizar el uso de la
  librería GSAP para ponerle scroll en X a las 3 cards de los 3 posts más recientes en la
  página principal»): alta de gsap (incluye el plugin ScrollTrigger) solo para la portada.
  Licencia «Standard no charge» de Webflow, NO OSI (ver entrada ### gsap). APLICADA en la
  feature 70: gsap 3.15.0 exacta con `approved: 2026-10-09`.

### astro

- version: ^7.3.8
- scope: dependencies
- approved: 2026-10-08
- motivo: framework del proyecto (sitio Astro)

### @astrojs/cloudflare

- version: ^14.3.4
- scope: dependencies
- approved: 2026-10-08
- motivo: adapter de despliegue en Cloudflare Workers

### wrangler

- version: ^4.149.0
- scope: dependencies
- approved: 2026-10-08
- motivo: CLI de despliegue y generación de tipos del runtime Cloudflare Workers

### @cloudflare/workers-types

- version: ^5.20261009.1
- scope: devDependencies
- approved: 2026-10-08
- motivo: tipos del runtime Cloudflare Workers para TypeScript

### gsap

- version: 3.15.0
- scope: dependencies
- approved: 2026-10-09
- motivo: scroll horizontal fijado de las cards de últimos artículos en la portada (feature 72)
- licencia: Standard 'no charge' license de Webflow (https://gsap.com/standard-license), NO OSI: gratuita incluso para uso comercial, sin quitar los avisos de copyright; Webflow puede revisar los términos de versiones futuras
- alcance: solo la portada (src/components/latest-articles); gsap y el plugin ScrollTrigger, incluido en el mismo paquete; sin registro privado de GreenSock
