import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Feature 85 (REQ-85-07..10): Geist y Geist Mono autoalojadas desde los woff2 del paquete geist
// (nunca sus módulos JS, que dependen de next/font). Se sirven con hash en /_astro/fonts/.
const GEIST = './node_modules/geist/dist/fonts/';
const fonts = [
  {
    provider: fontProviders.local(),
    name: 'Geist',
    cssVariable: '--font-geist-sans',
    display: 'swap',
    fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    options: {
      variants: [
        { src: [`${GEIST}geist-sans/Geist-Variable.woff2`], weight: '100 900', style: 'normal' },
        { src: [`${GEIST}geist-sans/Geist-Italic[wght].woff2`], weight: '100 900', style: 'italic' },
      ],
    },
  },
  {
    provider: fontProviders.local(),
    name: 'Geist Mono',
    cssVariable: '--font-geist-mono',
    display: 'swap',
    fallbacks: ['ui-monospace', 'monospace'],
    options: {
      variants: [{ src: [`${GEIST}geist-mono/GeistMono-Variable.woff2`], weight: '100 900', style: 'normal' }],
    },
  },
  // Feature 86 (REQ-86-01/02): solo la variante Circle (elección humana); Square/Grid/Triangle/Line no se emiten.
  {
    provider: fontProviders.local(),
    name: 'Geist Pixel',
    cssVariable: '--font-geist-pixel',
    display: 'swap',
    fallbacks: ['ui-monospace', 'monospace'],
    options: {
      variants: [{ src: [`${GEIST}geist-pixel/GeistPixel-Circle.woff2`], weight: '400', style: 'normal' }],
    },
  },
];

export default defineConfig({
  // REQ-35-01: base de las URL canónicas (Astro.site).
  site: 'https://moisesbaldenegro.com',
  output: 'server',
  fonts,

  // Las 301 de los slugs antiguos (feature 45) viven en src/middleware.ts (feature 68):
  // la clave de redirecciones aquí generaba un dist/client/_redirects inválido para Cloudflare.

  env: {
    schema: {
      IN_MAINTENANCE: envField.boolean({
        access: 'public',
        context: 'client',
      }),
      HTB_API_TOKEN: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
      HTB_USER_ID: envField.string({
        access: 'secret',
        context: 'server',
        optional: true,
      }),
    },
  },

  adapter: cloudflare({
    imageService: 'cloudflare',
    prerenderEnvironment: 'workerd',
  }),

  vite: {
    // Feature 72 (REQ-72-24): conservar los avisos @license (GSAP, licencia Standard
    // "no charge" de Webflow, prohíbe retirarlos) al minificar los chunks del cliente.
    build: {
      rolldownOptions: { output: { comments: { legal: true } } },
      // Feature 74 (REQ-74-01): los scripts de componentes Astro nunca se incrustan inline. Si el último
      // <script type="module"> de una página es inline, el ClientRouter inserta un script src=data: que la
      // CSP obligatoria (REQ-64-11) bloquea; como chunk externo lo permite 'self'. El resto de assets
      // conserva el límite por defecto (undefined).
      assetsInlineLimit: (filePath) => (/astro_type_script|[?&]type=script/.test(filePath) ? false : undefined),
    },
    optimizeDeps: {
      include: ['astro/assets/services/noop'],
    },
    server: {
      watch: {
        // Ignorar la carpeta de caché de Vite para evitar loops de recarga en Windows
        ignored: ['**/.vite/**'],
      },
    },
  },
});