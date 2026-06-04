export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
  const now = new Date();

  const coreRoutes = ["", "/tombstones-for-sale", "/manufacturers", "/contact"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.7,
  }));

  const dynamicRoutes = [];

  try {
    const graphQlUrl =
      process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
      `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;
    const res = await fetch(graphQlUrl, {
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
            listingSearchLocationOptions {
              province
              cities {
                city
              }
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
      const locationOptions = json?.data?.listingSearchLocationOptions || [];

      // Listing detail pages (canonical)
      for (const l of listings) {
        const documentId = l?.documentId;
        if (!documentId) continue;
        dynamicRoutes.push({
          url: `${baseUrl}/tombstones-for-sale/${documentId}`,
          lastModified: l?.updatedAt ? new Date(l.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
        // Specials detail pages
        const onSpecial = Boolean(l?.isOnSpecial) || Boolean(l?.specials?.[0]?.active);
        if (onSpecial) {
          dynamicRoutes.push({
            url: `${baseUrl}/tombstones-on-special/${documentId}`,
            lastModified: l?.updatedAt ? new Date(l.updatedAt) : now,
            changeFrequency: "daily",
            priority: 0.85,
          });
        }
      }

      // Manufacturer profile pages
      for (const c of companies) {
        const documentId = c?.documentId;
        if (!documentId) continue;
        dynamicRoutes.push({
          url: `${baseUrl}/manufacturers/manufacturers-Profile-Page/${documentId}`,
          lastModified: c?.updatedAt ? new Date(c.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }

      const toSlug = (value) => {
        const base = typeof value === "string" ? value.trim().toLowerCase() : "";
        if (!base) return "";
        return base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      };
      const seen = new Set();
      for (const prov of Array.isArray(locationOptions) ? locationOptions : []) {
        const provinceName = prov?.province;
        const provinceSlug = toSlug(provinceName);
        if (provinceSlug && !seen.has(provinceSlug)) {
          seen.add(provinceSlug);
          dynamicRoutes.push({
            url: `${baseUrl}/tombstones/${provinceSlug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }

        const cities = Array.isArray(prov?.cities) ? prov.cities : [];
        for (const c of cities) {
          const cityName = c?.city;
          const citySlug = toSlug(cityName);
          if (citySlug && !seen.has(citySlug)) {
            seen.add(citySlug);
            dynamicRoutes.push({
              url: `${baseUrl}/tombstones/${citySlug}`,
              lastModified: now,
              changeFrequency: "weekly",
              priority: 0.7,
            });
          }
        }
      }
    } else {
      console.warn("Sitemap: GraphQL response not OK", res.status);
    }
  } catch (e) {
    console.warn("Sitemap: Failed to fetch dynamic entries; using core routes only.", e);
  }

  return [...coreRoutes, ...dynamicRoutes];
}
