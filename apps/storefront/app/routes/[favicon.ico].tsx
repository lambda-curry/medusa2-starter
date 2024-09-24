import { HeadersFunction, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { imageProxyURL } from '@utils/img-proxy';
import { defaultHeaders } from '@utils/defaultHeaders';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { site_settings } = await client.siteSettings.retrieve();

  return redirect(
    site_settings.favicon?.url
      ? imageProxyURL(site_settings.favicon?.url, { context: 'tiny_square' })
      : '/assets/markethaus.png',
    { status: 302 }
  );
};
