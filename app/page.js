import HomeClient from "./home-client"

const HOME_INITIAL_QUERY = `
  query HomeInitial(
    $categoriesPage: Int = 1
    $categoriesPageSize: Int = 50
    $featuredPage: Int = 1
    $featuredPageSize: Int = 3
    $premiumPage: Int = 1
    $premiumPageSize: Int = 10
    $standardPage: Int = 1
    $standardPageSize: Int = 5
  ) {
    listingCategories(pagination: { page: $categoriesPage, pageSize: $categoriesPageSize }) {
      documentId
      updatedAt
      name
      icon
      slug
      order
      backgroundImage { url }
    }
    featured: listings(
      filters: { isFeatured: { eq: true }, isOnSpecial: { ne: true } }
      pagination: { page: $featuredPage, pageSize: $featuredPageSize }
      sort: "updatedAt:desc"
    ) {
      documentId
      updatedAt
      title
      price
      isFeatured
      slug
      listing_category { documentId name }
      mainImageUrl
      mainImagePublicId
      adFlasher
      adFlasherColor
      productDetails { id stoneType { id value } style { id value } }
      company { documentId name }
    }
    premium: listings(
      filters: { isPremium: { eq: true }, isOnSpecial: { ne: true } }
      pagination: { page: $premiumPage, pageSize: $premiumPageSize }
      sort: "documentId:asc"
    ) {
      documentId
      updatedAt
      title
      price
      isPremium
      slug
      listing_category { documentId name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails { id color { id value } style { id value } overallStyle { id value } stoneType { id value } slabStyle { id value } customization { id value } }
      additionalProductDetails { id transportAndInstallation { id value } foundationOptions { id value } warrantyOrGuarantee { id value } installationGuarantee { id value } }
      company { documentId name location logoUrl logoUrlPublicId hideStandardCompanyLogo latitude longitude isFeatured }
    }
    standard: listings(
      filters: { isStandard: { eq: true }, isOnSpecial: { ne: true } }
      pagination: { page: $standardPage, pageSize: $standardPageSize }
      sort: "documentId:asc"
    ) {
      documentId
      updatedAt
      title
      price
      isStandard
      slug
      listing_category { documentId name }
      mainImageUrl
      mainImagePublicId
      thumbnailUrls
      thumbnailPublicIds
      adFlasher
      adFlasherColor
      manufacturingTimeframe
      specials { active sale_price start_date end_date }
      productDetails { id color { id value } style { id value } overallStyle { id value } stoneType { id value } slabStyle { id value } customization { id value } }
      additionalProductDetails { id transportAndInstallation { id value } foundationOptions { id value } warrantyOrGuarantee { id value } installationGuarantee { id value } }
      company { documentId name location logoUrl logoUrlPublicId hideStandardCompanyLogo latitude longitude isFeatured }
    }
  }
`

async function fetchHomeInitialData() {
  const endpoint =
    process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "https://api.tombstonesfinder.co.za/graphql"

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: HOME_INITIAL_QUERY,
        variables: {
          categoriesPage: 1,
          categoriesPageSize: 50,
          featuredPage: 1,
          featuredPageSize: 3,
          premiumPage: 1,
          premiumPageSize: 10,
          standardPage: 1,
          standardPageSize: 5,
        },
      }),
      next: { revalidate: 300 },
    })

    if (!res.ok) return { initialListings: [], initialCategories: [] }
    const json = await res.json()

    const listingCategories = json?.data?.listingCategories || []
    const featured = json?.data?.featured || []
    const premium = json?.data?.premium || []
    const standard = json?.data?.standard || []

    const seen = new Set()
    const initialListings = []
    for (const list of [featured, premium, standard]) {
      for (const l of list) {
        const id = l?.documentId || l?.id
        if (!id || seen.has(id)) continue
        seen.add(id)
        initialListings.push(l)
      }
    }

    const initialCategories = listingCategories.map((c) => ({
      ...c,
      imageUrl: c?.backgroundImage?.url || c?.imageUrl,
    }))

    return { initialListings, initialCategories }
  } catch {
    return { initialListings: [], initialCategories: [] }
  }
}

export default async function Home() {
  const { initialListings, initialCategories } = await fetchHomeInitialData()
  return <HomeClient initialListings={initialListings} initialCategories={initialCategories} />
}
