// https://github.com/remix-run/remix/issues/2947

import { RemixBrowser } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

declare global {
  interface Window {
    ENV: any;
  }
}

if (window?.ENV?.SENTRY_DSN)
  Sentry.init({
    dsn: window?.ENV?.SENTRY_DSN,
    environment: window?.ENV?.SENTRY_ENVIRONMENT,
    integrations: [],
  });

const hydrate = () =>
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    );
  });

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
