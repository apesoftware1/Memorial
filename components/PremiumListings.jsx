"use client"

import { PremiumListingCard } from "@/components/premium-listing-card"

export default function PremiumListings({ listings }) {
  return (
    <div className="space-y-6">
      {listings.map((listing, index) => (
        <PremiumListingCard 
          key={listing.documentId} 
          listing={listing} 
          href={`/tombstones-for-sale/${listing.documentId}`}
          isFirstCard={index === 0}
        />
      ))}
    </div>
  )
} 