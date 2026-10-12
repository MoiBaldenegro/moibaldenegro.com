# Análisis — Tipografía Geist de Vercel (Sans + Mono + Pixel) — features 85 y 86

Fecha: 2026-10-12. Autor: spec_author. Origen: decisión humana 2026-10-12 (nota PENDIENTE
en docs/dependencies.md): Geist Pixel en títulos/display, Geist Sans como texto base y Geist
Mono para código; referencia https://vercel.com/font?type=pixel. Dependencia APROBADA.

## 1. Problema reafirmado y alcance

Hoy el sitio usa un único token `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif`
(src/styles/tokens.css:95) y Inter nunca se carga (no hay @font-face): en la práctica se ve
la fuente del sistema. El código (`.post__content code/pre`) usa el monospace por defecto del
navegador. El cambio: cargar Geist autoalojada (CSP de la feature 64: sin CDN, `default-src
'self'` cubre las fuentes porque no hay `font-src`), exponer tres familias como tokens y
aplicar Pixel a h1/h2. Logo: es una imagen (`/assets/mxvi_logo.webp`) → no aplica.

## 2. Paquete npm (verificado contra el registro y el tarball)

| Candidato | Pixel | Variantes Pixel | Peer deps | Licencia | Decisión |
|-----------|-------|-----------------|-----------|----------|----------|
| `geist@1.7.2` (Vercel, oficial) | sí | Square, Grid, Circle, Triangle, Line | `next >=13.2.0` | SIL OFL 1.1 (LICENSE.txt) | **elegido** |
| `@fontsource/geist-pixel@5.3.0` + `@fontsource-variable/geist` + `@fontsource-variable/geist-mono` | sí | 1 sola (400) | ninguno | OFL-1.1 | descartado: 3 dependencias, reempaquetado de terceros, sin variantes |

- Versión exacta: **1.7.2**, publicada 2026-06-01 (> 4 meses; ≥ 2 semanas). Última estable;
  no hay betas posteriores.
- Contenido (`dist/fonts/`): todo woff2. Usados:
  - `geist-sans/Geist-Variable.woff2` (69,6 KB, variable wght 100-900) y
    `geist-sans/Geist-Italic[wght].woff2` (cursiva de artículos, sin preload).
  - `geist-mono/GeistMono-Variable.woff2` (71,4 KB, variable).
  - `geist-pixel/GeistPixel-Circle.woff2` (28 044 bytes, cara única, OS/2 usWeightClass
    400; el `next/font` oficial la declara 500; nombre interno «Geist Pixel Circle»).
    **Variante elegida por el humano el 2026-10-12** («me gusta la Circle, se ve bastante
    sexy y fuera de lo común, hasta cierto punto elegante, no tan friki»); sustituye a la
    Square propuesta al principio. Square, Grid, Triangle y Line se quedan en el paquete sin usar.
- Cobertura del español verificada con fontTools: á é í ó ú Á É Í Ó Ú ñ Ñ ü Ü ¿ ¡ — « » están
  en las tres fuentes (Pixel Circle: 420 caracteres, 480 glifos; mismas métricas que Square:
  UPM 1000, x-height 532, cap 722, avances iguales).

### Legibilidad de Circle en tamaños pequeños (medido, 2026-10-12)

- Square dibuja cada glifo como un contorno sólido (1 contorno en «l»). Circle lo dibuja con
  puntos sueltos (53 contornos en «l»): círculos de 38 unidades de diámetro con paso 38
  (puntos tangentes); una mayúscula mide 19 puntos de alto.
- Punto = 0,038 em: h1 del hero a 64 px → 2,4 px (la textura de puntos se ve); `.post__title`
  a 1,6rem y h2 a 1,35-1,75rem (21,6-28 px) → 0,8-1,1 px, por debajo del píxel físico en
  pantallas 1x. Ahí la textura desaparece: el antialiasing la convierte en un trazo gris, y
  como el círculo cubre ~78,5 % de la celda, el título se ve más claro y más fino que con Square.
- Conclusión: es legible (la forma de las letras es la misma), pero en los h2 el efecto
  Circle solo se aprecia por encima de ~50 px o en pantallas 2x. No bloquea. REQ-86-18 pide
  capturas del h2 más pequeño para que lo revise el humano; si no le convence, se resuelve en
  una feature posterior (h2 más grandes o Pixel solo en h1).
- Los JS del paquete (`dist/*.js`) importan `next/font/local`: NO se importan nunca; solo se
  consumen los woff2 por ruta.

### Riesgo del peer `next` (comprobado empíricamente con pnpm 10.8.0)

pnpm 10 tiene `autoInstallPeers: true` (lo confirma pnpm-lock.yaml:4). En un proyecto vacío,
`pnpm add geist@1.7.2` metió `next@16.4.0` + react + react-dom en el lockfile (4 refs).
Pruebas de mitigación:
- `pnpm.peerDependencyRules.ignoreMissing: ["next"]` → NO evita la instalación (4 refs).
- `.npmrc auto-install-peers=false` → evita next, pero cambia el comportamiento para todas
  las dependencias del proyecto (astro, wrangler…) → descartado.
- **`pnpm.overrides: { "geist>next": "-" }`** → 0 refs a next; acotado solo a geist. **Elegido.**

## 3. Integración en Astro 7.3.8: Fonts API (`fontProviders.local()`) vs @font-face manual

Verificado en node_modules/astro 7.3.8: `fonts` es configuración estable (desde 6.0),
`fontProviders.local()` acepta `variants[].src` como ruta relativa a la raíz, import de
paquete o URL; `<Font cssVariable preload />` (astro:assets) emite un `<style>` con los
@font-face + `:root{--var: "Familia", "Familia fallback", …}` y los `<link rel=preload
as=font crossorigin>`; `preload` admite filtros `[{ weight, style, subset }]`; `display`
por familia; `fallbacks` + `optimizedFallbacks` (por defecto true) generan una cara de
fallback con métricas ajustadas (size-adjust/ascent-override) cuando el último fallback es
una familia genérica → mitiga CLS.

**Decisión: Fonts API con proveedor local.**
- Los woff2 se copian con hash a `/_astro/fonts/` (mismo origen, caché inmutable) sin
  duplicarlos en `public/`.
- El `<style>` inline que emite `<Font>` es generado por Astro, no escrito en un .astro
  (la regla «sin <style> en .astro» se respeta) y lo permite `style-src 'self'
  'unsafe-inline'` de la CSP actual: la CSP no cambia.
- Fallbacks métricos automáticos, imposibles de mantener a mano sin valores sueltos.
- Descartado @font-face manual en src/styles + copia a public/: duplicaría archivos con
  licencia, exige rutas sin hash, preload manual y métricas de fallback hardcodeadas
  (valores sueltos prohibidos).
- Ruta a usar: `./node_modules/geist/dist/fonts/...` (el `exports` del paquete solo expone
  `./font*`, así que el import `geist/dist/fonts/...` podría no resolver; el implementer
  verifica en rojo cuál resuelve con el enlace simbólico de pnpm).

Preload: solo críticas → Geist Sans normal (cuerpo) y Geist Pixel (h1 sobre el pliegue).
Mono sin preload (solo artículos con código). Cursiva Sans sin preload. `display: swap`.

## 4. Tokens y tests que fijan tokens.css

- tokens.css mide 97 líneas (máx. 100, tests/design-tokens.test.mjs REQ-02-01): cabe
  `--font-mono` (85) y `--font-display` (86) sin comentario extra → 99 líneas.
- design-tokens.test.mjs exige que exista `--font-sans` (grupo tipografía) y nombres
  kebab-case: se conserva el nombre, cambia su valor.
- post-readability.test.mjs:214 prohíbe `--font-size-|--line-height-` en tokens.css: no se
  añaden.
- Listas cerradas de tokens permitidos (search-bar, search-dedicated-view, search-live,
  search-results, post-page-styles): solo contienen `--font-sans`; esas hojas siguen usando
  `--font-sans`, por lo que no cambian. Los nuevos tokens solo se consumen en la hoja nueva
  `src/styles/typography.css`.
- Nombres: Astro define `--font-geist-sans/-mono/-pixel` (inline, con fallbacks) y
  tokens.css los envuelve con fallback de sistema: `--font-sans: var(--font-geist-sans,
  ui-sans-serif, system-ui, sans-serif)`. Nunca se reutiliza `--font-sans` como cssVariable
  de Astro (chocaría en cascada con tokens.css).
- tests/gsap-dependency-approval.test.mjs:61 fija la lista exacta de `dependencies`: la
  feature 85 la amplía con `geist`.

## 5. Aplicación de Pixel (feature 86)

- Regla de elemento global en typography.css: `h1, h2 { font-family: var(--font-display);
  font-synthesis: none; }`. Ninguna hoja actual pone `font-family` sobre un h1/h2 (solo en
  contenedores: `.about-hero`, `.new-hero`, `.post__content`…), y una regla de elemento gana
  a la herencia → cubre hero (`.profile-content h1`), /about, artículos (h1 y h2 del
  markdown), 404, búsqueda y secciones (`latest-articles__heading`, `htb-stadistics__title`).
- `font-synthesis: none`: Pixel tiene una sola cara (400); `.post__title`, el h1 del hero,
  etc. heredan peso 700 del UA → sin esto el navegador sintetiza negrita sobre píxeles.
- h3+ y `.card-title` (etiquetas de las tarjetas del hero, `<p>`) quedan en Sans: fuera del
  alcance pedido (h1, h2, títulos del hero, encabezados de sección).

## 6. Descomposición

| id | name | Contenido | depends_on |
|----|------|-----------|------------|
| 85 | geist-font-base | dependencia + override + registro + Fonts API Sans/Mono + tokens + typography.css (código en Mono) | [84] |
| 86 | geist-pixel-display | familia Pixel + preload + `--font-display` + h1/h2 + verificación visual/CLS | [85] |

depends_on [84] según la instrucción del líder: entra tras el rediseño de /about (82-84
tocan about*.css y about.astro; así Pixel se valida sobre el /about final).

## 7. Riesgos y trabas

1. Peer `next` (mitigado con override, ver §2). Si `pnpm install` emite un aviso de peer
   ausente, es esperado y no rompe el build.
2. Ancho de Pixel en móvil: el h1 del hero usa `clamp(2.5rem, 4vw, 4rem)`/2rem y
   `letter-spacing: -2px` (profile-card.css:53/66); a 375 px puede desbordar. La 86 exige
   `scrollWidth === clientWidth` y, si desborda, ajustar en profile-card.css.
3. CLS: el fallback métrico de Pixel (monospace) no es idéntico; la 86 mide CLS ≤ 0.1.
4. Rutas de `src` del proveedor local con el enlace simbólico de pnpm en Windows: verificar
   en rojo con `astro build`.
5. Tests con `astro build` son lentos; reutilizar el patrón de tests/about-hero-stats.test.mjs.
