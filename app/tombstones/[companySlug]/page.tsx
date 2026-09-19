import { notFound, permanentRedirect } from "next/navigation";
import TombstonesForSaleClient from "@/app/tombstones-for-sale/for-sale-client";
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
  fetchLocationSeoPage,
  fetchListingCategories,
  fetchLocationListingIdsBySeo,
  fetchListingsByIds,
  fetchListingByNormalizedSlug,
} from "@/lib/listings-resolver";

const TombstonesForSaleClientAny = TombstonesForSaleClient as unknown as (props: any) => any;

function computeScopedTargetForListing(listing: any, fallbackProductSlug: string): string {
  const company = buildListingCompanySlug(listing);
  const product = buildListingCanonicalSlug(listing) || cleanListingSlug(listing?.slug, listing?.title) || fallbackProductSlug;
  if (!company || !product) return "";
  return `/tombstones/${company}/${product}`;
}

export async function generateMetadata({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawSlug = (await params)?.companySlug;
  const sp = rawSearchParams ? await rawSearchParams : undefined;
  const queryCompanySlug = typeof sp?.company === "string" && sp.company.trim() ? sp.company.trim() : undefined;

  if (!rawSlug) {
    return {
      title: "Tombstones | TombstoneFinder",
      description: "Browse tombstones by province, city or town in South Africa.",
      robots: { index: true, follow: true },
    };
  }

  const flatCanonical = toAbsoluteUrl(`/tombstones/${rawSlug}`);
  const normalized = normalizeListingSlug(rawSlug);
  if (normalized && rawSlug !== normalized) {
    permanentRedirect(withSearchParams(`/tombstones/${normalized}`, sp));
  }

  const seoPage = await fetchLocationSeoPage(rawSlug);
  if (seoPage) {
    const titleRaw =
      (typeof seoPage?.metaTitle === "string" && seoPage.metaTitle.trim()) ||
      (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
      "";
    const descriptionRaw =
      (typeof seoPage?.metaDescription === "string" && seoPage.metaDescription.trim()) ||
      (typeof seoPage?.seoDescription === "string" && seoPage.seoDescription.trim()) ||
      "";
    const heroUrl = typeof seoPage?.heroImage?.url === "string" ? seoPage.heroImage.url.trim() : "";
    return {
      title: titleRaw || undefined,
      description: descriptionRaw || undefined,
      robots: { index: true, follow: true },
      alternates: { canonical: flatCanonical },
      openGraph: {
        type: "website",
        url: flatCanonical,
        title: titleRaw || undefined,
        description: descriptionRaw || undefined,
        images: heroUrl ? [heroUrl] : undefined,
      },
    };
  }

  const listingResolved = await fetchListingByNormalizedSlug(normalized || rawSlug, undefined);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;

  if (!listing) {
    return {
      title: "Not Found | TombstoneFinder",
      description: "This page could not be found, or is no longer available.",
      alternates: { canonical: flatCanonical },
      robots: { index: true, follow: true },
    };
  }

  if (queryCompanySlug) {
    const listingCompanySlug = buildListingCompanySlug(listing);
    const matchOk = listingCompanySlug && normalizeLower(listingCompanySlug) === normalizeLower(queryCompanySlug);
    if (!matchOk) {
      return {
        title: "Not Found | TombstoneFinder",
        description: "This product is not available under the selected manufacturer.",
        alternates: { canonical: flatCanonical },
        robots: { index: true, follow: true },
      };
    }
  }

  const redirectProductSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;
  const urlTown = extractUrlTownSegment(normalized || rawSlug);
  const primaryCanonicalProductSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title);
  const townMatchesAlternateBranch = listingAvailableAtTown(listing, urlTown);
  let finalProductSlug = redirectProductSlug || primaryCanonicalProductSlug || normalized || rawSlug;

  if (
    !redirectProductSlug &&
    primaryCanonicalProductSlug &&
    normalized !== primaryCanonicalProductSlug &&
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
    finalProductSlug = matchingAlternate || anyAlternateWithTown || primaryCanonicalProductSlug;
  }

  const target = computeScopedTargetForListing(listing, finalProductSlug);
  if (target) {
    const scopedCanonical = toAbsoluteUrl(target);
    permanentRedirect(withSearchParams(target, sp));
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: scopedCanonical },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: "Not Found | TombstoneFinder",
    description: "This page could not be found, or is no longer available.",
    alternates: { canonical: flatCanonical },
    robots: { index: true, follow: true },
  };
}

export default async function LegacyFlatTombstonesPage({
  params,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawSlug = (await params)?.companySlug;
  const sp = rawSearchParams ? await rawSearchParams : undefined;
  const queryCompanySlug = typeof sp?.company === "string" && sp.company.trim() ? sp.company.trim() : undefined;

  if (!rawSlug) notFound();

  const normalized = normalizeListingSlug(rawSlug);
  if (normalized && rawSlug !== normalized) {
    permanentRedirect(withSearchParams(`/tombstones/${normalized}`, sp));
  }

  const seoPage = await fetchLocationSeoPage(normalized || rawSlug);
  if (seoPage) {
    const locationType = typeof seoPage?.locationType === "string" ? seoPage.locationType : "";
    const locationValue = typeof seoPage?.locationValue === "string" ? seoPage.locationValue : "";
    const [categories, locationIndex] = await Promise.all([
      fetchListingCategories(),
      fetchLocationListingIdsBySeo(locationType, locationValue),
    ]);
    const { ids, total } = locationIndex;
    const listings = await fetchListingsByIds(ids);
    const canonical = toAbsoluteUrl(`/tombstones/${normalized || rawSlug}`);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name:
        (typeof seoPage?.seoTitle === "string" && seoPage.seoTitle.trim()) ||
        (typeof seoPage?.name === "string" && seoPage.name.trim()) ||
        `Tombstones in ${normalized || rawSlug}`,
      url: canonical,
      numberOfItems: typeof total === "number" ? total : listings.length,
      itemListElement: listings.slice(0, 10).map((l: any, idx: number) => {
        const scopedHref = buildListingCompanySlug(l) && buildListingCanonicalSlug(l)
          ? `/tombstones/${buildListingCompanySlug(l)}/${buildListingCanonicalSlug(l)}`
          : `/tombstones-for-sale/${l.documentId}`;
        return {
          "@type": "ListItem",
          position: idx + 1,
          url: toAbsoluteUrl(scopedHref),
          name: String(l?.title ?? "").trim() || undefined,
        };
      }),
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <TombstonesForSaleClientAny
          initialListings={listings}
          initialCategories={categories}
          initialFilters={{ location: locationValue || null }}
          initialTotalCount={typeof total === "number" ? total : null}
          disableLocationUrlSync={true}
          forcedLocationSeo={{ locationType, locationValue }}
          seoTitle={seoPage?.seoTitle || null}
          seoDescription={seoPage?.seoDescription || null}
          seoHeroImageUrl={seoPage?.heroImage?.url || null}
        />
      </>
    );
  }

  const listingResolved = await fetchListingByNormalizedSlug(normalized || rawSlug, undefined);
  const listing: any =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).listing
      : listingResolved;
  const redirectProductSlug =
    listingResolved && typeof listingResolved === "object" && "__redirectSlug" in listingResolved
      ? (listingResolved as any).__redirectSlug
      : null;

  if (!listing) notFound();

  if (queryCompanySlug) {
    const listingCompanySlug = buildListingCompanySlug(listing);
    const matchOk = listingCompanySlug && normalizeLower(listingCompanySlug) === normalizeLower(queryCompanySlug);
    if (!matchOk) notFound();
  }

  const urlTown = extractUrlTownSegment(normalized || rawSlug);
  const primaryCanonicalProductSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title);
  const townMatchesAlternateBranch = listingAvailableAtTown(listing, urlTown);
  let finalProductSlug = redirectProductSlug || primaryCanonicalProductSlug || normalized || rawSlug;

  if (
    !redirectProductSlug &&
    primaryCanonicalProductSlug &&
    normalized !== primaryCanonicalProductSlug &&
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
    finalProductSlug = matchingAlternate || anyAlternateWithTown || primaryCanonicalProductSlug;
  }

  const target = computeScopedTargetForListing(listing, finalProductSlug);
  if (target) {
    permanentRedirect(withSearchParams(target, sp));
  }

  notFound();
}
