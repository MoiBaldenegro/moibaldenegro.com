import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // REQ-35-01: base de las URL canónicas (Astro.site).
  site: 'https://moisesbaldenegro.com',
  output: 'server',

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