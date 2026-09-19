import { notFound, permanentRedirect } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import {
  normalizeListingSlug,
  cleanListingSlug,
  buildListingCanonicalSlug,
  buildListingCompanySlug,
  extractUrlTownSegment,
  listingAvailableAtTown,
  buildAllCanonicalSlugsForListing,
  normalizeTownCompare,
} from "@/lib/slugs";
import {
  SITE_URL,
  toAbsoluteUrl,
  withSearchParams,
  normalizeLower,
  uniqStrings,
  coercePrice,
  fetchListingByNormalizedSlug,
} from "@/lib/listings-resolver";

function normalizeCompanySlugFromUrl(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

export async function generateMetadata({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ companySlug: string; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await params;
  const urlCompanySlug = normalizeCompanySlugFromUrl(p?.companySlug);
  const urlProductSlugRaw = p?.slug;
  const sp = rawSearchParams ? await rawSearchParams : undefined;

  if (!urlCompanySlug || !urlProductSlugRaw) {
    return {
      title: "Not Found | TombstoneFinder",
      description: "This page could not be found.",
      robots: { index: true, follow: true },
    };
  }

  const normalizedProduct = normalizeListingSlug(urlProductSlugRaw);
  if (normalizedProduct && urlProductSlugRaw !== normalizedProduct) {
    const target = withSearchParams(`/tombstones/${urlCompanySlug}/${normalizedProduct}`, sp);
    permanentRedirect(target);
  }
  if (p?.companySlug && p.companySlug !== urlCompanySlug) {
    const target = withSearchParams(`/tombstones/${urlCompanySlug}/${normalizedProduct || urlProductSlugRaw}`, sp);
    permanentRedirect(target);
  }

  const canonicalBase = `/tombstones/${urlCompanySlug}/${normalizedProduct || urlProductSlugRaw}`;
  const canonical = toAbsoluteUrl(canonicalBase);

  const listingResolved = await fetchListingByNormalizedSlug(normalizedProduct || urlProductSlugRaw, urlCompanySlug);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;
  const redirectProductSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;

  if (!listing) {
    return {
      title: "Not Found | TombstoneFinder",
      description: "This product is not available under the selected manufacturer.",
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  const listingCompanySlug = buildListingCompanySlug(listing);
  const matchOk = listingCompanySlug && normalizeLower(listingCompanySlug) === normalizeLower(urlCompanySlug);
  if (!matchOk) {
    return {
      title: "Not Found | TombstoneFinder",
      description: "This product is not available under the selected manufacturer.",
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  const resolvedCompany = listingCompanySlug || urlCompanySlug;

  if (redirectProductSlug) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${resolvedCompany}/${redirectProductSlug}`);
    permanentRedirect(withSearchParams(`/tombstones/${resolvedCompany}/${redirectProductSlug}`, sp));
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const urlTown = extractUrlTownSegment(normalizedProduct || urlProductSlugRaw);
  const primaryCanonicalProductSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title);
  const listingCanonical = primaryCanonicalProductSlug
    ? toAbsoluteUrl(`/tombstones/${resolvedCompany}/${primaryCanonicalProductSlug}`)
    : canonical;
  const townMatchesAlternateBranch = listingAvailableAtTown(listing, urlTown);
  if (
    primaryCanonicalProductSlug &&
    normalizedProduct !== primaryCanonicalProductSlug &&
    urlTown &&
    !townMatchesAlternateBranch
  ) {
    const alternateSlugs = buildAllCanonicalSlugsForListing(listing);
    const hasAnyTown = Array.isArray(alternateSlugs) && alternateSlugs.length > 0;
    const urlTownSlug = normalizeTownCompare(urlTown);
    const matchingAlternate =
      hasAnyTown && urlTownSlug
        ? alternateSlugs.find((s) => {
            const t = extractUrlTownSegment(s);
            return t && normalizeTownCompare(t) === urlTownSlug;
          })
        : undefined;
    const anyAlternateWithTown = hasAnyTown
      ? alternateSlugs.find((s) => !!extractUrlTownSegment(s))
      : undefined;
    const redirectTarget = matchingAlternate || anyAlternateWithTown || primaryCanonicalProductSlug;
    const target = redirectTarget && redirectTarget !== normalizedProduct
      ? `/tombstones/${resolvedCompany}/${redirectTarget}`
      : `/tombstones/${resolvedCompany}/${primaryCanonicalProductSlug}`;
    permanentRedirect(withSearchParams(target, sp));
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: listingCanonical },
      robots: { index: true, follow: true },
    };
  }

  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 6)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);

  const title = listing?.title ? `${listing.title} | Tombstones For Sale` : "Tombstone Listing";
  const description =
    listing?.description || "View this tombstone listing, pricing and branch availability.";
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical: listingCanonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: listingCanonical,
      title,
      description,
      images: images.length ? images : undefined,
      siteName: "TombstoneFinder",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
    other: {
      "product:price:amount": coercePrice(listing?.price) ?? undefined,
      "product:price:currency": "ZAR",
      "product:brand": sellerName || undefined,
      "product:category": categoryName || undefined,
      "product:material": stoneType || undefined,
      "og:image:alt": title,
    },
  };
}

export default async function ScopedTombstoneListingPage({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ companySlug: string; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await params;
  const urlCompanySlug = normalizeCompanySlugFromUrl(p?.companySlug);
  const urlProductSlugRaw = p?.slug;
  const sp = rawSearchParams ? await rawSearchParams : undefined;

  if (!urlCompanySlug || !urlProductSlugRaw) notFound();

  const normalizedProduct = normalizeListingSlug(urlProductSlugRaw);
  if ((normalizedProduct && urlProductSlugRaw !== normalizedProduct) || (p?.companySlug && p.companySlug !== urlCompanySlug)) {
    const targetProduct = normalizedProduct || urlProductSlugRaw;
    const targetCompany = urlCompanySlug;
    permanentRedirect(withSearchParams(`/tombstones/${targetCompany}/${targetProduct}`, sp));
  }

  const listingResolved = await fetchListingByNormalizedSlug(normalizedProduct || urlProductSlugRaw, urlCompanySlug);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;
  const redirectProductSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;

  if (!listing) notFound();

  const listingCompanySlug = buildListingCompanySlug(listing);
  const matchOk = listingCompanySlug && normalizeLower(listingCompanySlug) === normalizeLower(urlCompanySlug);
  if (!matchOk) notFound();

  const resolvedCompany = listingCompanySlug || urlCompanySlug;

  if (redirectProductSlug) {
    permanentRedirect(withSearchParams(`/tombstones/${resolvedCompany}/${redirectProductSlug}`, sp));
  }

  const urlTown = extractUrlTownSegment(normalizedProduct || urlProductSlugRaw);
  const primaryCanonicalProductSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title);
  const townMatchesAlternateBranch = listingAvailableAtTown(listing, urlTown);
  if (
    primaryCanonicalProductSlug &&
    normalizedProduct !== primaryCanonicalProductSlug &&
    urlTown &&
    !townMatchesAlternateBranch
  ) {
    const alternateSlugs = buildAllCanonicalSlugsForListing(listing);
    const hasAnyTown = Array.isArray(alternateSlugs) && alternateSlugs.length > 0;
    const urlTownSlug = normalizeTownCompare(urlTown);
    const matchingAlternate =
      hasAnyTown && urlTownSlug
        ? alternateSlugs.find((s) => {
            const t = extractUrlTownSegment(s);
            return t && normalizeTownCompare(t) === urlTownSlug;
          })
        : undefined;
    const anyAlternateWithTown = hasAnyTown
      ? alternateSlugs.find((s) => !!extractUrlTownSegment(s))
      : undefined;
    const redirectTarget = matchingAlternate || anyAlternateWithTown || primaryCanonicalProductSlug;
    const target = redirectTarget && redirectTarget !== normalizedProduct
      ? `/tombstones/${resolvedCompany}/${redirectTarget}`
      : `/tombstones/${resolvedCompany}/${primaryCanonicalProductSlug}`;
    permanentRedirect(withSearchParams(target, sp));
  }

  const productCanonical = primaryCanonicalProductSlug || normalizedProduct || urlProductSlugRaw;
  const canonical = toAbsoluteUrl(`/tombstones/${resolvedCompany}/${productCanonical}`);
  const images = uniqStrings([listing?.mainImageUrl, ...(listing?.thumbnailUrls || [])])
    .slice(0, 8)
    .map((u) => (typeof u === "string" && u.startsWith("http") ? u : u ? toAbsoluteUrl(u) : null))
    .filter(Boolean);
  const price = coercePrice(listing?.price);
  const sellerName = String(listing?.company?.name ?? "").trim() || undefined;
  const categoryName = String(listing?.listing_category?.name ?? "").trim() || undefined;
  const stoneType = String(listing?.productDetails?.stoneType?.[0]?.value ?? "").trim() || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: String(listing?.title ?? "").trim() || `Tombstone ${listing.documentId || urlProductSlugRaw}`,
    description: String(listing?.description ?? "").trim() || undefined,
    image: images.length ? images : undefined,
    sku: String(listing.documentId || urlProductSlugRaw),
    category: categoryName,
    material: stoneType,
    brand: sellerName ? { "@type": "Organization", name: sellerName } : undefined,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "ZAR",
      price: price ?? undefined,
      availability: "https://schema.org/InStock",
      seller: sellerName ? { "@type": "Organization", name: sellerName } : undefined,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductShowcase listing={listing} id={listing.documentId} onNavigate={undefined as any} />
    </>
  );
}
