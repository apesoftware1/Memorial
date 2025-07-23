"use client"

import Image from "next/image"
import { Heart, Camera, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "./favorite-button"
import { useRouter } from "next/navigation"
import Link from "next/link"

type StandardListingCardProps = {
  listing: any
  href?: string
}

export function StandardListingCard({ listing, href = "#" }: StandardListingCardProps) {
  const router = useRouter()
  
  
  const productUrl = href || `/tombstones-for-sale/${listing.documentId}`

  const handleClick = () => {
    router.push(productUrl)
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto transition-all duration-300 h-full flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-2xl hover:shadow-gray-400 mb-6">
      {/* Mobile Layout (up to 768px) */}
      <div className="relative flex flex-col md:hidden">
        {/* Manufacturer Logo in its own box, bottom right corner (Mobile only) */}
        <div className="absolute bottom-3 right-3 z-20 bg-gray-50 p-2 rounded-lg md:hidden">
          <Image
            src={listing.company.logo?.url || "/placeholder-logo.svg"}
            alt={listing.company.name + " Logo"}
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
        {/* Main Image Container */}
        <div className="bg-white px-3 py-3">
          <div className="relative h-[350px] w-full rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={listing.mainImage?.url || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw"
            />
            {/* Camera icon and counter overlay for main image */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
              <Camera className="w-4 h-4" />
              <span>1</span>
            </div>
          </div>
        </div>
        {/* Content (Mobile) */}
        <div className="w-full px-4 pt-4 pb-2 bg-gray-50 flex flex-col">
          {/* Price, Badge */}
          <div className="flex flex-col items-start mb-3">
            <div className="text-2xl font-bold text-blue-600">R{listing.price || "8 820"}</div>
            <div className="mt-1 mb-0">
              <Badge className={cn("text-white text-xs px-2 py-0.5 rounded", listing.tagColor || "bg-red-600")}>{listing.tag || "Unique Design"}</Badge>
            </div>
          </div>
          {/* Title, Details, Features */}
          <h2 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h2>
          {/* --- Product Details Section (compact, styled like screenshot) --- */}
          <div className="space-y-0.5 mb-2">
            {/* First line: Full Tombstone (bold if present), stoneType, style/theme, culture */}
            <div className="text-xs text-gray-700">
              <strong>Full Tombstone</strong>
              {listing.productDetails?.stoneType && Array.isArray(listing.productDetails.stoneType) && listing.productDetails.stoneType.length > 0 && listing.productDetails.stoneType[0]?.value && (
                <>| {listing.productDetails.stoneType[0].value}</>
              )}
              {listing.productDetails?.style && Array.isArray(listing.productDetails.style) && listing.productDetails.style.length > 0 && listing.productDetails.style[0]?.value && (
                <>| {listing.productDetails.style[0].value}</>
              )}
            </div>
            {/* Second line: Customization, Color, Features */}
            <div className="text-xs text-gray-700">
              {listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value && (
                <>{listing.productDetails.customization[0].value}</>
              )}
              {listing.productDetails?.color && Array.isArray(listing.productDetails.color) && listing.productDetails.color.length > 0 && listing.productDetails.color[0]?.value && (
                <>{listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value ? " | " : ""}{listing.productDetails.color[0].value}</>
              )}
              {listing.features && (
                <>{(listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value) || (listing.productDetails?.color && Array.isArray(listing.productDetails.color) && listing.productDetails.color.length > 0 && listing.productDetails.color[0]?.value) ? " | " : ""}{listing.features}</>
              )}
            </div>
          </div>
          {/* Manufacturer Information (Mobile) */}
          <div className="flex flex-col mt-0">
            <div className="font-medium text-gray-900 text-base mb-2">{listing.company.name}</div>
            <div className="flex items-center text-green-600 mb-1">
              <Check className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Enquiries N/A</span>
            </div>
            <div className="text-xs text-gray-600 mb-1 mt-2">{listing.location || "Pretoria, Gauteng"}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <Image
                src={"/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"}
                alt="Location Pin Icon"
                width={14}
                height={14}
                className="object-contain"
              />
              <span>{listing.distance || "Distance N/A"}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Layout (unchanged) */}
      <div className="hidden sm:flex-row md:flex min-h-[360px]">
        {/* Left side - Main Image */}
        <div className="w-full sm:w-1/2 flex-shrink-0 flex flex-col">
          <div className="relative flex-1">
            <div className="relative w-full h-full min-h-[360px]">
              <Image
                src={listing.mainImage?.url || "/placeholder.svg"}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
              {/* Photo Count - adapted for standard card */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                <Camera className="w-4 h-4" />
                <span>{listing.mainImage ? 1 : 0}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right side - Content */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className="flex-1 p-4 flex flex-col">
            {/* Split into two columns for desktop: left for info, right for logo */}
            <div className="flex flex-row h-full">
              {/* Left column: info */}
              <div className="flex-1 flex flex-col">
            {/* Price and Heart */}
            <div className="flex flex-col items-start mb-3">
              <div className="text-2xl font-bold text-blue-600">R{listing.price || "8 820"}</div>
              <div className="mt-0">
                <Badge className={cn("text-white text-xs px-2 py-0.5 rounded", listing.tagColor || "bg-red-600")}>{listing.tag || "Unique Design"}</Badge>
              </div>
            </div>
            {/* Title, Details, Features */}
            <h2 className="text-lg font-bold text-gray-900 mb-2">{listing.title}</h2>
            {/* --- Product Details Section (compact, styled like screenshot) --- */}
            <div className="space-y-0.5 mb-2">
              {/* First line: Full Tombstone (bold if present), stoneType, style/theme, culture */}
              <div className="text-xs text-gray-700">
                <strong>Full Tombstone</strong>
                {listing.productDetails?.stoneType && Array.isArray(listing.productDetails.stoneType) && listing.productDetails.stoneType.length > 0 && listing.productDetails.stoneType[0]?.value && (
                  <>| {listing.productDetails.stoneType[0].value}</>
                )}
                {listing.productDetails?.style && Array.isArray(listing.productDetails.style) && listing.productDetails.style.length > 0 && listing.productDetails.style[0]?.value && (
                  <>| {listing.productDetails.style[0].value}</>
                )}
              </div>
              {/* Second line: Customization, Color, Features */}
              <div className="text-xs text-gray-700">
                {listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value && (
                  <>{listing.productDetails.customization[0].value}</>
                )}
                {listing.productDetails?.color && Array.isArray(listing.productDetails.color) && listing.productDetails.color.length > 0 && listing.productDetails.color[0]?.value && (
                  <>{listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value ? " | " : ""}{listing.productDetails.color[0].value}</>
                )}
                {listing.features && (
                  <>{(listing.productDetails?.customization && Array.isArray(listing.productDetails.customization) && listing.productDetails.customization.length > 0 && listing.productDetails.customization[0]?.value) || (listing.productDetails?.color && Array.isArray(listing.productDetails.color) && listing.productDetails.color.length > 0 && listing.productDetails.color[0]?.value) ? " | " : ""}{listing.features}</>
                )}
              </div>
            </div>
            {/* Manufacturer Information (Desktop) */}
                <div className="flex flex-col mt-8 flex-1">
                  <div>
            <div className="font-medium text-gray-900 text-base mb-2">{listing.company.name}</div>
                    <div className="flex items-center text-green-600 mb-1">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Enquiries N/A</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1 mt-2">{listing.location || "Pretoria, Gauteng"}</div>
              </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600 mt-4">
                <Image
                      src={"/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"}
                  alt="Location Pin Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span>{listing.distance || "Distance N/A"}</span>
                  </div>
                </div>
              </div>
              {/* Right column: logo (desktop only) */}
              <div className="w-1/3 flex-shrink-0 flex flex-col items-end justify-end hidden md:flex">
                <Image
                  src={listing.company.logo?.url || "/placeholder-logo.svg"}
                  alt={listing.company.name + " Logo"}
                  width={150}
                  height={100}
                  className="object-contain mt-auto mb-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 