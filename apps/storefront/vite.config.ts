import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import tsconfigPaths from "vite-tsconfig-paths"
import { remixDevTools } from "remix-development-tools"
import commonjs from "vite-plugin-commonjs"

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true
  }
}

export default defineConfig({
  server: {
    port: 3000,
    warmup: {
      clientFiles: [
        "./app/entry.client.tsx",
        "./app/root.tsx",
        "./app/routes/**/*",
      ],
    },
  },
  plugins: [
    commonjs(),
    remixDevTools(),
    remix({
      future: {
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths({ root: "./" }),
    vanillaExtractPlugin(),
  ],
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    include: ["@medusajs/js-sdk"],
  },
})
