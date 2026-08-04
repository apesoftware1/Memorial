export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
  
  const body = `User-agent: *
Allow: /
Disallow: /product/
Disallow: /*?id=
Disallow: /services/
Disallow: /tombstones-on-special
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
