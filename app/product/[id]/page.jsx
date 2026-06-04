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
  const canonical = toAbsoluteUrl(`/tombstones-for-sale/${id}`);
  if (!listing) {
    return { title: "Listing Not Found | TombstoneFinder", alternates: { canonical } };
  }
  const titleRaw = String(listing?.title ?? "").trim();
  const title = titleRaw ? `${titleRaw} | TombstoneFinder` : "Tombstone Listing | TombstoneFinder";
  const description = String(listing?.description ?? "").trim() || "View pricing and details for this tombstone.";
  const image = typeof listing?.mainImageUrl === "string" && listing.mainImageUrl.trim() ? listing.mainImageUrl.trim() : null;
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
