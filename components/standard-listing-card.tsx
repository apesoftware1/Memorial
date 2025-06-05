"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
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
    <div 
      className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-md p-4 max-w-4xl mx-auto bg-white mb-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="w-full md:w-1/3">
        <div className="bg-gray-100 aspect-square relative rounded overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton product={product} size="sm"/>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <div className="flex flex-col h-full">
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

          <div className="mt-auto border-t pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-gray-900">{listing.manufacturer || "Example Tombstone Co."}</h2>
                <div className="text-gray-600 text-sm mt-1">{listing.location || "Durban North, KZN"}</div>
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <Image
                    src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                    alt="Location Pin Icon"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  <span>{listing.distance || "38km from you"}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
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