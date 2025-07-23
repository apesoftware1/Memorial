"use client"

import Link from "next/link"
import { StandardListingCard } from "@/components/standard-listing-card"

export default function StandardListings({ listings }) {
  return (
    <div className="space-y-6">
      {listings.map((listing) => (
        <Link key={listing.documentId} href={`/tombstones-for-sale/${listing.documentId}`}>
          <StandardListingCard listing={listing} />
        </Link>
      ))}
    </div>
  )
} 