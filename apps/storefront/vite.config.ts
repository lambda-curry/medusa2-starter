import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
// import { remixDevTools } from 'remix-development-tools';

export default defineConfig({
  // Sentry tree-shaking flags. Valid only while entry.client.tsx initializes Sentry with
  // integrations: [] and no tracing. Remove these defines if tracing is turned on.
  define: {
    __SENTRY_DEBUG__: 'false',
    __SENTRY_TRACING__: 'false',
  },
  server: {
    port: 3000,
    warmup: {
      clientFiles: ['./app/entry.client.tsx', './app/root.tsx', './app/routes/**/*'],
    },
  },
  ssr: {
    noExternal: ['@medusajs/js-sdk', '@lambdacurry/medusa-plugins-sdk'],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [reactRouter()],
  build: {},
});
