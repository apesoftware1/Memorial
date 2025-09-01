"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Camera, Check, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FavoriteProduct } from "@/context/favorites-context";
import { FavoriteButton } from "./favorite-button";
import LocationTrigger from "./LocationTrigger";
import { useGuestLocation } from "@/hooks/useGuestLocation";

import { formatPrice } from "@/lib/priceUtils";

type DistanceInfo = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};

interface StandardListingCardProps {
  listing: any;
  href: string;
  isOwner?: boolean;
}

export function StandardListingCard({
  listing,
  href,
  isOwner = false,
}: StandardListingCardProps): React.ReactElement {
  const router = useRouter();
  // Remove the useEffect and replace with direct calculation
  // const [distance, setDistance] = useState<number | null>(null);
  const { location, error, loading, calculateDistanceFrom } =
    useGuestLocation();
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);

  // Calculate total image count
  const getImageCount = () => {
    let count = 0;
    if (listing.mainImageUrl) count += 1;
    if (listing.thumbnailUrls && Array.isArray(listing.thumbnailUrls)) {
      count += listing.thumbnailUrls.length;
    }
    return count;
  };

  const productUrl = href || `/tombstones-for-sale/${listing.documentId}`;

  const handleClick = () => {
    router.push(productUrl);
  };

  // UPDATED: flat lat/lng object (not nested in coords)
  const companyLocation = {
    lat: Number(listing?.company?.latitude),
    lng: Number(listing?.company?.longitude),
  };

  // UPDATED: async distance fetch similar to premium-listing-card
  useEffect(() => {
    const fetchDistance = async () => {
      if (companyLocation.lat && companyLocation.lng) {
        const result = await calculateDistanceFrom(companyLocation);
        setDistanceInfo(result);
      }
    };
    fetchDistance();
  }, [companyLocation.lat, companyLocation.lng, calculateDistanceFrom]);

  return (
    <div
      className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto transition-all duration-300 h-full flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-lg hover:shadow-gray-400 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Mobile Layout (up to 768px) */}
      <div className="relative flex flex-col md:hidden">
        {/* Manufacturer Logo in its own box, bottom right corner (Mobile only) */}
        <div className="absolute bottom-3 right-3 z-20 bg-gray-50 p-2 rounded-lg md:hidden">
          <a
            href={listing.company.name}
            className="manufacturer-link"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${listing.manufacturer} profile`}
          >
            <Image
              src={listing.company.logoUrl}
              alt={`${listing.manufacturer} Logo`}
              width={96}
              height={96}
              className="object-contain"
            />
          </a>
        </div>
        {/* Main Image Container */}
        <div className="bg-white px-3 py-3">
          <div className="relative h-[350px] w-full rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={listing.mainImageUrl || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw"
            />
            {/* Camera icon and counter overlay for main image */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
              <Camera className="w-4 h-4" />
              <span>{getImageCount()}</span>
            </div>
          </div>
        </div>
        {/* Thumbnails Row Below Main Image (Mobile) */}
        <div className="bg-white px-3 pb-3">
          <div className="relative">
            <div className="flex flex-row gap-1">
              {Array.isArray(listing.thumbnailUrls)
                ? listing.thumbnailUrls
                    .slice(0, 3)
                    .map((src: string, index: number) => (
                      <button
                        key={index}
                        className="relative flex-1 aspect-[4/3] rounded overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
                        aria-label={`View image ${index + 1}`}
                        type="button"
                        tabIndex={-1}
                      >
                        <Image
                          src={src}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))
                : null}
            </div>
          </div>
        </div>
        {/* Content (Mobile) */}
        <div className="w-full px-4 pt-4 pb-2 bg-gray-50 flex flex-col">
          {/* Price, Badge, and Heart (Mobile) */}
          <div className="flex flex-col items-start mb-3">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(listing.price)}
            </div>
            <div className="mt-1 mb-0">
               <Badge
                className={cn("text-white text-sm px-3 py-1 rounded")}
                style={{ backgroundColor: listing.adFlasherColor || "#DB2777" }}
              >
                {listing.adFlasher || "Unique Design"}
              </Badge>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {/* TODO: to be added to the backend-favorite button */}
              {/* <FavoriteButton product={product} size="md" /> */}
            </div>
          </div>
          {/* Title, Details, Features (Mobile) */}
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
            {listing.title}
          </h2>
          {/* --- Product Details Section (same as desktop) --- */}
          <div className="space-y-0.5 mb-2">
            {/* First line: Tombstone Type, Full Tombstone (bold if present), stoneType, style/theme, culture */}
            <div className="text-xs text-gray-700">
              <strong>Full Tombstone</strong>
              {listing.productDetails?.stoneType &&
                Array.isArray(listing.productDetails.stoneType) &&
                listing.productDetails.stoneType.length > 0 &&
                listing.productDetails.stoneType[0]?.value && (
                  <>| {listing.productDetails.stoneType[0].value}</>
                )}
              {listing.productDetails?.style &&
                Array.isArray(listing.productDetails.style) &&
                listing.productDetails.style.length > 0 &&
                listing.productDetails.style[0]?.value && (
                  <>| {listing.productDetails.style[0].value}</>
                )}
              {listing.productDetails?.culture &&
                Array.isArray(listing.productDetails.culture) &&
                listing.productDetails.culture.length > 0 &&
                listing.productDetails.culture[0]?.value && (
                  <>| {listing.productDetails.culture[0].value}</>
                )}
            </div>
            {/* Second line: Customization, Color, Features */}
            <div className="text-xs text-gray-700">
              {listing.productDetails?.customization &&
                Array.isArray(listing.productDetails.customization) &&
                listing.productDetails.customization.length > 0 &&
                listing.productDetails.customization[0]?.value && (
                  <>{listing.productDetails.customization[0].value}</>
                )}
              {listing.productDetails?.color &&
                Array.isArray(listing.productDetails.color) &&
                listing.productDetails.color.length > 0 &&
                listing.productDetails.color[0]?.value && (
                  <>
                    {listing.productDetails?.customization &&
                    Array.isArray(listing.productDetails.customization) &&
                    listing.productDetails.customization.length > 0 &&
                    listing.productDetails.customization[0]?.value
                      ? " | "
                      : ""}
                    {listing.productDetails.color[0].value}
                  </>
                )}
              {listing.features && (
                <>
                  {(listing.productDetails?.customization &&
                    Array.isArray(listing.productDetails.customization) &&
                    listing.productDetails.customization.length > 0 &&
                    listing.productDetails.customization[0]?.value) ||
                  (listing.productDetails?.color &&
                    Array.isArray(listing.productDetails.color) &&
                    listing.productDetails.color.length > 0 &&
                    listing.productDetails.color[0]?.value)
                    ? " | "
                    : ""}
                  {listing.features}
                </>
              )}
            </div>
            {/* Third line: Transport & Installation, Foundation, Warranty */}
            <div className="text-xs text-gray-700">
              {listing.additionalProductDetails?.transportAndInstallation &&
                Array.isArray(
                  listing.additionalProductDetails.transportAndInstallation
                ) &&
                listing.additionalProductDetails.transportAndInstallation
                  .length > 0 &&
                listing.additionalProductDetails.transportAndInstallation[0]
                  ?.value && (
                  <>
                    {
                      listing.additionalProductDetails
                        .transportAndInstallation[0].value
                    }
                  </>
                )}
              {listing.additionalProductDetails?.foundationOptions &&
                Array.isArray(
                  listing.additionalProductDetails.foundationOptions
                ) &&
                listing.additionalProductDetails.foundationOptions.length > 0 &&
                listing.additionalProductDetails.foundationOptions[0]
                  ?.value && (
                  <>
                    {listing.additionalProductDetails
                      ?.transportAndInstallation &&
                    Array.isArray(
                      listing.additionalProductDetails.transportAndInstallation
                    ) &&
                    listing.additionalProductDetails.transportAndInstallation
                      .length > 0 &&
                    listing.additionalProductDetails.transportAndInstallation[0]
                      ?.value
                      ? " | "
                      : ""}
                    {
                      listing.additionalProductDetails.foundationOptions[0]
                        .value
                    }
                  </>
                )}
              {listing.additionalProductDetails?.warrantyOrGuarantee &&
                Array.isArray(
                  listing.additionalProductDetails.warrantyOrGuarantee
                ) &&
                listing.additionalProductDetails.warrantyOrGuarantee.length >
                  0 &&
                listing.additionalProductDetails.warrantyOrGuarantee[0]
                  ?.value && (
                  <>
                    {(listing.additionalProductDetails
                      ?.transportAndInstallation &&
                      Array.isArray(
                        listing.additionalProductDetails
                          .transportAndInstallation
                      ) &&
                      listing.additionalProductDetails.transportAndInstallation
                        .length > 0 &&
                      listing.additionalProductDetails
                        .transportAndInstallation[0]?.value) ||
                    (listing.additionalProductDetails?.foundationOptions &&
                      Array.isArray(
                        listing.additionalProductDetails.foundationOptions
                      ) &&
                      listing.additionalProductDetails.foundationOptions
                        .length > 0 &&
                      listing.additionalProductDetails.foundationOptions[0]
                        ?.value)
                      ? " | "
                      : ""}
                    {
                      listing.additionalProductDetails.warrantyOrGuarantee[0]
                        .value
                    }
                  </>
                )}
            </div>
            {/* Fourth line: Manufacturing time */}
            <div className="text-xs text-gray-600">
              {listing.manufacturingTimeframe || "3 weeks manufacturing time"}
            </div>
          </div>
          {/* Manufacturer Information (Mobile) */}
          <div className="flex flex-col mt-0">
            <a
              href={listing.company.name}
              className="manufacturer-link font-medium text-gray-900 text-base mb-2"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${listing.manufacturer} profile`}
            >
              {listing.manufacturer}
            </a>
            <div className="space-y-1.5">
              {listing.enquiries && (
                <div className="flex items-center text-green-600">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">
                    {listing.enquiries} enquiries to this Manufacturer
                  </span>
                </div>
              )}
              {/* Location display */}
              <div className="text-xs text-gray-600">
                {listing.company.location &&
                listing.company.location.trim() !== ""
                  ? listing.company.location
                  : "location not set"}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-1 md:hidden">
                <Image
                  src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                  alt="Location Pin Icon"
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span>
                  {distanceInfo?.distance?.text
                    ? `${distanceInfo.distance.text} from you`
                    : "from you"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Layout (768px and up) */}
      <div className="hidden md:flex h-full">
        {/* Left column: image */}
        <div className="w-1/2 flex-shrink-0">
          <div className="relative h-full">
            <Image
              src={listing.mainImageUrl || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw"
            />
            {/* Camera icon and counter overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
              <Camera className="w-4 h-4" />
              <span>{getImageCount()}</span>
            </div>
          </div>
        </div>
        {/* Right column: content */}
        <div className="w-1/2 flex-shrink-0 flex flex-col p-4">
          {/* Top section: price, badge, heart */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(listing.price)}
              </div>
              <div className="mt-1 mb-0">
                 <Badge
                className={cn("text-white text-sm px-3 py-1 rounded")}
                style={{ backgroundColor: listing.adFlasherColor || "#DB2777" }}
              >
                {listing.adFlasher || "Unique Design"}
              </Badge>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {/* TODO: to be added to the backend-favorite button */}
              {/* <FavoriteButton product={product} size="md" /> */}
            </div>
          </div>
          {/* Middle section: title and details */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
              {listing.title}
            </h2>
            {/* Product Details */}
            <div className="space-y-0.5 mb-2">
              {/* First line: Tombstone Type, Full Tombstone (bold if present), stoneType, style/theme, culture */}
              <div className="text-xs text-gray-700">
                <strong>Full Tombstone</strong>
                {listing.productDetails?.stoneType &&
                  Array.isArray(listing.productDetails.stoneType) &&
                  listing.productDetails.stoneType.length > 0 &&
                  listing.productDetails.stoneType[0]?.value && (
                    <>| {listing.productDetails.stoneType[0].value}</>
                  )}
                {listing.productDetails?.style &&
                  Array.isArray(listing.productDetails.style) &&
                  listing.productDetails.style.length > 0 &&
                  listing.productDetails.style[0]?.value && (
                    <>| {listing.productDetails.style[0].value}</>
                  )}
                {listing.productDetails?.culture &&
                  Array.isArray(listing.productDetails.culture) &&
                  listing.productDetails.culture.length > 0 &&
                  listing.productDetails.culture[0]?.value && (
                    <>| {listing.productDetails.culture[0].value}</>
                  )}
              </div>
              {/* Second line: Customization, Color, Features */}
              <div className="text-xs text-gray-700">
                {listing.productDetails?.customization &&
                  Array.isArray(listing.productDetails.customization) &&
                  listing.productDetails.customization.length > 0 &&
                  listing.productDetails.customization[0]?.value && (
                    <>{listing.productDetails.customization[0].value}</>
                  )}
                {listing.productDetails?.color &&
                  Array.isArray(listing.productDetails.color) &&
                  listing.productDetails.color.length > 0 &&
                  listing.productDetails.color[0]?.value && (
                    <>
                      {listing.productDetails?.customization &&
                      Array.isArray(listing.productDetails.customization) &&
                      listing.productDetails.customization.length > 0 &&
                      listing.productDetails.customization[0]?.value
                        ? " | "
                        : ""}
                      {listing.productDetails.color[0].value}
                    </>
                  )}
                {listing.features && (
                  <>
                    {(listing.productDetails?.customization &&
                      Array.isArray(listing.productDetails.customization) &&
                      listing.productDetails.customization.length > 0 &&
                      listing.productDetails.customization[0]?.value) ||
                    (listing.productDetails?.color &&
                      Array.isArray(listing.productDetails.color) &&
                      listing.productDetails.color.length > 0 &&
                      listing.productDetails.color[0]?.value)
                      ? " | "
                      : ""}
                    {listing.features}
                  </>
                )}
              </div>
              {/* Third line: Transport & Installation, Foundation, Warranty */}
              <div className="text-xs text-gray-700">
                {listing.additionalProductDetails?.transportAndInstallation &&
                  Array.isArray(
                    listing.additionalProductDetails.transportAndInstallation
                  ) &&
                  listing.additionalProductDetails.transportAndInstallation
                    .length > 0 &&
                  listing.additionalProductDetails.transportAndInstallation[0]
                    ?.value && (
                    <>
                      {
                        listing.additionalProductDetails
                          .transportAndInstallation[0].value
                      }
                    </>
                  )}
                {listing.additionalProductDetails?.foundationOptions &&
                  Array.isArray(
                    listing.additionalProductDetails.foundationOptions
                  ) &&
                  listing.additionalProductDetails.foundationOptions.length >
                    0 &&
                  listing.additionalProductDetails.foundationOptions[0]
                    ?.value && (
                    <>
                      {listing.additionalProductDetails
                        ?.transportAndInstallation &&
                      Array.isArray(
                        listing.additionalProductDetails
                          .transportAndInstallation
                      ) &&
                      listing.additionalProductDetails.transportAndInstallation
                        .length > 0 &&
                      listing.additionalProductDetails
                        .transportAndInstallation[0]?.value
                        ? " | "
                        : ""}
                      {
                        listing.additionalProductDetails.foundationOptions[0]
                          .value
                      }
                    </>
                  )}
                {listing.additionalProductDetails?.warrantyOrGuarantee &&
                  Array.isArray(
                    listing.additionalProductDetails.warrantyOrGuarantee
                  ) &&
                  listing.additionalProductDetails.warrantyOrGuarantee.length >
                    0 &&
                  listing.additionalProductDetails.warrantyOrGuarantee[0]
                    ?.value && (
                    <>
                      {(listing.additionalProductDetails
                        ?.transportAndInstallation &&
                        Array.isArray(
                          listing.additionalProductDetails
                            .transportAndInstallation
                        ) &&
                        listing.additionalProductDetails
                          .transportAndInstallation.length > 0 &&
                        listing.additionalProductDetails
                          .transportAndInstallation[0]?.value) ||
                      (listing.additionalProductDetails?.foundationOptions &&
                        Array.isArray(
                          listing.additionalProductDetails.foundationOptions
                        ) &&
                        listing.additionalProductDetails.foundationOptions
                          .length > 0 &&
                        listing.additionalProductDetails.foundationOptions[0]
                          ?.value)
                        ? " | "
                        : ""}
                      {
                        listing.additionalProductDetails.warrantyOrGuarantee[0]
                          .value
                      }
                    </>
                  )}
              </div>
              {/* Fourth line: Manufacturing time */}
              <div className="text-xs text-gray-600">
                {listing.manufacturingTimeframe || "3 weeks manufacturing time"}
              </div>
            </div>
          </div>
          {/* Bottom section: manufacturer info and logo */}
          <div className="flex justify-between items-end mt-2">
            <div className="flex flex-col mt-2 flex-1">
              <div>
                <div className="font-medium text-gray-900 text-base mb-2">
                  {listing.company.name}
                </div>
                <div className="flex items-center text-green-600 mb-1">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">
                    {listing.inquiries_c?.length ?? 0} enquiries to this
                    Manufacturer
                  </span>
                </div>
                <div
                  className="text-xs text-gray-800 mt-1"
                  style={{ minHeight: 18 }}
                >
                  {listing.company.location &&
                  listing.company.location.trim() !== ""
                    ? listing.company.location
                    : "location not set"}
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                  <Image
                    src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
                    alt="Location Pin Icon"
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                  <span>
                    {distanceInfo?.distance?.text
                      ? `${distanceInfo.distance.text} from you`
                      : "from you"}
                  </span>
                </div>
              </div>
            </div>
            {/* Right column: logo (desktop only) */}
            <div className="w-1/3 flex-shrink-0 flex flex-col items-end justify-end hidden md:flex">
              <Image
                src={listing.company.logoUrl || "/placeholder-logo.svg"}
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
  );
}