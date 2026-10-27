import { getCommonMeta, mergeMeta } from '@libs/util/meta';
import { getRootLoader } from '@libs/util/server/root.server';
import { useRef } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { Page } from './components/layout/Page';
import { RootProviders } from './providers/root-providers';

import '@app/styles/global.css';
import { useRootLoaderData } from './hooks/useRootLoaderData';

export const getRootMeta: MetaFunction = () => {
  const title = 'Barrio Store';
  const description = 'Discover our artisan-roasted coffee, crafted with care and delivered to your door.';
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = '';
  const ogImageAlt = !!ogImage ? `${ogTitle} logo` : undefined;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: ogImageAlt },
  ];
};

export const meta: MetaFunction<typeof loader> = mergeMeta(getCommonMeta, getRootMeta);

export const loader = getRootLoader;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  currentParams,
  currentUrl,
  defaultShouldRevalidate,
  formAction,
  formData,
  formEncType,
  formMethod,
  nextParams,
  nextUrl,
}) => {
  if (nextUrl.pathname.startsWith('/checkout/success')) return true;
  if (!formMethod || formMethod === 'GET') return false;

  return defaultShouldRevalidate;
};

function App() {
  const headRef = useRef<HTMLHeadElement>(null);
  const data = useRootLoaderData();

  const { env = {}, siteDetails } = data || {};

  return (
    <RootProviders>
      <html lang="en" className="min-h-screen">
        <head ref={headRef}>
          <meta charSet="UTF-8" />
          <Meta />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Italiana&display=swap" rel="stylesheet" />

          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Ballet:opsz@16..72&display=swap" rel="stylesheet" />

          <link href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap" rel="stylesheet" />

          <link href="https://fonts.googleapis.com/css2?family=Aboreto&display=swap" rel="stylesheet" />
          <Links />
          {siteDetails?.settings?.description && <meta name="description" content={siteDetails.settings.description} />}
        </head>
        <body className="min-h-screen">
          <Page>
            <Outlet />
          </Page>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(env)}`,
            }}
          />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </RootProviders>
  );
}

export default App;

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  console.error('error boundary error', error);

  return (
    <html lang="en" className="min-h-screen">
      <head>
        <meta charSet="UTF-8" />
        {/* No <Meta />: it would add the root route's title next to this one. */}
        <title>{notFound ? 'Page not found' : 'Something went wrong'}</title>
        <Links />
      </head>
      <body className="flex min-h-screen items-center justify-center p-6">
        <main className="max-w-md text-center">
          <h1 className="text-3xl font-bold">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
          <p className="mt-4 text-gray-600">
            {notFound
              ? "We couldn't find the page you're looking for."
              : 'Sorry, we hit an unexpected error. Please try again.'}
          </p>
          {/* A plain link forces a full page load, which resets the broken client state. */}
          <a href="/" className="mt-8 inline-block rounded bg-gray-900 px-6 py-3 font-bold text-white">
            Back to home
          </a>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
