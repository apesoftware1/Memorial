"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Heart, MapPin, Camera, Check, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FavoriteProduct } from "@/context/favorites-context.jsx";
import { FavoriteButton } from "./favorite-button";
import LocationTrigger from "./LocationTrigger";
import { useGuestLocation } from "@/hooks/useGuestLocation";
// Remove this line: import { calculateDistanceFrom } from "@/lib/locationUtil";
import { formatPrice } from "@/lib/priceUtils";

type DistanceInfo = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};
interface PremiumListingCardProps {
  listing: any;
  href: string;
  isFirstCard?: boolean;
  isOwner?: boolean;
  onPrimaryClick?: (listing: any) => boolean | void;
  compact?: boolean;
}

export function PremiumListingCard({
  listing,
  href,
  isFirstCard = false,
  isOwner = false,
  onPrimaryClick,
  compact = false,
  maxThumbnails = 3,
}: PremiumListingCardProps): React.ReactElement {
  const router = useRouter();
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hasFetchedDistance, setHasFetchedDistance] = useState(false);
  // Remove the useEffect and replace with direct calculation
  // const [distance, setDistance] = useState<number | null>(null);
  const { location, error, loading, calculateDistanceFrom } =
    useGuestLocation();
 

  // Calculate total image count using new Cloudinary fields
  const getImageCount = () => {
    let count = 0;
    if (listing.mainImageUrl) count += 1;
    if (listing.thumbnailUrls && Array.isArray(listing.thumbnailUrls)) {
      count += listing.thumbnailUrls.length;
    }
    return count;
  };

  // Resolve category label for the card (maps to category tab when available)
  const getCategoryLabel = () => {
    const candidates = [
      listing?.categoryTab,
      listing?.categorytab,
      listing?.category,
      listing?.bodyType,
      listing?.productType,
      listing?.type,
      listing?.productDetails?.bodyType?.[0]?.value,
      listing?.productDetails?.bodyType,
    ].filter(Boolean) as string[];
  
    const raw = candidates.find((v) => typeof v === "string" && v.trim() !== "");
    if (!raw) return "Full Tombstone";
    const s = raw.toLowerCase();
    if (s.includes("single")) return "Single Tombstone";
    if (s.includes("double")) return "Double Tombstone";
    if (s.includes("headstone") && !s.includes("double")) return "Headstone";
    if (s.includes("full")) return "Full Tombstone";
    if (s.includes("cremation")) return "Cremation Memorial";
    if (s.includes("family")) return "Family Monument";
    if (s.includes("child")) return "Child Memorial";
    if (s.includes("custom")) return "Custom Design";
    return raw.replace(/\b\w/g, (ch) => ch.toUpperCase());
  };
  const defaultThumbnail = "/placeholder.svg?height=80&width=120";
  // Prepare thumbnails array using new Cloudinary fields
  const thumbnails = Array.isArray(listing.thumbnailUrls)
    ? listing.thumbnailUrls
    : [];
  const paddedThumbnails = [
    ...thumbnails.slice(0, 6),
    ...Array(Math.max(0, 6 - thumbnails.length)).fill("/placeholder.svg"),
  ];
  const mobileThumbnails = thumbnails.slice(0, 3);

  const productUrl = href || `/tombstones-for-sale/${listing.documentId}`;

  // Create product object for FavoriteButton
  const favoriteProduct: FavoriteProduct = {
    id: listing.id || listing.documentId,
    name: listing.title,
    price: listing.price,
    image: listing.mainImageUrl,
    details: listing.productDetails,
    manufacturer: listing.company?.name,
    location: listing.location,
    tag: listing.adFlasher,
    tagColor: listing.adFlasherColor
  };

  // Handler to navigate to product showcase
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if the click is on a manufacturer link
    const target = e.target as HTMLElement;
    if (target.closest(".manufacturer-link")) return;

    // Get branches array
    let branches: any[] = [];
    if (Array.isArray(listing?.branch_listings) && listing.branch_listings.length > 0) {
      branches = listing.branch_listings.map((bl: any) => bl.branch).filter(Boolean);
    } else {
      branches = Array.isArray(listing?.branches) ? listing.branches : [];
    }
    
    // If listing has more than one branch, prevent navigation and call ViewListingByBranchesModal
    if (branches.length > 1) {
      e.preventDefault();
      // Use onPrimaryClick to open the modal
      if (typeof onPrimaryClick === "function") {
        onPrimaryClick(listing);
        return;
      }
    } 
    // If listing has exactly one branch, navigate directly to the product page
    else if (branches.length === 1) {
      const branchId = branches[0]?.id || branches[0]?.documentId;
      const listingId = listing?.documentId || listing?.id;
      if (listingId && branchId) {
        e.preventDefault();
        // Route to tombstone listing detail with branch context
        router.push(`/tombstones-for-sale/${listingId}?branch=${branchId}`);
        return;
      }
    }
    
    // Keep existing onPrimaryClick logic intact for other cases
    if (typeof onPrimaryClick === "function") {
      const handled = onPrimaryClick(listing);
      if (handled) return;
    }

    // Only navigate if not handled by any of the above
    e.preventDefault(); // Prevent any default behavior
    router.push(productUrl);
  };

  // Calculate distance when component mounts or listing changes
  const companyLocation = {
    lat: Number(listing?.company?.latitude),
    lng: Number(listing?.company?.longitude),
  };

  // Defer distance calculation until the card is visible and the main thread is idle
  useEffect(() => {
    if (!cardRef.current || hasFetchedDistance) return;

    const node = cardRef.current;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && companyLocation.lat && companyLocation.lng) {
        const schedule = (cb: () => void) => {
          if (typeof (window as any).requestIdleCallback === 'function') {
            (window as any).requestIdleCallback(cb, { timeout: 2000 });
          } else {
            setTimeout(cb, 1200); // defer ~1.2s to avoid blocking LCP
          }
        };

        schedule(async () => {
          try {
            const result = await calculateDistanceFrom(companyLocation);
            setDistanceInfo(result);
            setHasFetchedDistance(true);
          } catch (_) {
            // Silent failure; do not block render
          }
        });

        observer.disconnect();
      }
    }, { rootMargin: '0px 0px 200px 0px', threshold: 0.01 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [companyLocation.lat, companyLocation.lng, calculateDistanceFrom, hasFetchedDistance]);
  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e as unknown as React.MouseEvent);
    }
  };

  // Get branches array
  let branches: any[] = [];
  if (Array.isArray(listing?.branch_listings) && listing.branch_listings.length > 0) {
    branches = listing.branch_listings.map((bl: any) => bl.branch).filter(Boolean);
  } else {
    branches = Array.isArray(listing?.branches) ? listing.branches : [];
  }
  const hasBranches = branches.length > 0;
  
  const pathname = usePathname();
  
  // Check if we're on the tombstones-for-sale page and not on the home page
  const isTombstonesForSalePage = pathname?.includes('tombstones-for-sale') && pathname !== '/';
  
  return (
    <div className="relative mt-7" ref={cardRef} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      {hasBranches && isTombstonesForSalePage && (
        <div className="absolute -top-7 right-0 z-10 bg-gray-800 text-white px-3 py-1 text-sm font-medium rounded-t-md">
          Available at {branches.length} {branches.length === 1 ? 'Branch' : 'Branches'}
        </div>
      )}
      <div
        className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto transition-all duration-300 h-full flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-lg hover:shadow-gray-400 cursor-pointer"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
      {/* Mobile Layout (up to 768px) */}
      <div className="relative flex flex-col md:hidden">
        {/* Manufacturer Logo in its own box, bottom right corner (Mobile only) */}
        <div className="absolute bottom-3 right-3 z-20 bg-white p-2 rounded-lg md:hidden">
          <div
            className="manufacturer-link"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${
              listing.manufacturer || listing.company?.name
            } profile`}
          >
            <Image
              src={listing.company?.logoUrl || "/placeholder-logo.svg"}
              alt={`${listing.manufacturer || listing.company?.name} Logo`}
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
        </div>
        {/* Main Image Container */}
        <div className="bg-white px-3 py-3">
          <div className={cn(
            "relative w-full rounded-lg overflow-hidden border border-gray-200",
            compact ? "h-[240px]" : "h-[350px]"
          )}>
            <Image
              src={listing.mainImageUrl || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={isFirstCard}
            />
            {/* Heart icon overlay - top right corner */}
            <div className="absolute top-4 right-2 z-20" onClick={(e) => e.stopPropagation()}>
              <FavoriteButton product={favoriteProduct} size="md" />
            </div>
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
            <div className="grid grid-cols-3 gap-1">
              {Array.isArray(listing.thumbnailUrls)
                ? listing.thumbnailUrls
                    .slice(0, 3)
                    .map((src: string, index: number) => (
                      <button
                        key={index}
                        className="relative aspect-[4/3] rounded overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
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
        <div className={cn("w-full px-4 bg-white flex flex-col", compact ? "pt-3 pb-2" : "pt-4 pb-2")}>
          {/* Price, Badge, and Heart (Mobile) */}
          <div className="flex flex-col items-start mb-3">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(listing.price)}
            </div>
              {/* Special badge overlay */}
            {typeof window !== 'undefined' && window.location.pathname.includes('tombstones-on-special') && (
              <div className="absolute top-0 left-0 z-20">
                <Image
                  src="/special badge/Specials_Badge.svg"
                  alt="Special Offer"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}
            <div className="mt-1 mb-0 flex gap-2">
              <Badge
                className={cn("text-white text-sm px-3 py-1 rounded")}
                style={{ backgroundColor: listing.adFlasherColor || "#DB2777" }}
              >
                {listing.adFlasher || "Unique Design"}
              </Badge>
              {hasBranches && branches.length > 1 && isTombstonesForSalePage && (
                <Badge
                  className={cn("bg-blue-600 text-white text-sm px-3 py-1 rounded")}
                >
                  Available at {branches.length} Branches
                </Badge>
              )}
            </div>
          </div>
          {/* Title, Details, Features (Mobile) */}
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
            {listing.title}
          </h2>
          {/* --- Product Details Section (same as desktop) --- */}
          <div className="space-y-0.5 mb-2">
            {/* First line: Tombstone Type, Full Tombstone (bold if present), stoneType, style/theme, culture */}
            <div className="text-xs text-gray-700 ">
              <strong>{listing.listing_category?.name || getCategoryLabel()}</strong>
              {listing.productDetails?.stoneType &&
                Array.isArray(listing.productDetails.stoneType) &&
                listing.productDetails.stoneType.length > 0 &&
                listing.productDetails.stoneType[0]?.value && (
                  <> | {listing.productDetails.stoneType[0].value}</>
                )}
              {listing.productDetails?.style &&
                Array.isArray(listing.productDetails.style) &&
                listing.productDetails.style.length > 0 &&
                listing.productDetails.style[0]?.value && (
                  <> | {listing.productDetails.style[0].value}</>
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
            <div className="text-xs text-gray-700 capitalize">
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
              {shouldShowDetail(listing.manufacturingTimeframe)
                ? listing.manufacturingTimeframe
                : (!listing.manufacturingTimeframe ? "3 weeks manufacturing time" : null)}
            </div>
          </div>
          {/* Manufacturer Information (Mobile) */}
          <div className="flex flex-col mt-0">
            <div className="font-medium text-gray-900 text-base mb-1 leading-tight">
              {listing.manufacturer || listing.company?.name}
            </div>
            <div className="space-y-1.5">
              {(listing.enquiries !== undefined ||
                listing.inquiries_c?.length !== undefined) && (
                <div className="flex items-center text-green-600">
                  {/* <Check className="w-3.5 h-3.5 mr-1" /> */}
                  {/* <span className="text-xs">
                    {listing.enquiries || listing.inquiries_c?.length || 0}{" "}
                    enquiries to this Manufacturer
                  </span> */}
                </div>
              )}
              {/* Location display */}
              <div className="text-xs text-gray-600">
                {listing.company?.location &&
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
                  {distanceInfo
                    ? `${distanceInfo.distance.text} from you..`
                    : "Calculating distance…"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Layout (768px and up) - Equal 50/50 split */}
      <div className="hidden md:flex min-h-[300px]">
        {/* Left - Main Image (50% width) */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className={cn("relative flex-1", compact ? "min-h-[240px]" : "min-h-[300px]")}> 
            <Image
              src={listing.mainImageUrl || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              priority
            />
            {/* Heart icon overlay - top right corner */}
            <div className="absolute top-4 right-2 z-20" onClick={(e) => e.stopPropagation()}>
              <FavoriteButton product={favoriteProduct} size="md" />
            </div>
            {/* Special badge overlay for desktop */}
            {typeof window !== 'undefined' && window.location.pathname.includes('tombstones-on-special') && (
              <div className="absolute top-0 left-0 z-20">
                <Image
                  src="/special badge/Specials_Badge.svg"
                  alt="Special Offer"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
              <Camera className="w-4 h-4" />
              <span>{getImageCount()}</span>
            </div>
          </div>
        </div>
        {/* Right - Content (50% width) */}
        <div className="w-1/2 flex-shrink-0 flex flex-col">
          <div className={cn("flex-1 flex flex-col", compact ? "p-3" : "p-4")}>
            {/* Price and Heart */}
            <div className="flex flex-col items-start mb-3">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(listing.price)}
              </div>
              <div className="mt-1 mb-0 flex gap-2">
                <Badge
                  className={cn("text-white text-sm px-3 py-1 rounded")}
                  style={{ backgroundColor: listing.adFlasherColor || "#DB2777" }}
                >
                  {listing.adFlasher || "Unique Design"}
                </Badge>
              </div>
            </div>
            {/* Second Badge (only if different from adFlasher) */}
            {listing.tag && listing.tag !== listing.adFlasher && (
              <div className="mb-2">
                <Badge
                  className={cn(
                    "text-white text-xs px-2 py-0.5",
                    listing.tagColor || "bg-gray-600"
                  )}
                >
                  {listing.tag}
                </Badge>
              </div>
            )}
            {/* Title, Details, Features */}
            <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
              {listing.title}
            </h2>
            {/* --- Product Details Section (compact, styled like screenshot) --- */}
            <div className="space-y-0.5 mb-2">
              {/* First line: Tombstone Type, Full Tombstone (bold if present), stoneType, style/theme, culture */}
              <div className="text-xs text-gray-700">
                <strong>{listing.listing_category?.name || getCategoryLabel()}</strong>
                {listing.productDetails?.stoneType &&
                  Array.isArray(listing.productDetails.stoneType) &&
                  listing.productDetails.stoneType.length > 0 &&
                  listing.productDetails.stoneType[0]?.value && (
                    <> | {listing.productDetails.stoneType[0].value}</>
                  )}
                {listing.productDetails?.style &&
                  Array.isArray(listing.productDetails.style) &&
                  listing.productDetails.style.length > 0 &&
                  listing.productDetails.style[0]?.value && (
                    <> | {listing.productDetails.style[0].value}</>
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
              <div className="text-xs text-gray-700 capitalize">
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
                        listing.additionalProductDetails
                          .transportAndInstallation
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
                {shouldShowDetail(listing.manufacturingTimeframe)
                  ? listing.manufacturingTimeframe
                  : (!listing.manufacturingTimeframe ? "3 weeks manufacturing time" : null)}
              </div>
            </div>
            {/* Manufacturer Information (Desktop) */}
            {(() => {
              const profileUrl = `/manufacturers/${
                listing.company?.slug || listing.company?.name || ""
              }`;
              const logoSrc =
                listing.company?.logoUrl || "/placeholder-logo.svg";
              const manufacturerName =
                listing.manufacturer || listing.company?.name;
              return (
                <div className="flex justify-between items-stretch space-x-4 mt-2">
                  {/* Left Column for text details */}
                  <div className="flex-1 space-y-1.5">
                    <div className="font-bold font-small text-sm text-gray-900 leading-tight">
                      {manufacturerName}
                    </div>
                    <div className="flex items-center text-green-600">
                      {/* <Check className="w-3.5 h-3.5 mr-1" /> */}
                      {/* <span className="text-xs">
                        {listing.enquiries || listing.inquiries_c?.length || 0}{" "}
                        enquiries to this Manufacturer
                      </span> */}
                    </div>
                    <div
                      className="text-xs text-gray-800 mt-1"
                      style={{ minHeight: 18 }}
                    >
                      {listing.company?.location &&
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
                        {distanceInfo
                          ? `${distanceInfo.distance.text} from you..`
                          : "Calculating distance…"}
                      </span>
                    </div>
                  </div>
                  {/* Right Column for Logo (Desktop only) */}
                  <div className="w-1/3 flex-shrink-0 flex flex-col items-end justify-end hidden md:flex">
                    <Link
                      href={profileUrl}
                      prefetch={false}
                      aria-label={`View ${manufacturerName} profile`}
                    >
                      <Image
                        src={logoSrc}
                        alt={`${manufacturerName} Logo`}
                        width={150}
                        height={300}
                        className="object-contain mt-auto mb-2"
                      />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Bottom Thumbnails - Desktop only */}
      <div className="hidden md:block p-4 bg-white border-t border-gray-100">
        <div className="grid grid-cols-6 gap-3">
          {Array.isArray(listing.thumbnailUrls)
            ? listing.thumbnailUrls
                .slice(0, 6)
                .map((src: string, index: number) => (
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
                ))
            : null}
        </div>
      </div>
    </div>
    </div>
  );
}

// Helper to hide values that are only numbers (e.g., "6")
const shouldShowDetail = (value: any) => {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  if (str === "") return false;
  // show only if contains any non-digit character
  return /[^\d]/.test(str);
};

