import medusa from '@medusajs/eslint-plugin';
import { defineConfig } from 'eslint/config';

// The Medusa app has its own stricter config in apps/medusa/eslint.config.ts.
export default defineConfig([{ ignores: ['.yarn/**', 'apps/e2e/**'] }, ...medusa.configs.recommended]);
