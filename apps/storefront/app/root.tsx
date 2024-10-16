import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from '@remix-run/react';
import { useRef } from 'react';
import { Page } from './components/layout/Page';
import { RootProviders } from './providers/root-providers';
import { MetaFunction } from '@remix-run/node';
import { getCommonMeta, mergeMeta } from '@libs/util/meta';
import { getRootLoader } from '@libs/util/server/root.server';

import '@app/styles/global.css';
import { useRootLoaderData } from './hooks/useRootLoaderData';

export const getRootMeta: MetaFunction = ({ data }) => {
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

  console.error('error boundary error', error);

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Scripts />
      </body>
    </html>
  );
}
