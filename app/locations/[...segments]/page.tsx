import { Fragment, cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Footer from "@/components/Footer";
import LocationHeader from "@/app/locations/location-header";
import LocationSearchStrip from "@/app/locations/location-search-strip";
import NearbyLocationsSection from "@/app/locations/nearby-locations-section";
import { LOCATION_LANDING_PAGE_QUERY } from "@/graphql/queries/locationLandingPage";
import { fetchGraphQL, toAbsoluteUrl } from "@/lib/serverGraphql";

export const revalidate = 300;

const PAGE_SIZE = 8;
const LOCATION_LANDING_SEO_OPTIONS_QUERY = `
  query LocationLandingSeoOptions {
    locationLandingSeos {
      province
      locationType
      locationValue
      cityContext
      title
      intro
      metaTitle
      metaDescription
      heroImageUrl
      heroImagePublicId
    }
  }
`;
const LOCATION_FAQS_QUERY = `
  query LocationFaqs($town: String!) {
    locationFaqs(filters: { town: { eq: $town } }) {
      question
      answer
    }
  }
`;
const LOCAL_BUSINESSES_QUERY = `
  query LocalBusinesses($province: String!, $town: String!) {
    localBusinesses(
      filters: {
        province: { eq: $province }
        town: { eq: $town }
        active: { eq: true }
      }
      sort: ["displayOrder:asc", "name:asc"]
    ) {
      documentId
      name
      slug
      businessType
      description
      phone
      mobile
      email
      website
      whatsapp
      province
      city
      town
      streetAddress
      postalCode
      latitude
      longitude
      featured
      verified
      active
      displayOrder
    }
  }
`;


type RouteParams = {
  segments: string[];
};

type RouteSearchParams = {
  page?: string | string[];
};

type LocationLandingSeoRow = {
  province?: string | null;
  locationType?: string | null;
  locationValue?: string | null;
  cityContext?: string | null;
  title?: string | null;
  intro?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImageUrl?: string | null;
  heroImagePublicId?: string | null;
};

type ResolvedLocationOption = {
  province: string;
  city?: string;
  town: string;
  title?: string | null;
  intro?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImageUrl?: string | null;
  heroImagePublicId?: string | null;
};

type LocalBusinessGalleryImage = {
  url?: string | null;
  publicId?: string | null;
};

type LocalBusinessItem = {
  documentId?: string | null;
  name?: string | null;
  slug?: string | null;
  businessType?: string | null;
  description?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  streetAddress?: string | null;
  postalCode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  featured?: boolean | null;
  verified?: boolean | null;
  active?: boolean | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  logo?: {
    url?: string | null;
  } | null;
  gallery?: LocalBusinessGalleryImage[] | null;
  openingHours?: {
    monToFri?: string | null;
    saturday?: string | null;
    sunday?: string | null;
    publicHoliday?: string | null;
  } | null;
  branch?: {
    documentId?: string | null;
    name?: string | null;
  } | null;
  company?: {
    documentId?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
};

type LocalBusinessSection = {
  businessType?: string | null;
  label?: string | null;
  title?: string | null;
  items?: LocalBusinessItem[] | null;
};

type LocationFaqItem = {
  question?: string | null;
  answer?: string | null;
};

type NearbyLocalBusinessItem = {
  documentId?: string | null;
  name?: string | null;
  slug?: string | null;
  businessType?: string | null;
  description?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  province?: string | null;
  city?: string | null;
  town?: string | null;
  streetAddress?: string | null;
  postalCode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  featured?: boolean | null;
  verified?: boolean | null;
  active?: boolean | null;
  displayOrder?: number | null;
};

type LocationLandingPageModel = {
  location?: {
    province?: string | null;
    city?: string | null;
    town?: string | null;
    slug?: string | null;
    breadcrumb?: Array<{
      label?: string | null;
      slug?: string | null;
    }> | null;
  } | null;
  statistics?: {
    totalBranches?: number | null;
    totalManufacturers?: number | null;
    totalListings?: number | null;
    minimumListingPrice?: number | null;
  } | null;
  seo?: {
    title?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    intro?: string | null;
    heroImageUrl?: string | null;
    heroImagePublicId?: string | null;
  } | null;
  branches?: Array<{
    branch?: {
      documentId?: string | null;
      name?: string | null;
    } | null;
    company?: {
      documentId?: string | null;
      name?: string | null;
      slug?: string | null;
    } | null;
    address?: string | null;
    phone?: string | null;
    openingHours?: {
      monToFri?: string | null;
      saturday?: string | null;
      sunday?: string | null;
      publicHoliday?: string | null;
    } | null;
    logo?: {
      url?: string | null;
    } | null;
  }> | null;
  listings?: {
    items?: Array<{
      listing?: {
        documentId?: string | null;
        title?: string | null;
        slug?: string | null;
        price?: number | null;
        thumbnail?: {
          url?: string | null;
        } | null;
      } | null;
      branch?: {
        documentId?: string | null;
        name?: string | null;
        address?: string | null;
      } | null;
      company?: {
        documentId?: string | null;
        name?: string | null;
        slug?: string | null;
        logo?: {
          url?: string | null;
        } | null;
      } | null;
    }> | null;
    pagination?: {
      page?: number | null;
      pageSize?: number | null;
      total?: number | null;
      pageCount?: number | null;
    } | null;
  } | null;
  localBusinessSections?: LocalBusinessSection[] | null;
  faq?: Array<{
    question?: string | null;
    answer?: string | null;
  }> | null;
  nearbyLocations?: Array<{
    town?: string | null;
    city?: string | null;
    province?: string | null;
    slug?: string | null;
    listingCount?: number | null;
  }> | null;
} | null;

function normalizePath(value?: string | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const parsed = new URL(raw);
      return parsed.pathname.replace(/\/+$/, "") || "/";
    }
  } catch {
    return "";
  }

  const prefixed = raw.startsWith("/") ? raw : `/${raw}`;
  return prefixed.replace(/\/+$/, "") || "/";
}

function normalizeText(value?: string | null) {
  const trimmed = typeof value === "string" ? value.trim().replace(/_/g, "-") : "";
  return trimmed || null;
}

function decodeSegment(segment: string) {
  return decodeURIComponent(segment).replace(/-/g, " ").trim();
}

function slugifySegment(value: string) {
  return encodeURIComponent(
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
  );
}

function collapseCity(city?: string | null, town?: string | null) {
  const cityValue = normalizeText(city);
  const townValue = normalizeText(town);
  if (!cityValue || !townValue) return cityValue;
  return cityValue.toLowerCase() === townValue.toLowerCase() ? null : cityValue;
}

function buildLocationPath(province?: string | null, city?: string | null, town?: string | null) {
  const provinceValue = normalizeText(province);
  const cityValue = normalizeText(city);
  const townValue = normalizeText(town);

  if (!provinceValue || !townValue) return "";

  if (cityValue && cityValue.toLowerCase() !== townValue.toLowerCase()) {
    return `/locations/${slugifySegment(provinceValue)}/${slugifySegment(cityValue)}/${slugifySegment(townValue)}`;
  }

  return `/locations/${slugifySegment(provinceValue)}/${slugifySegment(townValue)}`;
}

function resolveLocationInput(segments: string[]) {
  if (segments.length === 2) {
    const [province, town] = segments.map(decodeSegment);
    if (!province || !town) return null;
    return {
      province,
      city: undefined,
      town,
      title: null,
      intro: null,
      metaTitle: null,
      metaDescription: null,
      heroImageUrl: null,
      heroImagePublicId: null,
    };
  }

  if (segments.length === 3) {
    const [province, city, town] = segments.map(decodeSegment);
    if (!province || !city || !town) return null;
    return {
      province,
      city,
      town,
      title: null,
      intro: null,
      metaTitle: null,
      metaDescription: null,
      heroImageUrl: null,
      heroImagePublicId: null,
    };
  }

  return null;
}

const fetchLocationLandingSeoRows = cache(async () => {
  const data = await fetchGraphQL(LOCATION_LANDING_SEO_OPTIONS_QUERY, {}, revalidate);
  return Array.isArray(data?.locationLandingSeos) ? (data.locationLandingSeos as LocationLandingSeoRow[]) : [];
});

const resolveLocationOption = cache(async (segments: string[]): Promise<ResolvedLocationOption | null> => {
  const pathname = normalizePath(`/locations/${segments.join("/")}`);
  if (!pathname) return null;

  const rows = await fetchLocationLandingSeoRows();
  for (const row of rows) {
    const province = normalizeText(row?.province);
    const town = normalizeText(row?.locationValue);
    const city = collapseCity(row?.cityContext, row?.locationValue);
    const locationType = normalizeText(row?.locationType);

    if (!province || !town || locationType?.toLowerCase() !== "town") continue;

    if (buildLocationPath(province, city, town) === pathname) {
      return {
        province,
        city: city || undefined,
        town,
        title: row?.title ?? null,
        intro: row?.intro ?? null,
        metaTitle: row?.metaTitle ?? null,
        metaDescription: row?.metaDescription ?? null,
        heroImageUrl: row?.heroImageUrl ?? null,
        heroImagePublicId: row?.heroImagePublicId ?? null,
      };
    }
  }

  return null;
});

function parsePageNumber(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const num = Number.parseInt(value || "1", 10);
  return Number.isFinite(num) && num > 0 ? num : 1;
}

function formatCount(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-ZA") : "0";
}

function formatPrice(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value)
    : "Contact for price";
}

function toInternalSlugPath(value?: string | null) {
  return normalizePath(value) || null;
}

function toListingHref(slug?: string | null) {
  const raw = typeof slug === "string" ? slug.trim() : "";
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  return `/tombstones-for-sale/${raw}`;
}

function toCompanyHref(slug?: string | null) {
  const raw = typeof slug === "string" ? slug.trim() : "";
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  return `/manufacturers/${raw}`;
}

function hoursRows(hours?: {
  monToFri?: string | null;
  saturday?: string | null;
  sunday?: string | null;
  publicHoliday?: string | null;
} | null) {
  return [
    { label: "Mon-Fri", value: hours?.monToFri },
    { label: "Saturday", value: hours?.saturday },
    { label: "Sunday", value: hours?.sunday },
    { label: "Public Holiday", value: hours?.publicHoliday },
  ].filter((item) => typeof item.value === "string" && item.value.trim());
}

const fetchLocationLandingPage = cache(
  async (province: string, city: string | undefined, town: string, page: number) => {
    const data = await fetchGraphQL(
      LOCATION_LANDING_PAGE_QUERY,
      {
        province,
        city: city ?? null,
        town,
        page,
        pageSize: PAGE_SIZE,
      },
      revalidate
    );

    return (data?.locationLandingPage as LocationLandingPageModel) ?? null;
  }
);

const fetchLocationFaqs = cache(async (town: string) => {
  const data = await fetchGraphQL(LOCATION_FAQS_QUERY, { town }, revalidate);
  return Array.isArray(data?.locationFaqs) ? (data.locationFaqs as LocationFaqItem[]) : [];
});

const fetchNearbyLocalBusinesses = cache(async (province: string, town: string) => {
  const data = await fetchGraphQL(LOCAL_BUSINESSES_QUERY, { province, town }, revalidate);
  return Array.isArray(data?.localBusinesses) ? (data.localBusinesses as NearbyLocalBusinessItem[]) : [];
});

function stripHtml(value?: string | null) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function buildStatLine(statistics?: NonNullable<LocationLandingPageModel>["statistics"]) {
  const parts = [
    typeof statistics?.totalBranches === "number"
      ? `${formatCount(statistics.totalBranches)} Branch${statistics.totalBranches === 1 ? "" : "es"}`
      : "",
    typeof statistics?.totalListings === "number"
      ? `${formatCount(statistics.totalListings)} tombstones available`
      : "",
    typeof statistics?.minimumListingPrice === "number"
      ? `From ${formatPrice(statistics.minimumListingPrice)}`
      : "",
  ].filter(Boolean);

  return parts.join(" · ");
}

function collectManufacturerOptions(
  branches: NonNullable<LocationLandingPageModel>["branches"],
  listings: NonNullable<NonNullable<LocationLandingPageModel>["listings"]>["items"]
) {
  const seen = new Set<string>();
  const options: Array<{ name: string; slug: string | null }> = [];

  for (const item of branches || []) {
    const name = typeof item?.company?.name === "string" ? item.company.name.trim() : "";
    const slug = typeof item?.company?.slug === "string" ? item.company.slug.trim() : "";
    const key = `${name}::${slug}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);
    options.push({ name, slug: slug || null });
  }

  for (const item of listings || []) {
    const name = typeof item?.company?.name === "string" ? item.company.name.trim() : "";
    const slug = typeof item?.company?.slug === "string" ? item.company.slug.trim() : "";
    const key = `${name}::${slug}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);
    options.push({ name, slug: slug || null });
  }

  return options;
}

function paginationRange(currentPage: number, pageCount: number) {
  if (pageCount <= 1) return [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(pageCount, currentPage + 2);
  const pages: number[] = [];
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const segments = (await params)?.segments ?? [];
  const locationInput = (await resolveLocationOption(segments)) || resolveLocationInput(segments);
  if (!locationInput) return {};

  const page = await fetchLocationLandingPage(locationInput.province, locationInput.city, locationInput.town, 1);
  if (!page) return {};

  const title = firstNonEmpty(page.seo?.metaTitle, locationInput.metaTitle, page.seo?.title, locationInput.title) || undefined;
  const description = firstNonEmpty(page.seo?.metaDescription, locationInput.metaDescription);
  const canonicalPath = normalizePath(page.location?.slug);
  const heroImage = firstNonEmpty(page.seo?.heroImageUrl, locationInput.heroImageUrl) || undefined;

  return {
    title,
    description,
    alternates: canonicalPath ? { canonical: toAbsoluteUrl(canonicalPath) } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath ? toAbsoluteUrl(canonicalPath) : undefined,
      images: heroImage ? [heroImage] : undefined,
    },
  };
}

export default async function LocationLandingPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<RouteSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const segments = resolvedParams?.segments ?? [];
  const locationInput = (await resolveLocationOption(segments)) || resolveLocationInput(segments);

  if (!locationInput) notFound();

  const requestedPage = parsePageNumber(resolvedSearchParams?.page);
  const page = await fetchLocationLandingPage(
    locationInput.province,
    locationInput.city,
    locationInput.town,
    requestedPage
  );

  if (!page) notFound();

  const currentPath = normalizePath(`/locations/${segments.join("/")}`);
  const canonicalPath = normalizePath(page.location?.slug);
  if (canonicalPath && canonicalPath !== currentPath) {
    const target = requestedPage > 1 ? `${canonicalPath}?page=${requestedPage}` : canonicalPath;
    redirect(target);
  }

  const seoTitle = firstNonEmpty(page.seo?.title, locationInput.title, page.location?.town);
  const intro = firstNonEmpty(locationInput.intro, page.seo?.intro);
  const heroImage = firstNonEmpty(page.seo?.heroImageUrl, locationInput.heroImageUrl);
  const branches = Array.isArray(page.branches) ? page.branches : [];
  const listingItems = Array.isArray(page.listings?.items) ? page.listings.items : [];
  const pagination = page.listings?.pagination;
  const locationFaqs = await fetchLocationFaqs(locationInput.town);
  const faq =
    locationFaqs.length > 0
      ? locationFaqs.filter((item) => item?.question && item?.answer)
      : Array.isArray(page.faq)
        ? page.faq.filter((item) => item?.question && item?.answer)
        : [];
  const nearbyLocations = Array.isArray(page.nearbyLocations) ? page.nearbyLocations : [];
  const breadcrumbItems = Array.isArray(page.location?.breadcrumb) ? page.location.breadcrumb : [];
  const pageCount =
    typeof pagination?.pageCount === "number" && Number.isFinite(pagination.pageCount) ? pagination.pageCount : 1;
  const currentPage =
    typeof pagination?.page === "number" && Number.isFinite(pagination.page) ? pagination.page : requestedPage;
  const pageNumbers = paginationRange(currentPage, pageCount);
  const pathname = canonicalPath || currentPath || "/locations";
  const statLine = buildStatLine(page.statistics);
  const manufacturerOptions = collectManufacturerOptions(branches, listingItems);
  const locationLabel = [page.location?.town, page.location?.city, page.location?.province]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(", ");
  const nearbyLocalBusinesses = (
    await fetchNearbyLocalBusinesses(
      page.location?.province || locationInput.province,
      page.location?.town || locationInput.town
    )
  ).map((item) => ({
    documentId: item?.documentId ?? null,
    name: firstNonEmpty(item?.name, "Local business"),
    businessType: item?.businessType ?? null,
    description: stripHtml(item?.description),
    phone: typeof item?.phone === "string" ? item.phone.trim() : "",
    mobile: typeof item?.mobile === "string" ? item.mobile.trim() : "",
    email: typeof item?.email === "string" ? item.email.trim() : "",
    website: typeof item?.website === "string" ? item.website.trim() : "",
    whatsapp: typeof item?.whatsapp === "string" ? item.whatsapp.trim() : "",
    streetAddress: typeof item?.streetAddress === "string" ? item.streetAddress.trim() : "",
    postalCode: typeof item?.postalCode === "string" ? item.postalCode.trim() : "",
  }));

  const pageHref = (pageNumber: number) => (pageNumber <= 1 ? pathname : `${pathname}?page=${pageNumber}`);

  return (
    <div className="bg-white text-[#1f2933]">
      <LocationHeader />
      <LocationSearchStrip locationLabel={locationLabel || "Location"} manufacturers={manufacturerOptions} />

      <div className="mx-auto max-w-[1040px] px-4 py-5 sm:px-6 lg:px-8">
        <Breadcrumb className="text-[11px]">
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const label = typeof item?.label === "string" ? item.label.trim() : "";
              if (!label) return null;
              const href = toInternalSlugPath(item?.slug);
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <Fragment key={`${label}-${index}`}>
                  <BreadcrumbItem>
                    {isLast || !href ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <section className="mt-3">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">{seoTitle}</h1>
          {statLine ? <p className="mt-1 text-sm text-[#374151]">{statLine}</p> : null}
          <div className="mt-3 overflow-hidden border border-slate-200 bg-slate-100">
            {heroImage ? (
              <div className="relative h-[160px] sm:h-[220px]">
                <Image src={heroImage} alt={seoTitle} fill className="object-cover" unoptimized priority />
              </div>
            ) : (
              <div className="flex h-[160px] items-center justify-center text-sm text-slate-500 sm:h-[220px]">
                No town image available
              </div>
            )}
          </div>
          {intro ? (
            <div className="mt-3 max-w-[930px] text-[13px] leading-6 text-[#374151]">
              <p>{stripHtml(intro)}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="text-lg font-semibold text-[#111827]">Branches Serving {page.location?.town || "This Town"}</h2>
          <div className="mt-3 space-y-3">
            {branches.map((item, index) => {
              const branchName =
                typeof item?.branch?.name === "string" && item.branch.name.trim()
                  ? item.branch.name.trim()
                  : "Branch";
              const companyName =
                typeof item?.company?.name === "string" && item.company.name.trim()
                  ? item.company.name.trim()
                  : "";
              const companyHref = toCompanyHref(item?.company?.slug);
              const address = typeof item?.address === "string" ? item.address.trim() : "";
              const phone = typeof item?.phone === "string" ? item.phone.trim() : "";
              const logoUrl = typeof item?.logo?.url === "string" ? item.logo.url.trim() : "";
              const hours = hoursRows(item?.openingHours);

              return (
                <article
                  key={`${item?.branch?.documentId || item?.company?.documentId || branchName}-${index}`}
                  className="border border-slate-200 bg-white p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-slate-200 bg-slate-50">
                      {logoUrl ? (
                        <Image src={logoUrl} alt={companyName || branchName} fill className="object-cover" unoptimized />
                      ) : <div className="flex h-full items-center justify-center text-[10px] text-slate-400">Logo</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-[#111827]">
                          {[companyName || "Manufacturer", branchName && branchName !== companyName ? branchName : ""]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                        {companyHref ? (
                          <Link href={companyHref} className="inline-block text-xs font-semibold text-[#0e6d80] hover:underline">
                            View Branch Page
                          </Link>
                        ) : null}
                      </div>
                      {address ? <p className="mt-2 text-[13px] leading-5 text-[#374151]">{address}</p> : null}
                      {phone ? <p className="mt-1 text-[12px] text-[#4b5563]">{phone}</p> : null}
                      {hours.length ? (
                        <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#4b5563]">
                          {hours.map((row) => (
                            <div key={row.label} className="flex gap-1">
                              <dt className="font-medium text-[#111827]">{row.label}:</dt>
                              <dd>{row.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
            {!branches.length ? (
              <div className="border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No branch details were returned for this location.
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex flex-col gap-1">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">
                Tombstones Available via {page.location?.town || "This Area"} Branches
              </h2>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                Browse a selection of granite and marble memorials available through manufacturers serving this area.
              </p>
            </div>
            {typeof pagination?.total === "number" ? (
              <p className="text-[12px] text-[#6b7280]">{formatCount(pagination.total)} total listings</p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {listingItems.map((item, index) => {
              const listing = item?.listing;
              const company = item?.company;
              const branch = item?.branch;
              const listingHref = toListingHref(listing?.slug);
              const companyHref = toCompanyHref(company?.slug);
              const imageUrl =
                typeof listing?.thumbnail?.url === "string" && listing.thumbnail.url.trim()
                  ? listing.thumbnail.url.trim()
                  : "";
              const title =
                typeof listing?.title === "string" && listing.title.trim()
                  ? listing.title.trim()
                  : "Tombstone Listing";
              const companyName =
                typeof company?.name === "string" && company.name.trim() ? company.name.trim() : "";
              const branchName = typeof branch?.name === "string" && branch.name.trim() ? branch.name.trim() : "";
              const branchAddress =
                typeof branch?.address === "string" && branch.address.trim() ? branch.address.trim() : "";
              const logoUrl =
                typeof company?.logo?.url === "string" && company.logo.url.trim() ? company.logo.url.trim() : "";

              return (
                <article
                  key={`${listing?.documentId || title}-${index}`}
                  className="overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-sm"
                >
                  {listingHref ? (
                    <Link href={listingHref} className="block">
                      <div className="relative aspect-[4/3] w-full bg-slate-100">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={title} fill className="object-cover" unoptimized />
                        ) : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">No image</div>}
                      </div>
                    </Link>
                  ) : (
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={title} fill className="object-cover" unoptimized />
                      ) : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-400">No image</div>}
                    </div>
                  )}
                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {listingHref ? (
                          <Link href={listingHref} className="text-sm font-semibold leading-5 text-[#111827] hover:text-[#0e6d80]">
                            {title}
                          </Link>
                        ) : (
                          <h3 className="text-sm font-semibold leading-5 text-[#111827]">{title}</h3>
                        )}
                        {companyName ? (
                          companyHref ? (
                            <Link href={companyHref} className="mt-1 inline-block text-[11px] font-medium text-[#0e6d80] hover:underline">
                              {companyName}
                            </Link>
                          ) : (
                            <p className="mt-1 text-[11px] font-medium text-[#0e6d80]">{companyName}</p>
                          )
                        ) : null}
                      </div>
                      <div className="shrink-0 border border-slate-200 bg-[#f8fafc] px-2 py-1 text-right">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Price</p>
                        <p className="text-sm font-semibold text-[#1d4ed8]">{formatPrice(listing?.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 overflow-hidden border border-slate-200 bg-slate-100">
                        {logoUrl ? (
                          <Image src={logoUrl} alt={companyName || title} fill className="object-cover" unoptimized />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        {branchName ? <p className="text-[11px] font-semibold text-[#111827]">{branchName}</p> : null}
                        {branchAddress ? <p className="text-[11px] leading-4 text-[#6b7280]">{branchAddress}</p> : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {!listingItems.length ? (
              <div className="border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No tombstone listings were returned for this location.
              </div>
            ) : null}
          </div>

          {pageCount > 1 ? (
            <nav className="mt-4 flex flex-wrap items-center gap-2" aria-label="Listings pagination">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={`border px-3 py-2 text-xs font-semibold ${
                  currentPage <= 1
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                Previous
              </Link>
              {pageNumbers.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={pageHref(pageNumber)}
                  className={`border px-3 py-2 text-xs font-semibold ${
                    pageNumber === currentPage
                      ? "border-[#0e6d80] bg-[#0e6d80] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
              <Link
                href={pageHref(Math.min(pageCount, currentPage + 1))}
                aria-disabled={currentPage >= pageCount}
                className={`border px-3 py-2 text-xs font-semibold ${
                  currentPage >= pageCount
                    ? "pointer-events-none border-slate-200 text-slate-300"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                Next
              </Link>
            </nav>
          ) : null}
        </section>

        <NearbyLocationsSection
          townLabel={page.location?.town || "This Town"}
          items={nearbyLocalBusinesses}
        />

        <section className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="text-lg font-semibold text-[#111827]">FAQ about Tombstones and Tombstone Manufacturers in {page.location?.town || "This Town"}</h2>
          <div className="mt-3 space-y-2">
            {faq.map((item, index) => (
              <details key={`${item?.question || "faq"}-${index}`} className="border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#111827]">
                  {item?.question}
                </summary>
                <p className="mt-3 text-[13px] leading-6 text-[#4b5563]">{stripHtml(item?.answer)}</p>
              </details>
            ))}
            {!faq.length ? (
              <div className="border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No FAQ content was returned for this location.
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="text-lg font-semibold text-[#111827]">Looking in a Nearby Area?</h2>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-[13px] text-[#0e6d80]">
            {nearbyLocations.map((item, index) => {
              const href = toInternalSlugPath(item?.slug);
              const label = typeof item?.town === "string" ? item.town.trim() : "";
              if (!href || !label) return null;

              return (
                <Link
                  key={`${href}-${index}`}
                  href={href}
                  className="font-medium hover:underline"
                >
                  [{label}]
                </Link>
              );
            })}
            {!nearbyLocations.length ? (
              <div className="border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No nearby locations were returned for this page.
              </div>
            ) : null}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
