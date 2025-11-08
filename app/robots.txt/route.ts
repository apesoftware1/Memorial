export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const body = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}