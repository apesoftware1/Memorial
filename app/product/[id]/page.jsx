import ProductShowcase from "@/components/product-showcase";
import ProductStructuredData from "@/components/ProductStructuredData";
import { notFound, permanentRedirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

function normalizeListingSlug(raw) {
  const decoded = decodeURIComponent(typeof raw === "string" ? raw : "");
  return decoded
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanListingSlug(slug, title) {
  const rawSlug = typeof slug === "string" ? slug.trim() : "";
  if (!rawSlug) return normalizeListingSlug(title);
  const stripped = rawSlug.replace(/(-copy-[a-z0-9]+)+/gi, "").trim();
  if (!stripped || /^[-]*$/.test(stripped)) return normalizeListingSlug(title);
  return normalizeListingSlug(stripped);
}

async function fetchGraphQL(query, variables, revalidate = 3600) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}

async function fetchListingById(documentID) {
  const data = await fetchGraphQL(
    `
      query ListingFast($documentID: ID!) {
        listing(documentId: $documentID) {
          documentId
          title
          mainImageUrl
          mainImagePublicId
          thumbnailUrls
          thumbnailPublicIds
          description
          price
          slug
          manufacturingTimeframe
          isOnSpecial
          specials {
            active
            sale_price
            start_date
            end_date
          }
          listing_category {
            documentId
            name
          }
          productDetails {
            id
            color { id value icon }
            style { id value icon }
            overallStyle { id value icon }
            stoneType { id value icon }
            slabStyle { id value icon }
            customization { id value icon }
          }
          additionalProductDetails {
            id
            transportAndInstallation { id value info }
            foundationOptions { id value info }
            warrantyOrGuarantee { id value info }
            installationGuarantee { id value info }
          }
          inquiries_c { documentId }
          branches(pagination: { limit: 25 }) {
            documentId
            name
          }
          company {
            enableWhatsAppButton
            documentId
            phone
            name
            mapUrl
            location
            latitude
            longitude
            googleRating
            logoUrl
            logoUrlPublicId
            operatingHours {
              id
              monToFri
              saturday
              sunday
              publicHoliday
            }
            sales_reps {
              call
              whatsapp
              name
              avatar { url }
            }
            socialLinks {
              id
              facebook
              website
              instagram
              tiktok
              youtube
              x
              whatsapp
              messenger
            }
          }
        }
      }
    `,
    { documentID },
    300
  );

  return data?.listing || null;
}

function deriveCleanSlug(listing) {
  return cleanListingSlug(listing?.slug, listing?.title);
}

function pickValue(v) {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const first = v.find(Boolean);
    if (!first) return "";
    if (typeof first === "string") return first.trim();
    if (typeof first === "object") return String(first?.value ?? first?.name ?? "").trim();
    return String(first).trim();
  }
  if (typeof v === "object") return String(v?.value ?? v?.name ?? "").trim();
  return String(v).trim();
}

export async function generateMetadata({ params }) {
  const id = (await params)?.id;
  if (!id) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      robots: { index: true, follow: true },
    };
  }

  const listing = await fetchListingById(id);
  const fallbackCanonical = toAbsoluteUrl(`/tombstones-for-sale/${id}`);

  if (!listing) {
    return {
      title: "Listing Not Found | TombstoneFinder",
      alternates: { canonical: fallbackCanonical },
      robots: { index: true, follow: true },
    };
  }

  const cleanSlug = deriveCleanSlug(listing);
  if (cleanSlug) {
    const cleanCanonical = toAbsoluteUrl(`/tombstones/${cleanSlug}`);
    permanentRedirect(`/tombstones/${cleanSlug}`);
    return {
      title: "Tombstone Redirect | TombstoneFinder",
      alternates: { canonical: cleanCanonical },
      robots: { index: true, follow: true },
    };
  }

  const l = listing;

  const colour = pickValue(l?.productDetails?.color);
  const stoneType = pickValue(l?.productDetails?.stoneType);
  const headStyle = pickValue(l?.productDetails?.style) || pickValue(l?.productDetails?.overallStyle);

  const branchLoc = l?.branches?.[0]?.location;
  const rawPlace =
    pickValue(branchLoc?.town) ||
    pickValue(branchLoc?.city) ||
    pickValue(l?.company?.location) ||
    pickValue(l?.location);
  const place = rawPlace ? rawPlace.split(",")[0].trim() : "";

  const spec = [colour, stoneType, headStyle].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const title = spec
    ? `Buy ${spec} Tombstone${place ? ` in ${place}` : ""} | TombstoneFinder`
    : `Buy Tombstone${place ? ` in ${place}` : " in South Africa"} | TombstoneFinder`;

  const description = spec
    ? `View this premium ${spec} memorial${place ? ` available in ${place}` : ""}. Features direct manufacturer pricing, transport options, and full guarantees.`
    : `View this premium tombstone${place ? ` available in ${place}` : ""}. Features direct manufacturer pricing, transport options, and full guarantees.`;

  const image = typeof l?.mainImageUrl === "string" && l.mainImageUrl.trim() ? l.mainImageUrl.trim() : null;

  return {
    title,
    description,
    alternates: { canonical: fallbackCanonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "product",
      url: fallbackCanonical,
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const id = (await params)?.id;
  if (!id) notFound();

  const listing = await fetchListingById(id);
  if (!listing) notFound();

  const cleanSlug = deriveCleanSlug(listing);
  if (cleanSlug) {
    permanentRedirect(`/tombstones/${cleanSlug}`);
  }

  return (
    <>
      <ProductStructuredData listing={listing} />
      <ProductShowcase listing={listing} id={id} />
    </>
  );
}
