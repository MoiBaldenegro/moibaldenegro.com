# Review — feature 61

**Veredicto:** APPROVED

Feature 61 header-anchor-offset-mobile. Revisada contra
specs/61_header-anchor-offset-mobile/requirements.md, design.md, los criterios de
feature_list.json (id 61), docs/architecture.md, docs/conventions.md y CHECKPOINTS.md.
Implementada por el líder en rol de implementer, con autorización humana registrada en
progress/impl_61.md. Dependencias: la feature 61 no declara `depends_on`, así que no salta
ninguna dependencia pendiente.

## Verificación por requisito
- REQ-61-01: `src/styles/tokens.css` declara `--header-height-mobile: 170px` junto a
  `--header-height`. La altura medida a 320 px es 165 px (impl_61.md) y 170 ≥ 165.
  El test usa la constante `MEASURED_HEADER_320 = 165`. OK.
- REQ-61-02: `src/styles/layout.css`, dentro del `@media (max-width: 768px)` existente:
  `html { scroll-padding-top: var(--header-height-mobile); }`. OK.
- REQ-61-03: la regla html global conserva `scroll-padding-top: var(--header-height)`
  (layout.css:12). Escritorio sin cambios. OK.
- REQ-61-04: `.site-navbar nav { ...; padding-block: var(--gap-card); }` en el bloque móvil.
  Usa el token y no hay valores hardcodeados nuevos. OK.
- REQ-61-05 / 06: mediciones con Chrome headless + CDP registradas en impl_61.md. Destino del
  ancla en 170.4 / 169.8 / 170.0, que queda por debajo del header (bottom 165 / 165 / 123) a
  320 / 375 / 768. El logo queda a 14 px del borde superior a 320 px (≥ 8). Las mediciones
  usan un viewport de 2600 px de alto: es razonable por el hallazgo fuera de alcance 1
  (body con height:100%). OK.
- REQ-61-07: impl_61.md documenta el rojo previo (pass 2 / fail 3, con REQ-61-01, 02 y 04
  fallando) y el verde posterior (5/5; suite 756/756). OK.
- REQ-61-08: tokens.css 97, layout.css 98 y el test nuevo 55 líneas. Los tests de conteo
  están actualizados a 97 con la nota «Ajuste feature 61» en el encabezado. El meta-test
  REQ-16-09 de video-desktop-width exige 97 y la mención a --header-height-mobile. OK
  (ver la observación 1).
- REQ-61-09: `./init.sh` está en verde (entorno, formato, tests al 100% y build). OK.

## Checkpoints
- C1 (estilos en src/styles, sin `<style>` en .astro): [x]
- C2 (sin lógica en la UI): [x]  ← no se tocan .astro
- C3 (datos vía repositorio): [x]  ← no aplica
- C4 (solo tokens): [x]  ← 170px vive como token; padding-block usa --gap-card
- C5 (≤100 líneas): [x]  ← tokens.css 97, layout.css 98, test nuevo 55
- C6 (sin dependencias nuevas): [x]
- C7 (`./init.sh` verde): [x]
- C8 (verificación visual escritorio/móvil): [x]  ← CDP a 320/375/768/1280 en impl_61.md
- C9 (harness/progress): [x]  ← la feature sigue in_progress hasta que el líder la cierre

## Observaciones (no bloqueantes)
1. Los 6 tests de conteo modificados (article-card-images 230, post-header-horizontal 251,
   post-header 238, post-page-styles 267, post-readability 240 y video-desktop-width 178
   líneas) ya superaban las 100 líneas antes de esta feature. La 61 solo cambia literales,
   como exige design.md, sin añadir líneas netas. Es deuda preexistente y se trata igual que
   en la review de la feature 51. Aun así, el criterio 8 de feature_list.json, leído al pie
   de la letra, incluye «los archivos de tests modificados». Conviene que el humano lo tenga
   en cuenta para una futura feature de partición de esos tests.
2. Los hallazgos fuera de alcance de impl_61.md son candidatos a backlog vía spec_author:
   el header deja de ser sticky tras el primer viewport por `html, body { height: 100% }`,
   y en escritorio hay un desfase de 0.6 px.

## Cambios requeridos
Ninguno.
