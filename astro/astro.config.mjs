import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: netlify({
    mode: 'static'
  }),
  
  site: 'https://indxone.com',
  
  // Image optimization
  image: {
    service: {
      entrypoint: '@astrojs/sharp',
      config: {
        // Sharp is the default image service
      }
    },
    domains: {
      // Allow images from these domains
      'indxone.com': true,
      'hub.indxone.com': true,
      'mairies.indxone.com': true
    }
  },
  
  // Markdown configuration
  markdown: {
    shikiConfig: { theme: 'github-dark' }
  },
  
  // Server configuration for dev
  server: {
    port: 8000,
    host: true
  },
  
  // Build configuration
  build: {
    assets: 'public',
    format: 'directory'
  },
  
  // Integrations
  integrations: [
    // Add integrations here
  ]
});
