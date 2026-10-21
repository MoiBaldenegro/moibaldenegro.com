# Diseño — Feature 114: lupa animada en la search bar del header

## Contexto visual

- Componente: `src/components/search-bar/search-bar.astro` (header; >= 970 px en la barra, <= 969 px dentro del panel del menú hamburguesa de la 93).
- Estado actual: input en píldora de 240 px con placeholder «Buscar artículos…» y × de limpiar a la derecha; sin icono.
- Estado deseado: lupa SVG a la izquierda del input que reacciona al foco y «escanea» mientras el usuario escribe.

## Tokens usados (solo existentes)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-text-secondary` | #b8b8c5 | Lupa en reposo |
| `--color-accent` | #B37AC2 | Lupa y borde con foco / con texto |
| `--color-glow` | rgba(108,56,122,.35) | Halo suave del input con foco (box-shadow) |
| `--transition-default` | .28s cubic-bezier(.2,.8,.2,1) | Cambio de color y escala de la lupa |
| `--radius-pill` | 999px | Píldora del input (sin cambios) |

## Propuesta creativa: «lupa que escanea»

1. Vacío: lupa 16x16 px (`stroke-width` 2, círculo r 7 + mango a 45°) en `--color-text-secondary`, `position: absolute; left: 16px; top: 50%; translateY(-50%)`, `pointer-events: none`.
2. Foco (`.search-bar:focus-within`): la lupa pasa a `--color-accent` con `scale(1.12)` y el input gana borde `--color-accent` + `box-shadow: 0 0 0 4px var(--color-glow)` (el outline global de REQ-37-02 se mantiene).
3. Escribiendo (foco + texto): como el SVG va antes del input, el selector es `.search-bar:focus-within .search-bar__form:has(.search-bar__input:not(:placeholder-shown)) .search-bar__icon`; keyframes `search-bar-scan` 1.6 s ease-in-out infinite: la lupa se desplaza 0 → 3px → -2px → 0 en X y rota -10deg → 10deg → 0, como si recorriera el texto buscando.
4. Con texto sin foco: lupa en `--color-accent`, estática (indica búsqueda activa).
5. `prefers-reduced-motion: reduce`: `animation: none; transition: none` en la lupa.

Valores por defecto creativos (duración 1.6 s, recorrido 3/-2 px, ±10deg, escala 1.12, halo 4 px) revisables por el humano en `progress/current.md`.

## Decisiones y constraints

- Decisión 1: SVG inline en el componente (no símbolo del sprite): `public/assets/svg/sprite.svg` es ajeno a esta tarea y la lupa son 2 primitivas (~250 B).
- Decisión 2: CSS puro, cero JS nuevo: el estado «hay texto» se lee con `:placeholder-shown` (el input ya tiene placeholder); no se toca `search-bar.ts`. Sin `:has()` solo se pierde la animación (degradación aceptable).
- Decisión 3: hoja nueva `src/styles/search-bar-icon.css` importada por el componente, porque `search-bar.css` ya tiene 90 líneas; duraciones y distancias como literales locales (no colores), sin tokens nuevos (`tokens.css` en 99 líneas).
- Decisión 4: el input pasa a `padding: 10px 42px 10px 42px`; ancho 240 px (>= 970 px) y 100 % (<= 969 px) sin cambios, así no crece el header de 65 px.
- Restricciones: estilos fuera del .astro, tokens, <= 100 líneas, sin dependencias, sin romper features 4-6, 10, 57 y 93.

## Alternativa descartada

- Lupa como botón de envío accionable con pulso por pulsación de tecla (JS en `input`): descartada porque exige JS nuevo y un segundo control con nombre accesible; Enter ya envía el formulario y la animación por estado CSS basta.
