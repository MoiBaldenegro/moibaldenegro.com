# Diseño — feature 10 `mxvi-foundation`

## Contexto visual

- Primera fase del refactor del sitio al design system MXVI
  (https://moibaldenegro.github.io/mxvi-design-system/), cuyo look y tokens se
  extrajeron de este mismo sitio.
- Esta fase solo trae las hojas de componentes `.mx-*` y las carga en el
  layout. Ningún componente las usa todavía: el resultado visual no cambia
  (REQ-10-11). Las fases siguientes migran el marcado página por página.

## Tokens usados

No se crean ni cambian tokens. Las hojas copiadas leen los tokens existentes de
`src/styles/tokens.css` (mismos nombres y valores que `mxvi/tokens.css`, que el
design system vigila con su check de sincronización).

## Decisiones y constraints

- Decisión 1: copia sincronizada en `src/styles/mxvi/` y no un enlace a GitHub
  Pages (decisión humana): no cambia la CSP (`style-src 'self'`), no añade una
  dependencia de runtime y el sitio no depende de que GitHub Pages responda.
- Decisión 2: solo se copian `components.css` y `components/**`. `tokens.css`
  sigue siendo la fuente de tokens del sitio y las fuentes las sirve
  `astro:assets`; `base.css` se evaluará en la fase del chrome (navbar y footer).
- Decisión 3: `manifest.json` con sha256 por archivo: la copia no se edita a
  mano. Para cambiar un componente se cambia en el design system y se vuelve a
  ejecutar `node scripts/sync-mxvi.mjs`.
- Restricciones: ≤100 líneas por archivo (las hojas del design system ya están
  divididas para cumplirlo), estilos separados de la UI, sin dependencias, sin
  JavaScript de runtime.

## Alternativa descartada

- Enlazar `https://moibaldenegro.github.io/mxvi-design-system/mxvi/mxvi.css`.
- Motivo del descarte: exige abrir la CSP a un origen externo para estilos y
  fuentes y deja el sitio sin estilos si GitHub Pages falla.
