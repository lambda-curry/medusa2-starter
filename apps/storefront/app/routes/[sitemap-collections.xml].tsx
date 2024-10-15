import { sdk } from '@libs/util/server/client.server';
import { buildSitemapUrlSetXML, SitemapUrl } from '@libs/util/xml/sitemap-builder';
import { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { collections } = await sdk.store.collection.list({
    limit: 1000,
  });

  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const collectionUrls: SitemapUrl[] = collections.map(({ handle, updated_at }) => ({
    loc: `${baseUrl}/collections/${handle}`,
    lastmod: updated_at.toString(),
    priority: 0.8,
    changefreq: 'weekly',
  }));

  const content = buildSitemapUrlSetXML(collectionUrls);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
