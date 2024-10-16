import { loadEnv } from './env';

loadEnv();

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  ENVIRONMENT: process.env.ENVIRONMENT,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  PUBLIC_MEDUSA_API_URL: process.env.PUBLIC_MEDUSA_API_URL,
  STOREFRONT_URL: process.env.STOREFRONT_URL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  EVENT_LOGGING: process.env.EVENT_LOGGING,
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME ?? '_medusa_jwt',
  MEDUSA_PUBLISHABLE_KEY: process.env.MEDUSA_PUBLISHABLE_KEY,
};
