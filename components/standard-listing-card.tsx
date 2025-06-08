"use client"

import Image from "next/image"
import { Heart, Camera, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "./favorite-button"
import { useRouter } from "next/navigation"

type StandardListingCardProps = {
  listing: any
  href?: string
}

export function StandardListingCard({ listing, href = "#" }: StandardListingCardProps) {
  const router = useRouter()
  
  // Convert listing to FavoriteProduct format
  const product = {
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

  const productUrl = href || `/tombstones-for-sale/${listing.id}`

  const handleClick = () => {
    router.push(productUrl)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto mb-6">
      {/* Main content area */}
      <div className="flex min-h-[300px]">
        {/* Left side - Main Image */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className="relative flex-1">
            <div className="relative w-full h-full min-h-[300px]">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />

              {/* Photo Count - adapted for standard card */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {/* Assuming you want to show a placeholder photo count or hide it */}
                <Camera className="w-4 h-4" />
                <span>{listing.image ? 1 : 0}</span> {/* Display 1 if main image exists, 0 otherwise */}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="w-1/2 p-6 bg-gray-50 flex flex-col">
          <div className="flex-1">
            {/* Price and Heart */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-3xl font-bold text-blue-600">{listing.price || "R 8 820"}</div>
              {/* Favorite Button positioned here to match premium card layout */}
              <div onClick={(e) => e.stopPropagation()}>
                 <FavoriteButton product={product} size="sm"/>
              </div>
            </div>

            {/* Badge */}
            <div className="mb-3">
              <Badge className={cn("text-white text-sm px-3 py-1", listing.tagColor || "bg-red-600 hover:bg-red-700")}>
                {listing.tag || "Unique Design"}
              </Badge>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">{listing.title || "CATHEDRAL C14"}</h2>

            {/* Details */}
            <div className="text-sm text-gray-600 mb-3">
              {listing.details || "Full Tombstone | Granite | Cross Theme"}
            </div>

            {/* Features */}
            <div className="text-sm text-gray-600 mb-6">
              {listing.features || "Photo Engraving Available | Self Install & Pick-Up Available"}
            </div>
          </div>

          {/* Manufacturer Information */}
          <div className="space-y-2 mt-auto">
            <div className="font-medium text-gray-900 text-lg">{listing.manufacturer || "Example Tombstone Co."}</div>

            {/* Enquiries - Added a placeholder or similar for standard card */}
            <div className="flex items-center text-gray-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">Enquiries N/A</span> {/* Placeholder for enquiries */}
            </div>

            {/* Location */}
            <div className="text-sm text-gray-600">{listing.location || "Durban North, KZN"}</div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Image
                  src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                  alt="Location Pin Icon"
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span>{listing.distance || "Distance N/A"}</span>
              </div>

              {/* Logo - Placeholder or actual logo if available in listing data */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                   <Image
                      src="/placeholder.svg"
                      alt={`${listing.manufacturer || "Manufacturer"} Logo`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails spanning full width - adapted for standard card */}
    </div>
  )
} 