import { getCommonMeta, mergeMeta } from '@libs/util/meta';
import { getRootLoader } from '@libs/util/server/root.server';
import { useRef } from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
  useLocation,
  useRouteError,
} from 'react-router';
import { MetaFunction } from 'react-router';
import { Page } from './components/layout/Page';
import { RootProviders } from './providers/root-providers';

import '@app/styles/global.css';
import { useRootLoaderData } from './hooks/useRootLoaderData';

export const getRootMeta: MetaFunction = ({ data }) => {
  const title = 'Chef Velez';
  const description =
    'Private chef experiences in Park City, Salt Lake City, and surrounding areas: cooking classes, plated dinners, and buffet-style events.';
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
  const { pathname } = useLocation();

  const { env = {}, siteDetails } = data || {};

  return (
    <RootProviders>
      <html lang="en" className="min-h-screen scroll-smooth">
        <head ref={headRef}>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <Meta />
          <link rel="canonical" href={`https://chefvelez.com${pathname}`} />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Italiana&display=swap" rel="stylesheet" />

          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Ballet:opsz@16..72&display=swap" rel="stylesheet" />

          <link href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap" rel="stylesheet" />

          <link href="https://fonts.googleapis.com/css2?family=Aboreto&display=swap" rel="stylesheet" />
          <Links />
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

  console.error('error boundary error', error);

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
      </head>
      <body>
        <Scripts />
      </body>
    </html>
  );
}
