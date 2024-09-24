import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { fetchFontCss } from '@marketplace/util/server/root.server';
import { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const medusa = await createMedusaClient({ request });
  const { site_settings } = await medusa.siteSettings.retrieve();
  const css = await fetchFontCss(site_settings);

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css'
    }
  });
};
