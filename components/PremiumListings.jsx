"use client"

import { PremiumListingCard } from "@/components/premium-listing-card"
import { buildListingCanonicalHref } from "@/lib/slugs"

export default function PremiumListings({ listings }) {
  return (
    <div className="space-y-6">
      {listings.map((listing, index) => {
        const canonicalHref = buildListingCanonicalHref(listing);
        const href = canonicalHref || `/tombstones-for-sale/${listing.documentId}`;
        return (
          <PremiumListingCard 
            key={listing.documentId} 
            listing={listing} 
            href={href}
            isFirstCard={index === 0}
          />
        );
      })}
    </div>
  )
} 