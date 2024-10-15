import { SitemapUrl, buildSitemapUrlSetXML } from '@libs/util/xml/sitemap-builder';
import { LoaderFunctionArgs } from '@remix-run/node';

const pages = ['/', '/products'];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;
  const urls: SitemapUrl[] = pages.map((handle) => ({
    loc: `${baseUrl}/${handle}`,
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
