import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',

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
    prerenderEnvironment: 'node',
  }),

  vite: {
    optimizeDeps: {
      include: ['astro/assets/services/noop'],
      disabled: false,
    },
    server: {
      watch: {
        // Ignorar la carpeta de caché de Vite para evitar loops de recarga en Windows
        ignored: ['**/.vite/**'],
      },
    },
  },
});