"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,Twitter,Mail,MapPinX,Whatsapp,FacebookMessenger,Heart,User2,
  Cross,Gem,Camera,Flower,Truck,Info,CircleX,Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/priceUtils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { FavoriteButton } from "./favorite-button";
import Header from "@/components/Header";
import ProductContactForm from "./product-contact-form";
import { trackAnalyticsEvent } from "@/lib/analytics";
import MapModal from "./MapModal";
import { useProductShowcaseLogic } from "@/hooks/product-showcase-logic";
import { useGuestLocation } from "@/hooks/useGuestLocation";
// Added missing modular component imports
import ProductGallery from "./ProductGallery";
import ProductDetails from "./ProductDetails";
import ProductDescription from "./ProductDescription";
import CompanyInfoCard from "./CompanyInfoCard";
import SocialShare from "./SocialShare";
import RelatedProducts from "./RelatedProducts";
import WhatsAppContactDrawer from "./WhatsAppContactDrawer";
import { useSearchParams, usePathname } from "next/navigation";
import { PageLoader } from "./ui/loader";

export default function ProductShowcase({ listing, id, allListings = [], currentIndex = 0, onNavigate }) {
  if (!listing) {
    return null;
  }

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch"); // Prioritize branchId prop
  const pathname = usePathname();
  const basePath = pathname && pathname.includes('/tombstones-for-sale') ? '/tombstones-for-sale' : '/product';
  
  // Navigation functions for Next/Previous
  const handlePrevious = () => {
    if (onNavigate && typeof onNavigate === 'function') {
      setIsTransitioning(true);
      onNavigate('prev');
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (allListings.length > 0) {
      setIsTransitioning(true);
      const prevIndex = (currentIndex - 1 + allListings.length) % allListings.length;
      const prevListing = allListings[prevIndex];
      if (prevListing && (prevListing.documentId || prevListing.id)) {
        const targetId = prevListing.documentId || prevListing.id;
        window.location.href = `${basePath}/${targetId}${branch ? `?branch=${branch}` : ''}`;
      }
    }
  };
  
  const handleNext = () => {
    if (onNavigate && typeof onNavigate === 'function') {
      setIsTransitioning(true);
      onNavigate('next');
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (allListings.length > 0) {
      setIsTransitioning(true);
      const nextIndex = (currentIndex + 1) % allListings.length;
      const nextListing = allListings[nextIndex];
      if (nextListing && (nextListing.documentId || nextListing.id)) {
        const targetId = nextListing.documentId || nextListing.id;
        window.location.href = `${basePath}/${targetId}${branch ? `?branch=${branch}` : ''}`;
      }
    }
  };
  useEffect(() => {
    if (listing.branches && listing.branches.length > 0) {
      setSelectedBranch(
        listing.branches.length <= 1
          ? listing.branches[0]
          : listing.branches.find((b) => b.name === (branch))
      );
    }
  }, [listing, branch]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileDropdownToggle = (dropdown) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };

  const {
    allImages,
    selectedImageIndex,
    setSelectedImageIndex,
    productDetails,
    additionalDetails,
    icons: { stoneTypeIcon, headStyleIcon, slabStyleIcon, colourIcon, customIcon },
    getFirstValue,
    getAllValues,
    distanceInfo,
    loading,
    error,
    refreshLocation,
    showContact,
    handleShowContact,
    info,
  } = useProductShowcaseLogic(listing);

  // Branch-first destination coordinates with company fallback
  // Precedence: branch location (from URL param) -> company location
  const { calculateDistanceFrom: calcDistance, loading: guestLocLoading, error: guestLocError } = useGuestLocation();
  const [distanceOverride, setDistanceOverride] = useState(null);

  // Safely read any stored guest location (supports multiple keys and shapes)
  const [storedGuestLocation, setStoredGuestLocation] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw =
        localStorage.getItem("guestLocation") ||
        localStorage.getItem("GuestLocation") ||
        localStorage.getItem("userLocation");

      if (!raw) {
        setStoredGuestLocation(null);
        return;
      }
      const parsed = JSON.parse(raw);
      const lat = Number(parsed?.lat ?? parsed?.latitude);
      const lng = Number(parsed?.lng ?? parsed?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setStoredGuestLocation({ lat, lng });
      } else {
        setStoredGuestLocation(null);
      }
    } catch (err) {
      console.warn("[Location] Failed to read stored location:", err);
      setStoredGuestLocation(null);
    }
  }, []);

  const coerceNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const destinationCoords = React.useMemo(() => {
    // Try branch coordinates from several possible shapes
    const branchLatCandidates = [
      selectedBranch?.location?.latitude,
      listing?.company?.branch?.location?.latitude,
      (Array.isArray(listing?.branches)
        ? listing.branches.find((b) => b?.name === branch)?.location?.latitude
        : undefined),
    ];
    const branchLngCandidates = [
      selectedBranch?.location?.longitude,
      listing?.company?.branch?.location?.longitude,
      (Array.isArray(listing?.branches)
        ? listing.branches.find((b) => b?.name === branch)?.location?.longitude
        : undefined),
    ];

    const branchLatRaw = branchLatCandidates.find((v) => v !== undefined && v !== null);
    const branchLngRaw = branchLngCandidates.find((v) => v !== undefined && v !== null);
    const branchLat = coerceNum(branchLatRaw);
    const branchLng = coerceNum(branchLngRaw);

    if (branch && branchLat !== null && branchLng !== null) {
      return { lat: branchLat, lng: branchLng, source: "branch" };
    }

    // Fallback to company coordinates
    const companyLat = coerceNum(listing?.company?.latitude);
    const companyLng = coerceNum(listing?.company?.longitude);
    if (companyLat !== null && companyLng !== null) {
      return { lat: companyLat, lng: companyLng, source: "company" };
    }

    return null; // No valid coordinates
  }, [branch, listing?.branches, listing?.company?.branch, listing?.company?.latitude, listing?.company?.longitude, selectedBranch]);

  // Calculate distance using chosen destination coordinates
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (!destinationCoords || destinationCoords.lat === null || destinationCoords.lng === null) {
          setDistanceOverride(null);
          return;
        }
        // If user denied/disabled location and we have no stored coordinates, avoid prompting and use fallback UI
        if (!storedGuestLocation && guestLocError) {
          console.warn("[Location] Guest location unavailable/denied. Using fallback UI.");
          setDistanceOverride(null);
          return;
        }
        const result = await calcDistance(destinationCoords);
        if (!cancelled) setDistanceOverride(result || null);
      } catch (err) {
        console.warn("[Location] Distance calculation failed:", err);
        if (!cancelled) setDistanceOverride(null);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [calcDistance, destinationCoords, storedGuestLocation, guestLocError]);

  // Prefer branch-based distance if available; otherwise use existing hook distance
  const effectiveDistanceInfo = distanceOverride || distanceInfo;
  // Never show location-related loaders/errors; UI should always be available
  // Keep core features accessible regardless of location availability

  return (
    <>
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />
      {/* Breadcrumbs (outside the main container) */}
      <nav className="text-sm text-gray-600 mb-4 max-w-6xl mx-auto px-4 md:px-0 pt-6">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Home
        </Link>
        <span className="mx-1">&gt;</span>
        <Link href="/tombstones-for-sale" className="hover:underline">
          Tombstones for sale
        </Link>
        <span className="mx-1">&gt;</span>
        <Link 
          href={`/manufacturers/manufacturers-Profile-Page/${listing.company?.documentId || listing.companyId}`}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {listing.company?.name || "Company"}
        </Link>
        {selectedBranch && (
          <>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-600">{selectedBranch.name}</span>
          </>
        )}
        <span className="mx-1">&gt;</span>
        <span className="text-gray-900 font-semibold">{listing.title}</span>
      </nav>
      <div className={`bg-white rounded shadow max-w-6xl mx-auto px-0 mt-2 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {/* Product Header */}
        <div className="px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 mt-4">
            <div className="w-full">
              {listing.badge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white mb-2">
                  {listing.badge}
                </span>
              )}
              {/* Title and Price on the same horizontal line */}
              <div className="flex flex-row items-center justify-between w-full mb-0">
                <h1 className="text-2xl font-bold text-gray-800 uppercase">
                  {listing.title}
                </h1>
                <span className="text-blue-600 text-3xl font-bold">
                  {formatPrice(listing.price)}
                </span>
              </div>
              {/* Location and navigation links on the same horizontal line */}
              <div className="flex flex-row items-center justify-between w-full mb-1 flex-wrap">
                <p className="text-sm text-gray-700 mt-2 w-full sm:w-auto">
                  {selectedBranch?.location?.address || listing.company?.location || "N/A"} |
                  <>
                    {effectiveDistanceInfo?.distance?.text ? (
                      <>
                        <span className="text-blue-600">
                          {`${effectiveDistanceInfo.distance.text} from you`}
                        </span>
                        <span
                          onClick={() => {
                            try { refreshLocation?.(); } catch (err) { console.warn('[Location] refresh failed:', err); }
                          }}
                          className="text-blue-600 ml-1 cursor-pointer hover:underline"
                        >
                          (refresh)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600">Distance unavailable</span>
                        <span
                          onClick={() => {
                            try { refreshLocation?.(); } catch (err) { console.warn('[Location] refresh failed:', err); }
                          }}
                          className="text-blue-600 ml-1 cursor-pointer hover:underline"
                        >
                          (set location)
                        </span>
                      </>
                    )}
                  </>
                </p>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={handlePrevious} 
                    className="hover:underline cursor-pointer"
                  >
                    &lt; Prev
                  </button>
                  <span className="mx-1">|</span>
                  <button 
                    onClick={handleNext} 
                    className="hover:underline cursor-pointer"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            </div>
            <div className="md:text-right mt-4 md:mt-0">
              <div className="flex items-center gap-3 mb-2">
                {listing.originalPrice && (
                  <span className="text-gray-500 text-xl line-through">
                    {listing.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Product Images and Details */}
          <div className="md:col-span-2">
            {/* Gallery */}
            <ProductGallery
              images={allImages}
              selectedIndex={selectedImageIndex}
              onSelect={setSelectedImageIndex}
              productTitle={listing.title}
              favoriteProduct={listing}
            />
            {/* Product Metadata/Features */}
            <ProductDetails
              productDetails={productDetails}
              icons={{ stoneTypeIcon, headStyleIcon, slabStyleIcon, colourIcon, customIcon }}
              getFirstValue={getFirstValue}
              getAllValues={getAllValues}
            />
            {/* Product Description and Additional Details */}
            <ProductDescription
              description={listing.description}
              additionalDetails={additionalDetails}
              getAllValues={getAllValues}
            />

            {/* Price and Notes Card (unchanged) */}
            <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
              <h3 className="text-sm text-gray-700 font-semibold mb-1">
                Price
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-600 text-2xl font-bold">
                  {formatPrice(listing.price)}
                </span>
                {listing.originalPrice && (
                  <span className="text-gray-500 text-lg line-through">
                    {listing.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-semibold">Please note:</span> The data
                displayed above may not be the exact data for the actual
                Tombstone being offered for sale. We recommend that you always
                check the details with the seller prior to purchase.
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Please be aware</span> on all
                possible costs presented and possible hidden ones. T&C's apply.
              </p>
            </div>
            {/* Send Message Card (under Price and Notes Card) */}
            <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Send Message</h2>
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-1">
                  <ProductContactForm
                    documentId={id}
                    className="space-y-4 px-4 pb-4"
                    listingTitle={listing.title}
                  />
                </div>
                {/* Right: Logo, Rating, Show Contact Number */}
                <div className="flex flex-col items-center justify-start text-center md:w-64 md:ml-4 md:mt-0 mt-8">
                  <div className="relative h-24 w-48 mb-2">
                    <Image
                      src={info.logo}
                      alt={listing.company?.name || "Manufacturer Logo"}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {listing.selectedBranch && (
                    <div className="text-sm font-semibold text-gray-800 mb-1">
                      {listing.selectedBranch.name || listing.selectedBranch.title || listing.selectedBranch.branchName || "Branch"} Branch
                    </div>
                  )}
                  <div className="text-xs text-blue-500 mb-4">
                    Current Google Rating: {info.rating} out of 5
                  </div>
                  <button
                    onClick={() => {
                      handleShowContact();
                      trackAnalyticsEvent("contact_view", listing.documentId);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded max-w-xs transition-colors"
                  >
                    {showContact
                      ? "Hide Contact Number"
                      : "Show Contact Number"}
                  </button>
                  {showContact && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border max-w-xs w-full">
                      <div className="text-center space-y-2">
                        {listing.company?.phone && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Phone:
                            </span>
                            <div className="text-lg font-bold text-blue-600">
                              <a
                                href={`tel:${listing.company.phone}`}
                                className="hover:underline"
                                onClick={() => trackAnalyticsEvent("rep_call_tracker", listing.documentId)}
                              >
                                {listing.company.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        {listing.company?.mobile && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Mobile:
                            </span>
                            <div className="text-lg font-bold text-blue-600">
                              <a
                                href={`tel:${listing.company.mobile}`}
                                className="hover:underline"
                                onClick={() => trackAnalyticsEvent("rep_call_tracker", listing.documentId)}
                              >
                                {listing.company.mobile}
                              </a>
                            </div>
                          </div>
                        )}
                        {listing.company?.email && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Email:
                            </span>
                            <div className="text-sm text-blue-600">
                              <a
                                href={`mailto:${listing.company.email}`}
                                className="hover:underline"
                              >
                                {listing.company.email}
                              </a>
                            </div>
                          </div>
                        )}
                        {!listing.company?.phone &&
                          !listing.company?.mobile &&
                          !listing.company?.email && (
                            <div className="text-sm text-gray-500">
                              Contact information not available
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Contact Form and Other Info */}
          <div className="md:col-span-1 px-4">
            {/* Main contact card container */}
            <div className="rounded mb-6 shadow-sm overflow-hidden">
              {/* Dark blue header */}
              <div className="bg-[#1F2B45] text-white pt-6 text-center px-4 rounded-t-lg rounded-b-lg overflow-hidden">
                CONTACT THE MANUFACTURER
                <button
                  onClick={() => {
                    handleShowContact();
                    trackAnalyticsEvent("contact_view", listing.documentId);
                  }}
                  className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded mx-auto block mt-6 mb-4 transition-colors"
                >
                  {showContact ? "Hide Contact Number" : "Show Contact Number"}
                </button>
                {/* WhatsApp button visible below the contact button */}
              
                {listing?.company?.enableWhatsAppButton === true && (
                  <WhatsAppContactDrawer
                    className="-mx-4 mt-3 "
                    reps={
                      (selectedBranch?.sales_reps?.length ? selectedBranch.sales_reps : listing?.company?.sales_reps) || []
                    }
                    listing_id={listing.documentId}
                  />
                )}
                {showContact && (
                  <div className="mt-4 p-4 bg-white text-gray-800 rounded-lg mx-auto max-w-sm">
                    <div className="text-center space-y-2">
                      {listing.company?.phone && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Phone:
                          </span>
                          <div className="text-lg font-bold text-blue-600">
                            <a
                              href={`tel:${listing.company.phone}`}
                              className="hover:underline"
                              onClick={() => trackAnalyticsEvent("rep_call_tracker", listing.documentId)}
                            >
                              {listing.company.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {listing.company?.mobile && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Mobile:
                          </span>
                          <div className="text-lg font-bold text-blue-600">
                            <a
                              href={`tel:${listing.company.mobile}`}
                              className="hover:underline"
                              onClick={() => trackAnalyticsEvent("rep_call_tracker", listing.documentId)}
                            >
                              {listing.company.mobile}
                            </a>
                          </div>
                        </div>
                      )}
                      {listing.company?.email && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Email:
                          </span>
                          <div className="text-sm text-blue-600">
                            <a
                              href={`mailto:${listing.company.email}`}
                              className="hover:underline"
                            >
                              {listing.company.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {!listing.company?.phone &&
                        !listing.company?.mobile &&
                        !listing.company?.email && (
                          <div className="text-sm text-gray-500">
                            Contact information not available
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
              {/* White content area */}
              <div className="bg-white rounded-b-lg">
                <div className="pt-4 px-4 mb-4">
                  <button
                    onClick={() => {
                      trackAnalyticsEvent("map_view", listing.documentId);
                      setIsMapOpen(true);
                    }}
                    className="flex items-center text-blue-500 hover:underline text-sm"
                  >
                    <Image
                      src="/new files/newIcons/GooglePin_Icon.svg"
                      alt="Location Pin Icon"
                      width={16}
                      height={16}
                      className="mr-1 object-contain"
                    />{" "}
                    View Manufacturer's Address
                  </button>
                </div>

                <ProductContactForm
                  documentId={id}
                  className="space-y-4 px-4 pb-4"
                  listingTitle={listing.title}
                />
              </div>
            </div>
            {/* Share with Friends */}
            <SocialShare product={listing} />
            {/* Combined Company Info, Business Hours, and More Tombstones */}
            <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
              {/* Company Info */}
              <div className="text-center mb-4">
                <Link 
                  href={`/manufacturers/manufacturers-Profile-Page/${listing.company?.documentId || listing.companyId}${branch ? `?branch=${branch}` : ''}`}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <div className="flex justify-center mb-2">
                    <div className="relative h-32 w-64">
                      <Image
                        src={info.logo}
                        alt={listing.company?.name || "Manufacturer Logo"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </Link>
                {selectedBranch && (
                  <div className="text-bold-500 font-bold mb-1">
                    <Link 
                      href={`/manufacturers/manufacturers-Profile-Page/${listing.company?.documentId || listing.companyId}?branch=${selectedBranch.name}`}
                      className="text-gray-600 hover:underline hover:blue"
                    >
                      {selectedBranch.name} Branch
                    </Link>
                  </div>
                )}
                <div className="text-xs text-blue-500">
                  Current Google Rating: {info.rating} out of 5
                </div>
                
              </div>
              {/* Business Hours */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="font-medium">Monday to Friday</div>
                  <div>
                    {listing.company?.operatingHours?.monToFri || "N/A"}
                  </div>
                  <div className="font-medium">Saturday</div>
                  <div>
                    {listing.company?.operatingHours?.saturday || "N/A"}
                  </div>
                  <div className="font-medium">Sunday</div>
                  <div>{listing.company?.operatingHours?.sunday || "N/A"}</div>
                  <div className="font-medium">Public Holiday</div>
                  <div>
                    {listing.company?.operatingHours?.publicHoliday || "N/A"}
                  </div>
                </div>
              </div>
              {/* More Tombstones from this Manufacturer */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  More Tombstones from this Manufacturer
                </h3>
                {listing.company?.listings &&
                listing.company.listings.length > 0 ? (
                  listing.company?.listings?.slice(0, 3).map((product) => (
                    <Link
                      key={product.documentId}
                      href={`/tombstones-for-sale/${product.documentId}`}
                      className="block"
                    >
                      <div className="flex border-b border-gray-200 py-3 hover:bg-gray-50 transition">
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={product.mainImageUrl || "/placeholder.svg"}
                            alt={product.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="text-blue-600 font-medium">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-sm">{product.title}</div>
                          <div className="text-xs text-gray-600">
                            {listing.productDetails?.stoneType?.[0]?.value ||
                              "N/A"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">
                    No similar products available.
                  </div>
                )}
               <div className="mt-2">
                  <Link 
                    href={`/manufacturers/manufacturers-Profile-Page/${listing.company?.documentId || listing.companyId}${branch ? `?branch=${branch}` : ''}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All Tombstones From This Manufacturer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
       
        <MapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          mapUrl={selectedBranch?.location?.mapUrl || listing.company?.mapUrl}
          
        />
      </div>
    </>
  );
}

// Custom Telegram icon since it's not in lucide-react
function Telegram({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 2L11 13"></path>
      <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
    </svg>
  );
}
