# Requisitos — feature 113 purple-to-logo-tone

# Petición humana (2026-10-20): los colores morados del sitio se igualan al tono del logotipo (#6C387A muestreado de public/assets/mxvi_logo.webp) y se cambian todos los tokens morados.

## Requisitos

REQ-113-01 El token --color-accent SHALL valer #B37AC2 en src/styles/tokens.css.
REQ-113-02 El token --color-accent-hover SHALL valer #C396CF en src/styles/tokens.css.
REQ-113-03 Los tokens --color-hero-top y --color-hero-mid SHALL valer #3C1F44 y #150A18 en src/styles/tokens.css.
REQ-113-04 El token --color-glow SHALL valer rgba(108, 56, 122, 0.35) en src/styles/tokens.css.
REQ-113-05 Los tokens --color-scrollbar-thumb y --color-marca-css SHALL valer #6C387A en src/styles/tokens.css.
REQ-113-06 IF un color del código de la app en src/ tiene hue entre 250 y 330 grados y saturación de al menos 15 %, THEN ese color SHALL tener hue 287 más o menos 2 grados, WHERE el código es src/styles o src/components o src/layouts o src/pages o src/domain o src/data.
REQ-113-07 El texto de .skip-link SHALL usar var(--color-background) sobre el fondo var(--color-accent).
REQ-113-08 El acento y el acento hover SHALL alcanzar un contraste de al menos 4,5:1 frente a --color-background y --color-surface.
REQ-113-09 El contorno de foco visible SHALL alcanzar un contraste de al menos 3:1 frente a --color-background, --color-surface y --color-hero-top.
REQ-113-10 El token --color-marca-css SHALL alcanzar un contraste de al menos 4,5:1 frente a #ffffff.
REQ-113-11 El archivo src/styles/tokens.css SHALL conservar 99 líneas sin tokens nuevos.
REQ-113-12 Los tokens azul marino de hue 240 grados SHALL conservar sus valores actuales, WHERE el token es --color-background, --color-surface, --color-hero-bottom, --color-navbar, --color-scrollbar-track o --color-text-secondary.
REQ-113-13 El HTML de la portada dist/client/index.html SHALL pesar menos de 42 000 B.
