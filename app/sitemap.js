export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const now = new Date();

  const coreRoutes = ["", "/tombstones-for-sale", "/manufacturers", "/contact"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.7,
  }));

  const dynamicRoutes = [];

  try {
    const res = await fetch("https://typical-car-e0b66549b3.strapiapp.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query SitemapData {
            listings(pagination: { limit: -1 }) {
              documentId
              updatedAt
              isOnSpecial
              specials { active }
            }
            companies(pagination: { limit: -1 }) {
              documentId
              updatedAt
            }
          }
        `,
      }),
      // Use ISR with 1 hour revalidation instead of no-store to fix build error
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const listings = json?.data?.listings || [];
      const companies = json?.data?.companies || [];

      // Product detail pages
      for (const l of listings) {
        const id = l?.documentId;
        if (!id) continue;
        dynamicRoutes.push({
          url: `${baseUrl}/product/${id}`,
          lastModified: l?.updatedAt ? new Date(l.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
        // Specials detail pages
        const onSpecial = Boolean(l?.isOnSpecial) || Boolean(l?.specials?.[0]?.active);
        if (onSpecial) {
          dynamicRoutes.push({
            url: `${baseUrl}/tombstones-on-special/${id}`,
            lastModified: l?.updatedAt ? new Date(l.updatedAt) : now,
            changeFrequency: "daily",
            priority: 0.85,
          });
        }
      }

      // Manufacturer profile pages
      for (const c of companies) {
        const id = c?.documentId;
        if (!id) continue;
        dynamicRoutes.push({
          url: `${baseUrl}/manufacturers/manufacturers-Profile-Page/${id}`,
          lastModified: c?.updatedAt ? new Date(c.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }
    } else {
      console.warn("Sitemap: GraphQL response not OK", res.status);
    }
  } catch (e) {
    console.warn("Sitemap: Failed to fetch dynamic entries; using core routes only.", e);
  }

  return [...coreRoutes, ...dynamicRoutes];
}