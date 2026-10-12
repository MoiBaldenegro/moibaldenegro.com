# Diseño — Timeline de experiencia y stack (feature 83 about-experience-skills)

## Contexto visual

- Pantalla: /about, debajo de las cifras (feature 82). Estado actual: no existen. Estado deseado:
  una línea de tiempo vertical con 4 tarjetas de puesto y una rejilla de tarjetas de stack.

```
Experiencia (h2)
│
●  ┌─────────────────────────────────────────────────────┐
│  │ Líder de Desarrollo & Arquitecto de Software  (h3)  │
│  │ Taquerías MG · Guadalajara, Jalisco  [sep 2023 – presente] │
│  │ • logro  • logro  • logro …                         │
│  │ ▌Resultado: Sistema en producción en sep 2025 …     │
│  └─────────────────────────────────────────────────────┘
●  ┌ Desarrollador Web Multiplataforma … [1 año 2 meses] ┐
●  ┌ Coordinador de Academia … [3 años 5 meses] ┐
●  ┌ Ingeniero de Prueba Eléctrica y NPI … [1 año 4 meses] ┐

Stack y habilidades (h2)
┌ Lenguajes y runtimes ┐ ┌ Backend y arquitectura ┐ ┌ Bases de datos ┐
│ (Node.js) (TypeScript)│ │ (NestJS) (DDD) …       │ │ (MongoDB) …    │
└───────────────────────┘ └────────────────────────┘ └────────────────┘
… 6 áreas, repeat(auto-fit, minmax(260px, 1fr))
```

## Marcado

- `<section class="about-timeline" aria-labelledby="about-experience-title">`,
  `<h2 id="about-experience-title">Experiencia</h2>`, `<ol class="about-timeline__list">`, cada
  `<li class="about-timeline__item">` con `<h3>`, `<p class="about-timeline__org">organización ·
  lugar</p>`, `<span class="about-timeline__period">` (píldora; el period es texto libre, no se
  usa `<time>` porque las duraciones no son fechas), `<ul>` de logros y, si hay result,
  `<p class="about-timeline__result"><strong>Resultado:</strong> …</p>`.
- `<section class="about-skills" aria-labelledby="about-skills-title">`, `<h2>Stack y
  habilidades</h2>`, `<div class="about-skills__grid">`, cada área `<article>` con `<h3>` y
  `<ul class="about-skills__items">` de `<li>` píldora.

## Tokens usados (solo de tokens.css; no se añaden tokens)

| Token | Uso |
|-------|-----|
| `--color-surface` | fondo de tarjetas de puesto y de área |
| `--color-border` / `--color-border-strong` | borde de tarjetas / línea vertical y píldoras |
| `--color-accent` | marcador del puesto, borde izquierdo del resultado, período |
| `--color-text` / `--color-text-secondary` | role, logros / organización, etiquetas |
| `--radius-card` / `--radius-pill` | tarjetas / período y píldoras |
| `--shadow-card-rest` / `--shadow-card-hover` | sombra de tarjetas en reposo / hover |
| `--transition-default` | hover de tarjetas (anulado con prefers-reduced-motion) |
| `--gap-card` | todo margin/padding/gap (o calc() sobre él) |
| `--font-sans` | tipografía |

## Decisiones y constraints

- D1 Línea vertical con `border-left: 2px solid var(--color-border-strong)` en la lista y el
  marcador como `::before` circular de `var(--color-accent)` (decorativo, no lleva texto).
- D2 ≤768 px: sin línea vertical, tarjetas a todo el ancho; la información no cambia.
- D3 El period es texto: nunca se derivan fechas de las duraciones.
- D4 Resultado destacado con `border-left` de `var(--color-accent)`; la etiqueta "Resultado" es
  texto real (no solo color) por accesibilidad.
- Restricciones: estilos separados, ≤100 líneas, sin JS, tokens.css intacto.

## Alternativa descartada

- Timeline horizontal: descartado; con 4 puestos y logros largos obliga a scroll horizontal en
  móvil y empeora la lectura.
