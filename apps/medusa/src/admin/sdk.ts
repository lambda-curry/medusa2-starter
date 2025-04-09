import { MarketHausSDK } from '@markethaus/sdk';

declare const __BACKEND_URL__: string | undefined;

export const backendUrl = __BACKEND_URL__ ?? 'http://localhost:9000';

export const sdk = new MarketHausSDK({
  baseUrl: backendUrl,
  auth: {
    type: 'session',
  },
});
