"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "./favorite-button"
import type { FavoriteProduct } from "@/context/favorites-context"
import Link from "next/link"

type PremiumListingCardProps = {
  listing: any
  href?: string
}

export function PremiumListingCard({ listing, href = "#" }: PremiumListingCardProps) {
  // Get thumbnails from listing or create placeholders first
  const thumbnails = listing.thumbnailImages || Array(6).fill("/placeholder.svg?height=80&width=80")

  // Initialize selectedImage state to show the main image by default (index equal to the number of thumbnails)
  const [selectedImage, setSelectedImage] = useState(thumbnails.length)
  
  // Convert listing to FavoriteProduct format and ensure it has an id
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

  const productUrl = href || `/tombstones-for-sale/${listing.id}`

  return (
    <div className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-md p-3 max-w-3xl mx-auto bg-white mb-6">
      <div className="w-full md:w-1/2">
        <div className="relative">
          <Link href={productUrl}>
          <div className="bg-gray-100 aspect-square relative rounded overflow-hidden max-w-[250px]">
            <Image
              src={selectedImage < thumbnails.length ? thumbnails[selectedImage] : product.image}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            </div>
          </Link>
          <div className="absolute top-2 right-2">
            <FavoriteButton product={product} size="sm"/>
          </div>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {thumbnails.map((src: string, index: number) => (
              <button
                key={index}
                className={cn(
                  "bg-gray-100 aspect-square relative rounded overflow-hidden border-2 transition-colors",
                  selectedImage === index ? "border-blue-500" : "border-transparent hover:border-gray-300"
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <div className="flex flex-col h-full">
          <Link href={productUrl}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-blue-700 font-medium text-xl">{listing.price || "R 8 820"}</div>
              <h1 className="text-xl font-bold mt-1">{listing.title || "CATHEDRAL C14"}</h1>
            </div>
            <Badge className={cn("text-white hover:opacity-90 flex-shrink-0", listing.tagColor || "bg-red-600 hover:bg-red-700")}>
              {listing.tag || "Unique Design"}
            </Badge>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-1">{listing.details || "Full Tombstone | Granite | Cross Theme"}</p>
            <p className="text-gray-700">{listing.features || "Photo Engraving Available | Self Install & Pick-Up Available"}</p>
          </div>
          </Link>

          <div className="border-t pt-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mt-32">
                <h2 className="font-medium text-gray-900">{listing.manufacturer || "Example Tombstone Co."}</h2>
                <div className="flex items-center text-green-600 mt-1">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{listing.enquiries || "21"} enquiries to this Manufacturer</span>
                </div>
                <div className="text-gray-600 text-sm mt-1">{listing.location || "Durban North, KZN"}</div>
                <div className="text-blue-600 text-sm flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  {listing.distance || "38km from you"}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 mt-32">
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
    </div>
  )
}