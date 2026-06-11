export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
  
  // Added the two Disallow lines to clean up the ghost URLs
  const body = `User-agent: *
Allow: /
Disallow: /product/
Disallow: /*?id=
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}