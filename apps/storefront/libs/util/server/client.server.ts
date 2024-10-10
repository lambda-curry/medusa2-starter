import Medusa from '@medusajs/js-sdk';
import { config } from './config.server';

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = 'http://localhost:9000';

if (process.env.INTERNAL_MEDUSA_API_URL) {
  MEDUSA_BACKEND_URL = process.env.INTERNAL_MEDUSA_API_URL;
}

const baseMedusaConfig = {
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === 'development',
  publishableKey: config.MEDUSA_PUBLISHABLE_KEY,
};

export const sdk = new Medusa({
  ...baseMedusaConfig,
});
