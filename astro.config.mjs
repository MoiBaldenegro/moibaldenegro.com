// @ts-check
import { defineConfig, envField } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',

  env: {
      schema:{
          IN_MAINTENANCE: envField.boolean({
          access: 'public',
          context: 'client',
          }),
          HTB_API_TOKEN: envField.string({
              access: 'secret',
              context: 'server',
          }),
          HTB_USER_ID: envField.string({
              access: 'secret',
              context: 'server',
          }),
      },

  },

  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
});

