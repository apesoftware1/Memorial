"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cloudinaryOptimized } from "@/lib/cloudinary";
import { MapPin, Camera, Check, User2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/priceUtils";
import { FavoriteButton } from "./favorite-button";
import { useGuestLocation } from "@/hooks/useGuestLocation";

export default function BranchCard({ branch, listing, onSelect, hideAvailableBranches = true }) {
  if (!branch) return null;
  const name = branch.name || "Branch";
  const city = branch.location?.address || "";
  const province = branch.province || branch.state || branch.location?.province || branch.address?.province || "";
  const street = branch.street || branch.addressLine1 || branch.address?.street || "";
  const phone = branch.phone || branch.telephone || branch.contactNumber || "";

  const joinWithPipes = (parts) => parts.filter(Boolean).join(" | ");

  // Distance calculation state and hooks (consistent with PremiumListingCard)
  const cardRef = useRef(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [hasFetchedDistance, setHasFetchedDistance] = useState(false);
  const { location, error, loading, calculateDistanceFrom } = useGuestLocation();

  // Robust branch lat/lng extraction (supports multiple shapes)
  const branchLocation = {
    lat: Number(
        branch?.location?.latitude || listing?.company?.latitude
    ),
    lng: Number(
        branch?.location?.longitude || listing?.company?.longitude
    ),
  };

  // Defer distance calculation until visible and main thread is idle
  useEffect(() => {
    if (!cardRef.current || hasFetchedDistance) return;

    const node = cardRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry &&
          entry.isIntersecting &&
          branchLocation.lat &&
          branchLocation.lng
        ) {
          const schedule = (cb) => {
            if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
              window.requestIdleCallback(cb, { timeout: 2000 });
            } else {
              setTimeout(cb, 1200);
            }
          };

          schedule(async () => {
            try {
              const result = await calculateDistanceFrom(branchLocation);
              if (result) {
                setDistanceInfo(result);
                setHasFetchedDistance(true);
              }
            } catch (_) {
              // Silent failure — keep UI responsive
            }
          });

          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [branchLocation.lat, branchLocation.lng, calculateDistanceFrom, hasFetchedDistance]);

  // Re-attempt distance calculation once user location becomes available.
  // This fixes the first card missing distance when geolocation is not ready on initial render.
  useEffect(() => {
    if (hasFetchedDistance) return;
    if (!branchLocation.lat || !branchLocation.lng) return;
    if (!location) return; // wait until location is detected or loaded from storage

    (async () => {
      try {
        const result = await calculateDistanceFrom(branchLocation);
        if (result) {
          setDistanceInfo(result);
          setHasFetchedDistance(true);
        }
      } catch (_) {
        // Silent failure
      }
    })();
  }, [location, branchLocation.lat, branchLocation.lng, calculateDistanceFrom, hasFetchedDistance]);

  // Create product object for FavoriteButton
  const favoriteProduct = {
    id: listing?.id || listing?.documentId,
    title: listing?.title,
    price: listing?.price,
    image: listing?.mainImageUrl,
    details: listing?.productDetails,
    manufacturer: listing?.company?.name,
    location: `${name} branch - ${joinWithPipes([city, province])}`,
  };

  const handleClick = () => {
    if (typeof onSelect === "function") {
      // Pass both branch and listing to the handler
     
      
      onSelect(branch, listing);
     
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && typeof onSelect === "function") {
      e.preventDefault();
      // Pass both branch and listing to the handler
      onSelect(branch, listing);
    }
  };
  
  // Calculate total image count
  const getImageCount = () => {
    let count = 0;
    if (listing?.mainImageUrl) count += 1;
    if (listing?.thumbnailUrls && Array.isArray(listing.thumbnailUrls)) {
      count += listing.thumbnailUrls.length;
    }
    return count;
  };

  // Resolve category label for the card
  const getCategoryLabel = () => {
    const candidates = [
      listing?.categoryTab,
      listing?.categorytab,
      listing?.category,
      listing?.categoryName,
      listing?.bodyType,
      listing?.productType,
      listing?.type,
      listing?.productDetails?.bodyType?.[0]?.value,
      listing?.productDetails?.bodyType,
    ].filter(Boolean);

    const raw = candidates.find((v) => typeof v === "string" && v.trim() !== "");
    if (!raw) return "";
    const s = raw.toUpperCase();
    if (s.includes("SINGLE")) return "Single";
    if (s.includes("DOUBLE")) return "Double";
    if (s.includes("CHILD")) return "Child";
    if (s.includes("HEAD")) return "Head"; // covers HEAD, HEADSTONE
    if (s.includes("PLAQUE")) return "Plaques"; // PLAQUE 
    if (s.includes("CREMATION")) return "Cremation";
    return "";
  };
  // Determine price: Check for branch-specific override in branch_listings, fallback to listing base price
  const branchListing = Array.isArray(listing?.branch_listings) 
    ? listing.branch_listings.find(bl => {
        if (!bl?.branch || !branch) return false;

        // Check ID match (loose equality for string/number)
        // Check documentId match (strict equality)
        if (branch.documentId && bl.branch.documentId && branch.documentId === bl.branch.documentId) return true;

        return false;
      })
    : null;
    console.log(branchListing, "from branch card")
  const displayPrice = branchListing?.price || listing?.price;

  return (
    <div className="relative" ref={cardRef} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}> {/* Removed conditional margin-top */}
      {/* Removed the "Available at X Branches" text completely */}
      
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Select ${name}`}
        className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-lg hover:shadow-gray-400 cursor-pointer relative"
      >
      {/* Company Logo - Top Right Corner for Desktop, Bottom Right for Mobile */}
      <div className="absolute md:top-2 md:right-2 bottom-2 right-2 z-50">
        <div className="bg-white rounded-full" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            src={cloudinaryOptimized(listing?.company?.logoUrl, 200) || "/placeholder-logo.svg"}
            alt={`${listing?.company?.name || 'Company'} logo`}
            width={80}
            height={80}
            className="rounded-full object-contain"
            aria-label="Company Logo"
            unoptimized
          />
        </div>
      </div>
      {/* Mobile Layout (up to 768px) */}
      <div className="relative flex flex-col md:hidden">
        <div className="w-full px-4 pt-4 pb-2 bg-white flex flex-col">
          {/* Price and Badge */}
          <div className="flex flex-col items-start mb-3">
            <div className="text-2xl font-bold text-blue-600 pr-14">
              {displayPrice ? formatPrice(displayPrice) : "Contact for price"}
            </div>
            {getCategoryLabel() && (
              <div className="mt-1 mb-0 pr-14">
                <Badge className="text-white text-sm px-3 py-1 rounded bg-pink-600">
                  {getCategoryLabel()}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Title and Branch Details */}
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
            {listing?.title || "Tombstone"}
          </h2>
          
          {/* Branch Details */}
          <div className="space-y-0.5 mb-2">
            {/* First line: Branch Name (distance moved to final indicator) */}
            <div className="text-sm font-semibold text-gray-800 flex items-center">
              <span>{name} Branch</span>
            </div>
            {/* Second line: City | Province */}
            {(city || province) && (
              <div className="text-xs text-gray-700">{joinWithPipes([city, province])}</div>
            )}
            {/* Third line: Street | Phone */}
            {(street || phone) && (
              <div className="text-xs text-gray-700">{joinWithPipes([street, phone])}</div>
            )}
          </div>
          
          {/* Location indicator with distance (mobile) */}
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            <span
              className="text-xs font-medium text-gray-600 ml-2"
              aria-live="polite"
            >
              {distanceInfo?.distance?.text
                ? `${distanceInfo.distance.text} from you`
                : error
                ? "Distance unavailable"
                : loading
                ? "Locating..."
                : ""}
            </span>
          </div>
        </div>
      </div>
      
      {/* Desktop Layout (768px and above) */}
      <div className="hidden md:flex flex-row">
        <div className="w-full p-4 flex flex-col">
          {/* Price and Badge */}
          <div className="flex flex-col items-start mb-3">
            <div className="text-2xl font-bold text-blue-600">
              {displayPrice ? formatPrice(displayPrice) : "Contact for price"}
            </div>
            <div className="mt-1 mb-0">
              {getCategoryLabel() && (
                <Badge className="text-white text-sm px-3 py-1 rounded bg-pink-600">
                  {getCategoryLabel()}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Title and Branch Details */}
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase">
            {listing?.title || "Tombstone"}
          </h2>
          
          {/* Branch Details */}
          <div className="space-y-0.5 mb-2">
            <div className="text-sm font-semibold text-gray-800 flex items-center">
              <span>{name} Branch</span>
            </div>
            {(city || province) && (
              <div className="text-xs text-gray-700">{joinWithPipes([city, province])}</div>
            )}
            {(street || phone) && (
              <div className="text-xs text-gray-700">{joinWithPipes([street, phone])}</div>
            )}
          </div>
          
          {/* Location indicator with distance (desktop) */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span
              className="text-xs font-medium text-gray-600 ml-0"
              aria-live="polite"
            >
              {distanceInfo?.distance?.text
                ? `${distanceInfo.distance.text} from you`
                : error
                ? "Distance unavailable"
                : loading
                ? "Locating..."
                : ""}
            </span>
              {/* <span>{name.toUpperCase()} branch</span> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Heart icon at bottom right */}
      <div className="absolute bottom-2 right-2 z-40 md:block hidden">
        <div 
          className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton product={favoriteProduct} size="sm" />
        </div>
      </div>
    </div>
    </div>
  );
}
