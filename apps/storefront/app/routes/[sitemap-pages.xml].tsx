import { PostType } from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import { defaultHeaders } from '@utils/defaultHeaders';
import { SitemapUrl, buildSitemapUrlSetXML } from '@utils/xml/sitemap-builder';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { posts } = await client.posts.list({
    fields: 'id,handle,updated_at',
    type: PostType.PAGE,
    limit: 999_999,
  });
  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;
  const urls: SitemapUrl[] = posts.map(({ handle, updated_at }) => ({
    loc: `${baseUrl}/${handle}`,
    lastmod: updated_at.toString(),
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
