import HomeClient from "./home-client"

const HOME_INITIAL_QUERY = `
  query HomeInitial($featuredLimit: Int = 3, $premiumLimit: Int = 30, $standardLimit: Int = 30) {
    listingCategories {
      documentId
      updatedAt
      name
      icon
      slug
      order
      backgroundImage { url }
    }
    featured: listings(filters: { isFeatured: { eq: true } }, pagination: { limit: $featuredLimit }) {
      documentId
      updatedAt
      title
      price
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      slug
      listing_category { name }
      mainImageUrl
      company { documentId name location logoUrl hideStandardCompanyLogo }
      branch_listings { branch { location { province city town } } }
      branches { location { province city town } }
      specials { active sale_price start_date end_date }
    }
    premium: listings(filters: { isPremium: { eq: true } }, pagination: { limit: $premiumLimit }) {
      documentId
      updatedAt
      title
      price
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      slug
      listing_category { name }
      mainImageUrl
      company { documentId name location logoUrl hideStandardCompanyLogo }
      branch_listings { branch { location { province city town } } }
      branches { location { province city town } }
      specials { active sale_price start_date end_date }
    }
    standard: listings(filters: { isStandard: { eq: true } }, pagination: { limit: $standardLimit }) {
      documentId
      updatedAt
      title
      price
      isFeatured
      isOnSpecial
      isPremium
      isStandard
      slug
      listing_category { name }
      mainImageUrl
      company { documentId name location logoUrl hideStandardCompanyLogo }
      branch_listings { branch { location { province city town } } }
      branches { location { province city town } }
      specials { active sale_price start_date end_date }
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
        variables: { featuredLimit: 3, premiumLimit: 30, standardLimit: 30 },
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
