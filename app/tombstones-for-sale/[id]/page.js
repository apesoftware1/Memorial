"use client"

import React from 'react';
import { premiumListings } from '@/lib/data';
import ProductShowcase from '@/components/product-showcase';

export default function TombstoneDetail({ params }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const listing = premiumListings.find(listing => listing.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Listing Not Found</h1>
            <p className="mt-4 text-gray-600">The tombstone listing you're looking for doesn't exist.</p>
            <Link 
              href="/tombstones-for-sale"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductShowcase listing={listing} />;
}
