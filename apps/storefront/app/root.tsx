import { InnerHtml } from '~/components/html/InnerHTML';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { useRef } from 'react';
import { Page } from './components/layout/Page';
import { RootProviders } from './providers/root-providers';
import { getProxySrc, imageProxyURL } from '@utils/img-proxy';
import { SiteDetailsRootData } from '@libs/util/medusa';
import { MetaFunction } from '@remix-run/node';
import { getCommonMeta, mergeMeta } from '@libs/util/meta';
import { getRootLoader } from '@libs/util/server/root.server';

import inlineGlobalCss from '~/styles/global.css?inline';

export const getRootMeta: MetaFunction = ({ data }) => {
  const siteDetails = (data as any)?.siteDetails as SiteDetailsRootData;

  if (!siteDetails) return [];

  const title = siteDetails.store.name || 'MarketHaus Store';
  const description = siteDetails?.site_settings?.description;
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = getProxySrc(siteDetails.store.logo?.url);
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

export const meta: MetaFunction<typeof loader> = mergeMeta(
  getCommonMeta,
  getRootMeta
);

export const loader = getRootLoader;

function App() {
  const headRef = useRef<HTMLHeadElement>(null);
  const { siteDetails, globalCSS, env, cart, fontLinks } =
    useLoaderData<typeof getRootLoader>();

  return (
    <RootProviders>
      <html lang="en" className="min-h-screen">
        <head ref={headRef}>
          <meta charSet="UTF-8" />
          <Meta />

          {fontLinks.map(fontLink => (
            <link key={fontLink} rel="stylesheet" href={fontLink} />
          ))}
          <Links />
          {siteDetails.site_settings.favicon && (
            <link
              rel="icon"
              type="image/png"
              href={imageProxyURL(siteDetails.site_settings.favicon.url, {
                context: 'small_square',
              })}
            />
          )}
          <style dangerouslySetInnerHTML={{ __html: inlineGlobalCss }} />

          {globalCSS && (
            <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
          )}

          {siteDetails.site_settings.description && (
            <meta
              name="description"
              content={siteDetails.site_settings.description}
            />
          )}
          <InnerHtml
            header
            html={siteDetails.site_settings.header_code ?? ''}
          />

          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${
              env.GOOGLE_ANALYTICS_ID ?? ''
            }`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          gtag('config', '${env.GOOGLE_ANALYTICS_ID}'${
                env.NODE_ENV === 'development' ? ", {'debug_mode': true}" : ''
              });
            ${
              siteDetails.site_settings.ga_property_id
                ? `gtag('config', '${siteDetails.site_settings.ga_property_id}')`
                : ''
            }`,
            }}
          />
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
          {siteDetails.site_settings.footer_code && (
            <div
              dangerouslySetInnerHTML={{
                __html: siteDetails.site_settings.footer_code,
              }}
            />
          )}
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
