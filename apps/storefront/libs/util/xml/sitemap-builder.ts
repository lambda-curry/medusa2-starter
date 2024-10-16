export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export const buildSitemapUrlSetXML = (urls: SitemapUrl[]) =>
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map((url) => buildSiteMapUrlXML(url)).join('\n')}
    </urlset>
`;

export const buildSiteMapUrlXML = (url: SitemapUrl) =>
  `<url>
<loc>${url.loc}</loc>
${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
${url.priority ? `<priority>${url.priority}</priority>` : ''}
</url>
`;
