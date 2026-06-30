import { reactRouter } from '@react-router/dev/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';
// import { remixDevTools } from 'remix-development-tools';

export default defineConfig({
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
  plugins: [reactRouter(), vanillaExtractPlugin()],
  build: {},
});
