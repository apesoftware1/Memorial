import ProductShowcase from "@/components/product-showcase";
import ProductStructuredData from "@/components/ProductStructuredData";
import { notFound } from "next/navigation";

// This is a Server Component
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function fetchListing(id) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
  const response = await fetch(`${baseUrl}/listings/${id}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.data || data || null;
}

export async function generateMetadata({ params }) {
  const id = params?.id;
  if (!id) return {};

  const listing = await fetchListing(id);
  const canonical = toAbsoluteUrl(`/product/${id}`);

  if (!listing) {
    return { title: "Listing Not Found | TombstoneFinder", alternates: { canonical } };
  }

  const l = listing?.attributes && typeof listing?.attributes === "object"
    ? {
        ...listing.attributes,
        documentId: listing?.documentId ?? listing?.id ?? listing?.attributes?.documentId ?? listing?.attributes?.id,
      }
    : listing;

  const pickValue = (v) => {
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
  };

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
    alternates: { canonical },
    openGraph: {
      type: "product",
      url: canonical,
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const id = params?.id;
  if (!id) notFound();

  const listing = await fetchListing(id);
  if (!listing) notFound();

  return (
    <>
      <ProductStructuredData listing={listing} />
      <ProductShowcase listing={listing} id={id} />
    </>
  );
}
