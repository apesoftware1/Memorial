"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Camera, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FavoriteProduct } from "@/context/favorites-context"
import { FavoriteButton } from "./favorite-button"
import { manufacturerLogos, getManufacturerSlug } from "@/lib/data"

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
  isFirstCard?: boolean
}

export function PremiumListingCard({
  listing,
  href,
  isFirstCard = false,
}: PremiumListingCardProps & { isFirstCard?: boolean }): React.ReactElement {
  const router = useRouter()
  const [currentMainImage, setCurrentMainImage] = React.useState(listing.image)

  React.useEffect(() => {
    setCurrentMainImage(listing.image)
  }, [listing.image])

  const defaultThumbnail = "/placeholder.svg?height=80&width=120"
  const thumbnails = listing.thumbnailImages?.slice(0, 6) ?? []
  const paddedThumbnails = [...thumbnails, ...Array(6 - thumbnails.length).fill(defaultThumbnail)]

  // Create array of all images for mobile thumbnails (main image + thumbnails)
  const allImages = [listing.image, ...(listing.thumbnailImages || [])]

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

  const logoSrc = manufacturerLogos[listing.manufacturer as keyof typeof manufacturerLogos] || "/placeholder-logo.svg"
  const profileSlug = getManufacturerSlug(listing.manufacturer)
  const profileUrl = `/manufacturers/manufacturers-Profile-Page/${profileSlug}`

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto hover:shadow-md hover:ring-2 hover:ring-[#D4AF37] transition-all duration-300 h-full flex flex-col">
      {/* Mobile Layout (up to 768px) */}
      <div className="relative flex flex-col md:hidden">
        {/* Manufacturer Logo in its own box, bottom right corner (Mobile only) */}
        <div className="absolute bottom-3 right-3 z-20 bg-gray-50 p-2 rounded-lg md:hidden">
          <Link href={profileUrl} prefetch={false} aria-label={`View ${listing.manufacturer} profile`}>
            <Image
              src={logoSrc}
              alt={`${listing.manufacturer} Logo`}
              width={96}
              height={96}
              className="object-contain"
            />
          </Link>
        </div>
        {/* Main Image Container */}
        <div className="bg-white px-3 py-3">
          <Link href={productUrl}>
            <div className="relative h-[350px] w-full rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={currentMainImage}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw"
              />
              {/* Camera icon and counter overlay for main image */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
                <Camera className="w-4 h-4" />
                <span>{allImages.length}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Thumbnails Row Below Main Image (Mobile) */}
        <div className="bg-white px-3 pb-3">
          <div className="relative">
            <div className="flex flex-row gap-1">
              {allImages.slice(1, 4).map((src: string, index: number) => (
                <button
                  key={index}
                  className="relative flex-1 aspect-[4/3] rounded overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
                  onClick={() => setCurrentMainImage(src)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content (Mobile) */}
        <div className="w-full px-4 pt-4 pb-2 bg-gray-50 flex flex-col">
          <Link href={productUrl}>
            {/* Price and Heart (Mobile) */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-2xl font-bold text-blue-600">{listing.price}</div>
              <div onClick={e => e.stopPropagation()}>
                <FavoriteButton product={product} size="md" />
              </div>
            </div>

            {/* Badge (Mobile) */}
            <div className="mb-2">
              <Badge className={cn("text-white text-xs px-2 py-0.5", listing.tagColor)}>
                {listing.tag}
              </Badge>
            </div>

            {/* Title, Details, Features (Mobile) */}
            <h2 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h2>
            <p className="text-xs text-gray-600 mb-1">
              {listing.details.includes("Full Tombstone") ? (
                <>
                  <strong>Full Tombstone</strong>{listing.details.replace("Full Tombstone", "")}
                </>
              ) : (
                listing.details
              )}
            </p>
            <p className="text-xs text-gray-600 mb-1">{listing.features}</p>
            <p className="text-xs text-gray-600 mb-4">3 weeks manufacturing time</p>
          </Link>

          {/* Manufacturer Information (Mobile) */}
          <div className="flex flex-col mt-0">
            <Link href={profileUrl} prefetch={false} className="font-medium text-gray-900 text-base mb-2 underline" aria-label={`View ${listing.manufacturer} profile`}>
              {listing.manufacturer}
            </Link>
            <div className="space-y-1.5">
              {listing.enquiries && (
                <div className="flex items-center text-green-600">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">{listing.enquiries} enquiries to this Manufacturer</span>
                </div>
              )}
              <div className="text-xs text-gray-600">{listing.location}</div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                <Image
                  src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                  alt="Location Pin Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span>{listing.distance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (768px and up) */}
      <div className="hidden md:flex min-h-[300px]">
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
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className="flex-1 p-4 flex flex-col">
            <Link href={productUrl} className="flex-1">
              {/* Price and Heart */}
              <div className="flex justify-between items-start mb-3">
                <div className="text-2xl font-bold text-blue-600">{listing.price}</div>
                <div onClick={e => e.stopPropagation()}>
                  <FavoriteButton product={product} size="md" />
                </div>
              </div>

              {/* Badge */}
              <div className="mb-2">
                <Badge className={cn("text-white text-xs px-2 py-0.5", listing.tagColor)}>
                  {listing.tag}
                </Badge>
              </div>

              {/* Title, Details, Features */}
              <h2 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h2>
              <p className="text-xs text-gray-600 mb-1">
                {listing.details.includes("Full Tombstone") ? (
                  <>
                    <strong>Full Tombstone</strong>{listing.details.replace("Full Tombstone", "")}
                  </>
                ) : (
                  listing.details
                )}
              </p>
              <p className="text-xs text-gray-600 mb-1">{listing.features}</p>
              <p className="text-xs text-gray-600 mb-4">3 weeks manufacturing time</p>
            </Link>

            {/* Manufacturer Information (Desktop) */}
            <div className="flex justify-between items-stretch space-x-4 mt-2">
              {/* Left Column for text details */}
              <div className="flex-1 space-y-1.5">
                <Link href={profileUrl} prefetch={false} className="font-medium text-gray-900 text-base mb-2 underline" aria-label={`View ${listing.manufacturer} profile`}>
                  {listing.manufacturer}
                </Link>
                {listing.enquiries && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">{listing.enquiries} enquiries to this Manufacturer</span>
                  </div>
                )}
                <div className="text-xs text-gray-600">{listing.location}</div>
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                  <Image
                    src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                    alt="Location Pin Icon"
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                  <span>{listing.distance}</span>
                </div>
              </div>
              {/* Right Column for Logo (Desktop only) */}
              <div className="w-1/3 flex-shrink-0 flex flex-col items-end justify-end hidden md:flex">
                <Link href={profileUrl} prefetch={false} aria-label={`View ${listing.manufacturer} profile`}>
                  <Image
                    src={logoSrc}
                    alt={`${listing.manufacturer} Logo`}
                    width={150}
                    height={300}
                    className="object-contain mt-auto mb-2"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnails - Desktop only */}
      <div className="hidden md:block p-4 bg-white border-t border-gray-100">
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
 