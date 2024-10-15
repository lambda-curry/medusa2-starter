import { SitemapUrl } from '@libs/util/xml/sitemap-builder';
import { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;

  const urls: SitemapUrl[] = [
    { loc: `${baseUrl}/sitemap-products.xml` },
    { loc: `${baseUrl}/sitemap-collections.xml` },
    { loc: `${baseUrl}/sitemap-pages.xml` },
  ];

  const content = `
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc }) => `<sitemap><loc>${loc}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  });
};
