# Diseño — Menú hamburguesa en el header móvil (feature 79 mobile-hamburger-menu)

## Contexto visual

- Componente: barra sticky compartida `.site-navbar` (src/layouts/Layout.astro), hoy con
  logo 72×25, About, Arquitectura, @moibaldenegro y el buscador.
- Estado actual (≤768 px): el nav se envuelve en varias filas (`flex-wrap: wrap` de
  search-bar.css, `padding-block: var(--gap-card)` de la 61) y la barra mide 165 px a
  375 px; `scroll-padding-top: var(--header-height-mobile)` (170px).
- Estado deseado (≤768 px con JS): una fila de 64 px + 1 px de borde = 65 px; logo a la
  izquierda, botón ☰ de 44×44 a la derecha. Al abrir: botón ✕ y un panel bajo el header,
  a todo el ancho, con About, Arquitectura y @moibaldenegro en columna y el buscador a
  todo el ancho debajo. Escritorio (>768 px): sin ningún cambio respecto a la 77.

```
375 px, cerrado                       375 px, abierto
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ [logo]                  [☰]  │ 65   │ [logo]                  [✕]  │ 65
└──────────────────────────────┘      ├──────────────────────────────┤
                                      │ About                        │ ≥44
                                      │ Arquitectura                 │ ≥44
                                      │ @moibaldenegro               │ ≥44
                                      │ [ Buscar artículos…      × ] │
                                      └──────────────────────────────┘
```

## Marcado (Layout.astro)

```
<header class="site-navbar">
  <nav>
    <a aria-current=… href="/"><img … /></a>
    <button type="button" class="site-menu__toggle" data-site-menu-toggle
            aria-controls="site-menu" aria-expanded="false" aria-label="Abrir menú"></button>
    <div class="site-menu" id="site-menu" data-site-menu>
      <a … href="/about">About</a>
      <a … href="/arquitectura">Arquitectura</a>
      <a href="https://x.com/moibaldenegro">@moibaldenegro<span class="visually-hidden"> (X, sitio externo)</span></a>
      <SearchBar />
    </div>
  </nav>
</header>
<SiteMenu />
<SearchEscape />
```

- `<nav>` sin atributos (seis tests lo leen con `/<nav>[\s\S]*?<\/nav>/`); los enlaces sin
  clase ni style; las condiciones de `aria-current` se copian tal cual.
- `site-menu.astro`: `import '../../styles/site-menu.css'` y un `<script>` que importa
  `initSiteMenu`, lo llama al evaluarse y lo registra en `astro:after-swap`. Sin marcado.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--header-height` | 64px | min-height del nav compacto, scroll-padding-top en modo hamburguesa y resta del max-height del panel |
| `--color-background` | #070716 | fondo opaco del panel |
| `--color-border-strong` | rgba(255,255,255,.15) | borde inferior del panel |
| `--color-border` | rgba(255,255,255,.08) | borde del botón y separadores entre enlaces |
| `--color-text` / `--color-accent-hover` | #fff / #9a89ff | icono del botón y hover |
| `--radius-pill` | 999px | radio del botón |
| `--gap-card` | 14px | padding y gap del panel |
| `--transition-default` | .28s | solo color del botón (hover); el panel no anima |

Sin tokens nuevos: tokens.css se queda en 97 líneas.

## Decisiones y constraints

- **D1 — Modo hamburguesa = `@media (max-width: 768px) and (scripting: enabled)`.** El primer
  `astro:page-load` llega con `load` (router.js:492) y el chunk del script se descarga tras
  el primer pintado en una visita en frío: activar el modo con un atributo puesto por el
  script haría saltar el contenido ~100 px (CLS). Con la media query el primer pintado ya
  es compacto. Sin JS (`scripting: none`) o en navegadores sin la media feature (Chrome <
  120, Safari < 17, Firefox < 113) la query no casa: layout envuelto actual con todo
  alcanzable y el botón con `display: none` (nunca un botón muerto sin JS). El script solo
  gestiona el estado `data-menu="open|closed"` del header, aria y foco (feature 78).
  Desviación del valor por defecto del líder («activado por clase o atributo del script»),
  revisable por el humano.
- **D2 — Envoltorio con `display: contents` fuera del modo hamburguesa**: en escritorio y
  sin JS los hijos del panel siguen siendo ítems flex del nav, con el mismo gap de 42 px,
  `margin-left: auto` del buscador y orden de tabulación que hoy (cero cambios a 1280).
- **D3 — Orden: enlaces arriba, buscador abajo** (orden DOM = visual = de foco, WCAG 2.4.3).
  Desviación del líder (buscador arriba): exigiría `order` en CSS y desincronizaría la
  tabulación. Revisable por el humano.
- **D4 — Reglas del modo** (todas dentro de la media query):
  - `.site-navbar nav`: `flex-wrap: nowrap; justify-content: space-between; padding-block: 0;`
    (selector con más especificidad, p. ej. `.site-navbar > nav`, o `header.site-navbar nav`,
    para ganar a layout.css y search-bar.css sin tocarlas).
  - Logo: `display: block` en el img si hace falta para REQ-79-11 (la regla vive en
    site-menu.css; REQ-77-06 cuenta la regla solo en layout.css).
  - `.site-menu__toggle`: `display: grid; place-items: center; width/height: 44px;` fondo
    transparente, borde `--color-border`, radio `--radius-pill`, color `--color-text`;
    `::before { content: "☰" }` y `[aria-expanded="true"]::before { content: "✕" }`.
  - `.site-menu`: `display: none` por defecto; con `.site-navbar[data-menu="open"]`:
    `display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0;`
    `padding: var(--gap-card) 2.5%; gap: …; background: var(--color-background);`
    `border-bottom: 1px solid var(--color-border-strong); max-height: calc(100dvh - var(--header-height)); overflow-y: auto;`
    El 2.5 % alinea el contenido con el nav (95 % de ancho). Enlaces `min-height: 44px`
    con `display: flex; align-items: center`. Buscador: hereda `.search-bar { flex: 1 1 100% }`
    e input al 100 % de search-bar.css.
  - Fondo opaco: un `backdrop-filter` dentro del header (que ya lo tiene) no difumina.
  - `:root { scroll-padding-top: var(--header-height); }` (`:root` gana a `html` de layout.css).
  - `@media (max-width: 768px) and (max-height: 500px) and (scripting: enabled)`:
    `header.site-navbar { position: relative; }` (REQ-51-04 lo deja static; relative sigue
    sin ser sticky y ancla el panel).
- **D5 — Sin animación del panel** (aparece con `display`): reduced motion no necesita
  regla propia; la red global de la 56 cubre el hover del botón.
- **D6 — Cierre al navegar**: el header viene nuevo en cada swap, cerrado por CSS; el
  script re-inicializa en `astro:after-swap` (antes de la captura de la view transition).
- **Verificación en navegador** (Chrome headless + CDP sobre `astro preview`): 375×812 y
  768×1024 (alto 65 ±1 cerrado y abierto, clic real y teclado Enter/Espacio, aria, foco,
  Tab con el menú cerrado, Escape, clic fuera, enlace → página nueva cerrada con muestreo
  por `requestAnimationFrame` del alto durante la navegación, resize a 1280, búsqueda en
  vivo y Escape coordinado, anclas), 1280×800 frente a la 77 (medidas tomadas antes del
  cambio), sin JS a 375 (`--blink-settings=scriptEnabled=false` o
  `Emulation.setScriptExecutionDisabled`, midiendo con `DOM.getBoxModel`; se documenta qué
  método hace que `scripting` no case), CSP (0 violaciones) y CLS en frío frente a la línea
  base. Capturas en progress/research/hamburger79/.
- Restricciones: sin dependencias, ≤100 líneas por archivo, estilos solo en src/styles,
  solo tokens, JS justificado por accesibilidad (feature 78), layout.css, search-bar.css y
  tokens.css intactos.

## Alternativa descartada

- `<details>/<summary>`: el contenido cerrado no se muestra en escritorio sin JS; obligaría a
  duplicar enlaces y `SearchBar` (root único `[data-search-bar]`), y Escape, clic fuera y
  cierre al navegar requieren JS de todos modos.
- `popover` + `popovertarget`: su Escape nativo cerraría el menú a la vez que search-escape
  limpia la búsqueda (habría que tocar la feature 6), `aria-expanded` no queda como atributo
  y arrastra estilos del top layer.
- Checkbox + `:checked`: semántica y anuncio de estado pobres.
- Activar el modo con un atributo puesto por el script: salto de layout en carga en frío (D1).
