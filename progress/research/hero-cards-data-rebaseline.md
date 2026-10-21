# Análisis — feature 111 hero-cards-data-rebaseline (spec_author, 2026-10-20)

## Qué es
Re-baseline de 8 tests de features cerradas que fijan datos de hero-cards.json previos a las ediciones del humano; bloquean el cierre de la 109. Spec: specs/111_hero-cards-data-rebaseline/ (requirements.md + design.md).

## Qué cambió el humano (git diff src/data/hero-cards.json)
- cloudflare: icon #cloudflare → #cloudflare-cloud; nuevos cornerIcon #cloudflare-cloud y backgroundIcon #cloudflare (sin backgroundIconSize → md por defecto, sin atributo); scale 5 → 8; iconWidth 170px → 270px.
- claude-code: backgroundIconSize lg.
- Sprite (solo lectura): cloudflare (0 0 512 76) y cloudflare-cloud (0 0 256 116) existen; claude, anthropic-wordmark y github-wordmark también.
- El JSON pasa el parse (readBackdropSize: backgroundIconSize válido y con backgroundIcon).

## Tests afectados y estrategia
| Test | Archivo | Estrategia |
|---|---|---|
| REQ-108-05 | tests/hero-backdrop-size.test.mjs (95) | pares derivados del JSON + invariantes (enum, requiere backgroundIcon) |
| REQ-108-06/07/17 | tests/hero-backdrop-size.test.mjs | atributo solo si el JSON lo declara; cloudflare sin atributo |
| REQ-103-05..08 | tests/hero-cards-extra-logos.test.mjs (100) | lista de extras derivada del JSON; símbolos en el sprite |
| REQ-103-09..11 | tests/hero-cards-extra-logos.test.mjs | svg 28px (hallazgo H2) |
| REQ-97-20/98-35 | tests/hero-cards-icon-fit.test.mjs (99) | test intacto; CSS base cloudflare 270px / 0deg |
| REQ-107-30/31/35 | tests/hero-cards-links-xlink.test.mjs (39) | conteo de use = suma de refs del JSON (19 hoy) |
| REQ-101-17 | tests/hero-cards-polish.test.mjs (100) | instantánea con cloudflare actual |
| REQ-98-01/02/05 | tests/hero-cards-repository.test.mjs (146, >100 previo) | fila cloudflare actual sin añadir líneas |

## Hallazgos (decisiones humanas a confirmar, no bloquean)
- H1: el campo scale del JSON no se consume en el render (sin uso de card.scale); el tamaño real lo da --icon-scale del CSS. scale 8 no se replica (8 x 28 px = 224 px de alto, desborda la card). Si el humano quiere que scale gobierne el CSS, feature aparte.
- H2: hero-card.astro tiene el svg de .card-icon a 28px (antes 32px) sin spec ni impl que lo recoja; se trata como edición humana y REQ-103-09 se re-basa.
- H3: iconWidth 270px fuera del rango 90-200px de la Decisión 4 de la 97; ni el parse ni los tests lo validan: decisión humana aceptada.
- H4: REQ-97-16 medía la región nube 0 0 165 76 del wordmark; con #cloudflare-cloud todo el símbolo es la nube: REQ-111-11 lo sustituye.
- H5: #cloudflare-cloud aparece dos veces (principal y esquina): decisión humana, no rompe invariantes.
- Riesgo: peso de la portada (REQ-47-06 < 40 000 B) con 2 use más; medir antes/después.
