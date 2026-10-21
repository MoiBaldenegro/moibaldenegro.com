# Diseño — feature 111 hero-cards-data-rebaseline

## Contexto visual

- Card CLOUDFLARE (datos del humano): icono principal #cloudflare-cloud (256x116) abajo a la derecha; esquina #cloudflare-cloud 22x22 px (18x18 en <= 1200 px); fondo #cloudflare (wordmark 512x76) en md, anclado abajo a la izquierda (109), opacidad 0.06.
- El svg de .card-icon mide 28px de alto (hero-card.astro): el alto visible del logo es 28px x --icon-scale y su ancho lo limita --icon-width (meet).

## Tokens usados (solo de los tokens del diseño del proyecto)

- --color-marca-cloudflare (fondo). Sin tokens nuevos.

## Decisiones y constraints

- Decisión 1: regla base cloudflare --icon-width 270px / --icon-rotation 0deg (= JSON). --icon-scale base: el implementer fija por CDP el valor que deja la nube reconocible sin tapar el título (valor por defecto revisable; hoy 1 → nube ~62x28 px). El scale 8 del JSON NO se replica en CSS: el campo scale no se consume en el render (precedente: JSON 5 frente a CSS 1..7 en el resto de tarjetas).
- Decisión 2: los overrides de cloudflare en @media (max-width: 1200px) y (max-width: 768px) solo se reajustan si la CDP lo pide, dentro de los rangos de REQ-97-19 (--icon-width 30-200px, --icon-scale 2-5, rotación -12..0deg).
- Decisión 3: iconWidth 270px queda fuera del rango JSON 90-200px de la Decisión 4 de la 97; se acepta como decisión humana (ni el parse ni ningún test validan ese rango).
- hero-card.css tiene 99 líneas: el cambio sustituye valores en la regla existente (máx. 100 líneas).

## Alternativa descartada

- Volver los datos de CLOUDFLARE a los de la 108: descartada, el JSON del humano es la fuente de verdad.
- Derivar del JSON las instantáneas de REQ-101-17 y REQ-98-01/02/05: descartada por tautológica (dejarían de detectar cambios no anunciados).
