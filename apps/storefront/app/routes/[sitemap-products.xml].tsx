import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import { defaultHeaders } from '@utils/defaultHeaders';
import { SitemapUrl, buildSitemapUrlSetXML } from '@utils/xml/sitemap-builder';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { products } = await client.products.list({
    expand: '',
    fields: 'id,handle,updated_at',
    order: 'updated_at',
    limit: 999_999,
  });

  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const urls: SitemapUrl[] = products.map(({ handle, updated_at }) => ({
    loc: `${baseUrl}/products/${handle}`,
    lastmod: updated_at?.toString(),
    priority: 0.8,
    changefreq: 'daily',
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
