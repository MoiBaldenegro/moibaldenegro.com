# Análisis — features 109 y 110 (tareas 1-2 de 7 del humano, 2026-10-20)

## 109 hero-backdrop-bottom-left

- Qué: el logo de fondo `.card-backdrop` se ancla siempre abajo-izquierda.
- Causa del centrado (src/styles/hero-card-accents.css): (1) el tamaño se fija con `left`/`right` simétricos (sm 16px/10px a cada lado), así que un logo que no desborda queda centrado; (2) con `<use>` manda el `preserveAspectRatio` del symbol (xMidYMid meet) y CLOUDFLARE (`#cloudflare`, viewBox 512 × 76) usa el `aspect-ratio: 4 / 1` genérico: el glifo queda centrado en vertical, separado del borde inferior.
- Cambio: `left` fijo + `width` por tamaño con `right: auto` (md/lg mismo rectángulo que hoy; sm 60 % pegado a la izquierda) y regla de ratio 512 / 76 para cloudflare. Solo CSS. Valores en specs/109_hero-backdrop-bottom-left/design.md.
- Riesgos: tests de 105/108 que fijan left/right (tests/hero-backdrop-size.test.mjs, tests/hero-cards-extra-logos.test.mjs y los de la 105) se ajustan con nota REQ-43-06. Sin tocar sprite.svg no hay arreglo genérico para logos nuevos (cada uno necesita su regla de ratio).

## 110 hero-cards-links-new-tab

- Qué: `a.card-link` (hero-card.astro:49, htb-card.astro:31) con `target="_blank"`, `rel="noopener noreferrer"` y aviso « (se abre en una pestaña nueva)» tras « (sitio externo)». En el sitio no existe ese texto (about-hero, about-projects y site-footer solo usan « (sitio externo)»): se crea y no se toca el resto.
- Peso: ≈ +120 B sobre ≈ 39 513 B: cabe < 40 000 B. Si no cabe: umbral 42 000 B (decisión humana del 2026-10-20, nota REQ-43-06).
- Riesgos: tests de la 107 que fijan rel="noopener" sin target y el texto del enlace (tests/hero-cards-links.test.mjs, REQ-107-06/08) se ajustan; la CDP del clic (REQ-107-13) pasa a medir un target nuevo.
- Dependencias: 109 → 108; 110 → 107 (ambas done). 110 no depende de 109.
