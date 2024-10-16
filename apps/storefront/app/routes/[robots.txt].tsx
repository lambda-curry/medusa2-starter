import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = ({ request }: LoaderFunctionArgs) => {
  const host = request.headers.get('host');
  const baseUrl = `https://${host}`;
  const robotText = `
User-agent: *
Disallow: /orders
Disallow: /orders/
Disallow: /checkout
Disallow: /checkout/
Disallow: /preview/
Disallow: /api/
Disallow: /_auth/
Sitemap: ${baseUrl}/sitemap.xml
        `;
  return new Response(robotText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
