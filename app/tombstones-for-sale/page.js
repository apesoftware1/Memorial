import TombstonesForSaleClient from "./for-sale-client";

const FOR_SALE_INITIAL_QUERY = `
  query ForSaleInitial($featuredLimit: Int = 3, $premiumLimit: Int = 30, $standardLimit: Int = 60) {
    listingCategories {
      documentId
      name
      icon
      slug
      order
      imageUrl
      imagePublicId
    }
    featured: listings(filters: { isFeatured: { eq: true } }, pagination: { limit: $featuredLimit }) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      company {
        documentId
        name
        location
        logoUrl
        logoUrlPublicId
        hideStandardCompanyLogo
        latitude
        longitude
        isFeatured
      }
      branch_listings {
        branch { documentId name location { province city town } }
        price
      }
      branches {
        documentId
        name
        location { province city town address latitude longitude mapUrl }
      }
    }
    premium: listings(filters: { isPremium: { eq: true } }, pagination: { limit: $premiumLimit }) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      company {
        documentId
        name
        location
        logoUrl
        logoUrlPublicId
        hideStandardCompanyLogo
        latitude
        longitude
        isFeatured
      }
      branch_listings {
        branch { documentId name location { province city town } }
        price
      }
      branches {
        documentId
        name
        location { province city town address latitude longitude mapUrl }
      }
    }
    standard: listings(filters: { isStandard: { eq: true } }, pagination: { limit: $standardLimit }) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails {
        id
        color { id value }
        style { id value }
        stoneType { id value }
        slabStyle { id value }
        customization { id value }
      }
      company {
        documentId
        name
        location
        logoUrl
        logoUrlPublicId
        hideStandardCompanyLogo
        latitude
        longitude
        isFeatured
      }
      branch_listings {
        branch { documentId name location { province city town } }
        price
      }
      branches {
        documentId
        name
        location { province city town address latitude longitude mapUrl }
      }
    }
  }
`;

async function fetchForSaleInitialData() {
  const endpoint =
    process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "https://api.tombstonesfinder.co.za/graphql";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: FOR_SALE_INITIAL_QUERY,
        variables: { featuredLimit: 3, premiumLimit: 30, standardLimit: 60 },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return { initialListings: [], initialCategories: [] };
    const json = await res.json();

    const initialCategories = json?.data?.listingCategories || [];
    const featured = json?.data?.featured || [];
    const premium = json?.data?.premium || [];
    const standard = json?.data?.standard || [];

    const seen = new Set();
    const initialListings = [];
    for (const list of [featured, premium, standard]) {
      for (const l of list) {
        const id = l?.documentId || l?.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        initialListings.push(l);
      }
    }

    return { initialListings, initialCategories };
  } catch {
    return { initialListings: [], initialCategories: [] };
  }
}

export default async function TombstonesForSalePage() {
  const { initialListings, initialCategories } = await fetchForSaleInitialData();
  return <TombstonesForSaleClient initialListings={initialListings} initialCategories={initialCategories} />;
}


