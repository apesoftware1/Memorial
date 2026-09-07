export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";

  const body = `User-agent: *
Allow: /

# Allow service sub-sections that are published content hubs
Allow: /services/*/insights
Allow: /services/*/guides
Allow: /services/*/blogs
Allow: /services/*/insights/
Allow: /services/*/guides/
Allow: /services/*/blogs/
Allow: /services/*insights*
Allow: /services/*guides*
Allow: /services/*blogs*
Allow: /services/insights
Allow: /services/guides
Allow: /services/blogs
Allow: /services/insights/
Allow: /services/guides/
Allow: /services/blogs/

# Blocked routes (non-indexable internals or legacy redirect-only)
Disallow: /api/
Disallow: /product/
Disallow: /*?id=
Disallow: /regan-dashboard/
Disallow: /manufacturers/manufacturers-Profile-Page/
Disallow: /tombstones-on-special

# Default disallow on /services overrides allowed prefixes above
Disallow: /services/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
