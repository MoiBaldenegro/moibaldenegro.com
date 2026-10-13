# Diseño — feature 88 hero-profile-mask

## Contexto visual

- Tarjeta de perfil del hero de la portada (`new-hero.astro`, `profile-card.css`).
- Estado actual: la foto termina en un borde duro sobre `--color-surface` con un overlay oscuro encima.
- Estado deseado (captura de referencia del humano): la foto se desvanece hacia abajo con una máscara hasta fundirse con el fondo de la tarjeta; la píldora del handle queda nítida (fuera de la máscara) en tipografía mono; el nombre y la descripción quedan debajo sin corte visible.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface` | #101018 | Color opaco del gradiente de la máscara (en una máscara solo cuenta el alfa) |
| `--font-mono` | Geist Mono | Texto de la píldora `.profile-username` |

## Decisiones y constraints

- Decisión 1: la máscara va en `.profile-image img`, no en `.profile-image`, para que la píldora del handle no se desvanezca.
- Decisión 2: se elimina `.profile-overlay`; con la máscara el fondo de la tarjeta ya hace el degradado.
- Decisión 3: el texto se ajusta al CV en `src/data/hero.json` (headline y skills de `about.json`); no se toca el marcado del texto ni los tamaños de la imagen (REQ-69-08).
- Decisión 4 (ampliación «que se vea completa la foto»): en escritorio la img usa su proporción real (952 / 960) sin scale y .profile-image va en absolute arriba de la tarjeta; .profile-content se alinea abajo y queda sobre la parte desvanecida. En <=1200 px .profile-image vuelve al flujo (relative) con las proporciones de la feature 69.
- Decisión 5: la píldora pasa a .profile-content, encima del h1, para no chocar con el nombre ahora que el texto se superpone a la foto.
- Restricciones: estático, sin dependencias, ≤100 líneas, estilos separados, solo tokens.

## Alternativa descartada

- Alternativa considerada: leer el headline de `about.json` directamente en el hero.
- Motivo del descarte: duplicaría el titular en /about (que ya pinta headline y usa la descripción como «enfoque»).
