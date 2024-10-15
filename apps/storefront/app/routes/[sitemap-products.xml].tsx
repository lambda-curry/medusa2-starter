import { sdk } from '@libs/util/server/client.server';
import { buildSitemapUrlSetXML, SitemapUrl } from '@libs/util/xml/sitemap-builder';
import { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { products } = await sdk.store.product.list({
    limit: 1000,
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
