import TombstonesForSaleClient from "./for-sale-client";

const FOR_SALE_INITIAL_QUERY = `
  query ForSaleInitial(
    $page: Int = 1
    $pageSize: Int = 20
    $featuredPageSize: Int = 3
    $categoriesPageSize: Int = 50
    $branchesPageSize: Int = 10
    $branchListingsPageSize: Int = 10
  ) {
    listingCategories(pagination: { page: 1, pageSize: $categoriesPageSize }) {
      documentId
      name
      icon
      slug
      order
      imageUrl
      imagePublicId
    }
    featured: listings(
      filters: { isFeatured: { eq: true }, isOnSpecial: { ne: true } }
      sort: "updatedAt:desc"
      pagination: { page: 1, pageSize: $featuredPageSize }
    ) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { documentId name }
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
        overallStyle { id value }
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
      branch_listings(pagination: { page: 1, pageSize: $branchListingsPageSize }) {
        branch { documentId name location { province city town address latitude longitude mapUrl } }
        price
      }
      branches(pagination: { page: 1, pageSize: $branchesPageSize }) {
        documentId
        name
        location { province city town address latitude longitude mapUrl }
      }
    }
    listings(
      filters: { isOnSpecial: { ne: true } }
      sort: "documentId:asc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      documentId
      updatedAt
      title
      price
      slug
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      listing_category { documentId name }
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
      branch_listings(pagination: { page: 1, pageSize: $branchListingsPageSize }) {
        branch { documentId name location { province city town address latitude longitude mapUrl } }
        price
      }
      branches(pagination: { page: 1, pageSize: $branchesPageSize }) {
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
        variables: {
          page: 1,
          pageSize: 20,
          featuredPageSize: 3,
          categoriesPageSize: 50,
          branchesPageSize: 10,
          branchListingsPageSize: 10,
        },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return { initialListings: [], initialCategories: [] };
    const json = await res.json();

    const initialCategories = json?.data?.listingCategories || [];
    const featured = json?.data?.featured || [];
    const listings = json?.data?.listings || [];

    const seen = new Set();
    const initialListings = [];
    for (const list of [featured, listings]) {
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
