"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_LISTING_BY_ID } from "@/graphql/queries/getListingById";
import ProductShowcase from "@/components/product-showcase";

export default function TombstoneDetail() {
  const { slug: documentId } = useParams();
 
  const { data, loading, error } = useQuery(GET_LISTING_BY_ID, {
    variables: { documentID: documentId},
    skip: !documentId,
  });
 

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading listing.</div>;
  const listing = data?.listing;

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Listing Not Found</h1>
            <p className="mt-4 text-gray-600">The tombstone listing you're looking for doesn't exist.</p>
            <a 
              href="/tombstones-for-sale"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Listings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <ProductShowcase listing={listing} id={documentId} />;
}
