import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { HeadersFunction, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { SitemapUrl, buildSitemapUrlSetXML } from '@utils/xml/sitemap-builder';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { vendors } = await client.vendors.list({
    limit: 999_999,
  });

  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const urls: SitemapUrl[] = vendors.map(({ handle, updated_at }) => ({
    loc: `${baseUrl}/vendors/${handle}`,
    lastmod: updated_at?.toString(),
    priority: 0.6,
    changefreq: 'weekly',
  }));

  const content = buildSitemapUrlSetXML(urls);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
