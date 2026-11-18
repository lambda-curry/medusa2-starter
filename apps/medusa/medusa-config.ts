import { unlock } from '@unlockable/vite-plugin-unlock';
import { medusa as unlockMedusa } from '@unlockable/vite-plugin-unlock/medusa';
import { defineConfig, loadEnv } from '@medusajs/framework/utils';
import type { Integration } from '@sentry/types';
import type * as SentryNode from '@sentry/node';
import type * as TracingTypes from '@sentry/tracing';
import type { Router } from 'express';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const REDIS_URL = process.env.REDIS_URL;
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const REFUND_APPLICATION_FEE = process.env.REFUND_APPLICATION_FEE === 'true';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID;
const STRIPE_CONNECT_OAUTH_REDIRECT_URI = process.env.STRIPE_CONNECT_OAUTH_REDIRECT_URI;
const STRIPE_CONNECT_STATE_SECRET = process.env.STRIPE_CONNECT_STATE_SECRET;
const MEDUSA_ADMIN_URL = process.env.MEDUSA_ADMIN_URL || process.env.ADMIN_BACKEND_URL || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';
// const SENTRY_API_TOKEN = process.env.SENTRY_API_TOKEN || ""; // Only needed for webhooks
const IS_TEST = process.env.NODE_ENV === 'test';
const IS_DEV = process.env.NODE_ENV === 'development';
const GOOGLE_CALENDAR_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const GOOGLE_CALENDAR_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
const GOOGLE_CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
const GOOGLE_CALENDAR_WEBHOOK_URL = process.env.GOOGLE_CALENDAR_WEBHOOK_URL;
const GOOGLE_CALENDAR_SCOPE = process.env.GOOGLE_CALENDAR_SCOPE;
const GOOGLE_CALENDAR_SIGNING_SECRET = process.env.GOOGLE_CALENDAR_SIGNING_SECRET;
const GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY =
  process.env.GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY;
const GOOGLE_CALENDAR_DEFAULT_TIMEZONE =
  process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE;

const customModules = [
  {
    resolve: './src/modules/menu',
    options: {},
  },
  {
    resolve: './src/modules/chef-event',
    options: {},
  },
  {
    resolve: './src/modules/experience-type',
    options: {},
  },
  {
    resolve: './src/modules/social-gallery',
    options: {},
  },
  {
    resolve: './src/modules/stripe-connect-account',
    options: {
      stripeApiKey: STRIPE_API_KEY,
      adminUrl: MEDUSA_ADMIN_URL,
      connectClientId: STRIPE_CONNECT_CLIENT_ID,
      oauthRedirectUri: STRIPE_CONNECT_OAUTH_REDIRECT_URI,
      oauthStateSecret: STRIPE_CONNECT_STATE_SECRET,
    },
  },
  {
    resolve: './src/modules/google-calendar-connection',
    options: {
      clientId: GOOGLE_CALENDAR_CLIENT_ID,
      clientSecret: GOOGLE_CALENDAR_CLIENT_SECRET,
      redirectUri: GOOGLE_CALENDAR_REDIRECT_URI,
      webhookUrl: GOOGLE_CALENDAR_WEBHOOK_URL,
      scope: GOOGLE_CALENDAR_SCOPE,
      signingSecret: GOOGLE_CALENDAR_SIGNING_SECRET,
      tokenEncryptionKey: GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY,
      defaultTimezone: GOOGLE_CALENDAR_DEFAULT_TIMEZONE,
    },
  },
];

// Temporarily use in-memory modules to avoid Redis authentication issues
const cacheModule = IS_TEST
  ? { resolve: '@medusajs/medusa/cache-inmemory' }
  : {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    };

const eventBusModule = IS_TEST
  ? { resolve: '@medusajs/medusa/event-bus-local' }
  : {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: REDIS_URL,
      },
    };

const workflowEngineModule = IS_TEST
  ? { resolve: '@medusajs/medusa/workflow-engine-inmemory' }
  : {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        },
      },
    };

const notificationModule = {
  resolve: '@medusajs/medusa/notification',
  options: {
    providers: [
      {
        resolve: './src/modules/resend',
        id: 'resend',
        options: {
          channels: ['email'],
          capture_dir: process.env.PREVIEW_MODE === 'true' ? process.env.PREVIEW_EMAIL_DIR : undefined,
          api_key: process.env.RESEND_API_KEY,
          from: process.env.RESEND_FROM_EMAIL,
        },
      },
    ],
  },
};

// Allow switching file storage between local and S3 via env
// FILE_PROVIDER=local | s3 (default: s3)
const FILE_PROVIDER = (process.env.FILE_PROVIDER || 's3').toLowerCase();
const fileModule =
  FILE_PROVIDER === 'local'
    ? {
        resolve: '@medusajs/medusa/file',
        options: {
          providers: [
            {
              resolve: '@medusajs/medusa/file-local',
              id: 'local',
              options: { backend_url: process.env.FILE_LOCAL_BACKEND_URL },
            },
          ],
        },
      }
    : {
        resolve: '@medusajs/medusa/file',
        options: {
          providers: [
            {
              resolve: './src/modules/file-b2',
              id: 'b2-s3',
              options: {
                file_url: process.env.S3_FILE_URL,
                endpoint: process.env.S3_ENDPOINT,
                bucket: process.env.S3_BUCKET,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                region: process.env.S3_REGION,
                additional_client_config: {
                  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
                },
              },
            },
          ],
        },
      };

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false,
    },
    redisUrl: REDIS_URL,
    redisPrefix: process.env.REDIS_PREFIX,
    // ADD WORKER MODE CONFIGURATION
    workerMode: process.env.MEDUSA_WORKER_MODE as 'shared' | 'worker' | 'server',
    http: {
      storeCors: process.env.STORE_CORS || '',
      adminCors: process.env.ADMIN_CORS || '',
      authCors: process.env.AUTH_CORS || '',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  // Using Sentry via OpenTelemetry instrumentation and custom error handler.
  // Keep plugins empty to avoid double-instrumentation with medusa-plugin-sentry.
  plugins: [],
  modules: [
    ...customModules,
    {
      resolve: '@medusajs/medusa/payment',
      dependencies: ['stripeConnectAccountModuleService', 'cart'],
      options: {
        providers: [
          {
            resolve: './src/modules/stripe-connect',
            id: 'stripe-connect',
            options: {
              apiKey: STRIPE_API_KEY,
              refundApplicationFee: REFUND_APPLICATION_FEE,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    cacheModule,
    eventBusModule,
    workflowEngineModule,
    notificationModule,
    fileModule,
  ],
  admin: {
    // ADD ADMIN DISABLE CONFIGURATION
    disable: false,
    backendUrl: process.env.ADMIN_BACKEND_URL,
    vite: () => ({
      plugins: [
        unlock(
          unlockMedusa({
            overrides: './src/admin/overrides',
            debug: IS_DEV,
          }),
        ),
      ],
    }),
  },
});
