# Diseño — feature 110 hero-cards-links-new-tab

## Contexto visual

- Componentes: `a.card-link` de `src/components/hero-card.astro` (51 líneas) y `src/components/hero-cards/htb-card.astro` (33 líneas), feature 107. Hoy: `rel="noopener"` solo en externos, sin `target`, aviso « (sitio externo)» en `span.visually-hidden`.
- Deseado: toda card con `href` abre en pestaña nueva. Sin cambio visual (flecha ↗, hover y foco iguales).

## Tokens usados

Ninguno (solo marcado). `hero-card-link.css` no cambia.

## Decisiones y constraints (valores por defecto revisables)

- Decisión 1 — `target="_blank"` para todo `href` (externo o interno): la petición habla de «las cards» sin distinguir.
- Decisión 2 — `rel="noopener noreferrer"` siempre que haya `href`.
- Decisión 3 — aviso: en el sitio no existe texto de pestaña nueva (about-hero, about-projects y site-footer solo usan « (sitio externo)» y no abren pestaña); se crea « (se abre en una pestaña nueva)» tras « (sitio externo)»: «GITHUB (sitio externo) (se abre en una pestaña nueva)». Interno: «<título> (se abre en una pestaña nueva)». Los enlaces de about y footer quedan fuera de alcance.
- Peso: ≈ +60 B por enlace (2 hoy) sobre ≈ 39 513 B: debería caber < 40 000 B. Si no cabe, umbral nuevo 42 000 B (aprobado por el humano el 2026-10-20, nota REQ-43-06; nunca sin límite).
- Restricciones: sin JS, sin style inline, <= 100 líneas por archivo; la clasificación externo/interno sigue en `src/domain/hero-card-link.ts`.

## Verificación visual

Chrome headless + CDP a 375/800/1024/1280/1600 (base `cdp107/` del scratchpad; a 375 px con la regla de la 106 desactivada por CDP): el clic en el centro de GITHUB y YOUTUBE crea un target nuevo con el href (Target.setDiscoverTargets + targetCreated) y la portada sigue en su URL; flecha y foco iguales a la 107. Capturas: `progress/research/hero110/<card>-<w>.png`.

## Alternativa descartada

- `target="_blank"` solo en externos: contradice el literal «las cards ... debe ser un BLANK».
