# Análisis — Feature 115: hero-cards-lego-motion

Petición humana (2026-10-20): animación de entrada/salida del viewport para todas las cards del hero, como las de «Últimos artículos», en orden aleatorio, con sensación de «legos que se van acomodando».

## Qué toca

- Dominio nuevo: `src/domain/hero-cards-motion.ts` (constantes, `createRng` mulberry32, `legoOrder` Fisher-Yates, `legoDelays`, `legoTilt`; fase tipo `cardPhase` de `src/domain/latest-cards-motion.ts`).
- Runtime nuevo: `src/components/new-hero/hero-cards-motion.ts` (+ auxiliar si pasa de 100 líneas) y `<script>` en `new-hero.astro` con `astro:page-load` / `astro:before-swap`.
- Estilos nuevos: `src/styles/hero-cards-motion.css` importado desde `new-hero.astro`.
- No se tocan `hero-card.astro`, `htb-card.astro`, `hero-card-art.astro` ni `hero-card.css`.

## Hallazgos y riesgos

1. Conflicto hover/transición: `src/styles/hero-card.css:12` `transition: var(--transition-default)` (= all) y `:hover { transform: translateY(-4px) }`. Un transform en línea de GSAP anula el hover y la transición all interpola la animación. Solución: custom properties compuestas en translate/rotate/scale + opacity, y transition-property limitada a transform, box-shadow, filter (design.md, Decisión 1).
2. Hero sobre el pliegue: el primer viewport se oculta en línea al iniciar y entra de inmediato; posible parpadeo de un frame si el módulo corre tras el primer pintado. No afecta al CLS (transform/opacity no son layout shift); documentar con frames.
3. Móvil (106): `display: none` en las cards sin `data-show-on-mobile` en <= 768 px (hero-section.css:67); no se registran.
4. Scroll restaurado (REQ-96-51/52): sincronizar fase con progress tras crear el batch y en refresh; el `ScrollTrigger.refresh()` de latest-horizontal también recoloca los triggers del hero.
5. Foco: las cards enlazadas (107/110) siguen focusables con opacity 0; focusin las lleva al reposo (patrón REQ-96-36).
6. Peso: `dist/client/index.html` = 40 562 B (build actual). El script sale como bundle externo (una etiqueta de ~110 B): cabe en 42 000 B. Si Astro lo inlinea y no cabe, aplicar la aprobación humana con umbral nuevo justificado y acotado.
7. Tests heredados que fijen el contenido de `new-hero.astro` se ajustan con nota «Ajuste feature 115 (precedente REQ-43-06)».

## Verificación prevista

Chrome headless + CDP a 375/800/1024/1280/1600: frames de entrada y salida, orden de inicio distinto al del DOM con semilla fija (Math.random sustituido) y repetible, reduced-motion sin tweens, CLS <= 0,1 en carga y restauración, número de ScrollTriggers estable tras ida y vuelta con ClientRouter, 0 errores; evidencias en `progress/research/hero115/`.
