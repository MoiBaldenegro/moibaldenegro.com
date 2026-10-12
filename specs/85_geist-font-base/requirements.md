# Requisitos — Geist Sans y Geist Mono autoalojadas como fuentes base (feature 85 geist-font-base)
# Origen: decisión humana 2026-10-12 (docs/dependencies.md, nota PENDIENTE de Geist). Análisis: progress/research/geist-font.md.
# Toca UI (tipografía visible): ver design.md en esta carpeta. depends_on [84]: entra tras el rediseño de /about.
# Paquete: geist 1.7.2 exacta (Vercel, SIL OFL 1.1, publicada 2026-06-01); peer next anulado con pnpm.overrides "geist>next": "-".
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-85-01/02/03→1, REQ-85-04/05/06→2, REQ-85-07/08/09/10→3, REQ-85-11/20→4, REQ-85-12/13/14/15→5, REQ-85-16/17/18/19→6, REQ-85-21/22/23→7.

## Requisitos

REQ-85-01 El archivo package.json SHALL declarar geist con la versión exacta 1.7.2 en dependencies.
REQ-85-02 El archivo package.json SHALL declarar en pnpm.overrides la clave "geist>next" con el valor "-" para que pnpm no instale el peer next.
REQ-85-03 El archivo pnpm-lock.yaml SHALL resolver geist 1.7.2 sin ninguna entrada de los paquetes next, react ni react-dom.
REQ-85-04 El registro docs/dependencies.md SHALL contener la entrada ### geist con version 1.7.2, scope dependencies, approved 2026-10-12, motivo, licencia SIL Open Font License 1.1 y alcance.
REQ-85-05 La nota del 2026-10-12 sobre Geist en docs/dependencies.md SHALL indicar APLICADA en la feature 85 en lugar de PENDIENTE y remitir Geist Pixel en títulos a la feature 86.
REQ-85-06 El test tests/gsap-dependency-approval.test.mjs SHALL fijar la lista ordenada de dependencies incluyendo geist.
REQ-85-07 El archivo astro.config.mjs SHALL registrar en fonts con fontProviders.local() la familia Geist con cssVariable --font-geist-sans desde dist/fonts/geist-sans/Geist-Variable.woff2 del paquete geist con weight 100 900 y style normal.
REQ-85-08 La familia Geist SHALL incluir una segunda variante con style italic desde dist/fonts/geist-sans/Geist-Italic[wght].woff2 con weight 100 900.
REQ-85-09 El archivo astro.config.mjs SHALL registrar con fontProviders.local() la familia Geist Mono con cssVariable --font-geist-mono desde dist/fonts/geist-mono/GeistMono-Variable.woff2 con weight 100 900 y style normal.
REQ-85-10 Cada familia registrada por esta feature SHALL declarar display swap y una lista fallbacks cuyo último elemento es sans-serif para Geist y monospace para Geist Mono.
REQ-85-11 El layout src/layouts/Layout.astro SHALL renderizar en el head el componente Font de astro:assets para --font-geist-sans con preload filtrado a style normal y para --font-geist-mono sin preload.
REQ-85-12 El token --font-sans de src/styles/tokens.css SHALL valer var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif) sin mencionar Inter.
REQ-85-13 El archivo src/styles/tokens.css SHALL definir el token --font-mono con el valor var(--font-geist-mono, ui-monospace, monospace) y medir 100 líneas o menos.
REQ-85-14 La hoja src/styles/typography.css SHALL aplicar font-family: var(--font-mono) a los selectores code, pre, kbd y samp usando solo tokens de tokens.css.
REQ-85-15 El layout src/layouts/Layout.astro SHALL importar ../styles/typography.css después de ../styles/layout.css.
REQ-85-16 WHEN se ejecuta astro build, el directorio dist/client/_astro/fonts SHALL contener los archivos woff2 de Geist y Geist Mono.
REQ-85-17 WHEN se ejecuta astro build, el HTML construido de / SHALL contener exactamente un link rel="preload" as="font" type="font/woff2" con crossorigin cuyo href empieza por /_astro/fonts/.
REQ-85-18 El HTML construido de las páginas / y /about y de un artículo SHALL estar libre de URLs http:// o https:// dentro de las reglas @font-face y de los link rel="preload" de fuentes.
REQ-85-19 La CSP de public/_headers y de src/domain/http/security-headers.ts SHALL permanecer sin cambios porque default-src 'self' cubre las fuentes autoalojadas.
REQ-85-20 Ningún archivo de src/ SHALL importar módulos JavaScript del paquete geist porque geist/font depende de next/font.
REQ-85-21 El implementer SHALL anotar el rojo de los tests nuevos en progress/impl_85.md antes de modificar astro.config.mjs, Layout.astro y tokens.css.
REQ-85-22 Cada archivo creado o modificado por esta feature SHALL medir 100 líneas o menos, WHERE el archivo pertenece a src/, tests/ o es astro.config.mjs.
REQ-85-23 WHEN termina la feature, ./init.sh SHALL terminar en verde con node scripts/audit-design-tokens.mjs también en verde.
