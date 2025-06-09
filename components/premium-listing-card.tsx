"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Camera, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FavoriteProduct } from "@/context/favorites-context"

interface PremiumListing {
  id?: string
  title: string
  price: string
  image: string
  details: string
  features: string
  manufacturer: string
  location: string
  tag: string
  tagColor: string
  thumbnailImages?: string[]
  enquiries?: string
  distance?: string
}

interface PremiumListingCardProps {
  listing: PremiumListing
  href?: string
}

export function PremiumListingCard({
  listing,
  href,
}: PremiumListingCardProps): React.ReactElement {
  const router = useRouter()

  const defaultThumbnail = "/placeholder.svg?height=80&width=120"
  const thumbnails = listing.thumbnailImages?.slice(0, 6) ?? []
  const paddedThumbnails = [...thumbnails, ...Array(6 - thumbnails.length).fill(defaultThumbnail)]

  const product: FavoriteProduct = {
    id: listing.id || listing.title.replace(/\s+/g, "-").toLowerCase(),
    title: listing.title,
    price: listing.price,
    image: listing.image,
    details: listing.details,
    features: listing.features,
    manufacturer: listing.manufacturer,
    location: listing.location,
    tag: listing.tag,
    tagColor: listing.tagColor,
  }

  const productUrl = href || `/tombstones/${listing.id}`

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      <div className="flex min-h-[300px]">
        {/* Left - Main Image */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className="relative flex-1 min-h-[300px]">
            <Link href={productUrl}>
              <div className="relative w-full h-full">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  <Camera className="w-4 h-4" />
                  <span>{listing.thumbnailImages?.length ?? 0}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right - Content */}
        <div className="w-1/2 px-6 pt-6 pb-4 bg-gray-50 flex flex-col">
          <Link href={productUrl}>
            {/* Price and Heart */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-3xl font-bold text-blue-600">{listing.price}</div>
              <Heart className="w-12 h-6 text-gray-400" />
            </div>

            {/* Badge */}
            <div className="mb-3">
              <Badge className={cn("text-white text-sm px-3 py-1", listing.tagColor)}>
                {listing.tag}
              </Badge>
            </div>

            {/* Title, Details, Features */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">{listing.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{listing.details}</p>
            <p className="text-sm text-gray-600 mb-2">{listing.features}</p>
            <p className="text-sm text-gray-600 mb-6">3 weeks manufacturing time</p>
          </Link>

          {/* Manufacturer Information - RESTRUCTURED FOR COLUMNS */}
          <div className="flex justify-between items-stretch space-x-4 mt-20">
            {/* Left Column for text details */}
            <div className="flex-1 space-y-1.5 pt-6 pb-2">
            <div className="font-medium text-gray-900 text-lg">{listing.manufacturer}</div>

              {listing.enquiries && (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
                  <span>{listing.enquiries} enquiries to this Manufacturer</span>
            </div>
              )}

            <div className="text-sm text-gray-600">{listing.location}</div>

              <div className="flex items-center gap-1 text-sm text-blue-600 mt-3">
                <Image
                  src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                  alt="Location Pin Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span>{listing.distance}</span>
              </div>
              </div>

            {/* Right Column for Logo */}
            <div className="w-1/4 flex-shrink-0 flex flex-col items-end justify-end">
                <Image
                  src="/new files/company logos/Tombstone Manufacturer Logo-SwissStone.svg"
                  alt="Tombstone Manufacturer Logo"
                width={150}
                height={300}
                className="object-contain mt-auto mb-2"
                />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnails */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="grid grid-cols-6 gap-3">
          {paddedThumbnails.map((src, index) => (
            <button
              key={index}
              className="relative aspect-[4/3] rounded overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
              onClick={() => router.push(productUrl)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
 