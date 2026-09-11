"use client"

import Link from "next/link"
import { StandardListingCard } from "@/components/standard-listing-card"
import { buildListingCanonicalHref } from "@/lib/slugs"

export default function StandardListings({ listings }) {
  return (
    <div className="space-y-6">
      {listings.map((listing) => {
        const canonicalHref = buildListingCanonicalHref(listing);
        const href = canonicalHref || `/tombstones-for-sale/${listing.documentId}`;
        return (
          <Link key={listing.documentId} href={href}>
            <StandardListingCard listing={listing} />
          </Link>
        );
      })}
    </div>
  )
} 