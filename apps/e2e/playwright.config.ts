import { type ReporterDescription, defineConfig, devices } from '@playwright/test';

const reporters: ReporterDescription[] = process.env.CI
  ? [['list']]
  : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]];

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: reporters,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.E2E_STOREFRONT_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
