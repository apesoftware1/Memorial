"use client"

import React, { useState, useCallback } from "react"
import Image from "next/image"
import { Heart, MapPin, Camera, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FavoriteProduct } from "@/context/favorites-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export function PremiumListingCard({ listing, href = "#" }: PremiumListingCardProps): React.ReactElement {
  const router = useRouter()

  // Ensure we always have exactly 6 thumbnails
  const defaultThumbnails = Array(6).fill("/placeholder.svg?height=80&width=120")
  const thumbnails = listing.thumbnailImages?.slice(0, 6) || defaultThumbnails
  const paddedThumbnails = [...thumbnails, ...defaultThumbnails].slice(0, 6)

  // Convert listing to FavoriteProduct format
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
      {/* Main content area */}
      <div className="flex min-h-[300px]">
        {/* Left side - Main Image */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className="relative flex-1">
            <Link href={productUrl}>
              <div className="relative w-full h-full min-h-[300px]">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Photo Count - only on left side */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  <Camera className="w-4 h-4" />
                  <span>{thumbnails.length}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="w-1/2 p-6 bg-gray-50 flex flex-col">
          <Link href={productUrl} className="flex-1">
            {/* Price and Heart */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-3xl font-bold text-blue-600">{listing.price}</div>
              <Heart className="w-6 h-6 text-gray-400" />
            </div>

            {/* Badge */}
            <div className="mb-3">
              <Badge className={cn("text-white text-sm px-3 py-1", listing.tagColor)}>
                {listing.tag}
              </Badge>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">{listing.title}</h2>

            {/* Details */}
            <div className="text-sm text-gray-600 mb-3">
              {listing.details}
            </div>

            {/* Features */}
            <div className="text-sm text-gray-600 mb-6">
              {listing.features}
            </div>
          </Link>

          {/* Manufacturer Information */}
          <div className="space-y-2 mt-auto">
            <div className="font-medium text-gray-900 text-lg">{listing.manufacturer}</div>

            {/* Enquiries */}
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.enquiries} enquiries to this Manufacturer</span>
            </div>

            {/* Location */}
            <div className="text-sm text-gray-600">{listing.location}</div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Image
                  src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                  alt="Location Pin Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span>{listing.distance}</span>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <Image
                  src="/new files/company logos/Tombstone Manufacturer Logo-SwissStone.svg"
                  alt="Tombstone Manufacturer Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails spanning full width */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="grid grid-cols-6 gap-3">
          {paddedThumbnails.map((src: string, index: number) => (
            <button
              key={index}
              className={cn(
                "relative aspect-[4/3] rounded overflow-hidden border-2 transition-colors",
                "border-gray-200 hover:border-gray-300"
              )}
              // On thumbnail click, navigate to the product detail page
              onClick={() => router.push(productUrl)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={src}
                alt={`View ${index + 1}`}
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
 