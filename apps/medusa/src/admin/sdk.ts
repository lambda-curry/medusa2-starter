import { PageBuilderSDK } from '@lambdacurry/page-builder-sdk';

declare const __BACKEND_URL__: string | undefined;

export const backendUrl = __BACKEND_URL__ ?? 'http://localhost:9000';

export const sdk = new PageBuilderSDK({
  baseUrl: backendUrl,
  auth: {
    type: 'session',
  },
});
