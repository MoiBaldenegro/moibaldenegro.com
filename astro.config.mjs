import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // REQ-35-01: base de las URL canónicas (Astro.site).
  site: 'https://moibaldenegro.com',
  output: 'server',

  // REQ-45-04: 301 desde los slugs antiguos (espacio, ñ y prefijo 02) a los
  // slugs ASCII nuevos, para no romper enlaces ya compartidos.
  redirects: {
    '/posts/03-principios solid': { status: 301, destination: '/posts/03-principios-solid' },
    '/posts/01-diseño-detallado': { status: 301, destination: '/posts/01-diseno-detallado' },
    '/posts/02-ciclo-de-vida-y-arquitectura': { status: 301, destination: '/posts/04-ciclo-de-vida-y-arquitectura' },
  },

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