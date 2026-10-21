# Diseño — Feature 115: hero-cards-lego-motion

## Contexto visual

- Sección: mosaico del hero de la portada (`.hero-grid` en `src/components/new-hero/new-hero.astro`), todas las cards `.hero-card` (icono y ricas como HTB). La `profile-card` no se anima.
- Hoy: las cards están quietas; solo «Últimos artículos» tiene entrada/salida (feature 96).
- Deseado: «legos que se acomodan». Cada pieza cae desde un poco más arriba, algo girada y algo más grande (más cerca del ojo), y encaja con un rebote corto (`back.out`): el pequeño sobrepaso y la vuelta dan la sensación de «clic». El orden es aleatorio, no el del DOM. Al salir del viewport la pieza se «levanta» (sube y se desvanece) y al volver se encaja otra vez.

## Valores por defecto (revisables por el humano, en `src/domain/hero-cards-motion.ts`)

| Valor | Defecto | Motivo |
|-------|---------|--------|
| Entrada y | -32px a 0 | Cae desde arriba: pieza que se encaja |
| Entrada rotate | aleatorio en [-3, 3] deg a 0 | Pieza torcida que se endereza al encajar |
| Entrada scale | 1.04 a 1 | Pieza más cerca antes de apoyarse |
| Entrada opacity | 0 a 1 | |
| Entrada duración / curva | 0.6 s / back.out(1.7) | Rebote corto de asentamiento |
| Retardo | posición aleatoria x min(0.05 s, 0.6 s / (n-1)) | Ninguna card espera más de 0.6 s |
| Salida | y -24px, scale 1.04, opacity 0, 0.35 s power2.in | Pieza que se levanta |
| Rango | start 'top 92%', end 'bottom 8%' (ScrollTrigger.batch) | Las del primer viewport entran al cargar |
| Semilla | aleatoria por carga (Math.random) | El humano pidió orden aleatorio; tests y CDP la fijan |

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-default` | .28s cubic-bezier(.2,.8,.2,1) | Sigue siendo la duración/curva del hover; no hay tokens nuevos |

## Decisiones y constraints

- Decisión 1 (conflicto con el hover): `.hero-card` declara `transition: var(--transition-default)` (equivale a `all`) y `:hover { transform: translateY(-4px) }`. Un transform en línea de GSAP anularía el hover y la transición `all` interpolaría cada frame. Por eso GSAP anima custom properties (`--hero-lego-y`, `--hero-lego-rotate`, `--hero-lego-scale`) y `opacity`; `hero-cards-motion.css` las compone en las propiedades individuales `translate`, `rotate` y `scale` (respaldo 0px / 0deg / 1) y limita `transition-property` a `transform, box-shadow, filter`. Hover (transform) y pieza (translate/rotate/scale) se componen sin pisarse.
- Decisión 2 (sin JS): el estado oculto solo lo pone el JS en línea; ninguna hoja fija opacity 0.
- Decisión 3 (semilla): `createRng` es mulberry32; en producción la semilla sale de `Math.random`; la CDP fija el orden sustituyendo `Math.random` con `Page.addScriptToEvaluateOnNewDocument`, sin ganchos de depuración en el runtime.
- Decisión 4 (móvil): en <= 768 px solo se registran las cards con `data-show-on-mobile` (las demás tienen `display: none`, feature 106); cada consulta va en su `mm.add`.
- Decisión 5 (scroll restaurado): tras crear los triggers y en cada refresh se sincroniza la fase de cada card con su progress (patrón `cardPhase` / `phaseSync` de la 96).
- Script: `<script>` en `new-hero.astro` con `astro:page-load` / `astro:before-swap` (bundle externo: solo una etiqueta en el HTML). gsap 3.15.0 ya es dependencia aprobada (features 70/96).
- Restricciones: solo transform (translate/rotate/scale) y opacity; <= 100 líneas por archivo; estilos fuera del `.astro`; valores en `src/domain`; sin dependencias.

## Alternativa descartada

- Tweens de x / y / rotation / scale (transform en línea) con clearProps al terminar: anulan el hover durante la animación y en los estados de salida, y chocan con `transition: all`.
- Ocultar las cards por CSS hasta que el JS las anime: sin JS se quedarían invisibles.
