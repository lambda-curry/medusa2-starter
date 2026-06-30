import medusa from '@medusajs/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([...medusa.configs.recommended]);
