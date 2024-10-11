const { loadEnv, defineConfig, Modules } = require('@medusajs/framework/utils');

loadEnv(process.env.NODE_ENV, process.cwd());

const REDIS_URL = process.env.REDIS_URL;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false,
    },
    redisUrl: REDIS_URL,
    redisPrefix: process.env.REDIS_PREFIX,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: {
    [Modules.PAYMENT]: {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
    [Modules.EVENT_BUS]: {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        },
      },
    },
  },
  admin: {
    backendUrl: process.env.ADMIN_BACKEND_URL || 'http://localhost:9000',
    vite: () => ({
      css: {
        postcss: [], // TODO: required to avoid issue, check if it can be removed after v2 is released
      },
    }),
  },
});
