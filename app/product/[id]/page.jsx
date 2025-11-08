"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductShowcase from "@/components/product-showcase";
import ProductStructuredData from "@/components/ProductStructuredData";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function ProductPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        // Using the correct API endpoint
        const response = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const data = await response.json();
        // Extract the actual listing data from the response
        const listingData = data.data || data;
        setListing(data);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return <LoadingIndicator />;
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