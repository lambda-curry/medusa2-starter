import medusa from '@medusajs/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // `strict` adds type-aware rules, so skip files that tsconfig.json excludes.
  { ignores: ['eslint.config.ts'] },
  ...medusa.configs.strict,
]);
