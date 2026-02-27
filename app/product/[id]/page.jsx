import ProductShowcase from "@/components/product-showcase";
import ProductStructuredData from "@/components/ProductStructuredData";
import LoadingIndicator from "@/components/LoadingIndicator";

// This is a Server Component
export default async function ProductPage({ params }) {
  const { id } = await params;
  let listing = null;
  let error = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
    const response = await fetch(`${baseUrl}/listings/${id}`, {
      cache: "force-cache",
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      // If 404 or other error, we might want to handle it gracefully
      // For now, we'll just set error state like before
      throw new Error("Failed to fetch listing");
    }
    
    const data = await response.json();
    listing = data.data || data;
  } catch (err) {
    console.error("Error fetching listing:", err);
    error = err.message;
  }

  if (error) {
    return <div className="text-center p-8">Error: {error}</div>;
  }

  if (!listing) {
    return <div className="text-center p-8">Listing not found</div>;
  }

  return (
    <>
      <ProductStructuredData listing={listing} />
      <ProductShowcase listing={listing} id={id} />
    </>
  );
}
