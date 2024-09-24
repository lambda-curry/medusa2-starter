import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import { defaultHeaders } from '@utils/defaultHeaders';
import { fetchFilterOptions } from '@marketplace/util/filter-options';
import { SitemapUrl, buildSitemapUrlSetXML } from '@utils/xml/sitemap-builder';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { collections, tags } = await fetchFilterOptions(client);
  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const collectionUrls: SitemapUrl[] = collections.map(
    ({ handle, updated_at }) => ({
      loc: `${baseUrl}/collections/${handle}`,
      lastmod: updated_at.toString(),
      priority: 0.8,
      changefreq: 'weekly',
    })
  );

  const tagUrls: SitemapUrl[] = tags.map(({ id, value, updated_at }) => ({
    loc: `${baseUrl}/products/tags/${value}/${id}`,
    lastmod: updated_at.toString(),
    priority: 0.8,
    changefreq: 'weekly',
  }));

  const content = buildSitemapUrlSetXML([...collectionUrls, ...tagUrls]);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
