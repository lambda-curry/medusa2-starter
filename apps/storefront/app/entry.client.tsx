import { registerChunkReloadHandler } from '@libs/util/chunk-reload.client';
import * as Sentry from '@sentry/react-router';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

registerChunkReloadHandler();

declare global {
  interface Window {
    ENV: any;
  }
}

const hydrate = () => {
  // Init inside the idle-scheduled callback, before hydrateRoot, so Sentry stays off the
  // blocking pre-hydration path but still captures hydration errors.
  if (window?.ENV?.SENTRY_DSN)
    Sentry.init({
      dsn: window?.ENV?.SENTRY_DSN,
      environment: window?.ENV?.SENTRY_ENVIRONMENT,
      integrations: [],
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
